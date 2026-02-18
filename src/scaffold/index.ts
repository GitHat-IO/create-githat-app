import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import type { TemplateContext } from '../utils/template-engine.js';
import { renderTemplateDirectory, getTemplatesRoot } from '../utils/template-engine.js';
import { writeJson } from './file-writer.js';
import { buildPackageJson } from './package-builder.js';
import { withSpinner, createSpinner } from '../utils/spinner.js';
import { getInstallCommand } from '../utils/package-manager.js';
import { initGit } from '../utils/git.js';
import { displaySuccess } from '../utils/ascii.js';

export async function scaffold(
  context: TemplateContext,
  options: { installDeps: boolean; initGit: boolean },
): Promise<void> {
  const root = path.resolve(process.cwd(), context.projectName);

  if (fs.existsSync(root)) {
    p.cancel(`Directory "${context.projectName}" already exists.`);
    process.exit(1);
  }

  // 1. Create project structure
  await withSpinner('Creating project structure...', async () => {
    fs.ensureDirSync(root);
    const templatesRoot = getTemplatesRoot();

    // Render framework-specific templates
    const frameworkDir = path.join(templatesRoot, context.framework);
    if (!fs.existsSync(frameworkDir)) {
      throw new Error(`Templates not found at ${frameworkDir}. This is a bug — please report it.`);
    }
    renderTemplateDirectory(frameworkDir, root, context);

    // Render base templates (githat/ folder, env, gitignore)
    const baseDir = path.join(templatesRoot, 'base');
    if (fs.existsSync(baseDir)) {
      renderTemplateDirectory(baseDir, root, context);
    }
  }, 'Project structure created');

  // 2. Write package.json (built programmatically for accuracy)
  await withSpinner('Generating package.json...', async () => {
    const pkg = buildPackageJson(context);
    writeJson(root, 'package.json', pkg);
  }, 'package.json generated');

  // 3. Git init
  if (options.initGit) {
    const gitSpinner = createSpinner('Initializing git repository...');
    gitSpinner.start();
    const ok = initGit(root);
    if (ok) {
      gitSpinner.succeed('Git repository initialized');
    } else {
      gitSpinner.warn('Could not initialize git — is git installed?');
    }
  }

  // 4. Install dependencies
  if (options.installDeps) {
    const installCmd = getInstallCommand(context.packageManager);
    await withSpinner(
      `Installing dependencies with ${context.packageManager}...`,
      async () => {
        try {
          execSync(installCmd, { cwd: root, stdio: 'ignore', timeout: 120_000 });
        } catch (err) {
          const msg = (err as Error).message || '';
          if (msg.includes('TIMEOUT')) {
            p.log.warn(`Install timed out. Run ${chalk.cyan(installCmd)} manually.`);
          } else {
            p.log.warn(`Could not auto-install. Run ${chalk.cyan(installCmd)} manually.`);
          }
        }
      },
      'Dependencies installed',
    );
  }

  p.outro('Setup complete!');
  displaySuccess(context.projectName, context.packageManager, context.framework, !!context.publishableKey);

  // Offer to star the repo
  const starPrompt = await p.confirm({
    message: 'Star GitHat on GitHub? (helps us grow!)',
    initialValue: false,
  });
  if (!p.isCancel(starPrompt) && starPrompt) {
    try {
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      execSync(`${cmd} "https://github.com/GitHat-IO/githat"`, { stdio: 'ignore' });
    } catch {
      p.log.info('Visit https://github.com/GitHat-IO/githat to star us!');
    }
  }
}
