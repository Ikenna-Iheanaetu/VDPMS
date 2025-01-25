"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface PatientVitals {
  id: string
  name: string
  room: string
  temperature: number
  bloodPressure: string
  heartRate: number
  respiratoryRate: number
  lastUpdated: string
}

const initialPatients: PatientVitals[] = [
  {
    id: "VUG/PAT/25/0111",
    name: "John Doe",
    room: "201",
    temperature: 98.6,
    bloodPressure: "120/80",
    heartRate: 72,
    respiratoryRate: 16,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "VUG/PAT/25/0112",
    name: "Jane Smith",
    room: "ICU-3",
    temperature: 101.2,
    bloodPressure: "140/90",
    heartRate: 90,
    respiratoryRate: 22,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "VUG/PAT/25/0113",
    name: "Bob Johnson",
    room: "305",
    temperature: 98.9,
    bloodPressure: "118/78",
    heartRate: 68,
    respiratoryRate: 14,
    lastUpdated: new Date().toISOString(),
  },
]

export default function VitalsMonitoring() {
  const [patients, setPatients] = useState<PatientVitals[]>(initialPatients)
  const [selectedPatient, setSelectedPatient] = useState<PatientVitals | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      setPatients((prevPatients) =>
        prevPatients.map((patient) => ({
          ...patient,
          temperature: +(patient.temperature + (Math.random() - 0.5) * 0.2).toFixed(1),
          heartRate: Math.round(patient.heartRate + (Math.random() - 0.5) * 2),
          respiratoryRate: Math.round(patient.respiratoryRate + (Math.random() - 0.5)),
          lastUpdated: new Date().toISOString(),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUpdateVitals = (patientId: string, updatedVitals: Partial<PatientVitals>) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              ...updatedVitals,
              lastUpdated: new Date().toISOString(),
            }
          : patient,
      ),
    )
    toast({
      title: "Vitals Updated",
      description: `Vitals for patient ${patientId} have been updated.`,
    })
    setSelectedPatient(null)
  }

  const getVitalStatus = (vital: string, value: number): "normal" | "warning" | "critical" => {
    switch (vital) {
      case "temperature":
        return value < 97 || value > 99 ? (value < 95 || value > 103 ? "critical" : "warning") : "normal"
      case "heartRate":
        return value < 60 || value > 100 ? (value < 50 || value > 120 ? "critical" : "warning") : "normal"
      case "respiratoryRate":
        return value < 12 || value > 20 ? (value < 8 || value > 25 ? "critical" : "warning") : "normal"
      default:
        return "normal"
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <CardTitle>{patient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Patient ID:</span>
                  <span>{patient.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Room:</span>
                  <span>{patient.room}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Temperature:</span>
                  <Badge
                    variant={
                      getVitalStatus("temperature", patient.temperature) as "default" | "secondary" | "destructive"
                    }
                  >
                    {patient.temperature}°F
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Blood Pressure:</span>
                  <span>{patient.bloodPressure} mmHg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Heart Rate:</span>
                  <Badge
                    variant={getVitalStatus("heartRate", patient.heartRate) as "default" | "secondary" | "destructive"}
                  >
                    {patient.heartRate} bpm
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Respiratory Rate:</span>
                  <Badge
                    variant={
                      getVitalStatus("respiratoryRate", patient.respiratoryRate) as
                        | "default"
                        | "secondary"
                        | "destructive"
                    }
                  >
                    {patient.respiratoryRate} breaths/min
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Updated:</span>
                  <span>{new Date(patient.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4" onClick={() => setSelectedPatient(patient)}>
                    Update Vitals
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Update Vitals</DialogTitle>
                    <DialogDescription>Update vitals for {selectedPatient?.name}</DialogDescription>
                  </DialogHeader>
                  {selectedPatient && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="temperature" className="text-right">
                          Temperature
                        </Label>
                        <Input
                          id="temperature"
                          defaultValue={selectedPatient.temperature}
                          className="col-span-3"
                          onChange={(e) =>
                            setSelectedPatient({ ...selectedPatient, temperature: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bloodPressure" className="text-right">
                          Blood Pressure
                        </Label>
                        <Input
                          id="bloodPressure"
                          defaultValue={selectedPatient.bloodPressure}
                          className="col-span-3"
                          onChange={(e) => setSelectedPatient({ ...selectedPatient, bloodPressure: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="heartRate" className="text-right">
                          Heart Rate
                        </Label>
                        <Input
                          id="heartRate"
                          defaultValue={selectedPatient.heartRate}
                          className="col-span-3"
                          onChange={(e) =>
                            setSelectedPatient({ ...selectedPatient, heartRate: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="respiratoryRate" className="text-right">
                          Respiratory Rate
                        </Label>
                        <Input
                          id="respiratoryRate"
                          defaultValue={selectedPatient.respiratoryRate}
                          className="col-span-3"
                          onChange={(e) =>
                            setSelectedPatient({ ...selectedPatient, respiratoryRate: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button onClick={() => handleUpdateVitals(selectedPatient!.id, selectedPatient!)}>
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

