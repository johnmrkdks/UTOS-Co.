import { cn } from "@/lib/utils";
import { BookingCard } from "./booking-card";

const bookingCards = [{
  model: "Euro Sedan",
  description: "Euro Sedan Airport/CBD transfers $110. As Directed/On Hold $100 per hour. Minimum hire 4 hours. ",
  image: "placeholder.svg"
}, {
  model: "Premium SUV",
  description: "Premium SUV . Airport/CBD transfers $140 . As Directed/On Hold $110 per hour. Minimum hire 4 hours.",
  image: "placeholder.svg"
}, {
  model: "Luxury Mercedes V-Class Van",
  description: "MPV 7 seater Luxury Van. Airport/CBD Transfers $160. As Directed/On Hold $130 per hour. Minimum hire 2 hours.",
  image: "placeholder.svg"
}, {
  model: "Luxury 12 Seater  Sprinter Bus",
  description: "Luxury 12 Seater  Sprinter Bus Airport/CBD transfers $180. As Directed/On Hold $150 per hour. Minimum hire 2 hours.",
  image: "placeholder.svg"
}, {
  model: "Luxury 15 Seater  Sprinter Bus",
  description: "Luxury 15 Seater  Sprinter Bus Airport/CBD transfers $210. As Directed/On Hold $175 per hour. Minimum hire 2 hours.",
  image: "placeholder.svg"
}]

type BookingProps = {
  className?: string;
};

export function Booking({ className, ...props }: BookingProps) {
  return (
    <div className={cn("flex flex-col gap-12", className)} {...props}>
      <h1 className="text-4xl font-bold leading-tight">
        Online Appointments
      </h1>
      <div className="grid grid-cols-5 gap-4">
        {bookingCards.map((card) => (
          <BookingCard key={card.model} {...card} />
        ))}
      </div>
    </div>
  );
}
