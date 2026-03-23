import { useModal } from "@/hooks/use-modal";
import { DeleteCarModal } from "../_components/modals/delete-car-modal";
import { EditCarModal } from "../_components/modals/edit-car-modal";

export function CarManagementModalProviders() {
	const { isModalOpen } = useModal();

	return (
		<>
			{isModalOpen("edit-car") && <EditCarModal />}
			{isModalOpen("delete-car") && <DeleteCarModal />}
		</>
	);
}
