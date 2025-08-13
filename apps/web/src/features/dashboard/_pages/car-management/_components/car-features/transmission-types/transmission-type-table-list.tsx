import { DataTable } from "@workspace/ui/components/data-table";
import { transmissionTypeTableColumns } from "./transmission-type-table-columns";
import { useGetCarTransmissionTypesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-transmission-type/use-get-car-transmission-types-with-enriched-data-query"

export function TransmissionTypeTableList() {
	const { data, isLoading } = useGetCarTransmissionTypesWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={transmissionTypeTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	)
}
