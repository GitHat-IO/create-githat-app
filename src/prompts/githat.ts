import { execSync } from 'child_process';
import * as p from '@clack/prompts';
import { validatePublishableKey } from '../utils/validate.js';
import { DEFAULT_API_URL, DASHBOARD_URL } from '../constants.js';

export type AuthFeature =
  | 'forgot-password'
  | 'email-verification'
  | 'org-management'
  | 'mcp-servers'
  | 'ai-agents';

export interface GitHatAnswers {
  publishableKey: string;
  apiUrl: string;
  authFeatures: AuthFeature[];
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

interface DeviceTokenResponse {
  error?: 'authorization_pending' | 'expired_token';
  publishable_key?: string;
  app_id?: string;
  app_name?: string;
  org_id?: string;
  org_name?: string;
}

function openBrowser(url: string): void {
  try {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    execSync(`${cmd} "${url}"`, { stdio: 'ignore' });
  } catch {
    // silently fail — user can open manually
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deviceAuthFlow(): Promise<string | null> {
  const spinner = p.spinner();

  try {
    // Step 1: Get device code
    spinner.start('Requesting device code...');
    const codeRes = await fetch(`${DEFAULT_API_URL}/auth/device/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_name: 'create-githat-app' }),
    });

    if (!codeRes.ok) {
      spinner.stop('Failed to get device code');
      return null;
    }

    const codeData: DeviceCodeResponse = await codeRes.json();
    spinner.stop('Device code generated');

    // Step 2: Show code and open browser
    p.note(
      `Code: ${codeData.user_code}\n\nOpening browser to complete sign-in...\nIf it doesn't open, visit: ${codeData.verification_uri_complete}`,
      'Authorize Device'
    );

    openBrowser(codeData.verification_uri_complete);

    // Step 3: Poll for authorization
    spinner.start('Waiting for browser authorization...');

    const expiresAt = Date.now() + codeData.expires_in * 1000;
    const pollInterval = (codeData.interval || 5) * 1000;

    while (Date.now() < expiresAt) {
      await sleep(pollInterval);

      const tokenRes = await fetch(`${DEFAULT_API_URL}/auth/device/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_code: codeData.device_code }),
      });

      const tokenData: DeviceTokenResponse = await tokenRes.json();

      if (tokenData.error === 'authorization_pending') {
        // Keep polling
        continue;
      }

      if (tokenData.error === 'expired_token') {
        spinner.stop('Device code expired');
        p.log.error('Authorization timed out. Please try again.');
        return null;
      }

      if (tokenData.publishable_key) {
        spinner.stop('Authorized!');
        p.log.success(`Connected to ${tokenData.app_name || 'your app'} (${tokenData.org_name || 'your org'})`);
        return tokenData.publishable_key;
      }

      // Unknown error
      spinner.stop('Authorization failed');
      return null;
    }

    spinner.stop('Timed out');
    p.log.error('Authorization timed out. Please try again.');
    return null;
  } catch (err) {
    spinner.stop('Connection error');
    p.log.error('Failed to connect to GitHat API. Check your internet connection.');
    return null;
  }
}

export async function promptGitHat(existingKey?: string): Promise<GitHatAnswers> {
  let publishableKey = existingKey || '';

  // If no key provided via --key flag, offer options
  if (!publishableKey) {
    const connectChoice = await p.select({
      message: 'Connect to GitHat',
      options: [
        { value: 'skip', label: 'Skip for now', hint: 'auth works on localhost — add key later' },
        { value: 'browser', label: 'Sign in with browser', hint: 'opens githat.io to authorize' },
        { value: 'paste', label: 'I have a key', hint: 'paste your pk_live_... key' },
      ],
    });

    if (p.isCancel(connectChoice)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (connectChoice === 'browser') {
      const key = await deviceAuthFlow();
      if (key) {
        publishableKey = key;
      } else {
        p.log.warn('Authorization failed. Continuing without key...');
      }
    } else if (connectChoice === 'paste') {
      const pastedKey = await p.text({
        message: 'Publishable key',
        placeholder: `pk_live_... (get one at ${DASHBOARD_URL})`,
        validate: validatePublishableKey,
      });

      if (p.isCancel(pastedKey)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }

      publishableKey = (pastedKey as string) || '';
    }
    // Skip is default — no extra logging needed, shown in final summary
  }

  const authFeatures = await p.multiselect({
    message: 'Auth features',
    options: [
      { value: 'forgot-password', label: 'Forgot password', hint: 'reset via email' },
      { value: 'email-verification', label: 'Email verification' },
      { value: 'org-management', label: 'Organizations', hint: 'teams & roles' },
      { value: 'mcp-servers', label: 'MCP servers', hint: 'Model Context Protocol' },
      { value: 'ai-agents', label: 'AI agents', hint: 'wallet-based identity' },
    ],
    initialValues: ['forgot-password'],
    required: false,
  });

  if (p.isCancel(authFeatures)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  return {
    publishableKey,
    apiUrl: DEFAULT_API_URL,
    authFeatures: (authFeatures as AuthFeature[]) || [],
  };
}
