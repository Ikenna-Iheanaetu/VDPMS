"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import AddPatientForm from "./add-patient-form"

interface Patient {
  id: string
  room: string
  condition: string
  issue: string
  lastChecked: string
  vitals: {
    temperature: string
    bloodPressure: string
    heartRate: string
    respiratoryRate: string
  }
}

const initialPatients: Patient[] = [
  {
    id: "VUG/PAT/25/0111",
    room: "201",
    condition: "Stable",
    issue: "Post-operative recovery",
    lastChecked: "1 hour ago",
    vitals: {
      temperature: "98.6°F",
      bloodPressure: "120/80 mmHg",
      heartRate: "72 bpm",
      respiratoryRate: "16 breaths/min",
    },
  },
  {
    id: "VUG/PAT/25/0112",
    room: "ICU-3",
    condition: "Critical",
    issue: "Severe trauma from car accident",
    lastChecked: "30 mins ago",
    vitals: {
      temperature: "101.2°F",
      bloodPressure: "140/90 mmHg",
      heartRate: "90 bpm",
      respiratoryRate: "22 breaths/min",
    },
  },
  {
    id: "VUG/PAT/25/0113",
    room: "305",
    condition: "Stable",
    issue: "Pneumonia, responding well to treatment",
    lastChecked: "2 hours ago",
    vitals: {
      temperature: "98.9°F",
      bloodPressure: "118/78 mmHg",
      heartRate: "68 bpm",
      respiratoryRate: "14 breaths/min",
    },
  },
]

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const { toast } = useToast()

  const filteredPatients = patients.filter((patient) => patient.id.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleUpdateVitals = (patientId: string, newVitals: Patient["vitals"]) => {
    const updatedPatients = patients.map((patient) =>
      patient.id === patientId ? { ...patient, vitals: newVitals, lastChecked: "Just now" } : patient,
    )
    setPatients(updatedPatients)
    toast({
      title: "Vitals Updated",
      description: `Vitals for patient ${patientId} have been updated.`,
    })
    setSelectedPatient(null)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddPatient = (newPatient: any) => {
    const patientToAdd: Patient = {
      ...newPatient,
      lastChecked: "Just now",
      vitals: {
        temperature: "N/A",
        bloodPressure: "N/A",
        heartRate: "N/A",
        respiratoryRate: "N/A",
      },
    }
    setPatients([...patients, patientToAdd])
    setIsAddingPatient(false)
    toast({
      title: "Patient Added",
      description: `New patient ${newPatient.patientId} has been successfully added to the system.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingPatient(true)}>Add New Patient</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Enter the details of the new patient below.</DialogDescription>
            </DialogHeader>
            <AddPatientForm onAddPatient={handleAddPatient} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Patient ID</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="hidden md:table-cell">Issue</TableHead>
              <TableHead className="hidden sm:table-cell">Last Checked</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.id}</TableCell>
                <TableCell>{patient.room}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      patient.condition === "Critical"
                        ? "destructive"
                        : patient.condition === "Emergency"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {patient.condition}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{patient.issue}</TableCell>
                <TableCell className="hidden sm:table-cell">{patient.lastChecked}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Patient Details</DialogTitle>
                        <DialogDescription>Detailed information about patient {selectedPatient?.id}</DialogDescription>
                      </DialogHeader>
                      {selectedPatient && (
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label className="text-lg font-semibold">Patient ID</Label>
                            <Input value={selectedPatient.id} readOnly />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Room</Label>
                              <Input value={selectedPatient.room} readOnly />
                            </div>
                            <div>
                              <Label>Condition</Label>
                              <Input value={selectedPatient.condition} readOnly />
                            </div>
                          </div>
                          <div>
                            <Label>Issue</Label>
                            <Input value={selectedPatient.issue} readOnly />
                          </div>
                          <div>
                            <Label>Last Checked</Label>
                            <Input value={selectedPatient.lastChecked} readOnly />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold">Vitals</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <Label>Temperature</Label>
                                <Input
                                  defaultValue={selectedPatient.vitals.temperature}
                                  onChange={(e) => (selectedPatient.vitals.temperature = e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Blood Pressure</Label>
                                <Input
                                  defaultValue={selectedPatient.vitals.bloodPressure}
                                  onChange={(e) => (selectedPatient.vitals.bloodPressure = e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Heart Rate</Label>
                                <Input
                                  defaultValue={selectedPatient.vitals.heartRate}
                                  onChange={(e) => (selectedPatient.vitals.heartRate = e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Respiratory Rate</Label>
                                <Input
                                  defaultValue={selectedPatient.vitals.respiratoryRate}
                                  onChange={(e) => (selectedPatient.vitals.respiratoryRate = e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={() => handleUpdateVitals(selectedPatient!.id, selectedPatient!.vitals)}
                        >
                          Update Vitals
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

