import React, { useState } from 'react';
import { mockPosts } from '../lib/mock-data';

interface SearchResult {
  id: string;
  text: string;
  author: string;
  date: string;
  likes: number;
  retweets: number;
  score?: number;
}

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>(mockPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 10
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform search');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold">SuperX Post Search</h1>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search posts..."
            className="input input-bordered flex-1"
            disabled={loading}
          />
          <button 
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="btn btn-primary min-w-[100px]"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {results.length === 0 && query && !loading && !error ? (
          <div className="text-center text-gray-500 py-8">
            No results found for "{query}"
          </div>
        ) : (
          results.map((post) => (
            <div key={post.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <p className="text-lg">{post.text}</p>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  <span className="font-medium">{post.author}</span>
                  <div className="flex gap-4">
                    <span title="Likes">❤️ {post.likes.toLocaleString()}</span>
                    <span title="Retweets">🔄 {post.retweets.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Posted on: {new Date(post.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}