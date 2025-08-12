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
import { MoreHorizontal, Pencil, Eye, UserCheck, UserX } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useGetDriversQuery } from "../_hooks/query/use-get-drivers-query";
import { useUpdateDriverMutation } from "../_hooks/query/use-update-driver-mutation";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useState } from "react";
import { EditDriverDialog } from "./edit-driver-dialog";
import { ViewDriverDialog } from "./view-driver-dialog";

type DriversTableProps = {
	filter?: "all" | "active" | "inactive" | "pending";
};

export function DriversTable({ filter = "all" }: DriversTableProps) {
	const [editingDriver, setEditingDriver] = useState<any>(null);
	const [viewingDriver, setViewingDriver] = useState<any>(null);
	
	const driversQuery = useGetDriversQuery({});
	const updateDriverMutation = useUpdateDriverMutation();

	const handleApprove = async (driverId: string) => {
		try {
			await updateDriverMutation.mutateAsync({
				id: driverId,
				isApproved: true,
				isActive: true,
			});
		} catch (error) {
			console.error("Failed to approve driver:", error);
		}
	};

	const handleReject = async (driverId: string) => {
		try {
			await updateDriverMutation.mutateAsync({
				id: driverId,
				isApproved: false,
				isActive: false,
			});
		} catch (error) {
			console.error("Failed to reject driver:", error);
		}
	};

	const handleToggleActive = async (driver: any) => {
		try {
			await updateDriverMutation.mutateAsync({
				id: driver.id,
				isActive: !driver.isActive,
			});
		} catch (error) {
			console.error("Failed to toggle driver status:", error);
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
	}

	if (drivers.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No drivers found</p>
				<p className="text-sm text-muted-foreground">
					{filter === "pending" && "No pending approvals"}
					{filter === "active" && "No active drivers"}
					{filter === "inactive" && "No inactive drivers"}
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
										{!driver.isApproved && (
											<DropdownMenuItem 
												onClick={() => handleApprove(driver.id)}
												className="text-green-600"
											>
												<UserCheck className="mr-2 h-4 w-4" />
												Approve
											</DropdownMenuItem>
										)}
										{!driver.isApproved && (
											<DropdownMenuItem 
												onClick={() => handleReject(driver.id)}
												className="text-red-600"
											>
												<UserX className="mr-2 h-4 w-4" />
												Reject
											</DropdownMenuItem>
										)}
										<DropdownMenuItem 
											onClick={() => handleToggleActive(driver)}
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
						<TableCell><Skeleton className="h-4 w-20" /></TableCell>
						<TableCell><Skeleton className="h-8 w-8" /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}