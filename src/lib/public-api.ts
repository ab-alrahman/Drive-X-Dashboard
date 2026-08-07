import { apiFetch, setCustomerAuthTokens, setCustomerSessionProfile } from "./api";
import { toQueryString } from "./api";
import type {
  ApiCar,
  CustomerAuthResponse,
  CustomerProfile,
  CreateLeadRequest,
  FiltersMetaResponse,
  InspectionCase,
  InspectionRound,
  LeadCreatedResponse,
  LeadResponse,
  PaginatedResponse,
} from "./api-types";

export interface PublicCarsParams {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  listingType?: string;
  transmission?: string;
  fuelType?: string;
  sortBy?: string;
}

export function getPublicCars(params: PublicCarsParams = {}) {
  return apiFetch<PaginatedResponse<ApiCar>>(`/v1/public/cars${toQueryString({ ...params })}`);
}

export function getPublicCar(carId: string) {
  return apiFetch<ApiCar>(`/v1/public/cars/${carId}`);
}

export function getFiltersMeta() {
  return apiFetch<FiltersMetaResponse>("/v1/public/meta/filters");
}

export function createLead(payload: CreateLeadRequest) {
  return apiFetch<LeadCreatedResponse>("/v1/public/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerCustomer(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const response = await apiFetch<CustomerAuthResponse>("/v1/public/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setCustomerAuthTokens(response.accessToken, response.refreshToken);
  setCustomerSessionProfile(response.customer);
  return response;
}

export async function loginCustomer(email: string, password: string) {
  const response = await apiFetch<CustomerAuthResponse>("/v1/public/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setCustomerAuthTokens(response.accessToken, response.refreshToken);
  setCustomerSessionProfile(response.customer);
  return response;
}

export function getCurrentCustomer() {
  return apiFetch<CustomerProfile>("/v1/public/auth/me", { auth: "customer" });
}

export function getFavoriteCars() {
  return apiFetch<{ items: ApiCar[]; ids: string[] }>("/v1/public/me/favorites", { auth: "customer" });
}

export function addFavoriteCar(carId: string) {
  return apiFetch<{ carId: string; favorited: true }>(`/v1/public/me/favorites/${carId}`, {
    method: "POST",
    auth: "customer",
  });
}

export function removeFavoriteCar(carId: string) {
  return apiFetch<{ carId: string; favorited: false }>(`/v1/public/me/favorites/${carId}`, {
    method: "DELETE",
    auth: "customer",
  });
}

export function getMyLeads(params: { page?: number; limit?: number; status?: string; intent?: string } = {}) {
  return apiFetch<PaginatedResponse<LeadResponse & { car?: { brand: string; model: string; year: number; imageUrl?: string } }>>(
    `/v1/public/me/leads${toQueryString({ ...params })}`,
    { auth: "customer" }
  );
}

export function updateMyProfile(payload: { fullName?: string; phone?: string }) {
  return apiFetch<CustomerProfile>("/v1/public/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
    auth: "customer",
  });
}

export function getCarInspection(carId: string) {
  return apiFetch<InspectionCase>(`/v1/public/cars/${carId}/inspection`);
}

export function requestCarInspection(carId: string, payload: { intent: "BUY" | "RENT"; notes?: string }) {
  return apiFetch<InspectionRound>(`/v1/public/cars/${carId}/inspection/request-technician`, {
    method: "POST",
    auth: "customer",
    body: JSON.stringify(payload),
  });
}
