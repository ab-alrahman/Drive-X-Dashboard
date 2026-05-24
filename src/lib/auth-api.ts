import { apiFetch, clearAuthTokens, getRefreshToken, setAuthTokens } from "./api";
import type { AdminProfile, AuthTokenResponse } from "./api-types";

export async function loginAdmin(email: string, password: string) {
  const tokens = await apiFetch<AuthTokenResponse>("/v1/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

export async function refreshAdminToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");
  const tokens = await apiFetch<AuthTokenResponse>("/v1/admin/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  setAuthTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

export function getCurrentAdmin() {
  return apiFetch<AdminProfile>("/v1/admin/auth/me", { auth: true });
}

export async function logoutAdmin() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await apiFetch<void>("/v1/admin/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  clearAuthTokens();
}

