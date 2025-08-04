import { CarIcon, SearchIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "@tanstack/react-router";

export function EmptyCarsList() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
			<div className="relative mb-6">
				<div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
					<CarIcon className="w-10 h-10 text-muted-foreground" />
				</div>
				<div className="absolute -top-1 -right-1 w-8 h-8 bg-background border-2 border-muted rounded-full flex items-center justify-center">
					<SearchIcon className="w-4 h-4 text-muted-foreground" />
				</div>
			</div>
			<h3 className="text-lg font-semibold mb-2">No cars found</h3>
			<p className="text-muted-foreground mb-6 max-w-sm">
				We couldn't find any cars matching your criteria. Try adjusting your filters or search terms.
			</p>
			<div className="flex gap-2">
				<Button variant="outline" onClick={() => router.invalidate()}>
					Refresh
				</Button>
			</div>
		</div>
	)
}

