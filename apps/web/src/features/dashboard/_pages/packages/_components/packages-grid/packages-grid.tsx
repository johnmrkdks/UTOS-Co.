import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Eye,
	MapPin,
	MoreHorizontal,
	Package,
	Pencil,
	Power,
	PowerOff,
	RouteIcon,
	Settings,
	Trash2,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useDeletePackageMutation } from "../../_hooks/query/use-delete-package-mutation";
import { useGetPackagesQuery } from "../../_hooks/query/use-get-packages-query";
import { useUpdatePackageMutation } from "../../_hooks/query/use-update-package-mutation";
import { DeletePackageDialog } from "../delete-package-dialog/delete-package-dialog";
import { PackageRoutesDialog } from "../package-routes/package-routes-dialog";
import { PackageSchedulingDialog } from "../package-scheduling/package-scheduling-dialog";
import { EditPackageDialog } from "../packages-table/edit-package-dialog";
import { ViewPackageDialog } from "../packages-table/view-package-dialog";

interface Package {
	id: string;
	name: string;
	description: string;
	fixedPrice?: number | null;
	hourlyRate?: number | null;
	isAvailable: boolean;
	isPublished?: boolean | null;
	serviceType?: {
		id: string;
		name: string;
		rateType: "hourly" | "fixed";
	};
	bannerImageUrl?: string | null;
	createdAt: string;
	maxPassengers?: number;
	duration?: number;
	advanceBookingHours?: number;
}

interface PackagesGridProps {
	searchTerm?: string;
	statusFilter?: "all" | "available" | "unavailable";
}

export function PackagesGrid({
	searchTerm = "",
	statusFilter = "all",
}: PackagesGridProps) {
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);
	const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
	const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
	const [routesPackage, setRoutesPackage] = useState<Package | null>(null);
	const [schedulingPackage, setSchedulingPackage] = useState<Package | null>(
		null,
	);

	const packagesQuery = useGetPackagesQuery({});
	const deletePackageMutation = useDeletePackageMutation();
	const updatePackageMutation = useUpdatePackageMutation();

	const handleToggleAvailable = async (pkg: Package) => {
		try {
			await updatePackageMutation.mutateAsync({
				id: pkg.id,
				data: {
					isAvailable: !pkg.isAvailable,
				},
			});
		} catch (error) {
			console.error("Failed to toggle package availability:", error);
		}
	};

	const allPackages = packagesQuery.data?.data || [];

	// Filter packages based on search term and status
	const packages = allPackages.filter((pkg) => {
		const matchesSearch =
			!searchTerm ||
			pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.serviceType?.name?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "available" && pkg.isAvailable) ||
			(statusFilter === "unavailable" && !pkg.isAvailable);

		return matchesSearch && matchesStatus;
	});

	if (packagesQuery.isLoading) {
		return (
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{[...Array(10)].map((_, index) => (
					<Card key={index} className="animate-pulse">
						<div className="h-40 bg-gray-200" />
						<CardContent className="p-4">
							<div className="space-y-3">
								<div className="h-5 w-3/4 rounded bg-gray-200" />
								<div className="h-3 w-1/2 rounded bg-gray-200" />
								<div className="h-4 w-full rounded bg-gray-200" />
								<div className="h-4 w-2/3 rounded bg-gray-200" />
								<div className="mt-4 flex gap-2">
									<div className="h-8 flex-1 rounded bg-gray-200" />
									<div className="h-8 w-10 rounded bg-gray-200" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (packages.length === 0) {
		return (
			<div className="py-12 text-center">
				<Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">No packages found</h3>
				<p className="text-muted-foreground">
					Create your first package to get started
				</p>
			</div>
		);
	}

	// Helper function to format pricing display
	const formatPricing = (pkg: Package) => {
		// Debug logging to see what data we're getting
		console.log("Package pricing debug:", {
			name: pkg.name,
			hourlyRate: pkg.hourlyRate,
			fixedPrice: pkg.fixedPrice,
			serviceType: pkg.serviceType,
			typeof_hourlyRate: typeof pkg.hourlyRate,
			typeof_fixedPrice: typeof pkg.fixedPrice,
		});

		// Determine rate type based on which pricing field has a value
		// This is more reliable than relying solely on serviceType.rateType
		const hasHourlyRate = pkg.hourlyRate && pkg.hourlyRate > 0;
		const hasFixedPrice = pkg.fixedPrice && pkg.fixedPrice > 0;

		// Prefer actual data over service type config
		if (hasHourlyRate) {
			return {
				price: `$${pkg.hourlyRate!.toFixed(2)}`,
				unit: "/hour",
				rateType: "Hourly",
			};
		}
		if (hasFixedPrice) {
			return {
				price: `$${pkg.fixedPrice!.toFixed(2)}`,
				unit: "",
				rateType: "Fixed",
			};
		}

		// Fallback to service type configuration
		const isHourlyByType = pkg.serviceType?.rateType === "hourly";
		return {
			price: "$0.00",
			unit: isHourlyByType ? "/hour" : "",
			rateType: isHourlyByType ? "Hourly" : "Fixed",
		};
	};

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{packages.map((pkg) => {
					const pricing = formatPricing(pkg);
					return (
						<Card
							key={pkg.id}
							className="group gap-0 overflow-hidden border bg-background p-0 transition-all duration-200 hover:border-primary/20 hover:shadow-lg"
						>
							{/* Banner Image - extends to card edges */}
							<div className="relative h-36 overflow-hidden rounded-t-xl bg-gradient-to-br from-primary/10 to-primary/5">
								{pkg.bannerImageUrl ? (
									<>
										<img
											src={pkg.bannerImageUrl}
											alt={pkg.name}
											className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
											onError={(e) => {
												e.currentTarget.style.display = "none";
												const fallback = e.currentTarget.nextElementSibling;
												if (fallback instanceof HTMLElement)
													fallback.classList.remove("hidden");
											}}
										/>
										<div className="flex hidden h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
											<Package className="h-12 w-12 text-slate-400" />
										</div>
									</>
								) : (
									<div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
										<Package className="h-12 w-12 text-slate-400" />
									</div>
								)}

								{/* Rate Type Badge */}
								<div className="absolute top-2 left-2">
									<Badge
										variant={
											pricing.rateType === "Hourly" ? "default" : "secondary"
										}
										className="font-medium text-xs shadow-sm"
									>
										{pricing.rateType}
									</Badge>
								</div>

								{/* Status Badge */}
								<div className="absolute top-2 right-2">
									<Badge
										variant={pkg.isAvailable ? "default" : "destructive"}
										className="text-xs shadow-sm"
									>
										{pkg.isAvailable ? "Active" : "Inactive"}
									</Badge>
								</div>

								{/* Published Badge */}
								{pkg.isPublished && (
									<div className="absolute bottom-2 left-2">
										<Badge
											variant="outline"
											className="bg-white/90 text-xs shadow-sm backdrop-blur-sm"
										>
											Published
										</Badge>
									</div>
								)}
							</div>

							{/* Content */}
							<CardContent className="p-4">
								<div className="space-y-3">
									{/* Header */}
									<div>
										<CardTitle className="mb-1 line-clamp-1 font-semibold text-sm leading-tight">
											{pkg.name}
										</CardTitle>
										{pkg.serviceType && (
											<Badge variant="outline" className="text-xs">
												{pkg.serviceType.name}
											</Badge>
										)}
									</div>

									{/* Description */}
									<CardDescription className="line-clamp-2 min-h-[32px] text-xs leading-relaxed">
										{pkg.description || "No description provided"}
									</CardDescription>

									{/* Pricing */}
									<div className="flex items-center justify-between">
										<div className="flex items-baseline gap-1">
											<span className="font-bold text-lg text-primary">
												{pricing.price}
											</span>
											{pricing.unit && (
												<span className="text-muted-foreground text-xs">
													{pricing.unit}
												</span>
											)}
										</div>

										{/* Package Stats - Duration only */}
										{pkg.duration && (
											<div className="flex items-center gap-1 text-muted-foreground text-xs">
												<Clock className="h-3 w-3" />
												<span>{Math.floor(pkg.duration / 60)}h</span>
											</div>
										)}
									</div>
								</div>

								{/* Actions */}
								<div className="mt-4 flex gap-2 border-t pt-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setViewingPackage(pkg)}
										className="flex-1 text-xs"
									>
										<Eye className="mr-1 h-3 w-3" />
										View
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setEditingPackage(pkg)}
										className="flex-1 text-xs"
									>
										<Pencil className="mr-1 h-3 w-3" />
										Edit
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-[160px]">
											<DropdownMenuItem onClick={() => setRoutesPackage(pkg)}>
												<RouteIcon className="mr-2 h-4 w-4" />
												Routes
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => setSchedulingPackage(pkg)}
											>
												<Calendar className="mr-2 h-4 w-4" />
												Schedule
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => handleToggleAvailable(pkg)}
												disabled={updatePackageMutation.isPending}
											>
												{pkg.isAvailable ? (
													<>
														<PowerOff className="mr-2 h-4 w-4" />
														Disable
													</>
												) : (
													<>
														<Power className="mr-2 h-4 w-4" />
														Enable
													</>
												)}
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => setDeletingPackage(pkg)}
												className="text-red-600"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Dialogs */}
			{editingPackage && (
				<EditPackageDialog
					package={editingPackage}
					open={!!editingPackage}
					onOpenChange={(open) => !open && setEditingPackage(null)}
				/>
			)}

			{viewingPackage && (
				<ViewPackageDialog
					package={viewingPackage}
					open={!!viewingPackage}
					onOpenChange={(open) => !open && setViewingPackage(null)}
				/>
			)}

			{deletingPackage && (
				<DeletePackageDialog
					package={deletingPackage!}
					open={!!deletingPackage}
					onOpenChange={(open) => !open && setDeletingPackage(null)}
				/>
			)}

			{routesPackage && (
				<PackageRoutesDialog
					packageId={routesPackage.id}
					packageName={routesPackage.name}
					open={!!routesPackage}
					onOpenChange={(open) => !open && setRoutesPackage(null)}
				/>
			)}

			{schedulingPackage && (
				<PackageSchedulingDialog
					packageId={schedulingPackage.id}
					packageName={schedulingPackage.name}
					open={!!schedulingPackage}
					onOpenChange={(open) => !open && setSchedulingPackage(null)}
				/>
			)}
		</>
	);
}
