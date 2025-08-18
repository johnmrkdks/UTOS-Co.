import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import {
	UserIcon,
	ShieldCheckIcon,
	ClockIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	CarIcon,
	FileTextIcon,
	ChevronDownIcon,
	ChevronUpIcon
} from "lucide-react";
import { cn } from '@workspace/ui/lib/utils';

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
	isFullyOnboarded
}: DriverStatusAccordionProps) {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	if (isFullyOnboarded) {
		return null; // Don't show accordion for fully onboarded drivers
	}

	// Define stage-based styles using cn utility
	const getStageStyles = (stage: string) => ({
		card: cn(
			"p-3 md:p-4 transition-all duration-200",
			stage === 'not_registered' && 'border-red-200 bg-red-50',
			stage === 'profile_incomplete' && 'border-yellow-200 bg-yellow-50',
			stage === 'pending_approval' && 'border-blue-200 bg-blue-50',
			stage === 'approved_inactive' && 'border-green-200 bg-green-50'
		),
		iconContainer: cn(
			"w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center",
			stage === 'not_registered' && 'bg-red-100',
			stage === 'profile_incomplete' && 'bg-yellow-100',
			stage === 'pending_approval' && 'bg-blue-100',
			stage === 'approved_inactive' && 'bg-green-100'
		),
		title: cn(
			"text-sm md:text-base font-semibold",
			stage === 'not_registered' && 'text-red-900',
			stage === 'profile_incomplete' && 'text-yellow-900',
			stage === 'pending_approval' && 'text-blue-900',
			stage === 'approved_inactive' && 'text-green-900'
		),
		description: cn(
			"text-xs md:text-sm",
			stage === 'not_registered' && 'text-red-700',
			stage === 'profile_incomplete' && 'text-yellow-700',
			stage === 'pending_approval' && 'text-blue-700',
			stage === 'approved_inactive' && 'text-green-700'
		),
		badge: cn(
			"px-2 py-1 font-medium text-xs md:text-xs",
			stage === 'not_registered' && 'bg-red-100 text-red-800 border-red-300',
			stage === 'profile_incomplete' && 'bg-yellow-100 text-yellow-800 border-yellow-300',
			stage === 'pending_approval' && 'bg-blue-100 text-blue-800 border-blue-300',
			stage === 'approved_inactive' && 'bg-green-100 text-green-800 border-green-300'
		)
	});

	const stageStyles = getStageStyles(currentStage.stage);

	// Define stage content
	const stageContent = {
		'not_registered': {
			title: 'Driver Profile Required',
			description: 'Create your driver profile to get started',
			icon: <AlertCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
		},
		'profile_incomplete': {
			title: 'Complete Your Profile',
			description: 'Add required information to submit for approval',
			icon: <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
		},
		'pending_approval': {
			title: 'Application Under Review',
			description: 'Our team is reviewing your application',
			icon: <ClockIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
		},
		'approved_inactive': {
			title: 'Almost Ready to Drive!',
			description: 'Activate your account to start accepting rides',
			icon: <ShieldCheckIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
		}
	};

	const content = stageContent[currentStage.stage as keyof typeof stageContent];

	return (
		<Card className={cn("p-0", stageStyles.card)}>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger asChild>
					<CardHeader className="cursor-pointer hover:bg-black/5 transition-colors px-0 md:py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
								<div className={stageStyles.iconContainer}>
									{content.icon}
								</div>
								<div className="min-w-0 flex-1">
									<CardTitle className={stageStyles.title}>
										{content.title}
									</CardTitle>
									<CardDescription className={cn(stageStyles.description, "hidden md:block")}>
										{content.description}
									</CardDescription>
								</div>
							</div>
							<div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
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
					<CardContent className="space-y-3 md:space-y-4 pt-0 px-0 md:px-4">
						<div className="flex gap-1 md:gap-2 items-center">
							<Badge variant="outline" className={stageStyles.badge}>
								{currentStage.progress}%
							</Badge>
							<Progress value={currentStage.progress} className="w-full h-1.5 md:h-2" />
						</div>

						{/* Mobile Status Description */}
						<div className="md:hidden px-3">
							<p className="text-xs text-gray-600">{content.description}</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
							{/* Profile Status */}
							<div className={cn(
								"flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border",
								"min-h-[3rem] md:min-h-[auto]"
							)}>
								<div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
									{driverStatus.profileComplete ? (
										<CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
									) : (
										<AlertCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-yellow-600 flex-shrink-0" />
									)}
									<div className="min-w-0 flex-1">
										<p className="font-medium text-xs md:text-xs">Profile Complete</p>
										<p className="text-xs text-gray-600 hidden md:block">License & Contact Info</p>
									</div>
								</div>
								<Badge
									variant={driverStatus.profileComplete ? "default" : "secondary"}
									className={cn(
										"text-xs flex-shrink-0 px-1.5 py-0.5 md:px-2 md:py-1",
										driverStatus.profileComplete ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
									)}
								>
									{driverStatus.profileComplete ? "Done" : "Required"}
								</Badge>
							</div>

							{/* Admin Approval Status */}
							<div className={cn(
								"flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border",
								"min-h-[3rem] md:min-h-[auto]"
							)}>
								<div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
									{driverStatus.adminApproved ? (
										<CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
									) : (
										<ClockIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
									)}
									<div className="min-w-0 flex-1">
										<p className="font-medium text-xs md:text-xs">Admin Approval</p>
										<p className="text-xs text-gray-600 hidden md:block">Background Check</p>
									</div>
								</div>
								<Badge
									variant={driverStatus.adminApproved ? "default" : "outline"}
									className={cn(
										"text-xs flex-shrink-0 px-1.5 py-0.5 md:px-2 md:py-1",
										driverStatus.adminApproved ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700 border-blue-300"
									)}
								>
									{driverStatus.adminApproved ? "Approved" : "Pending"}
								</Badge>
							</div>

							{/* Documents Status */}
							<div className={cn(
								"flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border",
								"min-h-[3rem] md:min-h-[auto]"
							)}>
								<div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
									{driverStatus.documentsUploaded ? (
										<CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
									) : (
										<FileTextIcon className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
									)}
									<div className="min-w-0 flex-1">
										<p className="font-medium text-xs md:text-xs">Documents</p>
										<p className="text-xs text-gray-600 hidden md:block">License & Insurance</p>
									</div>
								</div>
								<Badge
									variant="outline"
									className="bg-gray-100 text-gray-600 text-xs flex-shrink-0 px-1.5 py-0.5 md:px-2 md:py-1"
								>
									{driverStatus.documentsUploaded ? "Uploaded" : "Optional"}
								</Badge>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-2 px-3 md:px-0">
							{currentStage.stage === 'profile_incomplete' && (
								<Button
									className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm h-8 md:h-9"
									onClick={() => navigate({ to: "/driver/onboarding" })}
									size="sm"
								>
									<UserIcon className="h-3 w-3 mr-1.5 md:mr-2" />
									Complete Profile Now
								</Button>
							)}
							{currentStage.stage === 'approved_inactive' && (
								<Button
									className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm h-8 md:h-9"
									onClick={() => {/* TODO: Implement activate account */ }}
									size="sm"
								>
									<CarIcon className="h-3 w-3 mr-1.5 md:mr-2" />
									Activate & Go Online
								</Button>
							)}
							<Button
								variant="outline"
								onClick={() => navigate({ to: "/driver/profile" })}
								size="sm"
								className="text-xs md:text-sm h-8 md:h-9"
							>
								<UserIcon className="h-3 w-3 mr-1.5 md:mr-2" />
								View Profile
							</Button>
						</div>
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	);
}
