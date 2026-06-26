import { apiFetch, setCustomerAuthTokens } from "./api";
import { toQueryString } from "./api";
import type {
  ApiCar,
  CustomerAuthResponse,
  CustomerProfile,
  CreateLeadRequest,
  FiltersMetaResponse,
  LeadCreatedResponse,
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
  localStorage.setItem("drive_x_customer", JSON.stringify(response.customer));
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
