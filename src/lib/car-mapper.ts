import { resolveAssetUrl } from "./api";
import type { ApiCar } from "./api-types";
import { mapApiCarsToViewModel, mapApiCarToViewModel, type CarView } from "./car-view-model.js";

export type { CarView };

export function mapApiCarToView(car: ApiCar): CarView {
  return mapApiCarToViewModel(car, resolveAssetUrl);
}

export function mapApiCarsToView(cars: ApiCar[]) {
  return mapApiCarsToViewModel(cars, resolveAssetUrl);
}
