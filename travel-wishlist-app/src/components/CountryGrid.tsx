import React from 'react';
import type { Country, Place } from '../types';
import { CountryCard } from './CountryCard';
import { AdCard } from './AdCard';

interface CountryGridProps {
  countries: Country[];
  onDeletePlace: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
  onSelectPlace: (place: Place) => void;
}

export const CountryGrid: React.FC<CountryGridProps> = ({ countries, onDeletePlace, onToggleVisited, onSelectPlace }) => {
    if (countries.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-300 mb-2">Your Wishlist is Empty</h2>
                <p className="text-gray-400">Add a place above to start your next adventure!</p>
            </div>
        )
    }

  return (
    <div className="space-y-8">
      {countries.reduce((acc, country, index) => {
        acc.push(
          <CountryCard 
            key={country.name} 
            country={country} 
            onDeletePlace={onDeletePlace} 
            onToggleVisited={onToggleVisited} 
            onSelectPlace={onSelectPlace}
          />
        );
        // Insert an ad card after every 3rd country
        if ((index + 1) % 3 === 0 && index < countries.length -1) {
          acc.push(<AdCard key={`ad-${index}`} />);
        }
        return acc;
      }, [] as React.ReactNode[])}
    </div>
  );
};
