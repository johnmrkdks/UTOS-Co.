import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import { 
	Dialog, 
	DialogContent, 
	DialogDescription, 
	DialogFooter, 
	DialogHeader, 
	DialogTitle, 
	DialogTrigger 
} from "@workspace/ui/components/dialog";
import { Eye, EyeOff, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export interface BulkPublicationItem {
	id: string;
	name: string;
	isPublished: boolean;
	isActive?: boolean;
	isAvailable?: boolean;
	status?: string;
	hasValidationErrors?: boolean;
	validationErrors?: string[];
}

export interface BulkPublicationManagerProps {
	items: BulkPublicationItem[];
	type: "cars" | "packages";
	onBulkToggle: (itemIds: string[], isPublished: boolean) => Promise<void>;
	isLoading?: boolean;
}

export function BulkPublicationManager({
	items,
	type,
	onBulkToggle,
	isLoading = false,
}: BulkPublicationManagerProps) {
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [showDialog, setShowDialog] = useState(false);
	const [pendingAction, setPendingAction] = useState<"publish" | "unpublish" | null>(null);

	const publishedItems = items.filter(item => item.isPublished);
	const unpublishedItems = items.filter(item => !item.isPublished);
	const itemsWithIssues = items.filter(item => item.hasValidationErrors);

	const handleSelectAll = (checked: boolean) => {
		setSelectedItems(checked ? items.map(item => item.id) : []);
	};

	const handleSelectItem = (itemId: string, checked: boolean) => {
		setSelectedItems(prev => 
			checked 
				? [...prev, itemId]
				: prev.filter(id => id !== itemId)
		);
	};

	const handleBulkAction = (action: "publish" | "unpublish") => {
		if (selectedItems.length === 0) {
			toast.error("Please select items to update");
			return;
		}

		setPendingAction(action);
		setShowDialog(true);
	};

	const confirmBulkAction = async () => {
		if (!pendingAction || selectedItems.length === 0) return;

		try {
			await onBulkToggle(selectedItems, pendingAction === "publish");
			setSelectedItems([]);
			setShowDialog(false);
			setPendingAction(null);
		} catch (error) {
			console.error("Bulk action failed:", error);
		}
	};

	const selectedItemsDetails = items.filter(item => selectedItems.includes(item.id));
	const selectedWithIssues = selectedItemsDetails.filter(item => item.hasValidationErrors);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Bulk Publication Manager</span>
					<div className="flex gap-2">
						<Badge variant="outline">{items.length} Total</Badge>
						<Badge variant="default">{publishedItems.length} Published</Badge>
						<Badge variant="secondary">{unpublishedItems.length} Unpublished</Badge>
						{itemsWithIssues.length > 0 && (
							<Badge variant="destructive">{itemsWithIssues.length} With Issues</Badge>
						)}
					</div>
				</CardTitle>
				<CardDescription>
					Manage publication status for multiple {type} at once
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Selection Controls */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="select-all"
							checked={selectedItems.length === items.length}
							onCheckedChange={handleSelectAll}
						/>
						<label htmlFor="select-all" className="text-sm">
							Select All ({selectedItems.length}/{items.length})
						</label>
					</div>
					
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleBulkAction("publish")}
							disabled={selectedItems.length === 0 || isLoading}
						>
							<Eye className="h-4 w-4 mr-2" />
							Publish Selected
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleBulkAction("unpublish")}
							disabled={selectedItems.length === 0 || isLoading}
						>
							<EyeOff className="h-4 w-4 mr-2" />
							Unpublish Selected
						</Button>
					</div>
				</div>

				{/* Items List */}
				<div className="max-h-64 overflow-y-auto border rounded-lg">
					<div className="space-y-0 divide-y">
						{items.map((item) => (
							<div key={item.id} className="flex items-center space-x-3 p-3">
								<Checkbox
									checked={selectedItems.includes(item.id)}
									onCheckedChange={(checked) => 
										handleSelectItem(item.id, checked as boolean)
									}
								/>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium truncate">{item.name}</p>
										<div className="flex items-center gap-2">
											{item.hasValidationErrors && (
												<AlertTriangle className="h-4 w-4 text-amber-500" />
											)}
											{item.isPublished ? (
												<Badge variant="default" className="text-xs">
													<Eye className="h-3 w-3 mr-1" />
													Published
												</Badge>
											) : (
												<Badge variant="secondary" className="text-xs">
													<EyeOff className="h-3 w-3 mr-1" />
													Unpublished
												</Badge>
											)}
										</div>
									</div>
									{item.hasValidationErrors && (
										<p className="text-xs text-amber-600 mt-1">
											{item.validationErrors?.join(", ")}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Confirmation Dialog */}
				<Dialog open={showDialog} onOpenChange={setShowDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{pendingAction === "publish" ? "Publish" : "Unpublish"} {selectedItems.length} {type}?
							</DialogTitle>
							<DialogDescription>
								This will {pendingAction === "publish" ? "make visible to customers" : "hide from customers"} the selected {type}.
							</DialogDescription>
						</DialogHeader>

						{selectedWithIssues.length > 0 && pendingAction === "publish" && (
							<div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
								<div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
									<AlertTriangle className="h-4 w-4" />
									Warning: {selectedWithIssues.length} items have validation issues
								</div>
								<ul className="mt-2 text-sm text-amber-600 space-y-1">
									{selectedWithIssues.slice(0, 3).map((item) => (
										<li key={item.id}>• {item.name}: {item.validationErrors?.join(", ")}</li>
									))}
									{selectedWithIssues.length > 3 && (
										<li>• And {selectedWithIssues.length - 3} more...</li>
									)}
								</ul>
							</div>
						)}

						<DialogFooter>
							<Button variant="outline" onClick={() => setShowDialog(false)}>
								Cancel
							</Button>
							<Button onClick={confirmBulkAction} disabled={isLoading}>
								{pendingAction === "publish" ? (
									<Eye className="h-4 w-4 mr-2" />
								) : (
									<EyeOff className="h-4 w-4 mr-2" />
								)}
								{pendingAction === "publish" ? "Publish" : "Unpublish"} {selectedItems.length} {type}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}