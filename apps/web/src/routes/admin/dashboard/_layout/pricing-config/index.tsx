import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
// Removed Dialog imports - now using UnifiedPricingConfigDialog
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { PricingConfigForm } from "@/features/dashboard/_pages/pricing-config/_components/pricing-config-form";
import { UnifiedPricingConfigDialog } from "@/features/dashboard/_pages/pricing-config/_components/unified-pricing-config-dialog";
import { PricingConfigTable } from "@/features/dashboard/_pages/pricing-config/_components/pricing-config-table";
import { QuoteTester } from "@/features/dashboard/_pages/pricing-config/_components/quote-tester";
import { Settings, Plus, Calculator, DollarSign } from "lucide-react";
import { useState } from "react";
import { useGetPricingConfigsQuery } from "@/features/dashboard/_pages/pricing-config/_hooks/query/use-get-pricing-configs-query";
import { PaddingLayout } from '@/features/dashboard/_layouts/padding-layout';

export const Route = createFileRoute('/admin/dashboard/_layout/pricing-config/')({
	component: RouteComponent,
});

function RouteComponent() {
	const [showCreateConfig, setShowCreateConfig] = useState(false);
	const pricingConfigsQuery = useGetPricingConfigsQuery({ limit: 50 });

	const configs = (pricingConfigsQuery.data as any)?.data || [];
	const totalConfigs = configs.length;
	const activeConfigs = configs.filter((config: any) => config.isActive).length;
	const avgBaseFare = configs.length ? (configs.reduce((sum: number, config: any) => sum + (config.baseFare || 0), 0) / configs.length / 100) : 0;
	const avgPerKm = configs.length ? (configs.reduce((sum: number, config: any) => sum + (config.pricePerKm || 0), 0) / configs.length / 100) : 0;

	// Analytics card data for pricing config
	const pricingStatsData: AnalyticsCardData[] = [
		{
			id: 'total-configs',
			title: 'Total Configurations',
			value: totalConfigs,
			icon: Settings,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
			changeText: 'Pricing models available',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'active-configs',
			title: 'Active Configs',
			value: activeConfigs,
			icon: Settings,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
			changeText: 'Currently in use',
			changeType: 'positive',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'avg-base-fare',
			title: 'Average Base Fare',
			value: `$${avgBaseFare.toFixed(0)}`,
			icon: DollarSign,
			bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
			iconBg: 'bg-purple-500',
			changeText: 'Across all configurations',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'avg-per-km',
			title: 'Average Per KM',
			value: `$${avgPerKm.toFixed(2)}`,
			icon: Calculator,
			bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
			iconBg: 'bg-orange-500',
			changeText: 'Per kilometer rate',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		}
	]

	return (
		<PaddingLayout className="flex-1 space-y-4">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Pricing Configuration</h2>
				<Button 
					className="flex items-center gap-2"
					onClick={() => setShowCreateConfig(true)}
				>
					<Plus className="h-4 w-4" />
					New Configuration
				</Button>

				{/* Unified pricing config dialog */}
				<UnifiedPricingConfigDialog
					open={showCreateConfig}
					onOpenChange={setShowCreateConfig}
					mode='create'
					title="Create Pricing Configuration"
					description="Set up a new pricing model for custom bookings. Configure base rates, multipliers, and additional charges."
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{pricingStatsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view='compact'
					/>
				))}
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
		</PaddingLayout>
	)
}
