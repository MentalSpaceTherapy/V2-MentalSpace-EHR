import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PasswordInput } from '@/components/ui/password-input';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// Define password schema
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const [location] = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [step, setStep] = useState<'validating' | 'reset' | 'success' | 'error'>('validating');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form definition
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Extract token from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.split('?')[1] || '');
    const tokenParam = queryParams.get('token');
    
    if (!tokenParam) {
      setStep('error');
      setError('No reset token provided. Please request a new password reset link.');
      return;
    }
    
    setToken(tokenParam);
    verifyToken(tokenParam);
  }, [location]);

  // Verify token validity
  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get(`/api/auth/reset-password/${token}`);
      if (response.data && response.data.userId) {
        setUserId(response.data.userId);
        setStep('reset');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setStep('error');
      
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data?.message || 'Invalid or expired reset token. Please request a new password reset link.');
      } else {
        setError('Failed to verify reset token. Please try again or request a new password reset link.');
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    if (!token) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      
      setStep('success');
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(error.response.data?.message || 'Failed to reset password. Please try again.');
        }
        
        if (error.response.data?.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          validationErrors.forEach((err: any) => {
            if (err.path) {
              form.setError(err.path as any, { message: err.msg });
            }
          });
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Different content based on current step
  const renderContent = () => {
    switch (step) {
      case 'validating':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Validating your reset token...</p>
          </div>
        );
        
      case 'reset':
        return (
          <>
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter a new secure password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="Enter your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        );
        
      case 'success':
        return (
          <>
            <CardHeader>
              <CardTitle>Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been reset successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>You can now log in with your new password.</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </CardFooter>
          </>
        );
        
      case 'error':
        return (
          <>
            <CardHeader>
              <CardTitle>Password Reset Failed</CardTitle>
              <CardDescription>
                We couldn't reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || 'An unknown error occurred.'}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" onClick={() => navigate('/forgot-password')}>
                Request New Reset Link
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="mx-auto max-w-md w-full">
        <Card>{renderContent()}</Card>
      </div>
    </div>
  );
} 