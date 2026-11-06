const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

// Execute the actual main entry with platform/OS inputs and Electron lifecycle
// doubles: the window callback runs only after the test signals readiness.
function startup(platform, arch, release, args = []) {
  const calls = [];
  const argv = ['Discourse Analysis', ...args];
  let readyCallback;
  let ready = false;
  const app = {
    name: 'Discourse Analysis',
    disableHardwareAcceleration() {
      assert.equal(ready, false);
      calls.push('disableHardwareAcceleration');
    },
    whenReady() {
      calls.push('whenReady');
      return { then(callback) { readyCallback = callback; } };
    },
    on() {},
  };
  class BrowserWindow {
    constructor() {
      assert.equal(ready, true);
      calls.push('BrowserWindow');
      this.webContents = { on() {}, openDevTools() {} };
    }
    loadFile() {}
    on() {}
  }
  const electron = { app, BrowserWindow, ipcMain: { on() {}, handle() {} }, Menu: {} };
  vm.runInNewContext(source, {
    __dirname: path.join(__dirname, '..'),
    process: { platform, arch, argv },
    require(id) {
      if (id === 'electron') return electron;
      if (id === 'os') return { release: () => release };
      if (id === 'path') return path;
      if (id === 'fs') return { readFileSync() { throw new Error('No .env in test'); } };
      if (id === './js/i18n/native-menu.cjs') return { createNativeMenuTranslator: () => () => {} };
      throw new Error('Unexpected module: ' + id);
    },
  }, { filename: 'main.js' });
  return { calls, argv, ready() { ready = true; readyCallback(); } };
}

for (const [platform, arch, release, disabled] of [
  ['darwin', 'x64', '21.6.0', true],
  ['darwin', 'x64', '21.0.0', true],
  ['darwin', 'x64', '22.6.0', false],
  ['darwin', 'x64', '23.6.0', false],
  ['darwin', 'x64', '24.6.0', false],
  ['darwin', 'x64', '20.6.0', false],
  ['darwin', 'arm64', '21.6.0', false],
  ['win32', 'x64', '21.6.0', false],
  ['win32', 'x64', '10.0.19045', false],
  ['linux', 'x64', '21.6.0', false],
]) {
  test(`startup GPU fallback: ${platform}/${arch}/${release} => ${disabled}`, () => {
    const s = startup(platform, arch, release);
    assert.deepEqual(s.calls, disabled ? ['disableHardwareAcceleration', 'whenReady'] : ['whenReady']);
    s.ready();
    assert.deepEqual(s.calls, disabled
      ? ['disableHardwareAcceleration', 'whenReady', 'BrowserWindow']
      : ['whenReady', 'BrowserWindow']);
  });
}

for (const release of ['', 'unknown', '21bad.6.0', '21.bad.0', '21..0', ' 21.6.0', '21.6.0\n']) {
  test(`startup GPU fallback: malformed OS release ${JSON.stringify(release)} is false without crashing`, () => {
    assert.deepEqual(startup('darwin', 'x64', release).calls, ['whenReady']);
  });
}

for (const release of ['21.6.0', '22.6.0']) {
  test(`startup GPU fallback: preserves explicit --disable-gpu on Darwin ${release}`, () => {
    const s = startup('darwin', 'x64', release, ['--disable-gpu']);
    assert.deepEqual(s.argv, ['Discourse Analysis', '--disable-gpu']);
    s.ready();
    assert.equal(s.argv.includes('--disable-gpu'), true);
  });
}
