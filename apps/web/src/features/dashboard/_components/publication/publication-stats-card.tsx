import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Eye, EyeOff, TrendingUp, AlertTriangle } from "lucide-react";

export interface PublicationStatsProps {
	total: number;
	published: number;
	unpublished: number;
	publishedWithIssues?: number;
	type: "cars" | "packages";
	className?: string;
}

export function PublicationStatsCard({
	total,
	published,
	unpublished,
	publishedWithIssues = 0,
	type,
	className,
}: PublicationStatsProps) {
	const publishedPercentage = total > 0 ? Math.round((published / total) * 100) : 0;
	const issuesPercentage = total > 0 ? Math.round((publishedWithIssues / total) * 100) : 0;

	return (
		<Card className={className}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium capitalize">
					{type} Publication Status
				</CardTitle>
				<TrendingUp className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{/* Main Stats */}
					<div className="grid grid-cols-3 gap-2 text-center">
						<div>
							<div className="text-2xl font-bold text-green-600">{published}</div>
							<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
								<Eye className="h-3 w-3" />
								Published
							</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-gray-600">{unpublished}</div>
							<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
								<EyeOff className="h-3 w-3" />
								Unpublished
							</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-amber-600">{publishedWithIssues}</div>
							<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
								<AlertTriangle className="h-3 w-3" />
								With Issues
							</div>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Publication Rate</span>
							<span className="font-medium">{publishedPercentage}%</span>
						</div>
						<Progress 
							value={publishedPercentage} 
							className="h-2"
						/>
					</div>

					{/* Summary Badges */}
					<div className="flex flex-wrap gap-2">
						<Badge variant="outline" className="text-xs">
							Total: {total}
						</Badge>
						{publishedWithIssues > 0 && (
							<Badge variant="destructive" className="text-xs">
								{issuesPercentage}% need attention
							</Badge>
						)}
						{publishedPercentage >= 80 && (
							<Badge variant="default" className="text-xs">
								Good coverage
							</Badge>
						)}
						{publishedPercentage < 50 && (
							<Badge variant="destructive" className="text-xs">
								Low publication rate
							</Badge>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}