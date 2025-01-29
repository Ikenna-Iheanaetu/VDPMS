// app/appointments/actions.ts
"use server";

import { getCookies } from "@/lib/cookies";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function startAppointment(appointmentId: string) {
  try {console.log(appointmentId)

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        status: "IN_PROGRESS",
      },
    });

    revalidatePath("/appointments");
    return appointment;
  } catch (error) {
    console.error("Failed to start appointment:", error);
    throw new Error("Failed to start appointment");
  }
}

export async function updateVitals(
  appointmentId: string,
  vitalsData: {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
    weight?: string;
    height?: string;
  }
) {
  try {
    const vitals = await prisma.vitals.create({
      data: {
        ...vitalsData,
        appointment: {
          connect: { id: parseInt(appointmentId) },
        },
      },
    });

    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { vitalsChecked: true },
    });

    revalidatePath("/appointments");
    return vitals;
  } catch (error) {
    console.error("Failed to update vitals:", error);
    throw new Error("Failed to update vitals");
  }
}

export async function getTodayAppointments() {
  try {
    const currentUser = await getCookies();
    if (currentUser?.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: currentUser.roleSpecificId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        vitals: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const mappedAppointments = appointments.map((apt) => ({
      id: apt.id.toString(),
      patientName: apt.patient.user.name,
      patientId: apt.patient.patientId,
      time: apt.time,
      type: apt.type,
      status: apt.status,
      vitalsChecked: apt.vitalsChecked,
    }));

    console.table(mappedAppointments)

    return {
      success: true,
      data: mappedAppointments,
    };
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return {
      success: false,
      error: "Failed to fetch today's appointments",
    };
  }
}
