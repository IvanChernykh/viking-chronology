import { spawn } from 'node:child_process';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed with ${code}`));
    });
  });
}

await run('npm', ['run', 'lint']);
await run('npm', ['run', 'typecheck']);
await run('npm', ['run', 'build']);
await run('npm', ['run', 'verify:production']);
await run('npm', ['run', 'standalone']);
await run('npm', ['run', 'verify:standalone']);
