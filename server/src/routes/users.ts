import { Router } from "express";
import { readJson, writeJson } from "../utils/jsonStore";
import crypto from "crypto";

interface UserRecord {
	id: string;
	email: string;
	name: string;
	role?: "user" | "admin";
}

export const router = Router();

router.get("/", async (_req, res) => {
	const users = await readJson<UserRecord[]>("users/users.json", []);
	res.json(users);
});

router.post("/", async (req, res) => {
	const { email, name, role } = req.body ?? {};
	if (!email || !name) return res.status(400).json({ error: "email and name required" });
	const users = await readJson<UserRecord[]>("users/users.json", []);
	const exists = users.some(u => u.email.toLowerCase() === String(email).toLowerCase());
	if (exists) return res.status(409).json({ error: "User already exists" });
	const newUser: UserRecord = { id: crypto.randomUUID(), email, name, role: role ?? "user" };
	await writeJson("users/users.json", [...users, newUser]);
	res.status(201).json(newUser);
});


