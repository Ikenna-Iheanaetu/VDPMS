// components/patient-medical-history.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  getMedicalHistory,
  downloadMedicalHistory,
} from "@/actions/patient/medical-history";
import { useToast } from "@/hooks/use-toast";

export function PatientMedicalHistory() {
  const [medicalHistory, setMedicalHistory] = useState<
    Awaited<ReturnType<typeof getMedicalHistory>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getMedicalHistory();
        setMedicalHistory(data);
        setError(null);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed",
          description:
            err instanceof Error
              ? err.message
              : "Failed to load medical history",
        });
        setError(
          err instanceof Error ? err.message : "Failed to load medical history"
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDownload = async () => {
    try {
      const csvData = await downloadMedicalHistory();
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-history.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download history"
      );
    }
  };

  if (loading) return <div>Loading medical history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Medical History</CardTitle>
        <Button variant="outline" size="sm" onClick={handleDownload}>
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
                <TableCell>{record.date.toISOString().split("T")[0]}</TableCell>
                <TableCell>{record.diagnosis}</TableCell>
                <TableCell>{record.treatment}</TableCell>
                <TableCell>Dr. {record.doctor.user.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
