import { Router } from "express";
import { supabase } from "./supabase.js";
import { requireAuth } from "./middleware.js";

const r = Router();

r.post("/", requireAuth, async (req, res) => {
  const { category, points } = req.body ?? {};
  const user = (req as any).user;
  if (!category || typeof points !== "number") return res.status(400).json({ error: "bad payload" });
  const { error } = await supabase.from("scores").insert({
    user_id: user.id, username: user.username, category, points
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

r.get("/leaderboard", async (_req, res) => {
  const { data: all, error } = await supabase.from("scores").select("username, points, category");
  if (error) return res.status(500).json({ error: error.message });

  const globalMap = new Map<string, number>();
  const byCat: Record<string, Map<string, number>> = {};
  for (const s of all ?? []) {
    globalMap.set(s.username, (globalMap.get(s.username) ?? 0) + (s.points ?? 0));
    byCat[s.category] = byCat[s.category] ?? new Map<string, number>();
    const m = byCat[s.category];
    m.set(s.username, (m.get(s.username) ?? 0) + (s.points ?? 0));
  }

  const global = Array.from(globalMap.entries())
    .map(([username, score]) => ({ username, score }))
    .sort((a,b)=>b.score-a.score).slice(0,50);

  const categories = Object.entries(byCat).map(([category, m]) => ({
    category,
    board: Array.from(m.entries()).map(([username, score])=>({username, score}))
      .sort((a,b)=>b.score-a.score).slice(0,50)
  }));

  res.json({ global, categories });
});

export default r;
