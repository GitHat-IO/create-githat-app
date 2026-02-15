import figlet from 'figlet';
import gradient from 'gradient-string';
import chalk from 'chalk';
import { VERSION, BRAND_COLORS } from '../constants.js';

const brand = gradient([...BRAND_COLORS]);
const violet = chalk.hex('#a78bfa');
const dim = chalk.dim;

function visibleLength(str: string): number {
  return str.replace(/\u001b\[.*?m/g, '').length;
}

function drawBox(lines: string[]): void {
  const W = 54;
  const hr = '─'.repeat(W);
  console.log(dim(`  ╭${hr}╮`));
  console.log(dim(`  │${' '.repeat(W)}│`));
  for (const line of lines) {
    const pad = W - 2 - visibleLength(line);
    console.log(dim('  │') + `  ${line}${' '.repeat(Math.max(0, pad))}` + dim('│'));
  }
  console.log(dim(`  │${' '.repeat(W)}│`));
  console.log(dim(`  ╰${hr}╯`));
}

export function displayBanner(): void {
  const ascii = figlet.textSync('GitHat', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
  });

  console.log('');
  console.log(brand(ascii));

  drawBox([
    `${violet('✦')}  Create a new GitHat app`,
    '',
    dim('The developer platform'),
    dim('for humans, agents & MCP servers'),
    '',
    dim(`v${VERSION}  ·  githat.io`),
  ]);

  console.log('');
}

export function sectionHeader(title: string): void {
  const line = '─'.repeat(Math.max(1, 38 - title.length));
  console.log('');
  console.log(dim(`  ─── ${title} ${line}`));
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

  drawBox([
    `${violet('✦')}  Your GitHat app is ready!`,
    '',
    `${violet('$')} cd ${projectName}`,
    `${violet('$')} ${devCmd}`,
    '',
    dim(`→ http://localhost:${port}`),
    '',
    chalk.bold('Routes'),
    `${violet('/sign-in')}       Sign in`,
    `${violet('/sign-up')}       Create account`,
    `${violet('/dashboard')}     Protected dashboard`,
    '',
    dim('Docs → https://githat.io/docs/sdk'),
  ]);

  console.log('');
}
