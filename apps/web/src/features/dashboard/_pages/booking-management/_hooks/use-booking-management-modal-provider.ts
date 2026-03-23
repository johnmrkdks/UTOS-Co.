import { create } from "zustand";

interface BookingManagementModalState {
	isCreatePackageBookingDialogOpen: boolean;
	isCreateCustomBookingDialogOpen: boolean;
	isCreateOffloadBookingDialogOpen: boolean;
	isBookingDetailsDialogOpen: boolean;
	isAssignDriverDialogOpen: boolean;
	isAssignCarDialogOpen: boolean;
	isEditBookingDialogOpen: boolean;
	isChangeStatusDialogOpen: boolean;
	isConfirmBookingDialogOpen: boolean;
	selectedBookingId: string | null;
	selectedBookingForDriver: any | null;
	selectedBookingForCar: any | null;
	selectedBookingForEdit: any | null;
	selectedBookingForStatus: any | null;
	selectedBookingForConfirm: any | null;
	preSelectedStatus: string | null;

	openCreatePackageBookingDialog: () => void;
	closeCreatePackageBookingDialog: () => void;

	openCreateCustomBookingDialog: () => void;
	closeCreateCustomBookingDialog: () => void;

	openCreateOffloadBookingDialog: () => void;
	closeCreateOffloadBookingDialog: () => void;

	openBookingDetailsDialog: (bookingId: string) => void;
	closeBookingDetailsDialog: () => void;

	openAssignDriverDialog: (booking: any) => void;
	closeAssignDriverDialog: () => void;

	openAssignCarDialog: (booking: any) => void;
	closeAssignCarDialog: () => void;

	openEditBookingDialog: (booking: any) => void;
	closeEditBookingDialog: () => void;

	openChangeStatusDialog: (booking: any, preSelectedStatus?: string) => void;
	closeChangeStatusDialog: () => void;

	openConfirmBookingDialog: (booking: any) => void;
	closeConfirmBookingDialog: () => void;
}

export const useBookingManagementModalProvider = create<BookingManagementModalState>((set) => ({
	isCreatePackageBookingDialogOpen: false,
	isCreateCustomBookingDialogOpen: false,
	isCreateOffloadBookingDialogOpen: false,
	isBookingDetailsDialogOpen: false,
	isAssignDriverDialogOpen: false,
	isAssignCarDialogOpen: false,
	isEditBookingDialogOpen: false,
	isChangeStatusDialogOpen: false,
	isConfirmBookingDialogOpen: false,
	selectedBookingId: null,
	selectedBookingForDriver: null,
	selectedBookingForCar: null,
	selectedBookingForEdit: null,
	selectedBookingForStatus: null,
	selectedBookingForConfirm: null,
	preSelectedStatus: null,
	
	openCreatePackageBookingDialog: () => set({ isCreatePackageBookingDialogOpen: true }),
	closeCreatePackageBookingDialog: () => set({ isCreatePackageBookingDialogOpen: false }),
	
	openCreateCustomBookingDialog: () => set({ isCreateCustomBookingDialogOpen: true }),
	closeCreateCustomBookingDialog: () => set({ isCreateCustomBookingDialogOpen: false }),

	openCreateOffloadBookingDialog: () => set({ isCreateOffloadBookingDialogOpen: true }),
	closeCreateOffloadBookingDialog: () => set({ isCreateOffloadBookingDialogOpen: false }),
	
	openBookingDetailsDialog: (bookingId: string) => {
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
		set({
			isEditBookingDialogOpen: true,
			selectedBookingForEdit: booking
		});
	},
	closeEditBookingDialog: () => set({ 
		isEditBookingDialogOpen: false, 
		selectedBookingForEdit: null 
	}),
	
	openChangeStatusDialog: (booking: any, preSelectedStatus?: string) => {
		set({
			isChangeStatusDialogOpen: true,
			selectedBookingForStatus: booking,
			preSelectedStatus: preSelectedStatus || null
		});
	},
	closeChangeStatusDialog: () => set({
		isChangeStatusDialogOpen: false,
		selectedBookingForStatus: null,
		preSelectedStatus: null
	}),

	openConfirmBookingDialog: (booking: any) => {
		set({
			isConfirmBookingDialogOpen: true,
			selectedBookingForConfirm: booking
		});
	},
	closeConfirmBookingDialog: () => set({
		isConfirmBookingDialogOpen: false,
		selectedBookingForConfirm: null
	}),
}));