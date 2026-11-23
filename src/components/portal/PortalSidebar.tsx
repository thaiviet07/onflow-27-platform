"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  Download,
  Globe,
  Home,
  KeyRound,
  Layers,
  MoreHorizontal,
  PanelLeft,
  Search,
  Shield,
  Sliders,
  User,
  Users,
  X,
} from "lucide-react";
import { CreditIcon } from "@/components/CreditIcon";
import { SettingsTab } from "@/components/portal/SettingsOverlay";

export type PortalActiveSection =
  | "home"
  | "downloads"
  | "analytics"
  | "billing-credits"
  | "billing-purchase"
  | "billing-invoices"
  | "billing-limits"
  | "billing-subscriptions"
  | "billing-usage"
  | "settings";

export type PortalOrgOption = {
  key: "onflow" | "mekong";
  name: string;
  accountHandle: string;
  email: string;
  credits: number;
};

export const PORTAL_ORG_LIST: Record<"onflow" | "mekong", PortalOrgOption> = {
  onflow: {
    key: "onflow",
    name: "Onflow Asia",
    accountHandle: "Enterprise · 10 seats",
    email: "dev@onflow.asia",
    credits: 2686,
  },
  mekong: {
    key: "mekong",
    name: "Mekong Studio",
    accountHandle: "Studio · 5 seats",
    email: "studio@mekong3d.vn",
    credits: 1420,
  },
};

export interface PortalSidebarProps {
  /** Which primary route or sub-section is currently active */
  activeSection: PortalActiveSection;
  /** Currently active SettingsTab when activeSection === "settings" */
  activeSettingsTab?: SettingsTab;
  /** Currently active download category when inside Downloads */
  activeDownloadCategory?: string;
  /** Active organization key */
  activeOrgKey?: "onflow" | "mekong";
  /** Override displayed credit balance (e.g., live top-up on /payment) */
  creditsDisplay?: string | number;
  /** Pending transaction badge count on Billing */
  pendingBillingCount?: number;
  /** Desktop collapsed state (60px vs 260px) */
  collapsed?: boolean;
  /** Mobile drawer mode */
  isMobile?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  onSwitchOrg?: (orgKey: "onflow" | "mekong") => void;
  onOpenQuickSearch?: () => void;
  /** Handlers for in-page navigation on /portal (falls back to router.push when on /payment) */
  onNavigateTab?: (
    tab: "home" | "downloads" | "analytics" | "credits",
    subOption?: string
  ) => void;
  onOpenSettings?: (tab: SettingsTab) => void;
}

/**
 * Unified Cloudflare Kumo Portal Sidebar (`260px` expanded / `60px` collapsed).
 * Shared across `/portal` and `/payment` so scale, typography, and section hierarchy
 * remain 100% identical across the entire Account Portal experience.
 */
export function PortalSidebar({
  activeSection,
  activeSettingsTab,
  activeDownloadCategory = "all",
  activeOrgKey = "onflow",
  creditsDisplay,
  pendingBillingCount = 1,
  collapsed = false,
  isMobile = false,
  onToggleCollapse,
  onCloseMobile,
  onSwitchOrg,
  onOpenQuickSearch,
  onNavigateTab,
  onOpenSettings,
}: PortalSidebarProps) {
  const router = useRouter();
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);
  const isBillingActive = activeSection.startsWith("billing-");
  const isDownloadsActive = activeSection === "downloads";
  const isSettingsActive = activeSection === "settings";

  const [expandedGroups, setExpandedGroups] = useState({
    library: isDownloadsActive,
    billing: isBillingActive,
    settings: isSettingsActive,
  });

  // Auto-expand the matching group when activeSection changes
  React.useEffect(() => {
    if (isSettingsActive) {
      setExpandedGroups((prev) => ({ ...prev, settings: true }));
    } else if (isBillingActive) {
      setExpandedGroups((prev) => ({ ...prev, billing: true }));
    } else if (isDownloadsActive) {
      setExpandedGroups((prev) => ({ ...prev, library: true }));
    }
  }, [isSettingsActive, isBillingActive, isDownloadsActive]);

  const isCollapsed = collapsed && !isMobile;
  const currentOrg = PORTAL_ORG_LIST[activeOrgKey] ?? PORTAL_ORG_LIST.onflow;
  const formattedCredits =
    creditsDisplay !== undefined
      ? typeof creditsDisplay === "number"
        ? creditsDisplay.toLocaleString("en-US")
        : creditsDisplay
      : currentOrg.credits.toLocaleString("en-US");

  const handleGoPortalTab = (
    tab: "home" | "downloads" | "analytics" | "credits",
    subOption?: string
  ) => {
    onCloseMobile?.();
    if (onNavigateTab) {
      onNavigateTab(tab, subOption);
      return;
    }
    if (tab === "home") {
      router.push("/portal");
    } else if (tab === "downloads") {
      router.push(
        subOption && subOption !== "all"
          ? `/portal?tab=downloads&cat=${encodeURIComponent(subOption)}`
          : "/portal?tab=downloads"
      );
    } else if (tab === "analytics") {
      router.push("/portal?tab=analytics");
    } else if (tab === "credits") {
      router.push(
        subOption
          ? `/portal?tab=credits&sub=${encodeURIComponent(subOption)}`
          : "/portal?tab=credits"
      );
    }
  };

  const handleOpenSettingsTab = (tab: SettingsTab) => {
    onCloseMobile?.();
    if (onOpenSettings) {
      onOpenSettings(tab);
      return;
    }
    router.push(`/portal?settings=${tab}`);
  };

  return (
    <div className="kumo-portal flex flex-col h-full w-full bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)] select-none">
      {/* ==================================================================== */}
      {/* 1. TOP 58PX ALIGNED HEADER (Scale: 20px Logo + Divider + Workspace)   */}
      {/* ==================================================================== */}
      <div className="h-[58px] shrink-0 px-3 border-b border-[var(--color-kumo-line)] flex items-center justify-between gap-2 relative">
        {/* Brand Logo Mark */}
        <Link
          href="/"
          title="Onflow 3D Asset Library"
          className={`rounded-[8px] hover:bg-[var(--color-kumo-tint)] flex items-center justify-center shrink-0 no-underline transition-colors ${
            isCollapsed ? "size-9" : "h-9 px-1.5"
          }`}
        >
          {isCollapsed ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Onflow Asia"
            >
              <path
                d="M42.0248 39.6443C39.2825 39.1995 36.6552 38.6598 34.1555 38.0251C38.6483 35.2347 41.7761 32.0618 43.3555 28.6367C45.246 24.5355 45.2864 20.6154 45.2834 20.1824C45.2521 12.1759 40.0878 6.86486 39.0524 5.88035C33.4652 0.57232 26.7462 0 24.1097 0C21.473 0 14.7603 0.572319 9.16996 5.88332C8.13459 6.86783 2.97022 12.1788 2.93912 20.1824C2.93912 20.6154 2.97643 24.5385 4.86682 28.6367C6.4463 32.0618 9.57415 35.2347 14.067 38.0251C11.5671 38.6568 8.93987 39.1995 6.19756 39.6443L2.33594 40.27L3.65113 47.6389L7.51586 47.0132C13.5601 46.0317 19.1381 44.6142 24.1128 42.7875C29.0906 44.6112 34.6654 46.0317 40.7097 47.0132L44.5744 47.6389L45.8896 40.27L42.0248 39.6443ZM10.8303 20.1973C10.8303 18.3883 11.2158 16.5854 11.9713 14.9811C13.8866 10.9215 18.1898 7.97985 22.8348 7.55283C27.48 7.12581 32.2931 9.23125 34.9857 12.8668C37.8306 16.707 38.2317 22.2404 35.7909 26.3623C33.4155 30.3804 28.3475 32.9039 24.1097 34.7068C20.2138 33.0491 15.8299 30.8548 13.2275 27.504C11.62 25.4371 10.8272 22.8098 10.8272 20.1943L10.8303 20.1973Z"
                fill="#19213D"
              />
            </svg>
          ) : (
            <img
              src="/onflow-logo.svg"
              alt="Onflow Asia"
              className="h-[20px] w-auto object-contain block"
            />
          )}
        </Link>

        {!isCollapsed && (
          <span
            className="h-4 w-[1px] bg-[var(--color-kumo-line)] shrink-0"
            aria-hidden="true"
          />
        )}

        {/* Workspace Account Switcher Pill (Proportioned so workspace name never clips mid-word) */}
        {!isCollapsed && (
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setOrgSwitcherOpen((prev) => !prev)}
              title={`${currentOrg.name} (${currentOrg.accountHandle})`}
              className="w-full h-[34px] px-2 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-between gap-1.5 cursor-pointer text-left transition-colors"
            >
              <div className="min-w-0 flex flex-col leading-tight">
                <span className="text-[12.5px] font-semibold text-[var(--text-color-kumo-strong)] truncate">
                  {currentOrg.name}
                </span>
                <span className="text-[10.5px] text-[var(--text-color-kumo-subtle)] truncate">
                  {currentOrg.accountHandle}
                </span>
              </div>
              <ChevronsUpDown
                size={13}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
            </button>

            {orgSwitcherOpen && (
              <div className="absolute left-0 right-0 top-[40px] z-50 bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] p-1 flex flex-col gap-0.5">
                {(["onflow", "mekong"] as const).map((orgKey) => {
                  const org = PORTAL_ORG_LIST[orgKey];
                  const isCurrent = activeOrgKey === orgKey;
                  return (
                    <button
                      key={orgKey}
                      type="button"
                      onClick={() => {
                        setOrgSwitcherOpen(false);
                        onSwitchOrg?.(orgKey);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-[6px] border-0 text-left flex items-center justify-between gap-2 cursor-pointer text-[12.5px] ${
                        isCurrent
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate">{org.name}</div>
                        <div className="text-[11px] font-normal text-[var(--text-color-kumo-subtle)] truncate">
                          {org.email}
                        </div>
                      </div>
                      {isCurrent && (
                        <Check
                          size={13}
                          className="text-[var(--color-kumo-brand)] shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
                <div className="border-t border-[var(--color-kumo-line)] mt-1 pt-1">
                  <Link
                    href="/"
                    className="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-[var(--color-kumo-tint)] text-[12px] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] flex items-center gap-1.5 no-underline"
                  >
                    <ArrowLeft size={12} />
                    <span>Return to 3D Gallery</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {isMobile && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="size-8 rounded-[8px] hover:bg-[var(--color-kumo-tint)] border-0 bg-transparent flex items-center justify-center text-[var(--text-color-kumo-subtle)] cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2. QUICK SEARCH TRIGGER (236x32px Cloudflare Kumo Search Well)       */}
      {/* ==================================================================== */}
      {!isCollapsed && (
        <div className="px-3 pt-3.5 pb-2">
          <button
            type="button"
            onClick={() => {
              if (onOpenQuickSearch) {
                onOpenQuickSearch();
              } else {
                router.push("/portal");
              }
            }}
            className="w-full h-8 px-2.5 rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] hover:border-[var(--color-kumo-fill)] flex items-center justify-between gap-2 text-[12.5px] text-[var(--text-color-kumo-placeholder)] cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Search
                size={13.5}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
              <span>Quick search...</span>
            </span>
            <kbd className="text-[11px] font-sans text-[var(--text-color-kumo-subtle)] tracking-tight shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. UNIFIED CLOUDFLARE KUMO NAVIGATION TREE                           */}
      {/* ==================================================================== */}
      <nav className="flex-1 overflow-y-auto px-3 pt-1 pb-4 flex flex-col">
        {/* ---------------- PRIMARY TOP-LEVEL ITEMS (No section header, matching Cloudflare Kumo) ---------------- */}
        <div className="flex flex-col gap-0.5">
          {[
            {
              id: "home" as const,
              label: "Account home",
              Icon: Home,
              hasChevron: false,
              badge: null,
            },
            {
              id: "downloads" as const,
              label: "Downloads",
              Icon: Download,
              hasChevron: true,
              badge: null,
            },
            {
              id: "analytics" as const,
              label: "Observability",
              Icon: BarChart3,
              hasChevron: true,
              badge: "New",
            },
          ].map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleGoPortalTab(item.id)}
                title={item.label}
                className={`group h-[34px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] leading-[18px] cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[var(--color-kumo-recessed)] font-semibold text-[var(--text-color-kumo-strong)]"
                    : "bg-transparent font-medium text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className={`shrink-0 ${
                      isActive
                        ? "opacity-95 text-[var(--text-color-kumo-strong)]"
                        : "opacity-55"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] bg-white/80 shrink-0 font-medium">
                      {item.badge}
                    </span>
                  )}
                </span>
                {!isCollapsed && item.hasChevron && (
                  <ChevronRight
                    size={12}
                    strokeWidth={1.5}
                    className="opacity-35 shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ---------------- SECTION 1: ASSET LIBRARY ---------------- */}
        {!isCollapsed && (
          <div className="mt-5 pt-4 border-t border-[var(--color-kumo-line)]/70 flex flex-col gap-0.5">
            <div className="px-2.5 mb-1.5 text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
              Asset library
            </div>

            <button
              type="button"
              onClick={() =>
                setExpandedGroups((prev) => ({
                  ...prev,
                  library: !prev.library,
                }))
              }
              className={`h-[34px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] leading-[18px] cursor-pointer transition-colors ${
                isDownloadsActive
                  ? "bg-transparent font-semibold text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                  : "bg-transparent font-medium text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Layers
                  size={16}
                  strokeWidth={1.5}
                  className={isDownloadsActive ? "opacity-90 shrink-0" : "opacity-55 shrink-0"}
                />
                <span className="truncate">3D & PBR Archives</span>
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`opacity-40 shrink-0 transition-transform duration-150 ${
                  expandedGroups.library ? "" : "-rotate-90"
                }`}
              />
            </button>

            {expandedGroups.library && (
              <div className="relative pl-7 my-0.5 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[18px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                {[
                  { label: "Orders & Exports", cat: "all" },
                  { label: "3D Models", cat: "3D models" },
                  { label: "PBR Surfaces", cat: "Surfaces" },
                  { label: "HDRI Environments", cat: "HDRIs" },
                  { label: "Kitbash Modules", cat: "Kitbash", badge: "Beta" },
                ].map((sub) => {
                  const isSubActive =
                    activeSection === "downloads" &&
                    activeDownloadCategory === sub.cat;
                  return (
                    <button
                      key={sub.label}
                      type="button"
                      onClick={() => handleGoPortalTab("downloads", sub.cat)}
                      className={`h-[30px] w-full px-2.5 rounded-[7px] border-0 flex items-center justify-between gap-1.5 text-left text-[12.5px] leading-[18px] cursor-pointer transition-colors ${
                        isSubActive
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <span className="truncate">{sub.label}</span>
                      {sub.badge && (
                        <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-line)] text-[var(--text-color-kumo-subtle)] shrink-0">
                          {sub.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleGoPortalTab("downloads", "bridge")}
              className="h-[34px] w-full px-2.5 rounded-[8px] border-0 bg-transparent hover:bg-[var(--color-kumo-tint)] flex items-center justify-between gap-2 text-left text-[13px] leading-[18px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <KeyRound
                  size={16}
                  strokeWidth={1.5}
                  className="opacity-55 shrink-0"
                />
                <span className="truncate">Bridge & Plugins</span>
              </span>
              <ChevronRight
                size={12}
                strokeWidth={1.5}
                className="opacity-35 shrink-0"
              />
            </button>

            <Link
              href="/"
              className="h-[34px] w-full px-2.5 rounded-[8px] hover:bg-[var(--color-kumo-tint)] flex items-center justify-between gap-2 text-[13px] leading-[18px] font-medium text-[var(--text-color-kumo-default)] no-underline transition-colors"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Globe
                  size={16}
                  strokeWidth={1.5}
                  className="opacity-55 shrink-0"
                />
                <span className="truncate">Explore Catalog</span>
              </span>
              <ArrowUpRight
                size={12}
                strokeWidth={1.5}
                className="opacity-35 shrink-0"
              />
            </Link>
          </div>
        )}

        {/* ---------------- SECTION 2: MANAGE ACCOUNT ---------------- */}
        {!isCollapsed ? (
          <div className="mt-5 pt-4 border-t border-[var(--color-kumo-line)]/70 flex flex-col gap-0.5">
            <div className="px-2.5 mb-1.5 text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
              Manage account
            </div>

            {/* Billing Parent Node */}
            <button
              type="button"
              onClick={() => {
                setExpandedGroups((prev) => ({
                  ...prev,
                  billing: !prev.billing,
                }));
              }}
              className={`h-[34px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] leading-[18px] cursor-pointer transition-colors ${
                isBillingActive
                  ? "bg-transparent font-semibold text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                  : "bg-transparent font-medium text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <CreditCard
                  size={16}
                  strokeWidth={1.5}
                  className={`shrink-0 ${
                    isBillingActive
                      ? "opacity-95 text-[var(--text-color-kumo-strong)]"
                      : "opacity-55"
                  }`}
                />
                <span className="truncate">Billing</span>
                {pendingBillingCount > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)] kumo-mono shrink-0">
                    {pendingBillingCount}
                  </span>
                )}
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`opacity-40 shrink-0 transition-transform duration-150 ${
                  expandedGroups.billing ? "" : "-rotate-90"
                }`}
              />
            </button>

            {expandedGroups.billing && (
              <div className="relative pl-7 my-0.5 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[18px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                <button
                  type="button"
                  onClick={() => handleGoPortalTab("credits", "credits")}
                  className={`h-[30px] w-full px-2.5 rounded-[7px] border-0 flex items-center justify-between text-left text-[12.5px] leading-[18px] cursor-pointer transition-colors ${
                    activeSection === "billing-credits"
                      ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                      : "bg-transparent font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                  }`}
                >
                  <span className="truncate">Credits</span>
                </button>

                <Link
                  href="/payment"
                  onClick={() => onCloseMobile?.()}
                  className={`h-[30px] w-full px-2.5 rounded-[7px] flex items-center justify-between text-left text-[12.5px] leading-[18px] no-underline transition-colors ${
                    activeSection === "billing-purchase"
                      ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                      : "bg-transparent font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                  }`}
                >
                  <span className="truncate">Purchase Credits</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleGoPortalTab("credits", "invoices")}
                  className={`h-[30px] w-full px-2.5 rounded-[7px] border-0 flex items-center justify-between text-left text-[12.5px] leading-[18px] cursor-pointer transition-colors ${
                    activeSection === "billing-invoices"
                      ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                      : "bg-transparent font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                  }`}
                >
                  <span className="truncate">Invoices</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoPortalTab("credits", "limits")}
                  className={`h-[30px] w-full px-2.5 rounded-[7px] border-0 flex items-center justify-between gap-1.5 text-left text-[12.5px] leading-[18px] cursor-pointer transition-colors ${
                    activeSection === "billing-limits"
                      ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                      : "bg-transparent font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                  }`}
                >
                  <span className="truncate">Spend limits</span>
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)] shrink-0">
                    Beta
                  </span>
                </button>
              </div>
            )}

            {/* Account Settings Parent Node (Expandable Tree Subsection) */}
            <button
              type="button"
              onClick={() =>
                setExpandedGroups((prev) => ({
                  ...prev,
                  settings: !prev.settings,
                }))
              }
              className={`h-[34px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] leading-[18px] cursor-pointer transition-colors ${
                isSettingsActive
                  ? "bg-transparent font-semibold text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                  : "bg-transparent font-medium text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Sliders
                  size={16}
                  strokeWidth={1.5}
                  className={
                    isSettingsActive
                      ? "opacity-95 text-[var(--text-color-kumo-strong)] shrink-0"
                      : "opacity-55 shrink-0"
                  }
                />
                <span className="truncate">Account Settings</span>
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`opacity-40 shrink-0 transition-transform duration-150 ${
                  expandedGroups.settings ? "" : "-rotate-90"
                }`}
              />
            </button>

            {expandedGroups.settings && (
              <div className="relative pl-7 my-0.5 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[18px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                {[
                  {
                    id: "account" as SettingsTab,
                    label: "Workspace",
                    badge: null,
                    badgeStyle: "neutral" as const,
                  },
                  {
                    id: "members" as SettingsTab,
                    label: "Team & Members",
                    badge: "4/10",
                    badgeStyle: "neutral" as const,
                  },
                  {
                    id: "enterprise" as SettingsTab,
                    label: "Enterprise & SSO",
                    badge: "SAML",
                    badgeStyle: "brand" as const,
                  },
                  {
                    id: "security" as SettingsTab,
                    label: "Security & Tokens",
                    badge: null,
                    badgeStyle: "neutral" as const,
                  },
                  {
                    id: "profile" as SettingsTab,
                    label: "Profile & Pipeline",
                    badge: null,
                    badgeStyle: "neutral" as const,
                  },
                ].map((sub) => {
                  const isSubActive =
                    isSettingsActive && activeSettingsTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleOpenSettingsTab(sub.id)}
                      className={`h-[30px] w-full px-2.5 rounded-[7px] border-0 flex items-center justify-between gap-1.5 text-left text-[12.5px] leading-[18px] cursor-pointer transition-colors ${
                        isSubActive
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <span className="truncate">{sub.label}</span>
                      {sub.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none shrink-0 ${
                            sub.badgeStyle === "brand"
                              ? "border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)] bg-white"
                              : "border border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-default)] bg-white kumo-mono"
                          }`}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-[var(--color-kumo-line)]/70 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleGoPortalTab("credits", "credits")}
              title="Billing & Credits"
              className={`h-[34px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-center cursor-pointer ${
                isBillingActive
                  ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                  : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <CreditCard size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenSettingsTab("account")}
              title="Account Settings"
              className="h-[34px] w-full px-2.5 rounded-[8px] border-0 bg-transparent hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)] flex items-center justify-center cursor-pointer"
            >
              <Sliders size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </nav>

      {/* ==================================================================== */}
      {/* 4. BOTTOM 48PX COLLAPSE FOOTER                                       */}
      {/* ==================================================================== */}
      {!isMobile && (
        <div className="h-12 shrink-0 px-3 border-t border-[var(--color-kumo-line)] flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="size-8 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
          >
            <PanelLeft size={15.5} strokeWidth={1.5} />
          </button>
          {!collapsed && (
            <span className="text-[11.5px] font-medium text-[var(--text-color-kumo-strong)] kumo-mono inline-flex items-center gap-1">
              <span>{formattedCredits}</span>
              <CreditIcon size={10} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default PortalSidebar;
