import { authClient } from "@/lib/auth-client";
import { redirect } from "@tanstack/react-router";

// Auth guard functions
export async function requireAuth() {
  const session = await authClient.getSession();
  if (!session) {
    throw redirect({
      to: '/sign-in',
      search: {
        redirect: window.location.pathname,
      },
    });
  }
  return session.data
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session?.user.role !== 'admin') {
    throw redirect({ 
      to: '/',
      search: {
        error: 'unauthorized',
      },
    });
  }
  return session;
}

export async function getAuth() {
  const session = await requireAuth();
  if (session && session.user.role !== 'admin') {
    throw redirect({
      to: '/',
    });
  }

  if (session && session.user.role === 'admin') {
    throw redirect({
      to: '/dashboard',
    });
  }

  return session
}
