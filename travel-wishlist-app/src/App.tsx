import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PlaceInput } from './components/PlaceInput';
import { CountryGrid } from './components/CountryGrid';
import { Modal } from './components/Modal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { FilterBar } from './components/FilterBar';
import { TagManagementPanel } from './components/TagManagementPanel';
import { MapView } from './components/MapView';
import { getBasicPlaceInfo, getDetailedPlaceInfo } from './services/geminiService';
import type { Country, Place } from './types';
import { CompassIcon, GridIcon, MapIcon } from './components/icons';

type ViewMode = 'grid' | 'map';

const App: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // State for filtering and custom tags
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  
  // State for view mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');


  useEffect(() => {
    try {
      const storedCountries = localStorage.getItem('travelWishlist');
      if (storedCountries) {
        setCountries(JSON.parse(storedCountries));
      }
      const storedCustomTags = localStorage.getItem('customTravelTags');
      if(storedCustomTags) {
        setCustomTags(JSON.parse(storedCustomTags));
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
      setError("Could not load your saved places. Your data might be corrupted.");
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('travelWishlist', JSON.stringify(countries));
    } catch (e) {
        console.error("Failed to save countries to localStorage", e);
        setError("Could not save your latest changes.");
    }
  }, [countries]);

  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const mapContainer = document.getElementById('map-container');

    if (selectedPlace) {
      // Lock background scrolling
      const originalHtmlOverflow = htmlEl.style.overflow;
      const originalBodyOverflow = bodyEl.style.overflow;
      htmlEl.style.overflow = 'hidden';
      bodyEl.style.overflow = 'hidden';
      
      // Force map container to a lower stacking context to ensure modal is on top
      if (mapContainer) {
        mapContainer.style.zIndex = '0';
      }

      return () => {
        // Restore scrolling
        htmlEl.style.overflow = originalHtmlOverflow;
        bodyEl.style.overflow = originalBodyOverflow;

        // Restore map container's stacking context
        if (mapContainer) {
          mapContainer.style.removeProperty('z-index');
        }
      };
    }
  }, [selectedPlace]);
  
  const handleAddCustomTag = (tag: string) => {
    if (!customTags.includes(tag) && !allTags.includes(tag)) {
        const newCustomTags = [...customTags, tag];
        setCustomTags(newCustomTags);
        localStorage.setItem('customTravelTags', JSON.stringify(newCustomTags));
    }
  };

  const handleSavePlace = useCallback(async (placeName: string, imageFile: File, note: string, selectedCustomTags: string[]) => {
    setIsLoading(true);
    setError(null);

    const isDuplicate = countries.some(country => 
      country.places.some(place => place.name.toLowerCase() === placeName.toLowerCase())
    );

    if (isDuplicate) {
      setModalMessage(`"${placeName}" is already on your wishlist.`);
      setIsLoading(false);
      return;
    }

    try {
      // Part 1: Quick save with basic info
      const basicInfo = await getBasicPlaceInfo(placeName);
      if (!basicInfo || !basicInfo.placeExists) {
        throw new Error(`Could not find information for "${placeName}". Please check the spelling.`);
      }

      const imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const newPlace: Place = {
        id: Date.now().toString(),
        name: placeName,
        imageUrl: imageUrl,
        description: "Fetching details...",
        visited: false,
        note: note,
        tags: selectedCustomTags,
        isFetchingDetails: true, // Set loading state
      };

      setCountries(prevCountries => {
        const countryIndex = prevCountries.findIndex(c => c.name === basicInfo.countryName);
        if (countryIndex > -1) {
          const updatedCountries = [...prevCountries];
          updatedCountries[countryIndex].places.push(newPlace);
          return updatedCountries;
        } else {
          const newCountry: Country = {
            name: basicInfo.countryName,
            flagUrl: `https://flagcdn.com/w160/${basicInfo.countryCode.toLowerCase()}.png`,
            places: [newPlace],
          };
          return [...prevCountries, newCountry].sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      
      setIsLoading(false); // UI is responsive now

      // Part 2: Fetch detailed info in the background
      (async () => {
        try {
          const detailedInfo = await getDetailedPlaceInfo(placeName);
          if (!detailedInfo) return; // Or handle error

          setCountries(prevCountries => 
            prevCountries.map(country => ({
              ...country,
              places: country.places.map(place => {
                if (place.id === newPlace.id) {
                  return {
                    ...place,
                    description: detailedInfo.description,
                    detailedInfo: detailedInfo.detailedInfo,
                    tags: [...new Set([...(detailedInfo.tags || []), ...selectedCustomTags])],
                    latitude: detailedInfo.latitude,
                    longitude: detailedInfo.longitude,
                    isFetchingDetails: false, // Turn off loading state
                  };
                }
                return place;
              })
            }))
          );
        } catch (e) {
          console.error("Failed to fetch detailed info:", e);
          // Optionally update the UI to show that fetching details failed
          setCountries(prevCountries =>
            prevCountries.map(country => ({
              ...country,
              places: country.places.map(p =>
                p.id === newPlace.id ? { ...p, description: "Could not fetch details.", isFetchingDetails: false } : p
              ),
            }))
          );
        }
      })();

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  }, [countries]);

  const handleDeletePlace = useCallback((placeId: string) => {
    setCountries(prevCountries => {
      const newCountries = prevCountries.map(country => {
        const filteredPlaces = country.places.filter(place => place.id !== placeId);
        if (filteredPlaces.length === 0) {
          return null;
        }
        return { ...country, places: filteredPlaces };
      }).filter((country): country is Country => country !== null);

      return newCountries;
    });
  }, []);

  const handleToggleVisited = useCallback((placeId: string) => {
    setCountries(prevCountries => 
      prevCountries.map(country => ({
        ...country,
        places: country.places.map(place => 
          place.id === placeId ? { ...place, visited: !place.visited } : place
        )
      }))
    );
  }, []);
  
  const handleSelectPlace = useCallback((place: Place) => {
    if (place.isFetchingDetails) return; // Don't open modal for places still loading
    setSelectedPlace(place);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  const handleUpdatePlaceTags = useCallback((placeId: string, newTags: string[]) => {
    setCountries(prevCountries =>
      prevCountries.map(country => ({
        ...country,
        places: country.places.map(place =>
          place.id === placeId ? { ...place, tags: [...new Set(newTags)].sort() } : place
        ),
      }))
    );
    if (selectedPlace && selectedPlace.id === placeId) {
        setSelectedPlace(prev => prev ? { ...prev, tags: [...new Set(newTags)].sort() } : null);
    }
  }, [selectedPlace]);

  const handleToggleTagForPlace = useCallback((placeId: string, tag: string) => {
    setCountries(prevCountries =>
      prevCountries.map(country => ({
        ...country,
        places: country.places.map(place => {
          if (place.id === placeId) {
            const hasTag = place.tags.includes(tag);
            const newTags = hasTag
              ? place.tags.filter(t => t !== tag)
              : [...place.tags, tag];
            return { ...place, tags: [...new Set(newTags)].sort() };
          }
          return place;
        }),
      }))
    );
  }, []);

  const allTags = useMemo(() => {
    const placeTags = countries.flatMap(c => c.places.flatMap(p => p.tags));
    return [...new Set([...placeTags, ...customTags])].sort();
  }, [countries, customTags]);

  const allPlaces = useMemo(() => countries.flatMap(c => c.places), [countries]);
  
  const filteredPlaces = useMemo(() => {
     if (!searchTerm && !selectedTag) {
      return allPlaces;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allPlaces.filter(place => {
       const nameMatch = lowercasedSearchTerm
            ? place.name.toLowerCase().includes(lowercasedSearchTerm)
            : true;
       const tagMatch = selectedTag
            ? place.tags.includes(selectedTag)
            : true;
        return nameMatch && tagMatch;
    });
  }, [allPlaces, searchTerm, selectedTag]);


  const filteredCountries = useMemo(() => {
    if (viewMode === 'map') return [];

    const placesToDisplay = filteredPlaces.map(p => p.id);
    return countries
      .map(country => {
        const placesInCountry = country.places.filter(p => placesToDisplay.includes(p.id));
        if (placesInCountry.length > 0) {
          return { ...country, places: placesInCountry };
        }
        return null;
      })
      .filter((country): country is Country => country !== null);
  }, [countries, filteredPlaces, viewMode]);

  return (
    <>
      {/* Robust background image implementation */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-fixed" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="min-h-screen text-gray-200 font-sans p-4 sm:p-8">
        <main className="max-w-7xl mx-auto">
          <header className="text-center mb-10">
            <div className="flex justify-center items-center gap-4">
              <CompassIcon className="w-12 h-12 text-emerald-400" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                Travel Wishlist AI
              </h1>
            </div>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Your personal map of dreams. AI will handle the details.
            </p>
          </header>

          <section className="max-w-3xl mx-auto mb-12 p-6 bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700">
            <PlaceInput onSave={handleSavePlace} isLoading={isLoading} customTags={customTags} />
          </section>

          <section className="max-w-5xl mx-auto mb-4">
              <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-full p-1">
                      <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:text-white'}`}>
                          <GridIcon className="w-5 h-5 inline-block mr-2" />
                          Grid
                      </button>
                      <button onClick={() => setViewMode('map')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${viewMode === 'map' ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:text-white'}`}>
                          <MapIcon className="w-5 h-5 inline-block mr-2" />
                          Map
                      </button>
                  </div>
              </div>
          </section>
          
          <section className="max-w-5xl mx-auto mb-8 space-y-4">
              <FilterBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  allTags={allTags}
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                  onAddCustomTag={handleAddCustomTag}
              />
              {selectedTag && (
                  <TagManagementPanel
                      selectedTag={selectedTag}
                      allPlaces={allPlaces}
                      onToggleTag={handleToggleTagForPlace}
                  />
              )}
          </section>

          {error && (
              <div className="max-w-3xl mx-auto my-4 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center backdrop-blur-sm">
                  <p><strong>Error:</strong> {error}</p>
              </div>
          )}
          
          {viewMode === 'grid' ? (
            <CountryGrid 
              countries={filteredCountries} 
              onDeletePlace={handleDeletePlace} 
              onToggleVisited={handleToggleVisited} 
              onSelectPlace={handleSelectPlace}
            />
          ) : (
            <MapView places={filteredPlaces} onSelectPlace={handleSelectPlace} />
          )}
        </main>
      </div>

      {/* Using React Portals to ensure modals are rendered at the top of the DOM tree */}
      {modalMessage && createPortal(
        <Modal message={modalMessage} onClose={() => setModalMessage(null)} />,
        document.body
      )}

      {selectedPlace && createPortal(
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={handleCloseDetailModal} 
          customTags={customTags}
          onUpdateTags={handleUpdatePlaceTags}
        />,
        document.body
      )}
    </>
  );
};

export default App;
