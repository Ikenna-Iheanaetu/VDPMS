"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface PatientDetailsProps {
  patientId: string
}

export default function PatientDetails({ patientId }: PatientDetailsProps) {
  // In a real app, fetch patient data based on ID
  const patient = {
    id: patientId,
    name: "John Doe",
    age: 45,
    gender: "Male",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    bloodType: "A+",
    allergies: ["Penicillin", "Peanuts"],
    medicalHistory: [
      {
        date: "2023-05-01",
        diagnosis: "Hypertension",
        treatment: "Prescribed Lisinopril",
        doctor: "Dr. Smith",
        vitals: {
          bloodPressure: "140/90",
          temperature: "98.6°F",
          heartRate: "75 bpm",
          respiratoryRate: "16/min",
        },
      },
      {
        date: "2023-04-15",
        diagnosis: "Upper Respiratory Infection",
        treatment: "Prescribed antibiotics",
        doctor: "Dr. Johnson",
        vitals: {
          bloodPressure: "120/80",
          temperature: "99.2°F",
          heartRate: "82 bpm",
          respiratoryRate: "18/min",
        },
      },
    ],
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: "2023-05-01",
      },
      {
        name: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        startDate: "2023-04-01",
      },
    ],
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" alt={patient.name} />
              <AvatarFallback>
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{patient.name}</CardTitle>
              <div className="text-muted-foreground">
                {patient.age} years old • {patient.gender} • Blood Type: {patient.bloodType}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium">Contact Information</div>
              <div className="text-sm text-muted-foreground">{patient.email}</div>
              <div className="text-sm text-muted-foreground">{patient.phone}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Allergies</div>
              <div className="flex gap-2 mt-1">
                {patient.allergies.map((allergy) => (
                  <Badge key={allergy} variant="destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="medications">Current Medications</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {patient.medicalHistory.map((record, index) => (
                  <div key={index} className="border-b pb-8 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{record.diagnosis}</h3>
                        <p className="text-sm text-muted-foreground">
                          {record.date} • {record.doctor}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium">Treatment</div>
                        <div className="text-sm text-muted-foreground">{record.treatment}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Vitals</div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Blood Pressure: {record.vitals.bloodPressure}</div>
                          <div>Temperature: {record.vitals.temperature}</div>
                          <div>Heart Rate: {record.vitals.heartRate}</div>
                          <div>Respiratory Rate: {record.vitals.respiratoryRate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.medications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {medication.dosage} • {medication.frequency}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Started: {medication.startDate}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

