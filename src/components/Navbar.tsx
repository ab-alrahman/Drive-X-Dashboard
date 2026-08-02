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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearCustomerAuthTokens, clearAuthTokens } from "@/lib/api";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [accountLabel, setAccountLabel] = useState("Customer");
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem("drive_x_auth");
    const customer = localStorage.getItem("drive_x_customer");
    setIsAdminLoggedIn(!!auth);
    setIsLoggedIn(!!auth || !!customer);
    if (auth) {
      const parsed = JSON.parse(auth);
      setAccountLabel(parsed.name ?? "Admin User");
    } else if (customer) {
      const parsed = JSON.parse(customer);
      setAccountLabel(parsed.fullName ?? "Customer");
    }
  }, [location]);

  const handleLogout = () => {
    clearAuthTokens();
    clearCustomerAuthTokens();
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
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
          {/* Logo */}
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

          {/* Desktop Navigation */}
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

          {/* Right Section */}
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
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="text-white/70 hover:text-gold hover:bg-gold/10"
            >
              {language === "en" ? "العربية" : "English"}
            </Button>

            {isLoggedIn ? (
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
                        {accountLabel}
                      </p>
                      <p className="text-xs text-gold">{isAdminLoggedIn ? t("admin") : t("customer")}</p>
                    </div>
                  </div>
                  {isAdminLoggedIn && (
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      className="text-white/80 hover:text-gold hover:bg-gold/10 cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("dashboard")}
                    </DropdownMenuItem>
                  )}
                  {!isAdminLoggedIn && isLoggedIn && (
                    <DropdownMenuItem
                      onClick={() => navigate("/my-dashboard")}
                      className="text-white/80 hover:text-gold hover:bg-gold/10 cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("myDashboard")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => navigate("/inventory")}
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

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
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
              <div className="border-t border-gold/20 pt-3 mt-2">
                {isLoggedIn ? (
                  <>
                    {isAdminLoggedIn && (
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-gold"
                      >
                      <LayoutDashboard className="w-4 h-4" /> {t("dashboard")}
                      </Link>
                    )}
                    {!isAdminLoggedIn && isLoggedIn && (
                      <Link
                        to="/my-dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-gold"
                      >
                        <LayoutDashboard className="w-4 h-4" /> {t("myDashboard")}
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
