import { Router } from "express";
import { readJson, writeJson } from "../utils/jsonStore";

interface LeaderboardEntry {
	userId: string;
	score: number;
}

export const router = Router();

router.get("/", async (_req, res) => {
	const entries = await readJson<LeaderboardEntry[]>("leaderboard/leaderboard.json", []);
	res.json(entries.sort((a, b) => b.score - a.score));
});

router.post("/score", async (req, res) => {
	const { userId, delta } = req.body ?? {};
	if (!userId || typeof delta !== "number") return res.status(400).json({ error: "userId and numeric delta required" });
	const entries = await readJson<LeaderboardEntry[]>("leaderboard/leaderboard.json", []);
	const index = entries.findIndex(e => e.userId === userId);
	if (index >= 0) {
		entries[index].score += delta;
	} else {
		entries.push({ userId, score: delta });
	}
	await writeJson("leaderboard/leaderboard.json", entries);
	res.json(entries.sort((a, b) => b.score - a.score));
});


