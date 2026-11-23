"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Box,
  ChevronRight,
  CreditCard,
  FileText,
  KeyRound,
  Paperclip,
  Scale,
  Search,
  Send,
  Wrench,
  X,
} from "lucide-react";

export type SupportTab = "knowledge" | "tickets" | "contact";

interface SupportCenterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SupportTab;
}

interface TicketMessage {
  sender: "you" | "support";
  text: string;
  time: string;
}

interface SupportTicket {
  id: string;
  title: string;
  updatedAt: string;
  status: "Open" | "Resolved" | "Closed";
  priority: "High" | "Medium" | "Low";
  category: string;
  messages: TicketMessage[];
}

const CATEGORIES = [
  { id: "getting-started", title: "Getting started", Icon: BookOpen },
  { id: "account-billing", title: "Billing & credits", Icon: CreditCard },
  { id: "3d-assets", title: "3D assets & PBR", Icon: Box },
  { id: "api-integrations", title: "Bridge & API", Icon: KeyRound },
  { id: "licensing", title: "Licensing", Icon: Scale },
  { id: "troubleshooting", title: "Troubleshooting", Icon: Wrench },
];

const ARTICLES = [
  {
    id: "export-3d",
    title: "How to export 3D models with linked PBR textures",
    category: "3d-assets",
    content:
      "Open Downloads, expand any owned asset, and pick your target geometry (High-poly or LOD0–LOD3), texture resolution (up to 8K PNG/EXR), and mesh format (FBX, OBJ, GLB, or USDZ). The archive bundles calibrated PBR maps mapped to standard material slots.",
  },
  {
    id: "pbr-calibration",
    title: "Using 16-bit displacement and roughness maps in UE5",
    category: "3d-assets",
    content:
      "All Onflow surfaces are captured with cross-polarized photogrammetry and calibrated for ACEScg. Set roughness and displacement textures to Linear / Non-Color space in Unreal Engine 5 or Blender.",
  },
  {
    id: "credit-usage",
    title: "How credits and free re-downloads work",
    category: "account-billing",
    content:
      "Credits are deducted once when you unlock an asset. After purchase, you can re-export any format, LOD level, or texture resolution from Downloads at zero additional credit cost.",
  },
  {
    id: "bridge-setup",
    title: "Connecting Onflow Bridge to Blender and Unreal Engine",
    category: "api-integrations",
    content:
      "Generate a personal API key from the Bridge API card in the portal sidebar, then paste it into the Onflow Bridge plugin preferences to stream assets directly into your scene.",
  },
  {
    id: "team-collab",
    title: "Sharing a credit pool across a studio organization",
    category: "getting-started",
    content:
      "Business workspaces share one credit balance and download archive. Switch between organizations from the top-left workspace switcher in the portal sidebar.",
  },
  {
    id: "commercial-license",
    title: "Standard vs Studio commercial licensing",
    category: "licensing",
    content:
      "Standard licenses cover commercial games, films, and architectural visualization for teams up to 10 seats. Studio licenses extend seat counts and allow custom raw point-cloud delivery.",
  },
  {
    id: "missing-textures",
    title: "Fixing missing texture links after importing FBX",
    category: "troubleshooting",
    content:
      "Extract the entire .zip archive before importing the FBX mesh so relative texture paths resolve automatically. In Blender, use File > External Data > Find Missing Files and select the /textures folder.",
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "T-2026-8901",
    title: "8K EXR displacement map export timeout",
    updatedAt: "2h ago",
    status: "Open",
    priority: "High",
    category: "3D assets & PBR",
    messages: [
      {
        sender: "you",
        text: "Exporting the 8K EXR bundle for White Marble Incense Burner timed out twice on Safari.",
        time: "3h ago",
      },
      {
        sender: "support",
        text: "We verified the archive checksum and re-queued the CDN edge cache for your region. Please retry the 8K export and let us know if it completes.",
        time: "2h ago",
      },
    ],
  },
  {
    id: "T-2026-8842",
    title: "VAT invoice adjustment for November top-up",
    updatedAt: "2d ago",
    status: "Resolved",
    priority: "Medium",
    category: "Billing & credits",
    messages: [
      {
        sender: "you",
        text: "Please include our updated Vietnam Tax ID on invoice INV-2026-1119.",
        time: "3d ago",
      },
      {
        sender: "support",
        text: "Updated Tax ID VN-0318294012 on your billing profile and regenerated the invoice.",
        time: "2d ago",
      },
    ],
  },
  {
    id: "T-2026-8721",
    title: "USDZ scale factor in Apple Reality Composer",
    updatedAt: "1w ago",
    status: "Closed",
    priority: "Low",
    category: "Troubleshooting",
    messages: [
      {
        sender: "you",
        text: "Are USDZ exports authored in meters or centimeters?",
        time: "1w ago",
      },
      {
        sender: "support",
        text: "All USDZ exports use metersPerUnit = 0.01 (centimeters) with real-world scanned dimensions.",
        time: "1w ago",
      },
    ],
  },
];

export default function SupportCenterOverlay({
  isOpen,
  onClose,
  initialTab = "knowledge",
}: SupportCenterOverlayProps) {
  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Knowledge base
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(
    "export-3d"
  );

  // Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Resolved" | "Closed">("All");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>("T-2026-8901");
  const [replyDraft, setReplyDraft] = useState("");

  // Contact form
  const [issueCategory, setIssueCategory] = useState("3D assets & PBR");
  const [priorityLevel, setPriorityLevel] = useState<"High" | "Medium" | "Low">("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const filteredArticles = ARTICLES.filter((art) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.content.toLowerCase().includes(q);
    const matchesCategory = !selectedCategory || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTickets = tickets.filter((t) =>
    statusFilter === "All" ? true : t.status === statusFilter
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast("Enter both a subject and description");
      return;
    }
    const newTicket: SupportTicket = {
      id: `T-2026-${Math.floor(8910 + Math.random() * 900)}`,
      title: subject.trim(),
      updatedAt: "Just now",
      status: "Open",
      priority: priorityLevel,
      category: issueCategory,
      messages: [
        {
          sender: "you",
          text: attachedFileName
            ? `${description.trim()} (Attachment: ${attachedFileName})`
            : description.trim(),
          time: "Just now",
        },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
    setExpandedTicketId(newTicket.id);
    setSubject("");
    setDescription("");
    setAttachedFileName(null);
    showToast(`Ticket ${newTicket.id} created`);
    setActiveTab("tickets");
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyDraft.trim()) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: "Just now",
              status: t.status === "Closed" ? "Open" : t.status,
              messages: [
                ...t.messages,
                { sender: "you", text: replyDraft.trim(), time: "Just now" },
              ],
            }
          : t
      )
    );
    setReplyDraft("");
    showToast("Reply posted");
  };

  const handleToggleTicketStatus = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: t.status === "Open" ? "Resolved" : "Open",
              updatedAt: "Just now",
            }
          : t
      )
    );
    showToast("Ticket status updated");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#141926]/45 p-4"
      onClick={onClose}
    >
      <div
        className="kumo-portal bg-[var(--color-kumo-canvas)] flex flex-col h-[640px] max-h-[90vh] w-[780px] max-w-full overflow-hidden relative rounded-[12px] border border-[var(--color-kumo-line)] shadow-[var(--shadow-kumo-md)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Support"
      >
        {toastMsg && (
          <div className="absolute top-4 right-16 z-30 bg-[var(--text-color-kumo-strong)] text-white text-[12px] font-medium px-3 py-1.5 rounded-[8px] shadow-sm">
            {toastMsg}
          </div>
        )}

        {/* Header */}
        <div className="h-[58px] shrink-0 w-full flex items-center justify-between px-6 border-b border-[var(--color-kumo-line)] bg-[var(--color-kumo-canvas)]">
          <div className="flex items-baseline gap-2.5">
            <h2 className="m-0 font-semibold text-[18px] leading-[24px] text-[var(--text-color-kumo-strong)]">
              Support Portal
            </h2>
            <span className="text-[12px] text-[var(--text-color-kumo-subtle)] hidden sm:inline">
              Documentation, tickets, and pipeline assistance
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-[8px] bg-white hover:bg-[var(--color-kumo-tint)] border border-[var(--color-kumo-line)] flex items-center justify-center text-[var(--text-color-kumo-subtle)] hover:text-[var(--text-color-kumo-default)] cursor-pointer transition-colors duration-150"
            aria-label="Close support"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Kumo Segmented Pill Tabs */}
        <div className="border-b border-[var(--color-kumo-line)] py-2.5 shrink-0 w-full flex items-center px-6 bg-[var(--color-kumo-canvas)]">
          <div
            role="tablist"
            className="inline-flex items-center h-9 rounded-[8px] bg-[var(--color-kumo-recessed)] p-0.5 gap-0.5"
          >
            {[
              { id: "knowledge" as const, label: "Knowledge base" },
              { id: "tickets" as const, label: `My tickets (${tickets.length})` },
              { id: "contact" as const, label: "New request" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-8 px-3 rounded-[6px] border-0 cursor-pointer text-[13px] transition-colors duration-150 ${
                    isActive
                      ? "bg-white text-[var(--text-color-kumo-strong)] font-medium shadow-[var(--shadow-kumo-xs)]"
                      : "bg-transparent text-[var(--text-color-kumo-subtle)] font-normal hover:text-[var(--text-color-kumo-default)]"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto p-6">
          {/* TAB 1: KNOWLEDGE BASE */}
          {activeTab === "knowledge" && (
            <div className="flex flex-col gap-6">
              {/* Search */}
              <div className="relative flex items-center h-10 bg-[#f5f6f8] border border-[#141926]/10 focus-within:bg-white focus-within:border-[#004bda] rounded-[8px] px-3 gap-2 transition-colors duration-150">
                <Search size={15} strokeWidth={1.5} className="text-[#6c7488] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides, formats, or billing"
                  className="bg-transparent border-0 outline-none w-full text-[13px] text-[#141926] placeholder:text-[#6c7488]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="text-[#6c7488] hover:text-[#141926] bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="m-0 font-medium text-[14px] text-[#141926]">
                    Topics
                  </h3>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="text-[12px] font-medium text-[#004bda] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Clear topic
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const Icon = cat.Icon;
                    const count = ARTICLES.filter((a) => a.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(isSelected ? null : cat.id)
                        }
                        className={`text-left p-3 rounded-[10px] border flex items-center justify-between gap-2 cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? "border-[#004bda] bg-[#eef3ff]/60"
                            : "border-[#141926]/10 bg-white hover:bg-[#f5f6f8]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            size={16}
                            strokeWidth={1.5}
                            className={isSelected ? "text-[#004bda] shrink-0" : "text-[#6c7488] shrink-0"}
                          />
                          <span className="text-[13px] font-medium text-[#141926] truncate">
                            {cat.title}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums text-[11px] text-[#6c7488] shrink-0">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Articles */}
              <div className="flex flex-col gap-2.5">
                <h3 className="m-0 font-medium text-[14px] text-[#141926]">
                  Articles
                </h3>
                {filteredArticles.length === 0 ? (
                  <p className="m-0 py-8 text-center text-[13px] text-[#6c7488]">
                    No articles match your search
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredArticles.map((art) => {
                      const isExpanded = expandedArticleId === art.id;
                      return (
                        <div
                          key={art.id}
                          className="bg-white border border-[#141926]/10 rounded-[10px] overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedArticleId(isExpanded ? null : art.id)
                            }
                            className="w-full px-3.5 py-3 flex items-center justify-between gap-3 bg-transparent border-0 text-left hover:bg-[#f5f6f8] cursor-pointer transition-colors duration-150"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText
                                size={15}
                                strokeWidth={1.5}
                                className="text-[#6c7488] shrink-0"
                              />
                              <span className="text-[13px] font-medium text-[#141926]">
                                {art.title}
                              </span>
                            </div>
                            <ChevronRight
                              size={15}
                              strokeWidth={1.5}
                              className={`text-[#6c7488] shrink-0 transition-transform duration-150 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="px-4 py-3 border-t border-[#141926]/8 bg-[#f5f6f8] text-[13px] leading-[20px] text-[#4e5669]">
                              {art.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY TICKETS */}
          {activeTab === "tickets" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {(["All", "Open", "Resolved", "Closed"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`h-8 px-3 rounded-[8px] text-[12px] border cursor-pointer transition-colors duration-150 ${
                        statusFilter === st
                          ? "bg-[#141926] text-white border-[#141926]"
                          : "bg-[#f5f6f8] text-[#4e5669] border-[#141926]/10 hover:text-[#141926]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("contact")}
                  className="h-8 px-3 rounded-[8px] bg-[#004bda] hover:bg-[#003db3] text-white text-[12px] font-medium border-0 cursor-pointer transition-colors duration-150"
                >
                  New ticket
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {filteredTickets.map((ticket) => {
                  const isExpanded = expandedTicketId === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      className="bg-white border border-[#141926]/10 rounded-[10px] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTicketId(isExpanded ? null : ticket.id)
                        }
                        className="w-full px-4 py-3 flex items-center justify-between gap-3 bg-transparent border-0 text-left hover:bg-[#f5f6f8] cursor-pointer transition-colors duration-150"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#6c7488]">
                              {ticket.id}
                            </span>
                            <span className="text-[11px] text-[#6c7488]">
                              · {ticket.category}
                            </span>
                          </div>
                          <p className="m-0 text-[13px] font-medium text-[#141926] mt-0.5 truncate">
                            {ticket.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`font-mono text-[11px] ${
                              ticket.status === "Open"
                                ? "text-[#004bda]"
                                : ticket.status === "Resolved"
                                ? "text-[#16a34a]"
                                : "text-[#6c7488]"
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <span className="font-mono text-[11px] text-[#6c7488]">
                            {ticket.updatedAt}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-3 border-t border-[#141926]/8 bg-[#f5f6f8] flex flex-col gap-3">
                          <div className="flex flex-col gap-2">
                            {ticket.messages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-[8px] text-[13px] leading-[19px] ${
                                  msg.sender === "you"
                                    ? "bg-white border border-[#141926]/10 text-[#141926]"
                                    : "bg-[#eef3ff]/70 border border-[#004bda]/15 text-[#141926]"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] text-[#6c7488] mb-1">
                                  <span className="font-medium text-[#4e5669]">
                                    {msg.sender === "you" ? "You" : "Onflow support"}
                                  </span>
                                  <span className="font-mono">{msg.time}</span>
                                </div>
                                <p className="m-0">{msg.text}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={replyDraft}
                              onChange={(e) => setReplyDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSendReply(ticket.id);
                                }
                              }}
                              placeholder="Write a reply"
                              className="flex-1 min-w-[180px] h-9 px-3 rounded-[8px] bg-white border border-[#141926]/10 focus:border-[#004bda] outline-none text-[13px] text-[#141926]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendReply(ticket.id)}
                              className="h-9 px-3 rounded-[8px] bg-[#004bda] hover:bg-[#003db3] text-white text-[12px] font-medium border-0 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send size={13} strokeWidth={1.5} />
                              <span>Reply</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleTicketStatus(ticket.id)}
                              className="h-9 px-3 rounded-[8px] bg-white hover:bg-[#eef0f4] border border-[#141926]/10 text-[12px] font-medium text-[#141926] cursor-pointer"
                            >
                              {ticket.status === "Open" ? "Mark resolved" : "Reopen"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: NEW REQUEST */}
          {activeTab === "contact" && (
            <form onSubmit={handleSubmitTicket} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-[#4e5669]">
                    Topic
                  </span>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="h-10 px-3 rounded-[8px] border border-[#141926]/10 bg-white text-[13px] text-[#141926] outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-[#4e5669]">
                    Priority
                  </span>
                  <select
                    value={priorityLevel}
                    onChange={(e) =>
                      setPriorityLevel(e.target.value as "High" | "Medium" | "Low")
                    }
                    className="h-10 px-3 rounded-[8px] border border-[#141926]/10 bg-white text-[13px] text-[#141926] outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#4e5669]">
                  Subject
                </span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary of the issue"
                  className="h-10 px-3 rounded-[8px] border border-[#141926]/10 focus:border-[#004bda] outline-none text-[14px] text-[#141926]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#4e5669]">
                  Description
                </span>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include asset ID, software version, or order code"
                  className="p-3 rounded-[8px] border border-[#141926]/10 focus:border-[#004bda] outline-none text-[14px] text-[#141926] resize-none"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#141926]/8">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setAttachedFileName(f.name);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3 rounded-[8px] bg-[#f5f6f8] hover:bg-[#eef0f4] border border-[#141926]/10 text-[12px] font-medium text-[#141926] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Paperclip size={14} strokeWidth={1.5} className="text-[#6c7488]" />
                    <span>Attach file</span>
                  </button>
                  {attachedFileName && (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#4e5669]">
                      <span>{attachedFileName}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFileName(null)}
                        aria-label="Remove attachment"
                        className="text-[#6c7488] hover:text-[#dc2626] bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="h-9 px-4 rounded-[8px] bg-[#004bda] hover:bg-[#003db3] text-white text-[13px] font-medium border-0 cursor-pointer transition-colors duration-150"
                >
                  Submit request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
