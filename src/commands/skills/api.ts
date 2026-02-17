/**
 * Skills API client for CLI
 */

import { DEFAULT_API_URL } from '../../constants.js';

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: 'template' | 'integration' | 'ui' | 'ai' | 'workflow';
  authorName: string;
  latestVersion: string;
  downloads: number;
  stars: number;
  repository?: string;
  homepage?: string;
  license: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillVersion {
  id: string;
  version: string;
  changelog: string;
  fileSize: number;
  createdAt: string;
}

export interface Installation {
  id: string;
  skillId: string;
  version: string;
  installedAt: string;
  skill?: {
    slug: string;
    name: string;
    description: string;
    type: string;
    latestVersion: string;
    authorName: string;
  };
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DEFAULT_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

export async function searchSkills(query: string, type?: string): Promise<{ skills: Skill[] }> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  const url = `/skills?${params.toString()}`;
  const result = await fetchApi<{ skills: Skill[] }>(url);

  // Client-side filter by query (API doesn't support search yet)
  const q = query.toLowerCase();
  return {
    skills: result.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.toLowerCase().includes(q))
    ),
  };
}

export async function listSkills(options: {
  type?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ skills: Skill[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (options.type) params.set('type', options.type);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.cursor) params.set('cursor', options.cursor);

  return fetchApi(`/skills?${params.toString()}`);
}

export async function getSkill(slug: string): Promise<Skill> {
  return fetchApi(`/skills/${slug}`);
}

export async function getSkillVersions(
  slug: string
): Promise<{ skill: { id: string; slug: string; name: string }; versions: SkillVersion[] }> {
  return fetchApi(`/skills/${slug}/versions`);
}

export async function getDownloadUrl(
  slug: string,
  version?: string
): Promise<{
  skill: { id: string; slug: string; name: string };
  version: { version: string; changelog: string; fileSize: number };
  downloadUrl: string;
  expiresIn: number;
}> {
  const params = version ? `?version=${version}` : '';
  return fetchApi(`/skills/${slug}/download${params}`);
}

export async function listInstalledSkills(
  token: string
): Promise<{ installations: Installation[] }> {
  return fetchApi('/skills/installed', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function recordInstallation(
  token: string,
  slug: string,
  version?: string
): Promise<{ installation: { id: string; version: string } }> {
  return fetchApi(`/skills/${slug}/install`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ version }),
  });
}
