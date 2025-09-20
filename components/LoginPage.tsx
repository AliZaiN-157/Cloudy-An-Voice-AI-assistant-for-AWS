
import React, { useState } from 'react';
import { createApiService } from '../services/apiService';

interface LoginPageProps {
  onLogin: (userId: string, accessToken: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@cloudy.ai');
  const [password, setPassword] = useState('demopassword');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const apiService = createApiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        // Register new user
        const userProfile = await apiService.registerUser({
          username: email.split('@')[0],
          email,
          password,
          full_name: email.split('@')[0]
        });

        // Auto-login after registration
        const tokenData = await apiService.loginUser({
          username: email,
          password
        });

        // Store authentication data
        localStorage.setItem('accessToken', tokenData.access_token);
        localStorage.setItem('userId', userProfile.id);

        onLogin(userProfile.id, tokenData.access_token);
      } else {
        // Login existing user
        const tokenData = await apiService.loginUser({
          username: email,
          password
        });

        // Get user profile
        const userProfile = await apiService.getUserProfile(tokenData.access_token);

        // Store authentication data
        localStorage.setItem('accessToken', tokenData.access_token);
        localStorage.setItem('userId', userProfile.id);

        onLogin(userProfile.id, tokenData.access_token);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://i.ibb.co/6P8fCgC/cloudy-logo.png" alt="Cloudy Logo" className="w-16 h-16 mx-auto mb-4"/>
          <h1 className="text-3xl font-bold text-[#623CEA]">Welcome to Cloudy AI</h1>
          <p className="text-gray-600 mt-2">
            {isRegistering ? 'Create your account' : 'Sign in to access your dashboard'}
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#623CEA] focus:ring-2 focus:ring-[#623CEA]/50 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#623CEA] focus:ring-2 focus:ring-[#623CEA]/50 transition"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              {!isRegistering && (
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-[#623CEA] hover:text-[#5028d9]">
                      Forgot your password?
                    </a>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#623CEA] hover:bg-[#5028d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#623CEA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isRegistering ? 'Creating account...' : 'Signing in...'}
                    </div>
                  ) : (
                    isRegistering ? 'Create account' : 'Sign in'
                  )}
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-[#623CEA] hover:text-[#5028d9]"
                >
                  {isRegistering ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
