import initialCatalog from "./lotpixelInitial.json";

export type VietnamRegionKey = "mien-bac" | "mien-trung" | "mien-nam";

export type LotpixelAssetItem = {
  uid: string;
  id: string;
  randname: string;
  title: string;
  subtitle: string;
  monument: string;
  region: string;
  categoryLabel: string;
  subcategoryLabel: string;
  assetGroup: "3d-models" | "textures" | string;
  categorySlug: string;
  subcategorySlug: string;
  pillCategory:
    | "historical-3d"
    | "general-3d"
    | "materials-textures"
    | "hdris"
    | "kitbash-3d"
    | "sdk-api"
    | string;
  credits: string;
  isFree: boolean;
  size: string;
  formats: string[];
  imgUrl: string;
  banner: string;
  linktag: string;
  dataType: string;
  cardSize: string;
  sensitive: boolean;
  sourceUrl: string;
  // Enriched Vietnam heritage & material classification metadata
  regionKey?: VietnamRegionKey;
  regionLabel?: string;
  monumentKey?: string;
  province?: string;
  era?: string;
  eraDetail?: string;
  materialGroupKey?: string;
  hdriGroupKey?: string;
};

export const VIETNAM_ERAS = [
  "Dong Son & Au Lac (Bronze Age)",
  "Ly – Tran – Le Dynasties (1010–1788)",
  "Nguyen Dynasty (1802–1945)",
  "Champa Kingdom (4th–14th c.)",
  "Oc Eo – Funan (1st–7th c.)",
  "Indochine & Tropical Modernism",
  "Modern Landmarks",
] as const;

export type VietnamMonumentMeta = {
  key: string;
  name: string;
  englishName: string;
  regionKey: VietnamRegionKey;
  regionName: string;
  province: string;
  era: string;
  eraDetail: string;
  badge: string;
  scanTech: string;
  description: string;
  legacyAliases: string[];
};

export type VietnamRegionMeta = {
  key: VietnamRegionKey;
  name: string;
  englishName: string;
  subLabel: string;
  legacyAlias: "Northside" | "Centerside" | "Southside";
  description: string;
  monuments: VietnamMonumentMeta[];
};

export const VIETNAM_REGIONS_AND_MONUMENTS: VietnamRegionMeta[] = [
  {
    key: "mien-bac",
    name: "Northern Vietnam",
    englishName: "Red River Delta & Ancient Capitals",
    subLabel: "Hanoi • Ninh Binh • Bac Ninh",
    legacyAlias: "Northside",
    description:
      "Scanned 3D architecture, structures, and materials from Northern Vietnam and the Red River Delta, including Thang Long Imperial Citadel, One-Pillar Pagoda, Temple of Literature, Hoa Lu, and Co Loa.",
    monuments: [
      {
        key: "hoang-thanh-thang-long",
        name: "Thang Long Imperial Citadel",
        englishName: "Imperial Citadel of Thang Long",
        regionKey: "mien-bac",
        regionName: "Northern Vietnam",
        province: "Ba Dinh, Hanoi",
        era: "Ly – Tran – Le Dynasties (1010–1788)",
        eraDetail: "11th–18th Century (1010–1788)",
        badge: "Architectural Complex",
        scanTech: "LiDAR & 8K Photogrammetry",
        description:
          "Royal enclosure in central Hanoi featuring Doan Mon Gate, Kinh Thien Palace Foundation, Hau Lau Pavilion, and multi-period brick and stone masonry.",
        legacyAliases: [
          "Thang Long Imperial Citadel",
          "Thăng Long Imperial Citadel",
        ],
      },
      {
        key: "chua-mot-cot",
        name: "One-Pillar Pagoda",
        englishName: "One-Pillar Pagoda",
        regionKey: "mien-bac",
        regionName: "Northern Vietnam",
        province: "Ba Dinh, Hanoi",
        era: "Ly – Tran – Le Dynasties (1010–1788)",
        eraDetail: "Founded 1049 (Ly Dynasty)",
        badge: "Timber Architecture",
        scanTech: "Structured Light & 8K PBR",
        description:
          "Built in 1049, One-Pillar Pagoda features an ironwood shrine elevated on a single stone pillar over Linh Chieu Pond, captured with timber joinery and roof tile detail.",
        legacyAliases: [
          "One-Pillar Pagoda",
          "One-Pillar Pagoda (Diên Hựu)",
        ],
      },
      {
        key: "van-mieu-quoc-tu-giam",
        name: "Temple of Literature",
        englishName: "Temple of Literature & Imperial Academy",
        regionKey: "mien-bac",
        regionName: "Northern Vietnam",
        province: "Dong Da, Hanoi",
        era: "Ly – Tran – Le Dynasties (1010–1788)",
        eraDetail: "Founded 1070",
        badge: "Architectural Complex",
        scanTech: "TLS LiDAR & Micro-Detail Scan",
        description:
          "Confucian academy complex featuring Khue Van Cac Pavilion, Great Middle Gate, courtyard walls, and 82 carved stone stelae.",
        legacyAliases: ["Temple of Literature (Văn Miếu)"],
      },
      {
        key: "co-do-hoa-lu-trang-an",
        name: "Hoa Lu Ancient Capital & Trang An",
        englishName: "Hoa Lu Ancient Capital & Trang An",
        regionKey: "mien-bac",
        regionName: "Northern Vietnam",
        province: "Hoa Lu, Ninh Binh",
        era: "Ly – Tran – Le Dynasties (1010–1788)",
        eraDetail: "Dinh – Early Le Dynasties (968–1009)",
        badge: "Terrain & Architecture",
        scanTech: "Drone Photogrammetry & LiDAR",
        description:
          "10th-century capital set among limestone karst formations and waterways in Trang An, including stone temples, rock surfaces, and carved reliefs.",
        legacyAliases: ["Hoa Lư Ancient Capital & Tràng An"],
      },
      {
        key: "thanh-co-loa",
        name: "Co Loa Spiral Citadel",
        englishName: "Co Loa Spiral Citadel",
        regionKey: "mien-bac",
        regionName: "Northern Vietnam",
        province: "Dong Anh, Hanoi",
        era: "Dong Son & Au Lac (Bronze Age)",
        eraDetail: "Au Lac Kingdom (3rd c. BCE)",
        badge: "Archaeological Site",
        scanTech: "Archaeological Scan & PBR",
        description:
          "Three-ring earthen rampart site with moats, Upper Temple structures, and scanned Bronze Age metal and stone objects.",
        legacyAliases: ["Cổ Loa Spiral Citadel"],
      },
      {
        key: "chua-but-thap-dinh-bang",
        name: "But Thap Pagoda & Dinh Bang Communal Hall",
        englishName: "But Thap Pagoda & Dinh Bang Communal Hall",
        regionKey: "mien-bac",
        regionName: "Northern Vietnam",
        province: "Thuan Thanh & Tu Son, Bac Ninh",
        era: "Ly – Tran – Le Dynasties (1010–1788)",
        eraDetail: "17th–18th Century",
        badge: "Timber & Stone Scan",
        scanTech: "8K Photogrammetry",
        description:
          "Northern Vietnamese wood and stone structures featuring the five-tier Bao Nghiem Stone Stupa, carved statues, and ironwood truss framing at Dinh Bang.",
        legacyAliases: ["Bút Tháp Pagoda & Đình Bảng Hall"],
      },
    ],
  },
  {
    key: "mien-trung",
    name: "Central Vietnam",
    englishName: "Hue, Hoi An & Central Coast",
    subLabel: "Hue • Quang Tri • Quang Nam • Thanh Hoa • Khanh Hoa",
    legacyAlias: "Centerside",
    description:
      "Scanned palaces, fortresses, urban shophouses, brick towers, and megalithic stonework across Hue, Quang Tri, Hoi An, My Son, Thanh Hoa, and Nha Trang.",
    monuments: [
      {
        key: "co-do-hue",
        name: "Hue Imperial City & Royal Tombs",
        englishName: "Complex of Hue Monuments",
        regionKey: "mien-trung",
        regionName: "Central Vietnam",
        province: "Hue, Thua Thien Hue",
        era: "Nguyen Dynasty (1802–1945)",
        eraDetail: "Nguyen Imperial Capital",
        badge: "Architectural Complex",
        scanTech: "Terrestrial LiDAR & 8K PBR",
        description:
          "Walled citadel, Meridian Gate, Thai Hoa Palace, and mausoleums of Emperors Minh Mang, Tu Duc, and Khai Dinh with lacquer and ceramic mosaic surfaces.",
        legacyAliases: [
          "Hue Imperial City",
          "Huế Imperial City & Royal Tombs",
        ],
      },
      {
        key: "thanh-co-quang-tri",
        name: "Quang Tri Ancient Citadel",
        englishName: "Quang Tri Ancient Citadel",
        regionKey: "mien-trung",
        regionName: "Central Vietnam",
        province: "Quang Tri Town, Quang Tri",
        era: "Modern Landmarks",
        eraDetail: "Vauban Fortress (1809) & 1972",
        badge: "Fortress & Brickwork",
        scanTech: "Photogrammetry & LiDAR",
        description:
          "Square brick-and-earthwork Vauban citadel along the Thach Han River with fortress gates, weathered brick ramparts, and stone courtyard props.",
        legacyAliases: ["Quang Tri Citadel", "Quảng Trị Ancient Citadel"],
      },
      {
        key: "pho-co-hoi-an",
        name: "Hoi An Ancient Town",
        englishName: "Hoi An Ancient Town",
        regionKey: "mien-trung",
        regionName: "Central Vietnam",
        province: "Hoi An, Quang Nam",
        era: "Nguyen Dynasty (1802–1945)",
        eraDetail: "16th–19th c. Trading Port",
        badge: "Urban Architecture",
        scanTech: "Street-Scale Photogrammetry",
        description:
          "Coastal trading town featuring ochre limewashed shophouses, yin-yang terracotta roofs, the Japanese Covered Bridge, and carved wooden assembly halls.",
        legacyAliases: ["Hội An Ancient Town"],
      },
      {
        key: "thanh-dia-my-son",
        name: "My Son Cham Sanctuary",
        englishName: "My Son Cham Sanctuary",
        regionKey: "mien-trung",
        regionName: "Central Vietnam",
        province: "Duy Xuyen, Quang Nam",
        era: "Champa Kingdom (4th–14th c.)",
        eraDetail: "Champa Kingdom (4th–14th c.)",
        badge: "Brick Masonry",
        scanTech: "Laser Scan & Brick Micro-Mesh",
        description:
          "Valley complex of Champa temple towers built with mortarless fired brick masonry, sandstone bas-reliefs, and carved pediments.",
        legacyAliases: ["Mỹ Sơn Cham Sanctuary"],
      },
      {
        key: "thanh-nha-ho",
        name: "Ho Dynasty Stone Citadel",
        englishName: "Citadel of the Ho Dynasty",
        regionKey: "mien-trung",
        regionName: "Central Vietnam",
        province: "Vinh Loc, Thanh Hoa",
        era: "Ly – Tran – Le Dynasties (1010–1788)",
        eraDetail: "Megalithic Capital (1397)",
        badge: "Stone Masonry",
        scanTech: "Heavy-Stone LiDAR Scan",
        description:
          "Constructed in 1397 using interlocking dry-masonry Thanh Hoa limestone blocks forming arched stone gates without mortar.",
        legacyAliases: ["Hồ Dynasty Stone Citadel"],
      },
      {
        key: "thap-ba-po-nagar",
        name: "Po Nagar Cham Towers",
        englishName: "Po Nagar Cham Towers",
        regionKey: "mien-trung",
        regionName: "Central Vietnam",
        province: "Nha Trang, Khanh Hoa",
        era: "Champa Kingdom (4th–14th c.)",
        eraDetail: "Kauthara Principality (8th–13th c.)",
        badge: "Brick Towers",
        scanTech: "8K Photogrammetry & PBR",
        description:
          "Hilltop Cham brick tower complex overlooking the Cai River estuary in Nha Trang, anchored by the 23-meter Main Tower and octagonal stone pillars.",
        legacyAliases: [],
      },
    ],
  },
  {
    key: "mien-nam",
    name: "Southern Vietnam",
    englishName: "Saigon – Gia Dinh & Mekong Delta",
    subLabel: "Ho Chi Minh City • Cu Chi • An Giang",
    legacyAlias: "Southside",
    description:
      "3D scans of urban architecture, modern concrete landmarks, timber pagodas, subsurface terrain, and archaeological sites across Ho Chi Minh City and the Mekong Delta.",
    monuments: [
      {
        key: "dinh-doc-lap",
        name: "Independence Palace",
        englishName: "Independence Palace (Reunification Palace)",
        regionKey: "mien-nam",
        regionName: "Southern Vietnam",
        province: "District 1, Ho Chi Minh City",
        era: "Indochine & Tropical Modernism",
        eraDetail: "Architect Ngo Viet Thu (1962–1966)",
        badge: "Modernist Architecture",
        scanTech: "Architectural BIM & LiDAR",
        description:
          "Mid-century Vietnamese Tropical Modernist building featuring a bamboo-node precast concrete brise-soleil facade, ceremonial halls, and interior furnishings.",
        legacyAliases: ["Independence Palace"],
      },
      {
        key: "chua-co-hoi-son",
        name: "Hoi Son Ancient Temple",
        englishName: "Hoi Son Ancient Temple",
        regionKey: "mien-nam",
        regionName: "Southern Vietnam",
        province: "Thu Duc, Ho Chi Minh City",
        era: "Nguyen Dynasty (1802–1945)",
        eraDetail: "18th c. Southern Pagoda",
        badge: "Timber Architecture",
        scanTech: "Photogrammetry & Wood PBR",
        description:
          "18th-century timber structure overlooking the Dong Nai River, featuring pierced wooden altar screens, lacquered boards, and cast bronze props.",
        legacyAliases: ["Hoi Son Temple", "Hội Sơn Ancient Temple"],
      },
      {
        key: "kien-truc-sai-gon-gia-dinh",
        name: "Saigon – Gia Dinh Landmarks",
        englishName: "Historic Saigon – Gia Dinh Architecture",
        regionKey: "mien-nam",
        regionName: "Southern Vietnam",
        province: "District 1 & Binh Thanh, HCMC",
        era: "Indochine & Tropical Modernism",
        eraDetail: "19th–20th c. Urban Architecture",
        badge: "Urban Architecture",
        scanTech: "Facade LiDAR & Material Scan",
        description:
          "Urban buildings and facades including Saigon Central Post Office, Notre-Dame Basilica, Ben Thanh Market, and Le Van Duyet Mausoleum with encaustic tiles.",
        legacyAliases: ["Saigon – Gia Định Heritage Landmarks"],
      },
      {
        key: "to-dinh-giac-lam",
        name: "Giac Lam Ancient Pagoda",
        englishName: "Giac Lam Ancient Pagoda",
        regionKey: "mien-nam",
        regionName: "Southern Vietnam",
        province: "Tan Binh, Ho Chi Minh City",
        era: "Nguyen Dynasty (1802–1945)",
        eraDetail: "Founded 1744 • 98 Ironwood Pillars",
        badge: "Timber Architecture",
        scanTech: "Interior LiDAR & Wood Scan",
        description:
          "Founded in 1744, featuring three-hall Southern timber framing supported by 98 monolithic ironwood pillars and carved jackfruit-wood statues.",
        legacyAliases: ["Giác Lâm Ancient Pagoda"],
      },
      {
        key: "dia-dao-cu-chi",
        name: "Cu Chi Tunnels & Ben Duoc Memorial",
        englishName: "Cu Chi Tunnels & Ben Duoc Memorial Temple",
        regionKey: "mien-nam",
        regionName: "Southern Vietnam",
        province: "Cu Chi, Ho Chi Minh City",
        era: "Modern Landmarks",
        eraDetail: "1948–1975 Subterranean Complex",
        badge: "Terrain & Architecture",
        scanTech: "Subsurface LiDAR & Terrain Scan",
        description:
          "Multi-level subterranean tunnel network excavated through laterite clay alongside courtyard architecture at Ben Duoc.",
        legacyAliases: ["Củ Chi Tunnels & Bến Dược Memorial"],
      },
      {
        key: "van-hoa-oc-eo-phu-nam",
        name: "Oc Eo – Funan Archaeological Site",
        englishName: "Oc Eo Archaeological Site",
        regionKey: "mien-nam",
        regionName: "Southern Vietnam",
        province: "Thoai Son, An Giang",
        era: "Oc Eo – Funan (1st–7th c.)",
        eraDetail: "Funan Kingdom (1st–7th c.)",
        badge: "Archaeological Site",
        scanTech: "Micro-Photogrammetry",
        description:
          "Mekong Delta archaeological site at Ba The Mountain with brick and stone foundations, sculptures, and terracotta reliefs.",
        legacyAliases: ["Óc Eo – Funan Archaeological Site"],
      },
    ],
  },
];

export type VietnamTaxonomyGroup = {
  key: string;
  name: string;
  subtitle: string;
  provinceHint: string;
  description: string;
  categorySlugs: string[];
  subcategorySlugs?: string[];
};

export const VIETNAM_MATERIALS_TAXONOMY: VietnamTaxonomyGroup[] = [
  {
    key: "mat-da-thanh-cam-thach",
    name: "Thanh Hoa Bluestone & Non Nuoc Marble",
    subtitle: "Bluestone, Granite & Marble • 1K–8K PBR",
    provinceHint: "Thanh Hoa • Marble Mountains (Da Nang) • Ninh Binh",
    description:
      "Real-world scanned PBR stone surfaces from royal Thanh Hoa bluestone courtyards, Marble Mountains carved marble, and temple plinths across historic Vietnamese complexes.",
    categorySlugs: ["stone-textures", "tile-textures"],
  },
  {
    key: "mat-go-lim-son-mai",
    name: "Ironwood, Lacquer & Mother-of-Pearl",
    subtitle: "Aged Timber, Carving & Lacquerware",
    provinceHint: "Kinh Bac • Thua Thien Hue • Thu Dau Mot",
    description:
      "Weathered ironwood columns, antique communal hall floorboards, gilded carved wood screens, and traditional Vietnamese lacquer surfaces with full 8K Normal, Roughness, and Displacement maps.",
    categorySlugs: ["wood-textures"],
  },
  {
    key: "mat-gach-ngoi-am-duong",
    name: "Bat Trang Brick, Terracotta & Yin-Yang Tiles",
    subtitle: "Fired Brick, Clay & Roof Tiles",
    provinceHint: "Bat Trang (Hanoi) • Hoi An • Cham Towers",
    description:
      "Mortarless fired brick, courtyard paving bricks, glazed tiles, and moss-weathered yin-yang terracotta roof tiles.",
    categorySlugs: ["brick-textures", "roof-textures", "paper-textures"],
  },
  {
    key: "mat-dong-dong-son-kim-khi",
    name: "Patina Bronze & Cast Metal",
    subtitle: "Oxidized Bronze, Brass & Cast Ornaments",
    provinceHint: "Dong Son (Thanh Hoa) • Hue Bronze Foundry",
    description:
      "Oxidized bronze patinas, cast-bronze surfaces, enameled metalwork, and relief metal patterns.",
    categorySlugs: ["metal-textures", "ornament-textures", "sci-fi-textures"],
  },
  {
    key: "mat-tuong-voi-da-ong",
    name: "Limewash, Laterite & Aged Plaster",
    subtitle: "Ochre Limewash, Laterite & Tropical Concrete",
    provinceHint: "Son Tay (Hanoi) • Hoi An • Old Saigon",
    description:
      "Ochre limewash facades, porous red laterite stone, lime mortar, and humidity-weathered concrete surfaces.",
    categorySlugs: [
      "wall-textures",
      "plaster-textures",
      "concrete-textures",
      "plastic-textures",
    ],
  },
  {
    key: "mat-lua-tho-cam-may-tre",
    name: "Van Phuc Silk, Brocade & Rattan Wicker",
    subtitle: "Handwoven Silk, Highland Brocade & Bamboo",
    provinceHint: "Van Phuc (Hanoi) • Central Highlands • Mekong",
    description:
      "Traditional Vietnamese textiles including Nguyen royal brocade, Van Phuc silk weaves, ethnic highland geometric tapestries, and woven bamboo-rattan craft surfaces.",
    categorySlugs: ["fabric-textures"],
  },
  {
    key: "mat-dat-phu-sa-dia-hinh",
    name: "Alluvial Soil, Tropical Moss & Urban Asphalt",
    subtitle: "Red River Delta Soil, Ground & Road Surfaces",
    provinceHint: "Red River Delta • Mekong • Urban Vietnam",
    description:
      "Large-scale ground and terrain PBR materials ranging from alluvial river silt, courtyard gravel, and mossy temple stone paths to modern Vietnamese urban asphalt.",
    categorySlugs: [
      "ground-textures",
      "asphalt-textures",
      "imperfections-textures",
      "surreal-textures",
      "grunge-textures",
    ],
  },
];

export const VIETNAM_HDRIS_TAXONOMY: VietnamTaxonomyGroup[] = [
  {
    key: "hdri-san-rong-co-do",
    name: "Open Courtyards & Stone Plazas",
    subtitle: "Outdoor Plazas • 32-bit EXR",
    provinceHint: "Hue • Hanoi",
    description:
      "360° 32-bit environment maps captured across open stone courtyards for calibrated outdoor lighting.",
    categorySlugs: ["ground-textures"],
    subcategorySlugs: ["sand-textures"],
  },
  {
    key: "hdri-chua-co-dinh-lang",
    name: "Timber & Interior Spaces",
    subtitle: "Warm Indirect Interior Lighting",
    provinceHint: "Bac Ninh • Ho Chi Minh City",
    description:
      "Indirect interior lighting captured through wooden lattice doors with soft ambient bounce.",
    categorySlugs: ["surreal-textures"],
    subcategorySlugs: ["ground-textures"],
  },
  {
    key: "hdri-pho-co-nhiet-doi",
    name: "Tropical Daylight & Golden Hour",
    subtitle: "Direct Sun & Riverside Dusk",
    provinceHint: "Hoi An • Quang Nam • HCMC",
    description:
      "Clear tropical sun skies, golden-hour river reflections, and warm monsoon atmospheric lighting.",
    categorySlugs: ["ground-textures"],
    subcategorySlugs: ["forest-textures"],
  },
  {
    key: "hdri-ha-long-truong-son",
    name: "Coastal Mist & Mountain Overcast",
    subtitle: "Karst Fog, Clouds & Forest Canopy",
    provinceHint: "Ha Long Bay • Sapa • Truong Son",
    description:
      "Diffused overcast skies, morning coastal mist, and forest canopy lighting for exterior scenes.",
    categorySlugs: ["ground-textures"],
    subcategorySlugs: ["snow-textures"],
  },
];

export const MONUMENT_BY_KEY: Record<string, VietnamMonumentMeta> = {};
export const MONUMENT_BY_NAME: Record<string, VietnamMonumentMeta> = {};
export const REGION_BY_KEY: Record<VietnamRegionKey, VietnamRegionMeta> = {} as Record<
  VietnamRegionKey,
  VietnamRegionMeta
>;
export const REGION_BY_LEGACY_ALIAS: Record<string, VietnamRegionMeta> = {};

for (const reg of VIETNAM_REGIONS_AND_MONUMENTS) {
  REGION_BY_KEY[reg.key] = reg;
  REGION_BY_LEGACY_ALIAS[reg.legacyAlias] = reg;
  REGION_BY_LEGACY_ALIAS[reg.name] = reg;
  for (const mon of reg.monuments) {
    MONUMENT_BY_KEY[mon.key] = mon;
    MONUMENT_BY_NAME[mon.name] = mon;
    for (const alias of mon.legacyAliases) {
      MONUMENT_BY_NAME[alias] = mon;
    }
  }
}

function resolveMaterialGroupKey(item: LotpixelAssetItem): string | undefined {
  if (item.assetGroup !== "textures") return undefined;
  const match = VIETNAM_MATERIALS_TAXONOMY.find((g) =>
    g.categorySlugs.includes(item.categorySlug)
  );
  return match?.key ?? "mat-dat-phu-sa-dia-hinh";
}

function resolveHdriGroupKey(item: LotpixelAssetItem): string | undefined {
  if (item.pillCategory !== "hdris") return undefined;
  if (item.categorySlug === "surreal-textures") return "hdri-chua-co-dinh-lang";
  if (item.subcategorySlug === "sand-textures") return "hdri-san-rong-co-do";
  if (item.subcategorySlug === "forest-textures") return "hdri-pho-co-nhiet-doi";
  if (item.subcategorySlug === "snow-textures") return "hdri-ha-long-truong-son";
  return "hdri-pho-co-nhiet-doi";
}

function pickMonumentForRegion(
  item: LotpixelAssetItem,
  reg: VietnamRegionMeta,
  index: number
): VietnamMonumentMeta {
  const numId = parseInt(item.id, 10);
  const seed = Number.isFinite(numId) ? numId : index + 1;
  const mons = reg.monuments;

  const cat = item.categorySlug;
  if (reg.key === "mien-bac") {
    if (cat === "nature-3d-models" || cat === "ground-textures") {
      return mons[seed % 2 === 0 ? 3 : 0];
    }
    if (cat === "metal-textures" || cat === "ornament-textures" || cat === "stone-textures") {
      return mons[seed % 3 === 0 ? 4 : seed % 3 === 1 ? 2 : 0];
    }
    if (cat === "wood-textures" || cat === "interior-3d-models") {
      return mons[seed % 2 === 0 ? 1 : 5];
    }
  } else if (reg.key === "mien-trung") {
    if (cat === "brick-textures" || cat === "ornament-textures") {
      return mons[seed % 3 === 0 ? 3 : seed % 3 === 1 ? 5 : 1];
    }
    if (cat === "roof-textures" || cat === "wall-textures" || cat === "plaster-textures") {
      return mons[seed % 2 === 0 ? 2 : 0];
    }
    if (cat === "stone-textures" || cat === "tile-textures") {
      return mons[seed % 2 === 0 ? 4 : 0];
    }
  } else if (reg.key === "mien-nam") {
    if (
      cat === "industrial-3d-models" ||
      cat === "street-3d-models" ||
      cat === "concrete-textures" ||
      cat === "asphalt-textures"
    ) {
      return mons[seed % 2 === 0 ? 0 : 2];
    }
    if (cat === "ground-textures") {
      return mons[seed % 2 === 0 ? 4 : 5];
    }
    if (cat === "wood-textures" || cat === "interior-3d-models") {
      return mons[seed % 2 === 0 ? 1 : 3];
    }
  }

  return mons[seed % mons.length];
}

export function enrichVietnamCatalog(items: LotpixelAssetItem[]): LotpixelAssetItem[] {
  return items
    .filter(
      (item) =>
        item.assetGroup !== "decals" &&
        item.subcategorySlug !== "fruit-3d-models" &&
        item.subcategorySlug !== "vegetable-3d-models"
    )
    .map((item, idx) => {
      const reg =
        REGION_BY_LEGACY_ALIAS[item.region] ||
        (item.regionKey ? REGION_BY_KEY[item.regionKey] : undefined) ||
        VIETNAM_REGIONS_AND_MONUMENTS[idx % VIETNAM_REGIONS_AND_MONUMENTS.length];

      const monumentMeta =
        MONUMENT_BY_KEY[item.monumentKey || ""] ||
        pickMonumentForRegion(item, reg, idx);

      const materialGroupKey = resolveMaterialGroupKey(item);
      const hdriGroupKey = resolveHdriGroupKey(item);

      return {
        ...item,
        regionKey: reg.key,
        regionLabel: `${reg.name} (${reg.englishName})`,
        region: reg.name,
        monumentKey: monumentMeta.key,
        monument: monumentMeta.name,
        province: monumentMeta.province,
        era: monumentMeta.era,
        eraDetail: monumentMeta.eraDetail,
        subtitle: `${monumentMeta.name} • ${monumentMeta.province} • ${item.categoryLabel}`,
        materialGroupKey,
        hdriGroupKey,
      };
    });
}

export const INITIAL_LOTPIXEL_ITEMS: LotpixelAssetItem[] = enrichVietnamCatalog(
  initialCatalog as LotpixelAssetItem[]
);

export type LotpixelCategoryCluster = {
  id: string;
  label: string;
  assetGroup: "all" | "3d-models" | "textures" | "hdris";
  description: string;
  totalCount: number;
  subcategories: {
    slug: string;
    label: string;
    count: number;
  }[];
};

export const LOTPIXEL_CATEGORY_TAXONOMY: LotpixelCategoryCluster[] = [
  {
    id: "all",
    label: "All Assets",
    assetGroup: "all",
    description:
      "Complete catalog of 5,448 scanned 3D assets, PBR surfaces, and 32-bit HDRIs.",
    totalCount: 5448,
    subcategories: [],
  },
  {
    id: "3d-models",
    label: "3D Assets",
    assetGroup: "3d-models",
    description:
      "135 scanned 3D models covering architecture, interiors, nature, structures, and urban props.",
    totalCount: 135,
    subcategories: [
      { slug: "nature-3d-models", label: "Nature (Rock & Timber)", count: 70 },
      {
        slug: "interior-3d-models",
        label: "Interior & Props",
        count: 37,
      },
      {
        slug: "food-3d-models",
        label: "Tabletop & Props",
        count: 6,
      },
      {
        slug: "industrial-3d-models",
        label: "Construction & Structural",
        count: 12,
      },
      {
        slug: "street-3d-models",
        label: "Street & Exterior Props",
        count: 7,
      },
      {
        slug: "building-3d-models",
        label: "Architecture & Doors",
        count: 3,
      },
    ],
  },
  {
    id: "textures",
    label: "Surfaces",
    assetGroup: "textures",
    description:
      "5,313 tileable 1K–8K PBR surface materials across 19 categories.",
    totalCount: 5313,
    subcategories: [
      { slug: "tile-textures", label: "Tile (Marble & Courtyard)", count: 733 },
      {
        slug: "fabric-textures",
        label: "Fabric (Silk, Brocade & Wicker)",
        count: 606,
      },
      {
        slug: "ground-textures",
        label: "Ground (Soil, Gravel & Moss)",
        count: 593,
      },
      {
        slug: "wood-textures",
        label: "Wood (Ironwood, Planks & Aged)",
        count: 575,
      },
      {
        slug: "stone-textures",
        label: "Stone (Bluestone & Marble)",
        count: 520,
      },
      {
        slug: "imperfections-textures",
        label: "Imperfections (Wear & Patina)",
        count: 360,
      },
      {
        slug: "concrete-textures",
        label: "Concrete & Laterite Stone",
        count: 356,
      },
      {
        slug: "wall-textures",
        label: "Wall (Limewash & Stucco)",
        count: 337,
      },
      {
        slug: "metal-textures",
        label: "Metal (Bronze & Cast Iron)",
        count: 229,
      },
      { slug: "plastic-textures", label: "Composite & Lacquer", count: 199 },
      {
        slug: "ornament-textures",
        label: "Ornament (Carved Reliefs)",
        count: 151,
      },
      { slug: "sci-fi-textures", label: "Engraved Metalwork", count: 150 },
      {
        slug: "asphalt-textures",
        label: "Urban Asphalt & Roads",
        count: 117,
      },
      {
        slug: "brick-textures",
        label: "Brick & Masonry",
        count: 112,
      },
      { slug: "roof-textures", label: "Roof (Clay & Ceramic Tiles)", count: 109 },
      {
        slug: "plaster-textures",
        label: "Lime Plaster & Stucco",
        count: 99,
      },
      { slug: "surreal-textures", label: "Special Terrains", count: 59 },
      { slug: "grunge-textures", label: "Moss & Weathering Grunge", count: 6 },
      { slug: "paper-textures", label: "Paper & Parchment", count: 2 },
    ],
  },
  {
    id: "hdris",
    label: "HDRIs",
    assetGroup: "hdris",
    description:
      "252 360° 32-bit environment maps covering outdoor daylight, overcast skies, and interior lighting.",
    totalCount: 252,
    subcategories: [
      {
        slug: "forest-textures",
        label: "Tropical Daylight & Ancient Towns",
        count: 60,
      },
      {
        slug: "sand-textures",
        label: "Imperial Courtyards & Citadels",
        count: 75,
      },
      {
        slug: "ground-textures",
        label: "Pagoda & Communal Hall Interiors",
        count: 59,
      },
      {
        slug: "snow-textures",
        label: "Ha Long Mist & Highland Canopy",
        count: 58,
      },
    ],
  },
];
