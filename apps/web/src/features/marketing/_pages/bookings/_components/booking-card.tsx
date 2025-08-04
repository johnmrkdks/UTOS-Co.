import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import placeHolder from "@/assets/placeholder.svg";

export type BookingProps = {
	model: string;
	description: string;
	image?: string;
}

type BookingCardProps = BookingProps & {
	className?: string;
};

export function BookingCard({
	model,
	description,
	image,
	className,
	...props
}: BookingCardProps) {
	return (
		<Card className={cn("bg-black/20 shadow-none p-2", className)} {...props}>
			<CardHeader>
				<CardTitle className="text-sm">{model}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<img src={image || placeHolder} alt={model} />
				<p className="text-xs">{description}</p>
			</CardContent>
			<CardFooter>
				<Button variant="dark" className="w-full">
					Book Now
				</Button>
			</CardFooter>
		</Card>
	);
}
