import { Logo } from "@/components/logo";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import placeholder from "@/assets/placeholder.svg";
import { SydneyImageCover } from "@/features/auth/components/sydney-image-cover";

export const Route = createFileRoute("/_auth/sign-up")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="bg-beige flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-between gap-2">
					<Link to="/" className="flex items-center gap-2 font-medium">
						<Logo />
					</Link>
					<div className="text-center text-sm">
						Already have an account?{" "}
						<Link to="/sign-in" className="text-primary font-medium">
							Sign in
						</Link>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<SignUpForm />
					</div>
				</div>
			</div>

			<div className="bg-muted relative hidden lg:block">
				<div className="absolute top-4 left-4 text-black text-lg font-bold z-10">
					Down Under Chauffeurs
				</div>
				<SydneyImageCover className="absolute inset-0 h-full w-full object-cover" />
			</div>
		</div>
	);
}
