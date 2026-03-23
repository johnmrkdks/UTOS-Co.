import { Button } from "@workspace/ui/components/button";
import { Calendar as CalendarComponent } from "@workspace/ui/components/calendar";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { format } from "date-fns";
import { Calendar, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import type { TestResult } from "../index";

interface PackageBookingTesterProps {
	onResult: (result: Omit<TestResult, "id" | "timestamp">) => void;
}

export function PackageBookingTester({ onResult }: PackageBookingTesterProps) {
	const [selectedPackage, setSelectedPackage] = useState<string>("");
	const [customerName, setCustomerName] = useState("Test Customer");
	const [customerEmail, setCustomerEmail] = useState("test@example.com");
	const [customerPhone, setCustomerPhone] = useState("+61400000000");
	const [pickupDate, setPickupDate] = useState<Date>();
	const [passengerCount, setPassengerCount] = useState("2");
	const [isLoading, setIsLoading] = useState(false);

	const { data: packagesData } = useGetPackagesQuery({});
	const packages = packagesData?.data || [];

	const handleTest = async () => {
		if (!selectedPackage || !pickupDate) {
			onResult({
				type: "package",
				status: "error",
				message: "Please select a package and pickup date",
			});
			return;
		}

		setIsLoading(true);

		try {
			// Simulate package booking test
			const testData = {
				packageId: selectedPackage,
				customerName,
				customerEmail,
				customerPhone,
				scheduledPickupTime: pickupDate.toISOString(),
				passengerCount: Number.parseInt(passengerCount),
			};

			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Simulate successful booking creation
			onResult({
				type: "package",
				status: "success",
				message: `Package booking test successful! Booking ID: TEST-PKG-${Date.now()}`,
				data: testData,
			});

			// Reset form
			setSelectedPackage("");
			setCustomerName("Test Customer");
			setCustomerEmail("test@example.com");
			setCustomerPhone("+61400000000");
			setPickupDate(undefined);
			setPassengerCount("2");
		} catch (error) {
			onResult({
				type: "package",
				status: "error",
				message: `Package booking test failed: ${error}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<Label htmlFor="package">Package *</Label>
					<Select value={selectedPackage} onValueChange={setSelectedPackage}>
						<SelectTrigger>
							<SelectValue placeholder="Select a package to test" />
						</SelectTrigger>
						<SelectContent>
							{packages.map((pkg: any) => (
								<SelectItem key={pkg.id} value={pkg.id}>
									{pkg.name} - ${pkg.pricePerDay}/day
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="pickupDate">Pickup Date *</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-full justify-start text-left font-normal"
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{pickupDate ? format(pickupDate, "PPP") : "Pick a date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<CalendarComponent
								mode="single"
								selected={pickupDate}
								onSelect={setPickupDate}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<Label htmlFor="customerName">Customer Name</Label>
					<Input
						id="customerName"
						value={customerName}
						onChange={(e) => setCustomerName(e.target.value)}
					/>
				</div>

				<div>
					<Label htmlFor="customerEmail">Customer Email</Label>
					<Input
						id="customerEmail"
						type="email"
						value={customerEmail}
						onChange={(e) => setCustomerEmail(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<Label htmlFor="customerPhone">Customer Phone</Label>
					<Input
						id="customerPhone"
						value={customerPhone}
						onChange={(e) => setCustomerPhone(e.target.value)}
					/>
				</div>

				<div>
					<Label htmlFor="passengerCount">Passenger Count</Label>
					<Select value={passengerCount} onValueChange={setPassengerCount}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
								<SelectItem key={count} value={count.toString()}>
									{count} {count === 1 ? "person" : "people"}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<Button
				onClick={handleTest}
				disabled={isLoading || !selectedPackage || !pickupDate}
				className="w-full"
			>
				{isLoading ? "Testing Package Booking..." : "Test Package Booking"}
			</Button>
		</div>
	);
}
