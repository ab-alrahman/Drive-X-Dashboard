import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router";
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
  Wrench,
  FileText,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearCustomerAuthTokens, getCustomerAccessToken, setCustomerSessionProfile } from "@/lib/api";
import {
  approveMaintenanceQuote,
  cancelMaintenanceRequest,
  createMaintenanceRequest,
  getCurrentCustomer,
  getFavoriteCars,
  getMyCars,
  getMyLeads,
  getMyMaintenanceRequest,
  getMyMaintenanceRequests,
  rejectMaintenanceQuote,
  updateMyProfile,
  uploadMaintenanceRequestFile,
} from "@/lib/public-api";
import type { ApiCar, LeadResponse, CustomerProfile, CustomerCarAsset, MaintenanceRequest, MaintenanceRequestType } from "@/lib/api-types";
import { resolveAssetUrl } from "@/lib/api";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = "cars" | "maintenance" | "inquiries" | "favorites" | "profile";

const maintenanceTypes: Array<{ value: MaintenanceRequestType; label: string }> = [
  { value: "ROUTINE_SERVICE", label: "Routine service" },
  { value: "REPAIR", label: "Repair" },
  { value: "DIAGNOSTIC", label: "Diagnostic" },
  { value: "BODY_PAINT", label: "Body / paint" },
  { value: "TIRES_BRAKES", label: "Tires / brakes" },
  { value: "OTHER", label: "Other" },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>("cars");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [leads, setLeads] = useState<(LeadResponse & { car?: { brand: string; model: string; year: number; imageUrl?: string } })[]>([]);
  const [favorites, setFavorites] = useState<ApiCar[]>([]);
  const [myCars, setMyCars] = useState<CustomerCarAsset[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [maintenanceDetailOpen, setMaintenanceDetailOpen] = useState(false);
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState<MaintenanceRequest | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CustomerCarAsset | null>(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [maintenanceFile, setMaintenanceFile] = useState<File | null>(null);
  const [maintenanceDetailMessage, setMaintenanceDetailMessage] = useState("");
  const [maintenanceForm, setMaintenanceForm] = useState({
    requestType: "ROUTINE_SERVICE" as MaintenanceRequestType,
    city: "",
    preferredTime: "",
    pickupNeeded: false,
    contactPhone: "",
    notes: "",
  });

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
      const [profileData, leadsData, favsData, carsData, maintenanceData] = await Promise.all([
        getCurrentCustomer(),
        getMyLeads({ page: 1, limit: 50 }),
        getFavoriteCars(),
        getMyCars(),
        getMyMaintenanceRequests({ page: 1, limit: 50 }),
      ]);
      setProfile(profileData);
      setProfileForm({ fullName: profileData.fullName, phone: profileData.phone ?? "" });
      setLeads(leadsData.items);
      setFavorites(favsData.items);
      setMyCars(carsData);
      setMaintenanceRequests(maintenanceData.items);
      setMaintenanceForm((current) => ({ ...current, contactPhone: profileData.phone ?? "" }));
    } catch (err) {
      setError(localizeError(err, t, "failedToLoadDashboard"));
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

  useEffect(() => {
    const requestedTab = new URLSearchParams(location.search).get("tab");
    if (requestedTab === "cars" || requestedTab === "maintenance" || requestedTab === "inquiries" || requestedTab === "favorites" || requestedTab === "profile") {
      setActiveTab(requestedTab);
    }
  }, [location.search]);

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
      setProfileMessage(localizeError(err, t, "failedToUpdateProfile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const openMaintenanceDialog = (asset: CustomerCarAsset) => {
    setSelectedAsset(asset);
    setMaintenanceMessage("");
    setMaintenanceForm({
      requestType: "ROUTINE_SERVICE",
      city: "",
      preferredTime: "",
      pickupNeeded: false,
      contactPhone: profile?.phone ?? "",
      notes: "",
    });
    setMaintenanceDialogOpen(true);
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setSavingMaintenance(true);
    setMaintenanceMessage("");
    try {
      await createMaintenanceRequest({
        carId: selectedAsset.car.id,
        dealId: selectedAsset.dealId,
        requestType: maintenanceForm.requestType,
        city: maintenanceForm.city,
        preferredTime: maintenanceForm.preferredTime ? new Date(maintenanceForm.preferredTime).toISOString() : undefined,
        pickupNeeded: maintenanceForm.pickupNeeded,
        contactPhone: maintenanceForm.contactPhone,
        notes: maintenanceForm.notes,
      });
      const maintenanceData = await getMyMaintenanceRequests({ page: 1, limit: 50 });
      setMaintenanceRequests(maintenanceData.items);
      setMaintenanceDialogOpen(false);
      setActiveTab("maintenance");
    } catch (err) {
      setMaintenanceMessage(localizeError(err, t, "errCreateMaintenance"));
    } finally {
      setSavingMaintenance(false);
    }
  };

  const refreshMaintenance = async () => {
    const maintenanceData = await getMyMaintenanceRequests({ page: 1, limit: 50 });
    setMaintenanceRequests(maintenanceData.items);
  };

  const openMaintenanceDetail = async (requestId: string) => {
    setMaintenanceDetailMessage("");
    setMaintenanceFile(null);
    const request = await getMyMaintenanceRequest(requestId);
    setSelectedMaintenanceRequest(request);
    setMaintenanceDetailOpen(true);
  };

  const refreshSelectedMaintenanceRequest = async () => {
    if (!selectedMaintenanceRequest) return;
    const request = await getMyMaintenanceRequest(selectedMaintenanceRequest.id);
    setSelectedMaintenanceRequest(request);
    await refreshMaintenance();
  };

  const handleMaintenanceFileUpload = async () => {
    if (!selectedMaintenanceRequest || !maintenanceFile) return;
    setMaintenanceDetailMessage("");
    try {
      await uploadMaintenanceRequestFile(selectedMaintenanceRequest.id, maintenanceFile);
      setMaintenanceFile(null);
      await refreshSelectedMaintenanceRequest();
      setMaintenanceDetailMessage("File uploaded.");
    } catch (err) {
      setMaintenanceDetailMessage(localizeError(err, t, "errUploadFile"));
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
                  { key: "cars" as Tab, labelKey: "inventory" as const, icon: Car, count: myCars.length },
                  { key: "maintenance" as Tab, labelKey: "contact" as const, icon: Wrench, count: maintenanceRequests.length },
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

            {activeTab === "cars" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">My Cars</h2>
                {myCars.length === 0 ? (
                  <div className="bg-[#121826] rounded-xl border border-white/10 p-12 text-center">
                    <Car className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 mb-4">Closed Drive X deals will appear here.</p>
                    <Link to="/inventory">
                      <Button className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold">
                        <Car className="w-4 h-4 mr-2" />
                        {t("browseInventoryBtn")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myCars.map((asset) => (
                      <div key={asset.dealId} className="bg-[#121826] rounded-xl border border-white/10 overflow-hidden">
                        <Link to={`/car/${asset.car.id}`} className="block h-40 bg-white/5 overflow-hidden">
                          {asset.car.imageUrl ? (
                            <img src={resolveAssetUrl(asset.car.imageUrl)} alt={`${asset.car.brand} ${asset.car.model}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-10 h-10 text-white/20" />
                            </div>
                          )}
                        </Link>
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-white font-semibold">{asset.car.brand} {asset.car.model}</h3>
                            <p className="text-white/50 text-sm">{asset.car.year} · {asset.dealType === "RENT" ? "Rental" : "Purchase"}</p>
                            {asset.car.vendorName && <p className="text-[#00D2FF] text-xs mt-1">Sold by {asset.car.vendorName}</p>}
                          </div>
                          <Button onClick={() => openMaintenanceDialog(asset)} className="w-full bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold">
                            <Wrench className="w-4 h-4 mr-2" />
                            Request Maintenance
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "maintenance" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Maintenance</h2>
                {maintenanceRequests.length === 0 ? (
                  <div className="bg-[#121826] rounded-xl border border-white/10 p-12 text-center">
                    <Wrench className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 mb-4">No maintenance requests yet.</p>
                    <Button onClick={() => setActiveTab("cars")} className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold">
                      View My Cars
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRequests.map((request) => (
                      <div key={request.id} className="bg-[#121826] rounded-xl border border-white/10 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-white font-semibold">
                              {request.car ? `${request.car.brand} ${request.car.model} ${request.car.year}` : "Drive X car"}
                            </h3>
                            <p className="text-white/50 text-sm">{request.requestType.replaceAll("_", " ")} · {request.city}</p>
                            <p className="text-white/40 text-xs mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20 text-xs font-medium">
                            {request.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mt-3">{request.notes}</p>
                        {request.quote && (
                          <div className="mt-3 rounded-lg border border-gold/20 bg-gold/10 p-3 text-sm text-white/80">
                            Quote: {request.quote.amount.toLocaleString()} {request.quote.currency}
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMaintenanceDetail(request.id)}
                            className="border-white/20 text-white/80 hover:bg-white/10"
                          >
                            Details
                          </Button>
                          {request.status === "WAITING_CUSTOMER_APPROVAL" && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                await approveMaintenanceQuote(request.id);
                                await refreshMaintenance();
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Approve Quote
                            </Button>
                          )}
                          {!["IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"].includes(request.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await cancelMaintenanceRequest(request.id);
                                await refreshMaintenance();
                              }}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="bg-[#121826] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Maintenance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
            {selectedAsset && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                {selectedAsset.car.brand} {selectedAsset.car.model} {selectedAsset.car.year}
              </div>
            )}
            {maintenanceMessage && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{maintenanceMessage}</div>}
            <Select value={maintenanceForm.requestType} onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, requestType: value as MaintenanceRequestType })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#121826] border-white/10">
                {maintenanceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={maintenanceForm.city}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, city: e.target.value })}
              placeholder="City / area"
              required
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              type="datetime-local"
              value={maintenanceForm.preferredTime}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, preferredTime: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              value={maintenanceForm.contactPhone}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, contactPhone: e.target.value })}
              placeholder="Contact phone"
              required
              className="bg-white/5 border-white/10 text-white"
            />
            <Textarea
              value={maintenanceForm.notes}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
              placeholder="Describe the issue or service needed"
              required
              className="bg-white/5 border-white/10 text-white min-h-28"
            />
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={maintenanceForm.pickupNeeded}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, pickupNeeded: e.target.checked })}
              />
              Pickup or delivery needed
            </label>
            <Button type="submit" disabled={savingMaintenance} className="w-full bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold">
              {savingMaintenance && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={maintenanceDetailOpen} onOpenChange={setMaintenanceDetailOpen}>
        <DialogContent className="bg-[#121826] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Maintenance Details</DialogTitle>
          </DialogHeader>
          {selectedMaintenanceRequest && (
            <div className="space-y-5">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white font-semibold">
                      {selectedMaintenanceRequest.car
                        ? `${selectedMaintenanceRequest.car.brand} ${selectedMaintenanceRequest.car.model} ${selectedMaintenanceRequest.car.year}`
                        : "Drive X car"}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {selectedMaintenanceRequest.requestType.replaceAll("_", " ")} · {selectedMaintenanceRequest.city}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20 text-xs font-medium">
                    {selectedMaintenanceRequest.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-3">{selectedMaintenanceRequest.notes}</p>
                {selectedMaintenanceRequest.quote && (
                  <div className="mt-4 rounded-lg border border-gold/20 bg-gold/10 p-3">
                    <p className="text-white text-sm font-medium">
                      Quote: {selectedMaintenanceRequest.quote.amount.toLocaleString()} {selectedMaintenanceRequest.quote.currency}
                    </p>
                    {selectedMaintenanceRequest.status === "WAITING_CUSTOMER_APPROVAL" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await approveMaintenanceQuote(selectedMaintenanceRequest.id);
                            await refreshSelectedMaintenanceRequest();
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Approve Quote
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await rejectMaintenanceQuote(selectedMaintenanceRequest.id, { note: "Customer rejected the quote from dashboard." });
                            await refreshSelectedMaintenanceRequest();
                          }}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Reject Quote
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {maintenanceDetailMessage && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                  {maintenanceDetailMessage}
                </div>
              )}

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#00D2FF]" />
                  Attachments
                </h4>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(event) => setMaintenanceFile(event.target.files?.[0] ?? null)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    type="button"
                    disabled={!maintenanceFile}
                    onClick={handleMaintenanceFileUpload}
                    className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold"
                  >
                    Upload
                  </Button>
                </div>
                {selectedMaintenanceRequest.files && selectedMaintenanceRequest.files.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMaintenanceRequest.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-[#00D2FF] hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        {file.fileType ?? "Attachment"} · {new Date(file.createdAt).toLocaleDateString()}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">No attachments yet.</p>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="text-white font-semibold mb-3">Timeline</h4>
                {selectedMaintenanceRequest.updates && selectedMaintenanceRequest.updates.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMaintenanceRequest.updates.map((update) => (
                      <div key={update.id} className="border-l border-[#00D2FF]/30 pl-3">
                        <p className="text-white/70 text-sm">
                          {update.statusTo ? update.statusTo.replaceAll("_", " ") : update.authorRole}
                        </p>
                        {update.note && <p className="text-white/50 text-sm">{update.note}</p>}
                        <p className="text-white/30 text-xs">{new Date(update.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">No updates yet.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
