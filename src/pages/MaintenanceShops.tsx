import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Edit3,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";
import { createTechnician, getTechnicians, updateTechnician } from "@/lib/inspections-api";
import type { InspectionServiceTier, Technician } from "@/lib/api-types";

const emptyShopForm = {
  name: "",
  city: "",
  phone: "",
  specialty: "",
  serviceTiers: [] as InspectionServiceTier[],
};

const serviceTierOptions: InspectionServiceTier[] = ["QUICK", "COMPREHENSIVE"];

export default function MaintenanceShops() {
  const { language, t } = useI18n();
  const isArabic = language === "ar";
  const dl = (en: string, ar: string) => (isArabic ? ar : en);

  const [shops, setShops] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [shopForm, setShopForm] = useState(emptyShopForm);

  const loadShops = async () => {
    setIsLoading(true);
    setError("");
    try {
      setShops(await getTechnicians());
    } catch (loadError) {
      setError(localizeError(loadError, t, "errLoadDashboard"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const filteredShops = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return shops.filter((shop) => {
      const matchesQuery =
        !query ||
        shop.name.toLowerCase().includes(query) ||
        shop.city.toLowerCase().includes(query) ||
        (shop.specialty ?? "").toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "VERIFIED" && shop.isActive) ||
        (statusFilter === "UNVERIFIED" && !shop.isActive);

      return matchesQuery && matchesStatus;
    });
  }, [searchQuery, shops, statusFilter]);

  const activeCount = shops.filter((shop) => shop.isActive).length;
  const cityCount = new Set(shops.map((shop) => shop.city).filter(Boolean)).size;

  const openCreateDialog = () => {
    setEditingShopId(null);
    setShopForm(emptyShopForm);
    setDialogOpen(true);
  };

  const openEditDialog = (shop: Technician) => {
    setEditingShopId(shop.id);
    setShopForm({
      name: shop.name,
      city: shop.city,
      phone: shop.phone ?? "",
      specialty: shop.specialty ?? "",
      serviceTiers: shop.serviceTiers,
    });
    setDialogOpen(true);
  };

  const toggleTier = (tier: InspectionServiceTier) => {
    setShopForm((form) => ({
      ...form,
      serviceTiers: form.serviceTiers.includes(tier)
        ? form.serviceTiers.filter((item) => item !== tier)
        : [...form.serviceTiers, tier],
    }));
  };

  const saveShop = async () => {
    if (!shopForm.name.trim() || !shopForm.city.trim()) {
      setError(dl("Shop name and city are required.", "اسم المحل والمدينة مطلوبان."));
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        name: shopForm.name.trim(),
        city: shopForm.city.trim(),
        phone: shopForm.phone.trim() || undefined,
        specialty: shopForm.specialty.trim() || undefined,
        serviceTiers: shopForm.serviceTiers,
      };

      if (editingShopId) {
        await updateTechnician(editingShopId, payload);
        setMessage(dl("Maintenance shop updated.", "تم تحديث محل الصيانة."));
      } else {
        await createTechnician(payload);
        setMessage(dl("Maintenance shop added and marked as Drive X supported.", "تمت إضافة محل الصيانة واعتماده كمدعوم من Drive X."));
      }

      setDialogOpen(false);
      await loadShops();
    } catch (saveError) {
      setError(localizeError(saveError, t, "errSaveTechnician"));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVerification = async (shop: Technician) => {
    setError("");
    setMessage("");
    try {
      await updateTechnician(shop.id, { isActive: !shop.isActive });
      setMessage(
        shop.isActive
          ? dl("Drive X support removed from this shop.", "تم إلغاء اعتماد هذا المحل من Drive X.")
          : dl("Shop verified as Drive X supported.", "تم توثيق المحل كمدعوم من Drive X.")
      );
      await loadShops();
    } catch (toggleError) {
      setError(localizeError(toggleError, t, "errUpdateTechnician"));
    }
  };

  const tierLabel = (tier: InspectionServiceTier) =>
    tier === "QUICK" ? dl("Quick Check", "فحص سريع") : dl("Comprehensive Service", "خدمة شاملة");

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
              {dl("DRIVE X VERIFIED NETWORK", "شبكة DRIVE X المعتمدة")}
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {dl("Maintenance Shops", "محلات الصيانة")}
              </h1>
              <p className="text-white/60 mt-3 max-w-2xl">
                {dl(
                  "Manage the maintenance shops and service partners that Drive X trusts for inspections, repairs, and customer aftercare.",
                  "إدارة محلات الصيانة وشركاء الخدمة المعتمدين من Drive X للفحص والإصلاح ومتابعة العملاء."
                )}
              </p>
            </div>
            <Button onClick={openCreateDialog} className="bg-gold hover:bg-gold-light text-dark font-bold">
              <Plus className="w-4 h-4 mr-2" />
              {dl("Add Shop", "إضافة محل")}
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-gold/20 bg-dark-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Building2 className="w-5 h-5 text-gold" />
              <span className="text-white/40 text-xs uppercase">{dl("Total", "الإجمالي")}</span>
            </div>
            <p className="text-3xl font-bold text-white">{shops.length}</p>
            <p className="text-white/50 text-sm mt-1">{dl("Registered service shops", "محلات خدمة مسجلة")}</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-dark-card p-5">
            <div className="flex items-center justify-between mb-3">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span className="text-white/40 text-xs uppercase">{dl("Verified", "موثق")}</span>
            </div>
            <p className="text-3xl font-bold text-white">{activeCount}</p>
            <p className="text-white/50 text-sm mt-1">{dl("Drive X supported partners", "شركاء مدعومون من Drive X")}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-dark-card p-5">
            <div className="flex items-center justify-between mb-3">
              <MapPin className="w-5 h-5 text-gold" />
              <span className="text-white/40 text-xs uppercase">{dl("Cities", "المدن")}</span>
            </div>
            <p className="text-3xl font-bold text-white">{cityCount}</p>
            <p className="text-white/50 text-sm mt-1">{dl("Coverage areas", "مناطق التغطية")}</p>
          </div>
        </section>

        {(error || message) && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-gold/30 bg-gold/10 text-gold"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="rounded-xl border border-gold/20 bg-dark-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={dl("Search by shop, city, or specialty", "ابحث باسم المحل أو المدينة أو الاختصاص")}
                className="pl-10 bg-dark border-gold/20 text-white placeholder:text-white/30"
              />
            </div>
            <div className="flex gap-2">
              {(["ALL", "VERIFIED", "UNVERIFIED"] as const).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-gold text-dark"
                      : "border-gold/30 text-gold hover:bg-gold/10"
                  }
                >
                  {status === "ALL"
                    ? dl("All", "الكل")
                    : status === "VERIFIED"
                      ? dl("Verified", "موثق")
                      : dl("Not Verified", "غير موثق")}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-xl border border-gold/20 bg-dark-card p-10 text-center text-white/50">
            {t("loading")}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="rounded-xl border border-gold/20 bg-dark-card p-10 text-center">
            <Wrench className="w-10 h-10 text-gold mx-auto mb-3" />
            <p className="text-white font-semibold">{dl("No maintenance shops found.", "لا توجد محلات صيانة مطابقة.")}</p>
            <p className="text-white/50 text-sm mt-1">
              {dl("Add your first Drive X supported shop to start building the network.", "أضف أول محل مدعوم من Drive X لبناء الشبكة.")}
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredShops.map((shop) => (
              <article key={shop.id} className="rounded-xl border border-gold/20 bg-dark-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                      <Wrench className="w-6 h-6 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-white font-bold text-lg truncate">{shop.name}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-white/50 text-sm mt-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gold" />
                          {shop.city}
                        </span>
                        {shop.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gold" />
                            {shop.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${
                      shop.isActive ? "bg-green-500/10 text-green-400" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {shop.isActive ? <BadgeCheck className="w-3 h-3" /> : <Clock3 className="w-3 h-3" />}
                    {shop.isActive ? dl("Drive X Supported", "مدعوم من Drive X") : dl("Not Verified", "غير موثق")}
                  </span>
                </div>

                {shop.specialty && (
                  <p className="text-white/60 text-sm mt-4">{shop.specialty}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {shop.serviceTiers.length > 0 ? (
                    shop.serviceTiers.map((tier) => (
                      <span key={tier} className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold">
                        {tierLabel(tier)}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40 text-sm">{dl("No service tiers selected.", "لم يتم تحديد باقات خدمة.")}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-5">
                  <Button
                    type="button"
                    onClick={() => toggleVerification(shop)}
                    className={
                      shop.isActive
                        ? "bg-white/10 hover:bg-white/15 text-white"
                        : "bg-gold hover:bg-gold-light text-dark font-bold"
                    }
                  >
                    {shop.isActive ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    {shop.isActive ? dl("Remove Verification", "إلغاء الاعتماد") : dl("Verify Shop", "توثيق المحل")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openEditDialog(shop)}
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {dl("Edit", "تعديل")}
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingShopId ? dl("Edit Maintenance Shop", "تعديل محل الصيانة") : dl("Add Maintenance Shop", "إضافة محل صيانة")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder={dl("Shop name", "اسم المحل")}
              value={shopForm.name}
              onChange={(event) => setShopForm({ ...shopForm, name: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder={dl("City", "المدينة")}
                value={shopForm.city}
                onChange={(event) => setShopForm({ ...shopForm, city: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
              <Input
                placeholder={dl("Phone", "الهاتف")}
                value={shopForm.phone}
                onChange={(event) => setShopForm({ ...shopForm, phone: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
            </div>
            <Input
              placeholder={dl("Specialty, e.g. mechanical, electrical, body", "الاختصاص: ميكانيك، كهرباء، هيكل...")}
              value={shopForm.specialty}
              onChange={(event) => setShopForm({ ...shopForm, specialty: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <div>
              <p className="text-white/50 text-xs mb-2">{dl("Supported services", "الخدمات المدعومة")}</p>
              <div className="flex flex-wrap gap-2">
                {serviceTierOptions.map((tier) => (
                  <Button
                    key={tier}
                    type="button"
                    variant={shopForm.serviceTiers.includes(tier) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTier(tier)}
                    className={
                      shopForm.serviceTiers.includes(tier)
                        ? "bg-gold text-dark"
                        : "border-gold/30 text-gold hover:bg-gold/10"
                    }
                  >
                    {tierLabel(tier)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              {dl("Cancel", "إلغاء")}
            </Button>
            <Button onClick={saveShop} disabled={isSaving} className="bg-gold hover:bg-gold-light text-dark font-bold">
              {isSaving ? dl("Saving...", "جاري الحفظ...") : dl("Save Shop", "حفظ المحل")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
