import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield } from 'lucide-react';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const { signInWithEmail, signInWithProvider, exchangeCodeForSession, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code');

  const handleMagicLinkAuth = useCallback(async (code: string) => {
    setLoading(true);
    setLoadingText('Signing you in...');
    setError('');

    try {
      const { error } = await exchangeCodeForSession(code);
      if (error) {
        setError('Failed to sign in. Please try again.');
        console.error('Auth error:', error);
      } else {
        setMessage('Successfully signed in! Redirecting...');
        // Navigation will happen via the useEffect when user state updates
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Unexpected auth error:', err);
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  }, [exchangeCodeForSession]);

  // Handle magic link auth code on page load
  useEffect(() => {
    if (!codeParam) {
      return;
    }

    handleMagicLinkAuth(codeParam);
  }, [codeParam, handleMagicLinkAuth]);



  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setLoadingText('Sending magic link...');
    setError('');
    setMessage('');

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined;
      const { error } = await signInWithEmail(email, redirectTo);

      if (error) {
        setError(error.message || 'Failed to send magic link. Please try again.');
      } else {
        setIsEmailSent(true);
        setMessage('Check your email for a magic link to sign in!');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoadingText('Redirecting to Google...');
    setError('');
    setMessage('');
    setIsEmailSent(false);

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined;
      const { error } = await signInWithProvider('google', redirectTo);

      if (error) {
        setError(error.message || 'Failed to sign in with Google. Please try again.');
        setLoading(false);
        setLoadingText('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Google sign in error:', err);
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setMessage('');
    setError('');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Prompt Vault</CardTitle>
          <CardDescription>
            Sign in with your email to access your prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">
                {loadingText || 'Working...'}
              </span>
            </div>
          )}

          {!loading && !isEmailSent && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full relative bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <GoogleIcon className="h-5 w-5 mr-2" />
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="h-px flex-1 bg-gray-200" />
                <span>or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !email}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Magic Link
                </Button>
              </form>
            </div>
          )}

          {!loading && isEmailSent && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Mail className="h-16 w-16 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  We've sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Click the link in your email to sign in. The link will expire in 1 hour.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleTryAgain}
                className="w-full"
              >
                Try a different email
              </Button>
            </div>
          )}

          {message && (
            <Alert className="mt-4">
              <AlertDescription className="text-sm text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              We'll never spam you or share your email with anyone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
