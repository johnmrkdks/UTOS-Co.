import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { 
	CheckCircle, 
	XCircle, 
	AlertTriangle, 
	Eye, 
	EyeOff, 
	Info,
	TrendingUp 
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { 
	type ValidationResult,
	type CarValidationData,
	type PackageValidationData,
	validateCarForPublication,
	validatePackageForPublication,
	getValidationStatusSummary,
	canPublishSafely,
	getPublicationReadinessText,
} from "../../_utils/publication-validation";

export interface PublicationValidationPanelProps {
	data: CarValidationData | PackageValidationData;
	type: "car" | "package";
	isPublished: boolean;
	onTogglePublish: (shouldPublish: boolean) => void;
	isLoading?: boolean;
	className?: string;
}

export function PublicationValidationPanel({
	data,
	type,
	isPublished,
	onTogglePublish,
	isLoading = false,
	className,
}: PublicationValidationPanelProps) {
	const validation = useMemo(() => {
		return type === "car"
			? validateCarForPublication(data as CarValidationData)
			: validatePackageForPublication(data as PackageValidationData);
	}, [data, type]);

	const statusSummary = getValidationStatusSummary(validation);
	const canPublish = canPublishSafely(validation);

	const getScoreColor = (score: number) => {
		if (score >= 90) return "text-green-600";
		if (score >= 75) return "text-blue-600";
		if (score >= 60) return "text-yellow-600";
		if (score >= 40) return "text-orange-600";
		return "text-red-600";
	};

	const getProgressColor = (score: number) => {
		if (score >= 90) return "bg-green-500";
		if (score >= 75) return "bg-blue-500";
		if (score >= 60) return "bg-yellow-500";
		if (score >= 40) return "bg-orange-500";
		return "bg-red-500";
	};

	return (
		<Card className={cn("", className)}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Publication Validation
					</CardTitle>
					<Badge 
						variant={statusSummary.status === "excellent" ? "default" : 
						        statusSummary.status === "good" ? "default" : 
						        statusSummary.status === "fair" ? "secondary" : "destructive"}
						className="capitalize"
					>
						{statusSummary.status}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Score and Progress */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Publication Score</span>
						<span className={cn("text-2xl font-bold", getScoreColor(validation.score))}>
							{validation.score}/100
						</span>
					</div>
					<Progress 
						value={validation.score} 
						className={cn("h-3", getProgressColor(validation.score))}
					/>
					<p className="text-sm text-muted-foreground">
						{getPublicationReadinessText(validation.score)}
					</p>
				</div>

				{/* Errors */}
				{validation.errors.length > 0 && (
					<Alert variant="destructive">
						<XCircle className="h-4 w-4" />
						<AlertDescription>
							<div className="space-y-1">
								<p className="font-medium">Issues preventing publication:</p>
								<ul className="list-disc list-inside space-y-0.5 text-sm">
									{validation.errors.map((error: string, index: number) => (
										<li key={index}>{error}</li>
									))}
								</ul>
							</div>
						</AlertDescription>
					</Alert>
				)}

				{/* Warnings */}
				{validation.warnings.length > 0 && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							<div className="space-y-1">
								<p className="font-medium">Recommendations for improvement:</p>
								<ul className="list-disc list-inside space-y-0.5 text-sm">
									{validation.warnings.map((warning: string, index: number) => (
										<li key={index}>{warning}</li>
									))}
								</ul>
							</div>
						</AlertDescription>
					</Alert>
				)}

				{/* Success State */}
				{validation.isValid && validation.warnings.length === 0 && (
					<Alert>
						<CheckCircle className="h-4 w-4" />
						<AlertDescription>
							<div className="flex items-center justify-between">
								<span>All validation checks passed! Ready for publication.</span>
								<Badge>
									<CheckCircle className="h-3 w-3 mr-1" />
									Validated
								</Badge>
							</div>
						</AlertDescription>
					</Alert>
				)}

				{/* Publication Controls */}
				<div className="flex items-center justify-between pt-4 border-t">
					<div className="flex items-center gap-2">
						{isPublished ? (
							<Badge variant="default">
								<Eye className="h-3 w-3 mr-1" />
								Published
							</Badge>
						) : (
							<Badge variant="secondary">
								<EyeOff className="h-3 w-3 mr-1" />
								Unpublished
							</Badge>
						)}
						
						{!canPublish && (
							<Badge variant="destructive" className="text-xs">
								<Info className="h-3 w-3 mr-1" />
								Blocked
							</Badge>
						)}
					</div>

					<div className="flex gap-2">
						{isPublished ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => onTogglePublish(false)}
								disabled={isLoading}
							>
								<EyeOff className="h-4 w-4 mr-2" />
								Unpublish
							</Button>
						) : (
							<Button
								variant={canPublish ? "default" : "secondary"}
								size="sm"
								onClick={() => onTogglePublish(true)}
								disabled={!canPublish || isLoading}
							>
								<Eye className="h-4 w-4 mr-2" />
								{canPublish ? "Publish" : "Fix Issues to Publish"}
							</Button>
						)}
					</div>
				</div>

				{/* Publication Blocked Notice */}
				{!canPublish && !isPublished && (
					<Alert variant="destructive">
						<XCircle className="h-4 w-4" />
						<AlertDescription>
							Publication is blocked due to validation issues. 
							Please address the errors above before publishing.
						</AlertDescription>
					</Alert>
				)}

				{/* Published with Issues Warning */}
				{isPublished && (validation.errors.length > 0 || validation.score < 60) && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							This {type} is published but has validation issues. 
							Consider unpublishing and fixing these issues for better customer experience.
						</AlertDescription>
					</Alert>
				)}
			</CardContent>
		</Card>
	);
}