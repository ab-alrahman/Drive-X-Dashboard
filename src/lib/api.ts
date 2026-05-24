const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://drive-x-ku0y.onrender.com").replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "drive_x_access_token";
const REFRESH_TOKEN_KEY = "drive_x_refresh_token";

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
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("drive_x_auth");
}

export function resolveAssetUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("/")) {
    return url;
  }
  return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
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

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = false, headers, body, ...requestOptions } = options;
  const token = getAccessToken();
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    body,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await readError(response);
    if (response.status === 401) {
      clearAuthTokens();
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

