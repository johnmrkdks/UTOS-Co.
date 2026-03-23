import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { User, UserPlus } from "lucide-react";

const QUOTE_STORAGE_KEY = "booking_quote_flow";

export interface StoredQuoteData {
	quote: unknown;
	routeData: unknown;
	selectedCarId: string;
	step: string;
}

export function persistQuoteForRedirect(data: StoredQuoteData) {
	try {
		sessionStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Ignore storage errors
	}
}

export function getPersistedQuote(): StoredQuoteData | null {
	try {
		const raw = sessionStorage.getItem(QUOTE_STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as StoredQuoteData;
	} catch {
		return null;
	}
}

export function clearPersistedQuote() {
	try {
		sessionStorage.removeItem(QUOTE_STORAGE_KEY);
	} catch {
		// Ignore
	}
}

interface BookingAuthChoiceStepProps {
	onContinueAsGuest: () => void;
	onCreateAccount: () => void;
	onBack: () => void;
}

export function BookingAuthChoiceStep({
	onContinueAsGuest,
	onCreateAccount,
	onBack,
}: BookingAuthChoiceStepProps) {
	const navigate = useNavigate();

	const handleCreateAccount = () => {
		// Persist will be done by parent before navigating
		onCreateAccount();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					How would you like to proceed?
				</CardTitle>
				<CardDescription>
					Choose to book as a guest or create an account to manage your bookings
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Button
					variant="outline"
					className="h-auto w-full justify-start py-4"
					onClick={onContinueAsGuest}
				>
					<User className="mr-3 h-5 w-5" />
					<div className="text-left">
						<div className="font-medium">Continue as guest</div>
						<div className="font-normal text-muted-foreground text-sm">
							Book without creating an account. You can still track your
							booking.
						</div>
					</div>
				</Button>

				<Button
					variant="outline"
					className="h-auto w-full justify-start py-4"
					onClick={handleCreateAccount}
				>
					<UserPlus className="mr-3 h-5 w-5" />
					<div className="text-left">
						<div className="font-medium">Create an account</div>
						<div className="font-normal text-muted-foreground text-sm">
							Sign up to save your details and view booking history.
						</div>
					</div>
				</Button>

				<div className="pt-4">
					<Button type="button" variant="ghost" onClick={onBack}>
						Back
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
