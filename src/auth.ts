import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "./supabase.js";
import { z } from "zod";

const r = Router();

const RegisterSchema = z.object({
  username: z.string().min(2).max(32),
  email: z.string().email(),
  password: z.string().min(6)
});

r.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload" });
  const { username, email, password } = parsed.data;

  const { data: existing, error: e1 } = await supabase
    .from("users").select("id").eq("email", email).maybeSingle();
  if (e1) return res.status(500).json({ error: e1.message });
  if (existing) return res.status(409).json({ error: "email exists" });

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from("users")
    .insert({ username, email, hash }).select("*").single();
  if (error) return res.status(500).json({ error: error.message });

  const token = jwt.sign({ id: data.id, username: data.username, email: data.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token, user: { id: data.id, username: data.username, email: data.email } });
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.hash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

export default r;
