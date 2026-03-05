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
	req: Request;
};

export async function createContext({
	context,
}: CreateContextOptions): Promise<TRPCContext> {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	return {
		session,
		db,
		env: context.env,
		req: context.req.raw,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
