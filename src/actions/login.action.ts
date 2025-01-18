"use server"

"use server";

import { encrypt } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

interface FormData {
  email: string
  password: string
  id: string
}

export const userLoginAction = async (formData: FormData) => {
  
    const { email, password, id } = formData;

     // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      patient: true,
      nurse: true,
      doctor: true,
    },
  });

  if (!user) return { error: "User does not exist" };

  // Check if the ID matches the role
  if (user.role === "PATIENT" && user.patient?.patientId !== id) {
    return { error: "Invalid Patient ID" };
  }

  if (user.role === "NURSE" && user.nurse?.nurseId !== id) {
    return { error: "Invalid Nurse ID" };
  }

  if (user.role === "DOCTOR" && user.doctor?.doctorId !== id) {
    return { error: "Invalid Doctor ID" };
  }

  // Optionally, validate the password here
  if (user.password !== password) {
    return { error: "Invalid password" };
  }

  const cookieStore = await cookies();

  const session = await encrypt(user);

  cookieStore.set("cookie", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: "Login successful" };
};
