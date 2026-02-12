import { execSync } from 'child_process';

export function initGit(cwd: string): boolean {
  try {
    execSync('git init', { cwd, stdio: 'ignore' });
    execSync('git add -A', { cwd, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from create-githat-app"', {
      cwd,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}
