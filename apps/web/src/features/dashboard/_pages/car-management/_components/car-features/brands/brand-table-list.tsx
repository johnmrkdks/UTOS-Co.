import { DataTable } from "@workspace/ui/components/data-table";
import { useGetCarBrandsWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-brand/use-get-car-brands-with-enriched-data-query";
import { brandTableColumns } from "./brand-table-columns";

export function BrandTableList() {
	const { data: carBrands, isLoading } = useGetCarBrandsWithEnrichedDataQuery(
		{},
	);

	console.log(carBrands);

	return (
		<DataTable
			columns={brandTableColumns}
			data={carBrands?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	);
}
