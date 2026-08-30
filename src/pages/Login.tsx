import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, LogIn, Car, ArrowLeft, Mail, Lock, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAdminSessionProfile } from "@/lib/api";
import { getCurrentAdmin, loginAdmin } from "@/lib/auth-api";
import { loginCustomer } from "@/lib/public-api";
import { useI18n } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";

type LoginMode = "customer" | "admin";

export default function Login() {
  const { t } = useI18n();
  const [mode, setMode] = useState<LoginMode>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("pleaseEnterEmailPassword"));
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "admin") {
        await loginAdmin(email, password);
        const admin = await getCurrentAdmin().catch(() => undefined);
        setAdminSessionProfile({
          email: admin?.email ?? email,
          name: admin?.fullName ?? "Seller User",
          role: admin?.role ?? "OWNER",
        });
        navigate("/dashboard");
      } else {
        await loginCustomer(email, password);
        navigate("/inventory");
      }
    } catch (error) {
      setError(localizeError(error, t, "loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setError("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-dark flex pt-24">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/login-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow">
              <Car className="w-5 h-5 text-dark font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-wider">DRIVE X</span>
              <span className="text-[10px] text-gold tracking-[0.2em] -mt-1">MARKET</span>
            </div>
          </Link>

          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              {t("welcomeBackTo")}
              <br />
              <span className="text-gold">{t("welcomeBackHighlight")}</span>
            </h2>
            <p className="text-white/60 text-lg max-w-md">
              {mode === "customer" ? t("customerLoginDesc") : t("adminLoginDesc")}
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/40 text-sm">
            <span>{t("trustedByClients")}</span>
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span>{t("premiumMarketplace")}</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-8 lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t("signIn")}</h1>
            <p className="text-white/60">
              {mode === "customer" ? (
                <>
                  {t("dontHaveAccount")}{" "}
                  <Link to="/register" className="text-gold hover:text-gold-light font-medium">
                    {t("createOne")}
                  </Link>
                </>
              ) : (
                t("signInToAdmin")
              )}
            </p>
            {mode === "admin" && (
              <p className="text-white/40 text-xs mt-3">
                Platform administrator?{" "}
                <Link to="/admin-login" className="text-gold hover:text-gold-light font-medium">
                  Use admin portal
                </Link>
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-dark-card rounded-lg p-1 mb-6 border border-gold/10">
            <button
              type="button"
              onClick={() => switchMode("customer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                mode === "customer"
                  ? "bg-gold text-dark shadow-glow"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <User className="w-4 h-4" />
              {t("customer")}
            </button>
            <button
              type="button"
              onClick={() => switchMode("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                mode === "admin"
                  ? "bg-gold text-dark shadow-glow"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Shield className="w-4 h-4" />
              {t("seller")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">{t("emailAddress")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="email"
                  placeholder={mode === "customer" ? "you@example.com" : "seller@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">{t("password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-gold hover:text-gold-light text-sm font-medium">
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {t("signInAs")} {mode === "customer" ? t("customer") : t("seller")}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
