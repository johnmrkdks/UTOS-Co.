import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

interface AccountTabProps {
	user: any;
}

export function AccountTab({ user }: AccountTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Account Information</CardTitle>
				<CardDescription>
					Your basic account details
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 gap-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium">Full Name</label>
							<p className="text-sm text-gray-600 mt-1">{user?.name}</p>
						</div>
						<div>
							<label className="text-sm font-medium">Email Address</label>
							<p className="text-sm text-gray-600 mt-1 break-all">{user?.email}</p>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium">Account Role</label>
							<div className="mt-1">
								<Badge variant="outline" className="w-fit capitalize text-xs">
									{user?.role}
								</Badge>
							</div>
						</div>
						<div>
							<label className="text-sm font-medium">Member Since</label>
							<p className="text-sm text-gray-600 mt-1">
								{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}