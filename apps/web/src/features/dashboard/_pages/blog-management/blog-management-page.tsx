import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	ImagePlus,
	Loader2,
	Pencil,
	Plus,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { RouterOutputs } from "server/trpc/routers/_app";
import { toast } from "sonner";
import { z } from "zod";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useProxyUploadMutation } from "@/hooks/query/file/use-proxy-upload-mutation";
import { trpc } from "@/trpc";

const imageUrlString = z
	.string()
	.min(1)
	.refine(
		(s) => {
			try {
				new URL(s);
				return true;
			} catch {
				return false;
			}
		},
		{ message: "Each image must be a valid URL" },
	);

const postFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	excerpt: z.string().min(1, "Description is required"),
	imageUrls: z
		.array(imageUrlString)
		.min(1, "Add at least one image (upload or paste a link)"),
	slug: z.string().optional(),
	published: z.boolean(),
	sortOrder: z.number().int(),
});

type PostFormValues = z.infer<typeof postFormSchema>;
type BlogPostRow = RouterOutputs["blogPosts"]["adminList"][number];

function openNativeFilePicker(input: HTMLInputElement) {
	try {
		if (typeof input.showPicker === "function") {
			void input.showPicker();
			return;
		}
	} catch {
		// showPicker can throw outside a user gesture or in unsupported cases
	}
	input.click();
}

export function BlogManagementPage() {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [linkDraft, setLinkDraft] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<BlogPostRow | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<BlogPostRow | null>(null);

	const listQuery = useQuery(trpc.blogPosts.adminList.queryOptions());

	const proxyUpload = useProxyUploadMutation();

	const form = useForm<PostFormValues>({
		resolver: zodResolver(postFormSchema),
		defaultValues: {
			title: "",
			excerpt: "",
			imageUrls: [] as string[],
			slug: "",
			published: true,
			sortOrder: 0,
		},
	});

	const formControl = form.control as never;
	const watchedImageUrls = useWatch({
		control: form.control,
		name: "imageUrls",
	});
	// biome-ignore lint/suspicious/noExplicitAny: duplicate react-hook-form package resolutions
	const formForSpread = form as any;

	const createMutation = useMutation(
		trpc.blogPosts.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.blogPosts.adminList.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.blogPosts.listPublished.queryKey(),
				});
				toast.success("Post created");
				setDialogOpen(false);
				form.reset();
			},
			onError: (e) => {
				toast.error(e.message);
			},
		}),
	);

	const updateMutation = useMutation(
		trpc.blogPosts.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.blogPosts.adminList.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.blogPosts.listPublished.queryKey(),
				});
				toast.success("Post updated");
				setDialogOpen(false);
				setEditing(null);
				form.reset();
			},
			onError: (e) => {
				toast.error(e.message);
			},
		}),
	);

	const deleteMutation = useMutation(
		trpc.blogPosts.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.blogPosts.adminList.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.blogPosts.listPublished.queryKey(),
				});
				toast.success("Post deleted");
				setDeleteTarget(null);
			},
			onError: (e) => {
				toast.error(e.message);
			},
		}),
	);

	const openCreate = () => {
		setEditing(null);
		form.reset({
			title: "",
			excerpt: "",
			imageUrls: [],
			slug: "",
			published: true,
			sortOrder: 0,
		});
		setDialogOpen(true);
	};

	const openEdit = (row: BlogPostRow) => {
		setEditing(row);
		form.reset({
			title: row.title,
			excerpt: row.excerpt,
			imageUrls:
				row.imageUrls?.length > 0
					? [...row.imageUrls]
					: row.imageUrl
						? [row.imageUrl]
						: [],
			slug: row.slug,
			published: row.published,
			sortOrder: row.sortOrder,
		});
		setDialogOpen(true);
	};

	const onSubmit = (values: PostFormValues) => {
		if (editing) {
			updateMutation.mutate({
				id: editing.id,
				title: values.title,
				excerpt: values.excerpt,
				imageUrls: values.imageUrls,
				slug: values.slug?.trim() || undefined,
				published: values.published,
				sortOrder: values.sortOrder,
			});
		} else {
			createMutation.mutate({
				title: values.title,
				excerpt: values.excerpt,
				imageUrls: values.imageUrls,
				slug: values.slug?.trim() || undefined,
				published: values.published,
				sortOrder: values.sortOrder,
			});
		}
	};

	const appendImageUrls = (urls: string[]) => {
		if (urls.length === 0) return;
		const base = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ?? "";
		const normalized = urls.map((u) => {
			const t = u.trim();
			if (!t) return t;
			if (/^https?:\/\//i.test(t)) return t;
			if (t.startsWith("/") && base) return `${base}${t}`;
			return t;
		});
		const current = form.getValues("imageUrls") ?? [];
		form.setValue("imageUrls", [...current, ...normalized], {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const removeImageAt = (index: number) => {
		const current = [...(form.getValues("imageUrls") ?? [])];
		current.splice(index, 1);
		form.setValue("imageUrls", current, { shouldValidate: true });
	};

	const handlePickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";
		if (!files.length) return;
		try {
			const uploads = await Promise.all(
				files.map((file) =>
					proxyUpload.mutateAsync({
						entityType: "blog",
						file,
					}),
				),
			);
			appendImageUrls(uploads.map((u) => u.imageUrl));
			const ok = await form.trigger("imageUrls");
			if (!ok) {
				const msg =
					form.getFieldState("imageUrls", form.formState).error?.message ??
					"Image URL could not be saved";
				toast.error(msg);
				return;
			}
			toast.success(
				uploads.length === 1
					? "Image uploaded"
					: `${uploads.length} images uploaded`,
			);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Upload failed";
			console.error("[blog image upload]", err);
			toast.error(message);
		}
	};

	const addLinkFromDraft = () => {
		const raw = linkDraft.trim();
		if (!raw) return;
		if (!/^https?:\/\//i.test(raw)) {
			toast.error("URL must start with http:// or https://");
			return;
		}
		try {
			new URL(raw);
		} catch {
			toast.error("Enter a valid image URL");
			return;
		}
		appendImageUrls([raw]);
		setLinkDraft("");
	};

	const busy =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending ||
		proxyUpload.isPending;

	const rows = listQuery.data ?? [];

	return (
		<div className="py-8">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="font-semibold text-2xl text-foreground tracking-tight">
						Blog
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Add one or more images (upload or paste links) and a short
						description. Posts appear on the public blog when published.
					</p>
				</div>
				<Button
					type="button"
					size="sm"
					className="gap-1.5 self-start sm:self-auto"
					onClick={openCreate}
				>
					<Plus className="h-4 w-4" />
					New post
				</Button>
			</div>

			{listQuery.isLoading ? (
				<div className="flex justify-center py-16">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border/60">
					<table className="w-full min-w-[640px] text-left text-sm">
						<thead className="border-border/60 border-b bg-muted/40">
							<tr>
								<th className="px-3 py-2 font-medium">Image</th>
								<th className="px-3 py-2 font-medium">Title</th>
								<th className="px-3 py-2 font-medium">Published</th>
								<th className="px-3 py-2 font-medium">Order</th>
								<th className="px-3 py-2 text-right font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr
									key={row.id}
									className="border-border/40 border-b last:border-0"
								>
									<td className="px-3 py-2">
										<div className="h-12 w-16 overflow-hidden rounded-md border border-border/50 bg-muted/30">
											<img
												src={row.imageUrls?.[0] ?? row.imageUrl}
												alt=""
												className="h-full w-full object-cover"
											/>
										</div>
									</td>
									<td className="max-w-[320px] px-3 py-2">
										<div className="font-medium text-foreground">
											{row.title}
										</div>
										<div className="truncate text-muted-foreground text-xs">
											{row.excerpt}
										</div>
									</td>
									<td className="px-3 py-2 text-muted-foreground">
										{row.published ? "Yes" : "No"}
									</td>
									<td className="px-3 py-2 text-muted-foreground tabular-nums">
										{row.sortOrder}
									</td>
									<td className="px-3 py-2 text-right">
										<div className="flex justify-end gap-1">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => openEdit(row)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:text-destructive"
												onClick={() => setDeleteTarget(row)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{rows.length === 0 ? (
						<p className="px-3 py-8 text-center text-muted-foreground text-sm">
							No posts yet. Create one to show on the marketing site.
						</p>
					) : null}
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editing ? "Edit post" : "New post"}</DialogTitle>
					</DialogHeader>
					<Form {...formForSpread}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={formControl}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Post title" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formControl}
								name="excerpt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												rows={4}
												placeholder="Short description shown on the blog grid"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formControl}
								name="imageUrls"
								render={() => {
									const urls = watchedImageUrls ?? [];
									return (
										<FormItem>
											<FormLabel>Images</FormLabel>
											<p className="mb-2 text-muted-foreground text-xs">
												Upload multiple files and/or paste image URLs. The first
												image is used as the cover on the blog grid.
											</p>
											{urls.length > 0 ? (
												<div className="mb-3 flex flex-wrap gap-2">
													{urls.map((url, idx) => (
														<div
															key={`${url}-${idx}`}
															className="group relative h-20 w-28 overflow-hidden rounded-md border border-border/60 bg-muted/30"
														>
															<img
																src={url}
																alt=""
																className="h-full w-full object-cover"
															/>
															<button
																type="button"
																className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
																onClick={() => removeImageAt(idx)}
																aria-label="Remove image"
															>
																<X className="h-5 w-5 text-destructive" />
															</button>
														</div>
													))}
												</div>
											) : null}
											<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
												<input
													ref={fileInputRef}
													type="file"
													accept="image/jpeg,image/png,image/webp,image/gif"
													multiple
													disabled={busy}
													className="sr-only"
													aria-label="Choose images to upload"
													onChange={handlePickFiles}
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="w-fit gap-1.5"
													disabled={busy}
													onClick={() => {
														const el = fileInputRef.current;
														if (!el) return;
														openNativeFilePicker(el);
													}}
												>
													<Upload className="h-4 w-4" />
													Upload images
												</Button>
												<div className="flex min-w-0 flex-1 gap-2">
													<Input
														value={linkDraft}
														onChange={(e) => setLinkDraft(e.target.value)}
														placeholder="Or paste image URL…"
														onKeyDown={(e) => {
															if (e.key === "Enter") {
																e.preventDefault();
																addLinkFromDraft();
															}
														}}
													/>
													<Button
														type="button"
														variant="secondary"
														size="sm"
														className="shrink-0"
														onClick={addLinkFromDraft}
														disabled={busy || !linkDraft.trim()}
													>
														<ImagePlus className="h-4 w-4" />
														Add
													</Button>
												</div>
											</div>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
							<FormField
								control={formControl}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Slug (optional)</FormLabel>
										<FormControl>
											<Input {...field} placeholder="url-friendly-slug" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid gap-4 sm:grid-cols-2">
								<FormField
									control={formControl}
									name="published"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-3">
											<div className="space-y-0.5">
												<FormLabel className="text-base">Published</FormLabel>
												<p className="text-muted-foreground text-xs">
													Visible on /blogs
												</p>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={formControl}
									name="sortOrder"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sort order</FormLabel>
											<FormControl>
												<Input
													type="number"
													{...field}
													onChange={(e) =>
														field.onChange(e.target.valueAsNumber)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<DialogFooter className="gap-2 sm:gap-0">
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}
									disabled={busy}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={busy}>
									{busy ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saving…
										</>
									) : editing ? (
										"Save changes"
									) : (
										"Create"
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<DeleteConfirmationDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				onConfirm={() => {
					if (deleteTarget) {
						deleteMutation.mutate({ id: deleteTarget.id });
					}
				}}
				itemName={deleteTarget?.title ?? "this post"}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}
