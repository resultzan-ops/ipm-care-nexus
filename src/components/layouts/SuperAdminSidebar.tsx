import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Hospital, ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SUPER_ADMIN_MENU_STRUCTURE, MenuItem } from "@/lib/super-admin-menu-config";

export function SuperAdminSidebar() {
  const location = useLocation();
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());

  // Initialize expanded submenus - all submenus expanded by default
  useEffect(() => {
    const savedState = localStorage.getItem('super-admin-sidebar-expanded');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setExpandedSubmenus(new Set(parsed));
      } catch (error) {
        // Default: all submenus expanded
        const submenus = SUPER_ADMIN_MENU_STRUCTURE
          .filter(item => item.submenu && item.submenu.length > 0)
          .map(item => item.label);
        setExpandedSubmenus(new Set(submenus));
      }
    } else {
      // Default: expand all submenus on first visit
      const submenus = SUPER_ADMIN_MENU_STRUCTURE
        .filter(item => item.submenu && item.submenu.length > 0)
        .map(item => item.label);
      setExpandedSubmenus(new Set(submenus));
    }
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('super-admin-sidebar-expanded', JSON.stringify(Array.from(expandedSubmenus)));
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
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Hospital className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">IPM System</h2>
            <p className="text-sm text-muted-foreground">Super Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {SUPER_ADMIN_MENU_STRUCTURE.map((item) => (
          <div key={item.label}>
            {item.submenu && item.submenu.length > 0 ? (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => handleSubmenuToggle(item.label)}
                  className={cn(
                    "w-full justify-start text-left",
                    isSubmenuItemActive(item.submenu) && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                  {expandedSubmenus.has(item.label) ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                {expandedSubmenus.has(item.label) && (
                  <div className="ml-6 mt-2 space-y-2">
                    {item.submenu.map((subItem) => (
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
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left",
                    location.pathname === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}