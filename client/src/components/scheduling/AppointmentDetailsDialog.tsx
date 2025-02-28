import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Calendar, Clock, MapPin, Phone, Video, 
  FileText, AlertCircle, Check, X, Play
} from "lucide-react";

interface AppointmentDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: number;
    clientName: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: string;
    medium: string;
    status: string;
    notes?: string;
  } | null;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onStartSession: (id: number) => void;
}

export function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
  onConfirm,
  onCancel,
  onStartSession
}: AppointmentDetailsProps) {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const canStartSession = appointment.status === "Confirmed";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-semibold">
              Appointment Details
            </DialogTitle>
            <Badge 
              variant="outline" 
              className={getStatusColor(appointment.status)}
            >
              {appointment.status}
            </Badge>
          </div>
          <DialogDescription>
            View and manage appointment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Client Info */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">{appointment.clientName}</h3>
            <span className="text-sm text-gray-500">{appointment.type}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="font-medium">
                {format(appointment.date, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-sm text-gray-600">
                {appointment.startTime} - {appointment.endTime}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center">
            {appointment.medium === "Telehealth" ? (
              <Video className="h-5 w-5 mr-2 text-gray-500" />
            ) : (
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            )}
            <p>{appointment.medium}</p>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-gray-700 mt-1">{appointment.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0 flex-wrap">
          {appointment.status === "Pending" && (
            <>
              <Button
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900 mr-2"
                onClick={() => onConfirm(appointment.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm
              </Button>
              <Button
                variant="outline"
                className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900 mr-2"
                onClick={() => onCancel(appointment.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          
          {canStartSession && (
            <Button
              className="bg-blue-500 hover:bg-blue-600 mr-2"
              onClick={() => onStartSession(appointment.id)}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}