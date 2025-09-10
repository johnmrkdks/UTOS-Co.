import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { Logo } from "@/components/logo";
import {
	MenuIcon,
	XIcon,
	LogOutIcon,
	ClipboardListIcon
} from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";
import { DriverUserMenu } from "./driver-user-menu";
import { BrandLogo } from "@/components/brand-logo";

interface DriverTopNavigationProps {
	session: any;
	needsOnboarding: boolean;
	isMobileMenuOpen: boolean;
	setIsMobileMenuOpen: (open: boolean) => void;
	onSignOut: () => void;
	mobileMenuContent: React.ReactNode;
}

export function DriverTopNavigation({
	session,
	needsOnboarding,
	isMobileMenuOpen,
	setIsMobileMenuOpen,
	onSignOut,
	mobileMenuContent
}: DriverTopNavigationProps) {
	return (
		<div className="sticky top-0 z-10 bg-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center gap-2">
						{/* Mobile Menu Button - Moved to Left */}
						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="lg:hidden">
									<MenuIcon className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-full sm:w-80 p-0 flex flex-col h-full">
								{/* Fixed Header */}
								<div className="p-4 border-b flex-shrink-0">
									<div className="flex items-center">
										<Logo />
										<div className="ml-2">
											<h2 className="text-lg font-semibold">Driver Portal</h2>
										</div>
									</div>
								</div>

								{/* Mobile Menu Content */}
								{mobileMenuContent}
							</SheetContent>
						</Sheet>
						
						<BrandLogo />
					</div>

					{/* Right side - Status Indicators and User Info */}
					<div className="flex items-center space-x-2 sm:space-x-4">
						{/* Status Indicators - Hidden on mobile, shown on larger screens */}
						<div className="hidden lg:flex items-center space-x-3">
							{needsOnboarding && (
								<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
									<ClipboardListIcon className="h-3 w-3 mr-1" />
									Complete Profile
								</Badge>
							)}
						</div>

						{/* Desktop User Menu */}
						<div className="hidden lg:flex items-center space-x-3">
							<DriverUserMenu />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
