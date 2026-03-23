import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { BodyTypes } from "./car-features/body-types";
import { Brands } from "./car-features/brands";
import { Categories } from "./car-features/categories";
import { ConditionTypes } from "./car-features/conditions";
import { DriveTypes } from "./car-features/drive-types";
import { Features } from "./car-features/features";
import { FuelTypes } from "./car-features/fuel-types";
import { Models } from "./car-features/models";
import { TransmissionTypes } from "./car-features/transmission-types";

export function CarFeatures() {
	return (
		<PaddingLayout>
			<Tabs defaultValue="brands" className="flex flex-col gap-4">
				<div className="flex flex-col gap-4 rounded-xl border p-4">
					<div>
						<h2 className="font-bold text-lg tracking-tight">
							Car Features Management
						</h2>
						<p className="text-muted-foreground text-sm">
							Manage all car features and specifications that can be used when
							adding new cars.
						</p>
					</div>

					<TabsList className="grid grid-cols-9">
						<TabsTrigger value="brands">Brands</TabsTrigger>
						<TabsTrigger value="models">Models</TabsTrigger>
						<TabsTrigger value="categories">Categories</TabsTrigger>
						<TabsTrigger value="fuel">Fuel Types</TabsTrigger>
						<TabsTrigger value="body">Body Types</TabsTrigger>
						<TabsTrigger value="transmission">Transmissions</TabsTrigger>
						<TabsTrigger value="drive">Drive Types</TabsTrigger>
						<TabsTrigger value="conditions">Conditions</TabsTrigger>
						<TabsTrigger value="features">Features</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="brands">
					<Brands />
				</TabsContent>

				<TabsContent value="models">
					<Models />
				</TabsContent>

				<TabsContent value="categories">
					<Categories />
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

				<TabsContent value="conditions">
					<ConditionTypes />
				</TabsContent>

				<TabsContent value="features">
					<Features />
				</TabsContent>
			</Tabs>
		</PaddingLayout>
	);
}
