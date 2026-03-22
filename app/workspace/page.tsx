"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart2,
  ChevronDown,
  FileText,
  Paperclip,
  Settings,
  Sliders,
  Star,
  TrendingUp,
  Users,
  Zap,
  ArrowUp,
  Plus,
  BookOpen,
  Lightbulb,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = "empty" | "loading" | "report"

const LOADING_STEPS = [
  "Scanning competitors…",
  "Sizing the market…",
  "Finding investors…",
  "Building your report…",
]

const RECENT_VALIDATIONS = [
  "AI customer support bot for SMBs",
  "B2B SaaS for restaurant inventory",
  "No-code mobile app builder",
]

const NAV_ITEMS = [
  { icon: Zap, label: "Validate Idea", active: true },
  { icon: FileText, label: "My Reports" },
  { icon: Star, label: "Saved Ideas" },
]

const QUICK_TABS = ["Validate Idea", "Research Market", "Find Investors"] as const

const FEATURE_CARDS = [
  {
    icon: BarChart2,
    title: "Market Analysis",
    desc: "TAM/SAM/SOM breakdown with growth projections",
  },
  {
    icon: TrendingUp,
    title: "Competitor Intel",
    desc: "Identify threats, gaps, and positioning opportunities",
  },
  {
    icon: Users,
    title: "Investor Match",
    desc: "Find VCs and angels actively funding your space",
  },
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ onNewValidation }: { onNewValidation: () => void }) {
  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[280px] flex flex-col border-r z-20"
      style={{ background: "#111111", borderColor: "#222222" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "#222222" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0"
          style={{ background: "#E8450A" }}
        >
          V
        </div>
        <span className="font-semibold text-white text-base tracking-tight">ValidateIQ</span>
      </div>

      {/* New Validation */}
      <div className="px-4 py-4">
        <button
          onClick={onNewValidation}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-white text-sm transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#E8450A" }}
        >
          <Plus size={15} />
          New Validation
        </button>
      </div>

      {/* Nav */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555555" }}>
          Features
        </p>
        <nav className="flex flex-col gap-0.5 mb-6">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors w-full group"
              style={{
                background: active ? "rgba(232,69,10,0.12)" : "transparent",
                color: active ? "#E8450A" : "#888888",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#1A1A1A"
                  e.currentTarget.style.color = "#FFFFFF"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#888888"
                }
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555555" }}>
          Workspaces
        </p>
        <div className="flex flex-col gap-0.5">
          {RECENT_VALIDATIONS.map((name) => (
            <button
              key={name}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors w-full"
              style={{ color: "#888888" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1A1A1A"
                e.currentTarget.style.color = "#FFFFFF"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "#888888"
              }}
            >
              <BookOpen size={13} className="shrink-0" />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User + Upgrade */}
      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "#222222" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
            style={{ background: "#2A2A2A" }}
          >
            D
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">Dhwanil</p>
            <p className="text-xs truncate" style={{ color: "#555555" }}>
              Free plan
            </p>
          </div>
        </div>
        <div className="rounded-lg p-3 border" style={{ background: "#0F0F0F", borderColor: "#2A2A2A" }}>
          <p className="text-xs font-medium text-white mb-1">Upgrade to Pro</p>
          <p className="text-xs mb-3" style={{ color: "#666666" }}>
            Unlimited validations + AI reports
          </p>
          <button
            className="w-full py-1.5 rounded-md text-xs font-medium text-white transition-all hover:brightness-110"
            style={{ background: "#E8450A" }}
          >
            Upgrade →
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div
      className="h-14 flex items-center justify-between px-6 border-b shrink-0"
      style={{ borderColor: "#222222" }}
    >
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium text-white transition-colors hover:border-[#333]"
        style={{ borderColor: "#222222", background: "#111111" }}
      >
        <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />
        Perplexity Sonar Pro
        <ChevronDown size={13} style={{ color: "#555555" }} />
      </button>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:border-[#333]"
          style={{ borderColor: "#222222", color: "#888888", background: "transparent" }}
        >
          <Settings size={13} />
          Configuration
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:border-[#333]"
          style={{ borderColor: "#222222", color: "#888888", background: "transparent" }}
        >
          <FileText size={13} />
          Export
        </button>
      </div>
    </div>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ step }: { step: number }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#E8450A", borderRightColor: "rgba(232,69,10,0.3)" }}
        />
        <div
          className="absolute inset-2 rounded-full border border-transparent animate-spin"
          style={{
            borderTopColor: "rgba(232,69,10,0.5)",
            animationDirection: "reverse",
            animationDuration: "0.8s",
          }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col items-center gap-3">
        {LOADING_STEPS.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-2.5 text-sm transition-all duration-500"
            style={{
              color: i < step ? "#E8450A" : i === step ? "#FFFFFF" : "#333333",
              opacity: i > step + 1 ? 0.3 : 1,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500"
              style={{
                background: i < step ? "#E8450A" : i === step ? "#FFFFFF" : "#333333",
              }}
            />
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Empty / Input State ──────────────────────────────────────────────────────

function EmptyState({
  idea,
  onIdeaChange,
  onSubmit,
}: {
  idea: string
  onIdeaChange: (v: string) => void
  onSubmit: () => void
}) {
  const [activeTab, setActiveTab] = useState<(typeof QUICK_TABS)[number]>("Validate Idea")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (idea.trim()) onSubmit()
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
          Ready to Validate Something New?
        </h1>
        <p className="text-sm" style={{ color: "#666666" }}>
          Describe your idea below and get a full market report in 60 seconds.
        </p>
      </div>

      {/* Tab pills */}
      <div
        className="flex items-center gap-1 p-1 rounded-lg mb-6 border"
        style={{ background: "#111111", borderColor: "#222222" }}
      >
        {QUICK_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === tab ? "#E8450A" : "transparent",
              color: activeTab === tab ? "#FFFFFF" : "#888888",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div
        className="w-full rounded-xl border overflow-hidden mb-4"
        style={{ background: "#111111", borderColor: "#222222" }}
      >
        <textarea
          ref={textareaRef}
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your startup idea…"
          rows={5}
          className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm text-white placeholder:text-[#444444] outline-none leading-relaxed"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#1E1E1E" }}>
          <div className="flex items-center gap-1">
            {[
              { icon: Paperclip, label: "Attach" },
              { icon: Settings, label: "Settings" },
              { icon: Sliders, label: "Options" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors"
                style={{ color: "#555555" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1A1A1A"
                  e.currentTarget.style.color = "#888888"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#555555"
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={onSubmit}
            disabled={!idea.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
            style={{
              background: idea.trim() ? "#E8450A" : "#2A2A2A",
              boxShadow: idea.trim() ? "0 0 18px rgba(232,69,10,0.45)" : "none",
            }}
          >
            <ArrowUp size={16} className="text-white" />
          </button>
        </div>
      </div>

      <p className="text-xs mb-10" style={{ color: "#444444" }}>
        Press{" "}
        <kbd
          className="px-1.5 py-0.5 rounded text-xs border"
          style={{ background: "#1A1A1A", borderColor: "#2A2A2A", color: "#666666" }}
        >
          ⌘ Enter
        </kbd>{" "}
        to submit
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {FEATURE_CARDS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border p-4 cursor-pointer transition-all"
            style={{ background: "#111111", borderColor: "#222222" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#E8450A44"
              e.currentTarget.style.background = "#141414"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#222222"
              e.currentTarget.style.background = "#111111"
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "rgba(232,69,10,0.12)" }}
            >
              <Icon size={15} style={{ color: "#E8450A" }} />
            </div>
            <p className="text-sm font-medium text-white mb-1">{title}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#666666" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Report Placeholder ───────────────────────────────────────────────────────

function ReportPlaceholder({ idea }: { idea: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
      <div
        className="w-full rounded-xl border p-8 text-center"
        style={{ background: "#111111", borderColor: "#222222" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(232,69,10,0.12)" }}
        >
          <Lightbulb size={20} style={{ color: "#E8450A" }} />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Report Ready</h2>
        <p className="text-sm mb-1" style={{ color: "#666666" }}>
          Validation complete for:
        </p>
        <p className="text-sm font-medium text-white mb-6 italic">"{idea}"</p>
        <p className="text-xs" style={{ color: "#444444" }}>
          The full report component will be rendered here.
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [appState, setAppState] = useState<AppState>("empty")
  const [loadingStep, setLoadingStep] = useState(0)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [submittedIdea, setSubmittedIdea] = useState("")

  // On mount: read localStorage
  useEffect(() => {
    const demo = localStorage.getItem("isDemoMode") === "true"
    const demoIdea = localStorage.getItem("demoIdea") ?? ""
    setIsDemoMode(demo)
    if (demo && demoIdea) {
      setIdea(demoIdea)
    }
  }, [])

  // Loading step animation
  useEffect(() => {
    if (appState !== "loading") return
    setLoadingStep(0)
    const timings = [900, 1800, 2700]
    const timeouts = timings.map((ms, i) =>
      setTimeout(() => setLoadingStep(i + 1), ms)
    )
    const done = setTimeout(() => {
      setAppState("report")
    }, 3800)
    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [appState])

  function handleSubmit() {
    if (!idea.trim()) return
    setSubmittedIdea(idea)
    setAppState("loading")
  }

  function handleNewValidation() {
    setIdea("")
    setSubmittedIdea("")
    setAppState("empty")
    setLoadingStep(0)
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0A", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar onNewValidation={handleNewValidation} />

      {/* Main content */}
      <div className="flex flex-col flex-1 ml-[280px] min-h-screen">
        {/* Demo banner */}
        {isDemoMode && (
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white"
            style={{ background: "#E8450A" }}
          >
            <Zap size={12} />
            You&apos;re in demo mode — results are pre-loaded for speed
          </div>
        )}

        <TopBar />

        {appState === "empty" && (
          <EmptyState idea={idea} onIdeaChange={setIdea} onSubmit={handleSubmit} />
        )}
        {appState === "loading" && <LoadingScreen step={loadingStep} />}
        {appState === "report" && <ReportPlaceholder idea={submittedIdea} />}
      </div>
    </div>
  )
}
