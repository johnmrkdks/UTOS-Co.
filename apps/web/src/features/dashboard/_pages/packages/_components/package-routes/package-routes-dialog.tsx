import React, { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { 
	DragDropContext, 
	Droppable, 
	Draggable, 
	type DropResult 
} from "@hello-pangea/dnd";
import { 
	GripVertical, 
	MapPin, 
	Plus, 
	Trash2, 
	Clock, 
	Car,
	ArrowDown,
	Route as RouteIcon,
	Save,
	Loader2
} from "lucide-react";
import { useGetPackageRoutesQuery } from "../../_hooks/query/use-get-package-routes-query";
import { useCreatePackageRouteMutation } from "../../_hooks/query/use-create-package-route-mutation";
import { useReorderPackageRoutesMutation } from "../../_hooks/query/use-reorder-package-routes-mutation";
import { useDeletePackageRouteMutation } from "../../_hooks/query/use-delete-package-route-mutation";

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

interface PackageRoutesDialogProps {
	packageId: string;
	packageName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PackageRoutesDialog({ 
	packageId, 
	packageName, 
	open, 
	onOpenChange 
}: PackageRoutesDialogProps) {
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
	const reorderMutation = useReorderPackageRoutesMutation();
	const deleteRouteMutation = useDeletePackageRouteMutation(packageId);

	// Initialize routes from query data
	useEffect(() => {
		if (routesQuery.data) {
			setRoutes(routesQuery.data.sort((a, b) => a.stopOrder - b.stopOrder));
		}
	}, [routesQuery.data]);

	const handleDragEnd = async (result: DropResult) => {
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

		try {
			await reorderMutation.mutateAsync({
				packageId,
				routeOrders: updatedRoutes.map((r, i) => ({ id: r.id, stopOrder: i + 1 })),
			});
		} catch {
			// Revert on error
			setRoutes(routesQuery.data?.sort((a, b) => a.stopOrder - b.stopOrder) ?? []);
		}
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

	const handleDeleteRoute = async (routeId: string) => {
		if (!confirm("Are you sure you want to delete this route stop?")) return;
		try {
			await deleteRouteMutation.mutateAsync({ id: routeId });
			setRoutes((prev) => prev.filter((route) => route.id !== routeId));
		} catch {
			// Error handled by mutation
		}
	};

	const totalDuration = routes.reduce((sum, route) => sum + (route.estimatedDuration || 0), 0);
	const pickupPoints = routes.filter(route => route.isPickupPoint);
	const dropoffPoints = routes.filter(route => route.isDropoffPoint);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<RouteIcon className="h-5 w-5" />
						Manage Routes for "{packageName}"
					</DialogTitle>
					<DialogDescription>
						Configure route stops and service points for this package. Customers will follow this route during their service.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Route Summary */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Total Stops</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{routes.length}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Total Duration</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Service Points</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm space-y-1">
									<div>Pickup: {pickupPoints.length}</div>
									<div>Drop-off: {dropoffPoints.length}</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Add New Route Form */}
					{showAddRoute && (
						<Card className="border-dashed">
							<CardHeader>
								<CardTitle className="text-lg">Add New Route Stop</CardTitle>
								<CardDescription>
									Add a new stop to the package route. You can reorder stops after adding them.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="locationName">Location Name</Label>
										<Input
											id="locationName"
											placeholder="Sydney Opera House"
											value={newRoute.locationName}
											onChange={(e) => setNewRoute(prev => ({ ...prev, locationName: e.target.value }))}
										/>
									</div>
									<div>
										<Label htmlFor="duration">Duration (minutes)</Label>
										<Input
											id="duration"
											type="number"
											min="0"
											value={newRoute.estimatedDuration}
											onChange={(e) => setNewRoute(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
										/>
									</div>
								</div>
								
								<div>
									<Label htmlFor="address">Full Address</Label>
									<Textarea
										id="address"
										placeholder="2 Macquarie Street, Sydney NSW 2000"
										value={newRoute.address}
										onChange={(e) => setNewRoute(prev => ({ ...prev, address: e.target.value }))}
										rows={2}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<Label htmlFor="pickup">Pickup Point</Label>
											<p className="text-xs text-muted-foreground">Customers can be picked up here</p>
										</div>
										<Switch
											id="pickup"
											checked={newRoute.isPickupPoint}
											onCheckedChange={(checked) => setNewRoute(prev => ({ ...prev, isPickupPoint: checked }))}
										/>
									</div>
									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<Label htmlFor="dropoff">Drop-off Point</Label>
											<p className="text-xs text-muted-foreground">Customers can be dropped off here</p>
										</div>
										<Switch
											id="dropoff"
											checked={newRoute.isDropoffPoint}
											onCheckedChange={(checked) => setNewRoute(prev => ({ ...prev, isDropoffPoint: checked }))}
										/>
									</div>
								</div>

								<div className="flex justify-end gap-2 pt-4">
									<Button variant="secondary" onClick={() => setShowAddRoute(false)}>
										Cancel
									</Button>
									<Button 
										onClick={handleAddRoute} 
										disabled={!newRoute.locationName || !newRoute.address || createRouteMutation.isPending}
									>
										{createRouteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										Add Stop
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Route List */}
					{routes.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center">
								<RouteIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No route stops configured</h3>
								<p className="text-muted-foreground mb-4">
									Start by adding stops to create a comprehensive route for this package
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
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Route Stops</CardTitle>
										<CardDescription>
											Drag and drop to reorder stops. The order determines the service sequence.
										</CardDescription>
									</div>
									<Button onClick={() => setShowAddRoute(true)} size="sm">
										<Plus className="mr-2 h-4 w-4" />
										Add Stop
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<DragDropContext onDragEnd={handleDragEnd}>
									<Droppable droppableId="routes">
										{(provided) => (
											<div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
												{routes.map((route, index) => (
													<Draggable key={route.id} draggableId={route.id} index={index}>
														{(provided, snapshot) => (
															<div
																ref={provided.innerRef}
																{...provided.draggableProps}
																className={`bg-white border rounded-lg p-4 transition-shadow ${
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
																	
																	<div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
																		{index + 1}
																	</div>

																	<div className="flex-1 min-w-0">
																		<div className="flex items-center gap-2 mb-1">
																			<h4 className="font-medium truncate">{route.locationName}</h4>
																			<div className="flex gap-1">
																				{route.isPickupPoint && (
																					<Badge variant="secondary" className="text-xs">
																						<Car className="mr-1 h-3 w-3" />
																						Pickup
																					</Badge>
																				)}
																				{route.isDropoffPoint && (
																					<Badge variant="secondary" className="text-xs">
																						<ArrowDown className="mr-1 h-3 w-3" />
																						Drop-off
																					</Badge>
																				)}
																			</div>
																		</div>
																		<p className="text-sm text-muted-foreground truncate mb-1">
																			<MapPin className="inline h-3 w-3 mr-1" />
																			{route.address}
																		</p>
																		{route.estimatedDuration && (
																			<p className="text-xs text-muted-foreground">
																				<Clock className="inline h-3 w-3 mr-1" />
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

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
						<Button onClick={() => onOpenChange(false)}>
							<Save className="mr-2 h-4 w-4" />
							Save Changes
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}