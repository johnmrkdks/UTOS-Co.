import * as React from "react"
import type { Column } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeOffIcon, PinIcon, Pin } from "lucide-react"

import { cn } from "../lib/utils"
import { Button } from "./button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>
	title: string
	sortable?: boolean
	hideable?: boolean
	pinnable?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
	sortable = true,
	hideable = true,
	pinnable = true,
	...props
}: DataTableColumnHeaderProps<TData, TValue>) {
	const canSort = sortable && column.getCanSort()
	const canHide = hideable && column.getCanHide()
	const canPin = pinnable && column.getCanPin()
	const isPinned = column.getIsPinned()

	if (!canSort && !canHide && !canPin) {
		return (
			<div className={cn("text-muted-foreground font-medium", className)} {...props}>
				{title}
			</div>
		)
	}

	if (!canSort && (canHide || canPin)) {
		return (
			<div className={cn("flex items-center gap-2", className)} {...props}>
				<span className="text-muted-foreground font-medium">{title}</span>
				{isPinned && (
					<Pin className="h-3 w-3 text-blue-500" aria-label="Pinned column" />
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 hover:bg-muted"
							aria-label={`Column options for ${title}`}
						>
							<EyeOffIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{canPin && !isPinned && (
							<>
								<DropdownMenuItem onClick={() => column.pin("left")}>
									<PinIcon className="mr-2 h-4 w-4" />
									Stick to left
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => column.pin("right")}>
									<PinIcon className="mr-2 h-4 w-4 rotate-90" />
									Stick to right
								</DropdownMenuItem>
								{canHide && <DropdownMenuSeparator />}
							</>
						)}
						{canPin && isPinned && (
							<>
								<DropdownMenuItem onClick={() => column.pin(false)}>
									<Pin className="mr-2 h-4 w-4" />
									Unpin
								</DropdownMenuItem>
								{canHide && <DropdownMenuSeparator />}
							</>
						)}
						{canHide && (
							<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
								<EyeOffIcon className="mr-2 h-4 w-4" />
								Hide
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		)
	}

	return (
		<div className={cn("flex items-center gap-2", className)} {...props}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="data-[state=open]:bg-accent -ml-3 h-8 hover:bg-muted"
						aria-label={`Sort by ${title}`}
					>
						<span className="text-muted-foreground font-medium">{title}</span>
						{isPinned && (
							<Pin className="ml-1 h-3 w-3 text-blue-500" aria-label="Pinned column" />
						)}
						{column.getIsSorted() === "desc" ? (
							<ArrowDownIcon className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "asc" ? (
							<ArrowUpIcon className="ml-2 h-4 w-4" />
						) : (
							<ChevronsUpDownIcon className="ml-2 h-4 w-4" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{canSort && (
						<>
							<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
								<ArrowUpIcon className="mr-2 h-4 w-4" />
								Asc
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
								<ArrowDownIcon className="mr-2 h-4 w-4" />
								Desc
							</DropdownMenuItem>
							{(canPin || canHide) && <DropdownMenuSeparator />}
						</>
					)}
					{canPin && !isPinned && (
						<>
							<DropdownMenuItem onClick={() => column.pin("left")}>
								<PinIcon className="mr-2 h-4 w-4" />
								Stick to left
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => column.pin("right")}>
								<PinIcon className="mr-2 h-4 w-4 rotate-90" />
								Stick to right
							</DropdownMenuItem>
							{canHide && <DropdownMenuSeparator />}
						</>
					)}
					{canPin && isPinned && (
						<>
							<DropdownMenuItem onClick={() => column.pin(false)}>
								<Pin className="mr-2 h-4 w-4" />
								Unpin
							</DropdownMenuItem>
							{canHide && <DropdownMenuSeparator />}
						</>
					)}
					{canHide && (
						<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
							<EyeOffIcon className="mr-2 h-4 w-4" />
							Hide
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}