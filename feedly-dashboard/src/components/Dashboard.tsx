'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { NewsAPIResponse, StreamError } from '@/types';
import { HeaderControls } from './HeaderControls';
import { GroupCard } from './GroupCard';
import { StoryRow } from './StoryRow';
import { ErrorBanner } from './ErrorBanner';
import { LoadingSpinner } from './LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const [data, setData] = useState<NewsAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topN, setTopN] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'all'>('grouped');
  const [smartGrouping, setSmartGrouping] = useState(false);
  const [streamErrors, setStreamErrors] = useState<StreamError[]>([]);
  const [showErrors, setShowErrors] = useState(true);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        topN: topN.toString(),
        smartGrouping: smartGrouping ? '1' : '0',
      });

      const response = await fetch(`/api/news?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: NewsAPIResponse = await response.json();
      setData(result);
      setStreamErrors(result.metadata.errors);
      setShowErrors(result.metadata.errors.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setIsLoading(false);
    }
  }, [topN, smartGrouping]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Filter items based on search query
  const filteredData = useMemo(() => {
    if (!data || !searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();

    const filteredItems = data.items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.sourceDomain.toLowerCase().includes(query) ||
        (item.summary && item.summary.toLowerCase().includes(query))
    );

    const filteredGroups = data.grouped
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.sourceDomain.toLowerCase().includes(query) ||
            (item.summary && item.summary.toLowerCase().includes(query))
        ),
      }))
      .filter((group) => group.items.length > 0);

    return {
      ...data,
      items: filteredItems,
      grouped: filteredGroups,
    };
  }, [data, searchQuery]);

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-100">
        <HeaderControls
          topN={topN}
          onTopNChange={setTopN}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={fetchNews}
          isLoading={isLoading}
          smartGrouping={smartGrouping}
          onSmartGroupingChange={setSmartGrouping}
        />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load news</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchNews}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderControls
        topN={topN}
        onTopNChange={setTopN}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={fetchNews}
        isLoading={isLoading}
        smartGrouping={smartGrouping}
        onSmartGroupingChange={setSmartGrouping}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Error banner */}
        {showErrors && streamErrors.length > 0 && (
          <ErrorBanner errors={streamErrors} onDismiss={() => setShowErrors(false)} />
        )}

        {/* Metadata bar */}
        {data && (
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>
              Pulled {formatDistanceToNow(new Date(data.metadata.pulledAt), { addSuffix: true })}
            </span>
            <span>•</span>
            <span>{data.items.length} stories</span>
            {data.metadata.dedupeCount > 0 && (
              <>
                <span>•</span>
                <span>{data.metadata.dedupeCount} duplicates removed</span>
              </>
            )}
            {data.metadata.smartGrouping && (
              <>
                <span>•</span>
                <span className="text-blue-600">Smart Grouping</span>
              </>
            )}
            {data.metadata.smartSummary && (
              <>
                <span>•</span>
                <span className="text-green-600">AI Summaries</span>
              </>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && !data && <LoadingSpinner />}

        {/* Content */}
        {filteredData && (
          <>
            {viewMode === 'grouped' ? (
              <div className="space-y-6">
                {filteredData.grouped.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No stories match your search.
                  </div>
                ) : (
                  filteredData.grouped.map((group) => (
                    <GroupCard key={group.groupName} group={group} />
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    All Stories
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredData.items.length})
                    </span>
                  </h3>
                </div>
                {filteredData.items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No stories match your search.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 p-2">
                    {filteredData.items.map((item) => (
                      <StoryRow key={item.id} item={item} />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Feedly News Dashboard • Powered by Feedly API</p>
        </div>
      </footer>
    </div>
  );
}
