'use strict';
/* Gift Wishlist BD \u2014 pure logic (no DOM). Node-testable + browser-usable.
   Money is integer paisa (1 BDT = 100 paisa). All Bengali text is \uXXXX
   escapes so this file stays pure ASCII. */
(function (root) {
  var BN_DIGITS = ['\u09e6','\u09e7','\u09e8','\u09e9','\u09ea','\u09eb','\u09ec','\u09ed','\u09ee','\u09ef'];

  var STATUSES = ['Idea', 'Planned', 'Bought', 'Given', 'Dropped'];
  var TRANSITIONS = {
    Idea: ['Planned', 'Dropped'],
    Planned: ['Bought', 'Dropped'],
    Bought: ['Given', 'Dropped'],
    Given: [],
    Dropped: []
  };
  var PRIORITIES = ['Must-have', 'Nice-to-have', 'Idea-only'];
  var OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Eid', 'New Baby', 'Graduation', 'Other'];
  var APP_ID = 'gift-wishlist-bd';
  var DATA_VERSION = 1;

  function toBnDigits(s) {
    return String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }
  function fmtInt(n, lang) {
    var s = String(Math.trunc(n));
    var out = '';
    // Western grouping (3-digit) \u2014 same grouping both languages, digits differ.
    var neg = s[0] === '-';
    if (neg) s = s.slice(1);
    var first = s.length % 3 || 3;
    out = s.slice(0, first);
    for (var i = first; i < s.length; i += 3) out += ',' + s.slice(i, i + 3);
    if (neg) out = '-' + out;
    return lang === 'bn' ? toBnDigits(out) : out;
  }
  function fmtMoney(paisa, lang) {
    var sign = paisa < 0 ? '-' : '';
    var abs = Math.abs(paisa);
    var whole = Math.floor(abs / 100);
    var frac = abs % 100;
    var s = sign + fmtInt(whole, 'en') + '.' + (frac < 10 ? '0' + frac : '' + frac);
    if (lang === 'bn') s = toBnDigits(s);
    return '\u09f3' + s;
  }
  function toPaisa(bdt) {
    // bdt: number with at most 2 decimals. Returns integer paisa or null.
    if (typeof bdt !== 'number' || !isFinite(bdt)) return null;
    var r = Math.round(bdt * 100);
    if (Math.abs(r - bdt * 100) > 0.001) return null;
    return r;
  }
  function parseAmount(str) {
    // Accepts "1500", "1500.50", "1,500.50", Bengali digits, optional \u09f3/Tk.
    if (typeof str !== 'string') return null;
    var s = str.trim().replace(/^[\u09f3Tk\s]+/, '').replace(/\s*(Tk|BDT)\s*$/i, '');
    if (!s) return null;
    s = s.replace(/[\u09e6-\u09ef]/g, function (d) { return String(d.charCodeAt(0) - 0x09e6); });
    s = s.replace(/,/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    var v = Number(s);
    if (!isFinite(v) || v < 0 || v > 10000000) return null;
    return Math.round(v * 100);
  }
  function isValidUrl(s) {
    if (s === '' || s === null || s === undefined) return true;
    if (typeof s !== 'string') return false;
    try {
      var u = new URL(s.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) { return false; }
  }
  function newId() {
    return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function newState() {
    return { version: DATA_VERSION, items: [], budgets: {}, lang: 'en' };
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function validateItem(d, isEdit) {
    var errs = [];
    if (!d || typeof d !== 'object') return ['Invalid item'];
    if (typeof d.name !== 'string' || !d.name.trim()) errs.push('Gift name is required');
    else if (d.name.trim().length > 100) errs.push('Gift name must be at most 100 characters');
    if (typeof d.recipient !== 'string' || !d.recipient.trim()) errs.push('Recipient is required');
    else if (d.recipient.trim().length > 60) errs.push('Recipient must be at most 60 characters');
    if (OCCASIONS.indexOf(d.occasion) === -1) errs.push('Occasion is not in the list');
    if (typeof d.pricePaisa !== 'number' || !Number.isInteger(d.pricePaisa) || d.pricePaisa < 0 || d.pricePaisa > 1000000000) errs.push('Price must be between 0 and 10,000,000 BDT');
    if (PRIORITIES.indexOf(d.priority) === -1) errs.push('Priority is not in the list');
    if (STATUSES.indexOf(d.status) === -1) errs.push('Status is not in the list');
    if (!isValidUrl(d.link || '')) errs.push('Link must be a valid http(s) URL or empty');
    if (d.note !== undefined && (typeof d.note !== 'string' || d.note.length > 300)) errs.push('Note must be at most 300 characters');
    if (isEdit && typeof d.id !== 'string') errs.push('Missing item id');
    return errs;
  }
  function normalizeItem(d) {
    return {
      id: d.id || newId(),
      name: d.name.trim(),
      recipient: d.recipient.trim(),
      occasion: d.occasion,
      pricePaisa: d.pricePaisa,
      priority: d.priority,
      status: d.status || 'Idea',
      link: (d.link || '').trim(),
      note: (d.note || '').trim(),
      createdAt: d.createdAt || new Date().toISOString()
    };
  }
  function addItem(state, d) {
    var errs = validateItem(d, false);
    if (errs.length) return { ok: false, errors: errs };
    var s = clone(state);
    s.items.push(normalizeItem(d));
    return { ok: true, state: s };
  }
  function updateItem(state, id, d) {
    var errs = validateItem(Object.assign({}, d, { id: id }), true);
    if (errs.length) return { ok: false, errors: errs };
    var s = clone(state);
    var idx = s.items.findIndex(function (x) { return x.id === id; });
    if (idx === -1) return { ok: false, errors: ['Item not found'] };
    var kept = s.items[idx];
    s.items[idx] = normalizeItem(Object.assign({}, d, { id: id, createdAt: kept.createdAt }));
    return { ok: true, state: s };
  }
  function deleteItem(state, id) {
    var s = clone(state);
    var before = s.items.length;
    s.items = s.items.filter(function (x) { return x.id !== id; });
    if (s.items.length === before) return { ok: false, errors: ['Item not found'] };
    return { ok: true, state: s };
  }
  function moveStatus(state, id, to) {
    if (STATUSES.indexOf(to) === -1) return { ok: false, errors: ['Unknown status'] };
    var s = clone(state);
    var it = s.items.find(function (x) { return x.id === id; });
    if (!it) return { ok: false, errors: ['Item not found'] };
    if (TRANSITIONS[it.status].indexOf(to) === -1) {
      return { ok: false, errors: ['Cannot move ' + it.status + ' -> ' + to] };
    }
    it.status = to;
    return { ok: true, state: s };
  }
  function setBudget(state, occasion, paisa) {
    if (OCCASIONS.indexOf(occasion) === -1) return { ok: false, errors: ['Unknown occasion'] };
    if (typeof paisa !== 'number' || !Number.isInteger(paisa) || paisa < 0 || paisa > 1000000000) return { ok: false, errors: ['Budget must be between 0 and 10,000,000 BDT'] };
    var s = clone(state);
    if (paisa === 0) delete s.budgets[occasion]; else s.budgets[occasion] = paisa;
    return { ok: true, state: s };
  }
  function stats(state) {
    var total = state.items.length;
    var planned = 0, bought = 0, given = 0, dropped = 0;
    var plannedSpend = 0, boughtSpend = 0, givenSpend = 0;
    state.items.forEach(function (it) {
      if (it.status === 'Idea' || it.status === 'Planned') { planned++; plannedSpend += it.pricePaisa; }
      else if (it.status === 'Bought') { bought++; boughtSpend += it.pricePaisa; }
      else if (it.status === 'Given') { given++; givenSpend += it.pricePaisa; }
      else if (it.status === 'Dropped') dropped++;
    });
    return { total: total, planned: planned, bought: bought, given: given, dropped: dropped,
      plannedSpend: plannedSpend, boughtSpend: boughtSpend, givenSpend: givenSpend };
  }
  function occasionSpend(state, occasion) {
    var spend = 0, budget = state.budgets[occasion] || 0;
    state.items.forEach(function (it) {
      if (it.occasion === occasion && it.status !== 'Dropped') spend += it.pricePaisa;
    });
    return { spend: spend, budget: budget,
      pct: budget > 0 ? Math.min(100, Math.round(spend / budget * 100)) : null,
      over: budget > 0 && spend > budget };
  }
  function filterItems(state, opts) {
    opts = opts || {};
    var list = state.items.slice();
    if (opts.status && opts.status !== 'All') list = list.filter(function (x) { return x.status === opts.status; });
    if (opts.occasion && opts.occasion !== 'All') list = list.filter(function (x) { return x.occasion === opts.occasion; });
    if (opts.priority && opts.priority !== 'All') list = list.filter(function (x) { return x.priority === opts.priority; });
    if (opts.q) {
      var q = opts.q.toLowerCase();
      list = list.filter(function (x) {
        return (x.name + ' ' + x.recipient + ' ' + (x.note || '')).toLowerCase().indexOf(q) !== -1;
      });
    }
    var sort = opts.sort || 'newest';
    if (sort === 'price-asc') list.sort(function (a, b) { return a.pricePaisa - b.pricePaisa; });
    else if (sort === 'price-desc') list.sort(function (a, b) { return b.pricePaisa - a.pricePaisa; });
    else if (sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else list.sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
    return list;
  }
  function shareText(state, lang) {
    var st = stats(state);
    var lines = [];
    lines.push(lang === 'bn' ? '\u0986\u09ae\u09be\u09b0 \u0989\u09aa\u09b9\u09be\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be' : 'My Gift Wishlist');
    state.items.filter(function (x) { return x.status !== 'Dropped'; }).forEach(function (it) {
      lines.push('- ' + it.name + ' (' + it.recipient + ', ' + it.occasion + ') - ' + fmtMoney(it.pricePaisa, lang) + ' [' + it.status + ']');
    });
    lines.push((lang === 'bn' ? '\u09ae\u09cb\u099f \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09bf\u09a4 \u0996\u09b0\u099a: ' : 'Total planned spend: ') + fmtMoney(st.plannedSpend, lang));
    return lines.join('\n');
  }
  function exportData(state) {
    return JSON.stringify({ app: APP_ID, version: DATA_VERSION, exportedAt: new Date().toISOString(), state: state }, null, 2);
  }
  function validateImport(obj) {
    var errs = [];
    if (!obj || typeof obj !== 'object') return ['Not a JSON object'];
    if (obj.app !== APP_ID) errs.push('Wrong app id (expected ' + APP_ID + ')');
    if (obj.version !== DATA_VERSION) errs.push('Unsupported version');
    if (!obj.state || typeof obj.state !== 'object') { errs.push('Missing state'); return errs; }
    var st = obj.state;
    if (!Array.isArray(st.items)) errs.push('items must be an array');
    else {
      var ids = {};
      st.items.forEach(function (it, i) {
        var e = validateItem(it, true);
        if (e.length) errs.push('items[' + i + ']: ' + e.join('; '));
        if (it.id) { if (ids[it.id]) errs.push('items[' + i + ']: duplicate id'); ids[it.id] = true; }
      });
    }
    if (!st.budgets || typeof st.budgets !== 'object' || Array.isArray(st.budgets)) errs.push('budgets must be an object');
    else Object.keys(st.budgets).forEach(function (k) {
      if (OCCASIONS.indexOf(k) === -1) errs.push('budgets: unknown occasion ' + k);
      var v = st.budgets[k];
      if (typeof v !== 'number' || !Number.isInteger(v) || v <= 0 || v > 1000000000) errs.push('budgets[' + k + ']: invalid amount');
    });
    if (st.lang !== 'en' && st.lang !== 'bn') errs.push('lang must be en or bn');
    return errs;
  }
  function importData(obj) {
    var errs = validateImport(obj);
    if (errs.length) return { ok: false, errors: errs };
    return { ok: true, state: clone(obj.state) };
  }

  var api = { APP_ID: APP_ID, DATA_VERSION: DATA_VERSION, STATUSES: STATUSES, TRANSITIONS: TRANSITIONS,
    PRIORITIES: PRIORITIES, OCCASIONS: OCCASIONS, toBnDigits: toBnDigits, fmtInt: fmtInt, fmtMoney: fmtMoney,
    toPaisa: toPaisa, parseAmount: parseAmount, isValidUrl: isValidUrl, newState: newState, clone: clone,
    validateItem: validateItem, addItem: addItem, updateItem: updateItem, deleteItem: deleteItem,
    moveStatus: moveStatus, setBudget: setBudget, stats: stats, occasionSpend: occasionSpend,
    filterItems: filterItems, shareText: shareText, exportData: exportData,
    validateImport: validateImport, importData: importData };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GiftLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
