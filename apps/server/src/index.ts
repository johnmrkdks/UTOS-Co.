import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@/trpc/context";
import { appRouter } from "@/trpc/routers/_app";
import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { uploadFileService } from "@/services/file/upload-file";

const DEFAULT_ORIGINS = ["http://localhost:3001", "http://localhost:3002", "http://localhost:3003"];

/** Trusted domains - origin must match one of these patterns */
const TRUSTED_DOMAIN_PATTERNS = [
	/^https:\/\/[a-z0-9-]+\.downunderchauffeurs\.workers\.dev$/i,
	/^https:\/\/downunderchauffeurs\.com$/i,
	/^https:\/\/[a-z0-9-]+\.downunderchauffeurs\.com$/i,
	/^http:\/\/localhost(:\d+)?$/,
];

function getAllowedOrigins(): string[] {
	const raw = (env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
	return raw.length > 0 ? raw : DEFAULT_ORIGINS;
}

function isOriginAllowed(origin: string | null): boolean {
	if (!origin) return false;
	const allowed = getAllowedOrigins();
	if (allowed.includes(origin)) return true;
	// Allow trusted domain patterns
	if (TRUSTED_DOMAIN_PATTERNS.some((p) => p.test(origin))) return true;
	// Fallback: allow any origin from our domains (handles edge cases)
	if (
		origin.startsWith("https://") &&
		(origin.includes("downunderchauffeurs.workers.dev") || origin.includes("downunderchauffeurs.com"))
	) {
		return true;
	}
	return false;
}

function addCorsToResponse(response: Response, request: Request): Response {
	const origin = request.headers.get("Origin");
	if (!origin || !isOriginAllowed(origin)) return response;
	const headers = new Headers(response.headers);
	headers.set("Access-Control-Allow-Origin", origin);
	headers.set("Access-Control-Allow-Credentials", "true");
	headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
	headers.set("Vary", "Origin");
	return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const app = new Hono();

app.use(logger());

app.use(
	"*",
	cors({
		origin: (origin) => (origin && isOriginAllowed(origin) ? origin : null),
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

// Auth routes: wrap response to ensure CORS headers on all responses (including errors/503)
app.on(["POST", "GET", "OPTIONS"], "/api/auth/**", async (c) => {
	// Handle CORS preflight immediately - don't pass to auth handler
	if (c.req.method === "OPTIONS") {
		const origin = c.req.header("Origin");
		const headers = new Headers();
		if (origin && isOriginAllowed(origin)) {
			headers.set("Access-Control-Allow-Origin", origin);
			headers.set("Access-Control-Allow-Credentials", "true");
			headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
			headers.set("Access-Control-Max-Age", "600");
		}
		return new Response(null, { status: 204, headers });
	}
	try {
		const response = await auth.handler(c.req.raw);
		return addCorsToResponse(response, c.req.raw);
	} catch (err) {
		console.error("Auth handler error:", err);
		const headers = new Headers({ "Content-Type": "application/json" });
		const origin = c.req.header("Origin");
		if (origin && isOriginAllowed(origin)) {
			headers.set("Access-Control-Allow-Origin", origin);
			headers.set("Access-Control-Allow-Credentials", "true");
			headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		}
		return new Response(JSON.stringify({ error: "Authentication failed" }), { status: 503, headers });
	}
});

// Image proxy: serve R2 images through our server (works even if R2 public access is disabled)
app.get("/api/images/*", async (c) => {
	const path = c.req.path.replace(/^\/api\/images\/?/, "") || "";
	if (!path) {
		return c.json({ error: "Missing image path" }, 400);
	}
	try {
		const object = await env.BUCKET.get(path);
		if (!object) {
			return c.json({ error: "Not found" }, 404);
		}
		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("Cache-Control", "public, max-age=86400");
		return new Response(object.body, { headers });
	} catch (err) {
		console.error("Image proxy error:", err);
		return c.json({ error: "Failed to load image" }, 500);
	}
});

// Server-side proxy upload (avoids R2 CORS - browser uploads to our API, we upload to R2)
app.post("/api/upload/:entityType", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session?.user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const entityType = c.req.param("entityType") as "cars" | "packages" | "bookings" | "users";
	if (!["cars", "packages", "bookings", "users"].includes(entityType)) {
		return c.json({ error: "Invalid entityType" }, 400);
	}

	const formData = await c.req.formData();
	const file = formData.get("file");
	if (!file || !(file instanceof File)) {
		return c.json({ error: "No file provided" }, 400);
	}

	try {
		const result = await uploadFileService({
			entityType,
			fileName: file.name,
			fileType: file.type,
			fileSize: file.size,
			body: file,
		});
		return c.json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Upload failed";
		return c.json({ error: message }, 400);
	}
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

// Wrap app to add CORS to ALL responses (catches 503s and errors that bypass middleware)
export default {
	async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
		// Handle CORS preflight for auth at the very top - critical for sign-in to work
		const url = new URL(request.url);
		if (request.method === "OPTIONS" && url.pathname.startsWith("/api/auth/")) {
			const origin = request.headers.get("Origin");
			const headers = new Headers();
			if (origin && isOriginAllowed(origin)) {
				headers.set("Access-Control-Allow-Origin", origin);
				headers.set("Access-Control-Allow-Credentials", "true");
				headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
				headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
				headers.set("Access-Control-Max-Age", "86400");
				headers.set("Vary", "Origin");
			}
			return new Response(null, { status: 204, headers });
		}
		try {
			const response = await app.fetch(request, env, ctx);
			return addCorsToResponse(response, request);
		} catch (err) {
			console.error("Worker fetch error:", err);
			const origin = request.headers.get("Origin");
			const headers = new Headers({ "Content-Type": "application/json" });
			if (origin && isOriginAllowed(origin)) {
				headers.set("Access-Control-Allow-Origin", origin);
				headers.set("Access-Control-Allow-Credentials", "true");
				headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
				headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
			}
			return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 503, headers });
		}
	},
};
