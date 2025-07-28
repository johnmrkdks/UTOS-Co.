import type { Row } from "@tanstack/react-table"
import type { CarFeature } from "server/types"
import { EditFeatureDialog } from "./edit-feature-dialog";
import { DeleteFeatureDialog } from "./delete-feature-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>
}

export function FeatureTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const feature = row.original as CarFeature;

	return (
		<div className="flex gap-2">
			<EditFeatureDialog feature={feature} />
			<DeleteFeatureDialog feature={feature} />
		</div>
	)
}
