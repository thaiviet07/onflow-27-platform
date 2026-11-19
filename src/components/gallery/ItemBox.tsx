"use client";

import React, { useState } from "react";
import { Bookmark, Check, ShoppingBag } from "lucide-react";
import { AssetItem } from "@/data/galleryMeta";

type ItemBoxProps = {
  item: AssetItem;
  onSelect: (item: AssetItem) => void;
  isBookmarked?: boolean;
  isInCart?: boolean;
  onToggleBookmark?: (uid: string) => void;
  onToggleCart?: (uid: string) => void;
  fixedWidthClass?: string;
};

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
  const visibleFormats = item.formats.slice(0, 3);
  const extraFormatsCount = Math.max(0, item.formats.length - 3);

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
      className={`group bg-white flex flex-col h-[306px] items-stretch min-w-0 overflow-hidden relative rounded-[12px] border border-[#e4e6eb] hover:border-[#004bda]/45 shadow-[0px_4px_12px_rgba(25,33,61,0.04)] hover:shadow-[0px_10px_24px_rgba(0,75,218,0.10)] cursor-pointer transition-all duration-200 hover:-translate-y-[2px] ${fixedWidthClass}`}
      data-name="Itembox"
    >
      {/* Thumbnail Area */}
      <div className="bg-[#1b2238] h-[196px] relative shrink-0 w-full overflow-hidden">
        {item.imgUrl && !imgFailed ? (
          <img
            alt={item.title}
            src={item.imgUrl}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#19213d] to-[#2b3b66] text-white/60 font-sans text-[12px]">
            {item.categoryLabel} • 3D Asset
          </div>
        )}

        {/* Top gradient scrim for badge readability */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="bg-black/65 backdrop-blur-xs text-white font-sans font-semibold text-[10px] leading-[12px] px-2 py-1 rounded-[6px]">
            #{item.id}
          </span>
          {item.isFree && (
            <span className="bg-[#004bda] text-white font-sans font-bold text-[10px] leading-[12px] px-2 py-1 rounded-[6px] shadow-xs">
              FREE
            </span>
          )}
        </div>

        {/* Top-right category & quick action buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className="bg-white/92 backdrop-blur-xs text-[#19213d] font-sans font-semibold text-[10px] leading-[12px] px-2 py-1 rounded-[6px] shadow-xs pointer-events-none">
            {item.categoryLabel}
          </span>
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.uid);
              }}
              aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
              title={isBookmarked ? "Saved in Bookmarks" : "Save to Bookmarks"}
              className={`size-[24px] rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-all shadow-xs ${
                isBookmarked
                  ? "bg-[#004bda] text-white"
                  : "bg-white/90 text-[#19213d] hover:bg-white opacity-95 lg:opacity-0 lg:group-hover:opacity-100"
              }`}
            >
              <Bookmark
                size={13}
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
              title={isInCart ? "Added to cart" : "Add to cart"}
              className={`size-[24px] rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-all shadow-xs ${
                isInCart
                  ? "bg-[#008f1f] text-white"
                  : "bg-white/90 text-[#19213d] hover:bg-white opacity-95 lg:opacity-0 lg:group-hover:opacity-100"
              }`}
            >
              {isInCart ? <Check size={13} /> : <ShoppingBag size={13} />}
            </button>
          )}
        </div>

        {/* Bottom-left region pill on hover */}
        {item.province && (
          <div className="absolute bottom-2 left-2.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="bg-[#19213d]/80 backdrop-blur-xs text-white font-sans font-medium text-[10px] leading-[12px] px-2 py-1 rounded-[6px]">
              {item.region} • {item.province}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div
        className="bg-white flex-1 flex flex-col justify-between p-[12px] gap-1.5 min-w-0"
        data-name="Textbox"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3
            className="m-0 truncate font-google-sans font-bold text-[13px] leading-[18px] text-[#19213d] group-hover:text-[#004bda] transition-colors"
            title={item.title}
          >
            {item.title}
          </h3>
          <p
            className="m-0 truncate font-sans font-normal text-[11.5px] leading-[16px] text-[rgba(25,33,61,0.7)]"
            title={item.subtitle}
          >
            {item.subtitle}
          </p>
        </div>

        {/* Footer Metadata & Formats */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#f0f2f5] min-w-0">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="flex items-center gap-1">
              <img
                alt=""
                className="block max-w-none shrink-0"
                src="/assets/card_credit_icon.svg"
                width={14}
                height={14}
              />
              <span className="font-sans font-semibold text-[11.5px] leading-[14px] text-[#19213d] whitespace-nowrap">
                {item.credits}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <img
                alt=""
                className="block max-w-none shrink-0"
                src="/assets/card_size_icon.svg"
                width={14}
                height={14}
              />
              <span className="font-sans font-normal text-[11.5px] leading-[14px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                {item.size}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {visibleFormats.map((fmt) => (
              <span
                key={fmt}
                className="bg-[#eef0f4] text-[#19213d] group-hover:bg-[#eef4ff] group-hover:text-[#004bda] transition-colors font-sans font-bold text-[9.5px] leading-[10px] uppercase px-1.5 py-[3px] rounded-[6px] whitespace-nowrap"
              >
                {fmt}
              </span>
            ))}
            {extraFormatsCount > 0 && (
              <span className="bg-[#eef0f4] text-[rgba(25,33,61,0.7)] font-sans font-bold text-[9.5px] leading-[10px] px-1.5 py-[3px] rounded-[6px] whitespace-nowrap">
                +{extraFormatsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
