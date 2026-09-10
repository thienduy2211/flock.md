import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { resolve, join, posix } from 'node:path';

export function localRef(from, raw) {
  if (typeof raw !== 'string') return undefined;
  const [pathname, ...fragment] = raw.replaceAll('\\', '/').split('#');
  let path, anchor;
  try { path = decodeURIComponent(pathname).replaceAll('\\', '/'); anchor = decodeURIComponent(fragment.join('#')); } catch { return undefined; }
  if (!path || /[\x00-\x1f\x7f:]/.test(path) || path.startsWith('/')) return undefined;
  const rel = posix.normalize(posix.join(posix.dirname(from), path));
  if (rel === '..' || rel.startsWith('../') || rel === '.' || rel.split('/').some(p => ['.git', 'node_modules', '.venv'].includes(p))) return undefined;
  return { path: rel.replace(/\/$/, ''), anchor };
}

function globRegex(glob) {
  if (/[\[\]{}()!]/.test(glob)) throw new Error('unsupported glob syntax; supported: *, ** and ?');
  let pattern = '^';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      if ((i && glob[i - 1] !== '/') || (glob[i + 2] && glob[i + 2] !== '/')) throw new Error('** must be a complete path segment');
      if (glob[i + 2] === '/') { pattern += '(?:.*/)?'; i += 2; }
      else { pattern += '.*'; i++; }
    } else if (c === '*') pattern += '[^/]*';
    else if (c === '?') pattern += '[^/]';
    else pattern += c.replace(/[.+^$|\\]/g, '\\$&');
  }
  return new RegExp(`${pattern}$`);
}

export function reader(root, errors, limits = {}) {
  const maxFiles = limits.maxFiles ?? 10000, maxBytes = limits.maxBytes ?? 2097152;
  const maxEntries = limits.maxEntries ?? 50000, maxDepth = limits.maxDepth ?? 64;
  let base;
  try { base = realpathSync(resolve(root)); } catch (e) { errors.push(`Repository unavailable: ${e.code ?? e.message}`); }
  const report = msg => { if (!errors.includes(msg)) errors.push(msg); };
  const cache = new Map();
  function stat(rel) {
    if (!base) return undefined;
    const ref = localRef('FLOCK.md', rel);
    if (!ref || ref.path !== rel.replace(/\/$/, '')) { report(`Unsafe path: ${rel}`); return undefined; }
    let abs = base, s;
    try {
      for (const part of rel.split('/')) {
        abs = join(abs, part); s = lstatSync(abs);
        if (s.isSymbolicLink()) { report(`Symlink not followed: ${rel}`); return undefined; }
      }
      return s;
    } catch (e) { if (e.code !== 'ENOENT' && e.code !== 'ENOTDIR') report(`Cannot inspect ${rel}: ${e.code ?? e.message}`); }
  }
  function bytes(rel) {
    if (cache.has(rel)) return cache.get(rel);
    const s = stat(rel); if (!s) return undefined;
    if (!s.isFile()) { report(`Not a regular file: ${rel}`); return undefined; }
    if (s.size > maxBytes) { report(`File exceeds ${maxBytes} bytes: ${rel}`); return undefined; }
    try { const value = readFileSync(join(base, rel)); cache.set(rel, value); return value; }
    catch (e) { report(`Cannot read ${rel}: ${e.code ?? e.message}`); return undefined; }
  }
  function text(rel) { return bytes(rel)?.toString('utf8'); }
  function expand(location) {
    const ref = localRef('FLOCK.md', location);
    if (!ref) { report(`Unsafe documentation location: ${location}`); return []; }
    const rel = ref.path, hasGlob = /[*?\[\]{}]/.test(rel);
    let matcher;
    try { matcher = hasGlob ? globRegex(rel) : undefined; }
    catch (e) { report(`${location}: ${e.message}`); return []; }
    const prefix = hasGlob ? rel.slice(0, rel.search(/[*?\[\]{}]/)) : rel;
    const start = hasGlob ? posix.dirname(`${prefix}x`) : rel;
    const found = []; let visited = 0, limited = false;
    function walk(p, depth) {
      if (limited) return;
      if (depth > maxDepth || ++visited > maxEntries) { report(`Scan incomplete (depth/entry limit): ${location}`); limited = true; return; }
      const s = p === '.' ? { isDirectory: () => true, isFile: () => false } : stat(p);
      if (!s) return;
      if (s.isFile()) {
        if (/\.md$/i.test(p) && (!matcher || matcher.test(p))) {
          if (found.length >= maxFiles) { report(`Scan incomplete (file limit ${maxFiles}): ${location}`); limited = true; }
          else found.push(p);
        }
        return;
      }
      if (!s.isDirectory()) { report(`Unsupported filesystem entry: ${p}`); return; }
      let entries;
      try { entries = readdirSync(p === '.' ? base : join(base, p)).sort(); }
      catch (e) { report(`Cannot list ${p}: ${e.code ?? e.message}`); return; }
      for (const entry of entries) {
        if (['.git', 'node_modules', '.venv'].includes(entry)) continue;
        walk(p === '.' ? entry : `${p}/${entry}`, depth + 1);
      }
    }
    walk(start, 0); return found.sort();
  }
  return { stat, bytes, text, expand };
}
