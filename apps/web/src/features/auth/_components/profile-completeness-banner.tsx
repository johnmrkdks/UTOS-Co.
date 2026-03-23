import { Card, CardContent } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, CheckCircle, User } from "lucide-react";
import { useProfileCompletenessQuery } from "@/features/auth/_hooks/query/use-profile-completeness-query";
import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";

type ProfileCompletenessBannerProps = {
	className?: string;
	showOnComplete?: boolean;
};

export function ProfileCompletenessBanner({ 
	className, 
	showOnComplete = false 
}: ProfileCompletenessBannerProps) {
	const { data: rawCompleteness, isLoading } = useProfileCompletenessQuery();

	// Provide default values if the query returns empty object
	const completeness = {
		isComplete: false,
		completeness: 0,
		missingFields: [] as string[],
		...(rawCompleteness && typeof rawCompleteness === 'object' ? rawCompleteness : {})
	};

	if (isLoading) {
		return null;
	}

	// Hide banner if profile is complete and showOnComplete is false
	if (completeness.isComplete && !showOnComplete) {
		return null;
	}

	return (
		<Card className={cn("border-l-4", {
			"border-l-green-500": completeness.isComplete,
			"border-l-yellow-500": completeness.completeness > 50 && !completeness.isComplete,
			"border-l-red-500": completeness.completeness <= 50,
		}, className)}>
			<CardContent className="pt-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-3">
						<div className={cn("rounded-full p-2", {
							"bg-green-100 text-green-600": completeness.isComplete,
							"bg-yellow-100 text-yellow-600": completeness.completeness > 50 && !completeness.isComplete,
							"bg-red-100 text-red-600": completeness.completeness <= 50,
						})}>
							{completeness.isComplete ? (
								<CheckCircle className="h-5 w-5" />
							) : (
								<AlertCircle className="h-5 w-5" />
							)}
						</div>
						
						<div className="flex-1">
							<h3 className="font-semibold text-sm">
								{completeness.isComplete 
									? "Profile Complete" 
									: "Complete Your Profile"
								}
							</h3>
							
							<p className="text-sm text-muted-foreground mt-1">
								{completeness.isComplete 
									? "Your profile is complete and ready for bookings."
									: `Complete your profile to ensure smooth booking experiences. ${completeness.missingFields.length} fields remaining.`
								}
							</p>

							{/* Progress Bar */}
							<div className="mt-3 space-y-2">
								<div className="flex justify-between text-xs">
									<span>Profile completion</span>
									<span>{completeness.completeness}%</span>
								</div>
								<Progress 
									value={completeness.completeness} 
									className="h-2"
								/>
							</div>

							{/* Missing Fields */}
							{!completeness.isComplete && completeness.missingFields.length > 0 && (
								<div className="mt-3">
									<p className="text-xs text-muted-foreground mb-2">Missing information:</p>
									<div className="flex flex-wrap gap-1">
										{completeness.missingFields.map((field: string) => (
											<span 
												key={field}
												className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground capitalize"
											>
												{field}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Action Button */}
					<div className="ml-4">
						<Link to="/profile">
							<Button variant="outline" size="sm" className="text-xs">
								<User className="h-3 w-3 mr-1" />
								{completeness.isComplete ? "View Profile" : "Complete Profile"}
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}