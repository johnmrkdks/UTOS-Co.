import { DataTable } from "@/components/tables/data-table";
import { useGetCarBrandsQuery } from "@/features/dashboard/car-management/hooks/queries/use-get-car-brands-query";
import { brandColumns } from "./brand-columns";

export function BrandsList() {
	const { data: carBrands } = useGetCarBrandsQuery();

	return (
		<div>
			<DataTable
				columns={brandColumns}
				data={carBrands?.data || []}
			/>
		</div>
	)
}
