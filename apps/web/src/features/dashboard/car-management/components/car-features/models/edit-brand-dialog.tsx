import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Check, X, SquarePenIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useDebounce } from "@uidotdev/usehooks"
import { useUpdateCarBrandMutation } from "@/features/dashboard/car-management/hooks/brands/queries/use-update-car-brand-mutation"
import { useCheckCarBrandMutation } from "@/features/dashboard/car-management/hooks/brands/queries/use-check-car-brand-mutation"
import type { CarBrand } from "server/types"

type EditBrandDialogProps = {
	brand: CarBrand
}

const FormSchema = z.object({
	name: z.string().min(1, "Brand name is required").max(50, "Brand name must be less than 50 characters"),
})

type FormValues = z.infer<typeof FormSchema>

export function EditBrandDialog({ brand }: EditBrandDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [nameAvailability, setNameAvailability] = useState<boolean | null>(null)
	const mutation = useUpdateCarBrandMutation()
	const checkNameMutation = useCheckCarBrandMutation()

	const form = useForm<FormValues>({
		defaultValues: {
			name: brand.name
		},
	})

	// Reset form when value changes
	useEffect(() => {
		form.reset({
			name: brand.name,
		});
	}, [brand, form]);

	const debouncedCheckName = useDebounce(form.watch("name"), 300)
	const formRef = useRef(form)
	const checkNameMutationRef = useRef(checkNameMutation)

	formRef.current = form
	checkNameMutationRef.current = checkNameMutation

	useEffect(() => {
		// Only check availability if the name is different from the original brand name
		if (debouncedCheckName &&
			debouncedCheckName.length > 0 &&
			debouncedCheckName !== brand.name) {

			setNameAvailability(null);

			checkNameMutationRef.current.mutate({
				name: debouncedCheckName
			}, {
				onSuccess: (isAvailable) => {
					setNameAvailability(isAvailable!)
					if (!isAvailable) {
						formRef.current.setError("name", {
							type: "manual",
							message: "This brand name already exists.",
						})
					} else {
						formRef.current.clearErrors("name")
					}
				},
				onError: () => {
					setNameAvailability(null)
				},
			})
		} else {
			// Clear errors and set availability to null if it's the original name or empty
			formRef.current.clearErrors("name")
			setNameAvailability(null)
		}
	}, [debouncedCheckName, brand.name])

	const handleReset = () => {
		form.reset()
		setNameAvailability(null)
	}

	const handleSubmit = (data: FormValues) => {
		mutation.mutate({
			id: brand.id,
			data
		}, {
			onSuccess: () => {
				handleReset()
				setIsDialogOpen(false)
			},
		})
	}

	const getValidationIcon = () => {
		// Don't show validation icons if it's the same as the original name
		if (debouncedCheckName === brand.name) {
			return null
		}

		if (checkNameMutation.isPending && debouncedCheckName) {
			return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
		}

		if (nameAvailability === true && debouncedCheckName) {
			return <Check className="h-4 w-4 text-green-500" />
		}

		if (nameAvailability === false && debouncedCheckName) {
			return <X className="h-4 w-4 text-red-500" />
		}

		return null
	}

	const getValidationMessage = () => {
		// Don't show validation messages if it's the same as the original name
		if (debouncedCheckName === brand.name) {
			return null
		}

		if (checkNameMutation.isPending && debouncedCheckName) {
			return (
				<div className="flex items-center gap-1 text-sm text-muted-foreground">
					<Loader2 className="h-3 w-3 animate-spin" />
					Checking availability...
				</div>
			)
		}

		if (nameAvailability === true && debouncedCheckName && !form.formState.errors.name) {
			return (
				<div className="flex items-center gap-1 text-sm text-green-600">
					<Check className="h-3 w-3" />
					Brand name is available
				</div>
			)
		}

		return null
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<SquarePenIcon className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader >
					<DialogTitle>Edit Brand</DialogTitle>
					<DialogDescription>
						Enter the name of the car brand.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<div>
							<FormField
								name="name"
								render={({ field }) => (
									<div className="grid gap-2">
										<FormLabel>Brand Name</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													disabled={mutation.isPending}
													placeholder="Enter brand name"
													className="pr-8"
													{...field}
												/>
												<div className="absolute right-2 top-1/2 -translate-y-1/2">{getValidationIcon()}</div>
											</div>
										</FormControl>
										<FormMessage />
										{getValidationMessage()}
									</div>
								)}
							/>
						</div>
						<DialogFooter>
							<DialogClose>
								<Button
									type="button"
									variant="ghost"
									onClick={handleReset}
								>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={
									!form.formState.isDirty ||
									mutation.isPending ||
									checkNameMutation.isPending ||
									!!form.formState.errors.name ||
									nameAvailability === false
								}
								loading={mutation.isPending}
							>
								{mutation.isPending ? "Updating..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
