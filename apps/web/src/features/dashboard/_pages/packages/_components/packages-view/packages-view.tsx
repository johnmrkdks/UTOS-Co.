import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Grid3X3, Table, Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { PackagesTable } from "../packages-table/packages-table";
import { PackagesGrid } from "../packages-grid/packages-grid";

type ViewMode = "table" | "grid";
type StatusFilter = "all" | "available" | "unavailable";

export function PackagesView() {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

	return (
		<div className="space-y-4">
			{/* View Controls */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				{/* Search and Filter */}
				<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search packages..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9 w-full sm:w-[250px]"
						/>
					</div>
					<Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
						<SelectTrigger className="w-full sm:w-[150px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Packages</SelectItem>
							<SelectItem value="available">Available</SelectItem>
							<SelectItem value="unavailable">Unavailable</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center bg-muted rounded-lg p-1">
					<Button
						variant={viewMode === "grid" ? "default" : "ghost"}
						size="icon"
						onClick={() => setViewMode("grid")}
						className="flex items-center gap-2 rounded-md"
					>
						<Grid3X3 className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "table" ? "default" : "ghost"}
						size="icon"
						onClick={() => setViewMode("table")}
						className="flex items-center gap-2 rounded-md"
					>
						<Table className="h-4 w-4" />
					</Button>
				</div>

			</div>

			{/* Content */}
			{viewMode === "table" ? (
				<PackagesTable />
			) : (
				<PackagesGrid
					searchTerm={searchTerm}
					statusFilter={statusFilter}
				/>
			)}
		</div>
	);
}
