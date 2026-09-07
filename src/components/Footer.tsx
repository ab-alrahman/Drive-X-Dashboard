import { Link } from "react-router";
import { Car, MapPin, GraduationCap, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, type MessageKey } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks: Array<{ labelKey: MessageKey; path: string }> = [
    { labelKey: "home", path: "/" },
    { labelKey: "inventory", path: "/inventory" },
    { labelKey: "about", path: "/about" },
    { labelKey: "contact", path: "/contact" },
    { labelKey: "dashboard", path: "/dashboard" },
  ];

  const services: Array<{ labelKey: MessageKey; path?: string }> = [
    { labelKey: "buyACar", path: "/inventory" },
    { labelKey: "sellYourCar", path: "/vendor-register" },
    { labelKey: "carFinancing" },
    { labelKey: "tradeIn" },
    { labelKey: "vehicleInspection" },
    { labelKey: "premiumWarranty" },
  ];

  return (
    <footer className="bg-darker border-t border-gold/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow">
                <Car className="w-5 h-5 text-dark font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-wider">DRIVE X</span>
                <span className="text-[10px] text-gold tracking-[0.2em] -mt-1">{t("market").toUpperCase()}</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">{t("footerDescription")}</p>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-6 uppercase tracking-wider text-sm">{t("quickLinks")}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/60 hover:text-gold transition-colors duration-300 text-sm">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-6 uppercase tracking-wider text-sm">{t("services")}</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.labelKey}>
                  {service.path ? (
                    <Link to={service.path} className="text-white/60 hover:text-gold transition-colors duration-300 text-sm">
                      {t(service.labelKey)}
                    </Link>
                  ) : (
                    <span className="text-white/60 text-sm">{t(service.labelKey)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-6 uppercase tracking-wider text-sm">{t("contactUs")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">{t("footerAddress")}</span>
              </li>
              <li className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">{t("footerResponsibleParty")}</span>
              </li>
              <li>
                <Link to="/contact" className="text-white/60 hover:text-gold transition-colors text-sm">
                  {t("contactUs")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center md:text-start">
            © {new Date().getFullYear()} Drive X. {t("allRightsReserved")}
            <span className="mx-2 text-gold/40">·</span>
            {t("footerBuiltBy")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="border-gold/30 text-gold hover:bg-gold hover:text-dark shrink-0"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            {t("backToTop")}
          </Button>
        </div>
      </div>
    </footer>
  );
}
