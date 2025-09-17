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
		switch (userRole) {
			case "admin":
			case "super_admin":
				throw redirect({ to: "/admin/dashboard" });
			case "driver":
				throw redirect({ to: "/driver" });
			case "user":
				throw redirect({ to: "/" });
			default:
				throw redirect({ to: "/" });
		}
	} else {
		console.log("✅ No valid session data found, allowing access to auth page");
	}
}

