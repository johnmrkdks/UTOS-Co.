import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { AlertTriangle, Clock, Eye, EyeOff } from "lucide-react";

export interface PublicationStatusBadgeProps {
	isPublished?: boolean;
	isActive?: boolean;
	isAvailable?: boolean;
	status?: string;
	type?: "car" | "package";
	size?: "sm" | "md" | "lg";
}

export function PublicationStatusBadge({
	isPublished = false,
	isActive = true,
	isAvailable = true,
	status = "available",
	type = "car",
	size = "md",
}: PublicationStatusBadgeProps) {
	// Determine overall publication status
	const isPubliclyVisible =
		type === "car"
			? isPublished && isActive && isAvailable && status === "available"
			: isPublished && isAvailable;

	// Get appropriate styling and content
	const getStatusConfig = () => {
		if (isPubliclyVisible) {
			return {
				variant: "default" as const,
				icon: Eye,
				label: "Published",
				description: "Visible to customers",
			};
		}

		if (
			isPublished &&
			type === "car" &&
			(!isActive || !isAvailable || status !== "available")
		) {
			return {
				variant: "destructive" as const,
				icon: AlertTriangle,
				label: "Published (Inactive)",
				description: "Published but not available",
			};
		}

		if (!isPublished) {
			return {
				variant: "secondary" as const,
				icon: EyeOff,
				label: "Unpublished",
				description: "Not visible to customers",
			};
		}

		return {
			variant: "secondary" as const,
			icon: Clock,
			label: "Draft",
			description: "Work in progress",
		};
	};

	const config = getStatusConfig();
	const IconComponent = config.icon;

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5",
		md: "text-sm px-2.5 py-1",
		lg: "text-base px-3 py-1.5",
	};

	const iconSizes = {
		sm: 10,
		md: 12,
		lg: 14,
	};

	return (
		<Badge
			variant={config.variant}
			className={cn(
				"inline-flex items-center gap-1.5 font-medium",
				sizeClasses[size],
			)}
			title={config.description}
		>
			<IconComponent size={iconSizes[size]} />
			{config.label}
		</Badge>
	);
}
