import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	AlertTriangle,
	Trash2,
	User,
	Car,
	Calendar,
	Shield,
	X,
	CheckCircle,
} from "lucide-react";

interface DeleteDriverConfirmationDialogProps {
	driver: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (driverId: string, forceDelete?: boolean, confirmationText?: string) => Promise<void>;
	isDeleting: boolean;
}

export function DeleteDriverConfirmationDialog({
	driver,
	open,
	onOpenChange,
	onConfirm,
	isDeleting,
}: DeleteDriverConfirmationDialogProps) {
	const [step, setStep] = useState(1);
	const [confirmationText, setConfirmationText] = useState("");
	const [driverNameConfirmation, setDriverNameConfirmation] = useState("");
	const [bookingCheckPassed, setBookingCheckPassed] = useState(false);
	const [bookingError, setBookingError] = useState<any>(null);

	const driverName = driver?.user?.name || "Unknown Driver";
	const expectedConfirmation = "DELETE";
	const isConfirmationValid = confirmationText === expectedConfirmation;
	const isNameValid = driverNameConfirmation.toLowerCase() === driverName.toLowerCase();

	const handleClose = () => {
		setStep(1);
		setConfirmationText("");
		setDriverNameConfirmation("");
		setBookingCheckPassed(false);
		setBookingError(null);
		onOpenChange(false);
	};

	const handleNextStep = () => {
		if (step < 4) {
			setStep(step + 1);
		}
	};

	const handleCheckBookings = async () => {
		try {
			// Try to delete without force to check for bookings
			await onConfirm(driver.id, false, ""); // This should trigger validation
			setBookingCheckPassed(true);
			handleNextStep();
		} catch (error: any) {
			const errorMessage = error.message;
			try {
				const errorData = JSON.parse(errorMessage);
				if (errorData.type === 'DRIVER_HAS_ACTIVE_BOOKINGS' || errorData.type === 'CONFIRMATION_REQUIRED') {
					setBookingError(errorData);
					handleNextStep(); // Proceed to show booking warning
				} else {
					setBookingError({ type: 'UNKNOWN_ERROR', message: errorMessage });
				}
			} catch {
				setBookingError({ type: 'UNKNOWN_ERROR', message: errorMessage });
			}
		}
	};

	const handleConfirmDelete = async () => {
		if (isConfirmationValid && isNameValid && driver?.id) {
			await onConfirm(driver.id, true, expectedConfirmation);
			handleClose();
		}
	};

	const renderStep1 = () => (
		<>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2 text-red-600">
					<AlertTriangle className="h-5 w-5" />
					Critical Action: Delete Driver Account
				</DialogTitle>
				<DialogDescription className="space-y-3">
					<p className="text-base font-medium">
						You are about to permanently delete the driver account for <strong>{driverName}</strong>.
					</p>
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-800 font-medium mb-2">⚠️ This action will:</p>
						<ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
							<li>Permanently delete the driver's account and profile</li>
							<li>Remove all associated user data and login credentials</li>
							<li>Cancel any pending or active bookings assigned to this driver</li>
							<li>Remove driver from all car assignments</li>
							<li>Delete all historical data and records</li>
						</ul>
					</div>
					<p className="text-sm text-gray-600">
						This action <strong className="text-red-600">CANNOT BE UNDONE</strong>. 
						Please ensure this is the correct driver and that you want to proceed.
					</p>
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				<div className="border rounded-lg p-4 bg-gray-50">
					<h4 className="font-medium mb-3 flex items-center gap-2">
						<User className="h-4 w-4" />
						Driver Information
					</h4>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<Label className="text-gray-500">Name</Label>
							<p className="font-medium">{driverName}</p>
						</div>
						<div>
							<Label className="text-gray-500">Email</Label>
							<p className="font-medium">{driver?.user?.email || "N/A"}</p>
						</div>
						<div>
							<Label className="text-gray-500">License</Label>
							<p className="font-medium">{driver?.licenseNumber || "N/A"}</p>
						</div>
						<div>
							<Label className="text-gray-500">Status</Label>
							<div className="flex gap-2">
								<Badge variant={driver?.isApproved ? "default" : "destructive"}>
									{driver?.isApproved ? "Approved" : "Pending"}
								</Badge>
								<Badge variant={driver?.isActive ? "default" : "secondary"}>
									{driver?.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</div>

			<DialogFooter>
				<Button variant="outline" onClick={handleClose}>
					<X className="h-4 w-4 mr-2" />
					Cancel
				</Button>
				<Button 
					variant="destructive" 
					onClick={handleCheckBookings}
					className="bg-red-600 hover:bg-red-700"
					disabled={isDeleting}
				>
					{isDeleting ? "Checking..." : "Check for Active Bookings"}
				</Button>
			</DialogFooter>
		</>
	);

	const renderStep2 = () => (
		<>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2 text-amber-600">
					<Calendar className="h-5 w-5" />
					Active Bookings Check
				</DialogTitle>
				<DialogDescription>
					{bookingError?.type === 'DRIVER_HAS_ACTIVE_BOOKINGS' 
						? "This driver has active bookings that will be affected by deletion."
						: bookingError?.type === 'CONFIRMATION_REQUIRED'
						? "Driver validation complete. Ready to proceed with deletion."
						: "Checking for active bookings..."
					}
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				{bookingError?.type === 'DRIVER_HAS_ACTIVE_BOOKINGS' && (
					<>
						<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
							<p className="text-amber-800 font-medium mb-2">⚠️ Active Bookings Found:</p>
							<div className="text-amber-700 text-sm space-y-1">
								<p>• <strong>{bookingError.details.upcomingBookings}</strong> upcoming bookings</p>
								<p>• <strong>{bookingError.details.inProgressBookings}</strong> in-progress bookings</p>
							</div>
						</div>
						
						{bookingError.details.bookings && bookingError.details.bookings.length > 0 && (
							<div className="border rounded-lg p-4 bg-gray-50">
								<h4 className="font-medium mb-3 flex items-center gap-2">
									<Car className="h-4 w-4" />
									Affected Bookings
								</h4>
								<div className="space-y-2 max-h-40 overflow-y-auto">
									{bookingError.details.bookings.map((booking: any, index: number) => (
										<div key={index} className="bg-white border rounded p-3 text-sm">
											<div className="flex justify-between items-start mb-1">
												<span className="font-medium">{booking.customer}</span>
												<Badge variant="secondary" className="text-xs">
													{booking.status.replace('_', ' ')}
												</Badge>
											</div>
											<p className="text-gray-600 text-xs">{booking.route}</p>
											<p className="text-gray-500 text-xs mt-1">
												{new Date(booking.scheduledPickupTime).toLocaleString()}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
						
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<p className="text-red-800 font-medium mb-2">⚠️ Deletion Impact:</p>
							<ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
								<li>All active bookings will be <strong>cancelled</strong></li>
								<li>Customers will need to be notified and reassigned</li>
								<li>Booking history will be permanently deleted</li>
							</ul>
						</div>
					</>
				)}
				
				{bookingError?.type === 'CONFIRMATION_REQUIRED' && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<p className="text-green-800 font-medium mb-2">✅ Safe to Delete:</p>
						<div className="text-green-700 text-sm space-y-1">
							<p>• No active bookings found</p>
							<p>• Driver can be safely removed</p>
							<p>• Total booking history: <strong>{bookingError.details.totalBookings}</strong></p>
						</div>
					</div>
				)}
			</div>

			<DialogFooter>
				<Button variant="outline" onClick={handleClose}>
					Cancel Deletion
				</Button>
				<Button 
					variant="destructive" 
					onClick={handleNextStep}
					className="bg-red-600 hover:bg-red-700"
				>
					{bookingError?.type === 'DRIVER_HAS_ACTIVE_BOOKINGS' 
						? "Force Delete Anyway" 
						: "Continue with Deletion"
					}
				</Button>
			</DialogFooter>
		</>
	);

	const renderStep3 = () => (
		<>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2 text-red-600">
					<Shield className="h-5 w-5" />
					Confirm Driver Identity
				</DialogTitle>
				<DialogDescription>
					To prevent accidental deletion, please type the driver's full name exactly as shown below.
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<Label className="text-blue-800 font-medium">Driver Name to Delete:</Label>
					<p className="text-lg font-bold text-blue-900 mt-1">{driverName}</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="driver-name-confirm">Type the driver's name to confirm:</Label>
					<Input
						id="driver-name-confirm"
						type="text"
						value={driverNameConfirmation}
						onChange={(e) => setDriverNameConfirmation(e.target.value)}
						placeholder={`Type: ${driverName}`}
						className={isNameValid ? "border-green-500 bg-green-50" : ""}
					/>
					{driverNameConfirmation && (
						<p className={`text-sm ${isNameValid ? "text-green-600" : "text-red-600"}`}>
							{isNameValid ? (
								<span className="flex items-center gap-1">
									<CheckCircle className="h-3 w-3" />
									Name confirmed
								</span>
							) : (
								"Name does not match"
							)}
						</p>
					)}
				</div>
			</div>

			<DialogFooter>
				<Button variant="outline" onClick={() => setStep(2)}>
					Back
				</Button>
				<Button 
					variant="destructive" 
					onClick={handleNextStep}
					disabled={!isNameValid}
					className="bg-red-600 hover:bg-red-700"
				>
					Name Confirmed, Continue
				</Button>
			</DialogFooter>
		</>
	);

	const renderStep4 = () => (
		<>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2 text-red-600">
					<Trash2 className="h-5 w-5" />
					Final Confirmation
				</DialogTitle>
				<DialogDescription>
					This is your final chance to cancel. Type the confirmation phrase exactly as shown.
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800 font-medium mb-2">⚠️ Last Warning:</p>
					<p className="text-red-700 text-sm">
						You are about to permanently delete <strong>{driverName}</strong>'s driver account. 
						This will remove all data and cannot be reversed.
					</p>
				</div>

				<div className="bg-gray-100 border rounded-lg p-3">
					<Label className="text-gray-700 font-medium">Required confirmation phrase:</Label>
					<p className="text-lg font-mono font-bold text-gray-900 mt-1">{expectedConfirmation}</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmation-text">Type the confirmation phrase:</Label>
					<Input
						id="confirmation-text"
						type="text"
						value={confirmationText}
						onChange={(e) => setConfirmationText(e.target.value)}
						placeholder={`Type: ${expectedConfirmation}`}
						className={isConfirmationValid ? "border-green-500 bg-green-50" : ""}
					/>
					{confirmationText && (
						<p className={`text-sm ${isConfirmationValid ? "text-green-600" : "text-red-600"}`}>
							{isConfirmationValid ? (
								<span className="flex items-center gap-1">
									<CheckCircle className="h-3 w-3" />
									Confirmation phrase correct
								</span>
							) : (
								"Confirmation phrase does not match"
							)}
						</p>
					)}
				</div>
			</div>

			<DialogFooter>
				<Button variant="outline" onClick={() => setStep(3)}>
					Back
				</Button>
				<Button 
					variant="destructive" 
					onClick={handleConfirmDelete}
					disabled={!isConfirmationValid || !isNameValid || isDeleting}
					className="bg-red-600 hover:bg-red-700"
				>
					{isDeleting ? (
						"Deleting..."
					) : (
						<>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete Driver Account
						</>
					)}
				</Button>
			</DialogFooter>
		</>
	);

	const renderProgressIndicator = () => (
		<div className="flex items-center justify-center mb-6">
			<div className="flex items-center space-x-2">
				{[1, 2, 3, 4].map((stepNumber) => (
					<div key={stepNumber} className="flex items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
								stepNumber === step
									? "bg-red-500 text-white"
									: stepNumber < step
									? "bg-green-500 text-white"
									: "bg-gray-200 text-gray-600"
							}`}
						>
							{stepNumber < step ? <CheckCircle className="h-4 w-4" /> : stepNumber}
						</div>
						{stepNumber < 4 && (
							<div className={`w-8 h-0.5 mx-2 ${stepNumber < step ? "bg-green-500" : "bg-gray-200"}`} />
						)}
					</div>
				))}
			</div>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
				{renderProgressIndicator()}
				{step === 1 && renderStep1()}
				{step === 2 && renderStep2()}
				{step === 3 && renderStep3()}
				{step === 4 && renderStep4()}
			</DialogContent>
		</Dialog>
	);
}