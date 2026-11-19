"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
    tagline: "Most popular choice",
  },
  {
    id: "pkg-360",
    name: "Popular",
    credits: 360,
    bonus: 50,
    originalPriceVnd: 920000,
    priceVnd: 849599,
    tagline: "Most popular choice",
    badge: "Most popular",
  },
  {
    id: "pkg-750",
    name: "Professional",
    credits: 750,
    bonus: 150,
    originalPriceVnd: 1850000,
    priceVnd: 1650000,
    tagline: "Best value for professionals",
  },
  {
    id: "pkg-1500",
    name: "Enterprise",
    credits: 1500,
    bonus: 350,
    originalPriceVnd: 1850000,
    priceVnd: 1650000,
    tagline: "Best value for professionals",
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
    addressLine2: "Ho Chi Minh City, Vietnam 70000",
    country: "Vietnam",
    state: "Ho Chi Minh City",
    city: "District 1",
    zipCode: "70000",
    phoneCode: "+84",
    phone: "293 8373 82",
    email: "asdaskhd@gmail.com",
  },
  {
    id: "addr-2",
    label: "Office Address",
    isDefault: false,
    fullName: "David Nguyen",
    firstName: "David",
    lastName: "Nguyen",
    addressLine1: "102/13 No.2 St., Quarter No. 4, Phu Thuan Ward",
    addressLine2: "Ho Chi Minh City, Vietnam 70000",
    country: "Vietnam",
    state: "Ho Chi Minh City",
    city: "District 7",
    zipCode: "70000",
    phoneCode: "+84",
    phone: "908 112 233",
    email: "dev@onflow.asia",
    companyName: "ONFLOW VIETNAM Co., LTD",
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
  const [language, setLanguage] = useState<"EN" | "VI">("EN");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync step when URL ?step= query parameter changes
  useEffect(() => {
    const param = searchParams.get("step");
    if (param) {
      setStep(formatStepFromParam(param));
    }
  }, [searchParams]);

  // Step 1 (D2): Credit Package State
  // Start with null so all 5 radio circles render unselected matching Figma D2,
  // while Order Summary shows the default Enterprise (1,500 / 350 / 3,100,000 VND) values.
  const [selectedPackageId, setSelectedPackageId] = useState<
    PackageOption["id"] | "custom" | null
  >(null);
  const [customCreditsInput, setCustomCreditsInput] = useState("");

  // Step 2 (D2.1): Billing & Address State
  const [addressTab, setAddressTab] = useState<"saved" | "new">("new");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(
    INITIAL_SAVED_ADDRESSES
  );
  const [selectedSavedAddressId, setSelectedSavedAddressId] =
    useState<string>("addr-1");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+84");
  const [dialDropdownOpen, setDialDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [country, setCountry] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [city, setCity] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
  const [openBillingDropdown, setOpenBillingDropdown] = useState<
    "country" | "state" | "city" | null
  >(null);
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>(
    {}
  );

  // Step 3 (D2.2): Payment Method State
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
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const [selectedBank, setSelectedBank] = useState("Vietcombank");
  const [momoPhone, setMomoPhone] = useState("0908 112 233");
  const [paypalEmail, setPaypalEmail] = useState("powercom2604@gmail.com");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Receipt & Balance State
  const [baseBalance] = useState(2686);
  const [transactionId] = useState("23e798234798");
  const [paymentTime] = useState("8/20/2025, 2:13:57 AM");
  const [purchaseDate] = useState("August 14, 2025");
  const [failureReason, setFailureReason] = useState("insufficient_funds");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Derive active order summary numbers
  const isDefaultEnterpriseState =
    selectedPackageId === null || selectedPackageId === "pkg-1500";

  const orderSummary = React.useMemo(() => {
    if (isDefaultEnterpriseState) {
      return {
        packageName: "Enterprise",
        purchaseCredits: 1500,
        bonusCredits: 350,
        subtotalVnd: 2870370,
        vatVnd: 229630,
        totalVnd: 3100000,
        newBalance: 3099,
      };
    }

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
        packageName: "Custom Package",
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
  }, [isDefaultEnterpriseState, selectedPackageId, customCreditsInput, baseBalance]);

  const customEquivalentVnd = React.useMemo(() => {
    const parsed = parseInt(customCreditsInput.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) return 1650000;
    return parsed * 2200;
  }, [customCreditsInput]);

  // Recipient & payment method display labels for receipt
  const recipientDisplay = React.useMemo(() => {
    if (addressTab === "saved") {
      const addr =
        savedAddresses.find((a) => a.id === selectedSavedAddressId) ||
        savedAddresses[0];
      return addr.fullName.replace(/[()]/g, "");
    }
    const combined = `${firstName.trim()} ${lastName.trim()}`.trim();
    return combined || "Maxwell Thai Viet";
  }, [addressTab, savedAddresses, selectedSavedAddressId, firstName, lastName]);

  const paymentMethodLabel = React.useMemo(() => {
    if (selectedPaymentMethod === "saved-card") {
      const card =
        savedCards.find((c) => c.id === selectedSavedCardId) || savedCards[0];
      return `Credit Card - ${card.brand} ${card.last4}`;
    }
    if (selectedPaymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      const last4 = digits.length >= 4 ? digits.slice(-4) : "8228";
      return `Credit Card - VISA ${last4}`;
    }
    if (selectedPaymentMethod === "banking") {
      return `Online Banking - ${selectedBank}`;
    }
    if (selectedPaymentMethod === "momo") {
      return "Momo E-wallet";
    }
    return "PayPal";
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
    const paramMap: Record<CheckoutStep, string> = {
      package: "d2",
      billing: "d2.1",
      payment: "d2.2",
      "receipt-success": "d2.3",
      "receipt-failed": "failed",
    };
    router.replace(`/payment?step=${paramMap[next]}`, { scroll: true });
  };

  // Handle Step 1 -> Step 2
  const handleSelectPackageNext = () => {
    if (
      selectedPackageId === "custom" &&
      (parseInt(customCreditsInput.replace(/\D/g, ""), 10) || 0) <= 0
    ) {
      showToast("Please enter a valid number of credits for custom purchase.");
      return;
    }
    navigateStep("billing");
  };

  // Load saved address into editor
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

  // Handle Step 2 -> Step 3
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

  // Format Card Number with spaces every 4 digits
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    setCardErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  // Format Expiration MM/YY
  const handleExpirationChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    const formatted =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setCardExpiration(formatted);
    setCardErrors((prev) => ({ ...prev, cardExpiration: "" }));
  };

  // Live masked card number on Matte Black preview
  const matteCardDigitsDisplay = React.useMemo(() => {
    const digits = cardNumber.replace(/\D/g, "");
    if (!digits) return "**** - **** - **** - 8288";
    const padded = digits.padEnd(16, "*");
    const groups = [
      padded.slice(0, 4),
      padded.slice(4, 8),
      padded.slice(8, 12),
      padded.slice(12, 16),
    ];
    return `${groups[0].replace(/\d/g, "*")} - ${groups[1].replace(
      /\d/g,
      "*"
    )} - ${groups[2].replace(/\d/g, "*")} - ${groups[3]}`;
  }, [cardNumber]);

  // Handle Step 3 -> Step 4 (Complete Payment)
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
            holderName: (cardHolderName || "YOUR NAME").toUpperCase(),
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
      // Cards ending in 0000 or CVV 000 trigger Payment Failed state
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

  // Download Receipt Handler
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
      `License Terms:    Standard License`,
      `License Owner:    Onflow Co., Ltd`,
      "========================================",
      "Protected with 256-bit SSL encryption",
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

  // Process Bar State Calculations
  const step1Done =
    step === "billing" ||
    step === "payment" ||
    step === "receipt-success" ||
    step === "receipt-failed";
  const step2ActiveOrDone =
    step === "payment" ||
    step === "receipt-success" ||
    step === "receipt-failed";
  const step2Done = step === "receipt-success" || step === "receipt-failed";
  const step3Active = step === "receipt-success" || step === "receipt-failed";

  // Available states & cities based on selections
  const availableStates = country ? Object.keys(LOCATION_DATA[country] || {}) : [];
  const availableCities =
    country && stateProvince
      ? LOCATION_DATA[country]?.[stateProvince] || []
      : [];

  return (
    <div
      className="bg-[#f0f0f0] min-h-screen w-full flex flex-col items-center overflow-x-hidden"
      data-node-id={
        step === "package"
          ? "1220:12042"
          : step === "billing"
          ? "1220:12071"
          : step === "payment"
          ? "1220:12088"
          : step === "receipt-success"
          ? "1220:12117"
          : "1220:12132"
      }
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-[72px] right-5 z-50 bg-[#19213d] text-white px-4 py-2.5 rounded-[10px] shadow-lg flex items-center gap-2.5 text-[13px] font-medium">
          <span className="size-2 rounded-full bg-[#008f1f] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-[1920px] min-h-screen flex flex-col relative bg-[#f0f0f0]">
        {/* Sticky Top Header (60px height, matches Figma 1220:12043) */}
        <header
          className="bg-white h-[60px] w-full flex items-center justify-between px-[20px] lg:px-[36px] py-[10px] shrink-0 sticky top-0 z-30"
          data-node-id="1220:12043"
          data-name="Header"
        >
          {/* Left: Logo + Nav + Search */}
          <div className="flex gap-[20px] xl:gap-[78px] items-center relative shrink-0 lg:flex-1 lg:max-w-[1150.673px]">
            <Link
              href="/"
              aria-label="Onflow Asia Home"
              className="h-[36px] relative shrink-0 w-[124px] block"
              data-name="Logo"
            >
              <div className="absolute inset-[0_4%_3.13%_0]">
                <div className="absolute inset-[0_-2.53%_-0.36%_1.44%]">
                  <img
                    alt="Onflow Asia"
                    className="block max-w-none size-full"
                    src="/assets/payment/2d777.svg"
                    width={120.34}
                    height={35}
                  />
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 relative shrink-0">
              {[
                { label: "Gallery", href: "/" },
                { label: "Pricing", href: "/payment" },
                { label: "Business", href: "/portal" },
                { label: "More", href: "/portal" },
              ].map((nav) => {
                const isSelected = nav.label === "Pricing";
                return (
                  <Link
                    key={nav.label}
                    href={nav.href}
                    className={`flex h-[32px] items-center justify-center px-[20px] xl:px-[32px] relative rounded-[10px] shrink-0 no-underline transition-colors ${
                      isSelected
                        ? "bg-[#f2f3f5]"
                        : "bg-transparent hover:bg-[#f6f7fa]"
                    }`}
                  >
                    <span
                      className={`flex flex-col font-nacelle justify-center leading-[24px] not-italic relative shrink-0 text-[14px] text-[#19213d] text-center whitespace-nowrap ${
                        isSelected ? "font-bold" : "font-normal"
                      }`}
                    >
                      {nav.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* SearchBar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="hidden md:block flex-1 h-[40px] min-w-[180px] max-w-[459px] overflow-hidden relative"
            >
              <div className="-translate-y-1/2 absolute bg-white border-[#a6a6a6] border-[0.5px] border-solid h-[40px] left-0 right-0 rounded-[20px] top-1/2 pointer-events-none" />
              <div className="-translate-y-1/2 absolute flex gap-[10px] h-[40px] items-center left-0 px-[20px] py-[10px] top-1/2 w-full">
                <div className="relative shrink-0 size-[20px]">
                  <img
                    alt=""
                    className="block max-w-none"
                    src="/assets/payment/0f371.svg"
                    width={20}
                    height={20}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent border-0 outline-none font-sans font-normal text-[15px] leading-[15px] text-[#19213d] placeholder:text-[#989898]"
                />
              </div>
            </form>
          </div>

          {/* Right: Action Buttons + Credits + User */}
          <div className="flex gap-[15px] xl:gap-[40px] items-center justify-end min-w-0 relative">
            <div className="hidden sm:flex gap-[15px] items-center justify-end relative shrink-0 w-[130px]">
              <Link
                href="/"
                aria-label="Bookmarks"
                className="relative shrink-0 size-[32px] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/payment/cc922.svg"
                  width={32}
                  height={32}
                />
              </Link>
              <button
                type="button"
                onClick={() => navigateStep("package")}
                aria-label="Shopping Cart"
                className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0 hover:opacity-80 transition-opacity"
              >
                <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[28px] top-1/2">
                  <img
                    alt=""
                    className="block max-w-none"
                    src="/assets/payment/192d8.svg"
                    width={28}
                    height={28}
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = language === "EN" ? "VI" : "EN";
                  setLanguage(next);
                  showToast(
                    next === "VI"
                      ? "Language set to Vietnamese (Tiếng Việt)"
                      : "Language set to English"
                  );
                }}
                aria-label="Language"
                title={`Language: ${language}`}
                className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0 hover:opacity-80 transition-opacity"
              >
                <div className="absolute inset-[12.5%]">
                  <div className="absolute inset-[-4.17%]">
                    <img
                      alt=""
                      className="block max-w-none"
                      src="/assets/payment/c563b.svg"
                      width={26}
                      height={26}
                    />
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-[10px] items-center justify-end relative shrink-0">
              <Link
                href="/portal?tab=credits"
                className="bg-[#eaeaea] hover:bg-[#dfe2e6] transition-colors flex flex-col h-[32px] items-start overflow-hidden px-[20px] py-[8px] relative rounded-[16px] shrink-0 no-underline"
              >
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                  <div className="col-start-1 row-start-1 flex flex-col font-sans font-normal justify-center ml-[19px] mt-0 not-italic relative text-[12px] text-[#19213d] whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">
                      {headerCreditsDisplay} Credits
                    </p>
                  </div>
                  <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[16px]">
                    <img
                      alt=""
                      className="block max-w-none"
                      src="/assets/payment/0242c.svg"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>
              </Link>
              <Link
                href="/portal"
                aria-label="User Profile"
                className="relative shrink-0 size-[32px] hover:opacity-85 transition-opacity"
              >
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/payment/85e54.svg"
                  width={32}
                  height={32}
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex flex-1 flex-col items-center px-4 sm:px-8 xl:px-[187px] py-[40px] relative w-full">
          <div
            className={`flex flex-col items-center relative w-full ${
              step === "receipt-success" || step === "receipt-failed"
                ? "gap-[10px]"
                : "gap-[20px]"
            }`}
          >
            {/* Process Bar + SSL Encryption Sub-bar */}
            <div className="flex flex-col gap-[20px] items-center relative shrink-0 w-full max-w-[1268px]">
              {/* 3-Step Process Bar (969.75px wide) */}
              <div
                className="flex items-center relative shrink-0 w-full max-w-[969.75px]"
                data-name="Process Bar"
              >
                {/* Step 1: Billing Information */}
                <button
                  type="button"
                  onClick={() =>
                    navigateStep(step === "billing" ? "package" : "billing")
                  }
                  className="flex flex-1 flex-col gap-[5px] h-[49px] items-start min-w-0 relative bg-transparent border-0 p-0 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between px-[8px] py-[4px] relative shrink-0 w-full">
                    <div className="bg-[#004bda] overflow-hidden relative rounded-[51px] shrink-0 size-[28px]">
                      {step1Done ? (
                        <div className="absolute inset-[21.43%]">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/45ad7.svg"
                            width={16}
                            height={16}
                          />
                        </div>
                      ) : (
                        <span className="absolute font-sans font-normal leading-normal left-[10px] text-[14px] text-white top-[5px] whitespace-nowrap">
                          1
                        </span>
                      )}
                    </div>
                    <span className="absolute font-sans font-bold leading-normal left-[49px] text-[14px] text-[#004bda] top-[9px] whitespace-nowrap hidden sm:inline">
                      Billing Information
                    </span>
                  </div>
                  <div className="bg-[#004bda] h-[8px] relative rounded-bl-[4px] rounded-tl-[4px] shrink-0 w-full" />
                </button>

                {/* Step 2: Payment Method */}
                <button
                  type="button"
                  onClick={() => navigateStep("payment")}
                  className="flex flex-1 flex-col gap-[5px] h-[49px] items-start min-w-0 relative bg-transparent border-0 p-0 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between px-[8px] py-[4px] relative shrink-0 w-full">
                    <div
                      className={`overflow-hidden relative rounded-[51px] shrink-0 size-[28px] ${
                        step2ActiveOrDone ? "bg-[#004bda]" : "bg-[#9f9f9f]"
                      }`}
                    >
                      {step2Done ? (
                        <div className="absolute inset-[21.43%]">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/45ad7.svg"
                            width={16}
                            height={16}
                          />
                        </div>
                      ) : (
                        <span
                          className={`absolute font-sans font-normal leading-normal left-[10px] text-[14px] top-[5px] whitespace-nowrap ${
                            step2ActiveOrDone ? "text-white" : "text-[#616161]"
                          }`}
                        >
                          2
                        </span>
                      )}
                    </div>
                    <span
                      className={`absolute font-sans font-bold leading-normal left-[49px] text-[14px] top-[9px] whitespace-nowrap hidden sm:inline ${
                        step2ActiveOrDone ? "text-[#004bda]" : "text-[#9f9f9f]"
                      }`}
                    >
                      Payment Method
                    </span>
                  </div>
                  <div
                    className={`h-[8px] relative shrink-0 w-full ${
                      step2ActiveOrDone ? "bg-[#004bda]" : "bg-[#9f9f9f]"
                    }`}
                  />
                </button>

                {/* Step 3: Receipt Page */}
                <button
                  type="button"
                  onClick={() =>
                    navigateStep(
                      step === "receipt-success"
                        ? "receipt-failed"
                        : "receipt-success"
                    )
                  }
                  className="flex flex-1 flex-col gap-[5px] h-[49px] items-start min-w-0 relative bg-transparent border-0 p-0 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between px-[8px] py-[4px] relative shrink-0 w-full">
                    <div
                      className={`overflow-hidden relative rounded-[51px] shrink-0 size-[28px] ${
                        step3Active ? "bg-[#004bda]" : "bg-[#9f9f9f]"
                      }`}
                    >
                      <span
                        className={`absolute font-sans font-normal leading-normal left-[10px] text-[14px] top-[5px] whitespace-nowrap ${
                          step3Active ? "text-white" : "text-[#616161]"
                        }`}
                      >
                        3
                      </span>
                    </div>
                    <span
                      className={`absolute font-sans font-bold leading-normal left-[49px] text-[14px] top-[9px] whitespace-nowrap hidden sm:inline ${
                        step3Active ? "text-[#004bda]" : "text-[#9f9f9f]"
                      }`}
                    >
                      Receipt Page
                    </span>
                  </div>
                  <div
                    className={`h-[8px] relative rounded-br-[4px] rounded-tr-[4px] shrink-0 w-full ${
                      step3Active ? "bg-[#004bda]" : "bg-[#9f9f9f]"
                    }`}
                  />
                </button>
              </div>

              {/* Secured by SSL encryption */}
              <div className="flex items-center justify-center py-[6px] relative shrink-0 w-full">
                <div className="flex gap-[6px] items-center justify-center relative shrink-0">
                  <div className="relative shrink-0 size-[16px]">
                    <div className="absolute inset-[-3.12%_-3.12%_-3.13%_-3.13%]">
                      <img
                        alt=""
                        className="block max-w-none"
                        src="/assets/payment/b166c.svg"
                        width={17}
                        height={17}
                      />
                    </div>
                  </div>
                  <p className="font-sans font-normal leading-normal text-[#919191] text-[14px] whitespace-nowrap m-0">
                    Secured by SSL encryption
                  </p>
                </div>
              </div>
            </div>

            {/* Two-Column Checkout Content */}
            <div className="flex flex-col lg:flex-row gap-[14px] items-start justify-center relative shrink-0 w-full">
              {/* ================================================================ */}
              {/* SCREEN 1: [D2] Billing Information 1 — Choose Credit Package     */}
              {/* ================================================================ */}
              {step === "package" && (
                <div className="flex flex-col gap-[20px] items-start relative shrink-0 w-full lg:w-[648px]">
                  <div className="bg-white drop-shadow-[4px_5px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[25px] items-start px-[20px] sm:px-[34px] py-[31px] relative rounded-[10px] shrink-0 w-full">
                    {/* Title Header */}
                    <div className="flex flex-col gap-[12px] items-start relative shrink-0 max-w-[308px]">
                      <div className="flex gap-[9px] items-center relative shrink-0 w-full">
                        <div className="relative shrink-0 size-[24px]">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/714ad.svg"
                            width={24}
                            height={24}
                          />
                        </div>
                        <h1 className="font-sans font-bold text-[20px] leading-[22px] text-[#19213d] m-0 whitespace-nowrap">
                          Choose your credit package
                        </h1>
                      </div>
                      <p className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d] m-0">
                        Select the perfect package for your needs
                      </p>
                    </div>

                    {/* Package Grid + Custom Purchase */}
                    <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] w-full lg:w-[580px]">
                        {PACKAGES.map((pkg) => {
                          const isSelected = selectedPackageId === pkg.id;
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setSelectedPackageId(pkg.id)}
                              className={`relative h-[228px] w-full sm:w-[285px] bg-white rounded-[10px] border border-solid cursor-pointer transition-colors p-0 text-center ${
                                isSelected
                                  ? "border-[#004bda] ring-1 ring-[#004bda]"
                                  : "border-[#c9c9c9] hover:border-[#004bda]/60"
                              }`}
                            >
                              {pkg.badge && (
                                <div className="absolute bg-[#004bda] h-[16px] left-1/2 -translate-x-1/2 rounded-[10px] top-[-9px] w-[130px] flex items-center justify-center z-10">
                                  <span className="font-sans font-normal text-[10px] leading-[15.6px] text-white whitespace-nowrap">
                                    {pkg.badge}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col gap-[20px] h-full items-center justify-center pb-[20px] pt-[40px] px-[20px] rounded-[10px] overflow-hidden">
                                {/* Credits + Bonus */}
                                <div className="flex flex-col gap-[20px] items-center justify-center w-full">
                                  <div className="flex gap-[6px] items-center">
                                    <div className="relative shrink-0 size-[20px]">
                                      <img
                                        alt=""
                                        className="block max-w-none"
                                        src="/assets/payment/23750.svg"
                                        width={20}
                                        height={20}
                                      />
                                    </div>
                                    <div className="flex gap-[3px] items-start leading-none whitespace-nowrap">
                                      <span className="font-sans font-bold text-[20px] leading-[15.6px] text-[#19213d]">
                                        {pkg.credits.toLocaleString("en-US")}
                                      </span>
                                      <span className="font-sans font-normal text-[10px] leading-[15.6px] text-[rgba(25,33,61,0.7)]">
                                        credits
                                      </span>
                                    </div>
                                  </div>

                                  {pkg.bonus > 0 && (
                                    <span className="font-sans font-normal text-[12px] leading-[15.6px] text-[#008f1f] whitespace-nowrap">
                                      +{pkg.bonus} bonus credits
                                    </span>
                                  )}
                                </div>

                                {/* Prices + Tagline */}
                                <div className="flex flex-col gap-[15px] items-center text-center w-full">
                                  <div className="flex flex-col gap-[7px] items-center w-full">
                                    {pkg.originalPriceVnd && (
                                      <span className="font-sans italic font-normal text-[10px] leading-[15.6px] text-[rgba(25,33,61,0.7)] line-through">
                                        {formatVnd(pkg.originalPriceVnd)}
                                      </span>
                                    )}
                                    <span className="font-sans font-bold text-[14px] leading-[15.6px] text-[#002679]">
                                      {formatVnd(pkg.priceVnd)}
                                    </span>
                                  </div>
                                  <span className="font-sans font-normal text-[10px] leading-[15.6px] text-[rgba(25,33,61,0.7)]">
                                    {pkg.tagline}
                                  </span>
                                </div>

                                {/* Radio Circle */}
                                <div className="relative shrink-0 size-[18px]">
                                  <img
                                    alt=""
                                    className="block max-w-none"
                                    src={
                                      isSelected
                                        ? "/assets/payment/fcfd1.svg"
                                        : "/assets/payment/86102.svg"
                                    }
                                    width={18}
                                    height={18}
                                  />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Purchase Card */}
                      <div
                        onClick={() => setSelectedPackageId("custom")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedPackageId("custom");
                          }
                        }}
                        className={`bg-white border border-solid flex flex-col sm:flex-row gap-[20px] sm:gap-[36px] items-start sm:items-stretch p-[16px] relative rounded-[10px] shrink-0 w-full cursor-pointer transition-colors ${
                          selectedPackageId === "custom"
                            ? "border-[#004bda] ring-1 ring-[#004bda]"
                            : "border-[#c9c9c9] hover:border-[#004bda]/60"
                        }`}
                      >
                        <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full sm:w-[322px]">
                          <div className="flex gap-[10px] items-center relative shrink-0">
                            <div className="relative shrink-0 size-[18px]">
                              <img
                                alt=""
                                className="block max-w-none"
                                src={
                                  selectedPackageId === "custom"
                                    ? "/assets/payment/fcfd1.svg"
                                    : "/assets/payment/86102.svg"
                                }
                                width={18}
                                height={18}
                              />
                            </div>
                            <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d]">
                              Custom purchase?
                            </span>
                          </div>

                          <div className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center overflow-hidden px-[16px] py-[10px] relative rounded-[10px] w-full">
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
                              placeholder="Enter number of credit"
                              className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                            />
                            <div className="relative shrink-0 size-[20px]">
                              <img
                                alt=""
                                className="block max-w-none"
                                src="/assets/payment/23750.svg"
                                width={20}
                                height={20}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-[2px] items-start justify-end py-[5px] relative shrink-0">
                          <span className="font-sans font-normal text-[10px] leading-[15.6px] text-[#19213d]">
                            Equivalent
                          </span>
                          <span className="font-sans font-bold text-[14px] leading-[15.6px] text-[#002679] whitespace-nowrap">
                            {formatVnd(customEquivalentVnd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Buttons */}
                  <div className="drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] flex items-center justify-end relative shrink-0 w-full">
                    <button
                      type="button"
                      onClick={handleSelectPackageNext}
                      className="bg-[#004bda] hover:bg-[#003cb3] transition-colors cursor-pointer flex gap-[9px] h-[40px] items-center justify-center overflow-hidden px-[24px] rounded-[10px] shrink-0 border-0"
                    >
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-white whitespace-nowrap">
                        Select Package
                      </span>
                      <div className="h-[24px] relative shrink-0 w-[11px]">
                        <img
                          alt=""
                          className="block max-w-none"
                          src="/assets/payment/6e2ac.svg"
                          width={11}
                          height={24}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SCREEN 2: [D2.1] Billing Information 2 — Addresses & Form        */}
              {/* ================================================================ */}
              {step === "billing" && (
                <div className="flex flex-col gap-[20px] items-start relative shrink-0 w-full lg:w-[838px]">
                  <div className="bg-white flex flex-col gap-[40px] items-center overflow-visible p-[20px] sm:p-[32px] relative rounded-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] shrink-0 w-full min-h-[705px]">
                    {/* Pill Switcher: Saved Addresses vs Enter New Address */}
                    <div className="bg-[#e6e6e6] flex gap-[5px] h-[50px] items-center p-[5px] relative rounded-[61px] shrink-0 w-full max-w-[749px]">
                      <button
                        type="button"
                        onClick={() => setAddressTab("saved")}
                        className={`flex-1 h-full rounded-[24px] border-0 cursor-pointer transition-colors font-sans font-normal text-[14px] text-[#19213d] ${
                          addressTab === "saved" ? "bg-white" : "bg-[#e6e6e6]"
                        }`}
                      >
                        Saved Addresses ({savedAddresses.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressTab("new")}
                        className={`flex-1 h-full rounded-[24px] border-0 cursor-pointer transition-colors font-sans font-normal text-[14px] text-[#19213d] ${
                          addressTab === "new" ? "bg-white" : "bg-[#e6e6e6]"
                        }`}
                      >
                        Enter New Address
                      </button>
                    </div>

                    {/* Tab 1: Saved Addresses (2) */}
                    {addressTab === "saved" && (
                      <div className="flex flex-col gap-[16px] items-start w-full max-w-[749px]">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedSavedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedSavedAddressId(addr.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedSavedAddressId(addr.id);
                                }
                              }}
                              className={`bg-white border border-solid flex min-h-[173px] items-start justify-between pb-[20px] pt-[15px] px-[16px] relative rounded-[10px] w-full cursor-pointer transition-colors ${
                                isSelected
                                  ? "border-[#004bda] ring-1 ring-[#004bda]"
                                  : "border-[#c9c9c9] hover:border-[#004bda]/60"
                              }`}
                            >
                              <div className="flex gap-[7px] items-start relative shrink-0">
                                <div className="relative shrink-0 size-[18px] mt-[1px]">
                                  <img
                                    alt=""
                                    className="block max-w-none"
                                    src={
                                      isSelected
                                        ? "/assets/payment/fcfd1.svg"
                                        : "/assets/payment/86102.svg"
                                    }
                                    width={18}
                                    height={18}
                                  />
                                </div>
                                <div className="flex flex-col gap-[20px] items-start relative shrink-0">
                                  <div className="flex gap-[14px] items-center">
                                    <span className="font-sans font-normal text-[14px] text-[#19213d]">
                                      {addr.label}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="border-[0.8px] border-[#004bda] border-solid flex h-[19px] items-center justify-center px-[9px] py-[2px] rounded-[10px] font-sans font-normal text-[10px] text-[#004bda]">
                                        Default
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-[14px] items-start w-full">
                                    <p className="font-sans font-medium text-[14px] text-[#19213d] m-0">
                                      {addr.fullName}
                                    </p>
                                    <div className="flex flex-col gap-[10px] items-start text-[14px] text-[rgba(25,33,61,0.7)]">
                                      <div className="flex gap-[17px] items-start">
                                        <div className="relative shrink-0 size-[12px] mt-[3px] flex items-center justify-center">
                                          <img
                                            alt=""
                                            className="block max-w-none"
                                            src="/assets/payment/a07e4.svg"
                                            width={9}
                                            height={12}
                                          />
                                        </div>
                                        <div className="font-sans font-normal leading-[normal]">
                                          <p className="m-0">
                                            {addr.addressLine1}
                                          </p>
                                          <p className="m-0">
                                            {addr.addressLine2}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-[17px] items-center">
                                        <div className="relative shrink-0 size-[12px] flex items-center justify-center">
                                          <img
                                            alt=""
                                            className="block max-w-none"
                                            src="/assets/payment/3e7ba.svg"
                                            width={8}
                                            height={12}
                                          />
                                        </div>
                                        <span className="font-sans font-normal">
                                          {addr.phoneCode} {addr.phone}
                                        </span>
                                      </div>
                                      <div className="flex gap-[17px] items-center">
                                        <div className="h-[9px] relative shrink-0 w-[12px]">
                                          <img
                                            alt=""
                                            className="block max-w-none"
                                            src="/assets/payment/5b9a9.svg"
                                            width={12}
                                            height={9}
                                          />
                                        </div>
                                        <span className="font-sans font-normal">
                                          {addr.email}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSavedAddress(addr);
                                }}
                                aria-label={`Edit ${addr.label}`}
                                className="relative shrink-0 size-[24px] bg-transparent border-0 p-0 cursor-pointer hover:opacity-75"
                              >
                                <div className="absolute left-[8.5px] size-[15px] top-0">
                                  <div className="absolute inset-[0_-17.5%_-40%_-17.5%]">
                                    <img
                                      alt=""
                                      className="block max-w-none size-full"
                                      src="/assets/payment/aeebe.svg"
                                    />
                                  </div>
                                </div>
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
                          className="w-full border border-dashed border-[#c9c9c9] hover:border-[#004bda] rounded-[10px] py-[14px] text-[#004bda] text-[13px] font-medium bg-transparent cursor-pointer transition-colors"
                        >
                          + Add New Billing Address
                        </button>
                      </div>
                    )}

                    {/* Tab 2: Enter New Address (Default view matching Figma D2.1) */}
                    {addressTab === "new" && (
                      <div className="flex flex-col gap-[30px] items-start w-full max-w-[774px]">
                        {/* Contact Information */}
                        <div className="flex flex-col gap-[30px] items-start w-full">
                          <div className="flex font-sans font-bold gap-[5px] items-center text-[16px] whitespace-nowrap">
                            <span className="leading-[15.6px] text-[#19213d]">
                              Contact Information
                            </span>
                            <span className="leading-[15.6px] text-[#e35f00]">
                              *
                            </span>
                          </div>

                          <div className="flex flex-col gap-[20px] items-start w-full">
                            {/* First Name + Last Name */}
                            <div className="flex flex-col sm:flex-row gap-[20px] items-start w-full">
                              <div className="flex flex-col gap-[8px] items-start w-full sm:w-[362px]">
                                <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                  <span className="leading-[15.6px] text-[#19213d]">
                                    First Name
                                  </span>
                                  <span className="leading-[15.6px] text-[#e35f00]">
                                    *
                                  </span>
                                </label>
                                <div className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center overflow-hidden px-[16px] py-[10px] rounded-[10px] w-full">
                                  <div className="h-[20px] relative shrink-0 w-[24px] flex items-center justify-center">
                                    <img
                                      alt=""
                                      className="block max-w-none"
                                      src="/assets/payment/63e75.svg"
                                      width={15.33}
                                      height={17}
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => {
                                      setFirstName(e.target.value);
                                      setBillingErrors((p) => ({
                                        ...p,
                                        firstName: "",
                                      }));
                                    }}
                                    placeholder="Enter your first name"
                                    className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                  />
                                </div>
                                {billingErrors.firstName && (
                                  <span className="text-[11px] text-[#d92d20]">
                                    {billingErrors.firstName}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col gap-[8px] items-start w-full sm:w-[392px]">
                                <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                  <span className="leading-[15.6px] text-[#19213d]">
                                    Last Name
                                  </span>
                                  <span className="leading-[15.6px] text-[#e35f00]">
                                    *
                                  </span>
                                </label>
                                <div className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center overflow-hidden px-[16px] py-[10px] rounded-[10px] w-full">
                                  <div className="h-[20px] relative shrink-0 w-[24px] flex items-center justify-center">
                                    <img
                                      alt=""
                                      className="block max-w-none"
                                      src="/assets/payment/63e75.svg"
                                      width={15.33}
                                      height={17}
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => {
                                      setLastName(e.target.value);
                                      setBillingErrors((p) => ({
                                        ...p,
                                        lastName: "",
                                      }));
                                    }}
                                    placeholder="Enter your last name"
                                    className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                  />
                                </div>
                                {billingErrors.lastName && (
                                  <span className="text-[11px] text-[#d92d20]">
                                    {billingErrors.lastName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Phone Number + Mail */}
                            <div className="flex flex-col sm:flex-row gap-[20px] items-start w-full">
                              <div className="flex flex-col gap-[8px] items-start w-full sm:w-[430px] relative">
                                <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                  <span className="leading-[15.6px] text-[#19213d]">
                                    Phone Number
                                  </span>
                                  <span className="leading-[15.6px] text-[#e35f00]">
                                    *
                                  </span>
                                </label>
                                <div className="drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] flex gap-[5px] items-center w-full relative">
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDialDropdownOpen(!dialDropdownOpen)
                                      }
                                      className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center justify-center p-[10px] rounded-[10px] shrink-0 border-0 cursor-pointer"
                                    >
                                      <div className="relative shrink-0 size-[20px]">
                                        <img
                                          alt=""
                                          className="block max-w-none"
                                          src="/assets/payment/b891f.svg"
                                          width={20}
                                          height={20}
                                        />
                                      </div>
                                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d] whitespace-nowrap">
                                        {phoneCode}
                                      </span>
                                      <div className="relative shrink-0 size-[16px]">
                                        <img
                                          alt=""
                                          className="block max-w-none"
                                          src="/assets/payment/85dc3.svg"
                                          width={16}
                                          height={16}
                                        />
                                      </div>
                                    </button>
                                    {dialDropdownOpen && (
                                      <div className="absolute left-0 top-[44px] bg-white border border-[#c9c9c9] rounded-[10px] shadow-lg py-1 min-w-[170px] z-30">
                                        {PHONE_DIAL_CODES.map((dc) => (
                                          <button
                                            key={dc.code}
                                            type="button"
                                            onClick={() => {
                                              setPhoneCode(dc.code);
                                              setDialDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-[12px] text-[#19213d] hover:bg-black/[0.04] bg-transparent border-0 cursor-pointer flex justify-between"
                                          >
                                            <span>{dc.country}</span>
                                            <span className="font-semibold">
                                              {dc.code}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="bg-[#e6e6e6] flex flex-1 h-[40px] items-center overflow-hidden px-[22px] py-[10px] rounded-[10px]">
                                    <input
                                      type="tel"
                                      value={phoneNumber}
                                      onChange={(e) => {
                                        setPhoneNumber(e.target.value);
                                        setBillingErrors((p) => ({
                                          ...p,
                                          phoneNumber: "",
                                        }));
                                      }}
                                      placeholder="Enter your phone number"
                                      className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                    />
                                  </div>
                                </div>
                                {billingErrors.phoneNumber && (
                                  <span className="text-[11px] text-[#d92d20]">
                                    {billingErrors.phoneNumber}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col gap-[8px] items-start w-full sm:w-[322px]">
                                <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                  <span className="leading-[15.6px] text-[#19213d]">
                                    Mail
                                  </span>
                                  <span className="leading-[15.6px] text-[#e35f00]">
                                    *
                                  </span>
                                </label>
                                <div className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center overflow-hidden px-[16px] py-[10px] rounded-[10px] w-full">
                                  <div className="h-[20px] relative shrink-0 w-[24px]">
                                    <img
                                      alt=""
                                      className="block max-w-none"
                                      src="/assets/payment/0324a.svg"
                                      width={24}
                                      height={20}
                                    />
                                  </div>
                                  <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                      setEmail(e.target.value);
                                      setBillingErrors((p) => ({
                                        ...p,
                                        email: "",
                                      }));
                                    }}
                                    placeholder="Enter mail address"
                                    className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                  />
                                </div>
                                {billingErrors.email && (
                                  <span className="text-[11px] text-[#d92d20]">
                                    {billingErrors.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Billing Information */}
                        <div className="flex flex-col gap-[20px] items-start w-full">
                          <div className="flex flex-col gap-[30px] items-start w-full">
                            <div className="flex font-sans font-bold gap-[5px] items-center text-[16px] whitespace-nowrap">
                              <span className="leading-[15.6px] text-[#19213d]">
                                Billing Information
                              </span>
                              <span className="leading-[15.6px] text-[#e35f00]">
                                *
                              </span>
                            </div>

                            <div className="flex flex-col gap-[20px] items-start w-full">
                              {/* Company Name + VAT Number */}
                              <div className="flex flex-col sm:flex-row gap-[20px] items-start w-full">
                                <div className="flex flex-col gap-[8px] items-start w-full sm:w-[534px]">
                                  <label className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d]">
                                    Company Name (optional)
                                  </label>
                                  <div className="bg-[#e6e6e6] flex h-[40px] items-center overflow-hidden px-[16px] py-[10px] rounded-[10px] w-full">
                                    <input
                                      type="text"
                                      value={companyName}
                                      onChange={(e) =>
                                        setCompanyName(e.target.value)
                                      }
                                      placeholder="Enter company name"
                                      className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-[8px] items-start w-full sm:w-[220px]">
                                  <label className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d]">
                                    VAT Number (optional)
                                  </label>
                                  <div className="bg-[#e6e6e6] flex h-[40px] items-center overflow-hidden px-[16px] py-[10px] rounded-[10px] w-full">
                                    <input
                                      type="text"
                                      value={vatNumber}
                                      onChange={(e) =>
                                        setVatNumber(e.target.value)
                                      }
                                      placeholder="Enter VAT Number"
                                      className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Country + State/Province + City */}
                              <div className="flex flex-col sm:flex-row gap-[20px] items-start w-full">
                                {/* Country */}
                                <div className="flex flex-col gap-[8px] items-start w-full sm:w-[255px] relative">
                                  <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                    <span className="leading-[15.6px] text-[#19213d]">
                                      Country
                                    </span>
                                    <span className="leading-[15.6px] text-[#e35f00]">
                                      *
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenBillingDropdown(
                                        openBillingDropdown === "country"
                                          ? null
                                          : "country"
                                      )
                                    }
                                    className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center justify-between px-[16px] py-[10px] rounded-[10px] w-full border-0 cursor-pointer text-left"
                                  >
                                    <span
                                      className={`font-sans font-normal text-[12px] leading-[15.6px] truncate ${
                                        country
                                          ? "text-[#19213d]"
                                          : "text-[#7b7b7b]"
                                      }`}
                                    >
                                      {country || "Select country"}
                                    </span>
                                    <div className="flex items-center justify-center shrink-0 size-[16px] rotate-90">
                                      <img
                                        alt=""
                                        className="block max-w-none"
                                        src="/assets/payment/9d29d.svg"
                                        width={16}
                                        height={16}
                                      />
                                    </div>
                                  </button>
                                  {openBillingDropdown === "country" && (
                                    <div className="absolute left-0 top-[68px] bg-white border border-[#c9c9c9] rounded-[10px] shadow-lg py-1 w-full z-30">
                                      {Object.keys(LOCATION_DATA).map((c) => (
                                        <button
                                          key={c}
                                          type="button"
                                          onClick={() => {
                                            setCountry(c);
                                            setStateProvince("");
                                            setCity("");
                                            setOpenBillingDropdown(null);
                                            setBillingErrors((p) => ({
                                              ...p,
                                              country: "",
                                            }));
                                          }}
                                          className="w-full text-left px-3 py-1.5 text-[12px] text-[#19213d] hover:bg-black/[0.04] bg-transparent border-0 cursor-pointer"
                                        >
                                          {c}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  {billingErrors.country && (
                                    <span className="text-[11px] text-[#d92d20]">
                                      {billingErrors.country}
                                    </span>
                                  )}
                                </div>

                                {/* State/Province */}
                                <div className="flex flex-col gap-[8px] items-start w-full sm:w-[259px] relative">
                                  <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                    <span className="leading-[15.6px] text-[#19213d]">
                                      State/ Province
                                    </span>
                                    <span className="leading-[15.6px] text-[#e35f00]">
                                      *
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!country) setCountry("Vietnam");
                                      setOpenBillingDropdown(
                                        openBillingDropdown === "state"
                                          ? null
                                          : "state"
                                      );
                                    }}
                                    className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center justify-between px-[16px] py-[10px] rounded-[10px] w-full border-0 cursor-pointer text-left"
                                  >
                                    <span
                                      className={`font-sans font-normal text-[12px] leading-[15.6px] truncate ${
                                        stateProvince
                                          ? "text-[#19213d]"
                                          : "text-[#7b7b7b]"
                                      }`}
                                    >
                                      {stateProvince || "Select state/ province"}
                                    </span>
                                    <div className="flex items-center justify-center shrink-0 size-[16px] rotate-90">
                                      <img
                                        alt=""
                                        className="block max-w-none"
                                        src="/assets/payment/9d29d.svg"
                                        width={16}
                                        height={16}
                                      />
                                    </div>
                                  </button>
                                  {openBillingDropdown === "state" && (
                                    <div className="absolute left-0 top-[68px] bg-white border border-[#c9c9c9] rounded-[10px] shadow-lg py-1 w-full z-30">
                                      {(availableStates.length > 0
                                        ? availableStates
                                        : Object.keys(LOCATION_DATA.Vietnam)
                                      ).map((st) => (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => {
                                            if (!country) setCountry("Vietnam");
                                            setStateProvince(st);
                                            setCity("");
                                            setOpenBillingDropdown(null);
                                            setBillingErrors((p) => ({
                                              ...p,
                                              country: "",
                                              stateProvince: "",
                                            }));
                                          }}
                                          className="w-full text-left px-3 py-1.5 text-[12px] text-[#19213d] hover:bg-black/[0.04] bg-transparent border-0 cursor-pointer"
                                        >
                                          {st}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  {billingErrors.stateProvince && (
                                    <span className="text-[11px] text-[#d92d20]">
                                      {billingErrors.stateProvince}
                                    </span>
                                  )}
                                </div>

                                {/* City */}
                                <div className="flex flex-col gap-[8px] items-start w-full sm:w-[220px] relative">
                                  <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                    <span className="leading-[15.6px] text-[#19213d]">
                                      City
                                    </span>
                                    <span className="leading-[15.6px] text-[#e35f00]">
                                      *
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!country) setCountry("Vietnam");
                                      if (!stateProvince) {
                                        setStateProvince("Ho Chi Minh City");
                                      }
                                      setOpenBillingDropdown(
                                        openBillingDropdown === "city"
                                          ? null
                                          : "city"
                                      );
                                    }}
                                    className="bg-[#e6e6e6] flex gap-[10px] h-[40px] items-center justify-between px-[16px] py-[10px] rounded-[10px] w-full border-0 cursor-pointer text-left"
                                  >
                                    <span
                                      className={`font-sans font-normal text-[12px] leading-[15.6px] truncate ${
                                        city ? "text-[#19213d]" : "text-[#7b7b7b]"
                                      }`}
                                    >
                                      {city || "Select city"}
                                    </span>
                                    <div className="flex items-center justify-center shrink-0 size-[16px] rotate-90">
                                      <img
                                        alt=""
                                        className="block max-w-none"
                                        src="/assets/payment/9d29d.svg"
                                        width={16}
                                        height={16}
                                      />
                                    </div>
                                  </button>
                                  {openBillingDropdown === "city" && (
                                    <div className="absolute left-0 top-[68px] bg-white border border-[#c9c9c9] rounded-[10px] shadow-lg py-1 w-full z-30">
                                      {(availableCities.length > 0
                                        ? availableCities
                                        : LOCATION_DATA.Vietnam[
                                            "Ho Chi Minh City"
                                          ]
                                      ).map((ct) => (
                                        <button
                                          key={ct}
                                          type="button"
                                          onClick={() => {
                                            setCity(ct);
                                            setOpenBillingDropdown(null);
                                            setBillingErrors((p) => ({
                                              ...p,
                                              city: "",
                                            }));
                                          }}
                                          className="w-full text-left px-3 py-1.5 text-[12px] text-[#19213d] hover:bg-black/[0.04] bg-transparent border-0 cursor-pointer"
                                        >
                                          {ct}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  {billingErrors.city && (
                                    <span className="text-[11px] text-[#d92d20]">
                                      {billingErrors.city}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Address + ZIP Code */}
                              <div className="flex flex-col sm:flex-row gap-[20px] items-start w-full">
                                <div className="flex flex-col gap-[8px] items-start w-full sm:w-[562px]">
                                  <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                    <span className="leading-[15.6px] text-[#19213d]">
                                      Address
                                    </span>
                                    <span className="leading-[15.6px] text-[#e35f00]">
                                      *
                                    </span>
                                  </label>
                                  <div className="bg-[#e6e6e6] flex h-[40px] items-center overflow-hidden px-[16px] py-[10px] rounded-[10px] w-full">
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
                                      placeholder="Enter your detailed address"
                                      className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                    />
                                  </div>
                                  {billingErrors.detailedAddress && (
                                    <span className="text-[11px] text-[#d92d20]">
                                      {billingErrors.detailedAddress}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-col gap-[8px] items-start w-full sm:w-[192px]">
                                  <label className="flex font-sans font-normal gap-[4px] items-center text-[14px]">
                                    <span className="leading-[15.6px] text-[#19213d]">
                                      ZIP Code
                                    </span>
                                    <span className="leading-[15.6px] text-[#e35f00]">
                                      *
                                    </span>
                                  </label>
                                  <div className="bg-[#e6e6e6] flex h-[40px] items-center overflow-hidden px-[16px] py-[10px] rounded-[10px] w-full">
                                    <input
                                      type="text"
                                      value={zipCode}
                                      onChange={(e) => {
                                        setZipCode(e.target.value);
                                        setBillingErrors((p) => ({
                                          ...p,
                                          zipCode: "",
                                        }));
                                      }}
                                      placeholder="Enter your area ZIP Code"
                                      className="flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d] placeholder:text-[#7b7b7b]"
                                    />
                                  </div>
                                  {billingErrors.zipCode && (
                                    <span className="text-[11px] text-[#d92d20]">
                                      {billingErrors.zipCode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Save Checkbox + Validation Helper */}
                          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                            <label className="flex gap-[10px] items-center cursor-pointer">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={saveAddressForFuture}
                                onClick={() =>
                                  setSaveAddressForFuture(!saveAddressForFuture)
                                }
                                className={`flex items-center justify-center rounded-[5px] shrink-0 size-[16px] border-[0.5px] border-solid cursor-pointer p-0 transition-colors ${
                                  saveAddressForFuture
                                    ? "bg-[#004bda] border-[#004bda]"
                                    : "bg-white border-[#9e9e9e]"
                                }`}
                              >
                                {saveAddressForFuture && (
                                  <span className="text-white text-[10px] leading-none font-bold">
                                    ✓
                                  </span>
                                )}
                              </button>
                              <span className="font-sans font-normal leading-[18.2px] text-[12px] text-[#19213d]">
                                Saved this information for future order?
                              </span>
                            </label>

                            {Object.keys(billingErrors).length > 0 && (
                              <button
                                type="button"
                                onClick={handleUseDefaultAddress}
                                className="text-[12px] font-medium text-[#004bda] hover:underline bg-transparent border-0 cursor-pointer p-0"
                              >
                                Use Saved Default Address (Maxwell Viet) →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct Buttons */}
                  <div className="drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] flex items-center justify-between relative shrink-0 w-full">
                    <button
                      type="button"
                      onClick={() => navigateStep("package")}
                      className="bg-white hover:bg-[#f8f9fa] transition-colors cursor-pointer flex gap-[9px] h-[40px] items-center justify-center overflow-hidden px-[24px] rounded-[10px] shrink-0 border-0"
                    >
                      <div className="flex items-center justify-center rotate-180">
                        <div className="h-[24px] relative w-[11px]">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/cfe20.svg"
                            width={11}
                            height={24}
                          />
                        </div>
                      </div>
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                        Previous
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBillingNext}
                      className="bg-[#004bda] hover:bg-[#003cb3] transition-colors cursor-pointer flex gap-[9px] h-[40px] items-center justify-center overflow-hidden px-[24px] rounded-[10px] shrink-0 border-0"
                    >
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-white whitespace-nowrap">
                        Next Step
                      </span>
                      <div className="h-[24px] relative shrink-0 w-[11px]">
                        <img
                          alt=""
                          className="block max-w-none"
                          src="/assets/payment/6e2ac.svg"
                          width={11}
                          height={24}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SCREEN 3: [D2.2] Payment Method                                  */}
              {/* ================================================================ */}
              {step === "payment" && (
                <div className="flex flex-col gap-[20px] items-start relative shrink-0 w-full lg:w-[774px]">
                  <div className="flex flex-col gap-[40px] items-start relative shrink-0 w-full">
                    {/* Your Payment Methods */}
                    <div className="flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                      <span className="font-sans font-normal text-[15px] leading-[15.6px] text-[#19213d]">
                        Your Payment Methods
                      </span>

                      <div className="flex flex-col gap-[10px] w-full">
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
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedPaymentMethod("saved-card");
                                  setSelectedSavedCardId(card.id);
                                }
                              }}
                              className={`bg-white flex flex-col justify-center min-h-[60px] px-[25px] py-[17px] relative rounded-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] w-full cursor-pointer transition-colors ${
                                isSelected
                                  ? "border border-[rgba(25,33,61,0.7)]"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex gap-[27px] items-center">
                                  <div className="relative shrink-0 size-[26px]">
                                    <img
                                      alt=""
                                      className="block max-w-none"
                                      src={
                                        isSelected
                                          ? "/assets/payment/e82c2.svg"
                                          : "/assets/payment/f4536.svg"
                                      }
                                      width={26}
                                      height={26}
                                    />
                                  </div>
                                  <div className="flex gap-[15px] items-center">
                                    <div className="h-[24px] relative w-[37.2px] shrink-0">
                                      <div className="absolute bg-[#2666ac] border-[0.55px] border-black/10 border-solid inset-0 rounded-[2.198px]" />
                                      <span className="absolute inset-[16.67%_9.8%_16.66%_10.78%] font-bold italic text-[11.725px] leading-normal text-white text-center flex items-center justify-center">
                                        {card.brand}
                                      </span>
                                      <div className="absolute inset-[29.77%_77.8%_61.14%_9.45%]">
                                        <img
                                          alt=""
                                          className="block max-w-none size-full"
                                          src="/assets/payment/5a9fa.svg"
                                        />
                                      </div>
                                    </div>
                                    <span className="font-sans font-normal text-[14px] text-[#19213d] whitespace-nowrap">
                                      {card.brand} - {card.last4}
                                    </span>
                                  </div>
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
                                  aria-label={`Edit ${card.brand} ${card.last4}`}
                                  className="relative shrink-0 size-[24px] bg-transparent border-0 p-0 cursor-pointer hover:opacity-75"
                                >
                                  <div className="absolute inset-[0_-8.33%_-20.83%_-8.33%]">
                                    <img
                                      alt=""
                                      className="block max-w-none size-full"
                                      src="/assets/payment/4db7f.svg"
                                    />
                                  </div>
                                </button>
                              </div>

                              {isEditing && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-4 pt-3 border-t border-[#eaecf0] flex flex-wrap items-center gap-3"
                                >
                                  <input
                                    type="text"
                                    value={editCardHolder}
                                    onChange={(e) =>
                                      setEditCardHolder(e.target.value)
                                    }
                                    placeholder="Cardholder name"
                                    className="bg-[#e6e6e6] h-[34px] px-3 rounded-[8px] text-[12px] text-[#19213d] border-0 outline-none flex-1 min-w-[160px]"
                                  />
                                  <input
                                    type="text"
                                    value={editCardExpiry}
                                    onChange={(e) =>
                                      setEditCardExpiry(e.target.value)
                                    }
                                    placeholder="MM/YY"
                                    className="bg-[#e6e6e6] h-[34px] px-3 rounded-[8px] text-[12px] text-[#19213d] border-0 outline-none w-[90px]"
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
                                                expiry:
                                                  editCardExpiry || c.expiry,
                                              }
                                            : c
                                        )
                                      );
                                      setEditingCardId(null);
                                      showToast("Saved card updated.");
                                    }}
                                    className="bg-[#004bda] text-white text-[12px] font-medium px-3 h-[34px] rounded-[8px] border-0 cursor-pointer"
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

                    {/* Other Payment Methods */}
                    <div className="flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                      <span className="font-sans font-normal text-[15px] leading-[15.6px] text-[#19213d]">
                        Other Payment Methods
                      </span>

                      <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                        {/* 1. Credit / Debit Card */}
                        <div
                          onClick={() => setSelectedPaymentMethod("card")}
                          className={`bg-white flex flex-col gap-[27px] items-start px-[25px] py-[17px] relative rounded-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] w-full transition-colors ${
                            selectedPaymentMethod === "card"
                              ? "border border-[rgba(25,33,61,0.7)] border-solid"
                              : "cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentMethod("card")}
                              className="flex flex-1 items-center gap-[27px] bg-transparent border-0 p-0 cursor-pointer text-left"
                            >
                              <div className="relative shrink-0 size-[26px]">
                                <img
                                  alt=""
                                  className="block max-w-none"
                                  src={
                                    selectedPaymentMethod === "card"
                                      ? "/assets/payment/e82c2.svg"
                                      : "/assets/payment/f4536.svg"
                                  }
                                  width={26}
                                  height={26}
                                />
                              </div>
                              <div className="flex gap-[15px] items-center">
                                <div className="h-[24px] relative shrink-0 w-[35.2px] flex items-center justify-center">
                                  <img
                                    alt=""
                                    className="block max-w-none"
                                    src="/assets/payment/cb60c.svg"
                                    width={37.2}
                                    height={26}
                                  />
                                </div>
                                <span className="font-sans font-normal text-[14px] text-[#19213d] whitespace-nowrap">
                                  Credit/ Debit Card
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-[8px] shrink-0">
                              <div className="h-[24px] relative w-[37.091px]">
                                <div className="absolute bg-[#26365f] border-[0.458px] border-black/10 border-solid inset-0 rounded-[1.832px]" />
                                <div className="absolute inset-[15.15%_15.69%_14.25%_16.67%] flex items-center justify-center">
                                  <img
                                    alt="Mastercard"
                                    className="block max-w-none size-full"
                                    src="/assets/payment/75eab.svg"
                                  />
                                </div>
                              </div>
                              <div className="h-[24px] relative w-[37.2px]">
                                <div className="absolute bg-[#2666ac] border-[0.55px] border-black/10 border-solid inset-0 rounded-[2.198px]" />
                                <span className="absolute inset-[16.67%_9.8%_16.66%_10.78%] font-bold italic text-[11.725px] leading-normal text-white text-center flex items-center justify-center">
                                  VISA
                                </span>
                                <div className="absolute inset-[29.77%_77.8%_61.14%_9.45%]">
                                  <img
                                    alt=""
                                    className="block max-w-none size-full"
                                    src="/assets/payment/5a9fa.svg"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {selectedPaymentMethod === "card" && (
                            <>
                              <div className="flex flex-col md:flex-row gap-[25px] items-center justify-center py-[12px] sm:py-[27px] w-full">
                                {/* Matte Black Visa Card Preview */}
                                <div className="h-[185px] relative shrink-0 w-[335px] overflow-hidden rounded-[10px]">
                                  <div
                                    className="absolute h-[185px] left-0 rounded-[10px] top-0 w-[335px]"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(117.67335235429837deg, rgb(40, 40, 40) 1.6084%, rgb(11, 11, 11) 93.481%)",
                                    }}
                                  />
                                  <div className="absolute backdrop-blur-[40px] bg-white/[0.03] h-[185px] left-0 rounded-[10px] top-0 w-[335px]" />
                                  <div className="absolute h-[185px] left-0 top-0 w-[336px]">
                                    <img
                                      alt=""
                                      className="block max-w-none"
                                      src="/assets/payment/02c44.svg"
                                      width={336}
                                      height={185}
                                    />
                                  </div>
                                  <p
                                    className="absolute leading-[24px] left-[24px] text-[16px] text-white top-[113px] whitespace-nowrap m-0 uppercase max-w-[285px] truncate"
                                    style={{
                                      fontFamily:
                                        "'IBM Plex Mono', monospace",
                                    }}
                                  >
                                    {cardHolderName.trim() || "YOUR NAME"}
                                  </p>
                                  <p
                                    className="absolute leading-[24px] left-[24px] text-[16px] text-white top-[137px] whitespace-nowrap m-0"
                                    style={{
                                      fontFamily:
                                        "'IBM Plex Mono', monospace",
                                    }}
                                  >
                                    {matteCardDigitsDisplay}
                                  </p>
                                  <div className="absolute left-[263px] size-[48px] top-[12px]">
                                    <img
                                      alt="VISA"
                                      className="block max-w-none"
                                      src="/assets/payment/943eb.svg"
                                      width={48}
                                      height={48}
                                    />
                                  </div>
                                </div>

                                {/* Card Inputs + Company Billing Address */}
                                <div className="flex flex-col gap-[18px] items-start w-full max-w-[318px]">
                                  <div className="flex flex-col gap-[12px] items-start w-full">
                                    {/* Card Number */}
                                    <div className="relative bg-[#e6e6e6] h-[40px] rounded-[10px] w-full flex items-center px-[16px]">
                                      {!cardNumber && (
                                        <span className="pointer-events-none font-sans font-normal text-[14px] leading-[15.6px] text-[rgba(25,33,61,0.7)] flex items-center gap-[4px]">
                                          Card number
                                          <span className="text-[#e35f00]">*</span>
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        aria-label="Card number"
                                        value={cardNumber}
                                        onChange={(e) =>
                                          handleCardNumberChange(e.target.value)
                                        }
                                        className={`bg-transparent border-0 outline-none font-sans text-[14px] text-[#19213d] w-full h-full ${
                                          !cardNumber
                                            ? "absolute inset-0 px-[16px]"
                                            : ""
                                        }`}
                                      />
                                    </div>
                                    {cardErrors.cardNumber && (
                                      <span className="text-[11px] text-[#d92d20] -mt-2">
                                        {cardErrors.cardNumber}
                                      </span>
                                    )}

                                    {/* Name on Card */}
                                    <div className="relative bg-[#e6e6e6] h-[40px] rounded-[10px] w-full flex items-center px-[16px]">
                                      {!cardHolderName && (
                                        <span className="pointer-events-none font-sans font-normal text-[14px] leading-[15.6px] text-[rgba(25,33,61,0.7)] flex items-center gap-[4px]">
                                          Name on card
                                          <span className="text-[#e35f00]">*</span>
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        aria-label="Name on card"
                                        value={cardHolderName}
                                        onChange={(e) =>
                                          setCardHolderName(e.target.value)
                                        }
                                        className={`bg-transparent border-0 outline-none font-sans text-[14px] text-[#19213d] w-full h-full ${
                                          !cardHolderName
                                            ? "absolute inset-0 px-[16px]"
                                            : ""
                                        }`}
                                      />
                                    </div>

                                    {/* Expiration + CVV */}
                                    <div className="flex gap-[12px] items-start w-full">
                                      <div className="relative bg-[#e6e6e6] h-[40px] rounded-[10px] w-[148px] flex items-center px-[16px]">
                                        {!cardExpiration && (
                                          <span className="pointer-events-none font-sans font-normal text-[14px] leading-[15.6px] text-[rgba(25,33,61,0.7)] flex items-center gap-[4px]">
                                            Expiration
                                            <span className="text-[#e35f00]">
                                              *
                                            </span>
                                          </span>
                                        )}
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          aria-label="Expiration"
                                          value={cardExpiration}
                                          onChange={(e) =>
                                            handleExpirationChange(
                                              e.target.value
                                            )
                                          }
                                          className={`bg-transparent border-0 outline-none font-sans text-[14px] text-[#19213d] w-full h-full ${
                                            !cardExpiration
                                              ? "absolute inset-0 px-[16px]"
                                              : ""
                                          }`}
                                        />
                                      </div>

                                      <div className="relative bg-[#e6e6e6] h-[40px] rounded-[10px] flex-1 flex items-center px-[16px]">
                                        {!cardCvv && (
                                          <span className="pointer-events-none font-sans font-normal text-[14px] leading-[15.6px] text-[rgba(25,33,61,0.7)] flex items-center gap-[4px]">
                                            CVV
                                            <span className="text-[#e35f00]">
                                              *
                                            </span>
                                          </span>
                                        )}
                                        <input
                                          type="password"
                                          inputMode="numeric"
                                          maxLength={4}
                                          aria-label="CVV"
                                          value={cardCvv}
                                          onChange={(e) => {
                                            setCardCvv(
                                              e.target.value.replace(/\D/g, "")
                                            );
                                            setCardErrors((p) => ({
                                              ...p,
                                              cardCvv: "",
                                            }));
                                          }}
                                          className={`bg-transparent border-0 outline-none font-sans text-[14px] text-[#19213d] w-full h-full ${
                                            !cardCvv
                                              ? "absolute inset-0 px-[16px]"
                                              : ""
                                          }`}
                                        />
                                      </div>
                                    </div>
                                    {(cardErrors.cardExpiration ||
                                      cardErrors.cardCvv) && (
                                      <span className="text-[11px] text-[#d92d20] -mt-2">
                                        {cardErrors.cardExpiration ||
                                          cardErrors.cardCvv}
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-sans font-normal text-[12px] leading-[15.6px] text-[rgba(25,33,61,0.7)] w-full">
                                    <p className="m-0">ONFLOW VIETNAM Co., LTD</p>
                                    <p className="m-0">
                                      102/13 No.2 St., Quarter No. 4,
                                    </p>
                                    <p className="m-0">
                                      Phu Thuan Ward, HCMC, Vietnam
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <label className="flex gap-[10px] items-center cursor-pointer">
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={saveCardForFuture}
                                  onClick={() =>
                                    setSaveCardForFuture(!saveCardForFuture)
                                  }
                                  className={`flex items-center justify-center rounded-[5px] shrink-0 size-[20px] border-[0.5px] border-solid cursor-pointer p-0 transition-colors ${
                                    saveCardForFuture
                                      ? "bg-[#004bda] border-[#004bda]"
                                      : "bg-white border-[#9e9e9e]"
                                  }`}
                                >
                                  {saveCardForFuture && (
                                    <span className="text-white text-[12px] leading-none font-bold">
                                      ✓
                                    </span>
                                  )}
                                </button>
                                <span className="font-sans font-normal leading-[18.2px] text-[14px] text-[#19213d]">
                                  Save this payment method for future purchases
                                </span>
                              </label>
                            </>
                          )}
                        </div>

                        {/* 2. Online Banking */}
                        <div
                          onClick={() => setSelectedPaymentMethod("banking")}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedPaymentMethod("banking");
                            }
                          }}
                          className={`bg-white flex flex-col justify-center min-h-[60px] px-[25px] py-[17px] relative rounded-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] w-full cursor-pointer transition-colors ${
                            selectedPaymentMethod === "banking"
                              ? "border border-[rgba(25,33,61,0.7)]"
                              : ""
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                            <div className="flex gap-[27px] items-center">
                              <div className="relative shrink-0 size-[26px]">
                                <img
                                  alt=""
                                  className="block max-w-none"
                                  src={
                                    selectedPaymentMethod === "banking"
                                      ? "/assets/payment/e82c2.svg"
                                      : "/assets/payment/f4536.svg"
                                  }
                                  width={26}
                                  height={26}
                                />
                              </div>
                              <div className="flex gap-[15px] items-center">
                                <div className="h-[24px] relative shrink-0 w-[35.2px] flex items-center justify-center">
                                  <img
                                    alt=""
                                    className="block max-w-none"
                                    src="/assets/payment/5e5bc.svg"
                                    width={24}
                                    height={24}
                                  />
                                </div>
                                <span className="font-sans font-normal text-[14px] text-[#19213d] whitespace-nowrap">
                                  Online Banking
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-[13px] items-center">
                              {BANK_OPTIONS.map((bank) => (
                                <div
                                  key={bank.id}
                                  className="relative shrink-0 size-[24px] flex items-center justify-center overflow-hidden"
                                >
                                  <img
                                    alt={bank.name}
                                    className={`block max-w-none size-full object-contain ${
                                      bank.rotate ? "rotate-90" : ""
                                    }`}
                                    src={bank.icon}
                                  />
                                </div>
                              ))}
                              <span className="font-sans font-normal text-[16px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                                +99
                              </span>
                            </div>
                          </div>

                          {selectedPaymentMethod === "banking" && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-4 pt-4 border-t border-[#eaecf0] grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full"
                            >
                              {BANK_OPTIONS.map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => setSelectedBank(bank.name)}
                                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-[8px] border cursor-pointer bg-white transition-colors ${
                                    selectedBank === bank.name
                                      ? "border-[#004bda] bg-[#004bda]/[0.04]"
                                      : "border-[#eaecf0] hover:border-[#c9c9c9]"
                                  }`}
                                >
                                  <img
                                    alt={bank.name}
                                    src={bank.icon}
                                    className={`size-[24px] object-contain ${
                                      bank.rotate ? "rotate-90" : ""
                                    }`}
                                  />
                                  <span className="text-[11px] text-[#19213d] font-medium text-center">
                                    {bank.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 3. Momo E-wallet */}
                        <div
                          onClick={() => setSelectedPaymentMethod("momo")}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedPaymentMethod("momo");
                            }
                          }}
                          className={`bg-white flex flex-col justify-center min-h-[60px] px-[25px] py-[17px] relative rounded-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] w-full cursor-pointer transition-colors ${
                            selectedPaymentMethod === "momo"
                              ? "border border-[rgba(25,33,61,0.7)]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex gap-[27px] items-center">
                              <div className="relative shrink-0 size-[26px]">
                                <img
                                  alt=""
                                  className="block max-w-none"
                                  src={
                                    selectedPaymentMethod === "momo"
                                      ? "/assets/payment/e82c2.svg"
                                      : "/assets/payment/f4536.svg"
                                  }
                                  width={26}
                                  height={26}
                                />
                              </div>
                              <div className="flex gap-[15px] items-center">
                                <div className="h-[24px] relative shrink-0 w-[35.2px] flex items-center justify-center">
                                  <img
                                    alt="Momo"
                                    className="block max-w-none"
                                    src="/assets/payment/12893.svg"
                                    width={24}
                                    height={24}
                                  />
                                </div>
                                <span className="font-sans font-normal text-[14px] text-[#19213d] whitespace-nowrap">
                                  Momo E-wallet
                                </span>
                              </div>
                            </div>
                          </div>

                          {selectedPaymentMethod === "momo" && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-4 pt-4 border-t border-[#eaecf0] flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full"
                            >
                              <input
                                type="tel"
                                value={momoPhone}
                                onChange={(e) => setMomoPhone(e.target.value)}
                                placeholder="Enter Momo phone number"
                                className="bg-[#e6e6e6] h-[38px] px-4 rounded-[8px] text-[13px] text-[#19213d] border-0 outline-none w-full sm:w-[260px]"
                              />
                              <span className="text-[12px] text-[rgba(25,33,61,0.7)]">
                                Instant QR approval via MoMo App
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 4. PayPal */}
                        <div
                          onClick={() => setSelectedPaymentMethod("paypal")}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedPaymentMethod("paypal");
                            }
                          }}
                          className={`bg-white flex flex-col justify-center min-h-[60px] px-[25px] py-[17px] relative rounded-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] w-full cursor-pointer transition-colors ${
                            selectedPaymentMethod === "paypal"
                              ? "border border-[rgba(25,33,61,0.7)]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex gap-[27px] items-center">
                              <div className="relative shrink-0 size-[26px]">
                                <img
                                  alt=""
                                  className="block max-w-none"
                                  src={
                                    selectedPaymentMethod === "paypal"
                                      ? "/assets/payment/e82c2.svg"
                                      : "/assets/payment/f4536.svg"
                                  }
                                  width={26}
                                  height={26}
                                />
                              </div>
                              <div className="flex gap-[15px] items-center">
                                <div className="h-[24px] relative shrink-0 w-[35.2px]">
                                  <div className="absolute inset-[0_20.52%_11.8%_25.57%]">
                                    <img
                                      alt=""
                                      className="block max-w-none size-full"
                                      src="/assets/payment/0b565.svg"
                                    />
                                  </div>
                                  <div className="absolute inset-[25.47%_15.85%_0.62%_39.57%]">
                                    <img
                                      alt=""
                                      className="block max-w-none size-full"
                                      src="/assets/payment/c19b3.svg"
                                    />
                                  </div>
                                  <div className="absolute inset-[21.74%_20.19%_41%_44.38%]">
                                    <img
                                      alt=""
                                      className="block max-w-none size-full"
                                      src="/assets/payment/29bd8.svg"
                                    />
                                  </div>
                                </div>
                                <span className="font-sans font-normal text-[14px] text-[#19213d] whitespace-nowrap">
                                  PayPal
                                </span>
                              </div>
                            </div>
                          </div>

                          {selectedPaymentMethod === "paypal" && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-4 pt-4 border-t border-[#eaecf0] flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full"
                            >
                              <input
                                type="email"
                                value={paypalEmail}
                                onChange={(e) => setPaypalEmail(e.target.value)}
                                placeholder="PayPal account email"
                                className="bg-[#e6e6e6] h-[38px] px-4 rounded-[8px] text-[13px] text-[#19213d] border-0 outline-none w-full sm:w-[260px]"
                              />
                              <span className="text-[12px] text-[rgba(25,33,61,0.7)]">
                                You will be confirmed securely via PayPal Express
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Buttons */}
                  <div className="drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] flex items-center justify-between relative shrink-0 w-full">
                    <button
                      type="button"
                      onClick={() => navigateStep("billing")}
                      className="bg-white hover:bg-[#f8f9fa] transition-colors cursor-pointer flex gap-[9px] h-[40px] items-center justify-center overflow-hidden px-[24px] rounded-[10px] shrink-0 border-0"
                    >
                      <div className="flex items-center justify-center rotate-180">
                        <div className="h-[24px] relative w-[11px]">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/cfe20.svg"
                            width={11}
                            height={24}
                          />
                        </div>
                      </div>
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                        Previous
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleCompletePayment}
                      className="bg-[#004bda] hover:bg-[#003cb3] disabled:opacity-70 transition-colors cursor-pointer flex gap-[9px] h-[40px] items-center justify-center overflow-hidden px-[24px] rounded-[10px] shrink-0 border-0"
                    >
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-white whitespace-nowrap">
                        {isProcessingPayment
                          ? "Processing..."
                          : "Complete Payment"}
                      </span>
                      <div className="h-[24px] relative shrink-0 w-[11px]">
                        <img
                          alt=""
                          className="block max-w-none"
                          src="/assets/payment/6e2ac.svg"
                          width={11}
                          height={24}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SCREEN 4: [D2.3] Receipt Page - Payment Success                  */}
              {/* ================================================================ */}
              {step === "receipt-success" && (
                <div className="bg-white drop-shadow-[4px_5px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[20px] items-center p-[20px] relative rounded-[10px] shrink-0 w-full lg:w-[601px]">
                  <div className="drop-shadow-[4px_5px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[22px] items-center overflow-hidden p-[24px] sm:p-[32px] relative rounded-[10px] shrink-0">
                    <div className="relative shrink-0 size-[60px]">
                      <img
                        alt="Payment Success"
                        className="block max-w-none"
                        src="/assets/payment/21b61.svg"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className="flex flex-col gap-[6px] items-center text-center">
                      <h2 className="font-google-sans font-bold text-[20px] leading-normal text-[#19213d] m-0">
                        Payment Success!
                      </h2>
                      <p className="font-sans font-normal text-[16px] leading-normal text-[rgba(25,33,61,0.7)] m-0">
                        Your credits have been added to your account successfully
                      </p>
                    </div>
                  </div>

                  {/* Receipt Details Box */}
                  <div className="bg-[#f0f0f0] flex flex-col gap-[30px] items-start overflow-hidden px-[20px] py-[22px] relative rounded-[10px] shrink-0 w-full">
                    <div className="flex flex-col font-sans font-normal gap-[10px] items-start text-[14px] w-full">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Transaction ID
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {transactionId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Payment Time
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {paymentTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Payment Method
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {paymentMethodLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Recipient
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {recipientDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[10px] items-start w-full text-[14px]">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-sans font-normal text-[rgba(25,33,61,0.7)]">
                          Amount paid
                        </span>
                        <span className="font-sans font-semibold leading-[15.6px] text-[#19213d]">
                          {formatVnd(orderSummary.totalVnd)} (Includes VAT 8%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-sans font-normal text-[rgba(25,33,61,0.7)]">
                          Credits Added
                        </span>
                        <div className="flex gap-[4px] items-center">
                          <span className="font-sans font-bold leading-[15.6px] text-[#004bda]">
                            {orderSummary.purchaseCredits.toLocaleString("en-US")}
                          </span>
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/5f54b.svg"
                            width={14}
                            height={14}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-sans font-normal text-[rgba(25,33,61,0.7)]">
                          Bonus Credits
                        </span>
                        <div className="flex gap-[4px] items-center">
                          <span className="font-sans font-bold leading-[15.6px] text-[#006840]">
                            {orderSummary.bonusCredits.toLocaleString("en-US")}
                          </span>
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/5f54b.svg"
                            width={14}
                            height={14}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-sans font-normal text-[rgba(25,33,61,0.7)]">
                          New Balance
                        </span>
                        <div className="flex gap-[4px] items-center">
                          <span className="font-sans font-bold leading-[15.6px] text-[#006840]">
                            {orderSummary.newBalance.toLocaleString("en-US")}
                          </span>
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/5f54b.svg"
                            width={14}
                            height={14}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-[16px] sm:gap-[24px] items-center justify-center sm:px-[66px] relative shrink-0 w-full">
                    <button
                      type="button"
                      onClick={handleDownloadReceipt}
                      className="bg-[#f0f0f0] hover:bg-[#e6e6e6] transition-colors border-[0.4px] border-[#19213d] border-solid cursor-pointer flex gap-[9px] h-[40px] items-center justify-center px-[24px] rounded-[10px] shrink-0"
                    >
                      <div className="flex h-[16px] items-center justify-center relative shrink-0 w-[13.538px]">
                        <div className="flex-none rotate-90">
                          <div className="h-[13.538px] relative w-[16px]">
                            <div className="absolute inset-[-4.54%_-3.85%_-4.55%_-3.85%]">
                              <img
                                alt=""
                                className="block max-w-none size-full"
                                src="/assets/payment/92c3b.svg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d] whitespace-nowrap">
                        Download Recepit
                      </span>
                    </button>

                    <Link
                      href="/"
                      className="bg-[#004bda] hover:bg-[#003cb3] transition-colors flex gap-[9px] h-[40px] items-center justify-center px-[24px] rounded-[10px] shrink-0 no-underline"
                    >
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-white whitespace-nowrap">
                        Countinue to Gallery
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* SCREEN 5: [D2.3] Receipt Page - Payment Failed                   */}
              {/* ================================================================ */}
              {step === "receipt-failed" && (
                <div className="bg-white drop-shadow-[4px_5px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[20px] items-center p-[20px] relative rounded-[10px] shrink-0 w-full lg:w-[601px]">
                  <div className="drop-shadow-[4px_5px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[22px] items-center overflow-hidden p-[24px] sm:p-[32px] relative rounded-[10px] shrink-0">
                    <div className="relative shrink-0 size-[60px]">
                      <img
                        alt="Payment Failed"
                        className="block max-w-none"
                        src="/assets/payment/6e20d.svg"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className="flex flex-col gap-[6px] items-center text-center">
                      <h2 className="font-google-sans font-bold text-[20px] leading-normal text-[#19213d] m-0">
                        Payment Failed!
                      </h2>
                      <div className="font-sans font-normal text-[16px] leading-normal text-[rgba(25,33,61,0.7)]">
                        <p className="m-0">
                          There was some issues with your payment process,{" "}
                        </p>
                        <p className="m-0">
                          please try a different payment method.{" "}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Failure Log Box */}
                  <div className="bg-[#f0f0f0] flex flex-col items-start overflow-hidden px-[20px] py-[22px] relative rounded-[10px] shrink-0 w-full">
                    <div className="flex flex-col font-normal gap-[10px] items-start text-[14px] w-full">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Transaction ID
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {transactionId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Payment Time
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {paymentTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Payment Method
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {paymentMethodLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">
                          Recipient
                        </span>
                        <span className="leading-[19.6px] text-[#19213d]">
                          {recipientDisplay}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[rgba(25,33,61,0.7)]">Log</span>
                        <span className="italic leading-[19.6px] text-[#19213d]">
                          {failureReason}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Try Alternative Method Button */}
                  <div className="flex items-center justify-center sm:px-[66px] relative shrink-0 w-full">
                    <button
                      type="button"
                      onClick={() => navigateStep("payment")}
                      className="bg-[#f0f0f0] hover:bg-[#e6e6e6] transition-colors border-[0.4px] border-[#19213d] border-solid cursor-pointer flex gap-[9px] h-[40px] items-center justify-center px-[24px] rounded-[10px] shrink-0"
                    >
                      <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                        <div className="-scale-y-100 flex-none rotate-180">
                          <div className="relative size-[16px]">
                            <div className="absolute inset-[-3.84%]">
                              <img
                                alt=""
                                className="block max-w-none size-full"
                                src="/assets/payment/7276c.svg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d] whitespace-nowrap">
                        Try alternative method
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================ */}
              {/* RIGHT COLUMN: Shared MODULE ODER SUMMARY (400px wide)            */}
              {/* ================================================================ */}
              <aside
                className="flex flex-col items-start relative shrink-0 w-full lg:w-[400px]"
                data-name="Module 2"
              >
                <div
                  className="flex flex-col gap-[5px] items-start relative shrink-0 w-full"
                  data-name="MODULE ODER SUMMARY"
                >
                  {/* Top Order Summary Card */}
                  <div className="bg-white flex flex-col gap-[12px] items-start overflow-hidden p-[32px] relative rounded-tl-[10px] rounded-tr-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] shrink-0 w-full">
                    <div className="flex flex-col gap-[5px] items-start relative shrink-0">
                      <div className="flex gap-[10px] items-center">
                        <div className="h-[12px] relative shrink-0 w-[16px] flex items-center justify-center">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/ddd38.svg"
                            width={16}
                            height={16}
                          />
                        </div>
                        <span className="font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d]">
                          @stoopiducky
                        </span>
                      </div>

                      <div className="flex gap-[10px] items-center">
                        <div className="h-[12px] relative shrink-0 w-[16px] flex items-center justify-center">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/a41ea.svg"
                            width={16}
                            height={16}
                          />
                        </div>
                        <span className="font-sans font-normal text-[12px] leading-[15.6px] text-[#19213d]">
                          powercom2604@gmail.com
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[30px] items-start w-full">
                      <div className="flex flex-col gap-[12px] items-start w-full">
                        <h2 className="font-google-sans font-bold text-[24px] leading-normal text-[#19213d] m-0">
                          Order summary
                        </h2>

                        <div className="flex flex-col gap-[12px] items-start w-full text-[14px]">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              Package
                            </span>
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              {orderSummary.packageName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between w-full">
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              Purchase Credits
                            </span>
                            <div className="flex gap-[4px] items-center">
                              <span className="font-sans font-bold leading-[15.6px] text-[#004bda]">
                                {orderSummary.purchaseCredits.toLocaleString(
                                  "en-US"
                                )}
                              </span>
                              <img
                                alt=""
                                className="block max-w-none"
                                src="/assets/payment/5f54b.svg"
                                width={14}
                                height={14}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full">
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              Bonus Credits
                            </span>
                            <div className="flex gap-[4px] items-center">
                              <span className="font-sans font-bold leading-[15.6px] text-[#006840]">
                                {orderSummary.bonusCredits.toLocaleString(
                                  "en-US"
                                )}
                              </span>
                              <img
                                alt=""
                                className="block max-w-none"
                                src="/assets/payment/5f54b.svg"
                                width={14}
                                height={14}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full">
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              Subtotal
                            </span>
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              {formatVnd(orderSummary.subtotalVnd)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between w-full">
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              VAT Included (8%)
                            </span>
                            <span className="font-sans font-normal leading-[15.6px] text-[#19213d]">
                              {formatVnd(orderSummary.vatVnd)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full text-[14px]">
                        <span className="font-sans font-semibold leading-[15.6px] text-[#19213d]">
                          Total
                        </span>
                        <span className="font-sans font-semibold leading-[15.6px] text-[#19213d]">
                          {formatVnd(orderSummary.totalVnd)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Transaction Details + SSL Card */}
                  <div className="bg-white flex flex-col gap-[12px] items-start overflow-hidden p-[20px] relative rounded-bl-[10px] rounded-br-[10px] shadow-[4px_5px_10px_0px_rgba(0,0,0,0.1)] shrink-0 w-full">
                    <div className="flex flex-col gap-[15px] items-start w-full">
                      <h3 className="font-sans font-bold text-[16px] leading-[15.6px] text-[#19213d] m-0">
                        Transaction Details
                      </h3>

                      <div className="flex flex-col gap-[5px] items-start w-full text-[14px]">
                        <div className="flex items-center justify-between w-full">
                          <span className="w-[165px] leading-[19.6px] text-[rgba(25,33,61,0.7)]">
                            Purchase Date
                          </span>
                          <span className="w-[165px] leading-[19.6px] text-[#19213d]">
                            {purchaseDate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="w-[165px] leading-[19.6px] text-[rgba(25,33,61,0.7)]">
                            Transaction ID
                          </span>
                          <span className="w-[165px] leading-[19.6px] text-[#19213d]">
                            {transactionId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="w-[165px] leading-[19.6px] text-[rgba(25,33,61,0.7)]">
                            License Terms
                          </span>
                          <span className="w-[165px] leading-[19.6px] text-[#19213d]">
                            Standard License
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="w-[165px] leading-[19.6px] text-[rgba(25,33,61,0.7)]">
                            License Owner
                          </span>
                          <span className="w-[165px] leading-[19.6px] text-[#19213d]">
                            Onflow Co., Ltd
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#919191] border-solid flex gap-[20px] items-start overflow-hidden p-[20px] relative rounded-[10px] w-full">
                      <div className="relative shrink-0 size-[16px]">
                        <div className="absolute inset-[-3.12%_-3.12%_-3.13%_-3.13%]">
                          <img
                            alt=""
                            className="block max-w-none"
                            src="/assets/payment/c3444.svg"
                            width={17}
                            height={17}
                          />
                        </div>
                      </div>
                      <p className="flex-1 font-sans font-normal leading-normal text-[#919191] text-[14px] m-0">
                        Your payment information is protected with 256-bit SSL
                        encryption
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center font-medium text-[#19213d]">
          Loading Payment Gateway...
        </div>
      }
    >
      <PaymentGatewayContent />
    </Suspense>
  );
}
