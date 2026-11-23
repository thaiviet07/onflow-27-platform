"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CreditIcon } from "@/components/CreditIcon";
import {
  ArrowUpRight,
  Blocks,
  Bookmark,
  Box,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Compass,
  CreditCard,
  FileText,
  Gift,
  Globe,
  Home,
  KeyRound,
  Landmark,
  Layers,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Newspaper,
  PanelLeft,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { AssetItem } from "@/data/galleryMeta";
import {
  VIETNAM_HDRIS_TAXONOMY,
  VIETNAM_MATERIALS_TAXONOMY,
  VIETNAM_REGIONS_AND_MONUMENTS,
} from "@/data/lotpixelCatalog";

type GallerySidebarProps = {
  catalog: AssetItem[];
  activeHierarchyKey: string | null;
  activeNavKey: string | null;
  bookmarksCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onSelectHierarchy: (key: string | null) => void;
  onSelectKnowledgeHub: (hubKey: "Forums" | "Documentations" | "News") => void;
  onCloseMobile?: () => void;
};

export function GallerySidebar({
  catalog,
  activeHierarchyKey,
  activeNavKey,
  bookmarksCount,
  collapsed = false,
  onToggleCollapse,
  onSelectHierarchy,
  onSelectKnowledgeHub,
  onCloseMobile,
}: GallerySidebarProps) {
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [libraryMenuOpen, setLibraryMenuOpen] = useState(false);
  const filterInputRef = useRef<HTMLInputElement | null>(null);

  // Expandable parent groups modeled after Cloudflare Kumo sidebar
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    "mien-bac": true,
    "mien-trung": false,
    "mien-nam": false,
  });
  const [modelsOpen, setModelsOpen] = useState(false);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [hdrisOpen, setHdrisOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const counts = useMemo(() => {
    let total = 0;
    let freeTotal = 0;
    const regionCounts: Record<string, number> = {};
    const monumentCounts: Record<string, number> = {};
    const materialCounts: Record<string, number> = {};
    const hdriCounts: Record<string, number> = {};

    for (const item of catalog) {
      if (item.sensitive) continue;
      total += 1;
      if (item.isFree) freeTotal += 1;
      if (item.regionKey) {
        regionCounts[item.regionKey] = (regionCounts[item.regionKey] || 0) + 1;
      }
      if (item.monumentKey) {
        monumentCounts[item.monumentKey] =
          (monumentCounts[item.monumentKey] || 0) + 1;
      }
      if (item.materialGroupKey) {
        materialCounts[item.materialGroupKey] =
          (materialCounts[item.materialGroupKey] || 0) + 1;
      }
      if (item.hdriGroupKey) {
        hdriCounts[item.hdriGroupKey] =
          (hdriCounts[item.hdriGroupKey] || 0) + 1;
      }
    }

    return {
      total,
      freeTotal,
      regionCounts,
      monumentCounts,
      materialCounts,
      hdriCounts,
    };
  }, [catalog]);

  const filterText = sidebarFilter.trim().toLowerCase();

  const toggleRegion = (key: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectItem = (key: string | null) => {
    onSelectHierarchy(key);
    onCloseMobile?.();
  };

  const filteredRegions = useMemo(() => {
    if (!filterText) return VIETNAM_REGIONS_AND_MONUMENTS;
    return VIETNAM_REGIONS_AND_MONUMENTS.map((reg) => {
      const regMatches = `${reg.name} ${reg.englishName} ${reg.subLabel}`
        .toLowerCase()
        .includes(filterText);
      const matchingMonuments = reg.monuments.filter((m) =>
        `${m.name} ${m.englishName} ${m.province} ${m.era} ${m.eraDetail}`
          .toLowerCase()
          .includes(filterText)
      );
      if (regMatches) return reg;
      if (matchingMonuments.length > 0) {
        return { ...reg, monuments: matchingMonuments };
      }
      return null;
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [filterText]);

  const filteredMaterials = useMemo(() => {
    if (!filterText) return VIETNAM_MATERIALS_TAXONOMY;
    return VIETNAM_MATERIALS_TAXONOMY.filter((m) =>
      `${m.name} ${m.subtitle} ${m.provinceHint}`
        .toLowerCase()
        .includes(filterText)
    );
  }, [filterText]);

  const filteredHdris = useMemo(() => {
    if (!filterText) return VIETNAM_HDRIS_TAXONOMY;
    return VIETNAM_HDRIS_TAXONOMY.filter((h) =>
      `${h.name} ${h.subtitle} ${h.provinceHint}`
        .toLowerCase()
        .includes(filterText)
    );
  }, [filterText]);

  const isCollapsedDesktop = collapsed && !onCloseMobile;

  return (
    <div className="kumo-portal flex flex-col h-full w-full bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)] select-none">
      {/* Top 58px Kumo Sidebar Header (Continuous horizontal border with Main Top Header) */}
      <div className="h-[58px] shrink-0 px-3 border-b border-[var(--color-kumo-line)] flex items-center justify-between gap-2 relative">
        {/* Brand Logo Mark */}
        <button
          type="button"
          onClick={() => handleSelectItem(null)}
          title="Onflow 3D Asset Library"
          className={`rounded-[8px] hover:bg-[var(--color-kumo-tint)] border-0 bg-transparent flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
            isCollapsedDesktop ? "size-9" : "h-9 px-1.5"
          }`}
        >
          {isCollapsedDesktop ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Onflow Asia"
            >
              <path
                d="M42.0248 39.6443C39.2825 39.1995 36.6552 38.6598 34.1555 38.0251C38.6483 35.2347 41.7761 32.0618 43.3555 28.6367C45.246 24.5355 45.2864 20.6154 45.2834 20.1824C45.2521 12.1759 40.0878 6.86486 39.0524 5.88035C33.4652 0.57232 26.7462 0 24.1097 0C21.473 0 14.7603 0.572319 9.16996 5.88332C8.13459 6.86783 2.97022 12.1788 2.93912 20.1824C2.93912 20.6154 2.97643 24.5385 4.86682 28.6367C6.4463 32.0618 9.57415 35.2347 14.067 38.0251C11.5671 38.6568 8.93987 39.1995 6.19756 39.6443L2.33594 40.27L3.65113 47.6389L7.51586 47.0132C13.5601 46.0317 19.1381 44.6142 24.1128 42.7875C29.0906 44.6112 34.6654 46.0317 40.7097 47.0132L44.5744 47.6389L45.8896 40.27L42.0248 39.6443ZM10.8303 20.1973C10.8303 18.3883 11.2158 16.5854 11.9713 14.9811C13.8866 10.9215 18.1898 7.97985 22.8348 7.55283C27.48 7.12581 32.2931 9.23125 34.9857 12.8668C37.8306 16.707 38.2317 22.2404 35.7909 26.3623C33.4155 30.3804 28.3475 32.9039 24.1097 34.7068C20.2138 33.0491 15.8299 30.8548 13.2275 27.504C11.62 25.4371 10.8272 22.8098 10.8272 20.1943L10.8303 20.1973Z"
                fill="#19213D"
              />
            </svg>
          ) : (
            <img
              src="/onflow-logo.svg"
              alt="Onflow Asia"
              className="h-[22px] w-auto object-contain block"
            />
          )}
        </button>

        {/* Library Switcher Pill (Cloudflare Account Switcher style) */}
        {!isCollapsedDesktop && (
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setLibraryMenuOpen((prev) => !prev)}
              className="w-full h-[32px] px-2 py-1 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-between gap-1 cursor-pointer text-left transition-colors"
            >
              <span className="text-[12.5px] font-medium text-[var(--text-color-kumo-default)] truncate">
                3D Library
              </span>
              <ChevronsUpDown
                size={13}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
            </button>

            {libraryMenuOpen && (
              <div className="absolute left-0 right-0 top-[38px] z-50 bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] p-1 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setLibraryMenuOpen(false);
                    handleSelectItem(null);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-[6px] bg-[var(--color-kumo-recessed)] border-0 text-left flex items-center justify-between gap-2 cursor-pointer text-[13px] font-medium text-[var(--text-color-kumo-strong)]"
                >
                  <div className="min-w-0">
                    <div className="truncate">Onflow 3D Library</div>
                    <div className="text-[11px] font-normal text-[var(--text-color-kumo-subtle)] truncate">
                      {counts.total.toLocaleString()} scanned assets
                    </div>
                  </div>
                  <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)] shrink-0" />
                </button>
                <Link
                  href="/portal"
                  onClick={() => setLibraryMenuOpen(false)}
                  className="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-[var(--color-kumo-tint)] text-[13px] text-[var(--text-color-kumo-default)] flex items-center justify-between no-underline"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">Account Portal</div>
                    <div className="text-[11px] text-[var(--text-color-kumo-subtle)] truncate">
                      Maxwell@onflow.asia
                    </div>
                  </div>
                  <ArrowUpRight size={13} className="text-[var(--text-color-kumo-subtle)] shrink-0" />
                </Link>
              </div>
            )}
          </div>
        )}

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation sidebar"
            className="size-8 rounded-[8px] hover:bg-[var(--color-kumo-tint)] border-0 bg-transparent flex items-center justify-center text-[var(--text-color-kumo-subtle)] cursor-pointer shrink-0"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Quick Filter Input (`227x32px` Kumo Quick Search bar style) */}
      {!isCollapsedDesktop && (
        <div className="px-3 pt-3 pb-1">
          <div className="w-full h-8 px-2.5 rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] focus-within:border-[var(--color-kumo-brand)] flex items-center justify-between gap-2 transition-colors">
            <Search
              size={14}
              strokeWidth={1.5}
              className="text-[var(--text-color-kumo-subtle)] shrink-0"
            />
            <input
              ref={filterInputRef}
              type="text"
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              placeholder="Quick search..."
              className="w-full bg-transparent border-0 outline-none text-[13px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
            />
            {sidebarFilter ? (
              <button
                type="button"
                onClick={() => setSidebarFilter("")}
                aria-label="Clear filter"
                className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer flex items-center"
              >
                <X size={13} strokeWidth={1.5} />
              </button>
            ) : (
              <kbd className="text-[11px] font-sans text-[var(--text-color-kumo-subtle)] tracking-tight shrink-0">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Kumo Navigation Hierarchy */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
        {/* ================= TOP-LEVEL ITEMS ================= */}
        {[
          {
            key: null,
            label: "Gallery home",
            Icon: Home,
            isActive: activeHierarchyKey === null && !activeNavKey,
            badge: null,
            count: null,
            hasChevron: false,
          },
          {
            key: "recent-releases",
            label: "Recently added",
            Icon: Sparkles,
            isActive: activeHierarchyKey === "recent-releases",
            badge: "New",
            count: null,
            hasChevron: true,
          },
          {
            key: "vietnam",
            label: "Vietnam archive",
            Icon: Globe,
            isActive: activeHierarchyKey === "vietnam",
            badge: null,
            count: null,
            hasChevron: true,
          },
          {
            key: "bookmarks",
            label: "Bookmarks",
            Icon: Bookmark,
            isActive: activeHierarchyKey === "bookmarks",
            badge: null,
            count: bookmarksCount > 0 ? `${bookmarksCount}` : null,
            hasChevron: false,
          },
        ].map((item) => {
          const Icon = item.Icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSelectItem(item.key)}
              title={item.label}
              className={`min-h-[34px] w-full px-3 rounded-[8px] border-0 flex items-center justify-between gap-2.5 text-left text-[13px] font-medium cursor-pointer transition-colors ${
                item.isActive
                  ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                  : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  className={`shrink-0 ${
                    item.isActive
                      ? "opacity-90 text-[var(--text-color-kumo-strong)]"
                      : "opacity-55"
                  }`}
                />
                {!isCollapsedDesktop && (
                  <span className="truncate">{item.label}</span>
                )}
                {!isCollapsedDesktop && item.badge && (
                  <span className="rounded-full px-1.5 py-0.5 text-[11px] leading-none border border-dashed border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] bg-white/70">
                    {item.badge}
                  </span>
                )}
              </span>

              {!isCollapsedDesktop && (
                <span className="flex items-center gap-1.5 shrink-0">
                  {item.count && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px] leading-none border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)] kumo-mono">
                      {item.count}
                    </span>
                  )}
                  {item.hasChevron && (
                    <ChevronRight
                      size={12}
                      strokeWidth={1.5}
                      className="opacity-40 shrink-0"
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}

        {/* ================= GROUP 1: 3D & PBR LIBRARY ================= */}
        {!isCollapsedDesktop && (
          <>
            <div className="mt-4 mb-1.5 px-3 text-[13px] font-medium text-[var(--text-color-kumo-subtle)]">
              3D & PBR library
            </div>

            {/* 1A. 3D Models & Architecture */}
            <button
              type="button"
              onClick={() => setModelsOpen((prev) => !prev)}
              className={`min-h-[34px] w-full px-3 rounded-[8px] border-0 flex items-center justify-between gap-2.5 text-left text-[13px] font-medium cursor-pointer transition-colors ${
                activeHierarchyKey === "historical-artifacts" ||
                activeHierarchyKey === "kitbash-ready"
                  ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                  : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Box size={16} strokeWidth={1.5} className="opacity-55 shrink-0" />
                <span className="truncate">3D Models</span>
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`opacity-40 shrink-0 transition-transform ${
                  modelsOpen ? "" : "-rotate-90"
                }`}
              />
            </button>

            {modelsOpen && (
              <div className="relative pl-7 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[19px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                {[
                  { key: "historical-artifacts", label: "Architectural & Interior" },
                  { key: "kitbash-ready", label: "Modular & Kitbash", badge: "UE5" },
                  { key: "recent-releases", label: "Latest 3D Scans" },
                ].map((sub) => {
                  const isSubActive = activeHierarchyKey === sub.key;
                  return (
                    <button
                      key={sub.key + sub.label}
                      type="button"
                      onClick={() => handleSelectItem(sub.key)}
                      className={`min-h-[32px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors ${
                        isSubActive
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <span className="truncate">{sub.label}</span>
                      {sub.badge && (
                        <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-line)] text-[var(--text-color-kumo-subtle)]">
                          {sub.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 1B. PBR Surfaces */}
            <button
              type="button"
              onClick={() => setMaterialsOpen((prev) => !prev)}
              className={`min-h-[34px] w-full px-3 rounded-[8px] border-0 flex items-center justify-between gap-2.5 text-left text-[13px] font-medium cursor-pointer transition-colors ${
                activeHierarchyKey === "trending-materials" ||
                VIETNAM_MATERIALS_TAXONOMY.some((m) => m.key === activeHierarchyKey)
                  ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                  : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Layers size={16} strokeWidth={1.5} className="opacity-55 shrink-0" />
                <span className="truncate">PBR Surfaces</span>
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`opacity-40 shrink-0 transition-transform ${
                  materialsOpen ||
                  (filterText.length > 0 && filteredMaterials.length > 0)
                    ? ""
                    : "-rotate-90"
                }`}
              />
            </button>

            {(materialsOpen ||
              (filterText.length > 0 && filteredMaterials.length > 0)) && (
              <div className="relative pl-7 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[19px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                <button
                  type="button"
                  onClick={() => handleSelectItem("trending-materials")}
                  className={`min-h-[32px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors ${
                    activeHierarchyKey === "trending-materials"
                      ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                      : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                  }`}
                >
                  <span className="truncate">All Trending Surfaces</span>
                </button>
                {filteredMaterials.map((mat) => {
                  const isActive = activeHierarchyKey === mat.key;
                  const count = counts.materialCounts[mat.key] || 0;
                  return (
                    <button
                      key={mat.key}
                      type="button"
                      onClick={() => handleSelectItem(mat.key)}
                      title={`${mat.name} — ${mat.subtitle}`}
                      className={`min-h-[32px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <span className="truncate">{mat.name}</span>
                      <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)] shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 1C. HDRI Environments */}
            <button
              type="button"
              onClick={() => setHdrisOpen((prev) => !prev)}
              className={`min-h-[34px] w-full px-3 rounded-[8px] border-0 flex items-center justify-between gap-2.5 text-left text-[13px] font-medium cursor-pointer transition-colors ${
                activeHierarchyKey === "discount-hdris" ||
                VIETNAM_HDRIS_TAXONOMY.some((h) => h.key === activeHierarchyKey)
                  ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                  : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Sun size={16} strokeWidth={1.5} className="opacity-55 shrink-0" />
                <span className="truncate">HDRI Skies</span>
                <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)]">
                  -20%
                </span>
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`opacity-40 shrink-0 transition-transform ${
                  hdrisOpen ||
                  (filterText.length > 0 && filteredHdris.length > 0)
                    ? ""
                    : "-rotate-90"
                }`}
              />
            </button>

            {(hdrisOpen ||
              (filterText.length > 0 && filteredHdris.length > 0)) && (
              <div className="relative pl-7 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[19px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                <button
                  type="button"
                  onClick={() => handleSelectItem("discount-hdris")}
                  className={`min-h-[32px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors ${
                    activeHierarchyKey === "discount-hdris"
                      ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                      : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                  }`}
                >
                  <span className="truncate">All 32-bit EXR Skies</span>
                </button>
                {filteredHdris.map((hdri) => {
                  const isActive = activeHierarchyKey === hdri.key;
                  const count = counts.hdriCounts[hdri.key] || 0;
                  return (
                    <button
                      key={hdri.key}
                      type="button"
                      onClick={() => handleSelectItem(hdri.key)}
                      title={`${hdri.name} — ${hdri.provinceHint}`}
                      className={`min-h-[32px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <span className="truncate">{hdri.name}</span>
                      <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)] shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 1D. Free Assets (0 Credits) */}
            <button
              type="button"
              onClick={() => handleSelectItem("free-assets")}
              className={`min-h-[34px] w-full px-3 rounded-[8px] border-0 flex items-center justify-between gap-2.5 text-left text-[13px] font-medium cursor-pointer transition-colors ${
                activeHierarchyKey === "free-assets"
                  ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                  : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Gift size={16} strokeWidth={1.5} className="opacity-55 shrink-0" />
                <span className="truncate">Free Assets</span>
                <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] bg-white/70 inline-flex items-center gap-1">
                  <span>0</span>
                  <CreditIcon size={9} />
                </span>
              </span>
              <ChevronRight size={12} strokeWidth={1.5} className="opacity-40 shrink-0" />
            </button>
          </>
        )}

        {/* ================= GROUP 2: VIETNAM LOCATIONS (3 Regions -> 18 Heritage Sites) ================= */}
        {!isCollapsedDesktop && (
          <>
            <div className="mt-4 mb-1.5 px-3 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[var(--text-color-kumo-subtle)]">
                Vietnam locations
              </span>
              <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
                18 sites
              </span>
            </div>

            {filteredRegions.map((reg) => {
              const isRegionOpen =
                filterText.length > 0 || !!expandedRegions[reg.key];
              const isRegionActive =
                activeHierarchyKey === reg.key ||
                reg.monuments.some((m) => m.key === activeHierarchyKey);

              return (
                <div key={reg.key} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      toggleRegion(reg.key);
                      handleSelectItem(reg.key);
                    }}
                    className={`min-h-[34px] w-full px-3 rounded-[8px] border-0 flex items-center justify-between gap-2.5 text-left text-[13px] font-medium cursor-pointer transition-colors ${
                      activeHierarchyKey === reg.key
                        ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                        : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Landmark
                        size={16}
                        strokeWidth={1.5}
                        className={`shrink-0 ${
                          isRegionActive ? "opacity-85" : "opacity-55"
                        }`}
                      />
                      <span className="truncate">{reg.name}</span>
                    </span>
                    <ChevronDown
                      size={12}
                      strokeWidth={1.5}
                      className={`opacity-40 shrink-0 transition-transform ${
                        isRegionOpen ? "" : "-rotate-90"
                      }`}
                    />
                  </button>

                  {isRegionOpen && (
                    <div className="relative pl-7 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[19px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                      {reg.monuments.map((mon) => {
                        const isSiteActive = activeHierarchyKey === mon.key;
                        const monCount = counts.monumentCounts[mon.key] || 0;
                        return (
                          <button
                            key={mon.key}
                            type="button"
                            onClick={() => handleSelectItem(mon.key)}
                            title={`${mon.name} (${mon.province})`}
                            className={`min-h-[32px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between gap-2 text-left text-[13px] cursor-pointer transition-colors ${
                              isSiteActive
                                ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                                : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                            }`}
                          >
                            <span className="truncate">{mon.name}</span>
                            <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)] shrink-0">
                              {monCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ================= GROUP 3: RESOURCES & WORKSPACE ================= */}
        {!isCollapsedDesktop && (
          <>
            <div className="mt-4 mb-1.5 px-3 text-[13px] font-medium text-[var(--text-color-kumo-subtle)]">
              Workspace & docs
            </div>

            {/* Expandable Knowledge Hub */}
            <button
              type="button"
              onClick={() => setResourcesOpen((prev) => !prev)}
              className={`min-h-[34px] w-full px-3 rounded-[8px] border-0 flex items-center justify-between gap-2.5 text-left text-[13px] font-medium cursor-pointer transition-colors ${
                activeNavKey === "Documentations" ||
                activeNavKey === "Forums" ||
                activeNavKey === "News"
                  ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                  : "bg-transparent text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <FileText size={16} strokeWidth={1.5} className="opacity-55 shrink-0" />
                <span className="truncate">Knowledge Hub</span>
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`opacity-40 shrink-0 transition-transform ${
                  resourcesOpen ? "" : "-rotate-90"
                }`}
              />
            </button>

            {resourcesOpen && (
              <div className="relative pl-7 flex flex-col gap-0.5 before:content-[''] before:absolute before:left-[19px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[var(--color-kumo-line)]">
                {[
                  { key: "Documentations" as const, label: "Pipeline Docs" },
                  { key: "Forums" as const, label: "Community Forums" },
                  { key: "News" as const, label: "Release Notes" },
                ].map((hub) => {
                  const isActive = activeNavKey === hub.key;
                  return (
                    <button
                      key={hub.key}
                      type="button"
                      onClick={() => {
                        onSelectKnowledgeHub(hub.key);
                        onCloseMobile?.();
                      }}
                      className={`min-h-[32px] w-full px-2.5 rounded-[8px] border-0 flex items-center justify-between text-left text-[13px] cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[var(--color-kumo-recessed)] font-medium text-[var(--text-color-kumo-strong)]"
                          : "bg-transparent font-normal text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                      }`}
                    >
                      <span className="truncate">{hub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <Link
              href="/portal?tab=downloads"
              className="min-h-[34px] w-full px-3 rounded-[8px] hover:bg-[var(--color-kumo-tint)] flex items-center justify-between gap-2.5 text-[13px] font-medium text-[var(--text-color-kumo-default)] no-underline transition-colors"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <KeyRound size={16} strokeWidth={1.5} className="opacity-55 shrink-0" />
                <span className="truncate">Bridge & Exports</span>
              </span>
              <ChevronRight size={12} strokeWidth={1.5} className="opacity-40 shrink-0" />
            </Link>

            <Link
              href="/payment"
              className="min-h-[34px] w-full px-3 rounded-[8px] hover:bg-[var(--color-kumo-tint)] flex items-center justify-between gap-2.5 text-[13px] font-medium text-[var(--text-color-kumo-default)] no-underline transition-colors"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <CreditCard size={16} strokeWidth={1.5} className="opacity-55 shrink-0" />
                <span className="truncate">Credits & Pricing</span>
              </span>
              <MoreHorizontal size={13} strokeWidth={1.5} className="opacity-40 shrink-0" />
            </Link>
          </>
        )}
      </nav>

      {/* Bottom 48px Collapse Footer (Exact Cloudflare Kumo sidebar footer) */}
      {!onCloseMobile && (
        <div className="h-12 shrink-0 px-3 border-t border-[var(--color-kumo-line)] flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsedDesktop ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsedDesktop ? "Expand sidebar" : "Collapse sidebar"}
            className="size-[34px] rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
          >
            <PanelLeft size={16} strokeWidth={1.5} />
          </button>
          {!isCollapsedDesktop && (
            <span className="text-[11px] text-[var(--text-color-kumo-subtle)] kumo-mono">
              {counts.total.toLocaleString()} scans
            </span>
          )}
        </div>
      )}
    </div>
  );
}
