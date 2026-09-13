import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync, chmodSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { check, exitCode } from './check.mjs';
import { checkStaged, stagedExitCode } from './check-staged.mjs';
import { indexSnapshot } from './lib/git-index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const gate = join(here, 'check-staged.mjs');
const hook = resolve(here, '../spec/templates/pre-commit');
const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
const core = '# FLOCK.md\n> flock: 0.3 | profile: core\n## Docs Map\n| Type | Where | Answers |\n|---|---|---|\n| guide | README.md | Start here |\n';
function fixture(t, handoff = false, stateName = 'STATE.md') {
  const root = mkdtempSync(join(tmpdir(), 'flock-staged-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, value) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), value); };
  const read = path => readFileSync(join(root, path), 'utf8');
  const edit = (path, a, b) => write(path, read(path).replace(a, b));
  const git = (args, input) => {
    const r = spawnSync('git', args, { cwd: root, env, input, encoding: 'utf8' });
    assert.equal(r.status, 0, `${args.join(' ')}: ${r.stderr ?? r.error}`); return r.stdout;
  };
  git(['init', '-q', '-b', 'main', '--template=']);
  for (const [key, value] of [['user.name', 'Flock test'], ['user.email', 'test@example.invalid'], ['core.autocrlf', 'false'], ['commit.gpgSign', 'false'], ['core.hooksPath', '.git/hooks']]) git(['config', key, value]);
  if (handoff) {
    cpSync(resolve(here, '../examples/handoff'), root, { recursive: true });
    if (stateName !== 'STATE.md') {
      renameSync(join(root, 'docs/STATE.md'), join(root, 'docs', stateName));
      edit('FLOCK.md', '| state | docs/STATE.md |', `| state | docs/${stateName} |`);
      edit('FLOCK.md', '**State:** [docs/STATE.md](docs/STATE.md)', `**State:** [Checkpoint](docs/${encodeURIComponent(stateName)})`);
    }
  } else { write('FLOCK.md', core); write('README.md', '# Test project\n'); }
  git(['add', '--', '.']); git(['commit', '-qm', 'fixture baseline']);
  const state = `docs/${stateName}`;
  return {
    root, write, read, edit, git, state,
    stage: (...paths) => git(['add', '--', ...paths]),
    checkpoint: () => edit(state, '2026-09-10T02:17:21+00:00', '2026-09-13T14:00:00+00:00'),
    run: options => checkStaged(root, options)
  };
}
const ok = r => assert.equal(stagedExitCode(r), 0, JSON.stringify(r));
const contains = (values, text) => values.some(value => value.includes(text));

test('staged core does not create or require handoff records', t => {
  const f = fixture(t); f.write('README.md', '# Changed\n'); f.stage('README.md');
  const r = f.run(); ok(r); assert.equal(r.handoff.enabled, false);
});
test('new repository without HEAD is supported', t => {
  const f = fixture(t); f.git(['checkout', '--orphan', 'new-history']); ok(f.run());
});
test('detached HEAD is supported', t => { const f = fixture(t); f.git(['checkout', '--detach']); ok(f.run()); });
test('working-tree repair cannot hide a broken staged document', t => {
  const f = fixture(t); f.write('FLOCK.md', '# Broken\n'); f.stage('FLOCK.md'); f.write('FLOCK.md', core);
  assert.equal(exitCode(check(f.root)), 0); assert.equal(stagedExitCode(f.run()), 1);
});
test('unstaged and untracked work does not pollute a valid staged check', t => {
  const f = fixture(t); f.write('README.md', '# Changed\n'); f.stage('README.md');
  f.write('FLOCK.md', '# Unstaged broken work\n'); f.write('PRIVATE-NOTE.txt', 'unrelated draft'); ok(f.run());
});
test('an untracked checkpoint cannot satisfy staged handoff', t => {
  const f = fixture(t, true); f.git(['rm', '--cached', '--', f.state]);
  assert.equal(exitCode(check(f.root, { handoff: true })), 0); assert.notEqual(stagedExitCode(f.run()), 0);
});
test('active handoff blocks a commit without its exact checkpoint', t => {
  const f = fixture(t, true); f.write('note.txt', 'new work'); f.stage('note.txt');
  const r = f.run(); assert.equal(stagedExitCode(r), 1); assert(contains(r.staged.issues, 'declared checkpoint'));
});
test('a checkpoint-like filename cannot satisfy the exact staged path', t => {
  const f = fixture(t, true); f.write(`${f.state}.backup`, 'not the checkpoint'); f.stage(`${f.state}.backup`);
  assert.equal(stagedExitCode(f.run()), 1);
});
test('custom checkpoint paths with spaces come from FLOCK, not a filename guess', t => {
  const f = fixture(t, true, 'Work state.md'); f.checkpoint(); f.stage(f.state);
  const r = f.run(); ok(r); assert.equal(r.staged.state, f.state);
});
test('honest FAIL and a staged checkpoint allow unfinished work to be committed', t => {
  const f = fixture(t, true); f.checkpoint(); f.stage(f.state); ok(f.run());
});
test('idle handoff does not force checkpoint churn for unrelated work', t => {
  const f = fixture(t, true); f.edit(f.state, '**Feature:** [Product row import](feature/IMPORT.md)', '**Feature:** none');
  f.stage(f.state); f.git(['commit', '-qm', 'idle']); f.write('note.txt', 'small change'); f.stage('note.txt'); ok(f.run());
});
test('hashes are verified against staged bytes, not uncommitted code', t => {
  const f = fixture(t, true), source = 'src/import.mjs';
  const before = f.read(source); f.write(source, before + '// unstaged change\n');
  const oldHash = createHash('sha256').update(before).digest('hex');
  const newHash = createHash('sha256').update(f.read(source)).digest('hex');
  f.edit('docs/worklog/IMPORT.md', oldHash, newHash); f.checkpoint();
  f.stage('docs/worklog/IMPORT.md', f.state);
  assert.equal(exitCode(check(f.root, { handoff: true })), 0);
  const r = f.run(); assert.equal(stagedExitCode(r), 1); assert(contains(r.handoff.issues, 'stale or missing'));
});
test('staged bytes remain valid despite unrelated unfinished source edits', t => {
  const f = fixture(t, true); f.checkpoint(); f.stage(f.state); f.write('src/import.mjs', '// unfinished next step\n'); ok(f.run());
});
test('the staged gate preserves both the index bytes and working files', t => {
  const f = fixture(t, true); f.checkpoint(); f.stage(f.state);
  const before = readFileSync(join(f.root, '.git/index')); const state = f.read(f.state);
  ok(f.run()); assert.deepEqual(readFileSync(join(f.root, '.git/index')), before); assert.equal(f.read(f.state), state);
});
test('staged gate never executes a command recorded in a worklog', t => {
  const f = fixture(t, true); f.edit('docs/worklog/IMPORT.md', '**Checks:** node --test', '**Checks:** MUST_NOT_EXECUTE --test');
  f.checkpoint(); f.stage('docs/worklog/IMPORT.md', f.state); ok(f.run());
});
test('staged symlinks are rejected without following filesystem targets', t => {
  const f = fixture(t); const sha = f.git(['hash-object', '-w', '--stdin'], '/outside/secret\n').trim();
  f.git(['update-index', '--add', '--cacheinfo', `120000,${sha},FLOCK.md`]); assert.equal(stagedExitCode(f.run()), 2);
});
test('missing local Git objects are incomplete, never a successful empty scan', t => {
  const f = fixture(t); f.git(['update-index', '--cacheinfo', `100644,${'f'.repeat(40)},FLOCK.md`]);
  assert.equal(stagedExitCode(f.run()), 2);
});
test('index and per-file size bounds fail explicitly', t => {
  const f = fixture(t); assert.equal(stagedExitCode(f.run({ limits: { maxIndexEntries: 1 } })), 2);
  assert.equal(stagedExitCode(f.run({ limits: { maxIndexBytes: 1 } })), 2);
  assert.equal(stagedExitCode(f.run({ limits: { maxBytes: 8 } })), 2);
});
test('merge conflicts fail rather than selecting an arbitrary stage', t => {
  const f = fixture(t); const sha = f.git(['rev-parse', ':FLOCK.md']).trim();
  f.git(['update-index', '--index-info'], `0 ${'0'.repeat(40)}\tFLOCK.md\n100644 ${sha} 1\tFLOCK.md\n100644 ${sha} 2\tFLOCK.md\n`);
  assert.equal(stagedExitCode(f.run()), 2);
});
test('a changed index invalidates a captured snapshot', t => {
  const f = fixture(t), snapshot = indexSnapshot(f.root); f.write('new.txt', 'new'); f.stage('new.txt');
  assert.throws(() => snapshot.assertUnchanged(), /Index changed/);
});
test('a changed HEAD invalidates a captured snapshot', t => {
  const f = fixture(t), snapshot = indexSnapshot(f.root); f.git(['commit', '--allow-empty', '-qm', 'new head']);
  assert.throws(() => snapshot.assertUnchanged(), /HEAD changed/);
});
test('staged CLI has useful help, strict usage and parseable JSON', t => {
  const f = fixture(t);
  const cli = args => spawnSync(process.execPath, [gate, ...args], { env, encoding: 'utf8' });
  assert.equal(cli(['--help']).status, 0); assert.equal(cli(['--unknown']).status, 2);
  assert.equal(cli([f.root, f.root]).status, 2);
  const r = cli([f.root, '--json']); assert.equal(r.status, 0); assert.equal(JSON.parse(r.stdout).staged.files, 0);
});
test('importing the staged gate has no CLI or Git side effects', () => {
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', `import ${JSON.stringify(new URL('./check-staged.mjs', import.meta.url).href)}`], { env, encoding: 'utf8' });
  assert.equal(r.status, 0); assert.equal(r.stdout + r.stderr, '');
});
test('non-repositories fail explicitly', t => {
  const f = fixture(t); rmSync(join(f.root, '.git'), { recursive: true }); assert.equal(stagedExitCode(f.run()), 2);
});
function installHook(f) { cpSync(hook, join(f.root, '.git/hooks/pre-commit')); chmodSync(join(f.root, '.git/hooks/pre-commit'), 0o755); }
test('real git commit is blocked if the staged gate is missing', t => {
  const f = fixture(t); installHook(f); f.write('README.md', '# New\n'); f.stage('README.md');
  const head = f.git(['rev-parse', 'HEAD']);
  const r = spawnSync('git', ['commit', '-qm', 'must fail'], { cwd: f.root, env: { ...env, FLOCK_GATE: join(f.root, 'missing.mjs') }, encoding: 'utf8' });
  assert.notEqual(r.status, 0); assert.match(r.stderr, /commit blocked/); assert.equal(f.git(['rev-parse', 'HEAD']), head);
});
test('real git commit is blocked when active checkpoint is not staged', t => {
  const f = fixture(t, true); installHook(f); f.write('note.txt', 'new work'); f.stage('note.txt');
  const r = spawnSync('git', ['commit', '-qm', 'must fail'], { cwd: f.root, env: { ...env, FLOCK_GATE: gate.replaceAll('\\', '/') }, encoding: 'utf8' });
  assert.notEqual(r.status, 0); assert.match(r.stdout + r.stderr, /declared checkpoint/);
});
test('real git commit succeeds with a valid staged checkpoint and gate path', t => {
  const f = fixture(t, true); installHook(f); f.checkpoint(); f.stage(f.state);
  const r = spawnSync('git', ['commit', '-qm', 'checked'], { cwd: f.root, env: { ...env, FLOCK_GATE: gate.replaceAll('\\', '/') }, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
test('POSIX hook fails closed when Node is absent', { skip: process.platform === 'win32' }, t => {
  const f = fixture(t); const r = spawnSync('/bin/sh', [hook], { cwd: f.root, env: { ...env, PATH: f.root }, encoding: 'utf8' });
  assert.equal(r.status, 1); assert.match(r.stderr, /Node.js is required/);
});
