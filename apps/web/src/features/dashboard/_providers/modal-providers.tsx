import { useModalProvider } from "@/features/dashboard/_hooks/use-modal-provider";
import { AddNewPackageModal } from "@/features/dashboard/_pages/packages/_components/add-new-package/add-new-package-modal";
import { CreatePricingConfigDialog } from "@/features/dashboard/_pages/pricing-config/_components/create-pricing-config-dialog";

export function ModalProviders() {
	const { shouldShowModal } = useModalProvider();

	return (
		<>
			{shouldShowModal("dashboard") && <AddNewPackageModal />}
			{/* Enhanced pricing config dialog with auto-naming and publication management features */}
			<CreatePricingConfigDialog />
		</>
	);
}
