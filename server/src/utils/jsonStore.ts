import { promises as fs } from "fs";
import path from "path";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue }
export interface JsonArray extends Array<JsonValue> {}

const dataRoot = path.resolve(process.cwd(), "server", "data");

async function ensureDir(dirPath: string): Promise<void> {
	await fs.mkdir(dirPath, { recursive: true });
}

export async function readJson<T = unknown>(relativeFilePath: string, fallback: T): Promise<T> {
	const absolute = path.join(dataRoot, relativeFilePath);
	try {
		const content = await fs.readFile(absolute, "utf8");
		return JSON.parse(content) as T;
	} catch (error: any) {
		if (error && (error.code === "ENOENT" || error.code === "ENOTDIR")) {
			await ensureDir(path.dirname(absolute));
			await fs.writeFile(absolute, JSON.stringify(fallback, null, 2), "utf8");
			return fallback;
		}
		throw error;
	}
}

// Simple per-file mutex using a map of promises to serialize writes
const writeLocks = new Map<string, Promise<void>>();

export async function writeJson<T = unknown>(relativeFilePath: string, data: T): Promise<void> {
	const absolute = path.join(dataRoot, relativeFilePath);
	await ensureDir(path.dirname(absolute));

	const previous = writeLocks.get(absolute) ?? Promise.resolve();

	let release!: () => void;
	const current = new Promise<void>(resolve => (release = resolve));
	writeLocks.set(absolute, previous.then(() => current));

	try {
		await previous;
		const json = JSON.stringify(data, null, 2);
		await fs.writeFile(absolute, json, "utf8");
	} finally {
		release();
		// Cleanup chain if this is the tail
		writeLocks.set(absolute, Promise.resolve());
	}
}

export async function updateJson<T = unknown>(relativeFilePath: string, updater: (current: T) => T, fallback: T): Promise<T> {
	const current = await readJson<T>(relativeFilePath, fallback);
	const next = updater(current);
	await writeJson<T>(relativeFilePath, next);
	return next;
}


