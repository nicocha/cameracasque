// Demo camera for website screenshots: HTTP API on 8099, MJPEG live view on 8192, notifications on 3333.
// Every file gets a scene by index; sizes and times look like a real SD card.
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
const S = ['horse-meadow', 'kart-track', 'moto-mountain', 'bike-forest', 'ski-piste', 'car-night', 'moto-coast', 'horse-beach', 'bike-sunset', 'car-country'];
const st = { 3016: 1, 2002: 0, 2003: 0, 2004: 1, 2019: 0, 1002: 2, 2007: 0, 2008: 1, 1007: 0, 9001: 0, 2005: 6, 3025: 0, 3007: 2 };
const days = [3, 5, 6, 9, 11, 12, 14, 16];
const files = [];
days.forEach((day, d) => {
  for (let k = 0; k < 4 + (d % 3); k++) {
    const i = files.length, photo = i % 4 === 3, h = 8 + ((i * 5) % 11), m = (i * 17) % 60;
    const n = `2026_10${String(day).padStart(2, '0')}_${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00${photo ? 'A.JPG' : '.MOV'}`;
    files.push({ n, d: photo ? 'PHOTO' : 'MOVIE', scene: S[(i * 3 + d) % S.length], size: photo ? 3.1e6 + (i % 5) * 4e5 : 40e6 + ((i * 37) % 160) * 1e6, time: `2026/10/${String(day).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00` });
  }
});
// In date order so every activity shows in the visible part of the Gallerie.
const ORDER = ['ski-piste', 'horse-meadow', 'kart-track', 'moto-mountain', 'bike-forest', 'car-country', 'horse-beach', 'ski-piste', 'moto-coast', 'kart-track', 'bike-sunset', 'car-night'];
[...files].sort((a, b) => a.time.localeCompare(b.time)).forEach((f, i) => { f.scene = ORDER[i % ORDER.length]; });
[...files].sort((a, b) => a.time.localeCompare(b.time))[files.length - 6].scene = 'bike-forest'; // the file the viewer screenshot opens
const byName = (p) => files.find((f) => p.endsWith(f.n));
const send = (req, res, file, type) => {
  const v = fs.readFileSync(file); const r = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  res.setHeader('content-type', type); res.setHeader('accept-ranges', 'bytes');
  if (!r) { res.setHeader('content-length', v.length); return res.end(v); }
  const a = +r[1], b = r[2] ? +r[2] : v.length - 1;
  res.writeHead(206, { 'content-range': `bytes ${a}-${b}/${v.length}`, 'content-length': b - a + 1 }); res.end(v.subarray(a, b + 1));
};
const MENU = fs.readFileSync(new URL('./menu.xml', import.meta.url), 'utf8');
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); const c = u.searchParams.get('cmd');
  if (u.pathname.startsWith('/DCIM')) {
    const f = byName(u.pathname); if (!f) { res.statusCode = 404; return res.end(); }
    if (c === '4001') return send(req, res, `thumbs/${f.scene}.jpg`, 'image/jpeg');
    return f.d === 'MOVIE' ? send(req, res, `${f.scene}.mp4`, 'video/mp4') : send(req, res, `${f.scene}.jpg`, 'image/jpeg');
  }
  const x = (b) => { res.setHeader('content-type', 'text/xml'); res.end(`<?xml version="1.0" encoding="UTF-8" ?>\n${b}`); };
  if (c === '3014') return x(`<LIST>${Object.entries(st).map(([k, v]) => `<Cmd>${k}</Cmd><Status>${v}</Status>`).join('')}</LIST>`);
  if (c === '3016') return x(`<Function><Cmd>3016</Cmd><Status>${st[3016]}</Status></Function>`);
  if (c === '3031') return x(MENU);
  if (c === '3029') return x(`<LIST><SSID>CAMBOXV3PLUS</SSID><PASSPHRASE>12345678</PASSPHRASE></LIST>`);
  if (c === '3019') return x(`<Function><Cmd>3019</Cmd><Status>0</Status><Value>1</Value></Function>`);
  if (c === '3012') return x(`<Function><Cmd>3012</Cmd><Status>0</Status><String>675</String><String>CamboxV3+</String><String>V1.26A</String></Function>`);
  if (c === '3015') return x(`<LIST>${files.map((f) => `<ALLFile><File><NAME>${f.n}</NAME><FPATH>A:\\DCIM\\${f.d}\\${f.n}</FPATH><SIZE>${f.size}</SIZE><TIMECODE>1</TIMECODE><TIME>${f.time}</TIME><ATTR>32</ATTR></File></ALLFile>`).join('')}</LIST>`);
  if (c === '3001') st[3016] = Number(u.searchParams.get('par'));
  else if (c && u.searchParams.has('par')) st[c] = Number(u.searchParams.get('par'));
  x(`<Function><Cmd>${c}</Cmd><Status>0</Status></Function>`);
}).listen(8099, '127.0.0.1', () => console.log(`demo camera on 8099, ${files.length} files`));
const frames = fs.readdirSync('live').sort().map((f) => fs.readFileSync(`live/${f}`));
http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'multipart/x-mixed-replace; boundary=frame' });
  let i = 0;
  const t = setInterval(() => { const f = frames[i++ % frames.length]; res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${f.length}\r\n\r\n`); res.write(f); res.write('\r\n'); }, 83);
  req.on('close', () => clearInterval(t));
}).listen(8192, '127.0.0.1');
net.createServer((s) => { s.on('error', () => {}); }).listen(3333, '127.0.0.1');
