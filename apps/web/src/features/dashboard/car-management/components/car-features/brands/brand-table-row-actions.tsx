import type { Row } from "@tanstack/react-table"
import { EditBrandDialog } from "./edit-brand-dialog"
import { DeleteBrandDialog } from "./delete-brand-dialog"

type DataTableRowActionsProps<TData> = {
	row: Row<TData>
}

export function BrandTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const brand = row.original

	return (
		<div className="flex gap-2">
			<EditBrandDialog brand={brand} />
			<DeleteBrandDialog brand={brand} />
		</div>
	)
}
