import { useModalProvider } from "@/features/dashboard/_hooks/use-modal-provider";
import { AddNewPackageModal } from "@/features/dashboard/_pages/packages/_components/add-new-package/add-new-package-modal";

export function CarManagementModalProviders() {
	const { shouldShowModal } = useModalProvider();

	return <>{shouldShowModal("dashboard") && <AddNewPackageModal />}</>;
}
