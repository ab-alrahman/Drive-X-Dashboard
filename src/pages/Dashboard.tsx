import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  LayoutDashboard,
  Car,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageSquare,
  Settings,
  Bell,
  Search,
  ChevronRight,
  Star,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  ArrowUpRight,
  Phone,
  Mail,
  Activity,
  Clock,
  Handshake,
  ShieldCheck,
  ShieldAlert,
  Flag,
  Eye,
  EyeOff,
  X,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminCar,
  createAdminDeal,
  deleteAdminCar,
  deleteAdminDeal,
  getAdminCars,
  getAdminDashboardSummary,
  getAdminDeals,
  getAdminLeads,
  getAdminMaintenanceRequest,
  getAdminMaintenanceRequests,
  addMaintenanceRequestUpdate,
  assignMaintenancePartner,
  scheduleMaintenanceRequest,
  triageMaintenanceRequest,
  updateMaintenanceRequestStatus,
  updateAdminCar,
  updateAdminLead,
} from "@/lib/admin-api";
import { clearAuthTokens, getAccessToken, getAdminSessionProfile } from "@/lib/api";
import { getCurrentAdmin, logoutAdmin, updateAdminProfile } from "@/lib/auth-api";
import { mapApiCarsToView, type CarView } from "@/lib/car-mapper";
import type {
  ApiCar,
  CarPayload,
  Complaint,
  DashboardSummaryResponse,
  DealResponse,
  InspectionCase,
  InspectionFindingSeverity,
  InspectionPaidBy,
  InspectionServiceTier,
  LeadResponse,
  MaintenanceRequest,
  Technician,
  Vendor,
} from "@/lib/api-types";
import {
  cancelInspectionRound,
  certifyInspectionRound,
  createTechnician,
  getAdminCarInspection,
  getTechnicians,
  requestTechnicianVisit,
  scheduleInspectionRound,
  startInspectionRound,
  submitInspectionReport,
  submitSellerInspection,
  updateTechnician,
  uploadInspectionFile,
} from "@/lib/inspections-api";
import {
  flagRoundFraudulent,
  getPlatformComplaints,
  getPlatformVendors,
  hidePlatformCar,
  reviewComplaint,
  suspendVendor,
  unhidePlatformCar,
  unsuspendVendor,
} from "@/lib/vendors-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";

const emptyReportFinding = { description: "", severity: "MINOR" as InspectionFindingSeverity, costAmount: "" };

const emptyTechnicianForm = {
  name: "",
  city: "",
  phone: "",
  serviceTiers: [] as InspectionServiceTier[],
  specialty: "",
};

const emptyCarForm = {
  brand: "",
  model: "",
  year: "2024",
  listingType: "SALE",
  condition: "USED",
  status: "AVAILABLE",
  salePriceAmount: "",
  dailyRentPriceAmount: "",
  monthlyRentPriceAmount: "",
  mileageKm: "",
  transmission: "AUTOMATIC",
  fuelType: "GASOLINE",
  color: "",
  city: "",
  engine: "",
  seats: "5",
  horsepower: "",
  description: "",
};

const normalizeListingType = (listingType: string, hasSalePrice?: boolean) => {
  if (listingType === "RENT") return "RENT";
  if (listingType === "BOTH" && !hasSalePrice) return "RENT";
  return "SALE";
};

const emptyDealForm = {
  leadId: "",
  type: "SALE",
  finalPriceAmount: "",
  notes: "",
};

const dashboardText = {
  en: {
    overview: "Overview",
    cars: "My Cars",
    inquiries: "Inquiries",
    deals: "Deals",
    inspections: "Inspections",
    maintenance: "Maintenance",
    favorites: "Favorites",
    analytics: "Analytics",
    settings: "Settings",
    marketplaceOversight: "Marketplace Oversight",
    adminUser: "Admin User",
    admin: "Admin",
    logout: "Logout",
    welcomeBack: "Welcome back",
    search: "Search...",
    recentInquiries: "Recent Inquiries",
    recentListings: "Recent Listings",
    viewAll: "View All",
    quickActions: "Quick Actions",
    browseInventory: "Browse Inventory",
    addNewCar: "Add New Car",
    viewMessages: "View Messages",
    searchCars: "Search cars...",
    car: "Car",
    category: "Category",
    price: "Price",
    status: "Status",
    rating: "Rating",
    actions: "Actions",
    customer: "Customer",
    interestedIn: "Interested In",
    date: "Date",
    type: "Type",
    finalPrice: "Final Price",
    commission: "Commission",
    createDeal: "Create Deal",
    createDealHint: "Create a deal from an approved lead to mark a sale/rental as closed and record commission.",
    noDeals: "No deals yet. Approve a lead first, then create a deal for it.",
    inspectionHint: "Every car needs an accepted maintenance file or certified inspection before it can be published as Available or Reserved. Click the shield icon on a car (in My Cars) to manage it, or pick one here.",
    action: "Action",
    manage: "Manage",
    manageInspection: "Manage Inspection",
    technicianNetwork: "Technician Partner Network",
    addTechnician: "Add Technician",
    name: "Name",
    city: "City",
    tiers: "Tiers",
    specialty: "Specialty",
    active: "Active",
    inactive: "Inactive",
    noTechnicians: "No technicians yet. Add your first partner to start scheduling inspections.",
    maintenanceRequests: "Maintenance Requests",
    maintenanceHint: "Coordinate customer maintenance for Drive X cars. Rental requests stay under platform review before vendors can act.",
    refresh: "Refresh",
    customerCar: "Customer / Car",
    vendor: "Vendor",
    rentalFlow: "Rental flow",
    monthlySalesOverview: "Monthly Sales Overview",
    profileSettings: "Profile Settings",
    fullName: "Full Name",
    email: "Email",
    emailCannotBeChanged: "Email cannot be changed.",
    notificationPreferences: "Notification Preferences",
    vendors: "Vendors",
    listings: "Listings",
    openComplaints: "Open Complaints",
    customerComplaints: "Customer Complaints",
    complaint: "Complaint",
    hiddenByPlatform: "Hidden by platform",
    restoreMarketplace: "Restore to marketplace",
    hideMarketplace: "Hide from marketplace",
  },
  ar: {
    overview: "نظرة عامة",
    cars: "سياراتي",
    inquiries: "الطلبات",
    deals: "الصفقات",
    inspections: "الفحوصات",
    maintenance: "الصيانة",
    favorites: "المفضلة",
    analytics: "التحليلات",
    settings: "الإعدادات",
    marketplaceOversight: "إشراف المنصة",
    adminUser: "مدير النظام",
    admin: "المدير",
    logout: "تسجيل الخروج",
    welcomeBack: "مرحباً بعودتك",
    search: "بحث...",
    recentInquiries: "أحدث الطلبات",
    recentListings: "أحدث العروض",
    viewAll: "عرض الكل",
    quickActions: "إجراءات سريعة",
    browseInventory: "تصفح السيارات",
    addNewCar: "إضافة سيارة",
    viewMessages: "عرض الرسائل",
    searchCars: "ابحث في السيارات...",
    car: "السيارة",
    category: "الفئة",
    price: "السعر",
    status: "الحالة",
    rating: "التقييم",
    actions: "الإجراءات",
    customer: "العميل",
    interestedIn: "السيارة المطلوبة",
    date: "التاريخ",
    type: "النوع",
    finalPrice: "السعر النهائي",
    commission: "العمولة",
    createDeal: "إنشاء صفقة",
    createDealHint: "أنشئ صفقة من طلب مقبول لإغلاق عملية بيع أو إيجار وتسجيل العمولة.",
    noDeals: "لا توجد صفقات بعد. اقبل طلباً أولاً ثم أنشئ صفقة له.",
    inspectionHint: "كل سيارة تحتاج ملف صيانة مقبولاً أو فحصاً معتمداً قبل نشرها كمتاحة أو محجوزة. اضغط أيقونة الدرع في سياراتي لإدارتها، أو اختر سيارة من هنا.",
    action: "إجراء",
    manage: "إدارة",
    manageInspection: "إدارة الفحص",
    technicianNetwork: "شبكة فنيي الفحص",
    addTechnician: "إضافة فني",
    name: "الاسم",
    city: "المدينة",
    tiers: "الباقات",
    specialty: "الاختصاص",
    active: "نشط",
    inactive: "غير نشط",
    noTechnicians: "لا يوجد فنيون بعد. أضف أول شريك لبدء جدولة الفحوصات.",
    maintenanceRequests: "طلبات الصيانة",
    maintenanceHint: "نسّق صيانة العملاء لسيارات Drive X. طلبات الإيجار تبقى تحت مراجعة المنصة قبل أن يتعامل معها البائعون.",
    refresh: "تحديث",
    customerCar: "العميل / السيارة",
    vendor: "البائع",
    rentalFlow: "مسار الإيجار",
    monthlySalesOverview: "نظرة شهرية على المبيعات",
    profileSettings: "إعدادات الحساب",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    emailCannotBeChanged: "لا يمكن تغيير البريد الإلكتروني.",
    notificationPreferences: "تفضيلات الإشعارات",
    vendors: "البائعون",
    listings: "العروض",
    openComplaints: "الشكاوى المفتوحة",
    customerComplaints: "شكاوى العملاء",
    complaint: "الشكوى",
    hiddenByPlatform: "مخفية من المنصة",
    restoreMarketplace: "إعادتها إلى السوق",
    hideMarketplace: "إخفاؤها من السوق",
  },
} as const;

type DashboardTextKey = keyof typeof dashboardText.en;

export default function Dashboard() {
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const dt = (key: DashboardTextKey) => dashboardText[language][key];
  const dl = (en: string, ar: string) => (language === "ar" ? ar : en);
  const enumLabel = (value: string) => {
    const labels: Record<string, string> = {
      SALE: "بيع",
      RENT: "إيجار",
      BOTH: "بيع وإيجار",
      NEW: "جديدة",
      USED: "مستعملة",
      AUTOMATIC: "أوتوماتيك",
      MANUAL: "يدوي",
      AVAILABLE: "متاحة",
      RESERVED: "محجوزة",
      SOLD: "مباعة",
      RENTED: "مؤجرة",
      INACTIVE: "غير نشطة",
      GASOLINE: "بنزين",
      DIESEL: "ديزل",
      HYBRID: "هجينة",
      ELECTRIC: "كهربائية",
      MINOR: "بسيط",
      MODERATE: "متوسط",
      SEVERE: "كبير",
      SAFETY_CRITICAL: "مؤثر على السلامة",
      SELLER: "البائع",
      BUYER: "المشتري",
      RENTER: "المستأجر",
      DRIVEX: "Drive X",
      QUICK: "سريع",
      COMPREHENSIVE: "شامل",
      OPEN: "مفتوحة",
      DISMISSED: "مرفوضة",
      SUBSTANTIATED: "مثبتة",
      RESOLVED: "محلولة",
    };
    return language === "ar" ? labels[value] ?? value.replaceAll("_", " ") : value.replaceAll("_", " ");
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null);
  const [adminCars, setAdminCars] = useState<ApiCar[]>([]);
  const [dashboardCars, setDashboardCars] = useState<CarView[]>([]);
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [maintenanceDetailOpen, setMaintenanceDetailOpen] = useState(false);
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState<MaintenanceRequest | null>(null);
  const [maintenanceQuoteAmount, setMaintenanceQuoteAmount] = useState("");
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [maintenanceNotePublic, setMaintenanceNotePublic] = useState(false);
  const [maintenancePublicSummary, setMaintenancePublicSummary] = useState("");
  const [isSavingMaintenanceAction, setIsSavingMaintenanceAction] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carForm, setCarForm] = useState(emptyCarForm);
  const [isSavingCar, setIsSavingCar] = useState(false);
  const [carSearch, setCarSearch] = useState("");
  const [profileNameInput, setProfileNameInput] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [dealForm, setDealForm] = useState(emptyDealForm);
  const [isSavingDeal, setIsSavingDeal] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [inspectionCarId, setInspectionCarId] = useState<string | null>(null);
  const [inspectionCase, setInspectionCase] = useState<InspectionCase | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState(false);
  const [inspectionActionLoading, setInspectionActionLoading] = useState(false);
  const [inspectionSourceType, setInspectionSourceType] = useState<"EXTERNAL_FILE" | "TEMPLATE">("TEMPLATE");
  const [inspectionTemplateNotes, setInspectionTemplateNotes] = useState("");
  const [inspectionFile, setInspectionFile] = useState<File | null>(null);
  const [scheduleTechnicianId, setScheduleTechnicianId] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [reportVerdict, setReportVerdict] = useState("");
  const [reportPriceAmount, setReportPriceAmount] = useState("");
  const [reportPaidBy, setReportPaidBy] = useState<InspectionPaidBy>("BUYER");
  const [reportFindings, setReportFindings] = useState([emptyReportFinding]);
  const [technicianDialogOpen, setTechnicianDialogOpen] = useState(false);
  const [editingTechnicianId, setEditingTechnicianId] = useState<string | null>(null);
  const [technicianForm, setTechnicianForm] = useState(emptyTechnicianForm);
  const [isSavingTechnician, setIsSavingTechnician] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [reviewingComplaint, setReviewingComplaint] = useState<Complaint | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    const auth = getAdminSessionProfile();
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setUser(parsed);
        setIsPlatformAdmin(parsed.role === "PLATFORM_ADMIN");
      } catch {
        clearAuthTokens();
        navigate("/login");
        return;
      }
    }

    getCurrentAdmin()
      .then((admin) => {
        setUser({ name: admin.fullName ?? dt("adminUser"), email: admin.email, role: admin.role });
        setProfileNameInput(admin.fullName ?? "");
        setIsPlatformAdmin(admin.role === "PLATFORM_ADMIN");
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const saveProfile = async () => {
    if (!profileNameInput.trim()) return;

    setIsSavingProfile(true);
    try {
      const admin = await updateAdminProfile(profileNameInput.trim());
      setUser({ name: admin.fullName ?? dt("adminUser"), email: admin.email });
      setActionMessage(t("successProfileUpdated"));
    } catch (error) {
      setActionMessage(localizeError(error, t, "errUpdateProfile"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const refreshDashboardData = async () => {
    if (!getAccessToken()) return;

    const [summary, carsResponse, leadsResponse, dealsResponse, techniciansResponse, maintenanceResponse] = await Promise.all([
      getAdminDashboardSummary(),
      getAdminCars({ page: 1, limit: 20 }),
      getAdminLeads({ page: 1, limit: 20 }),
      getAdminDeals({ page: 1, limit: 20 }),
      getTechnicians(),
      getAdminMaintenanceRequests({ page: 1, limit: 50 }),
    ]);
    setDashboardSummary(summary);
    setAdminCars(carsResponse.items);
    setDashboardCars(mapApiCarsToView(carsResponse.items));
    setLeads(leadsResponse.items);
    setDeals(dealsResponse.items);
    setTechnicians(techniciansResponse);
    setMaintenanceRequests(maintenanceResponse.items);
    setDashboardError("");
  };

  const openMaintenanceDetail = async (requestId: string) => {
    setDashboardError("");
    const request = await getAdminMaintenanceRequest(requestId);
    setSelectedMaintenanceRequest(request);
    setMaintenanceQuoteAmount(request.quote?.amount ? String(request.quote.amount) : "");
    setMaintenancePublicSummary(request.publicSummary ?? "");
    setMaintenanceNote("");
    setMaintenanceNotePublic(false);
    setMaintenanceDetailOpen(true);
  };

  const refreshSelectedMaintenanceRequest = async () => {
    if (!selectedMaintenanceRequest) return;
    const request = await getAdminMaintenanceRequest(selectedMaintenanceRequest.id);
    setSelectedMaintenanceRequest(request);
    const maintenanceResponse = await getAdminMaintenanceRequests({ page: 1, limit: 50 });
    setMaintenanceRequests(maintenanceResponse.items);
  };

  const setMaintenanceQuote = async () => {
    if (!selectedMaintenanceRequest || !maintenanceQuoteAmount) return;
    setIsSavingMaintenanceAction(true);
    try {
      const quote = Number(maintenanceQuoteAmount);
      await updateMaintenanceRequestStatus(selectedMaintenanceRequest.id, {
        status: "WAITING_CUSTOMER_APPROVAL",
        quotedAmount: quote,
        quotedCurrency: "USD",
        note: `Quote set at ${quote} USD.`
      });
      await refreshSelectedMaintenanceRequest();
      setActionMessage(t("successQuoteSent"));
    } catch (error) {
      setDashboardError(localizeError(error, t, "errSetQuote"));
    } finally {
      setIsSavingMaintenanceAction(false);
    }
  };

  const addMaintenanceNote = async () => {
    if (!selectedMaintenanceRequest || !maintenanceNote.trim()) return;
    setIsSavingMaintenanceAction(true);
    try {
      await addMaintenanceRequestUpdate(selectedMaintenanceRequest.id, {
        note: maintenanceNote.trim(),
        isPublic: maintenanceNotePublic,
      });
      setMaintenanceNote("");
      setMaintenanceNotePublic(false);
      await refreshSelectedMaintenanceRequest();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errAddUpdate"));
    } finally {
      setIsSavingMaintenanceAction(false);
    }
  };

  const completeSelectedMaintenance = async () => {
    if (!selectedMaintenanceRequest) return;
    setIsSavingMaintenanceAction(true);
    try {
      await updateMaintenanceRequestStatus(selectedMaintenanceRequest.id, {
        status: "COMPLETED",
        note: "Maintenance completed.",
        publicSummary: maintenancePublicSummary || "Drive X verified maintenance completed."
      });
      await refreshSelectedMaintenanceRequest();
      setActionMessage(t("successMaintenanceCompleted"));
    } catch (error) {
      setDashboardError(localizeError(error, t, "errCompleteMaintenance"));
    } finally {
      setIsSavingMaintenanceAction(false);
    }
  };

  useEffect(() => {
    refreshDashboardData().catch((error: Error) => {
      setDashboardError(localizeError(error, t, "errLoadDashboard"));
    });
  }, []);

  const refreshPlatformData = useCallback(async () => {
    if (!isPlatformAdmin) return;
    const [vendorList, complaintsResponse] = await Promise.all([
      getPlatformVendors(),
      getPlatformComplaints({ page: 1, limit: 50 }),
    ]);
    setVendors(vendorList);
    setComplaints(complaintsResponse.items);
  }, [isPlatformAdmin]);

  useEffect(() => {
    if (isPlatformAdmin) {
      refreshPlatformData().catch((error: Error) => {
        setDashboardError(localizeError(error, t, "errLoadPlatform"));
      });
    }
  }, [isPlatformAdmin, refreshPlatformData]);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/");
  };

  const openCreateCar = () => {
    setEditingCarId(null);
    setCarForm(emptyCarForm);
    setCarDialogOpen(true);
  };

  const openEditCar = (carId: string) => {
    const car = adminCars.find((item) => item.id === carId);
    if (!car) return;
    setEditingCarId(car.id);
    setCarForm({
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      listingType: normalizeListingType(car.listingType, Boolean(car.salePrice?.amount)),
      condition: car.condition,
      status: car.status,
      salePriceAmount: car.salePrice?.amount ? String(car.salePrice.amount) : "",
      dailyRentPriceAmount: car.dailyRentPrice?.amount ? String(car.dailyRentPrice.amount) : "",
      monthlyRentPriceAmount: car.monthlyRentPrice?.amount ? String(car.monthlyRentPrice.amount) : "",
      mileageKm: typeof car.mileageKm === "number" ? String(car.mileageKm) : "",
      transmission: car.transmission ?? "AUTOMATIC",
      fuelType: car.fuelType ?? "GASOLINE",
      color: car.color ?? "",
      city: car.city ?? "",
      engine: car.specs.engine,
      seats: String(car.specs.seats),
      horsepower: car.specs.horsepower ? String(car.specs.horsepower) : "",
      description: car.description ?? "",
    });
    setCarDialogOpen(true);
  };

  const carPayloadFromForm = (): CarPayload => ({
    brand: carForm.brand,
    model: carForm.model,
    year: Number(carForm.year),
    listingType: carForm.listingType as CarPayload["listingType"],
    condition: carForm.condition as CarPayload["condition"],
    status: carForm.status as CarPayload["status"],
    salePrice: carForm.listingType === "SALE" && carForm.salePriceAmount
      ? { amount: Number(carForm.salePriceAmount), currency: "USD" }
      : undefined,
    dailyRentPrice: carForm.listingType === "RENT" && carForm.dailyRentPriceAmount
      ? { amount: Number(carForm.dailyRentPriceAmount), currency: "USD" }
      : undefined,
    monthlyRentPrice: carForm.listingType === "RENT" && carForm.monthlyRentPriceAmount
      ? { amount: Number(carForm.monthlyRentPriceAmount), currency: "USD" }
      : undefined,
    mileageKm: carForm.mileageKm ? Number(carForm.mileageKm) : undefined,
    transmission: carForm.transmission as CarPayload["transmission"],
    fuelType: carForm.fuelType as CarPayload["fuelType"],
    color: carForm.color || undefined,
    city: carForm.city || undefined,
    specs: {
      engine: carForm.engine,
      seats: Number(carForm.seats),
      horsepower: carForm.horsepower ? Number(carForm.horsepower) : undefined,
    },
    description: carForm.description || undefined,
  });

  const handleSaveCar = async () => {
    setIsSavingCar(true);
    setDashboardError("");
    setActionMessage("");
    try {
      if (!carForm.brand || !carForm.model || !carForm.engine || !carForm.seats) {
        throw new Error("Brand, model, engine, and seats are required.");
      }
      if (carForm.listingType === "SALE" && !carForm.salePriceAmount) {
        throw new Error("Sale listings require a sale price.");
      }
      if (
        carForm.listingType === "RENT" &&
        !carForm.dailyRentPriceAmount &&
        !carForm.monthlyRentPriceAmount
      ) {
        throw new Error("Rent listings require a daily or monthly rent price.");
      }
      if (editingCarId) {
        await updateAdminCar(editingCarId, carPayloadFromForm());
        setActionMessage(t("successCarUpdated"));
        setCarDialogOpen(false);
      } else {
        // New cars can't be published (AVAILABLE/RESERVED) until they have an accepted
        // maintenance file/inspection - the backend enforces this, so force a safe status
        // on create regardless of what the form's Status field says, then guide the admin
        // straight into submitting that inspection for the car they just made.
        const created = await createAdminCar({ ...carPayloadFromForm(), status: "INACTIVE" });
        setActionMessage(t("successCarCreatedInactive"));
        setCarDialogOpen(false);
        openInspectionDialog(created.id);
      }
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errSaveCar"));
    } finally {
      setIsSavingCar(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    const confirmed = window.confirm("Soft delete this car?");
    if (!confirmed) return;
    try {
      await deleteAdminCar(carId);
      setActionMessage(t("successCarDeleted"));
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errDeleteCar"));
    }
  };

  const handleLeadStatusChange = async (leadId: string, status: string) => {
    try {
      await updateAdminLead(leadId, { status });
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errUpdateLead"));
    }
  };

  const dealtLeadIds = new Set(deals.map((deal) => deal.leadId));
  const availableLeadsForDeal = leads.filter(
    (lead) => lead.status === "APPROVED" && !dealtLeadIds.has(lead.id)
  );

  const openCreateDeal = () => {
    setDealForm(emptyDealForm);
    setDealDialogOpen(true);
  };

  const handleDealLeadChange = (leadId: string) => {
    const lead = leads.find((item) => item.id === leadId);
    setDealForm({
      ...dealForm,
      leadId,
      type: lead?.intent === "RENT" ? "RENT" : "SALE",
    });
  };

  const handleSaveDeal = async () => {
    setIsSavingDeal(true);
    setDashboardError("");
    setActionMessage("");
    try {
      const lead = leads.find((item) => item.id === dealForm.leadId);
      if (!lead) {
        throw new Error("Select an approved lead to create a deal for.");
      }
      if (!dealForm.finalPriceAmount) {
        throw new Error("Final price is required.");
      }

      await createAdminDeal({
        leadId: lead.id,
        carId: lead.carId,
        type: dealForm.type as "SALE" | "RENT",
        finalPrice: { amount: Number(dealForm.finalPriceAmount), currency: "USD" },
        notes: dealForm.notes || undefined,
      });
      setActionMessage(t("successDealCreated"));
      setDealDialogOpen(false);
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errCreateDeal"));
    } finally {
      setIsSavingDeal(false);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    const confirmed = window.confirm(
      "Delete this deal? The car will go back to AVAILABLE and the lead back to APPROVED."
    );
    if (!confirmed) return;
    try {
      await deleteAdminDeal(dealId);
      setActionMessage(t("successDealDeleted"));
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errDeleteDeal"));
    }
  };

  const resetInspectionForms = () => {
    setInspectionSourceType("TEMPLATE");
    setInspectionTemplateNotes("");
    setInspectionFile(null);
    setScheduleTechnicianId("");
    setScheduleDateTime("");
    setReportVerdict("");
    setReportPriceAmount("");
    setReportPaidBy("BUYER");
    setReportFindings([emptyReportFinding]);
  };

  const openInspectionDialog = async (carId: string) => {
    setInspectionCarId(carId);
    setInspectionDialogOpen(true);
    resetInspectionForms();
    setIsLoadingInspection(true);
    try {
      setInspectionCase(await getAdminCarInspection(carId));
    } catch (error) {
      setDashboardError(localizeError(error, t, "errLoadInspection"));
    } finally {
      setIsLoadingInspection(false);
    }
  };

  const refreshInspectionCase = async () => {
    if (!inspectionCarId) return;
    setInspectionCase(await getAdminCarInspection(inspectionCarId));
    await refreshDashboardData();
  };

  const latestInspectionRound = inspectionCase?.rounds[0];

  const handleSubmitSellerInspection = async () => {
    if (!inspectionCarId) return;
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      if (inspectionSourceType === "EXTERNAL_FILE") {
        if (!inspectionFile) throw new Error("Choose a file to upload.");
        const { url } = await uploadInspectionFile(inspectionCarId, inspectionFile);
        await submitSellerInspection(inspectionCarId, { sourceType: "EXTERNAL_FILE", externalFileUrl: url });
      } else {
        if (!inspectionTemplateNotes.trim()) throw new Error("Fill in the maintenance details.");
        await submitSellerInspection(inspectionCarId, {
          sourceType: "TEMPLATE",
          templateData: { notes: inspectionTemplateNotes.trim() },
        });
      }
      setActionMessage(t("successMaintenanceFileAccepted"));
      resetInspectionForms();
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errSubmitMaintenanceFile"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const handleRequestTechnicianVisit = async (role: "SELLER" | "BUYER" | "RENTER") => {
    if (!inspectionCarId) return;
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      await requestTechnicianVisit(inspectionCarId, { requestedByRole: role });
      setActionMessage(t("successTechnicianVisitRequested"));
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errRequestTechnician"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const handleScheduleRound = async () => {
    if (!latestInspectionRound) return;
    if (!scheduleTechnicianId || !scheduleDateTime) {
      setDashboardError(t("errPickTechnicianSchedule"));
      return;
    }
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      await scheduleInspectionRound(latestInspectionRound.id, {
        technicianId: scheduleTechnicianId,
        scheduledAt: new Date(scheduleDateTime).toISOString(),
      });
      setActionMessage(t("successInspectionScheduled"));
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errScheduleInspection"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const handleStartRound = async () => {
    if (!latestInspectionRound) return;
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      await startInspectionRound(latestInspectionRound.id);
      setActionMessage(t("successInspectionInProgress"));
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errStartInspection"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const addFindingRow = () => setReportFindings([...reportFindings, emptyReportFinding]);
  const removeFindingRow = (index: number) => setReportFindings(reportFindings.filter((_, i) => i !== index));
  const updateFindingRow = (index: number, patch: Partial<typeof emptyReportFinding>) =>
    setReportFindings(reportFindings.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const handleSubmitReport = async () => {
    if (!latestInspectionRound) return;
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      const findings = reportFindings
        .filter((row) => row.description.trim())
        .map((row) => ({
          description: row.description.trim(),
          severity: row.severity,
          estimatedRepairCostAmount: row.costAmount ? Number(row.costAmount) : undefined,
          estimatedRepairCostCurrency: row.costAmount ? ("USD" as const) : undefined,
        }));
      await submitInspectionReport(latestInspectionRound.id, {
        overallVerdict: reportVerdict || undefined,
        priceAmount: reportPriceAmount ? Number(reportPriceAmount) : undefined,
        priceCurrency: reportPriceAmount ? "USD" : undefined,
        paidBy: reportPaidBy,
        findings,
      });
      setActionMessage(t("successReportSubmitted"));
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errSubmitReport"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const handleCertifyRound = async () => {
    if (!latestInspectionRound) return;
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      await certifyInspectionRound(latestInspectionRound.id);
      setActionMessage(t("successInspectionCertified"));
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errCertifyInspection"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const handleCancelRound = async () => {
    if (!latestInspectionRound) return;
    const confirmed = window.confirm("Cancel this inspection round?");
    if (!confirmed) return;
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      await cancelInspectionRound(latestInspectionRound.id);
      setActionMessage(t("successInspectionCancelled"));
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errCancelRound"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const openCreateTechnician = () => {
    setEditingTechnicianId(null);
    setTechnicianForm(emptyTechnicianForm);
    setTechnicianDialogOpen(true);
  };

  const openEditTechnician = (technician: Technician) => {
    setEditingTechnicianId(technician.id);
    setTechnicianForm({
      name: technician.name,
      city: technician.city,
      phone: technician.phone ?? "",
      serviceTiers: technician.serviceTiers,
      specialty: technician.specialty ?? "",
    });
    setTechnicianDialogOpen(true);
  };

  const toggleTechnicianTier = (tier: InspectionServiceTier) => {
    setTechnicianForm((prev) => ({
      ...prev,
      serviceTiers: prev.serviceTiers.includes(tier)
        ? prev.serviceTiers.filter((item) => item !== tier)
        : [...prev.serviceTiers, tier],
    }));
  };

  const handleSaveTechnician = async () => {
    if (!technicianForm.name.trim() || !technicianForm.city.trim()) {
      setDashboardError(t("errTechnicianNameCityRequired"));
      return;
    }
    setIsSavingTechnician(true);
    setDashboardError("");
    try {
      const payload = {
        name: technicianForm.name.trim(),
        city: technicianForm.city.trim(),
        phone: technicianForm.phone || undefined,
        serviceTiers: technicianForm.serviceTiers,
        specialty: technicianForm.specialty || undefined,
      };
      if (editingTechnicianId) {
        await updateTechnician(editingTechnicianId, payload);
        setActionMessage(t("successTechnicianUpdated"));
      } else {
        await createTechnician(payload);
        setActionMessage(t("successTechnicianAdded"));
      }
      setTechnicianDialogOpen(false);
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errSaveTechnician"));
    } finally {
      setIsSavingTechnician(false);
    }
  };

  const handleToggleTechnicianActive = async (technician: Technician) => {
    try {
      await updateTechnician(technician.id, { isActive: !technician.isActive });
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errUpdateTechnician"));
    }
  };

  const handleToggleVendorSuspended = async (vendor: Vendor) => {
    const reason = window.prompt(
      vendor.status === "SUSPENDED"
        ? "Un-suspend this vendor? This lets them list cars again. Leave blank to confirm."
        : "Reason for suspending this vendor? This immediately hides their active listings from the public marketplace."
    );
    if (reason === null) return;
    setDashboardError("");
    try {
      if (vendor.status === "SUSPENDED") {
        await unsuspendVendor(vendor.id);
        setActionMessage(t("successVendorReactivated"));
      } else {
        await suspendVendor(vendor.id, reason);
        setActionMessage(t("successVendorSuspended"));
      }
      await refreshPlatformData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errUpdateVendorStatus"));
    }
  };

  const handleToggleCarHidden = async (car: { id: string; hiddenByPlatform?: boolean }) => {
    const reason = window.prompt(
      car.hiddenByPlatform
        ? "Un-hide this listing? Leave blank to confirm."
        : "Reason for hiding this listing from the public marketplace?"
    );
    if (reason === null) return;
    setDashboardError("");
    try {
      if (car.hiddenByPlatform) {
        await unhidePlatformCar(car.id);
        setActionMessage(t("successListingRestored"));
      } else {
        await hidePlatformCar(car.id, reason);
        setActionMessage(t("successListingHidden"));
      }
      await refreshDashboardData();
      await refreshPlatformData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errUpdateListingVisibility"));
    }
  };

  const openReviewComplaint = (complaint: Complaint) => {
    setReviewingComplaint(complaint);
    setReviewNote("");
    setComplaintDialogOpen(true);
  };

  const handleReviewComplaint = async (decision: "SUBSTANTIATED" | "DISMISSED" | "RESOLVED") => {
    if (!reviewingComplaint) return;
    if (decision === "SUBSTANTIATED" && !reviewNote.trim()) {
      setDashboardError(t("errAddReviewNote"));
      return;
    }
    setIsReviewing(true);
    setDashboardError("");
    try {
      await reviewComplaint(reviewingComplaint.id, {
        decision,
        note: reviewNote.trim() || undefined,
      });
      setComplaintDialogOpen(false);
      setActionMessage(
        decision === "SUBSTANTIATED"
          ? "Complaint substantiated - vendor will be auto-flagged after 3+ substantiated complaints in 30 days."
          : decision === "DISMISSED"
            ? "Complaint dismissed."
            : "Complaint marked resolved."
      );
      await refreshPlatformData();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errReviewComplaint"));
    } finally {
      setIsReviewing(false);
    }
  };

  const handleFlagFraudulent = async (roundId: string) => {
    const reason = window.prompt(
      "Confirm this inspection file is fraudulent. The listing will be permanently hidden from the marketplace. Reason:"
    );
    if (!reason) return;
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      await flagRoundFraudulent(roundId, reason);
      setActionMessage(t("successRoundFlagged"));
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(localizeError(error, t, "errFlagRound"));
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const stats = [
    { label: "Total Cars", value: String(dashboardSummary?.totalCars ?? dashboardCars.length), change: "Live", icon: Car, trend: "up" },
    { label: "Active Listings", value: String(dashboardSummary?.availableCars ?? dashboardCars.filter((car) => car.status === "available").length), change: "Live", icon: Activity, trend: "up" },
    {
      label: "Monthly Commission",
      value: dashboardSummary
        ? `${dashboardSummary.monthlyCommission.amount.toLocaleString()} ${dashboardSummary.monthlyCommission.currency}`
        : "$0",
      change: `${Math.round((dashboardSummary?.conversionRate ?? 0) * 100)}%`,
      icon: DollarSign,
      trend: "up",
    },
    { label: "New Inquiries", value: String(dashboardSummary?.activeLeads ?? leads.length), change: "Live", icon: MessageSquare, trend: "up" },
  ];

  const recentCars = dashboardCars.slice(0, 5);
  const filteredDashboardCars = dashboardCars.filter((car) =>
    `${car.brand} ${car.model} ${car.category} ${car.city ?? ""}`
      .toLowerCase()
      .includes(carSearch.toLowerCase())
  );
  const inquiries = leads.map((lead) => {
    const car = dashboardCars.find((item) => item.id === lead.carId);
    return {
      id: lead.id,
      name: lead.fullName,
      email: lead.email ?? "No email",
      phone: lead.phone,
      car: car ? `${car.brand} ${car.model}` : lead.carId,
      status: lead.status,
      date: new Date(lead.createdAt).toLocaleDateString(),
    };
  });

  const sidebarItems = [
    { id: "overview", label: dt("overview"), icon: LayoutDashboard },
    { id: "cars", label: dt("cars"), icon: Car },
    { id: "inquiries", label: dt("inquiries"), icon: MessageSquare },
    { id: "deals", label: dt("deals"), icon: Handshake },
    { id: "inspections", label: dt("inspections"), icon: ShieldCheck },
    { id: "maintenance", label: dt("maintenance"), icon: Wrench },
    { id: "favorites", label: dt("favorites"), icon: Heart },
    { id: "analytics", label: dt("analytics"), icon: TrendingUp },
    { id: "settings", label: dt("settings"), icon: Settings },
    ...(isPlatformAdmin
      ? [{ id: "vendors", label: dt("marketplaceOversight"), icon: ShieldAlert }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 py-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-dark-card border border-gold/20 rounded-xl p-4 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 mb-4 border-b border-gold/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-dark font-bold text-lg">
                  {user?.name?.charAt(0) || dt("admin").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{user?.name || dt("adminUser")}</p>
                  <p className="text-gold text-xs truncate">{user?.email || "admin@drivex.com"}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-gold/10 text-gold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="border-t border-gold/10 mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  {dt("logout")}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white capitalize">
                  {sidebarItems.find((item) => item.id === activeTab)?.label ?? activeTab}
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {dt("welcomeBack")}, {user?.name?.split(" ")[0] || dt("admin")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    placeholder={dt("search")}
                    className="pl-9 bg-dark-card border-gold/20 text-white placeholder:text-white/30 w-48"
                  />
                </div>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className="relative w-10 h-10 rounded-lg bg-dark-card border border-gold/20 flex items-center justify-center text-white/60 hover:text-gold transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-dark text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
            </div>

            {dashboardError && (
              <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
                {dashboardError}
              </div>
            )}
            {actionMessage && (
              <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {actionMessage}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-dark-card border border-gold/10 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-gold" />
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs font-medium ${
                            stat.trend === "up" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {stat.trend === "up" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {stat.change}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-white/50 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-bold text-lg">{dt("recentInquiries")}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("inquiries")}
                        className="text-gold hover:text-gold-light hover:bg-gold/10"
                      >
                        {dt("viewAll")}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {inquiries.slice(0, 4).map((inquiry) => (
                        <div key={inquiry.id} className="flex items-center gap-4 p-3 bg-dark rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold shrink-0">
                            {inquiry.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{inquiry.name}</p>
                            <p className="text-white/50 text-xs truncate">{inquiry.car}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                              inquiry.status === "NEW"
                                ? "bg-green-500/10 text-green-400"
                                : inquiry.status === "CONTACTED"
                                ? "bg-blue-500/10 text-blue-400"
                                : inquiry.status === "NEGOTIATING" || inquiry.status === "APPROVED"
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-white/10 text-white/60"
                            }`}
                          >
                            {inquiry.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-bold text-lg">{dt("recentListings")}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("cars")}
                        className="text-gold hover:text-gold-light hover:bg-gold/10"
                      >
                        {dt("viewAll")}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {recentCars.map((car) => (
                        <div key={car.id} className="flex items-center gap-4 p-3 bg-dark rounded-lg">
                          <img
                            src={car.image}
                            alt={`${car.brand} ${car.model}`}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                              {car.brand} {car.model}
                            </p>
                            <p className="text-gold text-xs">${car.price.toLocaleString()}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                              car.status === "available"
                                ? "bg-green-500/10 text-green-400"
                                : car.status === "reserved"
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {car.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">{dt("quickActions")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/inventory">
                      <Button
                        variant="outline"
                        className="w-full h-24 border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex flex-col items-center gap-2"
                      >
                        <Car className="w-6 h-6 text-gold" />
                        <span className="text-white/70 text-sm">{dt("browseInventory")}</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={openCreateCar}
                      className="w-full h-24 border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex flex-col items-center gap-2"
                    >
                      <Plus className="w-6 h-6 text-gold" />
                      <span className="text-white/70 text-sm">{dt("addNewCar")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("inquiries")}
                      className="w-full h-24 border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex flex-col items-center gap-2"
                    >
                      <MessageSquare className="w-6 h-6 text-gold" />
                      <span className="text-white/70 text-sm">{dt("viewMessages")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cars Tab */}
            {activeTab === "cars" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      placeholder={dt("searchCars")}
                      value={carSearch}
                      onChange={(event) => setCarSearch(event.target.value)}
                      className="pl-9 bg-dark-card border-gold/20 text-white placeholder:text-white/30 w-64"
                    />
                  </div>
                  <Button onClick={openCreateCar} className="bg-gold hover:bg-gold-light text-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    {dt("addNewCar")}
                  </Button>
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("car")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("category")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("price")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("status")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("rating")}</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDashboardCars.map((car) => (
                          <tr key={car.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={car.image} alt={`${car.brand} ${car.model}`} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <p className="text-white font-medium text-sm">{car.brand} {car.model}</p>
                                  <p className="text-white/50 text-xs">{car.year}</p>
                                  {car.hiddenByPlatform && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 inline-block mt-1" title={car.hiddenReason}>
                                      {dt("hiddenByPlatform")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white/60 text-sm">{car.category}</td>
                            <td className="px-4 py-3 text-gold font-medium text-sm">${car.price.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                car.status === "available" ? "bg-green-500/10 text-green-400" :
                                car.status === "reserved" ? "bg-orange-500/10 text-orange-400" :
                                "bg-red-500/10 text-red-400"
                              }`}>
                                {car.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 text-gold text-sm">
                                <Star className="w-3 h-3 fill-current" />
                                {car.rating}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Link to={`/car/${car.id}`}>
                                  <Button variant="ghost" size="sm" className="text-gold hover:bg-gold/10 h-8 w-8 p-0">
                                    <ArrowUpRight className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openInspectionDialog(car.id)}
                                  title={dt("manageInspection")}
                                  className="text-gold hover:bg-gold/10 h-8 w-8 p-0"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditCar(car.id)}
                                  className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                {isPlatformAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleCarHidden(car)}
                                    title={car.hiddenByPlatform ? dt("restoreMarketplace") : dt("hideMarketplace")}
                                    className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                                  >
                                    {car.hiddenByPlatform ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCar(car.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Inquiries Tab */}
            {activeTab === "inquiries" && (
              <div className="space-y-6">
                <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("customer")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("interestedIn")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("date")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("status")}</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.map((inquiry) => (
                          <tr key={inquiry.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xs">
                                  {inquiry.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{inquiry.name}</p>
                                  <p className="text-white/50 text-xs">{inquiry.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white/60 text-sm">{inquiry.car}</td>
                            <td className="px-4 py-3 text-white/60 text-sm">{inquiry.date}</td>
                            <td className="px-4 py-3">
                              <Select
                                value={inquiry.status}
                                onValueChange={(status) => handleLeadStatusChange(inquiry.id, status)}
                              >
                                <SelectTrigger className="h-8 w-36 bg-dark border-gold/20 text-white text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-card border-gold/20">
                                  {["NEW", "CONTACTED", "NEGOTIATING", "APPROVED", "REJECTED", "CLOSED"].map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.location.href = `tel:${inquiry.phone}`}
                                  className="text-gold hover:bg-gold/10 h-8 w-8 p-0"
                                >
                                  <Phone className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => inquiry.email !== "No email" && (window.location.href = `mailto:${inquiry.email}`)}
                                  className="text-gold hover:bg-gold/10 h-8 w-8 p-0"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === "deals" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-white/50 text-sm">
                    {dt("createDealHint")}
                  </p>
                  <Button
                    onClick={openCreateDeal}
                    disabled={availableLeadsForDeal.length === 0}
                    className="bg-gold hover:bg-gold-light text-dark shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {dt("createDeal")}
                  </Button>
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("car")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("type")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("finalPrice")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("commission")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("date")}</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((deal) => {
                          const car = dashboardCars.find((item) => item.id === deal.carId);
                          return (
                            <tr key={deal.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-white font-medium text-sm">
                                  {car ? `${car.brand} ${car.model}` : deal.carId}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">{deal.type}</span>
                              </td>
                              <td className="px-4 py-3 text-gold font-medium text-sm">
                                {deal.finalPrice.amount.toLocaleString()} {deal.finalPrice.currency}
                              </td>
                              <td className="px-4 py-3 text-white/60 text-sm">
                                {deal.commission.amount.toLocaleString()} {deal.commission.currency}
                                <span className="text-white/30 text-xs">
                                  {" "}
                                  (flat {deal.commissionType === "PERCENTAGE" ? `${deal.commissionValue}%` : "rate"})
                                </span>
                              </td>
                              <td className="px-4 py-3 text-white/60 text-sm">
                                {new Date(deal.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDeal(deal.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {deals.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-white/40 text-sm">
                              {dt("noDeals")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Inspections Tab */}
            {activeTab === "inspections" && (
              <div className="space-y-8">
                <div>
                  <p className="text-white/50 text-sm mb-4">
                    {dt("inspectionHint")}
                  </p>
                  <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("car")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("status")}</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("action")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardCars.map((car) => (
                            <tr key={car.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                              <td className="px-4 py-3 text-white font-medium text-sm">{car.brand} {car.model}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  car.status === "available" ? "bg-green-500/10 text-green-400" :
                                  car.status === "reserved" ? "bg-orange-500/10 text-orange-400" :
                                  "bg-red-500/10 text-red-400"
                                }`}>
                                  {car.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openInspectionDialog(car.id)}
                                  className="text-gold hover:bg-gold/10"
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  {dt("manage")}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">{dt("technicianNetwork")}</h3>
                    <Button onClick={openCreateTechnician} className="bg-gold hover:bg-gold-light text-dark">
                      <Plus className="w-4 h-4 mr-2" />
                      {dt("addTechnician")}
                    </Button>
                  </div>
                  <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("name")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("city")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("tiers")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("specialty")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("active")}</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {technicians.map((technician) => (
                            <tr key={technician.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                              <td className="px-4 py-3 text-white font-medium text-sm">{technician.name}</td>
                              <td className="px-4 py-3 text-white/60 text-sm">{technician.city}</td>
                              <td className="px-4 py-3 text-white/60 text-sm">{technician.serviceTiers.join(", ") || "-"}</td>
                              <td className="px-4 py-3 text-white/60 text-sm">{technician.specialty || "-"}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleToggleTechnicianActive(technician)}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    technician.isActive ? "bg-green-500/10 text-green-400" : "bg-white/10 text-white/40"
                                  }`}
                                >
                                  {technician.isActive ? dt("active") : dt("inactive")}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditTechnician(technician)}
                                  className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {technicians.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-white/40 text-sm">
                                {dt("noTechnicians")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{dt("maintenanceRequests")}</h3>
                    <p className="text-white/50 text-sm mt-1">
                      {dt("maintenanceHint")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => refreshDashboardData().catch((error: Error) => setDashboardError(localizeError(error, t)))}
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    {dt("refresh")}
                  </Button>
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("customerCar")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("type")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("status")}</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("vendor")}</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceRequests.map((request) => {
                          const firstActiveTechnician = technicians.find((technician) => technician.isActive);
                          const canVendorAcknowledge = !isPlatformAdmin && request.status === "SENT_TO_VENDOR";
                          return (
                            <tr key={request.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors align-top">
                              <td className="px-4 py-3">
                                <p className="text-white font-medium text-sm">{request.customerName ?? "Customer"}</p>
                                <p className="text-white/50 text-xs">{request.car ? `${request.car.brand} ${request.car.model} ${request.car.year}` : request.carId}</p>
                                <p className="text-white/40 text-xs mt-1">{request.city} · {new Date(request.createdAt).toLocaleDateString()}</p>
                              </td>
                              <td className="px-4 py-3 text-white/70 text-sm">{request.requestType.replaceAll("_", " ")}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">
                                  {request.status.replaceAll("_", " ")}
                                </span>
                                {request.dealType === "RENT" && (
                                  <p className="text-orange-400 text-xs mt-2">{dt("rentalFlow")}</p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-white/60 text-sm">
                                {request.vendorName ?? "-"}
                                {request.assignedPartnerName && (
                                  <p className="text-[#00D2FF] text-xs mt-1">{request.assignedPartnerName}</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openMaintenanceDetail(request.id)}
                                    className="border-white/20 text-white/80 hover:bg-white/10"
                                  >
                                    Details
                                  </Button>
                                  {isPlatformAdmin && request.status === "ADMIN_REVIEW" && (
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        await triageMaintenanceRequest(request.id, { status: "SENT_TO_VENDOR", note: "Rental maintenance routed to vendor." });
                                        await refreshDashboardData();
                                      }}
                                      className="bg-gold hover:bg-gold-light text-dark"
                                    >
                                      Send Vendor
                                    </Button>
                                  )}
                                  {isPlatformAdmin && request.status === "NEW" && (
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        await triageMaintenanceRequest(request.id, { status: "TRIAGED", note: "Request triaged by platform." });
                                        await refreshDashboardData();
                                      }}
                                      className="bg-gold hover:bg-gold-light text-dark"
                                    >
                                      Triage
                                    </Button>
                                  )}
                                  {canVendorAcknowledge && (
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        await updateMaintenanceRequestStatus(request.id, { status: "VENDOR_ACKNOWLEDGED", note: "Vendor acknowledged rental maintenance." });
                                        await refreshDashboardData();
                                      }}
                                      className="bg-gold hover:bg-gold-light text-dark"
                                    >
                                      Acknowledge
                                    </Button>
                                  )}
                                  {isPlatformAdmin && ["TRIAGED", "VENDOR_ACKNOWLEDGED"].includes(request.status) && firstActiveTechnician && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        await assignMaintenancePartner(request.id, { partnerId: firstActiveTechnician.id, note: `Assigned to ${firstActiveTechnician.name}.` });
                                        await refreshDashboardData();
                                      }}
                                      className="border-gold/30 text-gold hover:bg-gold/10"
                                    >
                                      Assign
                                    </Button>
                                  )}
                                  {isPlatformAdmin && ["ASSIGNED_TO_PARTNER", "VENDOR_ACKNOWLEDGED", "TRIAGED"].includes(request.status) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                                        await scheduleMaintenanceRequest(request.id, { scheduledAt, note: "Maintenance scheduled." });
                                        await refreshDashboardData();
                                      }}
                                      className="border-gold/30 text-gold hover:bg-gold/10"
                                    >
                                      Schedule
                                    </Button>
                                  )}
                                  {isPlatformAdmin && request.status === "SCHEDULED" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        await updateMaintenanceRequestStatus(request.id, { status: "IN_PROGRESS", note: "Maintenance work started." });
                                        await refreshDashboardData();
                                      }}
                                      className="border-gold/30 text-gold hover:bg-gold/10"
                                    >
                                      Start
                                    </Button>
                                  )}
                                  {isPlatformAdmin && request.status === "IN_PROGRESS" && (
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        await updateMaintenanceRequestStatus(request.id, {
                                          status: "COMPLETED",
                                          note: "Maintenance completed.",
                                          publicSummary: "Drive X verified maintenance completed."
                                        });
                                        await refreshDashboardData();
                                      }}
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Complete
                                    </Button>
                                  )}
                                  {isPlatformAdmin && !["COMPLETED", "CANCELLED", "REJECTED"].includes(request.status) && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={async () => {
                                        await updateMaintenanceRequestStatus(request.id, { status: "REJECTED", note: "Request rejected by platform." });
                                        await refreshDashboardData();
                                      }}
                                      className="text-red-400 hover:bg-red-500/10"
                                    >
                                      Reject
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {maintenanceRequests.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-white/40 text-sm">
                              No maintenance requests yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardCars.slice(0, 4).map((car) => (
                    <Link
                      key={car.id}
                      to={`/car/${car.id}`}
                      className="group bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img src={car.image} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent" />
                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="text-white font-bold group-hover:text-gold transition-colors">{car.brand} {car.model}</h4>
                        <p className="text-gold font-semibold mt-1">${car.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Total Views", value: "45.2K", change: "+23%", icon: Activity },
                    { label: "Inquiry Rate", value: "12.5%", change: "+5%", icon: MessageSquare },
                    { label: "Avg. Response Time", value: "2.3h", change: "-15%", icon: Clock },
                    { label: "Conversion Rate", value: "8.7%", change: "+2%", icon: TrendingUp },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-dark-card border border-gold/20 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <stat.icon className="w-5 h-5 text-gold" />
                        <span className="text-green-400 text-xs font-medium">{stat.change}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-white/50 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-6">{dt("monthlySalesOverview")}</h3>
                  <div className="space-y-4">
                    {[
                      { month: "January", sales: 18, target: 20 },
                      { month: "February", sales: 24, target: 22 },
                      { month: "March", sales: 31, target: 25 },
                      { month: "April", sales: 28, target: 28 },
                      { month: "May", sales: 35, target: 30 },
                      { month: "June", sales: 42, target: 35 },
                    ].map((item) => (
                      <div key={item.month}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 text-sm">{item.month}</span>
                          <span className="text-gold text-sm font-medium">{item.sales} cars</span>
                        </div>
                        <div className="h-2 bg-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full transition-all"
                            style={{ width: `${(item.sales / item.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-6">{dt("profileSettings")}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">{dt("fullName")}</label>
                        <Input
                          value={profileNameInput}
                          onChange={(e) => setProfileNameInput(e.target.value)}
                          className="bg-dark border-gold/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">{dt("email")}</label>
                        <Input
                          value={user?.email || ""}
                          disabled
                          className="bg-dark border-gold/20 text-white/50 cursor-not-allowed"
                        />
                        <p className="text-white/30 text-xs mt-1">{dt("emailCannotBeChanged")}</p>
                      </div>
                    </div>
                    <Button
                      onClick={saveProfile}
                      disabled={isSavingProfile || !profileNameInput.trim()}
                      className="bg-gold hover:bg-gold-light text-dark font-bold mt-4"
                    >
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-6">{dt("notificationPreferences")}</h3>
                  <div className="space-y-4">
                    {[
                      { label: "New Inquiries", desc: "Get notified when a new inquiry is received" },
                      { label: "Price Alerts", desc: "Receive alerts when car prices change" },
                      { label: "System Updates", desc: "Important system notifications" },
                    ].map((pref) => (
                      <div key={pref.label} className="flex items-center justify-between py-3 border-b border-gold/10">
                        <div>
                          <p className="text-white font-medium">{pref.label}</p>
                          <p className="text-white/50 text-sm">{pref.desc}</p>
                        </div>
                        <div className="w-11 h-6 rounded-full bg-gold/20 relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-gold" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Marketplace Oversight Tab (Platform Admin only) */}
            {activeTab === "vendors" && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{dt("vendors")}</h3>
                      <p className="text-white/50 text-sm mt-1">
                        Tiered oversight: vendors flagged for fraud are monitored; suspending a vendor hides
                        their listings from the public marketplace.
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">
                      {vendors.length} vendors
                    </span>
                  </div>
                  <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("vendor")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("listings")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("openComplaints")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("status")}</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendors.map((vendor) => (
                            <tr key={vendor.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xs">
                                    {vendor.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-white font-medium text-sm">{vendor.name}</p>
                                    {vendor.flaggedAt && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 inline-block mt-1" title={vendor.flaggedReason}>
                                        Auto-flagged for fraud review
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-white/60 text-sm">{vendor.carCount}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    vendor.openComplaints > 0 ? "bg-orange-500/10 text-orange-400" : "bg-green-500/10 text-green-400"
                                  }`}
                                >
                                  {vendor.openComplaints}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    vendor.status === "SUSPENDED" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                                  }`}
                                >
                                  {vendor.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleVendorSuspended(vendor)}
                                  className={vendor.status === "SUSPENDED"
                                    ? "text-green-400 hover:bg-green-500/10"
                                    : "text-red-400 hover:bg-red-500/10"}
                                >
                                  {vendor.status === "SUSPENDED" ? "Re-activate" : "Suspend"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {vendors.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-white/40 text-sm">
                                No vendors registered yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{dt("customerComplaints")}</h3>
                      <p className="text-white/50 text-sm mt-1">
                        Substantiate a complaint to count toward auto-flagging. 3+ substantiated complaints
                        in 30 days auto-flags the vendor.
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">
                      {complaints.filter((complaint) => complaint.status === "OPEN").length} open
                    </span>
                  </div>
                  <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("car")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("vendor")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("customer")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("complaint")}</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("status")}</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">{dt("actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {complaints.map((complaint) => (
                            <tr key={complaint.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                              <td className="px-4 py-3 text-white text-sm">
                                {complaint.carBrand} {complaint.carModel}
                              </td>
                              <td className="px-4 py-3 text-white/60 text-sm">{complaint.vendorName || "-"}</td>
                              <td className="px-4 py-3 text-white/60 text-sm">{complaint.customerName || "-"}</td>
                              <td className="px-4 py-3 text-white/60 text-sm max-w-xs">
                                <span className="line-clamp-2">{complaint.description}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    complaint.status === "OPEN"
                                      ? "bg-blue-500/10 text-blue-400"
                                      : complaint.status === "SUBSTANTIATED"
                                        ? "bg-orange-500/10 text-orange-400"
                                        : complaint.status === "RESOLVED"
                                          ? "bg-green-500/10 text-green-400"
                                          : "bg-white/10 text-white/60"
                                  }`}
                                >
                                  {complaint.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {complaint.status === "OPEN" ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openReviewComplaint(complaint)}
                                    className="text-gold hover:bg-gold/10"
                                  >
                                    {dl("Review", "مراجعة")}
                                  </Button>
                                ) : (
                                  <span className="text-white/30 text-xs">{complaint.reviewNote}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {complaints.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-white/40 text-sm">
                                {dl("No customer complaints yet.", "لا توجد شكاوى عملاء حتى الآن.")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={carDialogOpen} onOpenChange={setCarDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingCarId ? dl("Edit Car", "تعديل السيارة") : dt("addNewCar")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder={dl("Brand", "العلامة")}
              value={carForm.brand}
              onChange={(event) => setCarForm({ ...carForm, brand: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder={dl("Model", "الطراز")}
              value={carForm.model}
              onChange={(event) => setCarForm({ ...carForm, model: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder={dl("Year", "السنة")}
              value={carForm.year}
              onChange={(event) => setCarForm({ ...carForm, year: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Select
              value={carForm.listingType}
              onValueChange={(value) =>
                setCarForm({
                  ...carForm,
                  listingType: value,
                  salePriceAmount: value === "SALE" ? carForm.salePriceAmount : "",
                  dailyRentPriceAmount: value === "RENT" ? carForm.dailyRentPriceAmount : "",
                  monthlyRentPriceAmount: value === "RENT" ? carForm.monthlyRentPriceAmount : "",
                })
              }
            >
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder={dl("Listing type", "نوع العرض")} />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                <SelectItem value="SALE">{enumLabel("SALE")}</SelectItem>
                <SelectItem value="RENT">{enumLabel("RENT")}</SelectItem>
              </SelectContent>
            </Select>
            {carForm.listingType === "SALE" && (
              <Input
                type="number"
                placeholder={dl("Sale price USD", "سعر البيع بالدولار")}
                value={carForm.salePriceAmount}
                onChange={(event) => setCarForm({ ...carForm, salePriceAmount: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
            )}
            {carForm.listingType === "RENT" && (
              <>
                <Input
                  type="number"
                  placeholder={dl("Daily rent USD", "الإيجار اليومي بالدولار")}
                  value={carForm.dailyRentPriceAmount}
                  onChange={(event) => setCarForm({ ...carForm, dailyRentPriceAmount: event.target.value })}
                  className="bg-dark border-gold/20 text-white"
                />
                <Input
                  type="number"
                  placeholder={dl("Monthly rent USD", "الإيجار الشهري بالدولار")}
                  value={carForm.monthlyRentPriceAmount}
                  onChange={(event) => setCarForm({ ...carForm, monthlyRentPriceAmount: event.target.value })}
                  className="bg-dark border-gold/20 text-white"
                />
              </>
            )}
            <div>
              <Select
                value={carForm.status}
                onValueChange={(value) => setCarForm({ ...carForm, status: value })}
                disabled={!editingCarId}
              >
                <SelectTrigger className="bg-dark border-gold/20 text-white disabled:opacity-50">
                  <SelectValue placeholder={dt("status")} />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-gold/20">
                  {["AVAILABLE", "RESERVED", "SOLD", "RENTED", "INACTIVE"].map((status) => (
                    <SelectItem key={status} value={status}>{enumLabel(status)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!editingCarId && (
                <p className="text-white/30 text-xs mt-1">
                  {dl("New cars start Inactive - add a maintenance inspection to publish them.", "السيارات الجديدة تبدأ كغير نشطة. أضف ملف صيانة أو فحصاً لنشرها.")}
                </p>
              )}
            </div>
            <Select value={carForm.condition} onValueChange={(value) => setCarForm({ ...carForm, condition: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder={dl("Condition", "الحالة")} />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                <SelectItem value="NEW">{enumLabel("NEW")}</SelectItem>
                <SelectItem value="USED">{enumLabel("USED")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={carForm.fuelType} onValueChange={(value) => setCarForm({ ...carForm, fuelType: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder={dl("Fuel type", "نوع الوقود")} />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                {["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC"].map((fuel) => (
                  <SelectItem key={fuel} value={fuel}>{enumLabel(fuel)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={carForm.transmission} onValueChange={(value) => setCarForm({ ...carForm, transmission: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder={dl("Transmission", "ناقل الحركة")} />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                <SelectItem value="AUTOMATIC">{enumLabel("AUTOMATIC")}</SelectItem>
                <SelectItem value="MANUAL">{enumLabel("MANUAL")}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder={dl("Mileage km", "المسافة بالكيلومتر")}
              value={carForm.mileageKm}
              onChange={(event) => setCarForm({ ...carForm, mileageKm: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder={dl("Color", "اللون")}
              value={carForm.color}
              onChange={(event) => setCarForm({ ...carForm, color: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder={dl("City", "المدينة")}
              value={carForm.city}
              onChange={(event) => setCarForm({ ...carForm, city: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder={dl("Engine", "المحرك")}
              value={carForm.engine}
              onChange={(event) => setCarForm({ ...carForm, engine: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder={dl("Seats", "عدد المقاعد")}
              value={carForm.seats}
              onChange={(event) => setCarForm({ ...carForm, seats: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder={dl("Horsepower", "القوة الحصانية")}
              value={carForm.horsepower}
              onChange={(event) => setCarForm({ ...carForm, horsepower: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Textarea
              placeholder={dl("Description", "الوصف")}
              value={carForm.description}
              onChange={(event) => setCarForm({ ...carForm, description: event.target.value })}
              className="sm:col-span-2 bg-dark border-gold/20 text-white min-h-28"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setCarDialogOpen(false)}
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              {dl("Cancel", "إلغاء")}
            </Button>
            <Button
              onClick={handleSaveCar}
              disabled={isSavingCar}
              className="bg-gold hover:bg-gold-light text-dark font-bold"
            >
              {isSavingCar ? dl("Saving...", "جاري الحفظ...") : dl("Save Car", "حفظ السيارة")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{dt("createDeal")}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <Select value={dealForm.leadId} onValueChange={handleDealLeadChange}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder={dl("Select an approved lead", "اختر طلباً مقبولاً")} />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                {availableLeadsForDeal.map((lead) => {
                  const car = dashboardCars.find((item) => item.id === lead.carId);
                  return (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.fullName} — {car ? `${car.brand} ${car.model}` : lead.carId}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Select value={dealForm.type} onValueChange={(value) => setDealForm({ ...dealForm, type: value })}>
                <SelectTrigger className="bg-dark border-gold/20 text-white">
                  <SelectValue placeholder={dl("Deal type", "نوع الصفقة")} />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-gold/20">
                  <SelectItem value="SALE">{enumLabel("SALE")}</SelectItem>
                  <SelectItem value="RENT">{enumLabel("RENT")}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={dl("Final price USD", "السعر النهائي بالدولار")}
                value={dealForm.finalPriceAmount}
                onChange={(event) => setDealForm({ ...dealForm, finalPriceAmount: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
            </div>

            <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-white/60">
              {dl("A flat platform commission applies to every deal. Commission is calculated automatically from the final price.", "تُطبّق عمولة منصة ثابتة على كل صفقة، ويتم احتسابها تلقائياً من السعر النهائي.")}
            </div>

            <Textarea
              placeholder={dl("Notes", "ملاحظات")}
              value={dealForm.notes}
              onChange={(event) => setDealForm({ ...dealForm, notes: event.target.value })}
              className="bg-dark border-gold/20 text-white min-h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDealDialogOpen(false)}
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              {dl("Cancel", "إلغاء")}
            </Button>
            <Button
              onClick={handleSaveDeal}
              disabled={isSavingDeal || !dealForm.leadId}
              className="bg-gold hover:bg-gold-light text-dark font-bold"
            >
              {isSavingDeal ? dl("Saving...", "جاري الحفظ...") : dl("Save Deal", "حفظ الصفقة")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspection Management Dialog */}
      <Dialog open={inspectionDialogOpen} onOpenChange={setInspectionDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{dt("manageInspection")}</DialogTitle>
          </DialogHeader>

          {isLoadingInspection ? (
            <p className="text-white/50 text-sm py-8 text-center">{dl("Loading...", "جاري التحميل...")}</p>
          ) : (
            <div className="space-y-6">
              {/* Round history */}
              <div>
                <h4 className="text-white/70 text-sm font-medium mb-2">{dl("History", "السجل")}</h4>
                <div className="space-y-2">
                  {(inspectionCase?.rounds ?? []).map((round) => (
                    <div key={round.id} className="bg-dark border border-gold/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">
                          Round #{round.roundNumber} - {round.sourceType}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            round.status === "FLAGGED_FRAUDULENT"
                              ? "bg-red-500/10 text-red-400"
                              : round.status === "CERTIFIED"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-gold/10 text-gold"
                          }`}
                        >
                          {round.status}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        Requested by {round.requestedByRole} - {new Date(round.createdAt).toLocaleString()}
                      </p>
                      {round.templateData && (
                        <p className="text-white/60 text-xs mt-2">Notes: {String(round.templateData.notes ?? "")}</p>
                      )}
                      {round.externalFileUrl && (
                        <a
                          href={round.externalFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold text-xs mt-2 inline-block underline"
                        >
                          View uploaded file
                        </a>
                      )}
                      {round.overallVerdict && (
                        <p className="text-white/60 text-xs mt-2">Verdict: {round.overallVerdict}</p>
                      )}
                      {round.findings.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {round.findings.map((finding) => (
                            <li key={finding.id} className="text-xs text-orange-300">
                              - {finding.description} ({finding.severity})
                              {finding.estimatedRepairCost && (
                                <> — est. {finding.estimatedRepairCost.amount} {finding.estimatedRepairCost.currency}</>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {(!inspectionCase || inspectionCase.rounds.length === 0) && (
                    <p className="text-white/40 text-sm">{dl("No inspection history yet.", "لا يوجد سجل فحوصات بعد.")}</p>
                  )}
                </div>
              </div>

              {/* Contextual action panel */}
              <div className="border-t border-gold/10 pt-4">
                {isPlatformAdmin && latestInspectionRound?.status === "FILE_ACCEPTED" && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
                    <p className="text-red-300 text-sm font-medium mb-2">
                      {dl("Suspected fraudulent maintenance file? Flagging it permanently hides this listing from the marketplace.", "هل ملف الصيانة مشكوك به؟ وضع علامة احتيال سيخفي هذا العرض من السوق نهائياً.")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={inspectionActionLoading}
                      onClick={() => handleFlagFraudulent(latestInspectionRound.id)}
                      className="border-red-400/50 text-red-300 hover:bg-red-500/10"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      {inspectionActionLoading ? dl("Flagging...", "جاري التعليم...") : dl("Flag as Fraudulent & Hide", "تعليم كاحتيال وإخفاء")}
                    </Button>
                  </div>
                )}
                {(!latestInspectionRound || ["FILE_ACCEPTED", "CERTIFIED", "CANCELLED"].includes(latestInspectionRound.status)) && (
                  <div className="space-y-4">
                    <h4 className="text-white/70 text-sm font-medium">
                      {latestInspectionRound ? dl("Submit a new maintenance file", "إرسال ملف صيانة جديد") : dl("Submit maintenance file (required to publish)", "إرسال ملف الصيانة المطلوب للنشر")}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant={inspectionSourceType === "TEMPLATE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInspectionSourceType("TEMPLATE")}
                        className={inspectionSourceType === "TEMPLATE" ? "bg-gold text-dark" : "border-gold/30 text-gold"}
                      >
                        {dl("Fill in details", "تعبئة التفاصيل")}
                      </Button>
                      <Button
                        variant={inspectionSourceType === "EXTERNAL_FILE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInspectionSourceType("EXTERNAL_FILE")}
                        className={inspectionSourceType === "EXTERNAL_FILE" ? "bg-gold text-dark" : "border-gold/30 text-gold"}
                      >
                        {dl("Upload a file", "رفع ملف")}
                      </Button>
                    </div>
                    {inspectionSourceType === "TEMPLATE" ? (
                      <Textarea
                        placeholder={dl("Maintenance details (last service date, condition, known issues...)", "تفاصيل الصيانة: تاريخ آخر صيانة، الحالة، الأعطال المعروفة...")}
                        value={inspectionTemplateNotes}
                        onChange={(event) => setInspectionTemplateNotes(event.target.value)}
                        className="bg-dark border-gold/20 text-white min-h-24"
                      />
                    ) : (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(event) => setInspectionFile(event.target.files?.[0] ?? null)}
                        className="text-white/70 text-sm"
                      />
                    )}
                    <Button
                      onClick={handleSubmitSellerInspection}
                      disabled={inspectionActionLoading}
                      className="bg-gold hover:bg-gold-light text-dark font-bold"
                    >
                      {inspectionActionLoading ? dl("Submitting...", "جاري الإرسال...") : dl("Submit", "إرسال")}
                    </Button>

                    <div className="pt-2 border-t border-gold/10">
                      <p className="text-white/50 text-xs mb-2">{dl("Or request a fresh technician inspection on behalf of:", "أو اطلب فحصاً جديداً من فني بالنيابة عن:")}</p>
                      <div className="flex gap-2">
                        {(["SELLER", "BUYER", "RENTER"] as const).map((role) => (
                          <Button
                            key={role}
                            variant="outline"
                            size="sm"
                            disabled={inspectionActionLoading}
                            onClick={() => handleRequestTechnicianVisit(role)}
                            className="border-gold/30 text-gold hover:bg-gold/10"
                          >
                            {enumLabel(role)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {latestInspectionRound?.status === "ESCALATED_TO_TECHNICIAN" && (
                  <div className="space-y-4">
                    <h4 className="text-white/70 text-sm font-medium">{dl("Schedule technician visit", "جدولة زيارة فني")}</h4>
                    <Select value={scheduleTechnicianId} onValueChange={setScheduleTechnicianId}>
                      <SelectTrigger className="bg-dark border-gold/20 text-white">
                        <SelectValue placeholder={dl("Choose a technician", "اختر فني")} />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-gold/20">
                        {technicians.filter((t) => t.isActive).map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name} - {technician.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(event) => setScheduleDateTime(event.target.value)}
                      className="bg-dark border-gold/20 text-white"
                    />
                    <Button
                      onClick={handleScheduleRound}
                      disabled={inspectionActionLoading}
                      className="bg-gold hover:bg-gold-light text-dark font-bold"
                    >
                      {inspectionActionLoading ? dl("Scheduling...", "جاري الجدولة...") : dl("Schedule", "جدولة")}
                    </Button>
                  </div>
                )}

                {latestInspectionRound?.status === "SCHEDULED" && (
                  <Button
                    onClick={handleStartRound}
                    disabled={inspectionActionLoading}
                    className="bg-gold hover:bg-gold-light text-dark font-bold"
                  >
                    {inspectionActionLoading ? dl("Starting...", "جاري البدء...") : dl("Start Inspection", "بدء الفحص")}
                  </Button>
                )}

                {latestInspectionRound?.status === "IN_PROGRESS" && (
                  <div className="space-y-4">
                    <h4 className="text-white/70 text-sm font-medium">{dl("Submit report", "إرسال التقرير")}</h4>
                    <Input
                      placeholder={dl("Overall verdict (e.g. Good, Fair, Poor)", "التقييم العام: جيد، مقبول، ضعيف...")}
                      value={reportVerdict}
                      onChange={(event) => setReportVerdict(event.target.value)}
                      className="bg-dark border-gold/20 text-white"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder={dl("Price USD", "السعر بالدولار")}
                        value={reportPriceAmount}
                        onChange={(event) => setReportPriceAmount(event.target.value)}
                        className="bg-dark border-gold/20 text-white"
                      />
                      <Select value={reportPaidBy} onValueChange={(value) => setReportPaidBy(value as InspectionPaidBy)}>
                        <SelectTrigger className="bg-dark border-gold/20 text-white">
                          <SelectValue placeholder={dl("Paid by", "الدفع على")} />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-gold/20">
                          {(["SELLER", "BUYER", "RENTER", "DRIVEX"] as const).map((option) => (
                            <SelectItem key={option} value={option}>{enumLabel(option)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-white/50 text-xs">{dl("Findings (optional)", "الملاحظات الفنية (اختياري)")}</p>
                        <Button variant="ghost" size="sm" onClick={addFindingRow} className="text-gold hover:bg-gold/10">
                          <Plus className="w-3 h-3 mr-1" /> {dl("Add finding", "إضافة ملاحظة")}
                        </Button>
                      </div>
                      {reportFindings.map((finding, index) => (
                        <div key={index} className="flex gap-2 items-start bg-dark border border-gold/10 rounded-lg p-2">
                          <Input
                            placeholder={dl("Description", "الوصف")}
                            value={finding.description}
                            onChange={(event) => updateFindingRow(index, { description: event.target.value })}
                            className="bg-dark border-gold/20 text-white text-sm"
                          />
                          <Select
                            value={finding.severity}
                            onValueChange={(value) => updateFindingRow(index, { severity: value as InspectionFindingSeverity })}
                          >
                            <SelectTrigger className="bg-dark border-gold/20 text-white w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-card border-gold/20">
                              {(["MINOR", "MODERATE", "SEVERE", "SAFETY_CRITICAL"] as const).map((option) => (
                                <SelectItem key={option} value={option}>{enumLabel(option)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder={dl("Cost USD", "التكلفة بالدولار")}
                            value={finding.costAmount}
                            onChange={(event) => updateFindingRow(index, { costAmount: event.target.value })}
                            className="bg-dark border-gold/20 text-white text-sm w-28"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFindingRow(index)}
                            className="text-red-400 hover:bg-red-500/10 h-9 w-9 p-0 shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleSubmitReport}
                      disabled={inspectionActionLoading}
                      className="bg-gold hover:bg-gold-light text-dark font-bold"
                    >
                      {inspectionActionLoading ? dl("Submitting...", "جاري الإرسال...") : dl("Submit Report", "إرسال التقرير")}
                    </Button>
                  </div>
                )}

                {latestInspectionRound?.status === "REPORT_SUBMITTED" && (
                  <Button
                    onClick={handleCertifyRound}
                    disabled={inspectionActionLoading}
                    className="bg-gold hover:bg-gold-light text-dark font-bold"
                  >
                    {inspectionActionLoading ? dl("Certifying...", "جاري الاعتماد...") : dl("Certify Inspection", "اعتماد الفحص")}
                  </Button>
                )}

                {latestInspectionRound && !["CERTIFIED", "CANCELLED"].includes(latestInspectionRound.status) && (
                  <Button
                    variant="ghost"
                    onClick={handleCancelRound}
                    disabled={inspectionActionLoading}
                    className="text-red-400 hover:bg-red-500/10 mt-3"
                  >
                    {dl("Cancel This Round", "إلغاء هذه الجولة")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={maintenanceDetailOpen} onOpenChange={setMaintenanceDetailOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{dl("Maintenance Request Details", "تفاصيل طلب الصيانة")}</DialogTitle>
          </DialogHeader>
          {selectedMaintenanceRequest && (
            <div className="space-y-5">
              <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">
                      {selectedMaintenanceRequest.customerName ?? dt("customer")}
                    </p>
                    <p className="text-white/50 text-sm">
                      {selectedMaintenanceRequest.car
                        ? `${selectedMaintenanceRequest.car.brand} ${selectedMaintenanceRequest.car.model} ${selectedMaintenanceRequest.car.year}`
                        : selectedMaintenanceRequest.carId}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {selectedMaintenanceRequest.requestType.replaceAll("_", " ")} · {selectedMaintenanceRequest.city}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">
                    {enumLabel(selectedMaintenanceRequest.status)}
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-3">{selectedMaintenanceRequest.notes}</p>
              </div>

              {isPlatformAdmin && (
                <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                  <h4 className="text-white font-semibold mb-3">{dl("Quote", "عرض السعر")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                    <Input
                      type="number"
                      min="0"
                      placeholder={dl("Amount in USD", "المبلغ بالدولار")}
                      value={maintenanceQuoteAmount}
                      onChange={(event) => setMaintenanceQuoteAmount(event.target.value)}
                      className="bg-dark border-gold/20 text-white"
                    />
                    <Button
                      onClick={setMaintenanceQuote}
                      disabled={isSavingMaintenanceAction || !maintenanceQuoteAmount}
                      className="bg-gold hover:bg-gold-light text-dark"
                    >
                      {dl("Send Quote", "إرسال عرض السعر")}
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                <h4 className="text-white font-semibold mb-3">{dl("Updates", "التحديثات")}</h4>
                {selectedMaintenanceRequest.updates && selectedMaintenanceRequest.updates.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMaintenanceRequest.updates.map((update) => (
                      <div key={update.id} className="border-l border-gold/30 pl-3">
                        <p className="text-white/70 text-sm">
                          {update.statusTo ? update.statusTo.replaceAll("_", " ") : update.authorRole}
                          {update.isPublic ? " · Public" : " · Internal"}
                        </p>
                        {update.note && <p className="text-white/50 text-sm">{update.note}</p>}
                        <p className="text-white/30 text-xs">{new Date(update.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">{dl("No updates yet.", "لا توجد تحديثات بعد.")}</p>
                )}

                <div className="mt-4 space-y-3">
                  <Textarea
                    placeholder={dl("Add an update note", "أضف ملاحظة تحديث")}
                    value={maintenanceNote}
                    onChange={(event) => setMaintenanceNote(event.target.value)}
                    className="bg-dark border-gold/20 text-white min-h-24"
                  />
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={maintenanceNotePublic}
                      onChange={(event) => setMaintenanceNotePublic(event.target.checked)}
                    />
                    {dl("Visible to customer", "ظاهر للعميل")}
                  </label>
                  <Button
                    onClick={addMaintenanceNote}
                    disabled={isSavingMaintenanceAction || !maintenanceNote.trim()}
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    {dl("Add Update", "إضافة تحديث")}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                <h4 className="text-white font-semibold mb-3">{dl("Attachments", "المرفقات")}</h4>
                {selectedMaintenanceRequest.files && selectedMaintenanceRequest.files.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMaintenanceRequest.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm text-gold hover:underline"
                      >
                        {file.fileType ?? "Attachment"} · {new Date(file.createdAt).toLocaleDateString()}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">{dl("No attachments yet.", "لا توجد مرفقات بعد.")}</p>
                )}
              </div>

              {isPlatformAdmin && selectedMaintenanceRequest.status === "IN_PROGRESS" && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <h4 className="text-white font-semibold mb-3">{dl("Public Service Summary", "ملخص الصيانة العام")}</h4>
                  <Textarea
                    placeholder={dl("Sanitized public summary for the car page", "ملخص مناسب للنشر في صفحة السيارة")}
                    value={maintenancePublicSummary}
                    onChange={(event) => setMaintenancePublicSummary(event.target.value)}
                    className="bg-dark border-green-500/20 text-white min-h-24"
                  />
                  <Button
                    onClick={completeSelectedMaintenance}
                    disabled={isSavingMaintenanceAction}
                    className="mt-3 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {dl("Complete Maintenance", "إنهاء الصيانة")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Technician Dialog */}
      <Dialog open={technicianDialogOpen} onOpenChange={setTechnicianDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingTechnicianId ? dl("Edit Technician", "تعديل الفني") : dt("addTechnician")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder={dt("name")}
              value={technicianForm.name}
              onChange={(event) => setTechnicianForm({ ...technicianForm, name: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder={dt("city")}
                value={technicianForm.city}
                onChange={(event) => setTechnicianForm({ ...technicianForm, city: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
              <Input
                placeholder={dl("Phone (optional)", "الهاتف (اختياري)")}
                value={technicianForm.phone}
                onChange={(event) => setTechnicianForm({ ...technicianForm, phone: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
            </div>
            <Input
              placeholder={dl("Specialty (e.g. mechanical, electrical, body)", "الاختصاص: ميكانيك، كهرباء، هيكل...")}
              value={technicianForm.specialty}
              onChange={(event) => setTechnicianForm({ ...technicianForm, specialty: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <div>
              <p className="text-white/50 text-xs mb-2">{dl("Service tiers", "باقات الخدمة")}</p>
              <div className="flex gap-2">
                {(["QUICK", "COMPREHENSIVE"] as const).map((tier) => (
                  <Button
                    key={tier}
                    type="button"
                    variant={technicianForm.serviceTiers.includes(tier) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTechnicianTier(tier)}
                    className={technicianForm.serviceTiers.includes(tier) ? "bg-gold text-dark" : "border-gold/30 text-gold"}
                  >
                    {enumLabel(tier)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setTechnicianDialogOpen(false)}
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              {dl("Cancel", "إلغاء")}
            </Button>
            <Button
              onClick={handleSaveTechnician}
              disabled={isSavingTechnician}
              className="bg-gold hover:bg-gold-light text-dark font-bold"
            >
              {isSavingTechnician ? dl("Saving...", "جاري الحفظ...") : dl("Save Technician", "حفظ الفني")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{dl("Review Complaint", "مراجعة الشكوى")}</DialogTitle>
          </DialogHeader>
          {reviewingComplaint && (
            <div className="space-y-4">
              <div className="rounded-lg bg-dark border border-gold/10 p-4 space-y-2">
                <p className="text-white font-medium text-sm">
                  {reviewingComplaint.carBrand} {reviewingComplaint.carModel}
                  <span className="text-white/40 font-normal"> — {reviewingComplaint.vendorName}</span>
                </p>
                <p className="text-white/40 text-xs">
                  Submitted by {reviewingComplaint.customerName || "customer"} on{" "}
                  {new Date(reviewingComplaint.createdAt).toLocaleString()}
                </p>
                <p className="text-white/70 text-sm">{reviewingComplaint.description}</p>
              </div>
              <Textarea
                placeholder={dl("Review note (required when substantiating)", "ملاحظة المراجعة (مطلوبة عند إثبات الشكوى)")}
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                className="bg-dark border-gold/20 text-white min-h-20"
              />
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleReviewComplaint("DISMISSED")}
                  disabled={isReviewing}
                  className="border-white/20 text-white/70 hover:bg-white/10"
                >
                  {dl("Dismiss", "رفض")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReviewComplaint("SUBSTANTIATED")}
                  disabled={isReviewing}
                  className="border-orange-400/50 text-orange-300 hover:bg-orange-500/10"
                >
                  {dl("Substantiate", "إثبات")}
                </Button>
                <Button
                  onClick={() => handleReviewComplaint("RESOLVED")}
                  disabled={isReviewing}
                  className="bg-gold hover:bg-gold-light text-dark font-bold"
                >
                  {isReviewing ? dl("Saving...", "جاري الحفظ...") : dl("Mark Resolved", "تعليم كمحلولة")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
