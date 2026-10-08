export const config = { api: { bodyParser: false } };

import crypto from "crypto";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function verifySignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(";").map(part => {
      const [key, ...rest] = part.split("=");
      return [key, rest.join("=")];
    })
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(ts));
  if (!Number.isFinite(age) || age > 300) return false;

  const signedPayload = ts + ":" + rawBody;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(h1, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const secret = process.env.PADDLE_WEBHOOK_SECRET_KEY;
  if (!secret) return res.status(503).json({ error: "webhook_secret_not_configured" });

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["paddle-signature"];

    if (!verifySignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: "invalid_signature" });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event_type;

    if (eventType === "transaction.paid" || eventType === "transaction.completed") {
      const transaction = event.data || {};
      console.log(JSON.stringify({
        type: "ideaworth_purchase",
        event_id: event.event_id,
        event_type: eventType,
        transaction_id: transaction.id,
        status: transaction.status,
        custom_data: transaction.custom_data || null,
        customer_id: transaction.customer_id || null
      }));
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Paddle webhook error:", error);
    return res.status(400).json({ error: "invalid_webhook" });
  }
}
