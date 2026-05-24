import { apiFetch, toQueryString } from "./api";
import type {
  ApiCar,
  CarPayload,
  DashboardSummaryResponse,
  DealResponse,
  LeadResponse,
  PaginatedResponse,
} from "./api-types";

export function getAdminDashboardSummary() {
  return apiFetch<DashboardSummaryResponse>("/v1/admin/dashboard/summary", { auth: true });
}

export function getAdminCars(params: { page?: number; limit?: number } = {}) {
  return apiFetch<PaginatedResponse<ApiCar>>(`/v1/admin/cars${toQueryString(params)}`, { auth: true });
}

export function createAdminCar(payload: CarPayload) {
  return apiFetch<ApiCar>("/v1/admin/cars", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminCar(carId: string, payload: Partial<CarPayload>) {
  return apiFetch<ApiCar>(`/v1/admin/cars/${carId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCar(carId: string) {
  return apiFetch<void>(`/v1/admin/cars/${carId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getAdminLeads(params: { page?: number; limit?: number; status?: string; intent?: string } = {}) {
  return apiFetch<PaginatedResponse<LeadResponse>>(`/v1/admin/leads${toQueryString(params)}`, { auth: true });
}

export function updateAdminLead(leadId: string, payload: { status?: string; adminNotes?: string }) {
  return apiFetch<LeadResponse>(`/v1/admin/leads/${leadId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function getAdminDeals(params: { page?: number; limit?: number } = {}) {
  return apiFetch<PaginatedResponse<DealResponse>>(`/v1/admin/deals${toQueryString(params)}`, { auth: true });
}
