import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import type { ColumnDef } from "@tanstack/react-table";
import { PublicationStatusBadge, PublicationToggleButton } from "@/features/dashboard/_components/publication";

interface PackagesPublicationColumnsProps {
	onTogglePublish: (packageId: string) => void;
	isToggling: boolean;
}

export const getPackagesPublicationColumns = ({
	onTogglePublish,
	isToggling
}: PackagesPublicationColumnsProps): ColumnDef<any>[] => [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Package Name" />
		),
		cell: ({ row }) => {
			const pkg = row.original;
			return (
				<div className="space-y-1">
					<div className="font-medium">{pkg.name}</div>
					<div className="text-sm text-muted-foreground line-clamp-2">
						{pkg.description}
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
			const pkg = row.original;
			const getPublicationStatus = (pkg: any) => {
				const isFullyPublished = pkg.isPublished && pkg.isAvailable;

				if (isFullyPublished) return "published";
				if (pkg.isPublished) return "published-with-issues";
				if (pkg.isAvailable) return "ready";
				return "unpublished";
			};

			return (
				<PublicationStatusBadge
					isPublished={pkg.isPublished}
					isAvailable={pkg.isAvailable}
					type="package"
				/>
			);
		},
	},
	{
		accessorKey: "availability_status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Availability Status" sortable={false} />
		),
		cell: ({ row }) => {
			const pkg = row.original;
			return (
				<div className="space-y-1">
					<Badge className={pkg.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
						{pkg.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
					</Badge>
					{pkg.maxBookings && (
						<div className="text-xs text-muted-foreground">
							Max: {pkg.maxBookings} bookings
						</div>
					)}
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
			const pkg = row.original;
			const canPublish = pkg.isAvailable;

			return (
				<PublicationToggleButton
					isPublished={pkg.isPublished}
					isAvailable={pkg.isAvailable}
					type="package"
					onTogglePublish={() => onTogglePublish(pkg.id)}
					disabled={!canPublish && !pkg.isPublished}
					isLoading={isToggling}
				/>
			);
		},
	},
];