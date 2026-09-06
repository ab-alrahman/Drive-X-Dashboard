import type { ApiCar, FuelType, ListingType, TransmissionType } from "./api-types.js";

export interface CarView {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  color: string;
  engine: string;
  power: string;
  acceleration: string;
  topSpeed: string;
  features: string[];
  description: string;
  condition: string;
  status: "available" | "sold" | "reserved";
  featured: boolean;
  rating: number;
  reviews: number;
  city?: string;
  listingType: ListingType;
  vendorId?: string;
  vendorName?: string;
  hiddenByPlatform?: boolean;
  hiddenReason?: string;
}

const FALLBACK_IMAGES = ["/hero-car.jpg", "/interior-detail.jpg", "/car-engine.jpg", "/car-key.jpg"];

function fuelLabel(fuelType?: FuelType) {
  const labels: Record<FuelType, string> = {
    GASOLINE: "Petrol",
    DIESEL: "Diesel",
    HYBRID: "Hybrid",
    ELECTRIC: "Electric",
  };
  return fuelType ? labels[fuelType] : "N/A";
}

function transmissionLabel(transmission?: TransmissionType) {
  if (!transmission) return "N/A";
  return transmission === "AUTOMATIC" ? "Automatic" : "Manual";
}

function listingLabel(listingType: ListingType) {
  const labels: Record<ListingType, string> = {
    SALE: "For Sale",
    RENT: "For Rent",
    BOTH: "Sale & Rent",
  };
  return labels[listingType];
}

function statusLabel(status: ApiCar["status"]): CarView["status"] {
  if (status === "SOLD" || status === "RENTED" || status === "INACTIVE") return "sold";
  if (status === "RESERVED") return "reserved";
  return "available";
}

export function mapApiCarToViewModel(car: ApiCar, resolveImageUrl: (url?: string) => string): CarView {
  const orderedImages = [...(car.images ?? [])]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || (a.position ?? 0) - (b.position ?? 0))
    .map((image) => resolveImageUrl(image.url ?? image.imageUrl))
    .filter(Boolean);
  const images = orderedImages.length > 0 ? orderedImages : FALLBACK_IMAGES;
  const price = car.salePrice?.amount ?? car.monthlyRentPrice?.amount ?? car.dailyRentPrice?.amount ?? 0;
  const horsepower = car.specs.horsepower ? `${car.specs.horsepower} HP` : "N/A";

  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    year: car.year,
    price,
    image: images[0],
    images,
    category: listingLabel(car.listingType),
    mileage: typeof car.mileageKm === "number" ? `${car.mileageKm.toLocaleString()} km` : "N/A",
    fuelType: fuelLabel(car.fuelType),
    transmission: transmissionLabel(car.transmission),
    color: car.color ?? "N/A",
    engine: car.specs.engine,
    power: horsepower,
    acceleration: "N/A",
    topSpeed: "N/A",
    features: [
      car.city ? `Located in ${car.city}` : undefined,
      car.specs.drivetrain ? `${car.specs.drivetrain} drivetrain` : undefined,
      `${car.specs.seats} seats`,
      car.dailyRentPrice ? `Daily rent ${car.dailyRentPrice.amount.toLocaleString()} ${car.dailyRentPrice.currency}` : undefined,
      car.monthlyRentPrice ? `Monthly rent ${car.monthlyRentPrice.amount.toLocaleString()} ${car.monthlyRentPrice.currency}` : undefined,
    ].filter((feature): feature is string => Boolean(feature)),
    description: car.description ?? "No description available for this vehicle yet.",
    condition: car.condition === "NEW" ? "New" : "Used",
    status: statusLabel(car.status),
    featured: car.status === "AVAILABLE",
    rating: 4.8,
    reviews: 0,
    city: car.city,
    listingType: car.listingType,
    vendorId: car.vendorId,
    vendorName: car.vendorName,
    hiddenByPlatform: car.hiddenByPlatform,
    hiddenReason: car.hiddenReason,
  };
}

export function mapApiCarsToViewModel(cars: ApiCar[], resolveImageUrl: (url?: string) => string) {
  return cars.map((car) => mapApiCarToViewModel(car, resolveImageUrl));
}
