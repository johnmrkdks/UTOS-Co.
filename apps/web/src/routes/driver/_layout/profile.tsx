import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Progress } from "@workspace/ui/components/progress";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { PersonalInfoTab } from '@/features/driver/_components/profile-tabs/personal-info-tab';
import { DocumentsTab } from '@/features/driver/_components/profile-tabs/documents-tab';
import { StatisticsTab } from '@/features/driver/_components/profile-tabs/statistics-tab';
import { SettingsTab } from '@/features/driver/_components/profile-tabs/settings-tab';
import {
	CheckCircleIcon,
	ArrowLeftIcon
} from "lucide-react";

export const Route = createFileRoute('/driver/_layout/profile')({
	component: DriverProfileComponent,
});


function DriverProfileComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();

	const user = session?.user;

	// Mock driver profile data - in real app, this would come from API
	const driverProfile = {
		personalInfo: {
			name: user?.name || "",
			email: user?.email || "",
			phoneNumber: "+61 412 345 678",
			address: "123 Collins Street, Melbourne VIC 3000",
			dateOfBirth: "1990-05-15",
		},
		emergencyContact: {
			name: "Sarah Johnson",
			phone: "+61 423 456 789",
		},
		licenseInfo: {
			number: "VIC123456789",
			expiry: "2025-12-31",
		},
		applicationStatus: {
			submitted: true,
			underReview: true,
			approved: false,
			active: false,
		},
		documents: {
			license: { uploaded: false, approved: false },
			insurance: { uploaded: false, approved: false },
			background: { uploaded: false, approved: false },
			photo: { uploaded: false, approved: false },
		},
		statistics: {
			totalTrips: 87,
			averageRating: 4.8,
			totalEarnings: 2850.50,
			memberSince: "2024-01-15",
		}
	};


	const handleBack = () => {
		navigate({ to: '/driver' });
	};

	const applicationSteps = [
		{ key: 'submitted', label: 'Application Submitted', completed: driverProfile.applicationStatus.submitted },
		{ key: 'underReview', label: 'Under Review', completed: driverProfile.applicationStatus.underReview },
		{ key: 'approved', label: 'Approved', completed: driverProfile.applicationStatus.approved },
		{ key: 'active', label: 'Active Driver', completed: driverProfile.applicationStatus.active },
	];

	const completedSteps = applicationSteps.filter(step => step.completed).length;
	const progressPercentage = (completedSteps / applicationSteps.length) * 100;

	return (
		<div className="max-w-4xl mx-auto space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack} className="hidden md:flex">
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Dashboard
				</Button>
				<div className="text-right md:text-right text-left flex-1 md:flex-none">
					<h1 className="text-xl font-bold">Driver Profile</h1>
					<p className="text-gray-600 text-sm">Manage your driver information</p>
				</div>
			</div>

			{/* Application Status Overview */}
			<Card className="border-blue-200 bg-blue-50">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-blue-900 text-base">Application Status</CardTitle>
							<CardDescription className="text-blue-700 text-sm">
								{completedSteps} of {applicationSteps.length} steps completed
							</CardDescription>
						</div>
						<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
							{driverProfile.applicationStatus.active ? 'Active' :
								driverProfile.applicationStatus.approved ? 'Approved' :
									driverProfile.applicationStatus.underReview ? 'Under Review' : 'Pending'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<Progress value={progressPercentage} className="w-full h-2" />

					<div className="flex justify-between items-center">
						{applicationSteps.map((step, index) => (
							<div key={step.key} className="flex flex-col items-center text-center">
								<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step.completed
										? 'bg-green-500 text-white'
										: index === completedSteps
											? 'bg-blue-500 text-white'
											: 'bg-gray-200 text-gray-600'
									}`}>
									{step.completed ? <CheckCircleIcon className="h-3 w-3" /> : index + 1}
								</div>
								<span className="text-xs mt-1 text-center max-w-12">{step.label}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="personal" className="space-y-4">
				<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
					<TabsTrigger value="personal" className="text-xs py-2">Personal</TabsTrigger>
					<TabsTrigger value="documents" className="text-xs py-2">Documents</TabsTrigger>
					<TabsTrigger value="stats" className="text-xs py-2">Statistics</TabsTrigger>
					<TabsTrigger value="settings" className="text-xs py-2">Settings</TabsTrigger>
				</TabsList>

				{/* Personal Information Tab */}
				<TabsContent value="personal" className="space-y-4">
					<PersonalInfoTab 
						driverProfile={driverProfile}
						userEmail={user?.email}
						userName={user?.name}
					/>
				</TabsContent>

				{/* Documents Tab */}
				<TabsContent value="documents" className="space-y-4">
					<DocumentsTab driverProfile={driverProfile} />
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value="stats" className="space-y-4">
					<StatisticsTab driverProfile={driverProfile} />
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="space-y-4">
					<SettingsTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
