const path = require('node:path');
const base = require('../../playwright.config.js');
module.exports = { ...base, testDir: path.resolve(__dirname, '../../tests/e2e'), use: { ...base.use, baseURL: 'http://localhost:18876' }, webServer: { command: 'node tests/e2e/serve.js 18876', cwd: path.resolve(__dirname, '../..'), port: 18876, reuseExistingServer: false } };
