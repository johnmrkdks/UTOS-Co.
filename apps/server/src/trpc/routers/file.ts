import {
	CreatePresignedUrlServiceSchema,
	createPresignedUrlService,
} from "@/services/file/create-presigned-url";
import { publicProcedure, router } from "../init";

export const fileRouter = router({
	createPresignedUrl: publicProcedure
		.input(CreatePresignedUrlServiceSchema)
		.mutation(async ({ input }) => {
			return await createPresignedUrlService(input);
		}),
});
