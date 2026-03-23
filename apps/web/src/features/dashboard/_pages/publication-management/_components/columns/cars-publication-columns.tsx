import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import {
	PublicationStatusBadge,
	PublicationToggleButton,
} from "@/features/dashboard/_components/publication";
import { PublicationRowActions } from "../publication-row-actions";

interface CarsPublicationColumnsProps {
	onTogglePublish: (carId: string) => void;
	hasCarPricingConfig: (carId: string) => boolean;
	getCarPricingConfig: (carId: string) => any | null;
	isToggling: boolean;
}

export const getCarsPublicationColumns = ({
	onTogglePublish,
	hasCarPricingConfig,
	getCarPricingConfig,
	isToggling,
}: CarsPublicationColumnsProps): ColumnDef<any>[] => [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Car Name" />
		),
		cell: ({ row }) => {
			const car = row.original;
			return (
				<div className="space-y-1">
					<div className="font-medium">{car.name}</div>
					<div className="text-muted-foreground text-sm">
						{car.brand?.name} {car.model?.name}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "category",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Category" />
		),
		cell: ({ row }) => {
			return (
				<Badge variant="outline">
					{row.original.category?.name || "No Category"}
				</Badge>
			);
		},
	},
	{
		accessorKey: "pricing",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Pricing" sortable={false} />
		),
		cell: ({ row }) => {
			const car = row.original;
			const pricingConfig = getCarPricingConfig(car.id);

			if (!pricingConfig) {
				return (
					<div className="space-y-1">
						<Badge variant="destructive" className="text-xs">
							No Pricing
						</Badge>
						<div className="text-muted-foreground text-xs">
							Configure pricing to publish
						</div>
					</div>
				);
			}

			return (
				<div className="space-y-1">
					<div className="font-medium">
						${pricingConfig.firstKmRate.toFixed(2)} for{" "}
						{pricingConfig.firstKmLimit || 10}km
					</div>
					<div className="text-muted-foreground text-xs">
						Then ${pricingConfig.pricePerKm.toFixed(2)}/km
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Publication Status"
				sortable={false}
			/>
		),
		cell: ({ row }) => {
			const car = row.original;
			const getPublicationStatus = (car: any) => {
				const isFullyPublished =
					car.isPublished &&
					car.isActive &&
					car.isAvailable &&
					car.status === "available";

				if (isFullyPublished) return "published";
				if (car.isPublished) return "published-with-issues";
				if (car.isActive && car.isAvailable && car.status === "available")
					return "ready";
				return "unpublished";
			};

			return (
				<PublicationStatusBadge
					isPublished={car.isPublished}
					isActive={car.isActive}
					isAvailable={car.isAvailable}
					status={car.status}
					type="car"
				/>
			);
		},
	},
	{
		accessorKey: "operational_status",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Operational Status"
				sortable={false}
			/>
		),
		cell: ({ row }) => {
			const car = row.original;
			const getStatusColor = (status: string) => {
				switch (status) {
					case "available":
						return "bg-green-100 text-green-800";
					case "maintenance":
						return "bg-yellow-100 text-yellow-800";
					case "out_of_service":
						return "bg-red-100 text-red-800";
					default:
						return "bg-gray-100 text-gray-800";
				}
			};

			return (
				<div className="space-y-1">
					<Badge className={getStatusColor(car.status)}>
						{car.status?.replace("_", " ").toUpperCase()}
					</Badge>
					<div className="text-muted-foreground text-xs">
						Active: {car.isActive ? "Yes" : "No"} | Available:{" "}
						{car.isAvailable ? "Yes" : "No"}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "updatedAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Last Updated" />
		),
		cell: ({ row }) => {
			const date = new Date(row.original.updatedAt);
			return (
				<div className="text-sm">
					{date.toLocaleDateString()}
					<div className="text-muted-foreground text-xs">
						{date.toLocaleTimeString()}
					</div>
				</div>
			);
		},
	},
	{
		id: "actions",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Actions"
				sortable={false}
				pinnable={false}
			/>
		),
		cell: ({ row }) => {
			const car = row.original;
			const hasPricingConfig = hasCarPricingConfig(car.id);
			const canPublish =
				car.isActive &&
				car.isAvailable &&
				car.status === "available" &&
				hasPricingConfig;

			return (
				<div className="flex items-center gap-2">
					<PublicationToggleButton
						isPublished={car.isPublished}
						isActive={car.isActive}
						isAvailable={car.isAvailable}
						status={car.status}
						type="car"
						onTogglePublish={() => onTogglePublish(car.id)}
						hasPricingConfig={hasPricingConfig}
						disabled={false} // Let the button handle its own disabled logic
						isLoading={isToggling}
					/>
					<PublicationRowActions carId={car.id} carName={car.name} />
				</div>
			);
		},
	},
];
