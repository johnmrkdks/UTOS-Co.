import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Loader2Icon, FileDownIcon, MailIcon } from "lucide-react";
import { InvoiceDocument } from "./invoice-document";
import { format } from "date-fns";
import { elementToPdfBlob, sanitizeFilename } from "./pdf-utils";
import { toast } from "sonner";

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

const COMMISSION_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export function DriverInvoiceForm() {
	const invoiceRef = useRef<HTMLDivElement>(null);
	const [driverId, setDriverId] = useState<string>("");
	const [commissionRate, setCommissionRate] = useState<number>(50);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [preset, setPreset] = useState<string>("");

	const driversQuery = useQuery(
		trpc.drivers.list.queryOptions({ limit: 200, offset: 0 })
	);
	const invoiceQuery = useQuery({
		...trpc.invoices.getDriverInvoice.queryOptions({
			driverId,
			startDate: startDate ? new Date(startDate) : new Date(0),
			endDate: endDate ? new Date(endDate) : new Date(),
			commissionRate,
		}),
		enabled: !!driverId && !!startDate && !!endDate,
	});

	const drivers = driversQuery.data?.items ?? [];
	const invoice = invoiceQuery.data;
	const selectedDriver = drivers.find((d) => d.id === driverId);

	// Sync commission rate when driver changes (use their default)
	useEffect(() => {
		if (selectedDriver?.commissionRate != null) {
			setCommissionRate(selectedDriver.commissionRate);
		}
	}, [selectedDriver?.id, selectedDriver?.commissionRate]);

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
		if (!driverId || !startDate || !endDate) return;
		invoiceQuery.refetch();
	};

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
			a.download = `${sanitizeFilename(invoice.driver.name || "Driver")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success("Invoice downloaded");
		} catch (err) {
			toast.error("Failed to generate PDF");
			console.error(err);
		}
	};

	const queryClient = useQueryClient();
	const sendToDriverMutation = useMutation(
		trpc.invoices.sendDriverInvoice.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.invoices.listSentLogs.queryKey() });
				toast.success("Invoice sent to driver");
			},
			onError: (err) => toast.error(err.message || "Failed to send invoice"),
		})
	);

	const handleSendToDriver = async () => {
		if (!invoice || !invoiceRef.current) return;
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
			sendToDriverMutation.mutate({
				driverId,
				driverEmail: invoice.driver.email,
				driverName: invoice.driver.name,
				startDate: startDate ? new Date(startDate) : new Date(0),
				endDate: endDate ? new Date(endDate) : new Date(),
				commissionRate,
				pdfBase64: base64,
			});
		} catch (err) {
			toast.error("Failed to generate PDF for email");
			console.error(err);
		}
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
				<div className="space-y-2">
					<Label>Driver</Label>
					<Select value={driverId} onValueChange={setDriverId}>
						<SelectTrigger>
							<SelectValue placeholder="Select driver" />
						</SelectTrigger>
						<SelectContent>
							{drivers.map((d) => (
								<SelectItem key={d.id} value={d.id}>
									{d.user?.name ?? "Unknown"}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label>Commission %</Label>
					<Select
						value={commissionRate.toString()}
						onValueChange={(v) => setCommissionRate(Number(v))}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{COMMISSION_OPTIONS.map((pct) => (
								<SelectItem key={pct} value={pct.toString()}>
									{pct}%
								</SelectItem>
							))}
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
				disabled={!driverId || !startDate || !endDate || invoiceQuery.isFetching}
				className="print:hidden"
			>
				{invoiceQuery.isFetching ? (
					<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
				) : null}
				Generate Invoice
			</Button>

			{invoice && (
				<div className="space-y-4">
					<div className="flex items-center gap-2 print:hidden">
						<h3 className="text-lg font-semibold">Invoice Preview</h3>
						<Button variant="outline" size="sm" onClick={handleDownloadPdf}>
							<FileDownIcon className="mr-2 h-4 w-4" />
							Download PDF
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleSendToDriver}
							disabled={sendToDriverMutation.isPending}
						>
							{sendToDriverMutation.isPending ? (
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<MailIcon className="mr-2 h-4 w-4" />
							)}
							Send to Driver
						</Button>
					</div>
					<div
						ref={invoiceRef}
						className="rounded-lg border bg-white p-8 print:border-0 print:shadow-none print:p-0"
					>
						<InvoiceDocument type="driver" data={invoice} />
					</div>
				</div>
			)}
		</div>
	);
}
