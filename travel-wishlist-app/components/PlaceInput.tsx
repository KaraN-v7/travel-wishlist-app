import React, { useState, useRef } from 'react';
import { Spinner } from './Spinner';
import { ImageIcon, PlusIcon, TagIcon, XIcon } from './icons';

interface PlaceInputProps {
  onSave: (placeName: string, imageFile: File, note: string, customTags: string[]) => void;
  isLoading: boolean;
  customTags: string[];
}

export const PlaceInput: React.FC<PlaceInputProps> = ({ onSave, isLoading, customTags }) => {
  const [placeName, setPlaceName] = useState('');
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setPreviewUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (placeName.trim() && imageFile) {
      onSave(placeName.trim(), imageFile, note.trim(), selectedTags);
      setPlaceName('');
      setNote('');
      setImageFile(null);
      setPreviewUrl(null);
      setSelectedTags([]);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="Enter a place, e.g., 'Machu Picchu'"
          className="w-full pl-4 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-200 placeholder-gray-400"
          disabled={isLoading}
        />
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a personal note... (e.g., Saw on a reel, must try the street food)"
        className="w-full pl-4 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-200 placeholder-gray-400 resize-none"
        rows={2}
        disabled={isLoading}
      />
      
      {customTags.length > 0 && (
          <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                <TagIcon className="w-4 h-4" />
                <span>Apply Your Custom Tags:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                  {customTags.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedTags.includes(tag) ? 'bg-emerald-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                      >
                          {tag}
                      </button>
                  ))}
              </div>
          </div>
      )}

      <div 
        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-emerald-500 hover:bg-gray-700/50 transition-all duration-200 relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          disabled={isLoading}
        />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="mx-auto h-24 rounded-md" />
            <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500/80 transition-colors"
                aria-label="Clear image"
            >
                <XIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span>Click to upload a photo</span>
            <span className="text-xs text-gray-500 mt-1">(Required)</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!placeName || !imageFile || isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Analyzing & Saving...</span>
          </>
        ) : (
          <>
            <PlusIcon className="w-5 h-5" />
            <span>Add to Wishlist</span>
          </>
        )}
      </button>
    </form>
  );
};