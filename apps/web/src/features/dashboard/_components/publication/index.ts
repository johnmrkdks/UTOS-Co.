// Publication System Components and Utilities
// Comprehensive publication management system for cars and packages

// Mutation Hooks
export { useTogglePublishCarMutation } from "../../_pages/car-management/_hooks/query/use-toggle-publish-car-mutation";
export { useTogglePublishPackageMutation } from "../../_pages/packages/_hooks/query/use-toggle-publish-package-mutation";
export type {
	CarValidationData,
	PackageValidationData,
	ValidationResult,
} from "../../_utils/publication-validation";
// Validation Utilities
export {
	canPublishSafely,
	getPublicationReadinessText,
	getValidationStatusSummary,
	validateCarForPublication,
	validatePackageForPublication,
} from "../../_utils/publication-validation";
export type {
	BulkPublicationItem,
	BulkPublicationManagerProps,
} from "./bulk-publication-manager";
export { BulkPublicationManager } from "./bulk-publication-manager";
export type {
	PublicationFilterState,
	PublicationFiltersProps,
} from "./publication-filters";
export { PublicationFilters } from "./publication-filters";
export type { PublicationStatsProps } from "./publication-stats-card";
export { PublicationStatsCard } from "./publication-stats-card";
export type { PublicationStatusBadgeProps } from "./publication-status-badge";
// Core Components
export { PublicationStatusBadge } from "./publication-status-badge";
export type { PublicationToggleButtonProps } from "./publication-toggle-button";
export { PublicationToggleButton } from "./publication-toggle-button";
export type { PublicationValidationPanelProps } from "./publication-validation-panel";
export { PublicationValidationPanel } from "./publication-validation-panel";
