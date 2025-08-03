import { create } from "zustand";

interface BookingManagementModalState {
	isCreatePackageBookingDialogOpen: boolean;
	isCreateCustomBookingDialogOpen: boolean;
	isBookingDetailsDialogOpen: boolean;
	selectedBookingId: string | null;
	
	openCreatePackageBookingDialog: () => void;
	closeCreatePackageBookingDialog: () => void;
	
	openCreateCustomBookingDialog: () => void;
	closeCreateCustomBookingDialog: () => void;
	
	openBookingDetailsDialog: (bookingId: string) => void;
	closeBookingDetailsDialog: () => void;
}

export const useBookingManagementModalProvider = create<BookingManagementModalState>((set) => ({
	isCreatePackageBookingDialogOpen: false,
	isCreateCustomBookingDialogOpen: false,
	isBookingDetailsDialogOpen: false,
	selectedBookingId: null,
	
	openCreatePackageBookingDialog: () => set({ isCreatePackageBookingDialogOpen: true }),
	closeCreatePackageBookingDialog: () => set({ isCreatePackageBookingDialogOpen: false }),
	
	openCreateCustomBookingDialog: () => set({ isCreateCustomBookingDialogOpen: true }),
	closeCreateCustomBookingDialog: () => set({ isCreateCustomBookingDialogOpen: false }),
	
	openBookingDetailsDialog: (bookingId: string) => set({ 
		isBookingDetailsDialogOpen: true, 
		selectedBookingId: bookingId 
	}),
	closeBookingDetailsDialog: () => set({ 
		isBookingDetailsDialogOpen: false, 
		selectedBookingId: null 
	}),
}));