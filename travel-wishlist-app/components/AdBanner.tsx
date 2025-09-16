import React from 'react';

export const AdBanner: React.FC = () => {
  return (
    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 flex items-center justify-between gap-4">
        <div>
            <p className="text-xs text-gray-400">Ad</p>
            <p className="font-semibold text-gray-200">Book your stay, stress-free.</p>
        </div>
        <a href="#" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-500 transition-colors duration-200 whitespace-nowrap">
            Compare Hotels
        </a>
    </div>
  );
};