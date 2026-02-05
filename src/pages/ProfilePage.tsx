import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardContent, CardHeader } from '../components/common/Card';

type Mode = 'login' | 'register';

export function ProfilePage() {
  const { user, login, register, logout, isLoading } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col h-full pb-20">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User info */}
          <Card>
            <CardContent className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl text-emerald-600">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {user.displayName || 'Anonymous User'}
              </h2>
              {user.email && (
                <p className="text-gray-500">{user.email}</p>
              )}
            </CardContent>
          </Card>

          {/* Account section */}
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">Account</h3>
            </CardHeader>
            <CardContent>
              <Button variant="danger" onClick={logout} className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* App info */}
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">About</h3>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>SnapAndSend</strong></p>
              <p>Version 1.0.0</p>
              <p>Report community issues and help improve your neighbourhood.</p>
            </CardContent>
          </Card>

          {/* Copyright */}
          <div className="text-center text-xs text-gray-500 mt-4">
            © Tech84
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <Input
                  label="Display Name"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Anonymous usage note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>You can use SnapAndSend without an account.</p>
          <p>Creating an account lets you manage your reports across devices.</p>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mt-6">
          © Tech84
        </div>
      </main>
    </div>
  );
}
