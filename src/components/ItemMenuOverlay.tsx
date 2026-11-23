"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  ChevronRight,
  ExternalLink,
  Layers,
  Maximize2,
  Scan,
  Sparkles,
  X,
} from "lucide-react";
import {
  AssetDetailData,
  DEFAULT_ASSET_DETAIL,
  PanelModule,
} from "./PanelModule";

type ItemMenuOverlayProps = {
  isOpen: boolean;
  asset?: AssetDetailData;
  onClose: () => void;
  onExpand: () => void;
};

type ViewportChannel = "lit" | "clay" | "wireframe" | "uv";

export function ItemMenuOverlay({
  isOpen,
  asset = DEFAULT_ASSET_DETAIL,
  onClose,
  onExpand,
}: ItemMenuOverlayProps) {
  const [channel, setChannel] = useState<ViewportChannel>("lit");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      className="kumo-portal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 lg:p-6 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Asset Quick Inspector Overlay"
    >
      <div
        className="bg-[var(--color-kumo-canvas)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] flex flex-col overflow-hidden relative rounded-[12px] w-full max-w-[1460px] lg:h-[820px] max-h-[92vh] my-auto"
        data-node-id="1220:11653"
        data-name="Item Menu Overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top 58px Kumo Inspector Header Bar */}
        <header className="h-[58px] shrink-0 px-4 sm:px-5 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] flex items-center justify-between gap-3">
          {/* Left: Breadcrumb + Specimen ID Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="kumo-mono text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-white border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-strong)] shrink-0">
              #{asset.id}
            </span>
            <div className="flex items-center gap-1.5 text-[13px] truncate">
              <span className="text-[var(--text-color-kumo-subtle)] hidden sm:inline truncate">
                {asset.location.trim()}
              </span>
              <ChevronRight
                size={13}
                className="text-[var(--text-color-kumo-subtle)] hidden sm:inline shrink-0"
              />
              <span className="font-semibold text-[var(--text-color-kumo-strong)] truncate">
                {asset.title}
              </span>
            </div>
          </div>

          {/* Center: Kumo Segmented Viewport Shader Switcher */}
          <div
            role="tablist"
            aria-label="3D Viewport Channel"
            className="hidden md:inline-flex items-center h-8 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5 shrink-0"
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
                  className={`h-7 px-2.5 rounded-[6px] border-0 text-[12px] cursor-pointer transition-colors ${
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

          {/* Right: Expand to /item + Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onExpand}
              title="Open full page inspection (/item)"
              className="h-8 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Maximize2 size={13} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
              <span className="hidden sm:inline">Full page</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close overlay"
              title="Close (Esc)"
              className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <X size={15} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Split Body: Left 3D Stage + Right 420px Kumo Inspector Rail */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Left 3D Preview Stage */}
          <div className="w-full lg:flex-1 h-[320px] sm:h-[440px] lg:h-full p-3 sm:p-4 flex flex-col">
            <div className="relative flex-1 w-full h-full rounded-[8px] bg-[#141417] border border-[var(--color-kumo-line)] overflow-hidden flex items-center justify-center">
              {/* Subtle technical grid overlay */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {asset?.imgUrl && (
                <img
                  alt={asset.title}
                  src={asset.imgUrl}
                  className={`w-full h-full object-contain transition-all duration-200 ${filterClass}`}
                />
              )}

              {/* Bottom-left Technical HUD Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-black/75 border border-white/10 text-white/90 text-[11px] kumo-mono">
                  <Scan size={12} className="text-[#3e8eff]" />
                  <span>LiDAR + 8K PBR</span>
                  <span className="text-white/30">·</span>
                  <span>{asset.geometryTriangles}</span>
                  {asset.randname && (
                    <>
                      <span className="text-white/30">·</span>
                      <span>{asset.randname}</span>
                    </>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-black/75 border border-white/10 text-white/80 text-[11px] kumo-mono">
                  <Layers size={12} className="text-[#f6821f]" />
                  <span>Mode: {channel.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Scrollable Kumo Inspector Rail (`420px` wide, `border-l border-kumo-line`) */}
          <aside
            className="w-full lg:w-[420px] shrink-0 lg:border-l border-t lg:border-t-0 border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] h-full overflow-y-auto p-4"
            data-node-id="1220:11658"
            data-name="Inspector Rail"
          >
            <PanelModule
              variant="overlay"
              asset={asset}
              onExpandToPage={onExpand}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
