import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export function SendGridIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Check SendGrid configuration status
  const { data: sendGridStatus, isLoading: isStatusLoading, refetch } = useQuery({
    queryKey: ['/api/sendgrid/status'],
    queryFn: () => apiRequest('/api/sendgrid/status', { method: 'GET' })
  });
  
  const isConfigured = sendGridStatus?.configured;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="https://sendgrid.com/wp-content/themes/sgdotcom/pages/resource/brand/2016/SendGrid-Logomark.png" 
               alt="SendGrid Logo" 
               className="w-6 h-6" />
          SendGrid Email Integration
        </CardTitle>
        <CardDescription>
          Send personalized email campaigns to clients and leads using SendGrid
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isStatusLoading ? (
          <div className="flex items-center py-2">
            <div className="animate-spin w-4 h-4 border-2 border-primary rounded-full mr-2 border-t-transparent"></div>
            <span>Checking SendGrid configuration...</span>
          </div>
        ) : isConfigured ? (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600 font-medium">SendGrid is Connected</AlertTitle>
            <AlertDescription className="text-green-600">
              Your SendGrid API key is configured and ready to use. You can create and send email campaigns now.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-amber-50 border-amber-200 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600 font-medium">Not Configured</AlertTitle>
            <AlertDescription className="text-amber-600">
              SendGrid API key is not configured. Please set the SENDGRID_API_KEY environment variable to send email campaigns.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <Badge variant={isConfigured ? "default" : "outline"} className="mr-2">
              {isConfigured ? "Connected" : "Not Connected"}
            </Badge>
            {isConfigured && <Badge variant="outline">Transactional Email</Badge>}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsLoading(true);
                refetch().finally(() => setIsLoading(false));
              }}
              disabled={isStatusLoading || isLoading}
            >
              {isLoading || isStatusLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current rounded-full mr-2 border-t-transparent"></div>
                  Checking...
                </>
              ) : (
                "Refresh Status"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <a 
                href="https://app.sendgrid.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Visit SendGrid <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}