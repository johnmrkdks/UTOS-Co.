/**
 * Square Web Payments SDK - Card, Apple Pay, Google Pay.
 * Tokenizes payment and calls backend to authorize (delayed capture).
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";

const SQUARE_SDK_URL = "https://sandbox.web.squarecdn.com/v1/square.js";

declare global {
	interface Window {
		Square?: {
			payments: (applicationId: string, locationId: string) => Promise<{
				card: () => Promise<{ attach: (selector: string) => Promise<unknown>; tokenize: (opts?: object) => Promise<{ token: string }> }>;
				applePay: (opts: object) => Promise<{ attach: (selector: string) => Promise<unknown>; tokenize: (opts?: object) => Promise<{ token: string }> }>;
				googlePay: (opts: object) => Promise<{ attach: (selector: string) => Promise<unknown>; tokenize: (opts?: object) => Promise<{ token: string }> }>;
			}>;
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
	const paymentsRef = useRef<Awaited<ReturnType<Awaited<ReturnType<typeof loadSquare>>["payments"]>> | null>(null);
	const cardRef = useRef<Awaited<ReturnType<Awaited<ReturnType<typeof loadSquare>>["card"]>> | null>(null);

	async function loadSquare() {
		if (window.Square) return window.Square;
		return new Promise<typeof window.Square>((resolve, reject) => {
			const script = document.createElement("script");
			script.src = SQUARE_SDK_URL;
			script.onload = () => resolve(window.Square);
			script.onerror = () => reject(new Error("Failed to load Square SDK"));
			document.head.appendChild(script);
		});
	}

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const Square = await loadSquare();
				if (!mounted || !Square || !cardContainerRef.current) return;

				const payments = await Square.payments(applicationId, locationId);
				paymentsRef.current = payments;

				const card = await payments.card();
				cardRef.current = card;
				await card.attach("#card-container");
				if (mounted) setIsReady(true);
			} catch (err) {
				if (mounted) onError(err instanceof Error ? err.message : "Failed to initialize payment form");
			}
		})();

		return () => {
			mounted = false;
		};
	}, [applicationId, locationId, onError]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!cardRef.current || !paymentsRef.current) return;
		setIsSubmitting(true);

		try {
			const { token } = await cardRef.current.tokenize();
			if (!token) throw new Error("No payment token received");

			// Call tRPC to authorize payment
			const { trpcClient } = await import("@/trpc");
			await trpcClient.payments.authorizeBookingPayment.mutate({
				bookingId,
				sourceId: token,
				amountCents,
				paymentMethodId: paymentMethodId ?? undefined,
			});

			onAuthorized();
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: (err as { data?: { message?: string } })?.data?.message ?? "Payment authorization failed";
			onError(msg);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div
				id="card-container"
				ref={cardContainerRef}
				className="min-h-[50px] rounded-lg border border-gray-200 bg-white p-3"
			/>
			<p className="text-xs text-muted-foreground">
				Your payment method will be authorized now and charged after your trip is completed.
			</p>
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
	);
}
