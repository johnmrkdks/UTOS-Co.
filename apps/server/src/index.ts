import { env as cloudflareEnv } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@/trpc/context";
import { appRouter } from "@/trpc/routers/_app";
import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { uploadFileService } from "@/services/file/upload-file";

/** Explicit allowed origins - no env dependency to avoid crashes */
const ALLOWED_ORIGINS = new Set([
	"https://down-under-chauffeur-staging.downunderchauffeurs.workers.dev",
	"https://downunderchauffeurs.com",
	"https://down-under-chauffeur-dev.luppy.workers.dev",
	"http://localhost:3001",
	"http://localhost:3002",
	"http://localhost:3003",
]);

/** Trusted domain patterns */
const TRUSTED_DOMAIN_PATTERNS = [
	/^https:\/\/[a-z0-9-]+\.downunderchauffeurs\.workers\.dev$/i,
	/^https:\/\/downunderchauffeurs\.com$/i,
	/^https:\/\/[a-z0-9-]+\.downunderchauffeurs\.com$/i,
	/^https:\/\/[a-z0-9-]+\.luppy\.workers\.dev$/i,
	/^http:\/\/localhost(:\d+)?$/,
];

function isOriginAllowed(origin: string | null): boolean {
	if (!origin) return false;
	if (ALLOWED_ORIGINS.has(origin)) return true;
	return TRUSTED_DOMAIN_PATTERNS.some((p) => p.test(origin));
}

/** Build CORS headers - never throws */
function buildCorsHeaders(origin: string | null): Headers {
	const headers = new Headers();
	headers.set("Vary", "Origin");
	if (origin && isOriginAllowed(origin)) {
		headers.set("Access-Control-Allow-Origin", origin);
		headers.set("Access-Control-Allow-Credentials", "true");
		headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
		headers.set("Access-Control-Max-Age", "86400");
	}
	return headers;
}

/** Merge CORS headers onto response - never throws, falls back to original response on error */
function addCorsToResponse(response: Response, request: Request): Response {
	try {
		const origin = request.headers.get("Origin");
		const corsHeaders = buildCorsHeaders(origin);
		if (!corsHeaders.get("Access-Control-Allow-Origin")) return response;
		const headers = new Headers(response.headers);
		corsHeaders.forEach((v, k) => headers.set(k, v));
		return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
	} catch {
		return response;
	}
}

/** JSON error response with CORS headers - use for all error paths */
function jsonErrorWithCors(
	request: Request,
	body: { error: string; code?: string },
	status: number,
): Response {
	const headers = new Headers({ "Content-Type": "application/json" });
	buildCorsHeaders(request.headers.get("Origin")).forEach((v, k) => headers.set(k, v));
	return new Response(JSON.stringify(body), { status, headers });
}

const app = new Hono();

app.use(logger());

// Auth routes: custom CORS + try/catch to prevent Worker crashes, CORS on every response
app.on(["POST", "GET", "OPTIONS"], "/api/auth/**", async (c) => {
	const origin = c.req.header("Origin") ?? null;
	const corsHeaders = buildCorsHeaders(origin);

	// OPTIONS preflight - return immediately with CORS headers
	if (c.req.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	try {
		const response = await auth.handler(c.req.raw);
		return addCorsToResponse(response, c.req.raw);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		const stack = err instanceof Error ? err.stack : "";
		console.error("Auth handler error:", msg, stack);
		return jsonErrorWithCors(c.req.raw, { error: "Authentication failed", code: "AUTH_ERROR" }, 503);
	}
});

// Image proxy: serve R2 images through our server (works even if R2 public access is disabled)
app.get("/api/images/*", async (c) => {
	const path = c.req.path.replace(/^\/api\/images\/?/, "") || "";
	if (!path) {
		return c.json({ error: "Missing image path" }, 400);
	}
	try {
		const object = await cloudflareEnv.BUCKET.get(path);
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

// Health check - lightweight, no DB/auth; use to verify Worker is running (helps debug 503/CORS)
app.get("/api/health", (c) => {
	return c.json({ ok: true, timestamp: new Date().toISOString() });
});

// Top-level fetch: OPTIONS first, then app; wrap ALL in try/catch so CORS is always on errors
export default {
	async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
		const origin = request.headers.get("Origin");

		// OPTIONS preflight - handle FIRST with minimal code path (no app, no auth)
		if (request.method === "OPTIONS") {
			const headers = buildCorsHeaders(origin);
			return new Response(null, { status: 204, headers });
		}

		try {
			const response = await app.fetch(request, env, ctx);
			return addCorsToResponse(response, request);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : String(err);
			const errStack = err instanceof Error ? err.stack : undefined;
			console.error("Worker fetch error:", errMsg, errStack);
			try {
				return jsonErrorWithCors(request, { error: "Service unavailable", code: "FETCH_ERROR" }, 503);
			} catch (fallbackErr) {
				// Last resort: minimal response with CORS (origin echo required for credentials)
				const h = new Headers({ "Content-Type": "application/json" });
				if (origin && isOriginAllowed(origin)) {
					h.set("Access-Control-Allow-Origin", origin);
					h.set("Access-Control-Allow-Credentials", "true");
				}
				return new Response('{"error":"Service unavailable"}', { status: 503, headers: h });
			}
		}
	},
};
