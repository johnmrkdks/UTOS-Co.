import { and, like, eq, SQL, type AnyColumn } from "drizzle-orm";
import type { FilterBuilder } from "./query-builder";

export class DefaultFilterBuilder<T = any> implements FilterBuilder<T> {
	constructor(private table: T) { }

	build(filters: Record<string, string>): SQL<unknown>[] {
		const conditions: SQL<unknown>[] = [];

		for (const [key, value] of Object.entries(filters)) {
			if (value && this.table[key as keyof T]) {
				const column = this.table[key as keyof T] as AnyColumn;
				
				// Use exact match for specific fields that need precise filtering
				if (key === 'userId' || key === 'id' || key.endsWith('Id')) {
					conditions.push(eq(column, value));
				} else {
					// Use LIKE for text search fields
					conditions.push(like(column, `%${value}%`));
				}
			}
		}

		return conditions;
	}
}

// Special filter builder for RQB queries that works with object filters
export class RQBFilterBuilder<T = any> implements FilterBuilder<T> {
	constructor(private table: T) { }

	build(filters: Record<string, string>): any {
		// For RQB, we need to return a function that Drizzle can use in the where clause
		const conditions: SQL<unknown>[] = [];

		for (const [key, value] of Object.entries(filters)) {
			if (value && this.table[key as keyof T]) {
				const column = this.table[key as keyof T] as AnyColumn;
				
				// Use exact match for specific fields that need precise filtering
				if (key === 'userId' || key === 'id' || key.endsWith('Id')) {
					conditions.push(eq(column, value));
				} else {
					// Use LIKE for text search fields
					conditions.push(like(column, `%${value}%`));
				}
			}
		}

		// Return a function that combines all conditions with AND
		return conditions.length > 0 ? (table: any) => and(...conditions) : undefined;
	}
}

export class CustomFilterBuilder implements FilterBuilder {
	constructor(private filterMap: Record<string, (value: string) => SQL<unknown>>) { }

	build(filters: Record<string, string>): SQL<unknown>[] {
		const conditions: SQL<unknown>[] = [];

		for (const [key, value] of Object.entries(filters)) {
			if (value && this.filterMap[key]) {
				conditions.push(this.filterMap[key](value));
			}
		}

		return conditions;
	}
}
