"use client";

import React, { useState } from "react";

export type SettingsTab = "profile" | "billing" | "appearance" | "notifications" | "security" | "about";

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  userProfile?: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    organization: string;
  };
  onSaveProfile?: (updated: { firstName: string; lastName: string; email: string; bio: string }) => void;
}

const THEME_COLORS = [
  "#000000",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#004bda",
];

export default function SettingsOverlay({
  isOpen,
  onClose,
  initialTab = "profile",
  userProfile,
  onSaveProfile,
}: SettingsOverlayProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Profile state
  const [firstName, setFirstName] = useState(userProfile?.firstName || "Nate");
  const [lastName, setLastName] = useState(userProfile?.lastName || "Higger");
  const [email, setEmail] = useState(userProfile?.email || "dev@natehigger.com");
  const [bio, setBio] = useState(userProfile?.bio || "Multimedia Designer based in Vietnam.");
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Billing state
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "visa-4242", brand: "VISA", label: "Visa ending in 4242", expiry: "Expiry 12/2028 • Default", isDefault: true },
    { id: "mc-5555", brand: "MC", label: "Mastercard ending in 5555", expiry: "Expiry 10/2026", isDefault: false },
  ]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState({
    company: "Nate Higger Inc.",
    line1: "123 Innovation Drive, Floor 5",
    line2: "Tech City, TC 90210",
    country: "Vietnam",
  });

  // Appearance state
  const [themeColor, setThemeColor] = useState("#000000");
  const [customHex, setCustomHex] = useState("#000000");
  const [interfaceTheme, setInterfaceTheme] = useState<"light" | "dark" | "system">("light");
  const [transparentSidebar, setTransparentSidebar] = useState(false);
  const [sidebarFeature, setSidebarFeature] = useState("Recent changes");
  const [fontStyle, setFontStyle] = useState<"sans" | "default" | "mono">("default");
  const [language, setLanguage] = useState("English");

  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState({
    assetUpdates: true,
    teamActivity: true,
    supportMessages: false,
  });
  const [pushNotifs, setPushNotifs] = useState({
    mentions: true,
    reminders: true,
    systemUpdates: false,
  });

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sessions, setSessions] = useState([
    { id: "mac", device: "MacBook Pro", location: "Hanoi, Vietnam • Active now", current: true, icon: "/assets/portal/e979f.svg" },
    { id: "iphone", device: "iPhone 14 Pro", location: "Ho Chi Minh City • 2h ago", current: false, icon: "/assets/portal/cc1a4.svg" },
  ]);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2500);
  };

  const handleSaveProfile = () => {
    onSaveProfile?.({ firstName, lastName, email, bio });
    showFeedback("Profile changes saved successfully!");
  };

  const handleAddCard = () => {
    const newId = `visa-${Math.floor(1000 + Math.random() * 9000)}`;
    const last4 = newId.split("-")[1];
    setPaymentMethods((prev) => [
      ...prev,
      { id: newId, brand: "VISA", label: `Visa ending in ${last4}`, expiry: "Expiry 08/2029", isDefault: false },
    ]);
    showFeedback(`Added Visa ending in ${last4}`);
  };

  const handleRemoveCard = (id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
    showFeedback("Payment method removed");
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      showFeedback("Please enter your current and new password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    showFeedback("Password updated successfully!");
  };

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "billing", label: "Billing" },
    { id: "appearance", label: "Appearance" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "about", label: "About" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white flex flex-col h-[600px] max-h-[92vh] w-[800px] max-w-full overflow-hidden relative rounded-[20px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
        data-node-id="1220:13245"
      >
        {/* Toast notification */}
        {savedToast && (
          <div className="absolute top-[22px] right-[80px] z-30 bg-[#19213d] text-white text-[12px] font-medium px-[14px] py-[6px] rounded-[8px] shadow-md animate-fade-in">
            {savedToast}
          </div>
        )}

        {/* Header */}
        <div className="h-[84px] shrink-0 w-full flex items-center justify-between px-[32px]">
          <h2 className="font-['Manrope',sans-serif] font-medium leading-[36px] text-[#19213d] text-[24px]">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#f2f4f7] hover:bg-[#e4e7ec] transition-colors rounded-full size-[32px] flex items-center justify-center cursor-pointer"
            aria-label="Close Settings"
          >
            <img alt="Close" className="size-[16px]" src="/assets/portal/b87f2.svg" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-[#eaecf0] border-b border-solid h-[38px] shrink-0 w-full flex items-center gap-[32px] px-[32px] overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative h-[37px] flex items-start pt-0 cursor-pointer shrink-0"
              >
                <span
                  className={`font-['Manrope',sans-serif] font-medium leading-[21px] text-[14px] transition-colors ${
                    isActive ? "text-[#19213d]" : "text-[rgba(25,33,61,0.5)] hover:text-[#19213d]"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bg-[#19213d] h-[2px] left-0 right-0 bottom-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto pt-[24px] px-[32px] pb-[24px]">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-[32px] h-full justify-between">
              <div className="flex flex-col gap-[28px]">
                {/* Avatar Row */}
                <div className="flex gap-[24px] items-center">
                  <div className="bg-[#1f1f1f] rounded-[16px] size-[80px] flex items-center justify-center shrink-0">
                    <span className="font-['Manrope',sans-serif] font-medium text-[36px] text-white leading-[54px]">
                      #
                    </span>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['Manrope',sans-serif] font-medium leading-[24px] text-[#19213d] text-[16px]">
                      Profile Picture
                    </p>
                    <p className="font-['Manrope',sans-serif] font-normal leading-[18px] text-[12px] text-[rgba(25,33,61,0.6)]">
                      PNG, JPG or GIF no bigger than 5MB.
                    </p>
                    <div className="flex gap-[12px] items-center pt-[4px]">
                      <button
                        type="button"
                        onClick={() => showFeedback("Avatar upload dialog triggered")}
                        className="bg-[#004bda] hover:bg-[#003cb3] transition-colors h-[33.5px] px-[16px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[13px] text-white cursor-pointer"
                      >
                        Upload New
                      </button>
                      <button
                        type="button"
                        onClick={() => showFeedback("Profile picture reset to default")}
                        className="bg-[#f2f4f7] hover:bg-[#e5e7eb] transition-colors h-[33.5px] px-[16px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[13px] text-[#19213d] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="flex flex-col gap-[20px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                    <div className="flex flex-col gap-[6px]">
                      <label className="font-['Manrope',sans-serif] font-medium leading-[19.5px] text-[13px] text-[rgba(25,33,61,0.7)]">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border border-[#eaecf0] focus:border-[#004bda] outline-none rounded-[8px] h-[43px] px-[16px] py-[10px] font-['Manrope',sans-serif] text-[14px] text-[#19213d]"
                      />
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label className="font-['Manrope',sans-serif] font-medium leading-[19.5px] text-[13px] text-[rgba(25,33,61,0.7)]">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border border-[#eaecf0] focus:border-[#004bda] outline-none rounded-[8px] h-[43px] px-[16px] py-[10px] font-['Manrope',sans-serif] text-[14px] text-[#19213d]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-['Manrope',sans-serif] font-medium leading-[19.5px] text-[13px] text-[rgba(25,33,61,0.7)]">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <img
                        alt=""
                        src="/assets/portal/3f69b.svg"
                        className="absolute left-[14px] size-[16px] pointer-events-none"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-[#eaecf0] focus:border-[#004bda] outline-none rounded-[8px] h-[43px] w-full pl-[40px] pr-[16px] py-[10px] font-['Manrope',sans-serif] text-[14px] text-[#19213d]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-['Manrope',sans-serif] font-medium leading-[19.5px] text-[13px] text-[rgba(25,33,61,0.7)]">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="border border-[#eaecf0] focus:border-[#004bda] outline-none rounded-[8px] px-[16px] py-[10px] font-['Manrope',sans-serif] text-[14px] text-[#19213d] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#eaecf0] pt-[16px] flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="bg-[#004bda] hover:bg-[#003cb3] transition-colors h-[41px] px-[24px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[14px] text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BILLING */}
          {activeTab === "billing" && (
            <div className="flex flex-col gap-[24px]">
              {/* Current Plan Banner */}
              <div className="bg-[#f8f9fa] border border-[#eaecf0] rounded-[12px] p-[21px] flex items-center justify-between">
                <div className="flex flex-col gap-[4px]">
                  <div className="flex gap-[8px] items-center">
                    <span className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                      Current Plan
                    </span>
                    <span className="bg-[#e3f2fd] px-[8px] py-[2px] rounded-[4px] font-['Manrope',sans-serif] font-bold text-[#004bda] text-[12px]">
                      Business Plan
                    </span>
                  </div>
                  <p className="font-['Manrope',sans-serif] font-normal leading-[19.5px] text-[13px] text-[rgba(25,33,61,0.6)]">
                    Recharges on Feb 28, 2026 • $29/mo
                  </p>
                </div>
                <div className="flex gap-[12px] items-center">
                  <button
                    type="button"
                    onClick={() => showFeedback("Downloading February 2026 Invoice PDF...")}
                    className="bg-white border border-[#eaecf0] hover:bg-[#f2f4f7] transition-colors h-[37.5px] px-[16px] rounded-[8px] flex items-center gap-[8px] cursor-pointer"
                  >
                    <img alt="" className="size-[16px]" src="/assets/portal/27bff.svg" />
                    <span className="font-['Manrope',sans-serif] font-medium text-[#19213d] text-[13px]">
                      Download Invoice
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showFeedback("Enterprise Plan upgrade request sent!")}
                    className="bg-[#19213d] hover:bg-[#2a365f] transition-colors h-[37.5px] px-[16px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[13px] text-white cursor-pointer"
                  >
                    Upgrade
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                    Payment Methods
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="flex items-center gap-[6px] text-[#004bda] hover:underline font-['Manrope',sans-serif] font-medium text-[13px] cursor-pointer"
                  >
                    <img alt="" className="size-[16px]" src="/assets/portal/f9fa1.svg" />
                    <span>Add New</span>
                  </button>
                </div>

                <div className="flex flex-col gap-[12px]">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="bg-white border border-[#eaecf0] h-[65px] rounded-[10px] px-[13px] flex items-center justify-between"
                    >
                      <div className="flex gap-[12px] items-center">
                        {pm.brand === "VISA" ? (
                          <div className="bg-[#1a1f71] h-[28px] w-[40px] rounded-[4px] flex items-center justify-center">
                            <span className="font-['Manrope',sans-serif] font-bold text-[10px] text-white">
                              VISA
                            </span>
                          </div>
                        ) : (
                          <div className="bg-[#eb001b] h-[28px] w-[40px] rounded-[4px] flex items-center justify-center overflow-hidden">
                            <div className="bg-[#ff5f00] opacity-80 rounded-full size-[16px] -mr-[4px]" />
                            <div className="bg-[#eb001b] opacity-80 rounded-full size-[16px]" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-['Manrope',sans-serif] font-medium leading-[21px] text-[#19213d] text-[14px]">
                            {pm.label}
                          </span>
                          <span className="font-['Manrope',sans-serif] font-normal leading-[18px] text-[12px] text-[rgba(25,33,61,0.6)]">
                            {pm.expiry}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(pm.id)}
                        className="size-[32px] rounded-full hover:bg-[#f2f4f7] flex items-center justify-center text-[rgba(25,33,61,0.5)] hover:text-[#eb5757] transition-colors cursor-pointer"
                        title="Remove payment method"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2 4H14M5.33333 4V2.66667C5.33333 1.93029 5.93029 1.33333 6.66667 1.33333H9.33333C10.0697 1.33333 10.6667 1.93029 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 14.0697 12.0697 14.6667 11.3333 14.6667H4.66667C3.93029 14.6667 3.33333 14.0697 3.33333 13.3333V4H12.6667Z"
                            stroke="currentColor"
                            strokeWidth="1.33"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Address */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                    Billing Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingAddress) showFeedback("Billing address updated!");
                      setIsEditingAddress(!isEditingAddress);
                    }}
                    className="font-['Manrope',sans-serif] font-medium text-[#004bda] text-[13px] hover:underline cursor-pointer"
                  >
                    {isEditingAddress ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="bg-[#f8f9fa] border border-[#eaecf0] rounded-[10px] p-[16px] flex gap-[12px] items-start">
                  <img alt="" className="size-[20px] mt-[2px]" src="/assets/portal/5c08a.svg" />
                  {isEditingAddress ? (
                    <div className="grid grid-cols-2 gap-[8px] flex-1">
                      <input
                        value={billingAddress.company}
                        onChange={(e) => setBillingAddress({ ...billingAddress, company: e.target.value })}
                        className="bg-white border border-[#eaecf0] rounded-[6px] px-[10px] py-[6px] text-[13px] text-[#19213d]"
                      />
                      <input
                        value={billingAddress.line1}
                        onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                        className="bg-white border border-[#eaecf0] rounded-[6px] px-[10px] py-[6px] text-[13px] text-[#19213d]"
                      />
                      <input
                        value={billingAddress.line2}
                        onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })}
                        className="bg-white border border-[#eaecf0] rounded-[6px] px-[10px] py-[6px] text-[13px] text-[#19213d]"
                      />
                      <input
                        value={billingAddress.country}
                        onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                        className="bg-white border border-[#eaecf0] rounded-[6px] px-[10px] py-[6px] text-[13px] text-[#19213d]"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col font-['Manrope',sans-serif] text-[14px] leading-[22.4px] text-[#19213d]">
                      <p className="font-bold">{billingAddress.company}</p>
                      <p>{billingAddress.line1}</p>
                      <p>{billingAddress.line2}</p>
                      <p>{billingAddress.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="flex flex-col gap-[24px]">
              {/* Theme Color */}
              <div className="flex flex-col gap-[12px]">
                <div>
                  <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                    Theme Color
                  </h3>
                  <p className="font-['Manrope',sans-serif] font-normal leading-[21px] text-[14px] text-[rgba(25,33,61,0.7)]">
                    Choose a preferred theme for the app.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-[12px]">
                  {THEME_COLORS.map((color) => {
                    const selected = themeColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setThemeColor(color);
                          setCustomHex(color);
                        }}
                        className={`size-[24px] rounded-full cursor-pointer transition-transform ${
                          selected ? "ring-2 ring-offset-2 ring-[#19213d] scale-110" : "opacity-85 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Theme color ${color}`}
                      />
                    );
                  })}
                  <div className="flex items-center gap-[8px] ml-[12px]">
                    <span className="font-['Manrope',sans-serif] font-medium text-[14px] text-[rgba(25,33,61,0.7)]">
                      Custom
                    </span>
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => {
                        setCustomHex(e.target.value);
                        setThemeColor(e.target.value);
                      }}
                      className="bg-[#f2f4f7] h-[34px] w-[101px] px-[12px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Interface Theme */}
              <div className="flex flex-col gap-[12px]">
                <div>
                  <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                    Interface Theme
                  </h3>
                  <p className="font-['Manrope',sans-serif] font-normal leading-[21px] text-[14px] text-[rgba(25,33,61,0.7)]">
                    Select or customize your UI theme.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-[16px]">
                  {/* Light Theme */}
                  <button
                    type="button"
                    onClick={() => setInterfaceTheme("light")}
                    className="flex flex-col gap-[8px] items-start text-left cursor-pointer"
                  >
                    <div
                      className={`bg-[#f5f5f5] h-[100px] w-full rounded-[10px] p-[8px] relative overflow-hidden border-2 transition-colors ${
                        interfaceTheme === "light" ? "border-[#004bda]" : "border-transparent"
                      }`}
                    >
                      <div className="flex gap-[8px] h-[80px] opacity-80">
                        <div className="bg-white h-full w-[52px] rounded-[4px]" />
                        <div className="flex-1 flex flex-col gap-[8px]">
                          <div className="bg-[#e0e0e0] h-[8px] w-[74px] rounded-[2px]" />
                          <div className="bg-[#eaecf0] flex-1 rounded-[4px]" />
                        </div>
                      </div>
                      {interfaceTheme === "light" && (
                        <div className="absolute top-[8px] right-[8px] bg-[#004bda] size-[16px] rounded-full flex items-center justify-center">
                          <img alt="" className="size-[10px]" src="/assets/portal/a581f.svg" />
                        </div>
                      )}
                    </div>
                    <span className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      Light Theme
                    </span>
                  </button>

                  {/* Dark Theme */}
                  <button
                    type="button"
                    onClick={() => setInterfaceTheme("dark")}
                    className="flex flex-col gap-[8px] items-start text-left cursor-pointer"
                  >
                    <div
                      className={`bg-[#1f1f1f] h-[100px] w-full rounded-[10px] p-[10px] relative overflow-hidden border-2 transition-colors ${
                        interfaceTheme === "dark" ? "border-[#004bda]" : "border-transparent"
                      }`}
                    >
                      <div className="flex gap-[8px] h-[80px] opacity-80">
                        <div className="bg-[#2d2d2d] h-full w-[52px] rounded-[4px]" />
                        <div className="flex-1 flex flex-col gap-[8px]">
                          <div className="bg-[#3d3d3d] h-[8px] w-[74px] rounded-[2px]" />
                          <div className="bg-[#1f1f1f] flex-1 rounded-[4px]" />
                        </div>
                      </div>
                      {interfaceTheme === "dark" && (
                        <div className="absolute top-[8px] right-[8px] bg-[#004bda] size-[16px] rounded-full flex items-center justify-center">
                          <img alt="" className="size-[10px]" src="/assets/portal/a581f.svg" />
                        </div>
                      )}
                    </div>
                    <span className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      Dark Theme
                    </span>
                  </button>

                  {/* System Theme */}
                  <button
                    type="button"
                    onClick={() => setInterfaceTheme("system")}
                    className="flex flex-col gap-[8px] items-start text-left cursor-pointer"
                  >
                    <div
                      className={`bg-[#f5f5f5] h-[100px] w-full rounded-[10px] p-[10px] relative overflow-hidden border-2 transition-colors ${
                        interfaceTheme === "system" ? "border-[#004bda]" : "border-transparent"
                      }`}
                    >
                      <div className="grid grid-cols-2 h-[80px] opacity-80 rounded-[4px] overflow-hidden">
                        <div className="bg-[#f5f5f5] p-[4px] flex gap-[4px]">
                          <div className="bg-white w-[23px] h-full rounded-[2px]" />
                          <div className="bg-[#eaecf0] flex-1 h-[90%] self-end rounded-[2px]" />
                        </div>
                        <div className="bg-[#1f1f1f] p-[4px] flex gap-[4px]">
                          <div className="bg-[#2d2d2d] w-[23px] h-full rounded-[2px]" />
                          <div className="bg-[#3d3d3d] flex-1 h-[90%] self-end rounded-[2px]" />
                        </div>
                      </div>
                      {interfaceTheme === "system" && (
                        <div className="absolute top-[8px] right-[8px] bg-[#004bda] size-[16px] rounded-full flex items-center justify-center">
                          <img alt="" className="size-[10px]" src="/assets/portal/a581f.svg" />
                        </div>
                      )}
                    </div>
                    <span className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      System
                    </span>
                  </button>
                </div>
              </div>

              {/* Additional Appearance Controls */}
              <div className="flex flex-col gap-[16px]">
                {/* Transparent Sidebar */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      Transparent Sidebar
                    </p>
                    <p className="font-['Manrope',sans-serif] text-[14px] text-[rgba(25,33,61,0.7)]">
                      Make the desktop sidebar transparent.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransparentSidebar(!transparentSidebar)}
                    className={`h-[24px] w-[44px] rounded-full p-[4px] transition-colors flex items-center cursor-pointer ${
                      transparentSidebar ? "bg-[#004bda] justify-end" : "bg-[#eaecf0] justify-start"
                    }`}
                  >
                    <span className="bg-white size-[16px] rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Sidebar Feature */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      Sidebar Feature
                    </p>
                    <p className="font-['Manrope',sans-serif] text-[14px] text-[rgba(25,33,61,0.7)]">
                      Select what you&apos;d like displayed in the sidebar.
                    </p>
                  </div>
                  <div className="relative w-[165px]">
                    <select
                      value={sidebarFeature}
                      onChange={(e) => setSidebarFeature(e.target.value)}
                      className="appearance-none bg-white border border-[#eaecf0] h-[39px] w-full rounded-[8px] pl-[12px] pr-[32px] font-['Manrope',sans-serif] text-[14px] text-[#19213d] outline-none cursor-pointer"
                    >
                      <option value="Recent changes">Recent changes</option>
                      <option value="All changes">All changes</option>
                      <option value="None">None</option>
                    </select>
                    <img
                      alt=""
                      src="/assets/portal/21533.svg"
                      className="absolute right-[12px] top-[11.5px] size-[16px] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Font Style */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      Font Style
                    </p>
                    <p className="font-['Manrope',sans-serif] text-[14px] text-[rgba(25,33,61,0.7)]">
                      Style of texts and heading
                    </p>
                  </div>
                  <div className="bg-[#f2f4f7] h-[37px] p-[4px] rounded-[8px] flex gap-[4px]">
                    {(["sans", "default", "mono"] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFontStyle(style)}
                        className={`h-[29px] w-[49px] rounded-[6px] font-medium text-[14px] transition-all cursor-pointer ${
                          fontStyle === style
                            ? "bg-white text-[#19213d] shadow-xs"
                            : "text-[rgba(25,33,61,0.5)] hover:text-[#19213d]"
                        }`}
                      >
                        Aa
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      Language
                    </p>
                    <p className="font-['Manrope',sans-serif] text-[14px] text-[rgba(25,33,61,0.7)]">
                      Select the language of the platform.
                    </p>
                  </div>
                  <div className="relative w-[160px]">
                    <span className="absolute left-[12px] top-[7.5px] text-[16px] pointer-events-none">
                      {language === "English" ? "🇬🇧" : language === "French" ? "🇫🇷" : "🇪🇸"}
                    </span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none bg-white border border-[#eaecf0] h-[39px] w-full rounded-[8px] pl-[36px] pr-[32px] font-['Manrope',sans-serif] text-[14px] text-[#19213d] outline-none cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                    <img
                      alt=""
                      src="/assets/portal/21533.svg"
                      className="absolute right-[12px] top-[11.5px] size-[16px] pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="flex flex-col gap-[24px]">
              {/* Email Notifications */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                  Email Notifications
                </h3>
                <div className="flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                        Asset Updates
                      </p>
                      <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                        Receive emails when your purchased assets are updated.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailNotifs({ ...emailNotifs, assetUpdates: !emailNotifs.assetUpdates })}
                      className={`h-[24px] w-[44px] rounded-full p-[4px] transition-colors flex items-center cursor-pointer ${
                        emailNotifs.assetUpdates ? "bg-[#004bda] justify-end" : "bg-[#eaecf0] justify-start"
                      }`}
                    >
                      <span className="bg-white size-[16px] rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                        Team Activity
                      </p>
                      <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                        Get notified when team members download assets.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailNotifs({ ...emailNotifs, teamActivity: !emailNotifs.teamActivity })}
                      className={`h-[24px] w-[44px] rounded-full p-[4px] transition-colors flex items-center cursor-pointer ${
                        emailNotifs.teamActivity ? "bg-[#004bda] justify-end" : "bg-[#eaecf0] justify-start"
                      }`}
                    >
                      <span className="bg-white size-[16px] rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                        Support Messages
                      </p>
                      <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                        Receive emails when support replies to your tickets.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailNotifs({ ...emailNotifs, supportMessages: !emailNotifs.supportMessages })}
                      className={`h-[24px] w-[44px] rounded-full p-[4px] transition-colors flex items-center cursor-pointer ${
                        emailNotifs.supportMessages ? "bg-[#004bda] justify-end" : "bg-[#eaecf0] justify-start"
                      }`}
                    >
                      <span className="bg-white size-[16px] rounded-full shadow-sm" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#eaecf0] h-px w-full" />

              {/* Push Notifications */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                  Push Notifications
                </h3>
                <div className="flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                        Mentions
                      </p>
                      <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                        Get notified when someone mentions you.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPushNotifs({ ...pushNotifs, mentions: !pushNotifs.mentions })}
                      className={`h-[24px] w-[44px] rounded-full p-[4px] transition-colors flex items-center cursor-pointer ${
                        pushNotifs.mentions ? "bg-[#004bda] justify-end" : "bg-[#eaecf0] justify-start"
                      }`}
                    >
                      <span className="bg-white size-[16px] rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                        Reminders
                      </p>
                      <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                        Receive reminders for your scheduled tasks.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPushNotifs({ ...pushNotifs, reminders: !pushNotifs.reminders })}
                      className={`h-[24px] w-[44px] rounded-full p-[4px] transition-colors flex items-center cursor-pointer ${
                        pushNotifs.reminders ? "bg-[#004bda] justify-end" : "bg-[#eaecf0] justify-start"
                      }`}
                    >
                      <span className="bg-white size-[16px] rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                        System Updates
                      </p>
                      <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                        Get notified about important system updates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPushNotifs({ ...pushNotifs, systemUpdates: !pushNotifs.systemUpdates })}
                      className={`h-[24px] w-[44px] rounded-full p-[4px] transition-colors flex items-center cursor-pointer ${
                        pushNotifs.systemUpdates ? "bg-[#004bda] justify-end" : "bg-[#eaecf0] justify-start"
                      }`}
                    >
                      <span className="bg-white size-[16px] rounded-full shadow-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === "security" && (
            <div className="flex flex-col gap-[24px]">
              {/* Two-Factor Authentication */}
              <div className="bg-[#f8f9fa] border border-[#eaecf0] rounded-[12px] p-[17px] flex items-center justify-between">
                <div className="flex gap-[16px] items-start">
                  <div className="bg-[#e8f5e9] size-[40px] rounded-full flex items-center justify-center shrink-0">
                    <img alt="" className="size-[20px]" src="/assets/portal/ff8e3.svg" />
                  </div>
                  <div>
                    <p className="font-['Manrope',sans-serif] font-bold text-[15px] text-[#19213d]">
                      Two-Factor Authentication
                    </p>
                    <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showFeedback(!twoFactorEnabled ? "2FA Enabled!" : "2FA Disabled");
                  }}
                  className={`h-[35.5px] px-[16px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[13px] transition-colors cursor-pointer ${
                    twoFactorEnabled
                      ? "bg-[#e8f5e9] text-[#006401] border border-[#006401]/20"
                      : "bg-[#19213d] text-white hover:bg-[#2a365f]"
                  }`}
                >
                  {twoFactorEnabled ? "2FA Enabled ✓" : "Enable 2FA"}
                </button>
              </div>

              {/* Change Password */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                  Change Password
                </h3>
                <div className="flex flex-col gap-[12px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-['Manrope',sans-serif] font-medium text-[13px] text-[rgba(25,33,61,0.7)]">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="border border-[#eaecf0] focus:border-[#004bda] outline-none rounded-[8px] h-[43px] px-[16px] font-['Manrope',sans-serif] text-[14px] text-[#19213d]"
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-['Manrope',sans-serif] font-medium text-[13px] text-[rgba(25,33,61,0.7)]">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border border-[#eaecf0] focus:border-[#004bda] outline-none rounded-[8px] h-[43px] px-[16px] font-['Manrope',sans-serif] text-[14px] text-[#19213d]"
                    />
                  </div>
                  <div className="flex justify-end pt-[4px]">
                    <button
                      type="button"
                      onClick={handleUpdatePassword}
                      className="bg-white border border-[#eaecf0] hover:bg-[#f2f4f7] transition-colors h-[37.5px] px-[21px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[13px] text-[#19213d] cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#eaecf0] h-px w-full" />

              {/* Active Sessions */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                  Active Sessions
                </h3>
                <div className="flex flex-col gap-[12px]">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div className="flex gap-[12px] items-center">
                        <img alt="" className="size-[20px]" src={s.icon} />
                        <div>
                          <p className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                            {s.device}
                          </p>
                          <p className="font-['Manrope',sans-serif] text-[12px] text-[rgba(25,33,61,0.6)]">
                            {s.location}
                          </p>
                        </div>
                      </div>
                      {s.current ? (
                        <span className="bg-[#e3f2fd] px-[8px] py-[4px] rounded-[4px] font-['Manrope',sans-serif] font-medium text-[#004bda] text-[12px]">
                          Current
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSessions((prev) => prev.filter((item) => item.id !== s.id));
                            showFeedback(`Revoked session on ${s.device}`);
                          }}
                          className="font-['Manrope',sans-serif] text-[#eb5757] text-[12px] hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#eaecf0] h-px w-full" />

              {/* Danger Zone */}
              <div className="flex flex-col gap-[12px]">
                <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#eb5757] text-[16px]">
                  Danger Zone
                </h3>
                <div className="bg-[#fff5f5] border border-[rgba(235,87,87,0.2)] rounded-[10px] p-[16px] flex items-center justify-between">
                  <div>
                    <p className="font-['Manrope',sans-serif] font-bold text-[14px] text-[#19213d]">
                      Delete Account
                    </p>
                    <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                      Permanently remove your account and all of its data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showFeedback("Account deletion requires admin confirmation.")}
                    className="bg-[#eb5757] hover:bg-[#d64545] transition-colors h-[35.5px] px-[16px] rounded-[8px] flex items-center gap-[8px] font-['Manrope',sans-serif] font-medium text-[13px] text-white cursor-pointer"
                  >
                    <img alt="" className="size-[16px]" src="/assets/portal/a0c77.svg" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT */}
          {activeTab === "about" && (
            <div className="flex flex-col justify-between h-full gap-[24px]">
              <div className="flex flex-col items-center pt-[12px] gap-[24px]">
                {/* App Brand Card */}
                <div className="flex flex-col items-center gap-[8px]">
                  <div className="bg-[#19213d] size-[64px] rounded-[16px] shadow-md flex items-center justify-center">
                    <span className="font-['Manrope',sans-serif] font-bold text-[24px] text-white">
                      #
                    </span>
                  </div>
                  <h3 className="font-['Manrope',sans-serif] font-bold text-[18px] text-[#19213d] mt-[4px]">
                    Onflow Portal
                  </h3>
                  <p className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                    Version 2.4.0 (Build 2026.01.30)
                  </p>
                </div>

                {/* Links */}
                <div className="w-full flex flex-col gap-[12px]">
                  {[
                    { title: "Terms of Service", icon: "/assets/portal/b2651.svg" },
                    { title: "Privacy Policy", icon: "/assets/portal/78c89.svg" },
                    { title: "Third-Party Licenses", icon: "/assets/portal/863d8.svg" },
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => showFeedback(`Opening ${item.title}...`)}
                      className="bg-white border border-[#eaecf0] hover:bg-[#f8f9fa] transition-colors h-[55px] w-full rounded-[10px] px-[17px] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-[12px]">
                        <img alt="" className="size-[18px]" src={item.icon} />
                        <span className="font-['Manrope',sans-serif] font-medium text-[14px] text-[#19213d]">
                          {item.title}
                        </span>
                      </div>
                      <img alt="" className="size-[16px]" src="/assets/portal/1d58b.svg" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#eaecf0] pt-[20px]">
                <button
                  type="button"
                  onClick={() => showFeedback("Logged out of all other devices.")}
                  className="bg-[#f2f4f7] hover:bg-[#e5e7eb] transition-colors h-[48px] w-full rounded-[8px] flex items-center justify-center gap-[10px] font-['Manrope',sans-serif] font-bold text-[16px] text-[#19213d] cursor-pointer"
                >
                  <img alt="" className="size-[16px]" src="/assets/portal/95e65.svg" />
                  <span>Log Out of All Devices</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
