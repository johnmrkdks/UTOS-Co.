/**
 * Publication System Integration Examples
 *
 * This file demonstrates how to integrate the publication system components
 * into existing car and package management interfaces.
 */

import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { useState } from "react";
import {
	type BulkPublicationItem,
	BulkPublicationManager,
	type PublicationFilterState,
	PublicationFilters,
	PublicationStatsCard,
	PublicationStatusBadge,
	PublicationToggleButton,
	PublicationValidationPanel,
	useTogglePublishCarMutation,
	useTogglePublishPackageMutation,
} from "../_components/publication";

// Example 1: Car Table Row with Publication Controls
export function CarTableRowWithPublication({ car }: { car: any }) {
	const togglePublishMutation = useTogglePublishCarMutation();

	const handleTogglePublish = (isPublished: boolean) => {
		togglePublishMutation.mutate({
			id: car.id,
			isPublished,
		});
	};

	return (
		<tr className="border-b">
			<td className="px-4 py-3">
				<div className="flex items-center gap-3">
					<span className="font-medium">{car.name}</span>
					<PublicationStatusBadge
						isPublished={car.isPublished}
						isActive={car.isActive}
						isAvailable={car.isAvailable}
						status={car.status}
						type="car"
						size="sm"
					/>
				</div>
			</td>
			<td className="px-4 py-3">{car.licensePlate}</td>
			<td className="px-4 py-3">{car.category?.name}</td>
			<td className="px-4 py-3">
				<PublicationToggleButton
					isPublished={car.isPublished}
					isActive={car.isActive}
					isAvailable={car.isAvailable}
					status={car.status}
					type="car"
					onTogglePublish={handleTogglePublish}
					isLoading={togglePublishMutation.isPending}
					size="sm"
				/>
			</td>
		</tr>
	);
}

// Example 2: Package Management Page with Full Publication Suite
export function PackageManagementWithPublication() {
	const [filters, setFilters] = useState<PublicationFilterState>({
		search: "",
		publicationStatus: "all",
		availability: "all",
		dateRange: "all",
	});

	// Mock data - replace with actual tRPC queries
	const packages = [
		{
			id: "1",
			name: "Airport Transfer Premium",
			isPublished: true,
			isAvailable: true,
			hasValidationErrors: false,
		},
		{
			id: "2",
			name: "City Tour Deluxe",
			isPublished: false,
			isAvailable: true,
			hasValidationErrors: true,
			validationErrors: ["Missing banner image", "Price not set"],
		},
	] as BulkPublicationItem[];

	const togglePublishMutation = useTogglePublishPackageMutation();

	const handleBulkToggle = async (itemIds: string[], isPublished: boolean) => {
		for (const id of itemIds) {
			await togglePublishMutation.mutateAsync({ id, isPublished });
		}
	};

	return (
		<div className="space-y-6">
			{/* Publication Stats Overview */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<PublicationStatsCard
					total={25}
					published={18}
					unpublished={7}
					publishedWithIssues={2}
					type="packages"
				/>
			</div>

			{/* Filters */}
			<PublicationFilters
				onFiltersChange={setFilters}
				type="packages"
				totalCount={25}
				filteredCount={20}
			/>

			{/* Bulk Management */}
			<BulkPublicationManager
				items={packages}
				type="packages"
				onBulkToggle={handleBulkToggle}
				isLoading={togglePublishMutation.isPending}
			/>

			{/* Package List */}
			<Card>
				<CardHeader>
					<CardTitle>Packages</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{packages.map((pkg) => (
							<div
								key={pkg.id}
								className="flex items-center justify-between rounded-lg border p-4"
							>
								<div className="flex items-center gap-3">
									<span className="font-medium">{pkg.name}</span>
									<PublicationStatusBadge
										isPublished={pkg.isPublished}
										isAvailable={pkg.isAvailable}
										type="package"
										size="sm"
									/>
								</div>
								<PublicationToggleButton
									isPublished={pkg.isPublished}
									isAvailable={pkg.isAvailable}
									type="package"
									onTogglePublish={(isPublished) =>
										togglePublishMutation.mutate({ id: pkg.id, isPublished })
									}
									isLoading={togglePublishMutation.isPending}
									size="sm"
								/>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Example 3: Car Edit Form with Validation Panel
export function CarEditFormWithValidation({ car }: { car: any }) {
	const togglePublishMutation = useTogglePublishCarMutation();

	const handleTogglePublish = (shouldPublish: boolean) => {
		togglePublishMutation.mutate({
			id: car.id,
			isPublished: shouldPublish,
		});
	};

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			{/* Main Form (2/3 width) */}
			<div className="lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Edit Car Details</CardTitle>
					</CardHeader>
					<CardContent>
						{/* Car form fields would go here */}
						<div className="space-y-4">
							<p>Car form fields...</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Validation Panel (1/3 width) */}
			<div className="lg:col-span-1">
				<PublicationValidationPanel data={car} type="car" />
			</div>
		</div>
	);
}

// Example 4: Dashboard Overview with Publication Analytics
export function DashboardOverviewWithPublication() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Publication Stats */}
				<PublicationStatsCard
					total={156}
					published={134}
					unpublished={22}
					publishedWithIssues={8}
					type="cars"
				/>

				<PublicationStatsCard
					total={43}
					published={38}
					unpublished={5}
					publishedWithIssues={2}
					type="packages"
				/>

				{/* Other dashboard metrics */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Total Bookings
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">1,234</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">$45,231</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Publication Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Publication Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm">Tesla Model S published</span>
							<PublicationStatusBadge
								isPublished={true}
								isActive={true}
								isAvailable={true}
								status="available"
								type="car"
								size="sm"
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Airport Transfer package updated</span>
							<PublicationStatusBadge
								isPublished={true}
								isAvailable={true}
								type="package"
								size="sm"
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Export all examples
export const PublicationIntegrationExamples = {
	CarTableRowWithPublication,
	PackageManagementWithPublication,
	CarEditFormWithValidation,
	DashboardOverviewWithPublication,
};
