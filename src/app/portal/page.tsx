"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileDown,
  Filter,
  Globe,
  HelpCircle,
  Home,
  Info,
  KeyRound,
  Layers,
  Menu,
  MoreHorizontal,
  Package,
  PanelLeft,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import SettingsOverlay, {
  PortalBillingAddress,
  PortalPaymentMethod,
  SettingsTab,
} from "@/components/portal/SettingsOverlay";
import SupportCenterOverlay, { SupportTab } from "@/components/portal/SupportCenterOverlay";
import { CreditIcon } from "@/components/CreditIcon";
import { UserMenuDropdown } from "@/components/UserMenuDropdown";
import {
  PortalActiveSection,
  PortalSidebar,
} from "@/components/portal/PortalSidebar";

type PortalTab = "home" | "downloads" | "analytics" | "credits" | "settings";
type TimeRange = "24h" | "7d" | "30d" | "6m" | "1y";
type BillingSubTab = "credits" | "subscriptions" | "usage" | "limits" | "invoices";
type TxFilter = "all" | "purchase" | "spent" | "pending";
type AnalyticsMetricId = "downloads" | "credits" | "bandwidth" | "bridge";

type OrderAsset = {
  id: string;
  title: string;
  collection: string;
  path: string;
  category: "3D models" | "Surfaces" | "HDRIs" | "Kitbash";
  baseSizeMb: number;
  triangles: string;
  credits: number;
};

type PortalOrder = {
  id: string;
  code: string;
  dateLabel: string;
  relativeTime: string;
  timestamp: number;
  credits: number;
  assets: OrderAsset[];
};

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  targetTab: PortalTab;
};

type TransactionItem = {
  id: string;
  number: string;
  title: string;
  date: string;
  typeLabel: "Top-up" | "Asset unlock" | "Wire transfer";
  status: "Completed" | "Pending";
  amount: number;
  usdValue: string;
  type: "purchase" | "spent";
};

const ORGANIZATIONS = {
  onflow: {
    name: "Onflow Asia",
    accountHandle: "Maxwell@onflow.asia's Account",
    accountId: "71d0c1fe8708f672a16c7956ae8426be",
    subdomain: "onflow-asia.bridge.onflow.dev",
    initials: "OA",
    userName: "David Nguyen",
    email: "dev@onflow.asia",
    credits: 2686,
    grantedCredits: 6080,
    thisMonthSpent: 203,
    totalSpent: 3394,
    totalPurchased: 6080,
    daysRemaining: 240,
    cycleStart: "Jul 21, 2026",
    expiresDate: "Jul 21, 2027",
    avgMonthlyBurn: "203",
    billing: {
      company: "Onflow Asia Co., Ltd",
      line1: "123 Nguyen Hue Street, Floor 5",
      line2: "District 1, Ho Chi Minh City 70000",
      country: "Vietnam",
      taxId: "VN-0318294012",
    },
  },
  mekong: {
    name: "Mekong Studio",
    accountHandle: "studio@mekong3d.vn's Account",
    accountId: "94a8e3bc1029f481b35d8910cf4211a9",
    subdomain: "mekong-3d.bridge.onflow.dev",
    initials: "MS",
    userName: "David Nguyen",
    email: "studio@mekong3d.vn",
    credits: 1420,
    grantedCredits: 3280,
    thisMonthSpent: 148,
    totalSpent: 1860,
    totalPurchased: 3280,
    daysRemaining: 195,
    cycleStart: "Jun 06, 2026",
    expiresDate: "Jun 06, 2027",
    avgMonthlyBurn: "148",
    billing: {
      company: "Mekong 3D Visualization Ltd",
      line1: "48 Tran Hung Dao Street, Suite 302",
      line2: "Hoan Kiem District, Hanoi 100000",
      country: "Vietnam",
      taxId: "VN-0109482716",
    },
  },
} as const;

const HOME_ANALYTICS_CARDS: Record<
  TimeRange,
  {
    label: string;
    requestsTotal: string;
    requestsDelta: string;
    requestsSeries: number[];
    bridgeTotal: string;
    bridgeDelta: string;
    bridgeSeries: number[];
    errorsTotal: string;
    cacheRate: string;
    cacheDelta: string;
    cacheSeries: number[];
    p90Latency: string;
    p90Delta: string;
    p90Series: number[];
    creditsBurned: string;
    creditsDelta: string;
    creditsSeries: number[];
  }
> = {
  "24h": {
    label: "Last 24 hours",
    requestsTotal: "1.11k",
    requestsDelta: "89.9%",
    requestsSeries: [12, 8, 16, 6, 10, 4, 48, 8, 96, 108, 6, 4, 114, 164, 14, 6, 18, 8, 4, 38, 132, 8, 118, 6],
    bridgeTotal: "4",
    bridgeDelta: "100.0%",
    bridgeSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
    errorsTotal: "0",
    cacheRate: "94.82%",
    cacheDelta: "4.2%",
    cacheSeries: [88, 91, 94, 89, 96, 95, 92, 97, 94, 96, 93, 95, 98, 94, 96, 97],
    p90Latency: "484 ms",
    p90Delta: "12.4%",
    p90Series: [510, 505, 498, 490, 492, 488, 485, 484, 486, 480, 482, 484],
    creditsBurned: "24",
    creditsDelta: "18.0%",
    creditsSeries: [0, 0, 0, 8, 0, 0, 0, 10, 0, 0, 0, 6],
  },
  "7d": {
    label: "Last 7 days",
    requestsTotal: "6.84k",
    requestsDelta: "24.6%",
    requestsSeries: [620, 840, 790, 1120, 980, 1340, 1150],
    bridgeTotal: "28",
    bridgeDelta: "40.0%",
    bridgeSeries: [2, 4, 3, 6, 4, 5, 4],
    errorsTotal: "0",
    cacheRate: "96.14%",
    cacheDelta: "2.1%",
    cacheSeries: [93, 95, 94, 96, 97, 96, 98],
    p90Latency: "462 ms",
    p90Delta: "8.1%",
    p90Series: [495, 488, 476, 470, 468, 460, 462],
    creditsBurned: "154",
    creditsDelta: "14.2%",
    creditsSeries: [12, 18, 28, 16, 24, 34, 22],
  },
  "30d": {
    label: "Last 30 days",
    requestsTotal: "28.4k",
    requestsDelta: "31.8%",
    requestsSeries: [5200, 6400, 5900, 7100, 6800, 7900, 8400, 7600],
    bridgeTotal: "112",
    bridgeDelta: "28.4%",
    bridgeSeries: [10, 14, 12, 16, 15, 18, 14, 13],
    errorsTotal: "0",
    cacheRate: "95.40%",
    cacheDelta: "1.8%",
    cacheSeries: [94, 94, 95, 96, 95, 96, 95, 96],
    p90Latency: "471 ms",
    p90Delta: "5.4%",
    p90Series: [490, 485, 480, 474, 475, 472, 470, 471],
    creditsBurned: "203",
    creditsDelta: "12.0%",
    creditsSeries: [48, 62, 41, 52],
  },
  "6m": {
    label: "Last 6 months",
    requestsTotal: "142.8k",
    requestsDelta: "64.2%",
    requestsSeries: [18400, 21200, 22900, 25400, 26800, 28100],
    bridgeTotal: "584",
    bridgeDelta: "52.0%",
    bridgeSeries: [72, 84, 91, 104, 112, 121],
    errorsTotal: "0",
    cacheRate: "95.90%",
    cacheDelta: "3.4%",
    cacheSeries: [93, 94, 95, 96, 96, 97],
    p90Latency: "458 ms",
    p90Delta: "11.2%",
    p90Series: [512, 496, 484, 472, 464, 458],
    creditsBurned: "1,110",
    creditsDelta: "22.5%",
    creditsSeries: [140, 195, 168, 220, 184, 203],
  },
  "1y": {
    label: "Last 12 months",
    requestsTotal: "268.4k",
    requestsDelta: "118.4%",
    requestsSeries: [32000, 38400, 42100, 46800, 51900, 57200],
    bridgeTotal: "1,284",
    bridgeDelta: "94.0%",
    bridgeSeries: [140, 175, 198, 232, 254, 285],
    errorsTotal: "0",
    cacheRate: "96.20%",
    cacheDelta: "4.8%",
    cacheSeries: [92, 93, 95, 96, 96, 97],
    p90Latency: "449 ms",
    p90Delta: "15.8%",
    p90Series: [530, 510, 492, 475, 460, 449],
    creditsBurned: "2,000",
    creditsDelta: "34.0%",
    creditsSeries: [260, 310, 280, 345, 390, 415],
  },
};

const ANALYTICS_METRICS: Record<
  AnalyticsMetricId,
  {
    label: string;
    unit: string;
    cur: string;
    delta: string;
    positive: boolean;
    vs: string;
    tooltip: string;
    series: Record<TimeRange, { x: string; val: number; prev: number }[]>;
  }
> = {
  downloads: {
    label: "Asset exports",
    unit: "exports",
    cur: "1,284",
    delta: "18.4%",
    positive: true,
    vs: "vs prev period",
    tooltip: "Total archives and Bridge streams exported across workspace seats",
    series: {
      "24h": [
        { x: "00:00", val: 4, prev: 3 },
        { x: "04:00", val: 6, prev: 5 },
        { x: "08:00", val: 18, prev: 14 },
        { x: "12:00", val: 24, prev: 19 },
        { x: "16:00", val: 31, prev: 22 },
        { x: "20:00", val: 15, prev: 12 },
      ],
      "7d": [
        { x: "Mon", val: 38, prev: 32 },
        { x: "Tue", val: 52, prev: 44 },
        { x: "Wed", val: 64, prev: 49 },
        { x: "Thu", val: 48, prev: 45 },
        { x: "Fri", val: 71, prev: 58 },
        { x: "Sat", val: 84, prev: 62 },
        { x: "Sun", val: 59, prev: 51 },
      ],
      "30d": [
        { x: "Week 1", val: 280, prev: 240 },
        { x: "Week 2", val: 340, prev: 295 },
        { x: "Week 3", val: 310, prev: 270 },
        { x: "Week 4", val: 354, prev: 280 },
      ],
      "6m": [
        { x: "Jun", val: 165, prev: 140 },
        { x: "Jul", val: 210, prev: 175 },
        { x: "Aug", val: 195, prev: 180 },
        { x: "Sep", val: 245, prev: 200 },
        { x: "Oct", val: 224, prev: 195 },
        { x: "Nov", val: 245, prev: 210 },
      ],
      "1y": [
        { x: "Q1", val: 260, prev: 210 },
        { x: "Q2", val: 310, prev: 255 },
        { x: "Q3", val: 342, prev: 290 },
        { x: "Q4", val: 372, prev: 315 },
      ],
    },
  },
  credits: {
    label: "Credits consumed",
    unit: "credits",
    cur: "3,394",
    delta: "12.2%",
    positive: true,
    vs: "vs prev period",
    tooltip: "Credits deducted for unlocking new 3D models, PBR surfaces, and HDRIs (re-downloads are 0 credits)",
    series: {
      "24h": [
        { x: "00:00", val: 0, prev: 2 },
        { x: "04:00", val: 4, prev: 0 },
        { x: "08:00", val: 8, prev: 6 },
        { x: "12:00", val: 6, prev: 8 },
        { x: "16:00", val: 12, prev: 10 },
        { x: "20:00", val: 6, prev: 4 },
      ],
      "7d": [
        { x: "Mon", val: 12, prev: 10 },
        { x: "Tue", val: 18, prev: 16 },
        { x: "Wed", val: 28, prev: 20 },
        { x: "Thu", val: 16, prev: 18 },
        { x: "Fri", val: 24, prev: 22 },
        { x: "Sat", val: 34, prev: 26 },
        { x: "Sun", val: 22, prev: 18 },
      ],
      "30d": [
        { x: "Week 1", val: 48, prev: 42 },
        { x: "Week 2", val: 62, prev: 54 },
        { x: "Week 3", val: 41, prev: 46 },
        { x: "Week 4", val: 52, prev: 40 },
      ],
      "6m": [
        { x: "Jun", val: 140, prev: 120 },
        { x: "Jul", val: 195, prev: 165 },
        { x: "Aug", val: 168, prev: 155 },
        { x: "Sep", val: 220, prev: 180 },
        { x: "Oct", val: 184, prev: 170 },
        { x: "Nov", val: 203, prev: 182 },
      ],
      "1y": [
        { x: "Q1", val: 720, prev: 610 },
        { x: "Q2", val: 810, prev: 705 },
        { x: "Q3", val: 904, prev: 790 },
        { x: "Q4", val: 960, prev: 830 },
      ],
    },
  },
  bandwidth: {
    label: "Archive bandwidth",
    unit: "GB",
    cur: "148.6 GB",
    delta: "24.1%",
    positive: true,
    vs: "vs prev period",
    tooltip: "Total CDN edge transfer for 8K EXR/PNG texture bundles and high-poly FBX/USDZ meshes",
    series: {
      "24h": [
        { x: "00:00", val: 1.2, prev: 0.8 },
        { x: "04:00", val: 0.9, prev: 1.1 },
        { x: "08:00", val: 4.5, prev: 3.2 },
        { x: "12:00", val: 6.8, prev: 4.9 },
        { x: "16:00", val: 8.4, prev: 6.1 },
        { x: "20:00", val: 3.2, prev: 2.8 },
      ],
      "7d": [
        { x: "Mon", val: 14, prev: 11 },
        { x: "Tue", val: 19, prev: 15 },
        { x: "Wed", val: 26, prev: 20 },
        { x: "Thu", val: 18, prev: 17 },
        { x: "Fri", val: 24, prev: 19 },
        { x: "Sat", val: 29, prev: 22 },
        { x: "Sun", val: 18.6, prev: 16 },
      ],
      "30d": [
        { x: "Week 1", val: 32, prev: 26 },
        { x: "Week 2", val: 41, prev: 33 },
        { x: "Week 3", val: 36, prev: 31 },
        { x: "Week 4", val: 39.6, prev: 30 },
      ],
      "6m": [
        { x: "Jun", val: 95, prev: 82 },
        { x: "Jul", val: 118, prev: 96 },
        { x: "Aug", val: 112, prev: 104 },
        { x: "Sep", val: 134, prev: 110 },
        { x: "Oct", val: 129, prev: 115 },
        { x: "Nov", val: 148.6, prev: 120 },
      ],
      "1y": [
        { x: "Q1", val: 280, prev: 220 },
        { x: "Q2", val: 340, prev: 275 },
        { x: "Q3", val: 390, prev: 315 },
        { x: "Q4", val: 440, prev: 360 },
      ],
    },
  },
  bridge: {
    label: "Bridge API syncs",
    unit: "syncs",
    cur: "412",
    delta: "34.0%",
    positive: true,
    vs: "vs prev period",
    tooltip: "Direct scene imports triggered via Onflow Bridge in Unreal Engine 5, Blender, and Maya",
    series: {
      "24h": [
        { x: "00:00", val: 1, prev: 1 },
        { x: "04:00", val: 2, prev: 1 },
        { x: "08:00", val: 8, prev: 5 },
        { x: "12:00", val: 11, prev: 7 },
        { x: "16:00", val: 14, prev: 9 },
        { x: "20:00", val: 6, prev: 4 },
      ],
      "7d": [
        { x: "Mon", val: 14, prev: 10 },
        { x: "Tue", val: 18, prev: 13 },
        { x: "Wed", val: 22, prev: 16 },
        { x: "Thu", val: 19, prev: 15 },
        { x: "Fri", val: 27, prev: 20 },
        { x: "Sat", val: 21, prev: 16 },
        { x: "Sun", val: 15, prev: 12 },
      ],
      "30d": [
        { x: "Week 1", val: 86, prev: 64 },
        { x: "Week 2", val: 108, prev: 82 },
        { x: "Week 3", val: 98, prev: 76 },
        { x: "Week 4", val: 120, prev: 86 },
      ],
      "6m": [
        { x: "Jun", val: 52, prev: 38 },
        { x: "Jul", val: 64, prev: 48 },
        { x: "Aug", val: 68, prev: 52 },
        { x: "Sep", val: 74, prev: 58 },
        { x: "Oct", val: 71, prev: 56 },
        { x: "Nov", val: 83, prev: 62 },
      ],
      "1y": [
        { x: "Q1", val: 84, prev: 60 },
        { x: "Q2", val: 98, prev: 74 },
        { x: "Q3", val: 110, prev: 82 },
        { x: "Q4", val: 120, prev: 92 },
      ],
    },
  },
};

const CATEGORY_DISTRIBUTION = [
  { label: "3D models", count: 482, share: 37.5 },
  { label: "PBR surfaces", count: 364, share: 28.3 },
  { label: "Kitbash modules", count: 238, share: 18.5 },
  { label: "HDRI skies", count: 142, share: 11.1 },
  { label: "Bridge tools", count: 58, share: 4.6 },
];

const PORTAL_ORDERS: PortalOrder[] = [
  {
    id: "order-1",
    code: "ONF-2026-0418",
    dateLabel: "Nov 18, 2026 · 09:40",
    relativeTime: "26m ago",
    timestamp: 1794969600000,
    credits: 24,
    assets: [
      {
        id: "asset-1",
        title: "White Marble Incense Burner",
        collection: "Quang Tri Ancient Citadel",
        path: "3d-models/quang-tri-citadel/marble-incense-burner",
        category: "3D models",
        baseSizeMb: 48.4,
        triangles: "4.2M triangles",
        credits: 8,
      },
      {
        id: "asset-2",
        title: "Citadel Courtyard Overcast HDRI",
        collection: "Quang Tri Ancient Citadel",
        path: "hdris/quang-tri-citadel/courtyard-overcast-32bit",
        category: "HDRIs",
        baseSizeMb: 124.0,
        triangles: "360° 16K EXR",
        credits: 10,
      },
      {
        id: "asset-3",
        title: "Vauban Brick Gate Archway",
        collection: "Quang Tri Ancient Citadel",
        path: "kitbash/quang-tri-citadel/brick-gate-archway",
        category: "Kitbash",
        baseSizeMb: 64.2,
        triangles: "1.8M triangles",
        credits: 6,
      },
    ],
  },
  {
    id: "order-2",
    code: "ONF-2026-0412",
    dateLabel: "Nov 12, 2026 · 14:15",
    relativeTime: "6d ago",
    timestamp: 1794467700000,
    credits: 14,
    assets: [
      {
        id: "asset-4",
        title: "Weathered Bluestone Masonry",
        collection: "Thang Long Imperial Citadel",
        path: "surfaces/thang-long/weathered-bluestone-8k",
        category: "Surfaces",
        baseSizeMb: 92.6,
        triangles: "Tileable 8K PBR",
        credits: 6,
      },
      {
        id: "asset-5",
        title: "Carved Dragon Stone Balustrade",
        collection: "Thang Long Imperial Citadel",
        path: "3d-models/thang-long/dragon-stone-balustrade",
        category: "3D models",
        baseSizeMb: 71.8,
        triangles: "3.1M triangles",
        credits: 8,
      },
    ],
  },
  {
    id: "order-3",
    code: "ONF-2026-0398",
    dateLabel: "Nov 04, 2026 · 16:22",
    relativeTime: "14d ago",
    timestamp: 1793784120000,
    credits: 18,
    assets: [
      {
        id: "asset-6",
        title: "Champa Fired Brick Wall",
        collection: "My Son Sanctuary",
        path: "surfaces/my-son/champa-fired-brick-8k",
        category: "Surfaces",
        baseSizeMb: 86.0,
        triangles: "Tileable 8K PBR",
        credits: 6,
      },
      {
        id: "asset-7",
        title: "Meridian Gate Timber Roof Kit",
        collection: "Hue Imperial City",
        path: "kitbash/hue-imperial/timber-roof-truss-kit",
        category: "Kitbash",
        baseSizeMb: 112.5,
        triangles: "2.4M triangles",
        credits: 12,
      },
    ],
  },
  {
    id: "order-4",
    code: "ONF-2026-0381",
    dateLabel: "Oct 26, 2026 · 11:05",
    relativeTime: "23d ago",
    timestamp: 1792987500000,
    credits: 10,
    assets: [
      {
        id: "asset-8",
        title: "Old Saigon Golden Hour Sky",
        collection: "Independence Palace",
        path: "hdris/saigon/golden-hour-sky-32bit",
        category: "HDRIs",
        baseSizeMb: 138.4,
        triangles: "360° 16K EXR",
        credits: 10,
      },
    ],
  },
];

const TOP_DOWNLOADS = [
  { name: "Quang Tri Citadel Collection", domain: "quang-tri-citadel.onflow.asia", category: "3D models", status: "Active", downloads: 45, credits: 360, trend: [18, 24, 22, 31, 38, 42, 45] },
  { name: "Thang Long Bluestone Surfaces", domain: "thang-long-pbr.onflow.asia", category: "Surfaces", status: "Active", downloads: 38, credits: 228, trend: [14, 19, 25, 24, 30, 35, 38] },
  { name: "Central Vietnam Golden Hour HDRIs", domain: "central-hdris.onflow.asia", category: "HDRIs", status: "Active", downloads: 32, credits: 320, trend: [10, 14, 18, 22, 27, 29, 32] },
  { name: "Hue Imperial Timber Roof Kitbash", domain: "hue-imperial-kit.onflow.asia", category: "Kitbash", status: "Active", downloads: 28, credits: 336, trend: [12, 15, 19, 20, 23, 26, 28] },
  { name: "My Son Fired Brick Masonry", domain: "my-son-surfaces.onflow.asia", category: "Surfaces", status: "Active", downloads: 24, credits: 144, trend: [8, 11, 14, 17, 19, 22, 24] },
  { name: "Temple of Literature Stone Stelae", domain: "van-mieu-3d.onflow.asia", category: "3D models", status: "Active", downloads: 19, credits: 152, trend: [6, 9, 11, 13, 15, 18, 19] },
  { name: "Hoi An Limewash Plaster Pack", domain: "hoi-an-plaster.onflow.asia", category: "Surfaces", status: "Active", downloads: 17, credits: 102, trend: [5, 8, 10, 12, 14, 15, 17] },
];

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  { id: "tx-1", number: "INV-2026-1119", title: "Credit pack top-up (1,500 + 350 bonus)", date: "Nov 19, 2026", typeLabel: "Top-up", status: "Completed", amount: 1850, usdValue: "$149.00", type: "purchase" },
  { id: "tx-2", number: "ONF-2026-0418", title: "Quang Tri Citadel Collection (3 assets)", date: "Nov 18, 2026", typeLabel: "Asset unlock", status: "Completed", amount: -24, usdValue: "24", type: "spent" },
  { id: "tx-3", number: "ONF-2026-0412", title: "Thang Long Imperial Citadel (2 assets)", date: "Nov 12, 2026", typeLabel: "Asset unlock", status: "Completed", amount: -14, usdValue: "14", type: "spent" },
  { id: "tx-4", number: "INV-2026-1108", title: "Bank transfer credit pack (750 + 150 bonus)", date: "Nov 08, 2026", typeLabel: "Wire transfer", status: "Pending", amount: 900, usdValue: "$79.00", type: "purchase" },
  { id: "tx-5", number: "ONF-2026-0398", title: "My Son Sanctuary & Hue Imperial (2 assets)", date: "Nov 04, 2026", typeLabel: "Asset unlock", status: "Completed", amount: -18, usdValue: "18", type: "spent" },
  { id: "tx-6", number: "ONF-2026-0381", title: "Independence Palace HDRI (1 asset)", date: "Oct 26, 2026", typeLabel: "Asset unlock", status: "Completed", amount: -10, usdValue: "10", type: "spent" },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "Archive ready for download",
    detail: "Order ONF-2026-0418 (3 assets) passed checksum verification",
    time: "2m ago",
    unread: true,
    targetTab: "downloads",
  },
  {
    id: "n-2",
    title: "Credits added",
    detail: "+1,850 credits credited to Onflow Asia workspace",
    time: "1d ago",
    unread: true,
    targetTab: "credits",
  },
  {
    id: "n-3",
    title: "Pending bank transfer",
    detail: "Invoice INV-2026-1108 (900 credits) awaiting wire confirmation",
    time: "3d ago",
    unread: false,
    targetTab: "credits",
  },
];

const RESOLUTION_MULTIPLIER: Record<string, number> = {
  "1K (PNG 8-bit)": 0.35,
  "2K (PNG 16-bit)": 0.65,
  "4K (PNG 16-bit)": 1.0,
  "8K (EXR / PNG 16-bit)": 1.85,
};

function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1, 2, 3, 4];
  const raw = max / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) || raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: count + 1 }, (_, i) =>
    Number(((top / count) * (count - i)).toFixed(1))
  );
}

/** ECharts-style Cloudflare Kumo area chart builder (right-hand Y-axis, dashed tail on latest bucket) */
function buildKumoAreaGeometry(values: number[], width: number, height: number) {
  const maxVal = Math.max(...values, 1);
  const ticks = niceTicks(maxVal, 4);
  const topTick = Math.max(ticks[0] || 1, 1);
  const padLeft = 4;
  const padRight = 34;
  const padTop = 8;
  const padBottom = 6;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const coords = values.map((v, i) => {
    const x =
      values.length <= 1
        ? padLeft + innerW / 2
        : padLeft + (i / (values.length - 1)) * innerW;
    const y = padTop + innerH - (Math.min(v, topTick) / topTick) * innerH;
    return { x, y, val: v };
  });

  // Solid line up to second-to-last point, dashed tail for the incomplete current bucket
  const solidCoords = coords.length > 2 ? coords.slice(0, -1) : coords;
  const solidLine = solidCoords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  const tailCoords = coords.length > 2 ? coords.slice(-2) : [];
  const dashedTail =
    tailCoords.length === 2
      ? `M ${tailCoords[0].x.toFixed(1)},${tailCoords[0].y.toFixed(1)} L ${tailCoords[1].x.toFixed(1)},${tailCoords[1].y.toFixed(1)}`
      : "";

  const fullLine = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const first = coords[0];
  const last = coords[coords.length - 1];
  const baselineY = padTop + innerH;
  const areaPath =
    coords.length > 1
      ? `${fullLine} L ${last.x.toFixed(1)},${baselineY} L ${first.x.toFixed(1)},${baselineY} Z`
      : "";

  return { coords, solidLine, dashedTail, areaPath, ticks, baselineY, innerW, padLeft, padRight, padTop, innerH };
}

function buildInteractiveChart(
  points: { x: string; val: number; prev: number }[],
  width: number,
  height: number
) {
  const allVals = points.flatMap((p) => [p.val, p.prev]);
  const maxVal = Math.max(...allVals, 1);
  const ticks = niceTicks(maxVal, 4);
  const topTick = Math.max(ticks[0] || 1, 1);
  const padLeft = 10;
  const padRight = 44;
  const padTop = 12;
  const padBottom = 8;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const coords = points.map((pt, i) => {
    const x =
      points.length <= 1
        ? padLeft + innerW / 2
        : padLeft + (i / (points.length - 1)) * innerW;
    const y = padTop + innerH - (pt.val / topTick) * innerH;
    const prevY = padTop + innerH - (pt.prev / topTick) * innerH;
    return { x, y, prevY, label: pt.x, val: pt.val, prev: pt.prev };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const prevLinePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.prevY.toFixed(1)}`)
    .join(" ");

  const first = coords[0];
  const last = coords[coords.length - 1];
  const baselineY = padTop + innerH;
  const areaPath = `${linePath} L ${last.x.toFixed(1)},${baselineY} L ${first.x.toFixed(1)},${baselineY} Z`;

  return { coords, linePath, prevLinePath, areaPath, ticks, baselineY, padTop, innerH };
}

function PortalContent() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const validInitialTab: PortalTab =
    initialTabParam === "credits"
      ? "credits"
      : initialTabParam === "downloads"
      ? "downloads"
      : initialTabParam === "analytics"
      ? "analytics"
      : "home";

  const [activeTab, setActiveTab] = useState<PortalTab>(validInitialTab);
  const [activeOrg, setActiveOrg] = useState<"onflow" | "mekong">("onflow");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    library: true,
    billing: true,
  });

  // Quick search modal (⌘K)
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");
  const homeSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Header popovers
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);

  // Overlays
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>("profile");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState<SupportTab>("knowledge");

  // Profile state
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    organization: string;
    field: string;
    avatarUrl?: string | null;
  }>({
    firstName: "David",
    lastName: "Nguyen",
    email: "dev@onflow.asia",
    bio: "Lead 3D Technical Artist at Onflow Asia.",
    organization: "Onflow Asia",
    field: "Technical art",
    avatarUrl: null,
  });

  const [orgBillingOverrides, setOrgBillingOverrides] = useState<
    Partial<Record<"onflow" | "mekong", PortalBillingAddress>>
  >({});

  const currentOrg = ORGANIZATIONS[activeOrg];
  const activeBilling: PortalBillingAddress =
    orgBillingOverrides[activeOrg] ?? currentOrg.billing;

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // Keyboard shortcut ⌘K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setQuickSearchOpen(false);
        setNotifPopoverOpen(false);
        setOrgSwitcherOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Developer API token
  const [apiToken, setApiToken] = useState<string>("onf_live_98F4K27A");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = async (text: string, label: string, idKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(idKey);
      showToast(`${label} copied to clipboard`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("Copy failed");
    }
  };

  const handleRotateToken = () => {
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
    const token = `onf_live_${suffix}`;
    setApiToken(token);
    showToast("New Bridge API token generated");
  };

  // Home state
  const [homeSearch, setHomeSearch] = useState("");
  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRange>("24h");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [bridgeAutoSync, setBridgeAutoSync] = useState(true);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PortalPaymentMethod[]>([
    { id: "visa-4242", brand: "VISA", label: "Visa •••• 4242", meta: "Exp 12/2028", isDefault: true },
    { id: "mc-8888", brand: "Mastercard", label: "Mastercard •••• 8888", meta: "Exp 10/2027", isDefault: false },
    { id: "paypal", brand: "PayPal", label: "PayPal", meta: "dev@onflow.asia", isDefault: false },
  ]);

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({ ...pm, isDefault: pm.id === id }))
    );
    showToast("Default payment method updated");
  };

  // Downloads state
  const [downloadSearch, setDownloadSearch] = useState("");
  const [downloadCategoryFilter, setDownloadCategoryFilter] = useState<string>("all");
  const [downloadSort, setDownloadSort] = useState<"newest" | "credits-desc" | "credits-asc">("newest");
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>("asset-1");
  const [polyMode, setPolyMode] = useState<"high" | "lod">("high");
  const [resolution, setResolution] = useState("4K (PNG 16-bit)");
  const [exportFormat, setExportFormat] = useState("FBX");
  const [downloadedAssetIds, setDownloadedAssetIds] = useState<Record<string, boolean>>({});

  // Analytics state
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetricId>("downloads");
  const [hoveredAnalyticsIdx, setHoveredAnalyticsIdx] = useState<number | null>(null);
  const [topCategoryFilter, setTopCategoryFilter] = useState<string>("All");

  // Credits & Billing sub-tab state
  const [billingSubTab, setBillingSubTab] = useState<BillingSubTab>("credits");
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [spendLimitAmount, setSpendLimitAmount] = useState("4,500");
  const [spendLimitEnabled, setSpendLimitEnabled] = useState(true);

  // Sync URL query params (`?tab=...`, `?sub=...`, `?cat=...`, `?settings=...`)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const subParam = searchParams.get("sub");
    const catParam = searchParams.get("cat");
    const settingsParam = searchParams.get("settings") as SettingsTab | null;

    if (
      tabParam === "home" ||
      tabParam === "downloads" ||
      tabParam === "analytics" ||
      tabParam === "credits"
    ) {
      setActiveTab(tabParam);
    }
    if (
      subParam === "credits" ||
      subParam === "invoices" ||
      subParam === "limits" ||
      subParam === "subscriptions" ||
      subParam === "usage"
    ) {
      setBillingSubTab(subParam);
    }
    if (catParam) {
      setDownloadCategoryFilter(catParam);
    }
    if (settingsParam) {
      setSettingsInitialTab(settingsParam);
      setActiveTab("settings");
    }
  }, [searchParams]);

  // Scroll to top on tab or sub-tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [activeTab, billingSubTab]);

  // Derived Home analytics
  const homeCards = HOME_ANALYTICS_CARDS[globalTimeRange];
  const reqGeo = useMemo(
    () => buildKumoAreaGeometry(homeCards.requestsSeries, 460, 148),
    [homeCards.requestsSeries]
  );
  const bridgeGeo = useMemo(
    () => buildKumoAreaGeometry(homeCards.bridgeSeries, 460, 148),
    [homeCards.bridgeSeries]
  );
  const cacheGeo = useMemo(
    () => buildKumoAreaGeometry(homeCards.cacheSeries, 220, 118),
    [homeCards.cacheSeries]
  );
  const p90Geo = useMemo(
    () => buildKumoAreaGeometry(homeCards.p90Series, 220, 118),
    [homeCards.p90Series]
  );
  const credGeo = useMemo(
    () => buildKumoAreaGeometry(homeCards.creditsSeries, 220, 118),
    [homeCards.creditsSeries]
  );

  // Derived Analytics main chart
  const activeMetricObj = ANALYTICS_METRICS[selectedMetric];
  const activeMetricPoints = activeMetricObj.series[globalTimeRange];
  const mainAnalyticsChart = useMemo(
    () => buildInteractiveChart(activeMetricPoints, 680, 210),
    [activeMetricPoints]
  );

  // Filtered orders for Downloads
  const filteredDownloadOrders = useMemo(() => {
    const q = downloadSearch.trim().toLowerCase();
    const list = PORTAL_ORDERS.filter((order) => {
      const matchesCat =
        downloadCategoryFilter === "all" ||
        order.assets.some((a) => a.category === downloadCategoryFilter);
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        order.code.toLowerCase().includes(q) ||
        order.assets.some(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.path.toLowerCase().includes(q) ||
            a.collection.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        )
      );
    });

    return [...list].sort((a, b) => {
      if (downloadSort === "credits-desc") return b.credits - a.credits;
      if (downloadSort === "credits-asc") return a.credits - b.credits;
      return b.timestamp - a.timestamp;
    });
  }, [downloadSearch, downloadCategoryFilter, downloadSort]);

  const triggerAssetDownload = (asset: OrderAsset, orderCode: string) => {
    const estSize = (
      asset.baseSizeMb *
      (RESOLUTION_MULTIPLIER[resolution] ?? 1) *
      (polyMode === "lod" ? 0.55 : 1)
    ).toFixed(1);

    const manifest = {
      platform: "Onflow Asia 3D Asset Library",
      order: orderCode,
      assetId: asset.id,
      title: asset.title,
      collection: asset.collection,
      path: asset.path,
      geometry: polyMode === "high" ? "High-Poly" : "LOD0-LOD3",
      textureResolution: resolution,
      format: exportFormat,
      estimatedArchiveSize: `${estSize} MB`,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${asset.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${exportFormat.toLowerCase()}.onflow.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setDownloadedAssetIds((prev) => ({ ...prev, [asset.id]: true }));
    showToast(`Exported ${asset.title} (${exportFormat}, ${resolution})`);
  };

  const triggerOrderBatchDownload = (order: PortalOrder) => {
    const manifest = {
      platform: "Onflow Asia 3D Asset Library",
      order: order.code,
      assetCount: order.assets.length,
      format: exportFormat,
      resolution,
      assets: order.assets.map((a) => ({
        title: a.title,
        path: a.path,
        category: a.category,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.code.toLowerCase()}-bundle.onflow.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const nextDone: Record<string, boolean> = {};
    order.assets.forEach((item) => {
      nextDone[item.id] = true;
    });
    setDownloadedAssetIds((prev) => ({ ...prev, ...nextDone }));
    showToast(`Exported ${order.assets.length} assets from ${order.code}`);
  };

  const handleDownloadStatementCsv = () => {
    const header = "Number,Description,Type,Date,Status,Amount (Credits),Value\n";
    const rows = INITIAL_TRANSACTIONS.map(
      (tx) =>
        `"${tx.number}","${tx.title}","${tx.typeLabel}","${tx.date}","${tx.status}",${tx.amount},"${tx.usdValue}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onflow-invoices-${activeOrg}-2026.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Downloaded consolidated invoice CSV");
  };

  const visibleTopDownloads = useMemo(() => {
    return topCategoryFilter === "All"
      ? TOP_DOWNLOADS
      : TOP_DOWNLOADS.filter((d) => d.category === topCategoryFilter);
  }, [topCategoryFilter]);

  const filteredTransactions = useMemo(() => {
    if (txFilter === "all") return INITIAL_TRANSACTIONS;
    if (txFilter === "pending") {
      return INITIAL_TRANSACTIONS.filter((t) => t.status === "Pending");
    }
    return INITIAL_TRANSACTIONS.filter((t) => t.type === txFilter);
  }, [txFilter]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const pendingTxCount = INITIAL_TRANSACTIONS.filter((t) => t.status === "Pending").length;
  const creditPercentUsed = Math.round(
    (currentOrg.totalSpent / currentOrg.grantedCredits) * 100
  );

  const switchOrganization = (nextOrg: "onflow" | "mekong") => {
    setActiveOrg(nextOrg);
    setOrgSwitcherOpen(false);
    setUserProfile((prev) => ({
      ...prev,
      email: ORGANIZATIONS[nextOrg].email,
      organization: ORGANIZATIONS[nextOrg].name,
    }));
    showToast(`Switched account to ${ORGANIZATIONS[nextOrg].name}`);
  };

  // Breadcrumb definition matching Cloudflare Kumo header
  const settingsTabLabel: Record<SettingsTab, string> = {
    profile: "Profile & Pipeline",
    account: "Workspace",
    members: "Team & Members",
    enterprise: "Enterprise & SSO",
    billing: "Billing & Tax Profile",
    security: "Security & Tokens",
    notifications: "Notifications & Webhooks",
    appearance: "Appearance & Locale",
    about: "About",
  };

  const breadcrumbSection =
    activeTab === "home"
      ? null
      : activeTab === "downloads"
      ? { parent: "Asset Library", current: "Downloads & Exports" }
      : activeTab === "analytics"
      ? { parent: "Observability", current: "Workspace Analytics" }
      : activeTab === "settings"
      ? {
          parent: "Account Settings",
          current: settingsTabLabel[settingsInitialTab] ?? "Workspace",
        }
      : { parent: "Manage Account", current: "Billing" };

  // Quick search items for ⌘K modal
  const quickSearchItems = useMemo(() => {
    const all = [
      { id: "nav-home", title: "Account home", category: "Navigation", action: () => setActiveTab("home") },
      { id: "nav-dl", title: "Downloads & Exports", category: "Asset Library", action: () => setActiveTab("downloads") },
      { id: "nav-an", title: "Workspace Analytics", category: "Observability", action: () => setActiveTab("analytics") },
      { id: "nav-cr", title: "Manage Account / Billing & Credits", category: "Manage account", action: () => { setActiveTab("credits"); setBillingSubTab("credits"); } },
      { id: "nav-inv", title: "Manage Account / Invoices", category: "Manage account", action: () => { setActiveTab("credits"); setBillingSubTab("invoices"); } },
      { id: "nav-lim", title: "Manage Account / Spend limits", category: "Manage account", action: () => { setActiveTab("credits"); setBillingSubTab("limits"); } },
      { id: "nav-set", title: "Account Settings & Profile", category: "Settings", action: () => { setSettingsInitialTab("profile"); setActiveTab("settings"); } },
      { id: "nav-sup", title: "Support Portal & Tickets", category: "Support", action: () => { setSupportInitialTab("knowledge"); setIsSupportOpen(true); } },
      ...PORTAL_ORDERS.flatMap((o) =>
        o.assets.map((a) => ({
          id: a.id,
          title: `${a.title} (${o.code})`,
          category: a.collection,
          action: () => {
            setActiveTab("downloads");
            setExpandedAssetId(a.id);
          },
        }))
      ),
    ];
    const q = quickSearchQuery.trim().toLowerCase();
    if (!q) return all.slice(0, 8);
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [quickSearchQuery]);

  // Unified Cloudflare Kumo Left Portal Sidebar (`260px` wide / `60px` collapsed, shared with `/payment`)
  const activePortalSection: PortalActiveSection =
    activeTab === "home"
      ? "home"
      : activeTab === "downloads"
      ? "downloads"
      : activeTab === "analytics"
      ? "analytics"
      : activeTab === "settings"
      ? "settings"
      : billingSubTab === "invoices"
      ? "billing-invoices"
      : billingSubTab === "limits"
      ? "billing-limits"
      : "billing-credits";

  const renderSidebar = (isMobile = false) => (
    <PortalSidebar
      activeSection={activePortalSection}
      activeSettingsTab={settingsInitialTab}
      activeDownloadCategory={downloadCategoryFilter}
      activeOrgKey={activeOrg}
      creditsDisplay={currentOrg.credits}
      pendingBillingCount={pendingTxCount}
      collapsed={sidebarCollapsed}
      isMobile={isMobile}
      onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      onCloseMobile={() => setMobileMenuOpen(false)}
      onSwitchOrg={(orgKey) => switchOrganization(orgKey)}
      onOpenQuickSearch={() => setQuickSearchOpen(true)}
      onNavigateTab={(tab, subOption) => {
        setActiveTab(tab);
        if (tab === "downloads" && subOption) {
          if (subOption === "bridge") {
            showToast("Bridge API panel is in the right rail of Downloads");
          } else {
            setDownloadCategoryFilter(subOption);
          }
        } else if (tab === "credits" && subOption) {
          setBillingSubTab(subOption as BillingSubTab);
        }
      }}
      onOpenSettings={(tab) => {
        setSettingsInitialTab(tab);
        setActiveTab("settings");
      }}
    />
  );

  // Shared Right Rail (`400px` wide on `xl`, `border-l border-kumo-line`, `Usage` + `Account details` + `Bridge sync`)
  const renderRightRail = () => (
    <aside className="w-full xl:w-[400px] shrink-0 xl:border-l xl:border-[var(--color-kumo-line)] p-6 flex flex-col gap-5 bg-[var(--color-kumo-canvas)]">
      {/* Top Usage Section (Cloudflare Workers & Pages right rail style) */}
      <div className="pb-5 border-b border-[var(--color-kumo-line)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
              Usage
            </h3>
            <span
              title="Monthly credit quota and daily Bridge API sync requests"
              className="text-[var(--text-color-kumo-subtle)] inline-flex items-center"
            >
              <Info size={13} strokeWidth={1.5} />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
              <span>This cycle</span>
              <ChevronDown size={12} />
            </span>
            <Link
              href="/payment"
              className="h-7 px-2.5 rounded-[8px] kumo-btn-primary text-[12px] font-medium inline-flex items-center justify-center no-underline"
            >
              Top up
            </Link>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-[var(--color-kumo-line)] text-[13px]">
          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="size-3.5 rounded-full border-[2px] border-[var(--color-kumo-brand)]/40 inline-block shrink-0" />
              <span className="text-[var(--text-color-kumo-subtle)]">Credits consumed</span>
            </div>
            <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
              {currentOrg.thisMonthSpent.toLocaleString()} / {currentOrg.credits.toLocaleString()}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="size-3.5 rounded-full border-[2px] border-[var(--color-kumo-fill)] inline-block shrink-0" />
              <span className="text-[var(--text-color-kumo-subtle)]">Bridge syncs today</span>
            </div>
            <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
              42 / 100,000
            </span>
          </div>

          <div className="pt-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="size-3.5 rounded-full border-[2px] border-[var(--color-kumo-fill)] inline-block shrink-0" />
              <span className="text-[var(--text-color-kumo-subtle)]">Re-download cost</span>
            </div>
            <span className="kumo-mono font-medium text-[var(--text-color-kumo-success)] inline-flex items-center gap-1">
              <span>0</span>
              <CreditIcon size={11} />
              <span>(Unlimited)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Account details Card (352px inner card style) */}
      <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-5 flex flex-col gap-3.5 shadow-[var(--shadow-kumo-xs)]">
        <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
          Account details
        </h3>

        <div className="flex flex-col gap-2.5 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--text-color-kumo-subtle)] shrink-0">Account ID</span>
            <button
              type="button"
              onClick={() =>
                handleCopyText(currentOrg.accountId, "Account ID", "acct-id")
              }
              title="Click to copy Account ID"
              className="kumo-mono text-[12px] text-[var(--text-color-kumo-default)] hover:text-[var(--text-color-kumo-link)] bg-transparent border-0 p-0 cursor-pointer truncate inline-flex items-center gap-1.5"
            >
              <span className="truncate max-w-[180px]">{currentOrg.accountId}</span>
              {copiedId === "acct-id" ? (
                <Check size={12} className="text-[var(--text-color-kumo-success)] shrink-0" />
              ) : (
                <Copy size={12} className="text-[var(--text-color-kumo-subtle)] shrink-0" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--text-color-kumo-subtle)] shrink-0">Bridge endpoint</span>
            <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-default)] truncate">
              {currentOrg.subdomain}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--text-color-kumo-subtle)] shrink-0">Bridge token</span>
            <div className="flex items-center gap-1.5">
              <code className="kumo-mono text-[12px] text-[var(--text-color-kumo-default)] bg-[var(--color-kumo-recessed)] px-1.5 py-0.5 rounded-[4px]">
                {apiToken}
              </code>
              <button
                type="button"
                onClick={() => handleCopyText(apiToken, "Bridge API token", "api-tok")}
                aria-label="Copy token"
                className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0.5 cursor-pointer"
              >
                {copiedId === "api-tok" ? (
                  <Check size={12} className="text-[var(--text-color-kumo-success)]" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
              <button
                type="button"
                onClick={handleRotateToken}
                aria-label="Rotate token"
                title="Rotate API token"
                className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0.5 cursor-pointer"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onflow Bridge Live Stream Toggle Card (Cloudflare Access card equivalent) */}
      <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-5 flex flex-col gap-3 shadow-[var(--shadow-kumo-xs)]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
            Onflow Bridge Direct Sync
          </h3>
          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-subtle)]">
            v2.4
          </span>
        </div>
        <p className="m-0 text-[13px] leading-[1.45] text-[var(--text-color-kumo-subtle)]">
          Stream unlocked 8K PBR textures and LOD hierarchies directly into Unreal Engine 5, Blender, and Maya.
        </p>
        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            role="switch"
            aria-checked={bridgeAutoSync}
            onClick={() => {
              const next = !bridgeAutoSync;
              setBridgeAutoSync(next);
              showToast(next ? "Bridge local socket enabled" : "Bridge local socket paused");
            }}
            className={`w-10 h-5 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
              bridgeAutoSync
                ? "bg-[var(--color-kumo-brand)] justify-end"
                : "bg-[var(--color-kumo-fill)] justify-start"
            }`}
          >
            <span className="size-4 rounded-full bg-white shadow-2xs" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSupportInitialTab("knowledge");
              setIsSupportOpen(true);
            }}
            className="text-[12px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
          >
            Plugin docs ↗
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="kumo-portal min-h-screen bg-[var(--color-kumo-canvas)] text-[var(--text-color-kumo-default)] flex">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--text-color-kumo-strong)] text-white px-3.5 py-2 rounded-[8px] shadow-[var(--shadow-kumo-md)] border border-white/10 flex items-center gap-2 text-[13px]">
          <span className="size-2 rounded-full bg-[#3e8eff]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Quick Search Modal (⌘K) */}
      {quickSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[12vh] p-4"
          onClick={() => setQuickSearchOpen(false)}
        >
          <div
            className="w-full max-w-[600px] bg-white rounded-[12px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 px-4 border-b border-[var(--color-kumo-line)] flex items-center gap-2.5">
              <Search size={16} className="text-[var(--text-color-kumo-subtle)] shrink-0" />
              <input
                type="text"
                autoFocus
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Search orders, 3D assets, billing, or tools..."
                className="w-full bg-transparent border-0 outline-none text-[14px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
              />
              <kbd className="px-1.5 py-0.5 text-[11px] rounded-[4px] bg-[var(--color-kumo-recessed)] text-[var(--text-color-kumo-subtle)]">
                ESC
              </kbd>
            </div>
            <div className="max-h-[340px] overflow-y-auto p-2 flex flex-col gap-0.5">
              {quickSearchItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action();
                    setQuickSearchOpen(false);
                    setQuickSearchQuery("");
                  }}
                  className="w-full px-3 py-2.5 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <span className="text-[13px] font-medium text-[var(--text-color-kumo-default)] truncate">
                    {item.title}
                  </span>
                  <span className="text-[12px] text-[var(--text-color-kumo-subtle)] shrink-0">
                    {item.category} ›
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-[260px] max-w-[85vw] h-full border-r border-[var(--color-kumo-line)]"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebar(true)}
          </aside>
        </div>
      )}

      {/* Desktop Left Sidebar (260px exact Kumo width, or 60px collapsed) */}
      <aside
        className={`hidden lg:block shrink-0 border-r border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)] transition-[width] duration-150 ${
          sidebarCollapsed ? "w-[60px]" : "w-[260px]"
        }`}
      >
        <div className="sticky top-0 h-screen">{renderSidebar(false)}</div>
      </aside>

      {/* Right Column: 58px Top Header + Main Content + 48px Footer */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top 58px Header Bar (`--header-height: 58px`, sticky, `border-b border-kumo-line`) */}
        <header className="sticky top-0 z-20 h-[58px] shrink-0 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] px-4 flex items-center justify-between gap-2">
          {/* Left: Mobile menu button + Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden size-8 rounded-[8px] hover:bg-[var(--color-kumo-tint)] border-0 bg-transparent flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer"
            >
              <Menu size={17} strokeWidth={1.5} />
            </button>

            {breadcrumbSection ? (
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-[14px] truncate"
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("home")}
                  className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer truncate"
                >
                  {breadcrumbSection.parent}
                </button>
                <ChevronRight
                  size={13}
                  className="text-[var(--text-color-kumo-subtle)] shrink-0"
                />
                <span className="font-semibold text-[var(--text-color-kumo-strong)] truncate">
                  {breadcrumbSection.current}
                </span>
              </nav>
            ) : (
              <span className="lg:hidden text-[14px] font-semibold text-[var(--text-color-kumo-strong)] truncate">
                {currentOrg.name}
              </span>
            )}
          </div>

          {/* Right Utility Strip (`Ask AI`, `Support`, `Notifications`, `User Menu`) */}
          <div className="ml-auto flex items-center shrink-0 gap-1 relative">
            <button
              type="button"
              onClick={() => setQuickSearchOpen(true)}
              className="h-8 px-3 pl-2.5 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <Sparkles size={14} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
              <span>Ask AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSupportInitialTab("knowledge");
                setIsSupportOpen(true);
              }}
              className="h-8 px-2.5 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer transition-colors"
            >
              <HelpCircle size={15} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
              <span className="hidden sm:inline">Support</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifPopoverOpen((prev) => !prev)}
                aria-label="Notifications"
                className="size-8 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer relative transition-colors"
              >
                <Bell size={16} strokeWidth={1.5} className="text-[var(--text-color-kumo-subtle)]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--color-kumo-brand)]" />
                )}
              </button>

              {notifPopoverOpen && (
                <div className="absolute right-0 top-10 z-50 w-[340px] bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-[var(--color-kumo-line)] flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, unread: false }))
                          );
                          showToast("All notifications marked read");
                        }}
                        className="text-[12px] text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-[var(--color-kumo-line)] max-h-[280px] overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === n.id ? { ...item, unread: false } : item
                            )
                          );
                          setActiveTab(n.targetTab);
                          setNotifPopoverOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left bg-transparent hover:bg-[var(--color-kumo-overlay)] border-0 flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <span
                            className={`mt-1.5 size-1.5 rounded-full shrink-0 ${
                              n.unread ? "bg-[var(--color-kumo-brand)]" : "bg-transparent"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-[var(--text-color-kumo-default)] truncate">
                              {n.title}
                            </div>
                            <div className="text-[12px] text-[var(--text-color-kumo-subtle)] truncate">
                              {n.detail}
                            </div>
                          </div>
                        </div>
                        <span className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)] shrink-0">
                          {n.time}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <UserMenuDropdown
              context="portal"
              userName={`${userProfile.firstName} ${userProfile.lastName}`}
              userEmail={userProfile.email}
              organization={currentOrg.name}
              credits={currentOrg.credits}
              avatarUrl={userProfile.avatarUrl}
              onOpenSettings={(tab) => {
                setSettingsInitialTab(tab);
                setActiveTab("settings");
              }}
              onOpenSupport={() => {
                setSupportInitialTab("knowledge");
                setIsSupportOpen(true);
              }}
              onSignOut={() => showToast("Signed out of Onflow Asia workspace")}
            />
          </div>
        </header>

        {/* ===================== TAB 1: ACCOUNT HOME (1000px centered Kumo column) ===================== */}
        {activeTab === "home" && (
          <main className="flex-1 px-4 md:px-8 pt-8 pb-8 flex flex-col items-center">
            <div className="w-full max-w-[1000px] flex flex-col gap-8">
              {/* Top Pill + Hero Heading + Recessed Search Well */}
              <div className="flex flex-col items-center gap-5">
                {/* Announcement Pill (`h-9`, `rounded-full`, `bg-kumo-base ring ring-kumo-line shadow-xs`) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("downloads");
                    showToast("Bridge v2.4 ready for UE5, Blender & Maya");
                  }}
                  className="min-h-[36px] px-3.5 sm:px-4 py-1.5 rounded-full bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] hover:bg-[var(--color-kumo-tint)] inline-flex flex-wrap items-center justify-center gap-2 text-[12px] sm:text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer transition-colors max-w-full"
                >
                  <span>Connect your 3D pipeline to Onflow Bridge</span>
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <span className="size-4 rounded-[4px] bg-[#f6821f] text-white text-[9px] font-bold inline-flex items-center justify-center">
                      UE
                    </span>
                    <span className="size-4 rounded-[4px] bg-[#18181b] text-white text-[9px] font-bold inline-flex items-center justify-center">
                      BL
                    </span>
                    <span className="size-4 rounded-[4px] bg-[#0051c3] text-white text-[9px] font-bold inline-flex items-center justify-center">
                      MY
                    </span>
                  </span>
                </button>

                {/* Hero Title (`text-3xl font-semibold`) */}
                <h1 className="m-0 text-[30px] leading-[36px] font-semibold tracking-[-0.02em] text-[var(--text-color-kumo-strong)] text-center">
                  What&apos;s on the agenda?
                </h1>

                {/* Search Well (`1000x52px`, `bg-kumo-elevated p-1.5 rounded-2xl`) */}
                <div className="w-full bg-[var(--color-kumo-elevated)] p-1.5 rounded-[16px] border border-[var(--color-kumo-line)]/60">
                  <div className="w-full h-10 bg-white rounded-[12px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)] px-3.5 flex items-center justify-between gap-2.5 focus-within:ring-2 focus-within:ring-[var(--color-kumo-brand)]/30">
                    <Search
                      size={16}
                      strokeWidth={1.5}
                      className="text-[var(--text-color-kumo-subtle)] shrink-0"
                    />
                    <input
                      ref={homeSearchInputRef}
                      type="text"
                      value={homeSearch}
                      onChange={(e) => setHomeSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && homeSearch.trim()) {
                          setDownloadSearch(homeSearch);
                          setActiveTab("downloads");
                        }
                      }}
                      placeholder="Search orders, 3D collections, PBR surfaces, or invoices..."
                      className="w-full bg-transparent border-0 outline-none text-[14px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
                    />
                    {homeSearch ? (
                      <button
                        type="button"
                        onClick={() => setHomeSearch("")}
                        className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <div className="hidden sm:flex items-center gap-1 shrink-0">
                        <kbd className="px-1.5 py-0.5 text-[11px] rounded-[4px] bg-[var(--color-kumo-recessed)] border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-subtle)]">
                          ⌘
                        </kbd>
                        <kbd className="px-1.5 py-0.5 text-[11px] rounded-[4px] bg-[var(--color-kumo-recessed)] border border-[var(--color-kumo-line)] text-[var(--text-color-kumo-subtle)]">
                          K
                        </kbd>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3-Column Quick Access List (`Collections`, `Recent orders`, `Recents`) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                {/* Column 1: Collections (Domains equivalent) */}
                <div className="flex flex-col">
                  <div className="pb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab("downloads")}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <span>Collections</span>
                      <ChevronRight size={12} />
                    </button>
                    <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                  </div>

                  <div className="flex flex-col divide-y divide-[var(--color-kumo-line)]">
                    {[
                      { name: "quang-tri-citadel.onflow", count: "3 assets" },
                      { name: "thang-long-imperial.onflow", count: "2 assets" },
                      { name: "my-son-sanctuary.onflow", count: "2 assets" },
                    ].map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          setActiveTab("downloads");
                        }}
                        className="h-[52px] w-full px-1 bg-transparent hover:bg-[var(--color-kumo-tint)]/60 border-0 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Globe
                            size={15}
                            strokeWidth={1.5}
                            className="text-[var(--text-color-kumo-subtle)] shrink-0"
                          />
                          <span className="text-[14px] font-medium text-[var(--text-color-kumo-strong)] truncate">
                            {col.name}
                          </span>
                        </span>
                        <ChevronRight
                          size={13}
                          className="text-[var(--text-color-kumo-subtle)] shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 2: Recent Orders (Workers equivalent) */}
                <div className="flex flex-col">
                  <div className="pb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab("downloads")}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <span>Recent orders</span>
                      <ChevronRight size={12} />
                    </button>
                    <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                  </div>

                  <div className="flex flex-col divide-y divide-[var(--color-kumo-line)]">
                    {PORTAL_ORDERS.slice(0, 3).map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => {
                          setExpandedAssetId(order.assets[0]?.id ?? null);
                          setActiveTab("downloads");
                        }}
                        className="h-[52px] w-full px-1 bg-transparent hover:bg-[var(--color-kumo-tint)]/60 border-0 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Box
                            size={15}
                            strokeWidth={1.5}
                            className="text-[var(--text-color-kumo-subtle)] shrink-0"
                          />
                          <span className="text-[14px] font-medium text-[var(--text-color-kumo-strong)] truncate kumo-mono">
                            {order.code.toLowerCase()}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                            <span>{order.credits}</span>
                            <CreditIcon size={11} />
                          </span>
                          <ChevronRight
                            size={13}
                            className="text-[var(--text-color-kumo-subtle)]"
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 3: Recents (Path breadcrumb style: `Category / Bold Target`) */}
                <div className="flex flex-col">
                  <div className="pb-2 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[var(--text-color-kumo-subtle)]">
                      Recents
                    </span>
                    <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                  </div>

                  <div className="flex flex-col divide-y divide-[var(--color-kumo-line)]">
                    {[
                      { prefix: "Exports", target: "White Marble Burner", tab: "downloads" as const },
                      { prefix: "Observability", target: "Usage Analytics", tab: "analytics" as const },
                      { prefix: "Asset Library", target: "8K PBR Surfaces", tab: "downloads" as const },
                      { prefix: "Bridge API", target: "UE 5.4 Direct Sync", tab: "downloads" as const },
                      { prefix: "Manage account", target: "Billing & Credits", tab: "credits" as const },
                    ].map((rec) => (
                      <button
                        key={rec.target}
                        type="button"
                        onClick={() => setActiveTab(rec.tab)}
                        className="h-[46px] w-full px-1 bg-transparent hover:bg-[var(--color-kumo-tint)]/60 border-0 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2.5 min-w-0 text-[13px]">
                          <Clock
                            size={14}
                            strokeWidth={1.5}
                            className="text-[var(--text-color-kumo-subtle)] shrink-0"
                          />
                          <span className="truncate text-[var(--text-color-kumo-subtle)]">
                            {rec.prefix} /{" "}
                            <strong className="font-semibold text-[var(--text-color-kumo-strong)]">
                              {rec.target}
                            </strong>
                          </span>
                        </span>
                        <ChevronRight
                          size={13}
                          className="text-[var(--text-color-kumo-subtle)] shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Orange Promo Banner (Cloudflare Connect 2026 card equivalent) */}
              <div className="bg-[var(--color-kumo-elevated)] p-1.5 rounded-[14px] border border-[var(--color-kumo-line)]">
                <div className="bg-white rounded-[10px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Orange visual tile */}
                    <div className="w-[76px] h-[64px] rounded-[8px] bg-gradient-to-br from-[#ff8f2b] to-[#e05d00] shrink-0 flex flex-col justify-between p-2 text-white relative overflow-hidden">
                      <span className="kumo-mono text-[9px] uppercase tracking-wider opacity-85">
                        SCAN 2026
                      </span>
                      <span className="text-[13px] font-bold leading-none">
                        16K EXR
                      </span>
                      <div className="absolute -right-3 -bottom-3 size-12 rounded-full border-[3px] border-white/20" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="m-0 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Explore the 2026 Central Vietnam Heritage Photogrammetry Release
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-kumo-recessed)] text-[11px] font-medium text-[var(--text-color-kumo-default)]">
                          <span>+140 scans</span>
                          <ArrowUpRight size={11} />
                        </span>
                      </div>
                      <p className="m-0 mt-1 text-[13px] text-[var(--text-color-kumo-subtle)] line-clamp-2">
                        Cross-polarized 8K PBR surfaces and 32-bit HDRI skies from Quang Tri, Hue Imperial City, and My Son Sanctuary. Free re-exports for active workspaces.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("downloads")}
                    className="h-9 px-3.5 rounded-[8px] kumo-btn-orange text-[13px] font-medium shrink-0 cursor-pointer"
                  >
                    Browse release
                  </button>
                </div>
              </div>

              {/* Analytics Section (`Analytics` H2 + `Last 24 hours` pill + `+` + `Refresh` + 2-col top row & 4-col bottom row) */}
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <h2 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Analytics
                    </h2>
                    <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                      {currentOrg.name} ({currentOrg.credits.toLocaleString()} credits available)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Time Range Pill Selector */}
                    <div className="relative inline-flex items-center">
                      <Calendar
                        size={14}
                        strokeWidth={1.5}
                        className="absolute left-3 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                      <select
                        value={globalTimeRange}
                        onChange={(e) => setGlobalTimeRange(e.target.value as TimeRange)}
                        aria-label="Select analytics range"
                        className="h-9 pl-8 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] hover:bg-[var(--color-kumo-tint)] text-[13px] font-medium text-[var(--text-color-kumo-default)] outline-none cursor-pointer appearance-none"
                      >
                        <option value="24h">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="6m">Last 6 months</option>
                        <option value="1y">Last 12 months</option>
                      </select>
                      <ChevronDown
                        size={13}
                        className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("analytics")}
                      aria-label="Open full analytics"
                      title="Open full analytics"
                      className="size-9 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      <Plus size={16} strokeWidth={1.5} />
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast(`Refreshed metrics (${homeCards.label})`)}
                      aria-label="Refresh metrics"
                      title="Refresh metrics"
                      className="size-9 rounded-[8px] bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      <RefreshCw size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Top 2-Column Wide Chart Row (`494x241px` each) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Card 1: Total CDN & Asset Requests */}
                  <div
                    onClick={() => {
                      setSelectedMetric("downloads");
                      setActiveTab("analytics");
                    }}
                    className="h-[241px] rounded-[8px] bg-white border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] px-4 pt-3 pb-2.5 flex flex-col justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                          Total asset requests
                        </span>
                        <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="text-[24px] leading-[1.25] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                          {homeCards.requestsTotal}
                        </span>
                        <span className="text-[13px] font-medium text-[var(--text-color-kumo-success)] kumo-mono">
                          ↗ {homeCards.requestsDelta}
                        </span>
                      </div>
                    </div>

                    {/* ECharts-style Canvas Area with Right-side Y-axis */}
                    <div className="relative h-[162px] w-full">
                      <svg
                        viewBox="0 0 460 148"
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="kumoBlueArea1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3e8eff" stopOpacity="0.24" />
                            <stop offset="100%" stopColor="#3e8eff" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
                          const y = reqGeo.padTop + step * reqGeo.innerH;
                          return (
                            <line
                              key={idx}
                              x1={reqGeo.padLeft}
                              y1={y}
                              x2={460 - reqGeo.padRight}
                              y2={y}
                              stroke="rgba(0,0,0,0.06)"
                              strokeWidth="1"
                            />
                          );
                        })}
                        <path d={reqGeo.areaPath} fill="url(#kumoBlueArea1)" />
                        <path
                          d={reqGeo.solidLine}
                          fill="none"
                          stroke="#3e8eff"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        {reqGeo.dashedTail && (
                          <path
                            d={reqGeo.dashedTail}
                            fill="none"
                            stroke="#3e8eff"
                            strokeWidth="1.6"
                            strokeDasharray="3 3"
                          />
                        )}
                      </svg>
                      <div className="absolute right-0 top-1 bottom-1 w-7 flex flex-col justify-between text-right text-[11px] text-[var(--text-color-kumo-subtle)] kumo-mono pointer-events-none">
                        {reqGeo.ticks.map((t, i) => (
                          <span key={i}>{t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Bridge Direct Invocations */}
                  <div
                    onClick={() => {
                      setSelectedMetric("bridge");
                      setActiveTab("analytics");
                    }}
                    className="h-[241px] rounded-[8px] bg-white border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] px-4 pt-3 pb-2.5 flex flex-col justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                          Bridge scene invocations
                        </span>
                        <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="text-[24px] leading-[1.25] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                          {homeCards.bridgeTotal}
                        </span>
                        <span className="text-[13px] font-medium text-[var(--text-color-kumo-success)] kumo-mono">
                          ↗ {homeCards.bridgeDelta}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-[162px] w-full">
                      <svg
                        viewBox="0 0 460 148"
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="kumoBlueArea2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3e8eff" stopOpacity="0.24" />
                            <stop offset="100%" stopColor="#3e8eff" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
                          const y = bridgeGeo.padTop + step * bridgeGeo.innerH;
                          return (
                            <line
                              key={idx}
                              x1={bridgeGeo.padLeft}
                              y1={y}
                              x2={460 - bridgeGeo.padRight}
                              y2={y}
                              stroke="rgba(0,0,0,0.06)"
                              strokeWidth="1"
                            />
                          );
                        })}
                        <path d={bridgeGeo.areaPath} fill="url(#kumoBlueArea2)" />
                        <path
                          d={bridgeGeo.solidLine}
                          fill="none"
                          stroke="#3e8eff"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        {bridgeGeo.dashedTail && (
                          <path
                            d={bridgeGeo.dashedTail}
                            fill="none"
                            stroke="#3e8eff"
                            strokeWidth="1.6"
                            strokeDasharray="3 3"
                          />
                        )}
                      </svg>
                      <div className="absolute right-0 top-1 bottom-1 w-7 flex flex-col justify-between text-right text-[11px] text-[var(--text-color-kumo-subtle)] kumo-mono pointer-events-none">
                        {bridgeGeo.ticks.map((t, i) => (
                          <span key={i}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom 4-Column Compact Analytics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Small Card 1: Export errors (Empty "No data" pill state matching Cloudflare screenshot) */}
                  <div className="h-[210px] rounded-[8px] bg-white border border-[var(--color-kumo-line)] px-4 pt-3 pb-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                          Export checksum errors
                        </span>
                        <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                      </div>
                      <div className="mt-0.5">
                        <span className="text-[24px] leading-[1.25] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                          {homeCards.errorsTotal}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-[126px] w-full flex items-center justify-center">
                      <svg
                        viewBox="0 0 220 100"
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 0,68 Q 25,52 50,64 T 100,58 T 150,65 T 220,60 L 220,100 L 0,100 Z"
                          fill="rgba(0,0,0,0.025)"
                        />
                        <path
                          d="M 0,68 Q 25,52 50,64 T 100,58 T 150,65 T 220,60"
                          fill="none"
                          stroke="rgba(0,0,0,0.08)"
                          strokeWidth="1.2"
                        />
                      </svg>
                      <span className="relative z-10 px-2.5 py-0.5 rounded-full bg-white border border-[var(--color-kumo-line)] text-[11px] font-medium text-[var(--text-color-kumo-subtle)] shadow-2xs">
                        No errors
                      </span>
                    </div>
                  </div>

                  {/* Small Card 2: CDN edge cache hit rate */}
                  <div
                    onClick={() => {
                      setSelectedMetric("bandwidth");
                      setActiveTab("analytics");
                    }}
                    className="h-[210px] rounded-[8px] bg-white border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] px-4 pt-3 pb-2.5 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                          CDN cache hit rate
                        </span>
                        <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-1.5">
                        <span className="text-[24px] leading-[1.25] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                          {homeCards.cacheRate}
                        </span>
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-success)] kumo-mono">
                          ↗ {homeCards.cacheDelta}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-[126px] w-full">
                      <svg
                        viewBox="0 0 220 118"
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <path d={cacheGeo.areaPath} fill="url(#kumoBlueArea1)" />
                        <path
                          d={cacheGeo.solidLine}
                          fill="none"
                          stroke="#3e8eff"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Small Card 3: Archive pack time P90 */}
                  <div className="h-[210px] rounded-[8px] bg-white border border-[var(--color-kumo-line)] px-4 pt-3 pb-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                          Archive stream P90
                        </span>
                        <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-1.5">
                        <span className="text-[24px] leading-[1.25] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                          {homeCards.p90Latency}
                        </span>
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-success)] kumo-mono">
                          ↘ {homeCards.p90Delta}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-[126px] w-full">
                      <svg
                        viewBox="0 0 220 118"
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <path d={p90Geo.areaPath} fill="url(#kumoBlueArea1)" />
                        <path
                          d={p90Geo.solidLine}
                          fill="none"
                          stroke="#3e8eff"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Small Card 4: Credits consumed */}
                  <div
                    onClick={() => {
                      setSelectedMetric("credits");
                      setActiveTab("analytics");
                    }}
                    className="h-[210px] rounded-[8px] bg-white border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] px-4 pt-3 pb-2.5 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                          Credits consumed
                        </span>
                        <MoreHorizontal size={14} className="text-[var(--text-color-kumo-subtle)]" />
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-1.5">
                        <span className="text-[24px] leading-[1.25] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono inline-flex items-center gap-1.5">
                          <span>{homeCards.creditsBurned}</span>
                          <CreditIcon size={16} />
                        </span>
                        <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)] kumo-mono">
                          {homeCards.creditsDelta}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-[126px] w-full">
                      <svg
                        viewBox="0 0 220 118"
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <path d={credGeo.areaPath} fill="url(#kumoBlueArea1)" />
                        <path
                          d={credGeo.solidLine}
                          fill="none"
                          stroke="#3e8eff"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ===================== TAB 2: DOWNLOADS (Workers & Pages Split Layout + 400px Right Rail) ===================== */}
        {activeTab === "downloads" && (
          <div className="flex-1 flex flex-col xl:flex-row">
            {/* Main Left Column */}
            <main className="flex-1 min-w-0 px-4 md:px-8 pt-7 pb-8 flex flex-col gap-5">
              {/* Sub-page Title Header (`20px font-semibold` + `View docs` pill + Primary CTA) */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="m-0 text-[20px] leading-[26px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Downloads & Exports
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setSupportInitialTab("knowledge");
                        setIsSupportOpen(true);
                      }}
                      className="h-6 px-2.5 rounded-full bg-white border border-[var(--color-kumo-line)] hover:bg-[var(--color-kumo-tint)] text-[12px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                    >
                      View docs
                    </button>
                  </div>
                  <p className="m-0 text-[14px] text-[var(--text-color-kumo-subtle)]">
                    Configure mesh LODs, 16-bit PBR texture resolution, and export formats for unlocked assets.
                  </p>
                </div>

                <Link
                  href="/"
                  className="h-9 px-3.5 rounded-[8px] kumo-btn-primary text-[14px] leading-5 font-medium inline-flex items-center justify-center no-underline"
                >
                  Browse 3D catalog
                </Link>
              </div>

              {/* Cloudflare Kumo Segmented Toolbar (`h-9`, `rounded-lg bg-white ring ring-kumo-line shadow-xs`, divided by `border-l`) */}
              <div className="bg-[var(--color-kumo-elevated)] p-1 rounded-[10px] border border-[var(--color-kumo-line)]/70">
                <div className="w-full min-h-[36px] rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] flex flex-wrap sm:flex-nowrap items-stretch overflow-hidden">
                  {/* Segment 1: Search input */}
                  <div className="flex-1 min-w-[180px] px-3 flex items-center gap-2">
                    <Search
                      size={14}
                      strokeWidth={1.5}
                      className="text-[var(--text-color-kumo-subtle)] shrink-0"
                    />
                    <input
                      type="text"
                      value={downloadSearch}
                      onChange={(e) => setDownloadSearch(e.target.value)}
                      placeholder="Search orders or assets"
                      className="w-full bg-transparent border-0 outline-none text-[13px] text-[var(--text-color-kumo-default)] placeholder:text-[var(--text-color-kumo-placeholder)]"
                    />
                    {downloadSearch && (
                      <button
                        type="button"
                        onClick={() => setDownloadSearch("")}
                        className="text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Segment 2: Category filter */}
                  <div className="relative border-t sm:border-t-0 sm:border-l border-[var(--color-kumo-line)] flex items-center">
                    <select
                      value={downloadCategoryFilter}
                      onChange={(e) => setDownloadCategoryFilter(e.target.value)}
                      aria-label="Filter category"
                      className="h-9 pl-3 pr-7 bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 text-[13px] font-medium text-[var(--text-color-kumo-default)] outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">Show all</option>
                      <option value="3D models">3D models</option>
                      <option value="Surfaces">Surfaces</option>
                      <option value="HDRIs">HDRIs</option>
                      <option value="Kitbash">Kitbash</option>
                    </select>
                    <ChevronsUpDown
                      size={12}
                      className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                    />
                  </div>

                  {/* Segment 3: Sort */}
                  <div className="relative border-t sm:border-t-0 sm:border-l border-[var(--color-kumo-line)] flex items-center">
                    <select
                      value={downloadSort}
                      onChange={(e) =>
                        setDownloadSort(
                          e.target.value as "newest" | "credits-desc" | "credits-asc"
                        )
                      }
                      aria-label="Sort orders"
                      className="h-9 pl-3 pr-7 bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 text-[13px] font-medium text-[var(--text-color-kumo-default)] outline-none cursor-pointer appearance-none"
                    >
                      <option value="newest">Last modified</option>
                      <option value="credits-desc">Credits: High to low</option>
                      <option value="credits-asc">Credits: Low to high</option>
                    </select>
                    <ChevronsUpDown
                      size={12}
                      className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                    />
                  </div>

                  {/* Segment 4: Refresh icon button */}
                  <button
                    type="button"
                    onClick={() => showToast("Order archive synchronized")}
                    aria-label="Refresh orders"
                    title="Refresh orders"
                    className="w-9 border-t sm:border-t-0 sm:border-l border-[var(--color-kumo-line)] bg-transparent hover:bg-[var(--color-kumo-tint)] flex items-center justify-center text-[var(--text-color-kumo-default)] cursor-pointer shrink-0"
                  >
                    <RefreshCw size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Workers & Pages-style Application Cards for Orders */}
              {filteredDownloadOrders.length === 0 ? (
                <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-10 text-center flex flex-col items-center gap-3">
                  <p className="m-0 text-[14px] font-medium text-[var(--text-color-kumo-strong)]">
                    No orders match your filter
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadSearch("");
                      setDownloadCategoryFilter("all");
                    }}
                    className="h-8 px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] hover:bg-[var(--color-kumo-tint)] text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredDownloadOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden"
                    >
                      {/* Top Card Body (Icon + Order Title/Collection + Pill + Relative Time + Export All) */}
                      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-[6px] bg-[#eef4ff] border border-[#3e8eff]/25 flex items-center justify-center text-[#0051c3] shrink-0">
                            <Package size={16} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                                {order.code.toLowerCase()}
                              </span>
                              <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                                · {order.assets.length}{" "}
                                {order.assets.length === 1 ? "asset" : "assets"}
                              </span>
                            </div>
                            <div className="text-[13px] text-[var(--text-color-kumo-subtle)] underline decoration-[var(--color-kumo-line)] underline-offset-2 truncate">
                              {order.assets[0]?.collection}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[var(--color-kumo-fill)] bg-[var(--color-kumo-canvas)] text-[12px] font-medium text-[var(--text-color-kumo-default)] kumo-mono">
                            <Layers size={11} className="text-[var(--text-color-kumo-subtle)]" />
                            <span>onflow/{order.code.slice(-4)}</span>
                          </span>

                          <span className="text-[13px] text-[var(--text-color-kumo-subtle)] kumo-mono">
                            {order.relativeTime}
                          </span>

                          <button
                            type="button"
                            onClick={() => triggerOrderBatchDownload(order)}
                            className="h-8 px-2.5 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download size={13} strokeWidth={1.5} />
                            <span>Export bundle</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Asset Rows inside the Order Card */}
                      <div className="border-t border-[var(--color-kumo-line)] divide-y divide-[var(--color-kumo-line)]">
                        {order.assets.map((asset) => {
                          const isExpanded = expandedAssetId === asset.id;
                          const isDone = Boolean(downloadedAssetIds[asset.id]);
                          const estSizeMb = (
                            asset.baseSizeMb *
                            (RESOLUTION_MULTIPLIER[resolution] ?? 1) *
                            (polyMode === "lod" ? 0.55 : 1)
                          ).toFixed(1);

                          return (
                            <div key={asset.id} className="bg-[var(--color-kumo-canvas)]/50">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedAssetId(isExpanded ? null : asset.id)
                                }
                                className="w-full px-4 py-2.5 bg-transparent hover:bg-[var(--color-kumo-overlay)] border-0 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0 text-[13px]">
                                  <ChevronRight
                                    size={13}
                                    className={`text-[var(--text-color-kumo-subtle)] shrink-0 transition-transform ${
                                      isExpanded ? "rotate-90" : ""
                                    }`}
                                  />
                                  <span className="font-medium text-[var(--text-color-kumo-strong)] truncate">
                                    {asset.title}
                                  </span>
                                  <span className="kumo-mono text-[12px] text-[var(--text-color-kumo-subtle)] truncate hidden sm:inline">
                                    {asset.path}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 text-[12px]">
                                  {isDone && (
                                    <span className="inline-flex items-center gap-1 text-[var(--text-color-kumo-success)] font-medium">
                                      <Check size={12} />
                                      <span>Exported</span>
                                    </span>
                                  )}
                                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)]">
                                    {asset.category}
                                  </span>
                                  <span className="kumo-mono text-[var(--text-color-kumo-subtle)]">
                                    {asset.triangles}
                                  </span>
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="px-4 py-3.5 bg-white border-t border-[var(--color-kumo-line)] flex flex-col gap-3">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Geometry Selector */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                                        Geometry LOD
                                      </span>
                                      <div className="h-9 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 grid grid-cols-2 gap-0.5">
                                        {(
                                          [
                                            { id: "high", label: "High-poly" },
                                            { id: "lod", label: "LOD0–LOD3" },
                                          ] as const
                                        ).map((g) => (
                                          <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => setPolyMode(g.id)}
                                            className={`rounded-[6px] border-0 text-[12px] font-medium cursor-pointer transition-colors ${
                                              polyMode === g.id
                                                ? "bg-white text-[var(--text-color-kumo-strong)] shadow-2xs"
                                                : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                                            }`}
                                          >
                                            {g.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Texture Resolution */}
                                    <label className="flex flex-col gap-1">
                                      <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                                        Texture resolution
                                      </span>
                                      <div className="relative flex items-center">
                                        <select
                                          value={resolution}
                                          onChange={(e) => setResolution(e.target.value)}
                                          className="h-9 w-full pl-2.5 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-default)] outline-none cursor-pointer"
                                        >
                                          {Object.keys(RESOLUTION_MULTIPLIER).map((res) => (
                                            <option key={res} value={res}>
                                              {res}
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronsUpDown
                                          size={12}
                                          className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                                        />
                                      </div>
                                    </label>

                                    {/* Mesh Format */}
                                    <label className="flex flex-col gap-1">
                                      <span className="text-[12px] font-medium text-[var(--text-color-kumo-subtle)]">
                                        Object format
                                      </span>
                                      <div className="relative flex items-center">
                                        <select
                                          value={exportFormat}
                                          onChange={(e) => setExportFormat(e.target.value)}
                                          className="h-9 w-full pl-2.5 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] text-[13px] text-[var(--text-color-kumo-default)] outline-none cursor-pointer"
                                        >
                                          <option value="FBX">FBX (Autodesk)</option>
                                          <option value="OBJ">OBJ (Wavefront)</option>
                                          <option value="GLB">glTF / GLB 2.0</option>
                                          <option value="USDZ">OpenUSD / USDZ</option>
                                        </select>
                                        <ChevronsUpDown
                                          size={12}
                                          className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                                        />
                                      </div>
                                    </label>
                                  </div>

                                  <div className="pt-2 border-t border-[var(--color-kumo-line)] flex flex-wrap items-center justify-between gap-3">
                                    <span className="text-[12px] text-[var(--text-color-kumo-subtle)] kumo-mono inline-flex items-center gap-1">
                                      <span>Archive size: {estSizeMb} MB · Re-export cost: 0</span>
                                      <CreditIcon size={10} />
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => triggerAssetDownload(asset, order.code)}
                                      className="h-8 px-3.5 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Download size={13} strokeWidth={1.5} />
                                      <span>Download {exportFormat}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cloudflare Kumo Table Pagination Footer */}
              <div className="pt-1 flex items-center justify-between text-[13px] text-[var(--text-color-kumo-subtle)]">
                <span>
                  Showing 1 - {filteredDownloadOrders.length} of {PORTAL_ORDERS.length}
                </span>
                <div className="inline-flex items-center rounded-[8px] bg-white border border-[var(--color-kumo-line)] overflow-hidden shadow-[var(--shadow-kumo-xs)]">
                  <span className="px-2.5 py-1 text-[var(--text-color-kumo-inactive)] border-r border-[var(--color-kumo-line)]">
                    «
                  </span>
                  <span className="px-2.5 py-1 text-[var(--text-color-kumo-inactive)] border-r border-[var(--color-kumo-line)]">
                    ‹
                  </span>
                  <span className="px-3 py-1 font-medium text-[var(--text-color-kumo-strong)] bg-[var(--color-kumo-canvas)] border-r border-[var(--color-kumo-line)] kumo-mono">
                    1
                  </span>
                  <span className="px-2.5 py-1 text-[var(--text-color-kumo-inactive)] border-r border-[var(--color-kumo-line)]">
                    ›
                  </span>
                  <span className="px-2.5 py-1 text-[var(--text-color-kumo-inactive)]">
                    »
                  </span>
                </div>
              </div>
            </main>

            {/* Right Rail (400px Kumo Usage + Account details + Bridge sync) */}
            {renderRightRail()}
          </div>
        )}

        {/* ===================== TAB 3: OBSERVABILITY / ANALYTICS ===================== */}
        {activeTab === "analytics" && (
          <main className="flex-1 px-4 md:px-8 pt-7 pb-8">
            <div className="w-full max-w-[1140px] flex flex-col gap-6">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="m-0 text-[20px] leading-[26px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Workspace Analytics
                    </h1>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
                      <span>Updated 1m ago</span>
                    </span>
                  </div>
                  <p className="m-0 text-[14px] text-[var(--text-color-kumo-subtle)]">
                    Monitor asset exports, credit drawdowns, CDN bandwidth, and Bridge plugin traffic across {currentOrg.name}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative inline-flex items-center">
                    <Calendar
                      size={14}
                      strokeWidth={1.5}
                      className="absolute left-3 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                    />
                    <select
                      value={globalTimeRange}
                      onChange={(e) => {
                        setGlobalTimeRange(e.target.value as TimeRange);
                        setHoveredAnalyticsIdx(null);
                      }}
                      aria-label="Analytics time range"
                      className="h-9 pl-8 pr-7 rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] outline-none cursor-pointer appearance-none"
                    >
                      <option value="24h">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="6m">Last 6 months</option>
                      <option value="1y">Last 12 months</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadStatementCsv}
                    className="h-9 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown size={14} strokeWidth={1.5} />
                    <span>Export report</span>
                  </button>
                </div>
              </div>

              {/* Selectable KPI Strip + Main Interactive ECharts Area Chart (dashboard-design skill pattern) */}
              <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden">
                {/* 4 Selectable KPI Tiles divided by hairlines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-[var(--color-kumo-line)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-kumo-line)]">
                  {(Object.keys(ANALYTICS_METRICS) as AnalyticsMetricId[]).map((mId) => {
                    const m = ANALYTICS_METRICS[mId];
                    const isSelected = selectedMetric === mId;
                    return (
                      <button
                        key={mId}
                        type="button"
                        aria-pressed={isSelected}
                        title={m.tooltip}
                        onClick={() => {
                          setSelectedMetric(mId);
                          setHoveredAnalyticsIdx(null);
                        }}
                        className="p-2 text-left bg-transparent border-0 cursor-pointer focus-visible:outline-none"
                      >
                        <div
                          className={`h-full rounded-[8px] px-3.5 py-2.5 transition-colors ${
                            isSelected
                              ? "bg-[#3e8eff]/[.08] ring-1 ring-inset ring-[#3e8eff]/30"
                              : "hover:bg-[var(--color-kumo-tint)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[13px] ${
                                isSelected
                                  ? "font-semibold text-[var(--text-color-kumo-strong)]"
                                  : "font-medium text-[var(--text-color-kumo-subtle)]"
                              }`}
                            >
                              {m.label}
                            </span>
                            <span className="text-[12px] font-medium text-[var(--text-color-kumo-success)] kumo-mono">
                              ▲ {m.delta}
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between gap-2">
                            <span className="text-[24px] leading-[1.2] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                              {m.cur}
                            </span>
                            <span className="text-[11px] text-[var(--text-color-kumo-subtle)]">
                              {m.vs}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Main Chart Canvas */}
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4 text-[12px]">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-color-kumo-strong)]">
                        <span className="w-2.5 h-0.5 bg-[#3e8eff] inline-block" />
                        <span>Current period ({HOME_ANALYTICS_CARDS[globalTimeRange].label})</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-color-kumo-subtle)]">
                        <span className="w-2.5 h-0.5 border-b border-dashed border-[var(--text-color-kumo-subtle)] inline-block" />
                        <span>Previous period</span>
                      </span>
                    </div>

                    {hoveredAnalyticsIdx !== null &&
                      mainAnalyticsChart.coords[hoveredAnalyticsIdx] && (
                        <div className="px-2.5 py-1 rounded-[6px] bg-[var(--text-color-kumo-strong)] text-white text-[12px] kumo-mono flex items-center gap-2">
                          <span>
                            {mainAnalyticsChart.coords[hoveredAnalyticsIdx].label}:
                          </span>
                          <strong>
                            {mainAnalyticsChart.coords[hoveredAnalyticsIdx].val}{" "}
                            {activeMetricObj.unit}
                          </strong>
                          <span className="text-white/70">
                            (prev {mainAnalyticsChart.coords[hoveredAnalyticsIdx].prev})
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="relative h-[220px] w-full">
                    <svg
                      viewBox="0 0 680 210"
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="kumoMainAnalyticsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3e8eff" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#3e8eff" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
                        const y = mainAnalyticsChart.padTop + step * mainAnalyticsChart.innerH;
                        return (
                          <line
                            key={i}
                            x1="10"
                            y1={y}
                            x2="636"
                            y2={y}
                            stroke="rgba(0,0,0,0.06)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Previous period dashed line */}
                      <path
                        d={mainAnalyticsChart.prevLinePath}
                        fill="none"
                        stroke="rgba(115,115,115,0.55)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />

                      {/* Current period area + line */}
                      <path
                        d={mainAnalyticsChart.areaPath}
                        fill="url(#kumoMainAnalyticsGrad)"
                      />
                      <path
                        d={mainAnalyticsChart.linePath}
                        fill="none"
                        stroke="#3e8eff"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />

                      {hoveredAnalyticsIdx !== null &&
                        mainAnalyticsChart.coords[hoveredAnalyticsIdx] && (
                          <g>
                            <line
                              x1={mainAnalyticsChart.coords[hoveredAnalyticsIdx].x}
                              y1={mainAnalyticsChart.padTop}
                              x2={mainAnalyticsChart.coords[hoveredAnalyticsIdx].x}
                              y2={mainAnalyticsChart.baselineY}
                              stroke="#3e8eff"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={mainAnalyticsChart.coords[hoveredAnalyticsIdx].x}
                              cy={mainAnalyticsChart.coords[hoveredAnalyticsIdx].y}
                              r="4"
                              fill="#3e8eff"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          </g>
                        )}
                    </svg>

                    {/* Right-hand Y-axis ticks (Cloudflare ECharts convention) */}
                    <div className="absolute right-0 top-2 bottom-2 w-9 flex flex-col justify-between text-right text-[11px] text-[var(--text-color-kumo-subtle)] kumo-mono pointer-events-none">
                      {mainAnalyticsChart.ticks.map((t, idx) => (
                        <span key={idx}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* X-axis buttons */}
                  <div className="pr-10 flex justify-between text-[12px] text-[var(--text-color-kumo-subtle)] kumo-mono">
                    {mainAnalyticsChart.coords.map((pt, idx) => (
                      <button
                        key={pt.label}
                        type="button"
                        onMouseEnter={() => setHoveredAnalyticsIdx(idx)}
                        onClick={() => setHoveredAnalyticsIdx(idx)}
                        className={`bg-transparent border-0 p-1 cursor-pointer rounded-[4px] ${
                          hoveredAnalyticsIdx === idx
                            ? "text-[var(--text-color-kumo-link)] font-semibold"
                            : "hover:text-[var(--text-color-kumo-default)]"
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lower Grid: Domains-style Collection Breakdown Table + Slim 3px Share Bar Ranked List */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">
                {/* Domains Overview-style Data Table with Inline Sparklines & Count Pills */}
                <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-kumo-line)] flex flex-wrap items-center justify-between gap-2">
                    <h2 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Top collections & assets
                    </h2>

                    <div className="max-w-full overflow-x-auto no-scrollbar">
                      <div className="h-8 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 inline-flex items-center gap-0.5 whitespace-nowrap">
                        {["All", "3D models", "Surfaces", "HDRIs", "Kitbash"].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTopCategoryFilter(cat)}
                            className={`h-7 px-2.5 rounded-[6px] border-0 text-[12px] cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                              topCategoryFilter === cat
                                ? "bg-white font-medium text-[var(--text-color-kumo-strong)] shadow-2xs"
                                : "bg-transparent text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse text-left">
                      <thead>
                        <tr className="h-11 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] text-[13px] font-medium text-[var(--text-color-kumo-subtle)]">
                          <th className="py-2 px-4 font-medium min-w-[210px]">Collection</th>
                          <th className="py-2 px-3 font-medium whitespace-nowrap">Status</th>
                          <th className="py-2 px-3 font-medium whitespace-nowrap">Category</th>
                          <th className="py-2 px-4 font-medium text-right whitespace-nowrap">Exports (30d)</th>
                          <th className="py-2 px-4 font-medium text-right whitespace-nowrap">Credits</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-kumo-line)] text-[14px]">
                        {visibleTopDownloads.map((row) => {
                          const sparkGeo = buildKumoAreaGeometry(row.trend, 92, 24);
                          return (
                            <tr
                              key={row.name}
                              onClick={() => setActiveTab("downloads")}
                              className="h-12 bg-white hover:bg-[var(--color-kumo-overlay)] cursor-pointer transition-colors"
                            >
                              <td className="py-2.5 px-4">
                                <div className="font-medium text-[var(--text-color-kumo-strong)] underline decoration-[var(--color-kumo-line)] underline-offset-2">
                                  {row.name}
                                </div>
                                <div className="kumo-mono text-[11px] text-[var(--text-color-kumo-subtle)]">
                                  {row.domain}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-color-kumo-default)]">
                                  <Check
                                    size={14}
                                    strokeWidth={2}
                                    className="text-[var(--text-color-kumo-success)]"
                                  />
                                  <span>{row.status}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium border border-[var(--color-kumo-fill)] bg-white text-[var(--text-color-kumo-default)] whitespace-nowrap">
                                  {row.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="inline-flex items-center justify-end gap-2.5">
                                  <svg
                                    width="84"
                                    height="24"
                                    viewBox="0 0 92 24"
                                    className="overflow-visible hidden sm:block"
                                  >
                                    <path
                                      d={sparkGeo.areaPath}
                                      fill="rgba(62, 142, 255, 0.16)"
                                    />
                                    <path
                                      d={sparkGeo.solidLine}
                                      fill="none"
                                      stroke="#3e8eff"
                                      strokeWidth="1.5"
                                    />
                                  </svg>
                                  <span className="kumo-mono font-medium text-[var(--text-color-kumo-strong)] w-8 text-right">
                                    {row.downloads}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right kumo-mono font-medium text-[var(--text-color-kumo-strong)]">
                                <span className="inline-flex items-center justify-end gap-1">
                                  <span>{row.credits}</span>
                                  <CreditIcon size={11} />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ranked Breakdown Card with Slim 3px Bottom Share Bars (dashboard-design skill rule) */}
                <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                      Exports by format type
                    </h2>
                    <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                      Share
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {CATEGORY_DISTRIBUTION.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() =>
                          setTopCategoryFilter(
                            cat.label === "PBR surfaces"
                              ? "Surfaces"
                              : cat.label === "HDRI skies"
                              ? "HDRIs"
                              : cat.label === "Kitbash modules"
                              ? "Kitbash"
                              : cat.label === "3D models"
                              ? "3D models"
                              : "All"
                          )
                        }
                        className="group relative h-11 w-full rounded-[8px] px-3 pb-1.5 bg-transparent hover:bg-[var(--color-kumo-tint)] border-0 flex items-center justify-between gap-3 text-left text-[13px] cursor-pointer transition-colors"
                      >
                        {/* Slim 3px bottom share track */}
                        <span
                          aria-hidden
                          className="absolute inset-x-3 bottom-[4px] h-[3px] overflow-hidden rounded-full bg-[var(--color-kumo-line)]"
                        >
                          <span
                            className="absolute inset-y-0 left-0 rounded-full bg-[#3e8eff] opacity-80 group-hover:opacity-100 transition-opacity"
                            style={{ width: `${cat.share}%` }}
                          />
                        </span>

                        <span className="font-medium text-[var(--text-color-kumo-strong)] truncate">
                          {cat.label}
                        </span>
                        <span className="flex items-center gap-3 shrink-0 kumo-mono">
                          <span className="text-[var(--text-color-kumo-default)]">
                            {cat.count}
                          </span>
                          <span className="w-11 text-right text-[12px] text-[var(--text-color-kumo-subtle)]">
                            {cat.share}%
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ===================== TAB 4: CREDITS & BILLING (Cloudflare Manage Account -> Billing Layout) ===================== */}
        {activeTab === "credits" && (
          <main className="flex-1 px-4 md:px-8 pt-6 pb-8">
            <div className="w-full max-w-[1054px] flex flex-col gap-6">
              {/* Cloudflare Kumo Segmented Pill Tabs (`Credits`, `Subscriptions`, `Billable usage`, `Spend limits Beta`, `Invoices`) */}
              <div className="border-b border-[var(--color-kumo-line)] pb-4">
                <div
                  role="tablist"
                  aria-label="Billing sections"
                  className="inline-flex flex-wrap items-center h-auto sm:h-9 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5"
                >
                  {[
                    { id: "credits" as const, label: "Credits", badge: null },
                    { id: "subscriptions" as const, label: "Subscriptions", badge: null },
                    { id: "usage" as const, label: "Billable usage", badge: null },
                    { id: "limits" as const, label: "Spend limits", badge: "Beta" },
                    { id: "invoices" as const, label: "Invoices", badge: null },
                  ].map((tab) => {
                    const isSelected = billingSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setBillingSubTab(tab.id)}
                        className={`h-8 px-3 rounded-[6px] border-0 inline-flex items-center gap-1.5 text-[14px] cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-white font-medium text-[var(--text-color-kumo-strong)] shadow-[var(--shadow-kumo-xs)]"
                            : "bg-transparent font-normal text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)]"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <span className="rounded-full px-2 py-0.5 text-[11px] leading-none border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)]">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUB-TAB 1: CREDITS (Exact match to Cloudflare Billing -> Credits screenshot) */}
              {billingSubTab === "credits" && (
                <div className="flex flex-col gap-4">
                  {/* Large Hero Balance Card (`Workspace credits`, `Active` emerald dot pill, `$ / cr` remaining of granted, progress bar) */}
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-5 rounded-full bg-[#fff3e6] text-[#f6821f] inline-flex items-center justify-center font-bold text-[11px]">
                          ●
                        </span>
                        <h2 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Studio production credits
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-5 px-2.5 py-0.5 rounded-full border border-[var(--color-kumo-hairline)] bg-white text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
                          <span>Active</span>
                        </span>
                        <Link
                          href="/payment"
                          className="h-8 px-3 rounded-[8px] kumo-btn-primary text-[13px] font-medium inline-flex items-center no-underline"
                        >
                          Top up credits
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[28px] leading-[1.2] font-semibold text-[var(--text-color-kumo-strong)] kumo-mono inline-flex items-center gap-1.5">
                        <span>{currentOrg.credits.toLocaleString()}</span>
                        <CreditIcon size={18} />
                      </span>
                      <span className="text-[14px] text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                        <span>remaining of {currentOrg.grantedCredits.toLocaleString()}</span>
                        <CreditIcon size={11} />
                        <span>purchased</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-[var(--text-color-kumo-subtle)]">
                          Credit consumed
                        </span>
                        <span className="font-semibold text-[var(--text-color-kumo-strong)] kumo-mono inline-flex items-center gap-1">
                          <span>{creditPercentUsed}% used · {currentOrg.totalSpent.toLocaleString()}</span>
                          <CreditIcon size={10} />
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--color-kumo-recessed)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--color-kumo-brand)]"
                          style={{ width: `${creditPercentUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4-Column Metric Tile Row (`Days remaining`, `Cycle start`, `Avg. monthly burn`, `Projected depletion`) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-4 flex flex-col justify-between gap-2">
                      <span className="text-[13px] text-[var(--text-color-kumo-subtle)]">
                        Days remaining
                      </span>
                      <span className="text-[24px] leading-tight font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                        {currentOrg.daysRemaining}
                      </span>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Rollover guarantee until {currentOrg.expiresDate}
                      </span>
                    </div>

                    <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-4 flex flex-col justify-between gap-2">
                      <span className="text-[13px] text-[var(--text-color-kumo-subtle)]">
                        Programme start
                      </span>
                      <span className="text-[24px] leading-tight font-semibold text-[var(--text-color-kumo-strong)]">
                        {currentOrg.cycleStart}
                      </span>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Business · Developer tier
                      </span>
                    </div>

                    <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-4 flex flex-col justify-between gap-2">
                      <span className="text-[13px] text-[var(--text-color-kumo-subtle)]">
                        Avg. monthly burn
                      </span>
                      <span className="text-[24px] leading-tight font-semibold text-[var(--text-color-kumo-strong)] kumo-mono inline-flex items-center gap-1.5">
                        <span>{currentOrg.avgMonthlyBurn}</span>
                        <CreditIcon size={16} />
                      </span>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Based on recent cycles
                      </span>
                    </div>

                    <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-4 flex flex-col justify-between gap-2">
                      <span className="text-[13px] text-[var(--text-color-kumo-subtle)] inline-flex items-center gap-1">
                        <span>Projected Runway</span>
                        <Info size={12} />
                      </span>
                      <span className="text-[24px] leading-tight font-semibold text-[var(--text-color-kumo-strong)] kumo-mono">
                        ~13 mo
                      </span>
                      <span className="text-[12px] text-[var(--text-color-kumo-subtle)]">
                        Estimate at current burn
                      </span>
                    </div>
                  </div>

                  {/* Grey Information Callout Banner (`Credit coverage and limits`) */}
                  <div className="rounded-[8px] bg-[var(--color-kumo-recessed)] px-4 py-3.5 flex items-start gap-3 text-[13px]">
                    <Info
                      size={16}
                      className="text-[var(--text-color-kumo-default)] shrink-0 mt-0.5"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[var(--text-color-kumo-strong)]">
                        Credit coverage and free re-exports
                      </span>
                      <span className="text-[var(--text-color-kumo-subtle)]">
                        Credits are deducted once when unlocking a 3D model, PBR surface, or 16K HDRI. Re-downloading owned assets in any format (FBX, OBJ, GLB, USDZ) or texture resolution costs 0 credits.{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setSupportInitialTab("knowledge");
                            setIsSupportOpen(true);
                          }}
                          className="text-[var(--text-color-kumo-link)] underline bg-transparent border-0 p-0 cursor-pointer"
                        >
                          Learn more about commercial studio licensing
                        </button>
                        .
                      </span>
                    </div>
                  </div>

                  {/* "Where to see credit usage" Navigation Box with 2 Inner Cards */}
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <span className="size-6 rounded-full bg-[#fff3e6] text-[#f6821f] inline-flex items-center justify-center font-bold text-[12px] shrink-0 mt-0.5">
                        ●
                      </span>
                      <div>
                        <h3 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Where to see credit usage
                        </h3>
                        <p className="m-0 mt-0.5 text-[13px] text-[var(--text-color-kumo-subtle)]">
                          Credits are applied on your ledger and consolidated invoices. Use the billing tabs below for invoice-level charges and payment methods.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        onClick={() => setBillingSubTab("invoices")}
                        className="rounded-[8px] border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] p-4 flex flex-col justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                          <FileDown size={15} className="text-[var(--text-color-kumo-subtle)]" />
                          <span>Invoices & ledger</span>
                        </div>
                        <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                          Review finalized tax invoices, wire transfers, and credit deductions by billing period.
                        </p>
                        <span className="text-[13px] font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                          <span>View invoices</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>

                      <div
                        onClick={() => setBillingSubTab("usage")}
                        className="rounded-[8px] border border-[var(--color-kumo-line)] hover:border-[var(--color-kumo-fill)] p-4 flex flex-col justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-color-kumo-strong)]">
                          <BarChart3 size={15} className="text-[var(--text-color-kumo-subtle)]" />
                          <span>Billable usage & payment methods</span>
                        </div>
                        <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                          Manage saved corporate cards, Vietnam VAT tax profile, and category consumption.
                        </p>
                        <span className="text-[13px] font-medium text-[var(--text-color-kumo-strong)] inline-flex items-center gap-1">
                          <span>View usage</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2 & 3: SUBSCRIPTIONS / BILLABLE USAGE (Payment methods + Billing Address + Plan) */}
              {(billingSubTab === "subscriptions" || billingSubTab === "usage") && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
                  <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-5 flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                              Business · Developer Plan
                            </h2>
                            <span className="h-5 px-2 py-0.5 rounded-full border border-[var(--color-kumo-hairline)] text-[12px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-[var(--color-kumo-success)]" />
                              <span>Active</span>
                            </span>
                          </div>
                          <p className="m-0 mt-1 text-[13px] text-[var(--text-color-kumo-subtle)]">
                            Includes 10 studio seats, Onflow Bridge direct sync, and 16K EXR HDRI access · $29 / month
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSettingsInitialTab("billing");
                            setActiveTab("settings");
                          }}
                          className="h-9 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] text-[13px] font-medium text-[var(--text-color-kumo-default)] cursor-pointer"
                        >
                          Manage plan
                        </button>
                      </div>
                    </div>

                    {/* Saved Payment Methods */}
                    <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-5 flex flex-col gap-3.5">
                      <div className="flex items-center justify-between">
                        <h3 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                          Payment methods
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsInitialTab("billing");
                            setActiveTab("settings");
                          }}
                          className="h-8 px-3 rounded-[8px] kumo-btn-primary text-[12px] font-medium cursor-pointer"
                        >
                          Add card
                        </button>
                      </div>

                      <div className="divide-y divide-[var(--color-kumo-line)] border border-[var(--color-kumo-line)] rounded-[8px] overflow-hidden">
                        {paymentMethods.map((pm) => (
                          <div
                            key={pm.id}
                            className="px-4 py-3 bg-white hover:bg-[var(--color-kumo-overlay)] flex items-center justify-between gap-3 text-[13px]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="kumo-mono text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-[var(--color-kumo-recessed)] border border-[var(--color-kumo-line)]">
                                {pm.brand}
                              </span>
                              <span className="font-medium text-[var(--text-color-kumo-strong)]">
                                {pm.label}
                              </span>
                              <span className="text-[var(--text-color-kumo-subtle)] kumo-mono">
                                {pm.meta}
                              </span>
                            </div>
                            {pm.isDefault ? (
                              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[var(--color-kumo-fill)] text-[var(--text-color-kumo-default)]">
                                Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultPayment(pm.id)}
                                className="text-[12px] text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                              >
                                Make default
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Billing Tax Profile Card */}
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="m-0 text-[15px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Billing & VAT address
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsInitialTab("billing");
                          setActiveTab("settings");
                        }}
                        className="text-[13px] font-medium text-[var(--text-color-kumo-link)] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[13px] leading-[20px] text-[var(--text-color-kumo-subtle)] flex flex-col gap-0.5">
                      <strong className="font-semibold text-[var(--text-color-kumo-strong)]">
                        {activeBilling.company}
                      </strong>
                      <span>{activeBilling.line1}</span>
                      <span>{activeBilling.line2}</span>
                      <span>{activeBilling.country}</span>
                      <span className="pt-2 mt-2 border-t border-[var(--color-kumo-line)] kumo-mono text-[12px] text-[var(--text-color-kumo-default)]">
                        Tax ID: {activeBilling.taxId}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: SPEND LIMITS BETA */}
              {billingSubTab === "limits" && (
                <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-6 flex flex-col gap-4 max-w-[680px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="m-0 text-[16px] font-semibold text-[var(--text-color-kumo-strong)]">
                        Monthly credit spend limit
                      </h2>
                      <span className="rounded-full px-2 py-0.5 text-[11px] border border-dashed border-[var(--color-kumo-brand)] text-[var(--text-color-kumo-link)]">
                        Beta
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={spendLimitEnabled}
                      onClick={() => {
                        setSpendLimitEnabled((prev) => !prev);
                        showToast("Spend limit alert updated");
                      }}
                      className={`w-10 h-5 rounded-full border-0 p-0.5 cursor-pointer transition-colors flex items-center ${
                        spendLimitEnabled
                          ? "bg-[var(--color-kumo-brand)] justify-end"
                          : "bg-[var(--color-kumo-fill)] justify-start"
                      }`}
                    >
                      <span className="size-4 rounded-full bg-white shadow-2xs" />
                    </button>
                  </div>

                  <p className="m-0 text-[13px] text-[var(--text-color-kumo-subtle)]">
                    Receive an automatic webhook and email alert when monthly workspace credit consumption reaches 80% and 100% of your threshold.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <input
                      type="text"
                      value={spendLimitAmount}
                      onChange={(e) => setSpendLimitAmount(e.target.value)}
                      className="h-9 w-[160px] px-3 rounded-[8px] bg-white border border-[var(--color-kumo-line)] kumo-mono text-[14px] text-[var(--text-color-kumo-strong)] outline-none"
                    />
                    <span className="text-[13px] text-[var(--text-color-kumo-subtle)]">
                      credits / month
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Monthly spend limit saved (${spendLimitAmount} credits)`)
                      }
                      className="h-9 px-3.5 rounded-[8px] kumo-btn-primary text-[13px] font-medium cursor-pointer ml-auto"
                    >
                      Save threshold
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB 5: INVOICES (Exact match to Cloudflare Billing -> Invoices screenshot) */}
              {billingSubTab === "invoices" && (
                <div className="flex flex-col gap-4">
                  {/* Consolidated Invoice Notice Box */}
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] p-5 text-[14px] text-[var(--text-color-kumo-subtle)] flex flex-col gap-2">
                    <p className="m-0">
                      Onflow consolidates credit pack purchases and studio asset unlock statements within 24 hours of your order.
                    </p>
                    <p className="m-0">
                      For custom VAT adjustments or historical statements not listed, refer to our{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setSupportInitialTab("tickets");
                          setIsSupportOpen(true);
                        }}
                        className="text-[var(--text-color-kumo-link)] underline bg-transparent border-0 p-0 cursor-pointer text-[14px]"
                      >
                        Support Portal
                      </button>{" "}
                      for assistance.
                    </p>
                  </div>

                  {/* Filter Pill Row (`Status All` + `Export CSV`) */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative inline-flex items-center">
                      <Filter
                        size={13}
                        className="absolute left-3 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                      <select
                        value={txFilter}
                        onChange={(e) => setTxFilter(e.target.value as TxFilter)}
                        aria-label="Filter transactions by status"
                        className="h-9 pl-8 pr-8 rounded-[8px] bg-white border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] text-[var(--text-color-kumo-default)] outline-none cursor-pointer appearance-none"
                      >
                        <option value="all">Status: All</option>
                        <option value="purchase">Type: Credit top-ups</option>
                        <option value="spent">Type: Asset unlocks</option>
                        <option value="pending">Status: Pending</option>
                      </select>
                      <ChevronsUpDown
                        size={12}
                        className="absolute right-2.5 text-[var(--text-color-kumo-subtle)] pointer-events-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadStatementCsv}
                      className="h-9 px-3 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] text-[13px] font-medium text-[var(--text-color-kumo-default)] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileDown size={14} strokeWidth={1.5} />
                      <span>Download CSV</span>
                    </button>
                  </div>

                  {/* Cloudflare Kumo Invoices Table (`Date`, `Type`, `Number`, `Amount`, `Status`, Action) */}
                  <div className="bg-white rounded-[8px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-xs)] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="h-11 bg-[var(--color-kumo-canvas)] border-b border-[var(--color-kumo-line)] text-[13px] font-semibold text-[var(--text-color-kumo-strong)]">
                            <th className="py-2 px-4">Date</th>
                            <th className="py-2 px-4">Type</th>
                            <th className="py-2 px-4">Number</th>
                            <th className="py-2 px-4">Description</th>
                            <th className="py-2 px-4 text-right">Amount</th>
                            <th className="py-2 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-kumo-line)] text-[14px]">
                          {filteredTransactions.map((tx) => (
                            <tr
                              key={tx.id}
                              className="h-11 bg-white hover:bg-[var(--color-kumo-overlay)] transition-colors"
                            >
                              <td className="py-2.5 px-4 text-[var(--text-color-kumo-subtle)] whitespace-nowrap">
                                {tx.date}
                              </td>
                              <td className="py-2.5 px-4 text-[var(--text-color-kumo-default)] whitespace-nowrap">
                                {tx.typeLabel}
                              </td>
                              <td className="py-2.5 px-4 kumo-mono text-[13px] font-medium text-[var(--text-color-kumo-link)] whitespace-nowrap">
                                {tx.number}
                              </td>
                              <td className="py-2.5 px-4 text-[var(--text-color-kumo-default)]">
                                {tx.title}
                              </td>
                              <td
                                className={`py-2.5 px-4 text-right kumo-mono font-medium whitespace-nowrap ${
                                  tx.amount > 0
                                    ? "text-[var(--text-color-kumo-success)]"
                                    : "text-[var(--text-color-kumo-strong)]"
                                }`}
                              >
                                <span className="inline-flex items-center justify-end gap-1">
                                  <span>
                                    {tx.amount > 0
                                      ? `+${tx.amount.toLocaleString()}`
                                      : `${tx.amount.toLocaleString()}`}
                                  </span>
                                  <CreditIcon size={11} />
                                </span>
                              </td>
                              <td className="py-2.5 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 h-5 px-2 py-0.5 rounded-full border border-[var(--color-kumo-hairline)] text-[12px] font-medium text-[var(--text-color-kumo-default)]">
                                  <span
                                    className={`size-1.5 rounded-full ${
                                      tx.status === "Completed"
                                        ? "bg-[var(--color-kumo-success)]"
                                        : "bg-[var(--color-kumo-warning)]"
                                    }`}
                                  />
                                  <span>{tx.status}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ===================== TAB 5: ACCOUNT SETTINGS (Inline Right-Pane View) ===================== */}
        {activeTab === "settings" && (
          <main className="flex-1 px-4 sm:px-6 md:px-8 pt-6 pb-10">
            <SettingsOverlay
              isOpen={true}
              variant="page"
              onClose={() => setActiveTab("home")}
              initialTab={settingsInitialTab}
              onTabChange={(tab) => setSettingsInitialTab(tab)}
              userProfile={{
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                email: userProfile.email,
                bio: userProfile.bio,
                organization: userProfile.organization,
                avatarUrl: userProfile.avatarUrl,
              }}
              paymentMethods={paymentMethods}
              billingAddress={activeBilling}
              onSaveProfile={(updated) => {
                setUserProfile((prev) => ({ ...prev, ...updated }));
                showToast("Profile updated");
              }}
              onUpdatePaymentMethods={(next) => {
                setPaymentMethods(next);
              }}
              onSaveBillingAddress={(next) => {
                setOrgBillingOverrides((prev) => ({ ...prev, [activeOrg]: next }));
                showToast("Billing address saved");
              }}
            />
          </main>
        )}

        {/* Cloudflare Kumo 48px Footer (`min-h-12`, `border-t border-kumo-line`, horizontal utility links) */}
        <footer className="mt-auto min-h-[48px] bg-[var(--color-kumo-canvas)] border-t border-[var(--color-kumo-line)] px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--text-color-kumo-default)]">
          <button
            type="button"
            onClick={() => {
              setSupportInitialTab("knowledge");
              setIsSupportOpen(true);
            }}
            className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
          >
            Support
          </button>
          <span className="text-[var(--color-kumo-fill)]">|</span>
          <button
            type="button"
            onClick={() => showToast("All Onflow CDN & Bridge nodes operational")}
            className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
          >
            System Status
          </button>
          <span className="text-[var(--color-kumo-fill)]">|</span>
          <Link href="/" className="hover:underline text-[var(--text-color-kumo-default)] no-underline">
            3D Catalog
          </Link>
          <span className="text-[var(--color-kumo-fill)]">|</span>
          <button
            type="button"
            onClick={() => {
              setSettingsInitialTab("about");
              setActiveTab("settings");
            }}
            className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
          >
            Terms of Use
          </button>
          <span className="text-[var(--color-kumo-fill)]">|</span>
          <button
            type="button"
            onClick={() => {
              setSupportInitialTab("contact");
              setIsSupportOpen(true);
            }}
            className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
          >
            Report Security Issues
          </button>
          <span className="text-[var(--color-kumo-fill)]">|</span>
          <button
            type="button"
            onClick={() => {
              setSettingsInitialTab("security");
              setActiveTab("settings");
            }}
            className="hover:underline bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[var(--text-color-kumo-default)]"
          >
            Privacy Policy
          </button>
          <span className="text-[var(--color-kumo-fill)]">|</span>
          <span className="text-[var(--text-color-kumo-subtle)]">
            © 2026 Onflow Asia Co., Ltd.
          </span>
        </footer>
      </div>

      {/* Settings Modal Overlay */}
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
        userProfile={{
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          bio: userProfile.bio,
          organization: userProfile.organization,
          avatarUrl: userProfile.avatarUrl,
        }}
        paymentMethods={paymentMethods}
        billingAddress={activeBilling}
        onSaveProfile={(updated) => {
          setUserProfile((prev) => ({ ...prev, ...updated }));
          showToast("Profile updated");
        }}
        onUpdatePaymentMethods={(next) => {
          setPaymentMethods(next);
        }}
        onSaveBillingAddress={(next) => {
          setOrgBillingOverrides((prev) => ({ ...prev, [activeOrg]: next }));
          showToast("Billing address saved");
        }}
      />

      {/* Support Center Modal Overlay */}
      <SupportCenterOverlay
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        initialTab={supportInitialTab}
      />
    </div>
  );
}

export default function UserPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="kumo-portal min-h-screen bg-[var(--color-kumo-canvas)] flex items-center justify-center text-[13px] text-[var(--text-color-kumo-subtle)]">
          Loading dashboard...
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  );
}
