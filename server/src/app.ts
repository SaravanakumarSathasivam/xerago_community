import express from "express";
import cors from "cors";
import morgan from "morgan";

import { router as usersRouter } from "./routes/users";
import { router as forumsRouter } from "./routes/forums";
import { router as eventsRouter } from "./routes/events";
import { router as knowledgeRouter } from "./routes/knowledge";
import { router as leaderboardRouter } from "./routes/leaderboard";
import { router as authRouter } from "./routes/auth";
import { router as adminRouter } from "./routes/admin";

export function createApp() {
	const app = express();

	app.use(cors());
	app.use(express.json({ limit: "1mb" }));
	app.use(morgan("dev"));

	app.get("/api/health", (_req, res) => {
		res.json({ status: "ok", timestamp: new Date().toISOString() });
	});

	app.use("/api/auth", authRouter);
	app.use("/api/users", usersRouter);
	app.use("/api/forums", forumsRouter);
	app.use("/api/events", eventsRouter);
	app.use("/api/knowledge", knowledgeRouter);
	app.use("/api/leaderboard", leaderboardRouter);
	app.use("/api/admin", adminRouter);

	app.use((req, res) => {
		res.status(404).json({ error: "Not Found", path: req.path });
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
		const status = err?.status ?? 500;
		const message = err?.message ?? "Internal Server Error";
		res.status(status).json({ error: message });
	});

	return app;
}


