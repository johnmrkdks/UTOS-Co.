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
import { MoreHorizontal, Pencil, Eye } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useGetPricingConfigsQuery } from "../_hooks/query/use-get-pricing-configs-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useState } from "react";
import { EditPricingConfigDialog } from "./edit-pricing-config-dialog";
import { ViewPricingConfigDialog } from "./view-pricing-config-dialog";

export function PricingConfigTable() {
	const [editingConfig, setEditingConfig] = useState<any>(null);
	const [viewingConfig, setViewingConfig] = useState<any>(null);
	
	const pricingConfigsQuery = useGetPricingConfigsQuery({});

	if (pricingConfigsQuery.isLoading) {
		return <PricingConfigTableSkeleton />;
	}

	if (pricingConfigsQuery.isError) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">Failed to load pricing configurations</p>
			</div>
		);
	}

	const configs = pricingConfigsQuery.data?.items || [];

	if (configs.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No pricing configurations found</p>
				<p className="text-sm text-muted-foreground">Create your first pricing configuration to get started</p>
			</div>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Base Fare</TableHead>
						<TableHead>Per KM</TableHead>
						<TableHead>Per Minute</TableHead>
						<TableHead>Night Multiplier</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[50px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{configs.map((config: any) => (
						<TableRow key={config.id}>
							<TableCell className="font-medium">{config.name}</TableCell>
							<TableCell>${config.baseFare?.toFixed(2) || "0.00"}</TableCell>
							<TableCell>${config.pricePerKm?.toFixed(2) || "0.00"}</TableCell>
							<TableCell>${config.pricePerMinute?.toFixed(2) || "N/A"}</TableCell>
							<TableCell>{config.nightMultiplier ? `${config.nightMultiplier}x` : "1.0x"}</TableCell>
							<TableCell>
								<Badge variant={config.isActive ? "default" : "secondary"}>
									{config.isActive ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell>
								{new Date(config.createdAt).toLocaleDateString()}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => setViewingConfig(config)}>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setEditingConfig(config)}>
											<Pencil className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{editingConfig && (
				<EditPricingConfigDialog
					config={editingConfig}
					open={!!editingConfig}
					onOpenChange={(open) => !open && setEditingConfig(null)}
				/>
			)}

			{viewingConfig && (
				<ViewPricingConfigDialog
					config={viewingConfig}
					open={!!viewingConfig}
					onOpenChange={(open) => !open && setViewingConfig(null)}
				/>
			)}
		</>
	);
}

function PricingConfigTableSkeleton() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Base Fare</TableHead>
					<TableHead>Per KM</TableHead>
					<TableHead>Per Minute</TableHead>
					<TableHead>Night Multiplier</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Created</TableHead>
					<TableHead className="w-[50px]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }).map((_, i) => (
					<TableRow key={i}>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
						<TableCell><Skeleton className="h-4 w-16" /></TableCell>
						<TableCell><Skeleton className="h-4 w-16" /></TableCell>
						<TableCell><Skeleton className="h-4 w-16" /></TableCell>
						<TableCell><Skeleton className="h-4 w-12" /></TableCell>
						<TableCell><Skeleton className="h-6 w-20" /></TableCell>
						<TableCell><Skeleton className="h-4 w-20" /></TableCell>
						<TableCell><Skeleton className="h-8 w-8" /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}