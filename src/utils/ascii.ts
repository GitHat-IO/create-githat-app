import figlet from 'figlet';
import gradient from 'gradient-string';
import chalk from 'chalk';
import { VERSION, BRAND_COLORS } from '../constants.js';

const githatGradient = gradient([...BRAND_COLORS]);

export function displayBanner(): void {
  const ascii = figlet.textSync('GitHat', {
    font: 'Slant',
    horizontalLayout: 'default',
  });

  console.log('');
  console.log(githatGradient(ascii));
  console.log(chalk.dim('  Identity for humans, agents, and MCP servers'));
  console.log(chalk.dim(`  v${VERSION} | githat.io`));
  console.log('');
}

export function displaySuccess(
  projectName: string,
  packageManager: string,
  framework: string,
): void {
  const devCmd = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
  const port = framework === 'react-vite' ? '5173' : '3000';

  console.log('');
  console.log(githatGradient('  ✦ Your GitHat app is ready!'));
  console.log('');
  console.log(`  ${chalk.cyan('cd')} ${projectName}`);
  console.log(`  ${chalk.cyan(devCmd)}`);
  console.log('');
  console.log(chalk.dim(`  → http://localhost:${port}`));
  console.log('');
  console.log(chalk.dim('  Routes:'));
  console.log(chalk.dim('  /sign-in       Sign in'));
  console.log(chalk.dim('  /sign-up       Create account'));
  console.log(chalk.dim('  /dashboard     Protected dashboard'));
  console.log('');
  console.log(chalk.dim('  Docs: https://githat.io/docs/sdk'));
  console.log('');
}
