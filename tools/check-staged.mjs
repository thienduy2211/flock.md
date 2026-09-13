#!/usr/bin/env node
// Explicit Git-aware gate. The normal check.mjs command remains filesystem-only.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { check, exitCode } from './check.mjs';
import { reader, localRef } from './lib/files.mjs';
import { labels, links, section } from './lib/markdown.mjs';
import { indexSnapshot } from './lib/git-index.mjs';

export function checkStaged(repo, options = {}) {
  let result;
  try {
    const snapshot = indexSnapshot(repo, options.limits);
    const probeErrors = [];
    const fs = reader(snapshot.root, probeErrors, options.limits, snapshot.io);
    const flock = fs.text('FLOCK.md');
    const handoff = flock !== undefined && section(flock, 'Handoff', 2) !== undefined;
    result = check(snapshot.root, { handoff, limits: options.limits, fileSystem: snapshot.io });
    result.errors.push(...probeErrors.filter(error => !result.errors.includes(error)));
    result.staged = { files: snapshot.changed.length, indexed: snapshot.count, issues: [] };
    if (handoff) {
      const settings = labels(section(flock, 'Handoff', 2)).values;
      const stateRef = localRef('FLOCK.md', links(settings.State)[0]);
      const state = stateRef && fs.text(stateRef.path);
      if (state && !/^none$/i.test((labels(state).values.Feature ?? '').trim())) {
        result.staged.state = stateRef.path;
        if (snapshot.changed.length && !snapshot.changed.includes(stateRef.path)) {
          result.staged.issues.push(`Active work requires the declared checkpoint ${stateRef.path} in the staged changes. Update it honestly and stage only the intended files.`);
        }
      }
    }
    for (const error of probeErrors) if (!result.errors.includes(error)) result.errors.push(error);
    snapshot.assertUnchanged();
  } catch (error) {
    result ??= { lines: [], must: [], warnings: [], errors: [], handoff: { enabled: false, issues: [], notes: [], scoped: [] }, metrics: {} };
    result.errors.push(error.message);
    result.staged ??= { issues: [] };
  }
  return result;
}

export function stagedExitCode(result) {
  return exitCode(result) || (result.staged.issues.length ? 1 : 0);
}

function main(args) {
  const usage = 'Usage: node tools/check-staged.mjs [repo] [--json] | --help';
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(usage); return 0; }
  const paths = []; let json = false, positionalOnly = false;
  for (const arg of args) {
    if (arg === '--' && !positionalOnly) positionalOnly = true;
    else if (arg === '--json' && !positionalOnly) json = true;
    else if (!positionalOnly && arg.startsWith('-')) { console.error(usage); return 2; }
    else paths.push(arg);
  }
  if (paths.length > 1) { console.error(usage); return 2; }
  const result = checkStaged(paths[0] ?? '.');
  if (json) console.log(JSON.stringify(result, null, 2));
  else {
    for (const [name, values] of [['MUST', result.must], ['Warning', result.warnings], ['Incomplete', result.errors], ['Handoff', result.handoff.issues], ['Staged', result.staged.issues]]) {
      values.forEach(value => console.log(`${name}: ${value}`));
    }
    result.handoff.notes.forEach(value => console.log(`Note: ${value}`));
    console.log(`Staged document checks: ${stagedExitCode(result) ? 'FAILED' : 'OK'} (${result.handoff.enabled ? 'Core/Flow + Handoff' : 'Core/Flow'}).`);
    console.log('No product tests were run. A pass does not prove truth, approval or complete evidence coverage.');
  }
  return stagedExitCode(result);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
