import { cn } from "@workspace/ui/lib/utils";
import { Loader2Icon } from "lucide-react";

type LoaderProps = React.ComponentProps<"div">;

export function Loader({ className, ...props }: LoaderProps) {
	return (
		<div className={cn("flex h-full items-center justify-center pt-8", className)} {...props}>
			<Loader2Icon className="animate-spin" />
		</div>
	);
}
