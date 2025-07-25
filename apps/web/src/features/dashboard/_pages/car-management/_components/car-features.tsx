import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brands } from "./car-features/brands"
import { Models } from "./car-features/models"
import { FuelTypes } from "./car-features/fuel-types"
import { TransmissionTypes } from "./car-features/transmission-types"
import { DriveTypes } from "./car-features/drive-types"
import { Conditions } from "./car-features/conditions"
import { Features } from "./car-features/features"
import { BodyTypes } from "./car-features/body-types"

export function CarFeatures() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-bold tracking-tight">Car Features Management</h2>
				<p className="text-sm text-muted-foreground">
					Manage all car features and specifications that can be used when adding new cars.
				</p>
			</div>

			<Tabs defaultValue="brands" className="space-y-4">
				<TabsList className="grid w-full grid-cols-7">
					<TabsTrigger value="brands">Brands</TabsTrigger>
					<TabsTrigger value="models">Models</TabsTrigger>
					<TabsTrigger value="fuel">Fuel Types</TabsTrigger>
					<TabsTrigger value="body">Body Types</TabsTrigger>
					<TabsTrigger value="transmission">Transmission</TabsTrigger>
					<TabsTrigger value="drive">Drive Types</TabsTrigger>
					<TabsTrigger value="conditions">Conditions</TabsTrigger>
				</TabsList>

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
					<Conditions />
				</TabsContent>
			</Tabs>
		</div>
	)
}

