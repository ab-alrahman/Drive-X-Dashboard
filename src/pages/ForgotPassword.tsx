import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Car, KeyRound, Mail, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotAdminPassword } from "@/lib/auth-api";
import { forgotCustomerPassword } from "@/lib/public-api";
import type { PasswordResetRequestResponse } from "@/lib/api-types";
import { useI18n } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";

type ResetMode = "customer" | "admin";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mode, setMode] = useState<ResetMode>("customer");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PasswordResetRequestResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!email) {
      setError(t("pleaseEnterEmailPassword"));
      return;
    }

    setIsLoading(true);
    try {
      const response =
        mode === "admin" ? await forgotAdminPassword(email) : await forgotCustomerPassword(email);

      if (!response.resetToken) {
        setError(t("noResetAccountFound"));
        return;
      }

      setResult(response);
    } catch (error) {
      setError(localizeError(error, t, "loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: ResetMode) => {
    setMode(next);
    setError("");
    setResult(null);
    setEmail("");
  };

  const resetUrl = result?.resetToken
    ? `${window.location.origin}/reset-password?token=${result.resetToken}&type=${mode}`
    : "";

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
              {t("forgotPasswordTitle")}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              {t("forgotPasswordTitle")}
            </h2>
            <p className="text-white/60 text-lg max-w-md">
              {t("forgotPasswordSubtitle")}
            </p>
          </div>

          <p className="text-white/40 text-sm">{t("trustedByClients")}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {t("backToSignIn")}
          </Link>

          {result ? (
            <div className="space-y-5">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 font-medium mb-1">{t("resetLinkReady")}</p>
                <p className="text-white/70 text-sm">
                  {t("resetLinkReadyDesc").replace("{email}", result.email ?? email)}
                </p>
              </div>

              <div className="rounded-lg border border-gold/20 bg-dark-card p-4">
                <Link
                  to={resetUrl}
                  className="text-gold hover:text-gold-light font-medium underline break-all text-sm"
                >
                  {resetUrl}
                </Link>
              </div>

              <Button
                type="button"
                onClick={() => navigate(resetUrl)}
                className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all"
              >
                {t("openResetLink")}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t("forgotPasswordTitle")}</h1>
                <p className="text-white/60">{t("forgotPasswordSubtitle")}</p>
              </div>

              <div className="flex bg-dark-card rounded-lg p-1 mb-6 border border-gold/10">
                <button
                  type="button"
                  onClick={() => switchMode("customer")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    mode === "customer" ? "bg-gold text-dark shadow-glow" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <User className="w-4 h-4" />
                  {t("customer")}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("admin")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    mode === "admin" ? "bg-gold text-dark shadow-glow" : "text-white/50 hover:text-white/80"
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
                  <label className="text-white/70 text-sm font-medium">{t("recoveryEmail")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="email"
                      placeholder={mode === "customer" ? "you@example.com" : "seller@example.com"}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
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
                    t("sendResetLink")
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