import { mkdir, readFile, open, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { applyEvent } from './loop.mjs';

// Single-host durable store. Multi-host production needs a transactional CAS
// store. Do not use this on network filesystems or auto-delete stale locks.
export async function initializeStore(path, state) {
  await mkdir(dirname(path), { recursive: true });
  const file = await open(path, 'wx', 0o600);
  try { await file.writeFile(JSON.stringify(state, null, 2)); await file.sync(); }
  finally { await file.close(); }
}

export async function transact(path, event) {
  const lock = `${path}.lock`;
  await mkdir(lock, { mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    const previous = JSON.parse(await readFile(path, 'utf8'));
    const next = applyEvent(previous, event);
    if (next.revision === previous.revision) return next;
    const file = await open(temporary, 'wx', 0o600);
    try { await file.writeFile(JSON.stringify(next, null, 2)); await file.sync(); }
    finally { await file.close(); }
    await rename(temporary, path);
    const directory = await open(dirname(path), 'r');
    try { await directory.sync(); } finally { await directory.close(); }
    return next;
  } finally {
    await rm(temporary, { force: true });
    await rm(lock, { recursive: true });
  }
}
