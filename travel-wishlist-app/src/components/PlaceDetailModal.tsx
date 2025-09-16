import React, { useEffect, useState } from 'react';
import type { Place } from '../types';
import { AdBanner } from './AdBanner';
import { XIcon, InfoIcon, ListChecksIcon, MapPinIcon, CalendarIcon, DollarSignIcon, PlaneIcon, NoteIcon, TagIcon, PlusIcon } from './icons';

interface PlaceDetailModalProps {
  place: Place;
  onClose: () => void;
  customTags: string[];
  onUpdateTags: (placeId: string, newTags: string[]) => void;
}

const DetailSection: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-6 h-6 text-emerald-400 mt-1">{icon}</div>
        <div className="flex-1">
            <h4 className="font-semibold text-lg text-gray-200">{title}</h4>
            <div className="text-gray-400 prose prose-invert prose-sm max-w-none">
                {children}
            </div>
        </div>
    </div>
);

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose, customTags, onUpdateTags }) => {
  const [showAddTagList, setShowAddTagList] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!place.detailedInfo) return null;

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = place.tags.filter(tag => tag !== tagToRemove);
    onUpdateTags(place.id, newTags);
  };

  const handleAddTag = (tagToAdd: string) => {
    if (!place.tags.includes(tagToAdd)) {
        const newTags = [...place.tags, tagToAdd];
        onUpdateTags(place.id, newTags);
    }
    setShowAddTagList(false);
  };

  const availableCustomTags = customTags.filter(ct => !place.tags.includes(ct));

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col border border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative">
            <img src={place.imageUrl} alt={place.name} className="w-full h-64 object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
            <h2 className="absolute bottom-4 left-6 text-4xl font-bold text-white tracking-tight">{place.name}</h2>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
                aria-label="Close"
            >
                <XIcon className="w-6 h-6" />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {place.note && (
                <DetailSection icon={<NoteIcon/>} title="My Personal Note">
                    <p className="italic">"{place.note}"</p>
                </DetailSection>
            )}

            <DetailSection icon={<TagIcon />} title="Tags">
                <div className="flex flex-wrap gap-2 items-center">
                    {place.tags.map(tag => (
                        <span key={tag} className="flex items-center bg-gray-700 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-red-500/50 transition-colors">
                                <XIcon className="w-3 h-3"/>
                            </button>
                        </span>
                    ))}
                    <div className="relative">
                        <button
                            onClick={() => setShowAddTagList(prev => !prev)}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors"
                        >
                            <PlusIcon className="w-4 h-4"/>
                            <span>Add Tag</span>
                        </button>
                        {showAddTagList && (
                            <div className="absolute bottom-full mb-2 left-0 bg-gray-600 border border-gray-500 rounded-lg shadow-lg z-20 w-48 max-h-40 overflow-y-auto">
                                {availableCustomTags.length > 0 ? (
                                    availableCustomTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleAddTag(tag)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-emerald-700 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 text-center p-2">No more tags to add.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DetailSection>
            
            <AdBanner />

            <DetailSection icon={<InfoIcon/>} title="Why It's Famous">
                <p>{place.detailedInfo.whyFamous}</p>
            </DetailSection>

            <DetailSection icon={<ListChecksIcon/>} title="Things to Do">
                <ul className="list-disc pl-5 space-y-1">
                    {place.detailedInfo.thingsToDo.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </DetailSection>

            <DetailSection icon={<MapPinIcon/>} title="Nearby Attractions">
                 <ul className="list-disc pl-5 space-y-1">
                    {place.detailedInfo.nearbyAttractions.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </DetailSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-700">
                 <DetailSection icon={<CalendarIcon/>} title="Best Time to Visit">
                    <p>{place.detailedInfo.bestTimeToVisit}</p>
                </DetailSection>
                 <DetailSection icon={<DollarSignIcon/>} title="Estimated Budget">
                    <p>{place.detailedInfo.estimatedBudget}</p>
                </DetailSection>
                 <DetailSection icon={<PlaneIcon/>} title="Getting There">
                    <p>{place.detailedInfo.flightsInfo}</p>
                </DetailSection>
            </div>
        </div>
      </div>
    </div>
  );
};
