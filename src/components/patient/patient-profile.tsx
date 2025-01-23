import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Phone, Mail, MapPin, Droplet } from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  bloodType: string
  phone: string
  email: string
  address: string
}

export function PatientProfile({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.name}`} alt={patient.name} />
            <AvatarFallback>
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-muted-foreground">
              {patient.age} years old, {patient.gender}
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Patient ID: {patient.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplet className="h-4 w-4 text-muted-foreground" />
            <span>Blood Type: {patient.bloodType}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{patient.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{patient.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

