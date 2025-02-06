"use server";

import { getCookies } from "@/lib/cookies";
import prisma from "@/lib/prisma";
import { MedicalRecord, Patient, Allergy } from "@prisma/client";

export async function getMedicalHistory(): Promise<MedicalRecord[]> {
  try {
    const currentUser = await getCookies();
    if (currentUser?.role !== "PATIENT") {
      throw new Error("Authentication required");
    }

    const patient = await prisma.patient.findUnique({
      where: { patientId: currentUser.roleSpecificId },
      select: { id: true },
    });

    if (!patient) throw new Error("Patient not found");

    const history = await prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // console.table(history);

    return history;
  } catch (error) {
    console.error("Error fetching medical history:", error);
    throw new Error("Failed to fetch medical history");
  }
}

export async function getPatient(): Promise<
  Patient & {
    user: { email: string; phone: string | null; name: string };
    allergies: Allergy[];
  }
> {
  try {
    const currentUser = await getCookies();
    if (currentUser?.role !== "PATIENT") {
      throw new Error("Authentication required");
    }

    const patient = await prisma.patient.findUnique({
      where: { patientId: currentUser.roleSpecificId },
      include: { user: true, allergies: true },
    });

    // console.log(patient)

    if (!patient) throw new Error("Patient not found");
    return patient;
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw new Error("Failed to fetch patient data");
  }
}

export async function downloadMedicalHistory(): Promise<string> {
  try {
    const history = await getMedicalHistory();
    const csvContent = [
      "Date,Diagnosis,Treatment,Doctor",
      ...history.map(
        (record) =>
          `${record.date.toISOString().split("T")[0]},${record.diagnosis},${
            record.treatment
          },Dr. ${record.doctor.user.name}`
      ),
    ].join("\n");

    return csvContent;
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw new Error("Failed to generate medical history");
  }
}
