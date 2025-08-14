import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import type { ColumnDef } from "@tanstack/react-table";
import { PublicationStatusBadge, PublicationToggleButton } from "@/features/dashboard/_components/publication";

interface CarsPublicationColumnsProps {
	onTogglePublish: (carId: string) => void;
	isToggling: boolean;
}

export const getCarsPublicationColumns = ({
	onTogglePublish,
	isToggling
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
					<div className="text-sm text-muted-foreground">
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
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Publication Status" sortable={false} />
		),
		cell: ({ row }) => {
			const car = row.original;
			const getPublicationStatus = (car: any) => {
				const isFullyPublished = car.isPublished && car.isActive && car.isAvailable && car.status === 'available';

				if (isFullyPublished) return "published";
				if (car.isPublished) return "published-with-issues";
				if (car.isActive && car.isAvailable && car.status === 'available') return "ready";
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
			<DataTableColumnHeader column={column} title="Operational Status" sortable={false} />
		),
		cell: ({ row }) => {
			const car = row.original;
			const getStatusColor = (status: string) => {
				switch (status) {
					case 'available': return 'bg-green-100 text-green-800';
					case 'maintenance': return 'bg-yellow-100 text-yellow-800';
					case 'out_of_service': return 'bg-red-100 text-red-800';
					default: return 'bg-gray-100 text-gray-800';
				}
			};

			return (
				<div className="space-y-1">
					<Badge className={getStatusColor(car.status)}>
						{car.status?.replace('_', ' ').toUpperCase()}
					</Badge>
					<div className="text-xs text-muted-foreground">
						Active: {car.isActive ? "Yes" : "No"} | Available: {car.isAvailable ? "Yes" : "No"}
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
					<div className="text-xs text-muted-foreground">
						{date.toLocaleTimeString()}
					</div>
				</div>
			);
		},
	},
	{
		id: "actions",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Actions" sortable={false} pinnable={false} />
		),
		cell: ({ row }) => {
			const car = row.original;
			const canPublish = car.isActive && car.isAvailable && car.status === 'available';

			return (
				<PublicationToggleButton
					isPublished={car.isPublished}
					isActive={car.isActive}
					isAvailable={car.isAvailable}
					status={car.status}
					type="car"
					onTogglePublish={() => onTogglePublish(car.id)}
					disabled={!canPublish && !car.isPublished}
					isLoading={isToggling}
				/>
			);
		},
	},
];