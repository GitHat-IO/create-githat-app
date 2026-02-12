const prompts = require('prompts');
const { scaffold } = require('./scaffold');

// ANSI color helpers (zero dependencies)
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function banner() {
  console.log(`
  ${c.magenta}┌─────────────────────────────────────┐${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.bold}${c.magenta}◆${c.reset} ${c.bold}create-githat-app${c.reset}              ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.dim}Identity for your application${c.reset}     ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}└─────────────────────────────────────┘${c.reset}
`);
}

async function cli(args) {
  let projectName = args[0];

  if (args.includes('--help') || args.includes('-h')) {
    banner();
    console.log(`  ${c.bold}Usage:${c.reset} create-githat-app ${c.cyan}[project-name]${c.reset}

  Scaffold a new app with GitHat identity built in.

  ${c.bold}Options:${c.reset}
    ${c.cyan}--help, -h${c.reset}    Show this help message
    ${c.cyan}--ts${c.reset}          Use TypeScript (default)
    ${c.cyan}--js${c.reset}          Use JavaScript
    ${c.cyan}--key <key>${c.reset}   GitHat publishable key (pk_live_...)

  ${c.bold}Examples:${c.reset}
    ${c.dim}$${c.reset} npx create-githat-app my-app
    ${c.dim}$${c.reset} npx create-githat-app my-app --js
    ${c.dim}$${c.reset} npx create-githat-app my-app --key pk_live_abc123

  ${c.dim}Docs: https://githat.io/docs/cli${c.reset}
`);
    return;
  }

  banner();

  if (!projectName) {
    const res = await prompts({
      type: 'text',
      name: 'name',
      message: `${c.bold}Project name${c.reset}`,
      initial: 'my-githat-app',
    });
    if (!res.name) process.exit(0);
    projectName = res.name;
  }

  const useTS = args.includes('--js') ? false : true;
  const keyIdx = args.indexOf('--key');
  let publishableKey = keyIdx !== -1 ? args[keyIdx + 1] : '';

  const responses = await prompts([
    {
      type: 'select',
      name: 'framework',
      message: `${c.bold}Framework${c.reset}`,
      choices: [
        { title: `Next.js ${c.dim}(App Router)${c.reset}`, value: 'nextjs' },
        { title: `React ${c.dim}(Vite)${c.reset}`, value: 'react' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'pm',
      message: `${c.bold}Package manager${c.reset}`,
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'yarn', value: 'yarn' },
      ],
      initial: 0,
    },
    {
      type: publishableKey ? null : 'text',
      name: 'key',
      message: `${c.bold}Publishable key${c.reset} ${c.dim}(optional — get one at githat.io/dashboard/apps)${c.reset}`,
    },
    {
      type: 'confirm',
      name: 'dashboard',
      message: `${c.bold}Include example dashboard?${c.reset}`,
      initial: true,
    },
  ]);

  if (responses.framework === undefined) process.exit(0);
  if (!publishableKey) publishableKey = responses.key || '';

  await scaffold({
    projectName,
    framework: responses.framework || 'nextjs',
    typescript: useTS,
    packageManager: responses.pm || 'npm',
    publishableKey,
    includeDashboard: responses.dashboard !== false,
  });
}

module.exports = { cli };
