'use client';

interface HeaderControlsProps {
  topN: number;
  onTopNChange: (n: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grouped' | 'all';
  onViewModeChange: (mode: 'grouped' | 'all') => void;
  onRefresh: () => void;
  isLoading: boolean;
  smartGrouping: boolean;
  onSmartGroupingChange: (enabled: boolean) => void;
}

export function HeaderControls({
  topN,
  onTopNChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isLoading,
  smartGrouping,
  onSmartGroupingChange,
}: HeaderControlsProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Feedly News Dashboard</h1>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Top N toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              {[20, 40].map((n) => (
                <button
                  key={n}
                  onClick={() => onTopNChange(n)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    topN === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <button
                onClick={() => onViewModeChange('grouped')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grouped
              </button>
              <button
                onClick={() => onViewModeChange('all')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Stories
              </button>
            </div>
          </div>

          {/* Smart Grouping toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={smartGrouping}
              onChange={(e) => onSmartGroupingChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Smart Grouping</span>
          </label>
        </div>
      </div>
    </div>
  );
}
