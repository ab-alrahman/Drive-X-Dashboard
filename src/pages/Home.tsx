import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight,
  Car,
  Shield,
  Clock,
  Wrench,
  Star,
  Quote,
  ArrowRight,
  Zap,
  Gauge,
  Fuel,
  Users,
  Award,
  Search,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { stats } from "@/data/cars";
import { mapApiCarsToView, type CarView } from "@/lib/car-mapper";
import { getFiltersMeta, getPublicCars } from "@/lib/public-api";
import { useI18n } from "@/lib/i18n";

const listingTypeOptions = [
  { value: "All", labelKey: "all" as const },
  { value: "SALE", labelKey: "forSale" as const },
  { value: "RENT", labelKey: "forRent" as const },
  { value: "BOTH", labelKey: "saleAndRent" as const },
];

export default function Home() {
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const [heroLoaded] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [quickSearch, setQuickSearch] = useState({ category: "All", brand: "All", priceRange: "All" });
  const [featuredCars, setFeaturedCars] = useState<CarView[]>([]);
  const [featuredCarsLoading, setFeaturedCarsLoading] = useState(true);
  const [filterBrands, setFilterBrands] = useState<string[]>(["All"]);
  const [listingTypeCounts, setListingTypeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getFiltersMeta()
      .then((response) => setFilterBrands(["All", ...(response.brands ?? [])]))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    Promise.all(
      ["SALE", "RENT", "BOTH"].map((listingType) =>
        getPublicCars({ listingType, limit: 1 }).then((response) => [listingType, response.total] as const)
      )
    )
      .then((entries) => setListingTypeCounts(Object.fromEntries(entries)))
      .catch(() => undefined);
  }, []);

  const handleQuickSearch = () => {
    const params = new URLSearchParams();
    if (quickSearch.category !== "All") params.set("category", quickSearch.category);
    if (quickSearch.brand !== "All") params.set("brand", quickSearch.brand);
    if (quickSearch.priceRange !== "All") params.set("priceRange", quickSearch.priceRange);
    navigate(`/inventory${params.toString() ? `?${params.toString()}` : ""}`);
  };

  useEffect(() => {
    getPublicCars({ page: 1, limit: 4, sortBy: "newest" })
      .then((response) => {
        setFeaturedCars(mapApiCarsToView(response.items));
      })
      .catch(() => setFeaturedCars([]))
      .finally(() => setFeaturedCarsLoading(false));
  }, []);

  const whyChooseItems = [
    { icon: Shield, titleKey: "verifiedQuality" as const, descKey: "verifiedQualityDesc" as const },
    { icon: Clock, titleKey: "fastProcess" as const, descKey: "fastProcessDesc" as const },
    { icon: Wrench, titleKey: "premiumWarranty" as const, descKey: "premiumWarrantyDesc" as const },
    { icon: Zap, titleKey: "bestPrices" as const, descKey: "bestPricesDesc" as const },
  ];

  const localizedTestimonials = [
    {
      id: 1,
      name: language === "ar" ? "أحمد الراشد" : "Ahmed Al-Rashid",
      role: language === "ar" ? "صاحب شركة" : "Business Owner",
      avatar: language === "ar" ? "أ" : "A",
      text:
        language === "ar"
          ? "كانت تجربة شراء السيارة واضحة وسلسة من أول زيارة حتى الاستلام. ساعدني فريق Drive X في مقارنة الخيارات واختيار BMW M8 بمواصفات ممتازة، وكل خطوة كانت منظمة ومحترفة."
          : "The most seamless car buying experience I've ever had. The showroom is incredible, and the team went above and beyond to find my dream car. The BMW M8 I purchased exceeded all expectations.",
      car: "BMW M8 Competition",
    },
    {
      id: 2,
      name: language === "ar" ? "خالد بن سعد" : "Khalid Bin Saad",
      role: language === "ar" ? "رئيس تنفيذي، Tech Ventures" : "CEO, Tech Ventures",
      avatar: language === "ar" ? "خ" : "K",
      text:
        language === "ar"
          ? "تعاملت مع معارض كثيرة، لكن Drive X مختلف في الوضوح والاهتمام بالتفاصيل. السعر كان شفافاً، والمتابعة بعد الشراء ممتازة، ووصلت Porsche Taycan بحالة مثالية."
          : "I've bought cars from dealerships worldwide, but Drive X stands apart. Their attention to detail, transparent pricing, and after-sales service are world-class. My Porsche Taycan was delivered in perfect condition.",
      car: "Porsche Taycan Turbo S",
    },
    {
      id: 3,
      name: language === "ar" ? "محمد الفارسي" : "Mohammed Al-Farsi",
      role: language === "ar" ? "مصرفي استثماري" : "Investment Banker",
      avatar: language === "ar" ? "م" : "M",
      text:
        language === "ar"
          ? "عندما تختار سيارة بهذا المستوى، تتوقع دقة في كل تفصيلة. Drive X قدمت تجربة تليق بالسيارة؛ Ferrari SF90 كانت نظيفة بالكامل، والإجراءات تمت باحترافية عالية."
          : "When you're spending half a million on a car, you expect perfection. Drive X delivered exactly that. The Ferrari SF90 was immaculate, and the entire process was handled with utmost professionalism.",
      car: "Ferrari SF90 Stradale",
    },
  ];

  const isRtl = language === "ar";

  const nextTestimonial = () => {
    setActiveTestimonial((current) => (current + 1) % localizedTestimonials.length);
  };

  const previousTestimonial = () => {
    setActiveTestimonial((current) => (current - 1 + localizedTestimonials.length) % localizedTestimonials.length);
  };

  useEffect(() => {
    const timer = window.setInterval(nextTestimonial, 5000);
    return () => window.clearInterval(timer);
  }, [language]);

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/hero-car.jpg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/70 to-dark/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <div
            className={`max-w-3xl transition-all duration-1000 ${
              heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gold" />
              <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
                {t("premiumCarMarketplace")}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-6">
              {t("driveYourDreams")}
              <br />
              <span className="text-gold text-shadow-glow">{t("driveYourDreamsHighlight")}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/inventory">
                <Button
                  size="lg"
                  className="bg-gold hover:bg-gold-light text-dark font-bold text-base px-8 py-6 shadow-glow hover:shadow-glow-lg transition-all duration-300 group"
                >
                  {t("exploreInventory")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/vendor-register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gold/50 text-gold hover:bg-gold/10 font-semibold text-base px-8 py-6"
                >
                  {t("sellYourCar")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs tracking-wider">{t("scrollLabel")}</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 -mt-16 mx-4 sm:mx-6 lg:mx-auto max-w-6xl">
        <div className="bg-dark-card/90 backdrop-blur-xl border border-gold/20 rounded-2xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-2xl">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gold mb-1">
                {stat.value}
              </div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
            {t("findYourPerfectCar")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            {t("quickSearch")}
          </h2>
        </div>

        <div className="bg-dark-card border border-gold/20 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-white/60 text-sm">{t("listingType")}</label>
              <select
                value={quickSearch.category}
                onChange={(event) => setQuickSearch({ ...quickSearch, category: event.target.value })}
                className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
              >
                {listingTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm">{t("brand")}</label>
              <select
                value={quickSearch.brand}
                onChange={(event) => setQuickSearch({ ...quickSearch, brand: event.target.value })}
                className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
              >
                {filterBrands.map((brand) => (
                  <option key={brand} value={brand}>{brand === "All" ? t("allBrands") : brand}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm">{t("priceRange")}</label>
              <select
                value={quickSearch.priceRange}
                onChange={(event) => setQuickSearch({ ...quickSearch, priceRange: event.target.value })}
                className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
              >
                <option value="All">{t("anyPrice")}</option>
                <option value="under100">{t("under100k")}</option>
                <option value="100to200">{t("range100to200")}</option>
                <option value="200to500">{t("range200to500")}</option>
                <option value="over500">{t("above500k")}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleQuickSearch}
                className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all"
              >
                <Search className="w-5 h-5 mr-2" />
                {t("searchCars")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-gradient-to-b from-dark to-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
                {t("curatedSelection")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
                {t("featuredVehicles")}
              </h2>
            </div>
            <Link to="/inventory">
              <Button
                variant="ghost"
                className="text-gold hover:text-gold-light hover:bg-gold/10 group"
              >
                {t("viewAllInventory")}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {featuredCarsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-dark-card border border-gold/10 animate-pulse" />
              ))}
            </div>
          ) : featuredCars.length === 0 ? (
            <div className="text-center py-12 text-white/50">{t("noCarsFound")}</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => (
              <Link
                key={car.id}
                to={`/car/${car.id}`}
                className="group bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-glow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-gold text-dark text-xs font-bold px-3 py-1 rounded-full">
                      {car.condition}
                    </span>
                  </div>
                  {car.originalPrice && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {t("sale")}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-white/80 text-xs font-medium bg-dark/60 backdrop-blur-sm px-2 py-1 rounded">
                      {car.year}
                    </span>
                    <div className="flex items-center gap-1 text-gold text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      {car.rating}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-gold transition-colors">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-white/50 text-sm mb-3">{car.category}</p>

                  <div className="flex items-center gap-3 text-white/60 text-xs mb-4">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" /> {car.mileage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3" /> {car.fuelType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                    <div>
                      <span className="text-gold font-bold text-xl">
                        ${car.price.toLocaleString()}
                      </span>
                      {car.originalPrice && (
                        <span className="text-white/40 text-sm line-through ml-2">
                          ${car.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold group-hover:text-dark transition-all">
                      <ChevronRight className="w-4 h-4 text-gold group-hover:text-dark" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10"
          style={{ backgroundImage: "url(/showroom.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/95 to-dark" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
              {t("ourAdvantages")}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">
              {t("whyChooseDriveX")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseItems.map((item, i) => (
              <div
                key={i}
                className="bg-dark-card/60 backdrop-blur-sm border border-gold/10 hover:border-gold/40 rounded-xl p-8 text-center group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold group-hover:shadow-glow transition-all duration-500">
                  <item.icon className="w-7 h-7 text-gold group-hover:text-dark transition-colors" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{t(item.titleKey)}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gradient-to-b from-dark-card/30 to-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
              {t("browseByType")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              {t("vehicleCategories")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {listingTypeOptions
              .filter((option) => option.value !== "All")
              .map((option, i) => {
                const icons = [Car, Clock, Award];
                const Icon = icons[i] || Car;
                return (
                  <Link
                    key={option.value}
                    to={`/inventory?category=${option.value}`}
                    className="group bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                  >
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold transition-all">
                      <Icon className="w-5 h-5 text-gold group-hover:text-dark" />
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">{t(option.labelKey)}</h3>
                    <p className="text-white/50 text-xs">
                      {listingTypeCounts[option.value] ?? 0} {t("vehicles")}
                    </p>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* Showroom CTA */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/showroom.jpg)" }}
        />
        <div className="absolute inset-0 bg-dark/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/70 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
                {t("visitOurShowroom")}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">
                {t("experienceLuxury")}
                <br />
                <span className="text-gold">{t("experienceLuxuryHighlight")}</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                {t("showroomDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                  <Button
                    size="lg"
                    className="bg-gold hover:bg-gold-light text-dark font-bold shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    {t("bookAppointment")}
                  </Button>
                </Link>
                <Link to="/inventory">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    {t("virtualTour")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img
                src="/dealership.jpg"
                alt="Drive X Showroom"
                className="rounded-2xl border border-gold/20 shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-dark-card border border-gold/20 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-bold">1,800+</p>
                    <p className="text-white/60 text-xs">{t("happyClients")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
              {t("clientStories")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              {t("whatOurClientsSay")}
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-y-0 -left-4 -right-4 hidden md:flex items-center justify-between pointer-events-none z-10">
              <button
                type="button"
                onClick={previousTestimonial}
                className="pointer-events-auto w-11 h-11 rounded-full border border-gold/30 bg-dark-card/90 text-gold hover:bg-gold hover:text-dark transition-colors flex items-center justify-center"
                aria-label={language === "ar" ? "التعليق السابق" : "Previous testimonial"}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextTestimonial}
                className="pointer-events-auto w-11 h-11 rounded-full border border-gold/30 bg-dark-card/90 text-gold hover:bg-gold hover:text-dark transition-colors flex items-center justify-center"
                aria-label={language === "ar" ? "التعليق التالي" : "Next testimonial"}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-dark-card border border-gold/20 rounded-2xl overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(${isRtl ? activeTestimonial * 100 : -activeTestimonial * 100}%)` }}
              >
                {localizedTestimonials.map((testimonial) => (
                  <article key={testimonial.id} className="min-w-full p-8 md:p-12">
                    <Quote className="w-12 h-12 text-gold/30 mb-6" />

                    <div className="min-h-[230px] flex flex-col justify-between">
                      <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8">
                        "{testimonial.text}"
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-dark font-bold text-lg shrink-0">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <p className="text-white font-bold">{testimonial.name}</p>
                            <p className="text-gold text-sm">{testimonial.role}</p>
                          </div>
                        </div>
                        <div className="sm:text-end">
                          <p className="text-white/40 text-sm">{t("purchased")}</p>
                          <p className="text-gold text-sm font-medium">{testimonial.car}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 pb-8">
                {localizedTestimonials.map((testimonial, i) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeTestimonial ? "bg-gold w-10" : "bg-gold/30 hover:bg-gold/50 w-2"
                    }`}
                    aria-label={
                      language === "ar"
                        ? `عرض تعليق ${testimonial.name}`
                        : `Show testimonial from ${testimonial.name}`
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="py-16 border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/40 text-sm mb-8 tracking-wider uppercase">
            {t("trustedByFinest")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["BMW", "Mercedes", "Porsche", "Ferrari", "Lamborghini", "Audi", "Aston Martin", "Bentley"].map(
              (brand) => (
                <span
                  key={brand}
                  className="text-white/20 text-xl md:text-2xl font-bold tracking-wider hover:text-gold/60 transition-colors duration-300 cursor-default"
                >
                  {brand}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-gold/20 via-gold/10 to-dark border border-gold/30 rounded-3xl p-8 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url(/speed-lights.jpg)] bg-cover bg-center opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                {t("readyToFindDreamCar")}
                <br />
                <span className="text-gold">{t("readyToFindDreamCarHighlight")}</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                {t("dreamCarSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/inventory">
                  <Button
                    size="lg"
                    className="bg-gold hover:bg-gold-light text-dark font-bold px-8 py-6 shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    {t("browseInventoryBtn")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gold/50 text-gold hover:bg-gold/10 px-8 py-6"
                  >
                    {t("createAccount")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
