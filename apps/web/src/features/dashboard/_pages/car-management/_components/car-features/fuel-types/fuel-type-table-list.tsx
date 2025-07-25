import { DataTable } from "@/components/tables/data-table";
import { fuelTypeTableColumns } from "./fuel-type-table-columns";
import { useGetCarFuelTypesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-fuel-type/use-get-car-fuel-types-with-enriched-data-query"

export function FuelTypeTableList() {
	const { data, isLoading } = useGetCarFuelTypesWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={fuelTypeTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	)
}
