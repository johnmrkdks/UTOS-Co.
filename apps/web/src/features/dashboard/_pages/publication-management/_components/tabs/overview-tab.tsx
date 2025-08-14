import { PublicationOverviewStats } from "../publication-overview-stats";
import { OverviewSkeleton } from "../skeletons";

interface OverviewTabProps {
	isLoading?: boolean;
}

export function OverviewTab({ isLoading }: OverviewTabProps) {
	if (isLoading) {
		return <OverviewSkeleton />;
	}

	return (
		<div className="space-y-4">
			<PublicationOverviewStats />
		</div>
	);
}