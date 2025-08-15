import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, Plus, Search, Filter, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const mockInspections = [
  {
    id: "INS-001",
    equipmentName: "MRI Scanner Philips",
    equipmentId: "EQ-001",
    inspectionType: "Safety Inspection",
    inspector: "Dr. Ahmad Fauzi",
    scheduledDate: "2024-01-15",
    completedDate: "2024-01-15",
    status: "Completed",
    result: "Pass",
    notes: "All safety protocols met. Minor calibration adjustment needed."
  },
  {
    id: "INS-002",
    equipmentName: "Ultrasound GE",
    equipmentId: "EQ-002",
    inspectionType: "Preventive Maintenance",
    inspector: "Teknisi Budi",
    scheduledDate: "2024-01-20",
    completedDate: null,
    status: "Scheduled",
    result: null,
    notes: ""
  },
  {
    id: "INS-003",
    equipmentName: "X-Ray Siemens",
    equipmentId: "EQ-003",
    inspectionType: "Annual Inspection",
    inspector: "Dr. Siti Nurjanah",
    scheduledDate: "2024-01-18",
    completedDate: "2024-01-19",
    status: "Completed",
    result: "Fail",
    notes: "Radiation levels slightly elevated. Equipment requires immediate service."
  },
  {
    id: "INS-004",
    equipmentName: "CT Scanner Toshiba",
    equipmentId: "EQ-004",
    inspectionType: "Quality Assurance",
    inspector: "Dr. Rahman",
    scheduledDate: "2024-01-25",
    completedDate: null,
    status: "Overdue",
    result: null,
    notes: ""
  }
];

export default function Inspections() {
  const userRole = "owner";
  const tenantName = "RS Umum Daerah Bantul";
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInspections = mockInspections.filter(inspection => {
    const matchesStatus = statusFilter === "all" || inspection.status.toLowerCase() === statusFilter;
    const matchesSearch = inspection.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspectionType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string, result?: string | null) => {
    switch (status) {
      case "Completed":
        return (
          <Badge variant={result === "Pass" ? "default" : result === "Fail" ? "destructive" : "secondary"} className="gap-1">
            {result === "Pass" ? <CheckCircle className="h-3 w-3" /> : 
             result === "Fail" ? <XCircle className="h-3 w-3" /> : 
             <CheckCircle className="h-3 w-3" />}
            {status} ({result})
          </Badge>
        );
      case "Scheduled":
        return (
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {status}
          </Badge>
        );
      case "Overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <Clock className="h-3 w-3" />
            {status}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Equipment Inspections</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track equipment inspection records
            </p>
          </div>
          <Button variant="medical" className="gap-2">
            <Plus className="h-4 w-4" />
            New Inspection
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search inspections..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inspections Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Inspection Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inspection ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-medium">{inspection.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{inspection.equipmentName}</div>
                        <div className="text-sm text-muted-foreground">{inspection.equipmentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{inspection.inspectionType}</TableCell>
                    <TableCell>{inspection.inspector}</TableCell>
                    <TableCell>{inspection.scheduledDate}</TableCell>
                    <TableCell>{getStatusBadge(inspection.status, inspection.result)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={inspection.notes}>
                      {inspection.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}