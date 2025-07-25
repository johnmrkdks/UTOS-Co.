import placeholder from "@/assets/placeholder.svg";
import { Logo } from "@/components/logo";
import { SignInForm } from "@/features/auth/_components/sign-in-form";
import { SydneyImageCover } from "@/features/auth/_components/sydney-image-cover";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			<div className="bg-beige flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-between gap-2">
					<Link to="/" className="flex items-center gap-2 font-medium">
						<Logo />
					</Link>
					<div className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link to="/sign-up" className="text-primary font-medium">
							Sign up
						</Link>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<SignInForm />
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
