// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
var DB_FILE = path.resolve(__dirname, "history_db.json");
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return { predictions: [], rotations: [] };
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { predictions: [], rotations: [] };
  }
}
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write history DB:", err);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/dataset/default", (req, res) => {
  const datasetPath = path.resolve(__dirname, "data", "Crop_recommendation.csv");
  if (!fs.existsSync(datasetPath)) {
    return res.status(404).json({ error: "Default dataset file not found" });
  }
  const csvContent = fs.readFileSync(datasetPath, "utf8");
  res.header("Content-Type", "text/csv");
  res.send(csvContent);
});
app.get("/api/history", (req, res) => {
  const db = readDb();
  res.json({
    predictions: db.predictions.slice(0, 100),
    rotations: db.rotations.slice(0, 50)
  });
});
app.post("/api/history/prediction", (req, res) => {
  const {
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    humidity,
    ph,
    rainfall,
    previous_crop,
    predicted_crop,
    confidence,
    top_candidates,
    notes
  } = req.body;
  const db = readDb();
  const id = Date.now();
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const newRecord = {
    id,
    timestamp,
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    humidity,
    ph,
    rainfall,
    previous_crop: previous_crop || "None",
    predicted_crop,
    confidence,
    top_candidates: top_candidates || [],
    notes: notes || ""
  };
  db.predictions.unshift(newRecord);
  writeDb(db);
  res.json({ success: true, id, timestamp });
});
app.post("/api/history/rotation", (req, res) => {
  const {
    field_name,
    initial_soil,
    seasons_count,
    rotation_sequence,
    total_score,
    rationale
  } = req.body;
  const db = readDb();
  const id = Date.now();
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const newPlan = {
    id,
    timestamp,
    field_name: field_name || "My Field",
    initial_soil: initial_soil || {},
    seasons_count: seasons_count || 4,
    rotation_sequence: rotation_sequence || [],
    total_score: total_score || 0,
    rationale: rationale || ""
  };
  db.rotations.unshift(newPlan);
  writeDb(db);
  res.json({ success: true, id, timestamp });
});
app.delete("/api/history/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const numId = parseInt(id, 10);
  const db = readDb();
  if (type === "rotation") {
    db.rotations = db.rotations.filter((r) => r.id !== numId);
  } else {
    db.predictions = db.predictions.filter((p) => p.id !== numId);
  }
  writeDb(db);
  res.json({ success: true });
});
app.delete("/api/history", (req, res) => {
  writeDb({ predictions: [], rotations: [] });
  res.json({ success: true, message: "All history cleared" });
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
