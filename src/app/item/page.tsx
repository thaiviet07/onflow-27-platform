"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Menu,
  Scan,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import {
  AssetDetailData,
  DEFAULT_ASSET_DETAIL,
  PanelModule,
} from "@/components/PanelModule";
import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { CreditIcon } from "@/components/CreditIcon";
import { UserMenuDropdown } from "@/components/UserMenuDropdown";
import { CartCheckoutOverlay } from "@/components/CartCheckoutOverlay";
import {
  INITIAL_LOTPIXEL_ITEMS,
  enrichVietnamCatalog,
} from "@/data/lotpixelCatalog";
import { AssetItem } from "@/data/galleryMeta";

const RELATED_ITEMS = INITIAL_LOTPIXEL_ITEMS.slice(0, 12).map((item) => ({
  id: item.uid,
  specimenId: item.id,
  title: item.title,
  credits: item.credits,
  size: item.size,
  categoryLabel: item.categoryLabel,
  monument: item.monument,
  formats: item.formats,
  imgUrl: item.imgUrl,
  item,
}));

const TAGS = [
  "Lowpoly",
  "Vietnam",
  "Quang Tri",
  "Central Vietnam",
  "Architecture",
  "Stone",
  "8K PBR",
  "Nanite Ready",
];

type ViewportChannel = "lit" | "clay" | "wireframe" | "uv";
type DetailSubTab = "overview" | "technical" | "compatibility";

export default function B2ItemMenuPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [relatedStartIndex, setRelatedStartIndex] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [channel, setChannel] = useState<ViewportChannel>("lit");
  const [detailTab, setDetailTab] = useState<DetailSubTab>("overview");
  const [currentAsset, setCurrentAsset] =
    useState<AssetDetailData>(DEFAULT_ASSET_DETAIL);
  const [cartCheckoutOpen, setCartCheckoutOpen] = useState(false);
  const [workspaceCredits, setWorkspaceCredits] = useState(2686);
  const [cartItems, setCartItems] = useState<AssetItem[]>(() =>
    enrichVietnamCatalog(INITIAL_LOTPIXEL_ITEMS.slice(0, 3))
  );

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("onflow_selected_asset");
      if (saved) {
        setCurrentAsset(JSON.parse(saved));
      } else if (INITIAL_LOTPIXEL_ITEMS.length > 0) {
        const first = INITIAL_LOTPIXEL_ITEMS[0];
        setCurrentAsset({
          ...DEFAULT_ASSET_DETAIL,
          id: first.id,
          randname: first.randname,
          imgUrl: first.imgUrl,
          banner: first.banner,
          sourceUrl: first.sourceUrl,
          assetGroup: first.assetGroup,
          categoryLabel: first.categoryLabel,
          subcategoryLabel: first.subcategoryLabel,
          title: first.title,
          location: `${first.monument}`,
          credits: first.credits,
          size: first.size,
          formats: first.formats,
          pathSegments: [
            "Vietnam",
            `/${first.region}`,
            `/${first.monument}`,
            `/${first.categoryLabel}`,
          ],
        });
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const visibleRelatedItems = RELATED_ITEMS.slice(
    relatedStartIndex,
    relatedStartIndex + 3
  );

  const handlePrevRelated = () => {
    setRelatedStartIndex((prev) =>
      prev > 0 ? prev - 1 : Math.max(0, RELATED_ITEMS.length - 3)
    );
  };

  const handleNextRelated = () => {
    setRelatedStartIndex((prev) =>
      prev + 3 < RELATED_ITEMS.length ? prev + 1 : 0
    );
  };

  const filterClass =
    channel === "clay"
      ? "grayscale contrast-125 brightness-105"
      : channel === "wireframe"
      ? "grayscale invert contrast-150 opacity-85"
      : channel === "uv"
      ? "saturate-150 hue-rotate-15"
      : "";

  return (
    <div
      className="kumo-portal bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)] min-h-screen w-full flex flex-col items-center overflow-x-clip"
      data-node-id="1220:11593"
      data-name="[B2] Item Menu"
    >
      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden flex"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="w-[260px] max-w-[85vw] h-full border-r border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)]"
            onClick={(e) => e.stopPropagation()}
          >
            <GallerySidebar
              catalog={INITIAL_LOTPIXEL_ITEMS}
              activeHierarchyKey="vietnam"
              activeNavKey={null}
              bookmarksCount={0}
              onSelectHierarchy={() => {
                setMobileSidebarOpen(false);
                router.push("/");
              }}
              onSelectKnowledgeHub={() => {
                setMobileSidebarOpen(false);
                router.push("/");
              }}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Cloudflare Kumo Side-by-Side Shell: 260px Left Sidebar + Right Column */}
      <div className="w-full min-h-screen flex relative bg-[var(--color-kumo-canvas)]">
        {/* Desktop Full-Height Sticky Kumo Sidebar (`260px` or `60px` collapsed) */}
        <aside
          className={`hidden lg:block shrink-0 border-r border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] transition-[width] duration-150 ${
            sidebarCollapsed ? "w-[60px]" : "w-[260px]"
          }`}
        >
          <div className="sticky top-0 h-screen">
            <GallerySidebar
              catalog={INITIAL_LOTPIXEL_ITEMS}
              activeHierarchyKey="vietnam"
              activeNavKey={null}
              bookmarksCount={0}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              onSelectHierarchy={() => router.push("/")}
              onSelectKnowledgeHub={() => router.push("/")}
            />
          </div>
        </aside>

        {/* Right Column: 58px Aligned Top Header + Split Main/Right-Rail Content + 48px Bottom Footer */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* 58px Kumo Top Header Bar (`--header-height: 58px`, sticky, `border-b border-kumo-line`) */}
          <header
            className="bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] h-[58px] w-full flex items-center justify-between px-4 shrink-0 sticky top-0 z-30 gap-3"
            data-node-id="1220:11594"
            data-name="Header"
          >
            {/* Left: Mobile Menu + Back button + Contextual Breadcrumbs */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden size-8 rounded-[8px] hover:bg-[var(--color-kumo-tint)] border-0 bg-transparent flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer shrink-0"
              >
                <Menu size={17} strokeWidth={1.5} />
              </button>

              <Link
                href="/"
                className="h-8 px-2.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-color-kumo-default)] no-underline shrink-0"
              >
                <ArrowLeft size={13} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
                <span className="hidden sm:inline">Gallery</span>
              </Link>

              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-[13px] min-w-0"
              >
                <Link
                  href="/"
                  className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] no-underline hidden md:inline truncate"
                >
                  {currentAsset.location.trim()}
                </Link>
                <ChevronRight
                  size={13}
                  className="text-[var(--text-color-kumo-subtle)] hidden md:inline shrink-0"
                />
                <span className="hidden xs:inline sm:inline kumo-mono text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[var(--color-kumo-recessed)] border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] shrink-0 whitespace-nowrap">
                  #{currentAsset.id}
                </span>
                <span className="hidden sm:inline font-semibold text-[var(--text-color-kumo-strong)] truncate">
                  {currentAsset.title}
                </span>
              </nav>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden xl:flex flex-1 max-w-[380px] mx-2">
              <div className="w-full h-8 bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] focus-within:border-[var(--color-kumo-brand)] rounded-[8px] flex items-center gap-2 px-3">
                <Search
                  size={14}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push("/");
                    }
                  }}
                  placeholder="Search 3D library..."
                  className="w-full bg-transparent border-0 outline-none text-[13px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="text-[var(--text-color-kumo-subtle)] bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Kumo Utility Strip */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCartCheckoutOpen(true)}
                aria-label="Open export queue cart"
                title="Open export queue cart"
                className="relative h-8 px-2.5 rounded-[8px] border-0 bg-transparent hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer text-[13px] font-medium transition-colors"
              >
                <ShoppingBag
                  size={15}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)]"
                />
                <span className="hidden sm:inline">Cart</span>
                {cartItems.length > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[11px] leading-none bg-[var(--color-kumo-success)] text-white kumo-mono">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <Link
                href="/portal?tab=credits"
                className="bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] transition-colors flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] shrink-0 no-underline"
              >
                <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
                <span className="kumo-mono font-medium text-[12px] text-[var(--text-color-kumo-strong)] whitespace-nowrap inline-flex items-center gap-1">
                  <span>{workspaceCredits.toLocaleString("en-US")}</span>
                  <CreditIcon size={11} />
                </span>
              </Link>

              <UserMenuDropdown
                context="gallery"
                credits={workspaceCredits}
              />
            </div>
          </header>

          {/* Cloudflare Kumo Split Layout (Workers & Pages style: Main Left Column + 420px Right Inspector Rail) */}
          <div
            className="flex-1 flex flex-col xl:flex-row"
            data-node-id="1220:11595"
            data-name="Body"
          >
            {/* Main Left Column (3D Viewport + Segmented Detail Tabs + Tags + Related Items) */}
            <main
              className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 pt-6 pb-10 flex flex-col gap-6"
              data-node-id="1220:11597"
              data-name="Right"
            >
              {/* 1. 3D Stage Card with Kumo Segmented Shader Toolbar */}
              <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden flex flex-col">
                {/* Stage Top Toolbar */}
                <div className="px-4 py-2.5 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12px] text-[var(--text-color-kumo-subtle)]">
                    <Scan size={14} className="text-[var(--color-kumo-brand)]" />
                    <span className="font-medium text-[var(--text-color-kumo-strong)]">
                      3D Specimen Stage
                    </span>
                    <span className="kumo-mono">
                      · {currentAsset.geometryTriangles}
                    </span>
                  </div>

                  {/* Kumo Segmented Shader Switcher */}
                  <div className="max-w-full overflow-x-auto no-scrollbar">
                    <div
                      role="tablist"
                      aria-label="Viewport shader channel"
                      className="inline-flex items-center h-8 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5 whitespace-nowrap"
                    >
                      {(
                        [
                          { id: "lit", label: "PBR Lit" },
                          { id: "clay", label: "Clay Mesh" },
                          { id: "wireframe", label: "Topology" },
                          { id: "uv", label: "Albedo / UV" },
                        ] as const
                      ).map((mode) => {
                        const active = channel === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setChannel(mode.id)}
                            className={`h-7 px-2.5 rounded-[6px] border-0 text-[12px] cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                              active
                                ? "bg-white font-medium text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                                : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                            }`}
                          >
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3D Viewport Canvas */}
                <div
                  className="bg-[#141417] h-[340px] sm:h-[440px] lg:h-[520px] relative w-full overflow-hidden flex items-center justify-center"
                  data-node-id="1220:11598"
                  data-name="3D View"
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {currentAsset.imgUrl && (
                    <img
                      alt={currentAsset.title}
                      src={currentAsset.imgUrl}
                      className={`w-full h-full object-contain transition-all duration-200 ${filterClass}`}
                    />
                  )}

                  {/* Bottom HUD Metadata Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="bg-black/75 border border-white/10 text-white/90 text-[11px] kumo-mono px-2.5 py-1 rounded-[6px] flex items-center gap-2">
                      <span>ID: #{currentAsset.id}</span>
                      {currentAsset.randname && (
                        <>
                          <span className="text-white/30">·</span>
                          <span>Code: {currentAsset.randname}</span>
                        </>
                      )}
                      {currentAsset.sourceUrl && (
                        <>
                          <span className="text-white/30">·</span>
                          <a
                            href={currentAsset.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#3e8eff] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Source scan</span>
                            <ExternalLink size={10} />
                          </a>
                        </>
                      )}
                    </div>

                    <div className="bg-black/75 border border-white/10 text-white/80 text-[11px] kumo-mono px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1.5">
                      <Layers size={11} className="text-[#f6821f]" />
                      <span>Channel: {channel.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Cloudflare Kumo Segmented Tabs for Asset Overview / Technical Details / Compatibility */}
              <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden flex flex-col">
                <div className="px-4 sm:px-5 py-3 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="max-w-full overflow-x-auto no-scrollbar">
                    <div
                      role="tablist"
                      aria-label="Asset documentation sections"
                      className="inline-flex items-center h-9 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5 whitespace-nowrap"
                    >
                      {[
                        { id: "overview" as const, label: "Asset overview" },
                        { id: "technical" as const, label: "Technical details" },
                        { id: "compatibility" as const, label: "Compatibility & license" },
                      ].map((tab) => {
                        const active = detailTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setDetailTab(tab.id)}
                            className={`h-8 px-3 rounded-[6px] border-0 text-[12.5px] sm:text-[13px] cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                              active
                                ? "bg-white font-medium text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                                : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[12px] text-[var(--text-color-kumo-subtle)] kumo-mono">
                    ACEScg calibrated · Real-world scale (cm)
                  </span>
                </div>

                {/* Tab 1: Asset Overview */}
                {detailTab === "overview" && (
                  <div
                    className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px] leading-[20px] text-[var(--text-color-kumo-default)]"
                    data-node-id="1220:11599"
                    data-name="Asset Overview"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Scan & surface summary
                      </h3>
                      <p className="m-0 text-[var(--text-color-kumo-subtle)]">
                        Captured on-site via cross-polarized photogrammetry and terrestrial LiDAR at{" "}
                        <strong className="text-[var(--text-color-kumo-default)] font-medium">
                          {currentAsset.location.trim()}
                        </strong>
                        . Geometry is cleaned with non-overlapping UVs and baked down to multiple LOD tiers for real-time and offline rendering.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Material & shading calibration
                      </h3>
                      <p className="m-0 text-[var(--text-color-kumo-subtle)]">
                        Calibrated PBR texture sets capture weathered mineral veins, surface patina, and micro-roughness variation. Albedo maps are color-checked and de-lit so the asset responds accurately under custom 32-bit HDRI skies.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Geometry & pivot convention
                      </h3>
                      <p className="m-0 text-[var(--text-color-kumo-subtle)]">
                        Pivot is placed at the base center <code className="kumo-mono text-[12px]">(0, 0, 0)</code> in real-world centimeter units (<code className="kumo-mono text-[12px]">metersPerUnit = 0.01</code>) for direct snap-grid placement in architectural and environment scenes.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Pipeline integration
                      </h3>
                      <p className="m-0 text-[var(--text-color-kumo-subtle)]">
                        Exported in FBX, OBJ, glTF/GLB, and OpenUSD formats with LOD0–LOD4 meshes and collision hulls. Ready for Unreal Engine 5 (Nanite or standard LODs), Blender 4.2, Maya, and Unity.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Technical Details (Kumo Structured Spec Grid) */}
                {detailTab === "technical" && (
                  <div
                    className="divide-y divide-[var(--color-kumo-line)] text-[13px]"
                    data-node-id="1220:11600"
                    data-name="Technical Information"
                  >
                    {[
                      { label: "Blueprint / Prefab Assemblies", value: "193 (183 BP + 10 PLA/BPP)" },
                      { label: "Unique Meshes", value: "121 (38 hero meshes + 83 modular kit pieces)" },
                      { label: "Collision Hulls", value: "Yes — auto-generated convex & custom UCX" },
                      { label: "Vertex / Triangle Budget", value: `${currentAsset.geometryTriangles} · ${currentAsset.geometryVertices}` },
                      { label: "LOD Hierarchy", value: "Yes — 5 levels (LOD0 through LOD4)" },
                      { label: "Master Materials & Instances", value: "3 Master Shaders · 15 Calibrated Instances" },
                      { label: "Included Texture Maps", value: "33 maps (Albedo, Normal, Roughness, AO, 16-bit Displacement)" },
                      { label: "Available Resolutions", value: "8192×8192 (EXR), 4096×4096, 2048×2048, 1024×1024" },
                      { label: "Development Platforms", value: "Windows, macOS, Linux (ACEScg / Linear)" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-[var(--color-kumo-overlay)]"
                      >
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          {row.label}
                        </span>
                        <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Compatibility & License */}
                {detailTab === "compatibility" && (
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                    <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-4 flex flex-col gap-2">
                      <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Engine versions
                      </span>
                      <strong className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Unreal Engine 5.0 – 5.5 · Blender 4.2 · Maya 2025
                      </strong>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {currentAsset.formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="kumo-mono text-[10px] uppercase px-1.5 py-0.5 rounded-[4px] bg-white border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)]"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-4 flex flex-col gap-2">
                      <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Distribution & updates
                      </span>
                      <strong className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Onflow Bridge + ZIP Archive
                      </strong>
                      <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Last verified: {currentAsset.publishDate}
                      </span>
                    </div>

                    <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-4 flex flex-col gap-2">
                      <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                        Commercial licensing
                      </span>
                      <strong className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                        {currentAsset.licenseTerms}
                      </strong>
                      <Link
                        href="/portal"
                        className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline no-underline"
                      >
                        View EULA & seat coverage ↗
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Taxonomy Tags Bar */}
              <div
                className="flex flex-wrap items-center gap-2"
                data-node-id="1220:11631"
              >
                <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)] mr-1">
                  Tags:
                </span>
                {TAGS.map((tag) => {
                  const isSelected = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(isSelected ? null : tag)}
                      className={`h-7 px-2.5 rounded-[6px] border text-[12px] cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#3e8eff]/[.10] border-[#3e8eff]/40 text-[var(--text-color-kumo-strong)] font-medium"
                          : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)]"
                      }`}
                      data-name="Tag"
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* 4. More from Collection (3-Column Kumo Card Row) */}
              <div
                className="flex flex-col gap-3.5 pt-2"
                data-node-id="1220:11640"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-[var(--text-color-kumo-strong)] hover:text-[var(--text-color-kumo-link)] no-underline"
                  >
                    <span>More from {currentAsset.location.trim()} Collection</span>
                    <ChevronRight size={16} className="text-[var(--text-color-kumo-subtle)]" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevRelated}
                      aria-label="Previous items"
                      className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      <ChevronLeft size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextRelated}
                      aria-label="Next items"
                      className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      <ChevronRight size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
                  data-node-id="1220:11648"
                >
                  {visibleRelatedItems.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        const nextAsset: AssetDetailData = {
                          ...DEFAULT_ASSET_DETAIL,
                          id: sub.item.id,
                          randname: sub.item.randname,
                          imgUrl: sub.item.imgUrl,
                          banner: sub.item.banner,
                          sourceUrl: sub.item.sourceUrl,
                          assetGroup: sub.item.assetGroup,
                          categoryLabel: sub.item.categoryLabel,
                          subcategoryLabel: sub.item.subcategoryLabel,
                          title: sub.item.title,
                          location: `${sub.item.monument}`,
                          credits: sub.item.credits,
                          size: sub.item.size,
                          formats: sub.item.formats,
                          pathSegments: [
                            "Vietnam",
                            `/${sub.item.region}`,
                            `/${sub.item.monument}`,
                            `/${sub.item.categoryLabel}`,
                          ],
                        };
                        setCurrentAsset(nextAsset);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        try {
                          sessionStorage.setItem(
                            "onflow_selected_asset",
                            JSON.stringify(nextAsset)
                          );
                        } catch {}
                      }}
                      className="group bg-white rounded-[8px] border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] shadow-[var(--shadow-kumo-xs)] overflow-hidden flex flex-col cursor-pointer transition-colors"
                      data-name="sub-itembox"
                    >
                      <div className="bg-[#18181b] h-[156px] relative w-full overflow-hidden">
                        {sub.imgUrl && (
                          <img
                            alt={sub.title}
                            src={sub.imgUrl}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-2 left-2 bg-black/75 text-white/95 kumo-mono text-[11px] px-2 py-0.5 rounded-[6px]">
                          #{sub.specimenId}
                        </span>
                      </div>

                      <div className="p-3 flex flex-col justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="m-0 text-[14px] font-medium text-[var(--text-color-kumo-strong)] group-hover:text-[var(--text-color-kumo-link)] truncate">
                            {sub.title}
                          </h4>
                          <p className="m-0 text-[12px] text-[var(--text-color-kumo-subtle)] truncate">
                            {sub.categoryLabel} · {sub.monument}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[var(--color-kumo-line)] flex items-center justify-between text-[12px] kumo-mono">
                          <span className="font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                            <span>{parseInt(sub.credits.replace(/[^\d]/g, ""), 10) || 0}</span>
                            <CreditIcon size={11} />
                          </span>
                          <span className="text-[var(--text-color-kumo-subtle)]">
                            {sub.size.replace(",", ".")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            {/* Right 420px Kumo Inspector Rail (`border-l border-kumo-line`, holds PanelModule) */}
            <aside
              className="w-full xl:w-[420px] shrink-0 xl:border-l border-t xl:border-t-0 border-[var(--color-kumo-line)] p-6 bg-[var(--color-kumo-canvas)]"
              data-node-id="1220:11652"
            >
              <PanelModule variant="page" asset={currentAsset} />
            </aside>
          </div>

          {/* Cloudflare Kumo 48px Bottom Footer */}
          <footer className="mt-auto min-h-[48px] bg-[var(--color-kumo-canvas)] border-t border-[var(--color-kumo-line)] px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--text-color-kumo-default)]">
            <Link
              href="/"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Gallery Home
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <Link
              href="/portal"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Account Portal
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <Link
              href="/portal?tab=downloads"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Downloads & Bridge
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <Link
              href="/payment"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Pricing & Credits
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <span className="text-[var(--text-color-kumo-subtle)]">
              © 2026 Onflow Asia Co., Ltd.
            </span>
          </footer>
        </div>
      </div>

      <CartCheckoutOverlay
        isOpen={cartCheckoutOpen}
        onClose={() => setCartCheckoutOpen(false)}
        cartItems={cartItems}
        onRemoveItem={(uid) =>
          setCartItems((prev) => prev.filter((it) => it.uid !== uid))
        }
        onClearCart={() => setCartItems([])}
        onAddSampleItems={() =>
          setCartItems(enrichVietnamCatalog(INITIAL_LOTPIXEL_ITEMS.slice(0, 3)))
        }
        workspaceCredits={workspaceCredits}
        onDeductCredits={(amount) =>
          setWorkspaceCredits((prev) => Math.max(0, prev - amount))
        }
      />
    </div>
  );
}
