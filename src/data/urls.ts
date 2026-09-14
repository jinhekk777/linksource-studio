const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// Public assets and page links share the deployment prefix.
export function withBase(path: string) {
  return path.startsWith('/') && !path.startsWith('//') ? base + path : path;
}

export function withoutBase(path: string) {
  if (base && path === base) return '/';
  return base && path.startsWith(base + '/') ? path.slice(base.length) : path;
}
