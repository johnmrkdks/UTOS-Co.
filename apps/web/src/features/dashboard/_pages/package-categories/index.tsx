import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import { PackageCategoriesTable } from "./_components/package-categories-table";
import { useModal } from "@/hooks/use-modal";
import { AddPackageCategoryDialog } from "./_components/add-package-category-dialog";
import { useGetPackageCategoriesQuery } from "./_hooks/query/use-get-package-categories-query";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export function PackageCategoriesPage() {
	const { openModal } = useModal();
	const { data: categories = [], isLoading } = useGetPackageCategoriesQuery();

	return (
		<PaddingLayout className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Package Categories</h1>
					<p className="text-gray-600">Manage package categories for organized booking options</p>
				</div>
				<Button
					onClick={() => openModal("add-package-category")}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Category
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-medium">Total Categories</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{categories.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-medium">Active Categories</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{categories.length}</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Categories</CardTitle>
				</CardHeader>
				<CardContent>
					<PackageCategoriesTable data={categories} isLoading={isLoading} />
				</CardContent>
			</Card>

			<AddPackageCategoryDialog />
		</PaddingLayout>
	);
}
