import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Lock, AtSign, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PasswordResetPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"request" | "verification" | "reset">("request");
  
  // Request reset form state
  const [email, setEmail] = useState("");
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  
  // Verification form state
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  
  // New password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  
  // Handle reset request submission
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestLoading(true);
    
    try {
      // API call to request password reset
      await apiRequest("POST", "/api/password-reset/request", { email });
      
      toast({
        title: "Reset email sent",
        description: "Check your email for a verification code",
      });
      
      setStep("verification");
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Could not send reset email",
        variant: "destructive"
      });
    } finally {
      setIsRequestLoading(false);
    }
  };
  
  // Handle verification submission
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyLoading(true);
    
    try {
      // API call to verify token
      await apiRequest("POST", "/api/password-reset/verify", { 
        email, 
        token: verificationToken 
      });
      
      toast({
        title: "Verification successful",
        description: "You can now reset your password",
      });
      
      setStep("reset");
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid or expired verification code",
        variant: "destructive"
      });
    } finally {
      setIsVerifyLoading(false);
    }
  };
  
  // Handle new password submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setIsResetLoading(true);
    
    try {
      // API call to reset password
      await apiRequest("POST", "/api/password-reset/reset", {
        email,
        token: verificationToken,
        newPassword
      });
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in.",
      });
      
      // Redirect to login page
      setTimeout(() => setLocation("/auth"), 2000);
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Could not reset password",
        variant: "destructive"
      });
    } finally {
      setIsResetLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-primary-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (step === "verification") setStep("request");
                else if (step === "reset") setStep("verification");
                else setLocation("/auth");
              }}
              className="p-0 h-8 w-8 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            </div>
          </div>
          <CardDescription className="text-center">
            {step === "request" && "Enter your email to receive a password reset link"}
            {step === "verification" && "Enter the verification code sent to your email"}
            {step === "reset" && "Create a new secure password"}
          </CardDescription>
        </CardHeader>
        
        {step === "request" && (
          <form onSubmit={handleRequestReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all font-medium text-white"
                disabled={isRequestLoading}
              >
                {isRequestLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isRequestLoading ? "Sending..." : "Send Reset Link"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        )}
        
        {step === "verification" && (
          <form onSubmit={handleVerifyToken}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input 
                  id="token" 
                  placeholder="Enter the 6-digit code" 
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  required
                  maxLength={6}
                  className="text-center tracking-widest text-lg"
                />
                <p className="text-xs text-muted-foreground text-center">
                  A 6-digit code has been sent to {email}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all font-medium text-white"
                disabled={isVerifyLoading}
              >
                {isVerifyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isVerifyLoading ? "Verifying..." : "Verify Code"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        )}
        
        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="new-password" 
                    type="password" 
                    className="pl-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all font-medium text-white"
                disabled={isResetLoading}
              >
                {isResetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isResetLoading ? "Updating..." : "Reset Password"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}