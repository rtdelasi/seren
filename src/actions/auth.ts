"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

interface SignUpData {
  name?: string;
  email?: string;
  password?: string;
  role?: "CLIENT" | "THERAPIST";
}

/**
 * Validates signup inputs, hashes passwords, and creates User/Therapist records.
 */
export async function signUp(data: SignUpData) {
  const { name, email, password, role } = data;

  if (!name || !email || !password || !role) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  if (role !== "CLIENT" && role !== "THERAPIST") {
    return { error: "Invalid role selected" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email is already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // If role is therapist, also create the therapist clinical profile
    if (role === "THERAPIST") {
      await prisma.therapist.create({
        data: {
          name,
          email,
          pricePerSession: 150,
          specialties: ["General Therapy"],
          languages: ["English"],
          bio: "Licensed practitioner.",
        },
      });
    }

    return { success: true, role: user.role };
  } catch (error) {
    console.error("SignUp server action error:", error);
    return { error: "An unexpected error occurred during registration" };
  }
}

interface ChangePasswordData {
  currentPassword?: string;
  newPassword?: string;
}

/**
 * Verifies current password and updates the database record with a new hashed password.
 */
export async function changePassword(data: ChangePasswordData) {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    return { error: "Both current and new passwords are required" };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long" };
  }

  const session = await getSession();
  if (!session?.user?.email) {
    return { error: "Unauthorized access" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return { error: "User account not found or invalid type" };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Current password is incorrect" };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: newHashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("ChangePassword server action error:", error);
    return { error: "An unexpected error occurred while modifying password" };
  }
}
