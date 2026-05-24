import { apiFetch, toQueryString } from "./api";
import type {
  ApiCar,
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
