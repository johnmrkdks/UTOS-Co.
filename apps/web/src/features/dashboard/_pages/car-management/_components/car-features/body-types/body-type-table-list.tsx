import { DataTable } from "@/components/tables/data-table";
import { bodyTypeTableColumns } from "./body-type-table-columns";
import { useGetCarBodyTypesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-body-type/use-get-car-body-types-with-enriched-data-query"

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
	)
}
