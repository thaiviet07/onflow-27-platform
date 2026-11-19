"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AssetItem } from "@/data/galleryMeta";
import { ItemBox } from "./ItemBox";

type EndlessCardGridProps = {
  items: AssetItem[];
  resetKey: string;
  columns?: 3 | 4;
  initialBatchSize?: number;
  batchSize?: number;
  infiniteCycle?: boolean;
  onSelectItem: (item: AssetItem) => void;
  bookmarkedSet: Set<string>;
  cartSet: Set<string>;
  onToggleBookmark: (uid: string) => void;
  onToggleCart: (uid: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
};

export function EndlessCardGrid({
  items,
  resetKey,
  columns = 4,
  initialBatchSize = 24,
  batchSize = 24,
  infiniteCycle = true,
  onSelectItem,
  bookmarkedSet,
  cartSet,
  onToggleBookmark,
  onToggleCart,
  emptyTitle = "No matching assets found",
  emptyDescription = "Try clearing some filters or entering a different keyword to explore the full library.",
  onResetFilters,
}: EndlessCardGridProps) {
  const [scrollState, setScrollState] = useState<{
    key: string;
    count: number;
  }>({
    key: resetKey,
    count: initialBatchSize,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdvancingRef = useRef(false);

  const effectiveCount =
    scrollState.key === resetKey ? scrollState.count : initialBatchSize;

  const totalUnique = items.length;
  const maxRenderCount = infiniteCycle
    ? effectiveCount
    : Math.min(effectiveCount, totalUnique);

  const canLoadMore =
    totalUnique > 0 && (infiniteCycle || effectiveCount < totalUnique);

  const streamedEntries = useMemo(() => {
    if (totalUnique === 0) return [];
    const targetLen = Math.max(0, maxRenderCount);
    return Array.from({ length: targetLen }, (_, idx) => {
      const item = items[idx % totalUnique];
      const pass = Math.floor(idx / totalUnique);
      return {
        item,
        streamKey: `${item.uid}-p${pass}-i${idx}`,
      };
    });
  }, [items, totalUnique, maxRenderCount]);

  useEffect(() => {
    if (!canLoadMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || isAdvancingRef.current) return;

        isAdvancingRef.current = true;
        setIsLoadingMore(true);

        timerRef.current = setTimeout(() => {
          setScrollState((prev) => {
            const current =
              prev.key === resetKey ? prev.count : initialBatchSize;
            return {
              key: resetKey,
              count: current + batchSize,
            };
          });
          setIsLoadingMore(false);
          isAdvancingRef.current = false;
        }, 160);
      },
      {
        rootMargin: "650px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      isAdvancingRef.current = false;
    };
  }, [canLoadMore, resetKey, initialBatchSize, batchSize, effectiveCount]);

  if (totalUnique === 0) {
    return (
      <div className="w-full bg-white rounded-[12px] border border-[#e4e6eb] p-10 flex flex-col items-center justify-center text-center gap-3">
        <div className="size-12 rounded-full bg-[#eef4ff] text-[#004bda] flex items-center justify-center">
          <Sparkles size={22} />
        </div>
        <h3 className="m-0 font-google-sans font-bold text-[18px] text-[#19213d]">
          {emptyTitle}
        </h3>
        <p className="m-0 font-sans text-[13px] text-[rgba(25,33,61,0.7)] max-w-[440px]">
          {emptyDescription}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-2 bg-[#004bda] hover:bg-[#003db3] text-white font-sans font-semibold text-[13px] px-5 py-2.5 rounded-[10px] border-0 cursor-pointer transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  const gridColsClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className={`grid ${gridColsClass} gap-[16px] items-start w-full`}>
        {streamedEntries.map(({ item, streamKey }) => (
          <ItemBox
            key={streamKey}
            item={item}
            onSelect={onSelectItem}
            isBookmarked={bookmarkedSet.has(item.uid)}
            isInCart={cartSet.has(item.uid)}
            onToggleBookmark={onToggleBookmark}
            onToggleCart={onToggleCart}
          />
        ))}
      </div>

      {/* Skeleton cards while advancing endless scroll batch */}
      {isLoadingMore && (
        <div className={`grid ${gridColsClass} gap-[16px] w-full`}>
          {Array.from({ length: columns }, (_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white rounded-[12px] border border-[#e4e6eb] h-[306px] overflow-hidden animate-pulse flex flex-col"
            >
              <div className="bg-[#e4e7ee] h-[196px] w-full" />
              <div className="p-3 flex flex-col gap-2.5 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-[#e4e7ee] rounded w-3/4" />
                  <div className="h-3 bg-[#eef0f4] rounded w-1/2" />
                </div>
                <div className="h-3 bg-[#eef0f4] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Endless Scroll Sentinel & Live Status Footer */}
      <div
        ref={sentinelRef}
        className="w-full py-4 flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        {canLoadMore ? (
          <div className="inline-flex items-center gap-2.5 bg-white border border-[#e4e6eb] shadow-xs px-4 py-2 rounded-full text-[12px] font-sans text-[rgba(25,33,61,0.75)]">
            <Loader2
              size={14}
              className={`text-[#004bda] ${
                isLoadingMore ? "animate-spin" : ""
              }`}
            />
            <span>
              Showing{" "}
              <strong className="text-[#19213d]">
                {streamedEntries.length.toLocaleString()}
              </strong>{" "}
              of {totalUnique.toLocaleString()} assets — Scroll to load more
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-white border border-[#e4e6eb] px-4 py-2 rounded-full text-[12px] font-sans text-[rgba(25,33,61,0.7)]">
            <span>
              Showing all{" "}
              <strong className="text-[#19213d]">
                {totalUnique.toLocaleString()}
              </strong>{" "}
              saved assets
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
