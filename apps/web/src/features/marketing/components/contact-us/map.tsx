import { cn } from "@/lib/utils";

type ContactUsMapProps = {
	className?: string;
};

export function ContactUsMap({ className, ...props }: ContactUsMapProps) {
	return (
		<div {...props} className={cn("overflow-hidden", className)}>
			<iframe
				title="Map"
				className="h-full w-full border-0"
				src="https://www.google.com/maps/embed/v1/place?q=Sydney,+New+South+Wales,+Australia&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
			/>
		</div>
	);
}
