// Publication System Components and Utilities
// Comprehensive publication management system for cars and packages

// Core Components
export { PublicationStatusBadge } from "./publication-status-badge";
export type { PublicationStatusBadgeProps } from "./publication-status-badge";

export { PublicationToggleButton } from "./publication-toggle-button";
export type { PublicationToggleButtonProps } from "./publication-toggle-button";

export { PublicationStatsCard } from "./publication-stats-card";
export type { PublicationStatsProps } from "./publication-stats-card";

export { BulkPublicationManager } from "./bulk-publication-manager";
export type { 
	BulkPublicationManagerProps, 
	BulkPublicationItem 
} from "./bulk-publication-manager";

export { PublicationFilters } from "./publication-filters";
export type { 
	PublicationFiltersProps, 
	PublicationFilterState 
} from "./publication-filters";

export { PublicationValidationPanel } from "./publication-validation-panel";
export type { PublicationValidationPanelProps } from "./publication-validation-panel";

// Validation Utilities
export {
	validateCarForPublication,
	validatePackageForPublication,
	getValidationStatusSummary,
	canPublishSafely,
	getPublicationReadinessText,
} from "../../_utils/publication-validation";

export type {
	ValidationResult,
	CarValidationData,
	PackageValidationData,
} from "../../_utils/publication-validation";

// Mutation Hooks
export { useTogglePublishCarMutation } from "../../_pages/car-management/_hooks/query/use-toggle-publish-car-mutation";
export { useTogglePublishPackageMutation } from "../../_pages/packages/_hooks/query/use-toggle-publish-package-mutation";