import type { Context as HonoContext } from "hono";
import { auth } from "@/lib/auth";
import { db, type DB } from "@/db";

export type CreateContextOptions = {
	context: HonoContext;
};

type TRPCContext = {
	session: Awaited<ReturnType<typeof auth.api.getSession>>;
	db: DB;
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
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
