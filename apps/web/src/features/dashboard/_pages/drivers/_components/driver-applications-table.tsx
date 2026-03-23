import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { DataTable } from "@workspace/ui/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { DriverApplicationReview } from "./driver-application-review";
import { useGetDriversByStatusQuery } from "../_hooks/query/use-get-drivers-by-status-query";
import { Eye, Clock, CheckCircle, XCircle, FileText, Mail, MailCheck } from "lucide-react";

interface DriverApplicationData {
	id: string;
	userId: string | null;
	userName: string | null;
	userEmail: string | null;
	userEmailVerified: boolean | null;
	licenseNumber: string;
	licenseExpiry: Date | null;
	phoneNumber: string | null;
	emergencyContactName: string | null;
	emergencyContactPhone: string | null;
	address: string | null;
	dateOfBirth: Date | null;
	onboardingStatus: string;
	onboardingNotes: string | null;
	approvedAt: Date | null;
	approvedBy: string | null;
	// Email verification tracking
	emailVerificationSentAt: Date | null;
	emailVerifiedAt: Date | null;
	onboardingEmailSentAt: Date | null;
	licenseDocumentUrl: string | null;
	insuranceDocumentUrl: string | null;
	backgroundCheckDocumentUrl: string | null;
	profilePhotoUrl: string | null;
	isApproved: boolean | null;
	isActive: boolean;
	rating: number | null;
	totalRides: number | null;
	createdAt: Date;
	updatedAt: Date;
}

interface DriverApplicationsTableProps {
	status?: "email_verification_pending" | "email_verified" | "pending" | "documents_uploaded" | "approved" | "rejected";
}

export function DriverApplicationsTable({ status = "documents_uploaded" }: DriverApplicationsTableProps) {
	const [selectedApplication, setSelectedApplication] = useState<DriverApplicationData | null>(null);
	const [currentAdminId] = useState("admin_mock_123"); // In real app, get from auth context

	const { data: applications = [], isLoading, refetch } = useGetDriversByStatusQuery(status);

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString();
	};

	const getStatusBadge = (status: string) => {
		const config = {
			email_verification_pending: { variant: "secondary" as const, icon: Mail, label: "Email Pending" },
			email_verified: { variant: "default" as const, icon: MailCheck, label: "Email Verified" },
			pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
			documents_uploaded: { variant: "default" as const, icon: FileText, label: "Under Review" },
			approved: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
			rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
		};

		const statusConfig = config[status as keyof typeof config] || config.pending;
		const Icon = statusConfig.icon;

		return (
			<Badge variant={statusConfig.variant} className="flex items-center gap-1">
				<Icon className="h-3 w-3" />
				{statusConfig.label}
			</Badge>
		);
	};

	const getDocumentCount = (application: DriverApplicationData) => {
		const docs = [
			application.licenseDocumentUrl,
			application.insuranceDocumentUrl,
			application.backgroundCheckDocumentUrl,
			application.profilePhotoUrl,
		];
		return docs.filter(Boolean).length;
	};

	const columns: ColumnDef<DriverApplicationData>[] = [
		{
			id: "driver",
			header: "Driver",
			cell: ({ row }) => {
				const application = row.original;
				return (
					<div className="flex items-center space-x-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={application.profilePhotoUrl || undefined} />
							<AvatarFallback>
								{application.userName?.charAt(0) || 'D'}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">{application.userName || 'Unknown'}</div>
							<div className="text-sm text-muted-foreground flex items-center gap-1">
								{application.userEmail}
								{application.userEmailVerified ? (
									<MailCheck className="h-3 w-3 text-green-500" title="Email verified" />
								) : (
									<Mail className="h-3 w-3 text-yellow-500" title="Email not verified" />
								)}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "licenseNumber",
			header: "License Number",
		},
		{
			accessorKey: "phoneNumber",
			header: "Phone",
			cell: ({ row }) => row.original.phoneNumber || "Not provided",
		},
		{
			id: "documents",
			header: "Documents",
			cell: ({ row }) => {
				const count = getDocumentCount(row.original);
				return (
					<div className="flex items-center space-x-1">
						<FileText className="h-4 w-4 text-muted-foreground" />
						<span>{count}/4</span>
					</div>
				);
			},
		},
		{
			accessorKey: "onboardingStatus",
			header: "Status",
			cell: ({ row }) => getStatusBadge(row.original.onboardingStatus),
		},
		{
			accessorKey: "createdAt",
			header: "Applied",
			cell: ({ row }) => formatDate(row.original.createdAt),
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const application = row.original;
				return (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setSelectedApplication(application)}
					>
						<Eye className="h-4 w-4 mr-1" />
						Review
					</Button>
				);
			},
		},
	];

	const handleCloseReview = () => {
		setSelectedApplication(null);
		refetch(); // Refresh the table data
	};

	if (isLoading) {
		return <div className="flex justify-center p-8">Loading applications...</div>;
	}

	return (
		<>
			<DataTable
				columns={columns}
				data={applications as DriverApplicationData[]}
				searchKey="userName"
				searchPlaceholder="Search drivers..."
			/>

			{/* Review Dialog */}
			<Dialog open={!!selectedApplication} onOpenChange={handleCloseReview}>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>Driver Application Review</DialogTitle>
					</DialogHeader>
					{selectedApplication && (
						<DriverApplicationReview
							application={selectedApplication}
							onClose={handleCloseReview}
							currentAdminId={currentAdminId}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}