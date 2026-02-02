'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCompositions } from '@/lib/firebase/db';
import { TAALS } from '@/lib/types';
import BolGrid from '@/components/BolGrid';
import type { Composition } from '@/lib/types';

export default function BrowsePage() {
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [taalFilter, setTaalFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getCompositions()
      .then(setCompositions)
      .finally(() => setLoading(false));
  }, []);

  // Filter and sort
  const filtered = compositions
    .filter((comp) => {
      const matchesSearch =
        !search ||
        comp.meta.title?.toLowerCase().includes(search.toLowerCase()) ||
        comp.meta.author?.toLowerCase().includes(search.toLowerCase()) ||
        comp.meta.description?.toLowerCase().includes(search.toLowerCase()) ||
        comp.meta.tags?.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );
      const matchesTaal = !taalFilter || comp.meta.taal === taalFilter;
      return matchesSearch && matchesTaal;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return (a.meta.title || '').localeCompare(b.meta.title || '');
      }
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-amber-600 hover:text-amber-800 font-medium"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">Browse</h1>
          <Link
            href="/upload"
            className="bg-amber-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-amber-600 active:scale-95 transition-all"
          >
            + New
          </Link>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none"
            />

            {/* Taal Filter */}
            <select
              value={taalFilter}
              onChange={(e) => setTaalFilter(e.target.value)}
              className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none"
            >
              <option value="">All Taals</option>
              {Object.keys(TAALS).map((taal) => (
                <option key={taal} value={taal}>
                  {taal}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center text-amber-600 py-12">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-amber-600 py-12">
            No compositions found
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((comp) => {
              const isExpanded = expandedId === comp.id;

              return (
                <div
                  key={comp.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden"
                >
                  {/* Header - always visible */}
                  <div
                    className="p-4 sm:p-6 cursor-pointer hover:bg-amber-50 transition-colors"
                    onClick={() => toggleExpand(comp.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-lg">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                          <h2 className="text-lg font-semibold text-amber-900 truncate">
                            {comp.meta.title || 'Untitled'}
                          </h2>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 ml-6">
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">
                            {comp.meta.taal}
                          </span>
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">
                            {comp.meta.tempo} BPM
                          </span>
                          {comp.meta.author && (
                            <span className="text-amber-500 text-sm">
                              by {comp.meta.author}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/player?load=${comp.id}`}
                          className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 active:scale-95 transition-all"
                        >
                          Play
                        </Link>
                        <Link
                          href={`/upload?edit=${comp.id}`}
                          className="px-4 py-2 bg-white border-2 border-amber-200 text-amber-700 rounded-xl font-medium hover:border-amber-400 active:scale-95 transition-all"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t-2 border-amber-100 p-4 sm:p-6 bg-amber-50/50">
                      {/* Description */}
                      {comp.meta.description && (
                        <p className="text-amber-700 mb-4">
                          {comp.meta.description}
                        </p>
                      )}

                      {/* Tags */}
                      {comp.meta.tags && comp.meta.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {comp.meta.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Full composition grid */}
                      <div className="bg-white rounded-xl p-4 border border-amber-200">
                        <BolGrid rows={comp.rows} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
