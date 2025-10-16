import "dotenv/config";
import express from "express";
import cors from "cors";
import auth from "./auth.js";
import quiz from "./quiz.js";
import score from "./score.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "CooziQuiz API" }));
app.use("/auth", auth);
app.use("/quizzes", quiz);
app.use("/scores", score);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log("API on http://localhost:" + port));
