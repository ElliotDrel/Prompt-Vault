import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/NavLink";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    // For dashboard, match all /dashboard/* routes
    if (path === '/dashboard') {
      return location.pathname.startsWith('/dashboard');
    }
    // For library, match all /library/* routes
    if (path === '/library') {
      return location.pathname.startsWith('/library');
    }
    // For other routes, use exact match
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between relative">
          {/* Logo and name - left side */}
          <div className="flex-1">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/icon0.svg" alt="Prompt Vault" className="h-6 w-6" />
              <span className="font-semibold text-lg">Prompt Vault</span>
            </Link>
          </div>
          {/* Centered navigation buttons */}
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
              variant={isActive('/library') ? 'default' : 'ghost'}
              className="text-sm font-medium"
              asChild
            >
              <NavLink to="/library">
                Library
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
          <div className="flex-1 flex justify-end"> {/* Spacer + right alignment */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};
