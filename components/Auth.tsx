import React, { useState } from 'react';
import { User, UserRole } from '../types';
import * as authService from '../services/authService';
import Button from './common/Button';

interface AuthProps {
  onLogin: (user: User) => void;
  onSignUp: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Learner);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        const user = authService.login(email, password);
        onLogin(user);
      } else {
        const newUser = authService.signUp(email, password, role);
        onSignUp(newUser);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-brand-dark dark:text-white sm:text-5xl">
          Welcome to Audiscribe
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
          {isLogin ? 'Log in to your account' : 'Create an account to get started'}
        </p>
      </div>
      <div className="mt-8 p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 placeholder-slate-400 dark:placeholder-slate-400 dark:text-white shadow-sm focus:border-brand-blue focus:outline-none focus:ring-brand-blue sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 placeholder-slate-400 dark:placeholder-slate-400 dark:text-white shadow-sm focus:border-brand-blue focus:outline-none focus:ring-brand-blue sm:text-sm"
              />
            </div>
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a...</label>
              <div className="flex gap-4 text-slate-800 dark:text-slate-200">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="role"
                      value={UserRole.Lecturer}
                      checked={role === UserRole.Lecturer}
                      onChange={() => setRole(UserRole.Lecturer)}
                      className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-slate-400 dark:bg-slate-600"
                    />
                     <span className="text-sm">👩‍🏫 Lecturer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="role"
                      value={UserRole.Learner}
                      checked={role === UserRole.Learner}
                      onChange={() => setRole(UserRole.Learner)}
                      className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-slate-400 dark:bg-slate-600"
                    />
                     <span className="text-sm">👨‍🎓 Learner</span>
                </label>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Button type="submit" className="px-8 py-3 text-lg bg-red-700 text-white">
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleForm} className="ml-1 font-semibold text-brand-blue hover:underline">
                     {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;