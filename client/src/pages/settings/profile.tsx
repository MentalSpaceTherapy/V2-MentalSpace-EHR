import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  User as UserIcon, 
  Upload, 
  Lock, 
  Shield, 
  Save, 
  Trash2,
  UserPlus,
  FileText,
  Briefcase
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Professional information
  const [licenseType, setLicenseType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [education, setEducation] = useState("");
  const [availableForNewClients, setAvailableForNewClients] = useState(true);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Populate form with user data
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email || "");
      setProfileImage(user.profileImageUrl || null);
      
      // Fetch additional profile details
      fetchProfileDetails();
    }
  }, [user]);
  
  const fetchProfileDetails = async () => {
    if (!user) return;
    
    setIsProfileLoading(true);
    try {
      const response = await apiRequest("GET", `/api/users/${user.id}/profile`);
      const profileData = await response.json();
      
      // Set additional profile details
      setPhone(profileData.phone || "");
      setTitle(profileData.title || "");
      setBio(profileData.bio || "");
      setLicenseType(profileData.licenseType || "");
      setLicenseNumber(profileData.licenseNumber || "");
      setSpecialties(profileData.specialties || []);
      setYearsOfExperience(profileData.yearsOfExperience || "");
      setEducation(profileData.education || "");
      setAvailableForNewClients(profileData.availableForNewClients !== false);
    } catch (error) {
      console.error("Error fetching profile details:", error);
      // Don't show error toast as the endpoint might not exist yet
    } finally {
      setIsProfileLoading(false);
    }
  };
  
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setIsProfileUpdating(true);
    try {
      const userData = {
        firstName,
        lastName,
        email,
        profileDetails: {
          phone,
          title,
          bio,
          licenseType,
          licenseNumber,
          specialties,
          yearsOfExperience,
          education,
          availableForNewClients
        }
      };
      
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      const updatedUser = await response.json();
      
      // Update user data in the query cache
      queryClient.setQueryData(["/api/user"], {
        ...user,
        ...updatedUser
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update profile",
        variant: "destructive"
      });
    } finally {
      setIsProfileUpdating(false);
    }
  };
  
  const handlePasswordUpdate = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive"
      });
      return;
    }
    
    setIsPasswordUpdating(true);
    try {
      await apiRequest("POST", `/api/users/${user.id}/change-password`, {
        currentPassword,
        newPassword
      });
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Password change failed",
        description: error instanceof Error ? error.message : "Could not update password",
        variant: "destructive"
      });
    } finally {
      setIsPasswordUpdating(false);
    }
  };
  
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Normally we'd upload the file to a server here
    // For now, we'll just use a data URL
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!firstName && !lastName) return "U";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
  
  // Toggle specialty selection
  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            Professional
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information visible to your clients and colleagues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt={`${firstName} ${lastName}`} />
                    ) : null}
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="profile-image" className="cursor-pointer">
                      <div className="flex items-center gap-1 text-sm text-primary hover:underline">
                        <Upload className="h-3.5 w-3.5" />
                        Upload photo
                      </div>
                      <Input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleProfileImageUpload}
                      />
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Licensed Clinical Psychologist"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about yourself, your approach to therapy, and what they can expect..."
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This will be displayed on your public profile to potential clients.
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <Button
                onClick={handleProfileUpdate}
                disabled={isProfileUpdating}
                className="flex items-center gap-2"
              >
                {isProfileUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isProfileUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Professional Tab */}
        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Update your credentials and practice-related information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="license-type">License Type</Label>
                  <Select value={licenseType} onValueChange={setLicenseType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LPC, LMHC">Licensed Professional Counselor (LPC/LMHC)</SelectItem>
                      <SelectItem value="LCSW">Licensed Clinical Social Worker (LCSW)</SelectItem>
                      <SelectItem value="Psychologist">Psychologist (PhD/PsyD)</SelectItem>
                      <SelectItem value="Psychiatrist">Psychiatrist (MD)</SelectItem>
                      <SelectItem value="LMFT">Licensed Marriage and Family Therapist (LMFT)</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license-number">License Number</Label>
                  <Input
                    id="license-number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years-experience">Years of Experience</Label>
                  <Input
                    id="years-experience"
                    type="number"
                    min="0"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select 
                    value={availableForNewClients ? "available" : "not-available"}
                    onValueChange={(value) => setAvailableForNewClients(value === "available")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available for new clients</SelectItem>
                      <SelectItem value="not-available">Not accepting new clients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    "OCD",
                    "ADHD",
                  ].map((specialty) => (
                    <div key={specialty} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`specialty-${specialty}`}
                        checked={specialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`specialty-${specialty}`} className="text-sm cursor-pointer">
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education & Training</Label>
                <Textarea
                  id="education"
                  placeholder="List your degrees, certifications, and specialized training..."
                  rows={3}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t px-6 py-4">
              <Button
                onClick={handleProfileUpdate}
                disabled={isProfileUpdating}
                className="flex items-center gap-2"
              >
                {isProfileUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isProfileUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password to maintain account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-password"
                    type="password"
                    className="pl-10"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              </div>
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-new-password"
                    type="password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Choose a strong password that includes letters, numbers, and special characters.
              </p>
              <Button
                onClick={handlePasswordUpdate}
                disabled={isPasswordUpdating}
                className="flex items-center gap-2"
              >
                {isPasswordUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {isPasswordUpdating ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Actions here can't be undone. Proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all of your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}