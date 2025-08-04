import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

type LastDaysPerformanceCardProps = React.ComponentProps<"div">;

export function LastDaysPerformanceCard({
	className,
	...props
}: LastDaysPerformanceCardProps) {
	return (
		<Card className={cn("shadow-none", className)} {...props}>
			<CardHeader>
				<CardTitle>Last 30 Days Performance</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Chart here</p>
			</CardContent>
		</Card>
	);
}
