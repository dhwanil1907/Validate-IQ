import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60; // Allow up to 60s for Perplexity API calls


// ─── Types ────────────────────────────────────────────────────────────────────

interface Survey {
  stage: string
  technical: string
  budget: string
  time: string
  network: string
  geography: string
}

interface PerplexityMessage {
  role: "system" | "user"
  content: string
}

interface PerplexityCitation {
  url?: string
}

interface PerplexityResponse {
  choices: {
    message: {
      content: string
    }
  }[]
  citations?: PerplexityCitation[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFounderContext(survey: Survey): string {
  return (
    `Founder profile: Stage=${survey.stage}, Technical=${survey.technical}, ` +
    `Budget=${survey.budget}, Time=${survey.time}, Network=${survey.network}, ` +
    `Geography=${survey.geography}. Use this context to personalize every insight ` +
    `specifically for this founder — not a generic founder.`
  )
}

function getConfidenceLevel(citations: PerplexityCitation[] | undefined): string {
  const count = citations?.length ?? 0
  if (count >= 4) return "High"
  if (count >= 2) return "Medium"
  return "Low"
}

function stripCitations(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\[\d+\]/g, "").trim()
  if (Array.isArray(value)) return value.map(stripCitations)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stripCitations(v)])
    )
  }
  return value
}

function extractJSON(raw: string): unknown {
  // Strip markdown fences
  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()

  // Strip anything before the first { or [
  const firstBrace = cleaned.indexOf("{")
  const firstBracket = cleaned.indexOf("[")
  let start = -1
  if (firstBrace === -1) start = firstBracket
  else if (firstBracket === -1) start = firstBrace
  else start = Math.min(firstBrace, firstBracket)

  if (start === -1) throw new Error("No JSON object found")
  cleaned = cleaned.slice(start)

  // Strip anything after the last } or ]
  const lastBrace = cleaned.lastIndexOf("}")
  const lastBracket = cleaned.lastIndexOf("]")
  const end = Math.max(lastBrace, lastBracket)
  if (end === -1) throw new Error("No JSON closing found")
  cleaned = cleaned.slice(0, end + 1)

  return JSON.parse(cleaned)
}

async function callPerplexity(
  messages: PerplexityMessage[]
): Promise<{ data: PerplexityResponse; error: null } | { data: null; error: string }> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) return { data: null, error: "PERPLEXITY_API_KEY not set" }

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages,
        max_tokens: 1000,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { data: null, error: `Perplexity ${res.status}: ${text}` }
    }

    const data = (await res.json()) as PerplexityResponse
    return { data, error: null }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}

function parseSection(result: { data: PerplexityResponse | null; error: string | null }) {
  if (result.error || !result.data) {
    return { parsed: { error: true, message: "Section unavailable" }, citations: [] }
  }

  const raw = result.data.choices?.[0]?.message?.content ?? ""
  const citations = result.data.citations ?? []

  try {
    const parsed = stripCitations(extractJSON(raw))
    return { parsed, citations }
  } catch {
    return { parsed: { error: true, message: "Section unavailable" }, citations }
  }
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idea, survey, existingReport } = body as { idea: string; survey: Survey; existingReport?: any }

    if (!idea || typeof idea !== "string") {
      return NextResponse.json({ error: true, message: "Missing idea" }, { status: 400 })
    }

    const founderCtx = survey ? buildFounderContext(survey) : ""
    const geo = survey?.geography ?? "Global"

    const systemPrompt = (extra = "") =>
      `You are a senior startup analyst with live web access. ${founderCtx}${extra}
IMPORTANT RULES:
- If the idea is niche or hyper-specific, look at the broader parent market it belongs to and reason from there. Do NOT give up or return low scores just because direct data is scarce.
- Always provide substantive, specific insight — never generic filler like "market data unavailable".
- Scores should reflect real opportunity, not how much data exists about the niche.
Return JSON only. No markdown. No preamble. No explanation. Just the raw JSON object.`

    // ── 6 parallel Perplexity calls ───────────────────────────────────────────

    const [snap, mkt, comp, entry, verdict, devil] = await Promise.all([

      // CALL 1 — Idea Snapshot
      existingReport 
        ? Promise.resolve({ data: null, error: null }) 
        : callPerplexity([
            { role: "system", content: systemPrompt() },
            {
              role: "user",
              content: `For this startup idea: "${idea}"
Analyze it carefully. If the idea is niche, identify the specific problem it solves and the precise customer segment it targets — do not generalize. clarityScore (0-10) should reflect how clearly the idea is defined, not how big the market is.
Return this exact JSON:
{
  "oneLiner": string,
  "problem": string,
  "targetCustomer": string,
  "clarityScore": number
}`,
            },
          ]),

      // CALL 2 — Market Signals
      existingReport 
        ? Promise.resolve({ data: null, error: null }) 
        : callPerplexity([
            { role: "system", content: systemPrompt() },
            {
              role: "user",
              content: `For this startup idea: "${idea}"
Geography: ${geo}
If this is a niche idea, identify the broader parent market (e.g. "B2B SaaS", "creator economy tools", "healthcare AI") and size the TAM from that, then narrow to SAM and SOM for this specific niche. Always provide real dollar figures with sources — never say "data unavailable". marketTiming reflects how early or late the underlying trend is.
Return this exact JSON:
{
  "tam": string,
  "tamSource": string,
  "sam": string,
  "som": string,
  "growthRate": string,
  "marketTiming": "Early" | "Peak" | "Late",
  "marketTimingReason": string
}`,
            },
          ]),

      // CALL 3 — Competitor Intel
      existingReport 
        ? Promise.resolve({ data: null, error: null }) 
        : callPerplexity([
            { role: "system", content: systemPrompt() },
            {
              role: "user",
              content: `For this startup idea: "${idea}"
Find 3-5 real companies competing in this space. If there are no direct competitors, find adjacent competitors solving a related problem or serving the same customer. Include at least 3 entries — use adjacent market players if needed, and note that in their "name" field. gapStatement should explain what gap this idea fills that existing solutions miss.
Return this exact JSON:
{
  "competitors": [
    {
      "name": string,
      "website": string,
      "funding": string,
      "pricing": string,
      "lastActivity": string
    }
  ],
  "gapStatement": string
}`,
            },
          ]),

      // CALL 4 — Market Entry Score
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: "${idea}"
${founderCtx}
Rate how easy it is for a new founder to enter this market (entryScore 0-10, where 10 = very easy to get started). Consider: regulatory complexity, capital requirements, incumbent moats, technical difficulty. A niche idea with low competition should score higher, not lower. Be specific about the 3 real barriers and 2 genuine advantages this founder has given their profile.
Return this exact JSON:
{
  "entryScore": number,
  "barriers": [string, string, string],
  "advantages": [string, string],
  "fastestEntryPath": string
}`,
        },
      ]),

      // CALL 5 — Go/No-Go Verdict
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: "${idea}"
${founderCtx}
Give an honest viability assessment. viabilityScore is 0-9 (9 = highly viable). A niche idea can be highly viable — score based on: real demand, founder-market fit, defensibility, and monetization potential. Do NOT penalize for being niche. topReasons and topRisks must be specific to THIS idea, not generic startup risks. nextAction should be the single most important thing this founder should do in the next 7 days.
Return this exact JSON:
{
  "viabilityScore": number,
  "topReasons": [string, string, string],
  "topRisks": [string, string, string],
  "nextAction": string
}`,
        },
      ]),

      // CALL 6 — Devil's Advocate
      existingReport 
        ? Promise.resolve({ data: null, error: null }) 
        : callPerplexity([
            { role: "system", content: systemPrompt() },
            {
              role: "user",
              content: `For this startup idea: "${idea}"
Find 3 real companies that tried something similar and failed. If there are no direct matches, find companies that failed in the broader problem space or adjacent niche. Always return 3 entries — use the closest analogues available. thePattern should identify the recurring failure mode. survivalRule should be the specific thing that would make THIS idea avoid that fate.
Return this exact JSON:
{
  "failures": [
    {
      "name": string,
      "what": string,
      "why": string,
      "year": string
    }
  ],
  "thePattern": string,
  "survivalRule": string
}`,
            },
          ]),
    ])

    // ── Parse each section ────────────────────────────────────────────────────

    const sections = {
      snapshot: parseSection(snap),
      market:   parseSection(mkt),
      competitors: parseSection(comp),
      entryScore:  parseSection(entry),
      verdict:     parseSection(verdict),
      devilsAdvocate: parseSection(devil),
    }

    // ── Normalize numeric scores ──────────────────────────────────────────────

    function normalizeEntryScore(raw: unknown): number {
      const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
      if (isNaN(n)) return 5
      return Math.min(10, Math.max(0, Math.round(n * 10) / 10))
    }

    function normalizeViabilityScore(raw: unknown): number {
      const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
      if (isNaN(n)) return 5
      return Math.min(9, Math.max(0, Math.round(n * 10) / 10))
    }

    const entryParsed = sections.entryScore.parsed as Record<string, unknown>
    if (entryParsed && !entryParsed.error) {
      entryParsed.entryScore = normalizeEntryScore(entryParsed.entryScore)
    }

    const verdictParsed = sections.verdict.parsed as Record<string, unknown>
    if (verdictParsed && !verdictParsed.error) {
      verdictParsed.viabilityScore = normalizeViabilityScore(verdictParsed.viabilityScore)
    }

    function extractUrls(citations: PerplexityCitation[]): string[] {
      return citations
        .map((c) => (typeof c === "string" ? c : c.url))
        .filter((url): url is string => Boolean(url))
    }

    return NextResponse.json({
      snapshot:       existingReport ? existingReport.snapshot : sections.snapshot.parsed,
      market:         existingReport ? existingReport.market : sections.market.parsed,
      competitors:    existingReport ? existingReport.competitors : sections.competitors.parsed,
      entryScore:     sections.entryScore.parsed,
      verdict:        sections.verdict.parsed,
      devilsAdvocate: existingReport ? existingReport.devilsAdvocate : sections.devilsAdvocate.parsed,
      confidence: {
        snapshot:       existingReport ? existingReport.confidence?.snapshot : getConfidenceLevel(sections.snapshot.citations),
        market:         existingReport ? existingReport.confidence?.market : getConfidenceLevel(sections.market.citations),
        competitors:    existingReport ? existingReport.confidence?.competitors : getConfidenceLevel(sections.competitors.citations),
        entryScore:     getConfidenceLevel(sections.entryScore.citations),
        verdict:        getConfidenceLevel(sections.verdict.citations),
        devilsAdvocate: existingReport ? existingReport.confidence?.devilsAdvocate : getConfidenceLevel(sections.devilsAdvocate.citations),
      },
      citations: {
        snapshot:       existingReport ? existingReport.citations?.snapshot : extractUrls(sections.snapshot.citations),
        market:         existingReport ? existingReport.citations?.market : extractUrls(sections.market.citations),
        competitors:    existingReport ? existingReport.citations?.competitors : extractUrls(sections.competitors.citations),
        entryScore:     extractUrls(sections.entryScore.citations),
        verdict:        extractUrls(sections.verdict.citations),
        devilsAdvocate: existingReport ? existingReport.citations?.devilsAdvocate : extractUrls(sections.devilsAdvocate.citations),
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: true, message: "Unexpected server error", detail: String(err) },
      { status: 500 }
    )
  }
}
