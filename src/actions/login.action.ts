"use server";

import { encrypt } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

interface FormData {
  email: string;
  password: string;
  id: string;
}

export const userLoginAction = async (formData: FormData) => {
  try {
    const { email, password, id } = formData;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        nurse: true,
        doctor: true,
      }
    });

    if (!user) return { error: "User does not exist" };

    // Validate role-specific ID
    let roleSpecificId: string;
    switch (user.role) {
      case "PATIENT":
        if (user.patient?.patientId !== id) return { error: "Invalid Patient ID" };
        roleSpecificId = user.patient.patientId;
        break;
      case "NURSE":
        if (user.nurse?.nurseId !== id) return { error: "Invalid Nurse ID" };
        roleSpecificId = user.nurse.nurseId;
        break;
      case "DOCTOR":
        if (user.doctor?.doctorId !== id) return { error: "Invalid Doctor ID" };
        roleSpecificId = user.doctor.doctorId;
        break;
      default:
        return { error: "Invalid user role" };
    }

    // Validate password
    if (user.password !== password) {
      return { error: "Invalid password" };
    }

    // Prepare session data
    const sessionData = {
      name: user.name,
      userId: user.id,
      role: user.role,
      roleSpecificId: roleSpecificId,
      email: user.email
    };

    // Encrypt and set cookie
    const cookieStore = cookies();
    const session = await encrypt(sessionData);
    
    (await cookieStore).set("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return { 
      success: "Login successful", 
      user: {
        id: user.id,
        role: user.role,
        roleSpecificId,
        name: user.name,
        email: user.email
      }
    };

  } catch (error) {
    console.error("Login error:", error);
    return { error: "An error occurred during login" };
  }
};