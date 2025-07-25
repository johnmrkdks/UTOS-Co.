import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
