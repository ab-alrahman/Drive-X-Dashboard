import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCustomerAccessToken, getCustomerSessionProfile } from "@/lib/api";
import {
  createMaintenanceRequest,
  getMaintenanceWorkshops,
  getPublicCars,
  requestCarInspection,
} from "@/lib/public-api";
import type {
  ApiCar,
  MaintenanceRequestType,
  MaintenanceWorkshop,
} from "@/lib/api-types";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";

type ServiceMode = "inspection" | "repair";

const maintenanceTypes: Array<{ value: MaintenanceRequestType; labelKey: MessageKey }> = [
  { value: "ROUTINE_SERVICE", labelKey: "mntTypeRoutineService" },
  { value: "REPAIR", labelKey: "mntTypeRepair" },
  { value: "DIAGNOSTIC", labelKey: "mntTypeDiagnostic" },
  { value: "BODY_PAINT", labelKey: "mntTypeBodyPaint" },
  { value: "TIRES_BRAKES", labelKey: "mntTypeTiresBrakes" },
  { value: "OTHER", labelKey: "mntTypeOther" },
];

export default function RequestService() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const carIdParam = searchParams.get("carId") ?? "";

  const [mode, setMode] = useState<ServiceMode>(
    searchParams.get("mode") === "inspection" ? "inspection" : "repair",
  );
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [workshops, setWorkshops] = useState<MaintenanceWorkshop[]>([]);
  const [carId, setCarId] = useState(carIdParam);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [inspectionIntent, setInspectionIntent] = useState<"BUY" | "RENT">("BUY");
  const [inspectionNotes, setInspectionNotes] = useState("");

  const profile = useMemo(() => {
    try {
      const raw = getCustomerSessionProfile();
      return raw ? (JSON.parse(raw) as { phone?: string }) : null;
    } catch {
      return null;
    }
  }, []);

  const [repairForm, setRepairForm] = useState({
    requestType: "ROUTINE_SERVICE" as MaintenanceRequestType,
    preferredWorkshopId: "",
    city: "",
    preferredTime: "",
    pickupNeeded: false,
    contactPhone: profile?.phone ?? "",
    notes: "",
  });

  useEffect(() => {
    if (!getCustomerAccessToken()) {
      navigate(
        `/login?next=${encodeURIComponent(`/request-service${window.location.search}`)}`,
        { replace: true },
      );
      return;
    }
    (async () => {
      const [carsData, workshopsData] = await Promise.all([
        getPublicCars({ page: 1, limit: 200 }).catch(() => ({ items: [] as ApiCar[] })),
        getMaintenanceWorkshops().catch(() => [] as MaintenanceWorkshop[]),
      ]);
      setCars(carsData.items);
      setWorkshops(workshopsData);
    })();
  }, [navigate]);

  const selectedCar = cars.find((car) => car.id === carId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!carId) {
      setError(t("mntSelectCarRequired"));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "inspection") {
        await requestCarInspection(carId, {
          intent: inspectionIntent,
          notes: inspectionNotes.trim() || undefined,
        });
      } else {
        await createMaintenanceRequest({
          carId,
          preferredWorkshopId: repairForm.preferredWorkshopId || undefined,
          requestType: repairForm.requestType,
          city: repairForm.city,
          preferredTime: repairForm.preferredTime
            ? new Date(repairForm.preferredTime).toISOString()
            : undefined,
          pickupNeeded: repairForm.pickupNeeded,
          contactPhone: repairForm.contactPhone,
          notes: repairForm.notes,
        });
      }
      setDone(true);
    } catch (submitError) {
      setError(localizeError(submitError, t, "errSubmitRequest"));
    } finally {
      setSubmitting(false);
    }
  };

  const carLabel = (car: ApiCar) => `${car.brand} ${car.model} ${car.year}`;

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={carIdParam ? `/car/${carIdParam}` : "/inventory"}
          className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {carIdParam ? t("backToInventory") : t("browseInventoryBtn")}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{t("rsTitle")}</h1>
          <p className="text-white/60 mt-2">{t("rsSubtitle")}</p>
        </div>

        {done ? (
          <div className="rounded-xl border border-gold/20 bg-dark-card p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white font-semibold">
              {mode === "inspection" ? t("rsInspectionSuccess") : t("rsRepairSuccess")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Button
                onClick={() => navigate("/my-dashboard?tab=maintenance")}
                className="bg-gold hover:bg-gold-light text-dark font-bold"
              >
                {t("rsGoToRequests")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDone(false);
                  setError("");
                }}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                {t("rsNewRequest")}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service type toggle */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: "inspection" as const, label: t("rsTabInspection"), icon: ShieldCheck },
                { key: "repair" as const, label: t("rsTabRepair"), icon: Wrench },
              ]).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setMode(option.key);
                    setError("");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    mode === option.key
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-white/10 text-white/60 hover:border-gold/40 hover:text-white"
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Car */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">{t("rsCar")}</label>
              {carIdParam && selectedCar ? (
                <div className="rounded-lg border border-white/10 bg-dark-card p-3 text-sm text-white/70">
                  {carLabel(selectedCar)}
                </div>
              ) : (
                <Select value={carId} onValueChange={setCarId}>
                  <SelectTrigger className="bg-dark-card border-gold/20 text-white">
                    <SelectValue placeholder={t("mntSelectCar")} />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-gold/20 max-h-64">
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {carLabel(car)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {mode === "inspection" ? (
              <>
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t("rsInspectionIntent")}</label>
                  <div className="flex gap-3">
                    {(["BUY", "RENT"] as const).map((intent) => (
                      <button
                        key={intent}
                        type="button"
                        onClick={() => setInspectionIntent(intent)}
                        className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                          inspectionIntent === intent
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        {intent === "BUY" ? t("rsIntentBuy") : t("rsIntentRent")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t("rsNotes")}</label>
                  <Textarea
                    value={inspectionNotes}
                    onChange={(event) => setInspectionNotes(event.target.value)}
                    placeholder={t("rsInspectionNotesPh")}
                    className="bg-dark-card border-gold/20 text-white min-h-28"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t("rsTabRepair")}</label>
                  <Select
                    value={repairForm.requestType}
                    onValueChange={(value) =>
                      setRepairForm({ ...repairForm, requestType: value as MaintenanceRequestType })
                    }
                  >
                    <SelectTrigger className="bg-dark-card border-gold/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-gold/20">
                      {maintenanceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(type.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {workshops.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm font-medium">{t("mntWorkshopOptional")}</label>
                    <Select
                      value={repairForm.preferredWorkshopId || "NONE"}
                      onValueChange={(value) =>
                        setRepairForm({
                          ...repairForm,
                          preferredWorkshopId: value === "NONE" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="bg-dark-card border-gold/20 text-white">
                        <SelectValue placeholder={t("mntNoWorkshopPreference")} />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-gold/20 max-h-64">
                        <SelectItem value="NONE">{t("mntNoWorkshopPreference")}</SelectItem>
                        {workshops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id}>
                            {shop.name} · {shop.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    value={repairForm.city}
                    onChange={(event) => setRepairForm({ ...repairForm, city: event.target.value })}
                    placeholder={t("mntCityPlaceholder")}
                    required
                    className="bg-dark-card border-gold/20 text-white"
                  />
                  <Input
                    value={repairForm.contactPhone}
                    onChange={(event) =>
                      setRepairForm({ ...repairForm, contactPhone: event.target.value })
                    }
                    placeholder={t("mntContactPhone")}
                    required
                    className="bg-dark-card border-gold/20 text-white"
                  />
                </div>

                <Input
                  type="datetime-local"
                  value={repairForm.preferredTime}
                  onChange={(event) =>
                    setRepairForm({ ...repairForm, preferredTime: event.target.value })
                  }
                  className="bg-dark-card border-gold/20 text-white"
                />

                <Textarea
                  value={repairForm.notes}
                  onChange={(event) => setRepairForm({ ...repairForm, notes: event.target.value })}
                  placeholder={t("mntDescribe")}
                  required
                  className="bg-dark-card border-gold/20 text-white min-h-28"
                />

                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={repairForm.pickupNeeded}
                    onChange={(event) =>
                      setRepairForm({ ...repairForm, pickupNeeded: event.target.checked })
                    }
                  />
                  {t("mntPickup")}
                </label>
              </>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6"
            >
              {submitting ? t("rsSubmitting") : t("rsSubmit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
