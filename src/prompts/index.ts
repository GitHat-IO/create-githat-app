import * as p from '@clack/prompts';
import { promptProject, type ProjectAnswers } from './project.js';
import { promptFramework, type FrameworkAnswers } from './framework.js';
import { promptGitHat, type GitHatAnswers } from './githat.js';
import { promptFeatures, type FeatureAnswers } from './features.js';
import { promptFinalize, type FinalizeAnswers } from './finalize.js';
import { sectionHeader } from '../utils/ascii.js';
import type { TemplateContext } from '../utils/template-engine.js';

export interface AllAnswers
  extends ProjectAnswers,
    FrameworkAnswers,
    GitHatAnswers,
    FeatureAnswers,
    FinalizeAnswers {}

export async function runPrompts(args: {
  initialName?: string;
  publishableKey?: string;
  typescript?: boolean;
}): Promise<AllAnswers> {
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
