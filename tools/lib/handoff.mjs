import { createHash } from 'node:crypto';
import { anchorSection, labels, links, pathValue, rounds, section, sectionCount, statusLabel, tables, validDate, vocabulary } from './markdown.mjs';
import { localRef } from './files.mjs';

const present = value => Boolean(value?.trim() && !/^(?:<[^>]+>|[-\u2014]|todo|tbd)$/i.test(value.trim()));
const timestamp = s => /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(s ?? '') && validDate(s.slice(0, 10)) && !Number.isNaN(Date.parse(s));

/** Optional Handoff v1 checks. No Git, product commands, models or network. */
export function checkHandoff(context) {
  const { fs, flock, docs, indexRows, vocab, inconsistencies, stateLocations = [], indexTableCount = 0 } = context;
  const issues = [], notes = [], scoped = new Set();
  const fail = (file, message) => issues.push(`${file}: ${message}`);
  const config = section(flock, 'Handoff', 2);
  const configLabels = labels(config ?? '');
  const settings = configLabels.values;
  for (const name of configLabels.duplicates) fail('FLOCK.md', `duplicate Handoff label ${name}.`);
  const doneLabels = vocabulary(settings['Done labels'] ?? '');
  if (sectionCount(flock, 'Handoff', 2) !== 1) fail('FLOCK.md', 'declare exactly one Handoff section before using --handoff.');
  if (indexTableCount !== 1) fail('FLOCK.md', 'handoff requires exactly one machine-writable index table, even when idle.');
  if (!doneLabels.length || doneLabels.some(l => !vocab.includes(l))) fail('FLOCK.md', 'Done labels must explicitly name declared Status Labels.');
  const stateRef = localRef('FLOCK.md', links(settings.State)[0]);
  const stateText = stateRef && fs.text(stateRef.path);
  if (stateRef && (stateLocations.length !== 1 || !stateLocations.includes(stateRef.path))) fail('FLOCK.md', 'State must match exactly one state row in Docs Map.');
  if (!stateText) fail('FLOCK.md', 'State must link to one readable in-repository file.');
  const stateLabels = labels(stateText ?? '');
  for (const name of stateLabels.duplicates) fail(stateRef?.path ?? 'STATE', `duplicate label ${name}.`);
  const state = stateLabels.values;
  const activeRef = state.Feature === 'none' ? undefined : localRef(stateRef?.path ?? 'STATE.md', links(state.Feature)[0]);
  if (activeRef) scoped.add(activeRef.path);
  for (const [path, doc] of docs.feature) {
    if (doc.labels.Handoff === 'v1') scoped.add(path);
    else if (doc.labels.Handoff) fail(path, 'unrecognized Handoff version; not assessed or rewritten as v1.');
  }
  const stateFile = stateRef?.path ?? 'STATE';
  if (stateText) {
    for (const name of ['Updated', 'Branch', 'Base commit', 'Code ref', 'Workspace']) if (!present(state[name])) fail(stateFile, `missing ${name}.`);
    if (!/^(?:[0-9a-f]{40}(?:[0-9a-f]{24})?|uncommitted|not-a-git-repo)$/i.test(state['Base commit'] ?? '')) fail(stateFile, 'Base commit must be an observed full SHA, uncommitted or not-a-git-repo.');
    if (!timestamp(state.Updated)) fail(stateFile, 'Updated must be a real ISO timestamp including timezone.');
    if (!['same-worktree', 'shared-snapshot'].includes(state.Workspace)) fail(stateFile, 'Workspace must be same-worktree or shared-snapshot.');
    for (const name of ['Checkpoint', 'Next action', 'Working tree', 'Blockers', 'Guardrails']) {
      if (sectionCount(stateText, name, 2) !== 1 || !present(section(stateText, name, 2))) fail(stateFile, `missing, duplicate or empty ${name} section.`);
    }
    if (state.Workspace === 'shared-snapshot') {
      const snapshot = localRef(stateFile, links(state.Snapshot)[0]);
      const cleanCommit = /^commit:[0-9a-f]{40}(?:[0-9a-f]{24})?$/i.test(state.Snapshot ?? '');
      if (!cleanCommit && (!snapshot || !fs.stat(snapshot.path)?.isFile())) fail(stateFile, 'shared-snapshot needs an existing Snapshot link or commit:<full SHA>.');
      notes.push('Shared snapshot availability and Git identity still require receiver verification.');
    }
    if (!activeRef && state.Feature !== 'none') fail(stateFile, 'Feature must link to current implementation work, or explicitly be none.');
    if (activeRef) {
      const feature = docs.feature.get(activeRef.path);
      if (!feature) fail(stateFile, 'active Feature is not readable through the Docs Map.');
      else {
        for (const kind of ['Blueprint', 'Worklog']) {
          const actual = localRef(stateFile, links(state[kind])[0]);
          const expected = localRef(activeRef.path, links(feature.labels[kind])[0]);
          if (!actual || !expected || actual.path !== expected.path || !docs[kind.toLowerCase()].has(actual.path)) fail(stateFile, `${kind} must match the active feature's readable link.`);
        }
        const bp = localRef(activeRef.path, links(feature.labels.Blueprint)[0]);
        const tasks = rounds(docs.blueprint.get(bp?.path)?.text ?? '');
        if (!present(state.Round) || !tasks.some(t => t.id === state.Round)) fail(stateFile, 'Round must identify a task in the active blueprint Rounds.');
        if (tasks.find(t => t.id === state.Round)?.done) notes.push(`${stateFile}: current round is closed; Next action must explain review or selection of the next round.`);
        const evidence = verifyEvidence(stateFile, state.Verification, false, true);
        if (evidence && evidence.values['Code ref'] !== state['Code ref']) fail(stateFile, 'Verification Code ref differs from STATE Code ref.');
        const wl = localRef(activeRef.path, links(feature.labels.Worklog)[0]);
        if (evidence && evidence.path !== wl?.path) fail(stateFile, 'Verification must point into the active worklog.');
      }
    }
  }
  for (const path of scoped) {
    const feature = docs.feature.get(path);
    if (!feature) continue;
    for (const name of feature.duplicates) fail(path, `duplicate label ${name}.`);
    const status = statusLabel(feature.labels.Status, vocab);
    if (!status) fail(path, 'Status must match a declared label, optionally followed by a real date.');
    for (const item of inconsistencies.filter(i => i.feature === path || i.feature === '*')) fail(item.file, item.message);
    const rows = indexRows.filter(row => row.features.includes(path));
    if (rows.length !== 1) fail(path, `expected exactly one index row, found ${rows.length}.`);
    const bp = localRef(path, links(feature.labels.Blueprint)[0]);
    const wl = localRef(path, links(feature.labels.Worklog)[0]);
    for (const [kind, ref] of [['blueprint', bp], ['worklog', wl]]) {
      const target = ref && docs[kind].get(ref.path);
      if (!target) continue;
      for (const name of target.duplicates) fail(ref.path, `duplicate label ${name}.`);
      if (localRef(ref.path, links(target.labels.Feature)[0])?.path !== path) fail(ref.path, 'Feature label must identify its canonical parent feature.');
      if (kind === 'blueprint') {
        const tasks = rounds(target.text);
        if (sectionCount(target.text, 'Rounds') > 1 || new Set(tasks.map(t => t.id)).size !== tasks.length) fail(ref.path, 'Rounds heading and round IDs must be unique.');
      }
    }
    const complete = status && doneLabels.includes(status);
    if (complete) {
      if (!bp || !docs.blueprint.has(bp.path) || !wl || !docs.worklog.has(wl.path)) fail(path, 'completed work needs readable Blueprint and Worklog links.');
      const tasks = rounds(docs.blueprint.get(bp?.path)?.text ?? '');
      if (!tasks.length || tasks.some(t => !t.done)) fail(path, 'completed work needs a nonempty, fully checked Rounds list.');
      const current = path === activeRef?.path;
      const evidence = verifyEvidence(path, feature.labels.Evidence, true, current);
      if (evidence && evidence.path !== wl?.path) fail(path, 'Evidence must point into this feature\'s worklog.');
      const latest = localRef(stateFile, links(state.Verification)[0]);
      if (current && evidence && (evidence.path !== latest?.path || evidence.anchor !== latest?.anchor)) fail(path, 'Active Done must use the same evidence as the latest State Verification.');
      if (!current) notes.push(`${path}: historical completion record checked structurally only; select this feature in State to revalidate current files. Do not rewrite history to match later code.`);
    }
  }
  return { issues: [...new Set(issues)], notes: [...new Set(notes)], scoped: [...scoped] };

  function verifyEvidence(from, value, complete, current) {
    const ref = localRef(from, links(value)[0]);
    const text = ref && fs.text(ref.path);
    const body = text && ref.anchor && anchorSection(text, ref.anchor);
    if (!body) { fail(from, 'verification needs a readable worklog link with an existing, explicit heading anchor.'); return undefined; }
    const parsed = labels(body), v = parsed.values;
    for (const key of parsed.duplicates) fail(ref.path, `duplicate verification label ${key}.`);
    for (const key of ['Result', 'Checks', 'Checked', 'Code ref', 'Acceptance']) if (!present(v[key])) fail(ref.path, `verification missing ${key}.`);
    if (!['PASS', 'FAIL', 'NOT-RUN'].includes(v.Result)) fail(ref.path, 'Result must be PASS, FAIL or NOT-RUN.');
    if (!timestamp(v.Checked)) fail(ref.path, 'Checked must be a real ISO timestamp including timezone.');
    if (!['PASS', 'PENDING', 'NOT-REQUIRED'].includes(v.Acceptance)) fail(ref.path, 'Acceptance must be PASS, PENDING or NOT-REQUIRED.');
    if (complete && (v.Result !== 'PASS' || !['PASS', 'NOT-REQUIRED'].includes(v.Acceptance))) fail(from, 'Done requires PASS and no pending acceptance.');
    const fingerprints = tables(body).filter(t => t.header.join('|') === 'File|SHA256');
    if (fingerprints.length > 1) fail(ref.path, 'ambiguous fingerprint tables.');
    const rows = fingerprints[0]?.rows ?? [];
    if ((complete || v.Result === 'PASS') && !rows.length) fail(ref.path, 'PASS needs File/SHA256 fingerprints of the relevant verified files.');
    const seen = new Set();
    for (const row of rows) {
      const file = localRef(ref.path, pathValue(row[0]));
      const expected = row[1]?.replace(/`/g, '').trim();
      if (row.length !== 2 || !file || !/^[0-9a-f]{64}$/i.test(expected ?? '')) { fail(ref.path, 'invalid File/SHA256 row.'); continue; }
      if (seen.has(file.path)) fail(ref.path, `duplicate fingerprint: ${file.path}.`);
      seen.add(file.path);
      if (file.path === ref.path) { fail(ref.path, 'evidence must not fingerprint itself.'); continue; }
      if (!current) continue;
      const bytes = fs.bytes(file.path);
      if (!bytes || createHash('sha256').update(bytes).digest('hex') !== expected.toLowerCase()) fail(ref.path, `stale or missing evidence file: ${file.path}; rerun relevant checks, never just refresh the hash.`);
    }
    return { path: ref.path, anchor: ref.anchor, values: v };
  }
}
