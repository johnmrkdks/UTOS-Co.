# tRPC Patterns

Follow consistent naming conventions and implementation patterns:

## File Naming
- **Queries**: `use-get-[entity]-query.ts`
- **Mutations**: `use-create-[entity]-mutation.ts`, `use-update-[entity]-mutation.ts`, `use-delete-[entity]-mutation.ts`

## Query Implementation Pattern
```typescript
// ✅ Correct Query Pattern
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarsQuery = (params: ResourceList) => {
	return useQuery(trpc.cars.list.queryOptions(params));
};
```

## Mutation Implementation Pattern
```typescript
// ✅ Correct Mutation Pattern
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.cars.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.cars.list.queryKey() });
			toast.success(`Car ${data?.name} added`);
		},
		onError: (error) => {
			toast.error("Error while adding car", {
				description: error.message,
			});
		},
	}));
};
```

## Manual Query Execution Pattern
```typescript
// ✅ For executing queries manually within mutations (e.g., instant quote calculation)
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCalculateInstantQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: any) => {
			// Manual query execution using queryClient.fetchQuery
			return await queryClient.fetchQuery(
				trpc.bookings.calculateInstantQuote.queryOptions(input)
			);
		},
		onSuccess: (data) => {
			toast.success("Quote Calculated", {
				description: `Total fare: $${(data?.totalAmount ? (data.totalAmount / 100).toFixed(2) : '0.00')}`,
			});
		},
		onError: (error) => {
			console.error("Error calculating quote:", error);
			toast.error("Failed to calculate quote", {
				description: "Please try again or check your addresses.",
			});
		},
	});
};
```

## Custom Mutation with Conditional Logic
```typescript
// ✅ For complex mutations requiring conditional endpoint selection
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useCustomMutation = () => {
	const utils = trpc.useUtils();

	return useMutation({
		mutationFn: async (input: any) => {
			if (input.condition) {
				return await utils.endpoint.specificAction.mutate(input);
			} else {
				return await utils.endpoint.generalAction.mutate(input);
			}
		},
		onSuccess: (data) => { /* handle success */ },
		onError: (error) => { /* handle error */ },
	});
};
```

## Key Patterns
- **Use `trpc.endpoint.queryOptions(params)`** for queries
- **Use `trpc.endpoint.mutationOptions({...})`** for simple mutations
- **Use `queryClient.fetchQuery(trpc.endpoint.queryOptions(input))`** for manual query execution within mutations
- **Use `trpc.useUtils()` + custom `mutationFn`** for complex conditional mutations
- **Always invalidate related queries** after successful mutations
- **Use toast notifications** for success/error feedback
- **Include proper TypeScript types** from server/types
- **Handle undefined data** with optional chaining (`data?.property`) and fallback values

## Advanced Patterns

### Query with Conditional Parameters
```typescript
// ✅ Query that adapts based on parameters
export const useGetAvailableCarsQuery = (filters?: CarFilters) => {
	return useQuery(
		trpc.cars.listPublished.queryOptions({
			limit: 50,
			...filters
		})
	);
};
```

### Mutation with Query Invalidation
```typescript
// ✅ Mutation that invalidates multiple related queries
export const useCreateBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.create.mutationOptions({
		onSuccess: (data) => {
			// Invalidate multiple related queries
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.cars.listPublished.queryKey() });

			toast.success(`Booking ${data?.id} created successfully`);
		},
		onError: (error) => {
			toast.error("Failed to create booking", {
				description: error.message,
			});
		},
	}));
};
```

## Common Mistakes to Avoid
```typescript
// ❌ Don't use useMutation hooks inside other hooks
const mutation1 = trpc.endpoint.useMutation(); // Wrong!
const mutation2 = trpc.endpoint.useMutation(); // Wrong!

// ❌ Don't call .mutate() directly on trpc client in component
trpc.endpoint.mutate(data); // Wrong!

// ❌ Don't mix TanStack Query with tRPC hooks incorrectly
return useMutation(trpc.endpoint.useMutation()); // Wrong!

// ❌ Don't use incorrect utils patterns
const utils = trpc.useUtils();
return await utils.fetch(); // Wrong! - utils.fetch() doesn't exist

// ❌ Don't forget to handle undefined data in success callbacks
onSuccess: (data) => {
	toast.success(`Total: $${data.totalAmount / 100}`); // Wrong! - data might be undefined
}

// ✅ Always handle potential undefined data
onSuccess: (data) => {
	toast.success(`Total: $${data?.totalAmount ? (data.totalAmount / 100).toFixed(2) : '0.00'}`);
}
```

## Error Debugging Tips
- **`contextMap[utilName] is not a function`**: Usually indicates incorrect tRPC pattern usage. Use `queryClient.fetchQuery()` for manual queries
- **`data is possibly undefined`**: Add optional chaining (`?.`) and fallback values in success callbacks
- **`Cannot read property of undefined`**: Ensure proper null/undefined checks before accessing nested properties