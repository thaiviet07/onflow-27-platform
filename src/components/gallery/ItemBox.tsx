"use client";

import React, { useState } from "react";
import { Bookmark, Check, ShoppingBag } from "lucide-react";
import { AssetItem } from "@/data/galleryMeta";
import { CreditIcon } from "@/components/CreditIcon";

type ItemBoxProps = {
  item: AssetItem;
  onSelect: (item: AssetItem) => void;
  isBookmarked?: boolean;
  isInCart?: boolean;
  onToggleBookmark?: (uid: string) => void;
  onToggleCart?: (uid: string) => void;
  fixedWidthClass?: string;
};

function parseCompactCreditNumber(raw: string, isFree: boolean): number | null {
  if (isFree) return 0;
  const match = raw.match(/\d+/);
  if (!match) return null;
  return parseInt(match[0], 10);
}

function formatNormalizedSize(raw: string): string {
  const normalized = raw.replace(",", ".");
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([A-Za-z]+)$/);
  if (!match) return normalized;
  const val = parseFloat(match[1]);
  const unit = match[2];
  return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} ${unit}`;
}

export function ItemBox({
  item,
  onSelect,
  isBookmarked = false,
  isInCart = false,
  onToggleBookmark,
  onToggleCart,
  fixedWidthClass = "w-full",
}: ItemBoxProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const visibleFormats = item.formats.slice(0, 2);
  const extraFormatsCount = Math.max(0, item.formats.length - 2);

  const creditNumber = parseCompactCreditNumber(item.credits, item.isFree);
  const sizeLabel = formatNormalizedSize(item.size);
  const locationLine = item.monument
    ? `${item.categoryLabel} · ${item.monument}`
    : `${item.categoryLabel} · ${item.subtitle}`;

  return (
    <div
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className={`group bg-white flex flex-col h-[296px] items-stretch min-w-0 overflow-hidden relative rounded-[8px] border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] shadow-[var(--shadow-kumo-xs)] cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-kumo-brand)] ${fixedWidthClass}`}
      data-name="Itembox"
    >
      {/* Specimen Thumbnail Stage */}
      <div className="bg-[#18181b] h-[186px] relative shrink-0 w-full overflow-hidden">
        {item.imgUrl && !imgFailed ? (
          <img
            alt={item.title}
            src={item.imgUrl}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#18181b] text-white/60 kumo-mono text-[12px]">
            {item.categoryLabel}
          </div>
        )}

        {/* Subtle top scrim for specimen index legibility */}
        <div className="absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

        {/* Top-left: Monospaced specimen index + quiet Free tag */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
          <span className="bg-black/75 text-white/95 kumo-mono text-[11px] leading-[16px] px-2 py-0.5 rounded-[6px]">
            #{item.id}
          </span>
          {item.isFree && (
            <span className="bg-[#f6821f] text-white font-medium text-[11px] leading-[16px] px-2 py-0.5 rounded-[6px]">
              Free
            </span>
          )}
        </div>

        {/* Top-right: Quick actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.uid);
              }}
              aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
              title={isBookmarked ? "Saved in bookmarks" : "Save to bookmarks"}
              className={`size-7 rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-[background-color,color,opacity] duration-150 ${
                isBookmarked
                  ? "bg-[var(--color-kumo-brand)] text-white"
                  : "bg-white/95 text-[var(--text-color-kumo-strong)] hover:bg-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
              }`}
            >
              <Bookmark
                size={13}
                strokeWidth={1.5}
                className={isBookmarked ? "fill-white" : ""}
              />
            </button>
          )}
          {onToggleCart && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCart(item.uid);
              }}
              aria-label={isInCart ? "Remove from cart" : "Add to cart"}
              title={isInCart ? "In cart" : "Add to cart"}
              className={`size-7 rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-[background-color,color,opacity] duration-150 ${
                isInCart
                  ? "bg-[var(--color-kumo-success)] text-white"
                  : "bg-white/95 text-[var(--text-color-kumo-strong)] hover:bg-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
              }`}
            >
              {isInCart ? (
                <Check size={13} strokeWidth={1.5} />
              ) : (
                <ShoppingBag size={13} strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>

        {/* Bottom-left region cue on hover */}
        {item.province && (
          <div className="absolute bottom-2 left-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <span className="bg-black/75 text-white/95 text-[11px] leading-[16px] px-2 py-0.5 rounded-[6px]">
              {item.province}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div
        className="bg-white flex-1 flex flex-col justify-between p-3 gap-2 min-w-0"
        data-name="Textbox"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3
            className="m-0 truncate font-medium text-[14px] leading-[20px] text-[var(--text-color-kumo-strong)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150"
            title={item.title}
          >
            {item.title}
          </h3>
          <p
            className="m-0 truncate text-[12px] leading-[16px] text-[var(--text-color-kumo-subtle)]"
            title={locationLine}
          >
            {locationLine}
          </p>
        </div>

        {/* Footer Metadata & Formats */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-kumo-line)] min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span
              className={`kumo-mono font-medium text-[12px] leading-[16px] whitespace-nowrap inline-flex items-center gap-1 ${
                item.isFree
                  ? "text-[var(--text-color-kumo-success)]"
                  : "text-[var(--text-color-kumo-strong)]"
              }`}
            >
              {item.isFree ? (
                "Free"
              ) : (
                <>
                  <span>{creditNumber ?? item.credits}</span>
                  <CreditIcon size={11} />
                </>
              )}
            </span>
            <span className="text-[var(--text-color-kumo-subtle)]/40 text-[11px]" aria-hidden="true">
              ·
            </span>
            <span className="kumo-mono text-[11px] leading-[16px] text-[var(--text-color-kumo-subtle)] truncate">
              {sizeLabel}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {visibleFormats.map((fmt) => (
              <span
                key={fmt}
                className="bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-subtle)] group-hover:text-[var(--text-color-kumo-default)] transition-colors duration-150 kumo-mono text-[10px] leading-[14px] uppercase px-1.5 py-0.5 rounded-[4px] whitespace-nowrap"
              >
                {fmt}
              </span>
            ))}
            {extraFormatsCount > 0 && (
              <span className="kumo-mono text-[10px] leading-[14px] text-[var(--text-color-kumo-subtle)] pl-0.5 whitespace-nowrap">
                +{extraFormatsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
