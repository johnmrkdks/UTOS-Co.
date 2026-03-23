import { Badge } from "@workspace/ui/components/badge";

interface BookingTypeBadgeProps {
	booking: {
		bookingType?: string;
		packageId?: string;
		estimatedDuration?: number; // in minutes - contains client-booked hours for hourly services
		package?: {
			packageServiceType?: {
				rateType?: 'fixed' | 'hourly';
				name?: string;
			};
			duration?: number; // in minutes - package default duration
		};
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
				// For package bookings, show service type (fixed/hourly)
				const serviceType = booking.package?.packageServiceType?.rateType;
				const isHourly = serviceType === 'hourly';

				// For hourly services, use client-booked hours from estimatedDuration
				const clientBookedHours = isHourly && booking.estimatedDuration
					? Math.round(booking.estimatedDuration / 60)
					: null;

				let text = 'Service';
				if (isHourly) {
					text = clientBookedHours ? `Hourly (${clientBookedHours}h)` : 'Hourly';
				} else if (serviceType === 'fixed') {
					text = 'Fixed Service';
				}

				return {
					text,
					className: isHourly
						? 'bg-green-100 text-green-800 border-0'
						: 'bg-blue-100 text-blue-800 border-0'
				};
			case 'custom':
				return {
					text: 'Custom',
					className: 'bg-purple-100 text-purple-800 border-0'
				};
			case 'guest':
				return {
					text: 'Guest',
					className: 'bg-amber-100 text-amber-800 border-0'
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