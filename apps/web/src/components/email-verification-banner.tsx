import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { AlertTriangle, CheckCircle, Mail, Shield, X } from "lucide-react";
import { useState } from "react";
import { useEmailVerificationGuard } from "@/hooks/auth/use-email-verification-guard";

interface EmailVerificationBannerProps {
	/** Whether to show a dismissible close button */
	dismissible?: boolean;
	/** Compact version with less padding */
	compact?: boolean;
	/** Custom message override */
	message?: string;
}

export function EmailVerificationBanner({
	dismissible = true,
	compact = false,
	message,
}: EmailVerificationBannerProps) {
	const [isDismissed, setIsDismissed] = useState(false);
	const navigate = useNavigate();
	const { isEmailVerified, hasEmail, user } = useEmailVerificationGuard();

	// Don't show banner if user is verified, has no email, or banner is dismissed
	if (isEmailVerified || !hasEmail || !user || isDismissed) {
		return null;
	}

	const defaultMessage =
		"Verify your email address to unlock all driver features and receive important notifications";

	return (
		<div
			className={`border bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200${compact ? "p-3" : "p-4"} rounded-lg shadow-sm`}
		>
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
						<Mail className="h-4 w-4 text-yellow-600" />
					</div>
				</div>

				<div className="min-w-0 flex-1">
					<div className="mb-2 flex items-center gap-2">
						<h4 className="font-semibold text-sm text-yellow-900">
							Email Verification Required
						</h4>
						<Badge
							variant="secondary"
							className="bg-yellow-100 text-yellow-800"
						>
							<AlertTriangle className="mr-1 h-3 w-3" />
							Unverified
						</Badge>
					</div>

					<p className="mb-3 text-sm text-yellow-800">
						{message || defaultMessage}
					</p>

					<div className="mb-3 text-xs text-yellow-700">
						<strong>Email:</strong> {user.email}
					</div>

					{!compact && (
						<div className="mb-3 rounded-md bg-white/50 p-3">
							<h5 className="mb-2 font-medium text-xs text-yellow-900">
								🔓 Features requiring verification:
							</h5>
							<ul className="space-y-1 text-xs text-yellow-800">
								<li className="flex items-center gap-1">
									<Shield className="h-3 w-3" />
									Document upload and onboarding completion
								</li>
								<li className="flex items-center gap-1">
									<Mail className="h-3 w-3" />
									Email notifications for bookings
								</li>
								<li className="flex items-center gap-1">
									<CheckCircle className="h-3 w-3" />
									Full account security features
								</li>
							</ul>
						</div>
					)}

					<div className="flex flex-col gap-2 sm:flex-row">
						<Button
							size="sm"
							onClick={() => navigate({ to: "/driver/settings" })}
							className="bg-yellow-600 text-white hover:bg-yellow-700"
						>
							<Mail className="mr-1 h-4 w-4" />
							Verify Email Now
						</Button>

						{compact && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate({ to: "/driver/settings" })}
								className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
							>
								Learn More
							</Button>
						)}
					</div>
				</div>

				{dismissible && (
					<button
						onClick={() => setIsDismissed(true)}
						className="flex-shrink-0 p-1 text-yellow-600 transition-colors hover:text-yellow-800"
						aria-label="Dismiss notification"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
}
