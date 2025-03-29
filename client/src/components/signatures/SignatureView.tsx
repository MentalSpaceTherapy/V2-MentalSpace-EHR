import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Save, 
  RefreshCw, 
  Edit3, 
  Calendar, 
  AlertTriangle,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface SignatureViewProps {
  accessUrl: string;
  accessCode?: string;
}

interface SignatureField {
  id: number;
  fieldType: string;
  label: string;
  required: boolean;
  pageNumber: number;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  value: string | null;
  order: number;
}

interface SignatureRequest {
  id: number;
  documentId: number;
  requestedAt: string;
  expiresAt: string | null;
  status: string;
  message: string | null;
  accessCode: string | null;
}

interface Document {
  id: number;
  title: string;
  content: string;
  type: string;
  status: string;
  clientName: string;
  therapistName: string;
}

const SignatureView: React.FC<SignatureViewProps> = ({ 
  accessUrl,
  accessCode
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(!accessCode);
  const [request, setRequest] = useState<SignatureRequest | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [fields, setFields] = useState<SignatureField[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentField, setCurrentField] = useState<SignatureField | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load signature request data
  useEffect(() => {
    const fetchSignatureRequest = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest(`/api/signature-requests/access/${accessUrl}`, {
          method: 'GET',
        });
        
        if (response && response.request) {
          setRequest(response.request);
          setDocument(response.document);
          setFields(response.fields || []);
          
          // Record view event
          await apiRequest(`/api/signature-events`, {
            method: 'POST',
            data: {
              requestId: response.request.id,
              eventType: 'viewed',
              ipAddress: '', // Will be filled by server
              userAgent: navigator.userAgent,
              metadata: {}
            }
          });
          
          if (response.request.status === 'completed') {
            setIsCompleted(true);
          } else if (response.request.status === 'rejected' || 
                    response.request.status === 'expired' || 
                    response.request.status === 'cancelled') {
            setError(`This signature request has been ${response.request.status}.`);
          } else if (response.request.expiresAt && new Date(response.request.expiresAt) < new Date()) {
            setError("This signature request has expired.");
          }
        } else {
          setError("Invalid signature request.");
        }
      } catch (err) {
        console.error('Error fetching signature request:', err);
        setError("Could not load the signature request. It may have expired or been removed.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isCodeVerified) {
      fetchSignatureRequest();
    }
  }, [accessUrl, isCodeVerified]);

  // Handle canvas setup for signature field
  useEffect(() => {
    if (!currentField || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set up drawing style
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
  }, [currentField]);

  // Verify access code
  const verifyAccessCode = () => {
    if (accessCodeInput === accessCode) {
      setIsCodeVerified(true);
    } else {
      toast({
        title: "Invalid Code",
        description: "The access code you entered is incorrect.",
        variant: "destructive"
      });
    }
  };

  // Handle starting to draw
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
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

  // Handle drawing movement
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
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

  // Handle stop drawing
  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current || !currentField) return;
    
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    
    // Save signature image
    const signatureData = canvas.toDataURL('image/png');
    
    // Update field value
    const updatedFields = fields.map(field => 
      field.id === currentField.id 
        ? { ...field, value: signatureData } 
        : field
    );
    
    setFields(updatedFields);
  };

  // Clear current signature
  const clearSignature = () => {
    if (!canvasRef.current || !currentField) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear field value
    const updatedFields = fields.map(field => 
      field.id === currentField.id 
        ? { ...field, value: null } 
        : field
    );
    
    setFields(updatedFields);
  };

  // Handle setting date field value
  const handleDateField = (field: SignatureField) => {
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    
    const updatedFields = fields.map(f => 
      f.id === field.id 
        ? { ...f, value: dateStr } 
        : f
    );
    
    setFields(updatedFields);
  };

  // Handle text field change
  const handleTextFieldChange = (field: SignatureField, value: string) => {
    const updatedFields = fields.map(f => 
      f.id === field.id 
        ? { ...f, value } 
        : f
    );
    
    setFields(updatedFields);
  };

  // Check if all required fields are completed
  const areRequiredFieldsComplete = () => {
    return fields.every(field => !field.required || field.value);
  };

  // Complete signature process
  const completeSignature = async () => {
    if (!request || !areRequiredFieldsComplete()) return;
    
    setIsSigning(true);
    
    try {
      // Update signature fields
      for (const field of fields) {
        if (field.value) {
          await apiRequest(`/api/signature-fields/${field.id}`, {
            method: 'PATCH',
            data: {
              value: field.value,
              completedAt: new Date().toISOString()
            }
          });
        }
      }
      
      // Complete signature request
      await apiRequest(`/api/signature-requests/${request.id}/complete`, {
        method: 'POST'
      });
      
      // Record signature event
      await apiRequest(`/api/signature-events`, {
        method: 'POST',
        data: {
          requestId: request.id,
          eventType: 'signed',
          ipAddress: '', // Will be filled by server
          userAgent: navigator.userAgent,
          metadata: {}
        }
      });
      
      // Update local state
      setIsCompleted(true);
      toast({
        title: "Signed Successfully",
        description: "Your signature has been recorded. Thank you!",
      });
    } catch (err) {
      console.error('Error during signature process:', err);
      toast({
        title: "Error",
        description: "There was a problem completing the signature process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSigning(false);
    }
  };

  // Reject signature request
  const rejectSignature = async () => {
    if (!request) return;
    
    if (window.confirm("Are you sure you want to decline signing this document?")) {
      setIsSigning(true);
      
      try {
        const reason = prompt("Please provide a reason for declining (optional)") || "No reason provided";
        
        // Reject signature request
        await apiRequest(`/api/signature-requests/${request.id}/reject`, {
          method: 'POST',
          data: {
            rejectionReason: reason
          }
        });
        
        // Record rejection event
        await apiRequest(`/api/signature-events`, {
          method: 'POST',
          data: {
            requestId: request.id,
            eventType: 'rejected',
            ipAddress: '', // Will be filled by server
            userAgent: navigator.userAgent,
            metadata: { reason }
          }
        });
        
        // Update local state
        setError("You have declined to sign this document.");
        toast({
          title: "Signature Declined",
          description: "Your decision has been recorded.",
        });
      } catch (err) {
        console.error('Error rejecting signature:', err);
        toast({
          title: "Error",
          description: "There was a problem processing your request. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSigning(false);
      }
    }
  };

  if (accessCode && !isCodeVerified) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 mx-auto text-blue-600 mb-2" />
          <h1 className="text-xl font-semibold text-gray-800">Secure Signature Request</h1>
          <p className="text-gray-600 mt-2">
            This document is protected with an access code. Enter the code you received to view and sign the document.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">Access Code</Label>
            <Input 
              id="access-code" 
              type="text"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              placeholder="Enter access code"
              className="text-center tracking-wider font-mono"
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={verifyAccessCode}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Loading signature request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <XCircle className="h-12 w-12 mx-auto text-red-600 mb-2" />
          <h1 className="text-xl font-semibold text-gray-800">Unable to Process Signature</h1>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-2" />
          <h1 className="text-xl font-semibold text-gray-800">Document Signed Successfully</h1>
          <p className="text-gray-600 mt-2">
            Thank you for signing this document. The process is now complete.
          </p>
        </div>
        
        {document && (
          <div className="p-4 bg-gray-50 rounded-md mt-4">
            <p className="text-sm font-medium text-gray-700">Document: {document.title}</p>
            <p className="text-sm text-gray-600 mt-1">Type: {document.type}</p>
            <p className="text-sm text-gray-600 mt-1">
              Signed on: {format(new Date(), 'MMMM d, yyyy')}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {request && document && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {document.title}
            </h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between mt-2">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Client:</span> {document.clientName}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Provider:</span> {document.therapistName}
                </p>
              </div>
              
              <div className="mt-2 md:mt-0 flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {request.expiresAt 
                    ? `Expires on ${format(new Date(request.expiresAt), 'MMMM d, yyyy')}`
                    : 'Signature required'}
                </span>
              </div>
            </div>
          </div>
          
          {request.message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">{request.message}</p>
            </div>
          )}
          
          <div className="border rounded-md mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-700">Document Content</h2>
            </div>
            <div className="p-4 prose max-w-none">
              {/* This would ideally be rendered HTML or a PDF viewer */}
              <div dangerouslySetInnerHTML={{ __html: document.content }} />
            </div>
          </div>
          
          <div className="border rounded-md mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-700">Required Signatures & Fields</h2>
            </div>
            <div className="p-6 space-y-8">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label 
                    htmlFor={`field-${field.id}`}
                    className="flex items-center gap-1"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  
                  {field.fieldType === 'signature' && (
                    <div className="space-y-2">
                      {field.value ? (
                        <div className="relative border rounded-md p-2 bg-gray-50">
                          <img 
                            src={field.value} 
                            alt="Signature" 
                            className="max-h-[100px] mx-auto"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setCurrentField(field)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-20 border-dashed"
                          onClick={() => setCurrentField(field)}
                        >
                          Click to sign
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {field.fieldType === 'date' && (
                    <div className="flex gap-2 items-center">
                      <Input
                        id={`field-${field.id}`}
                        value={field.value || ''}
                        readOnly
                        placeholder="MM/DD/YYYY"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDateField(field)}
                        disabled={!!field.value}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {field.fieldType === 'text' && (
                    <Input
                      id={`field-${field.id}`}
                      value={field.value || ''}
                      onChange={(e) => handleTextFieldChange(field, e.target.value)}
                      placeholder="Enter text"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={rejectSignature}
              disabled={isSigning}
            >
              Decline to Sign
            </Button>
            <Button
              className="gap-2"
              onClick={completeSignature}
              disabled={isSigning || !areRequiredFieldsComplete()}
            >
              {isSigning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Sign Document
                </>
              )}
            </Button>
          </div>
        </>
      )}
      
      {/* Signature Canvas Dialog */}
      {currentField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-4 border-b">
              <h3 className="font-semibold">{currentField.label}</h3>
            </div>
            
            <div className="p-4">
              <div className="border rounded-md overflow-hidden mb-4">
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
              
              <p className="text-sm text-gray-500 mb-4">
                Use your mouse or finger to sign in the box above.
              </p>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearSignature}
                >
                  Clear
                </Button>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentField(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setCurrentField(null)}
                  disabled={!canvasRef.current}
                >
                  Apply Signature
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureView;