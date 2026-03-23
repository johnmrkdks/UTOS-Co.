import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";

interface DocumentsTabProps {
	driverProfile: any;
}

export function DocumentsTab({ driverProfile }: DocumentsTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Required Documents</CardTitle>
				<CardDescription>
					Document verification is optional and can be completed later
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{Object.entries(driverProfile.documents).map(([key, doc]) => {
						const labels = {
							license: "Driver's License",
							insurance: "Insurance Certificate",
							background: "Background Check",
							photo: "Profile Photo",
						};

						const document = doc as { uploaded: boolean; approved: boolean };

						return (
							<div
								key={key}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div>
									<h4 className="font-medium text-sm">
										{labels[key as keyof typeof labels]}
									</h4>
									<p className="text-gray-600 text-xs">
										{document.uploaded ? "Document uploaded" : "Not uploaded"}
									</p>
								</div>
								<Badge
									variant={document.uploaded ? "default" : "secondary"}
									className="text-xs"
								>
									{document.uploaded ? "Uploaded" : "Optional"}
								</Badge>
							</div>
						);
					})}
				</div>
				<div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
					<p className="text-blue-800 text-xs">
						<strong>Note:</strong> Documents are optional for now. You can
						complete your profile and start driving without uploading documents.
						We may request them later for verification purposes.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
