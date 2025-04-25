import { useState } from 'react';
import { apiEndpoints } from '../services/api';

const APIEndpoints = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Get unique tags
  const tags = Array.from(new Set(apiEndpoints.map(endpoint => endpoint.tag)));
  
  // Filter endpoints by active tag
  const filteredEndpoints = activeTag 
    ? apiEndpoints.filter(endpoint => endpoint.tag === activeTag)
    : apiEndpoints;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">API Endpoints</h2>
      
      {/* Tags filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            activeTag === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1 rounded-full text-sm ${
              activeTag === tag
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      
      {/* Endpoints list */}
      <div className="max-h-96 overflow-y-auto">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredEndpoints.map((endpoint, index) => (
            <li key={`${endpoint.path}-${endpoint.method}-${index}`} className="py-3">
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                  endpoint.method === 'GET' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : endpoint.method === 'POST'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : endpoint.method === 'PUT'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {endpoint.method}
                </span>
                <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                  {endpoint.path}
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {endpoint.tag}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {endpoint.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default APIEndpoints;
