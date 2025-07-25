type DetailsReportsChartProps = React.ComponentProps<"div">;

export function DetailsReportsChart({
	className,
	...props
}: DetailsReportsChartProps) {
	return (
		<div className={className} {...props}>
			Chart here
		</div>
	);
}
