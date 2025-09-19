import { Router } from "express";
import { readJson, writeJson } from "../utils/jsonStore";
import crypto from "crypto";

interface EventRecord {
	id: string;
	title: string;
	description?: string;
	startsAt: string;
	endsAt?: string;
	createdBy: string;
}

export const router = Router();

router.get("/", async (_req, res) => {
	const events = await readJson<EventRecord[]>("events/events.json", []);
	res.json(events);
});

router.post("/", async (req, res) => {
	const { title, description, startsAt, endsAt, createdBy } = req.body ?? {};
	if (!title || !startsAt || !createdBy) return res.status(400).json({ error: "title, startsAt, createdBy required" });
	const events = await readJson<EventRecord[]>("events/events.json", []);
	const newEvent: EventRecord = { id: crypto.randomUUID(), title, description, startsAt, endsAt, createdBy };
	await writeJson("events/events.json", [newEvent, ...events]);
	res.status(201).json(newEvent);
});


