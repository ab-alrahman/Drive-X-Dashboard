import { useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, UserPlus, Car, ArrowLeft, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setError("Public registration is not available in the backend API yet. Please use admin login.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/interior-detail.jpg)" }}
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
            <h2 className="text-4xl font-bold text-white mb-4">
              Join the
              <br />
              <span className="text-gold">Elite</span>
            </h2>
            <p className="text-white/60 text-lg max-w-md">
              Create your account to unlock exclusive features: save favorites, schedule test drives, and get personalized recommendations.
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/40 text-sm">
            <span>Free to join</span>
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span>No hidden fees</span>
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
            Back to Home
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/60">
              Already have an account?{" "}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+966 11 234 5678"
                  value={formData.phone}
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-dark-card border-gold/20 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Confirm Password</label>
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

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1 border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-dark"
              />
              <label htmlFor="terms" className="text-white/60 text-sm cursor-pointer">
                I agree to the{" "}
                <span className="text-gold hover:text-gold-light">Terms of Service</span>
                {" "}and{" "}
                <span className="text-gold hover:text-gold-light">Privacy Policy</span>
              </label>
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
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gold/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-dark px-4 text-white/40 text-sm">or register with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-gold/20 text-white hover:bg-gold/10 hover:border-gold/40"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-gold/20 text-white hover:bg-gold/10 hover:border-gold/40"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Apple
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
