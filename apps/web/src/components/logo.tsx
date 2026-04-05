import { cn } from "@workspace/ui/lib/utils";
import logo from "@/assets/utos-logo.png";

type LogoProps = {
	className?: string;
};

export function Logo({ className }: LogoProps) {
	return (
		<img
			src={logo}
			alt="UTOS & Co. Australia"
			className={cn(
				"h-11 max-h-14 w-auto max-w-[min(100%,240px)] object-contain object-left md:h-14 md:max-h-16",
				className,
			)}
		/>
	);
}
