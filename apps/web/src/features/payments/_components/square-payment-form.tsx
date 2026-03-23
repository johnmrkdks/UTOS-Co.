/**
 * Square Web Payments SDK - Card, Apple Pay.
 * Tokenizes payment and calls backend to authorize (delayed capture).
 * Shows clear errors for card declined, insufficient funds, invalid CVV, etc.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Loader2, AlertCircle } from "lucide-react";

function getSquareSdkUrl(applicationId: string): string {
	return applicationId.startsWith("sandbox-")
		? "https://sandbox.web.squarecdn.com/v1/square.js"
		: "https://web.squarecdn.com/v1/square.js";
}

// Square Web Payments SDK types
interface PaymentRequest {
	total: { amount: string; label: string };
	countryCode: string;
	currencyCode: string;
}

interface TokenResult {
	status: string;
	token?: string;
	errors?: unknown[];
}

interface PaymentsInstance {
	card: () => Promise<{
		attach: (selector: string) => Promise<unknown>;
		tokenize: (opts?: object) => Promise<{ token: string }>;
	}>;
	paymentRequest: (opts: {
		countryCode: string;
		currencyCode: string;
		total: { amount: string; label: string };
	}) => PaymentRequest;
	applePay: (paymentRequest: PaymentRequest) => Promise<{
		tokenize: () => Promise<TokenResult>;
	}>;
}

declare global {
	interface Window {
		Square?: {
			payments: (applicationId: string, locationId: string) => Promise<PaymentsInstance>;
		};
	}
}

interface SquarePaymentFormProps {
	applicationId: string;
	locationId: string;
	amountCents: number;
	bookingId: string;
	onAuthorized: () => void;
	onError: (message: string) => void;
	/** Optional: payment method ID if using saved card */
	paymentMethodId?: string | null;
}

export function SquarePaymentForm({
	applicationId,
	locationId,
	amountCents,
	bookingId,
	onAuthorized,
	onError,
	paymentMethodId,
}: SquarePaymentFormProps) {
	const cardContainerRef = useRef<HTMLDivElement>(null);
	const [isReady, setIsReady] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [applePayAvailable, setApplePayAvailable] = useState(false);
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const paymentsRef = useRef<PaymentsInstance | null>(null);
	const cardRef = useRef<Awaited<ReturnType<PaymentsInstance["card"]>> | null>(null);
	const applePayRef = useRef<Awaited<ReturnType<PaymentsInstance["applePay"]>> | null>(null);

	async function loadSquare() {
		if (window.Square) return window.Square;
		const sdkUrl = getSquareSdkUrl(applicationId);
		return new Promise<typeof window.Square>((resolve, reject) => {
			const script = document.createElement("script");
			script.src = sdkUrl;
			script.onload = () => resolve(window.Square);
			script.onerror = () => reject(new Error("Failed to load Square SDK"));
			document.head.appendChild(script);
		});
	}

	function extractPaymentError(err: unknown): string {
		if (err instanceof Error) return err.message;
		const data = (err as { data?: { message?: string } })?.data;
		if (data?.message) return data.message;
		return "Payment authorization failed. Please try again or use a different card.";
	}

	const authorizeWithToken = useCallback(
		async (token: string) => {
			setPaymentError(null);
			const { trpcClient } = await import("@/trpc");
			await trpcClient.payments.authorizeBookingPayment.mutate({
				bookingId,
				sourceId: token,
				amountCents,
				paymentMethodId: paymentMethodId ?? undefined,
			});
			onAuthorized();
		},
		[bookingId, amountCents, paymentMethodId, onAuthorized]
	);

	const tokenizeAndAuthorize = useCallback(
		async (tokenizeFn: () => Promise<TokenResult>) => {
			const tokenResult = await tokenizeFn();
			if (tokenResult.status === "OK" && tokenResult.token) {
				await authorizeWithToken(tokenResult.token);
			} else {
				const errMsg =
					tokenResult.errors && Array.isArray(tokenResult.errors)
						? (tokenResult.errors[0] as { message?: string })?.message ?? "Payment failed"
						: `Tokenization failed: ${tokenResult.status}`;
				throw new Error(errMsg);
			}
		},
		[authorizeWithToken]
	);

	const handlePaymentError = useCallback(
		(err: unknown) => {
			const msg = extractPaymentError(err);
			setPaymentError(msg);
			onError(msg);
		},
		[onError]
	);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const Square = await loadSquare();
				if (!mounted || !Square || !cardContainerRef.current) return;

				const payments = await Square.payments(applicationId, locationId);
				paymentsRef.current = payments;

				// Card form
				const card = await payments.card();
				cardRef.current = card;
				await card.attach("#card-container");

				// Payment request for digital wallets (AUD for Australia)
				const amountDollars = (amountCents / 100).toFixed(2);
				const paymentRequest = payments.paymentRequest({
					countryCode: "AU",
					currencyCode: "AUD",
					total: { amount: amountDollars, label: "Total" },
				});

				// Apple Pay - only available on Safari (iOS/macOS)
				try {
					const applePay = await payments.applePay(paymentRequest);
					applePayRef.current = applePay;
					if (mounted) setApplePayAvailable(true);
				} catch {
					// Apple Pay not supported (e.g. non-Safari, no Apple Pay setup)
					applePayRef.current = null;
				}

				if (mounted) setIsReady(true);
			} catch (err) {
				if (mounted) onError(err instanceof Error ? err.message : "Failed to initialize payment form");
			}
		})();

		return () => {
			mounted = false;
		};
	}, [applicationId, locationId, amountCents, onError]);

	async function handleCardSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!cardRef.current) return;
		setPaymentError(null);
		setIsSubmitting(true);
		try {
			const { token } = await cardRef.current.tokenize();
			if (!token) throw new Error("No payment token received");
			await authorizeWithToken(token);
		} catch (err) {
			handlePaymentError(err);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleApplePayClick(e: React.SyntheticEvent) {
		e.preventDefault();
		if (!applePayRef.current) return;
		setPaymentError(null);
		setIsSubmitting(true);
		try {
			await tokenizeAndAuthorize(() => applePayRef.current!.tokenize());
		} catch (err) {
			handlePaymentError(err);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="space-y-4">
			{/* Apple Pay - only available on Safari (iOS/macOS) */}
			<div className="flex flex-col gap-3">
				{applePayAvailable && (
					<>
						<p className="text-sm font-medium text-muted-foreground">Pay with</p>
						<div className="w-full min-w-[140px]">
							<button
								type="button"
								id="apple-pay-button"
								onClick={handleApplePayClick}
								disabled={!isReady || isSubmitting}
								className="flex h-12 w-full min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-black px-4 py-3 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Pay with Apple Pay"
							>
								{/* Apple logo + explicit "Pay with Apple Pay" text for readability */}
								<svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
									<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
								</svg>
								<span>Pay with Apple Pay</span>
							</button>
						</div>
						<div className="relative w-full">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">or pay with card</span>
							</div>
						</div>
					</>
				)}
			</div>

			<form onSubmit={handleCardSubmit} className="space-y-4">
				<div
					id="card-container"
					ref={cardContainerRef}
					className="min-h-[50px] rounded-lg border border-gray-200 bg-white p-3"
				/>
				<p className="text-xs text-muted-foreground">
					Your payment method will be authorized now and charged after your trip is completed.
				</p>
				{paymentError && (
					<div
						role="alert"
						className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
					>
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
						<span>{paymentError}</span>
					</div>
				)}
				<Button type="submit" disabled={!isReady || isSubmitting} className="w-full">
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Authorizing...
						</>
					) : (
						"Authorize Payment"
					)}
				</Button>
			</form>
		</div>
	);
}
