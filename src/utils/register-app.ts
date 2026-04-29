/**
 * Auto-registers the new app on the user's GitHat tenant via POST /apps.
 *
 * Reads credentials from ~/.githat/credentials.json.
 * If the file is absent, prints a helpful message and returns null.
 * If the API call fails, logs the error and returns null — the scaffold
 * is always written regardless.
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { DEFAULT_API_URL } from '../constants.js';

const CREDENTIALS_PATH = path.join(os.homedir(), '.githat', 'credentials.json');

interface Credentials {
  token: string;
}

interface RegisteredApp {
  publishable_key: string;
  id: string;
  name: string;
}

/**
 * Reads the saved GitHat session token.
 * Returns null (and prints a hint) if the credentials file doesn't exist.
 */
function readToken(): string | null {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return null;
  }
  try {
    const creds: Credentials = fs.readJsonSync(CREDENTIALS_PATH);
    return creds.token || null;
  } catch {
    return null;
  }
}

/**
 * Registers the app with the GitHat API.
 *
 * @param appName  The scaffolded project name.
 * @param projectRoot  Absolute path to the project root (to write .env.local).
 * @returns The publishable_key if registration succeeded, null otherwise.
 */
export async function registerApp(appName: string, projectRoot: string): Promise<string | null> {
  const token = readToken();

  if (!token) {
    p.log.warn(
      chalk.yellow(
        `GitHat credentials not found at ${CREDENTIALS_PATH}.\n` +
        `  Run ${chalk.cyan('githat login')} then re-run scaffolding, or paste your publishable key\n` +
        `  from ${chalk.cyan('https://githat.io/dashboard/apps')} into .env.local manually.`,
      ),
    );
    return null;
  }

  p.log.step('Registering app on GitHat...');

  let registeredApp: RegisteredApp;

  try {
    const response = await fetch(`${DEFAULT_API_URL}/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: appName,
        redirect_uris: ['http://localhost:3000/callback'],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${body}`);
    }

    registeredApp = (await response.json()) as RegisteredApp;
  } catch (err) {
    p.log.warn(
      chalk.yellow(
        `Could not register app on GitHat: ${(err as Error).message}\n` +
        `  The scaffold was written successfully. Once the API is available,\n` +
        `  register manually at ${chalk.cyan('https://githat.io/dashboard/apps')} and paste the\n` +
        `  publishable key into ${chalk.cyan('.env.local')}.`,
      ),
    );
    return null;
  }

  const publishableKey = registeredApp.publishable_key;

  // Write the key into .env.local
  const envLocalPath = path.join(projectRoot, '.env.local');
  try {
    let envContent = fs.existsSync(envLocalPath)
      ? fs.readFileSync(envLocalPath, 'utf-8')
      : '';

    const keyLine = `NEXT_PUBLIC_GITHAT_PUBLISHABLE_KEY=${publishableKey}`;

    if (envContent.includes('NEXT_PUBLIC_GITHAT_PUBLISHABLE_KEY=')) {
      // Replace placeholder
      envContent = envContent.replace(
        /NEXT_PUBLIC_GITHAT_PUBLISHABLE_KEY=.*/,
        keyLine,
      );
    } else {
      envContent += (envContent.endsWith('\n') || envContent === '' ? '' : '\n') + keyLine + '\n';
    }

    fs.ensureDirSync(path.dirname(envLocalPath));
    fs.writeFileSync(envLocalPath, envContent, 'utf-8');
  } catch (err) {
    p.log.warn(chalk.yellow(`Registered app but could not write .env.local: ${(err as Error).message}`));
  }

  p.log.success(chalk.green(`Registered "${appName}" on GitHat. Publishable key written to .env.local.`));
  return publishableKey;
}
