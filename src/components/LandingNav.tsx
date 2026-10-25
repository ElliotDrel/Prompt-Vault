import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LandingNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <span className="text-lg font-bold text-gray-900">Prompt Vault</span>
          </Link>

          {/* Auth Button */}
          <Button onClick={handleAuthClick} className="text-sm font-medium">
            {user ? 'Go to App' : 'Sign In / Sign Up'}
          </Button>
        </div>
      </div>
    </nav>
  );
}
