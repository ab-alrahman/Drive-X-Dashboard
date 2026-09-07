import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Car, Heart, LayoutDashboard, Store, Compass, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

const GUIDE_SEEN_KEY = "drive_x_first_visit_guide_seen";

export default function FirstVisitGuide() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const [open, setOpen] = useState(false);

  const isArabic = language === "ar";

  useEffect(() => {
    if (!localStorage.getItem(GUIDE_SEEN_KEY)) {
      const timer = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const closeGuide = () => {
    localStorage.setItem(GUIDE_SEEN_KEY, "true");
    setOpen(false);
  };

  const goTo = (path: string) => {
    closeGuide();
    navigate(path);
  };

  const steps = isArabic
    ? [
        {
          icon: Car,
          title: "تريد شراء أو استئجار سيارة؟",
          description: "ابدأ من المخزون، استخدم البحث والفلاتر، ثم افتح تفاصيل السيارة.",
          action: "تصفح السيارات",
          path: "/inventory",
        },
        {
          icon: Heart,
          title: "احفظ السيارات التي تعجبك",
          description: "سجل كعميل حتى تضيف سيارات للمفضلة وتتابعها من لوحة حسابك.",
          action: "إنشاء حساب عميل",
          path: "/register",
        },
        {
          icon: LayoutDashboard,
          title: "عندك حساب؟",
          description: "ادخل إلى لوحة العميل لمتابعة المفضلة، الاستفسارات، سياراتك، والصيانة.",
          action: "تسجيل الدخول",
          path: "/login",
        },
        {
          icon: Store,
          title: "تريد بيع سيارة؟",
          description: "استخدم Sell Your Car لتسجيل معرضك وإدارة السيارات من لوحة البائع.",
          action: "Sell Your Car",
          path: "/vendor-register",
        },
      ]
    : [
        {
          icon: Car,
          title: "Buying or renting?",
          description: "Start from Inventory, use filters, then open a car to see details.",
          action: "Browse cars",
          path: "/inventory",
        },
        {
          icon: Heart,
          title: "Save what you like",
          description: "Create a customer account to keep favorites and track activity.",
          action: "Create account",
          path: "/register",
        },
        {
          icon: LayoutDashboard,
          title: "Already registered?",
          description: "Use your dashboard for favorites, inquiries, cars, and maintenance.",
          action: "Sign in",
          path: "/login",
        },
        {
          icon: Store,
          title: "Selling a car?",
          description: "Use Sell Your Car to register your dealership and manage listings.",
          action: "Sell Your Car",
          path: "/vendor-register",
        },
      ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden sm:flex items-center gap-2 rounded-full border border-gold/30 bg-dark-card/95 px-4 py-2 text-sm font-medium text-gold shadow-lg backdrop-blur hover:bg-gold/10"
      >
        <Compass className="h-4 w-4" />
        {isArabic ? "الدليل" : "Guide"}
      </button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : closeGuide())}>
        <DialogContent className="bg-dark-card border-gold/30 text-white max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <div className="pr-8">
              <DialogTitle className="text-2xl text-white">
                {isArabic ? "أهلاً بك في Drive X" : "Welcome to Drive X"}
              </DialogTitle>
              <p className="mt-2 text-sm text-white/60">
                {isArabic
                  ? "اختر هدفك وسنأخذك للمكان الصحيح مباشرة."
                  : "Pick what you want to do and we will take you to the right place."}
              </p>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="mt-1 min-h-10 text-sm text-white/55">{step.description}</p>
                <Button
                  onClick={() => goTo(step.path)}
                  className="mt-4 w-full bg-gold text-dark hover:bg-gold-light"
                >
                  {step.action}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 rounded-lg border border-gold/20 bg-gold/10 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark/40 text-gold">
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{isArabic ? "لا تعرف من أين تبدأ؟" : "Not sure where to start?"}</p>
              <p className="text-sm text-white/60">
                {isArabic
                  ? "افتح صفحة التواصل وأرسل سؤالك، أو ابدأ بتصفح السيارات إذا كنت زائراً عادياً."
                  : "Open Contact and send your question, or start with Inventory if you are browsing."}
              </p>
            </div>
            <Button variant="outline" onClick={() => goTo("/contact")} className="border-gold/30 text-gold hover:bg-gold/10">
              {isArabic ? "تواصل معنا" : "Contact"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
