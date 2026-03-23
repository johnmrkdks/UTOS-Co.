import { DataTable } from "@workspace/ui/components/data-table";
import { useGetCarModelsWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-get-car-models-with-enriched-data-query";
import { modelTableColumns } from "./model-table-columns";

export function ModelTableList() {
	const { data, isLoading } = useGetCarModelsWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={modelTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	);
}
