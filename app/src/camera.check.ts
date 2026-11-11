// Run: node camera.check.ts
import assert from 'node:assert';
import { batteryLabel, dateRange, dedupe, parseCamTime, parseMenu, parseStatus, parseFiles, settingsFor } from './camera.ts';

assert.deepEqual(parseStatus('<?xml version="1.0"?><Function><Cmd>3001</Cmd><Status>0</Status></Function>'), { '3001': 0 });
assert.deepEqual(parseStatus('<LIST><Cmd>2002</Cmd><Status>1</Status><Cmd>1007</Cmd><Status>-1</Status></LIST>'), { '2002': 1, '1007': -1 });

const [v, p] = parseFiles(`<LIST><ALLFile><File><NAME>2024_0101_120000.MOV</NAME><FPATH>A:\\DCIM\\MOVIE\\2024_0101_120000.MOV</FPATH><SIZE>1234</SIZE><TIMECODE>1</TIMECODE><TIME>2024/01/01 12:00:00</TIME><ATTR>32</ATTR></File></ALLFile>
<ALLFile><File><NAME>IMG_0001.JPG</NAME><FPATH>A:\\DCIM\\PHOTO\\IMG_0001.JPG</FPATH><SIZE>99</SIZE><TIMECODE>1</TIMECODE><TIME>2024/01/01 12:00:01</TIME></File></ALLFile></LIST>`);
assert.equal(v.url, 'http://192.168.1.254/DCIM/MOVIE/2024_0101_120000.MOV');
assert.equal(v.thumb, v.url + '?custom=1&cmd=4001');
assert.ok(v.isVideo && !p.isVideo);
assert.equal(p.size, 99);
assert.equal(batteryLabel(0), 'Pleine');
assert.equal(batteryLabel(4), 'Vide');
assert.equal(batteryLabel(5), 'En charge');
assert.equal(batteryLabel(null), '—');
// Real cmd 3031 excerpt (firmware V1.26A, model 675)
const menu = parseMenu(`<LIST> <Item> <Cmd>2003</Cmd> <Name>MOVIE_CYCLIC_REC</Name> <MenuList> <Option> <Index>0</Index> <Id>OFF</Id> </Option> <Option> <Index>1</Index> <Id>3MIN</Id> </Option> <Option> <Index>3</Index> <Id>10MIN</Id> </Option> <Option> <Index>4</Index> <Id>10MIN</Id> </Option> </MenuList> </Item>
<Item> <Cmd>1002</Cmd> <Name>PHOTO_SIZE</Name> <MenuList> <Option> <Index>2</Index> <Id>12M</Id> </Option> <Option> <Index>16</Index> <Id>2MHD</Id> </Option> <Option> <Index>7</Index> <Id>VGA</Id> </Option> </MenuList> </Item>
<Item> <Cmd>3007</Cmd> <Name>AUTO_POWER_OFF</Name> <MenuList> <Option> <Index>0</Index> <Id>ON</Id> </Option> <Option> <Index>1</Index> <Id>3MIN</Id> </Option> </MenuList> </Item> <CHK>527F</CHK> </LIST>`);
assert.deepEqual(menu['2003'].map((o) => o.value), [0, 1, 3, 4]);
assert.deepEqual(dedupe(menu['2003'], 0).map((o) => o.value), [0, 1, 3]);
assert.deepEqual(dedupe(menu['2003'], 4).map((o) => o.value), [0, 1, 4]); // current placeholder stays selectable
assert.deepEqual(menu['1002'].map((o) => o.value), [2, 16, 7]);
assert.equal(menu['1002'][0].label, '12 Mpx');
assert.equal(menu['3007'][0].label, 'Désactivé');
const photo = settingsFor(true, menu).find((x) => x.title === 'Photo')!.items.find((i) => i.cmd === 1002)!;
assert.ok('options' in photo && photo.options[1].value === 16);
const d = (t: string) => parseCamTime(t);
assert.equal(dateRange(d('2026/10/17 09:00:00'), d('2026/10/17 18:00:00')), '17 oct. 2026');
assert.equal(dateRange(d('2026/10/17 09:00:00'), d('2026/10/12 18:00:00')), '12 – 17 oct. 2026');
assert.equal(dateRange(d('2026/09/28 09:00:00'), d('2026/10/03 18:00:00')), '28 sept. – 3 oct. 2026');
assert.equal(dateRange(d('2025/12/30 09:00:00'), d('2026/01/02 18:00:00')), '30 déc. 2025 – 2 janv. 2026');
console.log('ok');

// Cambox V4 (camera4.ts)
const { parseKv, parseListing, batteryV4, sectionsV4, oldFirmware } = await import('./camera4.ts');
assert(!oldFirmware('1.2.7') && !oldFirmware('1.21') && oldFirmware('1.19'));
assert.deepEqual(parseKv('version=1.21;model=cbv4plus;'), { version: '1.21', model: 'cbv4plus' });
assert.deepEqual(parseKv('NOK'), {});
// lighttpd mod_dirlisting rows
const files4 = parseListing(`<table><tr class="d"><td class="n"><a href="../">..</a>/</td><td class="m">&nbsp;</td><td class="s">- &nbsp;</td><td class="t">Directory</td></tr>
<tr><td class="n"><a href="VID_0001.MOV">VID_0001.MOV</a></td><td class="m">2026-Oct-24 09:05:00</td><td class="s">512.5M</td><td class="t">video/quicktime</td></tr></table>`);
assert.equal(files4.length, 1);
assert.equal(files4[0].time, '2026/10/24 09:05:00');
assert.equal(files4[0].path, '100CAMBX/VID_0001.MOV');
assert.equal(files4[0].url, 'http://192.168.2.1/data/100CAMBX/VID_0001.MOV');
assert.equal(files4[0].size, Math.round(512.5 * 1024 ** 2));
assert.ok(files4[0].isVideo && files4[0].thumb === '');
assert.equal(batteryV4(4100), '100 % (4,10 V)');
assert.equal(batteryV4(3600), '50 % (3,60 V)');
const res4 = (m: string) => sectionsV4(m)[0].items[0];
assert.ok('options' in res4('cbv4') && !res4('cbv4').options.some((o) => o.label.startsWith('4K')));
assert.ok('options' in res4('cbv4pro') && res4('cbv4pro').options[0].label === '4K 30 i/s');
const odd = sectionsV4('cbv4pro', { resolution: '2', framerate: '1' })[0].items[0];
assert.ok('options' in odd && odd.options.at(-1)!.label === '720p 120 i/s'); // unknown combo stays selectable
console.log('ok v4');

// i18n (i18n.ts): generated labels, and an English entry for every French text the app shows.
const { t, setLang, EN } = await import('./i18n.ts');
const { readFileSync, readdirSync } = await import('node:fs');
setLang('en');
assert.equal(t('4K 30 i/s'), '4K 30 fps');
assert.equal(t('12 Mpx'), '12 MP');
assert.equal(t('10 (par défaut)'), '10 (default)');
assert.equal(t(batteryV4(3600)), '50% (3.60 V)');
assert.equal(t('Supprimer {n} éléments ?', { n: 3 }), 'Delete 3 items?');
assert.equal(t('Fluorescent 1'), 'Fluorescent 1'); // no entry: unchanged
assert.equal(dateRange(d('2026/10/17 09:00:00'), d('2026/10/12 18:00:00'), 'en-GB'), '12 – 17 Oct 2026');
// Camera settings: every title, label, option and footer is translated, except what reads the same in English.
const same = /^([-+\d.\/ ]+(min|s|M|Hz|photos?)?|Auto|WDR|Max|Min|VGA|Fluorescent( \d)?|Incandescent|ISO( \w+)?|—)$/;
const shown = [settingsFor(true), settingsFor(false), sectionsV4('cbv4'), sectionsV4('cbv4pro')].flat()
  .flatMap((sec) => [sec.title, sec.footer ?? '', ...sec.items.flatMap((it) => [it.label, ...('options' in it ? it.options.map((o) => o.label) : [])])])
  .filter(Boolean);
assert.deepEqual([...new Set(shown)].filter((x) => t(x) === x && EN[x] !== x && !same.test(x)), []);
// Screens: the literals passed to t() and plural(), and the confirmation texts.
const files = (readdirSync(import.meta.dirname, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f) && !f.includes('check'));
const keys = files.flatMap((f) => readFileSync(`${import.meta.dirname}/${f}`, 'utf8').split('\n')
  .filter((l) => /\b(t|plural)\(|^\s*\d{4}: \[/.test(l))
  .flatMap((l) => [...l.slice(l.search(/\b(t|plural)\(|\[/)).matchAll(/(?<=[(?:,] ?)(['"])((?:(?!\1).)*[A-Za-zÀ-ÿ]{2}(?:(?!\1).)*)\1/g)].map((m) => m[2])));
const ignored = /^(ios|android|cancel|destructive|button|auto|fr|en|default|confirm|ssid|password|record\.circle|fiber_manual_record|\/settings\/help|fr-FR|en-GB|utf8|Français|English|hierarchical|primary)$/;
assert.deepEqual([...new Set(keys)].filter((k) => !ignored.test(k) && !(k in EN)), []);
setLang('fr');
console.log('ok i18n');
