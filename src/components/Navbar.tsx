import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu,
  X,
  Car,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Heart,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearCustomerAuthTokens,
  clearAuthTokens,
  getAdminSessionProfile,
  getCustomerSessionProfile,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const session = (() => {
    try {
      const auth = getAdminSessionProfile();
      const customer = getCustomerSessionProfile();

      if (auth) {
        const parsed = JSON.parse(auth) as { name?: string; role?: string };
        return {
          isLoggedIn: true,
          isAdminLoggedIn: true,
          accountLabel: parsed.name ?? "Seller User",
          role: parsed.role,
        };
      }

      if (customer) {
        const parsed = JSON.parse(customer) as { fullName?: string };
        return {
          isLoggedIn: true,
          isAdminLoggedIn: false,
          accountLabel: parsed.fullName ?? "Customer",
          role: "CUSTOMER",
        };
      }
    } catch {
      return {
        isLoggedIn: false,
        isAdminLoggedIn: false,
        accountLabel: "Customer",
        role: undefined,
      };
    }

    return {
      isLoggedIn: false,
      isAdminLoggedIn: false,
      accountLabel: "Customer",
      role: undefined,
    };
  })();

  const accountTypeLabel = session.role === "PLATFORM_ADMIN"
    ? t("platformAdmin")
    : session.isAdminLoggedIn
      ? t("seller")
      : t("customer");
  const nextLanguage = language === "en" ? "ar" : "en";
  const languageLabel = nextLanguage.toUpperCase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearAuthTokens();
    clearCustomerAuthTokens();
    navigate("/");
  };

  const navLinks = [
    { name: t("home"), path: "/" },
    { name: t("inventory"), path: "/inventory" },
    { name: t("about"), path: "/about" },
    { name: t("contact"), path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-dark/95 backdrop-blur-md border-b border-gold/20 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
              <Car className="w-5 h-5 text-dark font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-wider">
                DRIVE X
              </span>
              <span className="text-[10px] text-gold tracking-[0.2em] -mt-1">
                MARKET
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? "text-gold bg-gold/10"
                    : "text-white/70 hover:text-gold hover:bg-gold/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/inventory">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-gold hover:bg-gold/10"
              >
                <Search className="w-4 h-4 mr-2" />
                {t("search")}
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(nextLanguage)}
              className="min-w-12 border-gold/30 text-gold hover:bg-gold/10"
            >
              {languageLabel}
            </Button>

            {session.isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full bg-gold/10 border border-gold/30 hover:bg-gold/20"
                  >
                    <User className="h-5 w-5 text-gold" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-dark-card border-gold/30"
                  align="end"
                >
                  <div className="flex items-center gap-2 p-3 border-b border-gold/20">
                    <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {session.accountLabel}
                      </p>
                      <p className="text-xs text-gold">{accountTypeLabel}</p>
                    </div>
                  </div>
                  {session.isAdminLoggedIn && (
                    <>
                      <DropdownMenuItem
                        onClick={() => navigate("/dashboard")}
                        className="text-white/80 hover:text-gold hover:bg-gold/10 cursor-pointer"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t("dashboard")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/maintenance-shops")}
                        className="text-white/80 hover:text-gold hover:bg-gold/10 cursor-pointer"
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        {t("maintenanceShops")}
                      </DropdownMenuItem>
                    </>
                  )}
                  {!session.isAdminLoggedIn && session.isLoggedIn && (
                    <DropdownMenuItem
                      onClick={() => navigate("/my-dashboard")}
                      className="text-white/80 hover:text-gold hover:bg-gold/10 cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("myDashboard")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => navigate(session.isAdminLoggedIn ? "/dashboard" : "/my-dashboard?tab=favorites")}
                    className="text-white/80 hover:text-gold hover:bg-gold/10 cursor-pointer"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {t("myFavorites")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gold/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-gold hover:bg-gold/10"
                  >
                    {t("signIn")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-gold hover:bg-gold-light text-dark font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300"
                  >
                    {t("getStarted")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-card/95 backdrop-blur-md border-t border-gold/20 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "text-gold bg-gold/10"
                      : "text-white/70 hover:text-gold hover:bg-gold/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="px-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(nextLanguage)}
                  className="w-full border-gold/30 text-gold hover:bg-gold/10"
                >
                  {languageLabel}
                </Button>
              </div>

              <div className="border-t border-gold/20 pt-3 mt-2">
                {session.isLoggedIn ? (
                  <>
                    {session.isAdminLoggedIn && (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-gold"
                        >
                          <LayoutDashboard className="w-4 h-4" /> {t("dashboard")}
                        </Link>
                        <Link
                          to="/maintenance-shops"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-gold"
                        >
                          <Wrench className="w-4 h-4" /> {t("maintenanceShops")}
                        </Link>
                      </>
                    )}
                    {!session.isAdminLoggedIn && session.isLoggedIn && (
                      <Link
                        to="/my-dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-gold"
                      >
                        <LayoutDashboard className="w-4 h-4" /> {t("myDashboard")}
                      </Link>
                    )}
                    {!session.isAdminLoggedIn && session.isLoggedIn && (
                      <Link
                        to="/my-dashboard?tab=favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-gold"
                      >
                        <Heart className="w-4 h-4" /> {t("myFavorites")}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-3 text-red-400 w-full"
                    >
                      <LogOut className="w-4 h-4" /> {t("logout")}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-gold/30 text-gold hover:bg-gold/10"
                      >
                        {t("signIn")}
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-gold hover:bg-gold-light text-dark font-semibold">
                        {t("getStarted")}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
