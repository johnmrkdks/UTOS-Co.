import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { DriverInvoiceForm } from "./_components/driver-invoice-form";
import { CompanyInvoiceForm } from "./_components/company-invoice-form";
import { InvoiceSentLogs } from "./_components/invoice-sent-logs";
import { TruckIcon, Building2Icon, HistoryIcon } from "lucide-react";

export function InvoicesPage() {
	return (
		<Tabs defaultValue="driver" className="space-y-4">
			<TabsList className="grid w-full max-w-lg grid-cols-3 print:hidden">
				<TabsTrigger value="driver" className="flex items-center gap-2">
					<TruckIcon className="h-4 w-4" />
					Driver
				</TabsTrigger>
				<TabsTrigger value="company" className="flex items-center gap-2">
					<Building2Icon className="h-4 w-4" />
					Company
				</TabsTrigger>
				<TabsTrigger value="logs" className="flex items-center gap-2">
					<HistoryIcon className="h-4 w-4" />
					Sent Logs
				</TabsTrigger>
			</TabsList>

			<TabsContent value="driver" className="space-y-4">
				<Card className="print:border-0 print:shadow-none">
					<CardHeader className="print:hidden">
						<CardTitle>Driver Invoice</CardTitle>
						<CardDescription>
							Generate weekly or custom date range invoices for drivers. Shows all completed jobs with transfer type, distance, suburbs, and driver share based on their commission rate.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<DriverInvoiceForm />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="company" className="space-y-4">
				<Card className="print:border-0 print:shadow-none">
					<CardHeader className="print:hidden">
						<CardTitle>Company Invoice</CardTitle>
						<CardDescription>
							Generate invoices for companies (offload jobs) to send for payment. Weekly, fortnightly, monthly, or custom date range.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CompanyInvoiceForm />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="logs" className="space-y-4">
				<InvoiceSentLogs />
			</TabsContent>
		</Tabs>
	);
}
