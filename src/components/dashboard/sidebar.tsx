import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Hospital, ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppRole, getRolePermissions } from "@/lib/permissions";
import { 
  MENU_STRUCTURE, 
  isMenuItemVisible, 
  getVisibleSubmenuItems,
  MenuItem 
} from "@/lib/menu-config";

interface SidebarProps {
  userRole: AppRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());
  
  // Get user permissions based on role
  const userPermissions = getRolePermissions(userRole);

  console.log('Sidebar Debug:', { userRole, userPermissions, menuStructure: MENU_STRUCTURE });
  // Initialize expanded submenus - all submenus expanded by default
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-expanded-submenus');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setExpandedSubmenus(new Set(parsed));
      } catch (error) {
        // If parsing fails, default to all submenus expanded
        const submenus = MENU_STRUCTURE
          .filter(item => item.submenu && item.submenu.length > 0)
          .map(item => item.label);
        setExpandedSubmenus(new Set(submenus));
      }
    } else {
      // Default: expand all submenus on first visit
      const submenus = MENU_STRUCTURE
        .filter(item => item.submenu && item.submenu.length > 0)
        .map(item => item.label);
      setExpandedSubmenus(new Set(submenus));
    }
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-expanded-submenus', JSON.stringify(Array.from(expandedSubmenus)));
  }, [expandedSubmenus]);

  const handleSubmenuToggle = (itemLabel: string) => {
    setExpandedSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
      } else {
        newSet.add(itemLabel);
      }
      return newSet;
    });
  };

  const isSubmenuItemActive = (submenuItems: MenuItem[]): boolean => {
    return submenuItems.some((subItem) => location.pathname === subItem.href);
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Hospital className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">IPM System</h2>
            <p className="text-sm text-muted-foreground">Medical Equipment</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {MENU_STRUCTURE.map((item) => {
          // For super_admin, show all menu items
          const isVisible = userRole === 'super_admin' || isMenuItemVisible(item, userPermissions);
          const visibleSubmenus = item.submenu 
            ? (userRole === 'super_admin' ? item.submenu : getVisibleSubmenuItems(item.submenu, userPermissions))
            : [];

          return (
            <div key={item.label} className={cn(!isVisible && "hidden")}>
              {item.submenu && item.submenu.length > 0 ? (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => isVisible ? handleSubmenuToggle(item.label) : undefined}
                    disabled={!isVisible}
                    className={cn(
                      "w-full justify-start text-left",
                      !isVisible && "opacity-50 cursor-not-allowed",
                      isVisible && isSubmenuItemActive(visibleSubmenus) && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                    {isVisible && (
                      expandedSubmenus.has(item.label) ? (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )
                    )}
                  </Button>
                  {expandedSubmenus.has(item.label) && isVisible && (
                    <div className="ml-6 mt-2 space-y-2">
                      {visibleSubmenus.map((subItem) => (
                        <Link key={subItem.href} to={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left",
                              location.pathname === subItem.href && "bg-primary/10 text-primary"
                            )}
                          >
                            <subItem.icon className="h-4 w-4 mr-3" />
                            {subItem.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link to={isVisible ? item.href : "#"} className={cn(!isVisible && "pointer-events-none")}>
                  <Button
                    variant="ghost"
                    disabled={!isVisible}
                    className={cn(
                      "w-full justify-start text-left",
                      !isVisible && "opacity-50 cursor-not-allowed",
                      isVisible && location.pathname === item.href && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}