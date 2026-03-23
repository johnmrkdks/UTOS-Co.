import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { CheckCircle, XCircle, Clock, TestTube2 } from "lucide-react";
import { format } from "date-fns";
import type { TestResult } from "../index";

interface TestResultsProps {
	results: TestResult[];
}

export function TestResults({ results }: TestResultsProps) {
	const getStatusIcon = (status: TestResult["status"]) => {
		switch (status) {
			case "success":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "error":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "pending":
				return <Clock className="h-4 w-4 text-yellow-500" />;
			default:
				return <TestTube2 className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusBadgeVariant = (status: TestResult["status"]) => {
		switch (status) {
			case "success":
				return "default";
			case "error":
				return "destructive";
			case "pending":
				return "secondary";
			default:
				return "outline";
		}
	};

	const getTypeColor = (type: TestResult["type"]) => {
		switch (type) {
			case "package":
				return "bg-blue-100 text-blue-800";
			case "custom":
				return "bg-green-100 text-green-800";
			case "end-to-end":
				return "bg-purple-100 text-purple-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const successCount = results.filter(r => r.status === "success").length;
	const errorCount = results.filter(r => r.status === "error").length;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TestTube2 className="h-5 w-5" />
					Test Results
				</CardTitle>
				<div className="flex gap-2 text-sm">
					<Badge variant="default" className="bg-green-100 text-green-800">
						{successCount} Passed
					</Badge>
					<Badge variant="destructive">
						{errorCount} Failed
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				{results.length === 0 ? (
					<div className="text-center text-muted-foreground py-8">
						<TestTube2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p>No test results yet.</p>
						<p className="text-sm">Run tests to see results here.</p>
					</div>
				) : (
					<ScrollArea className="h-[400px] pr-4">
						<div className="space-y-3">
							{results.map((result) => (
								<div 
									key={result.id}
									className="flex flex-col gap-2 p-3 rounded-lg border bg-card"
								>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-2">
											{getStatusIcon(result.status)}
											<Badge 
												variant="outline" 
												className={`text-xs ${getTypeColor(result.type)}`}
											>
												{result.type}
											</Badge>
										</div>
										<Badge variant={getStatusBadgeVariant(result.status)}>
											{result.status}
										</Badge>
									</div>
									
									<div className="text-sm">
										<p className="font-medium mb-1">{result.message}</p>
										<p className="text-xs text-muted-foreground">
											{format(result.timestamp, "MMM d, h:mm:ss a")}
										</p>
									</div>

									{result.data && (
										<details className="text-xs">
											<summary className="cursor-pointer text-muted-foreground hover:text-foreground">
												View Details
											</summary>
											<pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
												{JSON.stringify(result.data, null, 2)}
											</pre>
										</details>
									)}
								</div>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}