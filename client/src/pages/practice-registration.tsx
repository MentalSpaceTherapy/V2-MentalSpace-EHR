import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  Briefcase,
  AtSign,
  Phone,
  MapPin,
  Globe,
  FileText,
  Shield,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Steps in registration process
type RegistrationStep =
  | "practice-info"
  | "admin-account"
  | "practice-details"
  | "verification";

export default function PracticeRegistrationPage() {
  const [_, setLocation] = useLocation();
  const { registerMutation } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("practice-info");
  
  // Practice Info form state
  const [practiceName, setPracticeName] = useState("");
  const [practiceType, setPracticeType] = useState("Solo Practice");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [practiceEmail, setPracticeEmail] = useState("");
  const [practicePhone, setPracticePhone] = useState("");
  const [practiceAddress, setPracticeAddress] = useState("");
  const [practiceWebsite, setPracticeWebsite] = useState("");
  
  // Admin Account form state
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminRole, setAdminRole] = useState("Administrator");
  
  // Practice Details form state
  const [practiceSize, setPracticeSize] = useState("1-5");
  const [acceptingNewClients, setAcceptingNewClients] = useState(true);
  const [insuranceAccepted, setInsuranceAccepted] = useState<string[]>([]);
  const [practiceDescription, setPracticeDescription] = useState("");
  
  // Privacy and Terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle step navigation
  const handleNext = () => {
    switch (currentStep) {
      case "practice-info":
        // Validation before proceeding
        if (!practiceName || !practiceEmail || !practicePhone) {
          toast({
            title: "Missing information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("admin-account");
        break;
        
      case "admin-account":
        // Validation before proceeding
        if (!adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
          toast({
            title: "Missing information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return;
        }
        if (adminPassword !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure your passwords match",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("practice-details");
        break;
        
      case "practice-details":
        // Validation before proceeding
        if (!practiceSize || !practiceDescription) {
          toast({
            title: "Missing information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("verification");
        break;
        
      case "verification":
        handleSubmitRegistration();
        break;
    }
  };
  
  const handlePrevious = () => {
    switch (currentStep) {
      case "admin-account":
        setCurrentStep("practice-info");
        break;
      case "practice-details":
        setCurrentStep("admin-account");
        break;
      case "verification":
        setCurrentStep("practice-details");
        break;
      default:
        setLocation("/auth");
    }
  };
  
  // Handle form submission
  const handleSubmitRegistration = async () => {
    if (!agreedToTerms || !agreedToPrivacy) {
      toast({
        title: "Agreement required",
        description: "You must agree to the terms and privacy policy",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register the admin account first
      await registerMutation.mutateAsync({
        username: adminEmail,
        password: adminPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        role: adminRole,
        // Additional practice metadata
        practiceMetadata: {
          practiceName,
          practiceType,
          specialties,
          practicePhone,
          practiceAddress,
          practiceWebsite,
          practiceSize,
          acceptingNewClients,
          insuranceAccepted,
          practiceDescription
        }
      });
      
      // Show success message
      toast({
        title: "Practice Registration Successful",
        description: `Welcome to MentalSpace EHR, ${practiceName}!`,
      });
      
      // Redirect to dashboard
      setTimeout(() => setLocation("/"), 2000);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not complete registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle specialty selection
  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };
  
  // Toggle insurance selection
  const toggleInsurance = (insurance: string) => {
    if (insuranceAccepted.includes(insurance)) {
      setInsuranceAccepted(insuranceAccepted.filter(i => i !== insurance));
    } else {
      setInsuranceAccepted([...insuranceAccepted, insurance]);
    }
  };
  
  // Step indicator component
  const StepIndicator = () => (
    <div className="flex justify-between mb-8 px-2">
      {["Practice Info", "Admin Account", "Practice Details", "Verification"].map(
        (step, index) => {
          const stepKey = ["practice-info", "admin-account", "practice-details", "verification"][index] as RegistrationStep;
          const isActive = currentStep === stepKey;
          const isPast = 
            (currentStep === "admin-account" && index === 0) ||
            (currentStep === "practice-details" && (index === 0 || index === 1)) ||
            (currentStep === "verification" && index < 3);
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
                  ${isActive 
                    ? "bg-primary text-white" 
                    : isPast 
                      ? "bg-green-100 text-green-600 border border-green-600" 
                      : "bg-gray-100 text-gray-400"
                  }`}
              >
                {isPast ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={`text-xs ${
                  isActive ? "text-primary font-medium" : isPast ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-primary-50 p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Practice Registration
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
        
        <Card className="shadow-xl border-0">
          <CardHeader>
            <StepIndicator />
            <CardTitle className="text-xl font-bold text-center">
              {currentStep === "practice-info" && "Practice Information"}
              {currentStep === "admin-account" && "Create Admin Account"}
              {currentStep === "practice-details" && "Practice Details"}
              {currentStep === "verification" && "Review & Submit"}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === "practice-info" && "Tell us about your practice"}
              {currentStep === "admin-account" && "Create the administrator account for your practice"}
              {currentStep === "practice-details" && "Add more details about your services"}
              {currentStep === "verification" && "Verify your information and complete registration"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Practice Info Step */}
            {currentStep === "practice-info" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="practice-name">Practice Name*</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="practice-name"
                      placeholder="Enter practice name"
                      className="pl-10"
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="practice-type">Practice Type*</Label>
                  <Select value={practiceType} onValueChange={setPracticeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select practice type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo Practice">Solo Practice</SelectItem>
                      <SelectItem value="Group Practice">Group Practice</SelectItem>
                      <SelectItem value="Clinic">Clinic</SelectItem>
                      <SelectItem value="Community Mental Health">Community Mental Health</SelectItem>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Telehealth">Telehealth</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Anxiety",
                      "Depression",
                      "Trauma",
                      "Addiction",
                      "Family Therapy",
                      "Child & Adolescent",
                      "Couples Therapy",
                      "Grief & Loss",
                      "LGBTQ+",
                      "Eating Disorders",
                    ].map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={specialties.includes(specialty)}
                          onCheckedChange={() => toggleSpecialty(specialty)}
                        />
                        <Label htmlFor={`specialty-${specialty}`} className="text-sm">
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="practice-email">Email Address*</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="practice-email"
                      type="email"
                      placeholder="practice@example.com"
                      className="pl-10"
                      value={practiceEmail}
                      onChange={(e) => setPracticeEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="practice-phone">Phone Number*</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="practice-phone"
                      placeholder="(555) 123-4567"
                      className="pl-10"
                      value={practicePhone}
                      onChange={(e) => setPracticePhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="practice-address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="practice-address"
                      placeholder="123 Therapy St, City, State ZIP"
                      className="pl-10"
                      value={practiceAddress}
                      onChange={(e) => setPracticeAddress(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="practice-website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="practice-website"
                      placeholder="https://www.example.com"
                      className="pl-10"
                      value={practiceWebsite}
                      onChange={(e) => setPracticeWebsite(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Admin Account Step */}
            {currentStep === "admin-account" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-first-name">First Name*</Label>
                    <Input
                      id="admin-first-name"
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-last-name">Last Name*</Label>
                    <Input
                      id="admin-last-name"
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email Address*</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      className="pl-10"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This will be your login username
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password*</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password*</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-role">Role*</Label>
                  <Select value={adminRole} onValueChange={setAdminRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Practice Owner">Practice Owner</SelectItem>
                      <SelectItem value="Therapist">Therapist</SelectItem>
                      <SelectItem value="Office Manager">Office Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Practice Details Step */}
            {currentStep === "practice-details" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="practice-size">Practice Size*</Label>
                  <Select value={practiceSize} onValueChange={setPracticeSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 Clinicians</SelectItem>
                      <SelectItem value="6-10">6-10 Clinicians</SelectItem>
                      <SelectItem value="11-20">11-20 Clinicians</SelectItem>
                      <SelectItem value="21-50">21-50 Clinicians</SelectItem>
                      <SelectItem value="50+">50+ Clinicians</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Accepting New Clients</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accepting-clients"
                      checked={acceptingNewClients}
                      onCheckedChange={(checked) => 
                        setAcceptingNewClients(checked === true)
                      }
                    />
                    <Label htmlFor="accepting-clients">
                      Yes, we are currently accepting new clients
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Insurance Accepted</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Blue Cross",
                      "Aetna",
                      "Cigna",
                      "UnitedHealthcare",
                      "Medicare",
                      "Medicaid",
                      "Tricare",
                      "Kaiser",
                      "Self-Pay",
                      "Sliding Scale",
                    ].map((insurance) => (
                      <div key={insurance} className="flex items-center space-x-2">
                        <Checkbox
                          id={`insurance-${insurance}`}
                          checked={insuranceAccepted.includes(insurance)}
                          onCheckedChange={() => toggleInsurance(insurance)}
                        />
                        <Label htmlFor={`insurance-${insurance}`} className="text-sm">
                          {insurance}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="practice-description">Practice Description*</Label>
                  <Textarea
                    id="practice-description"
                    placeholder="Tell potential clients about your practice, approach, and values..."
                    rows={5}
                    value={practiceDescription}
                    onChange={(e) => setPracticeDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Verification Step */}
            {currentStep === "verification" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-primary" />
                    Practice Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-gray-500">Practice Name:</p>
                    <p className="font-medium">{practiceName}</p>
                    
                    <p className="text-gray-500">Type:</p>
                    <p className="font-medium">{practiceType}</p>
                    
                    <p className="text-gray-500">Email:</p>
                    <p className="font-medium">{practiceEmail}</p>
                    
                    <p className="text-gray-500">Phone:</p>
                    <p className="font-medium">{practicePhone}</p>
                    
                    {practiceAddress && (
                      <>
                        <p className="text-gray-500">Address:</p>
                        <p className="font-medium">{practiceAddress}</p>
                      </>
                    )}
                    
                    {practiceWebsite && (
                      <>
                        <p className="text-gray-500">Website:</p>
                        <p className="font-medium">{practiceWebsite}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Admin Account
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-gray-500">Name:</p>
                    <p className="font-medium">{`${adminFirstName} ${adminLastName}`}</p>
                    
                    <p className="text-gray-500">Email:</p>
                    <p className="font-medium">{adminEmail}</p>
                    
                    <p className="text-gray-500">Role:</p>
                    <p className="font-medium">{adminRole}</p>
                  </div>
                </div>
                
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-primary" />
                    Practice Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <p className="text-gray-500">Size:</p>
                      <p className="font-medium">{practiceSize} Clinicians</p>
                      
                      <p className="text-gray-500">Accepting Clients:</p>
                      <p className="font-medium">{acceptingNewClients ? "Yes" : "No"}</p>
                    </div>
                    
                    {specialties.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-1">Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {specialties.map(specialty => (
                            <span key={specialty} className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {insuranceAccepted.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-1">Insurance Accepted:</p>
                        <div className="flex flex-wrap gap-1">
                          {insuranceAccepted.map(insurance => (
                            <span key={insurance} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {insurance}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-gray-500 mb-1">Description:</p>
                      <p className="text-sm">{practiceDescription}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => 
                          setAgreedToTerms(checked === true)
                        }
                        required
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none flex items-center"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          I agree to the
                          <a href="#" className="text-primary mx-1 hover:underline">
                            Terms of Service
                          </a>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={agreedToPrivacy}
                        onCheckedChange={(checked) => 
                          setAgreedToPrivacy(checked === true)
                        }
                        required
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="privacy"
                          className="text-sm font-medium leading-none flex items-center"
                        >
                          <Shield className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          I agree to the
                          <a href="#" className="text-primary mx-1 hover:underline">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isLoading
                ? "Processing..."
                : currentStep === "verification"
                ? "Complete Registration"
                : "Continue"}
              {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}