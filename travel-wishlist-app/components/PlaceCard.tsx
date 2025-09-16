import React from 'react';
import type { Place } from '../types';
import { TrashIcon, CheckIcon } from './icons';
import { Spinner } from './Spinner';

interface PlaceCardProps {
  place: Place;
  onDelete: () => void;
  onToggleVisited: () => void;
  onSelect: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onDelete, onToggleVisited, onSelect }) => {
  const isVisited = place.visited;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleToggleVisited = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisited();
  };

  return (
    <div 
      className={`relative group bg-gray-700 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 ${place.isFetchingDetails ? 'cursor-wait' : 'cursor-pointer'} ${isVisited ? 'shadow-2xl shadow-emerald-500/50' : 'hover:scale-105 hover:shadow-emerald-500/20'}`}
      onClick={onSelect}
    >
      {place.isFetchingDetails && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <Spinner />
          <p className="text-sm text-gray-300 mt-2">Fetching details...</p>
        </div>
      )}

      <img src={place.imageUrl} alt={place.name} className={`w-full h-40 object-cover transition-all duration-300 ${isVisited ? 'filter grayscale brightness-50' : ''}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      
       <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <div className="flex flex-wrap gap-1 mb-1">
          {place.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs font-semibold bg-black/50 text-emerald-300 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-lg truncate">{place.name}</h3>
      </div>


      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 bg-red-600/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-500 z-10"
        aria-label={`Delete ${place.name}`}
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      <button
        onClick={handleToggleVisited}
        className={`absolute top-2 left-2 p-1.5 rounded-full text-white transition-colors duration-300 z-10 ${isVisited ? 'opacity-100 bg-emerald-500' : 'bg-gray-500/50 opacity-0 group-hover:opacity-100 hover:bg-emerald-600'}`}
        aria-label={`Mark ${place.name} as ${isVisited ? 'not visited' : 'visited'}`}
      >
        <CheckIcon className="w-4 h-4" />
      </button>
    </div>
  );
};