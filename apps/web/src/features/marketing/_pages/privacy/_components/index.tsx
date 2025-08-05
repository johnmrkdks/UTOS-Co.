import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import {
	Shield,
	FileText,
	Construction
} from "lucide-react";

type PrivacyPolicyProps = {
	className?: string;
};

export function PrivacyPolicy({ className, ...props }: PrivacyPolicyProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-gradient-to-br from-foreground via-foreground/90 to-primary/20">
				<div className="absolute inset-0 bg-foreground/70" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-beige text-foreground rounded-full text-sm font-medium mb-6">
							<Shield className="w-4 h-4 mr-2" />
							Privacy & Data Protection
						</div>

						<h1 className="text-5xl lg:text-6xl font-bold text-beige mb-6">
							Privacy
							<span className="block text-primary">
								Policy
							</span>
						</h1>

						<p className="text-xl text-beige/80 leading-relaxed max-w-3xl mx-auto">
							Your privacy is important to us. This page will contain our comprehensive privacy policy.
						</p>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="py-24 bg-beige">
				<div className="container mx-auto px-6">
					<div className="max-w-4xl mx-auto">
						
						{/* Coming Soon Notice */}
						<div className="bg-card p-12 rounded-2xl shadow-lg border border-border text-center">
							<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
								<Construction className="w-10 h-10 text-primary" />
							</div>
							
							<h2 className="text-3xl font-bold text-card-foreground mb-4">
								Privacy Policy - To Be Added
							</h2>
							
							<p className="text-lg text-muted-foreground mb-8 leading-relaxed">
								We are currently working on our comprehensive privacy policy. This will include detailed information about:
							</p>

							<div className="grid md:grid-cols-2 gap-6 mb-8">
								<div className="text-left">
									<h3 className="font-semibold text-card-foreground mb-3 flex items-center">
										<FileText className="w-5 h-5 text-primary mr-2" />
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
									<h3 className="font-semibold text-card-foreground mb-3 flex items-center">
										<Shield className="w-5 h-5 text-primary mr-2" />
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

							<div className="bg-soft-beige p-6 rounded-xl border border-border">
								<p className="text-muted-foreground mb-4">
									In the meantime, if you have any questions about how we handle your data, please don't hesitate to contact us.
								</p>
								
								<Link to="/contact-us">
									<Button
										size="lg"
										className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
									>
										Contact Us
									</Button>
								</Link>
							</div>
						</div>

						{/* Legal Footer */}
						<div className="mt-12 text-center text-sm text-muted-foreground">
							<p>© 2024 Down Under Chauffeurs. All rights reserved.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}