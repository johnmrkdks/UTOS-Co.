/**
 * Square API client wrapper for payment operations.
 * Uses dynamic import to avoid loading the Square SDK at Worker startup (reduces CPU time limit).
 */
/** Get Square client - token + environment must match (sandbox token → sandbox API) */
export async function getSquareClient(
	accessToken: string,
	env: "sandbox" | "production" = "sandbox",
) {
	const { SquareClient, SquareEnvironment } = await import("square");
	const baseUrl = env === "sandbox" ? SquareEnvironment.Sandbox : SquareEnvironment.Production;
	return new SquareClient({
		token: accessToken,
		environment: baseUrl,
	});
}
