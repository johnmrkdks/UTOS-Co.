import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import type { ReactNode } from "react"

type OAuthButtonProps = {
	provider: string
	icon: string | ReactNode
	onClick: () => void
	isLoading?: boolean
	disabled?: boolean
	className?: string
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
	showLabel?: boolean
}

export function OAuthButton({
	provider,
	icon,
	onClick,
	isLoading = false,
	disabled = false,
	className = "",
	variant = "outline",
}: OAuthButtonProps) {
	const renderIcon = () => {
		if (isLoading) {
			return <Loader2Icon className="w-4 h-4 animate-spin" />
		}

		if (typeof icon === "string") {
			return <img src={icon || "/placeholder.svg"} alt={`${provider} icon`} className="w-4 h-4" />
		}

		return icon
	}

	return (
		<Button
			variant={variant}
			onClick={onClick}
			size="icon"
			disabled={disabled || isLoading}
			className={cn(className)}
		>
			<div>{renderIcon()}</div>
		</Button>
	)
}

