
import React from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://i.ibb.co/6P8fCgC/cloudy-logo.png" alt="Cloudy Logo" className="w-16 h-16 mx-auto mb-4"/>
          <h1 className="text-3xl font-bold text-[#623CEA]">Welcome to Cloudy AI</h1>
          <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
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
                    defaultValue="demo@cloudy.ai"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#623CEA] focus:ring-2 focus:ring-[#623CEA]/50 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    defaultValue="demopassword"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#623CEA] focus:ring-2 focus:ring-[#623CEA]/50 transition"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                  <div className="text-sm">
                      <a href="#" className="font-medium text-[#623CEA] hover:text-[#5028d9]">
                        Forgot your password?
                      </a>
                  </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#623CEA] hover:bg-[#5028d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#623CEA] transition-colors"
                >
                  Sign in
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
                    Don't have an account?{' '}
                    <a href="#" className="font-medium text-[#623CEA] hover:text-[#5028d9]">
                        Sign up
                    </a>
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
