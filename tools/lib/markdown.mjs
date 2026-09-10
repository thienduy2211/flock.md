// Small shared reader for Flock's documented Markdown surface, not full GFM.
// Fenced examples, HTML comments and indented code never declare project state.
export function visibleLines(text) {
  let fence, comment = false;
  return text.replace(/^\uFEFF/, '').split(/\r?\n/).map(raw => {
    if (fence) {
      const end = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(raw);
      if (end && end[1][0] === fence[0] && end[1].length >= fence.length) fence = undefined;
      return '';
    }
    let line = '', rest = raw;
    while (rest) {
      if (comment) {
        const end = rest.indexOf('-->');
        if (end < 0) break;
        rest = rest.slice(end + 3); comment = false;
      } else {
        const start = rest.indexOf('<!--');
        if (start < 0) { line += rest; break; }
        line += rest.slice(0, start); rest = rest.slice(start + 4); comment = true;
      }
    }
    const start = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (start && !(start[1][0] === '`' && start[2].includes('`'))) {
      fence = start[1]; return '';
    }
    return /^( {4}|\t)/.test(line) ? '' : line;
  });
}

export function heading(line) {
  const m = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
  return m && { level: m[1].length, name: m[2].trim() };
}

export function section(text, name, level) {
  const lines = visibleLines(text);
  let start = -1, depth;
  for (let i = 0; i < lines.length; i++) {
    const h = heading(lines[i]);
    if (!h) continue;
    if (start >= 0 && h.level <= depth) return lines.slice(start, i).join('\n');
    if (start < 0 && h.name.toLowerCase() === name.toLowerCase() && (!level || h.level === level)) {
      start = i + 1; depth = h.level;
    }
  }
  return start < 0 ? undefined : lines.slice(start).join('\n');
}

export function sectionCount(text, name, level) {
  return visibleLines(text).filter(line => {
    const h = heading(line);
    return h && h.name.toLowerCase() === name.toLowerCase() && (!level || h.level === level);
  }).length;
}

function cells(line) {
  if (!line.trim().startsWith('|')) return undefined;
  const s = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|\s*$/, '');
  const out = []; let cell = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cell += '|'; i++; }
    else if (s[i] === '|') { out.push(cell.trim()); cell = ''; }
    else cell += s[i];
  }
  out.push(cell.trim()); return out;
}

export function tables(text) {
  const lines = visibleLines(text), result = [];
  for (let i = 0; i + 1 < lines.length; i++) {
    const header = cells(lines[i]), divider = cells(lines[i + 1]);
    if (!header || !divider || header.length !== divider.length || !divider.every(c => /^:?-+:?$/.test(c))) continue;
    const rows = []; i += 2;
    for (; i < lines.length; i++) {
      const row = cells(lines[i]); if (!row) break; rows.push(row);
    }
    result.push({ header, rows }); i--;
  }
  return result;
}

export function labels(text) {
  const out = {}, duplicates = [];
  for (const line of visibleLines(text)) {
    const h = heading(line);
    if (h && h.level >= 2) break;
    const m = /^\s*\*\*([^*]+):\*\*\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    if (Object.hasOwn(out, m[1])) duplicates.push(m[1]);
    else Object.defineProperty(out, m[1], { value: m[2], enumerable: true });
  }
  return { values: out, duplicates };
}

export function links(text = '') {
  // Simple inline links, including angle-wrapped paths with spaces. No fetching.
  return [...text.matchAll(/\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^()\n]+?))\s*\)/g)]
    .map(m => m[1] ?? m[2]);
}

export function pathValue(text = '') {
  return links(text)[0] ?? text.trim().replace(/^`(.*)`$/, '$1');
}

export function vocabulary(text = '') {
  const t = tables(text)[0];
  const src = t ? t.rows.map(r => r[0]).join('\n') : visibleLines(text).join('\n');
  return [...new Set([...src.matchAll(/`([^`\n]+)`/g)].map(m => m[1].replace(/\s*<[^>]+>/g, '').trim()).filter(Boolean))];
}

export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value); return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === value;
}

export function statusLabel(value, vocab) {
  const normalized = (value ?? '').replace(/[*`]/g, '').trim().toLowerCase();
  return [...vocab].sort((a, b) => b.length - a.length).find(label => {
    const v = label.toLowerCase();
    return normalized === v || (normalized.startsWith(`${v} `) && validDate(normalized.slice(v.length + 1)));
  });
}

export function rounds(text) {
  const body = section(text, 'Rounds');
  if (body === undefined) return [];
  return [...body.matchAll(/^\s*[-*+]\s+\[([ xX])\]\s+([^\n]+)$/gm)]
    .map(m => ({ done: m[1] !== ' ', title: m[2], id: m[2].split(/\s/)[0] }));
}

export function anchorSection(text, anchor) {
  // Prefer simple, explicitly named ASCII headings for stable evidence links.
  const lines = visibleLines(text), used = new Map();
  for (let i = 0; i < lines.length; i++) {
    const h = heading(lines[i]); if (!h) continue;
    const base = h.name.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/\s/g, '-');
    const n = used.get(base) ?? 0; used.set(base, n + 1);
    if ((n ? `${base}-${n}` : base) !== anchor) continue;
    let end = i + 1;
    while (end < lines.length && !(heading(lines[end])?.level <= h.level)) end++;
    return lines.slice(i + 1, end).join('\n');
  }
  return undefined;
}
