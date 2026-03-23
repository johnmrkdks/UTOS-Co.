import { DataTable } from "@workspace/ui/components/data-table";
import { useGetCarFeaturesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-feature/use-get-car-features-with-enriched-data-query";
import { featureTableColumns } from "./feature-table-columns";

export function FeatureTableList() {
	const { data, isLoading } = useGetCarFeaturesWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={featureTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	);
}
