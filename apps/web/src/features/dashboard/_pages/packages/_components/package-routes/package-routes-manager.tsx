import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	ArrowDown,
	Car,
	Clock,
	GripVertical,
	MapPin,
	Plus,
	Route as RouteIcon,
	Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { useCreatePackageRouteMutation } from "../../_hooks/query/use-create-package-route-mutation";
import { useGetPackageRoutesQuery } from "../../_hooks/query/use-get-package-routes-query";

interface PackageRoute {
	id: string;
	packageId: string;
	stopOrder: number;
	locationName: string;
	address: string;
	latitude?: number;
	longitude?: number;
	estimatedDuration?: number;
	isPickupPoint: boolean;
	isDropoffPoint: boolean;
}

interface NewRoute {
	locationName: string;
	address: string;
	estimatedDuration: number;
	isPickupPoint: boolean;
	isDropoffPoint: boolean;
}

interface PackageRoutesManagerProps {
	packageId: string;
	packageName: string;
}

export function PackageRoutesManager({
	packageId,
	packageName,
}: PackageRoutesManagerProps) {
	const [routes, setRoutes] = useState<PackageRoute[]>([]);
	const [showAddRoute, setShowAddRoute] = useState(false);
	const [newRoute, setNewRoute] = useState<NewRoute>({
		locationName: "",
		address: "",
		estimatedDuration: 30,
		isPickupPoint: false,
		isDropoffPoint: false,
	});

	const routesQuery = useGetPackageRoutesQuery({ packageId });
	const createRouteMutation = useCreatePackageRouteMutation();

	// Initialize routes from query data
	React.useEffect(() => {
		if (routesQuery.data) {
			setRoutes(routesQuery.data.sort((a, b) => a.stopOrder - b.stopOrder));
		}
	}, [routesQuery.data]);

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const items = Array.from(routes);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		// Update stop orders
		const updatedRoutes = items.map((item, index) => ({
			...item,
			stopOrder: index + 1,
		}));

		setRoutes(updatedRoutes);
		// TODO: Implement updateRouteOrder mutation to persist changes
	};

	const handleAddRoute = async () => {
		try {
			const routeData = {
				packageId,
				stopOrder: routes.length + 1,
				...newRoute,
			};

			await createRouteMutation.mutateAsync(routeData);

			setNewRoute({
				locationName: "",
				address: "",
				estimatedDuration: 30,
				isPickupPoint: false,
				isDropoffPoint: false,
			});
			setShowAddRoute(false);
		} catch (error) {
			console.error("Failed to add route:", error);
		}
	};

	const handleDeleteRoute = (routeId: string) => {
		if (confirm("Are you sure you want to delete this route stop?")) {
			setRoutes((prev) => prev.filter((route) => route.id !== routeId));
			// TODO: Implement deleteRoute mutation
		}
	};

	const totalDuration = routes.reduce(
		(sum, route) => sum + (route.estimatedDuration || 0),
		0,
	);
	const pickupPoints = routes.filter((route) => route.isPickupPoint);
	const dropoffPoints = routes.filter((route) => route.isDropoffPoint);

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-primary/20 p-2">
								<RouteIcon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-xl">Route Planning</CardTitle>
								<CardDescription className="text-base">
									Configure stops and route for{" "}
									<span className="font-medium text-foreground">
										"{packageName}"
									</span>
								</CardDescription>
							</div>
						</div>
						<Dialog open={showAddRoute} onOpenChange={setShowAddRoute}>
							<DialogTrigger asChild>
								<Button className="flex items-center gap-2" size="lg">
									<Plus className="h-4 w-4" />
									Add Stop
								</Button>
							</DialogTrigger>
							<DialogContent
								className="sm:max-w-[500px]"
								showCloseButton={false}
							>
								<DialogHeader>
									<DialogTitle>Add Route Stop</DialogTitle>
									<DialogDescription>
										Add a new stop to the package route. You can reorder stops
										after adding them.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="locationName">Location Name</Label>
											<Input
												id="locationName"
												placeholder="Sydney Opera House"
												value={newRoute.locationName}
												onChange={(e) =>
													setNewRoute((prev) => ({
														...prev,
														locationName: e.target.value,
													}))
												}
											/>
										</div>
										<div>
											<Label htmlFor="duration">Duration (minutes)</Label>
											<Input
												id="duration"
												type="number"
												min="0"
												value={newRoute.estimatedDuration}
												onChange={(e) =>
													setNewRoute((prev) => ({
														...prev,
														estimatedDuration:
															Number.parseInt(e.target.value) || 0,
													}))
												}
											/>
										</div>
									</div>

									<div>
										<Label htmlFor="address">Full Address</Label>
										<Textarea
											id="address"
											placeholder="2 Macquarie Street, Sydney NSW 2000"
											value={newRoute.address}
											onChange={(e) =>
												setNewRoute((prev) => ({
													...prev,
													address: e.target.value,
												}))
											}
											rows={2}
										/>
									</div>

									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<div>
												<Label htmlFor="pickup">Pickup Point</Label>
												<p className="text-muted-foreground text-xs">
													Customers can be picked up here
												</p>
											</div>
											<Switch
												id="pickup"
												checked={newRoute.isPickupPoint}
												onCheckedChange={(checked) =>
													setNewRoute((prev) => ({
														...prev,
														isPickupPoint: checked,
													}))
												}
											/>
										</div>
										<div className="flex items-center justify-between">
											<div>
												<Label htmlFor="dropoff">Drop-off Point</Label>
												<p className="text-muted-foreground text-xs">
													Customers can be dropped off here
												</p>
											</div>
											<Switch
												id="dropoff"
												checked={newRoute.isDropoffPoint}
												onCheckedChange={(checked) =>
													setNewRoute((prev) => ({
														...prev,
														isDropoffPoint: checked,
													}))
												}
											/>
										</div>
									</div>

									<div className="flex justify-end gap-2 pt-4">
										<Button
											variant="secondary"
											onClick={() => setShowAddRoute(false)}
										>
											Cancel
										</Button>
										<Button
											onClick={handleAddRoute}
											disabled={!newRoute.locationName || !newRoute.address}
										>
											Add Stop
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
			</Card>

			{/* Route Summary */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Total Stops</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{routes.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Total Duration</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{Math.floor(totalDuration / 60)}h {totalDuration % 60}m
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Service Points</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-1 text-sm">
							<div>Pickup: {pickupPoints.length}</div>
							<div>Drop-off: {dropoffPoints.length}</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Route List */}
			{routes.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<RouteIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							No route stops configured
						</h3>
						<p className="mb-4 text-muted-foreground">
							Start by adding stops to create a comprehensive route for this
							package
						</p>
						<Button onClick={() => setShowAddRoute(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add First Stop
						</Button>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Route Stops</CardTitle>
						<CardDescription>
							Drag and drop to reorder stops. The order determines the service
							sequence.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="routes">
								{(provided) => (
									<div
										{...provided.droppableProps}
										ref={provided.innerRef}
										className="space-y-2"
									>
										{routes.map((route, index) => (
											<Draggable
												key={route.id}
												draggableId={route.id}
												index={index}
											>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														className={`rounded-lg border bg-white p-4 transition-shadow ${
															snapshot.isDragging ? "shadow-lg" : "shadow-sm"
														}`}
													>
														<div className="flex items-center gap-4">
															<div
																{...provided.dragHandleProps}
																className="flex-shrink-0 cursor-grab active:cursor-grabbing"
															>
																<GripVertical className="h-5 w-5 text-muted-foreground" />
															</div>

															<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
																{index + 1}
															</div>

															<div className="min-w-0 flex-1">
																<div className="mb-1 flex items-center gap-2">
																	<h4 className="truncate font-medium">
																		{route.locationName}
																	</h4>
																	<div className="flex gap-1">
																		{route.isPickupPoint && (
																			<Badge
																				variant="secondary"
																				className="text-xs"
																			>
																				<Car className="mr-1 h-3 w-3" />
																				Pickup
																			</Badge>
																		)}
																		{route.isDropoffPoint && (
																			<Badge
																				variant="secondary"
																				className="text-xs"
																			>
																				<ArrowDown className="mr-1 h-3 w-3" />
																				Drop-off
																			</Badge>
																		)}
																	</div>
																</div>
																<p className="mb-1 truncate text-muted-foreground text-sm">
																	<MapPin className="mr-1 inline h-3 w-3" />
																	{route.address}
																</p>
																{route.estimatedDuration && (
																	<p className="text-muted-foreground text-xs">
																		<Clock className="mr-1 inline h-3 w-3" />
																		{route.estimatedDuration} minutes
																	</p>
																)}
															</div>

															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDeleteRoute(route.id)}
																className="text-destructive hover:text-destructive"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
