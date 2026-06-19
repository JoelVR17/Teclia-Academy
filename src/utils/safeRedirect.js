export function getSafeRedirect(param) {
  if (!param || !param.startsWith('/') || param.startsWith('//')) return null;
  return param;
}
