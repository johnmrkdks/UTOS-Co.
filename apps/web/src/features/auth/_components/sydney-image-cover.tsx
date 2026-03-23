import { cn } from "@workspace/ui/lib/utils";
import sydney from "@/assets/images/sydney.webp";

export function SydneyImageCover({
	className,
	...props
}: React.ComponentProps<"img">) {
	return (
		<img
			src={sydney}
			alt="Sydney"
			className={cn("h-full w-full object-cover", className)}
			{...props}
		/>
	);
}
