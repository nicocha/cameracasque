// Cambox V3+ WiFi protocol (Novatek "custom=1&cmd=" HTTP API), reverse-engineered
// from com.ajn.camboxv3plus 1.0.1 (com.jght.network.CameraRequest).

// EXPO_PUBLIC_CAM_HOST overrides it for testing against a mock (e.g. "127.0.0.1:8099").
export const HOST = process.env.EXPO_PUBLIC_CAM_HOST ?? '192.168.1.254';
export const BASE = `http://${HOST}`;
export const LIVE_PHOTO_URL = `http://${HOST.split(':')[0]}:8192`; // photo mode (MJPEG)
// The camera pushes <Cmd>/<Status> notifications here; the original app keeps it open while connected.
export const NOTIFY = { host: HOST.split(':')[0], port: 3333 };
// Notification codes on that socket (PreviewActivity.readSocketData)
export const EVENT = { status: '3020', recTime: '2020', battery: '9019' } as const;
export const STATUS = { recStarted: 8, recStopped: 9, batteryLow: -10 } as const;

export const MODE = { photo: 0, video: 1, playback: 2 } as const;

// Status codes returned by the camera (StateTag.WIFIAPP_RET_*)
const ERRORS: Record<number, string> = {
  [-10]: 'Batterie faible',
  [-11]: 'Carte SD pleine',
  [-23]: 'Pas de carte SD',
  [-24]: 'Erreur carte SD',
};

export class CamError extends Error {
  status: number;
  constructor(cmd: number, status: number) {
    super(ERRORS[status] ?? `La caméra a refusé cette commande (n° ${cmd}, code ${status}).`);
    this.status = status;
  }
}

const tags = (xml: string, tag: string) =>
  [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1].trim());

/** <Cmd>/<Status> pairs → { cmd: status } (cmd 3014 returns every setting this way). */
export function parseStatus(xml: string): Record<string, number> {
  const cmds = tags(xml, 'Cmd');
  const sts = tags(xml, 'Status');
  return Object.fromEntries(cmds.map((c, i) => [c, Number(sts[i])]));
}

export type CamFile = { name: string; path: string; size: number; time: string; url: string; thumb: string; isVideo: boolean };

/** cmd 3015 file list. FPATH looks like A:\DCIM\MOVIE\2024_0101_120000.MOV */
export function parseFiles(xml: string): CamFile[] {
  return tags(xml, 'File').map((f) => {
    const name = tags(f, 'NAME')[0] ?? '';
    const path = tags(f, 'FPATH')[0] ?? '';
    const url = BASE + path.replace(/^[A-Z]:/i, '').replace(/\\/g, '/');
    return {
      name,
      path,
      size: Number(tags(f, 'SIZE')[0] ?? 0),
      time: tags(f, 'TIME')[0] ?? '',
      url,
      thumb: /A\.JPG$/i.test(name) ? url : `${url}?custom=1&cmd=4001`,
      isVideo: /\.(mov|mp4)$/i.test(name),
    };
  });
}

async function get(query: string, timeoutMs = 5000): Promise<string> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/?custom=1&${query}`, { signal: ctl.signal });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/** Send a command; `par` = numeric parameter, `str` = string parameter. Throws on non-zero status. */
export async function cmd(c: number, opts: { par?: number; str?: string } = {}): Promise<string> {
  let q = `cmd=${c}`;
  if (opts.par !== undefined) q += `&par=${opts.par}`;
  if (opts.str !== undefined) q += `&str=${opts.str}`;
  const xml = await get(q);
  const status = parseStatus(xml)[String(c)];
  if (status !== undefined && status !== 0) throw new CamError(c, status);
  return xml;
}

const pad = (n: number) => String(n).padStart(2, '0');

// Original app: 0 → 4 bars … 4 → 0 bar, anything else → charging icon.
export const batteryLabel = (n: number | null) =>
  n === null || Number.isNaN(n) ? '—' : (['Pleine', 'Bonne', 'Moyenne', 'Faible', 'Vide'][n] ?? 'En charge');

export const cam = {
  heartbeat: () => get('cmd=3016', 3000).then(() => true, () => false),
  getMode: async () => parseStatus(await get('cmd=3016'))['3016'],
  setMode: (m: number) => cmd(3001, { par: m }),
  record: (on: boolean) => cmd(2001, { par: on ? 1 : 0 }),
  snapshot: () => cmd(1001),
  settings: async () => parseStatus(await get('cmd=3014')),
  files: async () => parseFiles(await get('cmd=3015', 15000)),
  deleteFile: (path: string) => cmd(4003, { str: path }),
  /** cmd 3019: battery level, 0 (full) … 4 (empty), 5 = charging; same scale as socket event 9019 */
  battery: async () => Number(tags(await get('cmd=3019'), 'Value')[0]),
  menu: async () => parseMenu(await get('cmd=3031&str=')),
  /** cmd 3029 (standard Novatek, not used by the original app, which read the SSID from Android's WiFi API) */
  wifi: async () => {
    const xml = await get('cmd=3029');
    return { ssid: tags(xml, 'SSID')[0] as string | undefined, password: tags(xml, 'PASSPHRASE')[0] as string | undefined };
  },
  /** cmd 3012: String0 = model ("675", "BP…"), String3 = firmware version */
  model: async () => tags(await get('cmd=3012'), 'String'),
  syncClock: async (d = new Date()) => {
    await cmd(3005, { str: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` });
    await cmd(3006, { str: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` });
  },
};

/** What the screens need from a camera model. V3+ is below, V4 in camera4.ts. */
export type Driver = {
  name: string; // "Cambox V3+", "Cambox V4"
  heartbeat: () => Promise<boolean>;
  /** On each (re)connection: model strings, battery label, firmware menu; also sets the clock. */
  connect: () => Promise<{ model: string[]; battery: string; menu: Record<string, Option[]> }>;
  /** Polled with the heartbeat when the camera has no notification socket. */
  isRecording?: () => Promise<boolean>;
  live: { url: string; vlcOptions: string[]; photo: boolean };
  /** Puts the camera in preview mode; returns false if `cancelled()` turned true meanwhile. */
  prepareLive: (cancelled: () => boolean) => Promise<boolean>;
  /** Preview switched off: lets the camera stop its stream (V4). */
  stopLive?: () => Promise<unknown>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<unknown>;
  snapshot: () => Promise<unknown>;
  files: () => Promise<CamFile[]>;
  deleteFile: (f: CamFile) => Promise<unknown>;
  values: () => Promise<Record<string, number>>;
  apply: (cmd: number, opts: { par?: number; str?: string }) => Promise<unknown>;
  wifi: () => Promise<{ ssid?: string; password?: string }>;
  sections: (model: string[], menu: Record<string, Option[]>) => Section[];
  firmware: (model: string[]) => string;
};

// The camera needs a moment after a mode change before its stream server answers (the original app waits 1 s).
const MODE_SETTLE_MS = 1200;
const RECORDING_GRACE_MS = 3000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const v3: Driver = {
  name: 'Cambox V3+',
  heartbeat: cam.heartbeat,
  connect: async () => {
    cam.syncClock().catch(() => {});
    const [model, battery, menu] = await Promise.all([
      cam.model().catch(() => []),
      cam.battery().then(batteryLabel, () => batteryLabel(null)),
      cam.menu().catch(() => ({})),
    ]);
    return { model, battery, menu };
  },
  // The preview is always the photo-mode MJPEG stream (HTTP), in VIDÉO too. The video-mode RTSP stream
  // sends its frames over UDP, which iOS doesn't deliver without Apple's multicast entitlement, and port
  // 8192 refuses connections in video mode. So the camera stays in photo mode while idle and only
  // switches to video mode to record: no preview while recording.
  live: { url: LIVE_PHOTO_URL, vlcOptions: [], photo: true },
  prepareLive: async (cancelled) => {
    if ((await cam.getMode()) === MODE.video) {
      // Maybe recording, started from the camera's button: give the notification socket time to say so
      // (the caller then cancels) instead of switching mode under a running recording.
      await sleep(RECORDING_GRACE_MS);
      if (cancelled()) return false;
    }
    if ((await cam.getMode()) !== MODE.photo) {
      await cam.setMode(MODE.photo);
      await sleep(MODE_SETTLE_MS);
    }
    return !cancelled();
  },
  startRecording: async () => {
    await cam.setMode(MODE.video);
    await sleep(MODE_SETTLE_MS);
    await cam.record(true);
  },
  stopRecording: () => cam.record(false),
  snapshot: cam.snapshot,
  files: async () => {
    await cam.setMode(MODE.playback);
    return cam.files();
  },
  deleteFile: (f) => cam.deleteFile(f.path),
  values: cam.settings,
  apply: (c, opts) => cmd(c, opts),
  wifi: cam.wifi,
  sections: (model, menu) => settingsFor(model[0]?.includes('675') ?? false, menu),
  firmware: (model) => model[3] ?? model[0] ?? '—',
};

// Settings screen, same order/values as SettingsActivity. The "675" firmware exposes more options.
export type Option = { value: number; label: string };
export type Setting =
  | { cmd: number; label: string; options: Option[] }
  | { cmd: number; label: string; action: 'confirm' | 'ssid' | 'password'; max?: number }; // max: password length (V3+: 8)
export type Section = { title: string; items: Setting[]; footer?: string };

const list = (labels: string[]): Option[] => labels.map((label, value) => ({ value, label }));
const OFF_ON = ['Désactivé', 'Activé'];

const MENU_LABELS: Record<string, string> = { OFF: 'Désactivé', ON: 'Activé', HIGH: 'Max', MED: 'Moyen', LOW: 'Min', '0.0': '0', '2MHD': '2 Mpx (16:9)' };
function menuLabel(cmd: string, id: string) {
  if (cmd === '3007' && id === 'ON') return 'Désactivé'; // "auto power off: ON" = never turn off (original app: "Off")
  return MENU_LABELS[id] ?? id.replace(/^(\d+)MIN$/, '$1 min').replace(/^(\d+)SEC$/, '$1 s').replace(/^(\d+)M$/, '$1 Mpx');
}

/** cmd 3031: the firmware's own option list per setting. Index = value to send. Kept whole: see dedupe(). */
export function parseMenu(xml: string): Record<string, Option[]> {
  const menu: Record<string, Option[]> = {};
  for (const item of xml.match(/<Item>[\s\S]*?<\/Item>/g) ?? []) {
    const cmd = tags(item, 'Cmd')[0];
    const ids = tags(item, 'Id');
    menu[cmd] = tags(item, 'Index').map((index, i) => ({ value: Number(index), label: menuLabel(cmd, ids[i]) }));
  }
  return menu;
}

/** The firmware lists placeholders (file length: 3, 4 and 5 all "10MIN"); show each label once,
 *  keeping the entry that matches the camera's current value so the picker still shows it. */
export const dedupe = (options: Option[], current?: number) =>
  options.filter((o) => {
    const same = options.filter((x) => x.label === o.label);
    return same.some((x) => x.value === current) ? o.value === current : o === same[0];
  });

/** Static lists from the original app, overridden by the camera's own menu (cmd 3031) where it has one. */
export function settingsFor(is675: boolean, menu: Record<string, Option[]> = {}): Section[] {
  return staticSettings(is675).map((sec) => ({
    ...sec,
    items: sec.items.map((it) => ('options' in it && menu[it.cmd]?.length ? { ...it, options: menu[it.cmd] } : it)),
  }));
}

function staticSettings(is675: boolean): Section[] {
  const movie: Setting[] = [
    { cmd: 2002, label: 'Résolution vidéo', options: is675 ? list(['2K 30 i/s', '1080p 30 i/s', '720p 60 i/s']) : list(['1080p 30 i/s', '720p 60 i/s']) },
    { cmd: 2003, label: 'Durée des fichiers vidéo', options: is675 ? list(['Désactivé', '3 min', '5 min', '10 min', '15 min', '30 min']) : list(['5 min', '15 min', '30 min']) },
    ...(is675 ? [{ cmd: 2004, label: 'WDR', options: list(OFF_ON) }] : []),
    { cmd: 2007, label: 'Volume audio', options: list(['Max', 'Moyen', 'Min', 'Désactivé']) },
    { cmd: 2008, label: 'Incrustation de la date', options: list(OFF_ON) },
    ...(is675 ? [{ cmd: 2019, label: 'Intervalle vidéo (timelapse)', options: list(['Désactivé', '1 s', '2 s', '5 s', '10 s', '30 s', '60 s']) }] : []),
  ];
  return [
    { title: 'Vidéo', items: movie },
    {
      title: 'Photo',
      items: [
        { cmd: 1002, label: 'Résolution photo', options: is675 ? list(['20M', '16M', '12M', '10M', '8M', '5M', '3M', 'VGA']) : list(['12 Mpx', '8 Mpx']) },
        { cmd: 1007, label: 'Balance des blancs', options: list(['Auto', 'Jour', 'Nuageux', 'Tungstène', 'Fluorescent']) },
        { cmd: 9001, label: 'Rafale', options: list(['1 photo', '3 photos', '5 photos']) },
        { cmd: 2005, label: 'Exposition', options: list(['+2.0', '+5/3', '+4/3', '+1.0', '+2/3', '+1/3', '0', '-1/3', '-2/3', '-1.0', '-4/3', '-5/3', '-2.0']) },
      ],
    },
    {
      title: 'Système',
      items: [
        { cmd: 3025, label: 'Fréquence lumineuse', options: list(['50Hz', '60Hz']) },
        { cmd: 3007, label: 'Extinction automatique', options: list(['Désactivé', '3 min', '5 min', '10 min']) },
        { cmd: 3010, label: 'Formater la carte SD', action: 'confirm' },
        { cmd: 3011, label: 'Réinitialiser les paramètres', action: 'confirm' },
      ],
    },
    {
      title: 'WiFi',
      items: [
        { cmd: 3003, label: 'Nom du WiFi', action: 'ssid' },
        { cmd: 3004, label: 'Mot de passe WiFi', action: 'password' },
      ],
    },
  ];
}

// Same validation as the original app (checkInput01 / checkInput02).
export const validSsid = (s: string) => /^[A-Za-z0-9_-]{1,25}$/.test(s);
export const validPassword = (s: string, max = 8) => new RegExp(`^[A-Za-z0-9]{8,${max}}$`).test(s);

/** Camera TIME looks like "2024/01/01 12:00:00" (local time). */
export const parseCamTime = (t: string) => new Date(t.replace(/\//g, '-').replace(' ', 'T'));

export const formatCamTime = (t: string) => {
  const d = parseCamTime(t);
  return isNaN(+d) ? t : d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
};

const DAY: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
/** Photos-style period: "17 oct. 2026", "12 – 17 oct. 2026", "28 sept. – 3 oct. 2026", "30 déc. 2025 – 2 janv. 2026". */
export function dateRange(a: Date, b: Date) {
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('fr-FR', o);
  if (a > b) [a, b] = [b, a];
  if (a.toDateString() === b.toDateString()) return fmt(a, DAY);
  const sameYear = a.getFullYear() === b.getFullYear();
  if (sameYear && a.getMonth() === b.getMonth()) return `${a.getDate()} – ${fmt(b, DAY)}`;
  return `${fmt(a, sameYear ? { day: 'numeric', month: 'short' } : DAY)} – ${fmt(b, DAY)}`;
}
