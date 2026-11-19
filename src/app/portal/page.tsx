"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SettingsOverlay, { SettingsTab } from "@/components/portal/SettingsOverlay";
import SupportCenterOverlay, { SupportTab } from "@/components/portal/SupportCenterOverlay";

type PortalTab = "home" | "downloads" | "analytics" | "credits";

function PortalContent() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const validInitialTab: PortalTab =
    initialTabParam === "credits"
      ? "credits"
      : initialTabParam === "downloads"
      ? "downloads"
      : initialTabParam === "analytics"
      ? "analytics"
      : "home";

  const [activeTab, setActiveTab] = useState<PortalTab>(validInitialTab);
  const [activeOrg, setActiveOrg] = useState<"onflow" | "nate">("onflow");

  // Overlays
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>("profile");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState<SupportTab>("knowledge");

  // User Profile
  const [userProfile, setUserProfile] = useState({
    firstName: "David",
    lastName: "Nguyen",
    email: "dev@onflow.asia",
    bio: "Lead 3D Technical Artist at Onflow Asia.",
    organization: "Onflow Asia",
    field: "Developer",
  });

  // Credit Balance state
  const [creditBalance] = useState(2386);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  // Home State
  const [homeUsageRange, setHomeUsageRange] = useState<"1d" | "1w" | "1m" | "6m" | "1y">("1w");
  const [financialTab, setFinancialTab] = useState<"transactions" | "payment" | "billing">("transactions");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(3); // Default on Thursday (16)

  // Download Center State
  const [downloadSearch, setDownloadSearch] = useState("");
  const [downloadSort, setDownloadSort] = useState("Relevance");
  const [expandedOrder, setExpandedOrder] = useState<string | null>("order-1");
  const [expandedAsset, setExpandedAsset] = useState<string | null>("asset-1");
  const [selectedPolyMode, setSelectedPolyMode] = useState<"high" | "lod">("high");
  const [selectedResolution, setSelectedResolution] = useState("2048x2048 (PNG 16-BIT)");
  const [selectedFormat, setSelectedFormat] = useState("FBX");

  // Analytics State
  const [analyticsCreditRange, setAnalyticsCreditRange] = useState<"1w" | "1m" | "6m" | "1y">("1m");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setPurchaseToast(msg);
    setTimeout(() => setPurchaseToast(null), 3000);
  };

  const triggerMockDownload = (assetName: string, format: string) => {
    showToast(`Downloading ${assetName} (${format} - ${selectedResolution})...`);
  };

  // Usage chart data
  const USAGE_DATA = [
    { day: "M", val: 12 },
    { day: "T", val: 18 },
    { day: "W", val: 28 },
    { day: "T", val: 16 },
    { day: "F", val: 24 },
    { day: "S", val: 34 },
    { day: "S", val: 22 },
  ];

  // Category Distribution
  const CATEGORY_BARS = [
    { label: "3D Models", count: 280, heightPct: 87.5 },
    { label: "HDRIs", count: 190, heightPct: 59.3 },
    { label: "Materials", count: 140, heightPct: 43.7 },
    { label: "Kit-Bash", count: 220, heightPct: 68.7 },
    { label: "Textures", count: 260, heightPct: 81.2 },
    { label: "Plugins", count: 85, heightPct: 26.5 },
    { label: "Tools", count: 120, heightPct: 37.5 },
  ];

  return (
    <div className="min-h-screen bg-[#eaecf0] text-[#19213d] flex flex-col font-['Manrope',sans-serif]">
      {/* Toast popup */}
      {purchaseToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#19213d] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in border border-white/10">
          <span className="size-2 rounded-full bg-[#008f1f]" />
          <span className="text-[13px] font-medium">{purchaseToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* ===================== LEFT PANEL (297px) ===================== */}
        <aside className="w-[297px] shrink-0 bg-white border-r border-[#c9c9c9]/60 flex flex-col justify-between py-[24px] px-[16px] min-h-screen sticky top-0 h-screen overflow-y-auto">
          {/* Top user switcher & navigation */}
          <div className="flex flex-col gap-[20px]">
            {/* User Organization Switcher Card */}
            <div className="bg-[#f8f9fa] border border-[#eaecf0] rounded-[14px] p-[12px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="relative">
                  <div className="bg-[#1f1f1f] rounded-[11px] size-[46px] flex items-center justify-center text-white font-medium text-[24px]">
                    #
                  </div>
                  <span className="absolute -bottom-1 -right-1 size-[11px] bg-[#008f1f] border-2 border-white rounded-full" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-[14px] text-[#19213d]">
                    {activeOrg === "onflow" ? "David Nguyen" : "Nate Higger Inc."}
                  </span>
                  <span className="text-[12px] text-[rgba(25,33,61,0.65)] truncate max-w-[130px]">
                    {activeOrg === "onflow" ? "dev@onflow.asia" : "dev@natehigger.com"}
                  </span>
                </div>
              </div>

              {/* Switcher button */}
              <button
                type="button"
                onClick={() => setActiveOrg(activeOrg === "onflow" ? "nate" : "onflow")}
                title="Switch Account / Organization"
                className="size-[28px] rounded-[6px] hover:bg-[#eaecf0] transition-colors flex items-center justify-center text-[rgba(25,33,61,0.6)] cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M5 6L8 3L11 6M11 10L8 13L5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Back to Gallery Link */}
            <Link
              href="/"
              className="flex items-center gap-[10px] px-[16px] py-[8px] rounded-[10px] text-[13px] font-medium text-[#004bda] bg-[#eef4ff] hover:bg-[#e0ecff] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to 3D Asset Library</span>
            </Link>

            {/* Main Tabs Navigation */}
            <nav className="flex flex-col gap-[6px] pt-[8px]">
              {/* Home */}
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className={`flex items-center gap-[12px] h-[40px] px-[18px] py-[6px] rounded-[10px] w-full text-left transition-colors cursor-pointer ${
                  activeTab === "home"
                    ? "bg-[#eaecf0] font-bold text-[#19213d]"
                    : "text-[#19213d] font-normal hover:bg-[#f2f4f7]"
                }`}
              >
                <img alt="" className="size-[16px]" src="/assets/portal/837c3.svg" />
                <span className="text-[14px] tracking-[0.28px]">Home</span>
              </button>

              {/* Download Center */}
              <button
                type="button"
                onClick={() => setActiveTab("downloads")}
                className={`flex items-center justify-between h-[40px] px-[18px] py-[6px] rounded-[10px] w-full text-left transition-colors cursor-pointer ${
                  activeTab === "downloads"
                    ? "bg-[#eaecf0] font-bold text-[#19213d]"
                    : "text-[#19213d] font-normal hover:bg-[#f2f4f7]"
                }`}
              >
                <div className="flex items-center gap-[12px]">
                  <img alt="" className="size-[16px]" src="/assets/portal/643c9.svg" />
                  <span className="text-[14px] tracking-[0.28px]">Download Center</span>
                </div>
                <span className="bg-[#bff6be] text-[#006401] text-[10px] font-bold px-[7px] py-[2px] rounded-[5px]">
                  +36
                </span>
              </button>

              {/* Analytics */}
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-[12px] h-[40px] px-[18px] py-[6px] rounded-[10px] w-full text-left transition-colors cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-[#eaecf0] font-bold text-[#19213d]"
                    : "text-[#19213d] font-normal hover:bg-[#f2f4f7]"
                }`}
              >
                <img alt="" className="size-[16px]" src="/assets/portal/f06ff.svg" />
                <span className="text-[14px] tracking-[0.28px]">Analytics</span>
              </button>

              {/* Credits & Payment */}
              <button
                type="button"
                onClick={() => setActiveTab("credits")}
                className={`flex items-center justify-between h-[40px] px-[18px] py-[6px] rounded-[10px] w-full text-left transition-colors cursor-pointer ${
                  activeTab === "credits"
                    ? "bg-[#eaecf0] font-bold text-[#19213d]"
                    : "text-[#19213d] font-normal hover:bg-[#f2f4f7]"
                }`}
              >
                <div className="flex items-center gap-[12px]">
                  <img alt="" className="size-[16px]" src="/assets/portal/0f7ea.svg" />
                  <span className="text-[14px] tracking-[0.28px]">Credits & Payment</span>
                </div>
                <span className="bg-[#f2f6be] text-[#644d00] text-[10px] font-bold px-[7px] py-[2px] rounded-[5px]">
                  Pending
                </span>
              </button>
            </nav>
          </div>

          {/* Bottom Promos & Modals */}
          <div className="flex flex-col gap-[14px] pt-[20px]">
            {/* Promo Card: API Integrations */}
            <div className="bg-[rgba(228,228,228,0.24)] border border-[#eaecf0] rounded-[10px] p-[16px] flex flex-col gap-[10px]">
              <div className="flex items-center justify-between">
                <span className="bg-[#bff6be] text-[#006401] text-[10px] font-medium px-[9px] py-[3px] rounded-[5px]">
                  New
                </span>
                <span className="text-[11px] font-mono text-[rgba(25,33,61,0.5)]">v2.4</span>
              </div>
              <div>
                <p className="font-bold text-[13px] text-[#19213d] leading-[18px]">
                  API Integrations for Developer Tools
                </p>
                <p className="font-normal text-[11px] text-[rgba(25,33,61,0.65)] leading-[16px] mt-1">
                  Direct export of 3D assets and materials into your DCC and engine scenes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast("API Token generated: ONFLOW_SEC_LIVE_9281734")}
                className="bg-[#e7e7e7] hover:bg-[#d8d8d8] transition-colors rounded-[8px] h-[32px] px-[12px] flex items-center justify-center gap-[6px] text-[10px] font-medium text-[#19213d] self-start cursor-pointer"
              >
                <span>Try it out</span>
                <img alt="" className="size-[6px]" src="/assets/portal/34435.svg" />
              </button>
            </div>

            {/* Bottom Actions: Settings & Support */}
            <div className="flex flex-col gap-[4px] pt-[4px] border-t border-[#eaecf0]">
              <button
                type="button"
                onClick={() => {
                  setSettingsInitialTab("profile");
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-[12px] h-[40px] px-[18px] py-[6px] rounded-[10px] text-[#19213d] hover:bg-[#f2f4f7] transition-colors text-left cursor-pointer"
              >
                <img alt="" className="size-[16px]" src="/assets/portal/acb1b.svg" />
                <span className="text-[14px] font-normal tracking-[0.28px]">Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSupportInitialTab("knowledge");
                  setIsSupportOpen(true);
                }}
                className="flex items-center gap-[12px] h-[40px] px-[18px] py-[6px] rounded-[10px] text-[#19213d] hover:bg-[#f2f4f7] transition-colors text-left cursor-pointer"
              >
                <img alt="" className="size-[16px]" src="/assets/portal/aafc0.svg" />
                <span className="text-[14px] font-normal tracking-[0.28px]">Support Center</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ===================== RIGHT CONTENT AREA (1623px) ===================== */}
        <main className="flex-1 min-w-0 p-[28px] lg:px-[32px] overflow-y-auto">
          {/* TAB 1: [E1] USER PORTAL - HOME */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-[20px] max-w-[1600px] mx-auto animate-fade-in">
              {/* Header Bar */}
              <div className="flex items-center justify-between h-[36px]">
                <div className="flex items-center gap-[10px]">
                  <img alt="" className="size-[20px]" src="/assets/portal/837c3.svg" />
                  <h1 className="font-medium text-[20px] text-[#19213d]">Home</h1>
                </div>
                <div className="bg-white border border-[#c9c9c9]/60 rounded-[7px] h-[36px] w-[285px] flex items-center px-[12px] gap-[8px]">
                  <img alt="" className="size-[14px] opacity-60" src="/assets/portal/0f371.svg" />
                  <input
                    type="text"
                    placeholder="Search assets, orders..."
                    className="bg-transparent text-[13px] text-[#19213d] placeholder:text-[rgba(25,33,61,0.4)] outline-none w-full"
                  />
                </div>
              </div>

              {/* Top Row: Profile (351px) | Credits (349px) | Usage Chart (835px) */}
              <div className="grid grid-cols-1 xl:grid-cols-[351px_349px_1fr] gap-[12px]">
                {/* Profile Card */}
                <div className="bg-white h-[269px] rounded-[10px] p-[28px] flex flex-col justify-between overflow-hidden shadow-xs">
                  <div className="flex items-center gap-[12px]">
                    <div className="bg-[#1f1f1f] rounded-[11px] size-[50px] flex items-center justify-center shrink-0 text-white text-[32px] font-medium">
                      #
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-[17px] text-[#19213d] leading-[1.1]">
                        {userProfile.firstName} {userProfile.lastName}
                      </p>
                      <p className="text-[14px] text-[rgba(25,33,61,0.7)] leading-[1.1] mt-[4px]">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[10px] text-[14px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(25,33,61,0.7)]">Account Type</span>
                      <div className="flex gap-[4px]">
                        <span className="bg-[#e0e0e0] text-[#004e64] text-[10px] font-normal px-[9px] py-[4px] rounded-[5px]">
                          Business
                        </span>
                        <span className="bg-[#bee7f6] text-[#004e64] text-[10px] font-normal px-[9px] py-[4px] rounded-[5px]">
                          Developer
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(25,33,61,0.7)]">Organization</span>
                      <span className="font-medium text-[#19213d]">{userProfile.organization}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(25,33,61,0.7)]">Field</span>
                      <span className="font-medium text-[#19213d]">{userProfile.field}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSettingsInitialTab("profile");
                      setIsSettingsOpen(true);
                    }}
                    className="bg-[#eaecf0] hover:bg-[#dfe2e6] transition-colors rounded-[6px] px-[12px] py-[8px] flex items-center justify-center gap-[8px] text-[12px] font-medium text-[#19213d] cursor-pointer self-start"
                  >
                    <span>Edit Profile</span>
                    <img alt="" className="size-[6px]" src="/assets/portal/34435.svg" />
                  </button>
                </div>

                {/* Available Credits Card */}
                <div className="bg-white h-[269px] rounded-[10px] p-[28px] flex flex-col justify-between overflow-hidden shadow-xs">
                  <div className="flex items-center gap-[12px]">
                    <div className="size-[50px] shrink-0">
                      <img alt="" className="size-full" src="/assets/portal/bbe53.svg" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-[rgba(25,33,61,0.7)] font-medium">
                        Available Credits
                      </span>
                      <span className="text-[32px] font-normal text-[#19213d] tracking-tight">
                        {creditBalance.toLocaleString("de-DE")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[8px] text-[14px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(25,33,61,0.7)]">This Month</span>
                      <span className="font-medium text-[#19213d]">203 spent</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(25,33,61,0.7)]">Total Spent</span>
                      <span className="font-medium text-[#19213d]">3,394 Credits</span>
                    </div>
                    <div className="flex items-center gap-[6px] text-[#008f1f] text-[12px]">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="#008f1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>+12% from last month</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("credits")}
                    className="bg-[#eaecf0] hover:bg-[#dfe2e6] transition-colors rounded-[6px] px-[12px] py-[8px] flex items-center justify-center gap-[8px] text-[12px] font-medium text-[#19213d] cursor-pointer self-start"
                  >
                    <span>Manage Credits & Payment</span>
                    <img alt="" className="size-[6px]" src="/assets/portal/34435.svg" />
                  </button>
                </div>

                {/* Interactive SVG Usage Area Chart */}
                <div className="bg-white h-[269px] rounded-[10px] p-[20px] relative overflow-hidden shadow-xs flex flex-col justify-between">
                  {/* Top Bar with Filter */}
                  <div className="flex items-center justify-between z-10">
                    <div>
                      <p className="font-bold text-[15px] text-[#19213d]">Usage Activity</p>
                      <p className="text-[12px] text-[rgba(25,33,61,0.6)]">Daily credit consumption</p>
                    </div>
                    <div className="bg-[#f8f8f8] border border-[#19213d]/20 rounded-[8px] p-[2px] flex items-center gap-[2px]">
                      {(["1d", "1w", "1m", "6m", "1y"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setHomeUsageRange(r)}
                          className={`px-[8px] py-[3px] rounded-[5px] text-[12px] font-medium transition-colors cursor-pointer ${
                            homeUsageRange === r
                              ? "bg-[#19213d] text-white"
                              : "text-[rgba(25,33,61,0.7)] hover:text-[#19213d]"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Chart Body */}
                  <div className="relative h-[175px] w-full flex items-end">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-[24px] flex flex-col justify-between text-[10px] text-[rgba(25,33,61,0.6)] font-mono pointer-events-none">
                      <span>40</span>
                      <span>30</span>
                      <span>20</span>
                      <span>10</span>
                      <span>0</span>
                    </div>

                    {/* SVG Graphic with Area Gradient & Curved Line */}
                    <div className="absolute left-[30px] right-0 top-0 bottom-[24px]">
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 120">
                        <defs>
                          <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#004bda" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#004bda" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal Grid lines */}
                        <line x1="0" y1="0" x2="700" y2="0" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="0" y1="30" x2="700" y2="30" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="0" y1="60" x2="700" y2="60" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="0" y1="90" x2="700" y2="90" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="0" y1="120" x2="700" y2="120" stroke="#f0f0f0" strokeWidth="1" />

                        {/* Smooth Area */}
                        <path
                          d="M 50,84 Q 150,66 250,36 T 350,72 T 450,48 T 550,18 T 650,54 L 650,120 L 50,120 Z"
                          fill="url(#blueAreaGrad)"
                        />
                        {/* Smooth Line */}
                        <path
                          d="M 50,84 Q 150,66 250,36 T 350,72 T 450,48 T 550,18 T 650,54"
                          fill="none"
                          stroke="#004bda"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Active vertical cursor line & Badge on Thursday (X=350) */}
                        {hoveredDayIndex !== null && (
                          <g>
                            <line
                              x1={50 + hoveredDayIndex * 100}
                              y1="10"
                              x2={50 + hoveredDayIndex * 100}
                              y2="120"
                              stroke="#004bda"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={50 + hoveredDayIndex * 100}
                              cy={hoveredDayIndex === 3 ? 72 : 50}
                              r="5"
                              fill="#004bda"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* Tooltip Badge */}
                    {hoveredDayIndex !== null && (
                      <div
                        className="absolute -top-[5px] -translate-x-1/2 bg-[#004bda] text-white font-medium text-[12px] px-[8px] py-[3px] rounded-[6px] shadow-sm pointer-events-none transition-all"
                        style={{ left: `calc(30px + ${(hoveredDayIndex + 0.5) * 14.28}%)` }}
                      >
                        {USAGE_DATA[hoveredDayIndex].val}
                      </div>
                    )}

                    {/* X-axis days */}
                    <div className="w-full flex justify-between pl-[40px] pr-[10px] text-[11px] text-[rgba(25,33,61,0.7)] font-medium">
                      {USAGE_DATA.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseEnter={() => setHoveredDayIndex(idx)}
                          onClick={() => setHoveredDayIndex(idx)}
                          className={`w-[24px] text-center cursor-pointer transition-colors ${
                            hoveredDayIndex === idx ? "text-[#004bda] font-bold" : "hover:text-[#19213d]"
                          }`}
                        >
                          {item.day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Download Center (Left 50%) | Financial & Activity (Right 50%) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-[12px]">
                {/* Left: Download Center Card (606px) */}
                <div className="bg-white h-[606px] rounded-[10px] p-[28px] flex flex-col justify-between overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between pb-[16px] border-b border-[#eaecf0]">
                    <h3 className="font-bold text-[16px] text-[#19213d]">Download Center</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("downloads")}
                      className="bg-[#eaecf0] hover:bg-[#dfe2e6] transition-colors rounded-[6px] px-[12px] py-[7px] flex items-center gap-[6px] text-[12px] font-medium text-[#19213d] cursor-pointer"
                    >
                      <span>Manage Downloaded Content</span>
                      <img alt="" className="size-[6px]" src="/assets/portal/34435.svg" />
                    </button>
                  </div>

                  {/* Scrollable Order List */}
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-[8px] pt-[12px]">
                    {[
                      {
                        id: "order-1",
                        title: "Order #1231289y3123",
                        paths: [
                          "general-model/quangtri-citadel/incense",
                          "hdris/quangtri-citadel/canon",
                          "kit-bash/quangtri-citadel/maingate",
                        ],
                        credits: 323,
                        date: "23/12/2025",
                      },
                      {
                        id: "order-2",
                        title: "Order #1231289y3124",
                        paths: [
                          "general-model/quangtri-citadel/incense",
                          "general-model/quangtri-citadel/incense",
                        ],
                        credits: 4124,
                        date: "23/12/2025",
                      },
                      {
                        id: "order-3",
                        title: "Order #1231289y3125",
                        paths: [
                          "general-model/quangtri-citadel/incense",
                          "general-model/quangtri-citadel/incense",
                        ],
                        credits: 4124,
                        date: "23/12/2025",
                      },
                      {
                        id: "order-4",
                        title: "Order #1231289y3126",
                        paths: [
                          "general-model/quangtri-citadel/incense",
                          "hdris/quangtri-citadel/canon",
                          "kit-bash/quangtri-citadel/maingate",
                        ],
                        credits: 323,
                        date: "23/12/2025",
                      },
                    ].map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#f8f8f8] hover:bg-[#f2f4f7] transition-colors p-[16px] rounded-[8px] flex items-start justify-between cursor-pointer"
                        onClick={() => setActiveTab("downloads")}
                      >
                        <div className="flex items-start gap-[12px]">
                          <div className="size-[32px] rounded-full bg-[#19213d] flex items-center justify-center text-white text-[18px] font-bold shrink-0">
                            #
                          </div>
                          <div className="flex flex-col gap-[3px]">
                            <p className="font-bold text-[13px] text-[#19213d]">{order.title}</p>
                            {order.paths.map((p, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-[6px] text-[11px] text-[rgba(25,33,61,0.7)]">
                                <img alt="" className="size-[10px]" src="/assets/portal/325d9.svg" />
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between h-full">
                          <div className="flex items-center gap-[4px] text-[13px] font-bold text-[#19213d]">
                            <img alt="" className="size-[14px]" src="/assets/portal/791ce.svg" />
                            <span>{order.credits}</span>
                          </div>
                          <span className="text-[11px] text-[rgba(25,33,61,0.6)] mt-2">{order.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Stacked Widgets (Financial + Notifications/Activity) */}
                <div className="flex flex-col gap-[12px]">
                  {/* Top: 3-tab Financial Widget (258px) */}
                  <div className="bg-white h-[258px] rounded-[10px] p-[16px] flex flex-col justify-between shadow-xs">
                    {/* Tabs */}
                    <div className="bg-[#f9f9f9] rounded-[10px] p-[3px] flex items-center gap-[6px] self-start">
                      {(["transactions", "payment", "billing"] as const).map((tab) => {
                        const labels = {
                          transactions: "Transactions Log",
                          payment: "Payment Method",
                          billing: "Billing Address",
                        };
                        const isSelected = financialTab === tab;
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setFinancialTab(tab)}
                            className={`px-[12px] py-[5px] rounded-[8px] text-[13px] transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#e7e7e7] font-bold text-[#19213d] shadow-2xs"
                                : "text-[rgba(25,33,61,0.7)] hover:text-[#19213d]"
                            }`}
                          >
                            {labels[tab]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Content for Financial widget */}
                    <div className="flex-1 py-[12px] overflow-hidden">
                      {financialTab === "transactions" && (
                        <div className="grid grid-cols-2 gap-[16px] h-full items-center">
                          {/* Left: Credit stats */}
                          <div className="flex flex-col gap-[6px] border-r border-[#eaecf0] pr-[12px] text-[13px]">
                            <p className="font-bold text-[14px] text-[#19213d]">Credit Statistics</p>
                            <div className="flex justify-between text-[rgba(25,33,61,0.7)]">
                              <span>This month:</span>
                              <span className="font-medium text-[#19213d]">283 credits</span>
                            </div>
                            <div className="flex justify-between text-[rgba(25,33,61,0.7)]">
                              <span>Total spent:</span>
                              <span className="font-medium text-[#19213d]">3,394 credits</span>
                            </div>
                            <div className="flex justify-between text-[rgba(25,33,61,0.7)]">
                              <span>Average per asset:</span>
                              <span className="font-medium text-[#19213d]">203 credits</span>
                            </div>
                            <div className="flex justify-between text-[rgba(25,33,61,0.7)]">
                              <span>Account value:</span>
                              <span className="font-medium text-[#008f1f]">$283,33</span>
                            </div>
                          </div>

                          {/* Right: Quick recent items */}
                          <div className="flex flex-col gap-[8px]">
                            <div className="flex items-center justify-between text-[13px]">
                              <div>
                                <p className="font-bold text-[#19213d]">Credit Purchase</p>
                                <p className="text-[11px] text-[rgba(25,33,61,0.6)]">Aug 12, 2025</p>
                              </div>
                              <span className="text-[#008f1f] font-bold">+100</span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                              <div>
                                <p className="font-bold text-[#19213d]">Quang Tri Citadel</p>
                                <p className="text-[11px] text-[rgba(25,33,61,0.6)]">Aug 10, 2025</p>
                              </div>
                              <span className="text-[#eb5757] font-bold">-100</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {financialTab === "payment" && (
                        <div className="flex items-center justify-between h-full">
                          <div className="flex flex-col gap-[8px]">
                            <div className="flex items-center gap-[10px]">
                              <span className="bg-[#1a1f71] text-white text-[11px] font-bold px-[8px] py-[3px] rounded">
                                VISA
                              </span>
                              <span className="font-medium text-[13px] text-[#19213d]">•••• 8288</span>
                              <span className="bg-[#bff6be] text-[#006401] text-[10px] font-bold px-[6px] py-[1px] rounded">
                                Primary
                              </span>
                            </div>
                            <div className="flex items-center gap-[10px]">
                              <span className="bg-[#003087] text-white text-[11px] font-bold px-[8px] py-[3px] rounded">
                                PayPal
                              </span>
                              <span className="text-[13px] text-[rgba(25,33,61,0.7)]">@david_onflow</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsInitialTab("billing");
                              setIsSettingsOpen(true);
                            }}
                            className="bg-[#eaecf0] hover:bg-[#dfe2e6] text-[#19213d] text-[12px] font-medium px-[14px] py-[8px] rounded-[8px] cursor-pointer"
                          >
                            + Add Payment Method
                          </button>
                        </div>
                      )}

                      {financialTab === "billing" && (
                        <div className="flex items-center justify-between h-full text-[13px]">
                          <div>
                            <p className="font-bold text-[#19213d]">Onflow Asia Ltd.</p>
                            <p className="text-[rgba(25,33,61,0.7)]">123 Innovation Drive, Floor 5</p>
                            <p className="text-[rgba(25,33,61,0.7)]">Hanoi, Vietnam • Tax ID: VN-01099281</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsInitialTab("billing");
                              setIsSettingsOpen(true);
                            }}
                            className="text-[#004bda] font-bold hover:underline cursor-pointer"
                          >
                            Edit Address
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#eaecf0] pt-[8px] flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab("credits")}
                        className="text-[#004bda] text-[12px] font-bold hover:underline flex items-center gap-[4px] cursor-pointer"
                      >
                        <span>View Details</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom: Notifications (Left) & Team Activity (Right) (336px) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] h-[336px]">
                    {/* Notifications Card */}
                    <div className="bg-white rounded-[10px] p-[16px] flex flex-col justify-between shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[15px] text-[#19213d]">Notifications</span>
                        <button
                          type="button"
                          onClick={() => showToast("All notifications marked as read")}
                          className="text-[#004bda] text-[12px] hover:underline cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      <div className="flex flex-col gap-[12px] my-auto">
                        <div className="flex items-start gap-[10px]">
                          <div className="bg-[#e8f5e9] size-[32px] rounded-[8px] flex items-center justify-center shrink-0">
                            <img alt="" className="size-[16px]" src="/assets/portal/95fea.svg" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[13px] text-[#19213d]">Download Complete</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.7)]">Order #1231289y3123 is ready</p>
                          </div>
                          <span className="text-[10px] text-[rgba(25,33,61,0.6)]">2m ago</span>
                        </div>

                        <div className="flex items-start gap-[10px]">
                          <div className="bg-[#e3f2fd] size-[32px] rounded-[8px] flex items-center justify-center shrink-0">
                            <img alt="" className="size-[16px]" src="/assets/portal/0e2ee.svg" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[13px] text-[#19213d]">Credits Added</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.7)]">+500 credits to your account</p>
                          </div>
                          <span className="text-[10px] text-[rgba(25,33,61,0.6)]">1h ago</span>
                        </div>

                        <div className="flex items-start gap-[10px]">
                          <div className="bg-[#fff3e0] size-[32px] rounded-[8px] flex items-center justify-center shrink-0">
                            <img alt="" className="size-[16px]" src="/assets/portal/2e583.svg" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[13px] text-[#19213d]">System Update</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.7)]">New features are now available</p>
                          </div>
                          <span className="text-[10px] text-[rgba(25,33,61,0.6)]">3h ago</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[rgba(25,33,61,0.5)] text-center">
                        Updated in real-time
                      </div>
                    </div>

                    {/* Team Activity Card */}
                    <div className="bg-white rounded-[10px] p-[16px] flex flex-col justify-between shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[15px] text-[#19213d]">Team Activity</span>
                        <button
                          type="button"
                          onClick={() => showToast("Opening Team Members log...")}
                          className="text-[#004bda] text-[12px] hover:underline cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      <div className="flex flex-col gap-[12px] my-auto">
                        <div className="flex items-center gap-[10px]">
                          <div className="bg-[#4a90e2] size-[32px] rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                            J
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[13px] text-[#19213d]">John Smith</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.7)]">downloaded 3 assets</p>
                          </div>
                          <span className="text-[10px] text-[rgba(25,33,61,0.6)]">5m ago</span>
                        </div>

                        <div className="flex items-center gap-[10px]">
                          <div className="bg-[#e91e63] size-[32px] rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                            M
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[13px] text-[#19213d]">Maria Garcia</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.7)]">added 200 credits</p>
                          </div>
                          <span className="text-[10px] text-[rgba(25,33,61,0.6)]">15m ago</span>
                        </div>

                        <div className="flex items-center gap-[10px]">
                          <div className="bg-[#8e44ad] size-[32px] rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                            D
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[13px] text-[#19213d]">David Lee</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.7)]">updated project settings</p>
                          </div>
                          <span className="text-[10px] text-[rgba(25,33,61,0.6)]">1h ago</span>
                        </div>

                        <div className="flex items-center gap-[10px]">
                          <div className="bg-[#23a26d] size-[32px] rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                            S
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[13px] text-[#19213d]">Sarah Johnson</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.7)]">joined the team</p>
                          </div>
                          <span className="text-[10px] text-[rgba(25,33,61,0.6)]">2h ago</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[rgba(25,33,61,0.5)] text-center">
                        Organization: {userProfile.organization}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: [E2] USER PORTAL - DOWNLOAD CENTER */}
          {activeTab === "downloads" && (
            <div className="flex flex-col xl:flex-row gap-[16px] max-w-[1600px] mx-auto animate-fade-in">
              {/* Left Column (1086px): Purchase History List */}
              <div className="flex-1 bg-white rounded-[10px] p-[28px] shadow-xs flex flex-col gap-[20px]">
                {/* Search & Sort Bar */}
                <div className="flex flex-wrap items-center justify-between gap-[16px]">
                  <h2 className="font-bold text-[20px] text-[#19213d]">Purchase History</h2>
                  <div className="flex items-center gap-[12px]">
                    <div className="bg-[#f8f8f8] border border-[#eaecf0] rounded-[8px] h-[36px] w-[280px] flex items-center px-[12px] gap-[8px]">
                      <img alt="" className="size-[14px] opacity-60" src="/assets/portal/0f371.svg" />
                      <input
                        type="text"
                        value={downloadSearch}
                        onChange={(e) => setDownloadSearch(e.target.value)}
                        placeholder="Search assets...."
                        className="bg-transparent text-[13px] text-[#19213d] outline-none w-full"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={downloadSort}
                        onChange={(e) => setDownloadSort(e.target.value)}
                        className="appearance-none bg-[#f8f8f8] border border-[#eaecf0] rounded-[8px] h-[36px] pl-[12px] pr-[30px] text-[13px] text-[#19213d] font-medium outline-none cursor-pointer"
                      >
                        <option value="Relevance">Short by: Relevance</option>
                        <option value="Newest">Short by: Newest</option>
                        <option value="Credits">Short by: Credits</option>
                      </select>
                      <img
                        alt=""
                        className="size-[12px] absolute right-[10px] top-[12px] pointer-events-none"
                        src="/assets/portal/21533.svg"
                      />
                    </div>
                  </div>
                </div>

                {/* Orders List with Detailed Configurator */}
                <div className="flex flex-col gap-[12px]">
                  {/* Order Item 1 */}
                  <div className="bg-[#f8f8f8] border border-[#eaecf0] rounded-[10px] p-[16px] flex flex-col gap-[14px]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-[12px] flex-1">
                        <div className="size-[32px] rounded-full bg-[#19213d] flex items-center justify-center text-white text-[18px] font-bold shrink-0">
                          #
                        </div>
                        <div className="flex-1 flex flex-col gap-[8px]">
                          <span className="font-bold text-[16px] text-[#19213d]">
                            Order #1231289y3123
                          </span>

                          {/* Asset Row with Configurator Box */}
                          <div className="flex flex-col gap-[10px]">
                            <button
                              type="button"
                              onClick={() => setExpandedAsset(expandedAsset === "asset-1" ? null : "asset-1")}
                              className="flex items-center gap-[6px] text-left cursor-pointer hover:opacity-80"
                            >
                              <img alt="" className="size-[12px]" src="/assets/portal/2486e.svg" />
                              <span className="font-medium text-[14px] text-[#19213d]">
                                general-model/quangtri-citadel/incense
                              </span>
                            </button>

                            {/* Detailed Configurator Overlay Box */}
                            {expandedAsset === "asset-1" && (
                              <div className="bg-[#eaecf0] rounded-[16px] p-[20px] flex flex-col gap-[20px] animate-fade-in border border-[#c9c9c9]/60">
                                <div className="flex items-center gap-[10px]">
                                  <div className="bg-[#1f1f1f] rounded-[10px] size-[36px] flex items-center justify-center text-white text-[20px] font-bold">
                                    #
                                  </div>
                                  <div>
                                    <p className="font-bold text-[14px] text-[#19213d]">
                                      White Marble Incense Burner
                                    </p>
                                    <p className="text-[12px] text-[rgba(25,33,61,0.7)]">
                                      Quang Tri Citadel Collection
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                                  {/* Poly selection */}
                                  <div className="flex flex-col gap-[8px]">
                                    <div
                                      onClick={() => setSelectedPolyMode("high")}
                                      className={`bg-white rounded-[10px] p-[12px] flex items-center justify-between cursor-pointer border-2 transition-all ${
                                        selectedPolyMode === "high"
                                          ? "border-[#004bda]"
                                          : "border-transparent"
                                      }`}
                                    >
                                      <div>
                                        <p className="font-bold text-[14px] text-[#19213d]">High-Poly</p>
                                        <p className="text-[11px] text-[rgba(25,33,61,0.6)]">
                                          Full geometry 4.2M triangles
                                        </p>
                                      </div>
                                      <span className="bg-[#bff6be] text-[#006401] text-[10px] font-bold px-[8px] py-[3px] rounded">
                                        Owned
                                      </span>
                                    </div>

                                    <div
                                      onClick={() => setSelectedPolyMode("lod")}
                                      className={`bg-white rounded-[10px] p-[12px] flex items-center justify-between cursor-pointer border-2 transition-all ${
                                        selectedPolyMode === "lod"
                                          ? "border-[#004bda]"
                                          : "border-transparent"
                                      }`}
                                    >
                                      <div>
                                        <p className="font-bold text-[14px] text-[#19213d]">
                                          Level of Details
                                        </p>
                                        <p className="text-[11px] text-[rgba(25,33,61,0.6)]">
                                          Optimized LOD 1 to LOD 4
                                        </p>
                                      </div>
                                      <span className="bg-[#eaecf0] text-[#19213d] text-[10px] font-bold px-[8px] py-[3px] rounded">
                                        Included
                                      </span>
                                    </div>
                                  </div>

                                  {/* Texture Resolution & Format Pickers */}
                                  <div className="flex flex-col gap-[8px]">
                                    <div className="bg-white rounded-[10px] p-[12px] flex items-center justify-between">
                                      <div className="flex-1">
                                        <span className="text-[11px] text-[rgba(25,33,61,0.6)] uppercase tracking-wider block">
                                          Texture resolution
                                        </span>
                                        <select
                                          value={selectedResolution}
                                          onChange={(e) => setSelectedResolution(e.target.value)}
                                          className="font-bold text-[13px] text-[#19213d] bg-transparent outline-none cursor-pointer w-full"
                                        >
                                          <option value="4096x4096 (PNG 16-BIT)">4096x4096 (PNG 16-BIT)</option>
                                          <option value="2048x2048 (PNG 16-BIT)">2048x2048 (PNG 16-BIT)</option>
                                          <option value="1024x1024 (PNG 8-BIT)">1024x1024 (PNG 8-BIT)</option>
                                        </select>
                                      </div>
                                      <img alt="" className="size-[10px]" src="/assets/portal/21533.svg" />
                                    </div>

                                    <div className="bg-white rounded-[10px] p-[12px] flex items-center justify-between">
                                      <div className="flex-1">
                                        <span className="text-[11px] text-[rgba(25,33,61,0.6)] uppercase tracking-wider block">
                                          Object format
                                        </span>
                                        <select
                                          value={selectedFormat}
                                          onChange={(e) => setSelectedFormat(e.target.value)}
                                          className="font-bold text-[13px] text-[#19213d] bg-transparent outline-none cursor-pointer w-full"
                                        >
                                          <option value="FBX">FBX</option>
                                          <option value="OBJ">OBJ</option>
                                          <option value="GLTF">GLTF / GLB</option>
                                          <option value="USDZ">USDZ</option>
                                        </select>
                                      </div>
                                      <img alt="" className="size-[10px]" src="/assets/portal/21533.svg" />
                                    </div>
                                  </div>
                                </div>

                                {/* Download Action Row */}
                                <div className="flex items-center justify-end gap-[20px] pt-[8px] border-t border-[#c9c9c9]/60">
                                  <div className="flex items-center gap-[6px] text-[12px] text-[#19213d]">
                                    <img alt="" className="size-[14px]" src="/assets/portal/30898.svg" />
                                    <span>4,68 MB (.ZIP)</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => triggerMockDownload("White Marble Incense Burner", selectedFormat)}
                                    className="bg-[#004bda] hover:bg-[#003cb3] transition-colors text-white font-medium text-[14px] px-[20px] py-[8px] rounded-[10px] flex items-center gap-[8px] shadow-sm cursor-pointer"
                                  >
                                    <span>Download</span>
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                      <path d="M8 2V11M8 11L4 7M8 11L12 7M2 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Additional paths */}
                            <div className="flex items-center gap-[6px] text-[13px] text-[rgba(25,33,61,0.7)]">
                              <img alt="" className="size-[12px]" src="/assets/portal/71f7d.svg" />
                              <span>hdris/quangtri-citadel/canon</span>
                            </div>
                            <div className="flex items-center gap-[6px] text-[13px] text-[rgba(25,33,61,0.7)]">
                              <img alt="" className="size-[12px]" src="/assets/portal/71f7d.svg" />
                              <span>kit-bash/quangtri-citadel/maingate</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-[4px] font-bold text-[14px] text-[#19213d]">
                        <img alt="" className="size-[18px]" src="/assets/portal/a7fb2.svg" />
                        <span>323</span>
                      </div>
                    </div>
                    <div className="flex justify-end text-[12px] text-[rgba(25,33,61,0.7)] border-t border-[#eaecf0] pt-[8px]">
                      23/12/2025 at 06:50 AM, UTC +7 GMT
                    </div>
                  </div>

                  {/* Order Item 2 */}
                  <div className="bg-[#f8f8f8] border border-[#eaecf0] rounded-[10px] p-[16px] flex flex-col gap-[10px]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-[12px]">
                        <div className="size-[32px] rounded-full bg-[#19213d] flex items-center justify-center text-white text-[18px] font-bold shrink-0">
                          #
                        </div>
                        <div className="flex flex-col gap-[4px]">
                          <span className="font-bold text-[16px] text-[#19213d]">
                            Order #1231289y3124
                          </span>
                          <div className="flex items-center gap-[6px] text-[13px] text-[rgba(25,33,61,0.7)]">
                            <img alt="" className="size-[12px]" src="/assets/portal/71f7d.svg" />
                            <span>materials/thanglong/stone-texture</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-[4px] font-bold text-[14px] text-[#19213d]">
                        <img alt="" className="size-[18px]" src="/assets/portal/a7fb2.svg" />
                        <span>120</span>
                      </div>
                    </div>
                    <div className="flex justify-end text-[12px] text-[rgba(25,33,61,0.7)] border-t border-[#eaecf0] pt-[8px]">
                      21/12/2025 at 09:15 AM, UTC +7 GMT
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (458px): Side Cards */}
              <div className="w-full xl:w-[458px] shrink-0 flex flex-col gap-[12px]">
                {/* Available Credits Card */}
                <div className="bg-white rounded-[10px] p-[28px] flex flex-col gap-[28px] shadow-xs">
                  <div className="flex items-center gap-[12px]">
                    <div className="size-[50px] shrink-0">
                      <img alt="" className="size-full" src="/assets/portal/bbe53.svg" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-[rgba(25,33,61,0.7)] font-medium">
                        Available Credits
                      </span>
                      <span className="text-[32px] font-normal text-[#19213d]">
                        {creditBalance.toLocaleString("de-DE")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[8px] text-[14px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(25,33,61,0.7)]">This Month</span>
                      <span className="font-medium text-[#19213d]">203 spent</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(25,33,61,0.7)]">Total Spent</span>
                      <span className="font-medium text-[#19213d]">3,394 Credits</span>
                    </div>
                    <div className="flex items-center gap-[6px] text-[#008f1f] text-[12px]">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="#008f1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>+12% from last month</span>
                    </div>
                  </div>

                  <div className="flex gap-[12px]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("credits")}
                      className="flex-1 bg-[#eaecf0] hover:bg-[#dfe2e6] text-[#19213d] text-[12px] font-medium py-[8px] rounded-[10px] transition-colors cursor-pointer text-center"
                    >
                      Manage Credits& Payment →
                    </button>
                    <Link
                      href="/payment"
                      className="flex-1 bg-[#004bda] hover:bg-[#003cb3] text-white text-[12px] font-medium py-[8px] rounded-[10px] transition-colors cursor-pointer text-center shadow-xs no-underline"
                    >
                      Purchase more Credits →
                    </Link>
                  </div>
                </div>

                {/* Storage Usage Card */}
                <div className="bg-white rounded-[10px] p-[24px] flex flex-col gap-[16px] shadow-xs">
                  <h3 className="font-bold text-[16px] text-[#19213d]">Storage Usage</h3>
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="text-[rgba(25,33,61,0.7)]">Used Space</span>
                      <span className="font-bold text-[#19213d]">45.2 GB / 100 GB</span>
                    </div>
                    {/* Progress bar */}
                    <div className="bg-[#eaecf0] h-[8px] rounded-full overflow-hidden">
                      <div className="bg-[#004bda] h-full rounded-full transition-all" style={{ width: "45.2%" }} />
                    </div>
                    <p className="text-[12px] text-[rgba(25,33,61,0.5)]">
                      Your storage is 45% full. Upgrade for more space.
                    </p>
                  </div>
                </div>

                {/* Need Help? Card */}
                <div className="bg-white rounded-[10px] p-[24px] flex flex-col gap-[14px] shadow-xs">
                  <h3 className="font-bold text-[16px] text-[#19213d]">Need Help?</h3>
                  <p className="text-[14px] text-[rgba(25,33,61,0.7)] leading-[22px]">
                    Having trouble with your downloads or licenses? Our support team is here to help.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSupportInitialTab("contact");
                      setIsSupportOpen(true);
                    }}
                    className="border border-[#eaecf0] hover:bg-[#f8f9fa] transition-colors rounded-[10px] py-[11px] font-medium text-[14px] text-[#19213d] text-center cursor-pointer"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: [E3] USER PORTAL - ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-[16px] max-w-[1600px] mx-auto animate-fade-in">
              {/* Top Row: 4 StatCards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[12px]">
                {[
                  { title: "Total Downloads", value: "1,284", sub: "This month", trend: "+23.5%", positive: true },
                  { title: "Credits Spent", value: "45,612", sub: "This month", trend: "+12.3%", positive: true },
                  { title: "Avg. per Download", value: "35.5", sub: "Credits", trend: "-5.2%", positive: false },
                  { title: "Active Days", value: "18", sub: "Out of 30 days", trend: "+8.1%", positive: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-[10px] p-[24px] shadow-xs flex flex-col justify-between h-[163px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-medium text-[rgba(25,33,61,0.7)]">{stat.title}</span>
                      <span
                        className={`text-[11px] font-bold px-[8px] py-[2px] rounded-full ${
                          stat.positive ? "bg-[#bff6be] text-[#006401]" : "bg-[#ffe0e0] text-[#c92a2a]"
                        }`}
                      >
                        {stat.trend}
                      </span>
                    </div>
                    <div>
                      <p className="text-[32px] font-normal text-[#19213d]">{stat.value}</p>
                      <p className="text-[12px] text-[rgba(25,33,61,0.5)] mt-1">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Middle Row: Downloads by Category (Left) & Credit Usage (Right) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-[12px]">
                {/* Downloads by Category bar chart */}
                <div className="bg-white rounded-[10px] p-[24px] h-[415px] shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[16px] text-[#19213d]">Downloads by Category</h3>
                      <p className="text-[12px] text-[rgba(25,33,61,0.7)]">Distribution of asset types</p>
                    </div>
                    <span className="bg-[#f2f4f7] px-[12px] py-[4px] rounded-[8px] text-[12px] font-medium text-[rgba(25,33,61,0.7)]">
                      Last 30 Days
                    </span>
                  </div>

                  {/* Interactive Bar Chart Graphic */}
                  <div className="relative h-[280px] w-full flex items-end pt-[20px]">
                    {/* Y-axis */}
                    <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between text-[11px] text-[rgba(25,33,61,0.7)] font-mono pointer-events-none">
                      <span>320</span>
                      <span>240</span>
                      <span>160</span>
                      <span>80</span>
                      <span>0</span>
                    </div>

                    {/* Bars Grid */}
                    <div className="flex-1 ml-[40px] h-[220px] flex items-end justify-between px-[12px] border-b border-[#eaecf0] relative">
                      {CATEGORY_BARS.map((cat, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative"
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          {/* Hover tooltip */}
                          {hoveredBarIndex === idx && (
                            <div className="absolute -top-[32px] bg-[#19213d] text-white text-[11px] font-bold px-[8px] py-[3px] rounded shadow-md z-10 animate-fade-in pointer-events-none whitespace-nowrap">
                              {cat.count} downloads
                            </div>
                          )}
                          <div
                            className="w-[28px] rounded-t-[4px] transition-all duration-300"
                            style={{
                              height: `${cat.heightPct}%`,
                              backgroundColor: hoveredBarIndex === idx ? "#003cb3" : "#004bda",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between pl-[40px] pr-[12px] text-[11px] text-[rgba(25,33,61,0.7)]">
                    {CATEGORY_BARS.map((cat, idx) => (
                      <span key={idx} className="flex-1 text-center truncate">
                        {cat.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Credit Usage area chart */}
                <div className="bg-white rounded-[10px] p-[24px] h-[415px] shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[16px] text-[#19213d]">Credit Usage</h3>
                      <p className="text-[12px] text-[rgba(25,33,61,0.7)]">Usage trends over time</p>
                    </div>
                    <div className="bg-[#f8f8f8] rounded-[10px] p-[3px] flex gap-[4px]">
                      {(["1w", "1m", "6m", "1y"] as const).map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setAnalyticsCreditRange(range)}
                          className={`px-[12px] py-[4px] rounded-[8px] text-[11px] font-medium transition-colors cursor-pointer ${
                            analyticsCreditRange === range
                              ? "bg-white text-[#19213d] shadow-2xs font-bold"
                              : "text-[rgba(25,33,61,0.7)] hover:text-[#19213d]"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Area Chart */}
                  <div className="relative h-[250px] w-full flex items-end">
                    <div className="absolute left-0 top-0 bottom-[24px] flex flex-col justify-between text-[11px] text-[rgba(25,33,61,0.7)] font-mono pointer-events-none">
                      <span>10000</span>
                      <span>7500</span>
                      <span>5000</span>
                      <span>2500</span>
                      <span>0</span>
                    </div>

                    <div className="absolute left-[45px] right-0 top-0 bottom-[24px]">
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 150">
                        <defs>
                          <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#004bda" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#004bda" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="0" x2="700" y2="0" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="37.5" x2="700" y2="37.5" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="75" x2="700" y2="75" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="112.5" x2="700" y2="112.5" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="150" x2="700" y2="150" stroke="#f3f4f6" strokeWidth="1" />

                        <path
                          d="M 50,110 Q 150,85 250,55 T 450,30 T 650,45 L 650,150 L 50,150 Z"
                          fill="url(#analyticsAreaGrad)"
                        />
                        <path
                          d="M 50,110 Q 150,85 250,55 T 450,30 T 650,45"
                          fill="none"
                          stroke="#004bda"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="w-full flex justify-between pl-[60px] pr-[20px] text-[11px] text-[rgba(25,33,61,0.7)] font-medium">
                      <span>Week 1</span>
                      <span>Week 2</span>
                      <span>Week 3</span>
                      <span>Week 4</span>
                    </div>
                  </div>

                  <div className="border-t border-[#f3f4f6] pt-[12px] flex items-center justify-between text-[12px]">
                    <span className="text-[rgba(25,33,61,0.7)]">Total this period</span>
                    <span className="font-bold text-[#19213d]">17,506 Credits</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Top Downloads (859px) & Activity Timeline (687px) */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-[12px]">
                {/* Top Downloads Table */}
                <div className="bg-white rounded-[10px] p-[24px] shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-[16px] border-b border-[#f3f4f6]">
                    <h3 className="font-bold text-[16px] text-[#19213d]">Top Downloads</h3>
                    <button
                      type="button"
                      onClick={() => showToast("Showing full assets report")}
                      className="text-[#004bda] text-[12px] font-medium hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex flex-col divide-y divide-[#f9fafb]">
                    <div className="grid grid-cols-[1fr_140px_100px_100px] text-[12px] text-[rgba(25,33,61,0.7)] uppercase font-medium py-[10px]">
                      <span>Asset Name</span>
                      <span>Category</span>
                      <span className="text-right">Downloads</span>
                      <span className="text-right">Credits</span>
                    </div>
                    {[
                      { name: "Quangtri Citadel Collection", cat: "General Models", dl: 45, credits: "14,535" },
                      { name: "White Marble Collection", cat: "Materials", dl: 38, credits: "5,928" },
                      { name: "HDRI Environment Pack", cat: "HDRIs", dl: 32, credits: "8,960" },
                      { name: "Kit-Bash Architecture Set", cat: "Kit-Bash", dl: 28, credits: "11,536" },
                      { name: "Canon Camera Models", cat: "General Models", dl: 24, credits: "4,752" },
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_140px_100px_100px] items-center text-[13px] py-[12px]">
                        <span className="font-bold text-[#19213d]">{row.name}</span>
                        <span>
                          <span className="bg-[#f2f4f7] text-[#344054] text-[11px] font-medium px-[8px] py-[2px] rounded-full">
                            {row.cat}
                          </span>
                        </span>
                        <span className="text-right text-[#19213d]">{row.dl}</span>
                        <span className="text-right font-bold text-[#19213d]">{row.credits}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white rounded-[10px] p-[24px] shadow-xs flex flex-col justify-between">
                  <h3 className="font-bold text-[16px] text-[#19213d] pb-[16px] border-b border-[#f3f4f6]">
                    Recent Activity
                  </h3>
                  <div className="flex flex-col gap-[16px] my-auto">
                    {[
                      { name: "Quangtri Citadel Collection", time: "23/12/2025 at 14:30", credits: "323" },
                      { name: "White Marble Incense Burner", time: "22/12/2025 at 09:15", credits: "156" },
                      { name: "HDRI Environment Pack", time: "20/12/2025 at 16:45", credits: "280" },
                    ].map((act, i) => (
                      <div key={i} className="flex items-center gap-[12px]">
                        <div className="bg-[#eaecf0] size-[40px] rounded-full flex items-center justify-center shrink-0">
                          <img alt="" className="size-[16px]" src="/assets/portal/4af13.svg" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[13px] text-[#19213d]">
                            Downloaded <span className="font-bold">{act.name}</span>
                          </p>
                          <p className="text-[11px] text-[rgba(25,33,61,0.7)]">{act.time}</p>
                        </div>
                        <div className="flex items-center gap-[4px] text-[12px] font-bold text-[#19213d]">
                          <img alt="" className="size-[14px]" src="/assets/portal/4b7bb.svg" />
                          <span>{act.credits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-[rgba(25,33,61,0.5)] text-center pt-[10px]">
                    Showing latest 3 transactions
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: [E2] USER PORTAL - CREDITS & PAYMENTS */}
          {activeTab === "credits" && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-[16px] max-w-[1600px] mx-auto animate-fade-in">
              {/* Left Column (912px): Balance & Recent Transactions */}
              <div className="flex flex-col gap-[16px]">
                {/* Balance Card */}
                <div className="bg-white rounded-[10px] p-[28px] shadow-xs flex flex-col justify-between h-[259px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[16px]">
                      <div className="size-[70px] shrink-0">
                        <img alt="" className="size-full" src="/assets/portal/bbe53.svg" />
                      </div>
                      <div>
                        <span className="text-[14px] text-[rgba(25,33,61,0.7)] font-medium">
                          Current Balance
                        </span>
                        <p className="text-[36px] font-bold text-[#19213d] tracking-tight">
                          {creditBalance.toLocaleString("de-DE")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-[12px]">
                      <button
                        type="button"
                        onClick={() => setActiveTab("analytics")}
                        className="bg-[#eaecf0] hover:bg-[#dfe2e6] text-[#19213d] text-[13px] font-medium px-[18px] py-[10px] rounded-[8px] transition-colors cursor-pointer"
                      >
                        View Usage History
                      </button>
                      <Link
                        href="/payment"
                        className="bg-[#004bda] hover:bg-[#003cb3] text-white text-[13px] font-medium px-[18px] py-[10px] rounded-[8px] transition-colors cursor-pointer shadow-sm no-underline"
                      >
                        Purchase Credits
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-[16px] border-t border-[#eaecf0] pt-[18px] text-[14px]">
                    <div>
                      <span className="text-[rgba(25,33,61,0.7)] block text-[12px]">This Month</span>
                      <span className="font-bold text-[#19213d]">203 spent</span>
                    </div>
                    <div>
                      <span className="text-[rgba(25,33,61,0.7)] block text-[12px]">Total Spent</span>
                      <span className="font-bold text-[#19213d]">3,394 Credits</span>
                    </div>
                    <div>
                      <span className="text-[rgba(25,33,61,0.7)] block text-[12px]">Total Purchased</span>
                      <span className="font-bold text-[#008f1f]">5,780 Credits</span>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions List Card */}
                <div className="bg-white rounded-[10px] p-[24px] shadow-xs flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between pb-[14px] border-b border-[#f3f4f6]">
                    <h3 className="font-bold text-[16px] text-[#19213d]">Recent Transactions</h3>
                    <button
                      type="button"
                      onClick={() => showToast("Exporting financial statement (.CSV)...")}
                      className="border border-[#eaecf0] hover:bg-[#f8f9fa] text-[#19213d] text-[12px] font-medium px-[14px] py-[7px] rounded-[8px] cursor-pointer"
                    >
                      Download Statement
                    </button>
                  </div>

                  <div className="flex flex-col divide-y divide-[#f3f4f6]">
                    {[
                      { title: "Purchased 5,000 Credits", date: "24/12/2025, 10:14", status: "Completed", amount: "+5,000", isAdd: true },
                      { title: "Quangtri Citadel Collection", date: "23/12/2025, 14:30", status: "Completed", amount: "-323", isAdd: false },
                      { title: "White Marble Incense Burner", date: "22/12/2025, 09:15", status: "Completed", amount: "-156", isAdd: false },
                      { title: "HDRI Environment Pack", date: "20/12/2025, 11:20", status: "Completed", amount: "-280", isAdd: false },
                      { title: "Purchased 2,000 Credits", date: "18/12/2025, 13:50", status: "Pending", amount: "+2,000", isAdd: true },
                      { title: "Kit-Bash Main Gate Set", date: "15/12/2025, 09:30", status: "Completed", amount: "-412", isAdd: false },
                      { title: "Canon Camera 3D Model", date: "12/12/2025, 15:20", status: "Completed", amount: "-198", isAdd: false },
                    ].map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between py-[12px]">
                        <div className="flex items-center gap-[14px]">
                          <div
                            className={`size-[38px] rounded-[10px] flex items-center justify-center shrink-0 ${
                              tx.isAdd ? "bg-[#bff6be]" : "bg-[#eaecf0]"
                            }`}
                          >
                            <img alt="" className="size-[18px]" src="/assets/portal/536b0.svg" />
                          </div>
                          <div>
                            <p className="font-bold text-[13px] text-[#19213d]">{tx.title}</p>
                            <p className="text-[11px] text-[rgba(25,33,61,0.6)]">{tx.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-[16px]">
                          <span
                            className={`text-[10px] font-bold px-[10px] py-[3px] rounded-full ${
                              tx.status === "Pending"
                                ? "bg-[#f2f6be] text-[#644d00]"
                                : "bg-[#bff6be] text-[#006401]"
                            }`}
                          >
                            {tx.status}
                          </span>
                          <span
                            className={`font-bold text-[14px] ${
                              tx.isAdd ? "text-[#008f1f]" : "text-[#19213d]"
                            }`}
                          >
                            {tx.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Methods, Billing, Account Info */}
              <div className="flex flex-col gap-[14px]">
                {/* Payment Methods */}
                <div className="bg-white rounded-[10px] p-[16px] border border-[#eaecf0] shadow-xs flex flex-col gap-[12px]">
                  <h3 className="font-bold text-[14px] text-[#19213d]">Payment Methods</h3>
                  <div className="flex flex-col gap-[8px]">
                    <div className="bg-[#f9f9f9] rounded-[8px] p-[10px] flex items-center justify-between">
                      <div className="flex items-center gap-[10px]">
                        <span className="font-bold text-[13px] text-[#1a1f71]">VISA</span>
                        <span className="text-[12px] text-[#19213d]">•••• 4242</span>
                      </div>
                      <span className="bg-[#bff6be] text-[#006401] text-[9px] font-bold px-[8px] py-[2px] rounded">
                        Default
                      </span>
                    </div>

                    <div className="border border-[#eaecf0] rounded-[8px] p-[10px] flex items-center gap-[10px]">
                      <div className="bg-[#eb001b] rounded-full size-[14px]" />
                      <span className="text-[12px] text-[#19213d]">•••• 8888</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSettingsInitialTab("billing");
                        setIsSettingsOpen(true);
                      }}
                      className="border border-dashed border-[#d1d5dc] hover:border-[#004bda] text-[#004bda] text-[11px] font-medium py-[8px] rounded-[8px] text-center transition-colors cursor-pointer"
                    >
                      + Add Payment Method
                    </button>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-[10px] p-[16px] border border-[#eaecf0] shadow-xs flex flex-col gap-[12px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[14px] text-[#19213d]">Billing Address</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsInitialTab("billing");
                        setIsSettingsOpen(true);
                      }}
                      className="text-[#004bda] text-[11px] font-medium hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-[12px] leading-[19px] text-[rgba(25,33,61,0.7)]">
                    <p className="font-bold text-[#19213d]">Nate Higger Inc.</p>
                    <p>123 Business Street</p>
                    <p>Suite 456</p>
                    <p>San Francisco, CA 94102</p>
                    <p>United States</p>
                    <p className="border-t border-[#f3f4f6] pt-[6px] mt-[6px]">Tax ID: XX-XXXXXXX</p>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-[10px] p-[16px] border border-[#eaecf0] shadow-xs flex flex-col gap-[12px]">
                  <h3 className="font-bold text-[14px] text-[#19213d]">Account Info</h3>
                  <div className="flex flex-col divide-y divide-[#f3f4f6] text-[12px]">
                    <div className="flex justify-between py-[8px]">
                      <span className="text-[rgba(25,33,61,0.7)]">Member Since</span>
                      <span className="font-medium text-[#19213d]">Jan 2024</span>
                    </div>
                    <div className="flex justify-between py-[8px]">
                      <span className="text-[rgba(25,33,61,0.7)]">Plan Type</span>
                      <div className="flex gap-[4px]">
                        <span className="bg-[#e0e0e0] text-[#004e64] text-[9px] px-[6px] py-[1px] rounded">
                          Business
                        </span>
                        <span className="bg-[#bee7f6] text-[#004e64] text-[9px] px-[6px] py-[1px] rounded">
                          Developer
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between py-[8px]">
                      <span className="text-[rgba(25,33,61,0.7)]">Lifetime Credits</span>
                      <span className="font-bold text-[#19213d]">5,780</span>
                    </div>
                    <div className="flex justify-between py-[8px]">
                      <span className="text-[rgba(25,33,61,0.7)]">Total Downloads</span>
                      <span className="font-bold text-[#19213d]">1,284</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsInitialTab("profile");
                      setIsSettingsOpen(true);
                    }}
                    className="bg-[#eaecf0] hover:bg-[#dfe2e6] text-[#19213d] text-[11px] font-medium py-[8px] rounded-[8px] text-center transition-colors cursor-pointer"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal Overlay */}
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
        userProfile={{
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          bio: userProfile.bio,
          organization: userProfile.organization,
        }}
        onSaveProfile={(updated) => {
          setUserProfile((prev) => ({ ...prev, ...updated }));
          showToast("Profile updated successfully!");
        }}
      />

      {/* Support Center Modal Overlay */}
      <SupportCenterOverlay
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        initialTab={supportInitialTab}
      />
    </div>
  );
}

export default function UserPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eaecf0] flex items-center justify-center font-medium">Loading User Portal...</div>}>
      <PortalContent />
    </Suspense>
  );
}
