
import React, { useState, useCallback, useEffect } from 'react';
import SearchInput from './components/SearchInput';
import ResultView from './components/ResultView';
import { performSearch } from './services/geminiService';
import { SearchResult, SearchFocus } from './types';

const STORAGE_KEY = 'gemini_search_history';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleSearch = useCallback(async (query: string, focus: SearchFocus) => {
    setLoading(true);
    setError(null);
    try {
      const searchResult = await performSearch(query, focus);
      setResult(searchResult);
      
      // Update history: add to front, remove duplicates, limit to 5
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during search.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">G</div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
              Advanced <span className="gradient-text">Search</span>
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400 border border-gray-700">
              {result ? 'Grounded Results' : 'Gemini 3 Pro/Flash'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 mt-16 px-4 py-12 flex flex-col items-center">
        {!result && !loading && (
          <div className="w-full max-w-2xl text-center mb-12 space-y-6 animate-in fade-in zoom-in duration-1000">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              Know <span className="gradient-text">Everything</span>.
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
              Real-time research grounded in global data. Specialized modes for Academic, Technical, and General insights.
            </p>
          </div>
        )}

        {/* Search Interface */}
        <div className={`w-full transition-all duration-500 ease-in-out ${result ? 'mb-16' : 'mb-8'}`}>
          <SearchInput onSearch={handleSearch} isLoading={loading} />
          
          {/* Persistent History Pills */}
          {searchHistory.length > 0 && (
            <div className="max-w-4xl mx-auto mt-6 flex flex-wrap gap-3 items-center justify-center sm:justify-start">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold mr-1">Recent:</span>
              {searchHistory.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSearch(h, SearchFocus.GENERAL)}
                  disabled={loading}
                  className="text-sm text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-all bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800 disabled:opacity-50"
                >
                  {h}
                </button>
              ))}
              <button 
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem(STORAGE_KEY);
                }}
                className="text-xs text-red-500/60 hover:text-red-500 underline ml-2 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        {error && (
          <div className="w-full max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 bg-gray-800/50 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-800/50 rounded-3xl w-full"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-24 bg-gray-800/50 rounded-2xl"></div>
              <div className="h-24 bg-gray-800/50 rounded-2xl"></div>
            </div>
          </div>
        )}

        {/* Results View */}
        {result && !loading && <ResultView result={result} />}
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Advanced Search • Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
