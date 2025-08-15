import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
	UserPlusIcon,
	MailIcon,
	ClipboardListIcon,
	CheckCircleIcon,
	ArrowDownIcon,
	InfoIcon,
	ShieldCheckIcon,
	KeyIcon
} from "lucide-react";

export function DriverProcessGuide() {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<InfoIcon className="h-5 w-5 text-blue-600" />
					Driver Onboarding Process
				</CardTitle>
				<CardDescription>
					Understanding the complete driver workflow for admins
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Process Steps */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">Process Steps</h3>
						<div className="space-y-3">
							<div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
								<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<UserPlusIcon className="h-4 w-4 text-blue-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-blue-900">1. Admin Creates Account</h4>
									<p className="text-sm text-blue-700 mt-1">
										Admin creates driver account with email and default password "changeme"
									</p>
									<Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800 border-blue-300">
										Account Status: Unverified
									</Badge>
								</div>
							</div>

							<div className="flex items-center justify-center">
								<ArrowDownIcon className="h-5 w-5 text-gray-400" />
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
								<div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<MailIcon className="h-4 w-4 text-yellow-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-yellow-900">2. Driver Email Verification</h4>
									<p className="text-sm text-yellow-700 mt-1">
										Driver logs in with temporary credentials and verifies email address
									</p>
									<Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-300">
										Can link Google OAuth
									</Badge>
								</div>
							</div>

							<div className="flex items-center justify-center">
								<ArrowDownIcon className="h-5 w-5 text-gray-400" />
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
								<div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<ClipboardListIcon className="h-4 w-4 text-purple-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-purple-900">3. Complete Onboarding</h4>
									<p className="text-sm text-purple-700 mt-1">
										Driver completes 3-step onboarding: Personal info, license details, emergency contact
									</p>
									<Badge variant="outline" className="mt-2 bg-purple-100 text-purple-800 border-purple-300">
										No Documents Required
									</Badge>
								</div>
							</div>

							<div className="flex items-center justify-center">
								<ArrowDownIcon className="h-5 w-5 text-gray-400" />
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
								<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<CheckCircleIcon className="h-4 w-4 text-green-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-green-900">4. Admin Approval</h4>
									<p className="text-sm text-green-700 mt-1">
										Admin reviews application and approves driver for activation
									</p>
									<Badge variant="outline" className="mt-2 bg-green-100 text-green-800 border-green-300">
										Ready to Drive
									</Badge>
								</div>
							</div>
						</div>
					</div>

					{/* Key Features */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">Key Features</h3>
						<div className="space-y-3">
							<div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
								<div className="flex items-center gap-2 mb-2">
									<KeyIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Default Password System</h4>
								</div>
								<p className="text-sm text-gray-600">
									All new drivers get "changeme" as default password. Encourage them to change it on first login.
								</p>
							</div>

							<div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
								<div className="flex items-center gap-2 mb-2">
									<MailIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Email Verification Required</h4>
								</div>
								<p className="text-sm text-gray-600">
									Drivers must verify their email before completing onboarding. This ensures valid contact information.
								</p>
							</div>

							<div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
								<div className="flex items-center gap-2 mb-2">
									<ShieldCheckIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Google OAuth Integration</h4>
								</div>
								<p className="text-sm text-gray-600">
									After email verification, drivers can link their Google account for easier future logins.
								</p>
							</div>

							<div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
								<div className="flex items-center gap-2 mb-2">
									<ClipboardListIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Simplified Onboarding</h4>
								</div>
								<p className="text-sm text-gray-600">
									No document uploads required. Focus on essential information: personal details, license, and emergency contact.
								</p>
							</div>
						</div>

						<div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
							<h4 className="font-medium text-blue-900 mb-2">Admin Tips</h4>
							<ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
								<li>Monitor the "Driver Accounts" tab for verification status</li>
								<li>Follow up with drivers who haven't verified their email</li>
								<li>Review onboarding applications in "Applications" tab</li>
								<li>Document verification can be added later if needed</li>
							</ul>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
