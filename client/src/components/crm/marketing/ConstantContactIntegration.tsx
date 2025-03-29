import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useCRM } from "@/hooks/use-crm";

export function ConstantContactIntegration() {
  const {
    ccStatus,
    connectConstantContact,
    fetchCCStatus,
    isConstantContactConnected,
  } = useCRM();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectClick = async () => {
    setIsLoading(true);
    try {
      await connectConstantContact();
    } catch (error) {
      console.error("Error connecting to Constant Contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsLoading(true);
    try {
      await fetchCCStatus();
    } catch (error) {
      console.error("Error fetching Constant Contact status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="https://play-lh.googleusercontent.com/P9qPKxQOdCFJS2XveKkOL4K9ZVndErUHUCo-YSeuJIEY_DTvZU9KEl_Nm7Q9_TpUA-U" alt="Constant Contact Logo" className="w-6 h-6" />
          Constant Contact Integration
        </CardTitle>
        <CardDescription>
          Connect your Constant Contact account to send email campaigns directly from MentalSpace
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConstantContactConnected ? (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600 font-medium">Connected to Constant Contact</AlertTitle>
            <AlertDescription className="text-green-600">
              Your Constant Contact account is connected and ready to use. You can now create and manage email campaigns.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-amber-50 border-amber-200 mb-4">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600 font-medium">Not Connected</AlertTitle>
            <AlertDescription className="text-amber-600">
              Connect your Constant Contact account to send email campaigns to your clients and prospects.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            With Constant Contact integration, you can:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Create and manage contact lists</li>
            <li>Build and send email campaigns</li>
            <li>Track email performance metrics</li>
            <li>Automate follow-up sequences</li>
            <li>Create segments based on client data</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          {isConstantContactConnected && (
            <p className="text-xs text-muted-foreground">
              Access your Constant Contact dashboard to view detailed analytics
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {isConstantContactConnected ? (
            <>
              <Button variant="outline" onClick={handleRefreshStatus} disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh Status"}
              </Button>
              <Button 
                className="gap-1" 
                onClick={() => window.open("https://app.constantcontact.com/", "_blank")}
              >
                Open Dashboard <ExternalLink className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={handleConnectClick} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect to Constant Contact"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}