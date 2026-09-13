// Lazy, read-only view of the Git index. No checkout, filters, hooks or product commands.
import { spawnSync } from 'node:child_process';
import { relative, resolve, sep } from 'node:path';

export function indexSnapshot(repo, limits = {}) {
  const maxBuffer = limits.maxIndexBytes ?? 16 * 1024 * 1024;
  const maxEntries = limits.maxIndexEntries ?? 100000;
  const maxBytes = limits.maxBytes ?? 2097152;
  let cwd = resolve(repo);
  function git(args, buffer = maxBuffer) {
    const run = spawnSync('git', ['--no-lazy-fetch', '--no-replace-objects', ...args], {
      cwd, encoding: null, maxBuffer: buffer,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' }
    });
    if (run.error || run.status !== 0) {
      const error = new Error(`Git ${args[0]} failed (${run.error?.code ?? run.status}); check local objects, conflicts and limits.`);
      error.code = run.error?.code ?? 'GIT_READ_FAILED';
      throw error;
    }
    return run.stdout;
  }
  cwd = git(['rev-parse', '--show-toplevel']).toString('utf8').replace(/\r?\n$/, '');
  const head = () => git(['rev-parse', '--verify', '--quiet', 'HEAD']).toString('utf8').trim();
  // A new repository has no HEAD; diff --cached still compares with an empty tree.
  let initialHead;
  try { initialHead = head(); } catch (e) {
    if (e.code !== 'GIT_READ_FAILED') throw e;
    const symbolic = git(['symbolic-ref', '-q', 'HEAD']).toString('utf8').trim();
    if (!symbolic.startsWith('refs/heads/')) throw e;
    initialHead = null;
  }
  const index = git(['ls-files', '--stage', '-z']);
  const text = index.toString('utf8');
  if (!Buffer.from(text).equals(index)) throw new Error('Index contains non-UTF-8 paths; scan is incomplete.');
  const entries = new Map(), directories = new Map([['', new Set()]]), sizes = new Map();
  const records = text.split('\0').filter(Boolean);
  if (records.length > maxEntries) throw new Error(`Index exceeds ${maxEntries} entries; scan is incomplete.`);
  for (const record of records) {
    const match = /^(\d{6}) ([0-9a-f]{40}(?:[0-9a-f]{24})?) ([0-3])\t([\s\S]+)$/.exec(record);
    if (!match || match[3] !== '0') throw new Error('Unmerged or unreadable index entry; resolve it before committing.');
    const [, mode, sha, , path] = match;
    if (entries.has(path)) throw new Error(`Duplicate index path: ${path}`);
    entries.set(path, { mode, sha });
    const parts = path.split('/');
    for (let i = 0; i < parts.length; i++) {
      const parent = parts.slice(0, i).join('/');
      if (!directories.has(parent)) directories.set(parent, new Set());
      directories.get(parent).add(parts[i]);
    }
  }
  const changed = git(['diff', '--cached', '--name-only', '--no-renames', '-z']).toString('utf8').split('\0').filter(Boolean);
  function key(abs) { return relative(cwd, abs).split(sep).join('/'); }
  function missing(path) { const error = new Error(`Not in index: ${path}`); error.code = 'ENOENT'; throw error; }
  const io = {
    realpathSync: () => cwd,
    lstatSync(abs) {
      const path = key(abs), entry = entries.get(path);
      if (!entry && !directories.has(path)) return missing(path);
      return {
        isSymbolicLink: () => entry?.mode === '120000',
        isFile: () => ['100644', '100755'].includes(entry?.mode),
        isDirectory: () => !entry && directories.has(path),
        get size() {
          if (!entry) return 0;
          if (!sizes.has(entry.sha)) {
            const size = Number(git(['cat-file', '-s', entry.sha], 1024).toString('ascii').trim());
            if (!Number.isSafeInteger(size) || size < 0) throw new Error('Invalid Git object size.');
            sizes.set(entry.sha, size);
          }
          return sizes.get(entry.sha);
        }
      };
    },
    readdirSync(abs) { const values = directories.get(key(abs)); return values ? [...values] : missing(key(abs)); },
    readFileSync(abs) {
      const entry = entries.get(key(abs));
      if (!entry || !['100644', '100755'].includes(entry.mode)) return missing(key(abs));
      return git(['cat-file', 'blob', entry.sha], maxBytes);
    }
  };
  return {
    root: cwd, io, changed, count: entries.size,
    assertUnchanged() {
      if (!git(['ls-files', '--stage', '-z']).equals(index)) throw new Error('Index changed during validation; rerun the gate.');
      let currentHead;
      try { currentHead = head(); } catch (e) { if (initialHead !== null) throw e; currentHead = null; }
      if (currentHead !== initialHead) throw new Error('HEAD changed during validation; rerun the gate.');
    }
  };
}
