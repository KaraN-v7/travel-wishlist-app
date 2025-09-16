import React, { useEffect, useRef } from 'react';
import type { Place } from '../types';

// Since we are loading Leaflet from a CDN, we need to tell TypeScript about the global 'L' object.
declare var L: any;

interface MapViewProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
}

export const MapView: React.FC<MapViewProps> = ({ places, onSelectPlace }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize the map
      const map = L.map(mapContainerRef.current, {
        minZoom: 2, // Prevent zooming out too much
      }).setView([20, 0], 2);
      mapInstanceRef.current = map;

      // Set bounds to prevent panning outside the world map
      map.setMaxBounds([[-90, -180], [90, 180]]);

      // Add a colorful tile layer from OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        noWrap: true, // Prevents the map from repeating
      }).addTo(map);

      // Force map to re-evaluate its size after initial render to fix tile loading issues
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const validPlaces = places.filter(place => place.latitude != null && place.longitude != null);

    if (validPlaces.length === 0) return;

    const createPinIcon = (color: string) => {
        return L.divIcon({
            className: 'custom-pin-icon',
            html: `<svg viewBox="0 0 24 24" width="28" height="28" fill="${color}" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });
    };

    const unvisitedIcon = createPinIcon('#ef4444'); // Red pin for places to visit
    const visitedIcon = createPinIcon('#22c55e'); // Green pin for visited places

    // Add new markers
    validPlaces.forEach(place => {
      if (place.latitude !== undefined && place.longitude !== undefined) {
        const marker = L.marker([place.latitude, place.longitude], {
            icon: place.visited ? visitedIcon : unvisitedIcon
        }).addTo(map);

        // Create popup content
        const popupContent = `
            <div style="width: 150px; text-align: center; color: #1f2937;">
                <img src="${place.imageUrl}" alt="${place.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;" />
                <h4 style="margin: 8px 0 0; font-weight: bold;">${place.name}</h4>
            </div>
        `;
        
        // Add autoPan: false to prevent the map from moving on popup open
        marker.bindPopup(popupContent, { autoPan: false });

        marker.on('mouseover', function (this: any) {
            this.openPopup();
        });
        marker.on('mouseout', function (this: any) {
            this.closePopup();
        });
        
        marker.on('click', () => {
            onSelectPlace(place);
        });

        markersRef.current.push(marker);
      }
    });

    // Adjust map view to fit all markers
    if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.5));
    }

  }, [places, onSelectPlace]);

  return (
    <div 
        id="map-container"
        ref={mapContainerRef} 
        className="w-full h-[70vh] rounded-2xl shadow-lg border border-gray-700 bg-gray-800"
        aria-label="World map showing saved travel destinations"
    />
  );
};