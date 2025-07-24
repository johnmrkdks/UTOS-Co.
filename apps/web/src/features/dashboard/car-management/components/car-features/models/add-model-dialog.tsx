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
import { useDebounce } from "@uidotdev/usehooks"
import { useCheckCarModelMutation } from "@/features/dashboard/car-management/hooks/models/queries/use-check-car-model-mutation"
import { useCreateCarModelMutation } from "@/features/dashboard/car-management/hooks/models/queries/use-create-car-model-mutation"
import { useGetCarBrandsQuery } from "@/features/dashboard/car-management/hooks/brands/queries/use-get-car-brands-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FormSchema = z.object({
	name: z.string().min(1, "Model name is required").max(50, "Model name must be less than 50 characters"),
	brandId: z.string().min(1, "Brand id is required"),
	year: z.coerce.number().min(1900).max(new Date().getFullYear())
})

type FormValues = z.infer<typeof FormSchema>

export function AddModelDialog() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [nameAvailability, setNameAvailability] = useState<boolean | null>(null)
	const { data: brands, isLoading: isBrandsLoading } = useGetCarBrandsQuery();
	const mutation = useCreateCarModelMutation();
	const checkNameMutation = useCheckCarModelMutation();

	const form = useForm<FormValues>({
		disabled: mutation.isPending,
		defaultValues: {
			name: "",
			brandId: "",
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
					Model name is available
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
					Add Model
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader >
					<DialogTitle>Add New Model</DialogTitle>
					<DialogDescription>Enter the name of the new car model.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="brandId"
								render={({ field }) => (
									<FormItem className="w-96">
										<FormLabel>Brand</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="w-60" disabled={isBrandsLoading}>
													<SelectValue placeholder="Select brand" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{
													brands?.data?.map(brand => (
														<SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
													))
												}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-2">
								<FormField
									name="name"
									render={({ field }) => (
										<FormItem className="flex flex-col items-start">
											<FormLabel>Model Name</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="Enter model name"
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

								<FormField
									name="year"
									render={({ field }) => (
										<FormItem className="flex flex-col items-start">
											<FormLabel>Model Year</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type="number"
														placeholder="Enter year"
														className="pr-8"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
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
									!form.formState.isValid ||
									!form.formState.isDirty ||
									!!form.formState.errors.name ||
									checkNameMutation.isPending ||
									mutation.isPending ||
									nameAvailability === false
								}
								loading={mutation.isPending}
							>
								{mutation.isPending ? "Adding..." : "Add Model"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

