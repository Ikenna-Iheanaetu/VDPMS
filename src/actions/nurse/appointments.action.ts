"use server";

import prisma from "@/lib/prisma";
import { AppointmentStatus, AppointmentType, Priority } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAppointmentRequests() {
  const requests = await prisma.appointmentRequest.findMany({
    where: { status: "PENDING" },
    include: {
      patient: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { preferredDate: "asc" },
  });

  return requests.map((request) => ({
    id: request.id,
    patientName: request.patient.user.name,
    patientId: request.patient.patientId,
    preferredDate: request.preferredDate,
    appointmentType: request.type.toLowerCase().replace("_", "-"),
    reason: request.reason,
    status: request.status.toLowerCase() as
      | "pending"
      | "scheduled"
      | "completed"
      | "cancelled",
    priority: request.priority.toLowerCase() as
      | "normal"
      | "urgent"
      | "emergency",
  }));
}

export async function getScheduledAppointments() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: {
        include: {
          user: true,
        },
      },
      doctor: {
        include: {
          user: true
        }
      },
      vitals: true,
    },
    orderBy: { date: "asc" },
  });

  

  console.log(appointments);

  return appointments.map((appointment) => ({
    id: appointment.id,
    patientName: appointment.patient.user.name,
    patientId: appointment.patient.patientId,
    date: appointment.date,
    time: appointment.time,
    appointmentType: appointment.type.toLowerCase().replace("_", "-"),
    reason: appointment.reason || "",
    status: appointment.status.toLowerCase().replace("_", "-") as "scheduled" | "completed" | "cancelled" | "in-progress",
    vitalsChecked: appointment.vitalsChecked,
    vitals:
      appointment.vitals.length > 0
        ? {
            temperature: appointment.vitals[0].temperature,
            bloodPressure: appointment.vitals[0].bloodPressure,
            heartRate: appointment.vitals[0].heartRate,
            respiratoryRate: appointment.vitals[0].respiratoryRate,
          }
        : undefined,
      doctor: {
        id: appointment.doctor.id,
        label: appointment.doctor.user.name,
        value: appointment.doctorId
      }
  }));
}

export async function createAppointmentRequest(data: {
  patientName: string;
  patientId: string;
  preferredDate: Date;
  appointmentType: AppointmentType;
  reason: string;
  priority: Priority;
}) {
  try {
    console.log(data)
    // Find patient by patientId string to get numeric ID
    const patient = await prisma.patient.findUnique({
      where: { patientId: data.patientId },
      select: { id: true },
    });

    if (!patient) throw new Error("Patient not found");

    await prisma.appointmentRequest.create({
      data: {
        preferredDate: data.preferredDate,
        type: data.appointmentType,
        reason: data.reason,
        priority: data.priority,
        patientId: patient.id,
      },
    });
    revalidatePath("/nurse/appointments");
  } catch (error) {
    console.error("Error creating appointment request:", error);
    throw new Error("Failed to create appointment request");
  }
}

export async function scheduleAppointment(
  requestId: number,
  data: {
    date: Date;
    time: string;
    doctorId: string;
  }
) {
  // First get the appointment request with its type
  const request = await prisma.appointmentRequest.findUnique({
    where: { id: requestId },
    select: {
      type: true,
      reason: true,
      patient: {
        select: {
          patientId: true,
        },
      },
    },
  });

  if (!request) throw new Error("Appointment request not found");
  if (!request.patient) throw new Error("Patient not found");

  await prisma.$transaction([
    prisma.appointmentRequest.update({
      where: { id: requestId },
      data: { status: "SCHEDULED" },
    }),
    prisma.appointment.create({
      data: {
        date: data.date,
        time: data.time,
        type: request.type,
        reason: request.reason,
        status: "SCHEDULED",
        doctor: { connect: { doctorId: data.doctorId } },
        patient: { connect: { patientId: request.patient.patientId } },
      },
    }),
  ]);
  revalidatePath("/nurse/appointments");
}

export async function updateAppointmentStatus(
  appointmentId: number,
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
) {
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: status.toUpperCase().replace("-", "_") as AppointmentStatus,
    },
  });
  revalidatePath("/nurse/appointments");
}

export async function recordVitals(
  appointmentId: number,
  vitals: {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
  }
) {
  await prisma.vitals.create({
    data: {
      ...vitals,
      appointment: {
        connect: { id: appointmentId },
      },
    },
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      vitalsChecked: true,
      status: "IN_PROGRESS",
    },
  });
  revalidatePath("/nurse/appointments");
}

export async function fetchDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        doctorId: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return doctors.map((doctor) => ({
      id: doctor.doctorId,
      label: doctor.user.name,
      value: doctor.doctorId,
    }));
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
}
