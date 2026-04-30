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

function getBoxWidth(): number {
  const termWidth = process.stdout.columns || 80;
  // Box width: terminal width minus indent (2) minus borders (2) minus padding (2)
  // Clamp between 40 and 70 for readability
  return Math.min(70, Math.max(40, termWidth - 6));
}

function drawBox(lines: string[]): void {
  const W = getBoxWidth();
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
  const W = getBoxWidth();
  const lineLen = Math.max(1, W - 6 - title.length);
  console.log('');
  console.log(dim(`  ─── ${title} ${'─'.repeat(lineLen)}`));
  console.log('');
}

/**
 * Three-line block shown in the success banner when no publishable
 * key was provided at scaffold time. The dev's next move is to open
 * `.env.local` and paste their key — never the terminal.
 */
function keyNextSteps(): string[] {
  return [
    chalk.bold('Next:') + ' add your GitHat key',
    `  1. Open ${violet('.env.local')}`,
    `  2. Paste your key from ${violet('https://githat.io/dashboard/apps')}`,
    `  3. Run ${violet('npm run dev')} again`,
    dim('   (.env.local is gitignored — your key never gets committed.)'),
    '',
  ];
}

export function displaySuccess(
  projectName: string,
  packageManager: string,
  framework: string,
  hasPublishableKey: boolean = true,
  isFullstack: boolean = false,
): void {
  const devCmd = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
  const port = framework === 'react-vite' ? '5173' : '3000';

  console.log('');

  if (isFullstack) {
    drawBox([
      `${violet('✦')}  Your GitHat fullstack app is ready!`,
      '',
      `${violet('$')} cd ${projectName}`,
      `${violet('$')} ${devCmd}`,
      '',
      dim(`→ Web: http://localhost:3000`),
      dim(`→ API: http://localhost:3001`),
      '',
      chalk.bold('Structure'),
      `${violet('apps/web')}       Next.js frontend`,
      `${violet('apps/api')}       API backend`,
      `${violet('packages/')}      Shared code`,
      '',
      ...(hasPublishableKey ? [] : keyNextSteps()),
      dim('Docs → https://githat.io/docs/sdk'),
    ]);
  } else {
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
      ...(hasPublishableKey ? [] : keyNextSteps()),
      dim('Docs → https://githat.io/docs/sdk'),
    ]);
  }

  console.log('');
}
