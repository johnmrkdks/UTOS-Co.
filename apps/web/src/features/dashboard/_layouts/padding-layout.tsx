import { cn } from "@/lib/utils"

type PaddingLayoutProps = {
	children: React.ReactNode
	className?: string
}

export function PaddingLayout({ children, className, ...props }: PaddingLayoutProps) {
	return (
		<div className={cn("p-4", className)} {...props}>
			{children}
		</div>
	)
}
