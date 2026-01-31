'use client';

import { NewsItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface StoryRowProps {
  item: NewsItem;
}

export function StoryRow({ item }: StoryRowProps) {
  const timeAgo = formatDistanceToNow(new Date(item.published), { addSuffix: true });

  return (
    <li className="group py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
          {item.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="font-medium text-gray-600">{item.sourceDomain}</span>
          <span>•</span>
          <span>{timeAgo}</span>
          {item.author && (
            <>
              <span>•</span>
              <span className="truncate max-w-[120px]">{item.author}</span>
            </>
          )}
        </div>
      </a>
    </li>
  );
}
