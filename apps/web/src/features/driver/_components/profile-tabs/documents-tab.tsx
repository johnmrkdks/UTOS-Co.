import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

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
							photo: "Profile Photo"
						};

						const document = doc as { uploaded: boolean; approved: boolean };

						return (
							<div key={key} className="flex items-center justify-between p-3 border rounded-lg">
								<div>
									<h4 className="font-medium text-sm">{labels[key as keyof typeof labels]}</h4>
									<p className="text-xs text-gray-600">
										{document.uploaded ? "Document uploaded" : "Not uploaded"}
									</p>
								</div>
								<Badge variant={document.uploaded ? "default" : "secondary"} className="text-xs">
									{document.uploaded ? "Uploaded" : "Optional"}
								</Badge>
							</div>
						);
					})}
				</div>
				<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-xs text-blue-800">
						<strong>Note:</strong> Documents are optional for now. You can complete your profile and start driving without uploading documents.
						We may request them later for verification purposes.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}