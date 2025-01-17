import React, { useState } from "react";
import { Search, Heart, RefreshCw, AlertCircle } from "lucide-react";
import { mockPosts } from "../lib/mock-data";

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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(mockPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit: 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Search failed");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform search");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-base-200 min-h-screen">
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-primary">
          SuperX Post Search
        </h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search posts..."
              className="input input-bordered w-full pr-10 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300"
              disabled={loading}
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="btn btn-primary w-40"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {results.length === 0 && query && !loading && !error ? (
          <div className="text-center text-gray-500 py-8 bg-base-100 rounded-box shadow">
            No results found for "{query}"
          </div>
        ) : (
          results.map((post) => (
            <div
              key={post.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="card-body">
                <p className="text-lg mb-4">{post.text}</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="font-medium text-primary">
                    {post.author}
                  </span>
                  <div className="flex gap-4">
                    <span title="Likes" className="flex items-center gap-1">
                      <Heart size={16} className="text-red-500" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span title="Retweets" className="flex items-center gap-1">
                      <RefreshCw size={16} className="text-green-500" />
                      {post.retweets.toLocaleString()}
                    </span>
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
