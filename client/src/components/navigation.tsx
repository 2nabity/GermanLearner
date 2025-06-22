import { Link, useLocation } from "wouter";
import { Home, Plus, List, BarChart3, GraduationCap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/add-words", label: "Add Words", icon: Plus },
    { path: "/manage", label: "Manage", icon: List },
    { path: "/test", label: "Test", icon: BarChart3 },
  ];

  const NavContent = () => (
    <nav className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full md:w-auto justify-start ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-gray-600 hover:text-primary hover:bg-blue-50"
              }`}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="bg-surface shadow-material sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-gray-900">German Study Helper</h1>
              <p className="text-xs text-gray-500">Learn • Practice • Master</p>
            </div>
          </Link>
          
          <div className="hidden md:block">
            <NavContent />
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-6">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
