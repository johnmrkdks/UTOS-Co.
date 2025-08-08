import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { PackageBookingTester } from "./_components/package-booking-tester";
import { CustomBookingTester } from "./_components/custom-booking-tester";
import { EndToEndTester } from "./_components/end-to-end-tester";
import { TestResults } from "./_components/test-results";
import { useState } from "react";

export interface TestResult {
	id: string;
	type: "package" | "custom" | "end-to-end";
	status: "success" | "error" | "pending";
	message: string;
	timestamp: Date;
	data?: any;
}

export function AdminTestingPage() {
	const [testResults, setTestResults] = useState<TestResult[]>([]);

	const addTestResult = (result: Omit<TestResult, "id" | "timestamp">) => {
		const newResult: TestResult = {
			...result,
			id: crypto.randomUUID(),
			timestamp: new Date(),
		};
		setTestResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Admin Testing Interface</h1>
				<p className="text-gray-600">Test booking workflows, pricing, and system functionality</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Booking System Testing</CardTitle>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="package" className="w-full">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="package">Package Booking</TabsTrigger>
									<TabsTrigger value="custom">Custom Booking</TabsTrigger>
									<TabsTrigger value="end-to-end">End-to-End</TabsTrigger>
								</TabsList>
								
								<TabsContent value="package" className="space-y-4">
									<PackageBookingTester onResult={addTestResult} />
								</TabsContent>
								
								<TabsContent value="custom" className="space-y-4">
									<CustomBookingTester onResult={addTestResult} />
								</TabsContent>
								
								<TabsContent value="end-to-end" className="space-y-4">
									<EndToEndTester onResult={addTestResult} />
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>

				<div>
					<TestResults results={testResults} />
				</div>
			</div>
		</div>
	);
}