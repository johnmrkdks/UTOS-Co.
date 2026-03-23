import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Star, Loader2 } from "lucide-react";
import { useCreateBookingReviewMutation } from "../_hooks/mutation/use-create-booking-review-mutation";

interface BookingReviewFormProps {
	bookingId: string;
	onSuccess?: () => void;
}

export function BookingReviewForm({ bookingId, onSuccess }: BookingReviewFormProps) {
	const [serviceRating, setServiceRating] = useState(0);
	const [driverRating, setDriverRating] = useState(0);
	const [vehicleRating, setVehicleRating] = useState(0);
	const [review, setReview] = useState("");

	const mutation = useCreateBookingReviewMutation();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (serviceRating < 1 || driverRating < 1 || vehicleRating < 1) return;
		mutation.mutate(
			{
				bookingId,
				serviceRating,
				driverRating,
				vehicleRating,
				review: review.trim() || undefined,
			},
			{
				onSuccess: () => {
					setServiceRating(0);
					setDriverRating(0);
					setVehicleRating(0);
					setReview("");
					onSuccess?.();
				},
			}
		);
	};

	const StarRating = ({
		value,
		onChange,
		label,
	}: {
		value: number;
		onChange: (v: number) => void;
		label: string;
	}) => (
		<div className="space-y-2">
			<Label>{label}</Label>
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						onClick={() => onChange(star)}
						className="p-1 hover:scale-110 transition-transform"
					>
						<Star
							className={`h-6 w-6 ${
								star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
							}`}
						/>
					</button>
				))}
			</div>
		</div>
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/50 rounded-lg">
			<h4 className="font-semibold">Leave a Review</h4>
			<p className="text-sm text-muted-foreground">
				Share your experience to help us improve our service.
			</p>

			<StarRating
				value={serviceRating}
				onChange={setServiceRating}
				label="Service Quality"
			/>
			<StarRating
				value={driverRating}
				onChange={setDriverRating}
				label="Driver"
			/>
			<StarRating
				value={vehicleRating}
				onChange={setVehicleRating}
				label="Vehicle"
			/>

			<div className="space-y-2">
				<Label htmlFor="review">Comments (optional)</Label>
				<Textarea
					id="review"
					value={review}
					onChange={(e) => setReview(e.target.value)}
					placeholder="Tell us about your experience..."
					className="min-h-[80px]"
					maxLength={2000}
				/>
			</div>

			<Button
				type="submit"
				disabled={
					mutation.isPending ||
					serviceRating < 1 ||
					driverRating < 1 ||
					vehicleRating < 1
				}
			>
				{mutation.isPending ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin mr-2" />
						Submitting...
					</>
				) : (
					"Submit Review"
				)}
			</Button>
		</form>
	);
}
