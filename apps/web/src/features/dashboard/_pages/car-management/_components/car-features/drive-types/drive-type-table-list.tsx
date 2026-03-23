import { DataTable } from "@workspace/ui/components/data-table";
import { useGetCarDriveTypesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-drive-type/use-get-car-drive-types-with-enriched-data-query";
import { driveTypeTableColumns } from "./drive-type-table-columns";

export function DriveTypeTableList() {
	const { data, isLoading } = useGetCarDriveTypesWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={driveTypeTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	);
}
