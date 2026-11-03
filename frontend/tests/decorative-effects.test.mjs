import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real effect code with deterministic browser event/RAF doubles.
// These tests do not claim to simulate native touch scrolling or GPU rendering.
function mountTrails({ enabled = true, fine = true, lowPower = false } = {}) {
  const listeners = new Map();
  const frames = new Map();
  let cleanup, effect, now = 100, nextFrame = 0, draws = 0, strokes = [], path = {};
  const context = {
    clearRect() {}, setTransform() {},
    beginPath() { path = {}; },
    moveTo(x, y) { path.start = { x, y }; },
    quadraticCurveTo(cx, cy, x, y) { path.control = { x: cx, y: cy }; path.end = { x, y }; },
    stroke() { draws++; strokes.push({ ...path, color: this.strokeStyle, width: this.lineWidth, alpha: this.globalAlpha }); },
  };
  const canvas = { getContext: () => context };
  const eventTarget = {
    addEventListener(name, fn, options) { listeners.set(name, { fn, options }); },
    removeEventListener(name) { listeners.delete(name); },
  };
  const document = { ...eventTarget, hidden: false };
  const exports = {};
  const environment = {
    exports, document, window: eventTarget,
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 3,
    navigator: { hardwareConcurrency: lowPower ? 2 : 8 },
    performance: { now: () => now },
    matchMedia: () => ({ matches: fine }),
    requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    require(name) {
      if (name === 'react') return { useRef: () => ({ current: canvas }), useEffect: fn => { effect = fn; } };
      if (name === 'react/jsx-runtime') return { jsx() {} };
      if (name === './useMotion') return { useMotion: () => ({ enabled }) };
      throw new Error(name);
    },
  };
  const source = readFileSync(new URL('../components/effects/PointerTrails.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(compiled, environment);
  exports.PointerTrails(); cleanup = effect();
  const target = { closest: selector => selector === '[data-trail-area]' ? {} : null };
  return {
    listeners, frames, document, canvas,
    strokes: () => strokes,
    resize(w, h) { environment.innerWidth = w; environment.innerHeight = h; listeners.get('resize')?.fn(); },
    tick(ms = 40) { now += ms; const pending = [...frames.values()]; frames.clear(); draws = 0; strokes = []; pending.forEach(fn => fn(now)); return draws; },
    fire(name, data = {}) { listeners.get(name)?.fn({ target, ...data }); },
    dispose() { cleanup?.(); },
  };
}
const touch = (x = 20, id = 1) => ({ clientX: x, clientY: 200, identifier: id });

test('reduced motion installs no animation loop or gesture listeners', () => {
  const app = mountTrails({ enabled: false });
  assert.equal(app.listeners.size, 0);
  assert.equal(app.frames.size, 0);
});

test('touch scroll listeners are passive; marker ink fades after cancellation and RAF becomes idle', () => {
  const app = mountTrails();
  for (const name of ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointermove']) {
    assert.equal(app.listeners.get(name).options.passive, true);
  }
  app.fire('touchstart', { touches: [touch()] });
  assert.ok(app.tick() > 0);
  app.fire('touchmove', { touches: [touch(60)] });
  app.fire('touchcancel');
  assert.ok(app.tick() > 0, 'existing particles fade after cancellation');
  app.tick(1000);
  assert.equal(app.frames.size, 0);
  app.fire('touchmove', { touches: [touch(100)] });
  assert.equal(app.frames.size, 0, 'cancelled gestures cannot resume emitting');
  app.dispose();
});

test('pinch stops emission; touch input does not produce mouse duplicates on hybrid devices', () => {
  const app = mountTrails();
  app.fire('touchstart', { touches: [touch()] });
  app.tick();
  app.fire('pointermove', { pointerType: 'mouse', clientX: 120, clientY: 200 });
  assert.equal(app.tick(), 3);
  app.fire('touchstart', { touches: [touch(), touch(80, 2)] });
  app.tick(1000);
  app.fire('touchmove', { touches: [touch(160)] });
  assert.equal(app.frames.size, 0);
  app.dispose();
});

test('desktop requires a fine hovering mouse and avoids interactive controls', () => {
  const coarse = mountTrails({ fine: false });
  coarse.fire('pointermove', { pointerType: 'mouse', clientX: 40, clientY: 40 });
  assert.equal(coarse.frames.size, 0);
  coarse.dispose();
  const app = mountTrails();
  app.fire('pointermove', { pointerType: 'touch', clientX: 40, clientY: 40 });
  assert.equal(app.frames.size, 0);
  app.fire('pointermove', { pointerType: 'mouse', clientX: 40, clientY: 40, target: { closest: () => ({}) } });
  assert.equal(app.frames.size, 0);
  app.fire('pointermove', { pointerType: 'mouse', clientX: 40, clientY: 40 });
  assert.equal(app.tick(), 3);
  app.dispose();
});

test('stroke budgets, DPR limits, hidden-page suspension and unmount cleanup', () => {
  const app = mountTrails({ lowPower: true });
  assert.equal(app.canvas.width, 390, 'low-power canvas is limited to DPR 1');
  app.fire('touchstart', { touches: [touch()] });
  for (let i = 0; i < 40; i++) {
    app.fire('touchmove', { touches: [touch(i * 20)] });
    assert.ok(app.tick(34) <= 48 * 3);
  }
  app.document.hidden = true;
  app.fire('visibilitychange');
  assert.equal(app.frames.size, 0);
  app.fire('touchstart', { touches: [touch()] });
  assert.equal(app.frames.size, 0);
  app.dispose();
  assert.equal(app.listeners.size, 0);
  assert.equal(app.frames.size, 0);
});

test('marker color changes with distance and strokes do not bridge controls', () => {
  const app = mountTrails();
  for (let i = 0; i < 30; i++) {
    app.fire('pointermove', { pointerType: 'mouse', clientX: 20 + i * 18, clientY: 200 });
    app.tick(20);
  }
  const ink = app.strokes().filter(s => s.color.startsWith('rgb'));
  assert.ok(new Set(ink.map(s => s.color)).size > 10);
  assert.ok(ink.every(s => s.width > 0 && s.width < 12 && s.alpha <= .72));
  app.fire('pointermove', { pointerType: 'mouse', clientX: 560, clientY: 200, target: { closest: () => ({}) } });
  app.fire('pointermove', { pointerType: 'mouse', clientX: 750, clientY: 200 });
  app.tick();
  assert.ok(app.strokes().every(s => Math.hypot(s.end.x - s.start.x, s.end.y - s.start.y) < 50));
  app.fire('pointerout', { pointerType: 'mouse', relatedTarget: null });
  app.tick(1000);
  assert.equal(app.frames.size, 0);
  app.dispose();
});

test('mobile browser bar resize preserves active touch; separate gestures never join', () => {
  const app = mountTrails();
  app.fire('touchstart', { touches: [touch()] });
  app.tick();
  app.resize(390, 760);
  app.fire('touchmove', { touches: [touch(60)] });
  assert.ok(app.tick() > 3);
  app.fire('touchend');
  app.fire('pointermove', { pointerType: 'mouse', clientX: 250, clientY: 200 });
  app.tick(1000);
  assert.equal(app.frames.size, 0, 'compatibility mouse input after touchend is suppressed');
  app.fire('touchstart', { touches: [touch(300, 2)] });
  app.tick();
  assert.ok(app.strokes().every(s => Math.abs(s.end.x - s.start.x) < 50));
  app.dispose();
});
