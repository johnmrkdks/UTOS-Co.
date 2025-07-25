import { cn } from "@/lib/utils";
import { AboutCard } from "./about-card";

const aboutCards = [
	{
		title: "Our History",
		description:
			"Founded in 2020, downunderchauffeurs  started as a small transportation service for local events. Over the years, we have expanded our services to include airport transportation and corporate travel. airport transfers sydney luxury chauffeur service",
	},
	{
		title: "Our Fleet",
		description:
			"We have a diverse fleet of vehicles to meet your transportation needs, ranging from luxury sedans to spacious vans. Our vehicles are regularly maintained and kept clean for your comfort.",
	},
	{
		title: "Our Drivers",
		description:
			"Our drivers are experienced and professional, ensuring that you arrive at your destination safely and on time. They undergo regular training and background checks to ensure your safety. ",
	},
];

type AboutProps = {
	className?: string;
};

export function About({ className, ...props }: AboutProps) {
	return (
		<div className={cn("flex flex-col gap-12", className)} {...props}>
			<h1 className="text-4xl font-bold leading-tight">
				About DownUnderChauffeurs
			</h1>
			<div className="grid grid-cols-3 gap-4">
				{aboutCards.map((card) => (
					<AboutCard key={card.title} {...card} />
				))}
			</div>
			<h2 className="text-3xl font-bold leading-tight">
				Ride with downunderchauffeurs: A Photo Journey Through Our
				Transportation Service
			</h2>
		</div>
	);
}
