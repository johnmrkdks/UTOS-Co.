import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { 
	Package, 
	Search, 
	Filter, 
	Eye, 
	Settings, 
	DollarSign,
	Calendar,
	MapPin,
	CheckCircle,
	AlertCircle,
	Grid3X3,
	List
} from "lucide-react";

interface PackageOption {
	id: string;
	name: string;
	description?: string;
	serviceType?: string;
	pricePerDay?: number;
	fixedPrice?: number;
	isAvailable: boolean | null;
	isPublished: boolean | null;
	createdAt?: string;
}

interface PackageSelectorProps {
	packages: PackageOption[];
	selectedPackageId: string;
	onSelectPackage: (packageId: string) => void;
	isLoading?: boolean;
	showDetails?: boolean;
	viewMode?: "grid" | "list" | "dropdown";
}

export function PackageSelector({ 
	packages, 
	selectedPackageId, 
	onSelectPackage, 
	isLoading = false,
	showDetails = true,
	viewMode = "grid"
}: PackageSelectorProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "available" | "unavailable">("all");
	const [currentViewMode, setCurrentViewMode] = useState(viewMode);
	
	const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);
	
	// Filter packages based on search and status
	const filteredPackages = packages.filter(pkg => {
		const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = statusFilter === "all" || 
			(statusFilter === "available" && pkg.isAvailable === true) ||
			(statusFilter === "unavailable" && pkg.isAvailable !== true);
			
		return matchesSearch && matchesStatus;
	});

	const formatPrice = (pricePerDay?: number, fixedPrice?: number) => {
		const price = pricePerDay || (fixedPrice ? fixedPrice / 100 : 0);
		return price > 0 ? `$${price.toFixed(2)}/day` : "Price not set";
	};

	// Dropdown mode (original simple selector)
	if (currentViewMode === "dropdown") {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label htmlFor="package-selector">Select Package</Label>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentViewMode("grid")}
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
						<Button
							variant="outline" 
							size="sm"
							onClick={() => setCurrentViewMode("list")}
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>
				
				<Select 
					value={selectedPackageId} 
					onValueChange={onSelectPackage}
					disabled={isLoading || packages.length === 0}
				>
					<SelectTrigger id="package-selector" className="w-full">
						<SelectValue 
							placeholder={
								packages.length === 0 
									? "No packages available" 
									: "Choose a package to configure"
							} 
						/>
					</SelectTrigger>
					<SelectContent>
						{packages.map((pkg) => (
							<SelectItem key={pkg.id} value={pkg.id}>
								<div className="flex items-center gap-3 w-full">
									<Package className="h-4 w-4" />
									<div className="flex-1 min-w-0">
										<div className="font-medium truncate">{pkg.name}</div>
										<div className="text-xs text-muted-foreground">
											{formatPrice(pkg.pricePerDay, pkg.fixedPrice)} • {pkg.isAvailable === true ? "Available" : "Unavailable"} • {pkg.isPublished === true ? "Published" : "Draft"}
										</div>
									</div>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				
				{selectedPackage && showDetails && (
					<div className="p-3 bg-muted/50 rounded-lg text-sm">
						<div className="font-medium">Configuring: {selectedPackage.name}</div>
						<div className="text-muted-foreground">{formatPrice(selectedPackage.pricePerDay, selectedPackage.fixedPrice)}</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div>
					<Label className="text-base font-medium">Select Package to Configure</Label>
					<p className="text-sm text-muted-foreground">
						Choose a package to manage routes and scheduling
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant={currentViewMode === "grid" ? "default" : "outline"}
						size="sm"
						onClick={() => setCurrentViewMode("grid")}
					>
						<Grid3X3 className="h-4 w-4" />
					</Button>
					<Button
						variant={currentViewMode === "list" ? "default" : "outline"}
						size="sm"
						onClick={() => setCurrentViewMode("list")}
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						variant={currentViewMode === "dropdown" ? "default" : "outline"}
						size="sm"
						onClick={() => setCurrentViewMode("dropdown")}
					>
						<Filter className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Search and Filter */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search packages by name or description..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Packages</SelectItem>
						<SelectItem value="available">Available Only</SelectItem>
						<SelectItem value="unavailable">Unavailable Only</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Package Display */}
			{isLoading ? (
				<div className="text-center py-8">
					<div className="animate-pulse">Loading packages...</div>
				</div>
			) : filteredPackages.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No packages found</h3>
						<p className="text-muted-foreground">
							{packages.length === 0 
								? "Create your first package to get started"
								: "Try adjusting your search or filter criteria"
							}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className={
					currentViewMode === "grid" 
						? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
						: "space-y-3"
				}>
					{filteredPackages.map((pkg) => (
						<Card 
							key={pkg.id}
							className={`cursor-pointer transition-all hover:shadow-md ${
								selectedPackageId === pkg.id 
									? "ring-2 ring-primary border-primary" 
									: "hover:border-muted-foreground/50"
							}`}
							onClick={() => onSelectPackage(pkg.id)}
						>
							<CardHeader className={currentViewMode === "list" ? "pb-3" : ""}>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										<div className={`p-2 rounded-lg ${
											pkg.isAvailable === true 
												? "bg-green-100 text-green-700" 
												: "bg-gray-100 text-gray-700"
										}`}>
											<Package className="h-5 w-5" />
										</div>
										<div>
											<CardTitle className="text-base leading-tight">
												{pkg.name}
											</CardTitle>
											{currentViewMode === "grid" && pkg.description && (
												<CardDescription className="line-clamp-2 mt-1">
													{pkg.description}
												</CardDescription>
											)}
										</div>
									</div>
									{selectedPackageId === pkg.id && (
										<CheckCircle className="h-5 w-5 text-primary" />
									)}
								</div>
							</CardHeader>
							
							<CardContent className={currentViewMode === "list" ? "pt-0" : ""}>
								{currentViewMode === "list" && pkg.description && (
									<p className="text-sm text-muted-foreground mb-3 line-clamp-1">
										{pkg.description}
									</p>
								)}
								
								<div className="flex flex-wrap gap-2 mb-3">
									<Badge variant={pkg.isAvailable === true ? "default" : "secondary"}>
										{pkg.isAvailable === true ? (
											<CheckCircle className="mr-1 h-3 w-3" />
										) : (
											<AlertCircle className="mr-1 h-3 w-3" />
										)}
										{pkg.isAvailable === true ? "Available" : "Unavailable"}
									</Badge>
									<Badge variant={pkg.isPublished === true ? "outline" : "secondary"}>
										{pkg.isPublished === true ? "Published" : "Draft"}
									</Badge>
								</div>

								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2 text-muted-foreground">
										<DollarSign className="h-4 w-4" />
										<span>{formatPrice(pkg.pricePerDay, pkg.fixedPrice)}</span>
									</div>
									{pkg.createdAt && (
										<div className="flex items-center gap-2 text-muted-foreground">
											<Calendar className="h-4 w-4" />
											<span>Created {new Date(pkg.createdAt).toLocaleDateString()}</span>
										</div>
									)}
								</div>

								{selectedPackageId === pkg.id && showDetails && (
									<div className="mt-3 pt-3 border-t">
										<div className="flex items-center gap-2 text-sm font-medium text-primary">
											<Settings className="h-4 w-4" />
											Currently configuring this package
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Selected Package Summary */}
			{selectedPackage && showDetails && currentViewMode !== "dropdown" && (
				<Card className="border-primary/50 bg-primary/5">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Settings className="h-4 w-4" />
							Currently Configuring
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div>
								<div className="font-medium">{selectedPackage.name}</div>
								<div className="text-sm text-muted-foreground">
									{formatPrice(selectedPackage.pricePerDay, selectedPackage.fixedPrice)}
								</div>
							</div>
							<div className="flex gap-2">
								<Badge variant={selectedPackage.isAvailable === true ? "default" : "secondary"}>
									{selectedPackage.isAvailable === true ? "Available" : "Unavailable"}
								</Badge>
								<Badge variant={selectedPackage.isPublished === true ? "outline" : "secondary"}>
									{selectedPackage.isPublished === true ? "Published" : "Draft"}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}