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
      className="flex-1 min-w-0 px-4 sm:px-6 xl:px-8 pt-6 pb-12 relative"
      data-name="Content"
    >
      <div className="w-full max-w-[1360px] mx-auto flex flex-col gap-5">
      {/* Cloudflare Kumo Sub-page Collection Header Card */}
      <section className="relative rounded-[8px] w-full overflow-hidden bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-semibold leading-[26px] text-[20px] tracking-[-0.01em] m-0 text-[var(--text-color-kumo-strong)]">
                  {section.collectionTitle}
                </h1>
                <span className="rounded-full px-2 py-0.5 text-[12px] font-medium border border-[var(--color-kumo-fill)] bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)] kumo-mono">
                  {filteredItems.length.toLocaleString()} assets
                </span>
                {section.badge && (
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)]">
                    {section.badge}
                  </span>
                )}
              </div>

              <p className="leading-[20px] text-[14px] text-[var(--text-color-kumo-subtle)] max-w-[780px] m-0">
                {section.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px] text-[var(--text-color-kumo-subtle)]">
                {section.province && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} strokeWidth={1.5} />
                    <span>{section.province}</span>
                  </span>
                )}
                {section.eraDetail && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} strokeWidth={1.5} />
                    <span>{section.eraDetail}</span>
                  </span>
                )}
                {section.scanTech && (
                  <span className="inline-flex items-center gap-1 kumo-mono">
                    <Scan size={13} strokeWidth={1.5} />
                    <span>{section.scanTech}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Sub-Region / Sub-Monument Navigation Chips */}
          {section.level === "country" && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[var(--color-kumo-line)]">
              <span className="text-[12px] text-[var(--text-color-kumo-subtle)] mr-1">
                Regions:
              </span>
              {VIETNAM_REGIONS_AND_MONUMENTS.map((reg) => (
                <button
                  key={reg.key}
                  type="button"
                  onClick={() => onNavigateHierarchy(reg.key)}
                  className="h-7 px-2.5 rounded-[6px] bg-[var(--color-kumo-canvas)] hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)] border border-[var(--color-kumo-line)] transition-colors cursor-pointer font-medium text-[12px]"
                >
                  {reg.name}
                </button>
              ))}
            </div>
          )}

          {(section.level === "region" || section.level === "monument") &&
            section.subMonuments &&
            section.subMonuments.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[var(--color-kumo-line)]">
                <span className="text-[12px] text-[var(--text-color-kumo-subtle)] mr-1">
                  {section.level === "region"
                    ? "Locations in region:"
                    : "Related locations:"}
                </span>
                {section.subMonuments.map((mon) => (
                  <button
                    key={mon.key}
                    type="button"
                    onClick={() => onNavigateHierarchy(mon.key)}
                    className="h-7 px-2.5 rounded-[6px] bg-[var(--color-kumo-canvas)] hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)] border border-[var(--color-kumo-line)] transition-colors cursor-pointer text-[12px]"
                  >
                    {mon.name}
                  </button>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* Cloudflare Kumo Unified Filter Menu Bar */}
      <section
        ref={filterBarRef}
        className="flex flex-wrap gap-2.5 items-center justify-between relative w-full min-h-9 shrink-0 z-20"
        data-name="Filter Menu"
      >
        {/* Left: Breadcrumb */}
        <div className="bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex flex-wrap min-h-9 items-center px-3 py-1.5 rounded-[8px] shrink-0 gap-1">
          {section.pathSegments.map((seg, idx) => {
            const isLast = idx === section.pathSegments.length - 1;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigateHierarchy(seg.targetKey)}
                className={`border-0 bg-transparent p-0 cursor-pointer text-[12px] transition-colors ${
                  isLast
                    ? "font-semibold text-[var(--text-color-kumo-strong)]"
                    : "font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                }`}
              >
                {seg.label}
              </button>
            );
          })}
        </div>

        {/* Right: Filter Dropdowns + Sort + Grid Density + Reset */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
          {filterPills.map((fp) => {
            const isOpen = openFilter === fp.key;
            const currentVal = selectedFilters[fp.key];
            const isActive = currentVal !== fp.defaultLabel;
            return (
              <div key={fp.key} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFilter(isOpen ? null : fp.key)}
                  className={`transition-colors cursor-pointer flex gap-2 h-9 items-center px-3 rounded-[8px] border shadow-[var(--shadow-kumo-xs)] text-[13px] whitespace-nowrap ${
                    isActive
                      ? "bg-[#3e8eff]/[.10] text-[var(--text-color-kumo-strong)] border-[#3e8eff]/40 font-medium"
                      : "bg-white hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)] border-[var(--color-kumo-line)] font-normal"
                  }`}
                >
                  <span>{currentVal}</span>
                  <ChevronDown
                    size={13}
                    strokeWidth={1.5}
                    className={`text-[var(--text-color-kumo-subtle)] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-[var(--color-kumo-line)] rounded-[8px] shadow-[var(--shadow-kumo-md)] py-1 min-w-[200px] max-h-[280px] overflow-y-auto z-30">
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
                          className={`w-full text-left px-3 py-1.5 text-[13px] border-0 cursor-pointer transition-colors ${
                            isOptionSelected
                              ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)] font-medium"
                              : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
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
              className="bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] transition-colors cursor-pointer flex gap-1.5 h-9 items-center px-3 rounded-[8px] text-[13px]"
            >
              <span className="text-[var(--text-color-kumo-subtle)]">Sort:</span>
              <span className="text-[var(--text-color-kumo-strong)] font-medium">
                {selectedFilters.sort}
              </span>
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className={`text-[var(--text-color-kumo-subtle)] transition-transform ${
                  openFilter === "sort" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openFilter === "sort" && (
              <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-[var(--color-kumo-line)] rounded-[8px] shadow-[var(--shadow-kumo-md)] py-1 min-w-[180px] z-30">
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
                    className={`w-full text-left px-3 py-1.5 text-[13px] border-0 cursor-pointer transition-colors ${
                      selectedFilters.sort === opt
                        ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)] font-medium"
                        : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Density Toggle */}
          <div className="hidden lg:flex items-center bg-[var(--color-kumo-recessed)] rounded-[8px] p-0.5 h-9 gap-0.5">
            <button
              type="button"
              onClick={() => setGridColumns(3)}
              title="3-column grid"
              aria-label="3-column layout"
              className={`size-8 rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-colors ${
                gridColumns === 3
                  ? "bg-white text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                  : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
              }`}
            >
              <Columns3 size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setGridColumns(4)}
              title="4-column grid"
              aria-label="4-column layout"
              className={`size-8 rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-colors ${
                gridColumns === 4
                  ? "bg-white text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                  : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setSelectedFilters(DEFAULT_FILTERS)}
              aria-label="Reset filters"
              title="Reset filters"
              className="h-9 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-link)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] cursor-pointer flex items-center gap-1.5 font-medium text-[12px]"
            >
              <RotateCcw size={13} strokeWidth={1.5} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </section>

      {/* Endless Scroll Card Grid */}
      <section className="w-full">
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
              : "No matching assets"
          }
          emptyDescription={
            section.level === "bookmarks"
              ? "Save any 3D model or surface using its bookmark button"
              : "Adjust your period, format, or keyword filters"
          }
          onResetFilters={
            hasActiveFilters
              ? () => setSelectedFilters(DEFAULT_FILTERS)
              : undefined
          }
        />
      </section>
      </div>
    </main>
  );
}
