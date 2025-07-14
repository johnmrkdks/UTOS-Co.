import { auth } from "@/lib/auth";
import { router } from "@/trpc/init";
import { publicProcedure } from "@/trpc/init";
import { z } from "zod";

export const authRouter = router({
	sigIn: publicProcedure
		.input(
			z.object({
				email: z.string(),
				password: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			await auth.api.signInEmail({
				body: {
					email: input.email,
					password: input.password,
				},
			});
		}),
	signUp: publicProcedure
		.input(
			z.object({
				email: z.string(),
				password: z.string(),
				name: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			await auth.api.signUpEmail({
				body: {
					email: input.email,
					password: input.password,
					name: input.name,
				},
			});
		}),
});
