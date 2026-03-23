import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "@/trpc/context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const guestProcedure = t.procedure.use(({ ctx, next }) => {
	// Allow both authenticated and anonymous sessions
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Session required (authenticated or guest)",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const superAdminProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	const role = (ctx.session.user as { role?: string })?.role;
	if (role !== "super_admin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Super Admin access required",
			cause: "Insufficient permissions",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});
