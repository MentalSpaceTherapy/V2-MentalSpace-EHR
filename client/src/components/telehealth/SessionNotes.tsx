import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Clock, User } from "lucide-react";

interface SessionNotesProps {
  session: {
    clientName: string;
    sessionType: string;
    scheduledStartTime: Date;
  };
  notes: string;
  onChange: (notes: string) => void;
  onSave: () => void;
}

const SessionNotes: React.FC<SessionNotesProps> = ({
  session,
  notes,
  onChange,
  onSave
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold mb-2">Session Notes</h2>
        <div className="flex items-center text-sm text-neutral-500 mb-1">
          <User className="h-4 w-4 mr-1" />
          <span>{session.clientName}</span>
        </div>
        <div className="flex items-center text-sm text-neutral-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatDate(session.scheduledStartTime)}</span>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <Textarea
          placeholder="Enter your session notes here..."
          className="w-full h-full min-h-[300px] text-sm resize-none"
          value={notes}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      
      <div className="p-4 border-t border-neutral-200">
        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Notes
        </Button>
        
        <p className="text-xs text-neutral-500 mt-2 text-center">
          Notes are automatically encrypted and HIPAA compliant
        </p>
      </div>
    </div>
  );
};

export default SessionNotes;