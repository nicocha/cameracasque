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
