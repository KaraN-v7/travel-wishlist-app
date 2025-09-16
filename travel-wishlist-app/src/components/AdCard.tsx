import React from 'react';
import { ExternalLinkIcon } from './icons';

export const AdCard: React.FC = () => {
  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 shadow-xl flex flex-col sm:flex-row items-center gap-6 p-6">
      <div className="flex-shrink-0">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-1-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
        </div>
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-semibold text-emerald-400">Sponsored</p>
        <h3 className="text-xl font-bold text-gray-100 mt-1">Ready for Your Next Adventure?</h3>
        <p className="text-gray-400 mt-2">Find the best deals on flights and hotels to make your dream trip a reality.</p>
      </div>
      <div className="flex-shrink-0">
         <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-500 transition-colors duration-200">
            <span>Find Deals</span>
            <ExternalLinkIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
