import { getMailService } from "@workspace/mail";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { invoiceSentLogs } from "@/db/sqlite/schema/invoice-sent-logs";
import { users } from "@/db/sqlite/schema/users";
import {
	GetCompanyInvoiceDataSchema,
	getCompanyInvoiceDataService,
} from "@/services/invoices/get-company-invoice-data";
import {
	GetDriverInvoiceDataSchema,
	getDriverInvoiceDataService,
} from "@/services/invoices/get-driver-invoice-data";
import { listInvoiceCompaniesService } from "@/services/invoices/list-invoice-companies";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";

async function requireAdmin(db: any, userId: string) {
	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	const role = user?.role;
	if (role !== "admin" && role !== "super_admin") {
		throw new Error("Admin access required");
	}
}

export const invoicesRouter = router({
	getDriverInvoice: protectedProcedure
		.input(GetDriverInvoiceDataSchema)
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) throw new Error("Unauthorized");
				await requireAdmin(db, userId);

				return await getDriverInvoiceDataService(db, input);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	getCompanyInvoice: protectedProcedure
		.input(GetCompanyInvoiceDataSchema)
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) throw new Error("Unauthorized");
				await requireAdmin(db, userId);

				return await getCompanyInvoiceDataService(db, input);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	listCompanies: protectedProcedure.query(async ({ ctx: { db, session } }) => {
		try {
			const userId = session?.user?.id || session?.session?.userId;
			if (!userId) throw new Error("Unauthorized");
			await requireAdmin(db, userId);

			return await listInvoiceCompaniesService(db);
		} catch (error) {
			handleTRPCError(error);
		}
	}),

	sendDriverInvoice: protectedProcedure
		.input(
			z.object({
				driverId: z.string(),
				driverEmail: z.string().email(),
				driverName: z.string(),
				startDate: z.coerce.date(),
				endDate: z.coerce.date(),
				commissionRate: z.number().min(1).max(100),
				pdfBase64: z.string(),
			}),
		)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) throw new Error("Unauthorized");
				await requireAdmin(db, userId);

				const sanitize = (s: string) =>
					s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
				const filename = `${sanitize(input.driverName)}_${input.endDate.toISOString().slice(0, 10)}.pdf`;
				const pdfBuffer = Buffer.from(input.pdfBase64, "base64");

				const mailService = getMailService(env);
				const success = await mailService.sendEmail({
					to: input.driverEmail,
					subject: "Your Commission Invoice - Down Under Chauffeurs",
					html: `
						<p>Hi ${input.driverName},</p>
						<p>Please find your commission invoice attached for the period ${input.startDate.toISOString().slice(0, 10)} to ${input.endDate.toISOString().slice(0, 10)}.</p>
						<p>If you have any questions, please contact us.</p>
						<p>Best regards,<br/>Down Under Chauffeurs</p>
					`,
					attachments: [
						{
							filename,
							content: pdfBuffer,
							contentType: "application/pdf",
						},
					],
				});

				if (!success) throw new Error("Failed to send email");

				await db.insert(invoiceSentLogs).values({
					type: "driver",
					recipientName: input.driverName,
					recipientEmail: input.driverEmail,
					periodStart: input.startDate,
					periodEnd: input.endDate,
					sentByUserId: userId,
				});

				return { success: true };
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	sendCompanyInvoice: protectedProcedure
		.input(
			z.object({
				companyName: z.string().min(1),
				companyEmail: z.string().email(),
				startDate: z.coerce.date(),
				endDate: z.coerce.date(),
				pdfBase64: z.string(),
			}),
		)
		.mutation(async ({ ctx: { db, session, env }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) throw new Error("Unauthorized");
				await requireAdmin(db, userId);

				const sanitize = (s: string) =>
					s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
				const filename = `${sanitize(input.companyName)}_${input.endDate.toISOString().slice(0, 10)}.pdf`;
				const pdfBuffer = Buffer.from(input.pdfBase64, "base64");

				const mailService = getMailService(env);
				const success = await mailService.sendEmail({
					to: input.companyEmail,
					subject: "Tax Invoice - Down Under Chauffeurs",
					html: `
						<p>Dear ${input.companyName},</p>
						<p>Please find your tax invoice attached for the period ${input.startDate.toISOString().slice(0, 10)} to ${input.endDate.toISOString().slice(0, 10)}.</p>
						<p>If you have any questions, please contact us.</p>
						<p>Best regards,<br/>Down Under Chauffeurs</p>
					`,
					attachments: [
						{
							filename,
							content: pdfBuffer,
							contentType: "application/pdf",
						},
					],
				});

				if (!success) throw new Error("Failed to send email");

				await db.insert(invoiceSentLogs).values({
					type: "company",
					recipientName: input.companyName,
					recipientEmail: input.companyEmail,
					periodStart: input.startDate,
					periodEnd: input.endDate,
					sentByUserId: userId,
				});

				return { success: true };
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	listSentLogs: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(50),
					offset: z.number().min(0).default(0),
					type: z.enum(["driver", "company"]).optional(),
				})
				.optional(),
		)
		.query(async ({ ctx: { db, session }, input }) => {
			try {
				const userId = session?.user?.id || session?.session?.userId;
				if (!userId) throw new Error("Unauthorized");
				await requireAdmin(db, userId);

				const opts: {
					limit?: number;
					offset?: number;
					type?: "driver" | "company";
				} = input ?? {};
				const limit = opts.limit ?? 50;
				const offset = opts.offset ?? 0;
				const whereCondition = opts.type
					? eq(invoiceSentLogs.type, opts.type)
					: undefined;

				const logs = await db
					.select()
					.from(invoiceSentLogs)
					.where(whereCondition)
					.orderBy(desc(invoiceSentLogs.createdAt))
					.limit(limit)
					.offset(offset);

				const countResult = await db
					.select({ count: count(invoiceSentLogs.id) })
					.from(invoiceSentLogs)
					.where(whereCondition);

				return { items: logs, total: countResult[0]?.count ?? 0 };
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
