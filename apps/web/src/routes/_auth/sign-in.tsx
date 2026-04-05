import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Clock, Shield, Star } from "lucide-react";
import { z } from "zod";
import placeholder from "@/assets/placeholder.svg";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/features/auth/_components/sign-in-form";
import { SydneyImageCover } from "@/features/auth/_components/sydney-image-cover";
import { redirectIfAuthenticated } from "@/utils/auth";

const signInSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/sign-in")({
	validateSearch: signInSearchSchema,
	beforeLoad: async ({ search, context }) => {
		await redirectIfAuthenticated({
			redirectUrl: search.redirect,
			queryClient: context.queryClient,
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			{/* Left Panel - Sign In Form */}
			<div className="flex flex-col gap-8 bg-beige p-6 md:p-10">
				{/* Header */}
				<div className="flex items-center justify-between">
					<Link to="/" className="group flex items-center gap-3 font-medium">
						<Logo />
						<div className="hidden md:block">
							<h2 className="font-bold text-foreground text-lg transition-colors group-hover:text-primary">
								Utos & Co.
							</h2>
							<p className="text-muted-foreground text-xs">
								Sydney's Premier Luxury Service
							</p>
						</div>
					</Link>
					<div className="text-center text-muted-foreground text-xs md:text-sm">
						Don&apos;t have an account?{" "}
						<Link
							to="/sign-up"
							className="font-semibold text-primary transition-colors hover:text-primary/80"
						>
							Sign up
						</Link>
					</div>
				</div>

				{/* Welcome Section */}
				<div className="space-y-4 text-center">
					<div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 font-medium text-primary text-xs md:text-sm">
						<Car className="mr-2 h-4 w-4" />
						Welcome Back
					</div>
					<h1 className="font-bold text-2xl text-foreground md:text-3xl">
						Sign in to your account
					</h1>
					<p className="text-muted-foreground text-sm md:text-base">
						Access your luxury chauffeur bookings and account preferences
					</p>
				</div>

				{/* Form Section */}
				<div className="flex flex-1 items-start justify-center">
					<div className="w-full max-w-md">
						<SignInForm className="rounded-lg border border-border bg-card p-6 md:p-8" />
					</div>
				</div>

				{/* Footer */}
				<div className="border-border/30 border-t pt-4 text-center text-muted-foreground text-xs">
					<p>© 2024 Utos & Co. Premium luxury transportation in Sydney.</p>
					<div className="mt-2 flex justify-center gap-4">
						<Link
							to="/privacy"
							className="transition-colors hover:text-primary"
						>
							Privacy
						</Link>
						<Link
							to="/terms-and-conditions"
							className="transition-colors hover:text-primary"
						>
							Terms
						</Link>
						<Link
							to="/contact-us"
							className="transition-colors hover:text-primary"
						>
							Support
						</Link>
					</div>
				</div>
			</div>

			{/* Right Panel - Image */}
			<div className="relative hidden bg-gradient-to-br from-foreground to-primary/20 lg:block">
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
				<div className="absolute top-8 left-8 z-10 text-beige">
					<h3 className="mb-2 font-bold text-2xl">Utos & Co.</h3>
					<p className="text-beige/80 text-sm">
						Sydney's Premier Luxury Transportation
					</p>
				</div>
				<SydneyImageCover className="absolute inset-0 h-full w-full object-cover opacity-60" />

				{/* Bottom testimonial */}
				<div className="absolute right-8 bottom-8 left-8 z-10 text-beige">
					<div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
						<div className="mb-3 flex items-center gap-1">
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									className="h-4 w-4 fill-primary-secondary text-primary-secondary"
								/>
							))}
						</div>
						<p className="mb-3 text-sm leading-relaxed">
							"Exceptional service and luxury vehicles. The professional
							chauffeurs make every journey a premium experience."
						</p>
						<p className="font-medium text-beige/70 text-xs">
							— Client Name Here
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
