import { Button } from "@/components/ui/button";
import { companyIcons } from "../utils/icon";

export function SignInWithOAuth() {
	return (
		<div>
			<Button variant="outline" className="px-2.5 py-3.5">
				<img src={companyIcons.google} alt="Google" className="h-4 w-4" />
			</Button>
		</div>
	);
}
