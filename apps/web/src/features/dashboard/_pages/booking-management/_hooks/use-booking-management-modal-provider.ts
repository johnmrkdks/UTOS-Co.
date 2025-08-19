import { create } from "zustand";

interface BookingManagementModalState {
	isCreatePackageBookingDialogOpen: boolean;
	isCreateCustomBookingDialogOpen: boolean;
	isBookingDetailsDialogOpen: boolean;
	isAssignDriverDialogOpen: boolean;
	selectedBookingId: string | null;
	selectedBookingForDriver: any | null;
	
	openCreatePackageBookingDialog: () => void;
	closeCreatePackageBookingDialog: () => void;
	
	openCreateCustomBookingDialog: () => void;
	closeCreateCustomBookingDialog: () => void;
	
	openBookingDetailsDialog: (bookingId: string) => void;
	closeBookingDetailsDialog: () => void;
	
	openAssignDriverDialog: (booking: any) => void;
	closeAssignDriverDialog: () => void;
}

export const useBookingManagementModalProvider = create<BookingManagementModalState>((set) => ({
	isCreatePackageBookingDialogOpen: false,
	isCreateCustomBookingDialogOpen: false,
	isBookingDetailsDialogOpen: false,
	isAssignDriverDialogOpen: false,
	selectedBookingId: null,
	selectedBookingForDriver: null,
	
	openCreatePackageBookingDialog: () => set({ isCreatePackageBookingDialogOpen: true }),
	closeCreatePackageBookingDialog: () => set({ isCreatePackageBookingDialogOpen: false }),
	
	openCreateCustomBookingDialog: () => set({ isCreateCustomBookingDialogOpen: true }),
	closeCreateCustomBookingDialog: () => set({ isCreateCustomBookingDialogOpen: false }),
	
	openBookingDetailsDialog: (bookingId: string) => {
		console.log("🚀 Modal provider - opening booking details dialog for ID:", bookingId);
		set({ 
			isBookingDetailsDialogOpen: true, 
			selectedBookingId: bookingId 
		});
	},
	closeBookingDetailsDialog: () => set({ 
		isBookingDetailsDialogOpen: false, 
		selectedBookingId: null 
	}),
	
	openAssignDriverDialog: (booking: any) => {
		console.log("🚗 Modal provider - opening assign driver dialog for booking:", booking.id);
		set({ 
			isAssignDriverDialogOpen: true, 
			selectedBookingForDriver: booking 
		});
	},
	closeAssignDriverDialog: () => set({ 
		isAssignDriverDialogOpen: false, 
		selectedBookingForDriver: null 
	}),
}));