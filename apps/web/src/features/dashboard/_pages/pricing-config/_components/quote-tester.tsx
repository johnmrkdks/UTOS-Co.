import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useGetPricingConfigsQuery } from "../_hooks/query/use-get-pricing-configs-query";
import { Calculator, MapPin, Clock, DollarSign } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

const quoteTesterSchema = z.object({
	pricingConfigId: z.string().min(1, "Please select a pricing configuration"),
	distance: z.number().min(0.1, "Distance must be at least 0.1 km"),
	duration: z.number().min(1, "Duration must be at least 1 minute"),
	additionalStops: z.number().min(0, "Additional stops cannot be negative"),
	waitingTime: z.number().min(0, "Waiting time cannot be negative"),
	timeOfDay: z.string().min(1, "Please select time of day"),
	dayType: z.enum(["weekday", "weekend"]),
});

type QuoteTesterForm = z.infer<typeof quoteTesterSchema>;

export function QuoteTester() {
	const [quote, setQuote] = useState<any>(null);
	const pricingConfigsQuery = useGetPricingConfigsQuery();
	
	const form = useForm<QuoteTesterForm>({
		resolver: zodResolver(quoteTesterSchema),
		defaultValues: {
			pricingConfigId: "",
			distance: 10,
			duration: 30,
			additionalStops: 0,
			waitingTime: 0,
			timeOfDay: "10:00",
			dayType: "weekday",
		},
	});

	const onSubmit = (data: QuoteTesterForm) => {
		const config = pricingConfigsQuery.data?.items?.find(
			(c: any) => c.id === data.pricingConfigId
		);

		if (!config) return;

		// Calculate base fare
		let totalFare = config.baseFare || 0;

		// Calculate distance fare
		let distanceFare = 0;
		if (config.firstKmRate && data.distance > 0) {
			const firstKmDistance = Math.min(data.distance, config.firstKmLimit || 5);
			const remainingDistance = Math.max(0, data.distance - (config.firstKmLimit || 5));
			
			distanceFare = (firstKmDistance * (config.firstKmRate || 0)) + 
						  (remainingDistance * (config.pricePerKm || 0));
		} else {
			distanceFare = data.distance * (config.pricePerKm || 0);
		}

		// Calculate time fare
		let timeFare = 0;
		if (config.pricePerMinute) {
			timeFare = data.duration * config.pricePerMinute;
		}

		// Calculate multiplier
		let multiplier = 1.0;
		const hour = parseInt(data.timeOfDay.split(':')[0]);
		
		// Check peak hours
		if (config.peakHourStart && config.peakHourEnd) {
			const peakStart = parseInt(config.peakHourStart.split(':')[0]);
			const peakEnd = parseInt(config.peakHourEnd.split(':')[0]);
			if (hour >= peakStart && hour <= peakEnd) {
				multiplier = config.peakHourMultiplier || 1.0;
			}
		}
		
		// Check night hours
		if (config.nightHourStart && config.nightHourEnd) {
			const nightStart = parseInt(config.nightHourStart.split(':')[0]);
			const nightEnd = parseInt(config.nightHourEnd.split(':')[0]);
			if (hour >= nightStart || hour <= nightEnd) {
				multiplier = Math.max(multiplier, config.nightMultiplier || 1.0);
			}
		}
		
		// Weekend multiplier
		if (data.dayType === "weekend" && config.weekendMultiplier) {
			multiplier = Math.max(multiplier, config.weekendMultiplier);
		}

		// Additional charges
		const stopCharges = data.additionalStops * (config.stopCharge || 0);
		const waitingCharges = data.waitingTime * (config.waitingChargePerMinute || 0);

		// Calculate final amounts
		const subtotal = totalFare + distanceFare + timeFare;
		const subtotalWithMultiplier = subtotal * multiplier;
		const finalTotal = subtotalWithMultiplier + stopCharges + waitingCharges;

		setQuote({
			config: config.name,
			breakdown: {
				baseFare: totalFare,
				distanceFare: distanceFare,
				timeFare: timeFare,
				multiplier: multiplier,
				stopCharges: stopCharges,
				waitingCharges: waitingCharges,
				subtotal: subtotal,
				subtotalWithMultiplier: subtotalWithMultiplier,
				total: finalTotal,
			},
			parameters: data,
		});
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Input Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Test Parameters
					</CardTitle>
					<CardDescription>
						Enter booking details to calculate quote
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="pricingConfigId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pricing Configuration</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select configuration" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{pricingConfigsQuery.data?.items?.map((config: any) => (
													<SelectItem key={config.id} value={config.id}>
														{config.name} {config.isActive && <Badge variant="secondary" className="ml-2">Active</Badge>}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="distance"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Distance (km)</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													step="0.1" 
													min="0.1"
													{...field} 
													onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="duration"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (minutes)</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													min="1"
													{...field} 
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="additionalStops"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Additional Stops</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													min="0"
													{...field} 
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="waitingTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Waiting Time (min)</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													min="0"
													{...field} 
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="timeOfDay"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Time of Day</FormLabel>
											<FormControl>
												<Input type="time" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="dayType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Day Type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select day type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="weekday">Weekday</SelectItem>
													<SelectItem value="weekend">Weekend</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit" className="w-full">
								Calculate Quote
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Quote Results */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Quote Results
					</CardTitle>
					<CardDescription>
						Calculated fare breakdown
					</CardDescription>
				</CardHeader>
				<CardContent>
					{quote ? (
						<div className="space-y-4">
							<div className="text-center">
								<p className="text-sm text-muted-foreground">Total Fare</p>
								<p className="text-3xl font-bold">${quote.breakdown.total.toFixed(2)}</p>
								<p className="text-sm text-muted-foreground">Using {quote.config}</p>
							</div>

							<Separator />

							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="flex items-center gap-2">
										<MapPin className="h-4 w-4" />
										Base Fare
									</span>
									<span>${quote.breakdown.baseFare.toFixed(2)}</span>
								</div>

								<div className="flex justify-between">
									<span className="flex items-center gap-2">
										<MapPin className="h-4 w-4" />
										Distance Fare ({quote.parameters.distance}km)
									</span>
									<span>${quote.breakdown.distanceFare.toFixed(2)}</span>
								</div>

								{quote.breakdown.timeFare > 0 && (
									<div className="flex justify-between">
										<span className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											Time Fare ({quote.parameters.duration}min)
										</span>
										<span>${quote.breakdown.timeFare.toFixed(2)}</span>
									</div>
								)}

								{quote.breakdown.multiplier !== 1.0 && (
									<div className="flex justify-between text-orange-600">
										<span>Time Multiplier ({quote.breakdown.multiplier}x)</span>
										<span>+${(quote.breakdown.subtotalWithMultiplier - quote.breakdown.subtotal).toFixed(2)}</span>
									</div>
								)}

								{quote.breakdown.stopCharges > 0 && (
									<div className="flex justify-between">
										<span>Stop Charges ({quote.parameters.additionalStops} stops)</span>
										<span>${quote.breakdown.stopCharges.toFixed(2)}</span>
									</div>
								)}

								{quote.breakdown.waitingCharges > 0 && (
									<div className="flex justify-between">
										<span>Waiting Charges ({quote.parameters.waitingTime}min)</span>
										<span>${quote.breakdown.waitingCharges.toFixed(2)}</span>
									</div>
								)}
							</div>

							<Separator />

							<div className="flex justify-between font-semibold text-lg">
								<span>Total</span>
								<span>${quote.breakdown.total.toFixed(2)}</span>
							</div>
						</div>
					) : (
						<div className="text-center py-8">
							<Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">Enter parameters and calculate quote</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}