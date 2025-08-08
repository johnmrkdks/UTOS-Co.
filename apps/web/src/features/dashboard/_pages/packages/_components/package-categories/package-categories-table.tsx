import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useModal } from "@/hooks/use-modal";
import { EditPackageCategoryDialog } from "./edit-package-category-dialog";
import { DeletePackageCategoryDialog } from "./delete-package-category-dialog";

interface PackageCategory {
	id: string;
	name: string;
	description: string | null;
	displayOrder: number | null;
}

interface PackageCategoriesTableProps {
	data: PackageCategory[];
	isLoading: boolean;
}

export function PackageCategoriesTable({ data, isLoading }: PackageCategoriesTableProps) {
	const { openModal, setModalData } = useModal();

	if (isLoading) {
		return <div className="p-8 text-center">Loading categories...</div>;
	}

	if (data.length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-gray-500">No package categories found.</p>
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
						<TableHead>Display Order</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((category) => (
						<TableRow key={category.id}>
							<TableCell className="font-medium">{category.name}</TableCell>
							<TableCell>{category.description || "-"}</TableCell>
							<TableCell>{category.displayOrder ?? 0}</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => {
												setModalData(category);
												openModal("edit-package-category");
											}}
											className="flex items-center gap-2"
										>
											<Pencil className="h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => {
												setModalData(category);
												openModal("delete-package-category");
											}}
											className="flex items-center gap-2 text-red-600"
										>
											<Trash2 className="h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<EditPackageCategoryDialog />
			<DeletePackageCategoryDialog />
		</>
	);
}