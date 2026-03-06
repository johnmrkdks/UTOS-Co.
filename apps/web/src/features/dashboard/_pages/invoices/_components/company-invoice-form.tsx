import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { trpc } from "@/trpc";
import { Loader2Icon, PrinterIcon } from "lucide-react";
import { InvoiceDocument } from "./invoice-document";

const PRESETS = [
	{ label: "This week", getRange: () => getWeekRange(new Date()) },
	{ label: "Last week", getRange: () => getWeekRange(subtractWeeks(new Date(), 1)) },
	{ label: "This fortnight", getRange: () => getFortnightRange(new Date()) },
	{ label: "Last fortnight", getRange: () => getFortnightRange(subtractWeeks(new Date(), 2)) },
	{ label: "This month", getRange: () => getMonthRange(new Date()) },
	{ label: "Last month", getRange: () => getMonthRange(subtractMonths(new Date(), 1)) },
] as const;

function getWeekRange(date: Date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	const start = new Date(d);
	start.setDate(diff);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	end.setHours(23, 59, 59, 999);
	return { startDate: start, endDate: end };
}

function getFortnightRange(date: Date) {
	const d = new Date(date);
	const day = d.getDate();
	const startDay = day <= 15 ? 1 : 16;
	const start = new Date(d.getFullYear(), d.getMonth(), startDay, 0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(start.getDate() + (day <= 15 ? 14 : 15));
	end.setHours(23, 59, 59, 999);
	return { startDate: start, endDate: end };
}

function getMonthRange(date: Date) {
	const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
	const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
	return { startDate: start, endDate: end };
}

function subtractWeeks(date: Date, weeks: number) {
	const d = new Date(date);
	d.setDate(d.getDate() - 7 * weeks);
	return d;
}

function subtractMonths(date: Date, months: number) {
	const d = new Date(date);
	d.setMonth(d.getMonth() - months);
	return d;
}

export function CompanyInvoiceForm() {
	const [companyName, setCompanyName] = useState<string>("");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [preset, setPreset] = useState<string>("");

	const companiesQuery = useQuery(trpc.invoices.listCompanies.queryOptions());
	const invoiceQuery = useQuery({
		...trpc.invoices.getCompanyInvoice.queryOptions({
			companyName,
			startDate: startDate ? new Date(startDate) : new Date(0),
			endDate: endDate ? new Date(endDate) : new Date(),
		}),
		enabled: !!companyName && !!startDate && !!endDate,
	});

	const companies = companiesQuery.data ?? [];
	const invoice = invoiceQuery.data;

	const handlePresetChange = (value: string) => {
		setPreset(value);
		const p = PRESETS.find((x) => x.label === value);
		if (p) {
			const { startDate: s, endDate: e } = p.getRange();
			setStartDate(s.toISOString().split("T")[0]);
			setEndDate(e.toISOString().split("T")[0]);
		}
	};

	const handleGenerate = () => {
		if (!companyName || !startDate || !endDate) return;
		invoiceQuery.refetch();
	};

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
				<div className="space-y-2">
					<Label>Company</Label>
					<Select value={companyName} onValueChange={setCompanyName}>
						<SelectTrigger>
							<SelectValue placeholder="Select company" />
						</SelectTrigger>
						<SelectContent>
							{companies.map((c) => (
								<SelectItem key={c} value={c}>
									{c}
								</SelectItem>
							))}
							{companies.length === 0 && !companiesQuery.isPending && (
								<SelectItem value="_none" disabled>
									No companies with completed offload jobs
								</SelectItem>
							)}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label>Date preset</Label>
					<Select value={preset} onValueChange={handlePresetChange}>
						<SelectTrigger>
							<SelectValue placeholder="Quick select" />
						</SelectTrigger>
						<SelectContent>
							{PRESETS.map((p) => (
								<SelectItem key={p.label} value={p.label}>
									{p.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label>Start date</Label>
					<input
						type="date"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label>End date</Label>
					<input
						type="date"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
			</div>
			<Button
				onClick={handleGenerate}
				disabled={!companyName || !startDate || !endDate || invoiceQuery.isFetching}
				className="print:hidden"
			>
				{invoiceQuery.isFetching ? (
					<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
				) : null}
				Generate Invoice
			</Button>

			{invoice && (
				<div className="space-y-4">
					<div className="flex items-center justify-between print:hidden">
						<h3 className="text-lg font-semibold">Invoice Preview</h3>
						<Button variant="outline" size="sm" onClick={handlePrint}>
							<PrinterIcon className="mr-2 h-4 w-4" />
							Print / Save PDF
						</Button>
					</div>
					<div className="rounded-lg border bg-white p-8 print:border-0 print:shadow-none print:p-0">
						<InvoiceDocument type="company" data={invoice} />
					</div>
				</div>
			)}
		</div>
	);
}
