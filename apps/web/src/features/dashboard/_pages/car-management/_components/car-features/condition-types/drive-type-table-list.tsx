import { DataTable } from "@workspace/ui/components/data-table";
import { useGetCarConditionTypesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-condition-type/use-get-car-condition-types-with-enriched-data-query"
import { conditionTypeTableColumns } from "./condition-type-table-columns";

export function ConditionTypeTableList() {
	const { data, isLoading } = useGetCarConditionTypesWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={conditionTypeTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	)
}
