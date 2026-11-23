"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  Download,
  Edit3,
  Globe,
  HelpCircle,
  Home,
  Info,
  KeyRound,
  Landmark,
  Layers,
  Lock,
  Mail,
  MapPin,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Wallet,
  X,
} from "lucide-react";
import { CreditIcon } from "@/components/CreditIcon";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import SettingsOverlay, {
  SettingsTab,
} from "@/components/portal/SettingsOverlay";

type CheckoutStep =
  | "package"
  | "billing"
  | "payment"
  | "receipt-success"
  | "receipt-failed";

type PackageOption = {
  id: "pkg-100" | "pkg-360" | "pkg-750" | "pkg-1500";
  name: string;
  credits: number;
  bonus: number;
  originalPriceVnd?: number;
  priceVnd: number;
  tagline: string;
  badge?: string;
};

type SavedAddress = {
  id: string;
  label: string;
  isDefault: boolean;
  fullName: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  phoneCode: string;
  phone: string;
  email: string;
  companyName?: string;
  vatNumber?: string;
};

type SavedCard = {
  id: string;
  brand: "VISA" | "Mastercard";
  last4: string;
  holderName: string;
  expiry: string;
};

type PaymentMethodKey = "saved-card" | "card" | "banking" | "momo" | "paypal";

const PACKAGES: PackageOption[] = [
  {
    id: "pkg-100",
    name: "Starter",
    credits: 100,
    bonus: 0,
    priceVnd: 240000,
    tagline: "For individual scene tests & single scans",
  },
  {
    id: "pkg-360",
    name: "Popular",
    credits: 360,
    bonus: 50,
    originalPriceVnd: 920000,
    priceVnd: 849000,
    tagline: "For regular studio work & PBR packs",
    badge: "Most popular",
  },
  {
    id: "pkg-750",
    name: "Professional",
    credits: 750,
    bonus: 150,
    originalPriceVnd: 1850000,
    priceVnd: 1650000,
    tagline: "For production teams & 16K HDRIs",
  },
  {
    id: "pkg-1500",
    name: "Enterprise",
    credits: 1500,
    bonus: 350,
    originalPriceVnd: 3500000,
    priceVnd: 3100000,
    tagline: "Studio-scale credit pool with priority Bridge sync",
    badge: "Best value",
  },
];

const INITIAL_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-1",
    label: "Home Address",
    isDefault: true,
    fullName: "Maxwell (Thai) Viet",
    firstName: "Maxwell",
    lastName: "Viet",
    addressLine1: "123 Nguyen Hue Street, Ben Nghe Ward",
    addressLine2: "District 1, Ho Chi Minh City, Vietnam 70000",
    country: "Vietnam",
    state: "Ho Chi Minh City",
    city: "District 1",
    zipCode: "70000",
    phoneCode: "+84",
    phone: "903 837 382",
    email: "viet.thai@onflow.asia",
  },
  {
    id: "addr-2",
    label: "Office Address",
    isDefault: false,
    fullName: "David Nguyen",
    firstName: "David",
    lastName: "Nguyen",
    addressLine1: "102/13 No.2 St., Quarter No. 4, Phu Thuan Ward",
    addressLine2: "District 7, Ho Chi Minh City, Vietnam 70000",
    country: "Vietnam",
    state: "Ho Chi Minh City",
    city: "District 7",
    zipCode: "70000",
    phoneCode: "+84",
    phone: "908 112 233",
    email: "dev@onflow.asia",
    companyName: "ONFLOW VIETNAM Co., LTD",
    vatNumber: "VN-0318294012",
  },
];

const PHONE_DIAL_CODES = [
  { code: "+84", country: "Vietnam" },
  { code: "+1", country: "United States" },
  { code: "+65", country: "Singapore" },
  { code: "+81", country: "Japan" },
  { code: "+44", country: "United Kingdom" },
  { code: "+61", country: "Australia" },
];

const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  Vietnam: {
    "Ho Chi Minh City": [
      "District 1",
      "District 3",
      "District 7",
      "Thu Duc City",
      "Binh Thanh",
    ],
    Hanoi: ["Hoan Kiem", "Ba Dinh", "Cau Giay", "Tay Ho"],
    "Da Nang": ["Hai Chau", "Son Tra", "Ngu Hanh Son"],
  },
  "United States": {
    California: ["San Francisco", "Los Angeles", "San Jose"],
    "New York": ["New York City", "Brooklyn", "Albany"],
    Texas: ["Austin", "Houston", "Dallas"],
  },
  Singapore: {
    Central: ["Downtown Core", "Orchard", "Marina Bay"],
    East: ["Tampines", "Changi"],
  },
  Japan: {
    Tokyo: ["Shibuya", "Shinjuku", "Minato"],
    Osaka: ["Namba", "Umeda"],
  },
  "United Kingdom": {
    "Greater London": ["Central London", "Westminster", "Camden"],
    Manchester: ["Manchester City", "Salford"],
  },
};

const BANK_OPTIONS = [
  { id: "vcb", name: "Vietcombank", icon: "/assets/payment/1088e.svg" },
  { id: "tcb", name: "Techcombank", icon: "/assets/payment/6b86a.svg" },
  {
    id: "sc",
    name: "Standard Chartered",
    icon: "/assets/payment/dbf06.svg",
  },
  {
    id: "vietin",
    name: "VietinBank",
    icon: "/assets/payment/a1802.svg",
    rotate: true,
  },
  { id: "ocb", name: "OCB", icon: "/assets/payment/ff423.svg" },
];

function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US")} VND`;
}

function formatStepFromParam(stepParam: string | null): CheckoutStep {
  if (!stepParam) return "package";
  const normalized = stepParam.toLowerCase();
  if (normalized === "d2.1" || normalized === "billing") return "billing";
  if (normalized === "d2.2" || normalized === "payment") return "payment";
  if (
    normalized === "d2.3" ||
    normalized === "receipt" ||
    normalized === "success"
  ) {
    return "receipt-success";
  }
  if (normalized === "failed" || normalized === "receipt-failed") {
    return "receipt-failed";
  }
  return "package";
}

function PaymentGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = formatStepFromParam(searchParams.get("step"));

  const [step, setStep] = useState<CheckoutStep>(initialStep);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeOrgKey, setActiveOrgKey] = useState<"onflow" | "mekong">("onflow");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("account");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const param = searchParams.get("step");
    if (param) {
      setStep(formatStepFromParam(param));
    }
  }, [searchParams]);

  // Step 1: Credit Package State
  const [selectedPackageId, setSelectedPackageId] = useState<
    PackageOption["id"] | "custom"
  >("pkg-1500");
  const [customCreditsInput, setCustomCreditsInput] = useState("");

  // Step 2: Billing & Address State
  const [addressTab, setAddressTab] = useState<"saved" | "new">("saved");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(
    INITIAL_SAVED_ADDRESSES
  );
  const [selectedSavedAddressId, setSelectedSavedAddressId] =
    useState<string>("addr-1");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+84");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [country, setCountry] = useState("Vietnam");
  const [stateProvince, setStateProvince] = useState("Ho Chi Minh City");
  const [city, setCity] = useState("District 1");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [zipCode, setZipCode] = useState("70000");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>(
    {}
  );

  // Step 3: Payment Method State
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: "visa-8288",
      brand: "VISA",
      last4: "8288",
      holderName: "MAXWELL THAI VIET",
      expiry: "08/28",
    },
  ]);
  const [selectedSavedCardId, setSelectedSavedCardId] =
    useState<string>("visa-8288");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardHolder, setEditCardHolder] = useState("");
  const [editCardExpiry, setEditCardExpiry] = useState("");

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodKey>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiration, setCardExpiration] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const [selectedBank, setSelectedBank] = useState("Vietcombank");
  const [momoPhone, setMomoPhone] = useState("0908 112 233");
  const [paypalEmail, setPaypalEmail] = useState("dev@onflow.asia");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Receipt & Balance State
  const [baseBalance] = useState(2686);
  const [transactionId] = useState("ONF-23E798234798");
  const [paymentTime] = useState("Nov 23, 2026 · 15:18 ICT");
  const [purchaseDate] = useState("Nov 23, 2026");
  const [failureReason, setFailureReason] = useState("insufficient_funds");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const orderSummary = useMemo(() => {
    if (selectedPackageId === "custom") {
      const parsed = parseInt(customCreditsInput.replace(/\D/g, ""), 10) || 0;
      const effectiveCredits = parsed > 0 ? parsed : 750;
      const totalVnd = effectiveCredits * 2200;
      const subtotalVnd = Math.round(totalVnd / 1.08);
      const vatVnd = totalVnd - subtotalVnd;
      const bonusCredits =
        effectiveCredits >= 1000
          ? Math.round(effectiveCredits * 0.2)
          : effectiveCredits >= 300
          ? Math.round(effectiveCredits * 0.1)
          : 0;
      return {
        packageName: "Custom Pack",
        purchaseCredits: effectiveCredits,
        bonusCredits,
        subtotalVnd,
        vatVnd,
        totalVnd,
        newBalance: baseBalance + effectiveCredits + bonusCredits,
      };
    }

    const pkg =
      PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[3];
    const subtotalVnd = Math.round(pkg.priceVnd / 1.08);
    const vatVnd = pkg.priceVnd - subtotalVnd;
    return {
      packageName: pkg.name,
      purchaseCredits: pkg.credits,
      bonusCredits: pkg.bonus,
      subtotalVnd,
      vatVnd,
      totalVnd: pkg.priceVnd,
      newBalance: baseBalance + pkg.credits + pkg.bonus,
    };
  }, [selectedPackageId, customCreditsInput, baseBalance]);

  const customEquivalentVnd = useMemo(() => {
    const parsed = parseInt(customCreditsInput.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) return 1650000;
    return parsed * 2200;
  }, [customCreditsInput]);

  const recipientDisplay = useMemo(() => {
    if (addressTab === "saved") {
      const addr =
        savedAddresses.find((a) => a.id === selectedSavedAddressId) ||
        savedAddresses[0];
      return addr.fullName.replace(/[()]/g, "");
    }
    const combined = `${firstName.trim()} ${lastName.trim()}`.trim();
    return combined || "Maxwell Thai Viet";
  }, [addressTab, savedAddresses, selectedSavedAddressId, firstName, lastName]);

  const paymentMethodLabel = useMemo(() => {
    if (selectedPaymentMethod === "saved-card") {
      const card =
        savedCards.find((c) => c.id === selectedSavedCardId) || savedCards[0];
      return `${card.brand} •••• ${card.last4}`;
    }
    if (selectedPaymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      const last4 = digits.length >= 4 ? digits.slice(-4) : "8228";
      return `VISA •••• ${last4}`;
    }
    if (selectedPaymentMethod === "banking") {
      return `Online Banking · ${selectedBank}`;
    }
    if (selectedPaymentMethod === "momo") {
      return "MoMo E-Wallet";
    }
    return "PayPal Express";
  }, [
    selectedPaymentMethod,
    savedCards,
    selectedSavedCardId,
    cardNumber,
    selectedBank,
  ]);

  const headerCreditsDisplay =
    step === "receipt-success"
      ? orderSummary.newBalance.toLocaleString("en-US")
      : baseBalance.toLocaleString("en-US");

  const navigateStep = (next: CheckoutStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const paramMap: Record<CheckoutStep, string> = {
      package: "d2",
      billing: "d2.1",
      payment: "d2.2",
      "receipt-success": "d2.3",
      "receipt-failed": "failed",
    };
    router.replace(`/payment?step=${paramMap[next]}`, { scroll: false });
  };

  const handleSelectPackageNext = () => {
    if (
      selectedPackageId === "custom" &&
      (parseInt(customCreditsInput.replace(/\D/g, ""), 10) || 0) <= 0
    ) {
      showToast("Enter a valid credit amount for custom purchase.");
      return;
    }
    navigateStep("billing");
  };

  const handleEditSavedAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setFirstName(addr.firstName);
    setLastName(addr.lastName);
    setPhoneCode(addr.phoneCode);
    setPhoneNumber(addr.phone);
    setEmail(addr.email);
    setCompanyName(addr.companyName || "");
    setVatNumber(addr.vatNumber || "");
    setCountry(addr.country);
    setStateProvince(addr.state);
    setCity(addr.city);
    setDetailedAddress(addr.addressLine1);
    setZipCode(addr.zipCode);
    setBillingErrors({});
    setAddressTab("new");
  };

  const handleUseDefaultAddress = () => {
    setBillingErrors({});
    setAddressTab("saved");
    setSelectedSavedAddressId(savedAddresses[0].id);
    navigateStep("payment");
  };

  const handleBillingNext = () => {
    if (addressTab === "saved") {
      navigateStep("payment");
      return;
    }

    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!email.trim() || !email.includes("@")) {
      errors.email = "Valid email address is required";
    }
    if (!country) errors.country = "Select country";
    if (!stateProvince) errors.stateProvince = "Select state/province";
    if (!city) errors.city = "Select city";
    if (!detailedAddress.trim())
      errors.detailedAddress = "Detailed address is required";
    if (!zipCode.trim()) errors.zipCode = "ZIP code is required";

    if (Object.keys(errors).length > 0) {
      setBillingErrors(errors);
      return;
    }

    setBillingErrors({});

    if (saveAddressForFuture || editingAddressId) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const newEntry: SavedAddress = {
        id: editingAddressId || `addr-${Date.now()}`,
        label: companyName.trim() ? "Business Address" : "Saved Address",
        isDefault: savedAddresses.length === 0,
        fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        addressLine1: detailedAddress.trim(),
        addressLine2: `${city}, ${stateProvince}, ${country} ${zipCode.trim()}`,
        country,
        state: stateProvince,
        city,
        zipCode: zipCode.trim(),
        phoneCode,
        phone: phoneNumber.trim(),
        email: email.trim(),
        companyName: companyName.trim() || undefined,
        vatNumber: vatNumber.trim() || undefined,
      };
      setSavedAddresses((prev) =>
        editingAddressId
          ? prev.map((a) => (a.id === editingAddressId ? newEntry : a))
          : [...prev, newEntry]
      );
      setSelectedSavedAddressId(newEntry.id);
      setEditingAddressId(null);
    }

    navigateStep("payment");
  };

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    setCardErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const handleExpirationChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    const formatted =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setCardExpiration(formatted);
    setCardErrors((prev) => ({ ...prev, cardExpiration: "" }));
  };

  const handleCompletePayment = () => {
    if (selectedPaymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      const hasAnyInput =
        digits.length > 0 ||
        cardHolderName.trim().length > 0 ||
        cardExpiration.trim().length > 0 ||
        cardCvv.trim().length > 0;

      if (hasAnyInput) {
        const errors: Record<string, string> = {};
        if (digits.length > 0 && digits.length < 13) {
          errors.cardNumber = "Enter a valid card number";
        }
        if (cardExpiration.trim() && cardExpiration.length < 5) {
          errors.cardExpiration = "Use MM/YY";
        }
        if (cardCvv.trim() && cardCvv.length < 3) {
          errors.cardCvv = "Invalid CVV";
        }
        if (Object.keys(errors).length > 0) {
          setCardErrors(errors);
          return;
        }
      }

      if (saveCardForFuture && digits.length >= 4) {
        const last4 = digits.slice(-4);
        if (!savedCards.some((c) => c.last4 === last4)) {
          const newCard: SavedCard = {
            id: `card-${Date.now()}`,
            brand: "VISA",
            last4,
            holderName: (cardHolderName || "MAXWELL THAI VIET").toUpperCase(),
            expiry: cardExpiration || "12/28",
          };
          setSavedCards((prev) => [...prev, newCard]);
        }
      }
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const digits = cardNumber.replace(/\D/g, "");
      if (
        selectedPaymentMethod === "card" &&
        (digits.endsWith("0000") || cardCvv === "000")
      ) {
        setFailureReason("insufficient_funds");
        navigateStep("receipt-failed");
      } else {
        navigateStep("receipt-success");
      }
    }, 220);
  };

  const handleDownloadReceipt = () => {
    const receiptText = [
      "ONFLOW ASIA — PAYMENT RECEIPT",
      "========================================",
      `Transaction ID:   ${transactionId}`,
      `Purchase Date:    ${purchaseDate}`,
      `Payment Time:     ${paymentTime}`,
      `Payment Method:   ${paymentMethodLabel}`,
      `Recipient:        ${recipientDisplay}`,
      `Package:          ${orderSummary.packageName}`,
      `Credits Added:    ${orderSummary.purchaseCredits.toLocaleString("en-US")}`,
      `Bonus Credits:    ${orderSummary.bonusCredits.toLocaleString("en-US")}`,
      `Subtotal:         ${formatVnd(orderSummary.subtotalVnd)}`,
      `VAT Included (8%): ${formatVnd(orderSummary.vatVnd)}`,
      `Amount Paid:      ${formatVnd(orderSummary.totalVnd)}`,
      `New Balance:      ${orderSummary.newBalance.toLocaleString("en-US")} Credits`,
      `License Terms:    Standard Commercial`,
      `License Owner:    Onflow Asia Co., Ltd`,
      "========================================",
      "Protected with 256-bit TLS encryption",
    ].join("\n");

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onflow-receipt-${transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Receipt ${transactionId} downloaded.`);
  };

  const availableStates = country
    ? Object.keys(LOCATION_DATA[country] || LOCATION_DATA.Vietnam)
    : Object.keys(LOCATION_DATA.Vietnam);
  const availableCities =
    country && stateProvince
      ? LOCATION_DATA[country]?.[stateProvince] ||
        LOCATION_DATA.Vietnam["Ho Chi Minh City"]
      : LOCATION_DATA.Vietnam["Ho Chi Minh City"];

  const stepLabel =
    step === "package"
      ? "1. Credit package"
      : step === "billing"
      ? "2. Billing address"
      : step === "payment"
      ? "3. Payment method"
      : step === "receipt-success"
      ? "4. Receipt (Completed)"
      : "4. Receipt (Declined)";

  // Unified Portal Sidebar (Manage Account -> Billing -> Purchase Credits highlighted as active section)
  const renderPortalSidebar = (isMobile = false) => (
    <PortalSidebar
      activeSection="billing-purchase"
      activeOrgKey={activeOrgKey}
      creditsDisplay={headerCreditsDisplay}
      pendingBillingCount={1}
      collapsed={sidebarCollapsed}
      isMobile={isMobile}
      onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      onCloseMobile={() => setMobileSidebarOpen(false)}
      onSwitchOrg={(orgKey) => {
        setActiveOrgKey(orgKey);
        showToast(
          `Switched workspace to ${
            orgKey === "onflow" ? "Onflow Asia" : "Mekong Studio"
          }`
        );
      }}
      onOpenSettings={(tab) => {
        router.push(`/portal?settings=${tab}`);
      }}
    />
  );

  return (
    <div className="kumo-portal bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)] min-h-screen w-full flex flex-col items-center overflow-x-clip">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--text-color-kumo-strong)] text-white px-3.5 py-2 rounded-[8px] shadow-[var(--shadow-kumo-md)] border border-white/10 flex items-center gap-2 text-[13px]">
          <span className="size-2 rounded-full bg-[#3e8eff] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden flex"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="w-[260px] max-w-[85vw] h-full border-r border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)]"
            onClick={(e) => e.stopPropagation()}
          >
            {renderPortalSidebar(true)}
          </aside>
        </div>
      )}

      {/* Cloudflare Kumo Side-by-Side Shell: 260px Left Portal Sidebar + Right Column */}
      <div className="w-full min-h-screen flex relative bg-[var(--color-kumo-canvas)]">
        {/* Desktop Full-Height Sticky Kumo Portal Sidebar (`260px` or `60px` collapsed) */}
        <aside
          className={`hidden lg:block shrink-0 border-r border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] transition-[width] duration-150 ${
            sidebarCollapsed ? "w-[60px]" : "w-[260px]"
          }`}
        >
          <div className="sticky top-0 h-screen">
            {renderPortalSidebar(false)}
          </div>
        </aside>

        {/* Right Column: 58px Aligned Top Header + Split Main / 400px Right Checkout Rail + 48px Footer */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* 58px Kumo Top Header Bar (`--header-height: 58px`, sticky, `border-b border-kumo-line`) */}
          <header
            className="bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] h-[58px] w-full flex items-center justify-between px-4 shrink-0 sticky top-0 z-30 gap-3"
            data-name="Header"
          >
            {/* Left: Mobile Menu + Breadcrumbs */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden size-8 rounded-[8px] hover:bg-[var(--color-kumo-tint)] border-0 bg-transparent flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer shrink-0"
              >
                <Menu size={17} strokeWidth={1.5} />
              </button>

              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-[14px] min-w-0"
              >
                <Link
                  href="/portal?tab=credits"
                  className="hidden sm:inline text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] no-underline whitespace-nowrap"
                >
                  Manage Account
                </Link>
                <ChevronRight
                  size={13}
                  className="hidden sm:inline text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <button
                  type="button"
                  onClick={() => navigateStep("package")}
                  className="hidden sm:inline text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap"
                >
                  Billing
                </button>
                <ChevronRight
                  size={13}
                  className="hidden sm:inline text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <span className="font-semibold text-[var(--text-color-kumo-strong)] truncate whitespace-nowrap">
                  Purchase Credits
                </span>
              </nav>
            </div>

            {/* Center: Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="hidden xl:flex flex-1 max-w-[360px] mx-2"
            >
              <div className="w-full h-8 bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] focus-within:border-[var(--color-kumo-brand)] rounded-[8px] flex items-center gap-2 px-3">
                <Search
                  size={14}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 3D catalog or invoices..."
                  className="w-full bg-transparent border-0 outline-none text-[13px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
                />
              </div>
            </form>

            {/* Right: Security Badge + Balance Pill + Portal CTA */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[var(--color-kumo-hairline)] bg-white text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                <Lock size={12} className="text-[var(--text-color-kumo-success)]" />
                <span>256-bit TLS</span>
              </span>

              <Link
                href="/portal?tab=credits"
                className="bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] transition-colors flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] shrink-0 no-underline"
              >
                <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
                <span className="kumo-mono font-medium text-[12px] text-[var(--text-color-kumo-strong)] whitespace-nowrap inline-flex items-center gap-1">
                  <span>{headerCreditsDisplay}</span>
                  <CreditIcon size={11} />
                </span>
              </Link>

              <Link
                href="/"
                className="h-8 px-2.5 sm:px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 no-underline shrink-0"
              >
                <Globe size={13} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
                <span className="hidden sm:inline">3D Catalog</span>
                <span className="sm:hidden">Catalog</span>
              </Link>
            </div>
          </header>

          {/* Cloudflare Kumo Split Layout (Main Checkout Column + 400px Right Order Summary Rail) */}
          <div className="flex-1 flex flex-col xl:flex-row">
            {/* Main Left Checkout Column */}
            <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 pt-7 pb-10 flex flex-col gap-6">
              {/* Page Title + Cloudflare Kumo Segmented Step Bar */}
              <div className="flex flex-col gap-4 border-b border-[var(--color-kumo-line)] pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="m-0 text-[20px] leading-[26px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Top up studio credits
                      </h1>
                      <span className="h-6 px-2.5 py-0.5 rounded-full border border-[var(--color-kumo-hairline)] bg-white text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                        <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)] shrink-0" />
                        <span>{stepLabel}</span>
                      </span>
                    </div>
                    <p className="m-0 text-[14px] text-[var(--text-color-kumo-subtle)]">
                      Credits unlock 3D scans, 8K PBR surfaces, and 32-bit EXR skies with permanent 0-credit re-exports.
                    </p>
                  </div>
                </div>

                {/* Kumo Segmented Step Pill Track (`1. Credit package`, `2. Billing address`, `3. Payment method`, `4. Receipt`) */}
                <div
                  role="tablist"
                  aria-label="Checkout progress"
                  className="inline-flex flex-wrap items-center rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5 self-start"
                >
                  {[
                    {
                      id: "package" as const,
                      num: "1",
                      label: "Credit package",
                      done:
                        step === "billing" ||
                        step === "payment" ||
                        step === "receipt-success" ||
                        step === "receipt-failed",
                    },
                    {
                      id: "billing" as const,
                      num: "2",
                      label: "Billing address",
                      done:
                        step === "payment" ||
                        step === "receipt-success" ||
                        step === "receipt-failed",
                    },
                    {
                      id: "payment" as const,
                      num: "3",
                      label: "Payment method",
                      done:
                        step === "receipt-success" || step === "receipt-failed",
                    },
                    {
                      id: "receipt-success" as const,
                      num: "4",
                      label: "Receipt",
                      done: false,
                    },
                  ].map((s) => {
                    const isActive =
                      step === s.id ||
                      (s.id === "receipt-success" && step === "receipt-failed");
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => navigateStep(s.id)}
                        className={`h-8 px-3 rounded-[6px] border-0 inline-flex items-center gap-2 text-[13px] cursor-pointer transition-colors ${
                          isActive
                            ? "bg-white font-medium text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                            : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                        }`}
                      >
                        <span
                          className={`size-4 rounded-full text-[11px] kumo-mono inline-flex items-center justify-center ${
                            s.done
                              ? "bg-[var(--color-kumo-success)] text-white"
                              : isActive
                              ? "bg-[var(--color-kumo-brand)] text-white"
                              : "bg-[var(--color-kumo-fill)] text-[var(--text-color-kumo-default)]"
                          }`}
                        >
                          {s.done ? <Check size={10} strokeWidth={2.5} /> : s.num}
                        </span>
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================================================================ */}
              {/* STEP 1: CHOOSE CREDIT PACKAGE                                    */}
              {/* ================================================================ */}
              {step === "package" && (
                <div className="flex flex-col gap-5 max-w-[880px]">
                  {/* 4-Card Kumo Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {PACKAGES.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`group text-left rounded-[8px] p-5 border transition-colors cursor-pointer flex flex-col justify-between gap-4 relative ${
                            isSelected
                              ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)] ring-1 ring-inset ring-[var(--color-kumo-brand)]/30 shadow-[var(--shadow-kumo-xs)]"
                              : "bg-white border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] shadow-[var(--shadow-kumo-xs)]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                                  {pkg.name}
                                </span>
                                {pkg.badge && (
                                  <span className="rounded-full px-2 py-0.5 text-[11px] leading-none border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)] bg-white">
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                                {pkg.tagline}
                              </span>
                            </div>

                            {/* Radio indicator */}
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                  : "border-[var(--color-kumo-fill)] bg-white"
                              }`}
                            >
                              {isSelected && <Check size={10} strokeWidth={2.5} />}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-[28px] leading-none font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                              {pkg.credits.toLocaleString("en-US")}
                            </span>
                            <span className="text-[13px] text-[var(--text-color-kumo-subtle)]">
                              credits
                            </span>
                            {pkg.bonus > 0 && (
                              <span className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium bg-[#ecfdf3] border border-[#34c48b]/30 text-[var(--text-color-kumo-success)] kumo-mono">
                                +{pkg.bonus} bonus
                              </span>
                            )}
                          </div>

                          <div className="pt-3 border-t border-[var(--color-kumo-line)] flex items-baseline justify-between gap-2 w-full">
                            <span className="kumo-mono text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                              {formatVnd(pkg.priceVnd)}
                            </span>
                            {pkg.originalPriceVnd ? (
                              <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)] line-through">
                                {formatVnd(pkg.originalPriceVnd)}
                              </span>
                            ) : (
                              <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                                Includes 8% VAT
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Credit Pack Card */}
                  <div
                    onClick={() => setSelectedPackageId("custom")}
                    className={`rounded-[8px] p-5 border transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedPackageId === "custom"
                        ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)] ring-1 ring-inset ring-[var(--color-kumo-brand)]/30 shadow-[var(--shadow-kumo-xs)]"
                        : "bg-white border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] shadow-[var(--shadow-kumo-xs)]"
                    }`}
                  >
                    <div className="flex flex-col gap-2 flex-1 max-w-[440px]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                              selectedPackageId === "custom"
                                ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                : "border-[var(--color-kumo-fill)] bg-white"
                            }`}
                          >
                            {selectedPackageId === "custom" && (
                              <Check size={10} strokeWidth={2.5} />
                            )}
                          </span>
                          <span className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                            Custom credit volume
                          </span>
                        </div>
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)] pl-6">
                          2,200 VND / credit (+10–20% volume bonus)
                        </span>
                      </div>

                      <div className="h-9 bg-white border border-[var(--color-kumo-line)] focus-within:border-[var(--color-kumo-brand)] rounded-[8px] px-3 flex items-center justify-between gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customCreditsInput}
                          onFocus={() => setSelectedPackageId("custom")}
                          onChange={(e) => {
                            setSelectedPackageId("custom");
                            setCustomCreditsInput(
                              e.target.value.replace(/[^\d]/g, "")
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Enter credit quantity (e.g. 2500)"
                          className="w-full bg-transparent border-0 outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)] placeholder:text-[var(--text-color-kumo-placeholder)]"
                        />
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)] shrink-0">
                          credits
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-0.5 shrink-0">
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Equivalent total (incl. VAT)
                      </span>
                      <span className="kumo-mono text-[18px] font-semibold text-[var(--text-color-kumo-strong)]">
                        {formatVnd(customEquivalentVnd)}
                      </span>
                    </div>
                  </div>

                  {/* Step 1 Footer CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href="/portal?tab=credits"
                      className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 no-underline"
                    >
                      <ArrowLeft size={14} strokeWidth={1.5} />
                      <span>Return to Billing</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleSelectPackageNext}
                      className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to billing address</span>
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* STEP 2: BILLING ADDRESS & TAX PROFILE                            */}
              {/* ================================================================ */}
              {step === "billing" && (
                <div className="flex flex-col gap-5 max-w-[880px]">
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-5 sm:p-6 flex flex-col gap-5">
                    {/* Kumo Segmented Pill Switcher: Saved Addresses vs Enter New Address */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-kumo-line)] pb-4">
                      <div>
                        <h2 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Billing & VAT profile
                        </h2>
                        <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                          Appears on your consolidated Vietnam VAT tax invoice
                        </p>
                      </div>

                      <div
                        role="tablist"
                        className="inline-flex items-center h-9 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={addressTab === "saved"}
                          onClick={() => setAddressTab("saved")}
                          className={`h-8 px-3 rounded-[6px] border-0 text-[13px] cursor-pointer transition-colors ${
                            addressTab === "saved"
                              ? "bg-white font-medium text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                              : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                          }`}
                        >
                          Saved addresses ({savedAddresses.length})
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={addressTab === "new"}
                          onClick={() => setAddressTab("new")}
                          className={`h-8 px-3 rounded-[6px] border-0 text-[13px] cursor-pointer transition-colors ${
                            addressTab === "new"
                              ? "bg-white font-medium text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                              : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                          }`}
                        >
                          Enter new address
                        </button>
                      </div>
                    </div>

                    {/* Tab 1: Saved Addresses */}
                    {addressTab === "saved" && (
                      <div className="flex flex-col gap-3">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedSavedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedSavedAddressId(addr.id)}
                              className={`rounded-[8px] p-4 border transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                                isSelected
                                  ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)] ring-1 ring-inset ring-[var(--color-kumo-brand)]/25"
                                  : "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)]"
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <span
                                  className={`mt-0.5 size-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                      : "border-[var(--color-kumo-fill)] bg-white"
                                  }`}
                                >
                                  {isSelected && <Check size={10} strokeWidth={2.5} />}
                                </span>

                                <div className="flex flex-col gap-1.5 min-w-0 text-[13px]">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-[var(--text-color-kumo-strong)]">
                                      {addr.fullName}
                                    </span>
                                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)]">
                                      {addr.label}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)] bg-white">
                                        Default
                                      </span>
                                    )}
                                  </div>

                                  {addr.companyName && (
                                    <div className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                      {addr.companyName}
                                      {addr.vatNumber ? ` · Tax ID: ${addr.vatNumber}` : ""}
                                    </div>
                                  )}

                                  <div className="text-[var(--text-color-kumo-subtle)] flex flex-col gap-0.5">
                                    <span>{addr.addressLine1}</span>
                                    <span>{addr.addressLine2}</span>
                                    <span className="pt-0.5 kumo-mono text-[12px]">
                                      {addr.phoneCode} {addr.phone} · {addr.email}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSavedAddress(addr);
                                }}
                                className="h-7 px-2.5 rounded-[6px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <Edit3 size={12} />
                                <span>Edit</span>
                              </button>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddressId(null);
                            setAddressTab("new");
                          }}
                          className="h-9 rounded-[8px] border border-dashed border-[var(--color-kumo-fill)] hover:border-[var(--color-kumo-brand)] bg-transparent text-[13px] font-medium text-[var(--text-color-kumo-link)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Plus size={14} />
                          <span>Add new billing address</span>
                        </button>
                      </div>
                    )}

                    {/* Tab 2: Enter New Address Form */}
                    {addressTab === "new" && (
                      <div className="flex flex-col gap-5">
                        {/* Contact Info */}
                        <div className="flex flex-col gap-3">
                          <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                            Contact details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                First name <span className="text-[#f6821f]">*</span>
                              </span>
                              <input
                                type="text"
                                value={firstName}
                                onChange={(e) => {
                                  setFirstName(e.target.value);
                                  setBillingErrors((p) => ({ ...p, firstName: "" }));
                                }}
                                placeholder="e.g. Maxwell"
                                className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                              />
                              {billingErrors.firstName && (
                                <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                  {billingErrors.firstName}
                                </span>
                              )}
                            </label>

                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Last name <span className="text-[#f6821f]">*</span>
                              </span>
                              <input
                                type="text"
                                value={lastName}
                                onChange={(e) => {
                                  setLastName(e.target.value);
                                  setBillingErrors((p) => ({ ...p, lastName: "" }));
                                }}
                                placeholder="e.g. Viet"
                                className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                              />
                              {billingErrors.lastName && (
                                <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                  {billingErrors.lastName}
                                </span>
                              )}
                            </label>

                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Phone number <span className="text-[#f6821f]">*</span>
                              </span>
                              <div className="flex gap-1.5">
                                <div className="relative w-[84px] shrink-0">
                                  <select
                                    value={phoneCode}
                                    onChange={(e) => setPhoneCode(e.target.value)}
                                    className="h-9 w-full pl-2.5 pr-6 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] kumo-mono text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                                  >
                                    {PHONE_DIAL_CODES.map((d) => (
                                      <option key={d.code} value={d.code}>
                                        {d.code}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                                  />
                                </div>
                                <input
                                  type="tel"
                                  value={phoneNumber}
                                  onChange={(e) => {
                                    setPhoneNumber(e.target.value);
                                    setBillingErrors((p) => ({ ...p, phoneNumber: "" }));
                                  }}
                                  placeholder="903 837 382"
                                  className="h-9 flex-1 min-w-0 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                                />
                              </div>
                              {billingErrors.phoneNumber && (
                                <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                  {billingErrors.phoneNumber}
                                </span>
                              )}
                            </label>

                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Invoice email <span className="text-[#f6821f]">*</span>
                              </span>
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  setBillingErrors((p) => ({ ...p, email: "" }));
                                }}
                                placeholder="billing@onflow.asia"
                                className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                              />
                              {billingErrors.email && (
                                <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                  {billingErrors.email}
                                </span>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Company & Address Info */}
                        <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-kumo-line)]">
                          <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                            Organization & street address
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3.5">
                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Company name (optional)
                              </span>
                              <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Onflow Asia Co., Ltd"
                                className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                              />
                            </label>

                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Tax / VAT ID (optional)
                              </span>
                              <input
                                type="text"
                                value={vatNumber}
                                onChange={(e) => setVatNumber(e.target.value)}
                                placeholder="VN-0318294012"
                                className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                              />
                            </label>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Country <span className="text-[#f6821f]">*</span>
                              </span>
                              <div className="relative">
                                <select
                                  value={country}
                                  onChange={(e) => {
                                    const c = e.target.value;
                                    setCountry(c);
                                    const firstSt = Object.keys(LOCATION_DATA[c] || {})[0] || "";
                                    setStateProvince(firstSt);
                                    setCity(LOCATION_DATA[c]?.[firstSt]?.[0] || "");
                                  }}
                                  className="h-9 w-full pl-3 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                                >
                                  {Object.keys(LOCATION_DATA).map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={13}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                                />
                              </div>
                            </label>

                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                State / Province <span className="text-[#f6821f]">*</span>
                              </span>
                              <div className="relative">
                                <select
                                  value={stateProvince}
                                  onChange={(e) => {
                                    const st = e.target.value;
                                    setStateProvince(st);
                                    setCity(LOCATION_DATA[country]?.[st]?.[0] || "");
                                  }}
                                  className="h-9 w-full pl-3 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                                >
                                  {availableStates.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={13}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                                />
                              </div>
                            </label>

                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                City / District <span className="text-[#f6821f]">*</span>
                              </span>
                              <div className="relative">
                                <select
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  className="h-9 w-full pl-3 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                                >
                                  {availableCities.map((ct) => (
                                    <option key={ct} value={ct}>
                                      {ct}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={13}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                                />
                              </div>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3.5">
                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Street address <span className="text-[#f6821f]">*</span>
                              </span>
                              <input
                                type="text"
                                value={detailedAddress}
                                onChange={(e) => {
                                  setDetailedAddress(e.target.value);
                                  setBillingErrors((p) => ({
                                    ...p,
                                    detailedAddress: "",
                                  }));
                                }}
                                placeholder="123 Nguyen Hue Street, Floor 5"
                                className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                              />
                              {billingErrors.detailedAddress && (
                                <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                  {billingErrors.detailedAddress}
                                </span>
                              )}
                            </label>

                            <label className="flex flex-col gap-1">
                              <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                Postal / ZIP code <span className="text-[#f6821f]">*</span>
                              </span>
                              <input
                                type="text"
                                value={zipCode}
                                onChange={(e) => {
                                  setZipCode(e.target.value);
                                  setBillingErrors((p) => ({ ...p, zipCode: "" }));
                                }}
                                placeholder="70000"
                                className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                              />
                              {billingErrors.zipCode && (
                                <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                  {billingErrors.zipCode}
                                </span>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-[var(--text-color-kumo-default)]">
                            <input
                              type="checkbox"
                              checked={saveAddressForFuture}
                              onChange={(e) =>
                                setSaveAddressForFuture(e.target.checked)
                              }
                              className="size-4 accent-[var(--color-kumo-brand)]"
                            />
                            <span>Save this billing profile for future invoices</span>
                          </label>

                          {Object.keys(billingErrors).length > 0 && (
                            <button
                              type="button"
                              onClick={handleUseDefaultAddress}
                              className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                            >
                              Use saved default address (Maxwell Viet) →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2 Footer Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigateStep("package")}
                      className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} strokeWidth={1.5} />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBillingNext}
                      className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to payment method</span>
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* STEP 3: PAYMENT METHOD                                           */}
              {/* ================================================================ */}
              {step === "payment" && (
                <div className="flex flex-col gap-5 max-w-[880px]">
                  {/* Group 1: Saved Payment Methods */}
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-5 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <h2 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Saved corporate cards
                      </h2>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Instant settlement
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {savedCards.map((card) => {
                        const isSelected =
                          selectedPaymentMethod === "saved-card" &&
                          selectedSavedCardId === card.id;
                        const isEditing = editingCardId === card.id;
                        return (
                          <div
                            key={card.id}
                            onClick={() => {
                              setSelectedPaymentMethod("saved-card");
                              setSelectedSavedCardId(card.id);
                            }}
                            className={`rounded-[8px] p-3.5 border transition-colors cursor-pointer flex flex-col gap-3 ${
                              isSelected
                                ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)] ring-1 ring-inset ring-[var(--color-kumo-brand)]/25"
                                : "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                      : "border-[var(--color-kumo-fill)] bg-white"
                                  }`}
                                >
                                  {isSelected && <Check size={10} strokeWidth={2.5} />}
                                </span>
                                <span className="kumo-mono text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-white border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)]">
                                  {card.brand}
                                </span>
                                <span className="text-[13px] font-medium text-[var(--text-color-kumo-strong)] kumo-mono">
                                  •••• {card.last4}
                                </span>
                                <span className="text-[12px] text-[var(--text-color-kumo-subtle)] hidden sm:inline">
                                  {card.holderName} · Exp {card.expiry}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isEditing) {
                                    setEditingCardId(null);
                                  } else {
                                    setEditingCardId(card.id);
                                    setEditCardHolder(card.holderName);
                                    setEditCardExpiry(card.expiry);
                                  }
                                }}
                                className="h-7 px-2.5 rounded-[6px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                              >
                                {isEditing ? "Cancel" : "Edit"}
                              </button>
                            </div>

                            {isEditing && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="pt-3 border-t border-[var(--color-kumo-line)] flex flex-wrap items-center gap-2.5"
                              >
                                <input
                                  type="text"
                                  value={editCardHolder}
                                  onChange={(e) => setEditCardHolder(e.target.value)}
                                  placeholder="Cardholder name"
                                  className="h-8 px-2.5 rounded-[6px] bg-white border border-[var(--color-kumo-line)] text-[12px] text-[var(--text-color-kumo-strong)] outline-none flex-1 min-w-[160px]"
                                />
                                <input
                                  type="text"
                                  value={editCardExpiry}
                                  onChange={(e) => setEditCardExpiry(e.target.value)}
                                  placeholder="MM/YY"
                                  className="h-8 px-2.5 rounded-[6px] bg-white border border-[var(--color-kumo-line)] text-[12px] kumo-mono text-[var(--text-color-kumo-strong)] outline-none w-[90px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSavedCards((prev) =>
                                      prev.map((c) =>
                                        c.id === card.id
                                          ? {
                                              ...c,
                                              holderName:
                                                editCardHolder || c.holderName,
                                              expiry: editCardExpiry || c.expiry,
                                            }
                                          : c
                                      )
                                    );
                                    setEditingCardId(null);
                                    showToast("Saved card updated.");
                                  }}
                                  className="h-8 px-3 rounded-[6px] kumo-btn-primary text-[12px] font-medium cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Group 2: Other Payment Methods */}
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-5 flex flex-col gap-3.5">
                    <h2 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Payment methods
                    </h2>

                    <div className="flex flex-col gap-2.5">
                      {/* 1. Credit / Debit Card */}
                      <div
                        onClick={() => setSelectedPaymentMethod("card")}
                        className={`rounded-[8px] p-4 border transition-colors cursor-pointer flex flex-col gap-4 ${
                          selectedPaymentMethod === "card"
                            ? "bg-[#3e8eff]/[.04] border-[var(--color-kumo-brand)]"
                            : "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedPaymentMethod === "card"
                                  ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                  : "border-[var(--color-kumo-fill)] bg-white"
                              }`}
                            >
                              {selectedPaymentMethod === "card" && (
                                <Check size={10} strokeWidth={2.5} />
                              )}
                            </span>
                            <CreditCard
                              size={16}
                              strokeWidth={1.5}
                              className="text-[var(--text-color-kumo-subtle)]"
                            />
                            <span className="text-[14px] font-medium text-[var(--text-color-kumo-strong)]">
                              Credit or Debit Card
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 kumo-mono text-[11px]">
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-white border border-[var(--color-kumo-line)] font-semibold text-[#1a1f71]">
                              VISA
                            </span>
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-white border border-[var(--color-kumo-line)] font-semibold text-[#eb001b]">
                              MC
                            </span>
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-white border border-[var(--color-kumo-line)] font-semibold text-[#007bc1]">
                              JCB
                            </span>
                          </div>
                        </div>

                        {selectedPaymentMethod === "card" && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-3 border-t border-[var(--color-kumo-line)] flex flex-col gap-3.5"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <label className="flex flex-col gap-1 sm:col-span-2">
                                <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                  Card number
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={cardNumber}
                                  onChange={(e) =>
                                    handleCardNumberChange(e.target.value)
                                  }
                                  placeholder="4242 •••• •••• 8288 (use 0000 at end to test failed state)"
                                  className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                                />
                                {cardErrors.cardNumber && (
                                  <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                    {cardErrors.cardNumber}
                                  </span>
                                )}
                              </label>

                              <label className="flex flex-col gap-1">
                                <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                  Cardholder name
                                </span>
                                <input
                                  type="text"
                                  value={cardHolderName}
                                  onChange={(e) =>
                                    setCardHolderName(e.target.value)
                                  }
                                  placeholder="MAXWELL THAI VIET"
                                  className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                                />
                              </label>

                              <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                  <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                    Expiry (MM/YY)
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={cardExpiration}
                                    onChange={(e) =>
                                      handleExpirationChange(e.target.value)
                                    }
                                    placeholder="08/28"
                                    className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                                  />
                                  {cardErrors.cardExpiration && (
                                    <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                      {cardErrors.cardExpiration}
                                    </span>
                                  )}
                                </label>

                                <label className="flex flex-col gap-1">
                                  <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                    CVC / CVV
                                  </span>
                                  <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={cardCvv}
                                    onChange={(e) => {
                                      setCardCvv(
                                        e.target.value
                                          .replace(/\D/g, "")
                                          .slice(0, 4)
                                      );
                                      setCardErrors((p) => ({ ...p, cardCvv: "" }));
                                    }}
                                    placeholder="•••"
                                    className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                                  />
                                  {cardErrors.cardCvv && (
                                    <span className="text-[11px] text-[var(--text-color-kumo-danger)]">
                                      {cardErrors.cardCvv}
                                    </span>
                                  )}
                                </label>
                              </div>
                            </div>

                            <label className="inline-flex items-center gap-2 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]">
                              <input
                                type="checkbox"
                                checked={saveCardForFuture}
                                onChange={(e) =>
                                  setSaveCardForFuture(e.target.checked)
                                }
                                className="size-4 accent-[var(--color-kumo-brand)]"
                              />
                              <span>Save card to Onflow Asia workspace for future top-ups</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* 2. Domestic Online Banking (VietQR / NAPAS) */}
                      <div
                        onClick={() => setSelectedPaymentMethod("banking")}
                        className={`rounded-[8px] p-4 border transition-colors cursor-pointer flex flex-col gap-3.5 ${
                          selectedPaymentMethod === "banking"
                            ? "bg-[#3e8eff]/[.04] border-[var(--color-kumo-brand)]"
                            : "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedPaymentMethod === "banking"
                                  ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                  : "border-[var(--color-kumo-fill)] bg-white"
                              }`}
                            >
                              {selectedPaymentMethod === "banking" && (
                                <Check size={10} strokeWidth={2.5} />
                              )}
                            </span>
                            <Landmark
                              size={16}
                              strokeWidth={1.5}
                              className="text-[var(--text-color-kumo-subtle)]"
                            />
                            <span className="text-[14px] font-medium text-[var(--text-color-kumo-strong)]">
                              Online Banking (VietQR / NAPAS 247)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {BANK_OPTIONS.map((bank) => (
                              <img
                                key={bank.id}
                                alt={bank.name}
                                src={bank.icon}
                                className={`size-5 object-contain ${
                                  bank.rotate ? "rotate-90" : ""
                                }`}
                              />
                            ))}
                            <span className="text-[11px] text-[var(--text-color-kumo-subtle)] kumo-mono">
                              +40 banks
                            </span>
                          </div>
                        </div>

                        {selectedPaymentMethod === "banking" && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-3 border-t border-[var(--color-kumo-line)] grid grid-cols-2 sm:grid-cols-5 gap-2"
                          >
                            {BANK_OPTIONS.map((bank) => (
                              <button
                                key={bank.id}
                                type="button"
                                onClick={() => setSelectedBank(bank.name)}
                                className={`p-2.5 rounded-[8px] border flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                                  selectedBank === bank.name
                                    ? "bg-white border-[var(--color-kumo-brand)] ring-1 ring-inset ring-[var(--color-kumo-brand)]/30"
                                    : "bg-white border-[var(--color-kumo-line)] hover:bg-[var(--color-kumo-tint)]"
                                }`}
                              >
                                <img
                                  alt={bank.name}
                                  src={bank.icon}
                                  className={`size-5 object-contain ${
                                    bank.rotate ? "rotate-90" : ""
                                  }`}
                                />
                                <span className="text-[11px] font-medium text-[var(--text-color-kumo-strong)] text-center">
                                  {bank.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. MoMo E-Wallet */}
                      <div
                        onClick={() => setSelectedPaymentMethod("momo")}
                        className={`rounded-[8px] p-4 border transition-colors cursor-pointer flex flex-col gap-3 ${
                          selectedPaymentMethod === "momo"
                            ? "bg-[#3e8eff]/[.04] border-[var(--color-kumo-brand)]"
                            : "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedPaymentMethod === "momo"
                                  ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                  : "border-[var(--color-kumo-fill)] bg-white"
                              }`}
                            >
                              {selectedPaymentMethod === "momo" && (
                                <Check size={10} strokeWidth={2.5} />
                              )}
                            </span>
                            <Smartphone
                              size={16}
                              strokeWidth={1.5}
                              className="text-[var(--text-color-kumo-subtle)]"
                            />
                            <span className="text-[14px] font-medium text-[var(--text-color-kumo-strong)]">
                              MoMo E-Wallet
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                            Instant QR approval
                          </span>
                        </div>

                        {selectedPaymentMethod === "momo" && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-3 border-t border-[var(--color-kumo-line)] flex flex-wrap items-center gap-3"
                          >
                            <input
                              type="tel"
                              value={momoPhone}
                              onChange={(e) => setMomoPhone(e.target.value)}
                              placeholder="MoMo registered phone"
                              className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] kumo-mono text-[var(--text-color-kumo-strong)] outline-none w-full sm:w-[240px]"
                            />
                            <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                              Push notification sent directly to your MoMo app
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 4. PayPal Express */}
                      <div
                        onClick={() => setSelectedPaymentMethod("paypal")}
                        className={`rounded-[8px] p-4 border transition-colors cursor-pointer flex flex-col gap-3 ${
                          selectedPaymentMethod === "paypal"
                            ? "bg-[#3e8eff]/[.04] border-[var(--color-kumo-brand)]"
                            : "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedPaymentMethod === "paypal"
                                  ? "border-[var(--color-kumo-brand)] bg-[var(--color-kumo-brand)] text-white"
                                  : "border-[var(--color-kumo-fill)] bg-white"
                              }`}
                            >
                              {selectedPaymentMethod === "paypal" && (
                                <Check size={10} strokeWidth={2.5} />
                              )}
                            </span>
                            <Wallet
                              size={16}
                              strokeWidth={1.5}
                              className="text-[var(--text-color-kumo-subtle)]"
                            />
                            <span className="text-[14px] font-medium text-[var(--text-color-kumo-strong)]">
                              PayPal Express Checkout
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                            International USD / VND
                          </span>
                        </div>

                        {selectedPaymentMethod === "paypal" && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-3 border-t border-[var(--color-kumo-line)] flex flex-wrap items-center gap-3"
                          >
                            <input
                              type="email"
                              value={paypalEmail}
                              onChange={(e) => setPaypalEmail(e.target.value)}
                              placeholder="PayPal account email"
                              className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none w-full sm:w-[260px]"
                            />
                            <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                              Authorized via PayPal Express token
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Footer Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigateStep("billing")}
                      className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} strokeWidth={1.5} />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleCompletePayment}
                      className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <Lock size={13} strokeWidth={1.75} />
                      <span>
                        {isProcessingPayment
                          ? "Authorizing payment..."
                          : `Complete payment (${formatVnd(orderSummary.totalVnd)})`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* STEP 4A: RECEIPT — PAYMENT SUCCESS                               */}
              {/* ================================================================ */}
              {step === "receipt-success" && (
                <div className="flex flex-col gap-5 max-w-[740px]">
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-6 flex flex-col gap-5">
                    {/* Top Success Banner */}
                    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-kumo-line)] pb-4">
                      <div className="flex items-start gap-3.5">
                        <div className="size-10 rounded-[8px] bg-[#ecfdf3] border border-[#34c48b]/40 text-[var(--text-color-kumo-success)] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20} strokeWidth={1.75} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <h2 className="m-0 text-[18px] font-semibold text-[var(--text-color-kumo-strong)]">
                              Payment successful
                            </h2>
                            <span className="h-5 px-2 py-0.5 rounded-full border border-[var(--color-kumo-hairline)] text-[11px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
                              <span>Settled</span>
                            </span>
                          </div>
                          <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                            Your studio credits have been credited to Onflow Asia immediately.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigateStep("receipt-failed")}
                        className="text-[11px] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-link)] underline bg-transparent border-0 p-0 cursor-pointer shrink-0"
                      >
                        Preview declined state
                      </button>
                    </div>

                    {/* Receipt Key-Value Table */}
                    <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)] text-[13px]">
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Transaction ID
                        </span>
                        <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
                          {transactionId}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Settlement timestamp
                        </span>
                        <span className="kumo-mono text-[var(--text-color-kumo-default)]">
                          {paymentTime}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Payment method
                        </span>
                        <span className="font-medium text-[var(--text-color-kumo-strong)]">
                          {paymentMethodLabel}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Billed recipient
                        </span>
                        <span className="font-medium text-[var(--text-color-kumo-strong)]">
                          {recipientDisplay}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Amount paid (incl. 8% VAT)
                        </span>
                        <span className="kumo-mono font-semibold text-[var(--text-color-kumo-strong)]">
                          {formatVnd(orderSummary.totalVnd)}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Credits added
                        </span>
                        <span className="kumo-mono font-semibold text-[var(--text-color-kumo-link)] inline-flex items-center gap-1">
                          <span>+{orderSummary.purchaseCredits.toLocaleString("en-US")}</span>
                          <CreditIcon size={11} />
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Bonus credits
                        </span>
                        <span className="kumo-mono font-semibold text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
                          <span>+{orderSummary.bonusCredits.toLocaleString("en-US")}</span>
                          <CreditIcon size={11} />
                        </span>
                      </div>
                      <div className="px-4 py-3 bg-white flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-color-kumo-strong)]">
                          New workspace balance
                        </span>
                        <span className="kumo-mono text-[16px] font-semibold text-[var(--text-color-kumo-success)] inline-flex items-center gap-1.5">
                          <span>{orderSummary.newBalance.toLocaleString("en-US")}</span>
                          <CreditIcon size={13} />
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleDownloadReceipt}
                        className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download size={14} strokeWidth={1.5} />
                        <span>Download receipt (.txt)</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/portal?tab=credits"
                          className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center no-underline"
                        >
                          View in Billing Ledger
                        </Link>
                        <Link
                          href="/"
                          className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center gap-1.5 no-underline"
                        >
                          <span>Continue to 3D Gallery</span>
                          <ArrowRight size={14} strokeWidth={1.5} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* STEP 4B: RECEIPT — PAYMENT FAILED                                */}
              {/* ================================================================ */}
              {step === "receipt-failed" && (
                <div className="flex flex-col gap-5 max-w-[740px]">
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-6 flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-kumo-line)] pb-4">
                      <div className="flex items-start gap-3.5">
                        <div className="size-10 rounded-[8px] bg-[#fef2f2] border border-[#ff6b70]/40 text-[var(--text-color-kumo-danger)] flex items-center justify-center shrink-0">
                          <AlertTriangle size={20} strokeWidth={1.75} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <h2 className="m-0 text-[18px] font-semibold text-[var(--text-color-kumo-strong)]">
                              Payment authorization declined
                            </h2>
                            <span className="h-5 px-2 py-0.5 rounded-full border border-[#ff6b70]/40 bg-[#fef2f2] text-[11px] font-medium text-[var(--text-color-kumo-danger)]">
                              Declined
                            </span>
                          </div>
                          <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                            Your issuing bank declined the transaction. No funds or credits were deducted.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigateStep("receipt-success")}
                        className="text-[11px] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-link)] underline bg-transparent border-0 p-0 cursor-pointer shrink-0"
                      >
                        Preview settled state
                      </button>
                    </div>

                    <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)] text-[13px]">
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Transaction reference
                        </span>
                        <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
                          {transactionId}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Attempted timestamp
                        </span>
                        <span className="kumo-mono text-[var(--text-color-kumo-default)]">
                          {paymentTime}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Payment method
                        </span>
                        <span className="font-medium text-[var(--text-color-kumo-strong)]">
                          {paymentMethodLabel}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Gateway response code
                        </span>
                        <code className="kumo-mono text-[12px] px-2 py-0.5 rounded-[4px] bg-[#fef2f2] text-[var(--text-color-kumo-danger)]">
                          {failureReason}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => navigateStep("payment")}
                        className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={13} strokeWidth={1.75} />
                        <span>Try alternative payment method</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* ================================================================ */}
            {/* RIGHT 400PX KUMO ORDER SUMMARY RAIL (`border-l border-kumo-line`) */}
            {/* ================================================================ */}
            <aside
              className="w-full xl:w-[400px] shrink-0 xl:border-l border-t xl:border-t-0 border-[var(--color-kumo-line)] p-6 flex flex-col gap-5 bg-[var(--color-kumo-canvas)]"
              data-name="MODULE ODER SUMMARY"
            >
              {/* Card 1: Order Summary */}
              <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[var(--color-kumo-line)] pb-3">
                  <div>
                    <h2 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Order summary
                    </h2>
                    <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                      Onflow Asia · Maxwell@onflow.asia
                    </span>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)]">
                    {orderSummary.packageName}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      Base credits
                    </span>
                    <span className="kumo-mono font-semibold text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                      <span>{orderSummary.purchaseCredits.toLocaleString("en-US")}</span>
                      <CreditIcon size={11} />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      Volume bonus credits
                    </span>
                    <span className="kumo-mono font-semibold text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
                      <span>+{orderSummary.bonusCredits.toLocaleString("en-US")}</span>
                      <CreditIcon size={11} />
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-kumo-line)]">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      Subtotal (before tax)
                    </span>
                    <span className="kumo-mono text-[var(--text-color-kumo-default)]">
                      {formatVnd(orderSummary.subtotalVnd)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      Vietnam VAT (8%)
                    </span>
                    <span className="kumo-mono text-[var(--text-color-kumo-default)]">
                      {formatVnd(orderSummary.vatVnd)}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-3 border-t border-[var(--color-kumo-line)]">
                    <span className="font-semibold text-[var(--text-color-kumo-strong)]">
                      Total due
                    </span>
                    <span className="kumo-mono text-[18px] font-semibold text-[var(--text-color-kumo-strong)]">
                      {formatVnd(orderSummary.totalVnd)}
                    </span>
                  </div>
                </div>

                <div className="rounded-[6px] bg-[var(--color-kumo-recessed)] px-3 py-2 flex items-center justify-between text-[12px]">
                  <span className="text-[var(--text-color-kumo-subtle)]">
                    Projected workspace balance
                  </span>
                  <span className="kumo-mono font-semibold text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
                    <span>{orderSummary.newBalance.toLocaleString("en-US")}</span>
                    <CreditIcon size={11} />
                  </span>
                </div>
              </div>

              {/* Card 2: Transaction & License Metadata */}
              <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-5 flex flex-col gap-3.5">
                <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                  Transaction details
                </h3>

                <div className="flex flex-col divide-y divide-[var(--color-kumo-line)] text-[12px]">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      Date
                    </span>
                    <span className="kumo-mono text-[var(--text-color-kumo-default)]">
                      {purchaseDate}
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      Reference ID
                    </span>
                    <span className="kumo-mono text-[var(--text-color-kumo-strong)]">
                      {transactionId}
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      License coverage
                    </span>
                    <span className="font-medium text-[var(--text-color-kumo-link)]">
                      Standard Commercial (10 seats)
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[var(--text-color-kumo-subtle)]">
                      Issuer
                    </span>
                    <span className="text-[var(--text-color-kumo-strong)] font-medium">
                      Onflow Asia Co., Ltd
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-kumo-line)] flex items-center gap-2 text-[12px] text-[var(--text-color-kumo-subtle)]">
                  <ShieldCheck
                    size={15}
                    className="text-[var(--text-color-kumo-success)] shrink-0"
                  />
                  <span>
                    Encrypted checkout · Consolidated VAT invoice issued within 24h
                  </span>
                </div>
              </div>
            </aside>
          </div>

          {/* Cloudflare Kumo 48px Bottom Footer */}
          <footer className="mt-auto min-h-[48px] bg-[var(--color-kumo-canvas)] border-t border-[var(--color-kumo-line)] px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--text-color-kumo-default)]">
            <Link
              href="/portal"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Account Portal
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <Link
              href="/portal?tab=credits"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Billing & Invoices
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <Link
              href="/"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              3D Catalog
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <span className="text-[var(--text-color-kumo-subtle)]">
              © 2026 Onflow Asia Co., Ltd.
            </span>
          </footer>
        </div>
      </div>

      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="kumo-portal min-h-screen w-full bg-[var(--color-kumo-canvas)] flex items-center justify-center text-[13px] text-[var(--text-color-kumo-subtle)]">
          Loading checkout...
        </div>
      }
    >
      <PaymentGatewayContent />
    </Suspense>
  );
}
