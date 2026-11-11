import http from 'node:http';
import fs from 'node:fs';
const img = fs.readFileSync(process.argv[2]);
const st = { 3016: 1, 2002: 0, 2003: 0, 2004: 1, 2019: 0, 1002: 2, 3007: 1, 2007: 0, 2008: 1, 1007: 0, 9001: 0, 2005: 6, 3025: 0, 3007: 2 };
const files = Array.from({ length: 40 }, (_, i) => ({ n: `2026_10${String(5 + Math.floor(i / 4)).padStart(2, '0')}_1${i % 10}0000${i % 3 ? '' : 'A'}.${i % 3 ? 'MOV' : 'JPG'}`, d: i % 3 ? 'MOVIE' : 'PHOTO', day: 5 + Math.floor(i / 4), i }));
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); const c = u.searchParams.get('cmd');
  console.log(req.url);
  if (u.pathname.startsWith('/DCIM/MOVIE') && !c) {
    const v = fs.readFileSync('test.mp4'); const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    res.setHeader('content-type', 'video/mp4'); res.setHeader('accept-ranges', 'bytes');
    if (!m) { res.setHeader('content-length', v.length); return res.end(v); }
    const a = +m[1], b = m[2] ? +m[2] : v.length - 1;
    res.writeHead(206, { 'content-range': `bytes ${a}-${b}/${v.length}`, 'content-length': b - a + 1 }); return res.end(v.subarray(a, b + 1));
  }
  if (u.pathname.startsWith('/DCIM')) { res.setHeader('content-type', 'image/png'); return res.end(img); }
  const x = (b) => { res.setHeader('content-type', 'text/xml'); res.end(`<?xml version="1.0" encoding="UTF-8" ?>\n${b}`); };
  if (c === '3014') return x(`<LIST>${Object.entries(st).map(([k, v]) => `<Cmd>${k}</Cmd>\n<Status>${v}</Status>`).join('\n')}</LIST>`);
  if (c === '3016') return x(`<Function><Cmd>3016</Cmd><Status>${st[3016]}</Status></Function>`);
  if (c === '3031') return setTimeout(() => x(`<LIST><Item><Cmd>2003</Cmd><MenuList><Option><Index>0</Index><Id>OFF</Id></Option><Option><Index>1</Index><Id>3MIN</Id></Option><Option><Index>2</Index><Id>5MIN</Id></Option><Option><Index>3</Index><Id>10MIN</Id></Option><Option><Index>4</Index><Id>10MIN</Id></Option><Option><Index>5</Index><Id>10MIN</Id></Option></MenuList></Item><Item><Cmd>2007</Cmd><MenuList><Option><Index>0</Index><Id>HIGH</Id></Option><Option><Index>1</Index><Id>MED</Id></Option><Option><Index>2</Index><Id>LOW</Id></Option><Option><Index>3</Index><Id>OFF</Id></Option></MenuList></Item><Item><Cmd>2008</Cmd><MenuList><Option><Index>0</Index><Id>OFF</Id></Option><Option><Index>1</Index><Id>ON</Id></Option></MenuList></Item><Item><Cmd>1002</Cmd><MenuList><Option><Index>2</Index><Id>12M</Id></Option><Option><Index>3</Index><Id>10M</Id></Option><Option><Index>4</Index><Id>8M</Id></Option><Option><Index>5</Index><Id>5M</Id></Option><Option><Index>6</Index><Id>3M</Id></Option><Option><Index>16</Index><Id>2MHD</Id></Option><Option><Index>7</Index><Id>VGA</Id></Option></MenuList></Item><Item><Cmd>2005</Cmd><MenuList><Option><Index>0</Index><Id>+2.0</Id></Option><Option><Index>1</Index><Id>+1.6</Id></Option><Option><Index>2</Index><Id>+1.3</Id></Option><Option><Index>3</Index><Id>+1.0</Id></Option><Option><Index>4</Index><Id>+0.6</Id></Option><Option><Index>5</Index><Id>+0.3</Id></Option><Option><Index>6</Index><Id>0.0</Id></Option><Option><Index>7</Index><Id>-0.3</Id></Option><Option><Index>8</Index><Id>-0.6</Id></Option><Option><Index>9</Index><Id>-1.0</Id></Option><Option><Index>10</Index><Id>-1.3</Id></Option><Option><Index>11</Index><Id>-1.6</Id></Option><Option><Index>12</Index><Id>-2.0</Id></Option></MenuList></Item><Item><Cmd>3007</Cmd><MenuList><Option><Index>0</Index><Id>ON</Id></Option><Option><Index>1</Index><Id>3MIN</Id></Option><Option><Index>2</Index><Id>5MIN</Id></Option><Option><Index>3</Index><Id>10MIN</Id></Option></MenuList></Item><CHK>527F</CHK></LIST>`), 1500);
  if (c === '3029') return x(`<LIST><SSID>CAMBOXV3PLUS</SSID><PASSPHRASE>12345678</PASSPHRASE></LIST>`);
  if (c === '4003') { const i = files.findIndex((f) => u.searchParams.get('str').endsWith(f.n)); if (i >= 0) files.splice(i, 1); }
  if (c === '3019') return x(`<Function><Cmd>3019</Cmd><Status>0</Status><Value>1</Value></Function>`);
  if (c === '3012') return x(`<Function><Cmd>3012</Cmd><Status>0</Status><String>675</String><String>CamboxV3+</String><String>V1.26A</String></Function>`);
  if (c === '3015') return x(`<LIST>${files.map(f => `<ALLFile><File><NAME>${f.n}</NAME><FPATH>A:\\DCIM\\${f.d}\\${f.n}</FPATH><SIZE>48000000</SIZE><TIMECODE>1</TIMECODE><TIME>2026/10/${String(f.day).padStart(2, '0')} 1${f.i % 10}:00:00</TIME><ATTR>32</ATTR></File></ALLFile>`).join('')}</LIST>`);
  if (c === '3001') st[3016] = Number(u.searchParams.get('par'));
  else if (c && u.searchParams.has('par')) st[c] = Number(u.searchParams.get('par'));
  x(`<Function><Cmd>${c}</Cmd><Status>0</Status></Function>`);
}).listen(8099, '127.0.0.1', () => console.log('mock on 8099'));
import net from 'node:net';
net.createServer((s) => { console.log('socket 3333 connected'); const t = setInterval(() => s.write('<Function><Cmd>9019</Cmd><Status>3</Status></Function>'), 5000); s.on('close', () => { clearInterval(t); console.log('socket closed'); }); s.on('error', () => {}); }).listen(3333, '127.0.0.1');
