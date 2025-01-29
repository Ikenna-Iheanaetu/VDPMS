// actions/consultation.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { z } from "zod";

const consultationSchema = z.object({
    diagnosis: z.string().min(1, "Diagnosis is required"),
    notes: z.string().min(1, "Consultation notes are required"),
    prescription: z.string().optional(),
    followUpDate: z.string().optional(),
  })

export async function getAppointmentData(appointmentId: string) {
  try {
    const numericAppointmentId = Number(appointmentId);
    if (isNaN(numericAppointmentId)) {
      throw new Error("Invalid appointment ID");
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: numericAppointmentId },
      include: {
        patient: {
          include: {
            user: true,
            allergies: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
        vitals: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    return {
      ...appointment,
      date: appointment.date.toISOString(),
      vitals: appointment.vitals.map(vital => ({
        ...vital,
        createdAt: vital.createdAt.toISOString(),
        updatedAt: vital.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw new Error("Failed to fetch appointment data");
  }
}

export async function saveConsultation(
  appointmentId: string,
  formData: FormData
) {
  const numericAppointmentId = Number(appointmentId);
  if (isNaN(numericAppointmentId)) {
    return { error: "Invalid appointment ID" };
  }

  const rawData = {
    diagnosis: formData.get("diagnosis"),
    notes: formData.get("notes"),
    prescription: formData.get("prescription"),
    followUpDate: formData.get("followUpDate"),
  };

  const validationResult = consultationSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      error: "Validation Error",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { diagnosis, notes, prescription, followUpDate } = validationResult.data;

  try {
    // Verify appointment exists and get related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: numericAppointmentId },
      include: {
        patient: true,
        doctor: true,
        vitals: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Create medical record
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        diagnosis,
        treatment: notes,
        date: new Date(),
        condition: "STABLE",
        patientId: appointment.patient.id,
        doctorId: appointment.doctor.id,
        vitals: {
          connect: appointment.vitals.map(vital => ({ id: vital.id })),
        },
      },
    });

    // Create prescription if exists
    if (prescription) {
      await prisma.medication.create({
        data: {
          patientId: appointment.patient.id,
          name: prescription,
          dosage: "As prescribed",
          frequency: "Daily",
          startDate: new Date(),
        },
      });
    }

    // Update appointment status
    await prisma.appointment.update({
      where: { id: numericAppointmentId },
      data: { status: "COMPLETED" },
    });

    // Create follow-up appointment if requested
    if (followUpDate) {
      await prisma.appointment.create({
        data: {
          patientId: appointment.patient.patientId,
          doctorId: appointment.doctor.doctorId,
          date: new Date(followUpDate),
          type: "FOLLOW_UP",
          status: "SCHEDULED",
          time: appointment.time,
        },
      });
    }

    revalidatePath(`/doctor/appointments/consultation?appointmentId=${appointmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving consultation:", error);
    return {
      error: "Failed to save consultation. Please try again.",
    };
  }
}