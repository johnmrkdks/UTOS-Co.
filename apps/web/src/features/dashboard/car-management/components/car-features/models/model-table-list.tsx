import { DataTable } from "@/components/tables/data-table";
import { useGetCarModelsWithEnrichedDataQuery } from "@/features/dashboard/car-management/hooks/models/queries/use-get-car-models-with-enriched-data-query";
import { modelTableColumns } from "./model-table-columns";

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
