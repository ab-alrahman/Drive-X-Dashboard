import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  ChevronRight,
  Star,
  Gauge,
  Fuel,
  Calendar,
  Palette,
  Cog,
  Zap,
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  Check,
  Shield,
  Clock,
  Award,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerAccessToken } from "@/lib/api";
import { mapApiCarToView, mapApiCarsToView, type CarView } from "@/lib/car-mapper";
import { addFavoriteCar, createLead, getFavoriteCars, getPublicCar, getPublicCars, removeFavoriteCar } from "@/lib/public-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [car, setCar] = useState<CarView | null>(null);
  const [relatedCars, setRelatedCars] = useState<CarView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    getPublicCar(id)
      .then((response) => {
        setCar(mapApiCarToView(response));
      })
      .catch(() => setCar(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    getPublicCars({ page: 1, limit: 6, sortBy: "newest" })
      .then((response) => setRelatedCars(mapApiCarsToView(response.items).filter((c) => c.id !== id).slice(0, 3)))
      .catch(() => setRelatedCars([]));
  }, [id]);

  useEffect(() => {
    if (!id || !getCustomerAccessToken()) return;

    getFavoriteCars()
      .then((response) => setIsFavorite(response.ids.includes(id)))
      .catch(() => undefined);
  }, [id]);

  const toggleFavorite = async () => {
    if (!car) return;
    if (!getCustomerAccessToken()) {
      setFavoriteMessage(t("createAccountOrSignIn"));
      navigate("/register");
      return;
    }

    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    setFavoriteMessage("");

    try {
      if (nextValue) {
        await addFavoriteCar(car.id);
      } else {
        await removeFavoriteCar(car.id);
      }
    } catch (error) {
      setIsFavorite(!nextValue);
      setFavoriteMessage(error instanceof Error ? error.message : t("couldNotUpdateFavorites"));
    }
  };

  const handleLeadSubmit = async () => {
    if (!car) return;
    setSubmitMessage("");
    setSubmitError("");

    try {
      if (!contactForm.name || !contactForm.phone) {
        throw new Error(t("nameAndPhoneRequired"));
      }
      const response = await createLead({
        carId: car.id,
        intent: "BUY",
        fullName: contactForm.name,
        phone: contactForm.phone,
        email: contactForm.email || undefined,
        city: car.city || undefined,
        message: contactForm.message || `Interested in ${car.brand} ${car.model}`,
        requestDelivery: false,
      });
      setSubmitMessage(response.message || t("requestReceived"));
      setContactForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("couldNotSendRequest"));
    }
  };

  const handleShareAction = async (name: string) => {
    if (!car) return;
    const shareUrl = window.location.href;
    const shareText = `${car.brand} ${car.model} - ${shareUrl}`;

    if (name === "Copy Link") {
      await navigator.clipboard?.writeText(shareUrl);
      setShowShare(false);
      return;
    }
    if (name === "WhatsApp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
      return;
    }
    if (name === "Email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(`${car.brand} ${car.model}`)}&body=${encodeURIComponent(shareText)}`;
      return;
    }
    window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pt-20">
        <div className="text-gold font-semibold">{t("loadingVehicle")}</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">{t("carNotFound")}</h2>
          <Link to="/inventory">
            <Button className="bg-gold hover:bg-gold-light text-dark">
              {t("browseInventoryBtn")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { icon: Calendar, labelKey: "year" as const, value: car.year },
    { icon: Gauge, labelKey: "mileage" as const, value: car.mileage },
    { icon: Fuel, labelKey: "fuelType" as const, value: car.fuelType },
    { icon: Cog, labelKey: "transmission" as const, value: car.transmission },
    { icon: Palette, labelKey: "color" as const, value: car.color },
    { icon: Zap, labelKey: "engineSpec" as const, value: car.engine },
    { icon: Zap, labelKey: "powerSpec" as const, value: car.power },
    { icon: Zap, labelKey: "zeroToHundred" as const, value: car.acceleration },
    { icon: Gauge, labelKey: "topSpeed" as const, value: car.topSpeed },
    { icon: Award, labelKey: "condition" as const, value: car.condition },
  ];

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
          <Link to="/" className="hover:text-gold transition-colors">{t("homeBreadcrumb")}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/inventory" className="hover:text-gold transition-colors">{t("inventory")}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gold">{car.brand} {car.model}</span>
        </div>

        {/* Back Button */}
        <Link to="/inventory">
          <Button variant="ghost" className="text-white/50 hover:text-gold mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToInventory")}
          </Button>
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden border border-gold/20 mb-4">
              <img
                src={car.images[activeImage]}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-gold text-dark text-xs font-bold px-3 py-1.5 rounded-full">
                  {car.condition}
                </span>
                {car.originalPrice && (
                  <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {t("specialOffer")}
                  </span>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className="w-10 h-10 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? "text-red-500 fill-red-500" : "text-white"
                    }`}
                  />
                </button>
                <button
                  onClick={() => setShowShare(true)}
                  className="w-10 h-10 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {car.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeImage ? "border-gold shadow-glow" : "border-transparent hover:border-gold/50"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Car Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {car.brand} {car.model}
                </h1>
                <div className="flex items-center gap-3 text-white/60">
                  <span>{car.year}</span>
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span>{car.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span className="flex items-center gap-1 text-gold">
                    <Star className="w-4 h-4 fill-current" />
                    {car.rating} ({car.reviews} {t("reviews")})
                  </span>
                </div>
              </div>
            </div>
            {favoriteMessage && (
              <div className="mb-4 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
                {favoriteMessage}
              </div>
            )}

            <div className="bg-dark-card border border-gold/20 rounded-xl p-6 mb-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-white/50 text-sm mb-1">{t("price")}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-gold font-bold text-4xl">
                      ${car.price.toLocaleString()}
                    </span>
                    {car.originalPrice && (
                      <span className="text-white/40 text-xl line-through">
                        ${car.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {car.originalPrice && (
                    <p className="text-green-400 text-sm mt-1">
                      {t("save")} ${(car.originalPrice - car.price).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-sm">{t("status")}</p>
                  <span
                    className={`text-sm font-semibold ${
                      car.status === "available"
                        ? "text-green-400"
                        : car.status === "reserved"
                        ? "text-orange-400"
                        : "text-red-400"
                    }`}
                  >
                    {car.status === "available" ? t("available") : car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowContact(true)}
                  className="bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t("contactDealer")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowContact(true)}
                  className="border-gold/30 text-gold hover:bg-gold/10 py-6"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {t("sendInquiry")}
                </Button>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {specs.slice(0, 6).map((spec) => (
                <div
                  key={spec.labelKey}
                  className="bg-dark-card border border-gold/10 rounded-lg p-3"
                >
                  <spec.icon className="w-4 h-4 text-gold mb-1" />
                  <p className="text-white/50 text-xs">{t(spec.labelKey)}</p>
                  <p className="text-white font-semibold text-sm truncate">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-white font-bold text-lg mb-3">{t("description")}</h3>
              <p className="text-white/60 leading-relaxed">{car.description}</p>
            </div>
          </div>
        </div>

        {/* Features & Specs Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Features */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
              <h3 className="text-white font-bold text-xl mb-6">{t("featuresAndEquipment")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {car.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-white/70 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Specs */}
          <div>
            <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
              <h3 className="text-white font-bold text-xl mb-6">{t("specifications")}</h3>
              <div className="space-y-4">
                {specs.map((spec) => (
                  <div key={spec.labelKey} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/50">
                      <spec.icon className="w-4 h-4" />
                      <span className="text-sm">{t(spec.labelKey)}</span>
                    </div>
                    <span className="text-white font-medium text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, titleKey: "verifiedVehicle" as const, descKey: "verifiedVehicleDesc" as const },
            { icon: Clock, titleKey: "warrantyIncluded" as const, descKey: "warrantyIncludedDesc" as const },
            { icon: Award, titleKey: "moneyBackGuarantee" as const, descKey: "moneyBackGuaranteeDesc" as const },
          ].map((item) => (
            <div key={item.titleKey} className="bg-dark-card border border-gold/10 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h4 className="text-white font-semibold">{t(item.titleKey)}</h4>
                <p className="text-white/50 text-sm">{t(item.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Related Cars */}
        {relatedCars.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-2xl">{t("similarVehicles")}</h3>
              <Link to="/inventory">
                <Button variant="ghost" className="text-gold hover:text-gold-light hover:bg-gold/10">
                  {t("viewAll")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCars.map((related) => (
                <Link
                  key={related.id}
                  to={`/car/${related.id}`}
                  className="group bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={related.image}
                      alt={`${related.brand} ${related.model}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent" />
                  </div>
                  <div className="p-5">
                    <h4 className="text-white font-bold group-hover:text-gold transition-colors">
                      {related.brand} {related.model}
                    </h4>
                    <p className="text-gold font-bold mt-2">${related.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {t("contactDealer")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-dark p-4 rounded-lg border border-gold/20">
              <p className="text-gold font-bold text-lg">{car.brand} {car.model}</p>
              <p className="text-white/60">${car.price.toLocaleString()}</p>
            </div>
            <div className="space-y-3">
              <Input
                placeholder={t("yourName")}
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="bg-dark border-gold/20 text-white placeholder:text-white/30"
              />
              <Input
                type="email"
                placeholder={t("emailAddress")}
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="bg-dark border-gold/20 text-white placeholder:text-white/30"
              />
              <Input
                type="tel"
                placeholder={t("phoneNumber")}
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="bg-dark border-gold/20 text-white placeholder:text-white/30"
              />
              <Textarea
                placeholder={t("yourMessage")}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="bg-dark border-gold/20 text-white placeholder:text-white/30 min-h-[100px]"
              />
            </div>
            {submitMessage && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                {submitMessage}
              </div>
            )}
            {submitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {submitError}
              </div>
            )}
            <Button onClick={handleLeadSubmit} className="w-full bg-gold hover:bg-gold-light text-dark font-bold">
              <Mail className="w-5 h-5 mr-2" />
              {t("sendMessage")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{t("shareThisCar")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: "copyLink" as const, icon: Share2, shareKey: "Copy Link" },
              { name: "whatsapp" as const, icon: Phone, shareKey: "WhatsApp" },
              { name: "emailShare" as const, icon: Mail, shareKey: "Email" },
              { name: "messageShare" as const, icon: MessageSquare, shareKey: "Message" },
            ].map((item) => (
              <button
                key={item.shareKey}
                onClick={() => handleShareAction(item.shareKey)}
                className="flex flex-col items-center gap-2 p-3 bg-dark border border-gold/20 rounded-lg hover:border-gold/50 transition-colors"
              >
                <item.icon className="w-6 h-6 text-gold" />
                <span className="text-white/60 text-xs">{t(item.name)}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
