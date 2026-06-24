const ALLOWED_BASE_PATHS = [
  '/dashboard',
  '/profile',
  '/recursos',
  '/free',
  '/admin',
  '/auth/login',
  '/auth/signup',
];

export function getSafeRedirect(param) {
  if (!param || typeof param !== 'string') return null;
  const decoded = decodeURIComponent(param);
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\')) return null;
  if (decoded.includes('@') || decoded.includes('javascript:') || decoded.includes('data:')) return null;
  const pathOnly = decoded.split('?')[0].split('#')[0];
  if (pathOnly === '/') return '/';
  const isAllowed = ALLOWED_BASE_PATHS.some((p) => pathOnly === p || pathOnly.startsWith(p + '/'));
  if (!isAllowed) return null;
  return decoded;
}
