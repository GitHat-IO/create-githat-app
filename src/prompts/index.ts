import * as p from '@clack/prompts';
import { promptProject, type ProjectAnswers } from './project.js';
import { promptFramework, type FrameworkAnswers } from './framework.js';
import { promptGitHat, type GitHatAnswers } from './githat.js';
import { promptFeatures, type FeatureAnswers } from './features.js';
import { promptFinalize, type FinalizeAnswers } from './finalize.js';
import { sectionHeader } from '../utils/ascii.js';
import { detectPackageManager } from '../utils/package-manager.js';
import { DEFAULT_API_URL } from '../constants.js';
import type { TemplateContext } from '../utils/template-engine.js';

export interface AllAnswers
  extends ProjectAnswers,
    FrameworkAnswers,
    GitHatAnswers,
    FeatureAnswers,
    FinalizeAnswers {}

function toDisplayName(projectName: string): string {
  return projectName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDefaults(projectName: string, publishableKey?: string, typescript?: boolean): AllAnswers {
  const displayName = toDisplayName(projectName);
  return {
    projectName,
    businessName: displayName,
    description: `${displayName} — Built with GitHat`,
    framework: 'nextjs',
    typescript: typescript ?? true,
    packageManager: detectPackageManager(),
    publishableKey: publishableKey || '',
    apiUrl: DEFAULT_API_URL,
    authFeatures: ['forgot-password'],
    databaseChoice: 'none',
    useTailwind: true,
    includeDashboard: true,
    includeGithatFolder: true,
    initGit: true,
    installDeps: true,
  };
}

export async function runPrompts(args: {
  initialName?: string;
  publishableKey?: string;
  typescript?: boolean;
  yes?: boolean;
}): Promise<AllAnswers> {
  // --yes flag: skip all prompts, use defaults
  if (args.yes && args.initialName) {
    p.log.info('Using defaults (--yes flag)');
    return getDefaults(args.initialName, args.publishableKey, args.typescript);
  }

  p.intro('Let\u2019s set up your GitHat app');

  sectionHeader('Project');
  const project = await promptProject(args.initialName);

  sectionHeader('Stack');
  const framework = await promptFramework(args.typescript);

  sectionHeader('Connect');
  const githat = await promptGitHat(args.publishableKey);

  sectionHeader('Features');
  const features = await promptFeatures();

  sectionHeader('Finish');
  const finalize = await promptFinalize();

  return { ...project, ...framework, ...githat, ...features, ...finalize };
}

export function answersToContext(answers: AllAnswers): TemplateContext {
  return {
    projectName: answers.projectName,
    businessName: answers.businessName,
    description: answers.description,
    framework: answers.framework,
    typescript: answers.typescript,
    packageManager: answers.packageManager,
    publishableKey: answers.publishableKey,
    apiUrl: answers.apiUrl,

    useDatabase: answers.databaseChoice !== 'none',
    databaseChoice: answers.databaseChoice,
    useTailwind: answers.useTailwind,
    includeDashboard: answers.includeDashboard,
    includeGithatFolder: answers.includeGithatFolder,
    includeForgotPassword: answers.authFeatures.includes('forgot-password'),
    includeEmailVerification: answers.authFeatures.includes('email-verification'),
    includeOrgManagement: answers.authFeatures.includes('org-management'),
    includeMcpModule: answers.authFeatures.includes('mcp-servers'),
    includeAgentModule: answers.authFeatures.includes('ai-agents'),

    ext: answers.typescript ? 'tsx' : 'jsx',
    configExt: answers.typescript ? 'ts' : 'js',
  };
}
