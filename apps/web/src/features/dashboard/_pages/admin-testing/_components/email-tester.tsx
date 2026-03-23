import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useTestEmailConnectionMutation } from "../_hooks/query/use-test-email-connection-mutation";
import { useSendAccountVerificationMutation } from "../_hooks/query/use-send-account-verification-mutation";
import { useSendPasswordResetMutation } from "../_hooks/query/use-send-password-reset-mutation";
import { useSendDriverOnboardingMutation } from "../_hooks/query/use-send-driver-onboarding-mutation";
import { useSendBookingConfirmationMutation } from "../_hooks/query/use-send-booking-confirmation-mutation";
import { useSendInvoiceMutation } from "../_hooks/query/use-send-invoice-mutation";
import { useSendDriverAssignmentNotificationMutation } from "../_hooks/query/use-send-driver-assignment-notification-mutation";
import { useSendTripStatusNotificationMutation } from "../_hooks/query/use-send-trip-status-notification-mutation";
import type { TestResult } from "..";

interface EmailTesterProps {
	onResult: (result: Omit<TestResult, "id" | "timestamp">) => void;
}

export function EmailTester({ onResult }: EmailTesterProps) {
	const [testEmail, setTestEmail] = useState("");
	const [testBookingId, setTestBookingId] = useState("");
	const [testDriverId, setTestDriverId] = useState("");
	const [isLoading, setIsLoading] = useState<string | null>(null);

	// Custom callbacks to integrate with test results
	const testConnectionMutation = useTestEmailConnectionMutation();
	const sendVerificationMutation = useSendAccountVerificationMutation();
	const sendPasswordResetMutation = useSendPasswordResetMutation();
	const sendDriverOnboardingMutation = useSendDriverOnboardingMutation();
	const sendBookingConfirmationMutation = useSendBookingConfirmationMutation();
	const sendInvoiceMutation = useSendInvoiceMutation();
	const sendDriverAssignmentMutation = useSendDriverAssignmentNotificationMutation();
	const sendTripStatusMutation = useSendTripStatusNotificationMutation();

	const handleTestConnection = () => {
		if (!testEmail) return;
		setIsLoading("connection");
		testConnectionMutation.mutate({ testEmail }, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Email system connection test successful: ${data.message}`,
					data: { timestamp: data.timestamp },
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Email connection test failed: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const handleTestVerification = () => {
		if (!testEmail) return;
		setIsLoading("verification");
		sendVerificationMutation.mutate({
			to: testEmail,
			verificationToken: "test-token-" + Date.now(),
			baseUrl: window.location.origin,
		}, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Account verification email sent successfully: ${data.message}`,
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Failed to send verification email: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const handleTestPasswordReset = () => {
		if (!testEmail) return;
		setIsLoading("password-reset");
		sendPasswordResetMutation.mutate({
			to: testEmail,
			resetToken: "reset-token-" + Date.now(),
			baseUrl: window.location.origin,
		}, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Password reset email sent successfully: ${data.message}`,
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Failed to send password reset email: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const handleTestDriverOnboarding = () => {
		if (!testEmail) return;
		setIsLoading("driver-onboarding");
		sendDriverOnboardingMutation.mutate({
			to: testEmail,
			driverName: "Test Driver",
			loginUrl: window.location.origin + "/dashboard",
		}, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Driver onboarding email sent successfully: ${data.message}`,
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Failed to send driver onboarding email: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const handleTestBookingConfirmation = () => {
		if (!testEmail) return;
		setIsLoading("booking-confirmation");
		sendBookingConfirmationMutation.mutate({
			to: testEmail,
			customerName: "Test Customer",
			bookingDetails: {
				bookingId: "TEST-" + Date.now(),
				serviceType: "Luxury Package",
				pickupDate: new Date().toISOString(),
				pickupTime: "10:00 AM",
				pickupAddress: "123 Test Street, Sydney NSW 2000",
				destinationAddress: "456 Example Road, Melbourne VIC 3000",
				packageName: "Premium City Tour",
				driverName: "John Smith",
				vehicleDetails: "Mercedes-Benz S-Class",
				amount: 25000, // $250.00 in cents
				currency: "AUD",
			},
		}, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Booking confirmation email sent successfully: ${data.message}`,
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Failed to send booking confirmation email: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const handleTestInvoice = () => {
		if (!testEmail) return;
		setIsLoading("invoice");
		sendInvoiceMutation.mutate({
			to: testEmail,
			customerName: "Test Customer",
			bookingId: "INV-" + Date.now(),
			invoiceData: {
				amount: 35000, // $350.00 in cents
				currency: "AUD",
				bookingDate: new Date().toISOString(),
				serviceType: "Custom Booking",
				route: "Sydney Airport → City Centre → Return",
				packageName: undefined,
			},
		}, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Invoice email sent successfully: ${data.message}`,
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Failed to send invoice email: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const handleTestDriverAssignment = () => {
		if (!testBookingId || !testDriverId) return;
		setIsLoading("driver-assignment");
		sendDriverAssignmentMutation.mutate({
			bookingId: testBookingId,
			driverId: testDriverId,
		}, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Driver assignment notification sent successfully: ${data.message}`,
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Failed to send driver assignment notification: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const handleTestTripStatus = () => {
		if (!testBookingId) return;
		setIsLoading("trip-status");
		sendTripStatusMutation.mutate({
			bookingId: testBookingId,
			status: "driver_en_route",
		}, {
			onSuccess: (data) => {
				onResult({
					type: "email",
					status: "success",
					message: `Trip status notification sent successfully: ${data.message}`,
				});
				setIsLoading(null);
			},
			onError: (error) => {
				onResult({
					type: "email",
					status: "error",
					message: `Failed to send trip status notification: ${error.message}`,
				});
				setIsLoading(null);
			},
		});
	};

	const isEmailValid = testEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail);
	const isBookingIdValid = testBookingId && testBookingId.trim().length > 0;
	const isDriverIdValid = testDriverId && testDriverId.trim().length > 0;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<Mail className="h-5 w-5" />
					Email System Testing
				</h3>
				<p className="text-sm text-gray-600 mt-1">
					Test OAuth 2.0 email functionality including all email templates and notifications
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Test Configuration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="test-email">Test Email Address</Label>
							<Input
								id="test-email"
								type="email"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
								placeholder="your.email@example.com"
							/>
							<p className="text-xs text-gray-500">
								Email to receive test messages
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="test-booking-id">Booking ID (for notifications)</Label>
							<Input
								id="test-booking-id"
								type="text"
								value={testBookingId}
								onChange={(e) => setTestBookingId(e.target.value)}
								placeholder="e.g., bkg_123456"
							/>
							<p className="text-xs text-gray-500">
								Existing booking ID for notification tests
							</p>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="test-driver-id">Driver ID (for assignment notifications)</Label>
						<Input
							id="test-driver-id"
							type="text"
							value={testDriverId}
							onChange={(e) => setTestDriverId(e.target.value)}
							placeholder="e.g., drv_789012"
							className="max-w-md"
						/>
						<p className="text-xs text-gray-500">
							Existing driver ID for assignment notification tests
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Connection Test</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<p className="text-sm text-gray-600">
							Test the OAuth 2.0 connection with Gmail and verify email delivery.
						</p>
						<Button
							onClick={handleTestConnection}
							disabled={!isEmailValid || isLoading === "connection"}
							className="w-full sm:w-auto"
						>
							{isLoading === "connection" ? (
								<>
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
									Testing Connection...
								</>
							) : (
								<>
									<CheckCircle className="h-4 w-4 mr-2" />
									Test Email Connection
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Email Templates</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid gap-3 sm:grid-cols-2">
							<Button
								onClick={handleTestVerification}
								disabled={!isEmailValid || isLoading === "verification"}
								variant="outline"
								className="justify-start"
							>
								{isLoading === "verification" ? (
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Account Verification
							</Button>

							<Button
								onClick={handleTestPasswordReset}
								disabled={!isEmailValid || isLoading === "password-reset"}
								variant="outline"
								className="justify-start"
							>
								{isLoading === "password-reset" ? (
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Password Reset
							</Button>

							<Button
								onClick={handleTestDriverOnboarding}
								disabled={!isEmailValid || isLoading === "driver-onboarding"}
								variant="outline"
								className="justify-start"
							>
								{isLoading === "driver-onboarding" ? (
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Driver Onboarding
							</Button>

							<Button
								onClick={handleTestBookingConfirmation}
								disabled={!isEmailValid || isLoading === "booking-confirmation"}
								variant="outline"
								className="justify-start"
							>
								{isLoading === "booking-confirmation" ? (
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Booking Confirmation
							</Button>

							<Button
								onClick={handleTestInvoice}
								disabled={!isEmailValid || isLoading === "invoice"}
								variant="outline"
								className="justify-start sm:col-span-2"
							>
								{isLoading === "invoice" ? (
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Invoice Email
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Driver & Client Notifications</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<p className="text-sm text-gray-600">
							Test booking-related notifications sent to drivers and clients. These require valid booking and driver IDs.
						</p>
						<Separator />
						<div className="grid gap-3 sm:grid-cols-2">
							<Button
								onClick={handleTestDriverAssignment}
								disabled={!isBookingIdValid || !isDriverIdValid || isLoading === "driver-assignment"}
								variant="outline"
								className="justify-start"
							>
								{isLoading === "driver-assignment" ? (
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Driver Assignment Notification
							</Button>

							<Button
								onClick={handleTestTripStatus}
								disabled={!isBookingIdValid || isLoading === "trip-status"}
								variant="outline"
								className="justify-start"
							>
								{isLoading === "trip-status" ? (
									<AlertCircle className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Client Trip Status Update
							</Button>
						</div>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p className="text-xs text-blue-700">
								<strong>Note:</strong> Driver assignment notifications are sent to the driver's email address,
								while trip status updates are sent to the customer's email address associated with the booking.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
