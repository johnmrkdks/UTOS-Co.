import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { MoreHorizontal, Pencil, Eye, UserCheck, UserX, Trash2, Shield } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useGetDriversQuery } from "../_hooks/query/use-get-drivers-query";
import { useUpdateDriverMutation } from "../_hooks/query/use-update-driver-mutation";
import { useDeleteDriverMutation } from "../_hooks/query/use-delete-driver-mutation";
import { useRemoveUserMutation } from "../_hooks/query/use-remove-user-mutation";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useState } from "react";
import { EditDriverDialog } from "./edit-driver-dialog";
import { ViewDriverDialog } from "./view-driver-dialog";
import { DeleteDriverConfirmationDialog } from "./delete-driver-confirmation-dialog";
import { RemoveUserConfirmationDialog } from "./remove-user-confirmation-dialog";
import { DriverActionConfirmationDialog } from "./driver-action-confirmation-dialog";
import { DriverDocumentVerificationDialog } from "./driver-document-verification-dialog";

type DriversTableProps = {
	filter?: "all" | "active" | "inactive" | "pending" | "approved-active" | "approved-inactive";
};

export function DriversTable({ filter = "all" }: DriversTableProps) {
	const [editingDriver, setEditingDriver] = useState<any>(null);
	const [viewingDriver, setViewingDriver] = useState<any>(null);
	const [deletingDriver, setDeletingDriver] = useState<any>(null);
	const [removingUserDriver, setRemovingUserDriver] = useState<any>(null);
	const [verifyingDriver, setVerifyingDriver] = useState<any>(null);
	const [actionDriver, setActionDriver] = useState<{ driver: any; action: "approve" | "reject" | "activate" | "deactivate" } | null>(null);
	
	const driversQuery = useGetDriversQuery({});
	const updateDriverMutation = useUpdateDriverMutation();
	const deleteDriverMutation = useDeleteDriverMutation();
	const removeUserMutation = useRemoveUserMutation();

	const handleDriverAction = async (driverId: string, notes?: string) => {
		if (!actionDriver) return;

		try {
			const { action } = actionDriver;
			
			switch (action) {
				case "approve":
					await updateDriverMutation.mutateAsync({
						id: driverId,
						isApproved: true,
						isActive: true,
					});
					break;
				case "reject":
					await updateDriverMutation.mutateAsync({
						id: driverId,
						isApproved: false,
						isActive: false,
						onboardingNotes: notes,
					});
					break;
				case "activate":
					await updateDriverMutation.mutateAsync({
						id: driverId,
						isActive: true,
					});
					break;
				case "deactivate":
					await updateDriverMutation.mutateAsync({
						id: driverId,
						isActive: false,
					});
					break;
			}
		} catch (error) {
			console.error(`Failed to ${actionDriver.action} driver:`, error);
		}
	};

	const handleDelete = async (driverId: string, forceDelete: boolean = false, confirmationText: string = "") => {
		try {
			await deleteDriverMutation.mutateAsync({ 
				id: driverId, 
				forceDelete, 
				confirmationText 
			});
		} catch (error) {
			console.error("Failed to delete driver:", error);
			// Re-throw the error so the dialog can handle it
			throw error;
		}
	};

	const handleRemoveUser = async (userId: string) => {
		try {
			await removeUserMutation.mutateAsync({ 
				userId, 
				forceDelete: true, 
				confirmationText: "DELETE" 
			});
		} catch (error) {
			console.error("Failed to remove user:", error);
		}
	};

	if (driversQuery.isLoading) {
		return <DriversTableSkeleton />;
	}

	if (driversQuery.isError) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">Failed to load drivers</p>
			</div>
		);
	}

	let drivers = driversQuery.data?.items || [];

	// Apply filter
	if (filter === "active") {
		drivers = drivers.filter((driver: any) => driver.isActive && driver.isApproved);
	} else if (filter === "inactive") {
		drivers = drivers.filter((driver: any) => !driver.isActive);
	} else if (filter === "pending") {
		drivers = drivers.filter((driver: any) => !driver.isApproved);
	} else if (filter === "approved-active") {
		drivers = drivers.filter((driver: any) => driver.isApproved && driver.isActive);
	} else if (filter === "approved-inactive") {
		drivers = drivers.filter((driver: any) => driver.isApproved && !driver.isActive);
	}

	if (drivers.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No drivers found</p>
				<p className="text-sm text-muted-foreground">
					{filter === "pending" && "No pending approvals"}
					{filter === "active" && "No active drivers"}
					{filter === "inactive" && "No inactive drivers"}
					{filter === "approved-active" && "No active approved drivers"}
					{filter === "approved-inactive" && "No inactive approved drivers"}
					{filter === "all" && "No drivers registered yet"}
				</p>
			</div>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Driver</TableHead>
						<TableHead>License Number</TableHead>
						<TableHead>Assigned Car</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Approval</TableHead>
						{/* <TableHead>Verification</TableHead> */}
						<TableHead>Registered</TableHead>
						<TableHead className="w-[50px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{drivers.map((driver: any) => (
						<TableRow key={driver.id}>
							<TableCell>
								<div>
									<p className="font-medium">{driver.user?.name || "Unknown"}</p>
									<p className="text-sm text-muted-foreground">{driver.user?.email}</p>
								</div>
							</TableCell>
							<TableCell className="font-mono">{driver.licenseNumber}</TableCell>
							<TableCell>
								{driver.car ? (
									<div>
										<p className="font-medium">{driver.car.name}</p>
										<p className="text-sm text-muted-foreground">{driver.car.licensePlate}</p>
									</div>
								) : (
									<span className="text-muted-foreground">Not assigned</span>
								)}
							</TableCell>
							<TableCell>
								<Badge variant={driver.isActive ? "default" : "secondary"}>
									{driver.isActive ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge variant={driver.isApproved ? "default" : "destructive"}>
									{driver.isApproved ? "Approved" : "Pending"}
								</Badge>
							</TableCell>
							{/* Hidden Verification column */}
							{/* <TableCell>
								<Badge
									variant={
										driver.verificationStatus === "verified" ? "default" :
										driver.verificationStatus === "rejected" ? "destructive" :
										driver.verificationStatus === "needs_revision" ? "secondary" :
										"outline"
									}
									className={
										driver.verificationStatus === "verified" ? "bg-green-100 text-green-700 border-green-200" :
										driver.verificationStatus === "rejected" ? "bg-red-100 text-red-700 border-red-200" :
										driver.verificationStatus === "needs_revision" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
										"bg-gray-100 text-gray-700 border-gray-200"
									}
								>
									{driver.verificationStatus === "verified" ? "Verified" :
									 driver.verificationStatus === "rejected" ? "Rejected" :
									 driver.verificationStatus === "needs_revision" ? "Needs Revision" :
									 driver.verificationStatus === "pending_documents" ? "Pending Docs" :
									 "Pending"}
								</Badge>
							</TableCell> */}
							<TableCell>
								{new Date(driver.createdAt).toLocaleDateString()}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => setViewingDriver(driver)}>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setEditingDriver(driver)}>
											<Pencil className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setVerifyingDriver(driver)}>
											<Shield className="mr-2 h-4 w-4" />
											Verify Documents
										</DropdownMenuItem>
										{!driver.isApproved && (
											<DropdownMenuItem 
												onClick={() => setActionDriver({ driver, action: "approve" })}
												className="text-green-600"
											>
												<UserCheck className="mr-2 h-4 w-4" />
												Approve
											</DropdownMenuItem>
										)}
										{!driver.isApproved && (
											<DropdownMenuItem 
												onClick={() => setActionDriver({ driver, action: "reject" })}
												className="text-red-600"
											>
												<UserX className="mr-2 h-4 w-4" />
												Reject
											</DropdownMenuItem>
										)}
										{driver.isApproved && (
											<DropdownMenuItem 
												onClick={() => setActionDriver({ 
													driver, 
													action: driver.isActive ? "deactivate" : "activate" 
												})}
											>
												{driver.isActive ? (
													<>
														<UserX className="mr-2 h-4 w-4" />
														Deactivate
													</>
												) : (
													<>
														<UserCheck className="mr-2 h-4 w-4" />
														Activate
													</>
												)}
											</DropdownMenuItem>
										)}
										<DropdownMenuItem 
											onClick={() => setDeletingDriver(driver)}
											className="text-red-600"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete Driver Only
										</DropdownMenuItem>
										<DropdownMenuItem 
											onClick={() => setRemovingUserDriver(driver)}
											className="text-red-600"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Remove User Account (Recommended)
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{editingDriver && (
				<EditDriverDialog
					driver={editingDriver}
					open={!!editingDriver}
					onOpenChange={(open) => !open && setEditingDriver(null)}
				/>
			)}

			{viewingDriver && (
				<ViewDriverDialog
					driver={viewingDriver}
					open={!!viewingDriver}
					onOpenChange={(open) => !open && setViewingDriver(null)}
				/>
			)}

			<DeleteDriverConfirmationDialog
				driver={deletingDriver}
				open={!!deletingDriver}
				onOpenChange={(open) => !open && setDeletingDriver(null)}
				onConfirm={handleDelete}
				isDeleting={deleteDriverMutation.isPending}
			/>

			<RemoveUserConfirmationDialog
				driver={removingUserDriver}
				open={!!removingUserDriver}
				onOpenChange={(open) => !open && setRemovingUserDriver(null)}
				onConfirm={handleRemoveUser}
				isRemoving={removeUserMutation.isPending}
			/>

			{actionDriver && (
				<DriverActionConfirmationDialog
					driver={actionDriver.driver}
					action={actionDriver.action}
					open={!!actionDriver}
					onOpenChange={(open) => !open && setActionDriver(null)}
					onConfirm={handleDriverAction}
					isLoading={updateDriverMutation.isPending}
				/>
			)}

			{verifyingDriver && (
				<DriverDocumentVerificationDialog
					driver={verifyingDriver}
					isOpen={!!verifyingDriver}
					onClose={() => setVerifyingDriver(null)}
				/>
			)}
		</>
	);
}

function DriversTableSkeleton() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Driver</TableHead>
					<TableHead>License Number</TableHead>
					<TableHead>Assigned Car</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Approval</TableHead>
					{/* <TableHead>Verification</TableHead> */}
					<TableHead>Registered</TableHead>
					<TableHead className="w-[50px]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }).map((_, i) => (
					<TableRow key={i}>
						<TableCell>
							<div className="space-y-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-32" />
							</div>
						</TableCell>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
						<TableCell>
							<div className="space-y-1">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-3 w-16" />
							</div>
						</TableCell>
						<TableCell><Skeleton className="h-6 w-16" /></TableCell>
						<TableCell><Skeleton className="h-6 w-20" /></TableCell>
						{/* <TableCell><Skeleton className="h-6 w-24" /></TableCell> */}
						<TableCell><Skeleton className="h-4 w-20" /></TableCell>
						<TableCell><Skeleton className="h-8 w-8" /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}