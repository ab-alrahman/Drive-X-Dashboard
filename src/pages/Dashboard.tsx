import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cars as fallbackCars } from "@/data/cars";
import {
  createAdminCar,
  deleteAdminCar,
  getAdminCars,
  getAdminDashboardSummary,
  getAdminLeads,
  updateAdminCar,
  updateAdminLead,
} from "@/lib/admin-api";
import { clearAuthTokens, getAccessToken } from "@/lib/api";
import { getCurrentAdmin, logoutAdmin } from "@/lib/auth-api";
import { mapApiCarsToView, type CarView } from "@/lib/car-mapper";
import type { ApiCar, CarPayload, DashboardSummaryResponse, LeadResponse } from "@/lib/api-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null);
  const [adminCars, setAdminCars] = useState<ApiCar[]>([]);
  const [dashboardCars, setDashboardCars] = useState<CarView[]>(
    fallbackCars.map((car) => ({ ...car, id: String(car.id), listingType: "SALE" as const, city: undefined }))
  );
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [dashboardError, setDashboardError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carForm, setCarForm] = useState(emptyCarForm);
  const [isSavingCar, setIsSavingCar] = useState(false);
  const [carSearch, setCarSearch] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    const auth = localStorage.getItem("drive_x_auth");
    if (auth) {
      try {
        setUser(JSON.parse(auth));
      } catch {
        clearAuthTokens();
        navigate("/login");
        return;
      }
    }

    getCurrentAdmin()
      .then((admin) => {
        setUser({ name: admin.fullName ?? "Admin User", email: admin.email });
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const refreshDashboardData = async () => {
    if (!getAccessToken()) return;

    const [summary, carsResponse, leadsResponse] = await Promise.all([
      getAdminDashboardSummary(),
      getAdminCars({ page: 1, limit: 20 }),
      getAdminLeads({ page: 1, limit: 20 }),
    ]);
    setDashboardSummary(summary);
    setAdminCars(carsResponse.items);
    const cars = mapApiCarsToView(carsResponse.items);
    if (cars.length > 0) {
      setDashboardCars(cars);
    }
    setLeads(leadsResponse.items);
    setDashboardError("");
  };

  useEffect(() => {
    refreshDashboardData().catch((error: Error) => {
      setDashboardError(error.message || "Could not load dashboard data.");
    });
  }, []);

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
      } else {
        await createAdminCar(carPayloadFromForm());
        setActionMessage("Car created successfully.");
      }
      setCarDialogOpen(false);
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
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
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
                                  onClick={() => openEditCar(car.id)}
                                  className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
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
                        <Input defaultValue={user?.name || "Admin User"} className="bg-dark border-gold/20 text-white" />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Email</label>
                        <Input defaultValue={user?.email || "admin@drivex.com"} className="bg-dark border-gold/20 text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Phone</label>
                      <Input defaultValue="+966 11 234 5678" className="bg-dark border-gold/20 text-white" />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Address</label>
                      <Input defaultValue="King Fahd Road, Riyadh 11321, Saudi Arabia" className="bg-dark border-gold/20 text-white" />
                    </div>
                    <Button
                      onClick={() => setActionMessage("Profile settings endpoint is not available in the backend API yet.")}
                      className="bg-gold hover:bg-gold-light text-dark font-bold mt-4"
                    >
                      Save Changes
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
            <Select value={carForm.status} onValueChange={(value) => setCarForm({ ...carForm, status: value })}>
              <SelectTrigger className="bg-dark border-gold/20 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gold/20">
                {["AVAILABLE", "RESERVED", "SOLD", "RENTED", "INACTIVE"].map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </div>
  );
}
