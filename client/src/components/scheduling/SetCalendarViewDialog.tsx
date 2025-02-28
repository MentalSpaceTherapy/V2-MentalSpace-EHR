import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";

// Mock clinician data
const mockClinicians = [
  { id: 1, name: "Sarah Allen", color: "bg-cyan-600" },
  { id: 2, name: "Ashley Maria Batchu", color: "bg-blue-700" },
  { id: 3, name: "Arlene Bishop-Arrindell", color: "bg-pink-500" },
  { id: 4, name: "Erica Connor", color: "bg-pink-600" },
  { id: 5, name: "Emily Crager", color: "bg-gray-900" },
  { id: 6, name: "Bailey Daugherty", color: "bg-blue-400" },
  { id: 7, name: "Victoria Esnault-Brewer", color: "bg-orange-500" },
  { id: 8, name: "Antoinette Gabriel", color: "bg-pink-400" },
  { id: 9, name: "Brenda Jean-Baptiste", color: "bg-pink-600" },
  { id: 10, name: "Sharon Johnson", color: "bg-blue-500" },
  { id: 11, name: "Kristy Ledford", color: "bg-purple-600" },
  { id: 12, name: "Nosabatha Ntshakaza", color: "bg-gray-900" },
  { id: 13, name: "Paramjeet Singh", color: "bg-gray-900" },
  { id: 14, name: "Jesenia Vegerano", color: "bg-blue-400" },
];

// Mock location data
const mockLocations = [
  { id: 1, name: "All Locations" },
  { id: 2, name: "Main Office" },
  { id: 3, name: "Downtown Clinic" },
  { id: 4, name: "North Satellite Office" },
  { id: 5, name: "Telehealth Only" },
];

// Mock clinician types
const mockClinicianTypes = [
  { id: 1, name: "All Clinicians" },
  { id: 2, name: "Psychiatrists" },
  { id: 3, name: "Therapists" },
  { id: 4, name: "Clinical Social Workers" },
  { id: 5, name: "Psychologists" },
];

interface SetCalendarViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewChange: (settings: CalendarViewSettings) => void;
}

export interface CalendarViewSettings {
  selectedClinicians: number[];
  location: string;
  clinicianType: string;
  hideInactiveClinicians: boolean;
  hideMissedCancelled: boolean;
  showPatientInitials: boolean;
}

export function SetCalendarViewDialog({ 
  open, 
  onOpenChange,
  onViewChange 
}: SetCalendarViewDialogProps) {
  const [selectedClinicians, setSelectedClinicians] = useState<number[]>([9]); // Default to Brenda
  const [location, setLocation] = useState("All Locations");
  const [clinicianType, setClinicianType] = useState("All Clinicians");
  const [hideInactiveClinicians, setHideInactiveClinicians] = useState(true);
  const [hideMissedCancelled, setHideMissedCancelled] = useState(false);
  const [showPatientInitials, setShowPatientInitials] = useState(true);
  
  const handleToggleClinician = (clinicianId: number) => {
    if (selectedClinicians.includes(clinicianId)) {
      setSelectedClinicians(selectedClinicians.filter(id => id !== clinicianId));
    } else {
      setSelectedClinicians([...selectedClinicians, clinicianId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedClinicians.length === mockClinicians.length) {
      setSelectedClinicians([]);
    } else {
      setSelectedClinicians(mockClinicians.map(c => c.id));
    }
  };
  
  const handleApplySettings = () => {
    onViewChange({
      selectedClinicians,
      location,
      clinicianType,
      hideInactiveClinicians,
      hideMissedCancelled,
      showPatientInitials
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Set Calendar View</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Location Filter */}
          <div>
            <Label htmlFor="location">Location:</Label>
            <Select 
              value={location} 
              onValueChange={setLocation}
            >
              <SelectTrigger id="location" className="mt-1 w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map(loc => (
                  <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Clinician Type Filter */}
          <div>
            <Label htmlFor="clinicianType">Clinician Type:</Label>
            <Select 
              value={clinicianType} 
              onValueChange={setClinicianType}
            >
              <SelectTrigger id="clinicianType" className="mt-1 w-full">
                <SelectValue placeholder="Select clinician type" />
              </SelectTrigger>
              <SelectContent>
                {mockClinicianTypes.map(type => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Clinician List */}
        <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
          <div className="flex items-center mb-3">
            <Checkbox 
              id="selectAll" 
              checked={selectedClinicians.length === mockClinicians.length} 
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="selectAll" className="ml-2 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-neutral-500" />
              All
            </Label>
            <span className="ml-auto text-sm text-neutral-500">
              {selectedClinicians.length} Selected
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {mockClinicians.map(clinician => (
              <div key={clinician.id} className="flex items-center">
                <Checkbox 
                  id={`clinician-${clinician.id}`} 
                  checked={selectedClinicians.includes(clinician.id)} 
                  onCheckedChange={() => handleToggleClinician(clinician.id)}
                />
                <Label htmlFor={`clinician-${clinician.id}`} className="ml-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-neutral-500" />
                  <div className={`h-3 w-3 rounded-sm mr-2 ${clinician.color}`}></div>
                  {clinician.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Display Options */}
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center">
            <Checkbox 
              id="hideMissedCancelled" 
              checked={hideMissedCancelled} 
              onCheckedChange={(checked) => setHideMissedCancelled(checked as boolean)}
            />
            <Label htmlFor="hideMissedCancelled" className="ml-2">
              Hide missed/canceled appointments
            </Label>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              id="showPatientInitials" 
              checked={showPatientInitials} 
              onCheckedChange={(checked) => setShowPatientInitials(checked as boolean)}
            />
            <Label htmlFor="showPatientInitials" className="ml-2">
              Show patient initials
            </Label>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              id="hideInactiveClinicians" 
              checked={hideInactiveClinicians} 
              onCheckedChange={(checked) => setHideInactiveClinicians(checked as boolean)}
            />
            <Label htmlFor="hideInactiveClinicians" className="ml-2">
              Include inactive clinicians
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            className="bg-lime-500 hover:bg-lime-600 mt-4" 
            onClick={handleApplySettings}
          >
            Set Calendar View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}