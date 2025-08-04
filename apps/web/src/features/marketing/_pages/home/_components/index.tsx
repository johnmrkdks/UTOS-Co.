import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { InstantQuoteWidget } from "./instant-quote-widget";

type HomeProps = {
	className?: string;
};

export function Home({ className, ...props }: HomeProps) {
	return (
		<div
			{...props}
			className={cn("min-h-screen grid grid-cols-3 items-center justify-center gap-12 p-6", className)}
		>
			<div className="col-span-2 flex flex-col items-center gap-12 max-w-4xl text-center">

				<div className=" flex flex-col items-center gap-12 max-w-4xl text-center">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
						Down Under Chauffeur | Luxury Chauffeur Service | Airport Transfers Sydney
					</h1>
					<p className="text-base font-semibold max-w-2xl">
						We offer safe, convenient, and affordable transportation services luxury chauffeur service.
					</p>
				</div>

				<Link to="/booking">
					<Button
						variant="dark"
						size="lg"
						className="rounded-2xl"
					>
						Book Now
					</Button>
				</Link>
			</div>

			{/* Instant Quote Widget */}
			<InstantQuoteWidget />

		</div>
	);
}
