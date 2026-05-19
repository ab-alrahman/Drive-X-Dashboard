import { useEffect, useState } from "react";
import { Link } from "react-router";
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
  Crown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cars, testimonials, stats, categories } from "@/data/cars";

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  const featuredCars = cars.filter((c) => c.featured).slice(0, 4);

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
                Premium Car Marketplace
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-6">
              Drive Your
              <br />
              <span className="text-gold text-shadow-glow">Dreams</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl leading-relaxed">
              Discover premium vehicles for sale and rent. From daily-ready sedans to rare performance cars, find your perfect match with Drive X.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/inventory">
                <Button
                  size="lg"
                  className="bg-gold hover:bg-gold-light text-dark font-bold text-base px-8 py-6 shadow-glow hover:shadow-glow-lg transition-all duration-300 group"
                >
                  Explore Inventory
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gold/50 text-gold hover:bg-gold/10 font-semibold text-base px-8 py-6"
                >
                  Sell Your Car
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs tracking-wider">SCROLL</span>
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
            Find Your Perfect Car
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Quick Search
          </h2>
        </div>

        <div className="bg-dark-card border border-gold/20 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-white/60 text-sm">Category</label>
              <select className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold">
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm">Brand</label>
              <select className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold">
                <option>All Brands</option>
                <option>BMW</option>
                <option>Porsche</option>
                <option>Ferrari</option>
                <option>Mercedes</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm">Price Range</label>
              <select className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold">
                <option>Any Price</option>
                <option>Under $100k</option>
                <option>$100k - $200k</option>
                <option>$200k - $500k</option>
                <option>Above $500k</option>
              </select>
            </div>
            <div className="flex items-end">
              <Link to="/inventory" className="w-full">
                <Button className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all">
                  <Search className="w-5 h-5 mr-2" />
                  Search Cars
                </Button>
              </Link>
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
                Curated Selection
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
                Featured Vehicles
              </h2>
            </div>
            <Link to="/inventory">
              <Button
                variant="ghost"
                className="text-gold hover:text-gold-light hover:bg-gold/10 group"
              >
                View All Inventory
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

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
                        Sale
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
              Our Advantages
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">
              Why Choose Drive X
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Quality",
                desc: "Every vehicle undergoes rigorous 200-point inspection before listing.",
              },
              {
                icon: Clock,
                title: "Fast Process",
                desc: "Complete your purchase in as little as 24 hours with our streamlined process.",
              },
              {
                icon: Wrench,
                title: "Premium Warranty",
                desc: "Complimentary 2-year warranty on all vehicles for complete peace of mind.",
              },
              {
                icon: Zap,
                title: "Best Prices",
                desc: "Market-competitive pricing with transparent, no-haggle quotes guaranteed.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-dark-card/60 backdrop-blur-sm border border-gold/10 hover:border-gold/40 rounded-xl p-8 text-center group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold group-hover:shadow-glow transition-all duration-500">
                  <item.icon className="w-7 h-7 text-gold group-hover:text-dark transition-colors" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
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
              Browse By Type
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              Vehicle Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories
              .filter((c) => c !== "All")
              .map((cat, i) => {
                const icons = [Car, Gauge, Crown, Users, Zap, Award];
                const Icon = icons[i] || Car;
                const counts = [12, 8, 5, 15, 6, 4];
                return (
                  <Link
                    key={cat}
                    to="/inventory"
                    className="group bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                  >
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold transition-all">
                      <Icon className="w-5 h-5 text-gold group-hover:text-dark" />
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">{cat}</h3>
                    <p className="text-white/50 text-xs">{counts[i]} vehicles</p>
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
                Visit Our Showroom
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">
                Experience Luxury
                <br />
                <span className="text-gold">In Person</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Step into our state-of-the-art showroom and immerse yourself in the world of automotive excellence. Our expert consultants are ready to guide you through our curated collection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                  <Button
                    size="lg"
                    className="bg-gold hover:bg-gold-light text-dark font-bold shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/inventory">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Virtual Tour
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
                    <p className="text-white/60 text-xs">Happy Clients</p>
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
              Client Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              What Our Clients Say
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-dark-card border border-gold/20 rounded-2xl p-8 md:p-12">
              <Quote className="w-12 h-12 text-gold/30 mb-6" />

              <div className="min-h-[200px]">
                <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8">
                  "{testimonials[activeTestimonial].text}"
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-dark font-bold text-lg">
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <div>
                      <p className="text-white font-bold">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-gold text-sm">
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-white/40 text-sm">Purchased:</p>
                    <p className="text-gold text-sm font-medium">
                      {testimonials[activeTestimonial].car}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeTestimonial
                        ? "bg-gold w-8"
                        : "bg-gold/30 hover:bg-gold/50"
                    }`}
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
            Trusted by the World's Finest Brands
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
                Ready to Find Your
                <br />
                <span className="text-gold">Dream Car?</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Join satisfied clients who found their perfect vehicle with Drive X. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/inventory">
                  <Button
                    size="lg"
                    className="bg-gold hover:bg-gold-light text-dark font-bold px-8 py-6 shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    Browse Inventory
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gold/50 text-gold hover:bg-gold/10 px-8 py-6"
                  >
                    Create Account
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
