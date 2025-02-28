import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pen, LayoutDashboard, Users, FileText, Calendar, MessageSquare, DollarSign, BarChart2, Building, MoreVertical } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Documentation", href: "/documentation", icon: FileText },
    { name: "Scheduling", href: "/scheduling", icon: Calendar },
    { name: "Messages", href: "/messages", icon: MessageSquare, badge: 3 },
    { name: "Billing", href: "/billing", icon: DollarSign },
    { name: "Reports", href: "/reports", icon: BarChart2 },
    { name: "Practice Mgmt", href: "/practice", icon: Building },
  ];

  return (
    <div className={cn("w-64 bg-white h-full shadow-md z-10 fixed left-0 top-0", className)}>
      <div className="h-full flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center">
              <div className="rounded-md bg-primary-50 p-1">
                <Pen className="w-6 h-6 text-primary-500" />
              </div>
              <span className="ml-2 text-lg font-semibold text-neutral-800">MentalSpace</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="pt-3 pb-2">
            <ul>
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "flex items-center px-4 py-3 text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                          isActive && "bg-primary-50 border-l-3 border-primary-500 text-primary-700"
                        )}
                      >
                        <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-700" : "text-neutral-500")} />
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User profile */}
        {user && (
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback>{`${user.firstName[0]}${user.lastName[0]}`}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700">
                  Dr. {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-neutral-500">{user.licenseType}</p>
              </div>
              <button className="ml-auto text-neutral-400 hover:text-neutral-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
