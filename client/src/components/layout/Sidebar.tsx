import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { 
  Pen, LayoutDashboard, Users, FileText, Calendar, 
  MessageSquare, DollarSign, BarChart2, Building, 
  MoreVertical, ChevronRight, Brain, Sparkles,
  FileSignature, ClipboardCheck, FilePlus, FileClock,
  FileSpreadsheet, Phone, FileQuestion, ChevronDown, Plus
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  className?: string;
}

// Documentation submenu type
interface DocumentType {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [openDocumentMenu, setOpenDocumentMenu] = useState(false);

  // Get whether the current path starts with a specific prefix
  const isPathActive = (prefix: string) => location.startsWith(prefix);

  // Check if we're on any documentation page to keep menu open
  useEffect(() => {
    if (isPathActive('/documentation')) {
      setOpenDocumentMenu(true);
    }
  }, [location]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Documentation submenu items
  const documentTypes: DocumentType[] = [
    { name: "Intake Forms", href: "/documentation/intake", icon: FilePlus },
    { name: "Progress Notes", href: "/documentation/progress-notes", icon: FileSignature },
    { name: "Treatment Plans", href: "/documentation/treatment-plans", icon: ClipboardCheck },
    { name: "Contact Notes", href: "/documentation/contact-notes", icon: Phone },
    { name: "Absence Notes", href: "/documentation/absence-notes", icon: FileClock },
    { name: "Consultations", href: "/documentation/consultations", icon: FileSpreadsheet },
    { name: "Miscellaneous", href: "/documentation/miscellaneous", icon: FileQuestion },
  ];

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { 
      name: "Documentation", 
      href: "/documentation", 
      icon: FileText,
      hasSubmenu: true 
    },
    { name: "Scheduling", href: "/scheduling", icon: Calendar },
    { name: "Messages", href: "/messages", icon: MessageSquare, badge: 3 },
    { name: "Billing", href: "/billing", icon: DollarSign },
    { name: "Reports", href: "/reports", icon: BarChart2 },
    { name: "Practice Mgmt", href: "/practice", icon: Building },
  ];

  return (
    <div 
      className={cn(
        "w-64 bg-white h-full z-10 fixed left-0 top-0 shadow-[0_0_40px_rgba(118,36,255,0.1)]",
        "animate-fade-in overflow-y-auto", 
        className
      )}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center">
              <div className="rounded-xl bg-gradient-purple p-2 shadow-lg shadow-purple-200">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold gradient-text">MentalSpace</span>
                <div className="flex items-center mt-0.5">
                  <Sparkles className="w-3 h-3 text-primary-400 mr-1" />
                  <span className="text-xs text-primary-600 font-medium">EHR Platform</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="pt-4 pb-2 px-3">
            <ul className="space-y-1.5">
              {navigation.map((item, index) => {
                const isActive = item.hasSubmenu 
                  ? isPathActive(item.href) 
                  : location === item.href;
                const Icon = item.icon;
                
                if (item.hasSubmenu) {
                  // Special handling for Documentation with submenu
                  return (
                    <li 
                      key={item.name}
                      style={{ 
                        animationDelay: `${(index + 1) * 50}ms`,
                      }}
                      className={mounted ? "animate-slide-up" : "opacity-0"}
                    >
                      <Collapsible
                        open={openDocumentMenu}
                        onOpenChange={setOpenDocumentMenu}
                        className="w-full"
                      >
                        <CollapsibleTrigger className="w-full text-left">
                          <div
                            className={cn(
                              "flex items-center px-3 py-3 rounded-xl transition-all duration-200",
                              "hover:bg-primary-50 cursor-pointer group",
                              isActive 
                                ? "bg-primary-50 text-primary-700 shadow-sm" 
                                : "text-neutral-600"
                            )}
                          >
                            <div className={cn(
                              "mr-3 p-2 rounded-lg transition-colors",
                              isActive 
                                ? "bg-primary-100 text-primary-700" 
                                : "text-neutral-500 group-hover:text-primary-600 group-hover:bg-primary-50"
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-medium">{item.name}</span>
                            <ChevronDown className={cn(
                              "ml-auto h-4 w-4 transition-transform duration-200",
                              openDocumentMenu ? "transform rotate-180" : "",
                              isActive ? "text-primary-500" : "text-neutral-400"
                            )} />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-11 mt-0.5 animate-slide-down">
                          <ul className="space-y-1 border-l-2 border-primary-100 ml-1 pl-2">
                            {documentTypes.map((docType, docIndex) => {
                              const isDocActive = location === docType.href;
                              const DocIcon = docType.icon;
                              
                              return (
                                <li key={docType.name} className="py-0.5">
                                  <div className="flex items-center space-x-2">
                                    <Link href={docType.href}>
                                      <a
                                        className={cn(
                                          "flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm flex-1",
                                          "hover:bg-primary-50 group",
                                          isDocActive 
                                            ? "bg-primary-50 text-primary-700 shadow-sm" 
                                            : "text-neutral-500"
                                        )}
                                      >
                                        <DocIcon className={cn(
                                          "h-4 w-4 mr-2",
                                          isDocActive ? "text-primary-600" : "text-neutral-400 group-hover:text-primary-500"
                                        )} />
                                        <span className={cn(
                                          isDocActive ? "font-medium" : "font-normal"
                                        )}>
                                          {docType.name}
                                        </span>
                                        {isDocActive && (
                                          <div className="ml-auto h-2 w-2 rounded-full bg-primary-500"></div>
                                        )}
                                      </a>
                                    </Link>
                                    <Link href={`${docType.href}?new=true`}>
                                      <a
                                        className="p-1.5 rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                        title={`Create New ${docType.name}`}
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                      </a>
                                    </Link>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    </li>
                  );
                }
                
                // Regular menu item
                return (
                  <li 
                    key={item.name}
                    style={{ 
                      animationDelay: `${(index + 1) * 50}ms`,
                    }}
                    className={mounted ? "animate-slide-up" : "opacity-0"}
                  >
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "flex items-center px-3 py-3 rounded-xl transition-all duration-200",
                          "hover:bg-primary-50 cursor-pointer group",
                          isActive 
                            ? "bg-primary-50 text-primary-700 shadow-sm" 
                            : "text-neutral-600"
                        )}
                      >
                        <div className={cn(
                          "mr-3 p-2 rounded-lg transition-colors",
                          isActive 
                            ? "bg-primary-100 text-primary-700" 
                            : "text-neutral-500 group-hover:text-primary-600 group-hover:bg-primary-50"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full animate-pulse-subtle">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={cn(
                          "ml-auto h-4 w-4 opacity-0 -translate-x-2 transition-all duration-200", 
                          isActive ? "opacity-100 translate-x-0 text-primary-500" : "group-hover:opacity-70 group-hover:translate-x-0 text-neutral-400"
                        )} />
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
          <div className="border-t border-neutral-100 p-4 mx-3 my-3 bg-gradient-to-r from-primary-50 to-white rounded-xl card-transition">
            <div className="flex items-center">
              <Avatar className="border-2 border-white shadow-md hover-lift">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="bg-gradient-purple text-white">
                  {`${user.firstName[0]}${user.lastName[0]}`}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-semibold text-neutral-800">
                  Dr. {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-primary-600">{user.licenseType}</p>
              </div>
              <button className="ml-auto text-neutral-400 hover:text-primary-600 p-1 rounded-full hover:bg-primary-50 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
