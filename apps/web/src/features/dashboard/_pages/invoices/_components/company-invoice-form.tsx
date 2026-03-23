import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { format } from "date-fns";
import { FileDownIcon, Loader2Icon, MailIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/trpc";
import { InvoiceDocument } from "./invoice-document";
import { elementToPdfBlob, sanitizeFilename } from "./pdf-utils";

const PRESETS = [
	{ label: "This week", getRange: () => getWeekRange(new Date()) },
	{
		label: "Last week",
		getRange: () => getWeekRange(subtractWeeks(new Date(), 1)),
	},
	{ label: "This fortnight", getRange: () => getFortnightRange(new Date()) },
	{
		label: "Last fortnight",
		getRange: () => getFortnightRange(subtractWeeks(new Date(), 2)),
	},
	{ label: "This month", getRange: () => getMonthRange(new Date()) },
	{
		label: "Last month",
		getRange: () => getMonthRange(subtractMonths(new Date(), 1)),
	},
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
	const end = new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		0,
		23,
		59,
		59,
		999,
	);
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
	const invoiceRef = useRef<HTMLDivElement>(null);
	const [companyName, setCompanyName] = useState<string>("");
	const [companyEmail, setCompanyEmail] = useState<string>("");
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

	const queryClient = useQueryClient();
	const sendToCompanyMutation = useMutation(
		trpc.invoices.sendCompanyInvoice.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.invoices.listSentLogs.queryKey(),
				});
				toast.success("Invoice sent to company");
			},
			onError: (err) => toast.error(err.message || "Failed to send invoice"),
		}),
	);

	const handleDownloadPdf = async () => {
		if (!invoice || !invoiceRef.current) return;
		try {
			await new Promise((r) => setTimeout(r, 100));
			const el = invoiceRef.current;
			if (!el) return;
			const blob = await elementToPdfBlob(el);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${sanitizeFilename(companyName || "Company")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success("Invoice downloaded");
		} catch (err) {
			toast.error("Failed to generate PDF");
			console.error(err);
		}
	};

	const handleSendToCompany = async () => {
		if (!invoice || !invoiceRef.current || !companyEmail.trim()) {
			toast.error("Please enter company email to send invoice");
			return;
		}
		try {
			await new Promise((r) => setTimeout(r, 100));
			const el = invoiceRef.current;
			if (!el) return;
			const blob = await elementToPdfBlob(el);
			const buffer = await blob.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			let binary = "";
			for (let i = 0; i < bytes.byteLength; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			const base64 = btoa(binary);
			sendToCompanyMutation.mutate({
				companyName,
				companyEmail: companyEmail.trim(),
				startDate: startDate ? new Date(startDate) : new Date(0),
				endDate: endDate ? new Date(endDate) : new Date(),
				pdfBase64: base64,
			});
		} catch (err) {
			toast.error("Failed to generate PDF for email");
			console.error(err);
		}
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
				disabled={
					!companyName || !startDate || !endDate || invoiceQuery.isFetching
				}
				className="print:hidden"
			>
				{invoiceQuery.isFetching ? (
					<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
				) : null}
				Generate Invoice
			</Button>

			{invoice && (
				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-2 print:hidden">
						<h3 className="font-semibold text-lg">Invoice Preview</h3>
						<Button variant="outline" size="sm" onClick={handleDownloadPdf}>
							<FileDownIcon className="mr-2 h-4 w-4" />
							Download PDF
						</Button>
						<div className="flex items-center gap-2">
							<Input
								type="email"
								placeholder="Company email"
								value={companyEmail}
								onChange={(e) => setCompanyEmail(e.target.value)}
								className="w-64"
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={handleSendToCompany}
								disabled={
									sendToCompanyMutation.isPending || !companyEmail.trim()
								}
							>
								{sendToCompanyMutation.isPending ? (
									<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<MailIcon className="mr-2 h-4 w-4" />
								)}
								Send to Company
							</Button>
						</div>
					</div>
					<div
						ref={invoiceRef}
						className="rounded-lg border bg-white p-8 print:border-0 print:p-0 print:shadow-none"
					>
						<InvoiceDocument type="company" data={invoice} />
					</div>
				</div>
			)}
		</div>
	);
}
