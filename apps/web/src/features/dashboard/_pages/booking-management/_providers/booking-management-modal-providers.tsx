import type { ReactNode } from "react";

interface BookingManagementModalProvidersProps {
	children: ReactNode;
}

export function BookingManagementModalProviders({
	children,
}: BookingManagementModalProvidersProps) {
	return <>{children}</>;
}
