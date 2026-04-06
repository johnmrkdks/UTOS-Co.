import { cn } from "@workspace/ui/lib/utils";

const STATS = [
	{ label: "Average rating", value: "5.0" },
	{ label: "Happy clients", value: "1000+" },
	{ label: "Vehicles", value: "15+" },
] as const;

type TrustStatsStripProps = {
	className?: string;
};

/** Minimal trust indicators — used on marketing pages (e.g. Fleet, About). */
export function TrustStatsStrip({ className }: TrustStatsStripProps) {
	return (
		<section
			className={cn(
				"border-border/50 border-b bg-card py-6 md:py-7",
				className,
			)}
		>
			<div className="container mx-auto max-w-7xl px-6">
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
					{STATS.map((s) => (
						<div
							key={s.label}
							className="flex flex-col items-center justify-center text-center sm:items-start sm:text-left"
						>
							<p className="font-sans font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
								{s.value}
							</p>
							<p className="text-muted-foreground text-sm">{s.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
