import React from 'react';
import Button from './common/Button';
import { LogoIcon } from './common/icons';

interface WelcomeProps {
  onContinue: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onContinue }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in" style={{minHeight: 'calc(100vh - 150px)'}}>
      <LogoIcon className="h-24 w-24 text-brand-blue mb-6" />
      <h1 className="text-4xl font-bold tracking-tight text-brand-dark dark:text-white sm:text-5xl">
        Welcome to Audiscribe
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-2xl">
        Audiscribe is an AI-powered learning platform that transforms spoken lectures into well-structured written courses for the deaf and hard-of-hearing.
      </p>
      <p className="my-4 text-lg border-t-blue-600 py-4 px-2 border-t-1 font-medium"> <span className="text-red-700 font-semibold">Project by</span> Ibidun Moses Segun. <span className="text-red-700 font-semibold">Matric number:</span> NOU  251992667.</p>
      <div className="mt-10">
        <Button onClick={onContinue} className="px-8 py-3 text-lg bg-red-700 text-white">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Welcome;