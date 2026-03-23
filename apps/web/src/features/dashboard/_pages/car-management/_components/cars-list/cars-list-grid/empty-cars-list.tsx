import { useRouter } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { CarIcon, SearchIcon } from "lucide-react";

export function EmptyCarsList() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center px-4 py-16 text-center">
			<div className="relative mb-6">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
					<CarIcon className="h-10 w-10 text-muted-foreground" />
				</div>
				<div className="-top-1 -right-1 absolute flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
					<SearchIcon className="h-4 w-4 text-muted-foreground" />
				</div>
			</div>
			<h3 className="mb-2 font-semibold text-lg">No cars found</h3>
			<p className="mb-6 max-w-sm text-muted-foreground">
				We couldn't find any cars matching your criteria. Try adjusting your
				filters or search terms.
			</p>
			<div className="flex gap-2">
				<Button variant="outline" onClick={() => router.invalidate()}>
					Refresh
				</Button>
			</div>
		</div>
	);
}
