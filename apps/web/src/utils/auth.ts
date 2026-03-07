import { authClient } from "@/lib/auth-client";
import { redirect } from "@tanstack/react-router";

// Auth guard functions
export async function requireAuth() {
	const session = await authClient.getSession();
	if (!session) {
		throw redirect({
			to: "/sign-in",
			search: {
				redirect: window.location.pathname,
			},
		});
	}
	return session.data;
}

export async function requireAdmin() {
	const session = await requireAuth();
	if (session?.user.role !== "admin" && session?.user.role !== "super_admin") {
		throw redirect({
			to: "/",
		});
	}
	return session;
}

export async function getAuth() {
	const session = await authClient.getSession();
	if (!session) {
		throw redirect({
			to: "/sign-in",
			search: {
				redirect: window.location.pathname,
			},
		});
	}

	return session.data;
}

export async function requireCustomer() {
	const session = await requireAuth();
	if (session?.user.role !== "user") {
		throw redirect({
			to: "/",
		});
	}
	return session;
}

export async function requireDriver() {
	const session = await requireAuth();
	if (session?.user.role !== "driver") {
		throw redirect({
			to: "/",
		});
	}
	return session;
}

export function getDashboardPath(userRole: string | undefined | null): string {
	switch (userRole) {
		case "admin":
		case "super_admin":
			return "/admin/dashboard";
		case "driver":
			return "/driver";
		case "user":
			return "/dashboard/services";
		default:
			return "/";
	}
}

/**
 * Unified post-login redirect handler for both email/password and OAuth
 * Invalidates session cache, fetches fresh session, and redirects to appropriate dashboard
 */
export async function handlePostLoginRedirect(params: {
	queryClient: any;
	navigate: any;
	redirectPath?: string;
}): Promise<void> {
	const { queryClient, navigate, redirectPath } = params;

	// Invalidate the session query to force refetch
	await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

	// Fetch the updated session to get user role
	const session = await authClient.getSession();
	const userRole = session?.data?.user?.role;

	// Determine redirect path based on role
	const defaultDashboard = getDashboardPath(userRole);
	const finalRedirect = redirectPath || defaultDashboard;

	console.log("🚀 Post-login redirect:", {
		userRole,
		defaultDashboard,
		redirectPath,
		finalRedirect
	});

	// Navigate to the appropriate dashboard
	navigate({
		to: finalRedirect,
	});
}

export async function redirectIfAuthenticated() {
	const session = await authClient.getSession();
	console.log("🔍 redirectIfAuthenticated - Session check:", {
		hasSession: !!session,
		sessionData: session?.data,
		userRole: session?.data?.user?.role
	});

	// Check if session exists AND has valid data
	if (session?.data?.user) {
		const userRole = session.data.user.role;
		console.log("🚀 Redirecting authenticated user with role:", userRole);
		const dashboardPath = getDashboardPath(userRole);
		throw redirect({ to: dashboardPath });
	} else {
		console.log("✅ No valid session data found, allowing access to auth page");
	}
}

