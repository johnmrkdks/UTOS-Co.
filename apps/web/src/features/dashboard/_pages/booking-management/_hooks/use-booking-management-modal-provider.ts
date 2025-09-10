import { create } from "zustand";

interface BookingManagementModalState {
	isCreatePackageBookingDialogOpen: boolean;
	isCreateCustomBookingDialogOpen: boolean;
	isBookingDetailsDialogOpen: boolean;
	isAssignDriverDialogOpen: boolean;
	isAssignCarDialogOpen: boolean;
	isEditBookingDialogOpen: boolean;
	isChangeStatusDialogOpen: boolean;
	selectedBookingId: string | null;
	selectedBookingForDriver: any | null;
	selectedBookingForCar: any | null;
	selectedBookingForEdit: any | null;
	selectedBookingForStatus: any | null;
	
	openCreatePackageBookingDialog: () => void;
	closeCreatePackageBookingDialog: () => void;
	
	openCreateCustomBookingDialog: () => void;
	closeCreateCustomBookingDialog: () => void;
	
	openBookingDetailsDialog: (bookingId: string) => void;
	closeBookingDetailsDialog: () => void;
	
	openAssignDriverDialog: (booking: any) => void;
	closeAssignDriverDialog: () => void;
	
	openAssignCarDialog: (booking: any) => void;
	closeAssignCarDialog: () => void;
	
	openEditBookingDialog: (booking: any) => void;
	closeEditBookingDialog: () => void;
	
	openChangeStatusDialog: (booking: any) => void;
	closeChangeStatusDialog: () => void;
}

export const useBookingManagementModalProvider = create<BookingManagementModalState>((set) => ({
	isCreatePackageBookingDialogOpen: false,
	isCreateCustomBookingDialogOpen: false,
	isBookingDetailsDialogOpen: false,
	isAssignDriverDialogOpen: false,
	isAssignCarDialogOpen: false,
	isEditBookingDialogOpen: false,
	isChangeStatusDialogOpen: false,
	selectedBookingId: null,
	selectedBookingForDriver: null,
	selectedBookingForCar: null,
	selectedBookingForEdit: null,
	selectedBookingForStatus: null,
	
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
	
	openAssignCarDialog: (booking: any) => {
		console.log("🚙 Modal provider - opening assign car dialog for booking:", booking.id);
		set({ 
			isAssignCarDialogOpen: true, 
			selectedBookingForCar: booking 
		});
	},
	closeAssignCarDialog: () => set({ 
		isAssignCarDialogOpen: false, 
		selectedBookingForCar: null 
	}),
	
	openEditBookingDialog: (booking: any) => {
		console.log("✏️ Modal provider - opening edit booking dialog for booking:", booking.id);
		set({ 
			isEditBookingDialogOpen: true, 
			selectedBookingForEdit: booking 
		});
	},
	closeEditBookingDialog: () => set({ 
		isEditBookingDialogOpen: false, 
		selectedBookingForEdit: null 
	}),
	
	openChangeStatusDialog: (booking: any) => {
		console.log("📋 Modal provider - opening change status dialog for booking:", booking.id);
		set({ 
			isChangeStatusDialogOpen: true, 
			selectedBookingForStatus: booking 
		});
	},
	closeChangeStatusDialog: () => set({ 
		isChangeStatusDialogOpen: false, 
		selectedBookingForStatus: null 
	}),
}));