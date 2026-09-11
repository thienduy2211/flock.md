#!/usr/bin/env node
// Flock checker: read-only, zero dependencies. See docs/CHECKER.md.
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { labels, links, pathValue, rounds, section, statusLabel, tables, visibleLines, vocabulary } from './lib/markdown.mjs';
import { localRef, reader } from './lib/files.mjs';
import { checkHandoff } from './lib/handoff.mjs';

const clean = s => (s ?? '').replace(/[*`]/g, '').trim();
const same = (a, b) => clean(a).toLowerCase() === clean(b).toLowerCase();
const headers = ['Item|Target|Status|Docs', 'Item|Status|Docs'];

export function check(repo, options = {}) {
  const result = { lines: [], must: [], warnings: [], errors: [], handoff: { enabled: Boolean(options.handoff), issues: [], notes: [], scoped: [] }, metrics: {} };
  const { lines, must, warnings, errors, metrics } = result;
  const fs = reader(repo, errors, options.limits);
  const flock = fs.text('FLOCK.md');
  if (flock === undefined) {
    if (!errors.length) must.push('FLOCK.md is missing at the repository root (SPEC 1).');
    return result;
  }
  const opening = visibleLines(flock).slice(0, 40);
  const declaration = opening.map(l => /^>\s*flock:\s*([^\s\u00b7|,]+)(?:\s*[\u00b7|,]\s*profile:\s*([\w.-]+))?/i.exec(l)).find(Boolean);
  const profile = declaration?.[2]?.toLowerCase();
  lines.push(`FLOCK.md: ${declaration ? `flock ${declaration[1]}${profile ? ` | profile ${profile}` : ''}` : 'undeclared'}`);
  if (declaration && !/^0\.[123](?:\.\d+)?$/.test(declaration[1])) warnings.push('Unknown spec version: best-effort read, not a version rejection.');
  if (profile && !['core', 'flow'].includes(profile)) warnings.push(`Unknown profile ${profile}: core checks only.`);
  const map = section(flock, 'Docs Map', 2);
  const mapTables = tables(map ?? '').filter(t => ['Type', 'Where', 'Answers'].every(c => t.header.map(clean).includes(c)));
  if (map === undefined || !mapTables.length) must.push('Docs Map must contain a GFM table with Type, Where and Answers (SPEC 2.1).');
  const locations = [], byKind = new Map();
  for (const table of mapTables) {
    const h = table.header.map(clean);
    for (const row of table.rows) {
      if (row.length !== h.length) { warnings.push('Docs Map: malformed row; no location inferred.'); continue; }
      let kind = clean(row[h.indexOf('Type')]).toLowerCase();
      const where = pathValue(row[h.indexOf('Where')]);
      if (!kind || !where) { warnings.push('Docs Map: empty Type or Where.'); continue; }
      if (kind === 'blueprints') { kind = 'blueprint'; warnings.push('Legacy blueprints kind read as blueprint; no file renamed.'); }
      const ref = localRef('FLOCK.md', where);
      locations.push({ kind, where, ref });
      if (!ref) { warnings.push(`${kind}: outside the repository or invalid path; not followed: ${where}`); continue; }
      const list = byKind.get(kind) ?? []; list.push(ref.path); byKind.set(kind, list);
      const probe = /[*?\[\]{}]/.test(ref.path) ? ref.path.slice(0, ref.path.search(/[*?\[\]{}]/)).replace(/[^/]*$/, '').replace(/\/$/, '') : ref.path;
      if (probe && !fs.stat(probe)) warnings.push(`${kind}: ${where} does not exist yet; planned location or stale path (SHOULD, not MUST).`);
    }
  }
  metrics.kinds = locations.length;
  lines.push(`Docs Map: ${locations.length} kinds declared`);
  for (const [kind, paths] of byKind) if (new Set(paths).size !== paths.length) warnings.push(`Duplicate Docs Map location for ${kind}.`);
  const vocab = vocabulary(section(flock, 'Status Labels', 2));
  lines.push(`Status labels: ${vocab.length ? `${vocab.length} declared - ${vocab.join(' | ')}` : 'none declared'}`);
  const docs = { feature: new Map(), blueprint: new Map(), worklog: new Map() };
  for (const kind of Object.keys(docs)) {
    for (const location of byKind.get(kind) ?? []) {
      for (const path of fs.expand(location)) {
        if (docs[kind].has(path)) continue;
        const text = fs.text(path); if (text === undefined) continue;
        const parsed = labels(text);
        for (const key of parsed.duplicates) warnings.push(`${path}: duplicate label ${key}; first value retained, not silently overwritten.`);
        docs[kind].set(path, { text, labels: parsed.values, duplicates: parsed.duplicates });
      }
    }
  }
  const inconsistencies = [];
  const mismatch = (feature, file, message) => { inconsistencies.push({ feature, file, message }); warnings.push(`${file}: ${message}`); };
  const indexLink = links(section(flock, 'Index', 2))[0];
  const mappedIndex = byKind.get('index')?.[0];
  const indexRef = indexLink ? localRef('FLOCK.md', indexLink) : (mappedIndex && { path: mappedIndex });
  if (indexLink && !indexRef) warnings.push('Index declares a location outside the repository; no default substituted.');
  if (mappedIndex && indexRef && mappedIndex !== indexRef.path) mismatch('*', 'FLOCK.md', 'Index section and Docs Map index disagree; Index section is authoritative.');
  const indexText = indexRef && fs.text(indexRef.path);
  const indexTables = tables(indexText ?? '').filter(t => headers.includes(t.header.join('|')));
  lines.push(`Index: ${indexRef?.path ?? 'undeclared'} - ${indexText === undefined ? 'not found' : 'exists'}`);
  lines.push(`Machine-writable header (SPEC 3.3): ${indexTables.length ? 'present' : 'absent (opt-in)'}`);
  if (indexTables.length > 1) mismatch('*', indexRef.path, 'multiple machine-writable index tables; select one before handoff.');
  const indexRows = [];
  for (const table of indexTables) {
    for (const row of table.rows) {
      if (row.length !== table.header.length) { mismatch('*', indexRef.path, 'malformed index row.'); continue; }
      const value = Object.fromEntries(table.header.map((h, i) => [h, row[i]]));
      const refs = links(value.Docs).map(l => localRef(indexRef.path, l));
      const features = [...new Set(refs.filter(Boolean).map(r => r.path).filter(p => docs.feature.has(p)))];
      if (!features.length) mismatch('*', indexRef.path, 'index row has no readable mapped feature link.');
      for (const ref of refs) if (!ref || fs.text(ref.path) === undefined) mismatch(features[0] ?? '*', indexRef.path, 'index row contains a broken or unsafe Docs link.');
      for (const feature of features) {
        const data = docs.feature.get(feature).labels;
        if (!same(value.Status, data.Status)) mismatch(feature, indexRef.path, `Status differs from ${feature}; the feature owns Status.`);
        if (Object.hasOwn(value, 'Target') && clean(value.Target) !== clean(data.Target)) mismatch(feature, indexRef.path, `Target differs from ${feature}.`);
      }
      indexRows.push({ ...value, features });
    }
  }
  metrics.features = docs.feature.size;
  metrics.withStatus = 0; metrics.matchedStatus = 0; metrics.withTarget = 0;
  metrics.blueprintLinks = 0; metrics.worklogLinks = 0; metrics.roundLists = 0; metrics.roundsDone = 0; metrics.roundsTotal = 0;
  for (const [path, doc] of docs.feature) {
    if (doc.labels.Status) metrics.withStatus++;
    if (statusLabel(doc.labels.Status, vocab)) metrics.matchedStatus++;
    else if (doc.labels.Status && vocab.length) warnings.push(`${path}: undeclared or malformed Status: ${doc.labels.Status}`);
    if (doc.labels.Target) {
      metrics.withTarget++;
      if (/\s/.test(clean(doc.labels.Target))) warnings.push(`${path}: Target should contain the short code alone (SPEC 3.1).`);
    }
    for (const kind of ['Blueprint', 'Worklog']) {
      const link = links(doc.labels[kind])[0];
      if (!link) continue;
      const ref = localRef(path, link);
      const target = ref && docs[kind.toLowerCase()].get(ref.path);
      if (!target) { mismatch(path, path, `${kind} link is broken, outside the repository, or outside its Docs Map location.`); continue; }
      metrics[`${kind.toLowerCase()}Links`]++;
      if (target.labels.Status && !same(target.labels.Status, doc.labels.Status)) mismatch(path, ref.path, `mirrored Status differs from ${path}.`);
      const back = links(visibleLines(target.text).join('\n')).some(l => localRef(ref.path, l)?.path === path);
      if (!back && profile === 'flow') must.push(`${ref.path}: must link back to ${path} (SPEC 3).`);
      if (kind === 'Blueprint') {
        const tasks = rounds(target.text);
        if (tasks.length) { metrics.roundLists++; metrics.roundsTotal += tasks.length; metrics.roundsDone += tasks.filter(t => t.done).length; }
      }
    }
  }
  if (profile === 'flow') for (const kind of ['blueprint', 'worklog']) {
    for (const [path, doc] of docs[kind]) {
      const parents = links(visibleLines(doc.text).join('\n')).map(l => localRef(path, l)?.path).filter(p => docs.feature.has(p));
      if (!parents.length) must.push(`${path}: must link to a readable mapped feature (SPEC 3).`);
      const canonical = localRef(path, links(doc.labels.Feature)[0]);
      if (canonical && !docs.feature.has(canonical.path)) warnings.push(`${path}: Feature label is not a readable mapped feature.`);
    }
  }
  lines.push(`Feature documents: ${metrics.features}`);
  lines.push(`  Status label: ${metrics.withStatus} | matching vocabulary: ${metrics.matchedStatus}`);
  lines.push(`  Target: ${metrics.withTarget} | blueprint link resolving: ${metrics.blueprintLinks} | worklog link resolving: ${metrics.worklogLinks}`);
  lines.push(`  Round lists: ${metrics.roundLists} - ${metrics.roundsDone}/${metrics.roundsTotal} checked overall`);
  if (options.handoff) Object.assign(result.handoff, checkHandoff({ fs, flock, docs, indexRows, vocab, inconsistencies, stateLocations: byKind.get('state') ?? [], indexTableCount: indexTables.length }));
  if (options.handoff && profile !== 'flow') result.handoff.issues.push('Handoff v1 requires an explicitly declared flow profile.');
  result.must = [...new Set(must)]; result.warnings = [...new Set(warnings)];
  return result;
}

export function exitCode(result) {
  return result.errors.length ? 2 : (result.must.length || result.handoff.issues.length ? 1 : 0);
}

function main(args) {
  const usage = 'Usage: node tools/check.mjs <repo> [--handoff] [--json] | --self-test | --help';
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(usage); return 0; }
  if (args.length === 1 && args[0] === '--self-test') {
    const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
    const run = spawnSync(process.execPath, ['--test', resolve(dirname(fileURLToPath(import.meta.url)), 'check.test.mjs')], { stdio: 'inherit', env });
    if (run.error) console.error(run.error.message);
    return run.status ?? 2;
  }
  const options = {}, paths = []; let positionalOnly = false;
  for (const arg of args) {
    if (arg === '--' && !positionalOnly) positionalOnly = true;
    else if (!positionalOnly && ['--handoff', '--json'].includes(arg)) options[arg.slice(2)] = true;
    else if (!positionalOnly && arg.startsWith('-')) { console.error(`${usage}\nUnknown option: ${arg}`); return 2; }
    else paths.push(arg);
  }
  if (paths.length !== 1) { console.error(usage); return 2; }
  const result = check(paths[0], options);
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else {
    result.lines.forEach(l => console.log(l));
    for (const [label, list] of [['MUST', result.must], ['Warning', result.warnings], ['Incomplete', result.errors], ['Handoff', result.handoff.issues]]) list.forEach(l => console.log(`${label}: ${l}`));
    result.handoff.notes.forEach(l => console.log(`Note: ${l}`));
    console.log(result.errors.length ? 'Check incomplete; do not treat these counts as complete.' : `MUST checks: ${result.must.length ? 'FAILED' : 'OK'}.`);
    if (options.handoff) console.log(`Handoff checks: ${result.handoff.issues.length || result.errors.length || result.must.length ? 'FAILED' : 'OK'} (document checks only).`);
    console.log('This does not prove product correctness, approval, Git identity or complete evidence coverage.');
  }
  return exitCode(result);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
