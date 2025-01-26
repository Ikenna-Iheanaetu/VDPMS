"use server";

import { AppointmentType } from "@prisma/client";

import prisma from "@/lib/prisma";

export interface AppointmentRequestData {
  preferredDate: Date;
  appointmentType: AppointmentType;
  reason: string;
  patientId: string; // Added since you'll need to associate with patient
}

export async function createAppointmentRequest(data: AppointmentRequestData) {
  try {
    return await prisma.appointmentRequest.create({
      data: {
        preferredDate: data.preferredDate,
        type: data.appointmentType,
        reason: data.reason,
        patient: {
          connect: { patientId: data.patientId },
        },
        status: "PENDING",
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Appointment request failed:", error);
    throw new Error("Failed to create appointment request");
  }
}
