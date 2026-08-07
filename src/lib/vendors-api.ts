import { apiFetch, setAuthTokens, toQueryString } from "./api";
import type { Complaint, PaginatedResponse, Vendor } from "./api-types";

// Self-serve vendor onboarding - no manual approval gate. The response includes fresh
// OWNER tokens so the new vendor is signed straight into their own dashboard.
export async function registerVendor(payload: {
  vendorName: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPassword: string;
}) {
  const response = await apiFetch<{ vendor: Vendor; accessToken: string; refreshToken: string }>(
    "/v1/public/vendors/register",
    { method: "POST", body: JSON.stringify(payload) }
  );
  setAuthTokens(response.accessToken, response.refreshToken);
  return response;
}

export function getPlatformVendors() {
  return apiFetch<Vendor[]>("/v1/admin/vendors", { auth: true });
}

export function suspendVendor(vendorId: string, reason: string) {
  return apiFetch<Vendor>(`/v1/admin/vendors/${vendorId}/suspend`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ reason }),
  });
}

export function unsuspendVendor(vendorId: string) {
  return apiFetch<Vendor>(`/v1/admin/vendors/${vendorId}/unsuspend`, {
    method: "PATCH",
    auth: true,
  });
}

export function hidePlatformCar(carId: string, reason: string) {
  return apiFetch<void>(`/v1/admin/cars/${carId}/hide`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ reason }),
  });
}

export function unhidePlatformCar(carId: string) {
  return apiFetch<void>(`/v1/admin/cars/${carId}/unhide`, {
    method: "PATCH",
    auth: true,
  });
}

export function getPlatformComplaints(params: { page?: number; limit?: number; status?: string; vendorId?: string } = {}) {
  return apiFetch<PaginatedResponse<Complaint>>(`/v1/admin/complaints${toQueryString(params)}`, { auth: true });
}

export function reviewComplaint(
  complaintId: string,
  payload: { decision: "SUBSTANTIATED" | "DISMISSED" | "RESOLVED"; note?: string }
) {
  return apiFetch<Complaint>(`/v1/admin/complaints/${complaintId}/review`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function submitCarComplaint(carId: string, description: string) {
  return apiFetch<Complaint>(`/v1/public/cars/${carId}/complaints`, {
    method: "POST",
    auth: "customer",
    body: JSON.stringify({ description }),
  });
}

export function flagRoundFraudulent(roundId: string, reason: string) {
  return apiFetch<unknown>(`/v1/admin/inspections/rounds/${roundId}/flag-fraudulent`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ reason }),
  });
}
