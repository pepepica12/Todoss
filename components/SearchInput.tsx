
import React, { useState } from 'react';
import { SearchFocus } from '../types';

interface SearchInputProps {
  onSearch: (query: string, focus: SearchFocus) => void;
  isLoading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<SearchFocus>(SearchFocus.GENERAL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query, focus);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything..."
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-5 px-6 pr-16 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500 group-hover:border-gray-700 shadow-2xl"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-3 top-3 bottom-3 px-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {Object.values(SearchFocus).map((f) => (
          <button
            key={f}
            onClick={() => setFocus(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              focus === f
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchInput;
