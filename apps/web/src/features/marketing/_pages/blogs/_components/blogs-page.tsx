import { useQuery } from "@tanstack/react-query";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2 } from "lucide-react";
import type { RouterOutputs } from "server/trpc/routers/_app";
import { BlogPostImageCarousel } from "@/features/marketing/_pages/blogs/_components/blog-post-image-carousel";
import { trpc } from "@/trpc";

type PublishedPost = RouterOutputs["blogPosts"]["listPublished"][number];

type BlogsPageProps = {
	className?: string;
};

export function BlogsPage({ className }: BlogsPageProps) {
	const { data: posts, isLoading } = useQuery(
		trpc.blogPosts.listPublished.queryOptions(),
	);

	return (
		<div className={cn("bg-background", className)}>
			<div className="border-border/60 border-b bg-muted/15">
				<div className="container mx-auto px-6 py-14 md:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h1 className="mb-3 font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
							Blog
						</h1>
						<p className="text-base text-muted-foreground leading-relaxed md:text-lg">
							Stories, updates, and insights from Utos &amp; Co.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-6 py-12 md:py-16">
				{isLoading ? (
					<div className="flex justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : !posts?.length ? (
					<p className="text-center text-muted-foreground">
						New posts will appear here soon.
					</p>
				) : (
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{posts.map((post: PublishedPost) => (
							<article
								key={post.id}
								className="overflow-hidden rounded-xl border border-border/60 bg-card"
							>
								<div className="border-border/40 border-b bg-muted/30">
									<BlogPostImageCarousel
										imageUrls={post.imageUrls}
										fallbackUrl={post.imageUrl}
									/>
								</div>
								<div className="p-5">
									<h2 className="mb-2 font-semibold text-card-foreground text-lg leading-snug">
										{post.title}
									</h2>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{post.excerpt}
									</p>
								</div>
							</article>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
