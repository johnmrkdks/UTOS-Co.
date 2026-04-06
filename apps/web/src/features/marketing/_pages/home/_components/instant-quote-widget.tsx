import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@workspace/ui/components/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { format, parse } from "date-fns";
import {
	AlertCircle,
	ArrowRight,
	Car,
	MapPin,
	Navigation,
	Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { DateTimePicker } from "@/components/date-time-picker";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";
import { useGetPublishedCarsWithHourlyPricingQuery } from "@/features/customer/_hooks/query/use-get-published-cars-with-hourly-pricing-query";
import { useGetPublishedPackagesQuery } from "@/features/marketing/_pages/services/_hooks/query/use-get-published-packages-query";
import { useCheckInstantQuoteAvailabilityQuery } from "../_hooks/query/use-check-instant-quote-availability-query";
import { GooglePlacesInput } from "./google-places-input-simple";

const transferTypeEnum = z.enum(["hourly", "point_to_point"]);

const instantQuoteSchema = z
	.object({
		originAddress: z.string().min(1, "Origin is required"),
		destinationAddress: z.string().optional().default(""),
		stops: z
			.array(
				z.object({
					address: z.string().min(1, "Stop address is required"),
				}),
			)
			.optional()
			.default([]),
		pickupDate: z.string().min(1, "Pickup date is required"),
		pickupTime: z.string().min(1, "Pickup time is required"),
		transferType: transferTypeEnum,
		vehicleCategory: z.string().min(1),
		hourlyPackageId: z.string().optional().default(""),
		hourlyCarId: z.string().optional().default(""),
	})
	.superRefine((data, ctx) => {
		if (
			data.transferType === "point_to_point" &&
			!data.destinationAddress?.trim()
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Destination is required",
				path: ["destinationAddress"],
			});
		}
		if (data.transferType === "hourly") {
			const hasCar = data.hourlyCarId?.trim();
			const hasPkg = data.hourlyPackageId?.trim();
			if (!hasCar && !hasPkg) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select a vehicle or hourly service",
					path: ["hourlyCarId"],
				});
			}
		}
	});

type InstantQuoteForm = z.infer<typeof instantQuoteSchema>;

type InstantQuoteWidgetProps = {
	className?: string;
};

function defaultPickupDate(): string {
	return new Date().toISOString().slice(0, 10);
}

/** Seeded by migration `0016_system_hourly_template_package`; used when no manual hourly package exists. */
const SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID = "sys_hourly_iq_template";

export function InstantQuoteWidget({ className }: InstantQuoteWidgetProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const [originGeometry, setOriginGeometry] = useState<unknown>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<unknown>(null);
	const [stopsGeometry, setStopsGeometry] = useState<unknown[]>([]);

	const availabilityQuery = useCheckInstantQuoteAvailabilityQuery();
	const { data: carsData, isLoading: carsCategoriesLoading } =
		useGetPublishedCarsQuery({ limit: 50 });
	const { data: packagesData, isLoading: hourlyPackagesLoading } =
		useGetPublishedPackagesQuery({ limit: 100 });
	const { data: hourlyCarsData, isLoading: hourlyCarsLoading } =
		useGetPublishedCarsWithHourlyPricingQuery();

	const categoryNames = useMemo(() => {
		const cars = carsData?.data ?? [];
		return Array.from(
			new Set(cars.map((c) => c.category?.name).filter(Boolean) as string[]),
		).sort((a, b) => a.localeCompare(b));
	}, [carsData]);

	const hourlyPackages = useMemo(() => {
		const list = packagesData?.data ?? [];
		return list.filter((p) => {
			const pkg = p as typeof p & {
				packageServiceType?: { rateType?: string };
			};
			return (
				pkg.packageServiceType?.rateType === "hourly" &&
				typeof pkg.hourlyRate === "number" &&
				pkg.hourlyRate > 0
			);
		});
	}, [packagesData]);

	const hourlyCarsWithPricing = hourlyCarsData ?? [];
	const hourlyUseCarPricing = hourlyCarsWithPricing.length > 0;
	const hourlyTemplatePackageId =
		hourlyPackages[0]?.id ?? SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID;

	const isDirectBooking = search.directBooking === "true" && search.carId;

	const form = useForm<InstantQuoteForm>({
		// biome-ignore lint/suspicious/noExplicitAny: RHF + Zod output/input variance
		resolver: zodResolver(instantQuoteSchema) as any,
		defaultValues: {
			originAddress: "",
			destinationAddress: "",
			stops: [],
			pickupDate: defaultPickupDate(),
			pickupTime: "09:00",
			transferType: "point_to_point",
			vehicleCategory: "all",
			hourlyPackageId: "",
			hourlyCarId: "",
		},
	});

	const formControl = form.control as never;
	// biome-ignore lint/suspicious/noExplicitAny: duplicate react-hook-form package resolutions
	const formForSpread = form as any;

	const {
		fields: stopFields,
		append: appendStop,
		remove: removeStop,
	} = useFieldArray({
		control: form.control,
		name: "stops",
	});

	const watched = form.watch([
		"originAddress",
		"destinationAddress",
		"pickupDate",
		"pickupTime",
	]);
	const pickupDateStr = form.watch("pickupDate");

	const selectedDateForPicker = useMemo(() => {
		if (!pickupDateStr?.trim()) return undefined;
		const d = parse(pickupDateStr, "yyyy-MM-dd", new Date());
		return Number.isNaN(d.getTime()) ? undefined : d;
	}, [pickupDateStr]);
	const transferType = form.watch("transferType");
	const isAvailable = availabilityQuery.data?.available;
	const destOk = transferType === "hourly" || Boolean(watched[1]?.trim());
	const hourlyPackageId = form.watch("hourlyPackageId");
	const hourlyCarId = form.watch("hourlyCarId");
	const hourlyOptionsLoading =
		transferType === "hourly" && (hourlyPackagesLoading || hourlyCarsLoading);
	const hourlyReady =
		transferType !== "hourly" ||
		(!hourlyOptionsLoading &&
			(hourlyUseCarPricing
				? Boolean(hourlyCarId?.trim())
				: hourlyPackages.length > 0
					? Boolean(hourlyPackageId?.trim())
					: false));
	const canProceed =
		Boolean(watched[0]?.trim()) &&
		destOk &&
		Boolean(watched[2]) &&
		Boolean(watched[3]) &&
		isAvailable &&
		hourlyReady;

	const handleOriginSelect = (place: {
		placeId: string;
		description: string;
		geometry?: unknown;
	}) => {
		setOriginGeometry(place.geometry);
		form.setValue("originAddress", place.description);
	};

	const handleDestinationSelect = (place: {
		placeId: string;
		description: string;
		geometry?: unknown;
	}) => {
		setDestinationGeometry(place.geometry);
		form.setValue("destinationAddress", place.description);
	};

	const handleStopSelect = (
		index: number,
		place: { placeId: string; description: string; geometry?: unknown },
	) => {
		const next = [...stopsGeometry];
		next[index] = place.geometry;
		setStopsGeometry(next);
		form.setValue(`stops.${index}.address`, place.description);
	};

	const addStop = () => {
		appendStop({ address: "" });
		setStopsGeometry([...stopsGeometry, null]);
	};

	const removeStopAt = (index: number) => {
		removeStop(index);
		const next = [...stopsGeometry];
		next.splice(index, 1);
		setStopsGeometry(next);
	};

	const appendSearchExtras = (
		params: URLSearchParams,
		v: Pick<
			InstantQuoteForm,
			"pickupDate" | "pickupTime" | "transferType" | "vehicleCategory"
		>,
	) => {
		params.set("pickupDate", v.pickupDate);
		params.set("pickupTime", v.pickupTime);
		params.set("transferType", v.transferType);
		params.set("vehicleCategory", v.vehicleCategory);
	};

	function firstCarIdForCategory(categoryName: string): string | undefined {
		const cars = carsData?.data ?? [];
		const match = cars.find((c) => c.category?.name === categoryName);
		return match?.id;
	}

	const onSubmit = (formData: InstantQuoteForm) => {
		let destAddress = formData.destinationAddress?.trim() ?? "";
		let destGeom = destinationGeometry as {
			location?: { lat: () => number; lng: () => number };
		} | null;
		if (formData.transferType === "hourly" && !destAddress) {
			destAddress = formData.originAddress;
			destGeom = originGeometry as typeof destGeom;
		}

		const params = new URLSearchParams();
		params.set("origin", formData.originAddress);
		params.set("destination", destAddress);
		const o = originGeometry as {
			location?: { lat: () => number; lng: () => number };
		} | null;
		const d = destGeom ?? (destinationGeometry as typeof o);
		if (o?.location) {
			params.set("originLat", o.location.lat().toString());
			params.set("originLng", o.location.lng().toString());
		}
		if (d?.location) {
			params.set("destinationLat", d.location.lat().toString());
			params.set("destinationLng", d.location.lng().toString());
		}
		if (formData.stops?.length) {
			params.set("stops", JSON.stringify(formData.stops));
		}
		appendSearchExtras(params, formData);

		if (isDirectBooking) {
			params.set("selectedCarId", String(search.carId));
			navigate({
				to: "/calculate-quote",
				search: Object.fromEntries(params) as never,
				resetScroll: true,
			});
			return;
		}

		// Hourly: package booking (template package) + optional car from pricing config hourly rate
		if (formData.transferType === "hourly") {
			const pkgId = hourlyUseCarPricing
				? hourlyTemplatePackageId
				: formData.hourlyPackageId.trim();
			if (!pkgId) return;
			const bookSearch: Record<string, string> = {
				origin: formData.originAddress,
				destination: destAddress,
				pickupDate: formData.pickupDate,
				pickupTime: formData.pickupTime,
				fromInstantQuote: "1",
			};
			if (hourlyUseCarPricing && formData.hourlyCarId.trim()) {
				bookSearch.carId = formData.hourlyCarId.trim();
			}
			if (o?.location) {
				bookSearch.originLat = o.location.lat().toString();
				bookSearch.originLng = o.location.lng().toString();
			}
			if (d?.location) {
				bookSearch.destinationLat = d.location.lat().toString();
				bookSearch.destinationLng = d.location.lng().toString();
			}
			if (formData.stops?.length) {
				bookSearch.stops = JSON.stringify(formData.stops);
			}
			navigate({
				to: "/book-service/$serviceId",
				params: { serviceId: pkgId },
				search: bookSearch as never,
				resetScroll: true,
			});
			return;
		}

		// Point to point + specific category: skip vehicle grid — use first fleet car in that category
		if (
			formData.transferType === "point_to_point" &&
			formData.vehicleCategory !== "all"
		) {
			const resolvedCarId = firstCarIdForCategory(formData.vehicleCategory);
			if (resolvedCarId) {
				params.set("selectedCarId", resolvedCarId);
				navigate({
					to: "/calculate-quote",
					search: Object.fromEntries(params) as never,
					resetScroll: true,
				});
				return;
			}
		}

		navigate({
			to: "/select-vehicle",
			search: Object.fromEntries(params) as never,
			resetScroll: true,
		});
	};

	const fieldShell =
		"rounded-md border border-border/80 bg-background text-xs shadow-none";

	const titleHeaderClass = "space-y-0 px-4 py-1 text-center";

	if (availabilityQuery.isLoading) {
		return (
			<Card
				className={cn(
					"mx-auto w-full max-w-md gap-0 border-border/50 bg-card/80 py-0 shadow-none backdrop-blur-sm",
					className,
				)}
			>
				<CardHeader className={titleHeaderClass}>
					<CardTitle className="font-semibold text-foreground text-sm leading-none tracking-tight">
						Instant Quote Calculator
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 px-4 pt-2.5 pb-4">
					<Skeleton className="h-24 w-full rounded-md" />
					<Skeleton className="h-20 w-full rounded-md" />
					<Skeleton className="h-16 w-full rounded-md" />
					<Skeleton className="h-8 w-full rounded-md" />
				</CardContent>
			</Card>
		);
	}

	if (availabilityQuery.data && !availabilityQuery.data.available) {
		return (
			<Card
				className={cn(
					"mx-auto w-full max-w-md gap-0 border-border/50 bg-card/80 py-0 shadow-none backdrop-blur-sm",
					className,
				)}
			>
				<CardHeader className={titleHeaderClass}>
					<CardTitle className="font-semibold text-foreground text-sm leading-none tracking-tight">
						Instant Quote Calculator
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 px-4 pt-2.5 pb-4">
					<Alert className="py-2">
						<AlertCircle className="h-3.5 w-3.5" />
						<AlertDescription className="text-xs">
							Instant quote is temporarily unavailable. Please call or email us,
							or try again later.
						</AlertDescription>
					</Alert>
					<div className="text-center">
						<Button
							variant="outline"
							size="sm"
							className="h-8"
							onClick={() => availabilityQuery.refetch()}
						>
							Try again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				"mx-auto w-full max-w-md gap-0 border-border/50 bg-card/80 py-0 shadow-none backdrop-blur-sm",
				className,
			)}
		>
			<CardHeader className={titleHeaderClass}>
				<CardTitle className="font-semibold text-foreground text-sm leading-none tracking-tight">
					Instant Quote Calculator
				</CardTitle>
			</CardHeader>
			<CardContent className="px-4 pt-2.5 pb-4">
				<Form {...formForSpread}>
					<form onSubmit={(e) => e.preventDefault()} className="space-y-3">
						{/* Locations — origin & destination (short placeholders); stops below */}
						<div
							className={cn(
								"divide-y divide-border/70 overflow-hidden",
								fieldShell,
							)}
						>
							<FormField
								control={formControl}
								name="originAddress"
								render={({ field }) => (
									<FormItem className="space-y-0">
										<div className="flex items-center gap-2 px-2.5 py-2">
											<Navigation className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
											<FormControl className="flex-1">
												<GooglePlacesInput
													compact
													disabled={!isAvailable}
													value={field.value || ""}
													onChange={field.onChange}
													onPlaceSelect={handleOriginSelect}
													placeholder="Origin"
													className="border-0 bg-transparent shadow-none focus-visible:ring-0"
												/>
											</FormControl>
										</div>
										<FormMessage className="px-2.5 pb-1 text-[11px]" />
									</FormItem>
								)}
							/>
							<FormField
								control={formControl}
								name="destinationAddress"
								render={({ field }) => (
									<FormItem className="space-y-0">
										<div className="flex items-center gap-2 px-2.5 py-2">
											<MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
											<FormControl className="flex-1">
												<GooglePlacesInput
													compact
													disabled={!isAvailable}
													value={field.value || ""}
													onChange={field.onChange}
													onPlaceSelect={handleDestinationSelect}
													placeholder="Destination"
													className="border-0 bg-transparent shadow-none focus-visible:ring-0"
												/>
											</FormControl>
										</div>
										<FormMessage className="px-2.5 pb-1 text-[11px]" />
									</FormItem>
								)}
							/>
						</div>

						{stopFields.map((field, index) => (
							<div key={field.id} className={cn("overflow-hidden", fieldShell)}>
								<FormField
									control={formControl}
									name={`stops.${index}.address`}
									render={({ field: stopField }) => (
										<FormItem className="space-y-0">
											<div className="flex items-center gap-2 px-2.5 py-2">
												<MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
												<FormControl className="flex-1">
													<GooglePlacesInput
														compact
														disabled={!isAvailable}
														value={stopField.value || ""}
														onChange={stopField.onChange}
														onPlaceSelect={(place) =>
															handleStopSelect(index, place)
														}
														placeholder={`Stop ${index + 1}`}
														className="border-0 bg-transparent shadow-none focus-visible:ring-0"
														showRemoveButton={true}
														onRemove={() => removeStopAt(index)}
													/>
												</FormControl>
											</div>
											<FormMessage className="px-2.5 pb-1 text-[11px]" />
										</FormItem>
									)}
								/>
							</div>
						))}

						{stopFields.length < 3 && (
							<button
								type="button"
								onClick={addStop}
								disabled={!isAvailable}
								className="flex items-center gap-1 font-semibold text-[10px] text-foreground uppercase tracking-wide hover:underline disabled:opacity-50"
							>
								<Plus className="h-3 w-3" />
								Add stops
							</button>
						)}

						{/* Date / time — full picker + manual entry (shared DateTimePicker) */}
						<div
							className={cn(
								"overflow-hidden p-3",
								fieldShell,
								!isAvailable && "pointer-events-none opacity-50",
							)}
						>
							<DateTimePicker
								selectedDate={selectedDateForPicker}
								selectedTime={form.watch("pickupTime") || undefined}
								onDateChange={(date) => {
									form.setValue(
										"pickupDate",
										date ? format(date, "yyyy-MM-dd") : "",
										{ shouldValidate: true },
									);
								}}
								onTimeChange={(time) => {
									form.setValue("pickupTime", time, { shouldValidate: true });
								}}
								dateError={
									form.formState.errors.pickupDate?.message as
										| string
										| undefined
								}
								timeError={
									form.formState.errors.pickupTime?.message as
										| string
										| undefined
								}
								dateLabel="Pickup date"
								timeLabel="Pickup time"
								className="gap-3 sm:grid-cols-1"
							/>
						</div>
						{(form.formState.errors.pickupDate?.message ||
							form.formState.errors.pickupTime?.message) && (
							<div className="space-y-0.5 px-0.5">
								{form.formState.errors.pickupDate?.message ? (
									<p className="text-[11px] text-destructive">
										{String(form.formState.errors.pickupDate.message)}
									</p>
								) : null}
								{form.formState.errors.pickupTime?.message ? (
									<p className="text-[11px] text-destructive">
										{String(form.formState.errors.pickupTime.message)}
									</p>
								) : null}
							</div>
						)}

						{/* Transfer type */}
						<FormField
							control={formControl}
							name="transferType"
							render={({ field }) => (
								<FormItem className="space-y-0">
									<div
										className={cn(
											"flex items-center gap-2 px-2.5 py-2",
											fieldShell,
										)}
									>
										<Navigation className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
										<div className="min-w-0 flex-1">
											<p className="font-bold text-[10px] text-foreground uppercase tracking-wide">
												Transfer type
											</p>
											<Select
												onValueChange={(v) => {
													field.onChange(v);
													if (v === "hourly") {
														form.setValue("vehicleCategory", "all");
													} else {
														form.setValue("hourlyPackageId", "");
														form.setValue("hourlyCarId", "");
													}
												}}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger className="mt-1 h-8 w-full min-w-0 border-0 bg-transparent p-0 text-left text-muted-foreground text-xs shadow-none focus:ring-0 [&>svg]:shrink-0">
														<SelectValue placeholder="Select type of transfer" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="point_to_point">
														Point to point transfer
													</SelectItem>
													<SelectItem value="hourly">Hourly</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<FormMessage className="text-[11px]" />
								</FormItem>
							)}
						/>

						{/* Point to point: vehicle category (skip selection step when not "all") */}
						{transferType === "point_to_point" && (
							<FormField
								control={formControl}
								name="vehicleCategory"
								render={({ field }) => (
									<FormItem className="space-y-0">
										<div
											className={cn(
												"flex items-center gap-2 px-2.5 py-2",
												fieldShell,
											)}
										>
											<Car className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
											<div className="min-w-0 flex-1">
												<p className="font-bold text-[10px] text-foreground uppercase tracking-wide">
													Vehicle category
												</p>
												<Select
													onValueChange={field.onChange}
													value={field.value}
													disabled={carsCategoriesLoading}
												>
													<FormControl>
														<SelectTrigger className="mt-1 h-8 w-full min-w-0 border-0 bg-transparent p-0 text-left text-muted-foreground text-xs shadow-none focus:ring-0 [&>svg]:shrink-0">
															<SelectValue placeholder="Select category of vehicle" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="all">All categories</SelectItem>
														{categoryNames.map((name) => (
															<SelectItem key={name} value={name}>
																{name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>
										<FormMessage className="text-[11px]" />
									</FormItem>
								)}
							/>
						)}

						{/* Hourly: same "Vehicle category" row as point-to-point; options = vehicles with pricing-config hourly rate */}
						{transferType === "hourly" && (
							<>
								<FormField
									control={formControl}
									name="hourlyCarId"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<div
												className={cn(
													"flex items-center gap-2 px-2.5 py-2",
													fieldShell,
												)}
											>
												<Car className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
												<div className="min-w-0 flex-1">
													<p className="font-bold text-[10px] text-foreground uppercase tracking-wide">
														Vehicle category
													</p>
													{hourlyCarsLoading ? (
														<Skeleton className="mt-1.5 h-8 w-full rounded-md" />
													) : hourlyCarsWithPricing.length > 0 ? (
														<Select
															onValueChange={field.onChange}
															value={field.value}
														>
															<FormControl>
																<SelectTrigger className="mt-1 h-8 w-full min-w-0 border-0 bg-transparent p-0 text-left text-muted-foreground text-xs shadow-none focus:ring-0 [&>svg]:shrink-0">
																	<SelectValue placeholder="Select vehicle (hourly rate)" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{hourlyCarsWithPricing.map((c) => (
																	<SelectItem key={c.id} value={c.id}>
																		{`${c.name} — $${c.hourlyRate.toFixed(2)}/hr`}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													) : (
														<p className="mt-1.5 text-[11px] text-muted-foreground leading-snug">
															No vehicles with hourly pricing yet. Add an hourly
															rate in Pricing config for a published vehicle, or
															use Hourly package below if available.
														</p>
													)}
												</div>
											</div>
											<FormMessage className="text-[11px]" />
										</FormItem>
									)}
								/>
								{!hourlyUseCarPricing && hourlyPackages.length > 0 ? (
									<FormField
										control={formControl}
										name="hourlyPackageId"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<div
													className={cn(
														"flex items-center gap-2 px-2.5 py-2",
														fieldShell,
													)}
												>
													<Car className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
													<div className="min-w-0 flex-1">
														<p className="font-bold text-[10px] text-foreground uppercase tracking-wide">
															Hourly package
														</p>
														<Select
															onValueChange={field.onChange}
															value={field.value}
															disabled={
																hourlyPackagesLoading ||
																hourlyPackages.length === 0
															}
														>
															<FormControl>
																<SelectTrigger className="mt-1 h-8 w-full min-w-0 border-0 bg-transparent p-0 text-left text-muted-foreground text-xs shadow-none focus:ring-0 [&>svg]:shrink-0">
																	<SelectValue placeholder="Select package" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{hourlyPackages.map((pkg) => (
																	<SelectItem key={pkg.id} value={pkg.id}>
																		{`${pkg.name} — $${(pkg.hourlyRate ?? 0).toFixed(2)}/hr`}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
												<FormMessage className="text-[11px]" />
											</FormItem>
										)}
									/>
								) : null}
								{!hourlyCarsLoading &&
								!hourlyPackagesLoading &&
								hourlyCarsWithPricing.length === 0 &&
								hourlyPackages.length === 0 ? (
									<p className="px-0.5 text-[11px] text-muted-foreground leading-snug">
										No hourly vehicles or packages are available. Try point to
										point or contact us.
									</p>
								) : null}
							</>
						)}

						<Button
							type="button"
							onClick={() => void form.handleSubmit(onSubmit as never)()}
							disabled={!canProceed}
							size="sm"
							className="h-8 w-full rounded-md font-medium text-xs"
						>
							Continue
							<ArrowRight className="ml-1.5 h-3.5 w-3.5 opacity-80" />
						</Button>

						{!isAvailable ? (
							<p className="text-center text-[11px] text-destructive">
								Service temporarily unavailable.
							</p>
						) : (
							<p className="text-center text-[11px] text-muted-foreground leading-snug">
								Standard transfers; extras may apply.
							</p>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
