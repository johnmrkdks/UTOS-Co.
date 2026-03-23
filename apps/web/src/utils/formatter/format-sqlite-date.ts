import { format, type Locale, parse, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

type FormatSQLiteDateOptions = {
	formatString?: string; // date-fns format string (e.g., 'PP', 'yyyy-MM-dd')
	inputFormat?: string; // Input format for non-ISO dates (e.g., 'yyyy-MM-dd HH:mm:ss')
	referenceDate?: Date; // Reference date for parsing
	locale?: Locale; // date-fns locale object for localized output
};

/**
 * Formats a SQLite date string using date-fns with customizable options.
 * @param sqliteDate - SQLite date string (e.g., '2025-07-24' or '2025-07-24 16:40:00')
 * @param options - Formatting options
 * @returns Formatted date string
 * @throws Error if date string is invalid or cannot be parsed
 */
export function formatSQLiteDate(
	sqliteDate: string | undefined | null,
	options: FormatSQLiteDateOptions = {},
): string {
	if (!sqliteDate) return "";

	try {
		const {
			formatString = "PP", // Default to 'Jul 24, 2025'
			inputFormat,
			referenceDate = new Date(),
			locale = enUS,
		} = options;

		// Handle empty or invalid input
		if (!sqliteDate || typeof sqliteDate !== "string") {
			throw new Error("Invalid SQLite date string");
		}

		let parsedDate: Date;

		// Parse the date based on input format
		if (inputFormat) {
			// Custom input format (e.g., 'yyyy-MM-dd HH:mm:ss')
			parsedDate = parse(sqliteDate, inputFormat, referenceDate);
		} else {
			// Assume ISO-like format; handle SQLite's common 'YYYY-MM-DD HH:MM:SS'
			const isoCompatible = sqliteDate.replace(" ", "T");
			parsedDate = parseISO(isoCompatible);
		}

		// Validate parsed date
		if (isNaN(parsedDate.getTime())) {
			throw new Error("Failed to parse SQLite date");
		}

		// Format the date with the specified format and locale
		return format(parsedDate, formatString, { locale });
	} catch (error) {
		throw new Error(
			`Error formatting SQLite date: ${(error as Error).message}`,
		);
	}
}
