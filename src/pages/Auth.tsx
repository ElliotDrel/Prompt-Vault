import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { signInWithEmail, exchangeCodeForSession, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code');

  const handleMagicLinkAuth = useCallback(async (code: string) => {
    setLoading(true);
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
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
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
                {codeParam ? 'Signing you in...' : 'Sending magic link...'}
              </span>
            </div>
          )}

          {!loading && !isEmailSent && (
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
