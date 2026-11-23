"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Copy,
  CreditCard,
  Download,
  Globe,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  Bell,
  Palette,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { CreditIcon } from "@/components/CreditIcon";

export type SettingsTab =
  | "profile"
  | "account"
  | "members"
  | "enterprise"
  | "billing"
  | "security"
  | "notifications"
  | "appearance"
  | "about";

export type PortalPaymentMethod = {
  id: string;
  brand: "VISA" | "Mastercard" | "PayPal";
  label: string;
  meta: string;
  isDefault: boolean;
};

export type PortalBillingAddress = {
  company: string;
  line1: string;
  line2: string;
  country: string;
  taxId: string;
};

type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Pipeline Lead" | "Technical Artist" | "Billing Admin";
  department: string;
  twoFactor: boolean;
  status: "Active" | "Invited";
  creditsUsedMonth: number;
};

type ScopedApiToken = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsed: string;
  expires: string;
};

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** "modal" (default) renders centered overlay; "page" renders inline as the main right-pane view inside Portal */
  variant?: "modal" | "page";
  initialTab?: SettingsTab;
  onTabChange?: (tab: SettingsTab) => void;
  userProfile?: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    organization: string;
    avatarUrl?: string | null;
  };
  paymentMethods?: PortalPaymentMethod[];
  billingAddress?: PortalBillingAddress;
  onSaveProfile?: (updated: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    avatarUrl?: string | null;
  }) => void;
  onUpdatePaymentMethods?: (next: PortalPaymentMethod[]) => void;
  onSaveBillingAddress?: (next: PortalBillingAddress) => void;
}

const ACCENT_PRESETS = [
  { name: "Kumo Blue", hex: "#056dff" },
  { name: "Cloudflare Orange", hex: "#f6821f" },
  { name: "Carbon Ink", hex: "#18181b" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Indigo", hex: "#4f46e5" },
];

export default function SettingsOverlay({
  isOpen,
  onClose,
  variant = "modal",
  initialTab = "profile",
  onTabChange,
  userProfile,
  paymentMethods: externalPaymentMethods,
  billingAddress: externalBillingAddress,
  onSaveProfile,
  onUpdatePaymentMethods,
  onSaveBillingAddress,
}: SettingsOverlayProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  // =========================================================================
  // 1. PROFILE SETTING STATE
  // =========================================================================
  const [firstName, setFirstName] = useState(userProfile?.firstName || "David");
  const [lastName, setLastName] = useState(userProfile?.lastName || "Nguyen");
  const [email, setEmail] = useState(userProfile?.email || "dev@onflow.asia");
  const [jobTitle, setJobTitle] = useState("Lead 3D Technical Artist");
  const [department, setDepartment] = useState("Environment & Photogrammetry");
  const [phoneNumber, setPhoneNumber] = useState("+84 908 412 889");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh (UTC+07:00)");
  const [bio, setBio] = useState(
    userProfile?.bio ||
      "Lead 3D Technical Artist at Onflow Asia overseeing Vietnam heritage photogrammetry and Unreal Engine 5.4 Nanite pipelines."
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    userProfile?.avatarUrl ?? null
  );

  // Personal 3D Pipeline Defaults
  const [defaultEngine, setDefaultEngine] = useState("Unreal Engine 5.4 (Nanite)");
  const [defaultFormat, setDefaultFormat] = useState("FBX 2020 (Binary)");
  const [defaultTextureRes, setDefaultTextureRes] = useState("4K (4096×4096 PNG)");
  const [normalMapFormat, setNormalMapFormat] = useState<"DirectX (-Y)" | "OpenGL (+Y)">(
    "DirectX (-Y)"
  );
  const [upAxis, setUpAxis] = useState<"Z-Up" | "Y-Up">("Z-Up");

  // =========================================================================
  // 2. ACCOUNT SETTING STATE (Workspace & Governance)
  // =========================================================================
  const [workspaceName, setWorkspaceName] = useState(
    userProfile?.organization || "Onflow Asia"
  );
  const [workspaceSlug, setWorkspaceSlug] = useState("onflow-asia");
  const [accountId] = useState("71d0c1fe8708f672a16c7956ae8426be");
  const [bridgeSubdomain, setBridgeSubdomain] = useState(
    "onflow-asia.bridge.onflow.dev"
  );
  const [dataRegion, setDataRegion] = useState(
    "Asia Pacific — Singapore & Ho Chi Minh Edge (AP-SE1)"
  );
  const [creditPoolMode, setCreditPoolMode] = useState<
    "shared" | "department"
  >("shared");
  const [autoApproveLimit, setAutoApproveLimit] = useState("50");
  const [allowMemberTopUp, setAllowMemberTopUp] = useState(false);
  const [checksumVerification, setChecksumVerification] = useState(true);
  const [copiedAccountField, setCopiedAccountField] = useState<string | null>(
    null
  );

  // =========================================================================
  // 3. TEAM & RBAC MEMBERS STATE
  // =========================================================================
  const [members, setMembers] = useState<WorkspaceMember[]>([
    {
      id: "m-1",
      name: "David Nguyen",
      email: "dev@onflow.asia",
      role: "Super Admin",
      department: "Environment & Photogrammetry",
      twoFactor: true,
      status: "Active",
      creditsUsedMonth: 96,
    },
    {
      id: "m-2",
      name: "Minh Tran",
      email: "minh.tran@onflow.asia",
      role: "Pipeline Lead",
      department: "Unreal Engine Core",
      twoFactor: true,
      status: "Active",
      creditsUsedMonth: 64,
    },
    {
      id: "m-3",
      name: "Linh Pham",
      email: "linh.pham@onflow.asia",
      role: "Technical Artist",
      department: "LookDev & PBR Surfaces",
      twoFactor: true,
      status: "Active",
      creditsUsedMonth: 43,
    },
    {
      id: "m-4",
      name: "Khoa Le",
      email: "finance@onflow.asia",
      role: "Billing Admin",
      department: "Finance & Procurement",
      twoFactor: false,
      status: "Invited",
      creditsUsedMonth: 0,
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<WorkspaceMember["role"]>("Technical Artist");
  const [inviteDept, setInviteDept] = useState("LookDev & PBR Surfaces");

  // =========================================================================
  // 4. ENTERPRISE SETTING STATE (SAML SSO, SCIM, IP Allowlist, Storage, SLA)
  // =========================================================================
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [ssoProvider, setSsoProvider] = useState("Okta Workforce Identity");
  const [ssoEntityId, setSsoEntityId] = useState(
    "http://www.okta.com/exk92837492onflowasia"
  );
  const [ssoSsoUrl, setSsoSsoUrl] = useState(
    "https://onflow-asia.okta.com/app/onflow3d/exk92837492/sso/saml"
  );
  const [ssoDomainLock, setSsoDomainLock] = useState("onflow.asia");
  const [scimEnabled, setScimEnabled] = useState(true);

  const [ipAllowlistEnabled, setIpAllowlistEnabled] = useState(true);
  const [ipRanges, setIpRanges] = useState<
    { id: string; cidr: string; label: string }[]
  >([
    {
      id: "ip-1",
      cidr: "203.162.4.0/24",
      label: "Ho Chi Minh Studio HQ Fiber",
    },
    {
      id: "ip-2",
      cidr: "14.161.22.128/26",
      label: "Da Nang Photogrammetry Lab VPN",
    },
  ]);
  const [newCidr, setNewCidr] = useState("");
  const [newCidrLabel, setNewCidrLabel] = useState("");

  const [customS3Bucket, setCustomS3Bucket] = useState(
    "s3://onflow-asia-ue5-vault-ap-southeast-1"
  );
  const [perforceStream, setPerforceStream] = useState(
    "//OnflowDepot/VietnamHeritage_Main/Assets"
  );
  const [auditSiemEndpoint, setAuditSiemEndpoint] = useState(
    "https://logs.onflow.asia/v1/cloudflare-kumo-stream"
  );
  const [watermarkExports, setWatermarkExports] = useState(true);

  // =========================================================================
  // 5. BILLING & TAX PROFILE STATE
  // =========================================================================
  const [localPaymentMethods, setLocalPaymentMethods] = useState<
    PortalPaymentMethod[]
  >(
    externalPaymentMethods ?? [
      {
        id: "visa-4242",
        brand: "VISA",
        label: "Visa Corporate •••• 4242",
        meta: "Exp 12/2028",
        isDefault: true,
      },
      {
        id: "mc-8888",
        brand: "Mastercard",
        label: "Mastercard World •••• 8888",
        meta: "Exp 10/2027",
        isDefault: false,
      },
    ]
  );
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardBrand, setNewCardBrand] = useState<"VISA" | "Mastercard">(
    "VISA"
  );
  const [newCardLast4, setNewCardLast4] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("08/2029");

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState<PortalBillingAddress>(
    externalBillingAddress ?? {
      company: "Onflow Asia Co., Ltd",
      line1: "123 Nguyen Hue Street, Floor 5",
      line2: "District 1, Ho Chi Minh City 70000",
      country: "Vietnam",
      taxId: "VN-0318294012",
    }
  );
  const [poNumberRequired, setPoNumberRequired] = useState(true);
  const [activePoNumber, setActivePoNumber] = useState("PO-2026-ONF-882");

  // =========================================================================
  // 6. SECURITY & API TOKENS STATE
  // =========================================================================
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [hardwareKeyEnabled, setHardwareKeyEnabled] = useState(true);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiTokens, setApiTokens] = useState<ScopedApiToken[]>([
    {
      id: "tok-1",
      name: "UE5.4 Bridge Workstation Sync",
      prefix: "onf_live_98a4...e21b",
      scopes: ["Catalog:Read", "Downloads:Export", "Bridge:Stream"],
      lastUsed: "4 mins ago · 203.162.4.18",
      expires: "Nov 23, 2027",
    },
    {
      id: "tok-2",
      name: "CI/CD Automated Houdini Baker",
      prefix: "onf_live_41c0...77fa",
      scopes: ["Catalog:Read", "Downloads:Export"],
      lastUsed: "2 hours ago · 14.161.22.140",
      expires: "May 15, 2027",
    },
  ]);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenScope, setNewTokenScope] = useState(
    "Catalog:Read + Downloads:Export"
  );

  const [sessions, setSessions] = useState([
    {
      id: "mac",
      device: "MacBook Pro M3 Max · Chrome 131",
      location: "Ho Chi Minh City, Vietnam · 203.162.4.18 · Active now",
      current: true,
      kind: "desktop" as const,
    },
    {
      id: "win-ws",
      device: "Windows 11 Threadripper Workstation · Bridge CLI",
      location: "Ho Chi Minh City, Vietnam · 203.162.4.44 · 18m ago",
      current: false,
      kind: "desktop" as const,
    },
    {
      id: "iphone",
      device: "iPhone 16 Pro · Safari",
      location: "Ho Chi Minh City, Vietnam · 2h ago",
      current: false,
      kind: "mobile" as const,
    },
  ]);

  // =========================================================================
  // 7. NOTIFICATIONS & APPEARANCE STATE
  // =========================================================================
  const [webhookUrl, setWebhookUrl] = useState(
    "https://hooks.slack.com/services/T04ONFLOW/B08BRIDGE/9xK2mP7qLw"
  );
  const [emailNotifs, setEmailNotifs] = useState({
    assetUpdates: true,
    teamActivity: true,
    billingReceipts: true,
    spendLimitAlerts: true,
  });
  const [accentHex, setAccentHex] = useState("#056dff");
  const [interfaceTheme, setInterfaceTheme] = useState<"light" | "system">(
    "light"
  );
  const [compactDensity, setCompactDensity] = useState(false);
  const [language, setLanguage] = useState("English");

  const activeMethods = externalPaymentMethods ?? localPaymentMethods;

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName);
      setLastName(userProfile.lastName);
      setEmail(userProfile.email);
      setBio(userProfile.bio);
      setAvatarUrl(userProfile.avatarUrl ?? null);
    }
  }, [userProfile]);

  useEffect(() => {
    if (externalBillingAddress) {
      setBillingAddress(externalBillingAddress);
    }
  }, [externalBillingAddress]);

  useEffect(() => {
    if (!isOpen || variant === "page") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, variant]);

  if (!isOpen && variant === "modal") return null;

  const showFeedback = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2600);
  };

  const handleCopyText = async (text: string, label: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
    }
    setCopiedAccountField(key);
    showFeedback(`${label} copied to clipboard`);
    setTimeout(() => setCopiedAccountField(null), 1800);
  };

  const commitPaymentMethods = (next: PortalPaymentMethod[]) => {
    setLocalPaymentMethods(next);
    onUpdatePaymentMethods?.(next);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showFeedback("Image must be under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        showFeedback("Avatar updated — save profile to apply");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!firstName.trim() || !email.trim()) {
      showFeedback("First name and email are required");
      return;
    }
    onSaveProfile?.({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatarUrl,
    });
    showFeedback("Profile & pipeline defaults saved");
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      showFeedback("Enter a valid studio email address");
      return;
    }
    const nameGuess = inviteEmail
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const nextMember: WorkspaceMember = {
      id: `m-${Date.now()}`,
      name: nameGuess,
      email: inviteEmail.trim(),
      role: inviteRole,
      department: inviteDept,
      twoFactor: false,
      status: "Invited",
      creditsUsedMonth: 0,
    };
    setMembers((prev) => [...prev, nextMember]);
    setInviteEmail("");
    showFeedback(`Invitation sent to ${nextMember.email} (${inviteRole})`);
  };

  const handleAddIpRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCidr.trim()) {
      showFeedback("Enter a valid IPv4/IPv6 CIDR range");
      return;
    }
    setIpRanges((prev) => [
      ...prev,
      {
        id: `ip-${Date.now()}`,
        cidr: newCidr.trim(),
        label: newCidrLabel.trim() || "Custom Studio Subnet",
      },
    ]);
    setNewCidr("");
    setNewCidrLabel("");
    showFeedback("IP allowlist rule added");
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) {
      showFeedback("Enter a descriptive token name");
      return;
    }
    const created: ScopedApiToken = {
      id: `tok-${Date.now()}`,
      name: newTokenName.trim(),
      prefix: `onf_live_${Math.random().toString(16).slice(2, 6)}...${Math.random()
        .toString(16)
        .slice(2, 6)}`,
      scopes: newTokenScope.split(" + "),
      lastUsed: "Just created",
      expires: "Nov 23, 2027",
    };
    setApiTokens((prev) => [created, ...prev]);
    setNewTokenName("");
    showFeedback(`Scoped token "${created.name}" generated`);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = newCardLast4.replace(/\D/g, "").slice(-4);
    if (digits.length !== 4) {
      showFeedback("Enter the last 4 digits of your card");
      return;
    }
    const newMethod: PortalPaymentMethod = {
      id: `${newCardBrand.toLowerCase()}-${digits}-${Date.now()}`,
      brand: newCardBrand,
      label: `${newCardBrand === "VISA" ? "Visa Corporate" : "Mastercard World"} •••• ${digits}`,
      meta: `Exp ${newCardExpiry || "08/2029"}`,
      isDefault: activeMethods.length === 0,
    };
    commitPaymentMethods([...activeMethods, newMethod]);
    setNewCardLast4("");
    setShowAddCard(false);
    showFeedback(`Added ${newMethod.label}`);
  };

  const handleSetDefaultCard = (id: string) => {
    commitPaymentMethods(
      activeMethods.map((m) => ({ ...m, isDefault: m.id === id }))
    );
    showFeedback("Default payment method updated");
  };

  const handleRemoveCard = (id: string) => {
    const filtered = activeMethods.filter((m) => m.id !== id);
    if (filtered.length > 0 && !filtered.some((m) => m.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true };
    }
    commitPaymentMethods(filtered);
    showFeedback("Payment method removed");
  };

  const handleDownloadInvoice = () => {
    const content = [
      "ONFLOW ASIA — CONSOLIDATED TAX INVOICE",
      "--------------------------------------",
      `Invoice: INV-2026-1119`,
      `Contract: MSA-ONF-2026-ENT`,
      `PO Number: ${activePoNumber}`,
      `Date: Nov 19, 2026`,
      `Billed to: ${billingAddress.company}`,
      `Address: ${billingAddress.line1}, ${billingAddress.line2}, ${billingAddress.country}`,
      `Tax ID: ${billingAddress.taxId}`,
      "",
      "Line item: Studio Enterprise Plan (10 Seats + Priority Bridge CDN) — $149.00",
      "Status: Paid",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "onflow-enterprise-invoice-2026-11.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showFeedback("Consolidated VAT invoice downloaded");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showFeedback("Enter your current and new password");
      return;
    }
    if (newPassword.length < 8) {
      showFeedback("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback("New passwords do not match");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showFeedback("Password updated across all sessions");
  };

  const NAV_GROUPS: {
    groupLabel: string;
    items: {
      id: SettingsTab;
      label: string;
      Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
      badge?: string;
    }[];
  }[] = [
    {
      groupLabel: "Personal",
      items: [
        { id: "profile", label: "Profile & Pipeline", Icon: User },
        { id: "notifications", label: "Notifications & Webhooks", Icon: Bell },
        { id: "appearance", label: "Appearance & Locale", Icon: Palette },
      ],
    },
    {
      groupLabel: "Workspace & Organization",
      items: [
        { id: "account", label: "Account Settings", Icon: Sliders },
        {
          id: "members",
          label: "Members & RBAC",
          Icon: Users,
          badge: `${members.length}/10`,
        },
        { id: "billing", label: "Billing & Tax Profile", Icon: CreditCard },
      ],
    },
    {
      groupLabel: "Enterprise & Security",
      items: [
        {
          id: "enterprise",
          label: "Enterprise & SSO",
          Icon: Building2,
          badge: "SAML",
        },
        { id: "security", label: "Security & API Tokens", Icon: Shield },
      ],
    },
  ];

  const initials = `${firstName.charAt(0) || "D"}${
    lastName.charAt(0) || "N"
  }`.toUpperCase();

  const isPage = variant === "page";

  const handleSelectTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const innerContent = (
    <div
      className={
        isPage
          ? "kumo-portal w-full max-w-[1160px] mx-auto flex flex-col gap-5 relative"
          : "bg-[var(--color-kumo-canvas)] flex flex-col h-[720px] max-h-[92vh] w-[980px] max-w-full overflow-hidden relative rounded-[12px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)]"
      }
      onClick={(e) => e.stopPropagation()}
      role={isPage ? undefined : "dialog"}
      aria-modal={isPage ? undefined : true}
      aria-label="Workspace & Enterprise Settings"
    >
      {/* Floating Feedback Toast */}
      {savedToast && (
        <div
          className={`${
            isPage ? "fixed bottom-6 right-6 z-50" : "absolute top-3.5 right-16 z-40"
          } bg-[var(--text-color-kumo-strong)] text-white text-[12px] font-medium px-3.5 py-1.5 rounded-[8px] shadow-[var(--shadow-kumo-md)] flex items-center gap-2`}
        >
          <span className="size-1.5 rounded-full bg-[#3e8eff]" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Header (Modal 58px header vs Inline Page Title Header) */}
      {isPage ? (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-kumo-line)] pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="m-0 text-[22px] leading-[28px] font-semibold tracking-[-0.015em] text-[var(--text-color-kumo-strong)]">
                Account Settings
              </h1>
              <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[var(--color-kumo-hairline)] bg-white text-[11.5px] font-medium text-[var(--text-color-kumo-default)] whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
                <span>Enterprise Studio Tier</span>
              </span>
            </div>
            <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
              {workspaceName} · Account ID:{" "}
              <span className="kumo-mono text-[var(--text-color-kumo-default)]">
                {accountId}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[58px] shrink-0 w-full flex items-center justify-between px-5 border-b border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center text-[var(--text-color-kumo-strong)] shrink-0">
              <Settings size={15} strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline gap-2.5 min-w-0">
              <h2 className="m-0 font-semibold text-[16px] leading-[22px] text-[var(--text-color-kumo-strong)] truncate">
                Account, Profile & Enterprise Settings
              </h2>
              <span className="text-[12px] text-[var(--text-color-kumo-subtle)] hidden md:inline truncate">
                {workspaceName} · ID: <span className="kumo-mono">{accountId.slice(0, 12)}…</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[var(--color-kumo-hairline)] bg-white text-[11.5px] font-medium text-[var(--text-color-kumo-default)]">
              <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
              <span>Enterprise Studio Tier</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
              aria-label="Close settings"
            >
              <X size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Inline Page: Kumo Segmented Horizontal Sub-Tabs (so user can switch between all 8 tabs cleanly without duplicating the left PortalSidebar) */}
      {isPage && (
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <div
            role="tablist"
            aria-label="Account settings sections"
            className="inline-flex items-center h-9 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5 whitespace-nowrap"
          >
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectTab(item.id)}
                  className={`h-8 px-3 rounded-[6px] border-0 cursor-pointer shrink-0 text-[12.5px] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[var(--text-color-kumo-strong)] font-medium shadow-[var(--shadow-kumo-xs)]"
                      : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none kumo-mono ${
                        item.badge === "SAML"
                          ? "border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)]"
                          : "border border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-subtle)]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Body Layout: 2-column in Modal mode, Clean Card Surface in Page mode */}
      <div
        className={
          isPage
            ? "bg-white rounded-[10px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden"
            : "flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden"
        }
      >
        {/* Left 236px Sidebar Navigation (Modal mode only; Page mode uses the main PortalSidebar + segmented sub-tabs) */}
        {!isPage && (
          <aside className="w-full md:w-[236px] shrink-0 border-b md:border-b-0 md:border-r border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-3">
            {NAV_GROUPS.map((group) => (
              <div
                key={group.groupLabel}
                className="flex md:flex-col gap-1 shrink-0"
              >
                <div className="hidden md:block px-2.5 pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-kumo-subtle)]">
                  {group.groupLabel}
                </div>
                {group.items.map((item) => {
                  const Icon = item.Icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`min-h-[34px] px-2.5 py-1.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Icon
                          size={15}
                          strokeWidth={1.5}
                          className={`shrink-0 ${
                            isActive
                              ? "text-[var(--text-color-kumo-strong)]"
                              : "text-[var(--text-color-kumo-subtle)]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none kumo-mono shrink-0 ${
                            item.badge === "SAML"
                              ? "border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)] bg-white"
                              : "border border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-subtle)] bg-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        {/* Right Scrollable Settings Canvas */}
        <div
          ref={mainScrollRef as React.RefObject<HTMLDivElement>}
          className={
            isPage
              ? "p-5 sm:p-6 bg-white flex flex-col gap-6"
              : "flex-1 min-w-0 overflow-y-auto p-6 bg-white flex flex-col gap-6"
          }
        >
            {/* ============================================================== */}
            {/* TAB 1: PROFILE & PIPELINE DEFAULTS                             */}
            {/* ============================================================== */}
            {activeTab === "profile" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Profile & 3D Pipeline Defaults
                    </h3>
                    <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                      Manage your personal operator identity and default DCC export presets across Onflow Gallery and Bridge.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    Save profile
                  </button>
                </div>

                {/* Card 1: Operator Identity & Avatar */}
                <div className="rounded-[8px] border border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--text-color-kumo-strong)] rounded-[10px] size-14 flex items-center justify-center shrink-0 overflow-hidden border border-[var(--color-kumo-line)]">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile avatar"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="kumo-mono font-semibold text-[16px] text-white">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[14px] text-[var(--text-color-kumo-strong)]">
                          {firstName} {lastName}
                        </span>
                        <span className="inline-flex items-center h-5 px-2 py-0.5 rounded-full bg-white border border-[var(--color-kumo-fill)] text-[11px] font-medium text-[var(--text-color-kumo-default)] whitespace-nowrap shrink-0">
                          Super Admin
                        </span>
                      </div>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        {jobTitle} · {department}
                      </span>
                      <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                        PNG, JPG, or WebP up to 5 MB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={13} strokeWidth={1.5} />
                      <span>Upload photo</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl(null);
                          showFeedback("Profile photo removed");
                        }}
                        className="h-8 px-2.5 rounded-[8px] bg-white hover:bg-[#fef2f2] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Personal Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      First name
                    </span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Last name
                    </span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)] flex items-center justify-between">
                      <span>Work email (SAML / SSO Identity)</span>
                      <span className="text-[11px] font-medium text-[var(--text-color-kumo-success)]">
                        Verified
                      </span>
                    </span>
                    <div className="relative flex items-center">
                      <Mail
                        size={14}
                        strokeWidth={1.5}
                        className="absolute left-3 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9 w-full pl-9 pr-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                      />
                    </div>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Mobile / SMS alert number
                    </span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Job title / Role
                    </span>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Studio department
                    </span>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Technical bio & workstation notes
                    </span>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="p-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)] resize-none"
                    />
                  </label>
                </div>

                {/* Card 2: Personal 3D Pipeline & Bridge Export Defaults */}
                <div className="pt-4 border-t border-[var(--color-kumo-line)] flex flex-col gap-3.5">
                  <div>
                    <h4 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Personal 3D Pipeline & Bridge Export Presets
                    </h4>
                    <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                      Pre-selects your preferred 3D format, texture bit-depth, and coordinate system when unlocking assets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Target DCC / Engine
                      </span>
                      <div className="relative flex items-center">
                        <select
                          value={defaultEngine}
                          onChange={(e) => setDefaultEngine(e.target.value)}
                          className="w-full h-9 pl-3 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                        >
                          <option value="Unreal Engine 5.4 (Nanite)">
                            Unreal Engine 5.4 (Nanite)
                          </option>
                          <option value="Blender 4.2 LTS (Cycles)">
                            Blender 4.2 LTS (Cycles)
                          </option>
                          <option value="Autodesk Maya 2025 (Arnold)">
                            Autodesk Maya 2025 (Arnold)
                          </option>
                          <option value="SideFX Houdini 20.5 (Solaris)">
                            SideFX Houdini 20.5 (Solaris)
                          </option>
                        </select>
                        <ChevronsUpDown
                          size={12}
                          className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                        />
                      </div>
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Default Mesh Format
                      </span>
                      <div className="relative flex items-center">
                        <select
                          value={defaultFormat}
                          onChange={(e) => setDefaultFormat(e.target.value)}
                          className="w-full h-9 pl-3 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                        >
                          <option value="FBX 2020 (Binary)">FBX 2020 (Binary)</option>
                          <option value="glTF / GLB 2.0">glTF / GLB 2.0</option>
                          <option value="OpenUSD (.usdz / .usda)">
                            OpenUSD (.usdz / .usda)
                          </option>
                          <option value="Wavefront OBJ">Wavefront OBJ</option>
                        </select>
                        <ChevronsUpDown
                          size={12}
                          className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                        />
                      </div>
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Default Texture Resolution
                      </span>
                      <div className="relative flex items-center">
                        <select
                          value={defaultTextureRes}
                          onChange={(e) => setDefaultTextureRes(e.target.value)}
                          className="w-full h-9 pl-3 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                        >
                          <option value="2K (2048×2048 PNG)">2K (2048×2048 PNG)</option>
                          <option value="4K (4096×4096 PNG)">4K (4096×4096 PNG)</option>
                          <option value="8K (8192×8192 16-bit EXR)">
                            8K (8192×8192 16-bit EXR)
                          </option>
                        </select>
                        <ChevronsUpDown
                          size={12}
                          className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-[8px] border border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[12.5px] font-medium text-[var(--text-color-kumo-strong)] block">
                          Normal Map Tangent Space
                        </span>
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          DirectX (-Y) for UE5 · OpenGL (+Y)
                        </span>
                      </div>
                      <div className="inline-flex rounded-[6px] bg-white border border-[var(--color-kumo-line)] p-0.5 shrink-0">
                        {(["DirectX (-Y)", "OpenGL (+Y)"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setNormalMapFormat(opt)}
                            className={`h-7 px-2.5 rounded-[4px] border-0 text-[11.5px] cursor-pointer whitespace-nowrap ${
                              normalMapFormat === opt
                                ? "bg-[var(--text-color-kumo-strong)] text-white font-medium"
                                : "bg-transparent text-[var(--text-color-kumo-subtle)]"
                            }`}
                          >
                            {opt.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[8px] border border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[12.5px] font-medium text-[var(--text-color-kumo-strong)] block">
                          Coordinate Up-Axis
                        </span>
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Z-Up (UE / Blender) · Y-Up (Maya)
                        </span>
                      </div>
                      <div className="inline-flex rounded-[6px] bg-white border border-[var(--color-kumo-line)] p-0.5 shrink-0">
                        {(["Z-Up", "Y-Up"] as const).map((axis) => (
                          <button
                            key={axis}
                            type="button"
                            onClick={() => setUpAxis(axis)}
                            className={`h-7 px-2.5 rounded-[4px] border-0 text-[11.5px] cursor-pointer whitespace-nowrap ${
                              upAxis === axis
                                ? "bg-[var(--text-color-kumo-strong)] text-white font-medium"
                                : "bg-transparent text-[var(--text-color-kumo-subtle)]"
                            }`}
                          >
                            {axis}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: ACCOUNT SETTINGS (WORKSPACE & CREDIT GOVERNANCE)        */}
            {/* ============================================================== */}
            {activeTab === "account" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Workspace & Account Settings
                    </h3>
                    <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                      Configure organization identifiers, Bridge CDN routing, and workspace credit pool governance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showFeedback("Workspace account configuration updated")
                    }
                    className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    Save account settings
                  </button>
                </div>

                {/* Organization Identity & Account ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Organization / Studio display name
                    </span>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] text-[var(--text-color-kumo-strong)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Workspace handle (URL namespace)
                    </span>
                    <input
                      type="text"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] focus:border-[var(--color-kumo-brand)] outline-none text-[13px] kumo-mono text-[var(--text-color-kumo-strong)]"
                    />
                  </label>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Cloudflare Kumo Account ID
                    </span>
                    <div className="h-9 px-3 rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] flex items-center justify-between gap-2">
                      <span className="kumo-mono text-[12.5px] text-[var(--text-color-kumo-strong)] truncate">
                        {accountId}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(accountId, "Account ID", "acct-id")
                        }
                        className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer inline-flex items-center gap-1 shrink-0"
                      >
                        {copiedAccountField === "acct-id" ? (
                          <Check size={13} />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>
                          {copiedAccountField === "acct-id" ? "Copied" : "Copy"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Dedicated Bridge API Subdomain
                    </span>
                    <div className="h-9 px-3 rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] flex items-center justify-between gap-2">
                      <span className="kumo-mono text-[12.5px] text-[var(--text-color-kumo-strong)] truncate">
                        {bridgeSubdomain}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            bridgeSubdomain,
                            "Bridge subdomain",
                            "subdomain"
                          )
                        }
                        className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer inline-flex items-center gap-1 shrink-0"
                      >
                        {copiedAccountField === "subdomain" ? (
                          <Check size={13} />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>
                          {copiedAccountField === "subdomain" ? "Copied" : "Copy"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Primary Asset Storage & Edge CDN Residency
                    </span>
                    <div className="relative flex items-center">
                      <Globe
                        size={14}
                        className="absolute left-3 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                      <select
                        value={dataRegion}
                        onChange={(e) => setDataRegion(e.target.value)}
                        className="w-full h-9 pl-9 pr-8 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                      >
                        <option value="Asia Pacific — Singapore & Ho Chi Minh Edge (AP-SE1)">
                          Asia Pacific — Singapore & Ho Chi Minh Edge (AP-SE1 · 6ms latency)
                        </option>
                        <option value="Asia Pacific — Tokyo & Seoul Edge (AP-NE1)">
                          Asia Pacific — Tokyo & Seoul Edge (AP-NE1)
                        </option>
                        <option value="European Union — Frankfurt Sovereign Vault (EU-CENTRAL1)">
                          European Union — Frankfurt Sovereign Vault (EU-CENTRAL1 · GDPR)
                        </option>
                        <option value="North America — US West Los Angeles (US-WEST2)">
                          North America — US West Los Angeles (US-WEST2)
                        </option>
                      </select>
                      <ChevronsUpDown
                        size={12}
                        className="absolute right-3 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                    </div>
                  </label>
                </div>

                {/* Credit Pool & Spend Governance */}
                <div className="pt-4 border-t border-[var(--color-kumo-line)] flex flex-col gap-3.5">
                  <div>
                    <h4 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Workspace Credit Allocation & Unlock Governance
                    </h4>
                    <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                      Control how artists spend studio credits and when supervisor approval is required.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCreditPoolMode("shared")}
                      className={`p-3.5 rounded-[8px] border text-left flex flex-col gap-1 cursor-pointer transition-colors ${
                        creditPoolMode === "shared"
                          ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)]"
                          : "bg-white border-[var(--color-kumo-line)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Shared Studio Credit Pool
                        </span>
                        <span className="kumo-mono text-[11px] font-medium text-[var(--text-color-kumo-link)] inline-flex items-center gap-1">
                          <span>2,686</span>
                          <CreditIcon size={10} />
                        </span>
                      </div>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        All verified studio seats draw from one consolidated credit balance and share unlocked downloads.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreditPoolMode("department")}
                      className={`p-3.5 rounded-[8px] border text-left flex flex-col gap-1 cursor-pointer transition-colors ${
                        creditPoolMode === "department"
                          ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)]"
                          : "bg-white border-[var(--color-kumo-line)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Department Sub-Quotas
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-subtle)]">
                          Enterprise
                        </span>
                      </div>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Enforce monthly credit caps per department (Environment, LookDev, VFX) with automated alerts.
                      </span>
                    </button>
                  </div>

                  <div className="rounded-[8px] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] px-4">
                    <div className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[13px] font-medium text-[var(--text-color-kumo-strong)] block">
                          Single-order auto-approval threshold
                        </span>
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                          Batch cart checkouts above this credit amount require Pipeline Lead or Admin sign-off
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={autoApproveLimit}
                          onChange={(e) =>
                            setAutoApproveLimit(
                              e.target.value.replace(/[^\d]/g, "")
                            )
                          }
                          className="w-20 h-8 px-2.5 rounded-[6px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[13px] font-semibold text-[var(--text-color-kumo-strong)] text-right outline-none"
                        />
                        <CreditIcon size={11} />
                      </div>
                    </div>

                    <div className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[13px] font-medium text-[var(--text-color-kumo-strong)] block">
                          Allow non-admin artists to request credit top-ups
                        </span>
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                          Sends a 1-click payment approval link to Billing Admins when workspace balance runs low
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={allowMemberTopUp}
                        onClick={() => setAllowMemberTopUp((prev) => !prev)}
                        className={`w-10 h-6 shrink-0 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
                          allowMemberTopUp
                            ? "bg-[var(--color-kumo-brand)] justify-end"
                            : "bg-[var(--color-kumo-fill)] justify-start"
                        }`}
                      >
                        <span className="size-5 rounded-full bg-white shadow-xs" />
                      </button>
                    </div>

                    <div className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[13px] font-medium text-[var(--text-color-kumo-strong)] block">
                          Enforce SHA-256 checksum manifest in archive downloads
                        </span>
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                          Embeds a signed integrity manifest and license certificate inside every unlocked .zip bundle
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={checksumVerification}
                        onClick={() => setChecksumVerification((prev) => !prev)}
                        className={`w-10 h-6 shrink-0 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
                          checksumVerification
                            ? "bg-[var(--color-kumo-brand)] justify-end"
                            : "bg-[var(--color-kumo-fill)] justify-start"
                        }`}
                      >
                        <span className="size-5 rounded-full bg-white shadow-xs" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-[8px] border border-[#ff6b70]/45 bg-[#fef2f2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[13px] font-semibold text-[var(--text-color-kumo-danger)] block">
                      Export or Transfer Workspace Ownership
                    </span>
                    <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                      Download a complete JSON ledger of unlocked 3D assets or transfer root ownership to another Super Admin.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        showFeedback("Workspace asset ledger exported (.json)")
                      }
                      className="h-8 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      Export ledger
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showFeedback(
                          "Ownership transfer requires 2FA hardware key confirmation"
                        )
                      }
                      className="h-8 px-3 rounded-[8px] bg-white hover:bg-[#fee2e2] border border-[#ff6b70]/50 text-[12px] font-medium text-[var(--text-color-kumo-danger)] cursor-pointer"
                    >
                      Transfer ownership
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: TEAM & RBAC MEMBERS                                     */}
            {/* ============================================================== */}
            {activeTab === "members" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Team & Role-Based Access Control (RBAC)
                    </h3>
                    <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                      Manage studio seats ({members.length} of 10 Enterprise seats assigned), department roles, and 2FA compliance.
                    </p>
                  </div>
                  <span className="h-7 px-2.5 rounded-full bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] text-[12px] kumo-mono font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1.5">
                    <span>Seats: {members.length} / 10 active</span>
                  </span>
                </div>

                {/* Invite Member Bar */}
                <form
                  onSubmit={handleInviteMember}
                  className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-3.5 grid grid-cols-1 sm:grid-cols-[1fr_160px_160px_auto] gap-2.5 items-end"
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[var(--text-color-kumo-subtle)]">
                      Teammate email address
                    </span>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="artist@onflow.asia"
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[var(--text-color-kumo-subtle)]">
                      RBAC Role
                    </span>
                    <div className="relative flex items-center">
                      <select
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(
                            e.target.value as WorkspaceMember["role"]
                          )
                        }
                        className="w-full h-9 pl-2.5 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12.5px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                      >
                        <option value="Technical Artist">Technical Artist</option>
                        <option value="Pipeline Lead">Pipeline Lead</option>
                        <option value="Billing Admin">Billing Admin</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                      <ChevronsUpDown
                        size={12}
                        className="absolute right-2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                    </div>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[var(--text-color-kumo-subtle)]">
                      Department
                    </span>
                    <input
                      type="text"
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      className="h-9 px-2.5 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12.5px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                  </label>

                  <button
                    type="submit"
                    className="h-9 px-3.5 rounded-[8px] kumo-btn-primary text-[12.5px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus size={13} strokeWidth={1.75} />
                    <span>Invite seat</span>
                  </button>
                </form>

                {/* Members Table */}
                <div className="rounded-[8px] border border-[var(--color-kumo-line)] overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="h-10 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] text-[12px] font-semibold text-[var(--text-color-kumo-strong)]">
                        <th className="py-2 px-3.5">Member</th>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3">2FA / SSO</th>
                        <th className="py-2 px-3 text-right">30d usage</th>
                        <th className="py-2 px-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-kumo-line)] text-[13px]">
                      {members.map((m) => (
                        <tr
                          key={m.id}
                          className="bg-white hover:bg-[var(--color-kumo-canvas)] transition-colors"
                        >
                          <td className="py-2.5 px-3.5">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-[var(--text-color-kumo-strong)]">
                                  {m.name}
                                </span>
                                {m.status === "Invited" && (
                                  <span className="rounded-full px-1.5 py-0.5 text-[10px] bg-[#fffbeb] border border-[#f59e0b]/40 text-[#b45309]">
                                    Pending invite
                                  </span>
                                )}
                              </div>
                              <span className="text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                                {m.email} · {m.department}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={m.role}
                              onChange={(e) => {
                                const nextRole = e.target
                                  .value as WorkspaceMember["role"];
                                setMembers((prev) =>
                                  prev.map((row) =>
                                    row.id === m.id
                                      ? { ...row, role: nextRole }
                                      : row
                                  )
                                );
                                showFeedback(`Updated ${m.name} to ${nextRole}`);
                              }}
                              className="h-7 px-2 rounded-[6px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                            >
                              <option value="Super Admin">Super Admin</option>
                              <option value="Pipeline Lead">Pipeline Lead</option>
                              <option value="Technical Artist">
                                Technical Artist
                              </option>
                              <option value="Billing Admin">Billing Admin</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3">
                            {m.twoFactor ? (
                              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--text-color-kumo-success)]">
                                <ShieldCheck size={13} />
                                <span>SAML + 2FA</span>
                              </span>
                            ) : (
                              <span className="text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                                Awaiting enrollment
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
                            <span className="inline-flex items-center justify-end gap-1">
                              <span>{m.creditsUsedMonth}</span>
                              <CreditIcon size={10} />
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            {m.id === "m-1" ? (
                              <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                                Owner
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setMembers((prev) =>
                                    prev.filter((row) => row.id !== m.id)
                                  );
                                  showFeedback(`Removed ${m.name} from studio`);
                                }}
                                className="text-[12px] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] bg-transparent border-0 p-0 cursor-pointer"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: ENTERPRISE SETTINGS (SAML SSO, SCIM, IP ALLOWLIST, SLA) */}
            {/* ============================================================== */}
            {activeTab === "enterprise" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Enterprise Governance, SSO & Pipeline Sync
                      </h3>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-[#3e8eff]/10 border border-[var(--color-kumo-brand)]/40 text-[var(--text-color-kumo-link)] shrink-0">
                        MSA-ONF-2026-ENT
                      </span>
                    </div>
                    <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                      Configure SAML 2.0 Single Sign-On, SCIM seat provisioning, IP CIDR allowlists, and private S3/Perforce mounts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showFeedback("Enterprise security & SSO policies saved")
                    }
                    className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    Save enterprise policy
                  </button>
                </div>

                {/* Card 1: SAML 2.0 Single Sign-On & SCIM Provisioning */}
                <div className="rounded-[8px] border border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-[6px] bg-white border border-[var(--color-kumo-line)] flex items-center justify-center text-[var(--text-color-kumo-strong)]">
                        <Lock size={15} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                            SAML 2.0 / OIDC Single Sign-On
                          </span>
                          <span className="h-5 px-2 py-0.5 rounded-full bg-[#ecfdf3] border border-[#34c48b]/40 text-[11px] font-medium text-[var(--text-color-kumo-success)]">
                            Active · Okta Verified
                          </span>
                        </div>
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                          Enforce corporate IdP authentication for all @{ssoDomainLock} studio accounts
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={ssoEnabled}
                      onClick={() => {
                        setSsoEnabled((prev) => !prev);
                        showFeedback(
                          `SAML 2.0 SSO ${!ssoEnabled ? "enabled" : "paused"}`
                        );
                      }}
                      className={`w-10 h-6 shrink-0 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
                        ssoEnabled
                          ? "bg-[var(--color-kumo-brand)] justify-end"
                          : "bg-[var(--color-kumo-fill)] justify-start"
                      }`}
                    >
                      <span className="size-5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Identity Provider (IdP)
                      </span>
                      <select
                        value={ssoProvider}
                        onChange={(e) => setSsoProvider(e.target.value)}
                        className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                      >
                        <option value="Okta Workforce Identity">
                          Okta Workforce Identity (SAML 2.0)
                        </option>
                        <option value="Microsoft Entra ID (Azure AD)">
                          Microsoft Entra ID (Azure AD)
                        </option>
                        <option value="Google Workspace Enterprise">
                          Google Workspace Enterprise OIDC
                        </option>
                        <option value="OneLogin / Custom SAML">
                          OneLogin / Custom SAML 2.0
                        </option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Enforced Email Domain
                      </span>
                      <input
                        type="text"
                        value={ssoDomainLock}
                        onChange={(e) => setSsoDomainLock(e.target.value)}
                        className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        IdP Entity ID / Issuer URI
                      </span>
                      <input
                        type="text"
                        value={ssoEntityId}
                        onChange={(e) => setSsoEntityId(e.target.value)}
                        className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12px] text-[var(--text-color-kumo-strong)] outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        SAML ACS / Single Sign-On URL
                      </span>
                      <input
                        type="text"
                        value={ssoSsoUrl}
                        onChange={(e) => setSsoSsoUrl(e.target.value)}
                        className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12px] text-[var(--text-color-kumo-strong)] outline-none"
                      />
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-kumo-line)] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--text-color-kumo-default)]">
                      <input
                        type="checkbox"
                        checked={scimEnabled}
                        onChange={(e) => setScimEnabled(e.target.checked)}
                        className="size-3.5 accent-[var(--color-kumo-brand)]"
                      />
                      <span>
                        Enable <strong>SCIM 2.0</strong> automated seat provisioning & deprovisioning
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        showFeedback("SAML 2.0 assertion handshake verified (24ms)")
                      }
                      className="h-7 px-2.5 rounded-[6px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      Test SAML connection
                    </button>
                  </div>
                </div>

                {/* Card 2: Network IP Allowlist (CIDR) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Studio IP Allowlist (CIDR Access Control)
                      </h4>
                      <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Restrict 8K raw scan downloads and Bridge API keys to authorized studio subnets and VPNs.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={ipAllowlistEnabled}
                      onClick={() => setIpAllowlistEnabled((prev) => !prev)}
                      className={`w-10 h-6 shrink-0 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
                        ipAllowlistEnabled
                          ? "bg-[var(--color-kumo-brand)] justify-end"
                          : "bg-[var(--color-kumo-fill)] justify-start"
                      }`}
                    >
                      <span className="size-5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleAddIpRange}
                    className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-2"
                  >
                    <input
                      type="text"
                      value={newCidr}
                      onChange={(e) => setNewCidr(e.target.value)}
                      placeholder="113.161.48.0/24"
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12.5px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                    <input
                      type="text"
                      value={newCidrLabel}
                      onChange={(e) => setNewCidrLabel(e.target.value)}
                      placeholder="Hanoi Render Farm Subnet"
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12.5px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                    <button
                      type="submit"
                      className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12.5px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      + Add CIDR
                    </button>
                  </form>

                  <div className="rounded-[8px] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)]">
                    {ipRanges.map((ip) => (
                      <div
                        key={ip.id}
                        className="px-3.5 py-2.5 flex items-center justify-between text-[12.5px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="kumo-mono font-semibold text-[var(--text-color-kumo-strong)] bg-[var(--color-kumo-canvas)] px-2 py-0.5 rounded-[4px] border border-[var(--color-kumo-line)]">
                            {ip.cidr}
                          </span>
                          <span className="text-[var(--text-color-kumo-subtle)]">
                            {ip.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIpRanges((prev) =>
                              prev.filter((r) => r.id !== ip.id)
                            );
                            showFeedback(`Removed subnet ${ip.cidr}`);
                          }}
                          className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] bg-transparent border-0 p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3: Dedicated Storage Mounts (AWS S3 / PerforceHelix / SIEM Audit) */}
                <div className="pt-3 border-t border-[var(--color-kumo-line)] flex flex-col gap-3">
                  <h4 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Dedicated Depot Sync & SIEM Audit Streaming
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Private AWS S3 / R2 Mirror Bucket
                      </span>
                      <input
                        type="text"
                        value={customS3Bucket}
                        onChange={(e) => setCustomS3Bucket(e.target.value)}
                        className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12px] text-[var(--text-color-kumo-strong)] outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Perforce Helix Core Depot Stream
                      </span>
                      <input
                        type="text"
                        value={perforceStream}
                        onChange={(e) => setPerforceStream(e.target.value)}
                        className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12px] text-[var(--text-color-kumo-strong)] outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-subtle)]">
                        SIEM Audit Log Webhook (Datadog / Splunk / Cloudflare Logpush)
                      </span>
                      <input
                        type="text"
                        value={auditSiemEndpoint}
                        onChange={(e) => setAuditSiemEndpoint(e.target.value)}
                        className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12px] text-[var(--text-color-kumo-strong)] outline-none"
                      />
                    </label>
                  </div>

                  <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-3 flex items-center justify-between gap-3 text-[12px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Server size={14} className="text-[var(--text-color-kumo-subtle)] shrink-0" />
                      <span className="truncate">
                        <strong>Dedicated TAM:</strong> Minh Hoang (minh.hoang@onflow.asia) · 99.99% Uptime SLA
                      </span>
                    </div>
                    <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-success)] font-medium shrink-0 whitespace-nowrap">
                      SLA Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: BILLING & TAX PROFILE                                   */}
            {/* ============================================================== */}
            {activeTab === "billing" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Billing Methods & Corporate Tax Profile
                    </h3>
                    <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                      Manage stored corporate cards, VAT invoice entities, and purchase order (PO) requirements.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} strokeWidth={1.5} />
                    <span>Download latest VAT invoice</span>
                  </button>
                </div>

                {/* Plan & PO Summary */}
                <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                      Active Studio Tier
                    </span>
                    <span className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Enterprise Studio (10 Seats)
                    </span>
                    <span className="text-[11.5px] text-[var(--text-color-kumo-success)]">
                      Unlimited 0-credit re-exports
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                      Available Credit Balance
                    </span>
                    <span className="text-[16px] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono inline-flex items-center gap-1.5">
                      <span>2,686</span>
                      <CreditIcon size={13} />
                    </span>
                    <span className="text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                      Rollover valid through Jul 2027
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                      Active Purchase Order (PO) Code
                    </span>
                    <input
                      type="text"
                      value={activePoNumber}
                      onChange={(e) => setActivePoNumber(e.target.value)}
                      className="h-8 px-2.5 rounded-[6px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12.5px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                  </div>
                </div>

                {/* Stored Payment Methods */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Stored corporate payment methods
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddCard((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={1.5} />
                      <span>{showAddCard ? "Cancel" : "Add corporate card"}</span>
                    </button>
                  </div>

                  {showAddCard && (
                    <form
                      onSubmit={handleAddCardSubmit}
                      className="bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] rounded-[8px] p-3.5 grid grid-cols-1 sm:grid-cols-[130px_1fr_110px_auto] gap-2.5 items-end"
                    >
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Network
                        </span>
                        <select
                          value={newCardBrand}
                          onChange={(e) =>
                            setNewCardBrand(
                              e.target.value as "VISA" | "Mastercard"
                            )
                          }
                          className="h-9 px-2.5 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        >
                          <option value="VISA">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Last 4 digits
                        </span>
                        <input
                          type="text"
                          maxLength={4}
                          value={newCardLast4}
                          onChange={(e) => setNewCardLast4(e.target.value)}
                          placeholder="4821"
                          className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Expiry
                        </span>
                        <input
                          type="text"
                          value={newCardExpiry}
                          onChange={(e) => setNewCardExpiry(e.target.value)}
                          placeholder="08/2029"
                          className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        />
                      </label>
                      <button
                        type="submit"
                        className="h-9 px-3.5 rounded-[8px] kumo-btn-primary text-[12.5px] font-medium cursor-pointer"
                      >
                        Save card
                      </button>
                    </form>
                  )}

                  <div className="flex flex-col gap-2">
                    {activeMethods.map((pm) => (
                      <div
                        key={pm.id}
                        className="bg-white border border-[var(--color-kumo-line)] rounded-[8px] px-3.5 py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-[6px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] flex items-center justify-center text-[var(--text-color-kumo-default)] shrink-0">
                            <CreditCard size={15} strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="m-0 text-[13px] font-medium text-[var(--text-color-kumo-strong)] truncate">
                              {pm.label}
                            </p>
                            <p className="m-0 kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
                              {pm.meta}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {pm.isDefault ? (
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-strong)]">
                              Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultCard(pm.id)}
                              className="text-[12px] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-strong)] bg-transparent border-0 p-0 cursor-pointer"
                            >
                              Set default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCard(pm.id)}
                            aria-label={`Remove ${pm.label}`}
                            className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] bg-transparent border-0 p-1 cursor-pointer"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing & VAT Entity */}
                <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-kumo-line)]">
                  <div className="flex items-center justify-between">
                    <h4 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Registered VAT Billing Entity
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress((prev) => !prev)}
                      className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      {isEditingAddress ? "Cancel" : "Edit entity"}
                    </button>
                  </div>

                  {isEditingAddress ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] rounded-[8px] p-4">
                      <label className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Legal Company Name
                        </span>
                        <input
                          type="text"
                          value={billingAddress.company}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              company: e.target.value,
                            }))
                          }
                          className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Street Address
                        </span>
                        <input
                          type="text"
                          value={billingAddress.line1}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              line1: e.target.value,
                            }))
                          }
                          className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          District, City & Postal Code
                        </span>
                        <input
                          type="text"
                          value={billingAddress.line2}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              line2: e.target.value,
                            }))
                          }
                          className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Country
                        </span>
                        <input
                          type="text"
                          value={billingAddress.country}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              country: e.target.value,
                            }))
                          }
                          className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                          Tax ID / Vietnam MST
                        </span>
                        <input
                          type="text"
                          value={billingAddress.taxId}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              taxId: e.target.value,
                            }))
                          }
                          className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[13px] text-[var(--text-color-kumo-strong)] outline-none"
                        />
                      </label>
                      <div className="sm:col-span-2 flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSaveBillingAddress?.(billingAddress);
                            setIsEditingAddress(false);
                            showFeedback("Billing & VAT profile saved");
                          }}
                          className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer"
                        >
                          Save billing entity
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] leading-[20px] text-[var(--text-color-kumo-default)] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] rounded-[8px] p-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="m-0 font-semibold text-[var(--text-color-kumo-strong)]">
                          {billingAddress.company}
                        </p>
                        <p className="m-0 text-[var(--text-color-kumo-subtle)]">
                          {billingAddress.line1}, {billingAddress.line2},{" "}
                          {billingAddress.country}
                        </p>
                      </div>
                      <span className="kumo-mono text-[12px] font-medium px-2.5 py-1 rounded-[6px] bg-white border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)]">
                        Tax ID: {billingAddress.taxId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 6: SECURITY & SCOPED API TOKENS                            */}
            {/* ============================================================== */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4">
                  <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Security, 2FA & Scoped API Tokens
                  </h3>
                  <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                    Manage multi-factor authentication, scoped Bridge CLI tokens, and active workstation sessions.
                  </p>
                </div>

                {/* 2FA & Hardware Security Key */}
                <div className="rounded-[8px] border border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={18}
                        strokeWidth={1.5}
                        className={
                          twoFactorEnabled
                            ? "text-[var(--text-color-kumo-success)] mt-0.5"
                            : "text-[var(--text-color-kumo-subtle)] mt-0.5"
                        }
                      />
                      <div>
                        <p className="m-0 text-[13.5px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Two-factor authentication (TOTP & WebAuthn Passkey)
                        </p>
                        <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                          Require an authenticator code or FIDO2 hardware key when signing in or generating API tokens
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled((prev) => !prev);
                        showFeedback(
                          `Two-factor authentication ${
                            !twoFactorEnabled ? "enabled" : "disabled"
                          }`
                        );
                      }}
                      className={`h-8 px-3 rounded-[8px] text-[12px] font-medium cursor-pointer border ${
                        twoFactorEnabled
                          ? "bg-white border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)]"
                          : "kumo-btn-primary border-0"
                      }`}
                    >
                      {twoFactorEnabled ? "Configured" : "Enable 2FA"}
                    </button>
                  </div>

                  {twoFactorEnabled && (
                    <div className="bg-white border border-[var(--color-kumo-line)] rounded-[8px] px-3 py-2 flex items-center justify-between gap-2">
                      <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-default)]">
                        Emergency recovery key: <strong>ONF-94K2-77XP-2026</strong>
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              "ONF-94K2-77XP-2026"
                            );
                          } catch {}
                          setCopiedRecovery(true);
                          showFeedback("Recovery key copied");
                          setTimeout(() => setCopiedRecovery(false), 1800);
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-color-kumo-link)] bg-transparent border-0 p-0 cursor-pointer"
                      >
                        {copiedRecovery ? (
                          <Check size={13} />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{copiedRecovery ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Scoped API & Bridge Tokens */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Scoped API & Bridge CLI Tokens
                    </h4>
                    <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                      Tokens authenticate Unreal Engine / Blender / Houdini nodes directly against your studio archive.
                    </p>
                  </div>

                  <form
                    onSubmit={handleCreateToken}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-2"
                  >
                    <input
                      type="text"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      placeholder="Token label (e.g. Da Nang UE5 Render Node)"
                      className="h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12.5px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                    <select
                      value={newTokenScope}
                      onChange={(e) => setNewTokenScope(e.target.value)}
                      className="h-9 px-2.5 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12.5px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                    >
                      <option value="Catalog:Read + Downloads:Export">
                        Read + Export Unlocked
                      </option>
                      <option value="Catalog:Read + Bridge:Stream + Unlock:Write">
                        Full Bridge + Credit Unlock
                      </option>
                      <option value="Catalog:Read">Read-Only Catalog</option>
                    </select>
                    <button
                      type="submit"
                      className="h-9 px-3.5 rounded-[8px] kumo-btn-primary text-[12.5px] font-medium cursor-pointer"
                    >
                      + Create token
                    </button>
                  </form>

                  <div className="rounded-[8px] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)]">
                    {apiTokens.map((tok) => (
                      <div
                        key={tok.id}
                        className="p-3 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <KeyRound
                              size={13}
                              className="text-[var(--text-color-kumo-subtle)]"
                            />
                            <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                              {tok.name}
                            </span>
                            <code className="kumo-mono text-[11.5px] px-1.5 py-0.5 rounded bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)]">
                              {tok.prefix}
                            </code>
                          </div>
                          <span className="text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                            Scopes: {tok.scopes.join(" · ")} · Last used:{" "}
                            {tok.lastUsed}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setApiTokens((prev) =>
                              prev.filter((item) => item.id !== tok.id)
                            );
                            showFeedback(`Revoked API token "${tok.name}"`);
                          }}
                          className="h-7 px-2.5 rounded-[6px] bg-white hover:bg-[#fef2f2] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] cursor-pointer"
                        >
                          Roll / Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Sessions & Password */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-kumo-line)]">
                  <form
                    onSubmit={handleUpdatePassword}
                    className="flex flex-col gap-2.5"
                  >
                    <h4 className="m-0 text-[13.5px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Rotate password
                    </h4>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="h-9 px-3 rounded-[8px] border border-[var(--color-kumo-line)] text-[13px] outline-none"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 chars)"
                      className="h-9 px-3 rounded-[8px] border border-[var(--color-kumo-line)] text-[13px] outline-none"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="h-9 px-3 rounded-[8px] border border-[var(--color-kumo-line)] text-[13px] outline-none"
                    />
                    <div className="pt-1">
                      <button
                        type="submit"
                        className="h-8 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12.5px] font-medium text-[var(--text-color-kumo-strong)] cursor-pointer"
                      >
                        Update password
                      </button>
                    </div>
                  </form>

                  <div className="flex flex-col gap-2.5">
                    <h4 className="m-0 text-[13.5px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Active device sessions ({sessions.length})
                    </h4>
                    <div className="rounded-[8px] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)]">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 flex items-center justify-between gap-2 text-[12px]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {s.kind === "desktop" ? (
                              <Laptop
                                size={14}
                                className="text-[var(--text-color-kumo-subtle)] shrink-0"
                              />
                            ) : (
                              <Smartphone
                                size={14}
                                className="text-[var(--text-color-kumo-subtle)] shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-[var(--text-color-kumo-strong)] truncate">
                                {s.device}
                              </div>
                              <div className="text-[11px] text-[var(--text-color-kumo-subtle)] truncate">
                                {s.location}
                              </div>
                            </div>
                          </div>
                          {s.current ? (
                            <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-success)] font-medium shrink-0">
                              Current
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSessions((prev) =>
                                  prev.filter((item) => item.id !== s.id)
                                );
                                showFeedback(`Revoked session ${s.device}`);
                              }}
                              className="text-[11.5px] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] bg-transparent border-0 p-0 cursor-pointer shrink-0"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 7: NOTIFICATIONS & WEBHOOKS                                */}
            {/* ============================================================== */}
            {activeTab === "notifications" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Notifications & Studio Webhooks
                    </h3>
                    <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                      Route credit spend alerts, batch export completions, and new Vietnam scan releases to Slack or email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showFeedback("Test payload dispatched to Slack webhook")
                    }
                    className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                  >
                    Send test webhook
                  </button>
                </div>

                {/* Slack / Discord / Teams Webhook */}
                <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <Webhook
                      size={15}
                      className="text-[var(--text-color-kumo-strong)]"
                    />
                    <span className="text-[13.5px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Slack / Discord / Microsoft Teams Pipeline Webhook
                    </span>
                  </div>
                  <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                    Receives real-time JSON events whenever an artist unlocks an asset or a Bridge sync completes.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[12px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => showFeedback("Webhook endpoint saved")}
                      className="h-9 px-3.5 rounded-[8px] kumo-btn-primary text-[12.5px] font-medium cursor-pointer"
                    >
                      Save endpoint
                    </button>
                  </div>
                </div>

                {/* Email Notification Switches */}
                <div className="rounded-[8px] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)] px-4">
                  {[
                    {
                      key: "assetUpdates" as const,
                      label: "New Vietnam heritage scans & 8K PBR releases",
                      desc: "Weekly digest of new photogrammetry monuments and calibrated HDRI skies",
                    },
                    {
                      key: "teamActivity" as const,
                      label: "Studio seat unlocks & batch exports",
                      desc: "Notify when teammates unlock multi-asset queues above 25 credits",
                    },
                    {
                      key: "billingReceipts" as const,
                      label: "Consolidated VAT invoices & credit top-ups",
                      desc: "Send PDF tax receipts to your billing email and finance admins",
                    },
                    {
                      key: "spendLimitAlerts" as const,
                      label: "Monthly spend limit threshold alerts (80% & 100%)",
                      desc: "Immediate warning when workspace credit consumption approaches monthly cap",
                    },
                  ].map((item) => {
                    const checked = emailNotifs[item.key];
                    return (
                      <div
                        key={item.key}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="m-0 text-[13px] font-medium text-[var(--text-color-kumo-strong)]">
                            {item.label}
                          </p>
                          <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                            {item.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          onClick={() => {
                            setEmailNotifs((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key],
                            }));
                            showFeedback("Notification preference updated");
                          }}
                          className={`w-10 h-6 shrink-0 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
                            checked
                              ? "bg-[var(--color-kumo-brand)] justify-end"
                              : "bg-[var(--color-kumo-fill)] justify-start"
                          }`}
                        >
                          <span className="size-5 rounded-full bg-white shadow-xs" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 8: APPEARANCE & LOCALE                                     */}
            {/* ============================================================== */}
            {(activeTab === "appearance" || activeTab === "about") && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[var(--color-kumo-line)] pb-4">
                  <h3 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Appearance, Density & Regional Locale
                  </h3>
                  <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                    Customize Cloudflare Kumo dashboard density, accent tokens, and timezone formatting.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Accent color token
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_PRESETS.map((preset) => {
                      const selected = accentHex === preset.hex;
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => {
                            setAccentHex(preset.hex);
                            showFeedback(`Accent token set to ${preset.name}`);
                          }}
                          className={`h-9 px-3 rounded-[8px] border flex items-center gap-2 text-[12.5px] cursor-pointer transition-colors ${
                            selected
                              ? "border-[var(--text-color-kumo-strong)] bg-[var(--color-kumo-canvas)] font-medium text-[var(--text-color-kumo-strong)]"
                              : "border-[var(--color-kumo-line)] bg-white text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                          }`}
                        >
                          <span
                            className="size-3.5 rounded-[4px]"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-kumo-line)]">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Display language
                    </span>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        showFeedback(`Language set to ${e.target.value}`);
                      }}
                      className="h-9 px-3 rounded-[8px] border border-[var(--color-kumo-line)] bg-white text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                    >
                      <option value="English">English (US)</option>
                      <option value="Tiếng Việt">Tiếng Việt (VN)</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                      Audit log & invoice timezone
                    </span>
                    <select
                      value={timezone}
                      onChange={(e) => {
                        setTimezone(e.target.value);
                        showFeedback(`Timezone updated to ${e.target.value}`);
                      }}
                      className="h-9 px-3 rounded-[8px] border border-[var(--color-kumo-line)] bg-white text-[13px] text-[var(--text-color-kumo-strong)] outline-none cursor-pointer"
                    >
                      <option value="Asia/Ho_Chi_Minh (UTC+07:00)">
                        Asia/Ho_Chi_Minh (UTC+07:00)
                      </option>
                      <option value="Asia/Singapore (UTC+08:00)">
                        Asia/Singapore (UTC+08:00)
                      </option>
                      <option value="UTC (Coordinated Universal Time)">
                        UTC (Coordinated Universal Time)
                      </option>
                    </select>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-kumo-line)]">
                  <div>
                    <p className="m-0 text-[13.5px] font-medium text-[var(--text-color-kumo-strong)]">
                      Compact table density
                    </p>
                    <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)]">
                      Display tighter row heights in Downloads, Invoices, and Observability logs
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={compactDensity}
                    onClick={() => {
                      setCompactDensity((prev) => !prev);
                      showFeedback("Table density updated");
                    }}
                    className={`w-10 h-6 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
                      compactDensity
                        ? "bg-[var(--color-kumo-brand)] justify-end"
                        : "bg-[var(--color-kumo-fill)] justify-start"
                    }`}
                  >
                    <span className="size-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );

  if (isPage) {
    return innerContent;
  }

  return (
    <div
      className="kumo-portal fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-5"
      onClick={onClose}
    >
      {innerContent}
    </div>
  );
}
