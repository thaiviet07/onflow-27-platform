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
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ItemMenuOverlay } from "@/components/ItemMenuOverlay";
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
  "/assets/hero_img3.png",
  "/assets/hero_img4.png",
  "/assets/hero_img1.png",
];

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
    <section className="flex flex-col gap-[18px] items-center relative w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex flex-col gap-0.5 min-w-0">
          <button
            type="button"
            onClick={onClickTitle}
            className="flex gap-[8px] items-center bg-transparent border-0 p-0 cursor-pointer group text-left"
          >
            <h2 className="leading-[28px] m-0 font-google-sans text-[20px] sm:text-[23px] font-bold text-[#19213d] group-hover:text-[#004bda] transition-colors">
              {title}
            </h2>
            <ChevronRight
              size={18}
              className="text-[#19213d] group-hover:text-[#004bda] group-hover:translate-x-0.5 transition-all"
            />
          </button>
          {subtitle && (
            <p className="m-0 font-sans text-[12.5px] text-[rgba(25,33,61,0.68)]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClickTitle && (
            <button
              type="button"
              onClick={onClickTitle}
              className="hidden sm:inline-flex items-center gap-1 bg-white hover:bg-[#eef4ff] text-[#19213d] hover:text-[#004bda] border border-[#e4e6eb] hover:border-[#004bda]/35 rounded-[8px] px-3 py-1.5 font-sans font-semibold text-[12px] cursor-pointer transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={13} />
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
            className="size-[32px] rounded-[8px] bg-white hover:bg-[#f6f7fa] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOffset((prev) => (prev + 4) % safeItems.length)}
            aria-label={`Next ${title}`}
            className="size-[32px] rounded-[8px] bg-white hover:bg-[#f6f7fa] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] items-start relative shrink-0 w-full">
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
    <div className="bg-[#f0f0f0] min-h-screen lg:min-h-[calc(100vh_/_0.9)] w-full flex flex-col items-center overflow-x-clip">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#19213d] text-white px-4 py-2.5 rounded-full shadow-xl border border-white/15 flex items-center gap-2 font-sans text-[12.5px] font-medium">
          <span className="size-2 rounded-full bg-[#004bda] ring-2 ring-[#eef4ff]" />
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
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-1.5 bg-[#19213d] hover:bg-[#004bda] text-white font-sans font-semibold text-[12px] px-4 py-2.5 rounded-full shadow-lg border border-white/15 cursor-pointer transition-all"
        >
          <ArrowUp size={14} />
          <span className="hidden sm:inline">Back to top</span>
        </button>
      )}

      <div className="w-full max-w-[1920px] min-h-screen lg:min-h-[calc(100vh_/_0.9)] flex flex-col relative bg-[#f0f0f0]">
        {/* Unified Top Sticky Header (64px) */}
        <header className="bg-white border-b border-[#e4e6eb] h-[64px] w-full flex items-center justify-between px-[16px] lg:px-[32px] shrink-0 sticky top-0 z-30">
          {/* Left: Mobile Hamburger + Consistent Logo + Nav Links */}
          <div className="flex gap-[14px] lg:gap-[28px] items-center relative shrink-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Open navigation menu"
              className="lg:hidden overflow-hidden relative shrink-0 size-[24px] cursor-pointer border-0 bg-transparent p-0"
            >
              <div className="absolute bg-[#19213d] inset-[12.5%_0_78.13%_0] rounded-[2px]" />
              <div className="absolute bg-[#19213d] inset-[45.31%_0] rounded-[2px]" />
              <div className="absolute bg-[#19213d] inset-[78.13%_0_12.5%_0] rounded-[2px]" />
            </button>

            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleSelectHierarchy(null);
              }}
              className="h-[32px] w-[112px] relative shrink-0 block cursor-pointer"
              aria-label="Onflow Asia Home"
            >
              <img
                alt="Onflow Asia"
                className="block w-full h-full object-contain"
                src="/assets/b2_header_logo.svg"
                width={112}
                height={32}
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1 relative shrink-0">
              <button
                type="button"
                onClick={() => handleSelectHierarchy(null)}
                className={`h-[34px] px-[14px] rounded-[9px] border-0 cursor-pointer font-sans text-[13.5px] text-[#19213d] transition-colors ${
                  activeHierarchyKey === null
                    ? "bg-[#f2f3f5] font-bold"
                    : "bg-transparent font-normal hover:bg-[#f6f7fa]"
                }`}
              >
                Gallery
              </button>
              <button
                type="button"
                onClick={() => handleSelectHierarchy("vietnam")}
                className={`h-[34px] px-[14px] rounded-[9px] border-0 cursor-pointer font-sans text-[13.5px] text-[#19213d] transition-colors ${
                  activeHierarchyKey === "vietnam"
                    ? "bg-[#f2f3f5] font-bold"
                    : "bg-transparent font-normal hover:bg-[#f6f7fa]"
                }`}
              >
                Business
              </button>
              <Link
                href="/payment"
                className="flex h-[34px] items-center px-[14px] rounded-[9px] no-underline font-sans text-[13.5px] font-normal text-[#19213d] hover:bg-[#f6f7fa] transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/portal"
                className="flex h-[34px] items-center px-[14px] rounded-[9px] no-underline font-sans text-[13.5px] font-normal text-[#19213d] hover:bg-[#f6f7fa] transition-colors"
              >
                Portal
              </Link>
            </nav>
          </div>

          {/* Center: Unified Search Bar */}
          <div className="hidden md:flex flex-1 max-w-[460px] mx-4 relative">
            <div className="w-full h-[40px] bg-[#f6f7fa] focus-within:bg-white border border-[#e4e6eb] focus-within:border-[#004bda] rounded-[20px] flex items-center gap-2.5 px-4 transition-colors">
              <Search size={16} className="text-[rgba(25,33,61,0.55)] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 3D assets, surfaces, HDRIs, locations..."
                className="w-full bg-transparent border-0 outline-none font-sans text-[13.5px] text-[#19213d] placeholder:text-[rgba(25,33,61,0.45)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  className="text-[rgba(25,33,61,0.55)] hover:text-[#19213d] bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Bookmarks + Cart Popover + Language + Credits + User */}
          <div className="flex gap-[8px] lg:gap-[14px] items-center justify-end relative shrink-0">
            <button
              type="button"
              onClick={() =>
                handleSelectHierarchy(
                  activeHierarchyKey === "bookmarks" ? null : "bookmarks"
                )
              }
              aria-label="Saved Bookmarks"
              title="Saved Bookmarks"
              className={`relative size-[34px] rounded-[9px] border-0 flex items-center justify-center cursor-pointer transition-colors ${
                activeHierarchyKey === "bookmarks"
                  ? "bg-[#eef4ff] text-[#004bda]"
                  : "bg-transparent hover:bg-[#f6f7fa] text-[#19213d]"
              }`}
            >
              <Bookmark
                size={16}
                className={
                  activeHierarchyKey === "bookmarks" ? "fill-[#004bda]" : ""
                }
              />
              {bookmarkedUids.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#004bda] text-white font-sans font-bold text-[10px] flex items-center justify-center">
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
                title="Asset Cart"
                className={`relative size-[34px] rounded-[9px] border-0 flex items-center justify-center cursor-pointer transition-colors ${
                  cartPopoverOpen
                    ? "bg-[#eef4ff] text-[#004bda]"
                    : "bg-transparent hover:bg-[#f6f7fa] text-[#19213d]"
                }`}
              >
                <ShoppingBag size={16} />
                {cartUids.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#008f1f] text-white font-sans font-bold text-[10px] flex items-center justify-center">
                    {cartUids.length}
                  </span>
                )}
              </button>

              {cartPopoverOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[320px] sm:w-[350px] bg-white border border-[#e4e6eb] rounded-[12px] shadow-2xl p-4 z-50 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#f0f2f5] pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={15} className="text-[#004bda]" />
                      <h3 className="m-0 font-google-sans font-bold text-[14px] text-[#19213d]">
                        Asset Cart ({cartItems.length})
                      </h3>
                    </div>
                    {cartItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          writeStorageArray("onflow_cart", []);
                          showToast("Cleared all items from cart");
                        }}
                        className="text-[11px] font-sans font-semibold text-[rgba(25,33,61,0.6)] hover:text-red-600 bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <p className="m-0 py-6 text-center font-sans text-[12.5px] text-[rgba(25,33,61,0.65)]">
                      Your asset cart is empty. Click the cart icon on any asset
                      card to add it here.
                    </p>
                  ) : (
                    <>
                      <div className="max-h-[240px] overflow-y-auto flex flex-col gap-2 pr-1">
                        {cartItems.map((it) => (
                          <div
                            key={it.uid}
                            className="flex items-center gap-2.5 p-2 rounded-[9px] bg-[#f8f9fb] border border-[#eef0f4]"
                          >
                            <img
                              src={it.imgUrl}
                              alt={it.title}
                              className="size-[42px] rounded-[7px] object-cover shrink-0 bg-[#19213d]"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                onClick={() => {
                                  setCartPopoverOpen(false);
                                  handleOpenItemOverlay(it);
                                }}
                                className="m-0 font-sans font-semibold text-[12px] text-[#19213d] truncate cursor-pointer hover:text-[#004bda]"
                              >
                                {it.title}
                              </p>
                              <p className="m-0 font-sans text-[11px] text-[rgba(25,33,61,0.65)]">
                                {it.credits} • {it.size}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleCart(it.uid)}
                              aria-label="Remove from cart"
                              className="text-[rgba(25,33,61,0.5)] hover:text-red-600 bg-transparent border-0 p-1 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#f0f2f5] pt-2.5 flex items-center justify-between">
                        <span className="font-sans text-[12px] text-[rgba(25,33,61,0.7)]">
                          Estimated total:
                        </span>
                        <span className="font-google-sans font-bold text-[15px] text-[#004bda]">
                          {cartTotalCredits} Credits
                        </span>
                      </div>

                      <Link
                        href="/payment"
                        onClick={() => setCartPopoverOpen(false)}
                        className="w-full py-2.5 rounded-[9px] bg-[#004bda] hover:bg-[#003db3] text-white font-sans font-semibold text-[12.5px] text-center no-underline transition-colors"
                      >
                        Top Up Credits & Checkout →
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => showToast("Display language: English")}
              aria-label="Language"
              title="Display language: English"
              className="hidden sm:inline-flex items-center gap-1 h-[34px] px-2.5 rounded-[9px] bg-transparent hover:bg-[#f6f7fa] border-0 text-[#19213d] font-sans font-semibold text-[11.5px] cursor-pointer transition-colors"
            >
              <Globe size={14} className="text-[#004bda]" />
              <span>EN</span>
            </button>

            <Link
              href="/portal?tab=credits"
              className="bg-[#eef4ff] hover:bg-[#e1ecff] border-0 transition-colors flex items-center gap-1.5 h-[34px] px-[12px] rounded-[17px] shrink-0 no-underline"
            >
              <img
                alt=""
                className="block max-w-none shrink-0"
                src="/assets/header_credit_icon.svg"
                width={15}
                height={15}
              />
              <span className="font-sans font-semibold text-[12px] text-[#19213d] whitespace-nowrap">
                <span className="lg:hidden">2,686</span>
                <span className="hidden lg:inline">2,686 Credits</span>
              </span>
            </Link>

            <Link
              href="/portal"
              aria-label="User Profile"
              className="relative shrink-0 size-[34px] rounded-full overflow-hidden border-0 hover:opacity-85 transition-opacity"
            >
              <img
                alt="User Profile"
                className="block size-full object-cover"
                src="/assets/header_user.svg"
                width={34}
                height={34}
              />
            </Link>
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="md:hidden bg-white border-b border-[#e4e6eb] px-4 py-2.5">
          <div className="w-full h-[38px] bg-[#f6f7fa] border border-[#e4e6eb] rounded-[19px] flex items-center gap-2 px-3.5">
            <Search size={15} className="text-[rgba(25,33,61,0.55)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 3D assets, surfaces, HDRIs..."
              className="w-full bg-transparent border-0 outline-none font-sans text-[13px] text-[#19213d]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="text-[rgba(25,33,61,0.55)] bg-transparent border-0 p-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/45 lg:hidden flex"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <aside
              className="bg-white w-[320px] max-w-[86vw] h-full overflow-y-auto px-[18px] py-[22px] shadow-2xl"
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

        {/* Body */}
        <div className="flex w-full relative items-stretch flex-1">
          {/* Sticky Desktop Sidebar (320px) */}
          <aside className="hidden lg:block bg-white w-[320px] shrink-0 border-r border-[#e4e6eb] lg:sticky lg:top-[64px] lg:self-start lg:h-[calc(100vh_/_0.9_-_64px)] overflow-y-auto px-[18px] py-[22px]">
            <GallerySidebar
              catalog={catalog}
              activeHierarchyKey={activeHierarchyKey}
              activeNavKey={activeNavKey}
              bookmarksCount={bookmarkedUids.length}
              onSelectHierarchy={handleSelectHierarchy}
              onSelectKnowledgeHub={handleSelectKnowledgeHub}
            />
          </aside>

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
            <main className="flex-1 min-w-0 px-4 sm:px-8 xl:px-[44px] pt-6 sm:pt-8 pb-[64px] flex flex-col gap-[32px] relative">
              {/* Hero Banner Bento Carousel */}
              <section
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
                className="hero-bento-carousel flex items-center relative w-full max-w-[1510px] h-[340px] sm:h-[380px] xl:h-[420px] shrink-0 overflow-hidden"
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
                      className={`bg-[#19213d] h-full min-w-0 overflow-hidden relative rounded-[12px] transition-[flex,margin-right,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isClickableSide ? "cursor-pointer group" : ""
                      }`}
                    >
                      <img
                        alt={
                          isCenter
                            ? "Onflow 3D Asset Library"
                            : ""
                        }
                        className={`size-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCenter
                            ? "opacity-100 scale-100"
                            : "opacity-90 group-hover:opacity-100 group-hover:scale-105"
                        }`}
                        src={imgSrc}
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-[#0d1326]/90 via-[#111936]/55 to-[#111936]/35 pointer-events-none transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCenter ? "opacity-100" : "opacity-0"
                        }`}
                      />

                      <div
                        aria-hidden={!isCenter}
                        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCenter
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2"
                        }`}
                      >
                        <div className="w-[660px] max-w-[calc(100vw-64px)] flex flex-col items-center justify-center text-center px-6 sm:px-10 gap-3.5">
                          <h2 className="font-google-sans font-bold leading-[1.2] text-[22px] sm:text-[30px] xl:text-[34px] text-white max-w-[660px] m-0">
                            <span className="underline decoration-[#4d88ff] decoration-2 underline-offset-4">
                              5,440+
                            </span>{" "}
                            Scanned 3D Assets, Surfaces & HDRIs
                          </h2>

                          <p className="font-sans font-normal leading-[21px] text-[13px] sm:text-[14px] text-white/85 max-w-[600px] m-0">
                            3D models, 8K PBR materials, modular kitbash kits,
                            and 32-bit environment maps captured from real-world
                            locations for Unreal Engine, Blender, and Maya.
                          </p>
                        </div>
                      </div>

                      <div
                        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 transition-opacity duration-500 ${
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
                                if (diff > 2) {
                                  diff -= HERO_CAROUSEL_IMAGES.length;
                                }
                                if (diff !== 0) {
                                  setHeroStep((prev) => prev + diff);
                                }
                              }}
                              aria-label={`Go to slide ${dotIdx + 1}`}
                              className={`h-[5px] rounded-full border-0 p-0 cursor-pointer transition-all duration-300 ${
                                isDotActive
                                  ? "w-6 bg-white"
                                  : "w-2 bg-white/40 hover:bg-white/70"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* 6 Category Pills Bar */}
              <section className="flex flex-wrap gap-[12px] items-center justify-center relative w-full max-w-[1510px] shrink-0">
                {CATEGORY_PILLS.map((pill) => {
                  const isSelected = activeCategoryPill === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => handleSelectCategoryPill(pill.id)}
                      className={`cursor-pointer flex gap-[14px] items-center pl-[6px] pr-[22px] py-[6px] relative rounded-[60px] shrink-0 border transition-all ${
                        isSelected
                          ? "bg-[#eef4ff] border-[#004bda] ring-1 ring-[#004bda]/40 shadow-sm"
                          : "bg-white border-[#e4e6eb] hover:border-[#004bda]/35 hover:shadow-xs"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center overflow-hidden relative rounded-[28px] shrink-0 size-[44px] transition-colors ${
                          isSelected ? "bg-[#004bda]" : "bg-[#19213d]"
                        }`}
                      >
                        <img
                          alt=""
                          className="block max-w-none"
                          src={pill.icon}
                          width={pill.iconWidth}
                          height={pill.iconHeight}
                        />
                      </div>
                      <span
                        className={`font-sans font-semibold text-[14px] whitespace-nowrap ${
                          isSelected ? "text-[#004bda]" : "text-[#19213d]"
                        }`}
                      >
                        {pill.label}
                      </span>
                    </button>
                  );
                })}
              </section>

              {/* Interactive Filtered Endless Grid (shown automatically when searching or selecting a Category Pill) */}
              {(activeCategoryPill || searchQuery.trim().length > 0) && (
                <section className="flex flex-col gap-[18px] bg-white p-[22px] rounded-[14px] border border-[#e4e6eb] shadow-[0px_4px_12px_rgba(25,33,61,0.04)] w-full max-w-[1510px] shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-google-sans font-bold text-[18px] text-[#19213d] m-0">
                        Filtered Results
                      </h3>
                      <span className="bg-[#004bda] text-white font-sans font-bold text-[11px] px-3 py-0.5 rounded-full">
                        {explorerFilteredItems.length.toLocaleString()} Assets
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
                      className="text-[12px] font-sans font-semibold text-[#004bda] hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Clear Filter ✕
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

              {/* Section 1: Recently Added */}
              <div className="w-full max-w-[1510px] shrink-0">
                <AssetSectionRow
                  title="Recently Added"
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
              <section className="flex flex-col gap-[18px] items-start relative w-full max-w-[1510px] shrink-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleSelectHierarchy("vietnam")}
                      className="flex gap-[8px] items-center bg-transparent border-0 p-0 cursor-pointer group text-left"
                    >
                      <h2 className="leading-[28px] m-0 font-google-sans text-[20px] sm:text-[23px] font-bold text-[#19213d] group-hover:text-[#004bda] transition-colors">
                        Collections
                      </h2>
                      <ChevronRight
                        size={18}
                        className="text-[#19213d] group-hover:text-[#004bda] transition-colors"
                      />
                    </button>
                    <p className="m-0 font-sans text-[12.5px] text-[rgba(25,33,61,0.68)]">
                      Themed asset packs organized by architecture, region, and
                      environment
                    </p>
                  </div>

                  <div className="flex gap-2 items-center shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setFeaturedPage(
                          (prev) =>
                            (prev - 1 + featuredPageCount) % featuredPageCount
                        )
                      }
                      aria-label="Previous Featured Collections"
                      className="size-[32px] rounded-[8px] bg-white hover:bg-[#f6f7fa] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d]"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFeaturedPage(
                          (prev) => (prev + 1) % featuredPageCount
                        )
                      }
                      aria-label="Next Featured Collections"
                      className="size-[32px] rounded-[8px] bg-white hover:bg-[#f6f7fa] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d]"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full">
                  {visibleFeaturedCollections.map((col) => (
                    <div
                      key={col.id}
                      onClick={() => handleSelectHierarchy(col.targetKey)}
                      className="group bg-white flex flex-col gap-[12px] h-[338px] overflow-hidden p-[12px] rounded-[12px] border border-[#e4e6eb] hover:border-[#004bda]/45 shadow-[0px_4px_12px_rgba(25,33,61,0.04)] hover:shadow-[0px_10px_24px_rgba(0,75,218,0.10)] cursor-pointer transition-all duration-200 hover:-translate-y-[2px]"
                    >
                      <div className="flex flex-1 gap-[5px] items-stretch min-h-0 relative w-full">
                        <div className="h-full relative rounded-[9px] flex-1 overflow-hidden bg-[#19213d]">
                          <img
                            alt={col.title}
                            className="object-cover size-full transition-transform duration-300 group-hover:scale-105"
                            src={col.images[0]}
                          />
                        </div>
                        <div className="h-full relative rounded-[9px] shrink-0 w-[23%] overflow-hidden bg-[#19213d]">
                          <img
                            alt=""
                            className="object-cover size-full"
                            src={col.images[1]}
                          />
                        </div>
                        <div className="h-full relative rounded-[9px] shrink-0 w-[14%] overflow-hidden bg-[#19213d]">
                          <img
                            alt=""
                            className="object-cover size-full"
                            src={col.images[2]}
                          />
                        </div>
                        <div className="h-full relative rounded-[9px] shrink-0 w-[7%] overflow-hidden bg-[#19213d]">
                          <img
                            alt=""
                            className="object-cover size-full"
                            src={col.images[3]}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-[#eef4ff] border border-[#004bda]/20 overflow-hidden rounded-full shrink-0 size-[40px] flex items-center justify-center">
                            <img
                              alt=""
                              className="size-full object-cover"
                              src="/assets/feat_avatar.png"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="m-0 truncate font-google-sans text-[15px] font-bold text-[#19213d] group-hover:text-[#004bda] transition-colors">
                              {col.title}
                            </h3>
                            <p className="m-0 truncate font-sans text-[11.5px] text-[rgba(25,33,61,0.68)]">
                              {col.province} • {col.era}
                            </p>
                          </div>
                        </div>
                        <span className="bg-[#eef4ff] text-[#004bda] font-sans font-bold text-[11px] px-2.5 py-1 rounded-[7px] shrink-0">
                          {col.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Architectural & Interior Assets */}
              <div className="w-full max-w-[1510px] shrink-0">
                <AssetSectionRow
                  title="Architectural & Interior"
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

              {/* Section 4: Trending Surfaces */}
              <div className="w-full max-w-[1510px] shrink-0">
                <AssetSectionRow
                  title="Trending Surfaces"
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

              {/* Section 5: Knowledge Hub — Documentations & Discuss Forums */}
              <section
                ref={knowledgeHubRef}
                className="grid grid-cols-1 xl:grid-cols-2 gap-[20px] w-full max-w-[1510px] shrink-0"
              >
                {/* Left: Documentations */}
                <div
                  className={`bg-white rounded-[14px] border p-[20px] flex flex-col justify-between gap-4 shadow-[0px_4px_12px_rgba(25,33,61,0.04)] transition-colors ${
                    activeNavKey === "Documentations"
                      ? "border-[#004bda] ring-1 ring-[#004bda]/25"
                      : "border-[#e4e6eb]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <h2 className="leading-[24px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">
                        Documentation & Guides
                      </h2>
                      <p className="m-0 font-sans text-[12px] text-[rgba(25,33,61,0.65)]">
                        Scan pipelines, material calibration, and engine export
                        workflows
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDocSlideIndex(
                            (prev) =>
                              (prev - 1 + DOCUMENTATION_SLIDES.length) %
                              DOCUMENTATION_SLIDES.length
                          )
                        }
                        aria-label="Previous Documentations"
                        className="size-[30px] rounded-[8px] bg-[#f6f7fa] hover:bg-[#eef4ff] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d]"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDocSlideIndex(
                            (prev) => (prev + 1) % DOCUMENTATION_SLIDES.length
                          )
                        }
                        aria-label="Next Documentations"
                        className="size-[30px] rounded-[8px] bg-[#f6f7fa] hover:bg-[#eef4ff] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d]"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-[#f0f2f5]">
                    {currentDocSlide.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectHierarchy(doc.targetKey)}
                        className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-[10px] cursor-pointer hover:bg-[#f6f7fa] transition-colors group"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="m-0 font-sans font-semibold text-[13.5px] leading-[19px] text-[#19213d] group-hover:text-[#004bda] transition-colors line-clamp-2">
                            <span className="text-[#004bda] font-bold">
                              {doc.prefix}
                            </span>
                            {doc.title}
                          </p>
                          <span className="font-sans text-[11px] text-[rgba(25,33,61,0.6)]">
                            {doc.meta}
                          </span>
                        </div>
                        <div className="h-[64px] w-[106px] sm:w-[126px] rounded-[8px] overflow-hidden shrink-0 bg-[#19213d]">
                          <img
                            src={doc.thumbnail}
                            alt=""
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        className={`h-[6px] rounded-full border-0 cursor-pointer transition-all ${
                          docSlideIndex === idx
                            ? "w-6 bg-[#004bda]"
                            : "w-2 bg-[#d5d9e2] hover:bg-[#b5bcc9]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Right: Discuss Forums */}
                <div
                  className={`bg-white rounded-[14px] border p-[20px] flex flex-col justify-between gap-4 shadow-[0px_4px_12px_rgba(25,33,61,0.04)] transition-colors ${
                    activeNavKey === "Forums" || activeNavKey === "News"
                      ? "border-[#004bda] ring-1 ring-[#004bda]/25"
                      : "border-[#e4e6eb]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <h2 className="leading-[24px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">
                        Community & Discussions
                      </h2>
                      <p className="m-0 font-sans text-[12px] text-[rgba(25,33,61,0.65)]">
                        Workflow tips, shader breakdowns, and technical Q&A
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setForumSlideIndex(
                            (prev) =>
                              (prev - 1 + FORUM_SLIDES.length) %
                              FORUM_SLIDES.length
                          )
                        }
                        aria-label="Previous Forum Topics"
                        className="size-[30px] rounded-[8px] bg-[#f6f7fa] hover:bg-[#eef4ff] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d]"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForumSlideIndex(
                            (prev) => (prev + 1) % FORUM_SLIDES.length
                          )
                        }
                        aria-label="Next Forum Topics"
                        className="size-[30px] rounded-[8px] bg-[#f6f7fa] hover:bg-[#eef4ff] border border-[#e4e6eb] flex items-center justify-center cursor-pointer text-[#19213d]"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-[#f0f2f5]">
                    {currentForumSlide.map((forum) => (
                      <div
                        key={forum.id}
                        onClick={() => handleSelectHierarchy(forum.targetKey)}
                        className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-[10px] cursor-pointer hover:bg-[#f6f7fa] transition-colors group"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#eef4ff] text-[#004bda] font-sans font-bold text-[10px] px-2 py-0.5 rounded-[5px]">
                              {forum.tag}
                            </span>
                            <span className="font-sans text-[11px] text-[rgba(25,33,61,0.6)]">
                              {forum.meta}
                            </span>
                          </div>
                          <p className="m-0 font-sans font-medium text-[13.5px] leading-[19px] text-[#19213d] group-hover:text-[#004bda] transition-colors line-clamp-2">
                            {forum.title}
                          </p>
                        </div>
                        <div className="h-[64px] w-[78px] rounded-[8px] overflow-hidden shrink-0 bg-[#19213d]">
                          <img
                            src={forum.thumbnail}
                            alt=""
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        className={`h-[6px] rounded-full border-0 cursor-pointer transition-all ${
                          forumSlideIndex === idx
                            ? "w-6 bg-[#004bda]"
                            : "w-2 bg-[#d5d9e2] hover:bg-[#b5bcc9]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 6: HDRI Environments */}
              <div className="w-full max-w-[1510px] shrink-0">
                <AssetSectionRow
                  title="HDRI Environments — 20% Off"
                  subtitle="360° 32-bit EXR skies and interior lighting maps"
                  items={hdriEnvironmentItems}
                  onSelectItem={handleOpenItemOverlay}
                  onClickTitle={() => handleSelectHierarchy("discount-hdris")}
                  bookmarkedSet={bookmarkedSet}
                  cartSet={cartSet}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleCart={handleToggleCart}
                />
              </div>

              {/* Section 7: Modular & Kitbash */}
              <div className="w-full max-w-[1510px] shrink-0">
                <AssetSectionRow
                  title="Modular & Kitbash"
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

              {/* Section 8: Free Assets */}
              <div className="w-full max-w-[1510px] shrink-0">
                <AssetSectionRow
                  title="Free Assets"
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

              {/* Section 9: Complete Catalog Explorer */}
              <section
                ref={explorerRef}
                className="flex flex-col gap-[20px] items-start bg-white p-[22px] sm:p-[28px] rounded-[14px] border border-[#e4e6eb] shadow-[0px_4px_12px_rgba(25,33,61,0.04)] relative w-full max-w-[1510px] shrink-0"
                data-name="Complete Catalog Explorer"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-google-sans font-bold text-[20px] sm:text-[24px] text-[#19213d] m-0">
                        Browse All Assets
                      </h2>
                      <span className="bg-[#004bda] text-white font-sans font-bold text-[11px] px-3 py-1 rounded-full">
                        {explorerFilteredItems.length.toLocaleString()} /{" "}
                        {fullCatalogLoaded ? catalog.length.toLocaleString() : catalog.length} Assets
                      </span>
                    </div>
                    <p className="font-sans font-normal text-[13px] text-[rgba(25,33,61,0.7)] m-0">
                      Filter across 3D Assets (135), Surfaces (5,313), and
                      HDRIs (252).
                    </p>
                  </div>

                  {/* Primary Group Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {LOTPIXEL_CATEGORY_TAXONOMY.map((cluster) => {
                      const isClusterActive =
                        activeLotpixelCluster === cluster.id;
                      return (
                        <button
                          key={cluster.id}
                          type="button"
                          onClick={() => {
                            setActiveLotpixelCluster(cluster.id);
                            setActiveLotpixelSubcat("all");
                            setActiveCategoryPill(null);
                          }}
                          className={`cursor-pointer px-3.5 py-2 rounded-[10px] font-sans text-[12px] font-semibold border transition-colors flex items-center gap-2 ${
                            isClusterActive
                              ? "bg-[#004bda] text-white border-[#004bda]"
                              : "bg-[#f8f9fb] text-[#19213d] border-[#e4e6eb] hover:bg-[#eef4ff] hover:text-[#004bda]"
                          }`}
                        >
                          <span>{cluster.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-[5px] ${
                              isClusterActive
                                ? "bg-white/20 text-white"
                                : "bg-[#eaecef] text-[#19213d]"
                            }`}
                          >
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
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#f0f2f5] w-full">
                      <button
                        type="button"
                        onClick={() => setActiveLotpixelSubcat("all")}
                        className={`cursor-pointer px-3 py-1.5 rounded-full font-sans text-[11px] font-semibold border transition-colors ${
                          activeLotpixelSubcat === "all"
                            ? "bg-[#19213d] text-white border-[#19213d]"
                            : "bg-white text-[#19213d] border-[#e4e6eb] hover:bg-[#f6f7fa]"
                        }`}
                      >
                        All {currentCluster.label} (
                        {currentCluster.totalCount.toLocaleString()})
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
                            className={`cursor-pointer px-3 py-1.5 rounded-full font-sans text-[11px] font-medium border transition-colors ${
                              isSubActive
                                ? "bg-[#004bda] text-white border-[#004bda]"
                                : "bg-white text-[#19213d] border-[#e4e6eb] hover:bg-[#eef4ff] hover:text-[#004bda]"
                            }`}
                          >
                            {sub.label} ({sub.count})
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
            </main>
          )}
        </div>
      </div>

      {/* Item Menu Overlay Modal */}
      <ItemMenuOverlay
        isOpen={overlayOpen}
        asset={selectedOverlayAsset}
        onClose={() => setOverlayOpen(false)}
        onExpand={handleExpandToItemPage}
      />
    </div>
  );
}
