// Runs the API (dotnet watch, http://localhost:5246) and the client (Vite, http://localhost:5173) in one
// terminal: `npm run dev:all` from client/. Each output line is prefixed [api] or [web]. Ctrl+C, or either
// process exiting, stops both (on Windows the whole process tree, so no Eocr.Server.exe is left running).
// Node built-ins only.
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(clientDir, '..');
const isWindows = process.platform === 'win32';

const COLORS = { api: '\x1b[35m', web: '\x1b[36m' };
const RESET = '\x1b[0m';
const useColor = process.stdout.isTTY;

const tasks = [
  {
    name: 'api',
    command: 'dotnet',
    args: ['watch', 'run', '--project', 'server', '--launch-profile', 'http', '--non-interactive'],
    cwd: repoRoot,
  },
  {
    // Vite itself (what `npm run dev` runs), started with this Node so no shell sits in between.
    name: 'web',
    command: process.execPath,
    args: [path.join(clientDir, 'node_modules', 'vite', 'bin', 'vite.js')],
    cwd: clientDir,
  },
];

const children = [];
let stopping = false;

function prefix(name) {
  const label = `[${name}]`;
  return useColor ? `${COLORS[name]}${label}${RESET} ` : `${label} `;
}

// Writes a child's output line by line with its prefix.
function pipe(stream, name, out) {
  let buffered = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buffered += chunk;
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() ?? '';
    for (const line of lines) out.write(`${prefix(name)}${line}\n`);
  });
  stream.on('end', () => {
    if (buffered) out.write(`${prefix(name)}${buffered}\n`);
  });
}

function stopAll(code) {
  if (stopping) return;
  stopping = true;
  killChildren();
  setTimeout(() => process.exit(code), 500);
}

function killChildren() {
  for (const child of children) {
    if (child.exitCode !== null || !child.pid) continue;
    if (isWindows) {
      // dotnet watch starts its own children (dotnet run, then the API); end the whole tree.
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        child.kill('SIGTERM');
      }
    }
  }
}

for (const task of tasks) {
  const child = spawn(task.command, task.args, {
    cwd: task.cwd,
    env: { ...process.env, FORCE_COLOR: useColor ? '1' : '0' },
    // No shell: each child is the real process, so its tree can be stopped (a shell in between breaks
    // the parent chain taskkill /T follows). Elsewhere a process group lets us stop the tree.
    detached: !isWindows,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  pipe(child.stdout, task.name, process.stdout);
  pipe(child.stderr, task.name, process.stderr);
  child.on('exit', (code) => {
    if (!stopping) {
      process.stdout.write(`${prefix(task.name)}exited with code ${code ?? 'null'}; stopping the other process.\n`);
      // A forced kill reports an out-of-range code; exit 1 then.
      stopAll(code !== null && code >= 0 && code <= 255 ? code : 1);
    }
  });
  child.on('error', (error) => {
    process.stderr.write(`${prefix(task.name)}could not start: ${error.message}\n`);
    stopAll(1);
  });
  children.push(child);
}

process.stdout.write('Starting the API (http://localhost:5246) and the client (http://localhost:5173). Press Ctrl+C to stop both.\n');

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
process.on('SIGHUP', () => stopAll(0));
// Last chance if this script ends some other way: never leave the API or Vite running.
process.on('exit', killChildren);
