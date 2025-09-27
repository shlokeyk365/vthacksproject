import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/logo.svg";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Map,
  PieChart,
  Settings,
  Target,
  TrendingUp,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Overview & insights",
  },
  {
    title: "Map View",
    url: "/map",
    icon: Map,
    description: "Geographic spending",
  },
  {
    title: "Spending Caps",
    url: "/caps",
    icon: Target,
    description: "Manage limits",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
    description: "Transaction history",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    description: "Detailed insights",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "Preferences",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground font-semibold shadow-lg border-l-4 border-primary-foreground transform scale-[1.02]"
      : "hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-[1.01] hover:shadow-sm";

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "system") {
      return <Monitor className="w-4 h-4" />;
    }
    return resolvedTheme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r border-sidebar-border bg-sidebar`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <img src={logo} alt="MoneyLens Logo" className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">MoneyLens</h1>
              <p className="text-sm text-sidebar-foreground/60">Financial Tracking</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-sidebar-foreground/60 font-medium">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu className="space-y-3">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      end
                      className={`flex items-center gap-3 px-3 py-4 rounded-md transition-all duration-200 ${getNavCls(
                        { isActive: isActive(item.url) }
                      )}`}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.url) ? 'text-primary-foreground' : ''}`} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs opacity-60 truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="px-6 py-4 mt-auto">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-sidebar-foreground">
                  Quick Stats
                </span>
              </div>
              <div className="text-xs text-sidebar-foreground/60">
                $2,847 spent this month
              </div>
              <div className="text-xs text-success mt-1">
                15% under budget
              </div>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="px-3 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title={`Current theme: ${resolvedTheme} ${theme === "system" ? "(system)" : ""}`}
          >
            {getThemeIcon()}
            {!collapsed && (
              <span className="text-sm">
                {theme === "system" ? "System" : resolvedTheme === "dark" ? "Dark" : "Light"}
              </span>
            )}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}