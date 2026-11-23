"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Bookmark,
  Box,
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  ExternalLink,
  HardDrive,
  Info,
  Layers,
  MapPin,
  Share2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { QuickPurchaseOverlay } from "./QuickPurchaseOverlay";
import { CreditIcon } from "./CreditIcon";

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
  location: "Quang Tri Citadel",
  year: "1975",
  credits: "04 Credits",
  size: "4,68 MB",
  lodsLabel: "LOD0–LOD4",
  pathSegments: ["Vietnam", "/Central Vietnam", "/Quang Tri Citadel", "/Object"],
  formats: ["obj", "fbx", "glb", "usd"],
  geometryTriangles: "1,997 Triangles",
  geometryVertices: "1,976 Vertices",
  diskSize: "92.0 KB",
  memory: "0.20 MB",
  vram: "0.08 MB",
  physicalSize: "25cm × 20cm × 17cm",
  lodsCount: "5",
  textureFormat: "PNG / EXR 16-bit",
  publishDate: "March 15, 2025",
  licenseTerms: "Standard Commercial",
  allowAiUsage: "No",
  licenseOwner: "Onflow Asia Co., Ltd",
};

const LOD_OPTIONS = [
  "High Poly, LODs",
  "LOD0 (High Poly)",
  "LOD1 (Medium Poly)",
  "LOD2 (Low Poly)",
];

const TEXTURE_RESOLUTION_OPTIONS = [
  "PNG 4096×4096",
  "PNG 2048×2048",
  "PNG 1024×1024",
  "EXR 8192×8192 (16-bit)",
];

const OBJECT_FORMAT_OPTIONS = ["USD", "FBX", "OBJ", "GLB"];

const INITIAL_TEXTURE_MAPS = [
  { id: "texture", label: "Albedo / Base Color", checked: true },
  { id: "displacement", label: "Displacement (16-bit)", checked: true },
  { id: "normal", label: "Normal Map (OpenGL)", checked: true },
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

  return (
    <div
      className="kumo-portal flex flex-col gap-3 items-stretch relative shrink-0 w-full"
      data-name="Panel Module"
    >
      {/* Card 1: Asset Summary Header + Hierarchy Breadcrumb Path */}
      <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden flex flex-col">
        <div className="p-4 flex flex-col gap-3">
          {/* Top Metadata Pills (Location & Year + Active Status) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full border border-[var(--color-kumo-fill)] bg-[var(--color-kumo-canvas)] text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                <MapPin size={12} className="text-[var(--text-color-kumo-subtle)]" />
                <span className="truncate max-w-[160px]">{asset.location.trim()}</span>
              </span>
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-[var(--color-kumo-fill)] bg-white text-[11px] font-medium text-[var(--text-color-kumo-subtle)] kumo-mono">
                <Calendar size={11} />
                <span>{asset.year}</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 h-5 px-2 py-0.5 rounded-full border border-[var(--color-kumo-hairline)] text-[11px] font-medium text-[var(--text-color-kumo-default)]">
              <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
              <span>Calibrated</span>
            </span>
          </div>

          {/* Asset Title */}
          <h2 className="m-0 text-[18px] leading-[24px] font-semibold tracking-[-0.01em] text-[var(--text-color-kumo-strong)]">
            {asset.title}
          </h2>

          {/* Compact Metric Strip (Credits · Size · LODs) */}
          <div className="grid grid-cols-3 divide-x divide-[var(--color-kumo-line)] rounded-[6px] bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] py-2">
            <div className="px-2.5 flex flex-col gap-0.5">
              <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                Unlock cost
              </span>
              <span className="kumo-mono text-[13px] font-semibold text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                {parsedCreditCost === 0 ? (
                  <>
                    <span>Free (0</span>
                    <CreditIcon size={11} />
                    <span>)</span>
                  </>
                ) : (
                  <>
                    <span>{parsedCreditCost}</span>
                    <CreditIcon size={11} />
                  </>
                )}
              </span>
            </div>
            <div className="px-2.5 flex flex-col gap-0.5">
              <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                Archive size
              </span>
              <span className="kumo-mono text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                {asset.size.replace(",", ".")}
              </span>
            </div>
            <div className="px-2.5 flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] text-[var(--text-color-kumo-subtle)] whitespace-nowrap">
                Hierarchy
              </span>
              <span className="kumo-mono text-[13px] font-semibold text-[var(--text-color-kumo-strong)] whitespace-nowrap">
                {asset.lodsLabel || "LOD0–4"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Path Bar */}
        <div className="px-4 py-2 bg-[var(--color-kumo-canvas)] border-t border-[var(--color-kumo-line)] flex flex-wrap items-center gap-0.5 text-[11px] kumo-mono text-[var(--text-color-kumo-subtle)]">
          {asset.pathSegments.map((seg, i) => (
            <span
              key={i}
              className={
                i === asset.pathSegments.length - 1
                  ? "text-[var(--text-color-kumo-strong)] font-medium"
                  : ""
              }
            >
              {seg}
            </span>
          ))}
        </div>
      </div>

      {/* Card 2: Export Configuration & Purchase Action (Cloudflare Kumo Control Card) */}
      <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-4 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
            Export configuration
          </span>
          <span className="text-[11px] text-[var(--text-color-kumo-subtle)] kumo-mono inline-flex items-center gap-1">
            <span>Re-downloads: 0</span>
            <CreditIcon size={10} />
          </span>
        </div>

        {/* 3 Kumo Selector Rows */}
        <div className="flex flex-col gap-2">
          {/* 1. Level of Detail */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "lod" ? null : "lod")
              }
              className={`w-full h-9 px-3 rounded-[8px] border flex items-center justify-between gap-2 text-[13px] cursor-pointer transition-colors ${
                openDropdown === "lod"
                  ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-strong)]"
                  : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)]"
              }`}
            >
              <span className="flex items-center gap-2 text-[var(--text-color-kumo-subtle)]">
                <Layers size={14} strokeWidth={1.5} />
                <span>Geometry LOD</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[var(--text-color-kumo-strong)] kumo-mono text-[12px]">
                <span>{selectedLod}</span>
                <ChevronDown
                  size={13}
                  className={`text-[var(--text-color-kumo-subtle)] transition-transform ${
                    openDropdown === "lod" ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {openDropdown === "lod" && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[var(--color-kumo-line)] rounded-[8px] shadow-[var(--shadow-kumo-md)] z-30 py-1 overflow-hidden">
                {LOD_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedLod(opt);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[12px] cursor-pointer border-0 flex items-center justify-between transition-colors ${
                      selectedLod === opt
                        ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)] font-medium"
                        : "bg-white text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedLod === opt && (
                      <Check size={13} className="text-[var(--color-kumo-brand)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Texture Resolution */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "texture" ? null : "texture")
              }
              className={`w-full h-9 px-3 rounded-[8px] border flex items-center justify-between gap-2 text-[13px] cursor-pointer transition-colors ${
                openDropdown === "texture"
                  ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-strong)]"
                  : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)]"
              }`}
            >
              <span className="flex items-center gap-2 text-[var(--text-color-kumo-subtle)]">
                <Sparkles size={14} strokeWidth={1.5} />
                <span>Texture maps</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[var(--text-color-kumo-strong)] kumo-mono text-[12px]">
                <span>{selectedTextureRes}</span>
                <ChevronDown
                  size={13}
                  className={`text-[var(--text-color-kumo-subtle)] transition-transform ${
                    openDropdown === "texture" ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {openDropdown === "texture" && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[var(--color-kumo-line)] rounded-[8px] shadow-[var(--shadow-kumo-md)] z-30 py-1 overflow-hidden">
                {TEXTURE_RESOLUTION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedTextureRes(opt);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[12px] cursor-pointer border-0 flex items-center justify-between transition-colors ${
                      selectedTextureRes === opt
                        ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)] font-medium"
                        : "bg-white text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedTextureRes === opt && (
                      <Check size={13} className="text-[var(--color-kumo-brand)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Object Format */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "format" ? null : "format")
              }
              className={`w-full h-9 px-3 rounded-[8px] border flex items-center justify-between gap-2 text-[13px] cursor-pointer transition-colors ${
                openDropdown === "format"
                  ? "bg-[#3e8eff]/[.06] border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-strong)]"
                  : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)]"
              }`}
            >
              <span className="flex items-center gap-2 text-[var(--text-color-kumo-subtle)]">
                <Box size={14} strokeWidth={1.5} />
                <span>Object format</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[var(--text-color-kumo-strong)] kumo-mono text-[12px]">
                <span>{selectedObjectFormat}</span>
                <ChevronDown
                  size={13}
                  className={`text-[var(--text-color-kumo-subtle)] transition-transform ${
                    openDropdown === "format" ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {openDropdown === "format" && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[var(--color-kumo-line)] rounded-[8px] shadow-[var(--shadow-kumo-md)] z-30 py-1 overflow-hidden">
                {OBJECT_FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedObjectFormat(opt);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[12px] cursor-pointer border-0 flex items-center justify-between transition-colors ${
                      selectedObjectFormat === opt
                        ? "bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-strong)] font-medium"
                        : "bg-white text-[var(--text-color-kumo-default)] hover:bg-[var(--color-kumo-tint)]"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedObjectFormat === opt && (
                      <Check size={13} className="text-[var(--color-kumo-brand)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary & Secondary Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => setPurchaseModalOpen(true)}
            className="h-9 w-full rounded-[8px] kumo-btn-primary text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer"
            data-name="Purchase Button"
          >
            <CreditCard size={14} strokeWidth={1.5} />
            <span>
              {purchased
                ? `Export ${selectedObjectFormat} archive (Owned)`
                : parsedCreditCost === 0
                ? `Download Free (${selectedObjectFormat})`
                : `Quick purchase (−${parsedCreditCost} credits)`}
            </span>
          </button>

          <div className="flex items-center gap-2">
            {isOverlay ? (
              <button
                type="button"
                onClick={onExpandToPage}
                className="flex-1 h-9 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink size={14} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
                <span>Open full inspection view</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAddedToCart(!addedToCart)}
                className={`flex-1 h-9 px-3 rounded-[8px] border shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  addedToCart
                    ? "bg-[#3e8eff]/[.10] border-[#3e8eff]/40 text-[var(--text-color-kumo-strong)]"
                    : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-default)]"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={14} strokeWidth={1.75} className="text-[var(--text-color-kumo-success)]" />
                    <span>Queued in cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
                    <span>Add to export queue</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setBookmarked(!bookmarked)}
              aria-label="Bookmark item"
              title={bookmarked ? "Saved in bookmarks" : "Save bookmark"}
              className={`size-9 rounded-[8px] border shadow-[var(--shadow-kumo-xs)] flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                bookmarked
                  ? "bg-[var(--color-kumo-recessed)] border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-strong)]"
                  : "bg-white hover:bg-[var(--color-kumo-tint)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
              }`}
            >
              <Bookmark
                size={15}
                strokeWidth={1.5}
                className={bookmarked ? "fill-current" : ""}
              />
            </button>
          </div>
        </div>

        {/* Grey Kumo Info Notice */}
        <div className="rounded-[6px] bg-[var(--color-kumo-recessed)] px-3 py-2 flex items-start gap-2 text-[12px] text-[var(--text-color-kumo-subtle)]">
          <Info size={14} className="text-[var(--text-color-kumo-default)] shrink-0 mt-0.5" />
          <span>
            Unlocked assets include unlimited free re-downloads across all LODs and resolutions in your Portal.
          </span>
        </div>
      </div>

      {/* Card 3: Technical Specs + Included PBR Channels */}
      <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden flex flex-col divide-y divide-[var(--color-kumo-line)]">
        {/* Technical Information Table */}
        <div className="p-4 flex flex-col gap-3">
          <h3 className="m-0 text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
            Technical specifications
          </h3>

          <div className="flex flex-col divide-y divide-[var(--color-kumo-line)] text-[12px]">
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-[var(--text-color-kumo-subtle)]">Supported formats</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {asset.formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="kumo-mono text-[10px] uppercase px-1.5 py-0.5 rounded-[4px] bg-[var(--color-kumo-recessed)] border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] font-medium"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-[var(--text-color-kumo-subtle)]">Geometry</span>
              <span className="kumo-mono text-[var(--text-color-kumo-strong)] text-right">
                {asset.geometryTriangles} · {asset.geometryVertices}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-[var(--text-color-kumo-subtle)]">Disk / VRAM footprint</span>
              <span className="kumo-mono text-[var(--text-color-kumo-strong)]">
                {asset.diskSize.replace(",", ".")} · {asset.vram.replace(",", ".")} VRAM
              </span>
            </div>

            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-[var(--text-color-kumo-subtle)]">Real-world dimensions</span>
              <span className="kumo-mono text-[var(--text-color-kumo-strong)]">
                {asset.physicalSize}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <span className="text-[var(--text-color-kumo-subtle)]">LOD levels / Bit depth</span>
              <span className="kumo-mono text-[var(--text-color-kumo-strong)]">
                {asset.lodsCount} LODs · {asset.textureFormat}
              </span>
            </div>
          </div>
        </div>

        {/* Included PBR Texture Channels Checklist */}
        <div className="p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
              Included PBR channels
            </h3>
            <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
              {textures.filter((t) => t.checked).length} / {textures.length} active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {textures.map((tex) => (
              <button
                key={tex.id}
                type="button"
                onClick={() => toggleTexture(tex.id)}
                className={`px-2.5 py-1.5 rounded-[6px] border text-left flex items-center gap-2 cursor-pointer transition-colors text-[12px] ${
                  tex.checked
                    ? "bg-[var(--color-kumo-canvas)] border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)]"
                    : "bg-white border-transparent text-[var(--text-color-kumo-subtle)] hover:bg-[var(--color-kumo-tint)]"
                }`}
              >
                <span
                  className={`size-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                    tex.checked
                      ? "bg-[var(--color-kumo-brand)] text-white"
                      : "bg-[var(--color-kumo-recessed)] border border-[var(--color-kumo-line)]"
                  }`}
                >
                  {tex.checked && <Check size={11} strokeWidth={2.2} />}
                </span>
                <span className="truncate">{tex.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card 4: Provenance, License & Share / Report */}
      <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-4 flex flex-col gap-3">
        <h3 className="m-0 text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
          License & provenance
        </h3>

        <div className="flex flex-col divide-y divide-[var(--color-kumo-line)] text-[12px]">
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-[var(--text-color-kumo-subtle)]">Published</span>
            <span className="kumo-mono text-[var(--text-color-kumo-default)]">
              {asset.publishDate}
            </span>
          </div>
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-[var(--text-color-kumo-subtle)]">License tier</span>
            <span className="font-medium text-[var(--text-color-kumo-link)]">
              {asset.licenseTerms}
            </span>
          </div>
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-[var(--text-color-kumo-subtle)]">Generative AI training</span>
            <span className="kumo-mono text-[var(--text-color-kumo-default)]">
              {asset.allowAiUsage}
            </span>
          </div>
          <div className="pt-1.5 flex items-center justify-between">
            <span className="text-[var(--text-color-kumo-subtle)]">Authority</span>
            <span className="text-[var(--text-color-kumo-strong)] font-medium">
              {asset.licenseOwner}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-kumo-line)] grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).catch(() => {});
              }
              setShareCopied(true);
              setTimeout(() => setShareCopied(false), 2000);
            }}
            className="h-8 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Share2 size={13} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
            <span>{shareCopied ? "Link copied" : "Share asset"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReportSubmitted(true);
              setTimeout(() => setReportSubmitted(false), 2000);
            }}
            className="h-8 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <AlertCircle size={13} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
            <span>{reportSubmitted ? "Report logged" : "Report issue"}</span>
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
