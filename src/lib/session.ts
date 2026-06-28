import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { cache } from "react";
import { redirect } from "next/navigation";

/**
 * Retrieves the current session, cached to prevent multiple requests in a single render cycle.
 */
export const getSession = cache(async () => {
  return getServerSession(authOptions);
});

/**
 * Enforces authenticated sessions. Redirects to sign-in page if not authenticated.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return session;
}

/**
 * Enforces role-based permissions. Redirects to root if user role does not match.
 */
export async function requireRole(role: "CLIENT" | "THERAPIST") {
  const session = await requireSession();
  if (session.user.role !== role) {
    redirect("/");
  }
  return session;
}
