"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const NurseSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().min(4).max(160),
});

export async function getNurseSettings(userId: number) {
  try {
    const nurse = await prisma.nurse.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!nurse) {
      throw new Error("Nurse not found");
    }

    return {
      success: true,
      data: {
        name: nurse.user.name,
        email: nurse.user.email,
        nurseId: nurse.nurseId,
        shift: nurse.shift || "Day",
        bio: nurse.bio || "",
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch nurse settings:", error);
    return {
      success: false,
      data: null,
      error: "Failed to fetch nurse settings. Please try again.",
    };
  }
}

export async function updateNurseSettings(userId: number, data: z.infer<typeof NurseSettingsSchema>) {
  try {
    // Validate input
    const validatedData = NurseSettingsSchema.parse(data);

    // Transaction to update both User and Nurse records
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: validatedData.name,
          email: validatedData.email,
        },
      });

      await prisma.nurse.update({
        where: { userId },
        data: {
          bio: validatedData.bio,
        },
      });
    });

    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update nurse settings:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    if (error instanceof Error) {
      // Handle unique constraint violations
      if (error.message.includes("Unique constraint failed")) {
        return { 
          success: false, 
          error: "Email or Nurse ID already exists. Please use different values." 
        };
      }
    }

    return { 
      success: false, 
      error: "Failed to update settings. Please try again." 
    };
  }
}