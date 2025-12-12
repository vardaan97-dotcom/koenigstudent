'use client';

import React, { useState } from 'react';
import {
  Bookmark,
  FileText,
  X,
  Plus,
  Search,
  Clock,
  Tag,
  Trash2,
  Edit3,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudy, type Bookmark as BookmarkType, type Note } from '@/context/StudyContext';

interface BookmarksNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBookmark?: (lessonId: string, timestamp: number) => void;
}

const noteColors = [
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  { name: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  { name: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  { name: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  { name: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
];

export default function BookmarksNotesPanel({
  isOpen,
  onClose,
  onNavigateToBookmark,
}: BookmarksNotesPanelProps) {
  const { bookmarks, notes, removeBookmark, removeNote, addNote, updateNote } = useStudy();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState<{ content: string; color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' }>({ content: '', color: 'yellow' });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNotes = notes.filter(
    (n) =>
      n.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    if (!newNote.content.trim()) return;

    addNote({
      lessonId: 'general',
      lessonTitle: 'General Note',
      moduleTitle: 'My Notes',
      content: newNote.content,
      color: newNote.color,
    });

    setNewNote({ content: '', color: 'yellow' });
    setIsAddingNote(false);
  };

  const getColorClasses = (color: string) => {
    return noteColors.find((c) => c.name === color) || noteColors[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Study Materials</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
            activeTab === 'bookmarks'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Bookmark className="w-4 h-4" />
          Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
            activeTab === 'notes'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <FileText className="w-4 h-4" />
          Notes ({notes.length})
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'bookmarks' ? (
          <div className="p-4 space-y-3">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No bookmarks yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Click the bookmark icon while watching videos
                </p>
              </div>
            ) : (
              filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => onNavigateToBookmark?.(bookmark.lessonId, bookmark.timestamp)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {bookmark.lessonTitle}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {bookmark.moduleTitle}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(bookmark.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(bookmark.timestamp)}
                    </div>
                    {bookmark.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {bookmark.note && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 italic">
                      &quot;{bookmark.note}&quot;
                    </p>
                  )}

                  <div className="flex items-center justify-end mt-2 text-xs text-cyan-600">
                    <span>Go to video</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Add Note Button */}
            {!isAddingNote && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-500 hover:text-cyan-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Note
              </button>
            )}

            {/* New Note Form */}
            {isAddingNote && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note..."
                  className="w-full bg-transparent resize-none focus:outline-none text-sm"
                  rows={4}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-yellow-200">
                  <div className="flex gap-2">
                    {noteColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setNewNote({ ...newNote, color: color.name as 'yellow' | 'blue' | 'green' | 'pink' | 'purple' })}
                        className={cn(
                          'w-6 h-6 rounded-full transition-all',
                          color.bg,
                          color.border,
                          'border-2',
                          newNote.color === color.name && 'ring-2 ring-offset-1 ring-gray-400'
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote({ content: '', color: 'yellow' });
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.content.trim()}
                      className="px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            {filteredNotes.length === 0 && !isAddingNote ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notes yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Create notes to remember important concepts
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const colorClasses = getColorClasses(note.color);
                const isEditing = editingNoteId === note.id;

                return (
                  <div
                    key={note.id}
                    className={cn(
                      'rounded-xl p-4 border',
                      colorClasses.bg,
                      colorClasses.border
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={cn('text-xs font-medium', colorClasses.text)}>
                          {note.moduleTitle}
                        </p>
                        <p className="text-xs text-gray-500">{note.lessonTitle}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingNoteId(isEditing ? null : note.id)}
                          className="p-1 hover:bg-white/50 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => removeNote(note.id)}
                          className="p-1 hover:bg-white/50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div>
                        <textarea
                          value={note.content}
                          onChange={(e) => updateNote(note.id, { content: e.target.value })}
                          className="w-full bg-white/50 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          rows={4}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1 text-xs bg-cyan-600 text-white rounded-lg"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
