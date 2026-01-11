import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/NavLink";
import { useLocation } from 'react-router-dom';

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    // For dashboard, match all /dashboard/* routes
    if (path === '/dashboard') {
      return location.pathname.startsWith('/dashboard');
    }
    // For other routes, use exact match
    return location.pathname === path;
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex space-x-4">
          <Button
            variant={isActive('/dashboard') ? 'default' : 'ghost'}
            className="text-sm font-medium"
            asChild
          >
            <NavLink to="/dashboard">
              Dashboard
            </NavLink>
          </Button>
          <Button
            variant={isActive('/history') ? 'default' : 'ghost'}
            className="text-sm font-medium"
            asChild
          >
            <NavLink to="/history">
              Copy History
            </NavLink>
          </Button>
        </nav>
      </div>
    </div>
  );
};