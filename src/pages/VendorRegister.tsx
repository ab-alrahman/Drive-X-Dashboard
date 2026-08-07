import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, Car, ArrowLeft, Mail, Lock, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAdminSessionProfile } from "@/lib/api";
import { registerVendor } from "@/lib/vendors-api";
import { getCurrentAdmin } from "@/lib/auth-api";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vendorName: "",
    ownerFullName: "",
    ownerEmail: "",
    ownerPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.ownerPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.ownerPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsLoading(true);
      await registerVendor({
        vendorName: formData.vendorName.trim(),
        ownerFullName: formData.ownerFullName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerPassword: formData.ownerPassword,
      });
      const admin = await getCurrentAdmin().catch(() => undefined);
      setAdminSessionProfile({
        email: admin?.email ?? formData.ownerEmail,
        name: admin?.fullName ?? formData.ownerFullName,
        role: admin?.role ?? "OWNER",
      });
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not register the dealership.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex pt-24">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/car-engine.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-transparent" />
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
            <h2 className="text-4xl font-bold text-white mb-4">Sell Your Car</h2>
            <p className="text-white/60 text-lg max-w-md">
              Register your dealership and start listing cars on the marketplace. No approval
              wait - you get full access to your own dashboard immediately.
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/40 text-sm">
            <span>Flat platform commission</span>
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span>Own your listings</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-8 lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-6 h-6 text-gold" />
              <h1 className="text-3xl font-bold text-white">Register your dealership</h1>
            </div>
            <p className="text-white/60">
              Already registered?{" "}
              <Link to="/login" className="text-gold hover:text-gold-light font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Dealership / Vendor name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  name="vendorName"
                  placeholder="e.g. Al-Salem Motors"
                  value={formData.vendorName}
                  onChange={handleChange}
                  className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Owner full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  name="ownerFullName"
                  placeholder="John Doe"
                  value={formData.ownerFullName}
                  onChange={handleChange}
                  className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Owner email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="email"
                  name="ownerEmail"
                  placeholder="owner@example.com"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="password"
                  name="ownerPassword"
                  placeholder="Minimum 8 characters"
                  value={formData.ownerPassword}
                  onChange={handleChange}
                  className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                <>
                  <Building2 className="w-5 h-5 mr-2" />
                  Register Dealership
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
