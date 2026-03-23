import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	ArrowDownIcon,
	CheckCircleIcon,
	ClipboardListIcon,
	InfoIcon,
	KeyIcon,
	MailIcon,
	ShieldCheckIcon,
	UserPlusIcon,
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
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Process Steps */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">Process Steps</h3>
						<div className="space-y-3">
							<div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
								<div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
									<UserPlusIcon className="h-4 w-4 text-blue-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-blue-900">
										1. Admin Creates Account
									</h4>
									<p className="mt-1 text-blue-700 text-sm">
										Admin creates driver account with email and default password
										"changeme"
									</p>
									<Badge
										variant="outline"
										className="mt-2 border-blue-300 bg-blue-100 text-blue-800"
									>
										Account Status: Unverified
									</Badge>
								</div>
							</div>

							<div className="flex items-center justify-center">
								<ArrowDownIcon className="h-5 w-5 text-gray-400" />
							</div>

							<div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
								<div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
									<MailIcon className="h-4 w-4 text-yellow-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-yellow-900">
										2. Driver Email Verification
									</h4>
									<p className="mt-1 text-sm text-yellow-700">
										Driver logs in with temporary credentials and verifies email
										address
									</p>
									<Badge
										variant="outline"
										className="mt-2 border-yellow-300 bg-yellow-100 text-yellow-800"
									>
										Can link Google OAuth
									</Badge>
								</div>
							</div>

							<div className="flex items-center justify-center">
								<ArrowDownIcon className="h-5 w-5 text-gray-400" />
							</div>

							<div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
								<div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
									<ClipboardListIcon className="h-4 w-4 text-purple-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-purple-900">
										3. Complete Onboarding
									</h4>
									<p className="mt-1 text-purple-700 text-sm">
										Driver completes 3-step onboarding: Personal info, license
										details, emergency contact
									</p>
									<Badge
										variant="outline"
										className="mt-2 border-purple-300 bg-purple-100 text-purple-800"
									>
										No Documents Required
									</Badge>
								</div>
							</div>

							<div className="flex items-center justify-center">
								<ArrowDownIcon className="h-5 w-5 text-gray-400" />
							</div>

							<div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
								<div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
									<CheckCircleIcon className="h-4 w-4 text-green-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-green-900">
										4. Admin Approval
									</h4>
									<p className="mt-1 text-green-700 text-sm">
										Admin reviews application and approves driver for activation
									</p>
									<Badge
										variant="outline"
										className="mt-2 border-green-300 bg-green-100 text-green-800"
									>
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
							<div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
								<div className="mb-2 flex items-center gap-2">
									<KeyIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Default Password System</h4>
								</div>
								<p className="text-gray-600 text-sm">
									All new drivers get "changeme" as default password. Encourage
									them to change it on first login.
								</p>
							</div>

							<div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
								<div className="mb-2 flex items-center gap-2">
									<MailIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Email Verification Required</h4>
								</div>
								<p className="text-gray-600 text-sm">
									Drivers must verify their email before completing onboarding.
									This ensures valid contact information.
								</p>
							</div>

							<div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
								<div className="mb-2 flex items-center gap-2">
									<ShieldCheckIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Google OAuth Integration</h4>
								</div>
								<p className="text-gray-600 text-sm">
									After email verification, drivers can link their Google
									account for easier future logins.
								</p>
							</div>

							<div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
								<div className="mb-2 flex items-center gap-2">
									<ClipboardListIcon className="h-4 w-4 text-gray-600" />
									<h4 className="font-medium">Simplified Onboarding</h4>
								</div>
								<p className="text-gray-600 text-sm">
									No document uploads required. Focus on essential information:
									personal details, license, and emergency contact.
								</p>
							</div>
						</div>

						<div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
							<h4 className="mb-2 font-medium text-blue-900">Admin Tips</h4>
							<ul className="list-inside list-disc space-y-1 text-blue-700 text-sm">
								<li>
									Monitor the "Driver Accounts" tab for verification status
								</li>
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
