#!/usr/bin/env node
// B01-I standalone public artifact builder.
//
// Emits self-contained public JavaScript (no install, no network, no embedded
// provider/server secret) into a --out directory:
//
//   node tooling/foundation/build-public.mjs --out=/tmp/SAFE_DIRECTORY
//
//   foundation.mjs   - deterministic core runtime, time import rewritten to ./time.mjs
//   time.mjs         - accepted immutable D-058 time dependency transpiled with
//                      Node's stripTypeScriptTypes
//   public-config.json - only the public URL/anon configuration
//   manifest.json    - runtimeVersion, lockfileSha256, workspaceDigest, file
//                      SHA256 entries; revision stays null before publication

import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');

function parseArgs(argv) {
  let out = null;
  for (const arg of argv) {
    if (arg.startsWith('--out=')) out = arg.slice('--out='.length);
    else if (arg === '--out') out = null; // handled by next iteration below
    else if (out === null && arg.startsWith('--out')) out = arg;
    else if (out === null && !arg.startsWith('-')) {
      // positional fallback (not used)
    }
  }
  // Support the "--out <dir>" two-token form as well.
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) out = argv[i + 1];
  }
  return out;
}

const out = parseArgs(process.argv.slice(2));
if (!out) {
  console.error('Usage: node tooling/foundation/build-public.mjs --out=/tmp/SAFE_DIRECTORY');
  process.exit(1);
}

const outDir = resolve(out);

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function listWorkspaceFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listWorkspaceFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

// Public configuration: only the public URL and anon key, never a service-role
// or database secret.
const publicConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

// --- foundation.mjs: deterministic core runtime with time import rewritten. --
const coreSource = readFileSync(
  join(root, 'packages', 'core', 'src', 'foundation', 'runtime.mjs'),
  'utf8',
);
const foundationSource = coreSource.replace(
  /from\s+['"]\.\.\/time\/index\.ts['"]/,
  "from './time.mjs'",
);
if (foundationSource === coreSource) {
  console.error('Failed to locate the time import in the foundation runtime source');
  process.exit(1);
}

// --- time.mjs: accepted immutable time dependency, types stripped. ----------
const timeSource = readFileSync(
  join(root, 'packages', 'core', 'src', 'time', 'index.ts'),
  'utf8',
);
const timeJs = stripTypeScriptTypes(timeSource);

mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'foundation.mjs'), foundationSource);
writeFileSync(join(outDir, 'time.mjs'), timeJs);
writeFileSync(join(outDir, 'public-config.json'), `${JSON.stringify(publicConfig, null, 2)}\n`);

// --- manifest.json ----------------------------------------------------------
const lockfilePath = join(root, 'pnpm-lock.yaml');
const lockfileSha256 = sha256(readFileSync(lockfilePath));

const workspaceFiles = listWorkspaceFiles(root)
  .map((full) => relative(root, full).split('\\').join('/'))
  .filter((rel) => rel !== 'pnpm-lock.yaml')
  .sort();
const workspaceLines = workspaceFiles.map((rel) => {
  const digest = sha256(readFileSync(join(root, rel)));
  return `${rel}\t${digest}`;
});
const workspaceDigest = sha256(workspaceLines.join('\n'));

const manifestFiles = ['foundation.mjs', 'time.mjs', 'public-config.json'];
const files = {};
for (const name of manifestFiles) {
  files[name] = sha256(readFileSync(join(outDir, name)));
}

const manifest = {
  runtimeVersion: '1',
  lockfileSha256,
  workspaceDigest,
  files,
  revision: null,
};

writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote public artifacts to ${outDir}`);
