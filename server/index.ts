import express from "express";
import router from "./routes.js";
import { initializeDbConnection } from "./db.js";

const app = express();

// Set up body parsers with limits for Base64 image payload
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Standard lightweight CORS middleware configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Mount routes from routes.js under /api
app.use("/api", router);

// Global JSON error handler to prevent HTML response crashes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Error Catch:", err);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message || String(err)
  });
});

// Lazy trigger database connection
initializeDbConnection()
  .then(() => {
    console.log("Database configuration checked successfully.");
  })
  .catch((err) => {
    console.error("Database check failed, using fallback memory store:", err);
  });

// Bind to port 3001 for local development and proxying
if (
  (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.argv.length > 1 && process.argv[1].includes('server')) ||
  !process.env.VERCEL
) {
  const PORT = 3001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
