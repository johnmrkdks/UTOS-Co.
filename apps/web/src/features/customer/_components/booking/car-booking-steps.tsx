import { CheckCircle } from "lucide-react"
import type { BookingStep } from "../../_schemas/car-appointment-schema"

interface CarBookingStepsProps {
	currentStep: BookingStep
}

export function CarBookingSteps({ currentStep }: CarBookingStepsProps) {
	return (
		<div className="mb-4 flex items-center justify-center overflow-x-auto sm:mb-8">
			<div className="flex items-center space-x-2 px-4 sm:space-x-4 lg:space-x-8">
				<div className={`flex items-center transition-colors ${currentStep === "details" ? "text-primary" : "text-muted-foreground"}`}>
					<div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-10 sm:w-10 sm:text-sm lg:h-12 lg:w-12 lg:text-base ${
						currentStep === "details" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted"
					}`}>
						1
					</div>
					<span className="ml-1 text-xs font-medium sm:ml-3 sm:text-sm lg:text-lg">Details</span>
				</div>
				<div className="h-px w-6 bg-border sm:w-12 lg:w-20" />
				<div className={`flex items-center transition-colors ${currentStep === "confirmation" ? "text-primary" : "text-muted-foreground"}`}>
					<div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-10 sm:w-10 sm:text-sm lg:h-12 lg:w-12 lg:text-base ${
						currentStep === "confirmation" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted"
					}`}>
						2
					</div>
					<span className="ml-1 text-xs font-medium sm:ml-3 sm:text-sm lg:text-lg">Review</span>
				</div>
				<div className="h-px w-6 bg-border sm:w-12 lg:w-20" />
				<div className={`flex items-center transition-colors ${["processing", "success"].includes(currentStep) ? "text-primary" : "text-muted-foreground"}`}>
					<div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-10 sm:w-10 sm:text-sm lg:h-12 lg:w-12 lg:text-base ${
						["processing", "success"].includes(currentStep) ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted"
					}`}>
						{currentStep === "success" ? <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6" /> : "3"}
					</div>
					<span className="ml-1 text-xs font-medium sm:ml-3 sm:text-sm lg:text-lg">Confirm</span>
				</div>
			</div>
		</div>
	)
}