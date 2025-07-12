import { AddNewPackageModal } from "./packages/components/add-new-package/add-new-package-modal";
import { useModalProvider } from "./hooks/use-modal-provider";

export function ModalProviders() {
	const { shouldShowModal } = useModalProvider();

	return <>{shouldShowModal("dashboard") && <AddNewPackageModal />}</>;
}
