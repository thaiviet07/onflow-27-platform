"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  CheckCircle2,
  CreditCard,
  Download,
  HardDrive,
  Info,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { CreditIcon } from "./CreditIcon";

export type PurchaseStep = "confirm" | "success" | "failed";

type QuickPurchaseOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  assetTitle?: string;
  assetImgUrl?: string;
  lodLabel?: string;
  textureResolution?: string;
  objectFormat?: string;
  downloadSize?: string;
  creditCost?: number;
  initialStep?: PurchaseStep;
};

function formatLodBadge(lod: string): string {
  const upper = lod.toUpperCase();
  if (upper.includes("HIGH")) return "HIGHPOLY";
  if (upper.includes("LOD1") || upper.includes("MEDIUM")) return "LOD1 MED";
  if (upper.includes("LOD2") || upper.includes("LOW")) return "LOD2 LOW";
  return upper;
}

function PurchaseAssetSummaryCard({
  assetTitle,
  assetImgUrl,
  lodText,
  textureResolution,
  objectFormat,
  creditCost,
  variant = "neutral",
}: {
  assetTitle: string;
  assetImgUrl?: string;
  lodText: string;
  textureResolution: string;
  objectFormat: string;
  creditCost: number;
  variant?: "neutral" | "success";
}) {
  return (
    <div
      className={`w-full rounded-[8px] border p-3 flex items-center justify-between gap-3 ${
        variant === "success"
          ? "bg-[#ecfdf3] border-[#34c48b]/40"
          : "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)]"
      }`}
    >
      <div className="flex flex-1 gap-3 items-center min-w-0">
        <div className="bg-[#18181b] relative rounded-[6px] shrink-0 size-11 overflow-hidden border border-[var(--color-kumo-line)]">
          {assetImgUrl && (
            <img
              src={assetImgUrl}
              alt={assetTitle}
              className="w-full h-full object-cover block"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 items-start min-w-0">
          <p className="m-0 font-semibold text-[13px] leading-tight text-[var(--text-color-kumo-strong)] truncate w-full">
            {assetTitle}
          </p>
          <div className="flex flex-wrap gap-2 items-center text-[11px] text-[var(--text-color-kumo-subtle)] kumo-mono">
            <span className="inline-flex items-center gap-1">
              <Layers size={11} />
              <span>{lodText}</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles size={11} />
              <span>{textureResolution}</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 uppercase font-medium text-[var(--text-color-kumo-strong)]">
              <Box size={11} />
              <span>{objectFormat}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end shrink-0">
        <span className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-strong)] kumo-mono whitespace-nowrap inline-flex items-center gap-1">
          {creditCost === 0 ? (
            "Free"
          ) : (
            <>
              <span>{creditCost}</span>
              <CreditIcon size={11} />
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function QuickPurchaseOverlay({
  isOpen,
  onClose,
  onPurchaseSuccess,
  assetTitle = "White Marble Incense Burner",
  assetImgUrl,
  lodLabel = "High Poly, LODs",
  textureResolution = "PNG 4096×4096",
  objectFormat = "FBX",
  downloadSize = "38.8 MB",
  creditCost = 5,
  initialStep = "confirm",
}: QuickPurchaseOverlayProps) {
  const router = useRouter();
  const [step, setStep] = useState<PurchaseStep>(initialStep);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setStep(initialStep);
        setDownloadStarted(false);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose, initialStep]);

  if (!isOpen) return null;

  const formattedLod = formatLodBadge(lodLabel);

  const handleConfirmPurchase = () => {
    setDownloadStarted(false);
    setStep("success");
    onPurchaseSuccess?.();
  };

  const handleClose = () => {
    setStep(initialStep);
    setDownloadStarted(false);
    onClose();
  };

  const modalContent = (
    <div
      className="kumo-portal fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/55 p-4 overflow-y-auto gap-3"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Purchase Overlay"
    >
      {/* State Preview Switcher (Kumo Segmented Pill Track on backdrop for testing all 3 states) */}
      <div
        role="tablist"
        className="inline-flex items-center h-8 rounded-[8px] bg-white/95 border border-[var(--color-kumo-line)] p-0.5 gap-0.5 shadow-[var(--shadow-kumo-md)]"
        onClick={(e) => e.stopPropagation()}
      >
        {(
          [
            { id: "confirm", label: "Confirm order" },
            { id: "success", label: "Unlocked" },
            { id: "failed", label: "Insufficient credits" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={step === tab.id}
            onClick={() => {
              setStep(tab.id);
              setDownloadStarted(false);
            }}
            className={`h-7 px-2.5 rounded-[6px] text-[12px] border-0 cursor-pointer transition-colors ${
              step === tab.id
                ? "bg-[var(--text-color-kumo-strong)] text-white font-medium"
                : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main 520px Cloudflare Kumo Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] flex flex-col overflow-hidden relative rounded-[12px] w-full max-w-[520px]"
      >
        {/* Top 54px Kumo Modal Header */}
        <div className="h-[54px] px-5 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] flex items-center justify-between">
          <span className="text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
            {step === "confirm"
              ? "Confirm asset unlock"
              : step === "success"
              ? "Asset unlocked & ready"
              : "Insufficient workspace credits"}
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close purchase modal"
            className="size-7 rounded-[6px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {step === "confirm" && (
            <>
              <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                Review your export parameters before unlocking this asset for your workspace.
              </p>

              <PurchaseAssetSummaryCard
                assetTitle={assetTitle}
                assetImgUrl={assetImgUrl}
                lodText={formattedLod}
                textureResolution={textureResolution}
                objectFormat={objectFormat}
                creditCost={creditCost}
                variant="neutral"
              />

              {/* Breakdown Rows */}
              <div className="flex flex-col divide-y divide-[var(--color-kumo-line)] border-y border-[var(--color-kumo-line)] text-[13px]">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[var(--text-color-kumo-subtle)]">
                    Available workspace balance
                  </span>
                  <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                    <span>2,686</span>
                    <CreditIcon size={11} />
                  </span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1.5">
                    <HardDrive size={14} />
                    <span>Estimated archive size</span>
                  </span>
                  <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
                    {downloadSize.replace(",", ".")}
                  </span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1.5">
                    <CreditCard size={14} className="text-[var(--text-color-kumo-subtle)]" />
                    <span>Total credit deduction</span>
                  </span>
                  <span className="kumo-mono font-semibold text-[14px] text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                    {creditCost === 0 ? (
                      <>
                        <span>0</span>
                        <CreditIcon size={12} />
                        <span>(Free)</span>
                      </>
                    ) : (
                      <>
                        <span>−{creditCost}</span>
                        <CreditIcon size={12} />
                      </>
                    )}
                  </span>
                </div>

                <div className="py-2 bg-[var(--color-kumo-canvas)] -mx-1 px-1 flex items-center justify-between">
                  <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                    Remaining balance after unlock
                  </span>
                  <span className="kumo-mono font-semibold text-[13px] text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
                    <span>{(2686 - creditCost).toLocaleString("en-US")}</span>
                    <CreditIcon size={11} />
                  </span>
                </div>
              </div>

              {/* Kumo Info Callout */}
              <div className="rounded-[8px] bg-[var(--color-kumo-recessed)] px-3.5 py-2.5 flex items-start gap-2.5 text-[12px] text-[var(--text-color-kumo-subtle)]">
                <Info size={14} className="text-[var(--text-color-kumo-default)] shrink-0 mt-0.5" />
                <span>
                  Once unlocked, this asset is permanently added to your workspace Downloads with unlimited 0-credit re-exports in any format or resolution.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-9 px-3.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer"
                  data-name="PO 1"
                >
                  Confirm & unlock
                </button>
              </div>
            </>
          )}

          {step === "success" && (
            <>
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-[8px] bg-[#ecfdf3] border border-[#34c48b]/40 text-[var(--text-color-kumo-success)] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Added to workspace archive
                  </h3>
                  <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                    Your archive checksum is verified and ready for immediate download or Bridge stream.
                  </p>
                </div>
              </div>

              <PurchaseAssetSummaryCard
                assetTitle={assetTitle}
                assetImgUrl={assetImgUrl}
                lodText={formattedLod}
                textureResolution={textureResolution}
                objectFormat={objectFormat}
                creditCost={creditCost}
                variant="success"
              />

              {/* Download Callout Box */}
              <div className="rounded-[8px] bg-[#3e8eff]/[.07] border border-[#3e8eff]/35 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                    {downloadStarted
                      ? `Packing ${objectFormat} bundle...`
                      : "Download archive package"}
                  </span>
                  <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                    {downloadStarted
                      ? `${assetTitle} (${objectFormat} · ${textureResolution})`
                      : "Includes calibrated PBR maps and LOD hierarchy"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDownloadStarted(true)}
                  className="h-8 px-3.5 rounded-[8px] kumo-btn-primary text-[12px] font-medium inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download size={13} strokeWidth={1.5} />
                  <span>{downloadStarted ? "Downloading..." : "Download now"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    router.push("/portal?tab=downloads");
                  }}
                  className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                >
                  View in Portal Downloads ↗
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-9 px-4 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </>
          )}

          {step === "failed" && (
            <>
              <div className="rounded-[8px] bg-[#fef2f2] border border-[#ff6b70]/45 p-3.5 flex items-start gap-3">
                <div className="size-8 rounded-[6px] bg-white border border-[#ff6b70]/35 text-[var(--text-color-kumo-danger)] flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={16} strokeWidth={1.75} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                    Not enough credits to unlock this asset
                  </h3>
                  <p className="m-0 text-[12.5px] text-[var(--text-color-kumo-subtle)]">
                    Your workspace balance is below the required unlock cost. Top up your credit balance to unlock this asset immediately.
                  </p>
                </div>
              </div>

              <PurchaseAssetSummaryCard
                assetTitle={assetTitle}
                assetImgUrl={assetImgUrl}
                lodText={formattedLod}
                textureResolution={textureResolution}
                objectFormat={objectFormat}
                creditCost={creditCost}
                variant="neutral"
              />

              {/* Shortfall Breakdown Table */}
              <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)] text-[13px]">
                <div className="px-3.5 py-2 flex items-center justify-between">
                  <span className="text-[var(--text-color-kumo-subtle)]">
                    Current workspace balance
                  </span>
                  <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                    <span>{Math.max(1, creditCost - 3)}</span>
                    <CreditIcon size={11} />
                  </span>
                </div>
                <div className="px-3.5 py-2 flex items-center justify-between">
                  <span className="text-[var(--text-color-kumo-subtle)]">
                    Asset unlock requirement
                  </span>
                  <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                    <span>{creditCost}</span>
                    <CreditIcon size={11} />
                  </span>
                </div>
                <div className="px-3.5 py-2 bg-[#fef2f2] flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-color-kumo-danger)]">
                    Credit shortfall
                  </span>
                  <span className="kumo-mono font-semibold text-[var(--text-color-kumo-danger)] inline-flex items-center gap-1">
                    <span>+{Math.max(1, creditCost - Math.max(1, creditCost - 3))}</span>
                    <CreditIcon size={11} />
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-kumo-line)]">
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  className="h-9 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    router.push("/payment");
                  }}
                  className="h-9 px-4 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer"
                >
                  + Top up credits
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
