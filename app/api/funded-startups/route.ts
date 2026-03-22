import { NextResponse } from "next/server"

export const revalidate = 86400 // 24-hour cache

interface FundedStartup {
  name: string
  amount: string
  round: string
}

export async function GET() {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ startups: getFallback() })
  }

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a startup funding news tracker. Return JSON only. No markdown. No explanation.",
          },
          {
            role: "user",
            content: `List 20 real startups that received funding in the last 60 days.
Return this exact JSON array:
[
  { "name": string, "amount": string, "round": string }
]
Keep amounts short like "$5M", "$120M". Keep rounds short like "Seed", "Series A", "Series B".`,
          },
        ],
        max_tokens: 800,
      }),
      next: { revalidate: 86400 },
    })

    if (!res.ok) throw new Error("Perplexity error")

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ""

    // Strip markdown fences and parse
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim()
    const start = cleaned.indexOf("[")
    const end = cleaned.lastIndexOf("]")
    if (start === -1 || end === -1) throw new Error("No JSON array")

    const startups = JSON.parse(cleaned.slice(start, end + 1)) as FundedStartup[]
    return NextResponse.json({ startups })
  } catch {
    return NextResponse.json({ startups: getFallback() })
  }
}

function getFallback(): FundedStartup[] {
  return [
    { name: "Mistral AI", amount: "$640M", round: "Series B" },
    { name: "Harvey", amount: "$300M", round: "Series D" },
    { name: "Anduril", amount: "$1.5B", round: "Series F" },
    { name: "Cohere", amount: "$500M", round: "Series D" },
    { name: "Perplexity", amount: "$250M", round: "Series B" },
    { name: "ElevenLabs", amount: "$80M", round: "Series B" },
    { name: "Runway", amount: "$141M", round: "Series C" },
    { name: "Cognition", amount: "$175M", round: "Series A" },
  ]
}
