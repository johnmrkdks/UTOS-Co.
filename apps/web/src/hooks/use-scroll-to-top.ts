import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

type ScrollBehavior = "smooth" | "instant" | "auto";

interface UseScrollToTopOptions {
	behavior?: ScrollBehavior;
	disabled?: boolean;
}

export function useScrollToTop(options: UseScrollToTopOptions = {}) {
	const { behavior = "smooth", disabled = false } = options;
	const location = useLocation();
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Skip if disabled
		if (disabled) return;

		// Add a small delay to ensure the DOM has updated
		const timeoutId = setTimeout(() => {
			if (scrollContainerRef.current) {
				scrollContainerRef.current.scrollTo({
					top: 0,
					behavior: behavior,
				});
			}
		}, 50);

		return () => clearTimeout(timeoutId);
	}, [location.pathname, behavior, disabled]);

	return scrollContainerRef;
}
