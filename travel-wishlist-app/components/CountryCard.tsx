import React from 'react';
import type { Country, Place } from '../types';
import { PlaceCard } from './PlaceCard';
import { PlaceAdCard } from './PlaceAdCard';

interface CountryCardProps {
  country: Country;
  onDeletePlace: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
  onSelectPlace: (place: Place) => void;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country, onDeletePlace, onToggleVisited, onSelectPlace }) => {
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
      <header className="flex items-center gap-4 p-4 bg-gray-900/70 border-b border-gray-700">
        <img src={country.flagUrl} alt={`${country.name} flag`} className="w-12 h-8 object-cover rounded-sm shadow-md" />
        <h2 className="text-2xl font-bold text-gray-100">{country.name}</h2>
      </header>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {country.places.reduce((acc, place, index) => {
          acc.push(
            <PlaceCard 
              key={place.id} 
              place={place} 
              onDelete={() => onDeletePlace(place.id)} 
              onToggleVisited={() => onToggleVisited(place.id)}
              onSelect={() => onSelectPlace(place)}
            />
          );
          // Insert a smaller ad card after every 3rd place
          if ((index + 1) % 3 === 0 && index < country.places.length - 1) {
            acc.push(<PlaceAdCard key={`place-ad-${index}`} />);
          }
          return acc;
        }, [] as React.ReactNode[])}
      </div>
    </div>
  );
};