import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FilePenLine, 
  CheckCircle2, 
  X, 
  Save, 
  RefreshCw,
  Download,
  Send,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

// Define types
interface TreatmentPlanSignatureProps {
  documentId: number;
  clientId: number;
  clientName: string;
  therapistId: number;
  isDisabled?: boolean;
  onSignatureComplete?: () => void;
}

interface SignatureFieldType {
  type: 'signature' | 'date' | 'text';
  label: string;
  required: boolean;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  value?: string;
}

const TreatmentPlanSignature: React.FC<TreatmentPlanSignatureProps> = ({
  documentId,
  clientId,
  clientName,
  therapistId,
  isDisabled = false,
  onSignatureComplete
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [signatureLink, setSignatureLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureFields, setSignatureFields] = useState<SignatureFieldType[]>([
    {
      type: 'signature',
      label: 'Client Signature',
      required: true,
      xPosition: 100, 
      yPosition: 100,
      width: 300,
      height: 100,
    },
    {
      type: 'date',
      label: 'Date',
      required: true,
      xPosition: 450,
      yPosition: 100,
      width: 150,
      height: 40,
    }
  ]);

  // Handle canvas drawing for signature
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas and set up
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = e instanceof MouseEvent 
      ? e.clientX - rect.left 
      : e.touches[0].clientX - rect.left;
    const y = e instanceof MouseEvent 
      ? e.clientY - rect.top 
      : e.touches[0].clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e instanceof MouseEvent 
      ? e.clientX - rect.left 
      : e.touches[0].clientX - rect.left;
    const y = e instanceof MouseEvent 
      ? e.clientY - rect.top 
      : e.touches[0].clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    
    // Save the signature as data URL
    const signatureData = canvas.toDataURL('image/png');
    setSignature(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  // Create signature request
  const createSignatureRequest = async () => {
    setIsCreatingRequest(true);
    
    try {
      // Generate a unique access URL
      const accessUrl = `sig-${documentId}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // Create the signature request
      const response = await apiRequest('/api/signature-requests', {
        method: 'POST',
        data: {
          documentId,
          requestedById: therapistId,
          requestedForId: clientId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'pending',
          message: `Please review and sign the treatment plan`,
          accessUrl,
          metadata: {
            documentType: 'treatment_plan',
            fields: signatureFields
          }
        }
      });
      
      if (response.id) {
        setSignatureLink(`${window.location.origin}/sign/${accessUrl}`);
        toast({
          title: "Signature Request Created",
          description: "The signature request has been created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating signature request:", error);
      toast({
        title: "Error",
        description: "Could not create signature request",
        variant: "destructive"
      });
    } finally {
      setIsCreatingRequest(false);
    }
  };

  // Send signature request via email
  const sendSignatureRequest = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you'd call an API to send the email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      
      toast({
        title: "Signature Request Sent",
        description: `The signature request has been sent to ${clientName}`,
      });
      setIsOpen(false);
      if (onSignatureComplete) onSignatureComplete();
    } catch (error) {
      console.error("Error sending signature request:", error);
      toast({
        title: "Error",
        description: "Could not send signature request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy signature link to clipboard
  const copySignatureLink = () => {
    if (!signatureLink) return;
    
    navigator.clipboard.writeText(signatureLink)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      });
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            disabled={isDisabled}
          >
            <FilePenLine className="h-4 w-4" />
            Request Signature
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Request Treatment Plan Signature</DialogTitle>
            <DialogDescription>
              Create an e-signature request for the client to review and sign this treatment plan.
            </DialogDescription>
          </DialogHeader>
          
          {!signatureLink ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid items-center gap-2">
                  <Label htmlFor="client-name">Client</Label>
                  <Input id="client-name" value={clientName} disabled />
                </div>
                
                <div className="grid items-center gap-2">
                  <Label htmlFor="message">Message to Client</Label>
                  <Input 
                    id="message" 
                    defaultValue="Please review and sign the treatment plan" 
                  />
                </div>
                
                <div className="grid items-center gap-2">
                  <Label htmlFor="expiry">Expires After</Label>
                  <select 
                    id="expiry" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="3">3 days</option>
                    <option value="7" selected>7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                
                <div className="grid items-center gap-2">
                  <Label>Add Your Signature (Optional)</Label>
                  <div className="border rounded-md overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      className="touch-none bg-white cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="text-xs"
                      onClick={clearSignature}
                    >
                      Clear Signature
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createSignatureRequest}
                  disabled={isCreatingRequest}
                  className="gap-2"
                >
                  {isCreatingRequest ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FilePenLine className="h-4 w-4" />
                      Create Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-center p-4 bg-green-50 rounded-md">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mr-3" />
                  <p className="text-green-800 font-medium">Signature request created successfully!</p>
                </div>
                
                <div className="grid items-center gap-2">
                  <Label htmlFor="sig-link">Signature Link</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="sig-link" 
                      value={signatureLink} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copySignatureLink}
                      className={cn("transition-colors", 
                        isCopied ? "bg-green-100 text-green-700 border-green-200" : ""
                      )}
                    >
                      {isCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This link will expire in 7 days.
                  </p>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    if (onSignatureComplete) onSignatureComplete();
                  }}
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
                <Button 
                  className="w-full sm:w-auto gap-2"
                  disabled={isLoading}
                  onClick={sendSignatureRequest}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send to Client
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentPlanSignature;