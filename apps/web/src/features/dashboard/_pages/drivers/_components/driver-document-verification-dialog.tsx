import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { 
	CheckCircle2, 
	XCircle, 
	AlertTriangle, 
	Eye, 
	FileText, 
	Shield, 
	User,
	Calendar,
	Phone,
	Mail
} from "lucide-react";
import { useVerifyDriverDocumentsMutation } from "../_hooks/query/use-verify-driver-documents-mutation";
import { toast } from "sonner";

interface DriverDocumentVerificationDialogProps {
	driver: any;
	isOpen: boolean;
	onClose: () => void;
}

export function DriverDocumentVerificationDialog({
	driver,
	isOpen,
	onClose,
}: DriverDocumentVerificationDialogProps) {
	const [documentChecks, setDocumentChecks] = useState({
		licenseVerified: false,
		licenseNotes: "",
		insuranceVerified: false,
		insuranceNotes: "",
		backgroundCheckVerified: false,
		backgroundCheckNotes: "",
		profilePhotoVerified: false,
		profilePhotoNotes: "",
	});
	
	const [overallStatus, setOverallStatus] = useState<"approved" | "rejected" | "needs_revision">("needs_revision");
	const [adminNotes, setAdminNotes] = useState("");

	const verifyDocumentsMutation = useVerifyDriverDocumentsMutation();

	const handleDocumentCheck = (documentType: keyof typeof documentChecks, field: string, value: any) => {
		setDocumentChecks(prev => ({
			...prev,
			[`${documentType}${field}`]: value,
		}));
	};

	const handleSubmitVerification = async () => {
		try {
			// Validate that at least some verification has been done
			const hasAnyVerification = 
				documentChecks.licenseVerified ||
				documentChecks.insuranceVerified ||
				documentChecks.backgroundCheckVerified ||
				documentChecks.profilePhotoVerified;

			if (!hasAnyVerification && overallStatus === "approved") {
				toast.error("Please verify at least one document before approving");
				return;
			}

			await verifyDocumentsMutation.mutateAsync({
				driverId: driver.id,
				documentVerification: documentChecks,
				overallStatus,
				adminNotes,
			});

			onClose();
		} catch (error) {
			console.error("Failed to verify driver documents:", error);
		}
	};

	const getStatusIcon = (verified: boolean) => {
		return verified ? (
			<CheckCircle2 className="h-4 w-4 text-green-600" />
		) : (
			<XCircle className="h-4 w-4 text-red-600" />
		);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "verified":
				return "bg-green-100 text-green-700 border-green-200";
			case "rejected":
				return "bg-red-100 text-red-700 border-red-200";
			case "needs_revision":
				return "bg-yellow-100 text-yellow-700 border-yellow-200";
			default:
				return "bg-gray-100 text-gray-700 border-gray-200";
		}
	};

	// Parse existing document verification if it exists
	let existingVerification = {};
	try {
		existingVerification = driver.documentVerification ? JSON.parse(driver.documentVerification) : {};
	} catch (e) {
		console.warn("Failed to parse existing document verification:", e);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Document Verification - {driver.user?.name || "Driver"}
					</DialogTitle>
					<DialogDescription>
						Review and verify driver documents for account approval
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Driver Information Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<User className="h-5 w-5" />
								Driver Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<User className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">Name:</span>
										<span>{driver.user?.name || "N/A"}</span>
									</div>
									<div className="flex items-center gap-2">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">Email:</span>
										<span>{driver.user?.email || "N/A"}</span>
									</div>
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">Phone:</span>
										<span>{driver.phoneNumber || "N/A"}</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<FileText className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">License:</span>
										<span>{driver.licenseNumber || "N/A"}</span>
									</div>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">License Expiry:</span>
										<span>
											{driver.licenseExpiry 
												? new Date(driver.licenseExpiry).toLocaleDateString() 
												: "N/A"
											}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-medium">Current Status:</span>
										<Badge className={getStatusColor(driver.verificationStatus || "pending")}>
											{driver.verificationStatus || "Pending"}
										</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Document Verification Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<FileText className="h-5 w-5" />
								Document Verification
							</CardTitle>
							<CardDescription>
								Review each document and mark as verified or provide feedback
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* License Document */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FileText className="h-4 w-4" />
										<span className="font-medium">Driver's License</span>
									</div>
									<div className="flex items-center gap-2">
										{driver.licenseDocumentUrl && (
											<Button 
												variant="outline" 
												size="sm"
												onClick={() => window.open(driver.licenseDocumentUrl, '_blank')}
											>
												<Eye className="h-3 w-3 mr-1" />
												View
											</Button>
										)}
										<div className="flex items-center space-x-2">
											<Switch
												id="license-verified"
												checked={documentChecks.licenseVerified}
												onCheckedChange={(checked) => 
													handleDocumentCheck("license", "Verified", checked)
												}
											/>
											<Label htmlFor="license-verified" className="flex items-center gap-1">
												{getStatusIcon(documentChecks.licenseVerified)}
												Verified
											</Label>
										</div>
									</div>
								</div>
								<Textarea
									placeholder="Notes about license verification (optional)"
									value={documentChecks.licenseNotes}
									onChange={(e) => handleDocumentCheck("license", "Notes", e.target.value)}
									rows={2}
								/>
							</div>

							<Separator />

							{/* Insurance Document */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Shield className="h-4 w-4" />
										<span className="font-medium">Insurance Certificate</span>
									</div>
									<div className="flex items-center gap-2">
										{driver.insuranceDocumentUrl && (
											<Button 
												variant="outline" 
												size="sm"
												onClick={() => window.open(driver.insuranceDocumentUrl, '_blank')}
											>
												<Eye className="h-3 w-3 mr-1" />
												View
											</Button>
										)}
										<div className="flex items-center space-x-2">
											<Switch
												id="insurance-verified"
												checked={documentChecks.insuranceVerified}
												onCheckedChange={(checked) => 
													handleDocumentCheck("insurance", "Verified", checked)
												}
											/>
											<Label htmlFor="insurance-verified" className="flex items-center gap-1">
												{getStatusIcon(documentChecks.insuranceVerified)}
												Verified
											</Label>
										</div>
									</div>
								</div>
								<Textarea
									placeholder="Notes about insurance verification (optional)"
									value={documentChecks.insuranceNotes}
									onChange={(e) => handleDocumentCheck("insurance", "Notes", e.target.value)}
									rows={2}
								/>
							</div>

							<Separator />

							{/* Background Check */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4" />
										<span className="font-medium">Background Check</span>
									</div>
									<div className="flex items-center gap-2">
										{driver.backgroundCheckDocumentUrl && (
											<Button 
												variant="outline" 
												size="sm"
												onClick={() => window.open(driver.backgroundCheckDocumentUrl, '_blank')}
											>
												<Eye className="h-3 w-3 mr-1" />
												View
											</Button>
										)}
										<div className="flex items-center space-x-2">
											<Switch
												id="background-verified"
												checked={documentChecks.backgroundCheckVerified}
												onCheckedChange={(checked) => 
													handleDocumentCheck("backgroundCheck", "Verified", checked)
												}
											/>
											<Label htmlFor="background-verified" className="flex items-center gap-1">
												{getStatusIcon(documentChecks.backgroundCheckVerified)}
												Verified
											</Label>
										</div>
									</div>
								</div>
								<Textarea
									placeholder="Notes about background check verification (optional)"
									value={documentChecks.backgroundCheckNotes}
									onChange={(e) => handleDocumentCheck("backgroundCheck", "Notes", e.target.value)}
									rows={2}
								/>
							</div>

							<Separator />

							{/* Profile Photo */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<User className="h-4 w-4" />
										<span className="font-medium">Profile Photo</span>
									</div>
									<div className="flex items-center gap-2">
										{driver.profilePhotoUrl && (
											<Button 
												variant="outline" 
												size="sm"
												onClick={() => window.open(driver.profilePhotoUrl, '_blank')}
											>
												<Eye className="h-3 w-3 mr-1" />
												View
											</Button>
										)}
										<div className="flex items-center space-x-2">
											<Switch
												id="photo-verified"
												checked={documentChecks.profilePhotoVerified}
												onCheckedChange={(checked) => 
													handleDocumentCheck("profilePhoto", "Verified", checked)
												}
											/>
											<Label htmlFor="photo-verified" className="flex items-center gap-1">
												{getStatusIcon(documentChecks.profilePhotoVerified)}
												Verified
											</Label>
										</div>
									</div>
								</div>
								<Textarea
									placeholder="Notes about profile photo verification (optional)"
									value={documentChecks.profilePhotoNotes}
									onChange={(e) => handleDocumentCheck("profilePhoto", "Notes", e.target.value)}
									rows={2}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Overall Decision */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<AlertTriangle className="h-5 w-5" />
								Verification Decision
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Button
									variant={overallStatus === "approved" ? "default" : "outline"}
									onClick={() => setOverallStatus("approved")}
									className="h-auto py-4 flex flex-col gap-2"
								>
									<CheckCircle2 className="h-5 w-5" />
									<div className="text-center">
										<div className="font-semibold">Approve</div>
										<div className="text-xs opacity-75">Activate driver account</div>
									</div>
								</Button>
								<Button
									variant={overallStatus === "needs_revision" ? "default" : "outline"}
									onClick={() => setOverallStatus("needs_revision")}
									className="h-auto py-4 flex flex-col gap-2"
								>
									<AlertTriangle className="h-5 w-5" />
									<div className="text-center">
										<div className="font-semibold">Needs Revision</div>
										<div className="text-xs opacity-75">Request document updates</div>
									</div>
								</Button>
								<Button
									variant={overallStatus === "rejected" ? "default" : "outline"}
									onClick={() => setOverallStatus("rejected")}
									className="h-auto py-4 flex flex-col gap-2"
								>
									<XCircle className="h-5 w-5" />
									<div className="text-center">
										<div className="font-semibold">Reject</div>
										<div className="text-xs opacity-75">Deny application</div>
									</div>
								</Button>
							</div>

							<div className="space-y-2">
								<Label htmlFor="admin-notes">Admin Notes</Label>
								<Textarea
									id="admin-notes"
									placeholder="Provide feedback to the driver about the verification decision..."
									value={adminNotes}
									onChange={(e) => setAdminNotes(e.target.value)}
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button 
							onClick={handleSubmitVerification}
							disabled={verifyDocumentsMutation.isPending}
						>
							{verifyDocumentsMutation.isPending ? "Processing..." : "Submit Verification"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}