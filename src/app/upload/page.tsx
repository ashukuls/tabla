'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BolGrid from '@/components/BolGrid';
import TaalSelector from '@/components/TaalSelector';
import TempoSlider from '@/components/TempoSlider';
import { parseComposition } from '@/lib/parser';
import {
  createComposition,
  getComposition,
  updateComposition,
} from '@/lib/firebase/db';
import type { Row } from '@/lib/types';

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [taal, setTaal] = useState('Teentaal');
  const [tempo, setTempo] = useState(60);
  const [bolInput, setBolInput] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load composition for editing
  useEffect(() => {
    if (editId) {
      setLoading(true);
      getComposition(editId)
        .then((comp) => {
          if (comp) {
            setTitle(comp.meta.title || '');
            setTaal(comp.meta.taal || 'Teentaal');
            setTempo(comp.meta.tempo || 60);
            setAuthor(comp.meta.author || '');
            setDescription(comp.meta.description || '');
            setTagsInput(comp.meta.tags?.join(', ') || '');
            // Convert rows back to text
            const text = comp.rows
              .map((row) =>
                row.beats.map((beat) => beat.bols.join('')).join(' ')
              )
              .join('\n');
            setBolInput(text);
            setRows(comp.rows);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [editId]);

  // Parse bol input
  useEffect(() => {
    if (bolInput.trim()) {
      const parsed = parseComposition(bolInput);
      setRows(parsed);
    } else {
      setRows([]);
    }
  }, [bolInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (rows.length === 0) {
      setError('Please enter some bols');
      return;
    }

    if (tempo < 20 || tempo > 300) {
      setError('Tempo must be between 20 and 300 BPM');
      return;
    }

    setSaving(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const data = {
        meta: {
          title: title.trim(),
          taal,
          tempo,
          author: author.trim() || undefined,
          description: description.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        },
        rows,
      };

      if (editId) {
        await updateComposition(editId, data);
      } else {
        await createComposition(data);
      }

      router.push('/browse');
    } catch (err) {
      setError('Failed to save composition');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto text-center text-amber-600 py-12">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/browse"
            className="text-amber-600 hover:text-amber-800 font-medium"
          >
            ← Browse
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">
            {editId ? 'Edit Composition' : 'New Composition'}
          </h1>
          <div className="w-16" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-amber-700 font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Teentaal Theka"
              className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Taal & Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TaalSelector value={taal} onChange={setTaal} />
            <div>
              <TempoSlider tempo={tempo} onChange={setTempo} />
            </div>
          </div>

          {/* Bols Input */}
          <div>
            <label className="block text-amber-700 font-medium mb-2">
              Bols *
            </label>
            <textarea
              value={bolInput}
              onChange={(e) => setBolInput(e.target.value)}
              placeholder="Dha Dhin Dhin Dha | Dha Dhin Dhin Dha&#10;Dha Tin Tin Ta | Ta Dhin Dhin Dha"
              className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none min-h-[120px] font-mono"
            />
            <p className="text-amber-500 text-sm mt-1">
              Separate bols with spaces. Use | for visual grouping. New line for
              new row.
            </p>
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4">
              <h3 className="text-amber-700 font-medium mb-3">Preview</h3>
              <BolGrid rows={rows} />
            </div>
          )}

          {/* Author */}
          <div>
            <label className="block text-amber-700 font-medium mb-2">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-amber-700 font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none min-h-[80px]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-amber-700 font-medium mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="theka, beginner, teentaal (comma separated)"
              className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full p-4 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : editId ? 'Update Composition' : 'Save Composition'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-amber-600">Loading...</div>}>
      <UploadContent />
    </Suspense>
  );
}
