import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import routes from "./routes.js";

const app = express();

app.use(express.json());

// CORS - testte açık; prod’da origin’i kısıtla
app.use(cors({ origin: true, credentials: false }));

// Basit hız limiti (IP başına)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/api", routes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Stream token API running on :${port}`);
});
