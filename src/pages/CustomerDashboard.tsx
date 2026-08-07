import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import {
  User,
  LogOut,
  Heart,
  MessageSquare,
  Settings,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearCustomerAuthTokens, getCustomerAccessToken, setCustomerSessionProfile } from "@/lib/api";
import { getCurrentCustomer, getFavoriteCars, getMyLeads, updateMyProfile } from "@/lib/public-api";
import type { ApiCar, LeadResponse, CustomerProfile } from "@/lib/api-types";
import { resolveAssetUrl } from "@/lib/api";
import { useI18n, type MessageKey } from "@/lib/i18n";

type Tab = "inquiries" | "favorites" | "profile";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>("inquiries");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [leads, setLeads] = useState<(LeadResponse & { car?: { brand: string; model: string; year: number; imageUrl?: string } })[]>([]);
  const [favorites, setFavorites] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const statusConfig: Record<string, { labelKey: MessageKey; color: string; icon: typeof Clock }> = useMemo(() => ({
    NEW: { labelKey: "statusNew", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Clock },
    CONTACTED: { labelKey: "statusContacted", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: Phone },
    NEGOTIATING: { labelKey: "statusInNegotiation", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: AlertCircle },
    APPROVED: { labelKey: "statusApproved", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: CheckCircle },
    REJECTED: { labelKey: "statusRejected", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
    CLOSED: { labelKey: "statusClosed", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: CheckCircle },
  }), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileData, leadsData, favsData] = await Promise.all([
        getCurrentCustomer(),
        getMyLeads({ page: 1, limit: 50 }),
        getFavoriteCars(),
      ]);
      setProfile(profileData);
      setProfileForm({ fullName: profileData.fullName, phone: profileData.phone ?? "" });
      setLeads(leadsData.items);
      setFavorites(favsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadDashboard"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!getCustomerAccessToken()) {
      navigate("/login");
      return;
    }
    loadData();
  }, [loadData, navigate]);

  const handleLogout = () => {
    clearCustomerAuthTokens();
    navigate("/");
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const updated = await updateMyProfile({
        fullName: profileForm.fullName || undefined,
        phone: profileForm.phone || undefined,
      });
      setProfile(updated);
      setCustomerSessionProfile(updated);
      setProfileMessage(t("profileUpdatedSuccess"));
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : t("failedToUpdateProfile"));
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-[#121826] rounded-xl border border-[#00D2FF]/10 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <div className="h-12 w-12 rounded-full bg-[#00D2FF]/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-[#00D2FF]" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{profile?.fullName ?? "Customer"}</p>
                  <p className="text-white/50 text-xs truncate">{profile?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {([
                  { key: "inquiries" as Tab, labelKey: "myInquiries" as const, icon: MessageSquare, count: leads.length },
                  { key: "favorites" as Tab, labelKey: "myFavorites" as const, icon: Heart, count: favorites.length },
                  { key: "profile" as Tab, labelKey: "profile" as const, icon: Settings },
                ]).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.key
                        ? "bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {t(item.labelKey)}
                    {item.count !== undefined && (
                      <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">{item.count}</span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm mb-6">
                {error}
              </div>
            )}

            {/* My Inquiries Tab */}
            {activeTab === "inquiries" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">{t("myInquiries")}</h2>
                {leads.length === 0 ? (
                  <div className="bg-[#121826] rounded-xl border border-white/10 p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 mb-4">{t("noInquiriesYet")}</p>
                    <Link to="/inventory">
                      <Button className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold">
                        <Car className="w-4 h-4 mr-2" />
                        {t("browseInventoryBtn")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leads.map((lead) => {
                      const cfg = statusConfig[lead.status] ?? statusConfig.NEW;
                      const StatusIcon = cfg.icon;
                      return (
                        <div key={lead.id} className="bg-[#121826] rounded-xl border border-white/10 p-5 hover:border-[#00D2FF]/20 transition-colors">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {lead.car && (
                              <div className="w-full sm:w-32 h-24 rounded-lg bg-white/5 overflow-hidden shrink-0">
                                {lead.car.imageUrl ? (
                                  <img src={resolveAssetUrl(lead.car.imageUrl)} alt={`${lead.car.brand} ${lead.car.model}`} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Car className="w-8 h-8 text-white/20" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <div>
                                  {lead.car && (
                                    <h3 className="text-white font-semibold">{lead.car.brand} {lead.car.model} {lead.car.year}</h3>
                                  )}
                                  <p className="text-white/50 text-sm flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {t(cfg.labelKey)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                                <span className="px-2 py-0.5 rounded bg-white/5">{lead.intent === "BUY" ? t("purchase") : t("rental")}</span>
                                {lead.city && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {lead.city}
                                  </span>
                                )}
                              </div>
                              {lead.message && (
                                <p className="text-white/50 text-sm mt-2 line-clamp-2">{lead.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* My Favorites Tab */}
            {activeTab === "favorites" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">{t("myFavorites")}</h2>
                {favorites.length === 0 ? (
                  <div className="bg-[#121826] rounded-xl border border-white/10 p-12 text-center">
                    <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 mb-4">{t("noFavoritesYet")}</p>
                    <Link to="/inventory">
                      <Button className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold">
                        <Car className="w-4 h-4 mr-2" />
                        {t("browseInventoryBtn")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((car) => (
                      <Link
                        key={car.id}
                        to={`/car/${car.id}`}
                        className="bg-[#121826] rounded-xl border border-white/10 overflow-hidden hover:border-[#00D2FF]/30 transition-colors group"
                      >
                        <div className="h-40 bg-white/5 overflow-hidden">
                          {car.images?.[0] ? (
                            <img
                              src={resolveAssetUrl(car.images[0].url ?? car.images[0].imageUrl)}
                              alt={`${car.brand} ${car.model}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-10 h-10 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold group-hover:text-[#00D2FF] transition-colors">
                            {car.brand} {car.model}
                          </h3>
                          <p className="text-white/50 text-sm">{car.year} · {car.specs?.engine}</p>
                          {car.salePrice && (
                            <p className="text-[#00D2FF] font-bold mt-1">
                              ${car.salePrice.amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">{t("profileSettings")}</h2>
                <div className="bg-[#121826] rounded-xl border border-white/10 p-6">
                  <form onSubmit={handleProfileSave} className="space-y-5 max-w-md">
                    {profileMessage && (
                      <div className={`rounded-lg p-3 text-sm ${
                        profileMessage.includes("success") || profileMessage.includes("بنجاح")
                          ? "bg-green-500/10 border border-green-500/30 text-green-400"
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      }`}>
                        {profileMessage}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-white/70 text-sm font-medium">{t("email")}</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                          type="email"
                          value={profile?.email ?? ""}
                          disabled
                          className="pl-10 bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-white/30 text-xs">{t("emailCannotBeChanged")}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/70 text-sm font-medium">{t("fullName")}</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D2FF] focus:ring-[#00D2FF]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/70 text-sm font-medium">{t("phone")}</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+963 900 000 000"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D2FF] focus:ring-[#00D2FF]/20"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold"
                    >
                      {savingProfile ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {t("saveChanges")}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
