import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Car, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetAdminPassword } from "@/lib/auth-api";
import { resetCustomerPassword } from "@/lib/public-api";
import { useI18n } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const token = searchParams.get("token") ?? "";
  const type = searchParams.get("type") === "admin" ? "admin" : "customer";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const invalidLink = !token;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError(t("pleaseEnterEmailPassword"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setIsLoading(true);
    try {
      if (type === "admin") {
        await resetAdminPassword(token, password);
      } else {
        await resetCustomerPassword(token, password);
      }
      setSuccess(true);
    } catch (error) {
      setError(localizeError(error, t, "loginFailed"));
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
              <span className="text-[10px] text-gold tracking-[0.2em] -mt-1">MARKET</span>
            </div>
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-gold text-sm">
              <KeyRound className="h-4 w-4" />
              {t("resetPasswordTitle")}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">{t("resetPasswordTitle")}</h2>
            <p className="text-white/60 text-lg max-w-md">{t("resetPasswordSubtitle")}</p>
          </div>

          <p className="text-white/40 text-sm">{t("trustedByClients")}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link
            to={type === "admin" ? "/login" : "/login"}
            className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToSignIn")}
          </Link>

          {invalidLink ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {t("invalidResetLink")}
            </div>
          ) : success ? (
            <div className="space-y-5">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 text-sm">
                {t("passwordResetSuccess")}
              </div>
              <Button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all"
              >
                {t("goToSignIn")}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t("resetPasswordTitle")}</h1>
                <p className="text-white/60">{t("resetPasswordSubtitle")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t("newPassword")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="password"
                      placeholder={t("newPasswordPlaceholder")}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t("confirmPassword")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="password"
                      placeholder={t("repeatPassword")}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                    />
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
                    t("resetPasswordButton")
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}