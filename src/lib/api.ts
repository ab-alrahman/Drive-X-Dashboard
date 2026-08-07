const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://drive-x-ku0y.onrender.com").replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "drive_x_access_token";
const REFRESH_TOKEN_KEY = "drive_x_refresh_token";
const CUSTOMER_ACCESS_TOKEN_KEY = "drive_x_customer_access_token";
const CUSTOMER_REFRESH_TOKEN_KEY = "drive_x_customer_refresh_token";
const ADMIN_PROFILE_KEY = "drive_x_auth";
const CUSTOMER_PROFILE_KEY = "drive_x_customer";

const SESSION_KEYS = [
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  CUSTOMER_ACCESS_TOKEN_KEY,
  CUSTOMER_REFRESH_TOKEN_KEY,
  ADMIN_PROFILE_KEY,
  CUSTOMER_PROFILE_KEY,
];

SESSION_KEYS.forEach((key) => localStorage.removeItem(key));

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: string[];

  constructor(message: string, status: number, code?: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCustomerAccessToken() {
  return sessionStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY);
}

export function getCustomerRefreshToken() {
  return sessionStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function setCustomerAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
  sessionStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_PROFILE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
}

export function clearCustomerAuthTokens() {
  sessionStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_PROFILE_KEY);
  localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_PROFILE_KEY);
}

export function setAdminSessionProfile(profile: { email: string; name: string; role: string }) {
  localStorage.removeItem(ADMIN_PROFILE_KEY);
  sessionStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
}

export function getAdminSessionProfile() {
  return sessionStorage.getItem(ADMIN_PROFILE_KEY);
}

export function setCustomerSessionProfile(profile: unknown) {
  localStorage.removeItem(CUSTOMER_PROFILE_KEY);
  sessionStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
}

export function getCustomerSessionProfile() {
  return sessionStorage.getItem(CUSTOMER_PROFILE_KEY);
}

export function resolveAssetUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("/")) {
    return url;
  }
  return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean | "admin" | "customer";
}

async function readError(response: Response) {
  try {
    const body = await response.json();
    return {
      message: body.message || "API request failed",
      code: body.code,
      details: body.details,
    };
  } catch {
    return { message: response.statusText || "API request failed" };
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/v1/admin/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearAuthTokens();
    return false;
  }

  const tokens = await response.json();
  setAuthTokens(tokens.accessToken, tokens.refreshToken);
  return true;
}

async function refreshCustomerAccessToken() {
  const refreshToken = getCustomerRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/v1/public/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearCustomerAuthTokens();
    return false;
  }

  const tokens = await response.json();
  setCustomerAuthTokens(tokens.accessToken, tokens.refreshToken);
  if (tokens.customer) {
    setCustomerSessionProfile(tokens.customer);
  }
  return true;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = false, headers, body, ...requestOptions } = options;
  const authMode = auth === true ? "admin" : auth;
  const token = authMode === "customer" ? getCustomerAccessToken() : getAccessToken();
  const isFormData = body instanceof FormData;

  const buildRequest = () => ({
    ...requestOptions,
    body,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(authMode === "admin" && getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      ...(authMode === "customer" && getCustomerAccessToken()
        ? { Authorization: `Bearer ${getCustomerAccessToken()}` }
        : {}),
      ...headers,
    },
  });

  let response = await fetch(`${API_BASE_URL}${path}`, buildRequest());

  if (!response.ok && response.status === 401 && authMode === "admin" && token && !path.includes("/v1/admin/auth/refresh")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(`${API_BASE_URL}${path}`, buildRequest());
    }
  }

  if (
    !response.ok &&
    response.status === 401 &&
    authMode === "customer" &&
    token &&
    !path.includes("/v1/public/auth/refresh")
  ) {
    const refreshed = await refreshCustomerAccessToken();
    if (refreshed) {
      response = await fetch(`${API_BASE_URL}${path}`, buildRequest());
    }
  }

  if (!response.ok) {
    const error = await readError(response);
    if (response.status === 401) {
      if (authMode === "customer") {
        clearCustomerAuthTokens();
      } else {
        clearAuthTokens();
      }
    }
    throw new ApiError(error.message, response.status, error.code, error.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function toQueryString(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}
