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

function openBrowser(url: string): void {
  try {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    execSync(`${cmd} "${url}"`, { stdio: 'ignore' });
  } catch {
    // silently fail — user can open manually
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
        { value: 'paste', label: 'I have a key', hint: 'paste your pk_live_... key' },
      ],
    });

    if (p.isCancel(connectChoice)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (connectChoice === 'paste') {
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
