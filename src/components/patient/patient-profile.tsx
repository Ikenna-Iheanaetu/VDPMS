// components/patient-profile.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, Mail, Droplet } from "lucide-react";
import { getPatient } from "@/actions/patient/medical-history";

export function PatientProfile() {
  const [patient, setPatient] =
    useState<Awaited<ReturnType<typeof getPatient>>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPatient();
        setPatient(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load patient data"
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading patient profile...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.user.name}`}
            />
            <AvatarFallback>
              {patient.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{patient.user.name}</h2>
            <p className="text-muted-foreground">
              {patient.age} years old, {patient.gender.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Patient ID: {patient.patientId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplet className="h-4 w-4 text-muted-foreground" />
            <span>Blood Type: {patient.bloodType || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{patient.user.phone || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{patient.user.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
