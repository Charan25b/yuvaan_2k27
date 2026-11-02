import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function mount({ enabled = true, mobile = false } = {}) {
  const frames = new Map(), listeners = new Map(), values = new Map();
  let effect, cleanup, next = 0, time = 100;
  const window = { scrollY: 0, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  const hero = { offsetHeight: 800, dataset: {}, style: { setProperty: (k, v) => values.set(k, v), removeProperty: k => values.delete(k) }, getBoundingClientRect: () => ({ top: 96 - window.scrollY }) };
  const document = { hidden: false, querySelector: () => ({ offsetHeight: 96 }), addEventListener: window.addEventListener, removeEventListener: window.removeEventListener };
  const exports = {};
  const source = readFileSync(new URL('../components/home/HeroSection.tsx', import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports, window, document, matchMedia: () => ({ matches: mobile }),
    requestAnimationFrame(fn) { frames.set(++next, fn); return next; }, cancelAnimationFrame(id) { frames.delete(id); },
    IntersectionObserver: class { constructor(fn) { this.fn = fn; } observe(target) { this.fn([{ target, isIntersecting: true }]); } disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
    require(name) {
      if (name === 'react') return { useRef: () => ({ current: hero }), useEffect: fn => { effect = fn; } };
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (name.includes('useMotion')) return { useMotion: () => ({ enabled }) };
      if (name.endsWith('.css')) return { default: {} };
      if (name.startsWith('next/')) return { default: () => null };
      throw Error(name);
    },
  });
  const tree = exports.HeroSection(); cleanup = effect();
  return {
    values, listeners, frames, document, hero, tree,
    settle() { for (let i = 0; i < 70 && frames.size; i++) { time += 16; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); } },
    scroll(y) { window.scrollY = y; listeners.get('scroll')?.(); this.settle(); },
    dispose() { cleanup?.(); },
  };
}

test('scrolling grows YUVAAN and shrinks ENTER THE; reverse scroll restores both', () => {
  const app = mount(); app.settle();
  assert.equal(Number(app.values.get('--brand-scale')), 1);
  app.scroll(250);
  assert.ok(Number(app.values.get('--brand-scale')) > 1.09);
  assert.ok(Number(app.values.get('--prelude-scale')) < .91);
  assert.ok(Number(app.values.get('--verse-scale')) < .91);
  assert.ok(parseFloat(app.values.get('--satellite-y')) > 20);
  assert.ok(Math.abs(Number(app.values.get('--brand-scale')) - (1 + .22 * 250 / 800 / .65)) < .001, 'YUVAAN keeps its existing zoom');
  assert.deepEqual([...app.values.keys()].sort(), ['--brand-scale', '--comic-scale', '--comic-y', '--prelude-scale', '--satellite-y', '--verse-scale']);
  assert.ok(Number(app.values.get('--comic-scale')) < 1.4);
  assert.ok(parseFloat(app.values.get('--comic-y')) > 20);
  app.scroll(0);
  assert.ok(Math.abs(Number(app.values.get('--brand-scale')) - 1) < .001);
  assert.ok(Math.abs(Number(app.values.get('--prelude-scale')) - 1) < .001);
  assert.ok(Math.abs(Number(app.values.get('--verse-scale')) - 1) < .001);
  assert.ok(parseFloat(app.values.get('--satellite-y')) < .1);
  assert.equal(app.hero.dataset.running, 'true');
  assert.ok(Math.abs(Number(app.values.get('--comic-scale')) - 1.44) < .001);
  assert.ok(parseFloat(app.values.get('--comic-y')) < .1);
  app.dispose();
  assert.equal(app.values.size, 0); assert.equal(app.frames.size, 0); assert.equal(app.listeners.size, 0);
});

test('mobile scales stay bounded and no pause button is rendered', () => {
  const app = mount({ mobile: true }); app.scroll(500);
  assert.ok(Number(app.values.get('--brand-scale')) <= 1.14);
  assert.ok(Number(app.values.get('--prelude-scale')) >= .82);
  assert.ok(Number(app.values.get('--verse-scale')) >= .82);
  assert.ok(parseFloat(app.values.get('--satellite-y')) <= 24);
  const nodes = [];
  const visit = node => { if (!node || typeof node !== 'object') return; nodes.push(node.type); const children = node.props?.children; (Array.isArray(children) ? children : [children]).forEach(visit); };
  visit(app.tree); assert.equal(nodes.includes('button'), false);
  app.dispose();
});

test('reduced motion installs no scroll animation work', () => {
  const app = mount({ enabled: false });
  assert.equal(app.listeners.size, 0); assert.equal(app.frames.size, 0);
});
