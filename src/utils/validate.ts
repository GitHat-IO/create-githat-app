export function validateProjectName(name: string): string | undefined {
  if (!name) return 'Project name is required';
  if (name.length < 2) return 'Must be at least 2 characters';
  if (name.length > 50) return 'Must be 50 characters or less';
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    return 'Must be lowercase, start with a letter or number, and use only a-z, 0-9, -, _, .';
  }
  return undefined;
}

export function validatePublishableKey(key: string): string | undefined {
  if (!key) return undefined; // optional
  if (!key.startsWith('pk_live_') && !key.startsWith('pk_test_')) {
    return 'Key must start with pk_live_ or pk_test_ (get one at githat.io/dashboard/apps)';
  }
  return undefined;
}

export function validateApiUrl(url: string): string | undefined {
  if (!url) return 'API URL is required';
  try {
    new URL(url);
    return undefined;
  } catch {
    return 'Must be a valid URL';
  }
}
