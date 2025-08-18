import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { 
	CheckCircle, 
	XCircle, 
	AlertTriangle, 
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
	className?: string;
}

export function PublicationValidationPanel({
	data,
	type,
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


			</CardContent>
		</Card>
	);
}