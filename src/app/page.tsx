"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  Blocks,
  Bookmark,
  Box,
  ChevronLeft,
  ChevronRight,
  Globe,
  Landmark,
  Layers,
  Plug,
  Search,
  ShoppingBag,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";
import { ItemMenuOverlay } from "@/components/ItemMenuOverlay";
import { CreditIcon } from "@/components/CreditIcon";
import { UserMenuDropdown } from "@/components/UserMenuDropdown";
import {
  CartCheckoutOverlay,
  CartCheckoutScenario,
} from "@/components/CartCheckoutOverlay";
import {
  AssetDetailData,
  DEFAULT_ASSET_DETAIL,
} from "@/components/PanelModule";
import { EndlessCardGrid } from "@/components/gallery/EndlessCardGrid";
import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { HierarchySectionView } from "@/components/gallery/HierarchySectionView";
import { ItemBox } from "@/components/gallery/ItemBox";
import {
  AssetItem,
  CATEGORY_PILLS,
  DOCUMENTATION_SLIDES,
  FEATURED_COLLECTIONS,
  FORUM_SLIDES,
  HIERARCHY_SECTIONS,
  HierarchySectionMeta,
  resolveHierarchyKey,
} from "@/data/galleryMeta";
import {
  INITIAL_LOTPIXEL_ITEMS,
  LOTPIXEL_CATEGORY_TAXONOMY,
  LotpixelAssetItem,
  enrichVietnamCatalog,
} from "@/data/lotpixelCatalog";

export type { AssetItem, HierarchySectionMeta };

const DEFAULT_ASSETS: AssetItem[] = INITIAL_LOTPIXEL_ITEMS.slice(0, 4);

const HERO_CAROUSEL_IMAGES = [
  "/assets/hero_img2.png",
  "/assets/hero_img4.png",
  "/assets/hero_img3.png",
];

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  "historical-3d": Landmark,
  "general-3d": Box,
  "materials-textures": Layers,
  hdris: Sun,
  "kitbash-3d": Blocks,
  "sdk-api": Plug,
};

const EMPTY_STRING_ARRAY: string[] = [];
const storageCache = new Map<string, { raw: string | null; parsed: string[] }>();

function readStorageArray(key: string): string[] {
  if (typeof window === "undefined") return EMPTY_STRING_ARRAY;
  try {
    const raw = window.localStorage.getItem(key);
    const cached = storageCache.get(key);
    if (cached && cached.raw === raw) {
      return cached.parsed;
    }
    const parsedRaw = raw ? JSON.parse(raw) : EMPTY_STRING_ARRAY;
    const parsed = Array.isArray(parsedRaw) ? parsedRaw : EMPTY_STRING_ARRAY;
    storageCache.set(key, { raw, parsed });
    return parsed;
  } catch {
    return EMPTY_STRING_ARRAY;
  }
}

function writeStorageArray(key: string, next: string[]) {
  if (typeof window === "undefined") return;
  try {
    if (next.length === 0) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(next));
    }
    window.dispatchEvent(new CustomEvent("onflow-storage", { detail: { key } }));
  } catch {
    // ignore storage errors
  }
}

function useStorageIdList(key: string): string[] {
  return useSyncExternalStore(
    (onStoreChange) => {
      const handleStorage = (e: StorageEvent) => {
        if (!e.key || e.key === key) onStoreChange();
      };
      const handleCustom = (e: Event) => {
        const detail = (e as CustomEvent<{ key?: string }>).detail;
        if (!detail?.key || detail.key === key) onStoreChange();
      };
      window.addEventListener("storage", handleStorage);
      window.addEventListener("onflow-storage", handleCustom);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("onflow-storage", handleCustom);
      };
    },
    () => readStorageArray(key),
    () => EMPTY_STRING_ARRAY
  );
}

function AssetSectionRow({
  title,
  subtitle,
  items = DEFAULT_ASSETS,
  onSelectItem,
  onClickTitle,
  bookmarkedSet,
  cartSet,
  onToggleBookmark,
  onToggleCart,
}: {
  title: string;
  subtitle?: string;
  items?: AssetItem[];
  onSelectItem: (item: AssetItem) => void;
  onClickTitle?: () => void;
  bookmarkedSet: Set<string>;
  cartSet: Set<string>;
  onToggleBookmark: (uid: string) => void;
  onToggleCart: (uid: string) => void;
}) {
  const [offset, setOffset] = useState(0);

  const safeItems = items.length > 0 ? items : DEFAULT_ASSETS;
  const visibleCount = Math.min(4, safeItems.length);
  const rotatedItems = Array.from({ length: visibleCount }, (_, idx) => {
    return safeItems[(idx + offset) % safeItems.length];
  });

  return (
    <section className="flex flex-col gap-3.5 items-center relative w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex flex-col gap-0.5 min-w-0">
          <button
            type="button"
            onClick={onClickTitle}
            className="flex gap-1.5 items-center bg-transparent border-0 p-0 cursor-pointer group text-left"
          >
            <h2 className="leading-[24px] m-0 font-semibold text-[16px] sm:text-[18px] tracking-[-0.01em] text-[var(--text-color-kumo-strong)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150">
              {title}
            </h2>
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              className="text-[var(--text-color-kumo-subtle)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150"
            />
          </button>
          {subtitle && (
            <p className="m-0 text-[13px] leading-[19px] text-[var(--text-color-kumo-subtle)]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onClickTitle && (
            <button
              type="button"
              onClick={onClickTitle}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 bg-white hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] rounded-[8px] px-3 font-medium text-[12px] cursor-pointer transition-colors duration-150"
            >
              <span>View all</span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setOffset(
                (prev) => (prev - 4 + safeItems.length) % safeItems.length
              )
            }
            aria-label={`Previous ${title}`}
            className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
          >
            <ChevronLeft size={15} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setOffset((prev) => (prev + 4) % safeItems.length)}
            aria-label={`Next ${title}`}
            className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
          >
            <ChevronRight size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start relative shrink-0 w-full">
        {rotatedItems.map((item, idx) => (
          <ItemBox
            key={`${item.uid}-${idx}`}
            item={item}
            onSelect={onSelectItem}
            isBookmarked={bookmarkedSet.has(item.uid)}
            isInCart={cartSet.has(item.uid)}
            onToggleBookmark={onToggleBookmark}
            onToggleCart={onToggleCart}
          />
        ))}
      </div>
    </section>
  );
}

export default function GalleryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavKey, setActiveNavKey] = useState<string | null>(null);
  const [activeHierarchyKey, setActiveHierarchyKey] = useState<string | null>(
    null
  );

  // Main content interactive states
  const [activeCategoryPill, setActiveCategoryPill] = useState<string | null>(
    null
  );
  const [activeLotpixelCluster, setActiveLotpixelCluster] =
    useState<string>("all");
  const [activeLotpixelSubcat, setActiveLotpixelSubcat] =
    useState<string>("all");
  const [catalog, setCatalog] = useState<AssetItem[]>(INITIAL_LOTPIXEL_ITEMS);
  const [fullCatalogLoaded, setFullCatalogLoaded] = useState(false);

  // Carousels
  const [heroStep, setHeroStep] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [docSlideIndex, setDocSlideIndex] = useState(0);
  const [forumSlideIndex, setForumSlideIndex] = useState(0);

  // Personalization & Cart states
  const bookmarkedUids = useStorageIdList("onflow_bookmarks");
  const cartUids = useStorageIdList("onflow_cart");
  const [cartPopoverOpen, setCartPopoverOpen] = useState(false);
  const [cartCheckoutOpen, setCartCheckoutOpen] = useState(false);
  const [cartCheckoutScenario, setCartCheckoutScenario] =
    useState<CartCheckoutScenario>("sufficient");
  const [workspaceCredits, setWorkspaceCredits] = useState(2686);
  const [unlockedUids, setUnlockedUids] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Overlay modal state
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedOverlayAsset, setSelectedOverlayAsset] =
    useState<AssetDetailData>(DEFAULT_ASSET_DETAIL);

  const knowledgeHubRef = useRef<HTMLElement | null>(null);
  const explorerRef = useRef<HTMLElement | null>(null);
  const cartPopoverRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  // Load & enrich full 6,154 catalog
  useEffect(() => {
    let cancelled = false;
    fetch("/data/lotpixel_catalog.json")
      .then((res) => res.json())
      .then((data: LotpixelAssetItem[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCatalog(enrichVietnamCatalog(data));
          setFullCatalogLoaded(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll listener for Back to Top button
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 520);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close cart popover on outside click
  useEffect(() => {
    if (!cartPopoverOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        cartPopoverRef.current &&
        !cartPopoverRef.current.contains(e.target as Node)
      ) {
        setCartPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [cartPopoverOpen]);

  const bookmarkedSet = useMemo(
    () => new Set(bookmarkedUids),
    [bookmarkedUids]
  );
  const cartSet = useMemo(() => new Set(cartUids), [cartUids]);

  const handleToggleBookmark = (uid: string) => {
    const exists = bookmarkedUids.includes(uid);
    const next = exists
      ? bookmarkedUids.filter((id) => id !== uid)
      : [...bookmarkedUids, uid];
    writeStorageArray("onflow_bookmarks", next);
    showToast(exists ? "Removed from Saved Bookmarks" : "Saved to Bookmarks");
  };

  const handleToggleCart = (uid: string) => {
    const exists = cartUids.includes(uid);
    const next = exists
      ? cartUids.filter((id) => id !== uid)
      : [...cartUids, uid];
    writeStorageArray("onflow_cart", next);
    showToast(exists ? "Removed from cart" : "Added asset to cart");
  };

  const cartItems = useMemo(() => {
    if (cartUids.length === 0) return [];
    const byUid = new Map(catalog.map((it) => [it.uid, it]));
    return cartUids
      .map((uid) => byUid.get(uid))
      .filter((x): x is AssetItem => Boolean(x));
  }, [catalog, cartUids]);

  const cartTotalCredits = useMemo(() => {
    return cartItems.reduce((sum, it) => {
      if (it.isFree) return sum;
      const num = parseInt(it.credits, 10);
      return sum + (isNaN(num) ? 4 : num);
    }, 0);
  }, [cartItems]);

  // Synchronize Category Pill clicks with the Catalog Cluster
  const handleSelectCategoryPill = (pillId: string) => {
    const nextPill = activeCategoryPill === pillId ? null : pillId;
    setActiveCategoryPill(nextPill);
    setActiveLotpixelSubcat("all");
    if (!nextPill) {
      setActiveLotpixelCluster("all");
    } else if (nextPill === "historical-3d" || nextPill === "general-3d") {
      setActiveLotpixelCluster("3d-models");
    } else if (nextPill === "materials-textures") {
      setActiveLotpixelCluster("textures");
    } else if (nextPill === "hdris") {
      setActiveLotpixelCluster("hdris");
    } else if (nextPill === "kitbash-3d") {
      setActiveLotpixelCluster("3d-models");
    } else if (nextPill === "sdk-api") {
      setActiveLotpixelCluster("all");
    }
  };

  // Curated Section Rows for Main Gallery View
  const recentReleaseItems = useMemo(
    () =>
      catalog
        .filter((it) => !it.sensitive && it.assetGroup === "3d-models")
        .slice(0, 32),
    [catalog]
  );

  const historicalArtifactItems = useMemo(
    () =>
      catalog
        .filter(
          (it) =>
            !it.sensitive &&
            (it.pillCategory === "historical-3d" ||
              it.categorySlug === "interior-3d-models" ||
              it.categorySlug === "nature-3d-models")
        )
        .slice(0, 36),
    [catalog]
  );

  const trendingTextureItems = useMemo(
    () =>
      catalog
        .filter(
          (it) =>
            !it.sensitive &&
            it.assetGroup === "textures" &&
            [
              "stone-textures",
              "wood-textures",
              "tile-textures",
              "metal-textures",
              "brick-textures",
            ].includes(it.categorySlug)
        )
        .slice(0, 48),
    [catalog]
  );

  const hdriEnvironmentItems = useMemo(
    () =>
      catalog
        .filter((it) => !it.sensitive && it.pillCategory === "hdris")
        .slice(0, 36),
    [catalog]
  );

  const kitbashReadyItems = useMemo(
    () =>
      catalog
        .filter(
          (it) =>
            !it.sensitive &&
            (it.pillCategory === "kitbash-3d" ||
              [
                "industrial-3d-models",
                "street-3d-models",
                "building-3d-models",
              ].includes(it.categorySlug))
        )
        .slice(0, 48),
    [catalog]
  );

  const freeLimitedItems = useMemo(
    () => catalog.filter((it) => !it.sensitive && it.isFree).slice(0, 48),
    [catalog]
  );

  const explorerFilteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalog.filter((it) => {
      if (it.sensitive) return false;

      if (activeCategoryPill && it.pillCategory !== activeCategoryPill) {
        if (
          !(
            (activeCategoryPill === "materials-textures" &&
              it.assetGroup === "textures") ||
            (activeCategoryPill === "hdris" && it.pillCategory === "hdris")
          )
        ) {
          return false;
        }
      }

      if (activeLotpixelCluster === "3d-models" && it.assetGroup !== "3d-models")
        return false;
      if (activeLotpixelCluster === "textures" && it.assetGroup !== "textures")
        return false;
      if (activeLotpixelCluster === "hdris" && it.pillCategory !== "hdris")
        return false;

      if (activeLotpixelSubcat !== "all") {
        if (
          it.categorySlug !== activeLotpixelSubcat &&
          it.subcategorySlug !== activeLotpixelSubcat
        ) {
          return false;
        }
      }

      if (q) {
        const hay =
          `${it.title} ${it.id} ${it.categoryLabel} ${it.subcategoryLabel} ${it.monument} ${it.province || ""} ${it.region} ${it.era || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [
    catalog,
    activeCategoryPill,
    activeLotpixelCluster,
    activeLotpixelSubcat,
    searchQuery,
  ]);

  // Enrich featured collections with live preview thumbnails and monument asset counts
  const enrichedFeaturedCollections = useMemo(() => {
    return FEATURED_COLLECTIONS.map((col) => {
      const matching = catalog.filter(
        (it) => !it.sensitive && it.monumentKey === col.targetKey
      );
      const images = [0, 1, 2, 3].map(
        (idx) => matching[idx]?.imgUrl || col.fallbackImages[idx]
      );
      return {
        ...col,
        count: matching.length,
        images,
      };
    });
  }, [catalog]);

  const featuredPageCount = Math.ceil(enrichedFeaturedCollections.length / 3);
  const visibleFeaturedCollections = enrichedFeaturedCollections.slice(
    featuredPage * 3,
    featuredPage * 3 + 3
  );

  const handleSelectHierarchy = (rawKey: string | null) => {
    const resolved = resolveHierarchyKey(rawKey);
    setActiveHierarchyKey(resolved);
    setActiveNavKey(resolved);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectKnowledgeHub = (
    hubKey: "Forums" | "Documentations" | "News"
  ) => {
    setActiveHierarchyKey(null);
    setActiveNavKey(hubKey);
    setTimeout(() => {
      knowledgeHubRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 60);
  };

  const handleOpenItemOverlay = (item: AssetItem) => {
    const activeSection = activeHierarchyKey
      ? HIERARCHY_SECTIONS[activeHierarchyKey]
      : null;

    const pathSegments = activeSection
      ? [
          ...activeSection.pathSegments
            .slice(1)
            .map((s, idx) =>
              idx === 0 ? s.label.replace(/^\//, "") : s.label
            ),
          `/${item.categoryLabel || "Object"}`,
        ]
      : [
          "Vietnam",
          `/${item.region || "Central Vietnam"}`,
          `/${item.monument || "Quang Tri Ancient Citadel"}`,
          `/${item.categoryLabel || "Object"}`,
        ];

    const detailData: AssetDetailData = {
      ...DEFAULT_ASSET_DETAIL,
      id: item.id,
      randname: item.randname,
      imgUrl: item.imgUrl,
      banner: item.banner,
      sourceUrl: item.sourceUrl,
      assetGroup: item.assetGroup,
      categoryLabel: item.categoryLabel,
      subcategoryLabel: item.subcategoryLabel,
      title: item.title,
      location: `${item.monument}${item.province ? ` (${item.province})` : ""} `,
      year: item.eraDetail || DEFAULT_ASSET_DETAIL.year,
      credits: item.credits,
      size: item.size,
      formats: item.formats,
      diskSize: item.size,
      textureFormat: item.formats.includes("png") ? "PNG / WebP" : "JPG / PNG",
      pathSegments,
    };

    setSelectedOverlayAsset(detailData);
    try {
      sessionStorage.setItem(
        "onflow_selected_asset",
        JSON.stringify(detailData)
      );
    } catch {}
    setOverlayOpen(true);
  };

  const handleExpandToItemPage = () => {
    setOverlayOpen(false);
    router.push("/item");
  };

  const activeHierarchyMeta = activeHierarchyKey
    ? HIERARCHY_SECTIONS[activeHierarchyKey] ?? null
    : null;

  // Auto-advance hero bento carousel
  useEffect(() => {
    if (heroPaused || activeHierarchyMeta) return;
    const timer = setInterval(() => {
      setHeroStep((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroPaused, activeHierarchyMeta]);

  const quickBrowseResetKey = `quick|${activeCategoryPill || "none"}|${activeLotpixelCluster}|${activeLotpixelSubcat}|${searchQuery}`;
  const explorerResetKey = `explorer|${activeCategoryPill || "none"}|${activeLotpixelCluster}|${activeLotpixelSubcat}|${searchQuery}`;

  const currentDocSlide =
    DOCUMENTATION_SLIDES[docSlideIndex % DOCUMENTATION_SLIDES.length];
  const currentForumSlide =
    FORUM_SLIDES[forumSlideIndex % FORUM_SLIDES.length];

  return (
    <div className="kumo-portal bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)] min-h-screen w-full flex flex-col items-center overflow-x-clip">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--text-color-kumo-strong)] text-white px-3.5 py-2 rounded-[8px] shadow-[var(--shadow-kumo-md)] border border-white/10 flex items-center gap-2 text-[13px] font-normal">
          <span className="size-2 rounded-full bg-[#3e8eff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-16 right-6 z-40 inline-flex items-center gap-1.5 h-8 bg-[var(--text-color-kumo-strong)] hover:bg-[var(--color-kumo-brand)] text-white font-medium text-[12px] px-3 rounded-[8px] shadow-[var(--shadow-kumo-md)] border border-white/10 cursor-pointer transition-colors duration-150"
        >
          <ArrowUp size={13} strokeWidth={1.5} />
          <span className="hidden sm:inline">Top</span>
        </button>
      )}

      {/* Mobile Drawer Sidebar */}
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
              catalog={catalog}
              activeHierarchyKey={activeHierarchyKey}
              activeNavKey={activeNavKey}
              bookmarksCount={bookmarkedUids.length}
              onSelectHierarchy={handleSelectHierarchy}
              onSelectKnowledgeHub={handleSelectKnowledgeHub}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Cloudflare Kumo Side-by-Side Shell: 260px Left Sidebar + Right Column (58px Header + Content + 48px Footer) */}
      <div className="w-full min-h-screen flex relative bg-[var(--color-kumo-canvas)]">
        {/* Desktop Full-Height Sticky Kumo Sidebar (`--sidebar-nav-width: 260px` or `60px` collapsed) */}
        <aside
          className={`hidden lg:block shrink-0 border-r border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] transition-[width] duration-150 ${
            sidebarCollapsed ? "w-[60px]" : "w-[260px]"
          }`}
        >
          <div className="sticky top-0 h-screen">
            <GallerySidebar
              catalog={catalog}
              activeHierarchyKey={activeHierarchyKey}
              activeNavKey={activeNavKey}
              bookmarksCount={bookmarkedUids.length}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              onSelectHierarchy={handleSelectHierarchy}
              onSelectKnowledgeHub={handleSelectKnowledgeHub}
            />
          </div>
        </aside>

        {/* Right Column: 58px Aligned Top Header + Main Content + 48px Bottom Footer */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* 58px Kumo Top Header Bar (`--header-height: 58px`, sticky, `border-b border-kumo-line`) */}
          <header className="bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] h-[58px] w-full flex items-center justify-between px-4 shrink-0 sticky top-0 z-30 gap-3">
            {/* Left: Mobile Hamburger + Breadcrumbs / Top Nav */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Open navigation menu"
                className="lg:hidden size-8 rounded-[8px] hover:bg-[var(--color-kumo-tint)] border-0 bg-transparent flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer shrink-0"
              >
                <div className="w-4 flex flex-col gap-1">
                  <span className="h-[1.5px] w-full bg-current rounded-full" />
                  <span className="h-[1.5px] w-full bg-current rounded-full" />
                  <span className="h-[1.5px] w-full bg-current rounded-full" />
                </div>
              </button>

              {activeHierarchyMeta ? (
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-1.5 text-[14px] truncate"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectHierarchy(null)}
                    className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer truncate"
                  >
                    3D Library
                  </button>
                  <ChevronRight
                    size={13}
                    className="text-[var(--text-color-kumo-subtle)] shrink-0"
                  />
                  <span className="font-semibold text-[var(--text-color-kumo-strong)] truncate">
                    {activeHierarchyMeta.collectionTitle}
                  </span>
                </nav>
              ) : (
                <div className="hidden sm:flex items-center gap-1">
                  <div
                    role="tablist"
                    className="inline-flex items-center h-8 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectHierarchy(null)}
                      className={`h-7 px-2.5 rounded-[6px] border-0 cursor-pointer text-[13px] transition-colors whitespace-nowrap ${
                        activeHierarchyKey === null
                          ? "bg-white text-[var(--text-color-kumo-strong)] font-medium shadow-[var(--shadow-kumo-xs)]"
                          : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                      }`}
                    >
                      Discover
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectHierarchy("vietnam")}
                      className="h-7 px-2.5 rounded-[6px] border-0 bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer text-[13px] transition-colors whitespace-nowrap"
                    >
                      Locations
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectHierarchy("free-assets")}
                      className="h-7 px-2.5 rounded-[6px] border-0 bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer text-[13px] hidden md:inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <span>Free</span>
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                        <span>0</span>
                        <CreditIcon size={9} />
                      </span>
                    </button>
                  </div>
                </div>
              )}
              {!activeHierarchyMeta && (
                <span className="sm:hidden text-[14px] font-semibold text-[var(--text-color-kumo-strong)] whitespace-nowrap">
                  Onflow
                </span>
              )}
            </div>

            {/* Center: Cloudflare Kumo Recessed Search Well (lg+ inline; mobile & tablet use full-width sub-bar) */}
            <div className="hidden lg:flex flex-1 max-w-[460px] mx-2">
              <div className="w-full h-8 bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] focus-within:border-[var(--color-kumo-brand)] rounded-[8px] flex items-center gap-2 px-3 transition-colors">
                <Search
                  size={14}
                  strokeWidth={1.5}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 5,440+ 3D models, PBR surfaces, HDRIs..."
                  className="w-full bg-transparent border-0 outline-none text-[13px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search query"
                    className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center"
                  >
                    <X size={13} strokeWidth={1.5} />
                  </button>
                ) : (
                  <kbd className="text-[11px] text-[var(--text-color-kumo-subtle)] shrink-0">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Right: Kumo Utility Strip (Bookmarks + Cart + Pricing + Credits Pill + Portal) */}
            <div className="flex gap-1.5 items-center justify-end relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleSelectHierarchy(
                    activeHierarchyKey === "bookmarks" ? null : "bookmarks"
                  )
                }
                aria-label="Saved bookmarks"
                title="Saved bookmarks"
                className={`relative h-8 px-2.5 rounded-[8px] border-0 inline-flex items-center gap-1.5 cursor-pointer text-[13px] font-medium transition-colors ${
                  activeHierarchyKey === "bookmarks"
                    ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                    : "bg-transparent hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)]"
                }`}
              >
                <Bookmark
                  size={15}
                  strokeWidth={1.5}
                  className={
                    activeHierarchyKey === "bookmarks"
                      ? "fill-[var(--text-color-kumo-strong)] text-[var(--text-color-kumo-strong)]"
                      : "text-[var(--text-color-kumo-subtle)]"
                  }
                />
                <span className="hidden xl:inline">Saved</span>
                {bookmarkedUids.length > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[11px] leading-none border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)] kumo-mono">
                    {bookmarkedUids.length}
                  </span>
                )}
              </button>

              {/* Cart Button + Popover */}
              <div ref={cartPopoverRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCartPopoverOpen((prev) => !prev)}
                  aria-label="Asset cart"
                  title="Asset cart"
                  className={`relative h-8 px-2.5 rounded-[8px] border-0 inline-flex items-center gap-1.5 cursor-pointer text-[13px] font-medium transition-colors ${
                    cartPopoverOpen
                      ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)]"
                      : "bg-transparent hover:bg-[var(--color-kumo-tint)] text-[var(--text-color-kumo-default)]"
                  }`}
                >
                  <ShoppingBag
                    size={15}
                    strokeWidth={1.5}
                    className="text-[var(--text-color-kumo-subtle)]"
                  />
                  <span className="hidden xl:inline">Cart</span>
                  {cartUids.length > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px] leading-none bg-[var(--color-kumo-success)] text-white kumo-mono">
                      {cartUids.length}
                    </span>
                  )}
                </button>

                {cartPopoverOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-[340px] sm:w-[372px] bg-white border border-[var(--color-kumo-line)] rounded-[8px] shadow-[var(--shadow-kumo-md)] p-4 z-50 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[var(--color-kumo-line)] pb-2.5">
                      <div className="flex items-center gap-2">
                        <ShoppingBag
                          size={15}
                          strokeWidth={1.5}
                          className="text-[var(--text-color-kumo-subtle)]"
                        />
                        <h3 className="m-0 font-semibold text-[14px] text-[var(--text-color-kumo-strong)]">
                          Export queue{" "}
                          <span className="kumo-mono text-[12px] font-normal text-[var(--text-color-kumo-subtle)]">
                            ({cartItems.length})
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {cartItems.length === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const sampleIds = catalog
                                .filter((it) => !it.sensitive && !it.isFree)
                                .slice(0, 3)
                                .map((it) => it.uid);
                              writeStorageArray("onflow_cart", sampleIds);
                              showToast("Added 3 sample assets to queue");
                            }}
                            className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                          >
                            + Load sample
                          </button>
                        )}
                        {cartItems.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              writeStorageArray("onflow_cart", []);
                              showToast("Cleared cart");
                            }}
                            className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] bg-transparent border-0 p-0 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="py-5 flex flex-col items-center text-center gap-3">
                        <p className="m-0 text-[13px] leading-[20px] text-[var(--text-color-kumo-subtle)]">
                          Your export queue is empty. Click the bag button on any asset card to queue it for credit unlock.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const sampleIds = catalog
                              .filter((it) => !it.sensitive && !it.isFree)
                              .slice(0, 3)
                              .map((it) => it.uid);
                            writeStorageArray("onflow_cart", sampleIds);
                            setCartPopoverOpen(false);
                            setCartCheckoutScenario("sufficient");
                            setCartCheckoutOpen(true);
                          }}
                          className="h-8 px-3 rounded-[8px] bg-[var(--color-kumo-canvas)] hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] text-[12px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                        >
                          Preview credit checkout (3 sample assets)
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-[240px] overflow-y-auto flex flex-col gap-2 pr-1">
                          {cartItems.map((it) => {
                            const costMatch = it.credits.match(/\d+/);
                            const numCost = it.isFree
                              ? 0
                              : costMatch
                              ? parseInt(costMatch[0], 10)
                              : 4;
                            return (
                              <div
                                key={it.uid}
                                className="flex items-center gap-2.5 p-2 rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)]"
                              >
                                <img
                                  src={it.imgUrl}
                                  alt={it.title}
                                  className="size-10 rounded-[6px] object-cover shrink-0 bg-[#18181b]"
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    onClick={() => {
                                      setCartPopoverOpen(false);
                                      handleOpenItemOverlay(it);
                                    }}
                                    className="m-0 font-medium text-[12px] text-[var(--text-color-kumo-strong)] truncate cursor-pointer hover:text-[var(--text-color-kumo-link)]"
                                  >
                                    {it.title}
                                  </p>
                                  <p className="m-0 kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                                    <span className="font-medium text-[var(--text-color-kumo-strong)]">
                                      {numCost}
                                    </span>
                                    <CreditIcon size={10} />
                                    <span>· {it.size.replace(",", ".")}</span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCart(it.uid)}
                                  aria-label="Remove from cart"
                                  className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-danger)] bg-transparent border-0 p-1 cursor-pointer"
                                >
                                  <Trash2 size={14} strokeWidth={1.5} />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Balance vs Queue Cost Summary inside Popover */}
                        <div className="rounded-[8px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] p-2.5 flex flex-col gap-1.5 text-[12px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--text-color-kumo-subtle)]">
                              Workspace balance
                            </span>
                            <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                              <span>
                                {workspaceCredits.toLocaleString("en-US")}
                              </span>
                              <CreditIcon size={10} />
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[var(--text-color-kumo-strong)]">
                              Queue credit deduction
                            </span>
                            <span className="kumo-mono font-semibold text-[13px] text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                              <span>−{cartTotalCredits}</span>
                              <CreditIcon size={11} />
                            </span>
                          </div>
                          <div className="pt-1 border-t border-[var(--color-kumo-line)] flex items-center justify-between">
                            <span className="text-[var(--text-color-kumo-subtle)]">
                              Remaining after unlock
                            </span>
                            <span className="kumo-mono font-semibold text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
                              <span>
                                {Math.max(
                                  0,
                                  workspaceCredits - cartTotalCredits
                                ).toLocaleString("en-US")}
                              </span>
                              <CreditIcon size={10} />
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCartPopoverOpen(false);
                              setCartCheckoutScenario("sufficient");
                              setCartCheckoutOpen(true);
                            }}
                            className="w-full h-9 rounded-[8px] kumo-btn-primary font-medium text-[13px] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Checkout with credits</span>
                            <span className="inline-flex items-center gap-1">
                              <span>({cartTotalCredits}</span>
                              <CreditIcon size={11} color="#ffffff" />
                              <span>)</span>
                            </span>
                            <ArrowRight size={14} strokeWidth={1.5} />
                          </button>

                          <div className="flex items-center justify-between pt-0.5 px-0.5 text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                setCartPopoverOpen(false);
                                setCartCheckoutScenario("insufficient");
                                setCartCheckoutOpen(true);
                              }}
                              className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-link)] underline bg-transparent border-0 p-0 cursor-pointer"
                            >
                              Simulate low balance
                            </button>
                            <Link
                              href="/payment"
                              onClick={() => setCartPopoverOpen(false)}
                              className="text-[var(--text-color-kumo-link)] hover:underline no-underline font-medium"
                            >
                              + Top up credits
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

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
                onSignOut={() => showToast("Signed out of Onflow Asia workspace")}
              />
            </div>
          </header>

          {/* Mobile & Tablet Search + Quick Filter Bar */}
          <div className="lg:hidden bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] px-4 py-2.5 flex flex-col gap-2">
            <div className="w-full h-9 bg-white border border-[var(--color-kumo-line)] rounded-[8px] flex items-center gap-2 px-3">
              <Search
                size={14}
                strokeWidth={1.5}
                className="text-[var(--text-color-kumo-subtle)] shrink-0"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 5,440+ 3D models, surfaces, HDRIs..."
                className="w-full bg-transparent border-0 outline-none text-[13px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="text-[var(--text-color-kumo-subtle)] bg-transparent border-0 p-0 cursor-pointer"
                >
                  <X size={13} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {!activeHierarchyMeta && (
              <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleSelectHierarchy(null)}
                  className={`h-8 px-3 rounded-[7px] border text-[12.5px] font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                    activeHierarchyKey === null
                      ? "bg-white border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                      : "bg-transparent border-transparent text-[var(--text-color-kumo-subtle)]"
                  }`}
                >
                  Discover
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectHierarchy("vietnam")}
                  className="h-8 px-3 rounded-[7px] border border-transparent bg-transparent text-[12.5px] font-medium text-[var(--text-color-kumo-subtle)] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Locations
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectHierarchy("free-assets")}
                  className="h-8 px-3 rounded-[7px] border border-transparent bg-transparent text-[12.5px] font-medium text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Free</span>
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] leading-none border border-dashed border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                    <span>0</span>
                    <CreditIcon size={9} />
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Content: Hierarchy Collection View OR Main Gallery Discover View */}
          {activeHierarchyMeta ? (
            <HierarchySectionView
              section={activeHierarchyMeta}
              catalog={catalog}
              searchQuery={searchQuery}
              bookmarkedSet={bookmarkedSet}
              cartSet={cartSet}
              onNavigateHierarchy={handleSelectHierarchy}
              onSelectItem={handleOpenItemOverlay}
              onToggleBookmark={handleToggleBookmark}
              onToggleCart={handleToggleCart}
            />
          ) : (
            <main className="flex-1 min-w-0 px-4 sm:px-6 xl:px-8 pt-6 pb-12 relative">
              <div className="w-full max-w-[1360px] mx-auto flex flex-col gap-8">
                {/* Opening Hero + Category Bar Unit */}
                <div className="flex flex-col gap-3.5 w-full">
                  {/* Hero Banner wrapped in Kumo Elevated Frame */}
                  <div className="bg-[var(--color-kumo-elevated)] p-1.5 rounded-[14px] border border-[var(--color-kumo-line)]">
                    <section
                      onMouseEnter={() => setHeroPaused(true)}
                      onMouseLeave={() => setHeroPaused(false)}
                      className="hero-bento-carousel flex items-center relative w-full h-[336px] sm:h-[350px] xl:h-[360px] shrink-0 overflow-hidden rounded-[10px]"
                      aria-label="Featured 3D Asset Library"
                    >
                {[-2, -1, 0, 1, 2, 3].map((offset) => {
                  const slideKey = heroStep + offset;
                  const imgIndex =
                    ((slideKey % HERO_CAROUSEL_IMAGES.length) +
                      HERO_CAROUSEL_IMAGES.length) %
                    HERO_CAROUSEL_IMAGES.length;
                  const imgSrc = HERO_CAROUSEL_IMAGES[imgIndex];
                  const isCenter = offset === 0;
                  const isClickableSide =
                    offset === -1 || offset === 1 || offset === 2;

                  const slotStyle: React.CSSProperties =
                    offset === -2
                      ? {
                          flex: "0 0 0px",
                          marginRight: "0px",
                          opacity: 0,
                          pointerEvents: "none",
                        }
                      : offset === -1
                        ? {
                            flex: "0 0 var(--slot-left-w)",
                            marginRight: "var(--slot-left-mr)",
                            opacity: 1,
                          }
                        : offset === 0
                          ? {
                              flex: "1 1 0px",
                              marginRight: "var(--slot-center-mr)",
                              opacity: 1,
                            }
                          : offset === 1
                            ? {
                                flex: "0 0 var(--slot-right-w)",
                                marginRight: "var(--slot-right-mr)",
                                opacity: 1,
                              }
                            : offset === 2
                              ? {
                                  flex: "0 0 var(--slot-far-w)",
                                  marginRight: "0px",
                                  opacity: 1,
                                }
                              : {
                                  flex: "0 0 0px",
                                  marginRight: "0px",
                                  opacity: 0,
                                  pointerEvents: "none",
                                };

                  const activeDot =
                    ((heroStep % HERO_CAROUSEL_IMAGES.length) +
                      HERO_CAROUSEL_IMAGES.length) %
                    HERO_CAROUSEL_IMAGES.length;

                  return (
                    <div
                      key={slideKey}
                      style={slotStyle}
                      onClick={
                        isClickableSide
                          ? () => setHeroStep((prev) => prev + offset)
                          : undefined
                      }
                      className={`bg-[#141926] h-full min-w-0 overflow-hidden relative rounded-[12px] transition-[flex,margin-right,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isClickableSide ? "cursor-pointer group" : ""
                      }`}
                    >
                      <img
                        alt={
                          isCenter
                            ? "Onflow 3D architectural scan showcase"
                            : ""
                        }
                        className={`size-full object-cover transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCenter
                            ? "opacity-100"
                            : "opacity-80 group-hover:opacity-100"
                        }`}
                        src={imgSrc}
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-[#141926]/92 via-[#141926]/68 to-[#141926]/20 pointer-events-none transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCenter ? "opacity-100" : "opacity-0"
                        }`}
                      />

                      <div
                        aria-hidden={!isCenter}
                        className={`absolute inset-0 flex flex-col items-start justify-center px-5 py-6 sm:px-10 xl:px-12 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCenter
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2 pointer-events-none"
                        }`}
                      >
                        <div className="max-w-[540px] flex flex-col items-start text-left gap-2.5 sm:gap-4">
                          <span className="kumo-mono text-[11.5px] sm:text-[12px] leading-[16px] text-white/80">
                            {catalog.length.toLocaleString()} scans · LiDAR & 8K PBR
                          </span>

                          <h2 className="font-semibold leading-[1.14] tracking-[-0.02em] text-[22px] sm:text-[32px] xl:text-[38px] text-white m-0">
                            Scanned Vietnamese architecture, PBR surfaces, and 32-bit HDRIs
                          </h2>

                          <p className="font-sans font-normal leading-[19px] sm:leading-[22px] text-[13px] sm:text-[14px] text-white/80 max-w-[480px] m-0">
                            Photogrammetry models, tileable materials, and environment maps calibrated for Unreal Engine, Blender, and Maya
                          </p>

                          <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              tabIndex={isCenter ? 0 : -1}
                              onClick={() =>
                                explorerRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                })
                              }
                              className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-[8px] bg-white hover:bg-[#eef0f4] text-[#141926] font-sans font-medium text-[12.5px] sm:text-[13px] border-0 cursor-pointer transition-colors duration-150 active:scale-[0.98]"
                            >
                              Browse catalog
                            </button>
                            <button
                              type="button"
                              tabIndex={isCenter ? 0 : -1}
                              onClick={() => handleSelectHierarchy("free-assets")}
                              className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-[8px] bg-white/12 hover:bg-white/20 text-white font-sans font-medium text-[12.5px] sm:text-[13px] border border-white/15 cursor-pointer transition-colors duration-150 active:scale-[0.98]"
                            >
                              Free assets
                            </button>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`absolute bottom-4 left-6 sm:left-10 xl:left-12 z-10 flex items-center gap-1.5 transition-opacity duration-300 ${
                          isCenter
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        {HERO_CAROUSEL_IMAGES.map((_, dotIdx) => {
                          const isDotActive = dotIdx === activeDot;
                          return (
                            <button
                              key={dotIdx}
                              type="button"
                              tabIndex={isCenter ? 0 : -1}
                              onClick={(e) => {
                                e.stopPropagation();
                                let diff =
                                  (dotIdx -
                                    activeDot +
                                    HERO_CAROUSEL_IMAGES.length) %
                                  HERO_CAROUSEL_IMAGES.length;
                                if (diff > 1) {
                                  diff -= HERO_CAROUSEL_IMAGES.length;
                                }
                                if (diff !== 0) {
                                  setHeroStep((prev) => prev + diff);
                                }
                              }}
                              aria-label={`Go to slide ${dotIdx + 1}`}
                              className={`h-1 rounded-[2px] border-0 p-0 cursor-pointer transition-[width,background-color] duration-200 ${
                                isDotActive
                                  ? "w-6 bg-white"
                                  : "w-2 bg-white/35 hover:bg-white/65"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                    </section>
                  </div>

                  {/* 6 Category Filters (Cloudflare Kumo Segmented Toolbar / Pill Buttons) */}
                  <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 w-full shrink-0">
                    {CATEGORY_PILLS.map((pill) => {
                      const isSelected = activeCategoryPill === pill.id;
                      const Icon = CATEGORY_ICON_MAP[pill.id] || Box;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => handleSelectCategoryPill(pill.id)}
                          className={`cursor-pointer h-9 flex gap-2 items-center justify-center px-3 relative rounded-[8px] border shadow-[var(--shadow-kumo-xs)] transition-colors duration-150 min-w-0 ${
                            isSelected
                              ? "bg-[#3e8eff]/[.10] border-[#3e8eff]/40 text-[var(--text-color-kumo-strong)] font-semibold"
                              : "bg-white border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)] font-medium hover:bg-[var(--color-kumo-tint)] hover:border-[var(--color-kumo-fill)]"
                          }`}
                        >
                          <Icon
                            size={15}
                            strokeWidth={1.5}
                            className={`shrink-0 ${
                              isSelected
                                ? "text-[var(--text-color-kumo-link)]"
                                : "text-[var(--text-color-kumo-subtle)]"
                            }`}
                          />
                          <span className="text-[13px] truncate">
                            {pill.label}
                          </span>
                        </button>
                      );
                    })}
                  </section>
                </div>

                {/* Interactive Filtered Endless Grid */}
                {(activeCategoryPill || searchQuery.trim().length > 0) && (
                  <section className="flex flex-col gap-4 bg-white p-5 rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] w-full shrink-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2.5">
                        <h3 className="font-semibold text-[16px] leading-[22px] text-[var(--text-color-kumo-strong)] m-0">
                          Filtered results
                        </h3>
                        <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)]">
                          {explorerFilteredItems.length.toLocaleString()} assets
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategoryPill(null);
                          setActiveLotpixelCluster("all");
                          setActiveLotpixelSubcat("all");
                          setSearchQuery("");
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <X size={13} strokeWidth={1.5} />
                        <span>Clear filter</span>
                      </button>
                    </div>

                    <EndlessCardGrid
                      items={explorerFilteredItems}
                      resetKey={quickBrowseResetKey}
                      initialBatchSize={16}
                      batchSize={24}
                      onSelectItem={handleOpenItemOverlay}
                      bookmarkedSet={bookmarkedSet}
                      cartSet={cartSet}
                      onToggleBookmark={handleToggleBookmark}
                      onToggleCart={handleToggleCart}
                      onResetFilters={() => {
                        setActiveCategoryPill(null);
                        setActiveLotpixelCluster("all");
                        setActiveLotpixelSubcat("all");
                        setSearchQuery("");
                      }}
                    />
                  </section>
                )}

                {/* Section 1: Recently added */}
                <div className="w-full shrink-0">
                  <AssetSectionRow
                    title="Recently added"
                    subtitle="Latest scanned 3D models with LODs and 4K–8K PBR maps"
                    items={recentReleaseItems}
                    onSelectItem={handleOpenItemOverlay}
                    onClickTitle={() => handleSelectHierarchy("recent-releases")}
                    bookmarkedSet={bookmarkedSet}
                    cartSet={cartSet}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCart={handleToggleCart}
                  />
                </div>

                {/* Section 2: Collections */}
                <section className="flex flex-col gap-3.5 items-start relative w-full shrink-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleSelectHierarchy("vietnam")}
                        className="flex gap-1.5 items-center bg-transparent border-0 p-0 cursor-pointer group text-left"
                      >
                        <h2 className="leading-[24px] m-0 font-semibold text-[16px] sm:text-[18px] tracking-[-0.01em] text-[var(--text-color-kumo-strong)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150">
                          Collections
                        </h2>
                        <ChevronRight
                          size={16}
                          strokeWidth={1.5}
                          className="text-[var(--text-color-kumo-subtle)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150"
                        />
                      </button>
                      <p className="m-0 text-[13px] leading-[19px] text-[var(--text-color-kumo-subtle)]">
                        Themed asset packs organized by architecture, region, and environment
                      </p>
                    </div>

                    <div className="flex gap-1.5 items-center shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setFeaturedPage(
                            (prev) =>
                              (prev - 1 + featuredPageCount) % featuredPageCount
                          )
                        }
                        aria-label="Previous collections"
                        className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
                      >
                        <ChevronLeft size={15} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFeaturedPage(
                            (prev) => (prev + 1) % featuredPageCount
                          )
                        }
                        aria-label="Next collections"
                        className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
                      >
                        <ChevronRight size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
                    {visibleFeaturedCollections.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => handleSelectHierarchy(col.targetKey)}
                        className="group bg-white flex flex-col gap-3 h-[304px] overflow-hidden p-3 rounded-[8px] border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] shadow-[var(--shadow-kumo-xs)] cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex flex-1 gap-1.5 items-stretch min-h-0 relative w-full">
                          <div className="h-full relative rounded-[6px] flex-1 overflow-hidden bg-[#18181b]">
                            <img
                              alt={col.title}
                              className="object-cover size-full"
                              src={col.images[0]}
                            />
                          </div>
                          <div className="h-full relative rounded-[6px] shrink-0 w-[23%] overflow-hidden bg-[#18181b]">
                            <img
                              alt=""
                              className="object-cover size-full"
                              src={col.images[1]}
                            />
                          </div>
                          <div className="h-full relative rounded-[6px] shrink-0 w-[14%] overflow-hidden bg-[#18181b]">
                            <img
                              alt=""
                              className="object-cover size-full"
                              src={col.images[2]}
                            />
                          </div>
                          <div className="h-full relative rounded-[6px] shrink-0 w-[7%] overflow-hidden bg-[#18181b]">
                            <img
                              alt=""
                              className="object-cover size-full"
                              src={col.images[3]}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] overflow-hidden rounded-[6px] shrink-0 size-8 flex items-center justify-center">
                              <img
                                alt=""
                                className="size-full object-cover"
                                src="/assets/feat_avatar.png"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h3 className="m-0 truncate text-[14px] font-medium text-[var(--text-color-kumo-strong)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150">
                                {col.title}
                              </h3>
                              <p className="m-0 truncate text-[12px] text-[var(--text-color-kumo-subtle)]">
                                {col.province} · {col.era}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)] kumo-mono shrink-0">
                            {col.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 3: Architectural & interior */}
                <div className="w-full shrink-0">
                  <AssetSectionRow
                    title="Architectural & interior"
                    subtitle="Stonework, carved elements, interior furnishings, and structural details"
                    items={historicalArtifactItems}
                    onSelectItem={handleOpenItemOverlay}
                    onClickTitle={() =>
                      handleSelectHierarchy("historical-artifacts")
                    }
                    bookmarkedSet={bookmarkedSet}
                    cartSet={cartSet}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCart={handleToggleCart}
                  />
                </div>

                {/* Section 4: Trending surfaces */}
                <div className="w-full shrink-0">
                  <AssetSectionRow
                    title="Trending surfaces"
                    subtitle="Tileable 1K–8K PBR stone, wood, brick, metal, and plaster maps"
                    items={trendingTextureItems}
                    onSelectItem={handleOpenItemOverlay}
                    onClickTitle={() =>
                      handleSelectHierarchy("trending-materials")
                    }
                    bookmarkedSet={bookmarkedSet}
                    cartSet={cartSet}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCart={handleToggleCart}
                  />
                </div>

                {/* Section 5: Knowledge Hub */}
                <section
                  ref={knowledgeHubRef}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 w-full shrink-0"
                >
                  {/* Left: Documentation */}
                  <div
                    className={`bg-white rounded-[8px] border p-5 shadow-[var(--shadow-kumo-xs)] flex flex-col justify-between gap-4 transition-colors duration-150 ${
                      activeNavKey === "Documentations"
                        ? "border-[var(--color-kumo-brand)]"
                        : "border-[var(--color-kumo-line)]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-0.5">
                        <h2 className="leading-[22px] m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Documentation & guides
                        </h2>
                        <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                          Scan pipelines, material calibration, and engine exports
                        </p>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setDocSlideIndex(
                              (prev) =>
                                (prev - 1 + DOCUMENTATION_SLIDES.length) %
                                DOCUMENTATION_SLIDES.length
                            )
                          }
                          aria-label="Previous documentation"
                          className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
                        >
                          <ChevronLeft size={15} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDocSlideIndex(
                              (prev) => (prev + 1) % DOCUMENTATION_SLIDES.length
                            )
                          }
                          aria-label="Next documentation"
                          className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
                        >
                          <ChevronRight size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col divide-y divide-[var(--color-kumo-line)]">
                      {currentDocSlide.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleSelectHierarchy(doc.targetKey)}
                          className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-[8px] cursor-pointer hover:bg-[var(--color-kumo-overlay)] transition-colors duration-150 group"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <p className="m-0 font-medium text-[14px] leading-[20px] text-[var(--text-color-kumo-strong)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150 line-clamp-2">
                              <span className="text-[var(--text-color-kumo-link)]">
                                {doc.prefix}
                              </span>
                              {doc.title}
                            </p>
                            <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
                              {doc.meta}
                            </span>
                          </div>
                          <div className="h-14 w-[96px] sm:w-[112px] rounded-[6px] overflow-hidden shrink-0 bg-[#18181b]">
                            <img
                              src={doc.thumbnail}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {DOCUMENTATION_SLIDES.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDocSlideIndex(idx)}
                          aria-label={`Documentation slide ${idx + 1}`}
                          className={`h-1.5 rounded-[2px] border-0 cursor-pointer transition-[width,background-color] duration-150 ${
                            docSlideIndex === idx
                              ? "w-6 bg-[var(--color-kumo-brand)]"
                              : "w-2 bg-[var(--color-kumo-fill)] hover:bg-[var(--text-color-kumo-subtle)]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right: Community */}
                  <div
                    className={`bg-white rounded-[8px] border p-5 shadow-[var(--shadow-kumo-xs)] flex flex-col justify-between gap-4 transition-colors duration-150 ${
                      activeNavKey === "Forums" || activeNavKey === "News"
                        ? "border-[var(--color-kumo-brand)]"
                        : "border-[var(--color-kumo-line)]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-0.5">
                        <h2 className="leading-[22px] m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Community & discussions
                        </h2>
                        <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                          Workflow tips, shader breakdowns, and technical Q&A
                        </p>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setForumSlideIndex(
                              (prev) =>
                                (prev - 1 + FORUM_SLIDES.length) %
                                FORUM_SLIDES.length
                            )
                          }
                          aria-label="Previous forum topics"
                          className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
                        >
                          <ChevronLeft size={15} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForumSlideIndex(
                              (prev) => (prev + 1) % FORUM_SLIDES.length
                            )
                          }
                          aria-label="Next forum topics"
                          className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] transition-colors duration-150"
                        >
                          <ChevronRight size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col divide-y divide-[var(--color-kumo-line)]">
                      {currentForumSlide.map((forum) => (
                        <div
                          key={forum.id}
                          onClick={() => handleSelectHierarchy(forum.targetKey)}
                          className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-[8px] cursor-pointer hover:bg-[var(--color-kumo-overlay)] transition-colors duration-150 group"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)]">
                                {forum.tag}
                              </span>
                              <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
                                {forum.meta}
                              </span>
                            </div>
                            <p className="m-0 font-normal text-[14px] leading-[20px] text-[var(--text-color-kumo-strong)] group-hover:text-[var(--text-color-kumo-link)] transition-colors duration-150 line-clamp-2">
                              {forum.title}
                            </p>
                          </div>
                          <div className="h-14 w-20 rounded-[6px] overflow-hidden shrink-0 bg-[#18181b]">
                            <img
                              src={forum.thumbnail}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {FORUM_SLIDES.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForumSlideIndex(idx)}
                          aria-label={`Forum slide ${idx + 1}`}
                          className={`h-1.5 rounded-[2px] border-0 cursor-pointer transition-[width,background-color] duration-150 ${
                            forumSlideIndex === idx
                              ? "w-6 bg-[var(--color-kumo-brand)]"
                              : "w-2 bg-[var(--color-kumo-fill)] hover:bg-[var(--text-color-kumo-subtle)]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section 6: HDRI environments */}
                <div className="w-full shrink-0">
                  <AssetSectionRow
                    title="HDRI environments"
                    subtitle="360° 32-bit EXR skies and ground captures (20% off in credits)"
                    items={hdriEnvironmentItems}
                    onSelectItem={handleOpenItemOverlay}
                    onClickTitle={() => handleSelectHierarchy("discount-hdris")}
                    bookmarkedSet={bookmarkedSet}
                    cartSet={cartSet}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCart={handleToggleCart}
                  />
                </div>

                {/* Section 7: Modular & kitbash */}
                <div className="w-full shrink-0">
                  <AssetSectionRow
                    title="Modular & kitbash"
                    subtitle="Structural modules, street props, and architectural assemblies"
                    items={kitbashReadyItems}
                    onSelectItem={handleOpenItemOverlay}
                    onClickTitle={() => handleSelectHierarchy("kitbash-ready")}
                    bookmarkedSet={bookmarkedSet}
                    cartSet={cartSet}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCart={handleToggleCart}
                  />
                </div>

                {/* Section 8: Free assets */}
                <div className="w-full shrink-0">
                  <AssetSectionRow
                    title="Free assets"
                    subtitle="0-credit 3D models and PBR surfaces available for all accounts"
                    items={freeLimitedItems}
                    onSelectItem={handleOpenItemOverlay}
                    onClickTitle={() => handleSelectHierarchy("free-assets")}
                    bookmarkedSet={bookmarkedSet}
                    cartSet={cartSet}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCart={handleToggleCart}
                  />
                </div>

                {/* Section 9: Complete Catalog Explorer (Kumo Card + Segmented Pill Tabs) */}
                <section
                  ref={explorerRef}
                  className="flex flex-col gap-5 items-start bg-white p-5 sm:p-6 rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] relative w-full shrink-0"
                  data-name="Complete Catalog Explorer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-baseline gap-2.5">
                        <h2 className="font-semibold text-[18px] tracking-[-0.01em] text-[var(--text-color-kumo-strong)] m-0">
                          Browse all assets
                        </h2>
                        <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)]">
                          {explorerFilteredItems.length.toLocaleString()} /{" "}
                          {fullCatalogLoaded
                            ? catalog.length.toLocaleString()
                            : catalog.length}{" "}
                          assets
                        </span>
                      </div>
                      <p className="text-[13px] text-[var(--text-color-kumo-subtle)] m-0">
                        Filter across 3D assets, PBR surfaces, and HDRIs
                      </p>
                    </div>

                    {/* Primary Group Tabs (Cloudflare Kumo Segmented Pill Track) */}
                    <div
                      role="tablist"
                      className="inline-flex flex-wrap items-center rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5"
                    >
                      {LOTPIXEL_CATEGORY_TAXONOMY.map((cluster) => {
                        const isClusterActive =
                          activeLotpixelCluster === cluster.id;
                        return (
                          <button
                            key={cluster.id}
                            type="button"
                            role="tab"
                            aria-selected={isClusterActive}
                            onClick={() => {
                              setActiveLotpixelCluster(cluster.id);
                              setActiveLotpixelSubcat("all");
                              setActiveCategoryPill(null);
                            }}
                            className={`cursor-pointer h-8 px-3 rounded-[6px] text-[13px] border-0 transition-colors duration-150 flex items-center gap-1.5 ${
                              isClusterActive
                                ? "bg-white text-[var(--text-color-kumo-strong)] font-medium shadow-[var(--shadow-kumo-xs)]"
                                : "bg-transparent text-[var(--text-color-kumo-subtle)] font-normal hover:text-[var(--text-color-kumo-default)]"
                            }`}
                          >
                            <span>{cluster.label}</span>
                            <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
                              {cluster.totalCount.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subcategory Filter Chips */}
                  {(() => {
                    const currentCluster = LOTPIXEL_CATEGORY_TAXONOMY.find(
                      (c) => c.id === activeLotpixelCluster
                    );
                    if (
                      !currentCluster ||
                      currentCluster.subcategories.length === 0
                    ) {
                      return null;
                    }
                    return (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[var(--color-kumo-line)] w-full">
                        <button
                          type="button"
                          onClick={() => setActiveLotpixelSubcat("all")}
                          className={`cursor-pointer h-7 px-2.5 rounded-[6px] text-[12px] border transition-colors duration-150 ${
                            activeLotpixelSubcat === "all"
                              ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)] border-[var(--color-kumo-fill)] font-medium"
                              : "bg-white text-[var(--text-color-kumo-subtle)] border-[var(--color-kumo-line)] hover:bg-[var(--color-kumo-tint)] hover:text-[var(--text-color-kumo-default)]"
                          }`}
                        >
                          All {currentCluster.label}{" "}
                          <span className="kumo-mono opacity-75">
                            ({currentCluster.totalCount.toLocaleString()})
                          </span>
                        </button>
                        {currentCluster.subcategories.map((sub) => {
                          const isSubActive = activeLotpixelSubcat === sub.slug;
                          return (
                            <button
                              key={sub.slug}
                              type="button"
                              onClick={() =>
                                setActiveLotpixelSubcat(
                                  isSubActive ? "all" : sub.slug
                                )
                              }
                              className={`cursor-pointer h-7 px-2.5 rounded-[6px] text-[12px] border transition-colors duration-150 ${
                                isSubActive
                                  ? "bg-[#3e8eff]/[.10] text-[var(--text-color-kumo-strong)] border-[#3e8eff]/40 font-medium"
                                  : "bg-white text-[var(--text-color-kumo-subtle)] border-[var(--color-kumo-line)] hover:bg-[var(--color-kumo-tint)] hover:text-[var(--text-color-kumo-default)]"
                              }`}
                            >
                              {sub.label}{" "}
                              <span className="kumo-mono text-[11px] opacity-70">
                                ({sub.count})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Endless Scroll Asset Card Grid */}
                  <EndlessCardGrid
                    items={explorerFilteredItems}
                    resetKey={explorerResetKey}
                    initialBatchSize={24}
                    batchSize={24}
                    onSelectItem={handleOpenItemOverlay}
                    bookmarkedSet={bookmarkedSet}
                    cartSet={cartSet}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleCart={handleToggleCart}
                    onResetFilters={() => {
                      setActiveCategoryPill(null);
                      setActiveLotpixelCluster("all");
                      setActiveLotpixelSubcat("all");
                      setSearchQuery("");
                    }}
                  />
                </section>
              </div>
            </main>
          )}

          {/* Cloudflare Kumo 48px Bottom Footer (`min-h-12`, `border-t border-kumo-line`) */}
          <footer className="mt-auto min-h-[48px] bg-[var(--color-kumo-canvas)] border-t border-[var(--color-kumo-line)] px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--text-color-kumo-default)]">
            <button
              type="button"
              onClick={() => handleSelectHierarchy(null)}
              className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
            >
              Gallery Home
            </button>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <button
              type="button"
              onClick={() => handleSelectHierarchy("vietnam")}
              className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
            >
              Vietnam Heritage Locations
            </button>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <Link
              href="/portal"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Account Portal
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <Link
              href="/payment"
              className="hover:underline text-[var(--text-color-kumo-default)] no-underline"
            >
              Pricing & Credits
            </Link>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <button
              type="button"
              onClick={() => handleSelectKnowledgeHub("Documentations")}
              className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
            >
              Pipeline Documentation
            </button>
            <span className="text-[var(--color-kumo-fill)]">|</span>
            <span className="text-[var(--text-color-kumo-subtle)]">
              © 2026 Onflow Asia Co., Ltd.
            </span>
          </footer>
        </div>
      </div>

      {/* Item Menu Overlay Modal */}
      <ItemMenuOverlay
        isOpen={overlayOpen}
        asset={selectedOverlayAsset}
        onClose={() => setOverlayOpen(false)}
        onExpand={handleExpandToItemPage}
      />

      {/* Workspace Credit Cart & Batch Checkout Modal */}
      <CartCheckoutOverlay
        isOpen={cartCheckoutOpen}
        onClose={() => setCartCheckoutOpen(false)}
        cartItems={cartItems}
        onRemoveItem={(uid) => handleToggleCart(uid)}
        onClearCart={() => {
          writeStorageArray("onflow_cart", []);
          showToast("Cleared export queue");
        }}
        onAddSampleItems={() => {
          const sampleIds = catalog
            .filter((it) => !it.sensitive && !it.isFree)
            .slice(0, 3)
            .map((it) => it.uid);
          writeStorageArray("onflow_cart", sampleIds);
          showToast("Loaded 3 sample assets into queue");
        }}
        workspaceCredits={workspaceCredits}
        onDeductCredits={(amount, newlyUnlocked) => {
          setWorkspaceCredits((prev) => Math.max(0, prev - amount));
          setUnlockedUids((prev) => Array.from(new Set([...prev, ...newlyUnlocked])));
          showToast(`Unlocked ${newlyUnlocked.length} assets (−${amount} credits)`);
        }}
        unlockedUids={unlockedUids}
        initialScenario={cartCheckoutScenario}
      />
    </div>
  );
}
