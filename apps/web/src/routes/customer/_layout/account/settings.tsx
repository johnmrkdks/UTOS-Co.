import { createFileRoute } from "@tanstack/react-router";
import { AccountSettingsPage } from "@/features/account/_pages/account-settings-page";

export const Route = createFileRoute("/customer/_layout/account/settings")({
	component: AccountSettingsPage,
});