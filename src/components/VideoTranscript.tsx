'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Clock,
  ChevronDown,
  ChevronRight,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface VideoTranscriptProps {
  isVisible: boolean;
  onToggle: () => void;
  onSeekTo: (time: number) => void;
  currentTime: number;
}

// Mock transcript data for Azure AZ-104 content
const mockTranscript: TranscriptSegment[] = [
  { id: '1', startTime: 0, endTime: 15, text: "Welcome to the Azure Administrator AZ-104 certification course. In this module, we'll cover the fundamentals of Azure administration." },
  { id: '2', startTime: 15, endTime: 30, text: "Azure provides a comprehensive set of tools for managing cloud resources. As an administrator, you'll need to understand identity management, governance, and resource deployment." },
  { id: '3', startTime: 30, endTime: 45, text: "Let's start with Azure Active Directory, or Azure AD. This is the identity and access management service that helps your employees sign in and access resources." },
  { id: '4', startTime: 45, endTime: 60, text: "Azure AD provides features like single sign-on, multi-factor authentication, and conditional access policies to secure your organization's resources." },
  { id: '5', startTime: 60, endTime: 75, text: "Next, we'll discuss role-based access control, or RBAC. RBAC helps you manage who has access to Azure resources, what they can do with those resources, and what areas they have access to." },
  { id: '6', startTime: 75, endTime: 90, text: "There are three main roles in Azure RBAC: Owner, Contributor, and Reader. The Owner has full access, including the ability to delegate access to others." },
  { id: '7', startTime: 90, endTime: 105, text: "Contributors can create and manage all types of Azure resources but cannot grant access to others. Readers can only view existing Azure resources." },
  { id: '8', startTime: 105, endTime: 120, text: "You can also create custom roles to meet your organization's specific needs. Custom roles can be created using Azure PowerShell, Azure CLI, or the REST API." },
  { id: '9', startTime: 120, endTime: 135, text: "Moving on to resource groups. A resource group is a container that holds related resources for an Azure solution. You can include all resources for the solution, or only those that you want to manage as a group." },
  { id: '10', startTime: 135, endTime: 150, text: "Resource groups are important for organizing and managing your Azure resources. They also play a key role in access control and billing." },
];

export default function VideoTranscript({
  isVisible,
  onToggle,
  onSeekTo,
  currentTime,
}: VideoTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTranscript = searchQuery
    ? mockTranscript.filter((segment) =>
        segment.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockTranscript;

  const currentSegment = mockTranscript.find(
    (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
  );

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadTranscript = () => {
    const fullText = mockTranscript
      .map((segment) => `[${formatTime(segment.startTime)}] ${segment.text}`)
      .join('\n\n');

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-600" />
          <span className="font-medium text-gray-900">Video Transcript</span>
        </div>
        {isVisible ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isVisible && (
        <div className="p-4">
          {/* Search and Actions */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={downloadTranscript}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Download transcript"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="mb-3 text-sm text-gray-500">
              Found {filteredTranscript.length} results for &quot;{searchQuery}&quot;
            </div>
          )}

          {/* Transcript Content */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredTranscript.map((segment) => {
              const isActive = currentSegment?.id === segment.id;
              const hasSearchMatch =
                searchQuery &&
                segment.text.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <div
                  key={segment.id}
                  className={cn(
                    'group p-3 rounded-lg cursor-pointer transition-all',
                    isActive
                      ? 'bg-cyan-50 border border-cyan-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  )}
                  onClick={() => onSeekTo(segment.startTime)}
                >
                  <div className="flex items-start gap-3">
                    <button className="flex items-center gap-1 text-xs text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatTime(segment.startTime)}
                    </button>
                    <div className="flex-1">
                      <p
                        className={cn(
                          'text-sm',
                          isActive ? 'text-gray-900 font-medium' : 'text-gray-700'
                        )}
                      >
                        {hasSearchMatch ? (
                          <HighlightText text={segment.text} query={searchQuery} />
                        ) : (
                          segment.text
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(segment.text, segment.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      title="Copy text"
                    >
                      {copiedId === segment.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTranscript.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No matches found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={idx} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}
