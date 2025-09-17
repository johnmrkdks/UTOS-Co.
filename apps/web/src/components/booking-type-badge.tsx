import { Badge } from "@workspace/ui/components/badge";

interface BookingTypeBadgeProps {
	booking: {
		bookingType?: string;
		packageId?: string;
	};
	className?: string;
}

export function BookingTypeBadge({ booking, className }: BookingTypeBadgeProps) {
	// Determine booking type from either explicit bookingType field or packageId presence
	const bookingType = booking.bookingType || (booking.packageId ? 'package' : 'custom');

	// Get badge configuration based on booking type
	const getBadgeConfig = () => {
		switch (bookingType) {
			case 'package':
				return {
					text: 'Service',
					className: 'bg-blue-100 text-blue-800 border-0'
				};
			case 'custom':
				return {
					text: 'Custom',
					className: 'bg-purple-100 text-purple-800 border-0'
				};
			case 'offload':
				return {
					text: 'Offload',
					className: 'bg-orange-100 text-orange-800 border-0'
				};
			default:
				return {
					text: 'Unknown',
					className: 'bg-gray-100 text-gray-800 border-0'
				};
		}
	};

	const badgeConfig = getBadgeConfig();

	return (
		<Badge
			className={`text-xs px-2 py-0.5 ${badgeConfig.className} ${className || ''}`}
		>
			{badgeConfig.text}
		</Badge>
	);
}