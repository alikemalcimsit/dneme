import express from "express";
import { StreamClient } from "@stream-io/node-sdk";
import { verifyAppJwt } from "./auth.js";

const router = express.Router();

// Basit sağlık kontrolü
router.get("/health", (req, res) => res.json({ ok: true }));

// Mobilin GetStream user token’ı aldığı endpoint
router.post("/stream/token/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const apiKey = "w475bmm7v4pp";
    const apiSecret = "ewhu2nerudusf34wqs92ufjnzthbyyrgqykvbhb43afjdbppzq5bvypst8vmeuup";

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: "STREAM_API_KEY/SECRET tanımlı değil" });
    }

    const client = new StreamClient(apiKey, apiSecret);

    const user_id = String(id); // String olmalı
    const ttl = parseInt(process.env.STREAM_TOKEN_TTL_SECONDS || "86400", 10);

    // Kullanıcıyı Stream tarafında upsert etmek isteğe bağlı
    // await client.upsertUsers([{ id: user_id, role: "user" }]);

    const token=client.generateUserToken({ user_id: user_id, validity_in_seconds: ttl })

    return res.json({
      api_key: apiKey,
      token,
      user_id,
      expires_in: ttl
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Token üretilemedi", details: e.message });
  }
});


export default router;
