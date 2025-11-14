import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Processing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      <p className="text-slate-600 text-sm font-medium">{text}</p>
    </div>
  );
};

export default Loader;
