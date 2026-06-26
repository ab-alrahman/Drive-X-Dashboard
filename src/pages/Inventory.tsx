import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Star,
  Gauge,
  Fuel,
  Grid3X3,
  List,
  Heart,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cars as fallbackCars } from "@/data/cars";
import { mapApiCarsToView, type CarView } from "@/lib/car-mapper";
import { getCustomerAccessToken } from "@/lib/api";
import {
  addFavoriteCar,
  getFavoriteCars,
  getFiltersMeta,
  getPublicCars,
  removeFavoriteCar,
} from "@/lib/public-api";
import { useI18n } from "@/lib/i18n";

const listingTypes = [
  { label: "All", value: "All" },
  { label: "For Sale", value: "SALE" },
  { label: "For Rent", value: "RENT" },
  { label: "Sale & Rent", value: "BOTH" },
];

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Year: Newest", value: "year_desc" },
  { label: "Mileage: Low to High", value: "mileage_asc" },
];

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "All");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") ?? "All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") ?? "All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterBrands, setFilterBrands] = useState<string[]>(["All"]);
  const [filterFuels, setFilterFuels] = useState<string[]>(["All"]);
  const [selectedCar, setSelectedCar] = useState<CarView | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [inventoryCars, setInventoryCars] = useState<CarView[]>(
    fallbackCars.map((car) => ({ ...car, id: String(car.id), listingType: "SALE" as const, city: undefined }))
  );
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [carsError, setCarsError] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");

  useEffect(() => {
    getFiltersMeta()
      .then((response) => {
        setFilterBrands(["All", ...(response.brands ?? [])]);
        setFilterFuels(["All", ...(response.fuelTypes ?? [])]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!getCustomerAccessToken()) return;

    getFavoriteCars()
      .then((response) => setFavorites(response.ids))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const priceFilters: Record<string, { priceMin?: number; priceMax?: number }> = {
      under100: { priceMax: 100000 },
      "100to200": { priceMin: 100000, priceMax: 200000 },
      "200to500": { priceMin: 200000, priceMax: 500000 },
      over500: { priceMin: 500000 },
    };
    const timer = window.setTimeout(() => {
      setIsLoadingCars(true);
      getPublicCars({
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
        brand: selectedBrand !== "All" ? selectedBrand : undefined,
        listingType: selectedCategory !== "All" ? selectedCategory : undefined,
        fuelType: selectedFuel !== "All" ? selectedFuel : undefined,
        sortBy,
        ...priceFilters[priceRange],
      })
        .then((response) => {
          const cars = mapApiCarsToView(response.items);
          setInventoryCars(cars);
          setCarsError("");
        })
        .catch((error: Error) => {
          setCarsError(error.message || "Could not load live inventory. Showing sample vehicles.");
        })
        .finally(() => setIsLoadingCars(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedBrand, selectedFuel, priceRange, sortBy]);

  const toggleFavorite = async (id: string) => {
    if (!getCustomerAccessToken()) {
      setFavoriteMessage("Create an account or sign in to save favorites.");
      navigate("/register");
      return;
    }

    const wasFavorite = favorites.includes(id);
    setFavorites((prev) => (wasFavorite ? prev.filter((favoriteId) => favoriteId !== id) : [...prev, id]));
    setFavoriteMessage("");

    try {
      if (wasFavorite) {
        await removeFavoriteCar(id);
      } else {
        await addFavoriteCar(id);
      }
    } catch (error) {
      setFavorites((prev) => (wasFavorite ? [...prev, id] : prev.filter((favoriteId) => favoriteId !== id)));
      setFavoriteMessage(error instanceof Error ? error.message : "Could not update favorites.");
    }
  };

  const sortedCars = inventoryCars;

  const activeFiltersCount = [
    selectedCategory !== "All",
    selectedBrand !== "All",
    selectedFuel !== "All",
    priceRange !== "All",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
              {t("premiumCollection")}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {t("ourInventory")}
              </h1>
              <p className="text-white/60 mt-2">
                {isLoadingCars ? t("loadingInventory") : `${sortedCars.length} ${t("vehiclesAvailable")}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-dark-card border border-gold/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-gold text-dark"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-gold text-dark"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {t("filters")}
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-gold text-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {carsError && (
          <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
            {carsError}
          </div>
        )}
        {favoriteMessage && (
          <div className="mb-6 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
            {favoriteMessage}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-dark-card border border-gold/20 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-dark border-gold/20 text-white placeholder:text-white/30 focus:border-gold"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-dark border-gold/20 text-white">
                <ArrowUpDown className="w-4 h-4 mr-2 text-gold" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-dark-card border border-gold/20 rounded-xl p-6 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">{t("advancedFilters")}</h3>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedBrand("All");
                  setSelectedFuel("All");
                  setPriceRange("All");
                }}
                className="text-gold hover:text-gold-light text-sm"
              >
                {t("clearAll")}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">{t("listingType")}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-dark border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-gold/20">
                    {listingTypes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">{t("brand")}</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="bg-dark border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-gold/20">
                    {filterBrands.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">{t("fuelType")}</label>
                <Select value={selectedFuel} onValueChange={setSelectedFuel}>
                  <SelectTrigger className="bg-dark border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-gold/20">
                    {filterFuels.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">{t("priceRange")}</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="bg-dark border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-gold/20">
                    <SelectItem value="All">{t("anyPrice")}</SelectItem>
                    <SelectItem value="under100">Under $100,000</SelectItem>
                    <SelectItem value="100to200">$100k - $200k</SelectItem>
                    <SelectItem value="200to500">$200k - $500k</SelectItem>
                    <SelectItem value="over500">Above $500k</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategory !== "All" && (
              <span className="bg-gold/10 border border-gold/30 text-gold text-sm px-3 py-1 rounded-full flex items-center gap-2">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("All")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedBrand !== "All" && (
              <span className="bg-gold/10 border border-gold/30 text-gold text-sm px-3 py-1 rounded-full flex items-center gap-2">
                {selectedBrand}
                <button onClick={() => setSelectedBrand("All")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedFuel !== "All" && (
              <span className="bg-gold/10 border border-gold/30 text-gold text-sm px-3 py-1 rounded-full flex items-center gap-2">
                {selectedFuel}
                <button onClick={() => setSelectedFuel("All")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {priceRange !== "All" && (
              <span className="bg-gold/10 border border-gold/30 text-gold text-sm px-3 py-1 rounded-full flex items-center gap-2">
                {priceRange === "under100" && "Under $100k"}
                {priceRange === "100to200" && "$100k - $200k"}
                {priceRange === "200to500" && "$200k - $500k"}
                {priceRange === "over500" && "Above $500k"}
                <button onClick={() => setPriceRange("All")}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Cars Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCars.map((car) => (
              <div
                key={car.id}
                className="group bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-glow"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent" />
                  <button
                    onClick={() => toggleFavorite(car.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(car.id)
                          ? "text-red-500 fill-red-500"
                          : "text-white/70 hover:text-gold"
                      }`}
                    />
                  </button>
                  <div className="absolute top-3 left-3">
                    <span className="bg-gold text-dark text-xs font-bold px-3 py-1 rounded-full">
                      {car.condition}
                    </span>
                  </div>
                  {car.status === "reserved" && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-orange-500/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Reserved
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-gold text-xs bg-dark/60 backdrop-blur-sm px-2 py-1 rounded">
                    <Star className="w-3 h-3 fill-current" />
                    {car.rating} ({car.reviews})
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-gold transition-colors">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-white/50 text-sm mb-3">{car.category} • {car.year}</p>

                  <div className="grid grid-cols-2 gap-2 text-white/60 text-xs mb-4">
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {car.mileage}</span>
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {car.fuelType}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                    <div>
                      <span className="text-gold font-bold text-xl">${car.price.toLocaleString()}</span>
                      {car.originalPrice && (
                        <span className="text-white/40 text-sm line-through ml-2">${car.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCar(car)}
                        className="text-gold hover:text-gold-light hover:bg-gold/10"
                      >
                        Details
                      </Button>
                      <Link to={`/car/${car.id}`}>
                        <Button
                          size="sm"
                          className="bg-gold hover:bg-gold-light text-dark"
                        >
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCars.map((car) => (
              <div
                key={car.id}
                className="group bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-glow"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-72 h-48 sm:h-auto overflow-hidden shrink-0">
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-card/80 hidden sm:block" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-gold text-dark text-xs font-bold px-3 py-1 rounded-full">
                        {car.condition}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-bold text-xl group-hover:text-gold transition-colors">
                            {car.brand} {car.model}
                          </h3>
                          <p className="text-white/50 text-sm">{car.category} • {car.year}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(car.id)}
                          className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.includes(car.id)
                                ? "text-red-500 fill-red-500"
                                : "text-gold"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3 text-white/60 text-sm mb-4">
                        <span className="flex items-center gap-1"><Gauge className="w-4 h-4" /> {car.mileage}</span>
                        <span className="flex items-center gap-1"><Fuel className="w-4 h-4" /> {car.fuelType}</span>
                        <span className="flex items-center gap-1">{car.transmission}</span>
                        <span className="flex items-center gap-1">{car.color}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        {car.features.slice(0, 3).map((f) => (
                          <span key={f} className="bg-gold/10 text-gold text-xs px-2 py-1 rounded">
                            {f}
                          </span>
                        ))}
                        {car.features.length > 3 && (
                          <span className="text-white/40 text-xs">+{car.features.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                      <div className="flex items-center gap-3">
                        <span className="text-gold font-bold text-2xl">${car.price.toLocaleString()}</span>
                        {car.originalPrice && (
                          <span className="text-white/40 line-through">${car.originalPrice.toLocaleString()}</span>
                        )}
                        <div className="flex items-center gap-1 text-gold text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          {car.rating}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedCar(car)}
                          className="text-gold hover:bg-gold/10"
                        >
                          Details
                        </Button>
                        <Link to={`/car/${car.id}`}>
                          <Button className="bg-gold hover:bg-gold-light text-dark">
                            View Car
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedCars.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gold/20 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">{t("noCarsFound")}</h3>
            <p className="text-white/60 mb-6">{t("adjustFilters")}</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedBrand("All");
                setSelectedFuel("All");
                setPriceRange("All");
              }}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              {t("clearAll")}
            </Button>
          </div>
        )}
      </div>

      {/* Quick Preview Dialog */}
      <Dialog open={!!selectedCar} onOpenChange={() => setSelectedCar(null)}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {selectedCar?.brand} {selectedCar?.model}
            </DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <div className="space-y-4">
              <img
                src={selectedCar.image}
                alt={`${selectedCar.brand} ${selectedCar.model}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-dark p-3 rounded-lg">
                  <span className="text-white/50">Year</span>
                  <p className="text-white font-semibold">{selectedCar.year}</p>
                </div>
                <div className="bg-dark p-3 rounded-lg">
                  <span className="text-white/50">Engine</span>
                  <p className="text-white font-semibold">{selectedCar.engine}</p>
                </div>
                <div className="bg-dark p-3 rounded-lg">
                  <span className="text-white/50">Power</span>
                  <p className="text-white font-semibold">{selectedCar.power}</p>
                </div>
                <div className="bg-dark p-3 rounded-lg">
                  <span className="text-white/50">0-100 km/h</span>
                  <p className="text-white font-semibold">{selectedCar.acceleration}</p>
                </div>
              </div>
              <Link to={`/car/${selectedCar.id}`}>
                <Button className="w-full bg-gold hover:bg-gold-light text-dark font-bold">
                  View Full Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
