"use client";

import React, { useEffect } from "react";
import {
  AssetDetailData,
  DEFAULT_ASSET_DETAIL,
  PanelModule,
} from "./PanelModule";

type ItemMenuOverlayProps = {
  isOpen: boolean;
  asset?: AssetDetailData;
  onClose: () => void;
  onExpand: () => void;
};

export function ItemMenuOverlay({
  isOpen,
  asset = DEFAULT_ASSET_DETAIL,
  onClose,
  onExpand,
}: ItemMenuOverlayProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2 sm:p-4 lg:p-6 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Item Menu Overlay"
    >
      <div
        className="bg-[#eaecf0] flex flex-col lg:flex-row gap-[10px] items-start overflow-hidden p-[10px] relative rounded-[10px] w-full max-w-[1602px] lg:h-[760px] shadow-2xl my-auto"
        data-node-id="1220:11653"
        data-name="Item Menu Overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left 3D Preview Box (1169x740 on desktop) */}
        <div
          className="bg-[#d6d6d6] w-full lg:flex-1 lg:max-w-[1169px] h-[340px] sm:h-[480px] lg:h-[740px] overflow-hidden rounded-[10px] shrink-0 relative flex items-center justify-center"
          data-node-id="1220:11654"
        >
          {asset?.imgUrl && (
            <img
              alt={asset.title}
              src={asset.imgUrl}
              className="w-full h-full object-contain bg-[#1e1e1e]"
            />
          )}
          <div
            className="absolute flex gap-[8px] items-center left-[8px] top-[8px] z-10"
            data-node-id="1220:11655"
          >
            {/* Collapse Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close overlay"
              title="Close overlay"
              className="block cursor-pointer relative shrink-0 size-[25px] border-0 bg-transparent p-0 hover:scale-105 transition-transform"
              data-node-id="1220:2772"
            >
              <div className="absolute inset-0 bg-[rgba(234,234,234,0.93)] rounded-[32px]" />
              <div className="absolute bg-[#19213d] inset-[44%_24%] rounded-[4px]" />
            </button>

            {/* Expand Button -> Navigate to [B2] Item Menu */}
            <button
              type="button"
              onClick={onExpand}
              aria-label="Expand to full Item Menu"
              title="Expand to full Item Menu"
              className="block cursor-pointer relative shrink-0 size-[25px] border-0 bg-transparent p-0 hover:scale-105 transition-transform"
              data-node-id="1220:2779"
            >
              <img
                alt=""
                className="block max-w-none"
                src="/assets/overlay_expand_btn.svg"
                width={25}
                height={25}
              />
            </button>
          </div>
        </div>

        {/* Right Scrollable Panel Module (403px wide, 738px high on desktop) */}
        <div
          className="flex flex-col w-full lg:w-[403px] max-h-[55vh] lg:max-h-none lg:h-[738px] items-center lg:items-start overflow-x-hidden overflow-y-auto relative rounded-[10px] shrink-0"
          data-node-id="1220:11658"
          data-name="Left"
        >
          <PanelModule
            variant="overlay"
            asset={asset}
            onExpandToPage={onExpand}
          />
        </div>
      </div>
    </div>
  );
}
