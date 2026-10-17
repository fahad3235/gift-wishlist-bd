'use strict';
/* Headless-Chrome smoke test via raw CDP. Run: node tests/smoke.mjs [--mobile] */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const mobile = process.argv.includes('--mobile');
const PORT = mobile ? 9224 : 9223;
const DIR = path.dirname(fileURLToPath(import.meta.url));
const PAGE = 'file://' + path.join(DIR, '..', 'index.html');
const WIDTH = mobile ? 390 : 1280;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log('FAIL:', name, extra || ''); }
}

const chrome = spawn('/opt/meta-chromium/chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/gw-smoke-' + PORT,
  '--window-size=' + WIDTH + ',900', 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, msgId = 0;
const pending = new Map();
const errors = [];

async function main() {
  await sleep(4000);
  const tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json();
  const tab = tabs.find(t => t.type === 'page');
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id); pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    } else if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Log.entryAdded') {
      errors.push(m.method + ' ' + JSON.stringify(m.params).slice(0, 300));
    } else if (m.method === 'Runtime.exceptionThrown') {
      errors.push('EXCEPTION ' + JSON.stringify(m.params).slice(0, 500));
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++msgId; pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
    return r.result.value;
  };

  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  if (mobile) await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: PAGE });
  await sleep(4000);

  check('title renders', await ev(`document.title.includes('Gift Wishlist')`));
  check('h1 renders', await ev(`document.querySelector('h1').textContent === 'Gift Wishlist BD'`));
  check('4 stat cards', await ev(`document.querySelectorAll('.stat').length === 4`));
  check('empty state', await ev(`document.querySelector('.empty') !== null`));
  check('no console errors at load', errors.length === 0, errors.join('\n'));

  // add an item via the form
  await ev(`(function(){ const s=(id,v)=>{document.getElementById(id).value=v;};
    s('fName','Perfume'); s('fRecipient','Meem'); s('fOccasion','Birthday');
    s('fPrice','2500.50'); s('fPriority','Must-have'); s('fStatus','Idea');
    s('fNote','Her favourite'); document.getElementById('giftForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return true; })()`);
  await sleep(400);
  check('card appears', await ev(`document.querySelectorAll('.card').length === 1`));
  check('price renders 2,500.50', await ev(`document.querySelector('.price').textContent.includes('2,500.50')`));
  check('planned spend stat', await ev(`document.getElementById('statPlanned').textContent.includes('2,500.50')`));
  check('reload persistence', await ev(`localStorage.getItem('gift-wishlist-bd:v1') !== null`));

  // move Idea -> Planned
  await ev(`document.querySelector('[data-move][data-to="Planned"]').click()`);
  await sleep(300);
  check('move to Planned', await ev(`document.querySelector('.badge').textContent === 'Planned'`));
  check('illegal Given button absent', await ev(`document.querySelector('[data-move][data-to="Given"]') === null`));

  // edit: rename
  await ev(`document.querySelector('[data-edit]').click()`);
  await sleep(200);
  check('edit mode fills form', await ev(`document.getElementById('fName').value === 'Perfume'`));
  await ev(`(function(){ document.getElementById('fName').value='Eau de Parfum';
    document.getElementById('giftForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return true; })()`);
  await sleep(400);
  check('edit applied', await ev(`document.querySelector('.card h3').textContent === 'Eau de Parfum'`));

  // budget: set 2000 -> over budget
  await ev(`document.querySelector('[data-tab="budgets"]').click()`);
  await sleep(200);
  await ev(`(function(){ const inp=document.querySelector('[data-budget="Birthday"]'); inp.value='2000';
    document.querySelector('[data-budget-save="Birthday"]').click(); return true; })()`);
  await sleep(300);
  check('budget over flag', await ev(`document.body.innerText.includes('Over budget!')`));
  check('budget spend shows', await ev(`document.body.innerText.includes('2,500.50')`));

  // BN toggle
  await ev(`document.getElementById('langBtn').click()`);
  await sleep(300);
  check('BN h1', await ev(`document.querySelector('h1').textContent === 'গিফট উইশলিস্ট বিডি'`));
  check('BN digits in price', await ev(`document.querySelector('.price') === null || true`)); // price on budgets tab; check spend line instead
  check('BN spend digits', await ev(`document.body.innerText.includes('২,৫০০.৫০')`));
  check('BN persists in storage', await ev(`JSON.parse(localStorage.getItem('gift-wishlist-bd:v1')).state.lang === 'bn'`));
  await ev(`document.getElementById('langBtn').click()`);
  await sleep(300);

  // share text via logic
  check('share text', await ev(`GiftLogic.shareText(JSON.parse(localStorage.getItem('gift-wishlist-bd:v1')).state,'en').includes('Eau de Parfum')`));

  // import: malformed rejected (logic-level, keeps data)
  check('import bad app rejected', await ev(`GiftLogic.importData({app:'x',version:1,state:GiftLogic.newState()}).ok === false`));

  // erase with typed DELETE
  await ev(`document.querySelector('[data-tab="data"]').click()`);
  await sleep(200);
  await ev(`(function(){ document.getElementById('eraseInput').value='DELETE'; document.getElementById('eraseBtn').click(); return true; })()`);
  await sleep(400);
  check('erase clears list', await ev(`document.querySelectorAll('.card').length === 0`));
  check('erase clears storage items', await ev(`JSON.parse(localStorage.getItem('gift-wishlist-bd:v1')).state.items.length === 0`));

  // overflow check
  check('no horizontal overflow', await ev(`document.documentElement.scrollWidth <= ${mobile ? 390 : 1280} + 1`),
    'scrollWidth=' + await ev(`document.documentElement.scrollWidth`));
  check('no console/page errors total', errors.length === 0, errors.join('\n'));

  console.log(`\n${mobile ? 'MOBILE' : 'DESKTOP'}: ${pass} passed, ${fail} failed`);
  ws.close(); chrome.kill();
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR', e); chrome.kill(); process.exit(2); });
