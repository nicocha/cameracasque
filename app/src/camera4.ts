// Cambox V4 / V4 Plus / V4 Pro WiFi protocol (CGI on 192.168.2.1, answers "key=value;…" or "NOK"),
// reverse-engineered from com.cambox.camboxapplication 1.5. Checked on a V4 Pro, firmware 1.2.7.
import type { CamFile, Driver, Option, Section } from './camera';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// EXPO_PUBLIC_CAM4_HOST overrides it for testing against a mock (e.g. "127.0.0.1:8098").
const HOST = process.env.EXPO_PUBLIC_CAM4_HOST ?? '192.168.2.1';
const BASE = `http://${HOST}`;
const DIR = '100CAMBX';
// func_mode=1 (re)starts this stream (720p30 H.264). Measured on a V4 Pro: port 8554 opens ~6.2 s after the set,
// and the camera stops any recording.
const LIVE_URL = `rtsp://${HOST.split(':')[0]}:8554/video`;
const PREVIEW_SETTLE_MS = 6500;
const RECORD_SETTLE_MS = 6000;
const PLAYER_RELEASE_MS = 1500;

/** "key=value;key=value;" → { key: value } */
export function parseKv(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of s.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const UNITS: Record<string, number> = { K: 1024, M: 1024 ** 2, G: 1024 ** 3 };
const pad = (n: number) => String(n).padStart(2, '0');

/** lighttpd directory listing of /data/100CAMBX: <a>name</a>, <td class="m">2024-Jan-01 12:00:00</td>, <td class="s">1.2M</td>. */
export function parseListing(html: string): CamFile[] {
  return [...html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/g)].flatMap(([row]) => {
    const name = row.match(/<a href="[^"]*">([^<]+)<\/a>/)?.[1] ?? '';
    if (!/\.(mov|mp4|jpg)$/i.test(name)) return []; // parent directory, subfolders
    const m = row.match(/class="m">\s*(\d{4})-(\w{3})-(\d{2}) (\d{2}:\d{2}:\d{2})/);
    const s = row.match(/class="s">\s*([\d.]+)([KMG]?)/);
    const url = `${BASE}/data/${DIR}/${name}`;
    const isVideo = !/\.jpg$/i.test(name);
    return [{
      name,
      path: `${DIR}/${name}`,
      size: s ? Math.round(Number(s[1]) * (UNITS[s[2]] ?? 1)) : 0,
      time: m ? `${m[1]}/${pad(MONTHS.indexOf(m[2]) + 1)}/${m[3]} ${m[4]}` : '',
      url,
      thumb: isVideo ? '' : url, // no thumbnail endpoint: media.ts extracts a frame
      isVideo,
    }];
  });
}

async function fetchText(path: string, timeoutMs = 5000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return (await (await fetch(BASE + path, { signal: ctl.signal })).text()).trim();
  } finally {
    clearTimeout(t);
  }
}

// Slashes stay literal: the CGI doesn't decode %2F in delete_req_cgi?path=100CAMBX/X.MOV.
const query = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%2F/g, '/')}`).join('&');

async function cgi(name: string, params?: Record<string, string>, timeoutMs?: number) {
  const text = await fetchText(`/cgi-bin/${name}${params ? `?${query(params)}` : ''}`, timeoutMs);
  if (text.startsWith('NOK')) throw new Error(`La caméra a refusé cette commande (${name.replace('_cgi', '')}).`);
  return parseKv(text);
}

// A "set" must resend the whole group: keep the last values read or sent for each.
type Group = 'video_cfg_cgi' | 'image_cfg_cgi' | 'general_cfg_cgi' | 'network_cfg_cgi';
const groups: Partial<Record<Group, Record<string, string>>> = {};
const read = async (g: Group) => (groups[g] = await cgi(g, { action: 'get' }));
async function write(g: Group, changes: Record<string, string>) {
  const next = { ...(groups[g] ?? (await read(g))), ...changes };
  await cgi(g, { action: 'set', ...next });
  groups[g] = next;
}

// model_req_cgi: "version=1.2.7;model=cbv4pro;" (or "1.21"). Firmware before 1.20 encodes stabilization "on" as 2.
// Like the original app, every dot is dropped: "1.2.7" → 127.
export const oldFirmware = (version: string) => Number(version.replaceAll('.', '')) < 120;
let version = '';

/** battery_req_cgi gives millivolts; the camera warns at 3200 and stops at 3090. */
export function batteryV4(mv: number) {
  if (!mv) return '—';
  // ponytail: linear 3.1–4.1 V estimate, replace with the camera's discharge curve once measured
  const pct = Math.round(Math.min(1, Math.max(0, (mv - 3100) / 1000)) * 100);
  return `${pct} % (${(mv / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} V)`;
}

// Settings ids: local to this driver (3003/3004/3010 match V3+ so the screen's WiFi and format handling apply).
const ID = {
  video: 1, stabilization: 2, audio: 3, flip: 4, mirror: 5, whiteBalance: 6, exposure: 7, autoRecord: 8, dayNight: 9,
  iso: 10, saturation: 11, contrast: 12, sharpness: 13, edge: 14, // Pro Mode (V4 Pro only)
  ssid: 3003, password: 3004, format: 3010, reset: 3011, powerOff: 3020,
};
const OFF_ON: Option[] = [{ value: 0, label: 'Désactivé' }, { value: 1, label: 'Activé' }];
const RES = ['4K', '1080p', '720p'];
const FPS: Record<number, string> = { 1: '120', 2: '60', 5: '30' }; // video_cfg framerate codes
// Resolution and frame rate in one picker, like the V3+: value = resolution * 10 + framerate code.
const combo = (value: number): Option => ({ value, label: `${RES[Math.floor(value / 10)] ?? '?'} ${FPS[value % 10] ?? '?'} i/s` });
// Names from the V4 manuals, in the camera's order (0–10).
const WHITE_BALANCE = ['Auto', 'Ensoleillé', 'Ombragé', 'Nuageux', 'Lumière du jour', 'Fluorescent 1', 'Fluorescent 2', 'Fluorescent 3', 'Incandescent', 'Soleil couchant', 'Couleurs chaleureuses'];
const ISO = ['Auto', '100', '200', '400', '800', '1600', '3200', '6400'];
// Numeric scale with the factory value marked, as in the manuals ("10*").
const scale = (max: number, def: number): Option[] => Array.from({ length: max + 1 }, (_, value) => ({ value, label: value === def ? `${value} (par défaut)` : String(value) }));
// Factory values, from the manuals and the original app's reset requests.
const DEFAULTS: Record<'video_cfg_cgi' | 'image_cfg_cgi', Record<string, string>> = {
  video_cfg_cgi: { resolution: '1', framerate: '5', stabilization: '1', audio: '1', flip: '0', mirror: '0' },
  image_cfg_cgi: { iso: '0', saturation: '12', contrast: '4', white_balance: '0', exposure_compensation: '10', sharpness: '12', edge_strength: '12' },
};
const LEDS_DEFAULT = { status_brightness_day: '28', battery_brightness_day: '70', wifi_brightness_day: '28', status_brightness_night: '14', battery_brightness_night: '42', wifi_brightness_night: '14' };

const toInt = (s?: string) => (s === undefined || s === '' ? undefined : Number(s));

// The camera ignores "record on" in preview mode, and for a while after leaving it (the original app waits 6 s).
// It froze (reset needed) when it left preview mode with the player still connected, or served files while streaming:
// the screens unmount the player first, then this waits for it to hang up.
const recordingNow = async () => (await cgi('record_req_cgi', { action: 'get' }).catch(() => ({} as Record<string, string>))).onoff === 'on';
// It froze when files were read or deleted during a recording, whatever the app believed.
async function notRecording() {
  if (await recordingNow()) throw new Error('La caméra enregistre : arrêtez l’enregistrement pour accéder aux fichiers.');
}

// The set can answer NOK, and the old state can be read for a moment, while the camera does switch:
// trust the state read back after a while. Returning only once it matches also keeps the poll from flipping it back.
async function setRecord(on: boolean) {
  await cgi('record_req_cgi', { action: 'set', onoff: on ? 'on' : 'off' }).catch(() => {});
  for (let i = 0; i < 10; i++) {
    if ((await recordingNow()) === on) return;
    await sleep(500);
  }
  throw new Error(on ? 'La caméra n’a pas démarré l’enregistrement.' : 'La caméra n’a pas arrêté l’enregistrement.');
}

async function leavePreview() {
  if ((await read('general_cfg_cgi')).func_mode === '0') return;
  await sleep(PLAYER_RELEASE_MS);
  await write('general_cfg_cgi', { func_mode: '0' });
  await sleep(RECORD_SETTLE_MS);
}

export const v4: Driver = {
  name: 'Cambox V4',
  heartbeat: () => fetchText('/cgi-bin/model_req_cgi', 3000).then((t) => t.includes('model='), () => false),
  connect: async () => {
    const d = new Date();
    cgi('sync_date_req_cgi', {
      year: String(d.getFullYear()).slice(2), month: pad(d.getMonth() + 1), day: pad(d.getDate()),
      hour: pad(d.getHours()), minute: pad(d.getMinutes()), second: pad(d.getSeconds()),
    }).catch(() => {});
    const info = await cgi('model_req_cgi').catch(() => ({} as Record<string, string>));
    version = info.version ?? '';
    const battery = await cgi('battery_req_cgi').then((b) => batteryV4(Number(Object.values(b)[0])), () => '—');
    return { model: [info.model ?? 'cbv4', version], battery, menu: {} };
  },
  isRecording: async () => (await cgi('record_req_cgi', { action: 'get' })).onoff === 'on', // a failed read keeps the last state
  // The camera's own RTSP server; TCP so iOS needs no multicast entitlement (see the V3+ note in camera.ts).
  live: { url: LIVE_URL, vlcOptions: ['--rtsp-tcp', '--network-caching=300'], photo: false },
  prepareLive: async (cancelled) => {
    if ((await read('general_cfg_cgi')).func_mode !== '1') {
      await write('general_cfg_cgi', { func_mode: '1' });
      await sleep(PREVIEW_SETTLE_MS);
    }
    return !cancelled();
  },
  stopLive: leavePreview,
  startRecording: async () => {
    await leavePreview();
    await setRecord(true);
  },
  stopRecording: () => setRecord(false),
  snapshot: async () => { throw new Error('La Cambox V4 ne prend pas de photos.'); },
  files: async () => {
    await notRecording();
    await leavePreview(); // the original app only shows its gallery with the preview off
    return parseListing(await fetchText(`/data/${DIR}/`, 15000));
  },
  deleteFile: async (f) => {
    await notRecording();
    return cgi('delete_req_cgi', { path: f.path });
  },
  values: async () => {
    const v = await read('video_cfg_cgi');
    const img = await read('image_cfg_cgi').catch(() => ({} as Record<string, string>));
    const gen = await read('general_cfg_cgi');
    const res = toInt(v.resolution), fps = toInt(v.framerate);
    const vals: Record<number, number | undefined> = {
      [ID.video]: res !== undefined && fps !== undefined ? res * 10 + fps : undefined,
      [ID.stabilization]: toInt(v.stabilization) && 1,
      [ID.audio]: toInt(v.audio),
      [ID.flip]: toInt(v.flip),
      [ID.mirror]: toInt(v.mirror),
      [ID.whiteBalance]: toInt(img.white_balance),
      [ID.exposure]: toInt(img.exposure_compensation),
      [ID.autoRecord]: toInt(gen.auto_record),
      [ID.dayNight]: toInt(gen.day_night),
      [ID.iso]: toInt(img.iso),
      [ID.saturation]: toInt(img.saturation),
      [ID.contrast]: toInt(img.contrast),
      [ID.sharpness]: toInt(img.sharpness),
      [ID.edge]: toInt(img.edge_strength),
    };
    return Object.fromEntries(Object.entries(vals).filter(([, x]) => x !== undefined)) as Record<string, number>;
  },
  apply: async (id, { par = 0, str = '' }) => {
    const s = String(par);
    switch (id) {
      case ID.video: return write('video_cfg_cgi', { resolution: String(Math.floor(par / 10)), framerate: String(par % 10) });
      case ID.stabilization: return write('video_cfg_cgi', { stabilization: par ? (oldFirmware(version) ? '2' : '1') : '0' });
      case ID.audio: return write('video_cfg_cgi', { audio: s });
      case ID.flip: return write('video_cfg_cgi', { flip: s });
      case ID.mirror: return write('video_cfg_cgi', { mirror: s });
      case ID.whiteBalance: return write('image_cfg_cgi', { white_balance: s });
      case ID.exposure: return write('image_cfg_cgi', { exposure_compensation: s });
      case ID.autoRecord: return write('general_cfg_cgi', { auto_record: s });
      case ID.dayNight: return write('general_cfg_cgi', { day_night: s });
      case ID.iso: return write('image_cfg_cgi', { iso: s });
      case ID.saturation: return write('image_cfg_cgi', { saturation: s });
      case ID.contrast: return write('image_cfg_cgi', { contrast: s });
      case ID.sharpness: return write('image_cfg_cgi', { sharpness: s });
      case ID.edge: return write('image_cfg_cgi', { edge_strength: s });
      case ID.reset:
        // Not the WiFi name and password: the phone would lose the camera.
        await write('video_cfg_cgi', DEFAULTS.video_cfg_cgi);
        await write('image_cfg_cgi', DEFAULTS.image_cfg_cgi);
        await write('general_cfg_cgi', { file_duration: '5', auto_record: '1', memory_threshold: '95', day_night: '0' });
        return cgi('leds_cfg_cgi', { action: 'set', ...LEDS_DEFAULT });
      case ID.powerOff:
        // Sent from preview mode, the camera stayed half off (red LED lit, no answer): leave it first, as for recording.
        await leavePreview().catch(() => {});
        return cgi('poweroff_req_cgi').catch(() => {}); // the camera may drop the connection before answering
      case ID.ssid: return write('network_cfg_cgi', { ssid: str });
      case ID.password: return write('network_cfg_cgi', { password: str });
      case ID.format: return cgi('format_req_cgi', undefined, 300_000); // measured: over 2 min on a 64 GB card
    }
  },
  wifi: async () => {
    const n = await read('network_cfg_cgi');
    // The camera stores only the start of the name and appends "-<model>-<id>" (e.g. CAMBOX-V4Pro-853c5d).
    return { ssid: n.ssid && `${n.ssid}-…`, password: n.password };
  },
  sections: ([model]) => sectionsV4(model ?? '', groups.video_cfg_cgi),
  firmware: ([, v]) => v || '—',
};

export function sectionsV4(model: string, video?: Record<string, string>): Section[] {
  // The plain V4 has no 4K (the original app greys it out).
  const combos = [...(model === 'cbv4' ? [] : [5]), 12, 15, 22, 25];
  const current = video && Number(video.resolution) * 10 + Number(video.framerate);
  if (current !== undefined && !Number.isNaN(current) && !combos.includes(current)) combos.push(current);
  return [
    {
      title: 'Vidéo',
      items: [
        { cmd: ID.video, label: 'Résolution vidéo', options: combos.map(combo) },
        { cmd: ID.stabilization, label: 'Stabilisation', options: OFF_ON },
        { cmd: ID.audio, label: 'Son', options: OFF_ON },
        { cmd: ID.flip, label: 'Image retournée', options: OFF_ON },
        { cmd: ID.mirror, label: 'Effet miroir', options: OFF_ON },
      ],
    },
    {
      title: 'Image',
      items: [
        { cmd: ID.whiteBalance, label: 'Balance des blancs', options: WHITE_BALANCE.map((label, value) => ({ value, label })) },
        { cmd: ID.exposure, label: 'Exposition', options: scale(18, 10) },
      ],
    },
    // "Pro Mode": the manuals reserve it for the V4 Pro.
    ...(model === 'cbv4pro'
      ? [{
          title: 'Mode Pro',
          items: [
            { cmd: ID.iso, label: 'ISO', options: ISO.map((label, value) => ({ value, label: value ? `ISO ${label}` : label })) },
            { cmd: ID.saturation, label: 'Saturation', options: scale(18, 12) },
            { cmd: ID.contrast, label: 'Contraste', options: scale(10, 4) },
            { cmd: ID.sharpness, label: 'Netteté', options: scale(14, 12) },
            { cmd: ID.edge, label: 'Grain', options: scale(14, 12) },
          ],
        }]
      : []),
    {
      title: 'Ergonomie',
      items: [
        { cmd: ID.autoRecord, label: 'Enregistrement automatique', options: OFF_ON },
        { cmd: ID.dayNight, label: 'Voyants', options: [{ value: 0, label: 'Jour' }, { value: 1, label: 'Nuit (atténués)' }] },
      ],
    },
    {
      title: 'WiFi',
      footer: 'La caméra complète ce nom avec son modèle et un identifiant, par exemple CAMBOX-V4Pro-853c5d. Après modification, redémarrez la caméra puis rejoignez le nouveau réseau.',
      items: [
        { cmd: ID.ssid, label: 'Nom du WiFi', action: 'ssid' },
        { cmd: ID.password, label: 'Mot de passe WiFi', action: 'password', max: 12 },
      ],
    },
    {
      title: 'Maintenance',
      items: [
        { cmd: ID.format, label: 'Formater la carte SD', action: 'confirm' },
        { cmd: ID.reset, label: 'Restaurer les réglages d’usine', action: 'confirm' },
        { cmd: ID.powerOff, label: 'Éteindre la caméra', action: 'confirm' },
      ],
    },
  ];
}
