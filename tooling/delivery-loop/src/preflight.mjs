import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile(new URL('../examples/integration.json', import.meta.url), 'utf8'));
const missing = Object.entries(config).filter(([, value]) => value === false).map(([key]) => key);
console.log(JSON.stringify({ status: 'blocked', liveExecutionEnabled: false, reason: 'No live adapter is included in this foundation', mode: config.mode, missing }, null, 2));
process.exitCode = 2;
