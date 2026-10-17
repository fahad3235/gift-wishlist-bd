'use strict';
/* Node unit tests for Gift Wishlist BD logic. Run: node tests/unit.test.js */
const L = require('../js/logic.js');
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// --- money ---
check('toPaisa 1500.50 -> 150050', L.toPaisa(1500.50) === 150050);
check('fmtMoney en 150050 -> \u09f31,500.50', L.fmtMoney(150050, 'en') === '\u09f31,500.50');
check('fmtMoney bn digits', L.fmtMoney(150050, 'bn') === '\u09f3\u09e7,\u09eb\u09e6\u09e6.\u09eb\u09e6');
check('fmtMoney zero', L.fmtMoney(0, 'en') === '\u09f30.00');
check('parseAmount plain', L.parseAmount('1500') === 150000);
check('parseAmount decimals', L.parseAmount('1500.50') === 150050);
check('parseAmount commas', L.parseAmount('1,500.50') === 150050);
check('parseAmount Bengali digits', L.parseAmount('\u09e7\u09eb\u09e6\u09e6.\u09eb\u09e6') === 150050);
check('parseAmount \u09f3 prefix', L.parseAmount('\u09f31500') === 150000);
check('parseAmount junk rejected', L.parseAmount('abc') === null);
check('parseAmount 3 decimals rejected', L.parseAmount('1.234') === null);
check('parseAmount negative rejected', L.parseAmount('-5') === null);
check('parseAmount over cap rejected', L.parseAmount('10000001') === null);

// --- validation ---
let st = L.newState();
check('empty name rejected', L.addItem(st, { name: '', recipient: 'Meem', occasion: 'Birthday', pricePaisa: 100, priority: 'Must-have', status: 'Idea' }).ok === false);
check('name 101 rejected', L.addItem(st, { name: 'x'.repeat(101), recipient: 'Meem', occasion: 'Birthday', pricePaisa: 100, priority: 'Must-have', status: 'Idea' }).ok === false);
check('bad occasion rejected', L.addItem(st, { name: 'Book', recipient: 'Meem', occasion: 'Mars', pricePaisa: 100, priority: 'Must-have', status: 'Idea' }).ok === false);
check('bad url rejected', L.addItem(st, { name: 'Book', recipient: 'Meem', occasion: 'Birthday', pricePaisa: 100, priority: 'Must-have', status: 'Idea', link: 'ftp://x' }).ok === false);
check('note 301 rejected', L.addItem(st, { name: 'Book', recipient: 'Meem', occasion: 'Birthday', pricePaisa: 100, priority: 'Must-have', status: 'Idea', note: 'x'.repeat(301) }).ok === false);
check('valid add ok', L.addItem(st, { name: 'Book', recipient: 'Meem', occasion: 'Birthday', pricePaisa: 150050, priority: 'Must-have', status: 'Idea', link: 'https://example.com/book', note: 'Hardcover' }).ok === true);
let r = L.addItem(st, { name: 'Book', recipient: 'Meem', occasion: 'Birthday', pricePaisa: 150050, priority: 'Must-have', status: 'Idea' });
st = r.state;
check('state has 1 item', st.items.length === 1);
const id1 = st.items[0].id;

// --- transitions ---
check('Idea -> Given illegal', L.moveStatus(st, id1, 'Given').ok === false);
check('Idea -> Planned legal', L.moveStatus(st, id1, 'Planned').ok === true);
st = L.moveStatus(st, id1, 'Planned').state;
check('Planned -> Given illegal', L.moveStatus(st, id1, 'Given').ok === false);
check('Planned -> Bought legal', L.moveStatus(st, id1, 'Bought').ok === true);
st = L.moveStatus(st, id1, 'Bought').state;
check('Bought -> Given legal', L.moveStatus(st, id1, 'Given').ok === true);
st = L.moveStatus(st, id1, 'Given').state;
check('Given terminal', L.moveStatus(st, id1, 'Planned').ok === false);
check('unknown id rejected', L.moveStatus(st, 'nope', 'Planned').ok === false);

// --- second item + stats + filters ---
st = L.addItem(st, { name: 'Watch', recipient: 'Baba', occasion: 'Eid', pricePaisa: 500000, priority: 'Nice-to-have', status: 'Idea' }).state;
st = L.addItem(st, { name: 'Saree', recipient: 'Ma', occasion: 'Eid', pricePaisa: 750025, priority: 'Must-have', status: 'Planned' }).state;
let s = L.stats(st);
check('stats total 3', s.total === 3);
check('stats planned 2', s.planned === 2);
check('stats given 1', s.given === 1);
check('plannedSpend 500000+750025', s.plannedSpend === 1250025);
check('givenSpend 150050', s.givenSpend === 150050);
check('filter status Idea -> 1', L.filterItems(st, { status: 'Idea' }).length === 1);
check('filter occasion Eid -> 2', L.filterItems(st, { occasion: 'Eid' }).length === 2);
check('filter priority Must-have -> 2', L.filterItems(st, { priority: 'Must-have' }).length === 2);
check('search bangla-safe (watch)', L.filterItems(st, { q: 'watch' }).length === 1);
check('sort price-asc first is Book 150050', L.filterItems(st, { sort: 'price-asc' })[0].name === 'Book');
check('sort price-desc first is Saree', L.filterItems(st, { sort: 'price-desc' })[0].name === 'Saree');

// --- budgets ---
check('setBudget ok', L.setBudget(st, 'Eid', 1000000).ok === true);
st = L.setBudget(st, 'Eid', 1000000).state;
let os = L.occasionSpend(st, 'Eid');
check('Eid spend 1250025', os.spend === 1250025);
check('Eid pct capped 100', os.pct === 100);
check('Eid over budget', os.over === true);
check('setBudget unknown occasion rejected', L.setBudget(st, 'Mars', 100).ok === false);
check('setBudget 0 clears', L.setBudget(st, 'Eid', 0).ok === true && L.setBudget(st, 'Eid', 0).state.budgets.Eid === undefined);

// --- edit / delete ---
const id2 = st.items.find(x => x.name === 'Watch').id;
check('edit renames', L.updateItem(st, id2, { name: 'Smart Watch', recipient: 'Baba', occasion: 'Eid', pricePaisa: 600000, priority: 'Nice-to-have', status: 'Idea' }).ok === true);
st = L.updateItem(st, id2, { name: 'Smart Watch', recipient: 'Baba', occasion: 'Eid', pricePaisa: 600000, priority: 'Nice-to-have', status: 'Idea' }).state;
check('edit applied', st.items.find(x => x.id === id2).name === 'Smart Watch');
check('edit unknown id rejected', L.updateItem(st, 'nope', { name: 'X', recipient: 'Y', occasion: 'Eid', pricePaisa: 1, priority: 'Must-have', status: 'Idea' }).ok === false);
check('delete ok', L.deleteItem(st, id2).ok === true);
st = L.deleteItem(st, id2).state;
check('delete removed', st.items.length === 2);
check('delete unknown rejected', L.deleteItem(st, 'nope').ok === false);

// --- share text ---
let txt = L.shareText(st, 'en');
check('share text has header', txt.indexOf('My Gift Wishlist') === 0);
check('share text has total planned', txt.indexOf('Total planned spend: \u09f37,500.25') !== -1);
let txtBn = L.shareText(st, 'bn');
check('share text bn header', txtBn.indexOf('\u0986\u09ae\u09be\u09b0 \u0989\u09aa\u09b9\u09be\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be') === 0);

// --- export / import ---
let exported = L.exportData(st);
let parsed = JSON.parse(exported);
check('export app id', parsed.app === 'gift-wishlist-bd');
check('export round-trip ok', L.importData(parsed).ok === true);
check('import wrong app rejected', L.importData({ app: 'other', version: 1, state: L.newState() }).ok === false);
check('import wrong version rejected', L.importData({ app: 'gift-wishlist-bd', version: 99, state: L.newState() }).ok === false);
let bad = JSON.parse(exported); bad.state.items.push({ id: 'dup', name: 'X', recipient: 'Y', occasion: 'Mars', pricePaisa: 1, priority: 'Must-have', status: 'Idea' });
check('import bad occasion rejected', L.importData(bad).ok === false);
let dup = JSON.parse(exported); dup.state.items.push(JSON.parse(JSON.stringify(dup.state.items[0])));
check('import duplicate id rejected', L.importData(dup).ok === false);
let badB = JSON.parse(exported); badB.state.budgets = { Eid: -5 };
check('import bad budget rejected', L.importData(badB).ok === false);
let badL = JSON.parse(exported); badL.state.lang = 'fr';
check('import bad lang rejected', L.importData(badL).ok === false);
check('import preserves data', L.importData(parsed).state.items.length === 2);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
