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

const emptyDealForm = {
  leadId: "",
  type: "SALE",
  finalPriceAmount: "",
  notes: "",
};

export default function Dashboard() {
  const navigate = useNavigate();
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
        setUser({ name: admin.fullName ?? "Admin User", email: admin.email, role: admin.role });
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
      setUser({ name: admin.fullName ?? "Admin User", email: admin.email });
      setActionMessage("Profile updated successfully.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Could not update profile.");
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
      setActionMessage("Maintenance quote sent to customer.");
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not set maintenance quote.");
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
      setDashboardError(error instanceof Error ? error.message : "Could not add maintenance update.");
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
      setActionMessage("Maintenance request completed.");
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not complete maintenance request.");
    } finally {
      setIsSavingMaintenanceAction(false);
    }
  };

  useEffect(() => {
    refreshDashboardData().catch((error: Error) => {
      setDashboardError(error.message || "Could not load dashboard data.");
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
        setDashboardError(error.message || "Could not load platform data.");
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
      listingType: car.listingType,
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
    salePrice: carForm.salePriceAmount
      ? { amount: Number(carForm.salePriceAmount), currency: "USD" }
      : undefined,
    dailyRentPrice: carForm.dailyRentPriceAmount
      ? { amount: Number(carForm.dailyRentPriceAmount), currency: "USD" }
      : undefined,
    monthlyRentPrice: carForm.monthlyRentPriceAmount
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
      if ((carForm.listingType === "SALE" || carForm.listingType === "BOTH") && !carForm.salePriceAmount) {
        throw new Error("Sale listings require a sale price.");
      }
      if (
        (carForm.listingType === "RENT" || carForm.listingType === "BOTH") &&
        !carForm.dailyRentPriceAmount &&
        !carForm.monthlyRentPriceAmount
      ) {
        throw new Error("Rent listings require a daily or monthly rent price.");
      }
      if (editingCarId) {
        await updateAdminCar(editingCarId, carPayloadFromForm());
        setActionMessage("Car updated successfully.");
        setCarDialogOpen(false);
      } else {
        // New cars can't be published (AVAILABLE/RESERVED) until they have an accepted
        // maintenance file/inspection - the backend enforces this, so force a safe status
        // on create regardless of what the form's Status field says, then guide the admin
        // straight into submitting that inspection for the car they just made.
        const created = await createAdminCar({ ...carPayloadFromForm(), status: "INACTIVE" });
        setActionMessage("Car created as Inactive. Add a maintenance file/inspection below to publish it.");
        setCarDialogOpen(false);
        openInspectionDialog(created.id);
      }
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not save car.");
    } finally {
      setIsSavingCar(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    const confirmed = window.confirm("Soft delete this car?");
    if (!confirmed) return;
    try {
      await deleteAdminCar(carId);
      setActionMessage("Car deleted successfully.");
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not delete car.");
    }
  };

  const handleLeadStatusChange = async (leadId: string, status: string) => {
    try {
      await updateAdminLead(leadId, { status });
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not update lead.");
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
      setActionMessage("Deal created successfully.");
      setDealDialogOpen(false);
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not create deal.");
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
      setActionMessage("Deal deleted successfully.");
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not delete deal.");
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
      setDashboardError(error instanceof Error ? error.message : "Could not load inspection data.");
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
      setActionMessage("Maintenance file accepted. The car can now be published.");
      resetInspectionForms();
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not submit maintenance file.");
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
      setActionMessage("Technician visit requested - schedule it below.");
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not request a technician visit.");
    } finally {
      setInspectionActionLoading(false);
    }
  };

  const handleScheduleRound = async () => {
    if (!latestInspectionRound) return;
    if (!scheduleTechnicianId || !scheduleDateTime) {
      setDashboardError("Pick a technician and a date/time.");
      return;
    }
    setInspectionActionLoading(true);
    setDashboardError("");
    try {
      await scheduleInspectionRound(latestInspectionRound.id, {
        technicianId: scheduleTechnicianId,
        scheduledAt: new Date(scheduleDateTime).toISOString(),
      });
      setActionMessage("Inspection scheduled.");
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not schedule the inspection.");
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
      setActionMessage("Inspection marked in progress.");
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not start the inspection.");
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
      setActionMessage("Inspection report submitted - certify it to finalize.");
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not submit the report.");
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
      setActionMessage("Inspection certified - Drive X Certified badge is now live on this car.");
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not certify the inspection.");
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
      setActionMessage("Inspection round cancelled.");
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not cancel the round.");
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
      setDashboardError("Technician name and city are required.");
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
        setActionMessage("Technician updated.");
      } else {
        await createTechnician(payload);
        setActionMessage("Technician added.");
      }
      setTechnicianDialogOpen(false);
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not save technician.");
    } finally {
      setIsSavingTechnician(false);
    }
  };

  const handleToggleTechnicianActive = async (technician: Technician) => {
    try {
      await updateTechnician(technician.id, { isActive: !technician.isActive });
      await refreshDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not update technician.");
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
        setActionMessage("Vendor re-activated.");
      } else {
        await suspendVendor(vendor.id, reason);
        setActionMessage("Vendor suspended - their listings are hidden from the public marketplace.");
      }
      await refreshPlatformData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not update vendor status.");
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
        setActionMessage("Listing restored to the marketplace.");
      } else {
        await hidePlatformCar(car.id, reason);
        setActionMessage("Listing hidden from the public marketplace.");
      }
      await refreshDashboardData();
      await refreshPlatformData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not update listing visibility.");
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
      setDashboardError("Add a review note explaining the decision.");
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
      setDashboardError(error instanceof Error ? error.message : "Could not review the complaint.");
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
      setActionMessage("Round flagged as fraudulent - the car listing has been hidden from the marketplace.");
      await refreshInspectionCase();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not flag the round.");
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
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "cars", label: "My Cars", icon: Car },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "deals", label: "Deals", icon: Handshake },
    { id: "inspections", label: "Inspections", icon: ShieldCheck },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
    ...(isPlatformAdmin
      ? [{ id: "vendors", label: "Marketplace Oversight", icon: ShieldAlert }]
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
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{user?.name || "Admin User"}</p>
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
                  Logout
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
                  {activeTab}
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  Welcome back, {user?.name?.split(" ")[0] || "Admin"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    placeholder="Search..."
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
                      <h3 className="text-white font-bold text-lg">Recent Inquiries</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("inquiries")}
                        className="text-gold hover:text-gold-light hover:bg-gold/10"
                      >
                        View All
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
                      <h3 className="text-white font-bold text-lg">Recent Listings</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("cars")}
                        className="text-gold hover:text-gold-light hover:bg-gold/10"
                      >
                        View All
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
                  <h3 className="text-white font-bold text-lg mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/inventory">
                      <Button
                        variant="outline"
                        className="w-full h-24 border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex flex-col items-center gap-2"
                      >
                        <Car className="w-6 h-6 text-gold" />
                        <span className="text-white/70 text-sm">Browse Inventory</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={openCreateCar}
                      className="w-full h-24 border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex flex-col items-center gap-2"
                    >
                      <Plus className="w-6 h-6 text-gold" />
                      <span className="text-white/70 text-sm">Add New Car</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("inquiries")}
                      className="w-full h-24 border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex flex-col items-center gap-2"
                    >
                      <MessageSquare className="w-6 h-6 text-gold" />
                      <span className="text-white/70 text-sm">View Messages</span>
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
                      placeholder="Search cars..."
                      value={carSearch}
                      onChange={(event) => setCarSearch(event.target.value)}
                      className="pl-9 bg-dark-card border-gold/20 text-white placeholder:text-white/30 w-64"
                    />
                  </div>
                  <Button onClick={openCreateCar} className="bg-gold hover:bg-gold-light text-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Car
                  </Button>
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Car</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Category</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Price</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Status</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Rating</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Actions</th>
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
                                      Hidden by platform
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
                                  title="Manage Inspection"
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
                                    title={car.hiddenByPlatform ? "Restore to marketplace" : "Hide from marketplace"}
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
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Customer</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Interested In</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Date</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Status</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Actions</th>
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
                    Create a deal from an approved lead to mark a sale/rental as closed and record commission.
                  </p>
                  <Button
                    onClick={openCreateDeal}
                    disabled={availableLeadsForDeal.length === 0}
                    className="bg-gold hover:bg-gold-light text-dark shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deal
                  </Button>
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Car</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Type</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Final Price</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Commission</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Date</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Actions</th>
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
                              No deals yet. Approve a lead first, then create a deal for it.
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
                    Every car needs an accepted maintenance file or certified inspection before it can be
                    published as Available or Reserved. Click the shield icon on a car (in My Cars) to manage it,
                    or pick one here.
                  </p>
                  <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Car</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Status</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Action</th>
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
                                  Manage
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
                    <h3 className="text-white font-bold text-lg">Technician Partner Network</h3>
                    <Button onClick={openCreateTechnician} className="bg-gold hover:bg-gold-light text-dark">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Technician
                    </Button>
                  </div>
                  <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Name</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">City</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Tiers</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Specialty</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Active</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Actions</th>
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
                                  {technician.isActive ? "Active" : "Inactive"}
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
                                No technicians yet. Add your first partner to start scheduling inspections.
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
                    <h3 className="text-white font-bold text-lg">Maintenance Requests</h3>
                    <p className="text-white/50 text-sm mt-1">
                      Coordinate customer maintenance for Drive X cars. Rental requests stay under platform review before vendors can act.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => refreshDashboardData().catch((error: Error) => setDashboardError(error.message))}
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    Refresh
                  </Button>
                </div>

                <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Customer / Car</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Type</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Status</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Vendor</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Actions</th>
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
                                  <p className="text-orange-400 text-xs mt-2">Rental flow</p>
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
                  <h3 className="text-white font-bold text-lg mb-6">Monthly Sales Overview</h3>
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
                  <h3 className="text-white font-bold text-lg mb-6">Profile Settings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Full Name</label>
                        <Input
                          value={profileNameInput}
                          onChange={(e) => setProfileNameInput(e.target.value)}
                          className="bg-dark border-gold/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Email</label>
                        <Input
                          value={user?.email || ""}
                          disabled
                          className="bg-dark border-gold/20 text-white/50 cursor-not-allowed"
                        />
                        <p className="text-white/30 text-xs mt-1">Email cannot be changed.</p>
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
                  <h3 className="text-white font-bold text-lg mb-6">Notification Preferences</h3>
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
                      <h3 className="text-white font-bold text-lg">Vendors</h3>
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
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Vendor</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Listings</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Open Complaints</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Status</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Actions</th>
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
                      <h3 className="text-white font-bold text-lg">Customer Complaints</h3>
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
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Car</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Vendor</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Customer</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Complaint</th>
                            <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase">Status</th>
                            <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase">Actions</th>
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
                                    Review
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
                                No customer complaints yet.
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
              {editingCarId ? "Edit Car" : "Add New Car"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Brand"
              value={carForm.brand}
              onChange={(event) => setCarForm({ ...carForm, brand: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder="Model"
              value={carForm.model}
              onChange={(event) => setCarForm({ ...carForm, model: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder="Year"
              value={carForm.year}
              onChange={(event) => setCarForm({ ...carForm, year: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder="Sale price USD"
              value={carForm.salePriceAmount}
              onChange={(event) => setCarForm({ ...carForm, salePriceAmount: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder="Daily rent USD"
              value={carForm.dailyRentPriceAmount}
              onChange={(event) => setCarForm({ ...carForm, dailyRentPriceAmount: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder="Monthly rent USD"
              value={carForm.monthlyRentPriceAmount}
              onChange={(event) => setCarForm({ ...carForm, monthlyRentPriceAmount: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Select value={carForm.listingType} onValueChange={(value) => setCarForm({ ...carForm, listingType: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder="Listing type" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                <SelectItem value="SALE">SALE</SelectItem>
                <SelectItem value="RENT">RENT</SelectItem>
                <SelectItem value="BOTH">BOTH</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Select
                value={carForm.status}
                onValueChange={(value) => setCarForm({ ...carForm, status: value })}
                disabled={!editingCarId}
              >
                <SelectTrigger className="bg-dark border-gold/20 text-white disabled:opacity-50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-gold/20">
                  {["AVAILABLE", "RESERVED", "SOLD", "RENTED", "INACTIVE"].map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!editingCarId && (
                <p className="text-white/30 text-xs mt-1">
                  New cars start Inactive - add a maintenance inspection to publish them.
                </p>
              )}
            </div>
            <Select value={carForm.condition} onValueChange={(value) => setCarForm({ ...carForm, condition: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="USED">USED</SelectItem>
              </SelectContent>
            </Select>
            <Select value={carForm.fuelType} onValueChange={(value) => setCarForm({ ...carForm, fuelType: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder="Fuel type" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                {["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC"].map((fuel) => (
                  <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={carForm.transmission} onValueChange={(value) => setCarForm({ ...carForm, transmission: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                <SelectItem value="AUTOMATIC">AUTOMATIC</SelectItem>
                <SelectItem value="MANUAL">MANUAL</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Mileage km"
              value={carForm.mileageKm}
              onChange={(event) => setCarForm({ ...carForm, mileageKm: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder="Color"
              value={carForm.color}
              onChange={(event) => setCarForm({ ...carForm, color: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder="City"
              value={carForm.city}
              onChange={(event) => setCarForm({ ...carForm, city: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              placeholder="Engine"
              value={carForm.engine}
              onChange={(event) => setCarForm({ ...carForm, engine: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder="Seats"
              value={carForm.seats}
              onChange={(event) => setCarForm({ ...carForm, seats: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Input
              type="number"
              placeholder="Horsepower"
              value={carForm.horsepower}
              onChange={(event) => setCarForm({ ...carForm, horsepower: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <Textarea
              placeholder="Description"
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
              Cancel
            </Button>
            <Button
              onClick={handleSaveCar}
              disabled={isSavingCar}
              className="bg-gold hover:bg-gold-light text-dark font-bold"
            >
              {isSavingCar ? "Saving..." : "Save Car"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create Deal</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <Select value={dealForm.leadId} onValueChange={handleDealLeadChange}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder="Select an approved lead" />
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
                  <SelectValue placeholder="Deal type" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-gold/20">
                  <SelectItem value="SALE">SALE</SelectItem>
                  <SelectItem value="RENT">RENT</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Final price USD"
                value={dealForm.finalPriceAmount}
                onChange={(event) => setDealForm({ ...dealForm, finalPriceAmount: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
            </div>

            <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-white/60">
              A flat platform commission applies to every deal. Commission is calculated automatically
              from the final price.
            </div>

            <Textarea
              placeholder="Notes"
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
              Cancel
            </Button>
            <Button
              onClick={handleSaveDeal}
              disabled={isSavingDeal || !dealForm.leadId}
              className="bg-gold hover:bg-gold-light text-dark font-bold"
            >
              {isSavingDeal ? "Saving..." : "Save Deal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspection Management Dialog */}
      <Dialog open={inspectionDialogOpen} onOpenChange={setInspectionDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Manage Inspection</DialogTitle>
          </DialogHeader>

          {isLoadingInspection ? (
            <p className="text-white/50 text-sm py-8 text-center">Loading...</p>
          ) : (
            <div className="space-y-6">
              {/* Round history */}
              <div>
                <h4 className="text-white/70 text-sm font-medium mb-2">History</h4>
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
                    <p className="text-white/40 text-sm">No inspection history yet.</p>
                  )}
                </div>
              </div>

              {/* Contextual action panel */}
              <div className="border-t border-gold/10 pt-4">
                {isPlatformAdmin && latestInspectionRound?.status === "FILE_ACCEPTED" && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
                    <p className="text-red-300 text-sm font-medium mb-2">
                      Suspected fraudulent maintenance file? Flagging it permanently hides this listing from the marketplace.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={inspectionActionLoading}
                      onClick={() => handleFlagFraudulent(latestInspectionRound.id)}
                      className="border-red-400/50 text-red-300 hover:bg-red-500/10"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      {inspectionActionLoading ? "Flagging..." : "Flag as Fraudulent & Hide"}
                    </Button>
                  </div>
                )}
                {(!latestInspectionRound || ["FILE_ACCEPTED", "CERTIFIED", "CANCELLED"].includes(latestInspectionRound.status)) && (
                  <div className="space-y-4">
                    <h4 className="text-white/70 text-sm font-medium">
                      {latestInspectionRound ? "Submit a new maintenance file" : "Submit maintenance file (required to publish)"}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant={inspectionSourceType === "TEMPLATE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInspectionSourceType("TEMPLATE")}
                        className={inspectionSourceType === "TEMPLATE" ? "bg-gold text-dark" : "border-gold/30 text-gold"}
                      >
                        Fill in details
                      </Button>
                      <Button
                        variant={inspectionSourceType === "EXTERNAL_FILE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInspectionSourceType("EXTERNAL_FILE")}
                        className={inspectionSourceType === "EXTERNAL_FILE" ? "bg-gold text-dark" : "border-gold/30 text-gold"}
                      >
                        Upload a file
                      </Button>
                    </div>
                    {inspectionSourceType === "TEMPLATE" ? (
                      <Textarea
                        placeholder="Maintenance details (last service date, condition, known issues...)"
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
                      {inspectionActionLoading ? "Submitting..." : "Submit"}
                    </Button>

                    <div className="pt-2 border-t border-gold/10">
                      <p className="text-white/50 text-xs mb-2">Or request a fresh technician inspection on behalf of:</p>
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
                            {role}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {latestInspectionRound?.status === "ESCALATED_TO_TECHNICIAN" && (
                  <div className="space-y-4">
                    <h4 className="text-white/70 text-sm font-medium">Schedule technician visit</h4>
                    <Select value={scheduleTechnicianId} onValueChange={setScheduleTechnicianId}>
                      <SelectTrigger className="bg-dark border-gold/20 text-white">
                        <SelectValue placeholder="Choose a technician" />
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
                      {inspectionActionLoading ? "Scheduling..." : "Schedule"}
                    </Button>
                  </div>
                )}

                {latestInspectionRound?.status === "SCHEDULED" && (
                  <Button
                    onClick={handleStartRound}
                    disabled={inspectionActionLoading}
                    className="bg-gold hover:bg-gold-light text-dark font-bold"
                  >
                    {inspectionActionLoading ? "Starting..." : "Start Inspection"}
                  </Button>
                )}

                {latestInspectionRound?.status === "IN_PROGRESS" && (
                  <div className="space-y-4">
                    <h4 className="text-white/70 text-sm font-medium">Submit report</h4>
                    <Input
                      placeholder="Overall verdict (e.g. Good, Fair, Poor)"
                      value={reportVerdict}
                      onChange={(event) => setReportVerdict(event.target.value)}
                      className="bg-dark border-gold/20 text-white"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Price USD"
                        value={reportPriceAmount}
                        onChange={(event) => setReportPriceAmount(event.target.value)}
                        className="bg-dark border-gold/20 text-white"
                      />
                      <Select value={reportPaidBy} onValueChange={(value) => setReportPaidBy(value as InspectionPaidBy)}>
                        <SelectTrigger className="bg-dark border-gold/20 text-white">
                          <SelectValue placeholder="Paid by" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-gold/20">
                          {(["SELLER", "BUYER", "RENTER", "DRIVEX"] as const).map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-white/50 text-xs">Findings (optional)</p>
                        <Button variant="ghost" size="sm" onClick={addFindingRow} className="text-gold hover:bg-gold/10">
                          <Plus className="w-3 h-3 mr-1" /> Add finding
                        </Button>
                      </div>
                      {reportFindings.map((finding, index) => (
                        <div key={index} className="flex gap-2 items-start bg-dark border border-gold/10 rounded-lg p-2">
                          <Input
                            placeholder="Description"
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
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Cost USD"
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
                      {inspectionActionLoading ? "Submitting..." : "Submit Report"}
                    </Button>
                  </div>
                )}

                {latestInspectionRound?.status === "REPORT_SUBMITTED" && (
                  <Button
                    onClick={handleCertifyRound}
                    disabled={inspectionActionLoading}
                    className="bg-gold hover:bg-gold-light text-dark font-bold"
                  >
                    {inspectionActionLoading ? "Certifying..." : "Certify Inspection"}
                  </Button>
                )}

                {latestInspectionRound && !["CERTIFIED", "CANCELLED"].includes(latestInspectionRound.status) && (
                  <Button
                    variant="ghost"
                    onClick={handleCancelRound}
                    disabled={inspectionActionLoading}
                    className="text-red-400 hover:bg-red-500/10 mt-3"
                  >
                    Cancel This Round
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
            <DialogTitle className="text-white text-xl">Maintenance Request Details</DialogTitle>
          </DialogHeader>
          {selectedMaintenanceRequest && (
            <div className="space-y-5">
              <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">
                      {selectedMaintenanceRequest.customerName ?? "Customer"}
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
                    {selectedMaintenanceRequest.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-3">{selectedMaintenanceRequest.notes}</p>
              </div>

              {isPlatformAdmin && (
                <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                  <h4 className="text-white font-semibold mb-3">Quote</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Amount in USD"
                      value={maintenanceQuoteAmount}
                      onChange={(event) => setMaintenanceQuoteAmount(event.target.value)}
                      className="bg-dark border-gold/20 text-white"
                    />
                    <Button
                      onClick={setMaintenanceQuote}
                      disabled={isSavingMaintenanceAction || !maintenanceQuoteAmount}
                      className="bg-gold hover:bg-gold-light text-dark"
                    >
                      Send Quote
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                <h4 className="text-white font-semibold mb-3">Updates</h4>
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
                  <p className="text-white/40 text-sm">No updates yet.</p>
                )}

                <div className="mt-4 space-y-3">
                  <Textarea
                    placeholder="Add an update note"
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
                    Visible to customer
                  </label>
                  <Button
                    onClick={addMaintenanceNote}
                    disabled={isSavingMaintenanceAction || !maintenanceNote.trim()}
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    Add Update
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-gold/10 bg-dark/50 p-4">
                <h4 className="text-white font-semibold mb-3">Attachments</h4>
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
                  <p className="text-white/40 text-sm">No attachments yet.</p>
                )}
              </div>

              {isPlatformAdmin && selectedMaintenanceRequest.status === "IN_PROGRESS" && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <h4 className="text-white font-semibold mb-3">Public Service Summary</h4>
                  <Textarea
                    placeholder="Sanitized public summary for the car page"
                    value={maintenancePublicSummary}
                    onChange={(event) => setMaintenancePublicSummary(event.target.value)}
                    className="bg-dark border-green-500/20 text-white min-h-24"
                  />
                  <Button
                    onClick={completeSelectedMaintenance}
                    disabled={isSavingMaintenanceAction}
                    className="mt-3 bg-green-500 hover:bg-green-600 text-white"
                  >
                    Complete Maintenance
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
              {editingTechnicianId ? "Edit Technician" : "Add Technician"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder="Name"
              value={technicianForm.name}
              onChange={(event) => setTechnicianForm({ ...technicianForm, name: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={technicianForm.city}
                onChange={(event) => setTechnicianForm({ ...technicianForm, city: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
              <Input
                placeholder="Phone (optional)"
                value={technicianForm.phone}
                onChange={(event) => setTechnicianForm({ ...technicianForm, phone: event.target.value })}
                className="bg-dark border-gold/20 text-white"
              />
            </div>
            <Input
              placeholder="Specialty (e.g. mechanical, electrical, body)"
              value={technicianForm.specialty}
              onChange={(event) => setTechnicianForm({ ...technicianForm, specialty: event.target.value })}
              className="bg-dark border-gold/20 text-white"
            />
            <div>
              <p className="text-white/50 text-xs mb-2">Service tiers</p>
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
                    {tier}
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
              Cancel
            </Button>
            <Button
              onClick={handleSaveTechnician}
              disabled={isSavingTechnician}
              className="bg-gold hover:bg-gold-light text-dark font-bold"
            >
              {isSavingTechnician ? "Saving..." : "Save Technician"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
        <DialogContent className="bg-dark-card border-gold/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Review Complaint</DialogTitle>
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
                placeholder="Review note (required when substantiating)"
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
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReviewComplaint("SUBSTANTIATED")}
                  disabled={isReviewing}
                  className="border-orange-400/50 text-orange-300 hover:bg-orange-500/10"
                >
                  Substantiate
                </Button>
                <Button
                  onClick={() => handleReviewComplaint("RESOLVED")}
                  disabled={isReviewing}
                  className="bg-gold hover:bg-gold-light text-dark font-bold"
                >
                  {isReviewing ? "Saving..." : "Mark Resolved"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
