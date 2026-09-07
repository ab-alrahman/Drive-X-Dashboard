export type ListingType = "SALE" | "RENT" | "BOTH";
export type TransmissionType = "AUTOMATIC" | "MANUAL";
export type FuelType = "GASOLINE" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type CarCondition = "NEW" | "USED";
export type CarStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "INACTIVE";
export type LeadIntent = "BUY" | "RENT";
export type LeadStatus = "NEW" | "CONTACTED" | "NEGOTIATING" | "APPROVED" | "REJECTED" | "CLOSED";
export type AdminRole = "OWNER" | "STAFF" | "PLATFORM_ADMIN";

export interface Money {
  amount: number;
  currency: "USD" | "SYP";
}

export interface CarImage {
  id?: string;
  url?: string;
  imageUrl?: string;
  isPrimary: boolean;
  position?: number;
}

export interface ApiCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  listingType: ListingType;
  condition: CarCondition;
  status: CarStatus;
  salePrice?: Money;
  dailyRentPrice?: Money;
  monthlyRentPrice?: Money;
  mileageKm?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  color?: string;
  city?: string;
  images?: CarImage[];
  specs: {
    engine: string;
    seats: number;
    drivetrain?: string;
    horsepower?: number;
  };
  description?: string;
  vendorId?: string;
  vendorName?: string;
  hiddenByPlatform?: boolean;
  hiddenReason?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CarPayload {
  brand: string;
  model: string;
  year: number;
  listingType: ListingType;
  condition: CarCondition;
  status: CarStatus;
  salePrice?: Money;
  dailyRentPrice?: Money;
  monthlyRentPrice?: Money;
  mileageKm?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  color?: string;
  city?: string;
  specs: {
    engine: string;
    seats: number;
    drivetrain?: string;
    horsepower?: number;
  };
  description?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface FiltersMetaResponse {
  brands?: string[];
  models?: string[];
  years?: number[];
  fuelTypes?: FuelType[];
  transmissionTypes?: TransmissionType[];
  listingTypes?: ListingType[];
}

export interface CreateLeadRequest {
  carId: string;
  intent: LeadIntent;
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
  message?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  requestDelivery?: boolean;
  deliveryAddress?: string;
}

export interface LeadResponse extends CreateLeadRequest {
  id: string;
  status: LeadStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreatedResponse {
  leadId: string;
  message: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  fullName?: string;
  role: AdminRole;
  vendorId?: string | null;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
}

export interface CustomerAuthResponse extends AuthTokenResponse {
  customer: CustomerProfile;
}

export interface PasswordResetRequestResponse {
  message: string;
  resetToken?: string;
  email?: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface DashboardSummaryResponse {
  totalCars: number;
  availableCars: number;
  activeLeads: number;
  closedDeals: number;
  monthlyCommission: Money;
  conversionRate: number;
  recentLeads?: Array<{
    id: string;
    carId: string;
    intent: LeadIntent;
    status: LeadStatus;
    fullName: string;
    phone: string;
    createdAt: string;
  }>;
  recentCars?: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    status: CarStatus;
    createdAt: string;
  }>;
  leadsByStatus?: Partial<Record<LeadStatus, number>>;
  dealsThisMonth?: number;
  commissionByMonth?: Array<Money & { month: string }>;
}

export interface DealResponse {
  id: string;
  leadId: string;
  carId: string;
  type: "SALE" | "RENT";
  finalPrice: Money;
  commissionType: "PERCENTAGE" | "FIXED";
  commissionValue: number;
  commission: Money;
  notes?: string;
  createdAt: string;
}

export interface CreateDealRequest {
  leadId: string;
  carId: string;
  type: "SALE" | "RENT";
  finalPrice: Money;
  commissionType?: "PERCENTAGE" | "FIXED";
  commissionValue?: number;
  notes?: string;
}

export type InspectionRoundStatus =
  | "OPENED"
  | "INTERNAL_REVIEW"
  | "FILE_ACCEPTED"
  | "ESCALATED_TO_TECHNICIAN"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "REPORT_SUBMITTED"
  | "CERTIFIED"
  | "CANCELLED"
  | "FLAGGED_FRAUDULENT";

export type InspectionRequesterRole = "SELLER" | "BUYER" | "RENTER";
export type InspectionSourceType = "EXTERNAL_FILE" | "TEMPLATE" | "DRIVEX_INSPECTION";
export type InspectionFindingSeverity = "MINOR" | "MODERATE" | "SEVERE" | "SAFETY_CRITICAL";
export type InspectionServiceTier = "QUICK" | "COMPREHENSIVE";
export type InspectionPaidBy = "SELLER" | "BUYER" | "RENTER" | "DRIVEX";

export interface InspectionFinding {
  id: string;
  description: string;
  severity: InspectionFindingSeverity;
  estimatedRepairCost?: Money;
  createdAt: string;
}

export interface InspectionRound {
  id: string;
  roundNumber: number;
  requestedByRole: InspectionRequesterRole;
  requestedByAdminId?: string;
  requestedByCustomerId?: string;
  sourceType: InspectionSourceType;
  status: InspectionRoundStatus;
  templateData?: Record<string, unknown>;
  externalFileUrl?: string;
  technicianId?: string;
  scheduledAt?: string;
  completedAt?: string;
  overallVerdict?: string;
  price?: Money;
  paidBy?: InspectionPaidBy;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  findings: InspectionFinding[];
}

export interface InspectionCase {
  id?: string;
  carId: string;
  createdAt?: string;
  updatedAt?: string;
  rounds: InspectionRound[];
}

export interface Technician {
  id: string;
  name: string;
  city: string;
  phone?: string;
  serviceTiers: InspectionServiceTier[];
  specialty?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VendorStatus = "ACTIVE" | "SUSPENDED";

export interface Vendor {
  id: string;
  name: string;
  status: VendorStatus;
  suspendedAt?: string;
  suspendedReason?: string;
  flaggedAt?: string;
  flaggedReason?: string;
  carCount: number;
  openComplaints: number;
  createdAt: string;
  updatedAt: string;
}

export type ComplaintStatus = "OPEN" | "SUBSTANTIATED" | "DISMISSED" | "RESOLVED";

export interface Complaint {
  id: string;
  carId: string;
  carBrand?: string;
  carModel?: string;
  vendorId?: string;
  vendorName?: string;
  customerId?: string;
  customerName?: string;
  description: string;
  status: ComplaintStatus;
  reviewedById?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export type MaintenanceRequestType =
  | "ROUTINE_SERVICE"
  | "REPAIR"
  | "DIAGNOSTIC"
  | "BODY_PAINT"
  | "TIRES_BRAKES"
  | "EMERGENCY"
  | "OTHER";

export type MaintenanceStatus =
  | "NEW"
  | "ADMIN_REVIEW"
  | "TRIAGED"
  | "SENT_TO_VENDOR"
  | "VENDOR_ACKNOWLEDGED"
  | "ASSIGNED_TO_PARTNER"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER_APPROVAL"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface MaintenanceUpdate {
  id: string;
  requestId: string;
  authorRole: "CUSTOMER" | "VENDOR" | "PLATFORM_ADMIN" | "SYSTEM";
  authorAdminId?: string;
  authorCustomerId?: string;
  statusFrom?: MaintenanceStatus;
  statusTo?: MaintenanceStatus;
  note?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface MaintenanceFile {
  id: string;
  requestId: string;
  fileUrl: string;
  storageKey?: string;
  fileType?: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  carId: string;
  dealId?: string;
  dealType?: "SALE" | "RENT";
  vendorId?: string;
  vendorName?: string;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  preferredPartnerId?: string;
  preferredPartnerName?: string;
  requestType: MaintenanceRequestType;
  status: MaintenanceStatus;
  city: string;
  preferredTime?: string;
  pickupNeeded: boolean;
  notes: string;
  contactPhone: string;
  quote?: Money;
  approvedAmount?: Money;
  quoteApprovedAt?: string;
  publicSummary?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  car?: {
    brand: string;
    model: string;
    year: number;
    listingType?: ListingType;
    imageUrl?: string;
  };
  updates?: MaintenanceUpdate[];
  files?: MaintenanceFile[];
}

export interface CustomerCarAsset {
  dealId: string;
  dealType: "SALE" | "RENT";
  dealCreatedAt: string;
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    listingType: ListingType;
    status: CarStatus;
    vendorId?: string;
    vendorName?: string;
    imageUrl?: string;
  };
}

export interface PublicMaintenanceRecord {
  id: string;
  carId: string;
  requestType: MaintenanceRequestType;
  status: "COMPLETED";
  publicSummary?: string;
  completedAt?: string;
  partnerName?: string;
  createdAt: string;
}

export interface PublicMaintenanceHistory {
  carId: string;
  items: PublicMaintenanceRecord[];
}

export interface CreateMaintenanceRequest {
  carId: string;
  dealId?: string;
  preferredWorkshopId?: string;
  requestType: MaintenanceRequestType;
  city: string;
  preferredTime?: string;
  pickupNeeded?: boolean;
  notes: string;
  contactPhone: string;
}

export interface MaintenanceWorkshop {
  id: string;
  name: string;
  city: string;
  phone?: string;
  specialty?: string;
  serviceTiers: InspectionServiceTier[];
}

export type ChatSenderType = "CUSTOMER" | "VENDOR";

export interface ChatThread {
  id: string;
  carId: string;
  customerId: string;
  customerName?: string;
  vendorId: string;
  vendorName?: string;
  lastMessageAt: string;
  createdAt: string;
  lastMessagePreview?: string;
  unreadCount: number;
  car?: {
    brand: string;
    model: string;
    year: number;
    imageUrl?: string;
  };
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderType: ChatSenderType;
  senderId: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

export interface ChatThreadWithMessages {
  thread: ChatThread;
  messages: ChatMessage[];
}
