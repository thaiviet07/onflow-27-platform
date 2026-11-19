"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AssetDetailData,
  DEFAULT_ASSET_DETAIL,
  PanelModule,
} from "@/components/PanelModule";
import { INITIAL_LOTPIXEL_ITEMS } from "@/data/lotpixelCatalog";

const RELATED_ITEMS = INITIAL_LOTPIXEL_ITEMS.slice(0, 12).map((item) => ({
  id: item.uid,
  title: item.title,
  credits: item.credits,
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
];

export default function B2ItemMenuPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [relatedStartIndex, setRelatedStartIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentAsset, setCurrentAsset] =
    useState<AssetDetailData>(DEFAULT_ASSET_DETAIL);

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
          location: `${first.monument} `,
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

  return (
    <div
      className="bg-[#eaecf0] flex flex-col items-center relative min-h-screen w-full"
      data-node-id="1220:11593"
      data-name="[B2] Item Menu"
    >
      {/* Responsive Sticky Header (60px height) */}
      <header
        className="bg-white flex h-[60px] items-center justify-between px-[20px] lg:px-[36px] py-[10px] shrink-0 sticky top-0 w-full max-w-[1920px] z-30"
        data-node-id="1220:11594"
        data-name="Header"
      >
        {/* Left: Hamburger (mobile) + Logo + Nav + Search (desktop) */}
        <div
          className="flex gap-[20px] xl:gap-[78px] items-center relative shrink-0 lg:flex-1 lg:max-w-[1150.673px]"
          data-node-id="I1220:11594;806:1132"
        >
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden overflow-hidden relative shrink-0 size-[24px] cursor-pointer border-0 bg-transparent p-0"
          >
            <div className="absolute bg-[#19213d] inset-[12.5%_0_78.13%_0] rounded-[2px]" />
            <div className="absolute bg-[#19213d] inset-[45.31%_0] rounded-[2px]" />
            <div className="absolute bg-[#19213d] inset-[78.13%_0_12.5%_0] rounded-[2px]" />
          </button>

          {/* Logo (124x36 in B2 Item Menu) */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
            className="h-[36px] relative shrink-0 w-[124px] block cursor-pointer"
            data-node-id="I1220:11594;806:1115"
            data-name="Logo"
          >
            <div className="absolute inset-[0_4%_3.13%_0]">
              <div className="absolute inset-[0_-2.53%_-0.36%_1.44%]">
                <img
                  alt="Onflow Asia"
                  className="block max-w-none"
                  src="/assets/b2_header_logo.svg"
                  width={120.34}
                  height={35}
                />
              </div>
            </div>
          </a>

          {/* Navigation Category */}
          <nav
            className="hidden lg:flex items-center gap-1 relative shrink-0"
            data-node-id="I1220:11594;800:1262"
            data-name="Category"
          >
            {["Gallery", "Pricing", "Business", "More"].map((navItem) => {
              const isSelected = navItem === "Gallery";
              return (
                <a
                  key={navItem}
                  href={
                    navItem === "Gallery"
                      ? "/"
                      : navItem === "Pricing"
                      ? "/payment"
                      : "#"
                  }
                  onClick={(e) => {
                    if (navItem === "Gallery") {
                      e.preventDefault();
                      router.push("/");
                    } else if (navItem === "Pricing") {
                      e.preventDefault();
                      router.push("/payment");
                    }
                  }}
                  className={`flex h-[32px] items-center justify-center px-[20px] xl:px-[32px] relative rounded-[10px] shrink-0 no-underline transition-colors ${
                    isSelected
                      ? "bg-[#f2f3f5]"
                      : "bg-transparent hover:bg-[#f6f7fa]"
                  }`}
                >
                  <div
                    className={`flex flex-col font-nacelle justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[#19213d] text-center whitespace-nowrap ${
                      isSelected ? "font-bold" : "font-normal"
                    }`}
                  >
                    <p className="leading-[24px] m-0">{navItem}</p>
                  </div>
                </a>
              );
            })}
          </nav>

          {/* SearchBar */}
          <div
            className="hidden md:block flex-1 h-[40px] min-w-[180px] max-w-[459px] overflow-hidden relative"
            data-node-id="1220:1564"
          >
            <div className="-translate-y-1/2 absolute bg-white border-[#a6a6a6] border-[0.5px] border-solid h-[40px] left-0 right-0 rounded-[20px] top-1/2 pointer-events-none" />
            <div className="-translate-y-1/2 absolute flex gap-[10px] h-[40px] items-center left-0 px-[20px] py-[10px] top-1/2 w-full">
              <div className="relative shrink-0 size-[20px]">
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/header_search.svg"
                  width={20}
                  height={20}
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent border-0 outline-none font-sans font-normal text-[15px] leading-[15px] text-[#19213d] placeholder:text-[#989898]"
              />
            </div>
          </div>
        </div>

        {/* Right: Buttons */}
        <div
          className="flex flex-1 gap-[15px] xl:gap-[40px] items-center justify-end min-w-0 relative"
          data-node-id="I1220:11594;806:1111"
          data-name="Buttons"
        >
          <div className="hidden sm:flex gap-[15px] items-center justify-end relative shrink-0 w-[130px]">
            <button
              type="button"
              aria-label="Bookmarks"
              className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0"
            >
              <img
                alt=""
                className="block max-w-none"
                src="/assets/header_bookmark.svg"
                width={32}
                height={32}
              />
            </button>
            <button
              type="button"
              aria-label="Shopping Cart"
              className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0"
            >
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[28px] top-1/2">
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/header_cart.svg"
                  width={28}
                  height={28}
                />
              </div>
            </button>
            <button
              type="button"
              aria-label="Language"
              className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0"
            >
              <div className="absolute inset-[12.5%]">
                <div className="absolute inset-[-4.17%]">
                  <img
                    alt=""
                    className="block max-w-none"
                    src="/assets/header_language.svg"
                    width={26}
                    height={26}
                  />
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-[10px] items-center justify-end relative shrink-0">
            <Link
              href="/portal?tab=credits"
              className="bg-[#eaeaea] hover:bg-[#dfe2e6] transition-colors flex flex-col h-[32px] items-start overflow-hidden px-[20px] py-[8px] relative rounded-[16px] shrink-0"
            >
              <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                <div className="col-start-1 row-start-1 flex flex-col font-sans font-normal justify-center ml-[19px] mt-0 not-italic relative text-[12px] text-[#19213d] whitespace-nowrap">
                  <p className="leading-[15.6px] m-0">2,686 Credits</p>
                </div>
                <div className="col-start-1 row-start-1 ml-0 mt-0 relative size-[16px]">
                  <img
                    alt=""
                    className="block max-w-none"
                    src="/assets/header_credit_icon.svg"
                    width={16}
                    height={16}
                  />
                </div>
              </div>
            </Link>
            <Link
              href="/portal"
              aria-label="User Profile"
              className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0 hover:opacity-85 transition-opacity"
            >
              <img
                alt=""
                className="block max-w-none"
                src="/assets/header_user.svg"
                width={32}
                height={32}
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white w-full px-6 py-4 border-b border-[#c9c9c9] flex flex-col gap-3 z-20">
          {["Gallery", "Pricing", "Business", "More"].map((item) => (
            <a
              key={item}
              href={
                item === "Gallery"
                  ? "/"
                  : item === "Pricing"
                  ? "/payment"
                  : "#"
              }
              onClick={(e) => {
                if (item === "Gallery") {
                  e.preventDefault();
                  router.push("/");
                } else if (item === "Pricing") {
                  e.preventDefault();
                  router.push("/payment");
                }
                setMobileMenuOpen(false);
              }}
              className="text-[#19213d] font-nacelle text-[15px] py-1 no-underline"
            >
              {item}
            </a>
          ))}
        </div>
      )}

      {/* Body */}
      <div
        className="flex flex-col items-center overflow-hidden pb-[100px] px-4 sm:px-8 xl:px-[187px] relative shrink-0 w-full max-w-[1920px]"
        data-node-id="1220:11595"
        data-name="Body"
      >
        <div
          className="flex flex-col lg:flex-row gap-[14px] items-start justify-center pt-[32px] lg:pt-[90px] relative shrink-0 w-full"
          data-node-id="1220:11596"
          data-name="Content"
        >
          {/* Main Left Column (1122px on desktop) */}
          <div
            className="flex flex-col gap-[40px] items-start overflow-hidden relative self-stretch shrink-0 w-full lg:flex-1 lg:max-w-[1122px]"
            data-node-id="1220:11597"
            data-name="Right"
          >
            {/* 3D View Placeholder (1122x631) */}
            <div
              className="bg-[#1e1e1e] h-[320px] sm:h-[460px] lg:h-[631px] relative rounded-[10px] shadow-[0px_4px_2.8px_0px_rgba(0,0,0,0.03)] shrink-0 w-full overflow-hidden flex items-center justify-center"
              data-node-id="1220:11598"
              data-name="3D View"
            >
              {currentAsset.imgUrl && (
                <img
                  alt={currentAsset.title}
                  src={currentAsset.imgUrl}
                  className="w-full h-full object-contain"
                />
              )}
              {currentAsset.randname && (
                <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[12px] font-sans px-3 py-1.5 rounded-[8px] flex items-center gap-3">
                  <span>ID: #{currentAsset.id}</span>
                  <span>•</span>
                  <span>Code: {currentAsset.randname}</span>
                  {currentAsset.sourceUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={currentAsset.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#66a2ff] underline"
                      >
                        LotPixel Source
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Asset Overview */}
            <div
              className="flex flex-col gap-[25px] items-start overflow-hidden pb-[30px] relative shrink-0 w-full"
              data-node-id="1220:11599"
              data-name="Asset Overview"
            >
              <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#19213d]">
                <h2 className="leading-[25px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">Asset Overview</h2>
              </div>

              <div
                className={`flex flex-col gap-[10px] items-start not-italic overflow-hidden relative shrink-0 text-[#19213d] w-full transition-all ${
                  showFullDescription ? "h-auto" : "h-[205px]"
                }`}
              >
                <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                  <p className="font-sans font-semibold leading-[23px] relative shrink-0 text-[16px] w-full m-0">
                    Scan & Surface Summary
                  </p>
                  <p className="font-sans font-normal leading-[19.6px] relative shrink-0 text-[14px] w-full m-0">
                    Captured on-site via photogrammetry and terrestrial LiDAR at
                    Quang Tri Citadel, this asset provides a real-world scale
                    3D mesh of a carved white marble incense burner. Geometry
                    is cleaned with non-overlapping UVs and baked down to
                    multiple LOD tiers for real-time and offline rendering.
                  </p>
                </div>

                <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                  <p className="font-sans font-semibold leading-[23px] relative shrink-0 text-[16px] w-full m-0">
                    Material & Shading Details
                  </p>
                  <div className="font-sans font-normal relative shrink-0 text-[14px] w-full">
                    <p className="leading-[19.6px] m-0">
                      Calibrated PBR texture sets capture weathered white
                      marble veins, soot patina around the rim, and fine surface
                      roughness variation. Albedo maps are color-checked and
                      delit so the asset responds accurately under custom HDRI
                      or directional lighting.
                    </p>
                    <p className="leading-[19.6px] m-0">
                      Includes Albedo, Normal, Roughness, Ambient Occlusion,
                      and 16-bit Displacement maps up to 4096×4096 resolution.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                  <p className="font-sans font-semibold leading-[23px] relative shrink-0 text-[16px] w-full m-0">
                    Geometry & Form
                  </p>
                  <div className="font-sans font-normal relative shrink-0 text-[14px] w-full">
                    <p className="leading-[19.6px] m-0">
                      The model features a stepped square pedestal supporting a
                      wide circular basin with relief dragon carvings around
                      the outer rim. Pivot is placed at the base center (0, 0,
                      0) in real-world centimeter units for direct placement in
                      architectural and exterior scenes.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                  <p className="font-sans font-semibold leading-[23px] relative shrink-0 text-[16px] w-full m-0">
                    Pipeline Compatibility
                  </p>
                  <div className="font-sans font-normal relative shrink-0 text-[14px] w-full">
                    <p className="leading-[19.6px] m-0">
                      Exported in FBX, OBJ, GLB, and USD formats with optional
                      LOD0–LOD5 meshes and collision hulls. Ready to drop into
                      Unreal Engine 5 (Nanite or standard LODs), Unity,
                      Blender, Maya, and 3ds Max.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="cursor-pointer flex gap-[6px] items-center relative shrink-0 border-0 bg-transparent p-0"
                data-name="Show More"
              >
                <p className="font-sans font-normal leading-[19.6px] not-italic relative shrink-0 text-[14px] text-[#004bda] text-left whitespace-nowrap m-0">
                  {showFullDescription ? "Show less" : "Show more"}
                </p>
                <div className="flex h-[4px] items-center justify-center relative shrink-0 w-[10px]">
                  <div
                    className={`flex-none transition-transform ${
                      showFullDescription ? "rotate-90" : "-rotate-90"
                    }`}
                  >
                    <div className="h-[10px] relative w-[4px]">
                      <div className="absolute inset-[-3.12%_-9.76%_-3.12%_-16.01%]">
                        <img
                          alt=""
                          className="block max-w-none"
                          src="/assets/b2_show_more_arrow.svg"
                          width={5.03}
                          height={10.62}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Technical Details & Compatibility Gray Box */}
            <div
              className="bg-[#e1e1e1] flex flex-col md:flex-row gap-8 md:gap-6 items-start justify-between overflow-hidden p-[24px] sm:p-[32px] relative rounded-[10px] shrink-0 w-full"
              data-node-id="1220:11600"
              data-name="Technical Information"
            >
              {/* Left Column: Technical Details */}
              <div
                className="flex flex-col gap-[15px] items-start not-italic relative shrink-0 text-[#19213d] w-full md:w-[48%] lg:w-[504px]"
                data-node-id="1220:11601"
                data-name="Left"
              >
                <div className="flex flex-col justify-center relative shrink-0 text-[#19213d] w-full">
                  <h2 className="leading-[25px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">Technical Details</h2>
                </div>
                <div className="font-sans font-normal relative shrink-0 text-[14px] w-full">
                  <p className="leading-[19.6px] m-0">
                    Number of BP Assets: 193 (183 BP + 10 PLA/BPP)
                  </p>
                  <p className="leading-[19.6px] m-0">
                    Number of Unique Meshes: 121 (38 useful meshes + 83
                    technical meshes)
                  </p>
                  <p className="leading-[19.6px] m-0">
                    Collision: Yes, automatically generated and custom
                  </p>
                  <p className="leading-[19.6px] m-0">
                    Vertex Count: up to 41107 (6182 tris) for heaviest SM, up to
                    ~25 000 tris for any fortification made using PLA
                  </p>
                  <p className="leading-[19.6px] m-0">
                    LODs: Yes (6 and 4 levels)
                  </p>
                  <p className="leading-[19.6px] m-0">
                    Number of Materials and Material Instances: 3 Materials and
                    15 Material Instances
                  </p>
                  <p className="leading-[19.6px] m-0">Number of Textures: 33</p>
                  <p className="leading-[19.6px] m-0">
                    Texture Resolutions: 4096x4096, 2048x2048, 1024x1024,
                    16x128, 32x32
                  </p>
                  <p className="leading-[19.6px] m-0">
                    Supported Development Platforms:
                  </p>
                  <p className="leading-[19.6px] m-0">Windows: Yes</p>
                  <p className="leading-[19.6px] m-0">Mac: Yes</p>
                  <p className="m-0">
                    <span className="leading-[19.6px]">Documentation: </span>
                    <a
                      className="cursor-pointer decoration-solid leading-[19.6px] text-[#002679] underline"
                      href="https://drive.google.com/file/d/1ykKxi-GWyZ9D5pZUS9DLR31Gdgd1xp37/view?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Link
                    </a>
                  </p>
                  <p className="m-0">
                    <span className="leading-[19.6px]">
                      Important/Additional Notes: Convert your creations to
                      PLA/BPP to gain performance!{" "}
                    </span>
                    <a
                      className="cursor-pointer decoration-solid leading-[19.6px] text-[#002679] underline"
                      href="https://docs.unrealengine.com/5.0/en-US/level-instancing-in-unreal-engine/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      How to do it
                    </a>
                  </p>
                </div>
              </div>

              {/* Right Column: Compatibility, Other info, License */}
              <div
                className="flex flex-col gap-[40px] lg:gap-[80px] items-start relative self-stretch shrink-0 w-full md:w-[48%] lg:w-[504px]"
                data-node-id="1220:11604"
                data-name="Right"
              >
                {/* Compatibility */}
                <div
                  className="flex flex-col gap-[15px] items-start relative shrink-0 w-full"
                  data-node-id="1220:11605"
                  data-name="Compatibility"
                >
                  <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#19213d] w-full">
                    <h2 className="leading-[25px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">Compatibility</h2>
                  </div>
                  <div className="flex flex-col font-sans font-normal gap-[5px] items-start leading-[15.6px] not-italic relative shrink-0 text-[14px] w-full">
                    <p className="relative shrink-0 text-[#19213d] w-full m-0">
                      Supported Unreal Engine Versions
                    </p>
                    <p className="relative shrink-0 text-[rgba(25,33,61,0.7)] w-full m-0">
                      5.0 – 5.5
                    </p>
                  </div>
                  <div className="flex flex-col gap-[5px] items-start relative shrink-0 w-full">
                    <p className="font-sans font-normal leading-[15.6px] min-w-full not-italic relative shrink-0 text-[14px] text-[#19213d] m-0">
                      Supported Format
                    </p>
                    <div className="flex gap-[10px] items-start relative shrink-0">
                      {["obj", "fbx"].map((fmt) => (
                        <div
                          key={fmt}
                          className="h-[20px] relative shrink-0 w-[33px]"
                        >
                          <div className="-translate-y-1/2 absolute bg-[#797979] flex h-[14px] items-center justify-center left-0 px-[5px] py-[2px] rounded-[12px] top-1/2 w-[33px]">
                            <div className="flex flex-col font-sans font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white text-center whitespace-nowrap">
                              <p className="leading-[10px] m-0">{fmt}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Other information */}
                <div
                  className="flex flex-col gap-[15px] items-start not-italic relative shrink-0 w-full"
                  data-node-id="1220:11615"
                  data-name="Other Information"
                >
                  <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[#19213d] w-full">
                    <h2 className="leading-[25px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">Other information</h2>
                  </div>
                  <div className="flex flex-col font-sans font-normal gap-[5px] items-start leading-[15.6px] relative shrink-0 text-[14px] w-full">
                    <p className="relative shrink-0 text-[#19213d] w-full m-0">
                      Last Update
                    </p>
                    <p className="relative shrink-0 text-[rgba(25,33,61,0.7)] w-full m-0">
                      02/24/2025
                    </p>
                  </div>
                  <div className="flex flex-col font-sans font-normal gap-[5px] items-start leading-[15.6px] relative shrink-0 text-[14px] w-full">
                    <p className="relative shrink-0 text-[#19213d] w-full m-0">
                      Distribution Method
                    </p>
                    <p className="relative shrink-0 text-[rgba(25,33,61,0.7)] w-full m-0">
                      Asset Package
                    </p>
                  </div>
                </div>

                {/* License & Terms of Service */}
                <div
                  className="flex flex-col gap-[15px] items-start not-italic relative shrink-0 w-full"
                  data-node-id="1220:11623"
                  data-name="License"
                >
                  <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[#19213d] w-full">
                    <h2 className="leading-[25px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">
                      License & Terms of Service
                    </h2>
                  </div>
                  <div className="flex flex-col font-sans font-normal gap-[5px] items-start leading-[15.6px] relative shrink-0 text-[14px] w-full">
                    <p className="relative shrink-0 text-[#19213d] w-full m-0">
                      License terms
                    </p>
                    <a
                      href="#"
                      className="decoration-solid relative shrink-0 text-[#002679] underline w-full"
                    >
                      Standard License
                    </a>
                  </div>
                  <div className="flex flex-col font-sans font-normal gap-[5px] items-start leading-[15.6px] relative shrink-0 text-[14px] w-full">
                    <p className="relative shrink-0 text-[#19213d] w-full m-0">
                      Onflow’s Terms of Service
                    </p>
                    <a
                      href="#"
                      className="decoration-solid relative shrink-0 text-[#002679] underline w-full"
                    >
                      End User License Agreement
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div
              className="flex flex-col gap-[25px] items-start relative shrink-0 w-full"
              data-node-id="1220:11631"
            >
              <div className="flex flex-col justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#19213d]">
                <h2 className="leading-[25px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">Tags</h2>
              </div>
              <div
                className="flex flex-wrap gap-[12px] items-start relative shrink-0"
                data-node-id="1220:11633"
              >
                {TAGS.map((tag) => {
                  const isSelected = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(isSelected ? null : tag)}
                      className={`bg-[#ededed] cursor-pointer flex items-center justify-center overflow-hidden px-[17px] py-[9px] relative rounded-[16px] shrink-0 border-0 transition-all ${
                        isSelected
                          ? "ring-2 ring-[#004bda] bg-white"
                          : "hover:bg-[#e2e2e2]"
                      }`}
                      data-name="Tag"
                    >
                      <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[#19213d] whitespace-nowrap">
                        <p className="leading-[12px] m-0">{tag}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* More from Quang Tri Citadel Collection */}
            <div
              className="flex flex-col gap-[25px] items-start relative shrink-0 w-full"
              data-node-id="1220:11640"
            >
              <div
                className="flex items-center justify-between relative shrink-0 w-full"
                data-node-id="1220:11641"
              >
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/");
                  }}
                  className="cursor-pointer flex gap-[10px] items-center relative shrink-0 no-underline"
                  data-node-id="1220:11642"
                >
                  <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#19213d] text-left">
                    <h2 className="leading-[25px] m-0 font-google-sans text-[20px] font-bold text-[#19213d]">
                      More from Quang Tri Citadel Collection
                    </h2>
                  </div>
                  <div className="flex h-[15px] items-center justify-center relative shrink-0 w-[10px]">
                    <div className="-rotate-90 flex-none">
                      <div className="h-[10px] relative w-[15px]">
                        <img
                          alt=""
                          className="block max-w-none"
                          src="/assets/section_chevron.svg"
                          width={15}
                          height={10}
                        />
                      </div>
                    </div>
                  </div>
                </a>

                <div
                  className="flex gap-[7px] items-center justify-end relative shrink-0"
                  data-node-id="1220:11645"
                >
                  <button
                    type="button"
                    onClick={handlePrevRelated}
                    aria-label="Previous items"
                    className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0"
                  >
                    <img
                      alt=""
                      className="block max-w-none"
                      src="/assets/btn_back.svg"
                      width={32}
                      height={32}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextRelated}
                    aria-label="Next items"
                    className="relative shrink-0 size-[32px] cursor-pointer border-0 bg-transparent p-0"
                  >
                    <img
                      alt=""
                      className="block max-w-none"
                      src="/assets/btn_forward.svg"
                      width={32}
                      height={32}
                    />
                  </button>
                </div>
              </div>

              {/* 3 Sub-itemboxes */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10.5px] items-start justify-between relative shrink-0 w-full"
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
                        location: `${sub.item.monument} `,
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
                      try {
                        sessionStorage.setItem(
                          "onflow_selected_asset",
                          JSON.stringify(nextAsset)
                        );
                      } catch {}
                    }}
                    className="bg-white flex flex-col h-[216px] items-center justify-between overflow-hidden relative rounded-[10px] shrink-0 w-full lg:w-[367px] cursor-pointer transition-transform hover:-translate-y-[1px]"
                    data-name="sub-itembox"
                  >
                    <div className="bg-[#eaeaea] h-[158px] relative shrink-0 w-full overflow-hidden">
                      {sub.imgUrl && (
                        <img
                          alt={sub.title}
                          src={sub.imgUrl}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div
                      className="bg-white h-[58px] overflow-hidden relative shrink-0 w-full"
                      data-name="Textbox"
                    >
                      <div className="-translate-y-1/2 absolute flex flex-col items-start left-[10px] top-1/2">
                        <div className="h-[20px] relative shrink-0 w-[260px]">
                          <div className="-translate-y-1/2 absolute flex flex-col font-nacelle font-bold justify-center leading-[0] left-0 not-italic right-0 text-[12px] text-[#19213d] top-1/2">
                            <p className="leading-[15.6px] m-0 truncate">
                              {sub.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-[4px] items-center py-[2px] relative shrink-0">
                          <div className="relative shrink-0 size-[14px]">
                            <img
                              alt=""
                              className="block max-w-none"
                              src="/assets/b2_subitem_credit_icon.svg"
                              width={14}
                              height={14}
                            />
                          </div>
                          <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                            <p className="leading-[15.6px] m-0">
                              {sub.credits}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel Module (406px on desktop) */}
          <div
            className="w-full lg:w-[406px] shrink-0 flex justify-center"
            data-node-id="1220:11652"
          >
            <PanelModule variant="page" asset={currentAsset} />
          </div>
        </div>
      </div>
    </div>
  );
}
