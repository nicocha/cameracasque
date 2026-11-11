// Cambox V4 mock: CGI (key=value;), lighttpd-style listing of /data/100CAMBX with Range. Usage: node mock4.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const port = Number(process.argv[2] ?? 8098);
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), '100CAMBX');
const state = {
  video_cfg_cgi: { resolution: '1', framerate: '5', stabilization: '1', audio: '1', flip: '0', mirror: '0' },
  image_cfg_cgi: { iso: '0', saturation: '9', contrast: '4', white_balance: '0', exposure_compensation: '10', sharpness: '12', edge_strength: '7' },
  general_cfg_cgi: { file_duration: '5', auto_record: '1', memory_threshold: '95', day_night: '0', func_mode: '0', bat_warn_threshold: '3200', bat_alarm_threshold: '3090' },
  network_cfg_cgi: { ssid: 'CAMBOX', password: '12345678' },
};
let recording = false;
const kv = (o) => Object.entries(o).map(([k, v]) => `${k}=${v};`).join('');
const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const p2 = (n) => String(n).padStart(2, '0');
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  console.log(req.method, req.url, req.headers.range ?? '');
  const send = (s, code = 200, type = 'text/plain') => { res.writeHead(code, { 'Content-Type': type }); res.end(s); };
  const cgi = u.pathname.match(/^\/cgi-bin\/(\w+)$/)?.[1];
  if (cgi) {
    const q = Object.fromEntries(u.searchParams);
    if (cgi === 'model_req_cgi') return send('version=1.21;model=cbv4plus;');
    if (cgi === 'battery_req_cgi') return send('battery=3850;');
    if (cgi === 'record_req_cgi') { if (q.action === 'set') { recording = q.onoff === 'on'; return send('OK'); } return send(`onoff=${recording ? 'on' : 'off'};`); }
    if (cgi === 'delete_req_cgi') { try { fs.unlinkSync(path.join(dir, path.basename(q.path))); return send('OK'); } catch { return send('NOK'); } }
    if (cgi === 'sync_date_req_cgi' || cgi === 'format_req_cgi') return send('OK');
    if (state[cgi]) {
      if (q.action === 'get') return send(kv(state[cgi]));
      delete q.action;
      const missing = Object.keys(state[cgi]).filter((k) => !(k in q));
      if (missing.length) { console.log('  NOK, missing', missing); return send('NOK'); }
      Object.assign(state[cgi], q); return send('OK');
    }
    return send('NOK');
  }
  if (/^\/data\/100CAMBX\/?$/.test(u.pathname)) {
    const rows = fs.readdirSync(dir).sort().map((n) => {
      const st = fs.statSync(path.join(dir, n)); const d = st.mtime;
      return `<tr><td class="n"><a href="${n}">${n}</a></td><td class="m">${d.getFullYear()}-${M[d.getMonth()]}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}</td><td class="s">${(st.size / 1024 / 1024).toFixed(1)}M</td><td class="t">video/quicktime</td></tr>`;
    });
    return send(`<html><body><table><tr class="d"><td class="n"><a href="../">..</a>/</td><td class="m">&nbsp;</td><td class="s">- &nbsp;</td><td class="t">Directory</td></tr>\n${rows.join('\n')}</table></body></html>`, 200, 'text/html');
  }
  const f = u.pathname.match(/^\/data\/100CAMBX\/(.+)$/)?.[1];
  if (f && fs.existsSync(path.join(dir, f))) {
    const file = path.join(dir, f); const size = fs.statSync(file).size;
    const r = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
    if (r) {
      const start = r[1] ? Number(r[1]) : size - Number(r[2]); const end = r[1] && r[2] ? Number(r[2]) : size - 1;
      res.writeHead(206, { 'Content-Type': process.env.MIME ?? 'video/quicktime', 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
      { const t0 = Date.now(); let n = 0; const st = fs.createReadStream(file, { start, end }); st.on('data', (c) => n += c.length); res.on('close', () => console.log('sent', n, 'in', Date.now() - t0, 'ms')); return st.pipe(res); }
    }
    res.writeHead(200, { 'Content-Type': process.env.MIME ?? 'video/quicktime', 'Accept-Ranges': 'bytes', 'Content-Length': size });
    return fs.createReadStream(file).pipe(res);
  }
  send('Not found', 404);
}).listen(port, () => console.log('V4 mock on', port));
