import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { AxiosError } from 'axios';
// import https from 'https'; // Removed because 'https' is not available in the browser environment

export default function Login() {
  const navigate = useNavigate();
  const { setToken, setUserRole } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update axios configuration
  const api = axios.create({
    baseURL: 'https://localhost:3000',  // Change to HTTPS
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,  // Add this
    // httpsAgent: new https.Agent({  // Removed because 'https' is not available in the browser environment
    //   rejectUnauthorized: false
    // })
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/login', formData);
      const { token, role } = response.data;

      if (token) {
        setToken(token);
        setUserRole(role); // Make sure this is set
        // Store role in localStorage or context if needed
        localStorage.setItem('userRole', role);
        
        if (role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific backend error messages
        const errorMessage = error.response.data.error || error.response.data.message;
        
        switch (error.response.status) {
          case 401:
            if (errorMessage.includes('verify')) {
              setError('Please verify your email before logging in. Check your inbox for the verification link.');
            } else {
              setError('Invalid username or password');
            }
            break;
          case 404:
            setError('Username not found');
            break;
          case 400:
            setError(errorMessage || 'Invalid login attempt');
            break;
          default:
            setError('Login failed. Please try again');
        }
      } else if ((error as AxiosError).request) {
        setError('Unable to connect to the server. Please try again later.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Please sign in to your account
          </p>
        </div>
        
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-500">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
              ${isLoading 
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
