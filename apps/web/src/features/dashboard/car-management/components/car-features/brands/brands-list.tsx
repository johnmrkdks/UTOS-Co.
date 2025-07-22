import { DataTable } from "@/components/tables/data-table";
import { brandColumns } from "./brand-columns";
import { useGetCarBrandsWithEnrichedDataQuery } from "@/features/dashboard/car-management/hooks/queries/use-get-car-brands-with-enriched-data-query";

export function BrandsList() {
	const { data: carBrands } = useGetCarBrandsWithEnrichedDataQuery();

	console.log(carBrands)

	return (
		<div>
			<DataTable
				columns={brandColumns}
				data={carBrands?.data || []}
			/>
		</div>
	)
}
