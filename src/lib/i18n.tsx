import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Language = "en" | "ar";

const messages = {
  en: {
    home: "Home",
    inventory: "Inventory",
    about: "About",
    contact: "Contact",
    search: "Search",
    signIn: "Sign In",
    getStarted: "Get Started",
    dashboard: "Dashboard",
    myFavorites: "My Favorites",
    logout: "Logout",
    customer: "Customer",
    admin: "Admin",
    premiumCollection: "Premium Collection",
    ourInventory: "Our Inventory",
    loadingInventory: "Loading inventory...",
    vehiclesAvailable: "vehicles available",
    filters: "Filters",
    advancedFilters: "Advanced Filters",
    clearAll: "Clear All",
    listingType: "Listing Type",
    brand: "Brand",
    fuelType: "Fuel Type",
    priceRange: "Price Range",
    anyPrice: "Any Price",
    noCarsFound: "No cars found",
    adjustFilters: "Try adjusting your filters or search query",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    password: "Password",
    confirmPassword: "Confirm Password",
    terms: "I agree to the Terms of Service and Privacy Policy",
    joinTitle: "Join the Elite",
    joinCopy: "Create your account to save favorites and get personalized recommendations.",
  },
  ar: {
    home: "الرئيسية",
    inventory: "المعرض",
    about: "من نحن",
    contact: "تواصل معنا",
    search: "بحث",
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",
    dashboard: "لوحة التحكم",
    myFavorites: "المفضلة",
    logout: "تسجيل الخروج",
    customer: "عميل",
    admin: "أدمن",
    premiumCollection: "مجموعة مميزة",
    ourInventory: "معرض السيارات",
    loadingInventory: "جاري تحميل السيارات...",
    vehiclesAvailable: "سيارة متاحة",
    filters: "الفلاتر",
    advancedFilters: "فلاتر متقدمة",
    clearAll: "مسح الكل",
    listingType: "نوع العرض",
    brand: "الشركة",
    fuelType: "نوع الوقود",
    priceRange: "نطاق السعر",
    anyPrice: "أي سعر",
    noCarsFound: "لا توجد سيارات",
    adjustFilters: "جرّب تعديل الفلاتر أو البحث",
    createAccount: "إنشاء حساب",
    alreadyHaveAccount: "لديك حساب؟",
    firstName: "الاسم الأول",
    lastName: "الكنية",
    emailAddress: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    terms: "أوافق على شروط الخدمة وسياسة الخصوصية",
    joinTitle: "انضم إلى Drive X",
    joinCopy: "أنشئ حسابك لحفظ السيارات المفضلة والحصول على توصيات مناسبة.",
  },
} as const;

type MessageKey = keyof typeof messages.en;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("drive_x_language") as Language | null) ?? "en";
  });

  const setLanguage = (nextLanguage: Language) => {
    localStorage.setItem("drive_x_language", nextLanguage);
    setLanguageState(nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: MessageKey) => messages[language][key],
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
