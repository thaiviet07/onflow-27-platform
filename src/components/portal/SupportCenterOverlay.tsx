"use client";

import React, { useState } from "react";

export type SupportTab = "knowledge" | "tickets" | "contact";

interface SupportCenterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SupportTab;
}

interface SupportTicket {
  id: string;
  title: string;
  updatedAt: string;
  status: "Open" | "Resolved" | "Closed";
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  category: string;
}

const CATEGORIES = [
  { id: "getting-started", title: "Getting Started", count: "12 articles", bg: "bg-[#e3f2fd]", color: "#004bda" },
  { id: "account-billing", title: "Account & Billing", count: "8 articles", bg: "bg-[#e8f5e9]", color: "#007f5f" },
  { id: "3d-assets", title: "3D Assets & Formats", count: "24 articles", bg: "bg-[#f3e5f5]", color: "#8e44ad" },
  { id: "api-integrations", title: "API & Integrations", count: "15 articles", bg: "bg-[#fff3e0]", color: "#e67e22" },
  { id: "licensing", title: "Licensing & Legal", count: "6 articles", bg: "bg-[#fce4ec]", color: "#e91e63" },
  { id: "troubleshooting", title: "Troubleshooting", count: "19 articles", bg: "bg-[#e0f7fa]", color: "#0097a7" },
];

const ARTICLES = [
  {
    id: "export-3d",
    title: "How to export 3D models with textures?",
    category: "3d-assets",
    content:
      "When downloading from the Download Center, select your preferred Texture Resolution (up to 4K PNG 16-bit) and Object Format (FBX, OBJ, GLTF, or USDZ). The archive (.ZIP) bundles all PBR texture maps automatically linked to the material slots.",
  },
  {
    id: "credit-usage",
    title: "Understanding credit usage and billing cycles",
    category: "account-billing",
    content:
      "Credits are deducted only on your first purchase of an asset or LOD package. Once owned, you can re-download any format or resolution from your Download Center at zero additional credit cost.",
  },
  {
    id: "figma-plugin",
    title: "Setting up the Figma plugin for the first time",
    category: "api-integrations",
    content:
      "Generate a personal developer token from the Left Panel API Integrations card, then paste it into the Onflow Bridge plugin for Blender, Unreal Engine, or Figma to import 3D assets directly into your scene.",
  },
  {
    id: "team-collab",
    title: "Collaborating with team members on a project",
    category: "getting-started",
    content:
      "Business and Developer accounts share an organization credit pool and asset library. All team downloads appear in real-time under Team Activity on your Portal Home.",
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "T-2026-8901",
    title: "Unable to download 4K textures",
    updatedAt: "Last updated 2 hours ago",
    status: "Open",
    priority: "High Priority",
    category: "Download & Asset Issue",
  },
  {
    id: "T-2026-8842",
    title: "Billing inquiry for March",
    updatedAt: "Last updated 2 days ago",
    status: "Resolved",
    priority: "Medium Priority",
    category: "Billing & Credits",
  },
  {
    id: "T-2026-8721",
    title: "Feature request: Dark mode export",
    updatedAt: "Last updated 1 week ago",
    status: "Closed",
    priority: "Low Priority",
    category: "Feature Request",
  },
];

export default function SupportCenterOverlay({
  isOpen,
  onClose,
  initialTab = "knowledge",
}: SupportCenterOverlayProps) {
  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);

  // Knowledge base state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Resolved" | "Closed">("All");

  // Contact form state
  const [issueCategory, setIssueCategory] = useState("Technical Support");
  const [priorityLevel, setPriorityLevel] = useState("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesSearch =
      !searchQuery.trim() ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTickets = tickets.filter((t) =>
    statusFilter === "All" ? true : t.status === statusFilter
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast("Please enter a subject for your request.");
      return;
    }
    const newTicket: SupportTicket = {
      id: `T-2026-${Math.floor(8910 + Math.random() * 900)}`,
      title: subject.trim(),
      updatedAt: "Just now",
      status: "Open",
      priority:
        priorityLevel === "High" || priorityLevel === "Critical"
          ? "High Priority"
          : priorityLevel === "Low"
          ? "Low Priority"
          : "Medium Priority",
      category: issueCategory,
    };
    setTickets((prev) => [newTicket, ...prev]);
    setSubject("");
    setDescription("");
    setAttachedFile(null);
    showToast(`Ticket ${newTicket.id} submitted!`);
    setActiveTab("tickets");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white flex flex-col h-[650px] max-h-[92vh] w-[800px] max-w-full overflow-hidden relative rounded-[20px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
        data-node-id="1220:13818"
      >
        {toastMsg && (
          <div className="absolute top-[28px] right-[80px] z-30 bg-[#19213d] text-white text-[12px] font-medium px-[14px] py-[6px] rounded-[8px] shadow-md">
            {toastMsg}
          </div>
        )}

        {/* Header */}
        <div className="h-[109px] shrink-0 w-full flex items-center justify-between px-[32px]">
          <div className="flex flex-col gap-[4px]">
            <h2 className="font-['Manrope',sans-serif] font-medium leading-[36px] text-[#19213d] text-[24px]">
              Support Center
            </h2>
            <p className="font-['Manrope',sans-serif] font-normal leading-[21px] text-[14px] text-[rgba(25,33,61,0.6)]">
              We&apos;re here to help you with any questions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#f2f4f7] hover:bg-[#e4e7ec] transition-colors rounded-full size-[32px] flex items-center justify-center cursor-pointer"
            aria-label="Close Support Center"
          >
            <img alt="Close" className="size-[16px]" src="/assets/portal/b87f2.svg" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-[#eaecf0] border-b border-solid h-[38px] shrink-0 w-full flex items-center gap-[32px] px-[32px]">
          {[
            { id: "knowledge" as const, label: "Knowledge Base" },
            { id: "tickets" as const, label: "My Tickets" },
            { id: "contact" as const, label: "Contact Support" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative h-[37px] flex items-start cursor-pointer"
              >
                <span
                  className={`font-['Manrope',sans-serif] font-medium leading-[21px] text-[14px] transition-colors ${
                    isActive ? "text-[#19213d]" : "text-[rgba(25,33,61,0.5)] hover:text-[#19213d]"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bg-[#19213d] h-[2px] left-0 right-0 bottom-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto pt-[24px] px-[32px] pb-[24px]">
          {/* TAB 1: KNOWLEDGE BASE */}
          {activeTab === "knowledge" && (
            <div className="flex flex-col gap-[24px]">
              {/* Search Bar */}
              <div className="relative h-[50px] w-full">
                <div className="absolute left-[16px] top-0 h-[50px] flex items-center pointer-events-none">
                  <img alt="" className="size-[20px]" src="/assets/portal/3f128.svg" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, guides, and more..."
                  className="bg-white border border-[#eaecf0] focus:border-[#004bda] outline-none h-[50px] w-full pl-[44px] pr-[16px] py-[12px] rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] font-['Manrope',sans-serif] text-[16px] text-[#19213d] placeholder:text-[rgba(25,33,61,0.4)]"
                />
              </div>

              {/* Browse by Category */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                    Browse by Category
                  </h3>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="text-[12px] font-medium text-[#004bda] hover:underline cursor-pointer"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(isSelected ? null : cat.id)
                        }
                        className={`bg-white border text-left p-[17px] rounded-[12px] flex flex-col gap-[12px] transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#004bda] ring-1 ring-[#004bda]"
                            : "border-[#eaecf0] hover:border-[#c9c9c9]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`${cat.bg} size-[36px] rounded-[8px] flex items-center justify-center`}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path
                                d="M2.25 4.5C2.25 3.67157 2.92157 3 3.75 3H7.5L9 4.5H14.25C15.0784 4.5 15.75 5.17157 15.75 6V13.5C15.75 14.3284 15.0784 15 14.25 15H3.75C2.92157 15 2.25 14.3284 2.25 13.5V4.5Z"
                                stroke={cat.color}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <img alt="" className="size-[16px]" src="/assets/portal/88afe.svg" />
                        </div>
                        <div>
                          <p className="font-['Manrope',sans-serif] font-bold leading-[21px] text-[#19213d] text-[14px]">
                            {cat.title}
                          </p>
                          <p className="font-['Manrope',sans-serif] font-normal leading-[18px] text-[12px] text-[rgba(25,33,61,0.5)]">
                            {cat.count}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Popular Articles */}
              <div className="flex flex-col gap-[12px]">
                <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                  Popular Articles
                </h3>
                <div className="flex flex-col gap-[8px]">
                  {filteredArticles.map((art) => {
                    const isExpanded = expandedArticleId === art.id;
                    return (
                      <div
                        key={art.id}
                        className="bg-white border border-[#eaecf0] rounded-[10px] overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedArticleId(isExpanded ? null : art.id)
                          }
                          className="h-[47px] w-full px-[13px] flex items-center justify-between hover:bg-[#f8f9fa] cursor-pointer"
                        >
                          <span className="font-['Manrope',sans-serif] font-medium leading-[21px] text-[#19213d] text-[14px]">
                            {art.title}
                          </span>
                          <img
                            alt=""
                            className={`size-[16px] transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                            src="/assets/portal/88afe.svg"
                          />
                        </button>
                        {isExpanded && (
                          <div className="px-[16px] pb-[14px] pt-[4px] border-t border-[#f2f4f7] bg-[#f8f9fa] font-['Manrope',sans-serif] text-[13px] leading-[20px] text-[rgba(25,33,61,0.75)]">
                            {art.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY TICKETS */}
          {activeTab === "tickets" && (
            <div className="flex flex-col gap-[20px]">
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[12px]">
                  <h3 className="font-['Manrope',sans-serif] font-bold leading-[24px] text-[#19213d] text-[16px]">
                    Your Support Tickets
                  </h3>
                  <div className="flex items-center gap-[6px]">
                    {(["All", "Open", "Resolved", "Closed"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-[10px] py-[3px] rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                          statusFilter === st
                            ? "bg-[#19213d] text-white"
                            : "bg-[#f2f4f7] text-[rgba(25,33,61,0.7)] hover:bg-[#e5e7eb]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("contact")}
                  className="bg-[#004bda] hover:bg-[#003cb3] transition-colors h-[35.5px] px-[16px] rounded-[8px] font-['Manrope',sans-serif] font-medium text-[13px] text-white cursor-pointer"
                >
                  New Ticket
                </button>
              </div>

              {/* Ticket Cards */}
              <div className="flex flex-col gap-[12px]">
                {filteredTickets.map((ticket) => {
                  const isOpenStatus = ticket.status === "Open";
                  const isResolved = ticket.status === "Resolved";
                  return (
                    <div
                      key={ticket.id}
                      className="bg-white border border-[#eaecf0] h-[94px] rounded-[12px] px-[21px] flex items-center justify-between hover:border-[#c9c9c9] transition-colors"
                    >
                      <div className="flex items-center gap-[16px]">
                        <div
                          className={`size-[40px] rounded-full flex items-center justify-center shrink-0 ${
                            isOpenStatus
                              ? "bg-[#fff8e6]"
                              : isResolved
                              ? "bg-[#e6fffa]"
                              : "bg-[#f2f4f7]"
                          }`}
                        >
                          <img
                            alt=""
                            className="size-[20px]"
                            src={
                              isOpenStatus
                                ? "/assets/portal/e2ccf.svg"
                                : isResolved
                                ? "/assets/portal/80193.svg"
                                : "/assets/portal/b2651.svg"
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-[4px]">
                          <h4 className="font-['Manrope',sans-serif] font-medium leading-[22.5px] text-[#19213d] text-[15px]">
                            {ticket.title}
                          </h4>
                          <div className="flex items-center gap-[12px]">
                            <span className="font-mono text-[13px] text-[rgba(25,33,61,0.6)]">
                              {ticket.id}
                            </span>
                            <span className="bg-[rgba(25,33,61,0.3)] size-[4px] rounded-full" />
                            <span className="font-['Manrope',sans-serif] text-[13px] text-[rgba(25,33,61,0.6)]">
                              {ticket.updatedAt}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-[8px]">
                        <span
                          className={`px-[10px] py-[4px] rounded-[6px] font-['Manrope',sans-serif] font-bold text-[12px] leading-[18px] ${
                            isOpenStatus
                              ? "bg-[#fff8e6] text-[#b78103]"
                              : isResolved
                              ? "bg-[#e6fffa] text-[#007f5f]"
                              : "bg-[#f2f4f7] text-[rgba(25,33,61,0.6)]"
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <span className="font-['Manrope',sans-serif] font-medium text-[12px] text-[rgba(25,33,61,0.5)]">
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT SUPPORT */}
          {activeTab === "contact" && (
            <form onSubmit={handleSubmitTicket} className="flex flex-col justify-between h-full gap-[20px]">
              <div className="flex flex-col gap-[18px]">
                {/* Info Banner */}
                <div className="bg-[#f8f9fa] border border-[#eaecf0] rounded-[12px] px-[17px] py-[14px] flex items-center gap-[12px]">
                  <img alt="" className="size-[20px] shrink-0" src="/assets/portal/e2cd0.svg" />
                  <p className="font-['Manrope',sans-serif] text-[13px] leading-[19.5px] text-[rgba(25,33,61,0.7)]">
                    Our support team typically responds within{" "}
                    <span className="font-bold text-[#19213d]">2-4 business hours</span>. For urgent
                    issues, please select &quot;High&quot; priority.
                  </p>
                </div>

                {/* Dropdowns Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="font-['Manrope',sans-serif] font-medium text-[13px] text-[rgba(25,33,61,0.7)]">
                      Issue Category
                    </label>
                    <div className="relative">
                      <select
                        value={issueCategory}
                        onChange={(e) => setIssueCategory(e.target.value)}
                        className="appearance-none bg-white border border-[#eaecf0] focus:border-[#004bda] outline-none h-[43px] w-full rounded-[8px] px-[16px] pr-[36px] font-['Manrope',sans-serif] text-[14px] text-[#19213d] cursor-pointer"
                      >
                        <option value="Technical Support">Technical Support</option>
                        <option value="Billing & Credits">Billing & Credits</option>
                        <option value="Download & Asset Issue">Download & Asset Issue</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Other">Other</option>
                      </select>
                      <img
                        alt=""
                        src="/assets/portal/21533.svg"
                        className="absolute right-[14px] top-[13.5px] size-[16px] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="font-['Manrope',sans-serif] font-medium text-[13px] text-[rgba(25,33,61,0.7)]">
                      Priority Level
                    </label>
                    <div className="relative">
                      <select
                        value={priorityLevel}
                        onChange={(e) => setPriorityLevel(e.target.value)}
                        className="appearance-none bg-white border border-[#eaecf0] focus:border-[#004bda] outline-none h-[43px] w-full rounded-[8px] px-[16px] pr-[36px] font-['Manrope',sans-serif] text-[14px] text-[#19213d] cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <img
                        alt=""
                        src="/assets/portal/21533.svg"
                        className="absolute right-[14px] top-[13.5px] size-[16px] pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-['Manrope',sans-serif] font-medium text-[13px] text-[rgba(25,33,61,0.7)]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className="border border-[#eaecf0] focus:border-[#004bda] outline-none h-[43px] w-full rounded-[8px] px-[16px] font-['Manrope',sans-serif] text-[14px] text-[#19213d] placeholder:text-[rgba(25,33,61,0.5)]"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-[6px]">
                  <label className="font-['Manrope',sans-serif] font-medium text-[13px] text-[rgba(25,33,61,0.7)]">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    className="border border-[#eaecf0] focus:border-[#004bda] outline-none w-full rounded-[8px] px-[16px] py-[10px] font-['Manrope',sans-serif] text-[14px] text-[#19213d] placeholder:text-[rgba(25,33,61,0.5)] resize-none"
                  />
                </div>

                {/* Attachment */}
                <div className="flex items-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => setAttachedFile("diagnostic_log_2026.zip")}
                    className="flex items-center gap-[8px] font-['Manrope',sans-serif] font-bold text-[13px] text-[#004bda] hover:underline cursor-pointer"
                  >
                    <img alt="" className="size-[16px]" src="/assets/portal/99133.svg" />
                    <span>Attach screenshots or files</span>
                  </button>
                  {attachedFile && (
                    <span className="bg-[#f2f4f7] px-[10px] py-[2px] rounded-[6px] text-[12px] text-[#19213d] flex items-center gap-[6px]">
                      {attachedFile}
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-[#eb5757] font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-[#eaecf0] pt-[16px] flex justify-end">
                <button
                  type="submit"
                  className="bg-[#004bda] hover:bg-[#003cb3] transition-colors h-[41px] px-[24px] rounded-[8px] flex items-center gap-[10px] font-['Manrope',sans-serif] font-bold text-[14px] text-white shadow-xs cursor-pointer"
                >
                  <img alt="" className="size-[16px]" src="/assets/portal/af7ac.svg" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
