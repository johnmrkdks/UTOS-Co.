import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

export interface ModalState {
	isOpen: boolean;
	data?: any;
	type?: string;
}

interface ModalContextType {
	modalState: ModalState;
	openModal: (type: string, data?: any) => void;
	closeModal: () => void;
	isModalOpen: (type: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
	const [modalState, setModalState] = useState<ModalState>({
		isOpen: false,
		data: undefined,
		type: undefined,
	});

	const openModal = (type: string, data?: any) => {
		setModalState({
			isOpen: true,
			data,
			type,
		});
	};

	const closeModal = () => {
		setModalState({
			isOpen: false,
			data: undefined,
			type: undefined,
		});
	};

	const isModalOpen = (type: string) => {
		return modalState.isOpen && modalState.type === type;
	};

	return (
		<ModalContext.Provider
			value={{
				modalState,
				openModal,
				closeModal,
				isModalOpen,
			}}
		>
			{children}
		</ModalContext.Provider>
	);
}

export function useModal() {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
}
