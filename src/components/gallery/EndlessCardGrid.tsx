"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
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
  emptyTitle = "No matching assets",
  emptyDescription = "Clear filters or try another keyword to browse the full catalog",
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
      <div className="w-full bg-white rounded-[12px] border border-[#141926]/10 p-10 flex flex-col items-center justify-center text-center gap-3">
        <div className="size-10 rounded-[8px] bg-[#eef0f4] text-[#6c7488] flex items-center justify-center">
          <Search size={18} strokeWidth={1.5} />
        </div>
        <h3 className="m-0 font-google-sans font-medium text-[18px] leading-[24px] text-[#141926]">
          {emptyTitle}
        </h3>
        <p className="m-0 font-sans text-[13px] leading-[20px] text-[#4e5669] max-w-[400px]">
          {emptyDescription}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-2 h-9 bg-[#004bda] hover:bg-[#003db3] text-white font-sans font-medium text-[13px] px-4 rounded-[8px] border-0 cursor-pointer transition-colors duration-150 active:scale-[0.98]"
          >
            Reset filters
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
      <div className={`grid ${gridColsClass} gap-4 items-start w-full`}>
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

      {/* Static placeholder cards while loading next batch */}
      {isLoadingMore && (
        <div className={`grid ${gridColsClass} gap-4 w-full`}>
          {Array.from({ length: columns }, (_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white rounded-[12px] border border-[#141926]/10 h-[304px] overflow-hidden flex flex-col"
            >
              <div className="bg-[#eef0f4] h-[192px] w-full" />
              <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-[#eef0f4] rounded-[4px] w-3/4" />
                  <div className="h-3 bg-[#f5f6f8] rounded-[4px] w-1/2" />
                </div>
                <div className="h-3 bg-[#f5f6f8] rounded-[4px] w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Endless Scroll Sentinel & Quiet Status Line */}
      <div
        ref={sentinelRef}
        className="w-full py-4 flex items-center justify-center"
      >
        {canLoadMore ? (
          <div className="inline-flex items-center gap-2 text-[12px] font-sans text-[#6c7488]">
            {isLoadingMore && (
              <Loader2
                size={14}
                strokeWidth={1.5}
                className="text-[#004bda] animate-spin"
              />
            )}
            <span className="font-mono tabular-nums">
              Showing{" "}
              <span className="text-[#141926] font-medium">
                {streamedEntries.length.toLocaleString()}
              </span>{" "}
              of {totalUnique.toLocaleString()} assets
            </span>
          </div>
        ) : (
          <span className="font-mono tabular-nums text-[12px] text-[#6c7488]">
            Showing all {totalUnique.toLocaleString()} saved assets
          </span>
        )}
      </div>
    </div>
  );
}
