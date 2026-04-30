import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { displayBanner } from './utils/ascii.js';
import { runPrompts, answersToContext } from './prompts/index.js';
import { scaffold } from './scaffold/index.js';
import { VERSION } from './constants.js';
import { skillsCommand } from './commands/skills/index.js';

const program = new Command();

program
  .name('githat')
  .description('GitHat CLI - Scaffold apps and manage skills')
  .version(VERSION);

// Default create command (backwards compatible with create-githat-app)
program
  .command('create [project-name]', { isDefault: true })
  .description('Scaffold a new GitHat app')
  .option('--key <key>', 'GitHat publishable key (pk_live_...)')
  .option('--ts', 'Use TypeScript (default)')
  .option('--js', 'Use JavaScript')
  // Six template flags. Pick one — they're mutually exclusive.
  // See TEMPLATES.md in this repo for the full lineup and what each demonstrates.
  .option('--plain',       'Smallest scaffold: auth + a homepage. No dashboard.')
  .option('--saas',        'B2B starter: orgs, teams, RBAC, subscription billing.')
  .option('--marketplace', 'Multi-vendor commerce: anonymous-first browsing, Sebastn Connect.')
  .option('--agent',       'Web4 wallet-bound autonomous agent + MCP server registration.')
  .option('--content',     'Paywalled posts, newsletter, one-time purchases via Sebastn.')
  .option('--dashboard',   'Admin UI over your existing database, auth-gated.')
  .option('--fullstack', 'Create fullstack project (Turborepo)')
  .option('--backend <framework>', 'Backend framework (hono, express, fastify)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (projectName: string | undefined, opts: {
    key?: string;
    ts?: boolean;
    js?: boolean;
    plain?: boolean;
    saas?: boolean;
    marketplace?: boolean;
    agent?: boolean;
    content?: boolean;
    dashboard?: boolean;
    fullstack?: boolean;
    backend?: string;
    yes?: boolean;
  }) => {
    try {
      displayBanner();

      // Make the two onboarding paths obvious BEFORE we start asking questions.
      // Some developers will go to the dashboard first then run the CLI;
      // others will run the CLI first and want to be guided into sign-up.
      // Either order is fine — this preamble shows them both options.
      if (!opts.yes && !opts.key) {
        p.note(
          [
            chalk.bold('Two ways to connect this app to GitHat:'),
            '',
            `  ${chalk.cyan('1.')} ${chalk.bold('Already signed up?')}  Pass your key:`,
            `       ${chalk.dim('npx create-githat-app my-app --key pk_live_...')}`,
            `       Get the key at ${chalk.cyan('https://githat.io/dashboard/apps')}`,
            '',
            `  ${chalk.cyan('2.')} ${chalk.bold("Don't have an account yet?")}  Press Enter`,
            `       below — we'll open a browser, you sign up in 30s,`,
            `       and the key is stitched in for you.`,
            '',
            chalk.dim('Either path lands you in the same place.'),
          ].join('\n'),
          'First time with GitHat?'
        );
      }

      const typescript = opts.js ? false : opts.ts ? true : undefined;

      // --yes flag requires project name
      if (opts.yes && !projectName) {
        p.cancel(chalk.red('Project name is required when using --yes flag'));
        process.exit(1);
      }

      // Resolve the chosen template flag (last-wins if multiple are set).
      const template =
        opts.marketplace ? 'marketplace' :
        opts.agent       ? 'agent' :
        opts.saas        ? 'saas' :
        opts.content     ? 'content' :
        opts.dashboard   ? 'dashboard' :
        opts.plain       ? 'plain' :
        undefined;

      const answers = await runPrompts({
        initialName: projectName,
        publishableKey: opts.key,
        typescript,
        yes: opts.yes,
        template,
        fullstack: opts.fullstack,
        backendFramework: opts.backend as 'hono' | 'express' | 'fastify' | undefined,
      });

      const context = answersToContext(answers);

      await scaffold(context, {
        installDeps: answers.installDeps,
        initGit: answers.initGit,
        skipPrompts: opts.yes,
      });
    } catch (err) {
      p.cancel(chalk.red((err as Error).message || 'Something went wrong.'));
      process.exit(1);
    }
  });

// Skills marketplace commands
program.addCommand(skillsCommand);

program.parse();
