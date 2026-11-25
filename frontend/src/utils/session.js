/**
 * Reads the role claim from the stored token. Only used to decide which navigation to show:
 * the server checks the real role on every request, so editing this value grants nothing.
 */
export function tokenRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).rol ?? null;
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem('token');
}
