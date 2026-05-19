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
import { cars } from "@/data/cars";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("drive_x_auth");
    if (!auth) {
      navigate("/login");
      return;
    }
    try {
      setUser(JSON.parse(auth));
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("drive_x_auth");
    navigate("/");
  };

  const stats = [
    { label: "Total Cars", value: "156", change: "+12", icon: Car, trend: "up" },
    { label: "Active Listings", value: "89", change: "+5", icon: Activity, trend: "up" },
    { label: "Total Sales", value: "$2.4M", change: "+18%", icon: DollarSign, trend: "up" },
    { label: "New Inquiries", value: "24", change: "-3", icon: MessageSquare, trend: "down" },
  ];

  const recentCars = cars.slice(0, 5);
  const inquiries = [
    { id: 1, name: "Ahmed Al-Rashid", email: "ahmed@email.com", phone: "+966 50 123 4567", car: "BMW M8 Competition", status: "New", date: "2024-01-15" },
    { id: 2, name: "Khalid Bin Saad", email: "khalid@email.com", phone: "+966 55 987 6543", car: "Porsche Taycan Turbo S", status: "Contacted", date: "2024-01-14" },
    { id: 3, name: "Mohammed Al-Farsi", email: "mohammed@email.com", phone: "+966 54 456 7890", car: "Ferrari SF90 Stradale", status: "Pending", date: "2024-01-13" },
    { id: 4, name: "Faisal Al-Otaibi", email: "faisal@email.com", phone: "+966 56 789 0123", car: "Mercedes G63 AMG", status: "Closed", date: "2024-01-12" },
    { id: 5, name: "Sultan Al-Qahtani", email: "sultan@email.com", phone: "+966 59 234 5678", car: "Audi RS7 Sportback", status: "New", date: "2024-01-11" },
  ];

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
                <button className="relative w-10 h-10 rounded-lg bg-dark-card border border-gold/20 flex items-center justify-center text-white/60 hover:text-gold transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-dark text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
            </div>

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
                              inquiry.status === "New"
                                ? "bg-green-500/10 text-green-400"
                                : inquiry.status === "Contacted"
                                ? "bg-blue-500/10 text-blue-400"
                                : inquiry.status === "Pending"
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
                      className="w-full h-24 border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex flex-col items-center gap-2"
                    >
                      <Plus className="w-6 h-6 text-gold" />
                      <span className="text-white/70 text-sm">Add New Car</span>
                    </Button>
                    <Button
                      variant="outline"
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
                      className="pl-9 bg-dark-card border-gold/20 text-white placeholder:text-white/30 w-64"
                    />
                  </div>
                  <Button className="bg-gold hover:bg-gold-light text-dark">
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
                        {cars.map((car) => (
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
                                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0">
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0">
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
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                inquiry.status === "New" ? "bg-green-500/10 text-green-400" :
                                inquiry.status === "Contacted" ? "bg-blue-500/10 text-blue-400" :
                                inquiry.status === "Pending" ? "bg-orange-500/10 text-orange-400" :
                                "bg-white/10 text-white/60"
                              }`}>
                                {inquiry.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" className="text-gold hover:bg-gold/10 h-8 w-8 p-0">
                                  <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gold hover:bg-gold/10 h-8 w-8 p-0">
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
                  {cars.slice(0, 4).map((car) => (
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
                    <Button className="bg-gold hover:bg-gold-light text-dark font-bold mt-4">
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
    </div>
  );
}
