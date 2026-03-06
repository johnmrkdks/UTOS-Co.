import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@/trpc/context";
import { appRouter } from "@/trpc/routers/_app";
import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

// Parse CORS_ORIGIN - supports comma-separated list for multiple origins
const corsOrigins = (env.CORS_ORIGIN || "")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

app.use(
	"*",
	cors({
		origin: corsOrigins.length > 0 ? corsOrigins : ["http://localhost:3001", "http://localhost:3003"],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

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

export default app;
