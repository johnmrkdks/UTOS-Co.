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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useModal } from "@/hooks/use-modal";
import { EditPackageServiceTypeDialog } from "./edit-package-service-type-dialog";
import { DeletePackageServiceTypeDialog } from "./delete-package-service-type-dialog";

interface PackageServiceType {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	rateType: "fixed" | "hourly";
	isActive: boolean;
	displayOrder: number | null;
}

interface PackageServiceTypesTableProps {
	data: PackageServiceType[];
	isLoading: boolean;
}

export function PackageServiceTypesTable({ data, isLoading }: PackageServiceTypesTableProps) {
	const { openModal } = useModal();

	if (isLoading) {
		return <div className="p-8 text-center">Loading service types...</div>;
	}

	if (data.length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-gray-500">No service types found.</p>
			</div>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Rate Type</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Order</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data
						.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
						.map((serviceType) => (
							<TableRow key={serviceType.id}>
								<TableCell className="font-medium">{serviceType.name}</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{serviceType.description || "No description"}
								</TableCell>
								<TableCell>
									<Badge variant={serviceType.rateType === "fixed" ? "outline" : "secondary"}>
										{serviceType.rateType === "fixed" ? "Fixed Rate" : "Hourly Rate"}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge variant={serviceType.isActive ? "default" : "secondary"}>
										{serviceType.isActive ? "Active" : "Inactive"}
									</Badge>
								</TableCell>
								<TableCell>{serviceType.displayOrder || 0}</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => {
													openModal("edit-package-service-type", serviceType);
												}}
												className="cursor-pointer"
											>
												<Pencil className="mr-2 h-4 w-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => {
													openModal("delete-package-service-type", serviceType);
												}}
												className="cursor-pointer text-red-600 focus:text-red-600"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>

			<EditPackageServiceTypeDialog />
			<DeletePackageServiceTypeDialog />
		</>
	);
}