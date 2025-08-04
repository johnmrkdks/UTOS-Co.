import { Button } from "@workspace/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import type { PopoverContentProps } from "@radix-ui/react-popover";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";

// DateSegment component
const DateSegment = React.memo(
	React.forwardRef<HTMLInputElement, DateSegmentProps>(
		(
			{ value, onValueChange, type, min, max, className, disabled, ...props },
			ref,
		) => {
			const [localValue, setLocalValue] = React.useState(() =>
				value !== undefined
					? value.toString().padStart(type === "year" ? 4 : 2, "0")
					: "",
			);
			const [focused, setFocused] = React.useState(false);
			const inputRef = React.useRef<HTMLInputElement>(null);

			React.useImperativeHandle(ref, () => inputRef.current!);

			// Sync localValue with value prop, including undefined case
			React.useEffect(() => {
				if (!focused) {
					if (value !== undefined) {
						setLocalValue(
							value.toString().padStart(type === "year" ? 4 : 2, "0"),
						);
					} else {
						setLocalValue(""); // Explicitly clear when value is undefined
					}
				}
			}, [value, focused, type]);

			const moveToNextSegment = () => {
				let nextElement = inputRef.current?.parentElement?.nextElementSibling;
				while (nextElement && !nextElement.querySelector("input")) {
					nextElement = nextElement.nextElementSibling;
				}
				const nextInput = nextElement?.querySelector("input");
				if (nextInput instanceof HTMLInputElement) {
					nextInput.focus();
					nextInput.select();
				}
			};

			const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
				const newValue = e.target.value.replace(/\D/g, "");
				const maxLength = type === "year" ? 4 : 2;

				if (newValue.length > maxLength) return;

				const numValue =
					newValue === "" ? Number.NaN : Number.parseInt(newValue, 10);
				const isComplete = newValue.length === maxLength;
				const isValidRange =
					isNaN(numValue) || (numValue >= min && numValue <= max);

				if (
					type !== "year" ||
					newValue === "" ||
					(isComplete && isValidRange) ||
					!isComplete
				) {
					setLocalValue(newValue);

					if (newValue === "") {
						onValueChange(undefined);
					} else if (isValidRange && (type !== "year" || isComplete)) {
						onValueChange(numValue);
						if (newValue.length === maxLength) {
							moveToNextSegment();
						}
					}
				}
			};

			const handleBlur = () => {
				setFocused(false);
				if (localValue) {
					const numValue = Number.parseInt(localValue, 10);
					if (numValue >= min && numValue <= max) {
						// Always pad to 2 digits for month/day, 4 for year
						const paddedValue = numValue
							.toString()
							.padStart(type === "year" ? 4 : 2, "0");
						setLocalValue(paddedValue);
						onValueChange(numValue);
					} else {
						setLocalValue("");
						onValueChange(undefined);
					}
				} else {
					onValueChange(undefined);
				}
			};

			const handleFocus = () => {
				setFocused(true);
				// Keep padding on focus for consistency; only update if needed
				if (localValue && Number.parseInt(localValue, 10) !== value) {
					setLocalValue(
						value !== undefined
							? value.toString().padStart(type === "year" ? 4 : 2, "0")
							: "",
					);
				}
			};

			const width = type === "year" ? 40 : 24;

			return (
				<input
					ref={inputRef}
					type="text"
					inputMode="numeric"
					value={localValue}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					className={cn(
						"w-full rounded bg-transparent text-center outline-none",
						focused ? "bg-accent text-accent-foreground" : "",
						className,
					)}
					style={{ width: `${width}px` }}
					maxLength={type === "year" ? 4 : 2}
					aria-label={type}
					placeholder={props.placeholder}
					disabled={disabled}
					{...props}
				/>
			);
		},
	),
);
DateSegment.displayName = "DateSegment";

// DateSegmentLiteral (memoized)
const DateSegmentLiteral = React.memo(
	({ children }: { children: React.ReactNode }) => {
		return <span className="text-muted-foreground">{children}</span>;
	},
);
DateSegmentLiteral.displayName = "DateSegmentLiteral";

// Calendar Component (memoized)
const Calendar = React.memo(
	({
		selectedDate,
		onSelect,
		minYear = 2015,
		maxYear,
	}: {
		selectedDate?: Date;
		onSelect: (date: Date) => void;
		minYear?: number;
		maxYear?: number;
	}) => {
		// Use the provided maxYear or default to today's year
		const effectiveMaxYear = maxYear ?? new Date().getFullYear();

		const today = React.useMemo(() => {
			return new Date(); // Keep current time
		}, []);

		const [viewDate, setViewDate] = React.useState(() => {
			if (selectedDate && !isNaN(selectedDate.getTime())) {
				if (selectedDate.getFullYear() > effectiveMaxYear) {
					return new Date(effectiveMaxYear, 11, 31);
				}
				return selectedDate;
			}
			return today;
		});

		const [isMonthSelectOpen, setIsMonthSelectOpen] = React.useState(false);
		const [isYearSelectOpen, setIsYearSelectOpen] = React.useState(false);

		const months = React.useMemo(
			() => [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			],
			[],
		);

		const years = React.useMemo(() => {
			return Array.from(
				{ length: effectiveMaxYear - minYear + 1 },
				(_, i) => minYear + i,
			);
		}, [minYear, effectiveMaxYear]);

		const getDaysInMonth = (date: Date) =>
			new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

		const getFirstDayOfMonth = (date: Date) =>
			new Date(date.getFullYear(), date.getMonth(), 1).getDay();

		const isInFuture = (date: Date) => {
			// Check if date is beyond the max allowed year
			if (date.getFullYear() > effectiveMaxYear) return true;

			// If it's the max year, check if it's beyond today (only if max year is current year)
			if (
				date.getFullYear() === effectiveMaxYear &&
				effectiveMaxYear === today.getFullYear()
			) {
				return date > today;
			}

			return false;
		};

		const isCurrentMonthAndYearAtMax = () => {
			if (viewDate.getFullYear() < effectiveMaxYear) return false;

			if (effectiveMaxYear === today.getFullYear()) {
				return (
					viewDate.getMonth() === today.getMonth() &&
					viewDate.getFullYear() === today.getFullYear()
				);
			}

			return (
				viewDate.getMonth() === 11 &&
				viewDate.getFullYear() === effectiveMaxYear
			);
		};

		const handlePrevMonth = () =>
			setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));

		const handleNextMonth = () => {
			const nextMonth = new Date(
				viewDate.getFullYear(),
				viewDate.getMonth() + 1,
			);

			// Check if next month is within allowed range
			if (
				nextMonth.getFullYear() < effectiveMaxYear ||
				(nextMonth.getFullYear() === effectiveMaxYear &&
					nextMonth.getMonth() <=
					(effectiveMaxYear === today.getFullYear() ? today.getMonth() : 11))
			) {
				setViewDate(nextMonth);
			}
		};

		const handleMonthChange = (month: string) => {
			const monthIndex = months.indexOf(month);

			// Check if selected month is valid for the current view year
			if (
				viewDate.getFullYear() === effectiveMaxYear &&
				effectiveMaxYear === today.getFullYear() &&
				monthIndex > today.getMonth()
			) {
				setViewDate(new Date(viewDate.getFullYear(), today.getMonth()));
			} else {
				setViewDate(new Date(viewDate.getFullYear(), monthIndex));
			}

			setIsMonthSelectOpen(false);
		};

		const handleYearChange = (year: string) => {
			const yearValue = Number.parseInt(year);

			// If selecting max year and it's current year, ensure month is valid
			if (
				yearValue === effectiveMaxYear &&
				effectiveMaxYear === today.getFullYear() &&
				viewDate.getMonth() > today.getMonth()
			) {
				setViewDate(new Date(yearValue, today.getMonth()));
			} else {
				setViewDate(new Date(yearValue, viewDate.getMonth()));
			}

			setIsYearSelectOpen(false);
		};

		const handleDateSelect = (day: number) => {
			const now = new Date(); // Capture current time
			const newDate = new Date(
				viewDate.getFullYear(),
				viewDate.getMonth(),
				day,
				now.getHours(),
				now.getMinutes(),
				now.getSeconds(),
				now.getMilliseconds(),
			);
			if (!isInFuture(newDate)) onSelect(newDate);
		};

		const handleToday = () => {
			const now = new Date(); // Use current time
			setViewDate(now);
			onSelect(now);
		};

		const daysInMonth = getDaysInMonth(viewDate);
		const firstDay = getFirstDayOfMonth(viewDate);
		const prevMonthDays = new Date(
			viewDate.getFullYear(),
			viewDate.getMonth(),
			0,
		).getDate();

		const days = React.useMemo(() => {
			const result: any[] = [];

			// Previous month days
			for (let i = firstDay - 1; i >= 0; i--) {
				result.push({
					day: prevMonthDays - i,
					isCurrentMonth: false,
					isPrevMonth: true,
				});
			}

			// Current month days
			for (let i = 1; i <= daysInMonth; i++) {
				const currentDate = new Date(
					viewDate.getFullYear(),
					viewDate.getMonth(),
					i,
				);
				const isFutureDate = isInFuture(currentDate);

				result.push({
					day: i,
					isCurrentMonth: true,
					isSelected:
						selectedDate?.getDate() === i &&
						selectedDate?.getMonth() === viewDate.getMonth() &&
						selectedDate?.getFullYear() === viewDate.getFullYear(),
					isToday:
						today.getDate() === i &&
						today.getMonth() === viewDate.getMonth() &&
						today.getFullYear() === viewDate.getFullYear(),
					isDisabled: isFutureDate,
				});
			}

			// Next month days
			const remainingDays = 42 - result.length;
			for (let i = 1; i <= remainingDays; i++) {
				result.push({ day: i, isCurrentMonth: false, isNextMonth: true });
			}

			return result;
		}, [viewDate, selectedDate, today, daysInMonth, firstDay, prevMonthDays]);

		const availableMonths = React.useMemo(() => {
			if (viewDate.getFullYear() < effectiveMaxYear) {
				return months;
			}

			if (effectiveMaxYear === today.getFullYear()) {
				return months.filter((_, index) => index <= today.getMonth());
			}

			return months;
		}, [months, viewDate, today, effectiveMaxYear]);

		return (
			<div className="p-3 bg-popover text-popover-foreground">
				<div className="flex items-center justify-between mb-4">
					<div className="flex gap-2">
						<Select
							value={months[viewDate.getMonth()]}
							onValueChange={handleMonthChange}
							open={isMonthSelectOpen}
							onOpenChange={setIsMonthSelectOpen}
						>
							<SelectTrigger className="w-[120px]">
								<SelectValue>{months[viewDate.getMonth()]}</SelectValue>
							</SelectTrigger>
							<SelectContent className="overflow-y-auto">
								{availableMonths.map((month) => (
									<SelectItem key={month} value={month}>
										{month}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={viewDate.getFullYear().toString()}
							onValueChange={handleYearChange}
							open={isYearSelectOpen}
							onOpenChange={setIsYearSelectOpen}
						>
							<SelectTrigger className="w-[100px]">
								<SelectValue>{viewDate.getFullYear()}</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{years.map((year) => (
									<SelectItem key={year} value={year.toString()}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid grid-cols-7 gap-1 mb-2">
					{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
						<div
							key={day}
							className="text-center text-sm text-muted-foreground"
						>
							{day}
						</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-1">
					{days.map((day, index) => (
						<button
							type="button"
							key={index}
							onClick={() =>
								day.isCurrentMonth &&
								!day.isDisabled &&
								handleDateSelect(day.day)
							}
							className={cn(
								"h-8 w-8 text-center rounded-full text-sm",
								"hover:bg-accent hover:text-accent-foreground",
								"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
								day.isSelected &&
								"bg-primary text-primary-foreground hover:bg-primary",
								!day.isCurrentMonth && "text-muted-foreground opacity-50",
								day.isToday && !day.isSelected && "border border-border",
								day.isDisabled &&
								"opacity-50 cursor-not-allowed hover:bg-transparent",
							)}
							disabled={!day.isCurrentMonth || day.isDisabled}
						>
							{day.day}
						</button>
					))}
				</div>
				<div className="mt-4 flex justify-between items-center">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleToday}
						className="text-xs"
					>
						Today
					</Button>
					<div className="flex gap-1">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handlePrevMonth}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleNextMonth}
							disabled={isCurrentMonthAndYearAtMax()}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		);
	},
);
Calendar.displayName = "Calendar";

export type DateInputProps = Omit<
	React.HTMLAttributes<HTMLDivElement>,
	"onChange"
> & {
	value?: Date | undefined;
	onDateChange?: (date: Date | undefined) => void;
	disabled?: boolean;
	error?: boolean;
	minYear?: number;
	maxYear?: number;
	isDateLabeled?: boolean;
	popoverContentProps?: PopoverContentProps;
	editable?: boolean;
};

const DateInput = React.forwardRef<HTMLDivElement, DateInputProps>(
	(
		{
			className,
			value,
			onDateChange,
			disabled,
			error,
			minYear = 2015,
			maxYear,
			isDateLabeled = false,
			popoverContentProps,
			editable = true,
			...props
		},
		ref,
	) => {
		const effectiveMaxYear = maxYear ?? new Date().getFullYear();

		const today = React.useMemo(() => {
			return new Date(); // Keep current time, no reset to midnight
		}, []);

		const [internalState, setInternalState] = React.useState({
			month: value?.getMonth() !== undefined ? value.getMonth() + 1 : undefined,
			day: value?.getDate(),
			year: value?.getFullYear(),
			errorMessage: null as string | null,
		});

		React.useEffect(() => {
			if (!value) {
				if (
					internalState.month !== undefined ||
					internalState.day !== undefined ||
					internalState.year !== undefined
				) {
					setInternalState({
						month: undefined,
						day: undefined,
						year: undefined,
						errorMessage: null,
					});
				}
				return;
			}

			const newMonth = value.getMonth() + 1;
			const newDay = value.getDate();
			const newYear = value.getFullYear();

			if (
				internalState.month !== newMonth ||
				internalState.day !== newDay ||
				internalState.year !== newYear
			) {
				setInternalState({
					month: newMonth,
					day: newDay,
					year: newYear,
					errorMessage: null,
				});
			}
		}, [value]);

		const handleSegmentChange = (
			segment: "month" | "day" | "year",
			newValue: number | undefined,
		) => {
			setInternalState((prev) => {
				const newState = { ...prev, [segment]: newValue };

				if (
					newState.month !== undefined &&
					newState.day !== undefined &&
					newState.year !== undefined &&
					onDateChange
				) {
					const now = new Date(); // Capture current time
					const newDate = new Date(
						newState.year,
						newState.month - 1,
						newState.day,
						now.getHours(),
						now.getMinutes(),
						now.getSeconds(),
						now.getMilliseconds(),
					);
					const lastDayOfMonth = new Date(
						newState.year,
						newState.month,
						0,
					).getDate();

					if (isNaN(newDate.getTime())) {
						return { ...newState, errorMessage: "Invalid date" };
					}
					if (newState.day > lastDayOfMonth) {
						return {
							...newState,
							errorMessage: `This month has only ${lastDayOfMonth} days`,
						};
					}
					if (
						newState.year === effectiveMaxYear &&
						effectiveMaxYear === today.getFullYear() &&
						newDate > today
					) {
						return {
							...newState,
							errorMessage: "Date cannot be in the future",
						};
					}
					if (newState.year > effectiveMaxYear) {
						return {
							...newState,
							errorMessage: `Year cannot be after ${effectiveMaxYear}`,
						};
					}

					onDateChange(newDate);
					return { ...newState, errorMessage: null };
				} else if (onDateChange) {
					if (!newState.month && !newState.day && !newState.year) {
						onDateChange(undefined);
					}
				}

				return newState;
			});
		};

		const handleClear = () => {
			setInternalState({
				month: undefined,
				day: undefined,
				year: undefined,
				errorMessage: null,
			});
			if (onDateChange) {
				onDateChange(undefined);
			}
		};

		const handleCalendarSelect = (date: Date) => {
			const now = new Date(); // Capture current time
			const newDate = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
				now.getHours(),
				now.getMinutes(),
				now.getSeconds(),
				now.getMilliseconds(),
			);
			setInternalState({
				month: newDate.getMonth() + 1,
				day: newDate.getDate(),
				year: newDate.getFullYear(),
				errorMessage: null,
			});
			if (onDateChange) {
				onDateChange(newDate);
			}
		};

		const { month, day, year, errorMessage } = internalState;
		const isFilled =
			month !== undefined && day !== undefined && year !== undefined;

		return (
			<div className="space-y-1">
				<div
					ref={ref}
					className={cn(
						"flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring relative",
						disabled && "cursor-not-allowed opacity-50",
						(error || errorMessage) &&
						"border-destructive focus-within:ring-destructive",
						className,
					)}
					{...props}
				>
					<DateSegment
						value={month}
						onValueChange={(value) => handleSegmentChange("month", value)}
						type="month"
						min={1}
						max={12}
						disabled={disabled || !editable}
						placeholder="mm"
					/>
					<DateSegmentLiteral>/</DateSegmentLiteral>
					<DateSegment
						value={day}
						onValueChange={(value) => handleSegmentChange("day", value)}
						type="day"
						min={1}
						max={31}
						disabled={disabled || !editable}
						placeholder="dd"
					/>
					<DateSegmentLiteral>/</DateSegmentLiteral>
					<DateSegment
						value={year}
						onValueChange={(value) => handleSegmentChange("year", value)}
						type="year"
						min={minYear}
						max={effectiveMaxYear}
						disabled={disabled || !editable}
						placeholder="yyyy"
					/>
					<div className="flex gap-1 ml-auto">
						{isFilled && !disabled && editable && (
							<button
								type="button"
								className="h-4 w-4 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
								onClick={handleClear}
								aria-label="Clear date"
							>
								<X className="h-3 w-3" />
							</button>
						)}
						{editable && (
							<Popover modal>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
										disabled={disabled}
									>
										<CalendarIcon className="h-3 w-3" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="end"
									sideOffset={4}
									{...popoverContentProps}
								>
									<Calendar
										selectedDate={
											month !== undefined &&
												day !== undefined &&
												year !== undefined
												? new Date(year, month - 1, day)
												: undefined
										}
										onSelect={handleCalendarSelect}
										minYear={minYear}
										maxYear={effectiveMaxYear}
									/>
								</PopoverContent>
							</Popover>
						)}
					</div>
				</div>
				{isDateLabeled && isFilled && (
					<div className="text-xs italic text-muted-foreground mt-4">
						{new Date(year!, month! - 1, day!).toLocaleDateString("en-PH", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</div>
				)}
				{errorMessage && (
					<div className="text-xs text-destructive">{errorMessage}</div>
				)}
			</div>
		);
	},
);
DateInput.displayName = "DateInput";

export { DateInput };

interface DateSegmentProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	value: number | undefined;
	onValueChange: (value: number | undefined) => void;
	type: "day" | "month" | "year";
	min: number;
	max: number;
}
