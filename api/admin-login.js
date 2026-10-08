import crypto from "crypto";

function makeToken(secret, stamp) {
  return crypto.createHmac("sha256", secret).update("ideaworth-admin:" + stamp).digest("hex") + ":" + stamp;
}

function isValid(token, secret) {
  try {
    const parts = String(token || "").split(":");
    const sig = parts[0];
    const stamp = Number(parts[1]);
    if (!sig || !Number.isFinite(stamp)) return false;
    if (Date.now() - stamp > 604800000 || stamp > Date.now() + 60000) return false;
    const expected = crypto.createHmac("sha256", secret).update("ideaworth-admin:" + stamp).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch (e) { return false; }
}

function getCookie(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(/(?:^|; )iw_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default async function handler(req, res) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return res.status(503).json({ error: "admin_password_not_configured" });

  if (req.method === "GET") {
    return isValid(getCookie(req), secret)
      ? res.status(200).json({ authenticated: true })
      : res.status(401).json({ authenticated: false });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", "iw_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
    return res.status(200).json({ logged_out: true });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  let body = {};
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {}); } catch (e) {}
  const supplied = String(body.password || "");
  if (supplied !== String(secret)) return res.status(401).json({ error: "invalid_credentials" });

  const stamp = Date.now();
  const token = makeToken(secret, stamp);
  res.setHeader("Set-Cookie", "iw_admin=" + encodeURIComponent(token) + "; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax");
  return res.status(200).json({ authenticated: true });
}