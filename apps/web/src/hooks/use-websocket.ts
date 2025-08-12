import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

export type WebSocketMessage = {
	type: "booking_update" | "driver_location" | "system_notification" | "ping" | "pong";
	payload: any;
	timestamp: string;
	id?: string;
};

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseWebSocketOptions {
	onMessage?: (message: WebSocketMessage) => void;
	onStatusChange?: (status: WebSocketStatus) => void;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
}

export function useWebSocket(url?: string, options: UseWebSocketOptions = {}) {
	const {
		onMessage,
		onStatusChange,
		reconnectInterval = 5000,
		maxReconnectAttempts = 5,
	} = options;

	const [status, setStatus] = useState<WebSocketStatus>("disconnected");
	const [isConnected, setIsConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectAttemptsRef = useRef(0);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const updateStatus = useCallback((newStatus: WebSocketStatus) => {
		setStatus(newStatus);
		setIsConnected(newStatus === "connected");
		onStatusChange?.(newStatus);
	}, [onStatusChange]);

	const connect = useCallback(() => {
		if (!url) return;

		if (wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		try {
			updateStatus("connecting");
			
			// Create WebSocket URL based on current environment
			const wsUrl = url.startsWith("ws") 
				? url 
				: `ws${window.location.protocol === "https:" ? "s" : ""}://${window.location.host}/ws`;
			
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				updateStatus("connected");
				reconnectAttemptsRef.current = 0;
				
				// Send initial ping to establish connection
				sendMessage({
					type: "ping",
					payload: {},
					timestamp: new Date().toISOString(),
				});
			};

			ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);
					
					// Handle ping/pong for keep-alive
					if (message.type === "ping") {
						sendMessage({
							type: "pong",
							payload: {},
							timestamp: new Date().toISOString(),
						});
						return;
					}

					onMessage?.(message);
				} catch (error) {
					console.error("Failed to parse WebSocket message:", error);
				}
			};

			ws.onclose = () => {
				updateStatus("disconnected");
				wsRef.current = null;

				// Attempt to reconnect if we haven't exceeded max attempts
				if (reconnectAttemptsRef.current < maxReconnectAttempts) {
					reconnectAttemptsRef.current++;
					reconnectTimeoutRef.current = setTimeout(() => {
						connect();
					}, reconnectInterval);
				}
			};

			ws.onerror = () => {
				updateStatus("error");
			};

		} catch (error) {
			updateStatus("error");
			console.error("WebSocket connection error:", error);
		}
	}, [url, onMessage, updateStatus, reconnectInterval, maxReconnectAttempts]);

	const sendMessage = useCallback((message: WebSocketMessage) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(message));
			return true;
		}
		return false;
	}, []);

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}
		
		reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
		
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}
		
		updateStatus("disconnected");
	}, [maxReconnectAttempts, updateStatus]);

	// Auto-connect on mount if URL is provided
	useEffect(() => {
		if (url) {
			connect();
		}

		return () => {
			disconnect();
		};
	}, [url, connect, disconnect]);

	return {
		status,
		isConnected,
		connect,
		disconnect,
		sendMessage,
	};
}