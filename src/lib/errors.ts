import type { MessageKey } from "./i18n";

const errorMessageMap: Record<string, MessageKey> = {
  // Authentication / accounts
  "Invalid email or password": "errInvalidCredentials",
  "Email is already registered": "errEmailTaken",
  "An account with this email already exists": "errEmailTaken",
  "Admin account not found": "errAdminNotFound",
  "Customer account not found": "errCustomerNotFound",
  "Invalid or expired token": "errInvalidOrExpiredToken",
  "Invalid or expired reset token": "errInvalidResetToken",
  "Invalid refresh token": "errInvalidRefreshToken",
  "Invalid customer token": "errInvalidSession",
  "This action requires a Platform Admin.": "errRequiresPlatformAdmin",
  "This action requires a vendor-scoped account, not a Platform Admin.": "errRequiresVendorAccount",

  // Rate limiting / payload / server
  "Invalid request payload": "errInvalidPayload",
  "Image size must not exceed 5MB": "errImageTooLarge",
  "Only jpg, jpeg, png, and webp uploads are allowed": "errBadImageType",
  "Only jpg, jpeg, png, webp, and pdf uploads are allowed": "errBadUploadType",
  "Too many login attempts": "errTooManyLoginAttempts",
  "Too many requests": "errTooManyRequests",
  "Too many attempts, please try again later": "errTooManyAttempts",
  "Unexpected server error": "errServerError",
  "Application error": "errServerError",
  "API request failed": "errServerError",

  // Not found
  "Car not found": "errCarNotFound",
  "Drive X car not found": "errCarNotFound",
  "Complaint not found": "errComplaintNotFound",
  "Customer not found": "errCustomerNotFound",
  "Deal not found": "errDealNotFound",
  "Favorite not found": "errFavoriteNotFound",
  "Image not found": "errImageNotFound",
  "Inspection round not found": "errInspectionRoundNotFound",
  "Lead not found": "errLeadNotFound",
  "Maintenance request not found": "errMaintenanceNotFound",
  "Partner not found or inactive": "errPartnerUnavailable",
  "Technician not found": "errTechnicianNotFound",
  "Technician not found or inactive": "errTechnicianUnavailable",
  "Vendor not found": "errVendorNotFound",
  "This deal is not linked to your account.": "errDealNotLinked",
  "Vendor can only acknowledge routed rental maintenance requests.": "errVendorAcknowledgeOnly",

  // Frontend fallback messages
  "Could not submit the request.": "errSubmitRequest",
  "Could not submit the report.": "errSubmitReport",
  "Could not create maintenance request.": "errCreateMaintenance",
  "Could not upload file.": "errUploadFile",
  "Could not update profile.": "errUpdateProfile",
  "Could not set maintenance quote.": "errSetQuote",
  "Could not add maintenance update.": "errAddUpdate",
  "Could not complete maintenance request.": "errCompleteMaintenance",
  "Could not load dashboard data.": "errLoadDashboard",
  "Could not load platform data.": "errLoadPlatform",
  "Could not load inventory right now.": "errLoadInventory",
  "Could not save car.": "errSaveCar",
  "Could not delete car.": "errDeleteCar",
  "Could not update lead.": "errUpdateLead",
  "Could not create deal.": "errCreateDeal",
  "Could not delete deal.": "errDeleteDeal",
  "Could not load inspection data.": "errLoadInspection",
  "Could not submit maintenance file.": "errSubmitMaintenanceFile",
  "Could not request a technician visit.": "errRequestTechnician",
  "Could not schedule the inspection.": "errScheduleInspection",
  "Could not start the inspection.": "errStartInspection",
  "Could not certify the inspection.": "errCertifyInspection",
  "Could not cancel the round.": "errCancelRound",
  "Could not save technician.": "errSaveTechnician",
  "Could not update technician.": "errUpdateTechnician",
  "Could not update vendor status.": "errUpdateVendorStatus",
  "Could not update listing visibility.": "errUpdateListingVisibility",
  "Could not review the complaint.": "errReviewComplaint",
  "Could not flag the round.": "errFlagRound",
};

export function localizeError(
  error: unknown,
  t: (key: MessageKey) => string,
  fallbackKey?: MessageKey
): string {
  const message = error instanceof Error ? error.message : "";
  const mapped = message ? errorMessageMap[message] : undefined;
  if (mapped) return t(mapped);
  if (message) return message;
  return fallbackKey ? t(fallbackKey) : "";
}