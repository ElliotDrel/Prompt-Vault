import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/NavLink";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    // For dashboard, match all /dashboard/* routes
    if (path === '/dashboard') {
      return location.pathname.startsWith('/dashboard');
    }
    // For other routes, use exact match
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex space-x-4">
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
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </nav>
      </div>
    </div>
  );
};