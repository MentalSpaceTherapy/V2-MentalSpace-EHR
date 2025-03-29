import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { StaffList } from "@/components/practice/StaffList";
import { format, addDays, addMonths } from "date-fns";
import { DEFAULT_AVATAR } from "@/lib/constants";

// Mock staff data
const mockStaff = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    role: "Therapist",
    roles: ["Therapist", "Clinical Director"],
    email: "sarah.johnson@mentalspace.com",
    phone: "(555) 123-4567",
    licenseType: "Licensed Professional Counselor (LPC)",
    licenseNumber: "LPC12345",
    licenseExpiration: addMonths(new Date(), 8),
    status: "Active",
    profileImage: DEFAULT_AVATAR
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Williams",
    role: "Therapist",
    roles: ["Therapist"],
    email: "michael.williams@mentalspace.com",
    phone: "(555) 234-5678",
    licenseType: "Licensed Clinical Social Worker (LCSW)",
    licenseNumber: "LCSW67890",
    licenseExpiration: addMonths(new Date(), 3),
    status: "Active",
    profileImage: null
  },
  {
    id: 3,
    firstName: "Emily",
    lastName: "Davis",
    role: "Administrator",
    roles: ["Administrator"],
    email: "emily.davis@mentalspace.com",
    phone: "(555) 345-6789",
    licenseType: null,
    licenseNumber: null,
    licenseExpiration: null,
    status: "Active",
    profileImage: null
  },
  {
    id: 4,
    firstName: "Robert",
    lastName: "Garcia",
    role: "Billing Staff",
    roles: ["Billing Staff"],
    email: "robert.garcia@mentalspace.com",
    phone: "(555) 456-7890",
    licenseType: null,
    licenseNumber: null,
    licenseExpiration: null,
    status: "Active",
    profileImage: null
  },
  {
    id: 5,
    firstName: "Jessica",
    lastName: "Brown",
    role: "Therapist",
    roles: ["Therapist", "Supervisor"],
    email: "jessica.brown@mentalspace.com",
    phone: "(555) 567-8901",
    licenseType: "Licensed Marriage and Family Therapist (LMFT)",
    licenseNumber: "LMFT54321",
    licenseExpiration: addDays(new Date(), 45),
    status: "Active",
    profileImage: null
  },
  {
    id: 6,
    firstName: "Daniel",
    lastName: "Taylor",
    role: "Front Desk",
    roles: ["Front Desk"],
    email: "daniel.taylor@mentalspace.com",
    phone: "(555) 678-9012",
    licenseType: null,
    licenseNumber: null,
    licenseExpiration: null,
    status: "Active",
    profileImage: null
  },
  {
    id: 7,
    firstName: "Jennifer",
    lastName: "Martinez",
    role: "Therapist",
    roles: ["Therapist"],
    email: "jennifer.martinez@mentalspace.com",
    phone: "(555) 789-0123",
    licenseType: "Licensed Psychologist (PhD)",
    licenseNumber: "PSY98765",
    licenseExpiration: addMonths(new Date(), 10),
    status: "Inactive",
    profileImage: null
  }
];

export default function Staff() {
  const { user } = useAuth();

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar title="Staff Management" />
        
        <div className="p-6 bg-neutral-50 min-h-screen">
          <StaffList initialStaff={mockStaff} />
        </div>
      </div>
    </div>
  );
}