import { Router } from "express";

export const router = Router();

router.get("/stats", async (_req, res) => {
	res.json({ users: 0, threads: 0, posts: 0, events: 0 });
});


