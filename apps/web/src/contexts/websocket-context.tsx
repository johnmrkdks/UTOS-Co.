import React, { createContext, useContext, useCallback, useState } from "react";
import { useWebSocket, type WebSocketMessage, type WebSocketStatus } from "@/hooks/use-websocket";
import { toast } from "sonner";

interface BookingUpdate {
	bookingId: string;
	status: string;
	driverId?: string;
	location?: {
		latitude: number;
		longitude: number;
		address?: string;
	};
	estimatedArrival?: string;
	message?: string;
}

interface DriverLocation {
	driverId: string;
	bookingId?: string;
	location: {
		latitude: number;
		longitude: number;
		address?: string;
		heading?: number;
		speed?: number;
	};
	timestamp: string;
}

interface SystemNotification {
	id: string;
	type: "info" | "warning" | "error" | "success";
	title: string;
	message: string;
	persistent?: boolean;
}

interface WebSocketContextType {
	status: WebSocketStatus;
	isConnected: boolean;
	bookingUpdates: Record<string, BookingUpdate>;
	driverLocations: Record<string, DriverLocation>;
	notifications: SystemNotification[];
	subscribeToBooking: (bookingId: string) => void;
	unsubscribeFromBooking: (bookingId: string) => void;
	subscribeToDriver: (driverId: string) => void;
	unsubscribeFromDriver: (driverId: string) => void;
	clearNotification: (notificationId: string) => void;
	sendMessage: (message: WebSocketMessage) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
	children: React.ReactNode;
	wsUrl?: string;
}

export function WebSocketProvider({ children, wsUrl }: WebSocketProviderProps) {
	const [bookingUpdates, setBookingUpdates] = useState<Record<string, BookingUpdate>>({});
	const [driverLocations, setDriverLocations] = useState<Record<string, DriverLocation>>({});
	const [notifications, setNotifications] = useState<SystemNotification[]>([]);
	const [subscribedBookings] = useState<Set<string>>(new Set());
	const [subscribedDrivers] = useState<Set<string>>(new Set());

	const handleMessage = useCallback((message: WebSocketMessage) => {
		switch (message.type) {
			case "booking_update": {
				const update = message.payload as BookingUpdate;
				setBookingUpdates(prev => ({
					...prev,
					[update.bookingId]: update,
				}));

				// Show notification for booking status changes
				if (subscribedBookings.has(update.bookingId)) {
					toast.success(`Booking ${update.bookingId}: ${update.message || update.status}`, {
						description: update.location?.address,
					});
				}
				break;
			}

			case "driver_location": {
				const location = message.payload as DriverLocation;
				setDriverLocations(prev => ({
					...prev,
					[location.driverId]: location,
				}));
				break;
			}

			case "system_notification": {
				const notification = message.payload as SystemNotification;
				setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10

				// Show toast notification
				const toastFn = {
					info: toast.info,
					warning: toast.warning,
					error: toast.error,
					success: toast.success,
				}[notification.type];

				toastFn(notification.title, {
					description: notification.message,
					duration: notification.persistent ? Infinity : 5000,
				});
				break;
			}
		}
	}, [subscribedBookings]);

	const handleStatusChange = useCallback((status: WebSocketStatus) => {
		switch (status) {
			case "connected":
				toast.success("Real-time updates connected");
				break;
			case "disconnected":
				toast.warning("Real-time updates disconnected");
				break;
			case "error":
				toast.error("Real-time updates connection error");
				break;
		}
	}, []);

	const { status, isConnected, sendMessage } = useWebSocket(wsUrl, {
		onMessage: handleMessage,
		onStatusChange: handleStatusChange,
		reconnectInterval: 5000,
		maxReconnectAttempts: 5,
	});

	const subscribeToBooking = useCallback((bookingId: string) => {
		subscribedBookings.add(bookingId);
		sendMessage({
			type: "booking_update",
			payload: { action: "subscribe", bookingId },
			timestamp: new Date().toISOString(),
		});
	}, [sendMessage, subscribedBookings]);

	const unsubscribeFromBooking = useCallback((bookingId: string) => {
		subscribedBookings.delete(bookingId);
		sendMessage({
			type: "booking_update",
			payload: { action: "unsubscribe", bookingId },
			timestamp: new Date().toISOString(),
		});
	}, [sendMessage, subscribedBookings]);

	const subscribeToDriver = useCallback((driverId: string) => {
		subscribedDrivers.add(driverId);
		sendMessage({
			type: "driver_location",
			payload: { action: "subscribe", driverId },
			timestamp: new Date().toISOString(),
		});
	}, [sendMessage, subscribedDrivers]);

	const unsubscribeFromDriver = useCallback((driverId: string) => {
		subscribedDrivers.delete(driverId);
		sendMessage({
			type: "driver_location",
			payload: { action: "unsubscribe", driverId },
			timestamp: new Date().toISOString(),
		});
	}, [sendMessage, subscribedDrivers]);

	const clearNotification = useCallback((notificationId: string) => {
		setNotifications(prev => prev.filter(n => n.id !== notificationId));
	}, []);

	const contextValue: WebSocketContextType = {
		status,
		isConnected,
		bookingUpdates,
		driverLocations,
		notifications,
		subscribeToBooking,
		unsubscribeFromBooking,
		subscribeToDriver,
		unsubscribeFromDriver,
		clearNotification,
		sendMessage,
	};

	return (
		<WebSocketContext.Provider value={contextValue}>
			{children}
		</WebSocketContext.Provider>
	);
}

export function useWebSocketContext() {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocketContext must be used within a WebSocketProvider");
	}
	return context;
}