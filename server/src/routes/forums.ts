import { Router } from "express";
import { readJson, writeJson } from "../utils/jsonStore";
import crypto from "crypto";

interface ForumThread {
	id: string;
	title: string;
	authorId: string;
	createdAt: string;
}

interface ForumPost {
	id: string;
	threadId: string;
	authorId: string;
	content: string;
	createdAt: string;
}

export const router = Router();

router.get("/threads", async (_req, res) => {
	const threads = await readJson<ForumThread[]>("forums/threads.json", []);
	res.json(threads);
});

router.post("/threads", async (req, res) => {
	const { title, authorId } = req.body ?? {};
	if (!title || !authorId) return res.status(400).json({ error: "title and authorId required" });
	const threads = await readJson<ForumThread[]>("forums/threads.json", []);
	const newThread: ForumThread = {
		id: crypto.randomUUID(),
		title,
		authorId,
		createdAt: new Date().toISOString(),
	};
	await writeJson("forums/threads.json", [newThread, ...threads]);
	res.status(201).json(newThread);
});

router.get("/threads/:threadId/posts", async (req, res) => {
	const { threadId } = req.params;
	const posts = await readJson<ForumPost[]>("forums/posts.json", []);
	res.json(posts.filter(p => p.threadId === threadId));
});

router.post("/threads/:threadId/posts", async (req, res) => {
	const { threadId } = req.params;
	const { authorId, content } = req.body ?? {};
	if (!authorId || !content) return res.status(400).json({ error: "authorId and content required" });
	const posts = await readJson<ForumPost[]>("forums/posts.json", []);
	const newPost: ForumPost = {
		id: crypto.randomUUID(),
		threadId,
		authorId,
		content,
		createdAt: new Date().toISOString(),
	};
	await writeJson("forums/posts.json", [...posts, newPost]);
	res.status(201).json(newPost);
});


