import React from 'react';
import { User } from '../../types';
import { LogoIcon } from './icons';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onLogoClick?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onLogoClick, theme, onToggleTheme }) => {
  const logoCursorClass = onLogoClick ? 'cursor-pointer' : '';

  return (
    <header className="bg-white shadow-sm dark:bg-slate-800 dark:border-b dark:border-slate-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className={`flex items-center gap-3 text-2xl font-bold text-brand-dark dark:text-brand-light ${logoCursorClass}`}
          onClick={onLogoClick}
        >
          <LogoIcon className="h-8 w-8 text-brand-blue" />
          <span>Audiscribe</span>
        </div>
        {currentUser && (
          <div className="flex items-center gap-4">
             <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser.role}</span> Mode
            </div>
            <Button variant="secondary" onClick={onLogout}>Logout</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;