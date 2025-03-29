import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, RefreshCcw, AlertCircle } from "lucide-react";
import { useCRM } from "@/hooks/use-crm";

export function ContactLists() {
  const { 
    ccLists, 
    fetchCCLists, 
    createCCList,
    isConstantContactConnected
  } = useCRM();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newList, setNewList] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (isConstantContactConnected) {
      loadLists();
    }
  }, [isConstantContactConnected]);

  const loadLists = async () => {
    setIsLoading(true);
    try {
      await fetchCCLists();
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newList.name.trim()) return;

    setIsLoading(true);
    try {
      await createCCList(newList.name, newList.description);
      setNewList({ name: "", description: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConstantContactConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contact Lists</CardTitle>
          <CardDescription>Manage your Constant Contact email lists</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-600">
              Please connect to Constant Contact to manage your contact lists.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Contact Lists</CardTitle>
          <CardDescription>Manage your Constant Contact email lists</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLists}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Contact List</DialogTitle>
                <DialogDescription>
                  Create a new list to organize your contacts in Constant Contact
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">List Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter list name"
                    value={newList.name}
                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter list description"
                    value={newList.description}
                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={!newList.name.trim() || isLoading}
                >
                  {isLoading ? "Creating..." : "Create List"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && ccLists.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading lists...</div>
          </div>
        ) : ccLists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No contact lists found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first contact list to start managing subscribers.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ccLists.map((list) => (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">{list.name}</TableCell>
                  <TableCell>{list.description || "-"}</TableCell>
                  <TableCell className="text-right">{list.memberCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Total Lists: {ccLists.length}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}