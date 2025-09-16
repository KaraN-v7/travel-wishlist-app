import React, { useState } from 'react';
import { SearchIcon, TagIcon, PlusIcon } from './icons';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  onAddCustomTag: (tag: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
    searchTerm, 
    onSearchChange, 
    allTags, 
    selectedTag, 
    onTagSelect, 
    onAddCustomTag 
}) => {
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    if (trimmedTag && !allTags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
      onAddCustomTag(trimmedTag);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 space-y-4">
      {/* Search and Custom Tag Creation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search saved places..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-200 placeholder-gray-400"
          />
        </div>
        {showTagInput ? (
          <form onSubmit={handleAddTag} className="flex gap-2">
            <div className="relative flex-grow">
                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag name"
                className="w-full pl-9 pr-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-200 placeholder-gray-400"
                />
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-colors">
              Add
            </button>
          </form>
        ) : (
          <button 
            onClick={() => setShowTagInput(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
            <PlusIcon className="w-5 h-5"/>
            <span>Create Tag</span>
          </button>
        )}
      </div>
      
      {/* Tag Filters */}
      {allTags.length > 0 && (
          <div>
              <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onTagSelect(null)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${!selectedTag ? 'bg-emerald-500 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                    All Places
                  </button>
                  {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => onTagSelect(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedTag === tag ? 'bg-emerald-500 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                      >
                          {tag}
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
