import React, { createContext, useContext, useState, type ReactNode } from "react";
import {
	DndContext,
	DragOverlay,
	useDraggable,
	useDroppable,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui/lib/utils";

// Base types
export type KanbanItemProps = {
	id: string;
	name: string;
	column: string;
} & Record<string, unknown>;

export type KanbanColumnProps = {
	id: string;
	name: string;
} & Record<string, unknown>;

// Context for kanban state
interface KanbanContextType {
	activeItem: KanbanItemProps | null;
	activeColumn: KanbanColumnProps | null;
}

const KanbanContext = createContext<KanbanContextType>({
	activeItem: null,
	activeColumn: null,
});

// Kanban Provider Component
interface KanbanProviderProps<T extends KanbanItemProps, C extends KanbanColumnProps> {
	children: (column: C) => ReactNode;
	columns: C[];
	data: T[];
	onDataChange: (data: T[]) => void;
	className?: string;
}

export function KanbanProvider<T extends KanbanItemProps, C extends KanbanColumnProps>({
	children,
	columns,
	data,
	onDataChange,
	className,
}: KanbanProviderProps<T, C>) {
	const [activeItem, setActiveItem] = useState<T | null>(null);
	const [activeColumn, setActiveColumn] = useState<C | null>(null);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const item = data.find((item) => item.id === active.id);
		if (item) {
			setActiveItem(item);
		}
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		// Find active item and over column
		const activeItem = data.find((item) => item.id === activeId);
		if (!activeItem) return;

		// Check if dropping over a column
		const overColumn = columns.find((col) => col.id === overId);
		if (overColumn && activeItem.column !== overColumn.id) {
			const newData = data.map((item) =>
				item.id === activeId ? { ...item, column: overColumn.id } : item
			);
			onDataChange(newData as T[]);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		// Find active item
		const activeItem = data.find((item) => item.id === activeId);
		if (!activeItem) return;

		// Check if dropping over a column
		const overColumn = columns.find((col) => col.id === overId);
		if (overColumn && activeItem.column !== overColumn.id) {
			const newData = data.map((item) =>
				item.id === activeId ? { ...item, column: overColumn.id } : item
			);
			onDataChange(newData as T[]);
		}

		setActiveItem(null);
		setActiveColumn(null);
	};

	return (
		<KanbanContext.Provider value={{ activeItem, activeColumn }}>
			<DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className={cn("grid size-full auto-cols-fr grid-flow-col gap-4", className)}>
					{columns.map((column) => children(column))}
				</div>
				<DragOverlay>
					{activeItem && (
						<div className="rotate-3 opacity-80">
							<KanbanCard id={activeItem.id} name={activeItem.name} />
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</KanbanContext.Provider>
	);
}

// Kanban Board Component (Column)
interface KanbanBoardProps {
	id: string;
	children: ReactNode;
	className?: string;
}

export function KanbanBoard({ id, children, className }: KanbanBoardProps) {
	const { setNodeRef } = useDroppable({ id });

	return (
		<div ref={setNodeRef} className={cn("flex flex-col space-y-2", className)}>
			{children}
		</div>
	);
}

// Kanban Cards Container
interface KanbanCardsProps<T extends KanbanItemProps> {
	children: (item: T) => ReactNode;
	items: T[];
	className?: string;
}

export function KanbanCards<T extends KanbanItemProps>({
	children,
	items,
	className,
}: KanbanCardsProps<T>) {
	const itemIds = items.map((item) => item.id);

	return (
		<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
			<div className={cn("space-y-2", className)}>
				{items.map((item) => children(item))}
			</div>
		</SortableContext>
	);
}

// Kanban Card Component
interface KanbanCardProps {
	id: string;
	name: string;
	children?: ReactNode;
	className?: string;
}

export function KanbanCard({ id, name, children, className }: KanbanCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={cn(
				"cursor-move rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
				isDragging && "opacity-50",
				className
			)}
		>
			{children || <div className="font-medium">{name}</div>}
		</div>
	);
}