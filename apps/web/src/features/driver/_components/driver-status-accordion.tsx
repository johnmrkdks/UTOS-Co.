import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertCircleIcon,
	CarIcon,
	CheckCircleIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	ClockIcon,
	FileTextIcon,
	ShieldCheckIcon,
	UserIcon,
} from "lucide-react";
import { useState } from "react";

interface DriverStatusAccordionProps {
	currentStage: {
		stage: string;
		progress: number;
	};
	driverStatus: {
		profileComplete: boolean;
		documentsUploaded: boolean;
		adminApproved: boolean;
		isActive: boolean;
	};
	isFullyOnboarded: boolean;
}

export function DriverStatusAccordion({
	currentStage,
	driverStatus,
	isFullyOnboarded,
}: DriverStatusAccordionProps) {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	if (isFullyOnboarded) {
		return null; // Don't show accordion for fully onboarded drivers
	}

	// Define stage-based styles using cn utility
	const getStageStyles = (stage: string) => ({
		card: cn(
			"p-3 transition-all duration-200 md:p-4",
			stage === "not_registered" && "border-red-200 bg-red-50",
			stage === "profile_incomplete" && "border-yellow-200 bg-yellow-50",
			stage === "pending_approval" && "border-blue-200 bg-blue-50",
			stage === "approved_inactive" && "border-green-200 bg-green-50",
		),
		iconContainer: cn(
			"flex h-8 w-8 items-center justify-center rounded-full md:h-10 md:w-10",
			stage === "not_registered" && "bg-red-100",
			stage === "profile_incomplete" && "bg-yellow-100",
			stage === "pending_approval" && "bg-blue-100",
			stage === "approved_inactive" && "bg-green-100",
		),
		title: cn(
			"font-semibold text-sm md:text-base",
			stage === "not_registered" && "text-red-900",
			stage === "profile_incomplete" && "text-yellow-900",
			stage === "pending_approval" && "text-blue-900",
			stage === "approved_inactive" && "text-green-900",
		),
		description: cn(
			"text-xs md:text-sm",
			stage === "not_registered" && "text-red-700",
			stage === "profile_incomplete" && "text-yellow-700",
			stage === "pending_approval" && "text-blue-700",
			stage === "approved_inactive" && "text-green-700",
		),
		badge: cn(
			"px-2 py-1 font-medium text-xs md:text-xs",
			stage === "not_registered" && "border-red-300 bg-red-100 text-red-800",
			stage === "profile_incomplete" &&
				"border-yellow-300 bg-yellow-100 text-yellow-800",
			stage === "pending_approval" &&
				"border-blue-300 bg-blue-100 text-blue-800",
			stage === "approved_inactive" &&
				"border-green-300 bg-green-100 text-green-800",
		),
	});

	const stageStyles = getStageStyles(currentStage.stage);

	// Define stage content
	const stageContent = {
		not_registered: {
			title: "Driver Profile Required",
			description: "Create your driver profile to get started",
			icon: <AlertCircleIcon className="h-4 w-4 text-red-600 md:h-5 md:w-5" />,
		},
		profile_incomplete: {
			title: "Complete Your Profile",
			description: "Add required information to submit for approval",
			icon: <UserIcon className="h-4 w-4 text-yellow-600 md:h-5 md:w-5" />,
		},
		pending_approval: {
			title: "Application Under Review",
			description: "Our team is reviewing your application",
			icon: <ClockIcon className="h-4 w-4 text-blue-600 md:h-5 md:w-5" />,
		},
		approved_inactive: {
			title: "Almost Ready to Drive!",
			description: "Activate your account to start accepting rides",
			icon: (
				<ShieldCheckIcon className="h-4 w-4 text-green-600 md:h-5 md:w-5" />
			),
		},
	};

	const content = stageContent[currentStage.stage as keyof typeof stageContent];

	return (
		<Card className={cn("p-0", stageStyles.card)}>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger asChild>
					<CardHeader className="cursor-pointer px-0 transition-colors hover:bg-black/5 md:py-4">
						<div className="flex items-center justify-between">
							<div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
								<div className={stageStyles.iconContainer}>{content.icon}</div>
								<div className="min-w-0 flex-1">
									<CardTitle className={stageStyles.title}>
										{content.title}
									</CardTitle>
									<CardDescription
										className={cn(stageStyles.description, "hidden md:block")}
									>
										{content.description}
									</CardDescription>
								</div>
							</div>
							<div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
								{isOpen ? (
									<ChevronUpIcon className="h-4 w-4 text-gray-500" />
								) : (
									<ChevronDownIcon className="h-4 w-4 text-gray-500" />
								)}
							</div>
						</div>
					</CardHeader>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<CardContent className="space-y-3 px-0 pt-0 md:space-y-4 md:px-4">
						<div className="flex items-center gap-1 md:gap-2">
							<Badge variant="outline" className={stageStyles.badge}>
								{currentStage.progress}%
							</Badge>
							<Progress
								value={currentStage.progress}
								className="h-1.5 w-full md:h-2"
							/>
						</div>

						{/* Mobile Status Description */}
						<div className="px-3 md:hidden">
							<p className="text-gray-600 text-xs">{content.description}</p>
						</div>

						<div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
							{/* Profile Status */}
							<div
								className={cn(
									"flex items-center justify-between rounded-lg border bg-white p-2 md:p-3",
									"min-h-[3rem] md:min-h-[auto]",
								)}
							>
								<div className="flex min-w-0 flex-1 items-center gap-1.5 md:gap-2">
									{driverStatus.profileComplete ? (
										<CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-green-600 md:h-4 md:w-4" />
									) : (
										<AlertCircleIcon className="h-3 w-3 flex-shrink-0 text-yellow-600 md:h-4 md:w-4" />
									)}
									<div className="min-w-0 flex-1">
										<p className="font-medium text-xs md:text-xs">
											Profile Complete
										</p>
										<p className="hidden text-gray-600 text-xs md:block">
											License & Contact Info
										</p>
									</div>
								</div>
								<Badge
									variant={
										driverStatus.profileComplete ? "default" : "secondary"
									}
									className={cn(
										"flex-shrink-0 px-1.5 py-0.5 text-xs md:px-2 md:py-1",
										driverStatus.profileComplete
											? "bg-green-100 text-green-700"
											: "bg-yellow-100 text-yellow-700",
									)}
								>
									{driverStatus.profileComplete ? "Done" : "Required"}
								</Badge>
							</div>

							{/* Admin Approval Status */}
							<div
								className={cn(
									"flex items-center justify-between rounded-lg border bg-white p-2 md:p-3",
									"min-h-[3rem] md:min-h-[auto]",
								)}
							>
								<div className="flex min-w-0 flex-1 items-center gap-1.5 md:gap-2">
									{driverStatus.adminApproved ? (
										<CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-green-600 md:h-4 md:w-4" />
									) : (
										<ClockIcon className="h-3 w-3 flex-shrink-0 text-blue-600 md:h-4 md:w-4" />
									)}
									<div className="min-w-0 flex-1">
										<p className="font-medium text-xs md:text-xs">
											Admin Approval
										</p>
										<p className="hidden text-gray-600 text-xs md:block">
											Background Check
										</p>
									</div>
								</div>
								<Badge
									variant={driverStatus.adminApproved ? "default" : "outline"}
									className={cn(
										"flex-shrink-0 px-1.5 py-0.5 text-xs md:px-2 md:py-1",
										driverStatus.adminApproved
											? "bg-green-100 text-green-700"
											: "border-blue-300 bg-blue-100 text-blue-700",
									)}
								>
									{driverStatus.adminApproved ? "Approved" : "Pending"}
								</Badge>
							</div>

							{/* Documents Status */}
							<div
								className={cn(
									"flex items-center justify-between rounded-lg border bg-white p-2 md:p-3",
									"min-h-[3rem] md:min-h-[auto]",
								)}
							>
								<div className="flex min-w-0 flex-1 items-center gap-1.5 md:gap-2">
									{driverStatus.documentsUploaded ? (
										<CheckCircleIcon className="h-3 w-3 flex-shrink-0 text-green-600 md:h-4 md:w-4" />
									) : (
										<FileTextIcon className="h-3 w-3 flex-shrink-0 text-gray-400 md:h-4 md:w-4" />
									)}
									<div className="min-w-0 flex-1">
										<p className="font-medium text-xs md:text-xs">Documents</p>
										<p className="hidden text-gray-600 text-xs md:block">
											License & Insurance
										</p>
									</div>
								</div>
								<Badge
									variant="outline"
									className="flex-shrink-0 bg-gray-100 px-1.5 py-0.5 text-gray-600 text-xs md:px-2 md:py-1"
								>
									{driverStatus.documentsUploaded ? "Uploaded" : "Optional"}
								</Badge>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col gap-2 px-3 sm:flex-row md:px-0">
							{currentStage.stage === "profile_incomplete" && (
								<Button
									className="h-8 bg-yellow-600 text-white text-xs hover:bg-yellow-700 md:h-9 md:text-sm"
									onClick={() => navigate({ to: "/driver/onboarding" })}
									size="sm"
								>
									<UserIcon className="mr-1.5 h-3 w-3 md:mr-2" />
									Complete Profile Now
								</Button>
							)}
							{currentStage.stage === "approved_inactive" && (
								<Button
									className="h-8 bg-green-600 text-white text-xs hover:bg-green-700 md:h-9 md:text-sm"
									onClick={() => {
										/* TODO: Implement activate account */
									}}
									size="sm"
								>
									<CarIcon className="mr-1.5 h-3 w-3 md:mr-2" />
									Activate & Go Online
								</Button>
							)}
							<Button
								variant="outline"
								onClick={() => navigate({ to: "/driver/profile" })}
								size="sm"
								className="h-8 text-xs md:h-9 md:text-sm"
							>
								<UserIcon className="mr-1.5 h-3 w-3 md:mr-2" />
								View Profile
							</Button>
						</div>
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	);
}
