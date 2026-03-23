import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Grid3X3, Search, Table } from "lucide-react";
import { useState } from "react";
import { PackagesGrid } from "../packages-grid/packages-grid";
import { PackagesTable } from "../packages-table/packages-table";

type ViewMode = "table" | "grid";
type StatusFilter = "all" | "available" | "unavailable";

export function PackagesView() {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

	return (
		<div className="space-y-4">
			{/* View Controls */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				{/* Search and Filter */}
				<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
						<Input
							placeholder="Search packages..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 sm:w-[250px]"
						/>
					</div>
					<Select
						value={statusFilter}
						onValueChange={(value: StatusFilter) => setStatusFilter(value)}
					>
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

				<div className="flex items-center rounded-lg bg-muted p-1">
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
				<PackagesGrid searchTerm={searchTerm} statusFilter={statusFilter} />
			)}
		</div>
	);
}
