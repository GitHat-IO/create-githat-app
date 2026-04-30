import * as p from '@clack/prompts';
import { promptProject, type ProjectAnswers } from './project.js';
import { promptProjectType, type ProjectTypeAnswers } from './project-type.js';
import { promptFramework, type FrameworkAnswers } from './framework.js';
import { promptBackend, type BackendAnswers } from './backend.js';
import { promptGitHat, type GitHatAnswers } from './githat.js';
import { promptFeatures, type FeatureAnswers } from './features.js';
import { promptFinalize, type FinalizeAnswers } from './finalize.js';
import { sectionHeader } from '../utils/ascii.js';
import { detectPackageManager } from '../utils/package-manager.js';
import { DEFAULT_API_URL, type ProjectType, type BackendFramework } from '../constants.js';
import type { TemplateContext } from '../utils/template-engine.js';

export interface AllAnswers
  extends ProjectAnswers,
    ProjectTypeAnswers,
    FrameworkAnswers,
    Partial<BackendAnswers>,
    GitHatAnswers,
    FeatureAnswers,
    FinalizeAnswers {}

function toDisplayName(projectName: string): string {
  return projectName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDefaults(
  projectName: string,
  publishableKey?: string,
  typescript?: boolean,
  fullstack?: boolean,
  backendFramework?: BackendFramework,
  plain?: boolean
): AllAnswers {
  const displayName = toDisplayName(projectName);
  const projectType: ProjectType = fullstack ? 'fullstack' : 'frontend';
  // --plain forces the smallest scaffold: framework='plain', no
  // dashboard, no githat/ helper folder. Overrides anything else.
  const framework = plain ? 'plain' : 'nextjs';
  return {
    projectName,
    businessName: displayName,
    description: `${displayName} — Built with GitHat`,
    projectType,
    backendFramework: fullstack ? (backendFramework || 'hono') : undefined,
    framework,
    typescript: typescript ?? true,
    packageManager: detectPackageManager(),
    publishableKey: publishableKey || '',
    apiUrl: DEFAULT_API_URL,
    authFeatures: plain ? [] : ['forgot-password'],
    databaseChoice: 'none',
    useTailwind: true,
    includeDashboard: !plain,
    includeGithatFolder: !plain && projectType === 'frontend',
    initGit: true,
    installDeps: true,
  };
}

export async function runPrompts(args: {
  initialName?: string;
  publishableKey?: string;
  typescript?: boolean;
  yes?: boolean;
  plain?: boolean;
  fullstack?: boolean;
  backendFramework?: BackendFramework;
}): Promise<AllAnswers> {
  // --yes flag: skip all prompts, use defaults
  if (args.yes && args.initialName) {
    p.log.info(args.plain ? 'Using plain defaults (--yes --plain)' : 'Using defaults (--yes flag)');
    return getDefaults(args.initialName, args.publishableKey, args.typescript, args.fullstack, args.backendFramework, args.plain);
  }

  p.intro("Let's set up your GitHat app");

  sectionHeader('Project');
  const project = await promptProject(args.initialName);
  const projectType = await promptProjectType();

  sectionHeader('Stack');
  const isFullstack = projectType.projectType === 'fullstack';
  const framework = await promptFramework(args.typescript, isFullstack);

  // Only prompt for backend if fullstack
  let backend: Partial<BackendAnswers> = {};
  if (isFullstack) {
    backend = await promptBackend();
  }

  sectionHeader('Connect');
  const githat = await promptGitHat(args.publishableKey);

  sectionHeader('Features');
  const features = await promptFeatures();

  sectionHeader('Finish');
  const finalize = await promptFinalize();

  return { ...project, ...projectType, ...framework, ...backend, ...githat, ...features, ...finalize };
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

    // Project type
    projectType: answers.projectType,
    backendFramework: answers.backendFramework,

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
