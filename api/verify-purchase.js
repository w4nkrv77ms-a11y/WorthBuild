export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const transactionId = String(req.query?.transaction_id || "").trim();
  if (!/^txn_[a-z0-9]+$/i.test(transactionId)) {
    return res.status(400).json({ error: "invalid_transaction_id" });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "paddle_api_not_configured" });

  try {
    const r = await fetch("https://api.paddle.com/transactions/" + encodeURIComponent(transactionId), {
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Paddle-Version": "1"
      }
    });

    if (!r.ok) return res.status(r.status === 404 ? 404 : 502).json({ error: "transaction_lookup_failed" });

    const payload = await r.json();
    const tx = payload?.data;

    if (!tx || !["paid", "completed"].includes(tx.status)) {
      return res.status(402).json({ error: "payment_not_completed", status: tx?.status || "unknown" });
    }

    return res.status(200).json({
      verified: true,
      transaction_id: tx.id,
      status: tx.status,
      custom_data: tx.custom_data || null,
      line_items: (tx.line_items || []).map(item => ({
        price_id: item.price_id,
        quantity: item.quantity
      }))
    });
  } catch (error) {
    console.error("Paddle transaction verification error:", error);
    return res.status(502).json({ error: "verification_failed" });
  }
}
