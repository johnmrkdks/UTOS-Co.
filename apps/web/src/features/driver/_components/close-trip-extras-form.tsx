import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface CloseTripExtrasFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: any;
	isNoShow?: boolean;
	onSubmit: (extrasData: ExtrasFormData) => void;
	onBack: () => void;
}

export interface ExtrasFormData {
	waitTimes: {
		international: number; // in minutes
		domestic: number; // in minutes
		other: number; // in minutes
	};
	additionalWaitTime: number; // in minutes
	unscheduledStops: number;
	parkingCharges: number; // in dollars
	tollCharges: number; // in dollars
	otherCharges: {
		description: string;
		amount: number;
	};
	extraType: 'general' | 'driver' | 'operator';
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
	onBack
}: CloseTripExtrasFormProps) {
	const [formData, setFormData] = useState<ExtrasFormData>({
		waitTimes: {
			international: 0,
			domestic: 0,
			other: 0
		},
		additionalWaitTime: 0,
		unscheduledStops: 0,
		parkingCharges: 0,
		tollCharges: 0,
		otherCharges: {
			description: '',
			amount: 0
		},
		extraType: 'general',
		notes: '',
		location: ''
	});

	const updateFormData = (field: keyof ExtrasFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};


	const calculateTotalCharges = () => {
		// Wait time charges (only above courtesy time)
		const intlWaitCharge = Math.max(0, formData.waitTimes.international - WAIT_TIME_RATES.international) * 0; // Define rate
		const domesticWaitCharge = Math.max(0, formData.waitTimes.domestic - WAIT_TIME_RATES.domestic) * 0; // Define rate  
		const otherWaitCharge = Math.max(0, formData.waitTimes.other - WAIT_TIME_RATES.other) * 0; // Define rate

		const totalWaitCharges = intlWaitCharge + domesticWaitCharge + otherWaitCharge;
		const additionalWaitCharge = formData.additionalWaitTime * 0; // Define rate per minute

		// Other charges
		const total = totalWaitCharges +
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
		const hasCharges = formData.unscheduledStops > 0 ||
			formData.parkingCharges > 0 ||
			formData.tollCharges > 0 ||
			formData.otherCharges.amount > 0;

		// Check if description is provided when other charges amount is entered
		const otherChargesValid = formData.otherCharges.amount > 0 ?
			formData.otherCharges.description.trim().length > 0 : true;

		// Check if location is provided when toll charges are entered
		const tollLocationValid = formData.tollCharges > 0 ?
			formData.location.trim().length > 0 : true;

		// At least one of additional wait time or charges should be filled, and validation checks
		return (hasAdditionalWaitTime || hasCharges) && otherChargesValid && tollLocationValid;
	};

	const renderSingleForm = () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-medium mb-3">
					Close trip {isNoShow ? '(No Show)' : 'with extras'}
				</h3>
				<p className="text-xs text-muted-foreground mb-4">
					Down Under Chauffeur (free) wait times:
				</p>
			</div>

			{/* Wait Times */}
			<div className="space-y-3 bg-accent/50 p-3 rounded-md">
				<div className="space-y-1">
					<div className="flex justify-between items-center py-1">
						<span className="text-xs font-medium">International Airport:</span>
						<span className="text-xs text-muted-foreground">60 minutes</span>
					</div>
					<p className="text-xs text-muted-foreground">from flight arrival + delayed entry time</p>
				</div>

				<div className="space-y-1">
					<div className="flex justify-between items-center py-1">
						<span className="text-xs font-medium">Domestic Airport:</span>
						<span className="text-xs text-muted-foreground">30 minutes</span>
					</div>
					<p className="text-xs text-muted-foreground">from flight arrival + delayed entry time</p>
				</div>

				<div className="space-y-1">
					<div className="flex justify-between items-center py-1">
						<span className="text-xs font-medium">All other trips:</span>
						<span className="text-xs text-muted-foreground">10 minutes</span>
					</div>
					<p className="text-xs text-muted-foreground">starting at pickup time</p>
				</div>
			</div>

			{/* Additional Wait Time */}
			<div className="space-y-2">
				<div>
					<h4 className="text-xs font-medium">Additional wait time</h4>
					<div className="flex items-center gap-2 mt-1">
						<Input
							type="number"
							min="0"
							placeholder="e.g. 10"
							className="w-32 text-sm"
							value={formData.additionalWaitTime || ''}
							onChange={(e) => updateFormData('additionalWaitTime', parseInt(e.target.value) || 0)}
						/>
						<span className="text-xs text-muted-foreground">minutes</span>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Please only enter the additional time waited after the free courtesy wait time has passed
					</p>
				</div>
			</div>

			{/* Unscheduled Stops */}
			<div className="space-y-2">
				<h4 className="text-xs font-medium">Number of unscheduled extra stops</h4>
				<div className="flex gap-2">
					{[0, 1, 2, 3, '4+'].map((num) => (
						<Button
							key={num}
							variant={formData.unscheduledStops === (typeof num === 'string' ? 4 : num) ? "default" : "outline"}
							className="w-8 h-8 text-xs"
							onClick={() => updateFormData('unscheduledStops', typeof num === 'string' ? 4 : num)}
						>
							{num}
						</Button>
					))}
				</div>
			</div>

			{/* Parking Charges */}
			<div className="space-y-1">
				<Label htmlFor="parking" className="text-sm">Airport & other parking charges</Label>
				<div className="flex items-center gap-2">
					<span className="text-sm">$</span>
					<Input
						id="parking"
						type="number"
						step="0.01"
						min="0"
						placeholder="E.g 4.99"
						className="text-sm"
						value={formData.parkingCharges || ''}
						onChange={(e) => updateFormData('parkingCharges', parseFloat(e.target.value) || 0)}
					/>
				</div>
			</div>

			{/* Toll Charges */}
			<div className="space-y-1">
				<Label htmlFor="toll" className="text-sm">Total toll Charges</Label>
				<div className="flex items-center gap-2">
					<span className="text-sm">$</span>
					<Input
						id="toll"
						type="number"
						step="0.01"
						min="0"
						placeholder="E.g 4.99"
						className="text-sm"
						value={formData.tollCharges || ''}
						onChange={(e) => updateFormData('tollCharges', parseFloat(e.target.value) || 0)}
					/>
				</div>
				<p className="text-sm text-muted-foreground">
					Enter the total amount of toll charges for this job
				</p>
			</div>

			{/* Toll Location - conditionally shown when toll charges entered */}
			{formData.tollCharges > 0 && (
				<div className="space-y-1">
					<Label htmlFor="location" className="text-sm">Location(s) where tolls were taken (required)</Label>
					<Input
						id="location"
						type="text"
						placeholder=""
						className="text-sm"
						value={formData.location || ''}
						onChange={(e) => updateFormData('location', e.target.value)}
					/>
				</div>
			)}

			{/* Other Charges */}
			<div className="space-y-3">
				<h4 className="text-xs font-medium">Other Charges</h4>
				<p className="text-sm text-muted-foreground">Description of other charges</p>
				<Textarea
					placeholder="Type description here"
					className="text-sm"
					value={formData.otherCharges.description}
					onChange={(e) => setFormData(prev => ({
						...prev,
						otherCharges: { ...prev.otherCharges, description: e.target.value }
					}))}
				/>

				<div className="space-y-1">
					<Label htmlFor="other-amount" className="text-sm">Amount (optional)</Label>
					<div className="flex items-center gap-2">
						<span className="text-sm">$</span>
						<Input
							id="other-amount"
							type="number"
							step="0.01"
							min="0"
							placeholder="E.g 4.99"
							className="text-sm"
							value={formData.otherCharges.amount || ''}
							onChange={(e) => setFormData(prev => ({
								...prev,
								otherCharges: { ...prev.otherCharges, amount: parseFloat(e.target.value) || 0 }
							}))}
						/>
					</div>
				</div>

				{/* Extra Type */}
				<div className="space-y-2">
					<Label className="text-sm">Type of extra</Label>
					<RadioGroup
						value={formData.extraType}
						onValueChange={(value) => updateFormData('extraType', value)}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="general" id="general" />
							<label htmlFor="general" className="text-sm">General Extra (Split with Operator)</label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="driver" id="driver" />
							<label htmlFor="driver" className="text-sm">Driver Extra (Paid in full to Driver)</label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="operator" id="operator" />
							<label htmlFor="operator" className="text-sm">Operator Extra (Paid in full to Operator)</label>
						</div>
					</RadioGroup>
				</div>

				{/* Notes */}
				<div className="space-y-1">
					<Label htmlFor="notes" className="text-sm">Other notes to Operator</Label>
					<Textarea
						id="notes"
						placeholder="Type notes here"
						className="text-sm"
						value={formData.notes}
						onChange={(e) => updateFormData('notes', e.target.value)}
					/>
					<p className="text-xs text-muted-foreground">
						Additional notes to explain the extras for this trip
					</p>
				</div>
			</div>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md mx-auto sm:max-h-[90vh] max-sm:w-full max-sm:h-full max-sm:m-0 max-sm:rounded-none max-sm:max-w-none flex flex-col p-0">
				{/* Header */}
				<DialogHeader className="flex-shrink-0 p-4 border-b bg-white">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={onBack}
							className="h-8 w-8 p-0"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<DialogTitle className="text-sm">Close trip with extras</DialogTitle>
					</div>
				</DialogHeader>

				{/* Scrollable content area */}
				<div className="flex-1 overflow-y-auto p-4">
					{renderSingleForm()}
				</div>

				{/* Sticky footer with buttons */}
				<div className="flex-shrink-0 p-4 border-t bg-white">
					<Button
						onClick={handleSubmit}
						className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
						disabled={!isFormValid()}
					>
						Close trip
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
