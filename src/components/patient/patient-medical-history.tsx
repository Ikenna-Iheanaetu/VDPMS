import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

const medicalHistory = [
  { id: 1, date: "2023-05-10", diagnosis: "Common Cold", treatment: "Rest and fluids", doctor: "Dr. Smith" },
  {
    id: 2,
    date: "2023-03-22",
    diagnosis: "Sprained Ankle",
    treatment: "RICE method, pain medication",
    doctor: "Dr. Johnson",
  },
  { id: 3, date: "2022-11-15", diagnosis: "Allergic Reaction", treatment: "Antihistamines", doctor: "Dr. Brown" },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PatientMedicalHistory({ patientId }: { patientId: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Medical History</CardTitle>
        <Button variant="outline" size="sm">
          Download Full History
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Doctor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicalHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.diagnosis}</TableCell>
                <TableCell>{record.treatment}</TableCell>
                <TableCell>{record.doctor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

