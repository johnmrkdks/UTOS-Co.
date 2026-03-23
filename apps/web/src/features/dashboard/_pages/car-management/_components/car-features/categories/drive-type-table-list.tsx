import { DataTable } from "@workspace/ui/components/data-table";
import { categoryTableColumns } from "@/features/dashboard/_pages/car-management/_components/car-features/categories/category-table-columns";
import { useGetCarCategoriesWithEnrichedDataQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-category/use-get-car-categories-with-enriched-data-query";

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
	);
}
