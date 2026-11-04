// T2 isolated server: never reuse another worktree's page/server.
const path = require('node:path');
const base = require('../../playwright.config.js');
const root = path.resolve(__dirname, '../..');
module.exports = {
  ...base, testDir: path.join(root, 'tests/e2e'), workers: 2,
  use: { ...base.use, baseURL: 'http://localhost:18976' },
  webServer: { command: 'node tests/e2e/serve.js 18976', cwd: root, port: 18976, reuseExistingServer: false }
};
