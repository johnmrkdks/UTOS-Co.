import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brands } from "./car-features/brands"
import { Models } from "./car-features/models"
import { FuelTypes } from "./car-features/fuel-types"
import { TransmissionTypes } from "./car-features/transmission-types"
import { DriveTypes } from "./car-features/drive-types"
import { ConditionTypes } from "./car-features/conditions"
import { Features } from "./car-features/features"
import { BodyTypes } from "./car-features/body-types"

export function CarFeatures() {
	return (
		<Tabs defaultValue="brands" className="flex flex-col gap-4">
			<div className="border rounded-xl p-4 flex flex-col gap-4">
				<div>

					<h2 className="text-lg font-bold tracking-tight">Car Features Management</h2>
					<p className="text-sm text-muted-foreground">
						Manage all car features and specifications that can be used when adding new cars.
					</p>
				</div>

				<TabsList className="grid grid-cols-7">
					<TabsTrigger value="brands">Brands</TabsTrigger>
					<TabsTrigger value="models">Models</TabsTrigger>
					<TabsTrigger value="fuel">Fuel Types</TabsTrigger>
					<TabsTrigger value="body">Body Types</TabsTrigger>
					<TabsTrigger value="transmission">Transmissions</TabsTrigger>
					<TabsTrigger value="drive">Drive Types</TabsTrigger>
					<TabsTrigger value="conditions">Conditions</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value="brands">
				<Brands />
			</TabsContent>

			<TabsContent value="models">
				<Models />
			</TabsContent>

			<TabsContent value="fuel">
				<FuelTypes />
			</TabsContent>

			<TabsContent value="body">
				<BodyTypes />
			</TabsContent>

			<TabsContent value="transmission">
				<TransmissionTypes />
			</TabsContent>

			<TabsContent value="drive">
				<DriveTypes />
			</TabsContent>

			<TabsContent value="feature">
				<Features />
			</TabsContent>

			<TabsContent value="conditions">
				<ConditionTypes />
			</TabsContent>
		</Tabs>
	)
}

