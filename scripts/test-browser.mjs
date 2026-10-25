/** A real Chromium browser, installed from npm (works on the restricted Arena host). */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { browserRuntime } from './browser-runtime.mjs';

const unitOnly = process.argv.slice(2).includes("unit.spec.ts");
const runtime = unitOnly ? undefined : await browserRuntime();
const result = spawnSync(process.execPath, [path.resolve('node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, TEST_UNIT_ONLY: unitOnly ? "1" : "", BROWSER_EXECUTABLE_PATH: runtime?.executablePath, BROWSER_ARGS_JSON: JSON.stringify(runtime?.args), LD_LIBRARY_PATH: runtime?.env.LD_LIBRARY_PATH },
});
process.exit(result.status ?? 1);
