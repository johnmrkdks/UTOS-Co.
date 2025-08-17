import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile/_pages/profile-page";

export const Route = createFileRoute("/customer/_layout/profile")({
	component: ProfilePage,
});