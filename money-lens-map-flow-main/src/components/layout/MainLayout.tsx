import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { InlineSearch } from "@/components/ui/InlineSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MainLayout() {
  const { user, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(!showSearch);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
            <SidebarTrigger />
            
                   <div className="flex-1 max-w-md">
                     <Button
                       variant="outline"
                       onClick={() => setShowSearch(!showSearch)}
                       className="w-full justify-start text-muted-foreground"
                     >
                       <Search className="mr-2 h-4 w-4" />
                       Search transactions, merchants...
                       <kbd className="ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                         <span className="text-xs">⌘</span>K
                       </kbd>
                     </Button>
                   </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

                 {/* Search Results */}
                 {showSearch && (
                   <div className="bg-muted/50 border-b border-border p-4">
                     <InlineSearch onClose={() => setShowSearch(false)} />
                   </div>
                 )}

                 {/* Main Content */}
                 <main className="flex-1 p-4 sm:p-6 bg-background">
                   <Outlet />
                 </main>
               </div>
             </div>
           </SidebarProvider>
         );
       }