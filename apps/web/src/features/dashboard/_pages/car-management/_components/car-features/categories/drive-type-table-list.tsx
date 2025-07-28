import { DataTable } from "@/components/tables/data-table";
import { useGetCarCategoriesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-category/use-get-car-categories-with-enriched-data-query";
import { categoryTableColumns } from "@/features/dashboard/_pages/car-management/_components/car-features/categories/category-table-columns";

export function CategoryTableList() {
	const { data, isLoading } = useGetCarCategoriesWithEnrichedDataQuery({});

	return (
		<DataTable
			columns={categoryTableColumns}
			data={data?.data || []}
			isLoading={isLoading}
			loadingRowCount={5}
			pageSize={5}
		/>
	)
}
