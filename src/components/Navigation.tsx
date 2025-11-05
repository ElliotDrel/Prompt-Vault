import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex space-x-4">
          <Button
            variant={isActive('/dashboard') ? 'default' : 'ghost'}
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium"
          >
            Dashboard
          </Button>
          <Button
            variant={isActive('/history') ? 'default' : 'ghost'}
            onClick={() => navigate('/history')}
            className="text-sm font-medium"
          >
            Copy History
          </Button>
        </nav>
      </div>
    </div>
  );
};