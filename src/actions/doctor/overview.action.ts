// actions/overview-actions.ts
"use server";

import prisma from "@/lib/prisma";
import { AppointmentStatus, ConditionStatus } from "@prisma/client";
import { getCookies } from "@/lib/cookies";

export async function getTodaysAppointments() {
  try {
    const currentUser = await getCookies();
    if (currentUser?.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: currentUser.roleSpecificId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS],
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return {
      success: true,
      data: appointments.map((appointment) => ({
        id: appointment.id,
        name: appointment.patient.user.name,
        type: appointment.type,
        time: appointment.time,
        patientId: appointment.patientId,
        status: appointment.status,
        condition: appointment.condition,
        image: `https://api.dicebear.com/6.x/initials/svg?seed=${appointment.patient.user.name}`
      })),
    };
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    return {
      success: false,
      error: "Failed to fetch today's appointments",
    };
  }
}

export async function getRecentPatients() {
  try {
    const currentUser = await getCookies();
    if (currentUser?.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const patients = await prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            doctorId: currentUser.roleSpecificId,
          },
        },
      },
      take: 5,
      distinct: ["id"],
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        medicalRecords: {
          where: {
            doctorId: currentUser.userId,
          },
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return {
      success: true,
      data: patients.map((patient) => ({
        id: patient.id,
        patientId: patient.patientId,
        name: patient.user.name,
        diagnosis: patient.medicalRecords[0]?.diagnosis || "No diagnosis yet",
        lastVisit: patient.lastVisit || patient.updatedAt,
        condition:
          patient.medicalRecords[0]?.condition || ConditionStatus.STABLE,
        gender: patient.gender,
         image: `https://api.dicebear.com/6.x/initials/svg?seed=${patient.user.name}`,
      })),
    };
  } catch (error) {
    console.error("Error fetching recent patients:", error);
    return {
      success: false,
      error: "Failed to fetch recent patients",
    };
  }
}

export async function fetchCompletedAppointments() {
    try {
      const currentUser = await getCookies();
      if (currentUser?.role !== "DOCTOR") {
        return { success: false, error: "Unauthorized" };
      }

      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: currentUser.roleSpecificId,
          status: "COMPLETED"
        },
        include: {
          patient: {
            include: {
              user: true,
              medicalRecords: {
                take: 1,
                orderBy: {
                  createdAt: "desc"
                }
              }
            }
          },
          vitals: {
            take: 1,
            orderBy: {
              createdAt: "desc"
            }
          }
        },
        orderBy: {
          date: "desc"
        }
      });
  
      return {
        success: true,
        data: appointments.map((appointment) => ({
          id: appointment.id,
          patientId: appointment.patient.patientId,
          patientName: appointment.patient.user.name,
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          reason: appointment.reason,
          diagnosis: appointment.patient.medicalRecords[0]?.diagnosis || "No diagnosis",
          condition: appointment.patient.medicalRecords[0]?.condition || "STABLE",
          vitals: appointment.vitals[0] || null,
          image: `https://api.dicebear.com/6.x/initials/svg?seed=${appointment.patient.user.name}`,
        }))
      };
    } catch (error) {
      console.error("Error fetching completed appointments:", error);
      return {
        success: false,
        error: "Failed to fetch completed appointments"
      };
    }
  }

export async function getDashboardStats() {
  try {
    const currentUser = await getCookies();
    if (currentUser?.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const [totalAppointments, totalPatients] = await Promise.all([
      prisma.appointment.count({
        where: { doctorId: currentUser.roleSpecificId },
      }),
      prisma.patient.count({
        where: {
          appointments: {
            some: {
              doctorId: currentUser.roleSpecificId,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        appointments: totalAppointments,
        patients: totalPatients,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard statistics",
    };
  }
}
