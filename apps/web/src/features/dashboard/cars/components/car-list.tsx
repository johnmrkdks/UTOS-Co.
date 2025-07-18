import { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	mockCars,
	mockBrands,
	mockModels,
	mockFuelTypes,
	mockBodyTypes,
	mockTransmissionTypes,
	mockDriveTypes,
	mockConditions,
} from "../data/mock-data";
import type { Car } from "server/types";

export default function CarsList() {
	const [cars, setCars] = useState<Car[]>(mockCars);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedBrand, setSelectedBrand] = useState<string>("all");
	const [selectedFuelType, setSelectedFuelType] = useState<string>("all");
	const [selectedBodyType, setSelectedBodyType] = useState<string>("all");
	const [viewingCar, setViewingCar] = useState<Car | null>(null);

	const getFeatureName = (
		id: string,
		type:
			| "brand"
			| "model"
			| "fuel"
			| "body"
			| "transmission"
			| "drive"
			| "condition",
	) => {
		switch (type) {
			case "brand":
				return mockBrands.find((b) => b.id === id)?.name || "Unknown";
			case "model":
				return mockModels.find((m) => m.id === id)?.name || "Unknown";
			case "fuel":
				return mockFuelTypes.find((f) => f.id === id)?.name || "Unknown";
			case "body":
				return mockBodyTypes.find((b) => b.id === id)?.name || "Unknown";
			case "transmission":
				return (
					mockTransmissionTypes.find((t) => t.id === id)?.name || "Unknown"
				);
			case "drive":
				return mockDriveTypes.find((d) => d.id === id)?.name || "Unknown";
			case "condition":
				return mockConditions.find((c) => c.id === id)?.name || "Unknown";
			default:
				return "Unknown";
		}
	};

	const filteredCars = cars.filter((car) => {
		const matchesSearch =
			car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			getFeatureName(car.brandId, "brand")
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			getFeatureName(car.modelId, "model")
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesBrand =
			selectedBrand === "all" || car.brandId === selectedBrand;
		const matchesFuelType =
			selectedFuelType === "all" || car.fuelTypeId === selectedFuelType;
		const matchesBodyType =
			selectedBodyType === "all" || car.bodyTypeId === selectedBodyType;

		return matchesSearch && matchesBrand && matchesFuelType && matchesBodyType;
	});

	const handleDeleteCar = (id: string) => {
		setCars(cars.filter((c) => c.id !== id));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Cars Inventory</h2>
					<p className="text-muted-foreground">
						Manage your car inventory and listings
					</p>
				</div>
				<Button>
					<Plus className="w-4 h-4 mr-2" />
					Add New Car
				</Button>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder="Search cars..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Select value={selectedBrand} onValueChange={setSelectedBrand}>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="All Brands" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Brands</SelectItem>
							{mockBrands.map((brand) => (
								<SelectItem key={brand.id} value={brand.id}>
									{brand.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="All Fuel Types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Fuel Types</SelectItem>
							{mockFuelTypes.map((fuel) => (
								<SelectItem key={fuel.id} value={fuel.id}>
									{fuel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="All Body Types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Body Types</SelectItem>
							{mockBodyTypes.map((body) => (
								<SelectItem key={body.id} value={body.id}>
									{body.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Cars Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredCars.map((car) => (
					<Card key={car.id} className="overflow-hidden">
						<div className="aspect-video relative">
							<Image
								src={car.imageUrl || "/placeholder.svg"}
								alt={car.name}
								fill
								className="object-cover"
							/>
						</div>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-lg">{car.name}</CardTitle>
									<CardDescription>
										{getFeatureName(car.brandId, "brand")} •{" "}
										{getFeatureName(car.modelId, "model")} • {car.year}
									</CardDescription>
								</div>
								<Badge variant="secondary">
									{getFeatureName(car.conditionId, "condition")}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Price:</span>
									<span className="font-semibold">
										${car.price.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Mileage:</span>
									<span>{car.mileage.toLocaleString()} miles</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Fuel:</span>
									<span>{getFeatureName(car.fuelTypeId, "fuel")}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Body:</span>
									<span>{getFeatureName(car.bodyTypeId, "body")}</span>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<div className="flex gap-2 w-full">
								<Dialog
									open={viewingCar?.id === car.id}
									onOpenChange={(open) => {
										if (!open) setViewingCar(null);
									}}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="flex-1 bg-transparent"
											onClick={() => setViewingCar(car)}
										>
											<Eye className="w-4 h-4 mr-2" />
											View
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-2xl">
										<DialogHeader>
											<DialogTitle>{car.name}</DialogTitle>
											<DialogDescription>
												Complete car details and specifications
											</DialogDescription>
										</DialogHeader>
										{viewingCar && (
											<div className="space-y-4">
												<div className="aspect-video relative rounded-lg overflow-hidden">
													<Image
														src={viewingCar.imageUrl || "/placeholder.svg"}
														alt={viewingCar.name}
														fill
														className="object-cover"
													/>
												</div>
												<div className="grid grid-cols-2 gap-4">
													<div>
														<h4 className="font-semibold mb-2">
															Basic Information
														</h4>
														<div className="space-y-2 text-sm">
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Brand:
																</span>
																<span>
																	{getFeatureName(viewingCar.brandId, "brand")}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Model:
																</span>
																<span>
																	{getFeatureName(viewingCar.modelId, "model")}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Year:
																</span>
																<span>{viewingCar.year}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Condition:
																</span>
																<span>
																	{getFeatureName(
																		viewingCar.conditionId,
																		"condition",
																	)}
																</span>
															</div>
														</div>
													</div>
													<div>
														<h4 className="font-semibold mb-2">
															Specifications
														</h4>
														<div className="space-y-2 text-sm">
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Fuel Type:
																</span>
																<span>
																	{getFeatureName(
																		viewingCar.fuelTypeId,
																		"fuel",
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Body Type:
																</span>
																<span>
																	{getFeatureName(
																		viewingCar.bodyTypeId,
																		"body",
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Transmission:
																</span>
																<span>
																	{getFeatureName(
																		viewingCar.transmissionTypeId,
																		"transmission",
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">
																	Drive Type:
																</span>
																<span>
																	{getFeatureName(
																		viewingCar.driveTypeId,
																		"drive",
																	)}
																</span>
															</div>
														</div>
													</div>
												</div>
												<div>
													<h4 className="font-semibold mb-2">
														Pricing & Mileage
													</h4>
													<div className="grid grid-cols-2 gap-4 text-sm">
														<div className="flex justify-between">
															<span className="text-muted-foreground">
																Price:
															</span>
															<span className="font-semibold text-lg">
																${viewingCar.price.toLocaleString()}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-muted-foreground">
																Mileage:
															</span>
															<span>
																{viewingCar.mileage.toLocaleString()} miles
															</span>
														</div>
													</div>
												</div>
												<div>
													<h4 className="font-semibold mb-2">Description</h4>
													<p className="text-sm text-muted-foreground">
														{viewingCar.description}
													</p>
												</div>
											</div>
										)}
									</DialogContent>
								</Dialog>
								<Button variant="outline" size="sm">
									<Pencil className="w-4 h-4 mr-2" />
									Edit
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleDeleteCar(car.id)}
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete
								</Button>
							</div>
						</CardFooter>
					</Card>
				))}
			</div>

			{filteredCars.length === 0 && (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						No cars found matching your criteria.
					</p>
				</div>
			)}
		</div>
	);
}
