import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
	RadioGroup,
	RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";

interface CloseTripExtrasFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: any;
	isNoShow?: boolean;
	onSubmit: (extrasData: ExtrasFormData) => void;
	onBack: () => void;
}

export interface ExtrasFormData {
	additionalWaitTime: number; // in minutes
	unscheduledStops: number;
	parkingCharges: number; // in dollars
	tollCharges: number; // in dollars
	otherCharges: {
		description: string;
		amount: number; // in dollars
	};
	extraType: "general" | "driver" | "operator";
	notes: string;
	location: string; // For toll charges
}

const WAIT_TIME_RATES = {
	international: 60, // 60 minutes courtesy
	domestic: 30, // 30 minutes courtesy
	other: 10, // 10 minutes courtesy
};

export function CloseTripExtrasForm({
	open,
	onOpenChange,
	booking,
	isNoShow = false,
	onSubmit,
	onBack,
}: CloseTripExtrasFormProps) {
	const [formData, setFormData] = useState<ExtrasFormData>({
		additionalWaitTime: 0,
		unscheduledStops: 0,
		parkingCharges: 0,
		tollCharges: 0,
		otherCharges: {
			description: "",
			amount: 0,
		},
		extraType: "general",
		notes: "",
		location: "",
	});

	const updateFormData = (field: keyof ExtrasFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const calculateTotalCharges = () => {
		// Calculate total charges (wait time charges would be calculated based on additionalWaitTime rate)
		const additionalWaitCharge = formData.additionalWaitTime * 0; // TODO: Define rate per minute

		// Other charges
		const total =
			additionalWaitCharge +
			formData.parkingCharges +
			formData.tollCharges +
			formData.otherCharges.amount;

		return total;
	};

	const handleSubmit = () => {
		onSubmit(formData);
	};

	// Validation logic for form completion
	const isFormValid = () => {
		// Check if additional wait time is entered
		const hasAdditionalWaitTime = formData.additionalWaitTime > 0;

		// Check if any charges are entered
		const hasCharges =
			formData.unscheduledStops > 0 ||
			formData.parkingCharges > 0 ||
			formData.tollCharges > 0 ||
			formData.otherCharges.amount > 0;

		// Check if description is provided when other charges amount is entered
		const otherChargesValid =
			formData.otherCharges.amount > 0
				? formData.otherCharges.description.trim().length > 0
				: true;

		// Check if location is provided when toll charges are entered
		const tollLocationValid =
			formData.tollCharges > 0 ? formData.location.trim().length > 0 : true;

		// At least one of additional wait time or charges should be filled, and validation checks
		return (
			(hasAdditionalWaitTime || hasCharges) &&
			otherChargesValid &&
			tollLocationValid
		);
	};

	const renderSingleForm = () => (
		<div className="space-y-4">
			<div>
				<h3 className="mb-3 font-medium text-sm">
					Close trip {isNoShow ? "(No Show)" : "with extras"}
				</h3>
				<p className="mb-4 text-muted-foreground text-xs">
					Utos & Co. (free) wait times:
				</p>
			</div>

			{/* Wait Times */}
			<div className="space-y-3 rounded-md bg-accent/50 p-3">
				<div className="space-y-1">
					<div className="flex items-center justify-between py-1">
						<span className="font-medium text-xs">International Airport:</span>
						<span className="text-muted-foreground text-xs">60 minutes</span>
					</div>
					<p className="text-muted-foreground text-xs">
						from flight arrival + delayed entry time
					</p>
				</div>

				<div className="space-y-1">
					<div className="flex items-center justify-between py-1">
						<span className="font-medium text-xs">Domestic Airport:</span>
						<span className="text-muted-foreground text-xs">30 minutes</span>
					</div>
					<p className="text-muted-foreground text-xs">
						from flight arrival + delayed entry time
					</p>
				</div>

				<div className="space-y-1">
					<div className="flex items-center justify-between py-1">
						<span className="font-medium text-xs">All other trips:</span>
						<span className="text-muted-foreground text-xs">10 minutes</span>
					</div>
					<p className="text-muted-foreground text-xs">
						starting at pickup time
					</p>
				</div>
			</div>

			{/* Additional Wait Time */}
			<div className="space-y-2">
				<div>
					<h4 className="font-medium text-xs">Additional wait time</h4>
					<div className="mt-1 flex items-center gap-2">
						<Input
							type="number"
							min="0"
							placeholder="e.g. 10"
							className="w-32 text-sm"
							value={formData.additionalWaitTime || ""}
							onChange={(e) =>
								updateFormData(
									"additionalWaitTime",
									Number.parseInt(e.target.value) || 0,
								)
							}
						/>
						<span className="text-muted-foreground text-xs">minutes</span>
					</div>
					<p className="mt-1 text-muted-foreground text-xs">
						Please only enter the additional time waited after the free courtesy
						wait time has passed
					</p>
				</div>
			</div>

			{/* Unscheduled Stops */}
			<div className="space-y-2">
				<h4 className="font-medium text-xs">
					Number of unscheduled extra stops
				</h4>
				<div className="flex gap-2">
					{[0, 1, 2, 3, "4+"].map((num) => (
						<Button
							key={num}
							variant={
								formData.unscheduledStops ===
								(typeof num === "string" ? 4 : num)
									? "default"
									: "outline"
							}
							className="h-8 w-8 text-xs"
							onClick={() =>
								updateFormData(
									"unscheduledStops",
									typeof num === "string" ? 4 : num,
								)
							}
						>
							{num}
						</Button>
					))}
				</div>
			</div>

			{/* Parking Charges */}
			<div className="space-y-1">
				<Label htmlFor="parking" className="text-sm">
					Airport & other parking charges
				</Label>
				<div className="flex items-center gap-2">
					<span className="text-sm">$</span>
					<Input
						id="parking"
						type="number"
						step="0.01"
						min="0"
						placeholder="E.g 4.99"
						className="text-sm"
						value={formData.parkingCharges || ""}
						onChange={(e) =>
							updateFormData(
								"parkingCharges",
								Number.parseFloat(e.target.value) || 0,
							)
						}
					/>
				</div>
			</div>

			{/* Toll Charges */}
			<div className="space-y-1">
				<Label htmlFor="toll" className="text-sm">
					Total toll Charges
				</Label>
				<div className="flex items-center gap-2">
					<span className="text-sm">$</span>
					<Input
						id="toll"
						type="number"
						step="0.01"
						min="0"
						placeholder="E.g 4.99"
						className="text-sm"
						value={formData.tollCharges || ""}
						onChange={(e) =>
							updateFormData(
								"tollCharges",
								Number.parseFloat(e.target.value) || 0,
							)
						}
					/>
				</div>
				<p className="text-muted-foreground text-sm">
					Enter the total amount of toll charges for this job
				</p>
			</div>

			{/* Toll Location - conditionally shown when toll charges entered */}
			{formData.tollCharges > 0 && (
				<div className="space-y-1">
					<Label htmlFor="location" className="text-sm">
						Location(s) where tolls were taken (required)
					</Label>
					<Input
						id="location"
						type="text"
						placeholder=""
						className="text-sm"
						value={formData.location || ""}
						onChange={(e) => updateFormData("location", e.target.value)}
					/>
				</div>
			)}

			{/* Other Charges */}
			<div className="space-y-3">
				<h4 className="font-medium text-xs">Other Charges</h4>
				<p className="text-muted-foreground text-sm">
					Description of other charges
				</p>
				<Textarea
					placeholder="Type description here"
					className="text-sm"
					value={formData.otherCharges.description}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							otherCharges: {
								...prev.otherCharges,
								description: e.target.value,
							},
						}))
					}
				/>

				<div className="space-y-1">
					<Label htmlFor="other-amount" className="text-sm">
						Amount (optional)
					</Label>
					<div className="flex items-center gap-2">
						<span className="text-sm">$</span>
						<Input
							id="other-amount"
							type="number"
							step="0.01"
							min="0"
							placeholder="E.g 4.99"
							className="text-sm"
							value={formData.otherCharges.amount || ""}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									otherCharges: {
										...prev.otherCharges,
										amount: Number.parseFloat(e.target.value) || 0,
									},
								}))
							}
						/>
					</div>
				</div>

				{/* Extra Type */}
				<div className="space-y-2">
					<Label className="text-sm">Type of extra</Label>
					<RadioGroup
						value={formData.extraType}
						onValueChange={(value) => updateFormData("extraType", value)}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="general" id="general" />
							<label htmlFor="general" className="text-sm">
								General Extra (Split with Operator)
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="driver" id="driver" />
							<label htmlFor="driver" className="text-sm">
								Driver Extra (Paid in full to Driver)
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="operator" id="operator" />
							<label htmlFor="operator" className="text-sm">
								Operator Extra (Paid in full to Operator)
							</label>
						</div>
					</RadioGroup>
				</div>

				{/* Notes */}
				<div className="space-y-1">
					<Label htmlFor="notes" className="text-sm">
						Other notes to Operator
					</Label>
					<Textarea
						id="notes"
						placeholder="Type notes here"
						className="text-sm"
						value={formData.notes}
						onChange={(e) => updateFormData("notes", e.target.value)}
					/>
					<p className="text-muted-foreground text-xs">
						Additional notes to explain the extras for this trip
					</p>
				</div>
			</div>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="mx-auto flex flex-col p-0 max-sm:m-0 max-sm:h-full max-sm:w-full max-sm:max-w-none max-sm:rounded-none sm:max-h-[90vh] sm:max-w-md"
				showCloseButton={false}
			>
				{/* Header */}
				<DialogHeader className="flex-shrink-0 border-b bg-white p-4">
					<div className="flex items-center justify-between gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={onBack}
							className="-ml-2 h-10 w-10 shrink-0 p-0"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<DialogTitle className="flex-1 text-center text-sm">
							Close trip with extras
						</DialogTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onOpenChange(false)}
							className="-mr-2 h-10 w-10 shrink-0 p-0"
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</DialogHeader>

				{/* Scrollable content area */}
				<div className="flex-1 overflow-y-auto p-4">{renderSingleForm()}</div>

				{/* Sticky footer with buttons */}
				<div className="flex-shrink-0 border-t bg-white p-4">
					<Button
						onClick={handleSubmit}
						className="h-10 w-full bg-primary font-medium text-primary-foreground text-sm hover:bg-primary/90"
						disabled={!isFormValid()}
					>
						Close trip
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
