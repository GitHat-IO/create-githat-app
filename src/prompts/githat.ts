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

export async function promptGitHat(existingKey?: string): Promise<GitHatAnswers> {
  const answers = await p.group(
    {
      publishableKey: () =>
        existingKey
          ? Promise.resolve(existingKey)
          : p.text({
              message: 'GitHat publishable key',
              placeholder: `pk_live_... (get one at ${DASHBOARD_URL})`,
              initialValue: '',
              validate: validatePublishableKey,
            }),
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
    publishableKey: (answers.publishableKey as string) || '',
    apiUrl: (answers.apiUrl as string) || DEFAULT_API_URL,
    authFeatures: (answers.authFeatures as AuthFeature[]) || [],
  };
}
