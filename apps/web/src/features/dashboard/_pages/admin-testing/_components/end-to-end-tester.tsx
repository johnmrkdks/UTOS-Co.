import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import type { TestResult } from "../index";

interface EndToEndTesterProps {
	onResult: (result: Omit<TestResult, "id" | "timestamp">) => void;
}

interface TestStep {
	id: string;
	name: string;
	status: "pending" | "running" | "success" | "error";
	message?: string;
}

export function EndToEndTester({ onResult }: EndToEndTesterProps) {
	const [isRunning, setIsRunning] = useState(false);
	const [progress, setProgress] = useState(0);
	const [testSteps, setTestSteps] = useState<TestStep[]>([
		{ id: "pricing-config", name: "Pricing Configuration", status: "pending" },
		{ id: "package-validation", name: "Package Validation", status: "pending" },
		{
			id: "driver-availability",
			name: "Driver Availability",
			status: "pending",
		},
		{ id: "quote-generation", name: "Quote Generation", status: "pending" },
		{ id: "booking-creation", name: "Booking Creation", status: "pending" },
		{ id: "driver-assignment", name: "Driver Assignment", status: "pending" },
		{ id: "status-updates", name: "Status Updates", status: "pending" },
		{ id: "completion", name: "Booking Completion", status: "pending" },
	]);

	const updateStepStatus = (
		stepId: string,
		status: TestStep["status"],
		message?: string,
	) => {
		setTestSteps((prev) =>
			prev.map((step) =>
				step.id === stepId ? { ...step, status, message } : step,
			),
		);
	};

	const runEndToEndTest = async () => {
		setIsRunning(true);
		setProgress(0);

		// Reset all steps
		setTestSteps((prev) =>
			prev.map((step) => ({ ...step, status: "pending" as const })),
		);

		const steps = [
			{ id: "pricing-config", name: "Pricing Configuration", delay: 800 },
			{ id: "package-validation", name: "Package Validation", delay: 600 },
			{ id: "driver-availability", name: "Driver Availability", delay: 1000 },
			{ id: "quote-generation", name: "Quote Generation", delay: 1200 },
			{ id: "booking-creation", name: "Booking Creation", delay: 900 },
			{ id: "driver-assignment", name: "Driver Assignment", delay: 700 },
			{ id: "status-updates", name: "Status Updates", delay: 500 },
			{ id: "completion", name: "Booking Completion", delay: 600 },
		];

		let successfulSteps = 0;
		const totalSteps = steps.length;

		try {
			for (let i = 0; i < steps.length; i++) {
				const step = steps[i];

				// Mark step as running
				updateStepStatus(step.id, "running");

				// Simulate step execution
				await new Promise((resolve) => setTimeout(resolve, step.delay));

				// Simulate occasional failures for realistic testing
				const shouldFail = Math.random() < 0.1; // 10% chance of failure

				if (shouldFail && i > 2) {
					// Don't fail the first few critical steps
					updateStepStatus(step.id, "error", "Simulated random failure");

					onResult({
						type: "end-to-end",
						status: "error",
						message: `End-to-end test failed at step: ${step.name}`,
						data: {
							completedSteps: i,
							totalSteps,
							failedStep: step.name,
						},
					});

					setIsRunning(false);
					return;
				}

				updateStepStatus(step.id, "success", "Completed successfully");
				successfulSteps++;

				// Update progress
				setProgress(((i + 1) / totalSteps) * 100);

				// Report intermediate progress
				onResult({
					type: "end-to-end",
					status: "success",
					message: `✓ ${step.name} completed (${i + 1}/${totalSteps})`,
					data: { step: step.name, progress: ((i + 1) / totalSteps) * 100 },
				});
			}

			// All steps completed successfully
			onResult({
				type: "end-to-end",
				status: "success",
				message: `🎉 End-to-end test completed successfully! All ${totalSteps} steps passed.`,
				data: {
					completedSteps: successfulSteps,
					totalSteps,
					testId: `E2E-${Date.now()}`,
				},
			});
		} catch (error) {
			onResult({
				type: "end-to-end",
				status: "error",
				message: `End-to-end test failed with error: ${error}`,
			});
		} finally {
			setIsRunning(false);
		}
	};

	const getStepIcon = (status: TestStep["status"]) => {
		switch (status) {
			case "success":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "running":
				return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
			case "error":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			default:
				return (
					<div className="h-4 w-4 rounded-full border-2 border-gray-300" />
				);
		}
	};

	const getStepBadgeVariant = (status: TestStep["status"]) => {
		switch (status) {
			case "success":
				return "default";
			case "running":
				return "secondary";
			case "error":
				return "destructive";
			default:
				return "outline";
		}
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						End-to-End Workflow Test
						{isRunning && (
							<Badge variant="secondary" className="animate-pulse">
								Running...
							</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<div className="mb-2 flex items-center justify-between text-sm">
							<span>Test Progress</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<Progress value={progress} className="h-2" />
					</div>

					<div className="space-y-2">
						{testSteps.map((step, index) => (
							<div
								key={step.id}
								className="flex items-center justify-between rounded-lg border bg-card p-3"
							>
								<div className="flex items-center gap-3">
									<span className="w-6 text-muted-foreground text-sm">
										{index + 1}.
									</span>
									{getStepIcon(step.status)}
									<div>
										<span className="font-medium text-sm">{step.name}</span>
										{step.message && (
											<div className="text-muted-foreground text-xs">
												{step.message}
											</div>
										)}
									</div>
								</div>
								<Badge variant={getStepBadgeVariant(step.status)}>
									{step.status}
								</Badge>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Button
				onClick={runEndToEndTest}
				disabled={isRunning}
				className="w-full"
				size="lg"
			>
				{isRunning ? "Running End-to-End Test..." : "Start End-to-End Test"}
			</Button>

			<div className="text-muted-foreground text-sm">
				<p>
					This test simulates a complete booking workflow from quote generation
					to completion, including driver assignment and status updates.
				</p>
			</div>
		</div>
	);
}
