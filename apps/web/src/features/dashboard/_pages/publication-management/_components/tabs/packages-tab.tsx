import { PackagesPublicationTable } from "../packages-publication-table";

export function PackagesTab() {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Packages Publication Status</h2>
			<PackagesPublicationTable />
		</div>
	);
}
