import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Construction, FileText, Shield } from "lucide-react";

type PrivacyPolicyProps = {
	className?: string;
};

export function PrivacyPolicy({ className, ...props }: PrivacyPolicyProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-foreground via-foreground/90 to-primary/20 py-24">
				<div className="absolute inset-0 bg-foreground/70" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<div className="mx-auto max-w-4xl">
						<div className="mb-6 inline-flex items-center rounded-full bg-beige px-4 py-2 font-medium text-foreground text-sm">
							<Shield className="mr-2 h-4 w-4" />
							Privacy & Data Protection
						</div>

						<h1 className="mb-6 font-bold text-5xl text-beige lg:text-6xl">
							Privacy
							<span className="block text-primary">Policy</span>
						</h1>

						<p className="mx-auto max-w-3xl text-beige/80 text-xl leading-relaxed">
							Your privacy is important to us. This page will contain our
							comprehensive privacy policy.
						</p>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="bg-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mx-auto max-w-4xl">
						{/* Coming Soon Notice */}
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<Construction className="h-10 w-10 text-primary" />
							</div>

							<h2 className="mb-4 font-bold text-3xl text-card-foreground">
								Privacy Policy - To Be Added
							</h2>

							<p className="mb-8 text-lg text-muted-foreground leading-relaxed">
								We are currently working on our comprehensive privacy policy.
								This will include detailed information about:
							</p>

							<div className="mb-8 grid gap-6 md:grid-cols-2">
								<div className="text-left">
									<h3 className="mb-3 flex items-center font-semibold text-card-foreground">
										<FileText className="mr-2 h-5 w-5 text-primary" />
										What We'll Cover
									</h3>
									<ul className="space-y-2 text-muted-foreground">
										<li>• Data collection practices</li>
										<li>• How we use your information</li>
										<li>• Data storage and security</li>
										<li>• Your privacy rights</li>
									</ul>
								</div>

								<div className="text-left">
									<h3 className="mb-3 flex items-center font-semibold text-card-foreground">
										<Shield className="mr-2 h-5 w-5 text-primary" />
										Your Protection
									</h3>
									<ul className="space-y-2 text-muted-foreground">
										<li>• Cookie usage policies</li>
										<li>• Third-party services</li>
										<li>• Contact information</li>
										<li>• Policy updates</li>
									</ul>
								</div>
							</div>

							<div className="rounded-xl border border-border bg-soft-beige p-6">
								<p className="mb-4 text-muted-foreground">
									In the meantime, if you have any questions about how we handle
									your data, please don't hesitate to contact us.
								</p>

								<Link to="/contact-us">
									<Button
										size="lg"
										className="rounded-xl bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
									>
										Contact Us
									</Button>
								</Link>
							</div>
						</div>

						{/* Legal Footer */}
						<div className="mt-12 text-center text-muted-foreground text-sm">
							<p>© 2024 Down Under Chauffeurs. All rights reserved.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
