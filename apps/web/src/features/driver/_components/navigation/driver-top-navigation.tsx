import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
	ChevronsLeft,
	ClipboardListIcon,
	LogOutIcon,
	MenuIcon,
	XIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Logo } from "@/components/logo";
import { BUSINESS_INFO } from "@/constants/business-info";
import { DriverUserMenu } from "./driver-user-menu";

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
	mobileMenuContent,
}: DriverTopNavigationProps) {
	return (
		<div className="sticky top-0 z-10 border-gray-200 border-b bg-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Mobile Menu Button - Moved to Left */}
						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="lg:hidden">
									<MenuIcon className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="flex h-full w-full flex-col p-0 sm:w-80 [&>button]:hidden"
							>
								{/* Fixed Header */}
								<div className="flex-shrink-0 border-b p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<Logo />
											<div className="ml-2">
												<h2 className="font-semibold text-lg">Driver Portal</h2>
											</div>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setIsMobileMenuOpen(false)}
											className="rounded-lg p-2 hover:bg-gray-100"
										>
											<ChevronsLeft className="h-5 w-5 text-gray-600" />
										</Button>
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
						<div className="hidden items-center space-x-3 lg:flex">
							{needsOnboarding && (
								<Badge
									variant="outline"
									className="border-blue-300 bg-blue-100 text-blue-800"
								>
									<ClipboardListIcon className="mr-1 h-3 w-3" />
									Complete Profile
								</Badge>
							)}
						</div>

						{/* Desktop User Menu */}
						<div className="hidden items-center space-x-3 lg:flex">
							<DriverUserMenu />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
