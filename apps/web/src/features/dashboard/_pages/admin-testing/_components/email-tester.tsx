import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/trpc";
import type { TestResult } from "..";

interface EmailTesterProps {
	onResult: (result: Omit<TestResult, "id" | "timestamp">) => void;
}

export function EmailTester({ onResult }: EmailTesterProps) {
	const [testEmail, setTestEmail] = useState("");
	const [isLoading, setIsLoading] = useState<string | null>(null);

	// Test email connection
	const testConnectionMutation = trpc.mail.testEmailConnection.useMutation({
		onSuccess: (data) => {
			onResult({
				type: "email",
				status: "success",
				message: `Email system connection test successful: ${data.message}`,
				data: { timestamp: data.timestamp },
			});
		},
		onError: (error) => {
			onResult({
				type: "email",
				status: "error",
				message: `Email connection test failed: ${error.message}`,
			});
		},
		onSettled: () => setIsLoading(null),
	});

	// Send account verification email
	const sendVerificationMutation = trpc.mail.sendAccountVerification.useMutation({
		onSuccess: (data) => {
			onResult({
				type: "email",
				status: "success",
				message: `Account verification email sent successfully: ${data.message}`,
			});
		},
		onError: (error) => {
			onResult({
				type: "email",
				status: "error",
				message: `Failed to send verification email: ${error.message}`,
			});
		},
		onSettled: () => setIsLoading(null),
	});

	// Send password reset email
	const sendPasswordResetMutation = trpc.mail.sendPasswordReset.useMutation({
		onSuccess: (data) => {
			onResult({
				type: "email",
				status: "success",
				message: `Password reset email sent successfully: ${data.message}`,
			});
		},
		onError: (error) => {
			onResult({
				type: "email",
				status: "error",
				message: `Failed to send password reset email: ${error.message}`,
			});
		},
		onSettled: () => setIsLoading(null),
	});

	// Send driver onboarding email
	const sendDriverOnboardingMutation = trpc.mail.sendDriverOnboarding.useMutation({
		onSuccess: (data) => {
			onResult({
				type: "email",
				status: "success",
				message: `Driver onboarding email sent successfully: ${data.message}`,
			});
		},
		onError: (error) => {
			onResult({
				type: "email",
				status: "error",
				message: `Failed to send driver onboarding email: ${error.message}`,
			});
		},
		onSettled: () => setIsLoading(null),
	});

	// Send booking confirmation email
	const sendBookingConfirmationMutation = trpc.mail.sendBookingConfirmation.useMutation({
		onSuccess: (data) => {
			onResult({
				type: "email",
				status: "success",
				message: `Booking confirmation email sent successfully: ${data.message}`,
			});
		},
		onError: (error) => {
			onResult({
				type: "email",
				status: "error",
				message: `Failed to send booking confirmation email: ${error.message}`,
			});
		},
		onSettled: () => setIsLoading(null),
	});

	// Send invoice email
	const sendInvoiceMutation = trpc.mail.sendInvoice.useMutation({
		onSuccess: (data) => {
			onResult({
				type: "email",
				status: "success",
				message: `Invoice email sent successfully: ${data.message}`,
			});
		},
		onError: (error) => {
			onResult({
				type: "email",
				status: "error",
				message: `Failed to send invoice email: ${error.message}`,
			});
		},
		onSettled: () => setIsLoading(null),
	});

	const handleTestConnection = () => {
		if (!testEmail) return;
		setIsLoading("connection");
		testConnectionMutation.mutate({ testEmail });
	};

	const handleTestVerification = () => {
		if (!testEmail) return;
		setIsLoading("verification");
		sendVerificationMutation.mutate({
			to: testEmail,
			verificationToken: "test-token-" + Date.now(),
			baseUrl: window.location.origin,
		});
	};

	const handleTestPasswordReset = () => {
		if (!testEmail) return;
		setIsLoading("password-reset");
		sendPasswordResetMutation.mutate({
			to: testEmail,
			resetToken: "reset-token-" + Date.now(),
			baseUrl: window.location.origin,
		});
	};

	const handleTestDriverOnboarding = () => {
		if (!testEmail) return;
		setIsLoading("driver-onboarding");
		sendDriverOnboardingMutation.mutate({
			to: testEmail,
			driverName: "Test Driver",
			loginUrl: window.location.origin + "/dashboard",
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
		});
	};

	const isEmailValid = testEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<Mail className="h-5 w-5" />
					Email System Testing
				</h3>
				<p className="text-sm text-gray-600 mt-1">
					Test OAuth 2.0 email functionality including all email templates
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Test Configuration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="test-email">Test Email Address</Label>
						<Input
							id="test-email"
							type="email"
							value={testEmail}
							onChange={(e) => setTestEmail(e.target.value)}
							placeholder="your.email@example.com"
							className="max-w-md"
						/>
						<p className="text-xs text-gray-500">
							Enter your email address to receive test emails
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
					<CardTitle>Setup Instructions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 text-sm">
						<p><strong>To enable email functionality, configure these environment variables:</strong></p>
						<div className="bg-gray-50 p-3 rounded-md font-mono text-xs space-y-1">
							<div>GMAIL_CLIENT_ID=your_oauth_client_id</div>
							<div>GMAIL_CLIENT_SECRET=your_oauth_client_secret</div>
							<div>GMAIL_REFRESH_TOKEN=your_refresh_token</div>
							<div>GMAIL_USER=your.email@gmail.com</div>
						</div>
						<p className="text-gray-600">
							<strong>Note:</strong> Follow the OAuth 2.0 setup guide at{" "}
							<a 
								href="https://nodemailer.com/usage/using-gmail" 
								target="_blank" 
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								nodemailer.com/usage/using-gmail
							</a>{" "}
							to get these credentials.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}