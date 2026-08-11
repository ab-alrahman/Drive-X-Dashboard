import { apiFetch, toQueryString } from "./api";
import type {
  ApiCar,
  CarPayload,
  CarImage,
  CreateDealRequest,
  DashboardSummaryResponse,
  DealResponse,
  LeadResponse,
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenanceRequestType,
  PaginatedResponse,
} from "./api-types";

export function getAdminDashboardSummary() {
  return apiFetch<DashboardSummaryResponse>("/v1/admin/dashboard/summary", { auth: true });
}

export function getAdminCars(params: { page?: number; limit?: number; status?: string } = {}) {
  return apiFetch<PaginatedResponse<ApiCar>>(`/v1/admin/cars${toQueryString(params)}`, { auth: true });
}

export function getAdminCar(carId: string) {
  return apiFetch<ApiCar>(`/v1/admin/cars/${carId}`, { auth: true });
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

export function uploadAdminCarImage(
  carId: string,
  file: File,
  options: { isPrimary?: boolean; position?: number } = {}
) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("isPrimary", String(options.isPrimary ?? false));
  formData.set("position", String(options.position ?? 0));

  return apiFetch<CarImage>(`/v1/admin/cars/${carId}/images`, {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export function deleteAdminCarImage(carId: string, imageId: string) {
  return apiFetch<void>(`/v1/admin/cars/${carId}/images/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getAdminLeads(params: { page?: number; limit?: number; status?: string; intent?: string } = {}) {
  return apiFetch<PaginatedResponse<LeadResponse>>(`/v1/admin/leads${toQueryString(params)}`, { auth: true });
}

export function getAdminLead(leadId: string) {
  return apiFetch<LeadResponse>(`/v1/admin/leads/${leadId}`, { auth: true });
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

export function getAdminDeal(dealId: string) {
  return apiFetch<DealResponse>(`/v1/admin/deals/${dealId}`, { auth: true });
}

export function createAdminDeal(payload: CreateDealRequest) {
  return apiFetch<DealResponse>("/v1/admin/deals", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminDeal(dealId: string, payload: Partial<CreateDealRequest>) {
  return apiFetch<DealResponse>(`/v1/admin/deals/${dealId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminDeal(dealId: string) {
  return apiFetch<void>(`/v1/admin/deals/${dealId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getAdminMaintenanceRequests(params: {
  page?: number;
  limit?: number;
  status?: MaintenanceStatus;
  requestType?: MaintenanceRequestType;
  city?: string;
} = {}) {
  return apiFetch<PaginatedResponse<MaintenanceRequest>>(
    `/v1/admin/maintenance/requests${toQueryString(params)}`,
    { auth: true }
  );
}

export function getAdminMaintenanceRequest(requestId: string) {
  return apiFetch<MaintenanceRequest>(`/v1/admin/maintenance/requests/${requestId}`, { auth: true });
}

export function triageMaintenanceRequest(
  requestId: string,
  payload: { status: "TRIAGED" | "REJECTED" | "SENT_TO_VENDOR"; note?: string }
) {
  return apiFetch<MaintenanceRequest>(`/v1/admin/maintenance/requests/${requestId}/triage`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function assignMaintenancePartner(requestId: string, payload: { partnerId: string; note?: string }) {
  return apiFetch<MaintenanceRequest>(`/v1/admin/maintenance/requests/${requestId}/assign`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function scheduleMaintenanceRequest(requestId: string, payload: { scheduledAt: string; note?: string }) {
  return apiFetch<MaintenanceRequest>(`/v1/admin/maintenance/requests/${requestId}/schedule`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function updateMaintenanceRequestStatus(
  requestId: string,
  payload: {
    status: MaintenanceStatus;
    note?: string;
    publicSummary?: string;
    quotedAmount?: number;
    quotedCurrency?: "USD" | "SYP";
  }
) {
  return apiFetch<MaintenanceRequest>(`/v1/admin/maintenance/requests/${requestId}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function addMaintenanceRequestUpdate(
  requestId: string,
  payload: { note: string; isPublic?: boolean }
) {
  return apiFetch<MaintenanceRequest>(`/v1/admin/maintenance/requests/${requestId}/updates`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}
