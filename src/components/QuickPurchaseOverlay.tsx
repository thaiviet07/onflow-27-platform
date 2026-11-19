"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

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
      className="bg-[#f0f0f0] border-[#c7c7c7] border-[0.3px] border-solid flex flex-col items-start overflow-hidden relative rounded-[10px] shrink-0 w-full"
      data-node-id={variant === "success" ? "1239:8041" : "1220:11956"}
    >
      <div
        className={`${
          variant === "success" ? "bg-[#e4f3ed]" : "bg-[#f0f0f0]"
        } border-[#c7c7c7] border-[0.3px] border-solid flex items-center justify-between gap-3 overflow-hidden p-[10px] relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-full`}
      >
        <div className="flex flex-1 gap-[13px] items-center min-w-0">
          <div className="bg-[#aaa] relative rounded-[10px] shrink-0 size-[40px] overflow-hidden">
            {assetImgUrl && (
              <img
                src={assetImgUrl}
                alt={assetTitle}
                className="w-full h-full object-cover block"
              />
            )}
          </div>

          <div className="flex flex-1 flex-col gap-[10px] items-start min-w-0">
            <p className="m-0 font-sans font-semibold text-[12px] leading-normal text-[#19213d] truncate w-full">
              {assetTitle}
            </p>
            <div className="flex flex-wrap gap-[12px] items-center">
              <div className="flex gap-[2.25px] items-center shrink-0">
                <img
                  alt=""
                  src="/assets/purchase/66ccc.svg"
                  width={12}
                  height={12}
                  className="block shrink-0"
                />
                <span className="font-sans font-normal text-[9px] leading-[11.7px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                  {lodText}
                </span>
              </div>

              <div className="flex gap-[2.25px] items-center shrink-0">
                <img
                  alt=""
                  src="/assets/purchase/5b17d.svg"
                  width={13.5}
                  height={12}
                  className="block shrink-0"
                />
                <span className="font-sans font-normal text-[9px] leading-[11.7px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                  {textureResolution}
                </span>
              </div>

              <div className="flex gap-[2.25px] items-center shrink-0">
                <div className="h-[12px] w-[13.5px] flex items-center justify-center shrink-0">
                  <img
                    alt=""
                    src="/assets/purchase/f46b2.svg"
                    width={11.55}
                    height={11.55}
                    className="block shrink-0"
                  />
                </div>
                <span className="font-sans font-normal text-[9px] leading-[11.7px] text-[rgba(25,33,61,0.7)] whitespace-nowrap uppercase">
                  {objectFormat}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end shrink-0">
          <span className="font-sans font-normal text-[12px] leading-normal text-[rgba(25,33,61,0.7)] whitespace-nowrap">
            {creditCost} Credits
          </span>
        </div>
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
  textureResolution = "PNG 2048x2048",
  objectFormat = "FBX",
  downloadSize = "38,86 MB",
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
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/55 p-4 overflow-y-auto gap-3"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Purchase Overlay"
    >
      {/* State Preview Switcher (on backdrop for inspecting all 3 purchase states) */}
      <div
        className="flex items-center gap-1.5 bg-[#19213d]/90 backdrop-blur-xs border border-white/15 px-2 py-1.5 rounded-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {(
          [
            { id: "confirm", label: "Confirm" },
            { id: "success", label: "Successful" },
            { id: "failed", label: "Failed" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setStep(tab.id);
              setDownloadStarted(false);
            }}
            className={`px-3 py-1 rounded-full font-sans text-[11px] font-semibold border-0 cursor-pointer transition-colors ${
              step === tab.id
                ? "bg-[#004bda] text-white"
                : "bg-transparent text-white/75 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main 537px Figma Quick Purchase Overlay Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white flex flex-col gap-[20px] items-center overflow-hidden p-[20px] relative rounded-[10px] w-full max-w-[537px] shadow-2xl"
        data-node-id={
          step === "confirm"
            ? "1220:11952"
            : step === "success"
            ? "1239:8032"
            : "1239:8063"
        }
      >
        {step === "confirm" && (
          <>
            {/* Header */}
            <div
              className="flex flex-col gap-[10px] items-center justify-center py-[14px] text-center w-full"
              data-node-id="1220:11953"
            >
              <h2 className="m-0 font-google-sans font-bold text-[20px] leading-[1.2] text-[#19213d]">
                Confirm Purchase
              </h2>
              <p className="m-0 font-sans font-normal text-[12px] leading-[15.6px] text-[rgba(25,33,61,0.7)]">
                Please review your order details before completing the purchase
              </p>
            </div>

            {/* Asset Card */}
            <PurchaseAssetSummaryCard
              assetTitle={assetTitle}
              assetImgUrl={assetImgUrl}
              lodText={formattedLod}
              textureResolution={textureResolution}
              objectFormat={objectFormat}
              creditCost={creditCost}
              variant="neutral"
            />

            {/* Details & Actions */}
            <div className="flex flex-col gap-[20px] items-start w-full">
              {/* Download Size */}
              <div className="flex items-center justify-between w-full">
                <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d]">
                  Download Size
                </span>
                <div className="flex gap-[5px] items-center justify-end">
                  <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d] text-right whitespace-nowrap">
                    {downloadSize}
                  </span>
                  <div className="h-[20px] w-[16px] flex items-center justify-center shrink-0">
                    <img
                      alt=""
                      src="/assets/purchase/8cace.svg"
                      width={16}
                      height={16}
                      className="block shrink-0"
                    />
                  </div>
                </div>
              </div>

              {/* Total Credit Cost */}
              <div className="flex items-center justify-between w-full">
                <span className="font-sans font-bold text-[14px] leading-[15.6px] text-[#19213d]">
                  Total Credit Cost
                </span>
                <div className="flex gap-[5px] items-center justify-end">
                  <span className="font-sans font-bold text-[14px] leading-[15.6px] text-[#19213d] text-right whitespace-nowrap">
                    {creditCost}
                  </span>
                  <img
                    alt=""
                    src="/assets/purchase/1ef85.svg"
                    width={16}
                    height={20}
                    className="block shrink-0"
                  />
                </div>
              </div>

              {/* Note Box */}
              <div className="bg-white border-[0.3px] border-[rgba(25,33,61,0.7)] border-solid flex items-center justify-center p-[10px] rounded-[5px] w-full">
                <p className="m-0 flex-1 font-sans font-normal text-[12px] leading-[15.6px] text-[rgba(25,33,61,0.7)]">
                  <span className="font-bold">ⓘ Note: </span>
                  <span>
                    After purchase, your downloads will be immediately available
                    in your purchase history. All purchases are final and
                    non-refundable.
                  </span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-[10px] items-center w-full">
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  className="bg-[#004bda] hover:bg-[#003eb5] transition-colors flex flex-1 h-[40px] items-center justify-center rounded-[10px] border-0 cursor-pointer font-sans font-bold text-[14px] leading-[15.6px] text-white"
                  data-name="PO 1"
                >
                  Confirm Purchase
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-[#ededed] hover:bg-[#e2e2e2] transition-colors cursor-pointer flex h-[40px] items-center justify-center rounded-[10px] shrink-0 w-[103px] border-0 font-sans font-normal text-[14px] leading-[15.6px] text-[#101820]"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Terms Footer */}
            <div className="flex items-start w-full" data-name="PO Terms or Service">
              <p className="m-0 flex-1 font-sans font-normal text-[12px] leading-[18.2px] text-[rgba(25,33,61,0.7)] text-center">
                By placing order, you agree to Onflow’s{" "}
                <a
                  href="/portal"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClose();
                    router.push("/portal");
                  }}
                  className="text-[#002679] underline cursor-pointer"
                >
                  Terms of Service
                </a>{" "}
                and the{" "}
                <a
                  href="/portal"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClose();
                    router.push("/portal");
                  }}
                  className="text-[#002679] underline cursor-pointer"
                >
                  End User License Agreement
                </a>
              </p>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            {/* Order Summary Success Header */}
            <div
              className="drop-shadow-[4px_5px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[22px] items-center py-[14px] rounded-[10px] w-full"
              data-name="Order Summary"
            >
              <img
                alt=""
                src="/assets/purchase/21b61.svg"
                width={60}
                height={60}
                className="block shrink-0"
              />
              <div className="flex flex-col gap-[6px] items-center text-center">
                <h2 className="m-0 font-google-sans font-bold text-[20px] leading-normal text-[#19213d]">
                  Purchase Successful!
                </h2>
                <p className="m-0 font-sans font-normal text-[12px] leading-normal text-[rgba(25,33,61,0.7)]">
                  Your order has been processed and your assets are ready for
                  download
                </p>
              </div>
            </div>

            {/* Green-Tinted Asset Summary Card */}
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
            <div
              className="border border-[#004bda] border-solid flex flex-col sm:flex-row gap-[16px] sm:gap-[32px] items-start sm:items-center p-[16px] relative rounded-[10px] w-full"
              data-node-id="1239:8046"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(78, 72, 200, 0.1) 0%, rgba(78, 72, 200, 0.1) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
              }}
            >
              <div className="flex flex-1 flex-col gap-[6px] items-start min-w-0">
                <div className="flex gap-[6px] items-center">
                  <img
                    alt=""
                    src="/assets/purchase/79944.svg"
                    width={15.4}
                    height={15.4}
                    className="block shrink-0"
                  />
                  <span className="font-sans font-bold text-[14px] leading-[15.6px] text-[#19213d] whitespace-nowrap">
                    Download Your Assets
                  </span>
                </div>
                <p className="m-0 font-sans font-normal text-[14px] leading-[15.6px] text-[rgba(25,33,61,0.7)]">
                  {downloadStarted
                    ? `Downloading ${assetTitle} (${objectFormat} • ${textureResolution})...`
                    : "Your download should start automatically. If it doesn’t, click the Download button to download manually."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDownloadStarted(true)}
                className="bg-[#004bda] hover:bg-[#003eb5] transition-colors flex h-[40px] items-center justify-center px-[24px] rounded-[10px] shrink-0 border-0 cursor-pointer font-sans font-normal text-[14px] leading-[15.6px] text-white whitespace-nowrap"
              >
                {downloadStarted ? "Downloading..." : "Download Now"}
              </button>
            </div>

            {/* Finished Button */}
            <button
              type="button"
              onClick={handleClose}
              className="bg-[#f0f0f0] hover:bg-[#e5e5e5] transition-colors border-[0.4px] border-[#19213d] border-solid cursor-pointer flex gap-[9px] h-[40px] items-center justify-center px-[24px] rounded-[10px] shrink-0"
            >
              <span className="font-sans font-normal text-[14px] leading-[15.6px] text-[#19213d] whitespace-nowrap">
                Finished
              </span>
              <img
                alt=""
                src="/assets/purchase/8ed56.svg"
                width={24}
                height={24}
                className="block shrink-0"
              />
            </button>
          </>
        )}

        {step === "failed" && (
          <>
            {/* Order Summary Failed Header */}
            <div
              className="drop-shadow-[4px_5px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[22px] items-center py-[14px] rounded-[10px] w-full"
              data-name="Order Summary"
            >
              <img
                alt=""
                src="/assets/purchase/6e20d.svg"
                width={60}
                height={60}
                className="block shrink-0"
              />
              <div className="flex flex-col gap-[6px] items-center text-center">
                <h2 className="m-0 font-google-sans font-bold text-[20px] leading-normal text-[#19213d]">
                  Purchase Failed!
                </h2>
                <p className="m-0 font-sans font-normal text-[12px] leading-normal text-[rgba(25,33,61,0.7)]">
                  Your balance does not have enough credits to purchase this
                  item, please try again.
                </p>
              </div>
            </div>

            {/* Failed Action Buttons */}
            <div className="flex gap-[10px] items-start justify-center w-full">
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="bg-white hover:bg-[#f6f7fa] transition-colors border border-[#ccc] border-solid flex gap-[10px] h-[36px] items-center justify-center px-[15px] py-[10px] rounded-[10px] shrink-0 cursor-pointer"
              >
                <div className="flex items-center justify-center size-[16px] shrink-0">
                  <div className="flex-none rotate-90">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <img
                        alt=""
                        src="/assets/purchase/cce10.svg"
                        width={17.23}
                        height={17.23}
                        className="block shrink-0"
                      />
                    </div>
                  </div>
                </div>
                <span className="font-sans font-normal text-[12px] leading-[15.6px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                  Return
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push("/payment");
                }}
                className="bg-[#004bda] hover:bg-[#003eb5] transition-colors flex h-[36px] items-center justify-center rounded-[10px] shrink-0 w-[233px] border-0 cursor-pointer font-sans font-bold text-[12px] leading-[15.6px] text-white whitespace-nowrap"
              >
                + Buy Credits
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
