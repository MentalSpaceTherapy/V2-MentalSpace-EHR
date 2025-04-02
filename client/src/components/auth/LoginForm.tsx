import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Pen, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ username: boolean; password: boolean }>({ username: false, password: false });
  const { loginMutation, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Validate single field
  const validateField = (name: string, value: string) => {
    if (name === 'username') {
      if (!value.trim()) {
        return 'Username is required';
      }
      return undefined;
    }
    
    if (name === 'password') {
      if (!value) {
        return 'Password is required';
      }
      if (value.length < 6) {
        return 'Password must be at least 6 characters';
      }
      return undefined;
    }
    
    return undefined;
  };

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    
    // Only validate if field has been touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Validate all fields before submission
  const validateForm = () => {
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    setErrors({
      username: usernameError,
      password: passwordError
    });
    
    setTouched({
      username: true,
      password: true
    });
    
    return !usernameError && !passwordError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await loginMutation.mutateAsync({
        username,
        password
      });
      
      if (result) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        setLocation("/");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Login error:", error);
      }
      
      // Extract error message if available
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-800 bg-opacity-70 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                <Pen className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-800">MentalSpace EHR</h2>
            <p className="text-neutral-500 mt-1">Secure login to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex justify-between">
                <span>Username</span>
                {errors.username && touched.username && (
                  <span className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.username}
                  </span>
                )}
              </Label>
              <Input 
                id="username" 
                name="username"
                type="text" 
                value={username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your username" 
                required
                disabled={isLoading}
                className={errors.username && touched.username ? "border-red-500" : ""}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex justify-between">
                <span>Password</span>
                {errors.password && touched.password && (
                  <span className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </span>
                )}
              </Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••" 
                required
                disabled={isLoading}
                className={errors.password && touched.password ? "border-red-500" : ""}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>

              <Button 
                variant="link" 
                className="p-0 h-auto text-primary-600 hover:text-primary-800"
                disabled={isLoading}
                type="button"
              >
                Forgot password?
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || Object.values(errors).some(error => !!error)}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="flex items-center justify-center mt-4">
              <p className="text-sm text-neutral-500">
                Protected by 256-bit SSL encryption
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
