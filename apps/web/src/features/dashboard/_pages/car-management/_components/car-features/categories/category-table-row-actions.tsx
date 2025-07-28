import type { Row } from "@tanstack/react-table"
import type { CarCategory } from "server/types"
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>
}

export function CategoryTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const category = row.original as CarCategory;

	return (
		<div className="flex gap-2">
			<EditCategoryDialog category={category} />
			<DeleteCategoryDialog category={category} />
		</div>
	)
}
