import type { Context as HonoContext } from "hono";
import { auth } from "@/lib/auth";
import { db, type DB } from "@/db";
import type { Env } from "@/types/env";

export type CreateContextOptions = {
	context: HonoContext<{ Bindings: Env }>;
};

type TRPCContext = {
	session: Awaited<ReturnType<typeof auth.api.getSession>>;
	db: DB;
	env: Env;
};

export async function createContext({
	context,
}: CreateContextOptions): Promise<TRPCContext> {
	// Debug logging for session issues
	console.log("🔍 tRPC Context - Request headers:", Object.fromEntries(context.req.raw.headers.entries()));
	
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	console.log("🔍 tRPC Context - Session result:", JSON.stringify(session, null, 2));

	return {
		session,
		db,
		env: context.env,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
