import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

type ReportCardProps = React.ComponentProps<"div"> & {
	title: string;
	value: number;
	description: string;
	icon?: LucideIcon;
};

export function ReportCard({
	title,
	description,
	value,
	icon: Icon,
	className,
	...props
}: ReportCardProps) {
	return (
		<Card
			className={cn("flex flex-col gap-2 shadow-none", className)}
			{...props}
		>
			<CardHeader>
				<CardTitle className="flex items-center">
					{Icon && <Icon className="mr-2 h-5 w-5" />} {title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<p className="font-bold text-2xl">{value}</p>
				<CardDescription className="text-xs">{description}</CardDescription>
			</CardContent>
		</Card>
	);
}
