import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { useApproveDriverApplicationMutation } from "../_hooks/query/use-approve-driver-application-mutation";
import { 
	User, 
	Phone, 
	Mail, 
	MapPin, 
	Calendar, 
	FileText, 
	Shield, 
	Camera,
	CheckCircle, 
	XCircle,
	Eye,
	Download
} from "lucide-react";
import { toast } from "sonner";

const reviewSchema = z.object({
	notes: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface DriverApplicationData {
	id: string;
	userId: string | null;
	userName: string | null;
	userEmail: string | null;
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

interface DriverApplicationReviewProps {
	application: DriverApplicationData;
	onClose: () => void;
	currentAdminId: string;
}

function DocumentViewer({ 
	title, 
	url, 
	icon 
}: { 
	title: string; 
	url: string | null; 
	icon: React.ReactNode;
}) {
	const [imageError, setImageError] = useState(false);

	if (!url) {
		return (
			<div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
				<div className="text-center">
					{icon}
					<p className="mt-2 text-sm text-gray-500">No {title.toLowerCase()} uploaded</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h4 className="font-medium flex items-center">
					{icon}
					<span className="ml-2">{title}</span>
				</h4>
				<div className="flex space-x-2">
					<Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
						<Eye className="h-4 w-4 mr-1" />
						View
					</Button>
					<Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
						<Download className="h-4 w-4 mr-1" />
						Download
					</Button>
				</div>
			</div>
			<div className="border rounded-lg overflow-hidden">
				{!imageError ? (
					<img 
						src={url} 
						alt={title}
						className="w-full h-48 object-cover"
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="flex items-center justify-center h-48 bg-gray-100">
						<div className="text-center">
							<FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
							<p className="text-sm text-gray-500">Preview not available</p>
							<p className="text-xs text-gray-400">Click "View" to open document</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function DriverApplicationReview({ 
	application, 
	onClose, 
	currentAdminId 
}: DriverApplicationReviewProps) {
	const [action, setAction] = useState<'approve' | 'reject' | null>(null);
	const approveApplicationMutation = useApproveDriverApplicationMutation();

	const form = useForm<ReviewFormData>({
		resolver: zodResolver(reviewSchema),
		defaultValues: {
			notes: application.onboardingNotes || "",
		},
	});

	const formatDate = (date: Date | null) => {
		if (!date) return "Not provided";
		return new Date(date).toLocaleDateString();
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			pending: "secondary",
			documents_uploaded: "default",
			approved: "default",
			rejected: "destructive",
		} as const;

		return (
			<Badge variant={variants[status as keyof typeof variants] || "secondary"}>
				{status.replace('_', ' ').toUpperCase()}
			</Badge>
		);
	};

	const handleApprove = () => setAction('approve');
	const handleReject = () => setAction('reject');

	const onSubmit = async (data: ReviewFormData) => {
		if (!action) return;

		try {
			await approveApplicationMutation.mutateAsync({
				driverId: application.id,
				approved: action === 'approve',
				notes: data.notes,
				approvedBy: currentAdminId,
			});
			
			onClose();
		} catch (error) {
			console.error('Review error:', error);
		}
	};

	const isSubmitting = approveApplicationMutation.isPending;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarImage src={application.profilePhotoUrl || undefined} />
						<AvatarFallback>
							{application.userName?.charAt(0) || 'D'}
						</AvatarFallback>
					</Avatar>
					<div>
						<h2 className="text-2xl font-bold">{application.userName || 'Unknown Driver'}</h2>
						<p className="text-muted-foreground">{application.userEmail}</p>
						<div className="flex items-center space-x-2 mt-1">
							{getStatusBadge(application.onboardingStatus)}
							<span className="text-sm text-muted-foreground">
								Applied {formatDate(application.createdAt)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<Separator />

			{/* Personal Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<User className="mr-2 h-5 w-5" />
						Personal Information
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-3">
						<div className="flex items-center">
							<Phone className="h-4 w-4 mr-2 text-muted-foreground" />
							<span className="font-medium">Phone:</span>
							<span className="ml-2">{application.phoneNumber || "Not provided"}</span>
						</div>
						<div className="flex items-center">
							<Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
							<span className="font-medium">Date of Birth:</span>
							<span className="ml-2">{formatDate(application.dateOfBirth)}</span>
						</div>
						<div className="flex items-start">
							<MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
							<span className="font-medium">Address:</span>
							<span className="ml-2">{application.address || "Not provided"}</span>
						</div>
					</div>
					<div className="space-y-3">
						<div>
							<h4 className="font-medium mb-2">Emergency Contact</h4>
							<div className="space-y-1 pl-4">
								<div className="flex items-center">
									<User className="h-3 w-3 mr-2 text-muted-foreground" />
									<span>{application.emergencyContactName || "Not provided"}</span>
								</div>
								<div className="flex items-center">
									<Phone className="h-3 w-3 mr-2 text-muted-foreground" />
									<span>{application.emergencyContactPhone || "Not provided"}</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* License Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<FileText className="mr-2 h-5 w-5" />
						License Information
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex items-center">
						<span className="font-medium">License Number:</span>
						<span className="ml-2">{application.licenseNumber}</span>
					</div>
					<div className="flex items-center">
						<span className="font-medium">Expiry Date:</span>
						<span className="ml-2">{formatDate(application.licenseExpiry)}</span>
					</div>
				</CardContent>
			</Card>

			{/* Documents */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Shield className="mr-2 h-5 w-5" />
						Uploaded Documents
					</CardTitle>
					<CardDescription>
						Review all submitted documents for verification
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<DocumentViewer
						title="Driver's License"
						url={application.licenseDocumentUrl}
						icon={<FileText className="h-5 w-5 text-blue-500" />}
					/>
					<DocumentViewer
						title="Insurance Certificate"
						url={application.insuranceDocumentUrl}
						icon={<Shield className="h-5 w-5 text-green-500" />}
					/>
					<DocumentViewer
						title="Background Check"
						url={application.backgroundCheckDocumentUrl}
						icon={<FileText className="h-5 w-5 text-purple-500" />}
					/>
					<DocumentViewer
						title="Profile Photo"
						url={application.profilePhotoUrl}
						icon={<Camera className="h-5 w-5 text-orange-500" />}
					/>
				</CardContent>
			</Card>

			{/* Review Form */}
			<Card>
				<CardHeader>
					<CardTitle>Application Review</CardTitle>
					<CardDescription>
						Add notes and approve or reject this application
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Review Notes</FormLabel>
										<FormControl>
											<Textarea 
												placeholder="Add any notes about this application..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{action && (
								<div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
									{action === 'approve' ? (
										<CheckCircle className="h-5 w-5 text-green-600" />
									) : (
										<XCircle className="h-5 w-5 text-red-600" />
									)}
									<span className="font-medium">
										{action === 'approve' ? 'Approving' : 'Rejecting'} application
									</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => setAction(null)}
									>
										Cancel
									</Button>
								</div>
							)}

							<div className="flex justify-end space-x-4">
								{!action ? (
									<>
										<Button
											type="button"
											variant="destructive"
											onClick={handleReject}
										>
											<XCircle className="mr-2 h-4 w-4" />
											Reject
										</Button>
										<Button
											type="button"
											onClick={handleApprove}
										>
											<CheckCircle className="mr-2 h-4 w-4" />
											Approve
										</Button>
									</>
								) : (
									<Button
										type="submit"
										disabled={isSubmitting}
										variant={action === 'approve' ? 'default' : 'destructive'}
									>
										{isSubmitting ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
									</Button>
								)}
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}