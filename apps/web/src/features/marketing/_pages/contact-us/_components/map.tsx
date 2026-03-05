import { cn } from "@workspace/ui/lib/utils";

type ContactUsMapProps = {
	className?: string;
};

export function ContactUsMap({ className, ...props }: ContactUsMapProps) {
	return (
		<div {...props} className={cn("overflow-hidden", className)}>
			<iframe
				title="Map"
				className="h-full w-full border-0"
				src={`https://www.google.com/maps/embed/v1/place?q=Sydney,+New+South+Wales,+Australia&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}`}
			/>
		</div>
	);
}
