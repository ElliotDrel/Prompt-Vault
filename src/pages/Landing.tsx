import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingNav } from '@/components/LandingNav';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <LandingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Manage Your AI Prompts Like a Pro
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Store, organize, and reuse your best AI prompts with intelligent variable handling.
            Never lose track of what works.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Prompt Library, Supercharged
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Create and store unlimited prompts</h3>
                  <p className="text-gray-600 text-sm">Build your personal library of AI prompts with custom variables</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Track usage and copy history</h3>
                  <p className="text-gray-600 text-sm">Automatically monitor which prompts work best for you</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Pin your favorites</h3>
                  <p className="text-gray-600 text-sm">Keep your most-used prompts at the top for instant access</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cloud sync across devices</h3>
                  <p className="text-gray-600 text-sm">Access your prompts anywhere when you sign in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white">
                Try It Free
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Built for Productivity */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Zap className="h-12 w-12 text-blue-600" aria-hidden="true" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Stop Retyping. Start Creating.
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
              Variables like <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">{'{{project_name}}'}</code> or{' '}
              <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">{'{{tone}}'}</code> automatically
              highlight and get replaced when you use a prompt. Save hours of repetitive work and focus on what
              matters—getting better results from AI.
            </p>
          </div>

          <div className="text-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to level up your AI workflow?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join users who've saved hours by organizing their AI prompts.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Sign In / Sign Up
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Prompt Vault. Save time. Get better results.
          </p>
        </div>
      </footer>
    </div>
  );
}
