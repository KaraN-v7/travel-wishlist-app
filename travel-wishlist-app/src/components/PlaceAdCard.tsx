import React from 'react';
import { ExternalLinkIcon } from './icons';

export const PlaceAdCard: React.FC = () => {
  return (
    <a 
      href="#" 
      target="_blank" 
      rel="noopener noreferrer"
      className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/20 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-gray-600 hover:border-emerald-500"
    >
      <div className="absolute top-2 right-2 text-xs font-semibold bg-black/50 text-emerald-300 px-2 py-0.5 rounded-full">
        Ad
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mb-2">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
      <h4 className="font-bold text-lg text-white">Find Hotel Deals</h4>
      <p className="text-sm text-gray-400 mt-1">Book your perfect stay nearby.</p>
      <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Explore Options</span>
        <ExternalLinkIcon className="w-3 h-3"/>
      </div>
    </a>
  );
};
