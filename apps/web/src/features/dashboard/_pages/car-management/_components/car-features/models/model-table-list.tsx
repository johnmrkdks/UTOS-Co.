import { DataTable } from "@/components/tables/data-table";
import { modelTableColumns } from "./model-table-columns";
import { useGetCarModelsWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/model/use-get-car-models-with-enriched-data-query"

export function ModelTableList() {
	const { data, isLoading } = useGetCarModelsWithEnrichedDataQuery();

	return (
		<DataTable
			columns={modelTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	)
}
