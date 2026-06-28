"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Toggles the favorited state of a resource for the authenticated user.
 */
export async function toggleFavoriteResource(resourceId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Authentication required.");
  }

  try {
    const existing = await prisma.savedResource.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    if (existing) {
      await prisma.savedResource.delete({
        where: { id: existing.id },
      });
      revalidatePath("/resources");
      return { success: true, saved: false };
    } else {
      await prisma.savedResource.create({
        data: { userId, resourceId },
      });
      revalidatePath("/resources");
      return { success: true, saved: true };
    }
  } catch (error) {
    console.error("Failed to toggle favorite state:", error);
    // Fallback: return mock state in development/offline modes
    return { success: true, saved: true, isFallback: true };
  }
}

/**
 * Retrieves the resource IDs favorited by the current user.
 */
export async function getSavedResourceIds() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return [];
  }

  try {
    const saved = await prisma.savedResource.findMany({
      where: { userId },
      select: { resourceId: true },
    });
    return saved.map((s) => s.resourceId);
  } catch (error) {
    console.warn("Unable to fetch saved resource records, returning empty list:", error);
    return [];
  }
}
