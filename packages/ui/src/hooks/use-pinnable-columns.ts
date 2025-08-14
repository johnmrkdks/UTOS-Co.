import * as React from "react";
import type { Column, ColumnPinningState } from "@tanstack/react-table";

export function usePinnableColumns() {
	const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
		left: [],
		right: []
	});

	const getPinningStyles = React.useCallback(<TData>(column: Column<TData>) => {
		const isPinned = column.getIsPinned();
		const isFirstPinned = isPinned === "left" && column.getStart("left") === 0;
		const isLastPinned = isPinned === "right" && column.getAfter("right") === 0;
		
		return {
			left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
			right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
			position: isPinned ? ("sticky" as const) : ("relative" as const),
			width: column.getSize(),
			zIndex: isPinned ? 1 : 0,
			boxShadow: isPinned
				? isFirstPinned 
					? "4px 0 4px -2px rgba(0, 0, 0, 0.1)"
					: isLastPinned
						? "-4px 0 4px -2px rgba(0, 0, 0, 0.1)"
						: "none"
				: "none"
		} as const;
	}, []);

	const canPinLeft = React.useCallback(<TData>(column: Column<TData>) => {
		return column.getCanPin() && !column.getIsPinned() && column.id !== "actions";
	}, []);

	const canPinRight = React.useCallback(<TData>(column: Column<TData>) => {
		return column.getCanPin() && !column.getIsPinned();
	}, []);

	const canUnpin = React.useCallback(<TData>(column: Column<TData>) => {
		return column.getIsPinned();
	}, []);

	const pinLeft = React.useCallback(<TData>(column: Column<TData>) => {
		column.pin("left");
	}, []);

	const pinRight = React.useCallback(<TData>(column: Column<TData>) => {
		column.pin("right");
	}, []);

	const unpin = React.useCallback(<TData>(column: Column<TData>) => {
		column.pin(false);
	}, []);

	return {
		columnPinning,
		setColumnPinning,
		getPinningStyles,
		canPinLeft,
		canPinRight,
		canUnpin,
		pinLeft,
		pinRight,
		unpin
	};
}