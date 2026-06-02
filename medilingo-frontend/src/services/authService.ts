import type { TokenResponse, AuthUser } from '../types/index';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * POST /auth/register — creates a new user account.
 * Returns TokenResponse; sets refresh_token HttpOnly cookie.
 */
export async function registerUser(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: TokenResponse }> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 409) throw new Error('Email already registered');
    throw new Error(data.detail || 'Registration failed');
  }

  const token: TokenResponse = await response.json();
  const user = await getMe(token.access_token);
  return { user, token };
}

/**
 * POST /auth/login — authenticates an existing user.
 * Returns TokenResponse; sets refresh_token HttpOnly cookie.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: TokenResponse }> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Invalid email or password');
  }

  const token: TokenResponse = await response.json();
  const user = await getMe(token.access_token);
  return { user, token };
}

/**
 * POST /auth/refresh — refreshes the access token using the HttpOnly refresh cookie.
 * Returns a new access token string.
 */
export async function refreshAccessToken(): Promise<string> {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Token refresh failed');

  const data: TokenResponse = await response.json();
  return data.access_token;
}

/**
 * POST /auth/logout — clears the refresh_token cookie.
 */
export async function logoutUser(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * POST /auth/forgot-password — sends a password reset email.
 */
export async function forgotPassword(email: string): Promise<{ detail: string }> {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Request failed');
  }
  return response.json();
}

/**
 * POST /auth/reset-password — resets the password using the token from email.
 */
export async function resetPassword(token: string, new_password: string): Promise<{ detail: string }> {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Reset failed');
  }
  return response.json();
}

/**
 * GET /auth/me — returns the current user's profile.
 */
export async function getMe(accessToken?: string): Promise<AuthUser> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Not authenticated');

  return response.json();
}
