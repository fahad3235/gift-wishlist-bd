'use strict';
/* Gift Wishlist BD \u2014 DOM layer. Bengali strings are \uXXXX escapes (ASCII file). */
(function () {
  var L = window.GiftLogic;
  var LS_KEY = 'gift-wishlist-bd:v1';
  var state = L.newState();
  var editingId = null;
  var filters = { q: '', status: 'All', occasion: 'All', priority: 'All', sort: 'newest' };

  var I18N = {
    en: {
      title: 'Gift Wishlist BD', tagline: 'My gift ideas, planned, bought & given \u2014 all in one place',
      langBtn: '\u09ac\u09be\u0982\u09b2\u09be', tabWishlist: 'Wishlist', tabBudgets: 'Budgets', tabData: 'Data',
      totalItems: 'Total items', plannedSpend: 'Planned spend', boughtSpend: 'Bought spend', givenCount: 'Given',
      addTitle: 'Add a gift', editTitle: 'Edit gift', giftName: 'Gift name', recipient: 'Recipient',
      occasion: 'Occasion', price: 'Price (BDT)', priority: 'Priority', status: 'Status',
      link: 'Link (optional)', note: 'Note (optional)', addBtn: 'Add gift', saveBtn: 'Save changes',
      cancelBtn: 'Cancel', search: 'Search gifts, people, notes\u2026', sort: 'Sort', sortNewest: 'Newest',
      sortPriceAsc: 'Price: low to high', sortPriceDesc: 'Price: high to low', sortName: 'Name A\u2013Z',
      all: 'All', empty: 'No gifts yet. Add your first gift idea above!',
      emptyFilter: 'Nothing matches these filters.', edit: 'Edit', del: 'Delete', moveTo: 'Move to',
      budgetsTitle: 'Occasion budgets', budgetHint: 'Set a spending cap per occasion. Spend counts every item that is not Dropped.',
      budgetLabel: 'Budget', spendLabel: 'Spend', noBudget: 'No budget set', overBudget: 'Over budget!',
      dataTitle: 'Your data', dataHint: 'Everything lives in this browser (localStorage). Export a backup any time.',
      exportBtn: 'Export JSON', importBtn: 'Import JSON', importHint: 'Import replaces all current data. Only files exported by this app are accepted.',
      shareBtn: 'Copy wishlist as text', copied: 'Copied!', eraseTitle: 'Erase all data',
      eraseHint: 'Type DELETE below to permanently erase every gift and budget.',
      eraseBtn: 'Erase everything', erasePlaceholder: 'Type DELETE', confirmDel: 'Delete this gift?',
      importBad: 'Import failed: ', importOk: 'Import successful.', eraseBad: 'Type DELETE exactly to erase.',
      erased: 'All data erased.', saveOk: '', formError: 'Please fix the highlighted fields.',
      forLabel: 'for', unnamed: 'Gift'
    },
    bn: {
      title: '\u0997\u09bf\u09ab\u099f \u0989\u0987\u09b6\u09b2\u09bf\u09b8\u09cd\u099f \u09ac\u09bf\u09a1\u09bf', tagline: '\u0986\u09ae\u09be\u09b0 \u0989\u09aa\u09b9\u09be\u09b0\u09c7\u09b0 \u0986\u0987\u09a1\u09bf\u09af\u09bc\u09be, \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be, \u0995\u09c7\u09a8\u09be \u0993 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u2014 \u09b8\u09ac \u098f\u0995 \u099c\u09be\u09af\u09bc\u0997\u09be\u09af\u09bc',
      langBtn: 'English', tabWishlist: '\u0989\u0987\u09b6\u09b2\u09bf\u09b8\u09cd\u099f', tabBudgets: '\u09ac\u09be\u099c\u09c7\u099f', tabData: '\u09a1\u09c7\u099f\u09be',
      totalItems: '\u09ae\u09cb\u099f \u0986\u0987\u099f\u09c7\u09ae', plannedSpend: '\u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09bf\u09a4 \u0996\u09b0\u099a', boughtSpend: '\u0995\u09c7\u09a8\u09be \u0996\u09b0\u099a', givenCount: '\u09a6\u09c7\u0993\u09af\u09bc\u09be',
      addTitle: '\u0989\u09aa\u09b9\u09be\u09b0 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', editTitle: '\u0989\u09aa\u09b9\u09be\u09b0 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be \u0995\u09b0\u09c1\u09a8', giftName: '\u0989\u09aa\u09b9\u09be\u09b0\u09c7\u09b0 \u09a8\u09be\u09ae', recipient: '\u09aa\u09cd\u09b0\u09be\u09aa\u0995',
      occasion: '\u0989\u09aa\u09b2\u0995\u09cd\u09b7', price: '\u09a6\u09be\u09ae (\u099f\u09be\u0995\u09be)', priority: '\u0985\u0997\u09cd\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0', status: '\u0985\u09ac\u09b8\u09cd\u09a5\u09be',
      link: '\u09b2\u09bf\u0982\u0995 (\u0990\u099a\u09cd\u099b\u09bf\u0995)', note: '\u09a8\u09cb\u099f (\u0990\u099a\u09cd\u099b\u09bf\u0995)', addBtn: '\u0989\u09aa\u09b9\u09be\u09b0 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', saveBtn: '\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8',
      cancelBtn: '\u09ac\u09be\u09a4\u09bf\u09b2', search: '\u0989\u09aa\u09b9\u09be\u09b0, \u09ae\u09be\u09a8\u09c1\u09b7, \u09a8\u09cb\u099f \u0996\u09c1\u0981\u099c\u09c1\u09a8\u2026', sort: '\u09b8\u09be\u099c\u09be\u09a8', sortNewest: '\u09a8\u09a4\u09c1\u09a8 \u09aa\u09cd\u09b0\u09a5\u09ae\u09c7',
      sortPriceAsc: '\u09a6\u09be\u09ae: \u0995\u09ae \u09a5\u09c7\u0995\u09c7 \u09ac\u09c7\u09b6\u09bf', sortPriceDesc: '\u09a6\u09be\u09ae: \u09ac\u09c7\u09b6\u09bf \u09a5\u09c7\u0995\u09c7 \u0995\u09ae', sortName: '\u09a8\u09be\u09ae \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0',
      all: '\u09b8\u09ac', empty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u0989\u09aa\u09b9\u09be\u09b0 \u09a8\u09c7\u0987\u0964 \u0989\u09aa\u09b0\u09c7 \u09aa\u09cd\u09b0\u09a5\u09ae \u0989\u09aa\u09b9\u09be\u09b0\u09c7\u09b0 \u0986\u0987\u09a1\u09bf\u09af\u09bc\u09be \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8!',
      emptyFilter: '\u098f\u0987 \u09ab\u09bf\u09b2\u09cd\u099f\u09be\u09b0\u09c7 \u0995\u09bf\u099b\u09c1 \u09ae\u09bf\u09b2\u099b\u09c7 \u09a8\u09be\u0964', edit: '\u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be', del: '\u09ae\u09c1\u099b\u09c1\u09a8', moveTo: '\u09b8\u09cd\u09a5\u09be\u09a8\u09be\u09a8\u09cd\u09a4\u09b0 \u0995\u09b0\u09c1\u09a8',
      budgetsTitle: '\u0989\u09aa\u09b2\u0995\u09cd\u09b7 \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0 \u09ac\u09be\u099c\u09c7\u099f', budgetHint: '\u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u0989\u09aa\u09b2\u0995\u09cd\u09b7\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u0996\u09b0\u099a\u09c7\u09b0 \u09b8\u09c0\u09ae\u09be \u09a0\u09bf\u0995 \u0995\u09b0\u09c1\u09a8\u0964 \u09ac\u09be\u09a6 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u0986\u0987\u099f\u09c7\u09ae \u099b\u09be\u09a1\u09bc\u09be \u09b8\u09ac \u0986\u0987\u099f\u09c7\u09ae \u0996\u09b0\u099a\u09c7 \u09a7\u09b0\u09be \u09b9\u09af\u09bc\u0964',
      budgetLabel: '\u09ac\u09be\u099c\u09c7\u099f', spendLabel: '\u0996\u09b0\u099a', noBudget: '\u09ac\u09be\u099c\u09c7\u099f \u09a0\u09bf\u0995 \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09a8\u09bf', overBudget: '\u09ac\u09be\u099c\u09c7\u099f\u09c7\u09b0 \u09ac\u09c7\u09b6\u09bf!',
      dataTitle: '\u0986\u09aa\u09a8\u09be\u09b0 \u09a1\u09c7\u099f\u09be', dataHint: '\u09b8\u09ac\u0995\u09bf\u099b\u09c1 \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u0987 \u09a5\u09be\u0995\u09c7 (localStorage)\u0964 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09b8\u09ae\u09af\u09bc \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09a8\u09bf\u09a8\u0964',
      exportBtn: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', importBtn: 'JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f', importHint: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09b2\u09c7 \u09ac\u09b0\u09cd\u09a4\u09ae\u09be\u09a8 \u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ac\u09a6\u09b2\u09c7 \u09af\u09be\u09ac\u09c7\u0964 \u09b6\u09c1\u09a7\u09c1 \u098f\u0987 \u0985\u09cd\u09af\u09be\u09aa \u09a5\u09c7\u0995\u09c7 \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09be \u09ab\u09be\u0987\u09b2\u0987 \u0997\u09cd\u09b0\u09b9\u09a3 \u0995\u09b0\u09be \u09b9\u09af\u09bc\u0964',
      shareBtn: '\u099f\u09c7\u0995\u09cd\u09b8\u099f \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u0995\u09aa\u09bf \u0995\u09b0\u09c1\u09a8', copied: '\u0995\u09aa\u09bf \u09b9\u09af\u09bc\u09c7\u099b\u09c7!', eraseTitle: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8',
      eraseHint: '\u09b8\u09ac \u0989\u09aa\u09b9\u09be\u09b0 \u0993 \u09ac\u09be\u099c\u09c7\u099f \u099a\u09bf\u09b0\u09a4\u09b0\u09c7 \u09ae\u09c1\u099b\u09a4\u09c7 \u09a8\u09bf\u099a\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      eraseBtn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8', erasePlaceholder: 'DELETE \u09b2\u09bf\u0996\u09c1\u09a8', confirmDel: '\u098f\u0987 \u0989\u09aa\u09b9\u09be\u09b0\u099f\u09bf \u09ae\u09c1\u099b\u09ac\u09c7\u09a8?',
      importBad: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5: ', importOk: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', eraseBad: '\u09ae\u09c1\u099b\u09a4\u09c7 \u09a0\u09bf\u0995 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      erased: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', saveOk: '', formError: '\u09b9\u09be\u0987\u09b2\u09be\u0987\u099f \u0995\u09b0\u09be \u09ab\u09bf\u09b2\u09cd\u09a1\u0997\u09c1\u09b2\u09cb \u09a0\u09bf\u0995 \u0995\u09b0\u09c1\u09a8\u0964',
      forLabel: '\u098f\u09b0 \u099c\u09a8\u09cd\u09af', unnamed: '\u0989\u09aa\u09b9\u09be\u09b0'
    }
  };
  var STATUS_BN = { Idea: '\u0986\u0987\u09a1\u09bf\u09af\u09bc\u09be', Planned: '\u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09bf\u09a4', Bought: '\u0995\u09c7\u09a8\u09be', Given: '\u09a6\u09c7\u0993\u09af\u09bc\u09be', Dropped: '\u09ac\u09be\u09a6' };
  var PRIORITY_BN = { 'Must-have': '\u0985\u09ac\u09b6\u09cd\u09af\u0987 \u099a\u09be\u0987', 'Nice-to-have': '\u09a5\u09be\u0995\u09b2\u09c7 \u09ad\u09be\u09b2\u09cb', 'Idea-only': '\u09b6\u09c1\u09a7\u09c1 \u0986\u0987\u09a1\u09bf\u09af\u09bc\u09be' };
  var OCCASION_BN = { Birthday: '\u099c\u09a8\u09cd\u09ae\u09a6\u09bf\u09a8', Anniversary: '\u09ac\u09bf\u09ac\u09be\u09b9\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995\u09c0', Wedding: '\u09ac\u09bf\u09af\u09bc\u09c7', Eid: '\u0988\u09a6', 'New Baby': '\u09a8\u09ac\u099c\u09be\u09a4\u0995', Graduation: '\u0997\u09cd\u09b0\u09cd\u09af\u09be\u099c\u09c1\u09af\u09bc\u09c7\u09b6\u09a8', Other: '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af' };

  function t(k) { return (I18N[state.lang] || I18N.en)[k] || k; }
  function label(map, v) { return state.lang === 'bn' && map[v] ? map[v] : v; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function money(p) { return L.fmtMoney(p, state.lang); }

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var obj = JSON.parse(raw);
        if (obj && obj.app === L.APP_ID && obj.state) state = obj.state;
      }
    } catch (e) { /* corrupted storage: start fresh */ }
    if (!state.lang) state.lang = 'en';
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ app: L.APP_ID, state: state })); } catch (e) { /* storage full/blocked */ }
  }

  function applyLang() {
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    $('langBtn').textContent = t('langBtn');
    buildSelects();
    render();
  }
  function buildSelects() {
    var occ = $('fOccasion'), pri = $('fPriority'), st = $('fStatus'), fo = $('fltOccasion'), fs = $('fltStatus'), fp = $('fltPriority');
    var cur = { occ: occ.value, pri: pri.value, st: st.value, fo: fo.value, fs: fs.value, fp: fp.value };
    occ.innerHTML = L.OCCASIONS.map(function (o) { return '<option value="' + o + '">' + esc(label(OCCASION_BN, o)) + '</option>'; }).join('');
    pri.innerHTML = L.PRIORITIES.map(function (p) { return '<option value="' + p + '">' + esc(label(PRIORITY_BN, p)) + '</option>'; }).join('');
    st.innerHTML = L.STATUSES.map(function (s) { return '<option value="' + s + '">' + esc(label(STATUS_BN, s)) + '</option>'; }).join('');
    fo.innerHTML = '<option value="All">' + esc(t('all')) + '</option>' + L.OCCASIONS.map(function (o) { return '<option value="' + o + '">' + esc(label(OCCASION_BN, o)) + '</option>'; }).join('');
    fs.innerHTML = '<option value="All">' + esc(t('all')) + '</option>' + L.STATUSES.map(function (s) { return '<option value="' + s + '">' + esc(label(STATUS_BN, s)) + '</option>'; }).join('');
    fp.innerHTML = '<option value="All">' + esc(t('all')) + '</option>' + L.PRIORITIES.map(function (p) { return '<option value="' + p + '">' + esc(label(PRIORITY_BN, p)) + '</option>'; }).join('');
    occ.value = cur.occ || 'Birthday'; pri.value = cur.pri || 'Must-have'; st.value = cur.st || 'Idea';
    fo.value = filters.occasion; fs.value = filters.status; fp.value = filters.priority;
    var sortSel = $('fltSort');
    sortSel.innerHTML = '<option value="newest">' + esc(t('sortNewest')) + '</option>' +
      '<option value="price-asc">' + esc(t('sortPriceAsc')) + '</option>' +
      '<option value="price-desc">' + esc(t('sortPriceDesc')) + '</option>' +
      '<option value="name">' + esc(t('sortName')) + '</option>';
    sortSel.value = filters.sort;
  }

  function render() {
    var st = L.stats(state);
    $('statTotal').textContent = L.fmtInt(st.total, state.lang);
    $('statPlanned').textContent = money(st.plannedSpend);
    $('statBought').textContent = money(st.boughtSpend);
    $('statGiven').textContent = L.fmtInt(st.given, state.lang);
    renderList();
    renderBudgets();
  }
  function renderList() {
    var list = L.filterItems(state, filters);
    var wrap = $('itemList');
    if (!state.items.length) { wrap.innerHTML = '<p class="empty">' + esc(t('empty')) + '</p>'; return; }
    if (!list.length) { wrap.innerHTML = '<p class="empty">' + esc(t('emptyFilter')) + '</p>'; return; }
    wrap.innerHTML = list.map(function (it) {
      var moves = L.TRANSITIONS[it.status].map(function (to) {
        return '<button class="mini" data-move="' + it.id + '" data-to="' + to + '">' + esc(t('moveTo')) + ' ' + esc(label(STATUS_BN, to)) + '</button>';
      }).join('');
      var linkHtml = it.link ? '<a class="item-link" href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.link.replace(/^https?:\/\//, '').slice(0, 40)) + '</a>' : '';
      return '<article class="card" data-id="' + it.id + '">' +
        '<div class="card-top"><h3>' + esc(it.name) + '</h3><span class="price">' + money(it.pricePaisa) + '</span></div>' +
        '<p class="card-meta">' + esc(t('forLabel')) + ' <strong>' + esc(it.recipient) + '</strong> &middot; ' + esc(label(OCCASION_BN, it.occasion)) + ' &middot; ' + esc(label(PRIORITY_BN, it.priority)) + '</p>' +
        (it.note ? '<p class="card-note">' + esc(it.note) + '</p>' : '') + linkHtml +
        '<div class="card-actions"><span class="badge status-' + it.status.toLowerCase() + '">' + esc(label(STATUS_BN, it.status)) + '</span>' +
        moves +
        '<button class="mini ghost" data-edit="' + it.id + '">' + esc(t('edit')) + '</button>' +
        '<button class="mini danger ghost" data-del="' + it.id + '">' + esc(t('del')) + '</button></div></article>';
    }).join('');
  }
  function renderBudgets() {
    $('budgetList').innerHTML = L.OCCASIONS.map(function (o) {
      var os = L.occasionSpend(state, o);
      var cur = state.budgets[o] ? (state.budgets[o] / 100) : '';
      var bar = os.budget > 0 ? '<div class="bar"><div class="bar-fill' + (os.over ? ' over' : '') + '" style="width:' + os.pct + '%"></div></div>' +
        '<p class="budget-line">' + esc(t('spendLabel')) + ': ' + money(os.spend) + ' / ' + money(os.budget) + (os.over ? ' <strong class="over-txt">' + esc(t('overBudget')) + '</strong>' : '') + '</p>' :
        '<p class="budget-line">' + esc(t('spendLabel')) + ': ' + money(os.spend) + ' &middot; ' + esc(t('noBudget')) + '</p>';
      return '<div class="budget-row"><label>' + esc(label(OCCASION_BN, o)) + '</label>' +
        '<div class="budget-input"><span>' + esc(t('budgetLabel')) + ' (&#2547;)</span>' +
        '<input type="text" inputmode="decimal" data-budget="' + o + '" value="' + esc(String(cur)) + '" placeholder="0">' +
        '<button class="mini" data-budget-save="' + o + '">' + esc(t('saveBtn')) + '</button></div>' + bar + '</div>';
    }).join('');
  }

  function readForm() {
    var price = L.parseAmount($('fPrice').value);
    return {
      name: $('fName').value, recipient: $('fRecipient').value, occasion: $('fOccasion').value,
      pricePaisa: price === null ? -1 : price, priority: $('fPriority').value, status: $('fStatus').value,
      link: $('fLink').value, note: $('fNote').value
    };
  }
  function showFormErrors(errs) {
    var box = $('formErrors');
    box.innerHTML = errs.length ? '<p>' + esc(t('formError')) + '</p><ul>' + errs.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '';
    box.hidden = !errs.length;
  }
  function clearForm() {
    editingId = null;
    ['fName', 'fRecipient', 'fPrice', 'fLink', 'fNote'].forEach(function (id) { $(id).value = ''; });
    $('fOccasion').value = 'Birthday'; $('fPriority').value = 'Must-have'; $('fStatus').value = 'Idea';
    $('formTitle').textContent = t('addTitle');
    $('submitBtn').textContent = t('addBtn');
    $('cancelEditBtn').hidden = true;
    showFormErrors([]);
  }

  function bind() {
    $('langBtn').addEventListener('click', function () {
      state.lang = state.lang === 'bn' ? 'en' : 'bn'; save(); applyLang();
    });
    document.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.hidden = p.id !== 'tab-' + btn.dataset.tab; });
      });
    });
    $('giftForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var d = readForm();
      var res = editingId ? L.updateItem(state, editingId, d) : L.addItem(state, d);
      if (!res.ok) { showFormErrors(res.errors); return; }
      state = res.state; save(); clearForm(); render();
    });
    $('cancelEditBtn').addEventListener('click', clearForm);
    $('fltSearch').addEventListener('input', function () { filters.q = this.value.trim(); renderList(); });
    $('fltStatus').addEventListener('change', function () { filters.status = this.value; renderList(); });
    $('fltOccasion').addEventListener('change', function () { filters.occasion = this.value; renderList(); });
    $('fltPriority').addEventListener('change', function () { filters.priority = this.value; renderList(); });
    $('fltSort').addEventListener('change', function () { filters.sort = this.value; renderList(); });
    $('itemList').addEventListener('click', function (e) {
      var mv = e.target.closest('[data-move]');
      var ed = e.target.closest('[data-edit]');
      var dl = e.target.closest('[data-del]');
      if (mv) {
        var r = L.moveStatus(state, mv.dataset.move, mv.dataset.to);
        if (r.ok) { state = r.state; save(); render(); }
        return;
      }
      if (ed) {
        var it = state.items.find(function (x) { return x.id === ed.dataset.edit; });
        if (!it) return;
        editingId = it.id;
        $('fName').value = it.name; $('fRecipient').value = it.recipient;
        $('fOccasion').value = it.occasion; $('fPrice').value = (it.pricePaisa / 100).toFixed(2).replace(/\.00$/, '');
        $('fPriority').value = it.priority; $('fStatus').value = it.status;
        $('fLink').value = it.link; $('fNote').value = it.note;
        $('formTitle').textContent = t('editTitle');
        $('submitBtn').textContent = t('saveBtn');
        $('cancelEditBtn').hidden = false;
        $('giftForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (dl) {
        if (confirm(t('confirmDel'))) {
          var d2 = L.deleteItem(state, dl.dataset.del);
          if (d2.ok) { state = d2.state; save(); render(); }
        }
      }
    });
    $('budgetList').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-budget-save]');
      if (!btn) return;
      var occ = btn.dataset.budgetSave;
      var input = document.querySelector('[data-budget="' + occ + '"]');
      var v = input.value.trim();
      var paisa = v === '' ? 0 : L.parseAmount(v);
      if (paisa === null) { input.classList.add('invalid'); return; }
      input.classList.remove('invalid');
      var r = L.setBudget(state, occ, paisa);
      if (r.ok) { state = r.state; save(); renderBudgets(); }
    });
    $('exportBtn').addEventListener('click', function () {
      var blob = new Blob([L.exportData(state)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'gift-wishlist-bd-backup.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    $('importFile').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var res = L.importData(JSON.parse(rd.result));
          if (!res.ok) { $('dataMsg').textContent = t('importBad') + res.errors.join('; '); return; }
          state = res.state; save(); applyLang();
          $('dataMsg').textContent = t('importOk');
        } catch (err) { $('dataMsg').textContent = t('importBad') + err.message; }
      };
      rd.readAsText(f);
      this.value = '';
    });
    $('shareBtn').addEventListener('click', function () {
      var txt = L.shareText(state, state.lang);
      function done() { $('shareMsg').textContent = t('copied'); setTimeout(function () { $('shareMsg').textContent = ''; }, 2000); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(function () { fallbackCopy(txt); done(); });
      } else { fallbackCopy(txt); done(); }
    });
    $('eraseBtn').addEventListener('click', function () {
      if ($('eraseInput').value.trim() !== 'DELETE') { $('dataMsg').textContent = t('eraseBad'); return; }
      state = L.newState(); state.lang = document.documentElement.lang === 'bn' ? 'bn' : state.lang;
      save(); clearForm(); applyLang();
      $('eraseInput').value = '';
      $('dataMsg').textContent = t('erased');
    });
  }
  function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* clipboard unavailable */ }
    ta.remove();
  }

  load();
  bind();
  applyLang();
})();
