'use client';

import { useState } from 'react';
import { NewsGroup } from '@/types';
import { StoryRow } from './StoryRow';

interface GroupCardProps {
  group: NewsGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">{group.groupName}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {group.items.length} {group.items.length === 1 ? 'story' : 'stories'}
          </span>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Summary bullets */}
          {group.summaryBullets.length > 0 && (
            <div className="mb-4 bg-blue-50 rounded-md p-3">
              <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
                Summary
              </h4>
              <ul className="space-y-1">
                {group.summaryBullets.map((bullet, index) => (
                  <li key={index} className="text-sm text-blue-900 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Story list */}
          <ul className="divide-y divide-gray-100">
            {group.items.map((item) => (
              <StoryRow key={item.id} item={item} />
            ))}
          </ul>

          {/* Keywords */}
          {group.topKeywords.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {group.topKeywords.slice(0, 6).map((keyword) => (
                  <span
                    key={keyword}
                    className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
