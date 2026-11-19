"use client";

import React, { useMemo, useState } from "react";
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Search,
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
  onSelectHierarchy: (key: string | null) => void;
  onSelectKnowledgeHub: (hubKey: "Forums" | "Documentations" | "News") => void;
  onCloseMobile?: () => void;
};

export function GallerySidebar({
  catalog,
  activeHierarchyKey,
  activeNavKey,
  bookmarksCount,
  onSelectHierarchy,
  onSelectKnowledgeHub,
  onCloseMobile,
}: GallerySidebarProps) {
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [assetLibOpen, setAssetLibOpen] = useState(true);
  const [vietnamOpen, setVietnamOpen] = useState(true);
  const [expandedRegions, setExpandedRegions] = useState<
    Record<string, boolean>
  >({
    "mien-bac": true,
    "mien-trung": false,
    "mien-nam": false,
  });
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [hdrisOpen, setHdrisOpen] = useState(false);
  const [knowledgeHubOpen, setKnowledgeHubOpen] = useState(true);

  // Compute live counts across Vietnam regions, monuments, materials, and HDRIs
  const counts = useMemo(() => {
    let total = 0;
    const regionCounts: Record<string, number> = {};
    const monumentCounts: Record<string, number> = {};
    const materialCounts: Record<string, number> = {};
    const hdriCounts: Record<string, number> = {};

    for (const item of catalog) {
      if (item.sensitive) continue;
      total += 1;
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
      regionCounts,
      monumentCounts,
      materialCounts,
      hdriCounts,
    };
  }, [catalog]);

  const filterText = sidebarFilter.trim().toLowerCase();

  const allRegionsExpanded = VIETNAM_REGIONS_AND_MONUMENTS.every(
    (r) => expandedRegions[r.key]
  );

  const toggleAllRegions = () => {
    const nextState = !allRegionsExpanded;
    setExpandedRegions({
      "mien-bac": nextState,
      "mien-trung": nextState,
      "mien-nam": nextState,
    });
    if (nextState) setVietnamOpen(true);
  };

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

  return (
    <div className="flex flex-col gap-[20px] w-full">
      {/* Top Title + Mobile Close */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={() => handleSelectItem(null)}
          className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer text-left group"
        >
          <h1 className="leading-[26px] m-0 text-[22px] font-bold font-google-sans text-[#19213d] group-hover:text-[#004bda] transition-colors">
            Gallery
          </h1>
        </button>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation sidebar"
            className="lg:hidden text-[#19213d] size-[28px] flex items-center justify-center rounded-[8px] bg-[#f4f5f7] border border-[#e4e6eb] cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Inline Quick Filter for Locations, Surfaces & HDRIs */}
      <div className="relative w-full">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(25,33,61,0.45)] pointer-events-none"
        />
        <input
          type="text"
          value={sidebarFilter}
          onChange={(e) => setSidebarFilter(e.target.value)}
          placeholder="Filter locations, surfaces, HDRIs..."
          className="w-full h-[34px] pl-8 pr-8 rounded-[9px] border border-[#e4e6eb] bg-[#f8f9fb] focus:bg-white focus:border-[#004bda] outline-none font-sans text-[12px] text-[#19213d] placeholder:text-[rgba(25,33,61,0.45)] transition-colors"
        />
        {sidebarFilter && (
          <button
            type="button"
            onClick={() => setSidebarFilter("")}
            aria-label="Clear sidebar filter"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(25,33,61,0.5)] hover:text-[#19213d] bg-transparent border-0 p-0 cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col gap-[20px] items-stretch w-full">
        {/* 1. Collections & Locations */}
        <div className="flex flex-col gap-[4px] w-full">
          <button
            type="button"
            onClick={() => setAssetLibOpen(!assetLibOpen)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] bg-transparent hover:bg-[#f6f7fa] border-0 cursor-pointer transition-colors"
          >
            <h3 className="m-0 font-google-sans font-bold text-[14px] text-[#19213d] truncate">
              Locations
            </h3>
            <ChevronDown
              size={15}
              className={`text-[rgba(25,33,61,0.6)] transition-transform duration-150 shrink-0 ${
                assetLibOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {(assetLibOpen || filterText.length > 0) && (
            <div className="flex flex-col gap-1 pt-0.5">
              {/* Country Root: Vietnam */}
              <div
                onClick={() => {
                  if (!vietnamOpen) setVietnamOpen(true);
                  handleSelectItem("vietnam");
                }}
                className={`flex items-center justify-between px-2 py-2 rounded-[8px] cursor-pointer transition-colors ${
                  activeHierarchyKey === "vietnam"
                    ? "bg-[#eef4ff] text-[#004bda] ring-1 ring-[#004bda]/30"
                    : "hover:bg-[#f6f7fa] text-[#19213d]"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVietnamOpen(!vietnamOpen);
                    }}
                    aria-label="Toggle Vietnam regions"
                    className="size-5 flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer text-[rgba(25,33,61,0.6)] shrink-0"
                  >
                    {vietnamOpen ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans font-bold text-[12.5px] leading-[16px] truncate">
                      Vietnam
                    </span>
                    <span className="font-sans text-[10.5px] text-[rgba(25,33,61,0.6)] truncate">
                      3 Regions • 18 Locations
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllRegions();
                    }}
                    title={
                      allRegionsExpanded
                        ? "Collapse all regions"
                        : "Expand all 18 locations"
                    }
                    className="text-[10px] font-sans font-semibold text-[#004bda] hover:underline bg-transparent border-0 px-1 cursor-pointer"
                  >
                    {allRegionsExpanded ? "Collapse" : "Expand all"}
                  </button>
                  <span
                    className={`font-sans font-semibold text-[10px] px-2 py-0.5 rounded-[6px] ${
                      activeHierarchyKey === "vietnam"
                        ? "bg-[#004bda] text-white"
                        : "bg-[#eaecef] text-[#19213d]"
                    }`}
                  >
                    {counts.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 3 Regions + 18 Monuments */}
              {(vietnamOpen || filterText.length > 0) &&
                filteredRegions.map((reg) => {
                  const isRegionOpen =
                    filterText.length > 0 || !!expandedRegions[reg.key];
                  const isRegionActive = activeHierarchyKey === reg.key;
                  const regCount = counts.regionCounts[reg.key] || 0;

                  return (
                    <div key={reg.key} className="flex flex-col gap-0.5">
                      {/* Region Row */}
                      <div
                        onClick={() => {
                          if (!expandedRegions[reg.key]) {
                            setExpandedRegions((prev) => ({
                              ...prev,
                              [reg.key]: true,
                            }));
                          }
                          handleSelectItem(reg.key);
                        }}
                        className={`flex items-center justify-between pl-4 pr-2 py-2 rounded-[8px] cursor-pointer transition-colors ${
                          isRegionActive
                            ? "bg-[#eef4ff] text-[#004bda] ring-1 ring-[#004bda]/30"
                            : "hover:bg-[#f6f7fa] text-[#19213d]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRegion(reg.key);
                            }}
                            aria-label={`Expand ${reg.name}`}
                            className="size-5 flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer text-[rgba(25,33,61,0.55)] shrink-0"
                          >
                            {isRegionOpen ? (
                              <ChevronDown size={13} />
                            ) : (
                              <ChevronRight size={13} />
                            )}
                          </button>
                          <div className="flex flex-col min-w-0">
                            <span className="font-sans font-bold text-[12px] leading-[15px] truncate">
                              {reg.name}
                            </span>
                            <span className="font-sans text-[10px] text-[rgba(25,33,61,0.58)] truncate">
                              {reg.subLabel}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-sans font-semibold text-[10px] px-2 py-0.5 rounded-[6px] shrink-0 ${
                            isRegionActive
                              ? "bg-[#004bda] text-white"
                              : "bg-[#eaecef] text-[#19213d]"
                          }`}
                        >
                          {regCount.toLocaleString()}
                        </span>
                      </div>

                      {/* Nested Monuments */}
                      {isRegionOpen && (
                        <div className="flex flex-col gap-0.5 pl-6 pr-1 py-0.5 border-l border-[#e4e6eb] ml-5">
                          {reg.monuments.map((mon) => {
                            const isSiteActive = activeHierarchyKey === mon.key;
                            const monCount =
                              counts.monumentCounts[mon.key] || 0;
                            return (
                              <button
                                key={mon.key}
                                type="button"
                                onClick={() => handleSelectItem(mon.key)}
                                className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[8px] border-0 cursor-pointer text-left transition-colors ${
                                  isSiteActive
                                    ? "bg-[#eef4ff] text-[#004bda] ring-1 ring-[#004bda]/30"
                                    : "bg-transparent hover:bg-[#f6f7fa] text-[#19213d]"
                                }`}
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="font-sans font-semibold text-[11.5px] leading-[15px] truncate">
                                    {mon.name}
                                  </span>
                                  <span className="font-sans text-[10px] leading-[13px] text-[rgba(25,33,61,0.58)] truncate">
                                    {mon.province}
                                  </span>
                                </div>
                                <span
                                  className={`font-sans font-semibold text-[10px] px-1.5 py-0.5 rounded-[5px] shrink-0 ${
                                    isSiteActive
                                      ? "bg-[#004bda] text-white"
                                      : "bg-[#f0f2f5] text-[rgba(25,33,61,0.8)]"
                                  }`}
                                >
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
            </div>
          )}
        </div>

        {/* 2. Surfaces */}
        <div className="flex flex-col gap-[4px] w-full">
          <button
            type="button"
            onClick={() => setMaterialsOpen(!materialsOpen)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] bg-transparent hover:bg-[#f6f7fa] border-0 cursor-pointer transition-colors"
          >
            <h3 className="m-0 font-google-sans font-bold text-[14px] text-[#19213d] truncate">
              Surfaces
            </h3>
            <ChevronDown
              size={15}
              className={`text-[rgba(25,33,61,0.6)] transition-transform duration-150 shrink-0 ${
                materialsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {(materialsOpen ||
            (filterText.length > 0 && filteredMaterials.length > 0)) && (
            <div className="flex flex-col gap-0.5 pt-0.5">
              {filteredMaterials.map((mat) => {
                const isActive = activeHierarchyKey === mat.key;
                const count = counts.materialCounts[mat.key] || 0;
                return (
                  <button
                    key={mat.key}
                    type="button"
                    onClick={() => handleSelectItem(mat.key)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[8px] border-0 cursor-pointer text-left transition-colors ${
                      isActive
                        ? "bg-[#eef4ff] text-[#004bda] ring-1 ring-[#004bda]/30"
                        : "bg-transparent hover:bg-[#f6f7fa] text-[#19213d]"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans font-semibold text-[11.5px] leading-[15px] truncate">
                        {mat.name}
                      </span>
                      <span className="font-sans text-[10px] leading-[13px] text-[rgba(25,33,61,0.58)] truncate">
                        {mat.subtitle}
                      </span>
                    </div>
                    <span
                      className={`font-sans font-semibold text-[10px] px-1.5 py-0.5 rounded-[5px] shrink-0 ${
                        isActive
                          ? "bg-[#004bda] text-white"
                          : "bg-[#f0f2f5] text-[rgba(25,33,61,0.8)]"
                      }`}
                    >
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. HDRIs */}
        <div className="flex flex-col gap-[4px] w-full">
          <button
            type="button"
            onClick={() => setHdrisOpen(!hdrisOpen)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] bg-transparent hover:bg-[#f6f7fa] border-0 cursor-pointer transition-colors"
          >
            <h3 className="m-0 font-google-sans font-bold text-[14px] text-[#19213d] truncate">
              HDRIs
            </h3>
            <ChevronDown
              size={15}
              className={`text-[rgba(25,33,61,0.6)] transition-transform duration-150 shrink-0 ${
                hdrisOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {(hdrisOpen ||
            (filterText.length > 0 && filteredHdris.length > 0)) && (
            <div className="flex flex-col gap-0.5 pt-0.5">
              {filteredHdris.map((hdri) => {
                const isActive = activeHierarchyKey === hdri.key;
                const count = counts.hdriCounts[hdri.key] || 0;
                return (
                  <button
                    key={hdri.key}
                    type="button"
                    onClick={() => handleSelectItem(hdri.key)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[8px] border-0 cursor-pointer text-left transition-colors ${
                      isActive
                        ? "bg-[#eef4ff] text-[#004bda] ring-1 ring-[#004bda]/30"
                        : "bg-transparent hover:bg-[#f6f7fa] text-[#19213d]"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans font-semibold text-[11.5px] leading-[15px] truncate">
                        {hdri.name}
                      </span>
                      <span className="font-sans text-[10px] leading-[13px] text-[rgba(25,33,61,0.58)] truncate">
                        {hdri.provinceHint}
                      </span>
                    </div>
                    <span
                      className={`font-sans font-semibold text-[10px] px-1.5 py-0.5 rounded-[5px] shrink-0 ${
                        isActive
                          ? "bg-[#004bda] text-white"
                          : "bg-[#f0f2f5] text-[rgba(25,33,61,0.8)]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Resources */}
        <div className="flex flex-col gap-[4px] w-full">
          <button
            type="button"
            onClick={() => setKnowledgeHubOpen(!knowledgeHubOpen)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] bg-transparent hover:bg-[#f6f7fa] border-0 cursor-pointer transition-colors"
          >
            <h3 className="m-0 font-google-sans font-bold text-[14px] text-[#19213d]">
              Resources
            </h3>
            <ChevronDown
              size={15}
              className={`text-[rgba(25,33,61,0.6)] transition-transform duration-150 shrink-0 ${
                knowledgeHubOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {knowledgeHubOpen && (
            <div className="flex flex-col gap-0.5 pt-0.5">
              {[
                {
                  key: "Forums" as const,
                  label: "Community Forums",
                  icon: "/assets/nav_forums_glyph.svg",
                  count: "15",
                },
                {
                  key: "Documentations" as const,
                  label: "Documentation",
                  icon: "/assets/nav_docs_glyph.svg",
                  count: "50",
                },
                {
                  key: "News" as const,
                  label: "Release Notes & News",
                  icon: "/assets/nav_news_glyph.svg",
                  count: "50",
                },
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] border-0 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#eef4ff] text-[#004bda]"
                        : "bg-transparent hover:bg-[#f6f7fa] text-[#19213d]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        alt=""
                        src={hub.icon}
                        width={16}
                        height={16}
                        className="shrink-0"
                      />
                      <span className="font-sans font-semibold text-[12px] truncate">
                        {hub.label}
                      </span>
                    </div>
                    <span
                      className={`font-sans font-semibold text-[10px] px-2 py-0.5 rounded-[5px] shrink-0 ${
                        isActive
                          ? "bg-[#004bda] text-white"
                          : "bg-[#eaecef] text-[#19213d]"
                      }`}
                    >
                      {hub.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Bookmarks */}
        <button
          type="button"
          onClick={() => handleSelectItem("bookmarks")}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[8px] border-0 cursor-pointer transition-colors ${
            activeHierarchyKey === "bookmarks"
              ? "bg-[#eef4ff] text-[#004bda]"
              : "bg-transparent hover:bg-[#f6f7fa] text-[#19213d]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark
              size={15}
              className={
                activeHierarchyKey === "bookmarks" ? "fill-[#004bda]" : ""
              }
            />
            <span className="font-sans font-bold text-[12.5px]">
              Bookmarks
            </span>
          </div>
          <span
            className={`font-sans font-bold text-[10.5px] px-2 py-0.5 rounded-[6px] ${
              activeHierarchyKey === "bookmarks" || bookmarksCount > 0
                ? "bg-[#004bda] text-white"
                : "bg-[#eaecef] text-[#19213d]"
            }`}
          >
            {bookmarksCount}
          </span>
        </button>
      </div>
    </div>
  );
}
