import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";

interface AccountTabProps {
	user: any;
}

export function AccountTab({ user }: AccountTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Account Information</CardTitle>
				<CardDescription>Your basic account details</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 gap-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="font-medium text-sm">Full Name</label>
							<p className="mt-1 text-gray-600 text-sm">{user?.name}</p>
						</div>
						<div>
							<label className="font-medium text-sm">Email Address</label>
							<p className="mt-1 break-all text-gray-600 text-sm">
								{user?.email}
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="font-medium text-sm">Account Role</label>
							<div className="mt-1">
								<Badge variant="outline" className="w-fit text-xs capitalize">
									{user?.role}
								</Badge>
							</div>
						</div>
						<div>
							<label className="font-medium text-sm">Member Since</label>
							<p className="mt-1 text-gray-600 text-sm">
								{user?.createdAt
									? new Date(user.createdAt).toLocaleDateString()
									: "N/A"}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
