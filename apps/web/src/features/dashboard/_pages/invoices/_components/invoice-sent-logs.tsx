import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { format } from "date-fns";
import { Building2Icon, TruckIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/trpc";

export function InvoiceSentLogs() {
	const [typeFilter, setTypeFilter] = useState<string>("all");

	const logsQuery = useQuery(
		trpc.invoices.listSentLogs.queryOptions({
			limit: 50,
			offset: 0,
			type:
				typeFilter === "all" ? undefined : (typeFilter as "driver" | "company"),
		}),
	);

	const logs = logsQuery.data?.items ?? [];
	const total = logsQuery.data?.total ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Invoice Sent Logs</CardTitle>
				<CardDescription>
					History of all invoices sent by email to drivers and companies.
				</CardDescription>
				<div className="flex items-center gap-2 pt-2">
					<Label className="font-medium text-sm">Filter by type</Label>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="driver">Driver</SelectItem>
							<SelectItem value="company">Company</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{logsQuery.isPending ? (
					<p className="text-muted-foreground text-sm">Loading...</p>
				) : logs.length === 0 ? (
					<p className="text-muted-foreground text-sm">No invoices sent yet.</p>
				) : (
					<div className="space-y-2">
						<p className="mb-4 text-muted-foreground text-sm">
							Showing {logs.length} of {total} sent invoices
						</p>
						<div className="rounded-md border">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b bg-muted/50">
										<th className="p-3 text-left font-medium">Type</th>
										<th className="p-3 text-left font-medium">Recipient</th>
										<th className="p-3 text-left font-medium">Email</th>
										<th className="p-3 text-left font-medium">Period</th>
										<th className="p-3 text-left font-medium">Sent at</th>
									</tr>
								</thead>
								<tbody>
									{logs.map((log) => (
										<tr key={log.id} className="border-b last:border-0">
											<td className="p-3">
												<span className="inline-flex items-center gap-1.5">
													{log.type === "driver" ? (
														<TruckIcon className="h-4 w-4 text-muted-foreground" />
													) : (
														<Building2Icon className="h-4 w-4 text-muted-foreground" />
													)}
													<span className="capitalize">{log.type}</span>
												</span>
											</td>
											<td className="p-3 font-medium">{log.recipientName}</td>
											<td className="p-3 text-muted-foreground">
												{log.recipientEmail}
											</td>
											<td className="p-3">
												{format(log.periodStart, "dd MMM yyyy")} –{" "}
												{format(log.periodEnd, "dd MMM yyyy")}
											</td>
											<td className="p-3 text-muted-foreground">
												{format(log.createdAt, "dd MMM yyyy, HH:mm")}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
