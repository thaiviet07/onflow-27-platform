"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Clock,
  Columns3,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Scan,
} from "lucide-react";
import {
  AssetItem,
  FILTER_OPTIONS,
  HierarchySectionMeta,
} from "@/data/galleryMeta";
import { VIETNAM_REGIONS_AND_MONUMENTS } from "@/data/lotpixelCatalog";
import { EndlessCardGrid } from "./EndlessCardGrid";

type HierarchySectionViewProps = {
  section: HierarchySectionMeta;
  catalog: AssetItem[];
  searchQuery: string;
  bookmarkedSet: Set<string>;
  cartSet: Set<string>;
  onNavigateHierarchy: (targetKey: string | null) => void;
  onSelectItem: (item: AssetItem) => void;
  onToggleBookmark: (uid: string) => void;
  onToggleCart: (uid: string) => void;
};

type FilterState = {
  tag: string;
  format: string;
  era: string;
  range: string;
  date: string;
  sort: string;
};

const DEFAULT_FILTERS: FilterState = {
  tag: "Tag",
  format: "Format",
  era: "Period",
  range: "Credits",
  date: "Date published",
  sort: "Relevance",
};

function matchesCuratedCollection(item: AssetItem, key: string): boolean {
  switch (key) {
    case "recent-releases":
      return item.assetGroup === "3d-models";
    case "historical-artifacts":
      return (
        item.pillCategory === "historical-3d" ||
        item.categorySlug === "interior-3d-models" ||
        item.categorySlug === "nature-3d-models"
      );
    case "trending-materials":
      return (
        item.assetGroup === "textures" &&
        [
          "stone-textures",
          "wood-textures",
          "tile-textures",
          "metal-textures",
          "brick-textures",
        ].includes(item.categorySlug)
      );
    case "discount-hdris":
      return item.pillCategory === "hdris";
    case "kitbash-ready":
      return (
        item.pillCategory === "kitbash-3d" ||
        [
          "industrial-3d-models",
          "street-3d-models",
          "building-3d-models",
        ].includes(item.categorySlug)
      );
    case "free-assets":
      return item.isFree;
    default:
      return true;
  }
}

export function HierarchySectionView({
  section,
  catalog,
  searchQuery,
  bookmarkedSet,
  cartSet,
  onNavigateHierarchy,
  onSelectItem,
  onToggleBookmark,
  onToggleCart,
}: HierarchySectionViewProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] =
    useState<FilterState>(DEFAULT_FILTERS);
  const [gridColumns, setGridColumns] = useState<3 | 4>(4);
  const filterBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(e.target as Node)
      ) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = catalog.filter((item) => {
      if (item.sensitive) return false;

      // Section scope filter
      if (section.level === "region" && item.regionKey !== section.key) {
        return false;
      }
      if (section.level === "monument" && item.monumentKey !== section.key) {
        return false;
      }
      if (section.level === "material" && item.materialGroupKey !== section.key) {
        return false;
      }
      if (section.level === "hdri" && item.hdriGroupKey !== section.key) {
        return false;
      }
      if (section.level === "bookmarks" && !bookmarkedSet.has(item.uid)) {
        return false;
      }
      if (
        section.level === "collection" &&
        !matchesCuratedCollection(item, section.key)
      ) {
        return false;
      }

      // Search query filter
      if (q) {
        const hay =
          `${item.title} ${item.id} ${item.categoryLabel} ${item.subcategoryLabel} ${item.monument} ${item.province || ""} ${item.region} ${item.era || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Tag filter
      if (selectedFilters.tag !== "Tag" && selectedFilters.tag !== "All Tags") {
        const t = selectedFilters.tag.toLowerCase();
        if (t === "3d model" && item.assetGroup !== "3d-models") return false;
        else if (t === "texture" && item.assetGroup !== "textures")
          return false;
        else if (t === "hdris & ground" && item.pillCategory !== "hdris")
          return false;
        else if (!["3d model", "texture", "hdris & ground"].includes(t)) {
          const catMatch =
            item.categoryLabel.toLowerCase().includes(t) ||
            item.subcategoryLabel.toLowerCase().includes(t) ||
            item.title.toLowerCase().includes(t);
          if (!catMatch) return false;
        }
      }

      // Format filter
      if (
        selectedFilters.format !== "Format" &&
        selectedFilters.format !== "All Formats"
      ) {
        if (!item.formats.includes(selectedFilters.format)) return false;
      }

      // Era / Dynasty filter
      if (
        selectedFilters.era !== DEFAULT_FILTERS.era &&
        selectedFilters.era !== "All Eras"
      ) {
        if (item.era !== selectedFilters.era) return false;
      }

      // Credits range filter
      if (
        selectedFilters.range !== DEFAULT_FILTERS.range &&
        selectedFilters.range !== "All Ranges"
      ) {
        if (selectedFilters.range === "Free" && !item.isFree) return false;
        if (selectedFilters.range === "1 - 5 Credits") {
          const num = parseInt(item.credits, 10);
          if (item.isFree || isNaN(num) || num > 5) return false;
        }
        if (selectedFilters.range === "6 - 20 Credits") {
          const num = parseInt(item.credits, 10);
          if (item.isFree || isNaN(num) || num < 6) return false;
        }
      }

      return true;
    });

    if (selectedFilters.sort === "Newest") {
      return [...list].sort((a, b) => Number(b.id) - Number(a.id));
    }
    if (selectedFilters.sort === "Credits: Low to High") {
      return [...list].sort((a, b) => {
        const ca = a.isFree ? 0 : parseInt(a.credits, 10) || 4;
        const cb = b.isFree ? 0 : parseInt(b.credits, 10) || 4;
        return ca - cb;
      });
    }
    if (selectedFilters.sort === "File Size") {
      return [...list].sort((a, b) => {
        const sa = parseFloat(a.size.replace(",", ".")) || 0;
        const sb = parseFloat(b.size.replace(",", ".")) || 0;
        return sb - sa;
      });
    }
    return list;
  }, [catalog, section, selectedFilters, searchQuery, bookmarkedSet]);

  const filterPills: {
    key: "tag" | "format" | "era" | "range" | "date";
    defaultLabel: string;
  }[] = [
    { key: "tag", defaultLabel: DEFAULT_FILTERS.tag },
    { key: "format", defaultLabel: DEFAULT_FILTERS.format },
    { key: "era", defaultLabel: DEFAULT_FILTERS.era },
    { key: "range", defaultLabel: DEFAULT_FILTERS.range },
    { key: "date", defaultLabel: DEFAULT_FILTERS.date },
  ];

  const hasActiveFilters =
    selectedFilters.tag !== DEFAULT_FILTERS.tag ||
    selectedFilters.format !== DEFAULT_FILTERS.format ||
    selectedFilters.era !== DEFAULT_FILTERS.era ||
    selectedFilters.range !== DEFAULT_FILTERS.range ||
    selectedFilters.date !== DEFAULT_FILTERS.date ||
    selectedFilters.sort !== DEFAULT_FILTERS.sort;

  const resetKey = `${section.key}|${searchQuery}|${JSON.stringify(selectedFilters)}`;

  return (
    <main
      className="flex-1 min-w-0 px-4 sm:px-6 xl:px-[36px] pt-6 sm:pt-8 pb-[68px] flex flex-col gap-[24px] relative"
      data-name="Content"
    >
      {/* Collection Banner */}
      <section className="relative rounded-[14px] w-full max-w-[1540px] overflow-hidden bg-gradient-to-r from-[#131b35] via-[#1c2850] to-[#004bda]/85 text-white p-6 sm:px-[36px] sm:py-[28px] shadow-[0px_8px_24px_rgba(25,33,61,0.12)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
            <div className="relative shrink-0 size-[68px] sm:size-[84px] rounded-[16px] bg-white/12 backdrop-blur-xs border border-white/20 flex items-center justify-center p-2">
              <img
                alt=""
                className="block max-w-none size-full object-contain"
                src="/assets/site_banner_circle.svg"
                width={72}
                height={72}
              />
            </div>

            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {section.badge && (
                  <span className="bg-white/15 backdrop-blur-xs border border-white/20 text-white font-sans font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                    {section.badge}
                  </span>
                )}
                {section.province && (
                  <span className="inline-flex items-center gap-1 bg-black/25 text-white/95 font-sans font-medium text-[11px] px-2.5 py-0.5 rounded-full">
                    <MapPin size={11} />
                    {section.province}
                  </span>
                )}
                {section.eraDetail && (
                  <span className="inline-flex items-center gap-1 bg-black/25 text-white/95 font-sans font-medium text-[11px] px-2.5 py-0.5 rounded-full">
                    <Clock size={11} />
                    {section.eraDetail}
                  </span>
                )}
                {section.scanTech && (
                  <span className="inline-flex items-center gap-1 bg-[#004bda]/70 border border-white/20 text-white font-sans font-medium text-[11px] px-2.5 py-0.5 rounded-full">
                    <Scan size={11} />
                    {section.scanTech}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="font-google-sans font-bold leading-[34px] text-[24px] sm:text-[30px] m-0 text-white">
                  {section.collectionTitle}
                </h2>
                <span className="bg-white text-[#19213d] font-sans font-bold text-[12px] px-3 py-0.5 rounded-full shadow-xs">
                  {filteredItems.length.toLocaleString()} Assets
                </span>
              </div>

              <p className="font-sans font-normal leading-[21px] text-[13.5px] sm:text-[14.5px] text-white/85 max-w-[780px] m-0">
                {section.description}
              </p>
            </div>
          </div>

          {/* Quick Sub-Region / Sub-Monument Navigation Chips */}
          {section.level === "country" && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/15">
              <span className="font-sans text-[11px] font-semibold text-white/75 mr-1">
                Quick jump by Region:
              </span>
              {VIETNAM_REGIONS_AND_MONUMENTS.map((reg) => (
                <button
                  key={reg.key}
                  type="button"
                  onClick={() => onNavigateHierarchy(reg.key)}
                  className="bg-white/15 hover:bg-white text-white hover:text-[#19213d] border border-white/20 transition-colors cursor-pointer font-sans font-semibold text-[12px] px-3 py-1.5 rounded-full"
                >
                  {reg.name} • {reg.subLabel}
                </button>
              ))}
            </div>
          )}

          {(section.level === "region" || section.level === "monument") &&
            section.subMonuments &&
            section.subMonuments.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/15">
                <span className="font-sans text-[11px] font-semibold text-white/75 mr-1">
                  {section.level === "region"
                    ? "Locations in this region:"
                    : "Related locations:"}
                </span>
                {section.subMonuments.map((mon) => (
                  <button
                    key={mon.key}
                    type="button"
                    onClick={() => onNavigateHierarchy(mon.key)}
                    className="bg-white/15 hover:bg-white text-white hover:text-[#19213d] border border-white/20 transition-colors cursor-pointer font-sans font-medium text-[11.5px] px-3 py-1 rounded-full"
                  >
                    {mon.name}
                  </button>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* Unified Filter Menu Bar */}
      <section
        ref={filterBarRef}
        className="flex flex-wrap gap-3 items-center justify-between relative w-full max-w-[1540px] min-h-[36px] shrink-0 z-20"
        data-name="Filter Menu"
      >
        {/* Left: Breadcrumb Pill */}
        <div className="bg-white border border-[#e4e6eb] flex flex-wrap min-h-[36px] items-center px-[14px] py-[6px] rounded-[10px] shrink-0 gap-1">
          {section.pathSegments.map((seg, idx) => {
            const isLast = idx === section.pathSegments.length - 1;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigateHierarchy(seg.targetKey)}
                className={`border-0 bg-transparent p-0 cursor-pointer font-sans text-[12px] transition-colors ${
                  isLast
                    ? "font-bold text-[#004bda]"
                    : "font-semibold text-[rgba(25,33,61,0.7)] hover:text-[#004bda]"
                }`}
              >
                {seg.label}
              </button>
            );
          })}
        </div>

        {/* Right: Filter Dropdowns + Sort + Grid Density + Reset */}
        <div className="flex flex-wrap items-center justify-end gap-[8px] shrink-0">
          {filterPills.map((fp) => {
            const isOpen = openFilter === fp.key;
            const currentVal = selectedFilters[fp.key];
            const isActive = currentVal !== fp.defaultLabel;
            return (
              <div key={fp.key} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFilter(isOpen ? null : fp.key)}
                  className={`transition-colors cursor-pointer flex gap-[8px] h-[36px] items-center px-[12px] rounded-[10px] border text-[12px] font-sans whitespace-nowrap ${
                    isActive
                      ? "bg-[#eef4ff] text-[#004bda] border-[#004bda]/35 font-semibold"
                      : "bg-white hover:bg-[#f6f7fa] text-[#19213d] border-[#e4e6eb] font-medium"
                  }`}
                >
                  <span>{currentVal}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-[#e4e6eb] rounded-[10px] shadow-xl py-1.5 min-w-[220px] max-h-[300px] overflow-y-auto z-30">
                    {FILTER_OPTIONS[fp.key].map((opt) => {
                      const isOptionSelected =
                        opt === currentVal ||
                        ((opt.startsWith("All ") || opt.startsWith("Any ")) &&
                          !isActive);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedFilters((prev) => ({
                              ...prev,
                              [fp.key]:
                                opt.startsWith("All ") || opt.startsWith("Any ")
                                  ? fp.defaultLabel
                                  : opt,
                            }));
                            setOpenFilter(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-[12px] font-sans border-0 cursor-pointer transition-colors ${
                            isOptionSelected
                              ? "bg-[#eef4ff] text-[#004bda] font-semibold"
                              : "bg-transparent text-[#19213d] hover:bg-[#f6f7fa]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sort by Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenFilter(openFilter === "sort" ? null : "sort")
              }
              className="bg-white hover:bg-[#f6f7fa] border border-[#e4e6eb] transition-colors cursor-pointer flex gap-[6px] h-[36px] items-center px-[12px] rounded-[10px] text-[12px] font-sans"
            >
              <span className="text-[rgba(25,33,61,0.65)]">Sort by:</span>
              <span className="text-[#19213d] font-semibold">
                {selectedFilters.sort}
              </span>
              <ChevronDown
                size={13}
                className={`text-[rgba(25,33,61,0.6)] transition-transform duration-150 ${
                  openFilter === "sort" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openFilter === "sort" && (
              <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-[#e4e6eb] rounded-[10px] shadow-xl py-1.5 min-w-[180px] z-30">
                {FILTER_OPTIONS.sort.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        sort: opt,
                      }));
                      setOpenFilter(null);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-[12px] font-sans border-0 cursor-pointer transition-colors ${
                      selectedFilters.sort === opt
                        ? "bg-[#eef4ff] text-[#004bda] font-semibold"
                        : "bg-transparent text-[#19213d] hover:bg-[#f6f7fa]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Density Toggle (3 vs 4 columns) */}
          <div className="hidden lg:flex items-center bg-white border border-[#e4e6eb] rounded-[10px] p-0.5 h-[36px]">
            <button
              type="button"
              onClick={() => setGridColumns(3)}
              title="3-column grid (Large cards)"
              aria-label="3-column layout"
              className={`size-[28px] rounded-[7px] flex items-center justify-center border-0 cursor-pointer transition-colors ${
                gridColumns === 3
                  ? "bg-[#eef4ff] text-[#004bda]"
                  : "bg-transparent text-[rgba(25,33,61,0.6)] hover:text-[#19213d]"
              }`}
            >
              <Columns3 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setGridColumns(4)}
              title="4-column grid (Standard)"
              aria-label="4-column layout"
              className={`size-[28px] rounded-[7px] flex items-center justify-center border-0 cursor-pointer transition-colors ${
                gridColumns === 4
                  ? "bg-[#eef4ff] text-[#004bda]"
                  : "bg-transparent text-[rgba(25,33,61,0.6)] hover:text-[#19213d]"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setSelectedFilters(DEFAULT_FILTERS)}
              aria-label="Reset filters"
              title="Reset filters"
              className="h-[36px] px-3 rounded-[10px] bg-white hover:bg-[#eef4ff] text-[#004bda] border border-[#004bda]/30 cursor-pointer flex items-center gap-1.5 font-sans font-semibold text-[12px] transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </section>

      {/* Endless Scroll Card Grid */}
      <section className="w-full max-w-[1540px]">
        <EndlessCardGrid
          items={filteredItems}
          resetKey={resetKey}
          columns={gridColumns}
          infiniteCycle={section.level !== "bookmarks"}
          onSelectItem={onSelectItem}
          bookmarkedSet={bookmarkedSet}
          cartSet={cartSet}
          onToggleBookmark={onToggleBookmark}
          onToggleCart={onToggleCart}
          emptyTitle={
            section.level === "bookmarks"
              ? "No saved assets yet"
              : "No matching assets found"
          }
          emptyDescription={
            section.level === "bookmarks"
              ? "Click the Bookmark icon on any 3D model or surface card to save it here."
              : "Try adjusting your period, format, or keyword filters."
          }
          onResetFilters={
            hasActiveFilters
              ? () => setSelectedFilters(DEFAULT_FILTERS)
              : undefined
          }
        />
      </section>
    </main>
  );
}
