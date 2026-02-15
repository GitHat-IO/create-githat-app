import { execSync } from 'child_process';
import * as p from '@clack/prompts';
import { validatePublishableKey, validateApiUrl } from '../utils/validate.js';
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

  // If no key provided via --key flag, offer guided browser flow
  if (!publishableKey) {
    const connectChoice = await p.select({
      message: 'Connect to GitHat',
      options: [
        { value: 'browser', label: 'Sign in with browser', hint: 'opens githat.io — recommended' },
        { value: 'paste', label: 'I have a key', hint: 'paste your pk_live_... key' },
        { value: 'skip', label: 'Skip for now', hint: 'add key to .env.local later' },
      ],
    });

    if (p.isCancel(connectChoice)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (connectChoice === 'browser') {
      p.log.step('Opening githat.io in your browser...');
      openBrowser(`https://githat.io/sign-up`);
      p.log.info('Sign up (or sign in), then go to Dashboard → Apps to copy your publishable key.');

      const pastedKey = await p.text({
        message: 'Paste your publishable key',
        placeholder: 'pk_live_...',
        validate: validatePublishableKey,
      });

      if (p.isCancel(pastedKey)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }

      publishableKey = (pastedKey as string) || '';
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
    // 'skip' → publishableKey stays empty
  }

  const answers = await p.group(
    {
      apiUrl: () =>
        p.text({
          message: 'GitHat API URL',
          placeholder: DEFAULT_API_URL,
          initialValue: DEFAULT_API_URL,
          validate: validateApiUrl,
        }),
      authFeatures: () =>
        p.multiselect({
          message: 'Auth features',
          options: [
            { value: 'forgot-password', label: 'Forgot password / Reset password', hint: 'recommended' },
            { value: 'email-verification', label: 'Email verification', hint: 'recommended' },
            { value: 'org-management', label: 'Organization management', hint: 'teams, invites, roles' },
            { value: 'mcp-servers', label: 'MCP server registration', hint: 'tool verification' },
            { value: 'ai-agents', label: 'AI agent wallet auth', hint: 'Ethereum signatures' },
          ],
          initialValues: ['forgot-password', 'email-verification'],
          required: false,
        }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.');
        process.exit(0);
      },
    },
  );

  return {
    publishableKey,
    apiUrl: (answers.apiUrl as string) || DEFAULT_API_URL,
    authFeatures: (answers.authFeatures as AuthFeature[]) || [],
  };
}
