import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { CalendarIcon, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Calendar as CalendarComponent } from "@workspace/ui/components/calendar";
import { format } from "date-fns";
import { Textarea } from "@workspace/ui/components/textarea";
import type { TestResult } from "../index";

interface CustomBookingTesterProps {
	onResult: (result: Omit<TestResult, "id" | "timestamp">) => void;
}

export function CustomBookingTester({ onResult }: CustomBookingTesterProps) {
	const [originAddress, setOriginAddress] = useState("Sydney Airport, NSW");
	const [destinationAddress, setDestinationAddress] = useState("Circular Quay, Sydney NSW");
	const [customerName, setCustomerName] = useState("Test Customer");
	const [customerEmail, setCustomerEmail] = useState("test@example.com");
	const [customerPhone, setCustomerPhone] = useState("+61400000000");
	const [pickupDate, setPickupDate] = useState<Date>();
	const [passengerCount, setPassengerCount] = useState("2");
	const [specialRequests, setSpecialRequests] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [quote, setQuote] = useState<any>(null);

	const handleQuoteTest = async () => {
		if (!originAddress || !destinationAddress || !pickupDate) {
			onResult({
				type: "custom",
				status: "error",
				message: "Please fill in origin, destination, and pickup date",
			});
			return;
		}

		setIsLoading(true);

		try {
			// Simulate instant quote calculation
			await new Promise(resolve => setTimeout(resolve, 1500));

			const mockQuote = {
				baseFare: 45.00,
				distanceFare: 28.50,
				timeFare: 15.00,
				totalAmount: 88.50,
				estimatedDistance: 19.5,
				estimatedDuration: 45,
				breakdown: {
					baseFare: 45.00,
					distance: "19.5 km × $1.46/km = $28.50",
					time: "45 min × $0.33/min = $15.00",
					subtotal: 88.50,
					gst: 8.85,
					total: 97.35,
				}
			};

			setQuote(mockQuote);

			onResult({
				type: "custom",
				status: "success",
				message: `Quote generated: $${mockQuote.breakdown.total} for ${mockQuote.estimatedDistance}km trip`,
				data: mockQuote,
			});

		} catch (error) {
			onResult({
				type: "custom",
				status: "error",
				message: `Quote generation failed: ${error}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleBookingTest = async () => {
		if (!quote) {
			onResult({
				type: "custom",
				status: "error",
				message: "Please generate a quote first",
			});
			return;
		}

		setIsLoading(true);

		try {
			// Simulate custom booking creation
			await new Promise(resolve => setTimeout(resolve, 2000));

			const testData = {
				bookingType: "custom",
				originAddress,
				destinationAddress,
				customerName,
				customerEmail,
				customerPhone,
				scheduledPickupTime: pickupDate?.toISOString(),
				passengerCount: parseInt(passengerCount),
				specialRequests,
				quote,
			};

			onResult({
				type: "custom",
				status: "success",
				message: `Custom booking test successful! Booking ID: TEST-CUSTOM-${Date.now()}`,
				data: testData,
			});

			// Reset form
			setOriginAddress("Sydney Airport, NSW");
			setDestinationAddress("Circular Quay, Sydney NSW");
			setCustomerName("Test Customer");
			setCustomerEmail("test@example.com");
			setCustomerPhone("+61400000000");
			setPickupDate(undefined);
			setPassengerCount("2");
			setSpecialRequests("");
			setQuote(null);

		} catch (error) {
			onResult({
				type: "custom",
				status: "error",
				message: `Custom booking test failed: ${error}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid gap-4">
				<div>
					<Label htmlFor="originAddress">Origin Address *</Label>
					<div className="relative">
						<MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							id="originAddress"
							value={originAddress}
							onChange={(e) => setOriginAddress(e.target.value)}
							placeholder="Enter pickup location"
							className="pl-10"
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="destinationAddress">Destination Address *</Label>
					<div className="relative">
						<MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							id="destinationAddress"
							value={destinationAddress}
							onChange={(e) => setDestinationAddress(e.target.value)}
							placeholder="Enter drop-off location"
							className="pl-10"
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="pickupDate">Pickup Date & Time *</Label>
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

			<div className="grid gap-4 md:grid-cols-3">
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

				<div>
					<Label htmlFor="customerPhone">Customer Phone</Label>
					<Input
						id="customerPhone"
						value={customerPhone}
						onChange={(e) => setCustomerPhone(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<Label htmlFor="passengerCount">Passenger Count</Label>
					<Input
						id="passengerCount"
						type="number"
						min="1"
						max="8"
						value={passengerCount}
						onChange={(e) => setPassengerCount(e.target.value)}
					/>
				</div>

				<div>
					<Label htmlFor="specialRequests">Special Requests</Label>
					<Textarea
						id="specialRequests"
						value={specialRequests}
						onChange={(e) => setSpecialRequests(e.target.value)}
						placeholder="Child seat, wheelchair access, etc."
						rows={2}
					/>
				</div>
			</div>

			{quote && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Generated Quote</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span>Base Fare:</span>
								<span>${quote.breakdown.baseFare.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>Distance ({quote.estimatedDistance}km):</span>
								<span>${quote.distanceFare.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>Time ({quote.estimatedDuration} min):</span>
								<span>${quote.timeFare.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>GST (10%):</span>
								<span>${quote.breakdown.gst.toFixed(2)}</span>
							</div>
							<hr />
							<div className="flex justify-between font-bold">
								<span>Total:</span>
								<span>${quote.breakdown.total.toFixed(2)}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="flex gap-2">
				<Button 
					onClick={handleQuoteTest} 
					disabled={isLoading || !originAddress || !destinationAddress || !pickupDate}
					variant="outline"
					className="flex-1"
				>
					{isLoading ? "Generating..." : "Test Quote Generation"}
				</Button>

				<Button 
					onClick={handleBookingTest} 
					disabled={isLoading || !quote}
					className="flex-1"
				>
					{isLoading ? "Testing Booking..." : "Test Custom Booking"}
				</Button>
			</div>
		</div>
	);
}