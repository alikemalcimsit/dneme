import jwt from "jsonwebtoken";

/**
 * Uygulama JWT doğrulama.
 * HS256 (AUTH_JWT_SECRET) ya da RS256 (AUTH_JWT_PUBLIC_KEY) ile çalışır.
 * Doğrulama başarılıysa req.auth = { user_id, ...claims } ekler.
 */
export function verifyAppJwt(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing Authorization Bearer token" });

    const hasSecret = !!process.env.AUTH_JWT_SECRET;
    const hasPublicKey = !!process.env.AUTH_JWT_PUBLIC_KEY;

    if (!hasSecret && !hasPublicKey) {
      return res.status(500).json({ error: "Server misconfigured: no JWT verifier" });
    }

    const verifyKey = hasPublicKey ? process.env.AUTH_JWT_PUBLIC_KEY : process.env.AUTH_JWT_SECRET;
    const algorithms = hasPublicKey ? ["RS256"] : ["HS256"];

    const payload = jwt.verify(token, verifyKey, { algorithms });

    // Burada uygulamanın JWT’sinde userId/email vs ne ise onu user_id olarak belirle.
    const user_id =
      payload.user_id ||
      payload.sub ||
      payload.uid ||
      payload.id;

    if (!user_id) {
      return res.status(400).json({ error: "JWT geçerli fakat user_id bulunamadı" });
    }

    req.auth = { user_id, claims: payload };
    next();
  } catch (e) {
    return res.status(401).json({ error: "JWT doğrulanamadı", details: e.message });
  }
}
