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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusIcon, Loader2, Check, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCreateCarBrandMutation } from "@/features/dashboard/car-management/hooks/brands/queries/use-create-car-brand-mutation"
import { useDebounce } from "@uidotdev/usehooks"
import { useCheckCarBrandMutation } from "@/features/dashboard/car-management/hooks/brands/queries/use-check-car-brand-mutation"

const FormSchema = z.object({
	name: z.string().min(1, "Brand name is required").max(50, "Brand name must be less than 50 characters"),
})

type FormValues = z.infer<typeof FormSchema>

export function AddBrandDialog() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [nameAvailability, setNameAvailability] = useState<boolean | null>(null)
	const mutation = useCreateCarBrandMutation()
	const checkNameMutation = useCheckCarBrandMutation()

	const form = useForm<FormValues>({
		disabled: mutation.isPending,
		defaultValues: {
			name: "",
		},
	})

	const debouncedCheckName = useDebounce(form.watch("name"), 300)
	const formRef = useRef(form)
	const checkNameMutationRef = useRef(checkNameMutation)

	formRef.current = form
	checkNameMutationRef.current = checkNameMutation

	useEffect(() => {
		if (debouncedCheckName && debouncedCheckName.length > 0) {
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
			formRef.current.clearErrors("name")
			setNameAvailability(null)
		}
	}, [debouncedCheckName])

	const handleReset = () => {
		form.reset()
		setNameAvailability(null)
	}

	const handleSubmit = (data: FormValues) => {
		mutation.mutate(FormSchema.parse(data), {
			onSuccess: () => {
				handleReset()
				setIsDialogOpen(false)
			},
		})
	}

	const getValidationIcon = () => {
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
				<Button>
					<PlusIcon className="w-4 h-4" />
					Add Brand
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader >
					<DialogTitle>Add New Brand</DialogTitle>
					<DialogDescription>Enter the name of the new car brand.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<div>
							<FormField
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Brand Name</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													placeholder="Enter brand name"
													className="pr-8"
													{...field}
												/>
												<div className="absolute right-2 top-1/2 -translate-y-1/2">{getValidationIcon()}</div>
											</div>
										</FormControl>
										<FormMessage />
										{getValidationMessage()}
									</FormItem>
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
								{mutation.isPending ? "Adding..." : "Add Brand"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

