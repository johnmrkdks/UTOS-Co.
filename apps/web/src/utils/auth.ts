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
			search: {
				error: "unauthorized",
			},
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
			search: {
				error: "unauthorized",
			},
		});
	}
	return session;
}

export async function requireDriver() {
	const session = await requireAuth();
	if (session?.user.role !== "driver") {
		throw redirect({
			to: "/",
			search: {
				error: "unauthorized",
			},
		});
	}
	return session;
}

// Guest session functions - allows both authenticated and anonymous users
export async function requireGuestSession() {
	const session = await authClient.getSession();
	if (!session) {
		// Create an anonymous session if none exists
		const anonymousSession = await authClient.signIn.anonymous();
		if (!anonymousSession.data) {
			throw new Error("Failed to create anonymous session");
		}
		return anonymousSession.data;
	}
	return session.data;
}

export async function getOrCreateGuestSession() {
	const session = await authClient.getSession();
	if (!session) {
		// Create an anonymous session if none exists
		try {
			const anonymousSession = await authClient.signIn.anonymous();
			return anonymousSession.data;
		} catch (error) {
			console.error("Failed to create anonymous session:", error);
			throw error;
		}
	}
	return session.data;
}
