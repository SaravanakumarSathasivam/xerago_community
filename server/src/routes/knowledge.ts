import { Router } from "express";
import { readJson, writeJson } from "../utils/jsonStore";
import crypto from "crypto";

interface KnowledgeArticle {
	id: string;
	title: string;
	content: string;
	category?: string;
	authorId: string;
	createdAt: string;
}

export const router = Router();

router.get("/articles", async (_req, res) => {
	const articles = await readJson<KnowledgeArticle[]>("knowledge/articles.json", []);
	res.json(articles);
});

router.post("/articles", async (req, res) => {
	const { title, content, category, authorId } = req.body ?? {};
	if (!title || !content || !authorId) return res.status(400).json({ error: "title, content, authorId required" });
	const articles = await readJson<KnowledgeArticle[]>("knowledge/articles.json", []);
	const article: KnowledgeArticle = {
		id: crypto.randomUUID(),
		title,
		content,
		category,
		authorId,
		createdAt: new Date().toISOString(),
	};
	await writeJson("knowledge/articles.json", [article, ...articles]);
	res.status(201).json(article);
});


