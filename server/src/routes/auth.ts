import { Router } from "express";
import { readJson } from "../utils/jsonStore";
import crypto from "crypto";

interface UserRecord {
	id: string;
	email: string;
	name: string;
}

interface SessionRecord {
	token: string;
	userId: string;
	expiresAt: string;
}

export const router = Router();

router.post("/login", async (req, res) => {
	const { email } = req.body ?? {};
	if (!email) return res.status(400).json({ error: "Email is required" });

	const users = await readJson<UserRecord[]>("users/users.json", []);
	const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
	if (!user) return res.status(401).json({ error: "Invalid credentials" });

	const token = crypto.randomBytes(24).toString("hex");
	const session: SessionRecord = {
		token,
		userId: user.id,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
	};

	res.json({ token, user });
});


