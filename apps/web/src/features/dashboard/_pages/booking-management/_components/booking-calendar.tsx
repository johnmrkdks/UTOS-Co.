import { addHours, format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import type { BookingFilters } from "./booking-filters";

// Status to calendar event background color (hex)
const STATUS_CALENDAR_COLORS: Record<string, string> = {
	pending: "#fef3c7",
	confirmed: "#dbeafe",
	driver_assigned: "#e0e7ff",
	driver_en_route: "#ffedd5",
	arrived_pickup: "#f3e8ff",
	passenger_on_board: "#dcfce7",
	in_progress: "#ccfbf1",
	dropped_off: "#cffafe",
	awaiting_extras: "#fce7f3",
	completed: "#d1fae5",
	cancelled: "#fee2e2",
	no_show: "#f1f5f9",
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

interface BookingCalendarProps {
	filters?: BookingFilters;
}

interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	resource: {
		bookingId: string;
		customerName: string;
		status: string;
		bookingType: string;
		quotedAmount: number;
		originAddress: string | null;
		destinationAddress: string | null;
		referenceNumber?: string;
	};
}

const VIEWS = ["month", "week", "day", "agenda"] as const;
type View = (typeof VIEWS)[number];

export function BookingCalendar({ filters }: BookingCalendarProps) {
	const { openBookingDetailsDialog } = useBookingManagementModalProvider();
	const [view, setView] = useState<View>("month");
	const [date, setDate] = useState(() => new Date());

	const bookingsQuery = useGetBookingsQuery({
		limit: 500,
	});

	const events: CalendarEvent[] = useMemo(() => {
		if (!bookingsQuery.data?.data) return [];

		return bookingsQuery.data.data
			.filter((booking) => {
				if (!filters) return true;
				if (filters.bookingType && booking.bookingType !== filters.bookingType)
					return false;
				if (
					filters.customerName &&
					!booking.customerName
						.toLowerCase()
						.includes(filters.customerName.toLowerCase())
				)
					return false;
				if (filters.dateFrom) {
					const fromDate = new Date(filters.dateFrom);
					if (new Date(booking.scheduledPickupTime) < fromDate) return false;
				}
				if (filters.dateTo) {
					const toDate = new Date(filters.dateTo);
					toDate.setHours(23, 59, 59, 999);
					if (new Date(booking.scheduledPickupTime) > toDate) return false;
				}
				if (filters.minAmount && booking.quotedAmount < filters.minAmount)
					return false;
				if (filters.maxAmount && booking.quotedAmount > filters.maxAmount)
					return false;
				return true;
			})
			.map((booking) => {
				const start = new Date(booking.scheduledPickupTime);
				const end = addHours(start, 1); // Default 1 hour duration for display
				return {
					id: booking.id,
					title: `${booking.customerName} - $${booking.quotedAmount.toFixed(2)}`,
					start,
					end,
					resource: {
						bookingId: booking.id,
						customerName: booking.customerName,
						status: booking.status,
						bookingType: booking.bookingType,
						quotedAmount: booking.quotedAmount,
						originAddress: booking.originAddress,
						destinationAddress: booking.destinationAddress,
						referenceNumber: (booking as { referenceNumber?: string })
							.referenceNumber,
					},
				};
			});
	}, [bookingsQuery.data?.data, filters]);

	const handleSelectEvent = useCallback(
		(event: CalendarEvent) => {
			openBookingDetailsDialog(event.resource.bookingId);
		},
		[openBookingDetailsDialog],
	);

	const handleView = useCallback((newView: View | string) => {
		setView(newView as View);
	}, []);

	const handleNavigate = useCallback((newDate: Date) => {
		setDate(newDate);
	}, []);

	const eventStyleGetter = (event: CalendarEvent) => {
		const color = STATUS_CALENDAR_COLORS[event.resource.status] ?? "#e2e8f0";
		const isCompleted = ["completed", "cancelled", "no_show"].includes(
			event.resource.status,
		);
		return {
			style: {
				backgroundColor: color,
				borderRadius: "4px",
				opacity: isCompleted ? 0.85 : 1,
				borderLeft: `4px solid ${isCompleted ? "#64748b" : "#475569"}`,
			},
		};
	};

	if (bookingsQuery.isLoading) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				Loading calendar...
			</div>
		);
	}

	if (bookingsQuery.error) {
		return (
			<div className="py-12 text-center text-destructive">
				Error loading bookings: {bookingsQuery.error.message}
			</div>
		);
	}

	return (
		<div className="h-[600px] rounded-lg border bg-card p-4">
			<Calendar
				localizer={localizer}
				events={events}
				startAccessor="start"
				endAccessor="end"
				titleAccessor="title"
				onSelectEvent={handleSelectEvent}
				eventPropGetter={eventStyleGetter}
				views={VIEWS}
				view={view}
				date={date}
				onView={handleView}
				onNavigate={handleNavigate}
				popup
				toolbar
				showMultiDayTimes
			/>
		</div>
	);
}
