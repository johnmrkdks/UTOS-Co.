import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";

export function InputPassword({
	className,
	...props
}: React.ComponentProps<"input">) {
	const id = useId();
	const [isVisible, setIsVisible] = useState<boolean>(false);

	const toggleVisibility = () => setIsVisible((prevState) => !prevState);

	return (
		<div className="bg-transparent *:not-first:mt-2">
			<div className="relative">
				<Input
					id={id}
					className={cn("pe-9", className)}
					placeholder="Password"
					type={isVisible ? "text" : "password"}
					{...props}
				/>
				<button
					className="absolute inset-y-0 end-0 flex h-full w-9 cursor-pointer items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					type="button"
					onClick={toggleVisibility}
					aria-label={isVisible ? "Hide password" : "Show password"}
					aria-pressed={isVisible}
					aria-controls="password"
				>
					{isVisible ? (
						<EyeOffIcon size={16} aria-hidden="true" />
					) : (
						<EyeIcon size={16} aria-hidden="true" />
					)}
				</button>
			</div>
		</div>
	);
}
