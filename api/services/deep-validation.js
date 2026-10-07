export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "analysis_engine_not_configured" });

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: "invalid_json" }); }

  const input = body?.input || {};
  if (typeof input.idea !== "string" || input.idea.trim().length < 10) {
    return res.status(400).json({ error: "idea_required" });
  }

  const prompt = [
    "You are the IdeaWorth Deep Idea Validation engine.",
    "Analyze the business idea for the U.S. market. Be commercially useful, skeptical, evidence-aware, and do not invent facts or claim live market research was performed.",
    "Return ONLY valid JSON with these keys: score (integer 0-100), verdict, demand, customer, competition, economics, risks, next_steps.",
    "The verdict must be one concise recommendation: GO, REFINE, or STOP, followed by the reason.",
    "",
    "USER INPUT:",
    JSON.stringify(input)
  ].join("\n");

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        input: prompt
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: "openai_error" });

    const text = data.output_text || "";
    const cleaned = text.replace(/^\s*\`\`\`json\s*/,"").replace(/\s*\`\`\`\s*$/,"").trim();
    let result;
    try { result = JSON.parse(cleaned); }
    catch { return res.status(502).json({ error: "invalid_analysis_response" }); }

    return res.status(200).json(result);
  } catch {
    return res.status(502).json({ error: "analysis_request_failed" });
  }
}