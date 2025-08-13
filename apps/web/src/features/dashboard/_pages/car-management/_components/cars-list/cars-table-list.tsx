import { DataTable } from "@workspace/ui/components/data-table"
import { carsTableColumns } from "./cars-table-columns"

interface CarsTableListProps {
	carsData: any
	isLoading: boolean
}

export function CarsTableList({ carsData, isLoading }: CarsTableListProps) {
	return (
		<DataTable
			columns={carsTableColumns}
			data={carsData?.data || []}
			isLoading={isLoading}
			enableToolbar={false} // We're using custom filters
			enablePagination={true}
			pageSize={25}
			pageSizeOptions={[10, 25, 50, 100]}
			onSortingChange={(sorting) => {
				// Handle sorting changes if needed
				console.log("Sorting changed:", sorting)
			}}
			emptyState={
				<div className="text-center py-8">
					<p className="text-lg text-muted-foreground">No cars found</p>
					<p className="text-sm text-muted-foreground">
						Try adjusting your filters or add a new car
					</p>
				</div>
			}
		/>
	)
}