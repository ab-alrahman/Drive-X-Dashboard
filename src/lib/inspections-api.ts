import { apiFetch } from "./api";
import type {
  InspectionCase,
  InspectionFindingSeverity,
  InspectionPaidBy,
  InspectionRequesterRole,
  InspectionRound,
  InspectionServiceTier,
  Technician,
} from "./api-types";

export function getAdminCarInspection(carId: string) {
  return apiFetch<InspectionCase>(`/v1/admin/cars/${carId}/inspection`, { auth: true });
}

export function submitSellerInspection(
  carId: string,
  payload: { sourceType: "EXTERNAL_FILE"; externalFileUrl: string } | { sourceType: "TEMPLATE"; templateData: Record<string, unknown> }
) {
  return apiFetch<InspectionRound>(`/v1/admin/cars/${carId}/inspection/rounds`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function uploadInspectionFile(carId: string, file: File) {
  const formData = new FormData();
  formData.set("file", file);
  return apiFetch<{ url: string }>(`/v1/admin/cars/${carId}/inspection/upload`, {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export function requestTechnicianVisit(carId: string, payload: { requestedByRole: InspectionRequesterRole; notes?: string }) {
  return apiFetch<InspectionRound>(`/v1/admin/cars/${carId}/inspection/rounds/request-technician`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function scheduleInspectionRound(roundId: string, payload: { technicianId: string; scheduledAt: string }) {
  return apiFetch<InspectionRound>(`/v1/admin/inspections/rounds/${roundId}/schedule`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function startInspectionRound(roundId: string) {
  return apiFetch<InspectionRound>(`/v1/admin/inspections/rounds/${roundId}/start`, {
    method: "PATCH",
    auth: true,
  });
}

export function submitInspectionReport(
  roundId: string,
  payload: {
    overallVerdict?: string;
    priceAmount?: number;
    priceCurrency?: "USD" | "SYP";
    paidBy?: InspectionPaidBy;
    findings: Array<{
      description: string;
      severity: InspectionFindingSeverity;
      estimatedRepairCostAmount?: number;
      estimatedRepairCostCurrency?: "USD" | "SYP";
    }>;
  }
) {
  return apiFetch<InspectionRound>(`/v1/admin/inspections/rounds/${roundId}/report`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function certifyInspectionRound(roundId: string) {
  return apiFetch<InspectionRound>(`/v1/admin/inspections/rounds/${roundId}/certify`, {
    method: "PATCH",
    auth: true,
  });
}

export function cancelInspectionRound(roundId: string) {
  return apiFetch<InspectionRound>(`/v1/admin/inspections/rounds/${roundId}/cancel`, {
    method: "PATCH",
    auth: true,
  });
}

export function getTechnicians() {
  return apiFetch<Technician[]>("/v1/admin/technicians", { auth: true });
}

export function createTechnician(payload: {
  name: string;
  city: string;
  phone?: string;
  serviceTiers: InspectionServiceTier[];
  specialty?: string;
}) {
  return apiFetch<Technician>("/v1/admin/technicians", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function updateTechnician(
  technicianId: string,
  payload: Partial<{
    name: string;
    city: string;
    phone: string;
    serviceTiers: InspectionServiceTier[];
    specialty: string;
    isActive: boolean;
  }>
) {
  return apiFetch<Technician>(`/v1/admin/technicians/${technicianId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}
