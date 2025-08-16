import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useNavigate } from "@tanstack/react-router";
import { useEmailVerificationGuard } from "@/hooks/auth/use-email-verification-guard";
import { 
	AlertTriangle, 
	Mail, 
	X, 
	Shield,
	CheckCircle 
} from "lucide-react";

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
	message 
}: EmailVerificationBannerProps) {
	const [isDismissed, setIsDismissed] = useState(false);
	const navigate = useNavigate();
	const { isEmailVerified, hasEmail, user } = useEmailVerificationGuard();

	// Don't show banner if user is verified, has no email, or banner is dismissed
	if (isEmailVerified || !hasEmail || !user || isDismissed) {
		return null;
	}

	const defaultMessage = "Verify your email address to unlock all driver features and receive important notifications";

	return (
		<div className={`
			bg-gradient-to-r from-yellow-50 to-orange-50 
			border border-yellow-200 
			${compact ? 'p-3' : 'p-4'} 
			rounded-lg 
			shadow-sm
		`}>
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0">
					<div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
						<Mail className="h-4 w-4 text-yellow-600" />
					</div>
				</div>
				
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-2">
						<h4 className="text-sm font-semibold text-yellow-900">
							Email Verification Required
						</h4>
						<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
							<AlertTriangle className="h-3 w-3 mr-1" />
							Unverified
						</Badge>
					</div>
					
					<p className="text-sm text-yellow-800 mb-3">
						{message || defaultMessage}
					</p>

					<div className="text-xs text-yellow-700 mb-3">
						<strong>Email:</strong> {user.email}
					</div>

					{!compact && (
						<div className="bg-white/50 rounded-md p-3 mb-3">
							<h5 className="text-xs font-medium text-yellow-900 mb-2">
								🔓 Features requiring verification:
							</h5>
							<ul className="text-xs text-yellow-800 space-y-1">
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

					<div className="flex flex-col sm:flex-row gap-2">
						<Button
							size="sm"
							onClick={() => navigate({ to: "/driver/verify-email" })}
							className="bg-yellow-600 hover:bg-yellow-700 text-white"
						>
							<Mail className="h-4 w-4 mr-1" />
							Verify Email Now
						</Button>
						
						{compact && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate({ to: "/driver/verify-email" })}
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
						className="flex-shrink-0 p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
						aria-label="Dismiss notification"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
}