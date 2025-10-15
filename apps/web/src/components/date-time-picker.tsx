import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import { Input } from "@workspace/ui/components/input"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerFooter,
	DrawerClose,
} from "@workspace/ui/components/drawer"
import { cn } from "@workspace/ui/lib/utils"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

interface DateTimePickerProps {
	selectedDate?: Date
	selectedTime?: string
	onDateChange?: (date: Date | undefined) => void
	onTimeChange?: (time: string) => void
	dateError?: string
	timeError?: string
	dateLabel?: string
	timeLabel?: string
	className?: string
	allowPastDates?: boolean // Deprecated - no longer used, kept for compatibility
	allowPastTimes?: boolean // Allow selecting times in the past for today's date
}

export function DateTimePicker({
	selectedDate,
	selectedTime,
	onDateChange,
	onTimeChange,
	dateError,
	timeError,
	dateLabel = "Pickup Date *",
	timeLabel = "Pickup Time *",
	className = "",
	allowPastDates = false,
	allowPastTimes = false,
}: DateTimePickerProps) {
	const [isMobile, setIsMobile] = useState(false)
	const [dateDrawerOpen, setDateDrawerOpen] = useState(false)
	const [timeDrawerOpen, setTimeDrawerOpen] = useState(false)
	const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate)
	const [tempTime, setTempTime] = useState<string | undefined>(selectedTime)

	// Detect mobile devices
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}
		checkMobile()
		window.addEventListener("resize", checkMobile)
		return () => window.removeEventListener("resize", checkMobile)
	}, [])

	// Generate time options (15-minute intervals) - for quick selection
	const generateTimeOptions = () => {
		const times: string[] = []
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const h = hour.toString().padStart(2, "0")
				const m = minute.toString().padStart(2, "0")
				times.push(`${h}:${m}`)
			}
		}
		return times
	}

	// Handle manual time input from native time picker
	const handleTimeInputChange = (value: string) => {
		// Native time input returns HH:MM format
		if (value) {
			setTempTime(value)
		}
	}

	// Format time for display (12-hour format)
	const formatTimeDisplay = (time?: string) => {
		if (!time) return "Select time"
		const [hourStr, minute] = time.split(":")
		const hour = Number.parseInt(hourStr)
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
		const ampm = hour >= 12 ? "PM" : "AM"
		return `${displayHour}:${minute} ${ampm}`
	}

	// Handle date selection in drawer (don't close immediately)
	const handleDateSelect = (date: Date | undefined) => {
		setTempDate(date)
		// Don't close drawer - let user confirm
	}

	// Confirm date selection
	const confirmDateSelection = () => {
		onDateChange?.(tempDate)
		setDateDrawerOpen(false)
	}

	// Handle time selection in drawer
	const handleTimeSelect = (time: string) => {
		setTempTime(time)
	}

	// Confirm time selection
	const confirmTimeSelection = () => {
		if (tempTime) {
			onTimeChange?.(tempTime)
		}
		setTimeDrawerOpen(false)
	}

	// Desktop Date Picker
	const DesktopDatePicker = () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full h-12 justify-start text-left text-base",
						!selectedDate && "text-muted-foreground",
						dateError && "border-red-500",
					)}
				>
					<CalendarIcon className="mr-3 h-5 w-5" />
					{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={onDateChange}
					disabled={(date) => {
						// Always disable dates before 1900
						if (date < new Date("1900-01-01")) return true

						// Disable past dates but allow today
						const today = new Date()
						today.setHours(0, 0, 0, 0) // Reset to start of day

						const compareDate = new Date(date)
						compareDate.setHours(0, 0, 0, 0) // Reset to start of day

						return compareDate < today
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	)

	// Mobile Date Picker
	const MobileDatePicker = () => (
		<Drawer open={dateDrawerOpen} onOpenChange={setDateDrawerOpen} modal={true}>
			<Button
				variant="outline"
				onClick={() => {
					setTempDate(selectedDate)
					setDateDrawerOpen(true)
				}}
				className={cn(
					"w-full h-12 justify-start text-left text-base",
					!selectedDate && "text-muted-foreground",
					dateError && "border-red-500",
				)}
			>
				<CalendarIcon className="mr-3 h-5 w-5" />
				{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
			</Button>
			<DrawerContent onOpenAutoFocus={(e) => e.preventDefault()}>
				<DrawerHeader>
					<DrawerTitle>{dateLabel}</DrawerTitle>
				</DrawerHeader>
				<div className="flex justify-center px-4 pb-4">
					<Calendar
						mode="single"
						selected={tempDate}
						onSelect={handleDateSelect}
						disabled={(date) => {
							// Always disable dates before 1900
							if (date < new Date("1900-01-01")) return true

							// Disable past dates but allow today
							const today = new Date()
							today.setHours(0, 0, 0, 0) // Reset to start of day

							const compareDate = new Date(date)
							compareDate.setHours(0, 0, 0, 0) // Reset to start of day

							return compareDate < today
						}}
						className="rounded-md border"
					/>
				</div>
				<DrawerFooter>
					<Button onClick={confirmDateSelection} disabled={!tempDate}>
						Confirm
					</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)

	// Desktop Time Picker - Grid-based hour/minute selection
	const DesktopTimePicker = () => {
		const [open, setOpen] = useState(false)
		const [selectedHour, setSelectedHour] = useState<number | null>(null)
		const [selectedMinute, setSelectedMinute] = useState<number | null>(null)
		const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM")
		const [manualHour, setManualHour] = useState("")
		const [manualMinute, setManualMinute] = useState("")
		const [manualPeriod, setManualPeriod] = useState<"AM" | "PM">("PM")

		// Initialize from selectedTime
		useEffect(() => {
			if (selectedTime && open) {
				const [hours, minutes] = selectedTime.split(":")
				const hourNum = Number.parseInt(hours)
				setSelectedHour(hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum)
				setSelectedMinute(Number.parseInt(minutes))
				setSelectedPeriod(hourNum >= 12 ? "PM" : "AM")
			}
		}, [selectedTime, open])

		const formatTimeDisplay = () => {
			if (!selectedTime) return "Select time"
			const [hours, minutes] = selectedTime.split(":")
			const hourNum = Number.parseInt(hours)
			const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
			const ampm = hourNum >= 12 ? "PM" : "AM"
			return `${displayHour}:${minutes.padStart(2, "0")} ${ampm}`
		}

		// Generate hour and minute options
		const hours = Array.from({ length: 12 }, (_, i) => i + 1)
		const minutes = [0, 15, 30, 45]

		// Handle confirm
		const handleConfirm = () => {
			if (selectedHour === null || selectedMinute === null) return

			let hour24 = selectedHour
			if (selectedPeriod === "PM" && selectedHour !== 12) {
				hour24 = selectedHour + 12
			} else if (selectedPeriod === "AM" && selectedHour === 12) {
				hour24 = 0
			}

			const time24 = `${hour24.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`

			// Check if time is in past
			if (!allowPastTimes && selectedDate) {
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				const selectedDateNormalized = new Date(selectedDate)
				selectedDateNormalized.setHours(0, 0, 0, 0)

				if (selectedDateNormalized.getTime() === today.getTime()) {
					const now = new Date()
					const selectedDateTime = new Date()
					selectedDateTime.setHours(hour24, selectedMinute, 0, 0)

					if (selectedDateTime <= now) {
						// Don't close, time is in past
						return
					}
				}
			}

			onTimeChange?.(time24)
			setOpen(false)
		}

		// Check if a specific time is in past
		const isTimeInPast = (hour: number, minute: number, period: "AM" | "PM") => {
			if (allowPastTimes || !selectedDate) return false

			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const selectedDateNormalized = new Date(selectedDate)
			selectedDateNormalized.setHours(0, 0, 0, 0)

			if (selectedDateNormalized.getTime() !== today.getTime()) {
				return false
			}

			let hour24 = hour
			if (period === "PM" && hour !== 12) hour24 = hour + 12
			else if (period === "AM" && hour === 12) hour24 = 0

			const now = new Date()
			const timeToCheck = new Date()
			timeToCheck.setHours(hour24, minute, 0, 0)

			return timeToCheck <= now
		}

		const canConfirm =
			selectedHour !== null && selectedMinute !== null && !isTimeInPast(selectedHour, selectedMinute, selectedPeriod)

		// Handle manual input confirm
		const handleManualConfirm = () => {
			if (!manualHour || !manualMinute) return

			const hour = Number.parseInt(manualHour)
			if (hour < 1 || hour > 12) return

			const minute = Number.parseInt(manualMinute)
			if (minute < 0 || minute > 59) return

			let hour24 = hour
			if (manualPeriod === "PM" && hour !== 12) {
				hour24 = hour + 12
			} else if (manualPeriod === "AM" && hour === 12) {
				hour24 = 0
			}

			const time24 = `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

			// Check if time is in past
			if (!allowPastTimes && selectedDate) {
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				const selectedDateNormalized = new Date(selectedDate)
				selectedDateNormalized.setHours(0, 0, 0, 0)

				if (selectedDateNormalized.getTime() === today.getTime()) {
					const now = new Date()
					const selectedDateTime = new Date()
					selectedDateTime.setHours(hour24, minute, 0, 0)

					if (selectedDateTime <= now) {
						return
					}
				}
			}

			onTimeChange?.(time24)
			setOpen(false)
		}

		const isManualPastTime = useMemo(() => {
			if (!manualHour || !manualMinute) return false
			const hour = Number.parseInt(manualHour)
			const minute = Number.parseInt(manualMinute)
			if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return false
			return isTimeInPast(hour, minute, manualPeriod)
		}, [manualHour, manualMinute, manualPeriod])

		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full h-12 justify-start text-left text-base",
							!selectedTime && "text-muted-foreground",
							timeError && "border-red-500",
						)}
					>
						<Clock className="mr-3 h-5 w-5" />
						{formatTimeDisplay()}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80 p-3" align="start">
					<div className="space-y-3">
						{/* Header with AM/PM Toggle */}
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-sm">Select Time</h3>
							<div className="flex gap-1">
								<button
									type="button"
									onClick={() => {
										setSelectedPeriod("AM")
										setManualPeriod("AM")
									}}
									className={cn(
										"px-2 py-0.5 rounded text-xs border font-medium transition-colors",
										selectedPeriod === "AM" ? "bg-primary text-primary-foreground" : "hover:bg-accent",
									)}
								>
									AM
								</button>
								<button
									type="button"
									onClick={() => {
										setSelectedPeriod("PM")
										setManualPeriod("PM")
									}}
									className={cn(
										"px-2 py-0.5 rounded text-xs border font-medium transition-colors",
										selectedPeriod === "PM" ? "bg-primary text-primary-foreground" : "hover:bg-accent",
									)}
								>
									PM
								</button>
							</div>
						</div>

						{/* Manual Input */}
						<div className="space-y-1.5">
							<p className="text-xs text-muted-foreground">Enter hour (1-12) and minute (0-59)</p>
							<div className="flex gap-2 items-center">
								<Input
									type="number"
									min="1"
									max="12"
									placeholder="HH"
									value={manualHour}
									onChange={(e) => {
										const val = e.target.value
										if (val === "" || (Number.parseInt(val) >= 1 && Number.parseInt(val) <= 12)) {
											setManualHour(val)
										}
									}}
									className="h-7 text-center text-sm"
								/>
								<span className="font-bold">:</span>
								<Input
									type="number"
									min="0"
									max="59"
									placeholder="MM"
									value={manualMinute}
									onChange={(e) => {
										const val = e.target.value
										if (val === "" || (Number.parseInt(val) >= 0 && Number.parseInt(val) <= 59)) {
											setManualMinute(val)
										}
									}}
									className="h-7 text-center text-sm"
								/>
								<Button
									onClick={handleManualConfirm}
									size="sm"
									disabled={!manualHour || !manualMinute || isManualPastTime}
									className="h-7 px-3 text-xs"
								>
									Set
								</Button>
							</div>
						</div>

						{/* Divider */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">Or Quick Select</span>
							</div>
						</div>

						{/* Hour Grid */}
						<div>
							<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hour</label>
							<div className="grid grid-cols-6 gap-1.5">
								{hours.map((hour) => {
									const isPast = isTimeInPast(hour, selectedMinute || 0, selectedPeriod)
									return (
										<button
											key={hour}
											type="button"
											onClick={() => !isPast && setSelectedHour(hour)}
											disabled={isPast}
											className={cn(
												"h-7 rounded text-xs font-medium transition-colors border",
												selectedHour === hour
													? "bg-primary text-primary-foreground border-primary"
													: "hover:bg-accent hover:border-accent-foreground/20",
												isPast && "opacity-40 cursor-not-allowed hover:bg-transparent",
											)}
										>
											{hour}
										</button>
									)
								})}
							</div>
						</div>

						{/* Minute Grid */}
						<div>
							<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Minute</label>
							<div className="grid grid-cols-4 gap-1.5">
								{minutes.map((minute) => {
									const isPast = isTimeInPast(selectedHour || 12, minute, selectedPeriod)
									return (
										<button
											key={minute}
											type="button"
											onClick={() => !isPast && setSelectedMinute(minute)}
											disabled={isPast}
											className={cn(
												"h-7 rounded text-xs font-medium transition-colors border",
												selectedMinute === minute
													? "bg-primary text-primary-foreground border-primary"
													: "hover:bg-accent hover:border-accent-foreground/20",
												isPast && "opacity-40 cursor-not-allowed hover:bg-transparent",
											)}
										>
											:{minute.toString().padStart(2, "0")}
										</button>
									)
								})}
							</div>
						</div>

						{/* Warnings */}
						{isManualPastTime && (
							<div className="bg-amber-50 border border-amber-200 rounded-md p-2">
								<p className="text-xs text-amber-800 font-medium">
									⚠️ This time has passed. Choose a future time.
								</p>
							</div>
						)}
						{selectedHour !== null && selectedMinute !== null && !canConfirm && (
							<div className="bg-amber-50 border border-amber-200 rounded-md p-2">
								<p className="text-xs text-amber-800 font-medium">
									⚠️ This time has passed. Choose a future time.
								</p>
							</div>
						)}

						{/* Confirm Button */}
						{selectedHour !== null && selectedMinute !== null && (
							<Button onClick={handleConfirm} className="w-full h-7 text-xs" size="sm" disabled={!canConfirm}>
								Confirm {selectedHour}:{selectedMinute.toString().padStart(2, "0")} {selectedPeriod}
							</Button>
						)}
					</div>
				</PopoverContent>
			</Popover>
		)
	}

	// Mobile Time Picker
	const MobileTimePicker = () => {
		// Check if selected time is in the past (only if today is selected)
		const isPastTime = useMemo(() => {
			// Skip validation if allowPastTimes is true
			if (allowPastTimes) return false

			if (!selectedDate || !tempTime) return false

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const selectedDateNormalized = new Date(selectedDate)
			selectedDateNormalized.setHours(0, 0, 0, 0)

			// Only check if today is selected
			if (selectedDateNormalized.getTime() !== today.getTime()) {
				return false
			}

			// Parse tempTime (24-hour format)
			const [hours, minutes] = tempTime.split(":")
			const hourNum = Number.parseInt(hours)
			const minuteNum = Number.parseInt(minutes)

			// Compare with current time
			const now = new Date()
			const selectedDateTime = new Date()
			selectedDateTime.setHours(hourNum, minuteNum, 0, 0)

			return selectedDateTime <= now
		}, [allowPastTimes, selectedDate, tempTime])

		return (
			<Drawer open={timeDrawerOpen} onOpenChange={setTimeDrawerOpen} modal={true}>
				<Button
					variant="outline"
					onClick={() => {
						setTempTime(selectedTime)
						setTimeDrawerOpen(true)
					}}
					className={cn(
						"w-full h-12 justify-start text-left text-base",
						!selectedTime && "text-muted-foreground",
						timeError && "border-red-500",
					)}
				>
					<Clock className="mr-3 h-5 w-5" />
					{formatTimeDisplay(selectedTime)}
				</Button>
				<DrawerContent onOpenAutoFocus={(e) => e.preventDefault()}>
					<DrawerHeader>
						<DrawerTitle>{timeLabel}</DrawerTitle>
					</DrawerHeader>

					{/* Manual Time Input */}
					<div className="px-4 pb-3 space-y-2">
						<label className="text-sm font-medium text-gray-700">Enter time manually</label>
						<div className="relative">
							{!tempTime && (
								<div className="absolute inset-0 flex items-center px-3 pointer-events-none text-muted-foreground text-base z-10 bg-background">
									Tap to select time
								</div>
							)}
							<Input
								type="time"
								value={tempTime || ""}
								onChange={(e) => handleTimeInputChange(e.target.value)}
								className={cn(
									"bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-base h-12",
									!tempTime && "text-transparent [&::-webkit-datetime-edit]:text-transparent",
								)}
							/>
						</div>
						{tempTime && <p className="text-sm text-green-600">Selected: {formatTimeDisplay(tempTime)}</p>}
					</div>

					{/* Quick Selection */}
					<div className="px-4">
						<label className="text-sm font-medium text-gray-700">Or select from common times</label>
					</div>
					<ScrollArea className="h-60 px-4">
						<div className="space-y-1 pb-4 pt-2">
							{generateTimeOptions().map((time) => (
								<Button
									key={time}
									variant={tempTime === time ? "default" : "ghost"}
									className="w-full justify-start text-left text-base h-11"
									onClick={() => handleTimeSelect(time)}
								>
									{formatTimeDisplay(time)}
								</Button>
							))}
						</div>
					</ScrollArea>

					{/* Warning for past time */}
					{isPastTime && (
						<div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-md p-3">
							<p className="text-sm text-amber-800 font-medium">
								⚠️ Selected time has already passed. Please choose a future time.
							</p>
						</div>
					)}

					<DrawerFooter>
						<Button onClick={confirmTimeSelection} disabled={!tempTime || isPastTime}>
							Confirm
						</Button>
						<DrawerClose asChild>
							<Button variant="outline">Cancel</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		)
	}

	return (
		<div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-5", className)}>
			{/* Date Picker */}
			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-3">{dateLabel}</label>
				{isMobile ? <MobileDatePicker /> : <DesktopDatePicker />}
				{dateError && <p className="text-red-500 text-sm mt-1 font-medium">{dateError}</p>}
			</div>

			{/* Time Picker */}
			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-3">{timeLabel}</label>
				{isMobile ? <MobileTimePicker /> : <DesktopTimePicker />}
				{timeError && <p className="text-red-500 text-sm mt-1 font-medium">{timeError}</p>}
			</div>
		</div>
	)
}

