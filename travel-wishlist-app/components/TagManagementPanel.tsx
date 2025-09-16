import React, { useMemo } from 'react';
import type { Place } from '../types';
import { PlusIcon, MinusIcon } from './icons';

interface TagManagementPanelProps {
    selectedTag: string;
    allPlaces: Place[];
    onToggleTag: (placeId: string, tag: string) => void;
}

const PlaceListItem: React.FC<{ place: Place, onToggle: () => void, action: 'add' | 'remove' }> = ({ place, onToggle, action }) => (
    <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-3">
            <img src={place.imageUrl} alt={place.name} className="w-10 h-10 object-cover rounded-md" />
            <span className="font-medium text-gray-300">{place.name}</span>
        </div>
        <button
            onClick={onToggle}
            className={`p-1.5 rounded-full transition-colors duration-200 ${action === 'add' ? 'bg-emerald-600/50 hover:bg-emerald-500 text-white' : 'bg-red-600/50 hover:bg-red-500 text-white'}`}
            aria-label={action === 'add' ? `Add tag to ${place.name}` : `Remove tag from ${place.name}`}
        >
            {action === 'add' ? <PlusIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
        </button>
    </div>
);


export const TagManagementPanel: React.FC<TagManagementPanelProps> = ({ selectedTag, allPlaces, onToggleTag }) => {
    const { placesWithTag, placesWithoutTag } = useMemo(() => {
        const withTag: Place[] = [];
        const withoutTag: Place[] = [];
        allPlaces.forEach(place => {
            if (place.tags.includes(selectedTag)) {
                withTag.push(place);
            } else {
                withoutTag.push(place);
            }
        });
        return { placesWithTag: withTag, placesWithoutTag: withoutTag };
    }, [allPlaces, selectedTag]);

    return (
        <div className="p-4 bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
                Managing Tag: <span className="text-emerald-400 font-bold">"{selectedTag}"</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column for places WITH the tag */}
                <div>
                    <h4 className="font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-2">
                        Places with this tag ({placesWithTag.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {placesWithTag.length > 0 ? (
                            placesWithTag.map(place => (
                                <PlaceListItem
                                    key={place.id}
                                    place={place}
                                    onToggle={() => onToggleTag(place.id, selectedTag)}
                                    action="remove"
                                />
                            ))
                        ) : (
                           <p className="text-sm text-gray-500 italic">No places have this tag yet.</p> 
                        )}
                    </div>
                </div>
                {/* Column for places WITHOUT the tag */}
                <div>
                     <h4 className="font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-2">
                        Add other places ({placesWithoutTag.length})
                    </h4>
                     <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {placesWithoutTag.length > 0 ? (
                             placesWithoutTag.map(place => (
                                <PlaceListItem
                                    key={place.id}
                                    place={place}
                                    onToggle={() => onToggleTag(place.id, selectedTag)}
                                    action="add"
                                />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">All your places have this tag.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};