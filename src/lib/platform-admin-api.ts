import { apiFetch } from "./api";
import type { AdminRole, CustomerAuthResponse, Vendor } from "./api-types";

export type PlatformAccountType = "CUSTOMER" | "SELLER";

export interface PlatformAccount {
  id: string;
  type: PlatformAccountType;
  email: string;
  fullName: string;
  phone?: string | null;
  vendorName?: string;
  role?: AdminRole;
  status?: string;
  createdAt?: string;
}

export interface CreatePlatformAccountPayload {
  type: PlatformAccountType;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  vendorName?: string;
}

export function getPlatformAccounts() {
  return apiFetch<PlatformAccount[]>("/v1/admin/users", { auth: true });
}

export async function createPlatformAccount(payload: CreatePlatformAccountPayload) {
  try {
    return await apiFetch<PlatformAccount>("/v1/admin/users", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (payload.type === "CUSTOMER") {
      const response = await apiFetch<CustomerAuthResponse>("/v1/public/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          password: payload.password,
        }),
      });
      return {
        id: response.customer.id,
        type: "CUSTOMER",
        email: response.customer.email,
        fullName: response.customer.fullName,
        phone: response.customer.phone,
      } satisfies PlatformAccount;
    }

    const response = await apiFetch<{ vendor: Vendor }>("/v1/public/vendors/register", {
      method: "POST",
      body: JSON.stringify({
        vendorName: payload.vendorName || payload.fullName,
        ownerFullName: payload.fullName,
        ownerEmail: payload.email,
        ownerPassword: payload.password,
      }),
    });
    return {
      id: response.vendor.id,
      type: "SELLER",
      email: payload.email,
      fullName: payload.fullName,
      vendorName: response.vendor.name,
      status: response.vendor.status,
    } satisfies PlatformAccount;
  }
}
