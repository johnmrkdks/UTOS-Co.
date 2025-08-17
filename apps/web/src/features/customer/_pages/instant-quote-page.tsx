import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { 
	MapPin, 
	Plus, 
	Calendar, 
	Clock, 
	Users, 
	Calculator,
	Car,
	Route,
	X,
	Bookmark,
	History,
	Star,
	Package
} from "lucide-react";
import { useState } from "react";
import { useUserQuery } from "@/hooks/query/use-user-query";

interface Stop {
	id: string;
	address: string;
	duration?: number;
}

export function InstantQuotePage() {
	const { session } = useUserQuery();
	const [activeTab, setActiveTab] = useState("new-quote");
	const [pickupAddress, setPickupAddress] = useState("");
	const [dropoffAddress, setDropoffAddress] = useState("");
	const [stops, setStops] = useState<Stop[]>([]);
	const [passengers, setPassengers] = useState(1);
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [serviceType, setServiceType] = useState("");
	const [specialRequests, setSpecialRequests] = useState("");
	const [quote, setQuote] = useState<any>(null);

	// Mock data - replace with real tRPC calls
	const savedRoutes = [
		{ id: 1, name: "Home to Airport", from: "123 Main St, Sydney", to: "Sydney Airport", used: 5 },
		{ id: 2, name: "Office to Hotel", from: "456 Business Ave", to: "Luxury Hotel Downtown", used: 2 },
		{ id: 3, name: "City Tour Route", from: "Central Station", to: "Opera House", used: 1 }
	];

	const recentQuotes = [
		{ id: 1, from: "Circular Quay", to: "Bondi Beach", price: "$85", date: "2 days ago" },
		{ id: 2, from: "Airport", to: "CBD", price: "$65", date: "1 week ago" },
	];

	const addStop = () => {
		setStops([...stops, { id: Math.random().toString(), address: "" }]);
	};

	const removeStop = (id: string) => {
		setStops(stops.filter(stop => stop.id !== id));
	};

	const updateStop = (id: string, address: string) => {
		setStops(stops.map(stop => stop.id === id ? { ...stop, address } : stop));
	};

	const loadSavedRoute = (route: any) => {
		setPickupAddress(route.from);
		setDropoffAddress(route.to);
		setActiveTab("new-quote");
	};

	const calculateQuote = () => {
		// Enhanced quote calculation with service type considerations
		const basePrice = 50;
		const distancePrice = Math.random() * 100 + 50;
		const stopPrice = stops.length * 15;
		const serviceMultiplier = serviceType === "premium" ? 1.5 : serviceType === "luxury" ? 2 : 1;
		const total = (basePrice + distancePrice + stopPrice) * serviceMultiplier;

		setQuote({
			baseFare: basePrice,
			distanceFare: distancePrice.toFixed(2),
			stopsFare: stopPrice,
			serviceTypeFare: serviceType ? (total - (basePrice + distancePrice + stopPrice)).toFixed(2) : 0,
			total: total.toFixed(2),
			estimatedDuration: "45-60 minutes",
			serviceType: serviceType || "standard",
			carOptions: [
				{ 
					name: "Premium Sedan", 
					price: total.toFixed(2), 
					capacity: "1-4 passengers",
					features: ["WiFi", "Water", "Phone Charger"],
					rating: 4.8
				},
				{ 
					name: "Executive SUV", 
					price: (total * 1.2).toFixed(2), 
					capacity: "1-6 passengers",
					features: ["WiFi", "Refreshments", "Premium Audio"],
					rating: 4.9
				},
				{ 
					name: "Luxury Van", 
					price: (total * 1.4).toFixed(2), 
					capacity: "1-8 passengers",
					features: ["WiFi", "Full Bar", "Entertainment System"],
					rating: 4.7
				}
			]
		});
	};

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold text-gray-900">Fare Estimator</h1>
				<p className="text-gray-600">Get instant fare estimates for your custom trips</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="new-quote" className="flex items-center gap-2">
						<Calculator className="h-4 w-4" />
						New Quote
					</TabsTrigger>
					<TabsTrigger value="saved-routes" className="flex items-center gap-2">
						<Bookmark className="h-4 w-4" />
						Saved Routes
					</TabsTrigger>
					<TabsTrigger value="history" className="flex items-center gap-2">
						<History className="h-4 w-4" />
						Quote History
					</TabsTrigger>
				</TabsList>

				<TabsContent value="new-quote" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Enhanced Quote Form */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calculator className="h-5 w-5" />
									Trip Details
								</CardTitle>
								<CardDescription>
									Enter your pickup and destination for fare estimate
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">

								{/* Pickup and Dropoff */}
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="pickup" className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-green-600" />
											Pickup Location
										</Label>
										<Input
											id="pickup"
											placeholder="Enter pickup address"
											value={pickupAddress}
											onChange={(e) => setPickupAddress(e.target.value)}
										/>
									</div>

									{/* Stops */}
									{stops.map((stop, index) => (
										<div key={stop.id} className="space-y-2">
											<Label className="flex items-center gap-2">
												<Route className="h-4 w-4 text-blue-600" />
												Stop {index + 1}
											</Label>
											<div className="flex gap-2">
												<Input
													placeholder="Enter stop address"
													value={stop.address}
													onChange={(e) => updateStop(stop.id, e.target.value)}
													className="flex-1"
												/>
												<Button
													variant="outline"
													size="icon"
													onClick={() => removeStop(stop.id)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}

									<Button
										variant="outline"
										onClick={addStop}
										className="w-full flex items-center gap-2"
									>
										<Plus className="h-4 w-4" />
										Add Stop
									</Button>

									<div className="space-y-2">
										<Label htmlFor="dropoff" className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-red-600" />
											Dropoff Location
										</Label>
										<Input
											id="dropoff"
											placeholder="Enter dropoff address"
											value={dropoffAddress}
											onChange={(e) => setDropoffAddress(e.target.value)}
										/>
									</div>
								</div>




								{/* Calculate Button */}
								<Button
									onClick={calculateQuote}
									className="w-full"
									disabled={!pickupAddress || !dropoffAddress}
								>
									<Calculator className="h-4 w-4 mr-2" />
									Estimate Fare
								</Button>
							</CardContent>
						</Card>

						{/* Enhanced Quote Results */}
						{quote ? (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Car className="h-5 w-5" />
										Your Fare Estimate
									</CardTitle>
									<CardDescription>
										Estimated pricing for your trip
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Price Breakdown */}
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-600">Base Fare</span>
											<span>${quote.baseFare}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Distance</span>
											<span>${quote.distanceFare}</span>
										</div>
										{stops.length > 0 && (
											<div className="flex justify-between">
												<span className="text-gray-600">Stops ({stops.length})</span>
												<span>${quote.stopsFare}</span>
											</div>
										)}
										<hr />
										<div className="flex justify-between text-lg font-semibold">
											<span>Total</span>
											<span className="text-primary">${quote.total}</span>
										</div>
									</div>

									{/* Enhanced Car Options */}
									<div className="space-y-3">
										<h4 className="font-medium">Available Vehicles</h4>
										{quote.carOptions.map((car: any, index: number) => (
											<div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
												<div className="flex justify-between items-start mb-2">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<p className="font-medium">{car.name}</p>
															<div className="flex items-center gap-1">
																<Star className="h-3 w-3 text-yellow-400 fill-current" />
																<span className="text-xs text-gray-600">{car.rating}</span>
															</div>
														</div>
														<p className="text-sm text-gray-600 mb-2">{car.capacity}</p>
														<div className="flex flex-wrap gap-1">
															{car.features.map((feature: string, i: number) => (
																<Badge key={i} variant="outline" className="text-xs">
																	{feature}
																</Badge>
															))}
														</div>
													</div>
													<div className="text-right">
														<p className="font-semibold text-primary text-lg">${car.price}</p>
													</div>
												</div>
											</div>
										))}
									</div>

									{/* Action Buttons */}
									<div className="space-y-2">
										<Button className="w-full">
											<Car className="h-4 w-4 mr-2" />
											Book This Trip
										</Button>
										<div className="grid grid-cols-2 gap-2">
											<Button variant="outline">
												<Bookmark className="h-4 w-4 mr-2" />
												Save Route
											</Button>
											<Button variant="outline">
												Save Quote
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						) : (
							<Card className="flex items-center justify-center h-96">
								<CardContent className="text-center">
									<Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Estimate</h3>
									<p className="text-gray-600">
										Fill in your pickup and destination to get fare estimate
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>

				<TabsContent value="saved-routes" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bookmark className="h-5 w-5" />
								Your Saved Routes
							</CardTitle>
							<CardDescription>
								Quick access to your frequently used routes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								{savedRoutes.map((route) => (
									<div key={route.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => loadSavedRoute(route)}>
										<div className="flex justify-between items-start mb-2">
											<h4 className="font-medium">{route.name}</h4>
											<Badge variant="secondary">{route.used} times</Badge>
										</div>
										<div className="space-y-1 text-sm text-gray-600">
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-green-600" />
												<span>{route.from}</span>
											</div>
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-red-600" />
												<span>{route.to}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<History className="h-5 w-5" />
								Recent Quotes
							</CardTitle>
							<CardDescription>
								Your quote history and saved estimates
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								{recentQuotes.map((quote) => (
									<div key={quote.id} className="border rounded-lg p-4">
										<div className="flex justify-between items-center mb-2">
											<span className="font-medium">{quote.price}</span>
											<span className="text-sm text-gray-500">{quote.date}</span>
										</div>
										<div className="space-y-1 text-sm text-gray-600">
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-green-600" />
												<span>{quote.from}</span>
											</div>
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-red-600" />
												<span>{quote.to}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Cross-sell CTA */}
			<Card className="bg-primary/5 border-primary/20">
				<CardContent className="p-6 text-center">
					<h3 className="text-lg font-semibold mb-2">Looking for Fixed Services?</h3>
					<p className="text-gray-600 mb-4">
						Browse our curated collection of luxury services with fixed pricing.
					</p>
					<Button variant="outline" asChild>
						<a href="/customer/services">
							<Package className="h-4 w-4 mr-2" />
							Browse Services
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}