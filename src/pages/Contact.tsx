import { useState } from "react";
import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Send, Car, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

export default function Contact() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // There is no backend endpoint for general contact messages (only car-specific
    // leads exist), so we hand off to the visitor's own email client instead of
    // silently discarding the form while claiming success.
    const subjectLine = formData.subject || "Website Inquiry";
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.phone ? `Phone: ${formData.phone}` : null,
      "",
      formData.message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:info@drivex.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      labelKey: "visitUs" as const,
      value: "King Fahd Road, Riyadh 11321",
      sub: "Saudi Arabia",
    },
    {
      icon: Phone,
      labelKey: "callUs" as const,
      value: "+966 11 234 5678",
      sub: "Mon - Sat: 9:00 - 21:00",
    },
    {
      icon: Mail,
      labelKey: "emailUs" as const,
      value: "info@drivex.com",
      sub: "sales@drivex.com",
    },
    {
      icon: Clock,
      labelKey: "workingHours" as const,
      value: "Saturday - Thursday",
      sub: "9:00 AM - 9:00 PM",
    },
  ];

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">{t("getInTouch")}</span>
            <div className="h-px w-12 bg-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("contactDriveX")} <span className="text-gold">{t("contactDriveXHighlight")}</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t("contactSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            {contactInfo.map((info) => (
              <div key={info.labelKey} className="bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl p-5 group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors">
                    <info.icon className="w-5 h-5 text-gold group-hover:text-dark" />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">{t(info.labelKey)}</p>
                    <p className="text-white font-semibold">{info.value}</p>
                    <p className="text-white/60 text-sm">{info.sub}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-dark-card border border-gold/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                  <Car className="w-5 h-5 text-dark" />
                </div>
                <div>
                  <p className="text-white font-bold">Drive X</p>
                  <p className="text-gold text-sm">{t("premiumCarMarketplaceShort")}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                {t("showroomExperienceDesc")}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card border border-gold/20 rounded-xl p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gold mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{t("messageSent")}</h3>
                  <p className="text-white/60">{t("messageSentDesc")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t("fullNameLabel")}</label>
                      <Input
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-dark border-gold/20 text-white placeholder:text-white/30 focus:border-gold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t("emailAddress")}</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-dark border-gold/20 text-white placeholder:text-white/30 focus:border-gold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t("phoneNumber")}</label>
                      <Input
                        type="tel"
                        placeholder="+966 11 234 5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-dark border-gold/20 text-white placeholder:text-white/30 focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t("subject")}</label>
                      <Input
                        placeholder={t("howCanWeHelp")}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-dark border-gold/20 text-white placeholder:text-white/30 focus:border-gold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">{t("messageLabel")}</label>
                    <Textarea
                      placeholder={t("tellUsRequirements")}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-dark border-gold/20 text-white placeholder:text-white/30 focus:border-gold min-h-[150px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-6 shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {t("sendMessage")}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="relative rounded-2xl overflow-hidden border border-gold/20 h-96">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-card to-dark flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gold/40 mx-auto mb-3" />
              <p className="text-white font-bold text-lg">Drive X Showroom</p>
              <p className="text-white/60">King Fahd Road, Riyadh 11321, Saudi Arabia</p>
              <Link to="/inventory">
                <Button className="mt-4 bg-gold hover:bg-gold-light text-dark">
                  {t("scheduleVisit")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
