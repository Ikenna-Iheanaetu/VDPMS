'use server'

import prisma from '@/lib/prisma'
import { format } from 'date-fns'


export type Task = {
  id: number
  task: string
  time: string
}

export type CriticalPatient = {
  name: string
  room: string | null
  condition: string | null
  lastChecked: Date
  image: string | null
}

// Fetch all dashboard stats
export async function getNurseStats(nurseId: number) {
  try {
    const [patients, appointments, tasks, criticalPatients] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({
        where: {
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
        }
      }),
      prisma.task.count({
        where: {
          nurseId,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      }),
      prisma.appointment.count({
        where: {
          condition: { in: ['CRITICAL', 'EMERGENCY'] }
        },
        // distinct: ['patientId']
      })
    ])

    return {
      patients,
      appointments,
      tasks,
      criticalPatients
    }
  } catch (error) {
    console.error('Error fetching nurse stats:', error)
    throw new Error('Failed to fetch dashboard statistics')
  }
}

// Fetch upcoming tasks for a nurse
export async function getUpcomingTasks(nurseId: number): Promise<Task[]> {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        nurseId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueTime: { gte: new Date() }
      },
      orderBy: { dueTime: 'asc' },
      take: 4
    })

    return tasks.map(task => ({
      id: task.id,
      task: task.title,
      time: task.dueTime ? format(task.dueTime, 'hh:mm a') : 'N/A'
    }))
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error)
    throw new Error('Failed to fetch upcoming tasks')
  }
}

// Fetch critical patients
export async function getCriticalPatients(): Promise<CriticalPatient[]> {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        condition: { in: ['CRITICAL', 'EMERGENCY'] },
        room: { startsWith: 'ICU' }
      },
      include: {
        patient: {
          include: { user: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    const uniquePatients = new Map<string, CriticalPatient>()
    
    appointments.forEach(app => {
      if (!uniquePatients.has(app.patientId)) {
        uniquePatients.set(app.patientId, {
          name: app.patient.user.name,
          room: app.room,
          condition: app.condition,
          lastChecked: app.updatedAt,
          image: app.patient.user.avatar
        })
      }
    })

    return Array.from(uniquePatients.values())
  } catch (error) {
    console.error('Error fetching critical patients:', error)
    throw new Error('Failed to fetch critical patients')
  }
}

// Complete a task
export async function completeTask(taskId: number) {
  if (!taskId || typeof taskId !== 'number') {
    throw new Error('Invalid task ID')
  }

  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' }
    })

    return updatedTask
  } catch (error) {
    console.error('Error completing task:', error)
    throw new Error('Failed to complete task')
  }
}