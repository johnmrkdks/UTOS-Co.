import { DataTable } from "@workspace/ui/components/data-table";
import { useGetCarBodyTypesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-body-type/use-get-car-body-types-with-enriched-data-query";
import { bodyTypeTableColumns } from "./body-type-table-columns";

export function BodyTypeTableList() {
	const { data, isLoading } = useGetCarBodyTypesWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={bodyTypeTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	);
}
