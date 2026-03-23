import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertTriangle,
	CheckCircle,
	Eye,
	EyeOff,
	MoreHorizontal,
} from "lucide-react";

export interface PublicationToggleButtonProps {
	isPublished: boolean;
	isActive?: boolean;
	isAvailable?: boolean;
	status?: string;
	type: "car" | "package";
	onTogglePublish: (isPublished: boolean) => void;
	hasPricingConfig?: boolean;
	isLoading?: boolean;
	disabled?: boolean;
	size?: "default" | "sm" | "lg" | "icon";
}

export function PublicationToggleButton({
	isPublished,
	isActive = true,
	isAvailable = true,
	status = "available",
	type,
	onTogglePublish,
	hasPricingConfig = true,
	isLoading = false,
	disabled = false,
	size = "default",
}: PublicationToggleButtonProps) {
	const isPubliclyVisible =
		type === "car"
			? isPublished && isActive && isAvailable && status === "available"
			: isPublished && isAvailable;

	const hasIssues =
		type === "car"
			? isPublished && (!isActive || !isAvailable || status !== "available")
			: isPublished && !isAvailable;

	const canPublish =
		type === "car"
			? isActive && isAvailable && status === "available" && hasPricingConfig
			: isAvailable;

	const getPublishButtonConfig = () => {
		if (isPubliclyVisible) {
			return {
				variant: "outline" as const,
				icon: EyeOff,
				label: "Unpublish",
				action: () => onTogglePublish(false),
			};
		}
		return {
			variant: "default" as const,
			icon: Eye,
			label: "Publish",
			action: () => onTogglePublish(true),
		};
	};

	const buttonConfig = getPublishButtonConfig();
	const IconComponent = buttonConfig.icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant={buttonConfig.variant}
					size={size}
					disabled={disabled || isLoading || (!isPublished && !canPublish)}
					className={cn(
						hasIssues &&
							"border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
					)}
				>
					<IconComponent className="h-4 w-4" />
					{buttonConfig.label}
					<MoreHorizontal className="h-3 w-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuItem
					onClick={buttonConfig.action}
					disabled={isLoading || (!isPublished && !canPublish)}
				>
					<IconComponent className="h-4 w-4" />
					{buttonConfig.label}
				</DropdownMenuItem>

				{(hasIssues || (!isPublished && type === "car")) && (
					<>
						<DropdownMenuSeparator />
						<div className="px-2 py-2 text-amber-600 text-xs">
							<div className="mb-1 flex items-center gap-2">
								<AlertTriangle className="h-3 w-3" />
								{hasIssues ? "Publication Issues:" : "Requirements:"}
							</div>
							<ul className="ml-5 space-y-0.5 text-muted-foreground text-xs">
								{type === "car" && (
									<>
										{!isActive && <li>• Car is inactive</li>}
										{!isAvailable && <li>• Car is unavailable</li>}
										{status !== "available" && <li>• Car status: {status}</li>}
										{!isPublished && !hasPricingConfig && (
											<li>• Pricing configuration required</li>
										)}
									</>
								)}
								{type === "package" && !isAvailable && (
									<li>• Package is unavailable</li>
								)}
							</ul>
						</div>
					</>
				)}

				<DropdownMenuSeparator />
				<div className="px-2 py-2 text-muted-foreground text-xs">
					<div className="flex items-center gap-2">
						<CheckCircle className="h-3 w-3" />
						Status:{" "}
						{isPubliclyVisible ? "Publicly Visible" : "Hidden from Customers"}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
