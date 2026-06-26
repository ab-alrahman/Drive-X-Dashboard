export type ListingType = "SALE" | "RENT" | "BOTH";
export type TransmissionType = "AUTOMATIC" | "MANUAL";
export type FuelType = "GASOLINE" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type CarCondition = "NEW" | "USED";
export type CarStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "INACTIVE";
export type LeadIntent = "BUY" | "RENT";
export type LeadStatus = "NEW" | "CONTACTED" | "NEGOTIATING" | "APPROVED" | "REJECTED" | "CLOSED";
export type AdminRole = "OWNER" | "STAFF";

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
  commissionType: "PERCENTAGE" | "FIXED";
  commissionValue: number;
  notes?: string;
}
