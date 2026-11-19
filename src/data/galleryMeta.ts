import {
  LotpixelAssetItem,
  VIETNAM_ERAS,
  VIETNAM_HDRIS_TAXONOMY,
  VIETNAM_MATERIALS_TAXONOMY,
  VIETNAM_REGIONS_AND_MONUMENTS,
  VietnamMonumentMeta,
  VietnamRegionKey,
} from "./lotpixelCatalog";

export type AssetItem = LotpixelAssetItem;

export type HierarchySectionMeta = {
  key: string;
  level:
    | "country"
    | "region"
    | "monument"
    | "material"
    | "hdri"
    | "bookmarks"
    | "collection";
  name: string;
  englishName?: string;
  collectionTitle: string;
  description: string;
  province?: string;
  era?: string;
  eraDetail?: string;
  badge?: string;
  scanTech?: string;
  regionKey?: VietnamRegionKey;
  pathSegments: { label: string; targetKey: string | null }[];
  defaultSubtitle: string;
  subMonuments?: VietnamMonumentMeta[];
};

const ALL_MONUMENTS = VIETNAM_REGIONS_AND_MONUMENTS.flatMap((r) => r.monuments);

export const HIERARCHY_SECTIONS: Record<string, HierarchySectionMeta> = {
  vietnam: {
    key: "vietnam",
    level: "country",
    name: "Vietnam",
    englishName: "Vietnam Location Scans",
    collectionTitle: "Vietnam 3D Library",
    description:
      "5,440+ scanned 3D models, calibrated PBR surfaces, and HDRI environments captured across architectural sites, urban districts, and landscapes in Northern, Central, and Southern Vietnam.",
    province: "All Provinces • 18 Locations",
    era: "Dong Son – Ly – Tran – Le – Nguyen – Modern",
    badge: "Regional Library",
    scanTech: "LiDAR & 8K Photogrammetry",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Vietnam", targetKey: "vietnam" },
    ],
    defaultSubtitle: "Vietnam Locations",
    subMonuments: ALL_MONUMENTS.slice(0, 6),
  },
  bookmarks: {
    key: "bookmarks",
    level: "bookmarks",
    name: "Bookmarks",
    englishName: "Saved Assets",
    collectionTitle: "Bookmarked Assets",
    description:
      "Your saved 3D models, PBR surfaces, and HDRIs ready for export across FBX, GLB, OBJ, and USD.",
    province: "Personal Library",
    badge: "Saved List",
    scanTech: "FBX / GLB / OBJ / USD",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Bookmarks", targetKey: "bookmarks" },
    ],
    defaultSubtitle: "Saved Assets",
  },
  "recent-releases": {
    key: "recent-releases",
    level: "collection",
    name: "Recently Added",
    collectionTitle: "Recently Added 3D Assets",
    description:
      "Latest scanned 3D models with clean topology, UV maps, LOD0–LOD3 meshes, and calibrated 4K–8K PBR textures.",
    badge: "New Arrivals",
    scanTech: "8K PBR & LOD0–LOD3",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Recently Added", targetKey: "recent-releases" },
    ],
    defaultSubtitle: "Recently Added",
  },
  "historical-artifacts": {
    key: "historical-artifacts",
    level: "collection",
    name: "Architectural & Interior",
    collectionTitle: "Architectural & Interior Assets",
    description:
      "Scanned stonework, timber structures, interior furnishings, and decorative architectural elements for environment assembly.",
    badge: "3D Assets",
    scanTech: "Structured Light & Laser Scan",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Architectural & Interior", targetKey: "historical-artifacts" },
    ],
    defaultSubtitle: "Architectural & Interior",
  },
  "trending-materials": {
    key: "trending-materials",
    level: "collection",
    name: "Trending Surfaces",
    collectionTitle: "Trending PBR Surfaces",
    description:
      "Most downloaded tileable materials including bluestone, aged wood, brick, metal, and weathered plaster in 1K–8K resolution.",
    badge: "Popular",
    scanTech: "Tileable 1K–8K PBR",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Trending Surfaces", targetKey: "trending-materials" },
    ],
    defaultSubtitle: "Trending Surfaces",
  },
  "discount-hdris": {
    key: "discount-hdris",
    level: "collection",
    name: "HDRI Environments — 20% Off",
    collectionTitle: "HDRI Environments (20% Off)",
    description:
      "360° 32-bit EXR lighting maps covering exterior daylight, overcast skies, and interior spaces—currently 20% off in Credits.",
    badge: "20% Off",
    scanTech: "32-bit EXR Environment",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/HDRIs", targetKey: "discount-hdris" },
    ],
    defaultSubtitle: "HDRI Environments",
  },
  "kitbash-ready": {
    key: "kitbash-ready",
    level: "collection",
    name: "Modular & Kitbash",
    collectionTitle: "Modular Architecture & Props",
    description:
      "Modular structural pieces, street props, and building components built for fast scene assembly in Unreal Engine 5, Unity, and Blender.",
    badge: "UE5 / Blender",
    scanTech: "Modular 3D",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Modular & Kitbash", targetKey: "kitbash-ready" },
    ],
    defaultSubtitle: "Modular & Kitbash",
  },
  "free-assets": {
    key: "free-assets",
    level: "collection",
    name: "Free Assets",
    collectionTitle: "Free 3D Assets & Surfaces (0 Credits)",
    description:
      "1,300+ zero-credit 3D models and PBR textures available for personal, academic, and studio projects.",
    badge: "Free • 0 Credits",
    scanTech: "Standard License",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Free Assets", targetKey: "free-assets" },
    ],
    defaultSubtitle: "Free Assets",
  },
};

// Populate Regions & Locations
for (const reg of VIETNAM_REGIONS_AND_MONUMENTS) {
  HIERARCHY_SECTIONS[reg.key] = {
    key: reg.key,
    level: "region",
    name: reg.name,
    englishName: reg.englishName,
    collectionTitle: `${reg.name} Collection`,
    description: reg.description,
    province: reg.subLabel,
    badge: `${reg.monuments.length} Locations`,
    scanTech: "LiDAR & 8K Photogrammetry",
    regionKey: reg.key,
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Vietnam", targetKey: "vietnam" },
      { label: `/${reg.name}`, targetKey: reg.key },
    ],
    defaultSubtitle: reg.monuments[0]?.name || reg.name,
    subMonuments: reg.monuments,
  };

  for (const mon of reg.monuments) {
    HIERARCHY_SECTIONS[mon.key] = {
      key: mon.key,
      level: "monument",
      name: mon.name,
      englishName: mon.englishName,
      collectionTitle: mon.name,
      description: mon.description,
      province: mon.province,
      era: mon.era,
      eraDetail: mon.eraDetail,
      badge: mon.badge,
      scanTech: mon.scanTech,
      regionKey: reg.key,
      pathSegments: [
        { label: "Library", targetKey: null },
        { label: "/Vietnam", targetKey: "vietnam" },
        { label: `/${reg.name}`, targetKey: reg.key },
        { label: `/${mon.name}`, targetKey: mon.key },
      ],
      defaultSubtitle: `${mon.name} • ${mon.province}`,
      subMonuments: reg.monuments.filter((m) => m.key !== mon.key),
    };
  }
}

// Populate Surfaces and HDRIs
for (const mat of VIETNAM_MATERIALS_TAXONOMY) {
  HIERARCHY_SECTIONS[mat.key] = {
    key: mat.key,
    level: "material",
    name: mat.name,
    englishName: mat.subtitle,
    collectionTitle: mat.name,
    description: mat.description,
    province: mat.provinceHint,
    badge: "PBR Surface",
    scanTech: "1K–8K Tileable Maps",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/Surfaces", targetKey: null },
      { label: `/${mat.name}`, targetKey: mat.key },
    ],
    defaultSubtitle: mat.subtitle,
  };
}

for (const hdri of VIETNAM_HDRIS_TAXONOMY) {
  HIERARCHY_SECTIONS[hdri.key] = {
    key: hdri.key,
    level: "hdri",
    name: hdri.name,
    englishName: hdri.subtitle,
    collectionTitle: hdri.name,
    description: hdri.description,
    province: hdri.provinceHint,
    badge: "HDRI Environment",
    scanTech: "360° 32-bit EXR",
    pathSegments: [
      { label: "Library", targetKey: null },
      { label: "/HDRIs", targetKey: null },
      { label: `/${hdri.name}`, targetKey: hdri.key },
    ],
    defaultSubtitle: hdri.subtitle,
  };
}

const LEGACY_HIERARCHY_ALIASES: Record<string, string> = {
  Vietnam: "vietnam",
  Northside: "mien-bac",
  Centerside: "mien-trung",
  Southside: "mien-nam",
  "Thang Long Imperial Citadel": "hoang-thanh-thang-long",
  "One-Pillar Pagoda": "chua-mot-cot",
  "Quang Tri Citadel": "thanh-co-quang-tri",
  "Hue Imperial City": "co-do-hue",
  "Hoi Son Temple": "chua-co-hoi-son",
  "Independence Palace": "dinh-doc-lap",
};

export function resolveHierarchyKey(key: string | null): string | null {
  if (!key) return null;
  if (HIERARCHY_SECTIONS[key]) return key;
  return LEGACY_HIERARCHY_ALIASES[key] ?? null;
}

export type FeaturedCollectionItem = {
  id: string;
  title: string;
  subtitle: string;
  province: string;
  era: string;
  targetKey: string;
  fallbackImages: string[];
};

export const FEATURED_COLLECTIONS: FeaturedCollectionItem[] = [
  {
    id: "co-do-hue",
    title: "Hue Imperial City & Royal Tombs",
    subtitle: "Imperial Enclosure, Meridian Gate & Nguyen Mausoleums",
    province: "Thua Thien Hue",
    era: "Nguyen Dynasty",
    targetKey: "co-do-hue",
    fallbackImages: [
      "/assets/feat_rect96.png",
      "/assets/feat_rect97.png",
      "/assets/feat_rect98.png",
      "/assets/feat_rect99.png",
    ],
  },
  {
    id: "hoang-thanh-thang-long",
    title: "Thang Long Citadel & One-Pillar Pagoda",
    subtitle: "Architectural Gates, Foundations & Timber Shrines",
    province: "Ba Dinh, Hanoi",
    era: "Ly – Tran – Le",
    targetKey: "hoang-thanh-thang-long",
    fallbackImages: [
      "/assets/hero_img2.png",
      "/assets/feat_rect97.png",
      "/assets/feat_rect98.png",
      "/assets/feat_rect96.png",
    ],
  },
  {
    id: "thanh-co-quang-tri",
    title: "Quang Tri Citadel & Hoi Son Temple",
    subtitle: "1809 Vauban Brick Fortress & 18th-Century Timber Hall",
    province: "Quang Tri • Thu Duc",
    era: "18th–19th c.",
    targetKey: "thanh-co-quang-tri",
    fallbackImages: [
      "/assets/feat_rect97.png",
      "/assets/feat_rect96.png",
      "/assets/feat_rect99.png",
      "/assets/feat_rect98.png",
    ],
  },
  {
    id: "my-son-hoi-an",
    title: "My Son Sanctuary & Hoi An Ancient Town",
    subtitle: "Champa Brick Temple Towers & Historic Trading Port",
    province: "Quang Nam",
    era: "Champa • 16th–19th c.",
    targetKey: "thanh-dia-my-son",
    fallbackImages: [
      "/assets/hero_img3.png",
      "/assets/feat_rect96.png",
      "/assets/feat_rect97.png",
      "/assets/feat_rect98.png",
    ],
  },
  {
    id: "dinh-doc-lap-sai-gon",
    title: "Independence Palace & Old Saigon",
    subtitle: "Tropical Modernism & Indochine Urban Architecture",
    province: "Ho Chi Minh City",
    era: "Modern & Indochine",
    targetKey: "dinh-doc-lap",
    fallbackImages: [
      "/assets/hero_img1.png",
      "/assets/feat_rect98.png",
      "/assets/feat_rect96.png",
      "/assets/feat_rect97.png",
    ],
  },
  {
    id: "van-mieu-co-loa",
    title: "Temple of Literature & Co Loa Citadel",
    subtitle: "Doctoral Stone Stelae, Khue Van Cac & Dong Son Relics",
    province: "Hanoi",
    era: "Au Lac • Ly Dynasty",
    targetKey: "van-mieu-quoc-tu-giam",
    fallbackImages: [
      "/assets/feat_rect98.png",
      "/assets/hero_img4.png",
      "/assets/feat_rect96.png",
      "/assets/feat_rect99.png",
    ],
  },
];

export const CATEGORY_PILLS = [
  {
    id: "historical-3d",
    label: "Architectural 3D",
    icon: "/assets/pill_historical3d.svg",
    iconWidth: 24,
    iconHeight: 22,
  },
  {
    id: "general-3d",
    label: "3D Assets",
    icon: "/assets/pill_general3d.svg",
    iconWidth: 26,
    iconHeight: 26,
  },
  {
    id: "materials-textures",
    label: "Surfaces",
    icon: "/assets/pill_materials.svg",
    iconWidth: 26,
    iconHeight: 26.049,
  },
  {
    id: "hdris",
    label: "HDRIs",
    icon: "/assets/pill_hdris.svg",
    iconWidth: 24,
    iconHeight: 17.557,
  },
  {
    id: "kitbash-3d",
    label: "Kitbash",
    icon: "/assets/pill_kitbash_sdk.svg",
    iconWidth: 24,
    iconHeight: 24,
  },
  {
    id: "sdk-api",
    label: "Bridge & Plugins",
    icon: "/assets/pill_kitbash_sdk.svg",
    iconWidth: 24,
    iconHeight: 24,
  },
];

export type ShowcaseDocItem = {
  id: string;
  prefix: string;
  title: string;
  meta: string;
  targetKey: string;
  thumbnail: string;
};

export const DOCUMENTATION_SLIDES: ShowcaseDocItem[][] = [
  [
    {
      id: "doc-1",
      prefix: "Scanning: ",
      title: "Capturing Fine Bronze Relief & Metallic Surfaces with Structured Light Scanners",
      meta: "8 min read • Photogrammetry",
      targetKey: "thanh-co-loa",
      thumbnail: "/assets/feat_rect96.png",
    },
    {
      id: "doc-2",
      prefix: "LiDAR Pipeline: ",
      title: "Sub-Millimeter Point Cloud Alignment and 8K PBR Baking for Timber Structures",
      meta: "12 min read • Workflow",
      targetKey: "chua-mot-cot",
      thumbnail: "/assets/feat_rect97.png",
    },
    {
      id: "doc-3",
      prefix: "Surface Guide: ",
      title: "Building Tileable Fired Brick & Masonry Materials with 16-bit Displacement",
      meta: "10 min read • Materials",
      targetKey: "thanh-dia-my-son",
      thumbnail: "/assets/feat_rect98.png",
    },
    {
      id: "doc-4",
      prefix: "Unreal Engine 5: ",
      title: "Configuring Nanite Meshes and LOD Chains for Large Architectural Assemblies",
      meta: "15 min read • UE 5.4",
      targetKey: "co-do-hue",
      thumbnail: "/assets/feat_rect99.png",
    },
  ],
  [
    {
      id: "doc-5",
      prefix: "Lighting: ",
      title: "Exterior Scene Setup Using 32-bit EXR Golden-Hour HDRI Environments",
      meta: "9 min read • Rendering",
      targetKey: "pho-co-hoi-an",
      thumbnail: "/assets/hero_img2.png",
    },
    {
      id: "doc-6",
      prefix: "Architecture: ",
      title: "Modular Concrete Facade & Brise-Soleil Assembly for ArchViz Projects",
      meta: "11 min read • BIM & 3D",
      targetKey: "dinh-doc-lap",
      thumbnail: "/assets/hero_img1.png",
    },
    {
      id: "doc-7",
      prefix: "Micro-Mesh: ",
      title: "Normal Map & Cavity Extraction for Carved Stone Surfaces",
      meta: "14 min read • Texturing",
      targetKey: "van-mieu-quoc-tu-giam",
      thumbnail: "/assets/hero_img3.png",
    },
    {
      id: "doc-8",
      prefix: "Shader Setup: ",
      title: "Calibrating Stone, Aged Wood, and Clay Roof Tile Shaders for ACES Pipelines",
      meta: "7 min read • Lookdev",
      targetKey: "mat-da-thanh-cam-thach",
      thumbnail: "/assets/hero_img4.png",
    },
  ],
  [
    {
      id: "doc-9",
      prefix: "Field Capture: ",
      title: "Combining RTK Drone Photogrammetry with Terrestrial LiDAR for Terrain Scans",
      meta: "13 min read • Capture",
      targetKey: "co-do-hoa-lu-trang-an",
      thumbnail: "/assets/feat_rect97.png",
    },
    {
      id: "doc-10",
      prefix: "Optimization: ",
      title: "Decimating High-Poly Point Clouds into Real-Time Game Assets",
      meta: "10 min read • Optimization",
      targetKey: "thanh-co-quang-tri",
      thumbnail: "/assets/feat_rect96.png",
    },
    {
      id: "doc-11",
      prefix: "Bridge Plugin: ",
      title: "Direct Asset Export with Onflow Bridge for Blender 4.2, Maya, and 3ds Max",
      meta: "6 min read • Developer Docs",
      targetKey: "kitbash-ready",
      thumbnail: "/assets/feat_rect99.png",
    },
    {
      id: "doc-12",
      prefix: "Interior Scans: ",
      title: "Multi-Station Interior LiDAR Registration for Heavy Timber Framing",
      meta: "9 min read • Scanning",
      targetKey: "to-dinh-giac-lam",
      thumbnail: "/assets/feat_rect98.png",
    },
  ],
];

export type ForumTopicItem = {
  id: string;
  tag: string;
  title: string;
  meta: string;
  targetKey: string;
  thumbnail: string;
};

export const FORUM_SLIDES: ForumTopicItem[][] = [
  [
    {
      id: "forum-1",
      tag: "Showcase",
      title: "Real-Time Urban District Walkthrough Built in Unreal Engine 5.4",
      meta: "42 replies • 1.2k views",
      targetKey: "kien-truc-sai-gon-gia-dinh",
      thumbnail: "/assets/hero_img1.png",
    },
    {
      id: "forum-2",
      tag: "Scanning",
      title: "Comparing Terrestrial LiDAR vs. Cross-Polarized Photogrammetry on Weathered Stone",
      meta: "68 replies • 2.4k views",
      targetKey: "vietnam",
      thumbnail: "/assets/hero_img2.png",
    },
    {
      id: "forum-3",
      tag: "Environment",
      title: "Building Modular Southeast Asian Courtyard Environments for Indie Games & VFX",
      meta: "35 replies • 980 views",
      targetKey: "hoang-thanh-thang-long",
      thumbnail: "/assets/hero_img3.png",
    },
    {
      id: "forum-4",
      tag: "Shaders",
      title: "Layering Limewash Plaster with Moisture Masks in Blender Cycles & Octane",
      meta: "51 replies • 1.8k views",
      targetKey: "mat-tuong-voi-da-ong",
      thumbnail: "/assets/hero_img4.png",
    },
  ],
  [
    {
      id: "forum-5",
      tag: "Architecture",
      title: "Snap-Grid Dimensions for Modular Timber Truss & Roof Tile Kits",
      meta: "29 replies • 740 views",
      targetKey: "chua-but-thap-dinh-bang",
      thumbnail: "/assets/feat_rect96.png",
    },
    {
      id: "forum-6",
      tag: "Lighting",
      title: "Balancing Sunset HDRIs with Practical Interior Lights in UE5 Lumen",
      meta: "61 replies • 2.1k views",
      targetKey: "co-do-hue",
      thumbnail: "/assets/feat_rect97.png",
    },
    {
      id: "forum-7",
      tag: "Q&A",
      title: "Vertex Blending Urban Asphalt Patches & Road Markings Without Visible Tiling",
      meta: "19 replies • 530 views",
      targetKey: "mat-dat-phu-sa-dia-hinh",
      thumbnail: "/assets/feat_rect98.png",
    },
    {
      id: "forum-8",
      tag: "Concept Art",
      title: "Using Scanned Terracotta & Stone Kitbash Packs for Rapid Environment Blockouts",
      meta: "24 replies • 690 views",
      targetKey: "van-hoa-oc-eo-phu-nam",
      thumbnail: "/assets/feat_rect99.png",
    },
  ],
  [
    {
      id: "forum-9",
      tag: "Resources",
      title: "Starter Pack: 1,300+ Free 3D Models & PBR Surfaces for Students and Indie Teams",
      meta: "94 replies • 3.8k views",
      targetKey: "free-assets",
      thumbnail: "/assets/feat_rect97.png",
    },
    {
      id: "forum-10",
      tag: "Pipeline",
      title: "GLB vs. USDZ File Size and Draw-Call Benchmarks for WebXR Viewers",
      meta: "31 replies • 860 views",
      targetKey: "thanh-nha-ho",
      thumbnail: "/assets/feat_rect96.png",
    },
    {
      id: "forum-11",
      tag: "Terrain",
      title: "Importing Subsurface Tunnel & Clay Terrain Meshes into Unity URP",
      meta: "47 replies • 1.5k views",
      targetKey: "dia-dao-cu-chi",
      thumbnail: "/assets/hero_img2.png",
    },
    {
      id: "forum-12",
      tag: "Roadmap",
      title: "Asset Requests: Suggest New Environments, Urban Props, and Surface Packs for 2027",
      meta: "53 replies • 1.4k views",
      targetKey: "vietnam",
      thumbnail: "/assets/hero_img3.png",
    },
  ],
];

export const FILTER_OPTIONS: Record<string, string[]> = {
  tag: [
    "All Tags",
    "3D Model",
    "Texture",
    "HDRIs & Ground",
    "Nature",
    "Interior",
    "Building",
    "Industrial",
    "Stone & Marble",
    "Wood",
    "Metal",
    "Fabric",
    "Concrete",
    "Tile",
    "Wall",
    "Brick",
    "Roof",
    "Asphalt",
  ],
  format: ["All Formats", "fbx", "obj", "glb", "usd", "png", "jpg", "tiff", "exr"],
  era: ["All Eras", ...VIETNAM_ERAS],
  range: ["All Ranges", "Free", "1 - 5 Credits", "6 - 20 Credits"],
  date: ["Any Date", "Last 7 days", "Last 30 days", "2025 - 2026"],
  sort: ["Relevance", "Newest", "Credits: Low to High", "File Size"],
};
