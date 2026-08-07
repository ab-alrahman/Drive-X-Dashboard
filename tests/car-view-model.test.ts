import test from "node:test";
import assert from "node:assert/strict";
import { mapApiCarToViewModel } from "../src/lib/car-view-model.js";
import type { ApiCar } from "../src/lib/api-types.js";

const baseCar: ApiCar = {
  id: "car-1",
  brand: "Toyota",
  model: "Corolla",
  year: 2024,
  listingType: "BOTH",
  condition: "USED",
  status: "AVAILABLE",
  monthlyRentPrice: { amount: 900, currency: "USD" },
  dailyRentPrice: { amount: 45, currency: "USD" },
  mileageKm: 12345,
  transmission: "AUTOMATIC",
  fuelType: "HYBRID",
  color: "White",
  city: "Damascus",
  images: [
    { id: "secondary", url: "secondary.jpg", isPrimary: false, position: 1 },
    { id: "primary", url: "primary.jpg", isPrimary: true, position: 2 },
  ],
  specs: {
    engine: "1.8L",
    seats: 5,
    drivetrain: "FWD",
    horsepower: 138,
  },
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

test("maps core car fields and prefers sale, then monthly, then daily price", () => {
  const view = mapApiCarToViewModel(baseCar, (url) => `/assets/${url}`);

  assert.equal(view.price, 900);
  assert.equal(view.category, "Sale & Rent");
  assert.equal(view.status, "available");
  assert.equal(view.featured, true);
  assert.equal(view.mileage, "12,345 km");
  assert.equal(view.fuelType, "Hybrid");
  assert.equal(view.transmission, "Automatic");
  assert.equal(view.power, "138 HP");
});

test("orders the primary image before positioned secondary images", () => {
  const view = mapApiCarToViewModel(baseCar, (url) => `/assets/${url}`);

  assert.equal(view.image, "/assets/primary.jpg");
  assert.deepEqual(view.images, ["/assets/primary.jpg", "/assets/secondary.jpg"]);
});

test("uses fallback images and normalizes inactive cars as sold", () => {
  const view = mapApiCarToViewModel(
    {
      ...baseCar,
      status: "INACTIVE",
      images: [],
      salePrice: undefined,
      monthlyRentPrice: undefined,
      dailyRentPrice: undefined,
      mileageKm: undefined,
      fuelType: undefined,
      transmission: undefined,
      color: undefined,
      specs: { ...baseCar.specs, horsepower: undefined },
      description: undefined,
    },
    (url) => url ?? ""
  );

  assert.equal(view.status, "sold");
  assert.equal(view.price, 0);
  assert.equal(view.image, "/hero-car.jpg");
  assert.equal(view.mileage, "N/A");
  assert.equal(view.fuelType, "N/A");
  assert.equal(view.transmission, "N/A");
  assert.equal(view.color, "N/A");
  assert.equal(view.power, "N/A");
  assert.equal(view.description, "No description available for this vehicle yet.");
});
