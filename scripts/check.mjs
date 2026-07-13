import { spawn } from 'node:child_process';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} failed with ${code}`)));
  });
}

await Promise.all([
  run('npm', ['run', 'lint']),
  run('npm', ['run', 'typecheck']),
  run('npm', ['run', 'build']),
]);
await run('npm', ['run', 'verify:production']);
await run('npm', ['run', 'standalone']);
await run('npm', ['run', 'verify:standalone']);
