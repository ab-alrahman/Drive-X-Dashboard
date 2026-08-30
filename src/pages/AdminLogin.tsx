import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Car, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearAuthTokens, setAdminSessionProfile } from "@/lib/api";
import { getCurrentAdmin, loginAdmin } from "@/lib/auth-api";
import { useI18n } from "@/lib/i18n";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("enterAdminEmailPassword"));
      return;
    }

    setIsLoading(true);
    try {
      await loginAdmin(email, password);
      const admin = await getCurrentAdmin();

      if (admin.role !== "PLATFORM_ADMIN") {
        clearAuthTokens();
        setError(t("platformAdminOnlyError"));
        return;
      }

      setAdminSessionProfile({
        email: admin.email,
        name: admin.fullName ?? "Platform Admin",
        role: admin.role,
      });
      navigate("/dashboard");
    } catch (error) {
      clearAuthTokens();
      setError(error instanceof Error ? error.message : t("adminLoginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex pt-24">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/login-bg.jpg)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/30" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow">
              <Car className="w-5 h-5 text-dark font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-wider">DRIVE X</span>
              <span className="text-[10px] text-gold tracking-[0.2em] -mt-1">{t("platform").toUpperCase()}</span>
            </div>
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-gold text-sm">
              <ShieldCheck className="h-4 w-4" />
              {t("platformAdministration")}
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{t("driveXAdminPortal")}</h1>
            <p className="text-white/60 text-lg max-w-md">
              {t("platformAdminPortalDesc")}
            </p>
          </div>

          <p className="text-white/40 text-sm">{t("sellerAccountsRegularLogin")}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{t("platformAdminSignIn")}</h2>
            <p className="text-white/60">{t("platformAdminSignInDesc")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">{t("adminEmail")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="email"
                  placeholder="admin@drivex.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  {t("signInAsPlatformAdmin")}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            {t("sellerOrDealershipAccount")}{" "}
            <Link to="/login" className="text-gold hover:text-gold-light font-medium">
              {t("useSellerLogin")}
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
