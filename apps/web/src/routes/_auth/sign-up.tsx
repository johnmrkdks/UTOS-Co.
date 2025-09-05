import { Logo } from "@/components/logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import placeholder from "@/assets/placeholder.svg";
import { SydneyImageCover } from "@/features/auth/_components/sydney-image-cover";
import SignUpForm from "@/features/auth/_components/sign-up-form";
import { Car, Shield, Star, Clock, Users } from "lucide-react";
import { z } from "zod";

const signUpSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/sign-up")({
	validateSearch: signUpSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			{/* Left Panel - Sign Up Form */}
			<div className="bg-beige flex flex-col gap-8 p-6 md:p-10">
				{/* Header */}
				<div className="flex justify-between items-center">
					<Link to="/" className="flex items-center gap-3 font-medium group">
						<Logo />
						<div className="hidden md:block">
							<h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
								Down Under Chauffeur
							</h2>
							<p className="text-xs text-muted-foreground">
								Sydney's Premier Luxury Service
							</p>
						</div>
					</Link>
					<div className="text-center text-xs md:text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link to="/sign-in" className="text-primary font-semibold hover:text-primary/80 transition-colors">
							Sign in
						</Link>
					</div>
				</div>

				{/* Welcome Section */}
				<div className="text-center space-y-4">
					<div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium">
						<Users className="w-4 h-4 mr-2" />
						Join Our Premium Service
					</div>
					<h1 className="text-2xl md:text-3xl font-bold text-foreground">
						Create your account
					</h1>
					<p className="text-sm md:text-base text-muted-foreground">
						Join thousands of satisfied clients who trust us for luxury transportation
					</p>
				</div>

				{/* Form Section */}
				<div className="flex flex-1 items-start justify-center">
					<div className="w-full max-w-md">
						<SignUpForm className="bg-card p-6 md:p-8 rounded-lg border border-border" />
					</div>
				</div>

				{/* Footer */}
				<div className="text-center text-xs text-muted-foreground border-t border-border/30 pt-4">
					<p>© 2024 Down Under Chauffeur. Premium luxury transportation in Sydney.</p>
					<div className="flex justify-center gap-4 mt-2">
						<Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
						<Link to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</Link>
						<Link to="/contact-us" className="hover:text-primary transition-colors">Support</Link>
					</div>
				</div>
			</div>

			{/* Right Panel - Image */}
			<div className="bg-gradient-to-br from-foreground to-primary/20 relative hidden lg:block">
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
				<div className="absolute top-8 left-8 text-beige z-10">
					<h3 className="text-2xl font-bold mb-2">Down Under Chauffeur</h3>
					<p className="text-beige/80 text-sm">Sydney's Premier Luxury Transportation</p>
				</div>
				<SydneyImageCover className="absolute inset-0 h-full w-full object-cover opacity-60" />

				{/* Statistics */}
				<div className="absolute bottom-8 left-8 right-8 text-beige z-10">
					<div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
						<h4 className="text-lg font-bold mb-4">Join Our Premium Community</h4>
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<div className="text-2xl font-bold text-primary-secondary">1000+</div>
								<div className="text-xs text-beige/70">Happy Clients</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-primary-secondary">5.0</div>
								<div className="text-xs text-beige/70">Star Rating</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-primary-secondary">15+</div>
								<div className="text-xs text-beige/70">Luxury Vehicles</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
