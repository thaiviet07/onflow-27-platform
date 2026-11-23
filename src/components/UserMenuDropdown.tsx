"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  Download,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Shield,
  Sliders,
  User,
} from "lucide-react";
import { CreditIcon } from "@/components/CreditIcon";
import { SettingsTab } from "@/components/portal/SettingsOverlay";

export interface UserMenuDropdownProps {
  /** Current workspace context ("gallery" | "portal") */
  context: "gallery" | "portal";
  userName?: string;
  userEmail?: string;
  organization?: string;
  credits?: number;
  avatarUrl?: string | null;
  /** Optional callbacks when inside Portal so clicks open overlays directly */
  onOpenSettings?: (tab: SettingsTab) => void;
  onOpenSupport?: () => void;
  onSignOut?: () => void;
}

/**
 * Shared Cloudflare Kumo User Menu Dropdown triggered from the top-right User icon
 * on both Gallery (`/`, `/item`) and Portal (`/portal`).
 */
export function UserMenuDropdown({
  context,
  userName = "David Nguyen",
  userEmail = "dev@onflow.asia",
  organization = "Onflow Asia",
  credits = 2686,
  avatarUrl = null,
  onOpenSettings,
  onOpenSupport,
  onSignOut,
}: UserMenuDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSettings = (tab: SettingsTab) => {
    setOpen(false);
    if (onOpenSettings) {
      onOpenSettings(tab);
      return;
    }
    router.push(`/portal?settings=${tab}`);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User account menu"
        title={`${userName} (${userEmail})`}
        className={`size-8 rounded-[8px] border inline-flex items-center justify-center cursor-pointer transition-colors ${
          open
            ? "bg-[var(--color-kumo-recessed)] border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-strong)]"
            : context === "portal"
            ? "bg-transparent hover:bg-[var(--color-kumo-tint)] border-transparent text-[var(--text-color-kumo-default)]"
            : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[var(--text-color-kumo-strong)]"
        }`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="size-6 rounded-[6px] object-cover"
          />
        ) : (
          <User
            size={15.5}
            strokeWidth={1.5}
            className={
              open
                ? "text-[var(--text-color-kumo-strong)]"
                : context === "portal"
                ? "text-[var(--text-color-kumo-subtle)]"
                : "text-[var(--text-color-kumo-strong)]"
            }
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[264px] bg-white rounded-[10px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] overflow-hidden"
        >
          {/* User Identity & Credit Header */}
          <div className="p-3 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] flex items-center gap-2.5">
            <div className="size-9 rounded-[8px] bg-[var(--text-color-kumo-strong)] text-white flex items-center justify-center shrink-0 overflow-hidden text-[12px] font-semibold kumo-mono">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)] truncate">
                {userName}
              </div>
              <div className="text-[11.5px] text-[var(--text-color-kumo-subtle)] truncate">
                {userEmail}
              </div>
            </div>
          </div>

          {/* Workspace Credit Strip */}
          <div className="px-3 py-2 border-b border-[var(--color-kumo-line)] flex items-center justify-between text-[12px]">
            <span className="text-[var(--text-color-kumo-subtle)] truncate">
              {organization} · Enterprise
            </span>
            <Link
              href="/payment"
              onClick={() => setOpen(false)}
              className="kumo-mono font-semibold text-[var(--text-color-kumo-strong)] hover:text-[var(--text-color-kumo-link)] inline-flex items-center gap-1 no-underline shrink-0"
            >
              <span>{credits.toLocaleString("en-US")}</span>
              <CreditIcon size={10} />
            </Link>
          </div>

          {/* Group 1: Primary Destinations */}
          <div className="p-1.5 flex flex-col gap-0.5 border-b border-[var(--color-kumo-line)]">
            {context === "gallery" ? (
              <Link
                href="/portal"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="h-8 px-2.5 rounded-[6px] hover:bg-[var(--color-kumo-tint)] flex items-center gap-2.5 text-[13px] font-medium text-[var(--text-color-kumo-strong)] no-underline transition-colors"
              >
                <LayoutDashboard
                  size={14.5}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <span>Account Portal</span>
              </Link>
            ) : (
              <Link
                href="/"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="h-8 px-2.5 rounded-[6px] hover:bg-[var(--color-kumo-tint)] flex items-center gap-2.5 text-[13px] font-medium text-[var(--text-color-kumo-strong)] no-underline transition-colors"
              >
                <Globe
                  size={14.5}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <span>3D Asset Gallery</span>
              </Link>
            )}

            <Link
              href="/portal?tab=downloads"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="h-8 px-2.5 rounded-[6px] hover:bg-[var(--color-kumo-tint)] flex items-center gap-2.5 text-[13px] text-[var(--text-color-kumo-default)] no-underline transition-colors"
            >
              <Download
                size={14.5}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
              <span>Downloads & Bridge</span>
            </Link>

            <Link
              href="/payment"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="h-8 px-2.5 rounded-[6px] hover:bg-[var(--color-kumo-tint)] flex items-center justify-between gap-2 text-[13px] text-[var(--text-color-kumo-default)] no-underline transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <CreditCard
                  size={14.5}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <span>Purchase Credits</span>
              </span>
              <span className="text-[11px] font-medium text-[var(--text-color-kumo-link)]">
                Top up
              </span>
            </Link>
          </div>

          {/* Group 2: Settings & Governance */}
          <div className="p-1.5 flex flex-col gap-0.5 border-b border-[var(--color-kumo-line)]">
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSettings("profile")}
              className="h-8 w-full px-2.5 rounded-[6px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center gap-2.5 text-left text-[13px] text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <User
                size={14.5}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
              <span>Profile & Pipeline</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleSettings("account")}
              className="h-8 w-full px-2.5 rounded-[6px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center gap-2.5 text-left text-[13px] text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <Sliders
                size={14.5}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
              <span>Account Settings</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleSettings("enterprise")}
              className="h-8 w-full px-2.5 rounded-[6px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-between gap-2 text-left text-[13px] text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Building2
                  size={14.5}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <span>Enterprise & SSO</span>
              </span>
              <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)]">
                SAML
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleSettings("security")}
              className="h-8 w-full px-2.5 rounded-[6px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center gap-2.5 text-left text-[13px] text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <Shield
                size={14.5}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
              <span>Security & API Tokens</span>
            </button>
          </div>

          {/* Group 3: Support & Sign Out */}
          <div className="p-1.5 flex flex-col gap-0.5">
            {onOpenSupport && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onOpenSupport();
                }}
                className="h-8 w-full px-2.5 rounded-[6px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center gap-2.5 text-left text-[13px] text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
              >
                <HelpCircle
                  size={14.5}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <span>Support Center</span>
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                if (onSignOut) {
                  onSignOut();
                } else {
                  router.push("/");
                }
              }}
              className="h-8 w-full px-2.5 rounded-[6px] bg-transparent hover:bg-[#fef2f2] border-0 flex items-center gap-2.5 text-left text-[13px] text-[var(--text-color-kumo-danger)] cursor-pointer transition-colors"
            >
              <LogOut size={14.5} strokeWidth={1.5} className="shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenuDropdown;
