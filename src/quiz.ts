import { Router } from "express";
import fs from "fs";
import path from "path";
import { QuizFile } from "./types.js";

const r = Router();
const QZ_DIR = path.resolve(process.cwd(), "quizzes");

r.get("/categories", (_req, res) => {
  const files = fs.readdirSync(QZ_DIR).filter(f => f.endsWith(".json"));
  const cats = new Set<string>();
  files.forEach(f => {
    const qz = JSON.parse(fs.readFileSync(path.join(QZ_DIR, f), "utf8")) as QuizFile;
    cats.add(qz.category);
  });
  res.json({ categories: [...cats] });
});

r.get("/", (_req, res) => {
  const files = fs.readdirSync(QZ_DIR).filter(f => f.endsWith(".json"));
  const list = files.map(f => {
    const qz = JSON.parse(fs.readFileSync(path.join(QZ_DIR, f), "utf8")) as QuizFile;
    return { slug: path.basename(f, ".json"), title: qz.title, category: qz.category, count: qz.questions.length };
  });
  res.json({ quizzes: list });
});

r.get("/:slug", (req, res) => {
  const file = path.join(QZ_DIR, req.params.slug + ".json");
  if (!fs.existsSync(file)) return res.status(404).json({ error: "quiz not found" });
  const qz = JSON.parse(fs.readFileSync(file, "utf8")) as QuizFile;
  res.json(qz);
});

export default r;
