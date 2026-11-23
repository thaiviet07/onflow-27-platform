"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  CreditCard,
  Download,
  ExternalLink,
  HardDrive,
  Info,
  Layers,
  Lock,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AssetItem } from "@/data/galleryMeta";
import { CreditIcon } from "./CreditIcon";

export type CartCheckoutScenario =
  | "sufficient"
  | "insufficient"
  | "spend-limit"
  | "mixed-owned"
  | "unlocked";

export type CartCheckoutOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  cartItems: AssetItem[];
  onRemoveItem: (uid: string) => void;
  onClearCart: () => void;
  onAddSampleItems?: () => void;
  workspaceCredits: number;
  onDeductCredits: (amount: number, unlockedUids: string[]) => void;
  unlockedUids?: string[];
  initialScenario?: CartCheckoutScenario;
};

function parseItemCreditCost(item: AssetItem): number {
  if (item.isFree) return 0;
  const m = item.credits.match(/\d+/);
  return m ? parseInt(m[0], 10) : 4;
}

function parseItemSizeMb(raw: string): number {
  const clean = raw.replace(",", ".");
  const m = clean.match(/(\d+(?:\.\d+)?)\s*(GB|MB|KB)?/i);
  if (!m) return 38.5;
  const val = parseFloat(m[1]);
  const unit = (m[2] || "MB").toUpperCase();
  if (unit === "GB") return val * 1024;
  if (unit === "KB") return val / 1024;
  return val;
}

export function CartCheckoutOverlay({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onAddSampleItems,
  workspaceCredits,
  onDeductCredits,
  unlockedUids = [],
  initialScenario = "sufficient",
}: CartCheckoutOverlayProps) {
  const router = useRouter();
  const [scenario, setScenario] =
    useState<CartCheckoutScenario>(initialScenario);
  const [batchFormat, setBatchFormat] = useState("FBX (Unreal / Maya)");
  const [batchResolution, setBatchResolution] = useState("4K (4096×4096 PNG)");
  const [batchLod, setBatchLod] = useState("All LODs (LOD0–LOD4)");
  const [overrideSpendLimit, setOverrideSpendLimit] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadedItemUids, setDownloadedItemUids] = useState<string[]>([]);
  const [settledTotalCredits, setSettledTotalCredits] = useState<number | null>(
    null
  );
  const [settledItemCosts, setSettledItemCosts] = useState<
    Record<string, number>
  >({});
  const [orderRef] = useState("ONF-2026-0894");

  useEffect(() => {
    if (isOpen) {
      setScenario(initialScenario);
      setOverrideSpendLimit(false);
      setDownloadingAll(false);
      setDownloadedItemUids([]);
      setSettledTotalCredits(null);
      setSettledItemCosts({});
    }
  }, [isOpen, initialScenario]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  // Compute per-item breakdown including "already owned" or "free" discounts
  const lineItems = useMemo(() => {
    return cartItems.map((item, idx) => {
      const baseCost = parseItemCreditCost(item);
      // In "mixed-owned" scenario, first item (or any item in unlockedUids) is treated as already unlocked (0 credit re-export)
      const isAlreadyOwned =
        unlockedUids.includes(item.uid) ||
        (scenario === "mixed-owned" && idx === 0);
      const effectiveCost = item.isFree || isAlreadyOwned ? 0 : baseCost;
      const savedCost = isAlreadyOwned && !item.isFree ? baseCost : 0;
      const sizeMb = parseItemSizeMb(item.size);
      return {
        item,
        baseCost,
        effectiveCost,
        savedCost,
        isAlreadyOwned,
        sizeMb,
      };
    });
  }, [cartItems, unlockedUids, scenario]);

  const subtotalCredits = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.baseCost, 0),
    [lineItems]
  );

  const ownedDiscountCredits = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.savedCost, 0),
    [lineItems]
  );

  const totalDueCredits = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.effectiveCost, 0),
    [lineItems]
  );

  const totalArchiveMb = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.sizeMb, 0),
    [lineItems]
  );

  // Effective workspace balance based on scenario switcher so user can inspect all edge cases live
  const effectiveBalance = useMemo(() => {
    if (scenario === "insufficient") {
      // Force balance lower than totalDueCredits (e.g. 3 credits available when cart needs >= 6)
      return Math.max(2, Math.min(3, totalDueCredits - 5));
    }
    return workspaceCredits;
  }, [scenario, workspaceCredits, totalDueCredits]);

  const isInsufficient = effectiveBalance < totalDueCredits;
  const creditShortfall = Math.max(0, totalDueCredits - effectiveBalance);
  const projectedRemainingBalance = effectiveBalance - totalDueCredits;

  // Monthly spend limit use case
  const monthlySpendUsed = 492;
  const monthlySpendCap = 500;
  const isSpendLimitTriggered =
    scenario === "spend-limit" && totalDueCredits > 0;
  const projectedMonthlySpend = monthlySpendUsed + totalDueCredits;

  // Recommended top-up tier for shortfall
  const recommendedPackage = useMemo(() => {
    if (creditShortfall <= 250) {
      return { name: "Starter Pack", credits: 250, bonus: 0, price: "500,000 VND" };
    }
    if (creditShortfall <= 550) {
      return { name: "Popular Pack", credits: 500, bonus: 50, price: "990,000 VND" };
    }
    return { name: "Professional Pack", credits: 750, bonus: 150, price: "1,490,000 VND" };
  }, [creditShortfall]);

  if (!isOpen) return null;

  const handleConfirmCreditCheckout = () => {
    if (cartItems.length === 0) return;
    if (isInsufficient) return;
    if (isSpendLimitTriggered && !overrideSpendLimit) return;

    const itemCostSnapshot: Record<string, number> = {};
    for (const li of lineItems) {
      itemCostSnapshot[li.item.uid] = li.effectiveCost;
    }
    setSettledItemCosts(itemCostSnapshot);
    setSettledTotalCredits(totalDueCredits);

    onDeductCredits(
      totalDueCredits,
      cartItems.map((it) => it.uid)
    );
    setScenario("unlocked");
  };

  const modalContent = (
    <div
      className="kumo-portal fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/55 p-3 sm:p-5 overflow-y-auto gap-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Workspace Credit Cart & Checkout"
    >
      {/* Top Scenario Switcher Pill Bar (Horizontally scrollable on mobile so it never wraps/overlaps) */}
      <div
        role="tablist"
        aria-label="Credit checkout use case preview"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[920px] overflow-x-auto no-scrollbar shrink-0"
      >
        <div className="inline-flex items-center rounded-[8px] bg-white/95 border border-[var(--color-kumo-line)] p-1 gap-1 shadow-[var(--shadow-kumo-md)] whitespace-nowrap min-w-max mx-auto">
          <span className="px-2 text-[11px] font-medium text-[var(--text-color-kumo-subtle)] shrink-0">
            Use case:
          </span>
          {(
            [
              { id: "sufficient", label: "Sufficient balance" },
              { id: "insufficient", label: "Insufficient balance (Shortfall)" },
              { id: "spend-limit", label: "Spend limit warning" },
              { id: "mixed-owned", label: "Owned / Free deduction" },
              { id: "unlocked", label: "Unlocked receipt" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={scenario === tab.id}
              onClick={() => setScenario(tab.id)}
              className={`h-7 px-2.5 rounded-[6px] text-[12px] border-0 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                scenario === tab.id
                  ? "bg-[var(--text-color-kumo-strong)] text-white font-medium"
                  : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Cloudflare Kumo Split Cart & Credit Checkout Modal (920px wide) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] rounded-[12px] w-full max-w-[920px] overflow-hidden flex flex-col max-h-[calc(100vh-84px)]"
      >
        {/* 56px Top Kumo Modal Header */}
        <div className="min-h-[56px] shrink-0 px-4 sm:px-5 py-2 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex size-8 rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] items-center justify-center text-[var(--text-color-kumo-strong)] shrink-0">
              <ShoppingBag size={15} strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="m-0 text-[14px] sm:text-[15px] font-semibold text-[var(--text-color-kumo-strong)] truncate">
                {scenario === "unlocked"
                  ? "Archive unlocked"
                  : "Credit checkout"}
              </h2>
              <span className="hidden sm:inline-flex h-5 px-2 py-0.5 rounded-full border border-[var(--color-kumo-fill)] bg-white text-[11px] font-medium text-[var(--text-color-kumo-default)] kumo-mono shrink-0 whitespace-nowrap">
                {cartItems.length} {cartItems.length === 1 ? "asset" : "assets"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Workspace Credit Balance Pill */}
            <div
              className={`h-8 px-2 sm:px-2.5 rounded-[8px] border flex items-center gap-1.5 text-[12px] kumo-mono whitespace-nowrap ${
                isInsufficient && scenario !== "unlocked"
                  ? "bg-[#fef2f2] border-[#ff6b70]/40 text-[var(--text-color-kumo-danger)]"
                  : "bg-white border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)]"
              }`}
            >
              <span
                className={`size-1.5 rounded-full shrink-0 ${
                  isInsufficient && scenario !== "unlocked"
                    ? "bg-[var(--color-kumo-danger)]"
                    : "bg-[var(--color-kumo-success)]"
                }`}
              />
              <span className="hidden sm:inline text-[var(--text-color-kumo-subtle)] font-normal">
                Balance:
              </span>
              <span className="font-semibold inline-flex items-center gap-1">
                <span>
                  {scenario === "unlocked"
                    ? Math.max(0, workspaceCredits).toLocaleString("en-US")
                    : effectiveBalance.toLocaleString("en-US")}
                </span>
                <CreditIcon size={11} />
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close credit checkout"
              className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <X size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Modal Body: Empty State vsUnlocked Receipt vs Split 2-Column Checkout */}
        {cartItems.length === 0 && scenario !== "unlocked" ? (
          <div className="p-10 flex flex-col items-center justify-center text-center gap-4 bg-white">
            <div className="size-12 rounded-[10px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] flex items-center justify-center text-[var(--text-color-kumo-subtle)]">
              <ShoppingBag size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1 max-w-[380px]">
              <h3 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                Your export queue is empty
              </h3>
              <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)] leading-[20px]">
                Add 3D photogrammetry scans, 8K PBR surfaces, or 32-bit HDRI skies from the catalog to unlock them in a single credit batch.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {onAddSampleItems && (
                <button
                  type="button"
                  onClick={onAddSampleItems}
                  className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} strokeWidth={1.5} />
                  <span>Load sample bundle (3 assets)</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer"
              >
                Browse 3D catalog
              </button>
            </div>
          </div>
        ) : scenario === "unlocked" ? (
          /* ================================================================== */
          /* USE CASE 5: UNLOCKED & READY RECEIPT STATE                         */
          /* ================================================================== */
          <div className="p-6 overflow-y-auto flex flex-col gap-5 bg-white">
            <div className="rounded-[8px] bg-[#ecfdf3] border border-[#34c48b]/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-[8px] bg-white border border-[#34c48b]/30 text-[var(--text-color-kumo-success)] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                      {cartItems.length} {cartItems.length === 1 ? "asset" : "assets"} unlocked for Onflow Asia
                    </h3>
                    <span className="h-5 px-2 py-0.5 rounded-full bg-white border border-[#34c48b]/40 text-[11px] font-medium text-[var(--text-color-kumo-success)]">
                      Permanent license
                    </span>
                  </div>
                  <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                    Order <strong className="kumo-mono text-[var(--text-color-kumo-strong)]">{orderRef}</strong> · Future re-exports in any format or LOD cost 0 credits.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDownloadingAll(true)}
                className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download size={14} strokeWidth={1.5} />
                <span>
                  {downloadingAll
                    ? `Packing bundle (${totalArchiveMb.toFixed(1)} MB)...`
                    : `Download all (.zip · ${totalArchiveMb.toFixed(1)} MB)`}
                </span>
              </button>
            </div>

            {/* Unlocked Assets List with Per-Asset Download */}
            <div className="rounded-[8px] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)] overflow-hidden">
              {lineItems.map(({ item, baseCost, sizeMb }) => {
                const isItemDownloaded =
                  downloadingAll || downloadedItemUids.includes(item.uid);
                const settledCost =
                  settledItemCosts[item.uid] !== undefined
                    ? settledItemCosts[item.uid]
                    : baseCost;
                return (
                  <div
                    key={item.uid}
                    className="p-3.5 bg-white hover:bg-[var(--color-kumo-canvas)] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imgUrl}
                        alt={item.title}
                        className="size-11 rounded-[6px] object-cover bg-[#18181b] shrink-0 border border-[var(--color-kumo-line)]"
                      />
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)] truncate">
                            {item.title}
                          </span>
                          <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
                            #{item.id}
                          </span>
                        </div>
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)] truncate">
                          {batchFormat.split(" ")[0]} · {batchResolution.split(" ")[0]} · {batchLod.split(" ")[0]} · {sizeMb.toFixed(1)} MB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                        <span>−{settledCost}</span>
                        <CreditIcon size={11} />
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDownloadedItemUids((prev) =>
                            prev.includes(item.uid) ? prev : [...prev, item.uid]
                          )
                        }
                        className={`h-8 px-3 rounded-[8px] text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer border transition-colors ${
                          isItemDownloaded
                            ? "bg-[#ecfdf3] border-[#34c48b]/40 text-[var(--text-color-kumo-success)]"
                            : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)] shadow-[var(--shadow-kumo-xs)]"
                        }`}
                      >
                        {isItemDownloaded ? (
                          <>
                            <Check size={13} strokeWidth={2} />
                            <span>Downloaded</span>
                          </>
                        ) : (
                          <>
                            <Download size={13} strokeWidth={1.5} />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Credit Ledger Receipt Box */}
            <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                  Transaction reference
                </span>
                <span className="kumo-mono font-semibold text-[var(--text-color-kumo-strong)]">
                  {orderRef}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                  Credits deducted
                </span>
                <span className="kumo-mono font-semibold text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                  <span>−{settledTotalCredits ?? subtotalCredits}</span>
                  <CreditIcon size={11} />
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                  Remaining workspace balance
                </span>
                <span className="kumo-mono font-semibold text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
                  <span>{Math.max(0, workspaceCredits).toLocaleString("en-US")}</span>
                  <CreditIcon size={11} />
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/portal?tab=downloads");
                }}
                className="text-[13px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer inline-flex items-center gap-1"
              >
                <span>Open in Portal Downloads</span>
                <ExternalLink size={13} />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  onClose();
                }}
                className="h-9 px-4 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
              >
                Done & clear queue
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================== */
          /* SPLIT 2-COLUMN CHECKOUT (Left: Queue & Export Config, Right: Rail) */
          /* ================================================================== */
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-kumo-line)]">
            {/* LEFT 7 COLUMNS: Queued Assets + Batch Export Settings */}
            <div className="lg:col-span-7 p-5 flex flex-col gap-5 bg-white">
              {/*Contextual Alert Banner for Special Use Cases */}
              {isInsufficient && (
                <div className="rounded-[8px] bg-[#fef2f2] border border-[#ff6b70]/45 p-3.5 flex items-start gap-3">
                  <div className="size-8 rounded-[6px] bg-white border border-[#ff6b70]/30 text-[var(--text-color-kumo-danger)] flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={16} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Insufficient workspace credits
                      </span>
                      <span className="h-5 px-2 py-0.5 rounded-full bg-white border border-[#ff6b70]/40 text-[11px] font-semibold text-[var(--text-color-kumo-danger)] kumo-mono inline-flex items-center gap-1">
                        <span>Shortfall: {creditShortfall}</span>
                        <CreditIcon size={10} />
                      </span>
                    </div>
                    <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)] leading-[18px]">
                      Your workspace has{" "}
                      <strong className="kumo-mono text-[var(--text-color-kumo-strong)]">
                        {effectiveBalance}
                      </strong>{" "}
                      credits available, but this queue requires{" "}
                      <strong className="kumo-mono text-[var(--text-color-kumo-strong)]">
                        {totalDueCredits}
                      </strong>{" "}
                      credits. Top up your balance or remove items below to proceed.
                    </p>
                  </div>
                </div>
              )}

              {isSpendLimitTriggered && (
                <div className="rounded-[8px] bg-[#fffbeb] border border-[#f59e0b]/45 p-3.5 flex items-start gap-3">
                  <div className="size-8 rounded-[6px] bg-white border border-[#f59e0b]/35 text-[#b45309] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert size={16} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Monthly workspace spend limit threshold
                      </span>
                      <span className="h-5 px-2 py-0.5 rounded-full bg-white border border-[#f59e0b]/40 text-[11px] font-medium text-[#b45309] kumo-mono">
                        {projectedMonthlySpend} / {monthlySpendCap} cap
                      </span>
                    </div>
                    <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)] leading-[18px]">
                      This checkout brings monthly consumption to{" "}
                      <strong className="kumo-mono text-[var(--text-color-kumo-strong)]">
                        {projectedMonthlySpend}
                      </strong>{" "}
                      credits, exceeding your studio&apos;s{" "}
                      <strong className="kumo-mono text-[var(--text-color-kumo-strong)]">
                        {monthlySpendCap}
                      </strong>{" "}
                      monthly threshold set in Portal Billing.
                    </p>
                    <label className="inline-flex items-center gap-2 text-[12px] font-medium text-[var(--text-color-kumo-strong)] cursor-pointer select-none pt-0.5">
                      <input
                        type="checkbox"
                        checked={overrideSpendLimit}
                        onChange={(e) => setOverrideSpendLimit(e.target.checked)}
                        className="size-3.5 accent-[var(--color-kumo-brand)] rounded cursor-pointer"
                      />
                      <span>
                        Authorize one-time admin override for this order (+
                        {projectedMonthlySpend - monthlySpendCap} over cap)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {ownedDiscountCredits > 0 && (
                <div className="rounded-[8px] bg-[#ecfdf3] border border-[#34c48b]/40 p-3 flex items-center justify-between gap-3 text-[12px]">
                  <div className="flex items-center gap-2 text-[var(--text-color-kumo-strong)]">
                    <CheckCircle2
                      size={15}
                      className="text-[var(--text-color-kumo-success)] shrink-0"
                    />
                    <span>
                      <strong>Owned asset detected:</strong> Previously unlocked items in your queue are automatically discounted to 0 credits.
                    </span>
                  </div>
                  <span className="kumo-mono font-semibold text-[var(--text-color-kumo-success)] shrink-0 inline-flex items-center gap-1">
                    <span>Saved {ownedDiscountCredits}</span>
                    <CreditIcon size={10} />
                  </span>
                </div>
              )}

              {/* Section 1: Queued Assets List */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Queued assets ({cartItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Clear queue
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-0.5">
                  {lineItems.map(
                    ({
                      item,
                      baseCost,
                      effectiveCost,
                      isAlreadyOwned,
                      sizeMb,
                    }) => (
                      <div
                        key={item.uid}
                        className="p-3 rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.imgUrl}
                            alt={item.title}
                            className="size-12 rounded-[6px] object-cover bg-[#18181b] shrink-0 border border-[var(--color-kumo-line)]"
                          />
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)] truncate">
                                {item.title}
                              </span>
                              <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)] shrink-0">
                                #{item.id}
                              </span>
                            </div>
                            <span className="text-[12px] text-[var(--text-color-kumo-subtle)] truncate">
                              {item.categoryLabel} · {item.monument || item.subtitle} ·{" "}
                              <span className="kumo-mono">{sizeMb.toFixed(1)} MB</span>
                            </span>
                            {isAlreadyOwned && (
                              <span className="text-[11px] font-medium text-[var(--text-color-kumo-success)]">
                                Already unlocked in workspace · 0-credit re-export
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="flex flex-col items-end">
                            {isAlreadyOwned && baseCost > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)] line-through">
                                  {baseCost}
                                </span>
                                <span className="h-6 px-2 rounded-full bg-[#ecfdf3] border border-[#34c48b]/40 text-[var(--text-color-kumo-success)] kumo-mono text-[12px] font-semibold inline-flex items-center gap-1">
                                  <span>0</span>
                                  <CreditIcon size={10} />
                                </span>
                              </div>
                            ) : (
                              <span className="h-6 px-2.5 rounded-full bg-white border border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-strong)] kumo-mono text-[12px] font-semibold inline-flex items-center gap-1">
                                <span>{effectiveCost}</span>
                                <CreditIcon size={11} />
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.uid)}
                            title="Remove from queue"
                            aria-label={`Remove ${item.title} from queue`}
                            className="size-7 rounded-[6px] bg-white hover:bg-[#fef2f2] border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Section 2: Batch Export Configuration (Cloudflare Kumo Control Selects) */}
              <div className="pt-3 border-t border-[var(--color-kumo-line)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Batch export configuration
                  </span>
                  <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                    Applies to all queued assets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-[11px] font-medium text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                      <Box size={11} />
                      <span>3D Format</span>
                    </span>
                    <div className="relative flex items-center">
                      <select
                        value={batchFormat}
                        onChange={(e) => setBatchFormat(e.target.value)}
                        style={{ WebkitAppearance: "none", appearance: "none" }}
                        className="w-full h-8 pl-2.5 pr-6 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-strong)] outline-none cursor-pointer appearance-none truncate"
                      >
                        <option value="FBX (Unreal / Maya)">FBX (UE / Maya)</option>
                        <option value="glTF / GLB 2.0">glTF / GLB 2.0</option>
                        <option value="OBJ + MTL">Wavefront OBJ</option>
                        <option value="OpenUSD (.usdz)">OpenUSD (.usdz)</option>
                      </select>
                      <ChevronsUpDown
                        size={12}
                        className="absolute right-2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                    </div>
                  </label>

                  <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-[11px] font-medium text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>Texture Maps</span>
                    </span>
                    <div className="relative flex items-center">
                      <select
                        value={batchResolution}
                        onChange={(e) => setBatchResolution(e.target.value)}
                        style={{ WebkitAppearance: "none", appearance: "none" }}
                        className="w-full h-8 pl-2.5 pr-6 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-strong)] outline-none cursor-pointer appearance-none truncate"
                      >
                        <option value="2K (2048×2048 PNG)">2K (2048 PNG)</option>
                        <option value="4K (4096×4096 PNG)">4K (4096 PNG)</option>
                        <option value="8K (8192×8192 EXR)">8K (8192 EXR)</option>
                      </select>
                      <ChevronsUpDown
                        size={12}
                        className="absolute right-2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                    </div>
                  </label>

                  <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-[11px] font-medium text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                      <Layers size={11} />
                      <span>LOD Hierarchy</span>
                    </span>
                    <div className="relative flex items-center">
                      <select
                        value={batchLod}
                        onChange={(e) => setBatchLod(e.target.value)}
                        style={{ WebkitAppearance: "none", appearance: "none" }}
                        className="w-full h-8 pl-2.5 pr-6 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-strong)] outline-none cursor-pointer appearance-none truncate"
                      >
                        <option value="All LODs (LOD0–LOD4)">All LODs (0–4)</option>
                        <option value="High Poly (LOD0 only)">High Poly (LOD0)</option>
                        <option value="Game Ready (LOD1–LOD3)">Game Ready (1–3)</option>
                      </select>
                      <ChevronsUpDown
                        size={12}
                        className="absolute right-2 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLUMNS: Credit Balance Accounting & Checkout Actions */}
            <div className="lg:col-span-5 p-5 bg-[var(--color-kumo-canvas)] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                {/* Credit Accounting Card */}
                <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[var(--color-kumo-line)] pb-2.5">
                    <span className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Credit ledger summary
                    </span>
                    <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                      Onflow Asia
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-color-kumo-subtle)]">
                        Available workspace balance
                      </span>
                      <span className="kumo-mono font-semibold text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                        <span>{effectiveBalance.toLocaleString("en-US")}</span>
                        <CreditIcon size={11} />
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-color-kumo-subtle)]">
                        Queue subtotal ({cartItems.length}{" "}
                        {cartItems.length === 1 ? "item" : "items"})
                      </span>
                      <span className="kumo-mono text-[var(--text-color-kumo-default)] inline-flex items-center gap-1">
                        <span>{subtotalCredits}</span>
                        <CreditIcon size={11} />
                      </span>
                    </div>

                    {ownedDiscountCredits > 0 && (
                      <div className="flex items-center justify-between text-[var(--text-color-kumo-success)]">
                        <span>Unlocked / free re-export discount</span>
                        <span className="kumo-mono font-semibold inline-flex items-center gap-1">
                          <span>−{ownedDiscountCredits}</span>
                          <CreditIcon size={11} />
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                        <HardDrive size={12} />
                        <span>Total archive size</span>
                      </span>
                      <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)]">
                        {totalArchiveMb.toFixed(1)} MB
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-[var(--color-kumo-line)] flex items-baseline justify-between">
                      <span className="font-semibold text-[var(--text-color-kumo-strong)]">
                        Credits to deduct
                      </span>
                      <span className="kumo-mono text-[18px] font-semibold text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1.5">
                        <span>{totalDueCredits}</span>
                        <CreditIcon size={13} />
                      </span>
                    </div>
                  </div>

                  {/* Balance Projection Pill (Sufficient vs Insufficient Shortfall) */}
                  {isInsufficient ? (
                    <div className="rounded-[6px] bg-[#fef2f2] border border-[#ff6b70]/40 px-3 py-2 flex items-center justify-between text-[12px]">
                      <span className="font-medium text-[var(--text-color-kumo-danger)]">
                        Additional credits needed
                      </span>
                      <span className="kumo-mono font-semibold text-[var(--text-color-kumo-danger)] inline-flex items-center gap-1">
                        <span>+{creditShortfall}</span>
                        <CreditIcon size={11} />
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-[6px] bg-[var(--color-kumo-recessed)] px-3 py-2 flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-color-kumo-subtle)]">
                        Remaining balance after unlock
                      </span>
                      <span className="kumo-mono font-semibold text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
                        <span>
                          {projectedRemainingBalance.toLocaleString("en-US")}
                        </span>
                        <CreditIcon size={11} />
                      </span>
                    </div>
                  )}
                </div>

                {/* If Insufficient Balance: Recommended Quick Top-Up Card */}
                {isInsufficient && (
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-brand)]/45 shadow-[var(--shadow-kumo-xs)] p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[var(--text-color-kumo-link)] uppercase tracking-wider">
                        Recommended top-up
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-[#3e8eff]/10 text-[var(--text-color-kumo-link)]">
                        Instant settlement
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                          {recommendedPackage.name}
                        </span>
                        <span className="text-[12px] text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                          <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
                            +{recommendedPackage.credits}
                          </span>
                          <CreditIcon size={10} />
                          {recommendedPackage.bonus > 0 && (
                            <span className="text-[var(--text-color-kumo-success)] font-medium">
                              (+{recommendedPackage.bonus} bonus)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="kumo-mono text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        {recommendedPackage.price}
                      </span>
                    </div>
                    <p className="m-0 text-[11.5px] text-[var(--text-color-kumo-subtle)]">
                      Covers your{" "}
                      <strong className="kumo-mono">{creditShortfall}</strong>{" "}
                      credit shortfall and leaves{" "}
                      <strong className="kumo-mono">
                        {recommendedPackage.credits +
                          recommendedPackage.bonus -
                          creditShortfall}
                      </strong>{" "}
                      credits for upcoming scans.
                    </p>
                  </div>
                )}

                {/* License & Re-download Policy Note */}
                <div className="rounded-[8px] bg-white border border-[var(--color-kumo-line)] p-3 flex items-start gap-2.5 text-[12px] text-[var(--text-color-kumo-subtle)]">
                  <Info
                    size={14}
                    className="text-[var(--text-color-kumo-default)] shrink-0 mt-0.5"
                  />
                  <span>
                    Unlocked assets include a <strong>10-seat studio license</strong> and permanent access in Portal Downloads with unlimited 0-credit re-exports.
                  </span>
                </div>
              </div>

              {/* Bottom Primary CTA Stack */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-kumo-line)]">
                {isInsufficient ? (
                  <>
                    <Link
                      href="/payment"
                      onClick={onClose}
                      className="w-full h-10 rounded-[8px] kumo-btn-primary text-[13px] font-medium flex items-center justify-center gap-2 no-underline"
                    >
                      <CreditCard size={14} strokeWidth={1.5} />
                      <span>Top up workspace credits</span>
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </Link>
                    {cartItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveItem(cartItems[cartItems.length - 1].uid)
                        }
                        className="w-full h-9 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12.5px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                      >
                        Remove last item to fit current balance
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isSpendLimitTriggered && !overrideSpendLimit}
                      onClick={handleConfirmCreditCheckout}
                      className={`w-full h-10 rounded-[8px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-opacity ${
                        isSpendLimitTriggered && !overrideSpendLimit
                          ? "bg-[var(--color-kumo-fill)] text-[var(--text-color-kumo-subtle)] border border-[var(--color-kumo-line)] cursor-not-allowed"
                          : "kumo-btn-primary cursor-pointer"
                      }`}
                    >
                      <Lock size={13} strokeWidth={1.75} />
                      <span>Confirm & unlock</span>
                      <span className="inline-flex items-center gap-1">
                        <span>({totalDueCredits}</span>
                        <CreditIcon
                          size={11}
                          color={
                            isSpendLimitTriggered && !overrideSpendLimit
                              ? "#71717a"
                              : "#ffffff"
                          }
                        />
                        <span>)</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full h-8 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 text-[12px] font-medium text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      Continue browsing catalog
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
export default CartCheckoutOverlay;
