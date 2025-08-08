import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { PricingConfigForm } from "@/features/dashboard/_pages/pricing-config/_components/pricing-config-form";
import { PricingConfigTable } from "@/features/dashboard/_pages/pricing-config/_components/pricing-config-table";
import { QuoteTester } from "@/features/dashboard/_pages/pricing-config/_components/quote-tester";
import { Settings, Plus, Calculator } from "lucide-react";
import { useState } from "react";
import { useGetPricingConfigsQuery } from "@/features/dashboard/_pages/pricing-config/_hooks/query/use-get-pricing-configs-query";

export const Route = createFileRoute('/dashboard/_layout/pricing-config/')({
	component: RouteComponent,
});

function RouteComponent() {
	const [showCreateConfig, setShowCreateConfig] = useState(false);
	const pricingConfigsQuery = useGetPricingConfigsQuery();

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Pricing Configuration</h2>
				<Dialog open={showCreateConfig} onOpenChange={setShowCreateConfig}>
					<DialogTrigger asChild>
						<Button className="flex items-center gap-2">
							<Plus className="h-4 w-4" />
							New Configuration
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create Pricing Configuration</DialogTitle>
							<DialogDescription>
								Set up a new pricing model for custom bookings. Configure base rates, multipliers, and additional charges.
							</DialogDescription>
						</DialogHeader>
						<PricingConfigForm onSuccess={() => setShowCreateConfig(false)} />
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{pricingConfigsQuery.data?.totalItems || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Pricing models available
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Configs</CardTitle>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{pricingConfigsQuery.data?.items?.filter((config: any) => config.isActive).length || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Currently in use
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Base Fare</CardTitle>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${(
								(pricingConfigsQuery.data?.items?.reduce((sum: number, config: any) => sum + (config.baseFare || 0), 0) || 0) /
								(pricingConfigsQuery.data?.items?.length || 1)
							).toFixed(0)}
						</div>
						<p className="text-xs text-muted-foreground">
							Across all configurations
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Per KM</CardTitle>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${(
								(pricingConfigsQuery.data?.items?.reduce((sum: number, config: any) => sum + (config.pricePerKm || 0), 0) || 0) /
								(pricingConfigsQuery.data?.items?.length || 1)
							).toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							Per kilometer rate
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="configurations" className="space-y-4">
				<TabsList>
					<TabsTrigger value="configurations">Configurations</TabsTrigger>
					<TabsTrigger value="quote-tester">Quote Tester</TabsTrigger>
				</TabsList>

				<TabsContent value="configurations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Pricing Configurations</CardTitle>
							<CardDescription>
								Manage your pricing models for custom bookings. Configure rates, multipliers, and additional charges.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PricingConfigTable />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="quote-tester" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Quote Tester
							</CardTitle>
							<CardDescription>
								Test your pricing configurations with different scenarios to see calculated quotes.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<QuoteTester />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}