import { cn } from "@workspace/ui/lib/utils";

type PaddingLayoutProps = {
	children: React.ReactNode;
	className?: string;
};

export function PaddingLayout({
	children,
	className,
	...props
}: PaddingLayoutProps) {
	return (
		<div className={cn("w-full min-w-0 p-4", className)} {...props}>
			{children}
		</div>
	);
}
