"use client";

import React, { useState } from "react";
import { QuickPurchaseOverlay } from "./QuickPurchaseOverlay";

export type AssetDetailData = {
  id: string;
  randname?: string;
  imgUrl?: string;
  banner?: string;
  sourceUrl?: string;
  assetGroup?: string;
  categoryLabel?: string;
  subcategoryLabel?: string;
  title: string;
  location: string;
  year: string;
  credits: string;
  size: string;
  lodsLabel: string;
  pathSegments: string[];
  formats: string[];
  geometryTriangles: string;
  geometryVertices: string;
  diskSize: string;
  memory: string;
  vram: string;
  physicalSize: string;
  lodsCount: string;
  textureFormat: string;
  publishDate: string;
  licenseTerms: string;
  allowAiUsage: string;
  licenseOwner: string;
};

export const DEFAULT_ASSET_DETAIL: AssetDetailData = {
  id: "1",
  title: "White Marble Incense Burner",
  location: "Quang Tri Citadel ",
  year: "1975",
  credits: "04 Credits",
  size: "4,68 MB",
  lodsLabel: "LODs",
  pathSegments: ["Vietnam", "/Centerside", "/Quang Tri Citadel", "/Object"],
  formats: ["obj", "fbx"],
  geometryTriangles: "1,997 Triangles",
  geometryVertices: "1,976 Vertices",
  diskSize: "92.0 KB",
  memory: "0.20 MB",
  vram: "0.08 MB",
  physicalSize: "25cm x 20cm x 17cm",
  lodsCount: "5",
  textureFormat: "JPG",
  publishDate: "March 15, 2025",
  licenseTerms: "Standard License",
  allowAiUsage: "No",
  licenseOwner: "Onflow Co., Ltd",
};

const LOD_OPTIONS = [
  "High Poly, LODs",
  "LOD0 (High Poly)",
  "LOD1 (Medium Poly)",
  "LOD2 (Low Poly)",
];

const TEXTURE_RESOLUTION_OPTIONS = [
  "PNG 4096x4096",
  "PNG 2048x2048",
  "PNG 1024x1024",
  "JPG 4096x4096",
];

const OBJECT_FORMAT_OPTIONS = ["USD", "FBX", "OBJ", "GLB"];

const INITIAL_TEXTURE_MAPS = [
  { id: "texture", label: "Texture Map", checked: true },
  { id: "displacement", label: "Displacement Map", checked: true },
  { id: "normal", label: "Normal Map", checked: true },
  { id: "roughness", label: "Roughness Map", checked: true },
  { id: "ao", label: "Ambient Occlusion", checked: true },
  { id: "metallic", label: "Metallic Map", checked: false },
];

type PanelModuleProps = {
  variant: "overlay" | "page";
  asset?: AssetDetailData;
  onExpandToPage?: () => void;
};

export function PanelModule({
  variant,
  asset = DEFAULT_ASSET_DETAIL,
  onExpandToPage,
}: PanelModuleProps) {
  const isOverlay = variant === "overlay";

  const [selectedLod, setSelectedLod] = useState(LOD_OPTIONS[0]);
  const [selectedTextureRes, setSelectedTextureRes] = useState(
    TEXTURE_RESOLUTION_OPTIONS[0]
  );
  const [selectedObjectFormat, setSelectedObjectFormat] = useState(
    OBJECT_FORMAT_OPTIONS[0]
  );
  const [openDropdown, setOpenDropdown] = useState<
    "lod" | "texture" | "format" | null
  >(null);

  const [textures, setTextures] = useState(INITIAL_TEXTURE_MAPS);
  const [bookmarked, setBookmarked] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const parsedCreditCost = (() => {
    if (!asset.credits) return 5;
    if (asset.credits.toLowerCase().includes("free")) return 0;
    const n = parseInt(asset.credits, 10);
    return Number.isFinite(n) ? n : 5;
  })();

  const toggleTexture = (id: string) => {
    setTextures((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  const lodActiveStyle = isOverlay || openDropdown === "lod";

  return (
    <div
      className="flex flex-col gap-[10px] items-start relative shrink-0 w-full max-w-[406px]"
      data-name="Panel Module"
    >
      {/* Module 1: Name & Icon + Path */}
      <div
        className={`flex flex-col gap-[4px] items-start relative shrink-0 w-full ${
          isOverlay ? "drop-shadow-[0px_4px_1.4px_rgba(0,0,0,0.03)]" : ""
        }`}
        data-name="Module 1"
      >
        <div
          className={`bg-white flex flex-col gap-[12px] items-start overflow-hidden p-[32px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full ${
            !isOverlay ? "shadow-[0px_4px_2.8px_0px_rgba(0,0,0,0.03)]" : ""
          }`}
          data-name="Name&Icon"
        >
          {/* Labels: Location & Year */}
          <div
            className="flex gap-[10px] items-center relative shrink-0 w-full flex-wrap"
            data-name="Labels"
          >
            <div className="bg-[#ededed] cursor-pointer flex gap-[10px] h-[32px] items-center justify-center min-h-[32px] overflow-hidden pl-[5px] pr-[15px] py-[5px] relative rounded-[16px] shrink-0">
              <div className="relative shrink-0 size-[22px]">
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/overlay_location_icon.svg"
                  width={22}
                  height={22}
                />
              </div>
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#101820] text-[12px] whitespace-nowrap">
                <p className="leading-[12px] m-0">{asset.location}</p>
              </div>
            </div>

            <div className="bg-[#ededed] flex gap-[10px] h-[32px] items-center justify-center min-h-[32px] overflow-hidden pl-[5px] pr-[15px] py-[5px] relative rounded-[16px] shrink-0">
              <div className="relative shrink-0 size-[22px]">
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/overlay_year_icon.svg"
                  width={22}
                  height={22}
                />
              </div>
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#101820] text-[12px] whitespace-nowrap">
                <p className="leading-[12px] m-0">{asset.year}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#19213d]">
            <h2 className="leading-[30px] m-0 font-google-sans text-[24px] font-bold text-[#19213d]">{asset.title}</h2>
          </div>

          {/* Icons: 04 Credits, 4,68 MB, LODs */}
          <div
            className="flex gap-[25px] items-center relative shrink-0 w-full max-w-[338px]"
            data-name="Icons"
          >
            <div className="flex gap-[3px] items-center relative shrink-0">
              <div className="relative shrink-0 size-[16px]">
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/overlay_credit_icon.svg"
                  width={16}
                  height={16}
                />
              </div>
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                <p className="leading-[15.6px] m-0">{asset.credits}</p>
              </div>
            </div>

            <div className="flex gap-[3px] items-center relative shrink-0">
              <div className="relative shrink-0 size-[16px]">
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/overlay_size_icon.svg"
                  width={16}
                  height={16}
                />
              </div>
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                <p className="leading-[15.6px] m-0">{asset.size}</p>
              </div>
            </div>

            <div className="flex gap-[3px] items-center relative shrink-0">
              <div className="relative shrink-0 size-[16px]">
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/overlay_lods_badge_icon.svg"
                  width={16}
                  height={16}
                />
              </div>
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                <p className="leading-[15.6px] m-0">{asset.lodsLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* O - Path */}
        <div
          className={`bg-white flex items-center min-h-[32px] overflow-hidden px-[32px] py-[4px] relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full ${
            !isOverlay ? "shadow-[0px_4px_2.8px_0px_rgba(0,0,0,0.03)]" : ""
          }`}
          data-name="O - Path"
        >
          <div className="flex flex-1 flex-row items-center self-stretch">
            <div className="content-center flex flex-1 flex-wrap gap-0 h-full items-center min-w-0 relative">
              {asset.pathSegments.map((seg, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center relative shrink-0"
                >
                  <div className="flex flex-col font-sans font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">{seg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Item selection module */}
      <div
        className="bg-white flex flex-col items-center justify-center p-[32px] relative rounded-[10px] shadow-[0px_4px_2.8px_0px_rgba(0,0,0,0.03)] shrink-0 w-full"
        data-name="Item selection module"
      >
        <div
          className="flex flex-col gap-[15px] items-start relative shrink-0 w-full max-w-[342px]"
          data-name="Buttons"
        >
          {/* Setting Dropdowns */}
          <div
            className="flex flex-col gap-[4px] items-end relative shrink-0 w-full"
            data-name="Setting Dropdown"
          >
            {/* 1. LODs Selection */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === "lod" ? null : "lod")
                }
                className={`cursor-pointer border border-solid flex items-center justify-between overflow-hidden px-[32px] py-[12px] relative rounded-[10px] shrink-0 w-full transition-colors ${
                  lodActiveStyle
                    ? "border-[#004bda]"
                    : "bg-white border-[#c9c9c9] hover:border-[#19213d]/40"
                }`}
                style={
                  lodActiveStyle
                    ? {
                        backgroundImage:
                          "linear-gradient(90deg, rgba(78, 72, 200, 0.1) 0%, rgba(78, 72, 200, 0.1) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
                      }
                    : undefined
                }
                data-name="LODs Selection"
              >
                <div className="flex gap-[7px] items-center relative shrink-0 w-[142px]">
                  <div className="h-[16px] overflow-hidden relative shrink-0 w-[18px]">
                    <div className="absolute left-[1px] size-[16px] top-0">
                      <img
                        alt=""
                        className="block max-w-none"
                        src={
                          lodActiveStyle
                            ? "/assets/overlay_lods_select_blue.svg"
                            : "/assets/b2_lods_select_dark.svg"
                        }
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col font-sans font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] text-left whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">Level Of Details</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-[5px] items-center justify-end min-w-0 relative">
                  <div className="flex flex-1 flex-col font-sans font-normal justify-center leading-[0] min-w-0 not-italic relative text-[12px] text-[rgba(25,33,61,0.7)] text-right">
                    <p className="leading-[15.6px] m-0">{selectedLod}</p>
                  </div>
                  <div className="overflow-hidden relative shrink-0 size-[12px] flex items-center justify-center">
                    <img
                      alt=""
                      className={`block max-w-none transition-transform ${
                        openDropdown === "lod" ? "rotate-180" : ""
                      }`}
                      src="/assets/overlay_dropdown_arrow.svg"
                      width={10}
                      height={6}
                    />
                  </div>
                </div>
              </button>

              {openDropdown === "lod" && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#c9c9c9] rounded-[10px] shadow-md z-30 py-[4px] overflow-hidden">
                  {LOD_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedLod(opt);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-[32px] py-[8px] text-[12px] font-sans cursor-pointer border-0 transition-colors ${
                        selectedLod === opt
                          ? "bg-[#004bda]/10 text-[#004bda] font-semibold"
                          : "bg-white text-[#19213d] hover:bg-black/[0.04]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Texture Selection */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "texture" ? null : "texture"
                  )
                }
                className={`bg-white border border-solid cursor-pointer flex items-center justify-between overflow-hidden px-[32px] py-[12px] relative rounded-[10px] shrink-0 w-full transition-colors ${
                  openDropdown === "texture"
                    ? "border-[#004bda]"
                    : "border-[#c9c9c9] hover:border-[#19213d]/40"
                }`}
                data-name="Texture Selection"
              >
                <div className="flex gap-[7px] items-center relative shrink-0">
                  <div className="h-[16px] relative shrink-0 w-[18px]">
                    <img
                      alt=""
                      className="block max-w-none"
                      src="/assets/overlay_texture_select.svg"
                      width={18}
                      height={16}
                    />
                  </div>
                  <div className="flex flex-col font-sans font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] text-left whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">Texture Resolutions</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-[5px] items-center justify-end min-w-0 relative">
                  <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] text-right w-[115px]">
                    <p className="leading-[15.6px] m-0">{selectedTextureRes}</p>
                  </div>
                  <div className="overflow-hidden relative shrink-0 size-[12px] flex items-center justify-center">
                    <img
                      alt=""
                      className={`block max-w-none transition-transform ${
                        openDropdown === "texture" ? "rotate-180" : ""
                      }`}
                      src="/assets/overlay_dropdown_arrow.svg"
                      width={10}
                      height={6}
                    />
                  </div>
                </div>
              </button>

              {openDropdown === "texture" && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#c9c9c9] rounded-[10px] shadow-md z-30 py-[4px] overflow-hidden">
                  {TEXTURE_RESOLUTION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedTextureRes(opt);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-[32px] py-[8px] text-[12px] font-sans cursor-pointer border-0 transition-colors ${
                        selectedTextureRes === opt
                          ? "bg-[#004bda]/10 text-[#004bda] font-semibold"
                          : "bg-white text-[#19213d] hover:bg-black/[0.04]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Object Format Selection */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === "format" ? null : "format")
                }
                className={`bg-white border border-solid cursor-pointer flex items-center justify-between overflow-hidden px-[32px] py-[12px] relative rounded-[10px] shrink-0 w-full transition-colors ${
                  openDropdown === "format"
                    ? "border-[#004bda]"
                    : "border-[#c9c9c9] hover:border-[#19213d]/40"
                }`}
                data-name="Object Format Selection"
              >
                <div className="flex gap-[7px] items-center relative shrink-0">
                  <div className="h-[16px] overflow-hidden relative shrink-0 w-[18px] flex items-center justify-center">
                    <img
                      alt=""
                      className="block max-w-none"
                      src="/assets/overlay_format_select.svg"
                      width={15.4}
                      height={15.4}
                    />
                  </div>
                  <div className="flex flex-col font-sans font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(25,33,61,0.7)] text-left whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">Object Format</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-[5px] items-center justify-end min-w-0 relative">
                  <div className="flex flex-1 flex-col font-sans font-normal justify-center leading-[0] min-w-0 not-italic relative text-[12px] text-[rgba(25,33,61,0.7)] text-right">
                    <p className="leading-[15.6px] m-0">
                      {selectedObjectFormat}
                    </p>
                  </div>
                  <div className="overflow-hidden relative shrink-0 size-[12px] flex items-center justify-center">
                    <img
                      alt=""
                      className={`block max-w-none transition-transform ${
                        openDropdown === "format" ? "rotate-180" : ""
                      }`}
                      src="/assets/overlay_dropdown_arrow.svg"
                      width={10}
                      height={6}
                    />
                  </div>
                </div>
              </button>

              {openDropdown === "format" && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#c9c9c9] rounded-[10px] shadow-md z-30 py-[4px] overflow-hidden">
                  {OBJECT_FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedObjectFormat(opt);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-[32px] py-[8px] text-[12px] font-sans cursor-pointer border-0 transition-colors ${
                        selectedObjectFormat === opt
                          ? "bg-[#004bda]/10 text-[#004bda] font-semibold"
                          : "bg-white text-[#19213d] hover:bg-black/[0.04]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment Buttons */}
          <div
            className="flex flex-col gap-[6px] items-end relative shrink-0 w-full"
            data-name="Payment"
          >
            <button
              type="button"
              onClick={() => setPurchaseModalOpen(true)}
              className="bg-[#004bda] hover:bg-[#003eb5] transition-colors cursor-pointer flex h-[40px] items-center justify-center overflow-hidden relative rounded-[10px] shrink-0 w-full border-0"
              data-name="Purchase Button"
            >
              <div className="flex flex-col font-sans font-bold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white text-center whitespace-nowrap">
                <p className="leading-[15.6px] m-0">
                  {purchased
                    ? "Purchased (Ready to download)"
                    : `Quick purchase (-${parsedCreditCost} credits)`}
                </p>
              </div>
            </button>

            <div className="flex items-center justify-between relative shrink-0 w-full gap-[8px]">
              {isOverlay ? (
                <button
                  type="button"
                  onClick={onExpandToPage}
                  className="bg-[#ededed] hover:bg-[#e2e2e2] transition-colors cursor-pointer flex gap-[10px] h-[40px] items-center justify-center overflow-hidden relative rounded-[10px] shrink-0 w-[294px] border-0"
                >
                  <div className="relative shrink-0 size-[24px]">
                    <img
                      alt=""
                      className="block max-w-none"
                      src="/assets/overlay_view_details_icon.svg"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[#19213d] text-left whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">View Details</p>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddedToCart(!addedToCart)}
                  className="bg-[#ededed] hover:bg-[#e2e2e2] transition-colors cursor-pointer flex h-[40px] items-center justify-center overflow-hidden relative rounded-[10px] shrink-0 w-[294px] border-0"
                >
                  <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#101820] text-[14px] text-center whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">
                      {addedToCart ? "Added to cart ✓" : "Add to cart"}
                    </p>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setBookmarked(!bookmarked)}
                aria-label="Bookmark item"
                className={`relative shrink-0 size-[40px] cursor-pointer border-0 bg-transparent p-0 rounded-[10px] transition-opacity ${
                  bookmarked ? "ring-2 ring-[#004bda]" : "hover:opacity-85"
                }`}
              >
                <img
                  alt=""
                  className="block max-w-none"
                  src="/assets/overlay_bookmark_btn.svg"
                  width={40}
                  height={40}
                />
              </button>
            </div>
          </div>

          {/* Note box */}
          <div className="bg-white border-[0.3px] border-[rgba(25,33,61,0.7)] border-solid flex items-start overflow-hidden p-[6px] relative rounded-[5px] shrink-0 w-full">
            <div className="flex flex-1 flex-col font-sans font-normal justify-center leading-[0] min-w-0 not-italic relative text-[rgba(25,33,61,0.7)]">
              <p className="text-[12px] m-0">
                <span className="font-sans font-bold leading-[15.6px] not-italic">
                  ⓘ Note:
                </span>
                <span className="leading-[15.6px]">
                  {" "}
                  LOD options are fixed after purchase and cannot be changed
                  during downloads.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Technical Information + Textures */}
      <div
        className="drop-shadow-[0px_4px_1.4px_rgba(0,0,0,0.03)] flex flex-col gap-[4px] items-start relative shrink-0 w-full"
        data-name="Module 3"
      >
        {/* Technical Information */}
        <div
          className="bg-white flex flex-col items-center justify-center overflow-hidden px-[32px] py-[20px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full"
          data-name="Technical Information"
        >
          <div className="flex flex-col gap-[15px] items-start relative shrink-0 w-full">
            <div className="flex flex-col font-sans font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[#19213d] w-full">
              <p className="leading-[15.6px] m-0">Technical Information</p>
            </div>

            <div className="flex flex-col gap-[5px] items-start relative shrink-0 w-full">
              {/* Format */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal justify-center leading-[0] min-w-0 not-italic relative self-stretch text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">Format:</p>
                  </div>
                </div>
                <div className="content-start flex flex-wrap gap-[5px] items-start pr-[10px] relative shrink-0 w-[163px]">
                  {asset.formats.map((fmt) => (
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

              {/* Geometry */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">Geometry:</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <div className="flex-1 font-sans font-normal leading-[0] min-w-0 not-italic relative text-[14px] text-[#19213d]">
                    <p className="leading-[19.6px] m-0">
                      {asset.geometryTriangles}
                    </p>
                    <p className="leading-[19.6px] m-0">
                      {asset.geometryVertices}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disk size */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">Disk size:</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[15.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.diskSize}
                  </p>
                </div>
              </div>

              {/* Memory */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">Memory:</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[15.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.memory}
                  </p>
                </div>
              </div>

              {/* VRAM */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">VRAM:</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[15.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.vram}
                  </p>
                </div>
              </div>

              {/* Physical size */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">Physical size:</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[15.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.physicalSize}
                  </p>
                </div>
              </div>

              {/* LODs */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">LODs:</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[15.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.lodsCount}
                  </p>
                </div>
              </div>

              {/* Texture format */}
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[15.6px] m-0">Texture format:</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[15.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.textureFormat}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Textures Checkboxes */}
        <div
          className="bg-white flex flex-col items-start overflow-hidden px-[32px] py-[20px] relative rounded-bl-[10px] rounded-br-[10px] rounded-tl-[4px] shrink-0 w-full"
          data-name="Textures"
        >
          <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <div className="flex flex-col items-start relative shrink-0 w-full">
              <div className="flex flex-col font-sans font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[#19213d] w-full">
                <p className="leading-[15.6px] m-0">Textures</p>
              </div>
            </div>

            <div className="content-start flex flex-wrap gap-y-[12px] gap-x-[22px] items-start relative shrink-0 w-full">
              {textures.map((tex) => (
                <button
                  key={tex.id}
                  type="button"
                  onClick={() => toggleTexture(tex.id)}
                  className="bg-white cursor-pointer flex gap-[8px] items-center opacity-80 hover:opacity-100 overflow-hidden relative shrink-0 w-[151px] border-0 p-0 text-left"
                  data-name="Texture"
                >
                  {tex.checked ? (
                    <div className="bg-[#004bda] overflow-hidden relative rounded-[5px] shrink-0 size-[20px] flex items-center justify-center">
                      <img
                        alt=""
                        className="block max-w-none"
                        src="/assets/overlay_checkbox_tick.svg"
                        width={11.7}
                        height={8.76}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#dbdbdb] relative rounded-[5px] shrink-0 size-[20px]" />
                  )}
                  <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[#19213d] whitespace-nowrap">
                    <p className="leading-[15.6px] m-0">{tex.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module 4: Details + Share/Report Buttons */}
      <div
        className="drop-shadow-[0px_4px_1.4px_rgba(0,0,0,0.03)] flex flex-col gap-[4px] items-start relative shrink-0 w-full"
        data-name="Module 4"
      >
        <div
          className="bg-white flex flex-col items-center justify-center overflow-hidden px-[32px] py-[20px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full"
          data-name="Details"
        >
          <div className="flex flex-col gap-[15px] items-start relative shrink-0 w-full">
            <div className="flex flex-col font-sans font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[#19213d] w-full">
              <p className="leading-[15.6px] m-0">Details</p>
            </div>

            <div className="flex flex-col gap-[5px] items-start relative shrink-0 w-full">
              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[19.6px] m-0">Publish date</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[19.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.publishDate}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[19.6px] m-0">License terms</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[19.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.licenseTerms}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[19.6px] m-0">Allow usage with AI</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[19.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.allowAiUsage}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex items-center relative shrink-0 w-[165px]">
                  <div className="flex flex-1 flex-col font-sans font-normal h-full justify-center leading-[0] min-w-0 not-italic relative text-[14px] text-[rgba(25,33,61,0.7)]">
                    <p className="leading-[19.6px] m-0">License Owner</p>
                  </div>
                </div>
                <div className="flex items-start relative shrink-0 w-[165px]">
                  <p className="flex-1 font-sans font-normal leading-[19.6px] min-w-0 not-italic relative text-[14px] text-[#19213d] m-0">
                    {asset.licenseOwner}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share & Something Wrong Buttons */}
        <div
          className="bg-white flex gap-[10px] items-center justify-center overflow-hidden px-[32px] py-[20px] relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full"
          data-name="Share buttons"
        >
          <button
            type="button"
            onClick={() => {
              setShareCopied(true);
              setTimeout(() => setShareCopied(false), 2000);
            }}
            className="bg-[#ededed] hover:bg-[#e2e2e2] transition-colors cursor-pointer flex gap-[12px] items-center overflow-hidden px-[22px] py-[8px] relative rounded-[10px] shrink-0 border-0"
          >
            <div className="relative shrink-0 size-[24px]">
              <img
                alt=""
                className="block max-w-none"
                src="/assets/overlay_share_icon.svg"
                width={24}
                height={24}
              />
            </div>
            <div className="flex flex-col font-nacelle font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[#19213d] whitespace-nowrap">
              <p className="leading-[15.6px] m-0">
                {shareCopied ? "Copied!" : "Share"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setReportSubmitted(true);
              setTimeout(() => setReportSubmitted(false), 2000);
            }}
            className="bg-[#ededed] hover:bg-[#e2e2e2] transition-colors cursor-pointer flex gap-[12px] items-center overflow-hidden px-[22px] py-[8px] relative rounded-[10px] shrink-0 border-0"
          >
            <div className="relative shrink-0 size-[24px]">
              <img
                alt=""
                className="block max-w-none"
                src="/assets/overlay_report_icon.svg"
                width={24}
                height={24}
              />
            </div>
            <div className="flex flex-col font-nacelle font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[#19213d] whitespace-nowrap">
              <p className="leading-[15.6px] m-0">
                {reportSubmitted ? "Reported!" : "Something Wrong"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {purchaseModalOpen && (
        <QuickPurchaseOverlay
          isOpen={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          onPurchaseSuccess={() => setPurchased(true)}
          assetTitle={asset.title}
          assetImgUrl={asset.imgUrl}
          lodLabel={selectedLod}
          textureResolution={selectedTextureRes}
          objectFormat={selectedObjectFormat}
          downloadSize={asset.size}
          creditCost={parsedCreditCost}
          initialStep={purchased ? "success" : "confirm"}
        />
      )}
    </div>
  );
}
