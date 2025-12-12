'use client';

import React, { useState } from 'react';
import {
  Network,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  color?: string;
}

interface MindMapProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId?: string;
}

// Mock mind map data for Azure concepts
const azureMindMap: MindMapNode = {
  id: 'root',
  label: 'AZ-104',
  color: '#0891b2',
  children: [
    {
      id: 'identity',
      label: 'Identity',
      color: '#8b5cf6',
      children: [
        { id: 'azure-ad', label: 'Azure AD' },
        { id: 'rbac', label: 'RBAC' },
        { id: 'mfa', label: 'MFA' },
        { id: 'conditional', label: 'Conditional Access' },
      ],
    },
    {
      id: 'governance',
      label: 'Governance',
      color: '#10b981',
      children: [
        { id: 'subscriptions', label: 'Subscriptions' },
        { id: 'resource-groups', label: 'Resource Groups' },
        { id: 'policies', label: 'Azure Policy' },
        { id: 'blueprints', label: 'Blueprints' },
      ],
    },
    {
      id: 'networking',
      label: 'Networking',
      color: '#f59e0b',
      children: [
        { id: 'vnet', label: 'Virtual Networks' },
        { id: 'nsg', label: 'NSG' },
        { id: 'peering', label: 'VNet Peering' },
        { id: 'load-balancer', label: 'Load Balancer' },
        { id: 'app-gateway', label: 'App Gateway' },
      ],
    },
    {
      id: 'compute',
      label: 'Compute',
      color: '#ef4444',
      children: [
        { id: 'vms', label: 'Virtual Machines' },
        { id: 'vmss', label: 'VM Scale Sets' },
        { id: 'containers', label: 'Containers' },
        { id: 'aks', label: 'AKS' },
      ],
    },
    {
      id: 'storage',
      label: 'Storage',
      color: '#3b82f6',
      children: [
        { id: 'blob', label: 'Blob Storage' },
        { id: 'files', label: 'Azure Files' },
        { id: 'queues', label: 'Queue Storage' },
        { id: 'tables', label: 'Table Storage' },
      ],
    },
  ],
};

export default function MindMap({ isOpen, onClose }: MindMapProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Network className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Concept Mind Map</h2>
              <p className="text-sm text-gray-500">Visual overview of AZ-104 topics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ZoomOut className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-500 w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ZoomIn className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div
            className="min-w-[800px] min-h-[500px] flex items-center justify-center transition-transform"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <MindMapTree
              node={azureMindMap}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          </div>
        </div>

        {/* Info Panel */}
        {selectedNode && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {findNodeLabel(azureMindMap, selectedNode)}
                </h3>
                <p className="text-sm text-gray-500">
                  Click on any node to explore more about this topic
                </p>
              </div>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition-colors">
                Go to Lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MindMapTree({
  node,
  selectedNode,
  onSelectNode,
  level = 0,
}: {
  node: MindMapNode;
  selectedNode: string | null;
  onSelectNode: (id: string) => void;
  level?: number;
}) {
  const isRoot = level === 0;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={cn('flex items-center gap-8', isRoot && 'flex-col gap-12')}>
      {/* Node */}
      <div
        onClick={() => onSelectNode(node.id)}
        className={cn(
          'relative cursor-pointer transition-all',
          selectedNode === node.id && 'scale-110'
        )}
      >
        <div
          className={cn(
            'px-4 py-2 rounded-full text-white font-medium shadow-lg transition-all hover:scale-105',
            isRoot && 'px-8 py-4 text-xl'
          )}
          style={{ backgroundColor: node.color || '#6b7280' }}
        >
          {node.label}
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <div className={cn('flex', isRoot ? 'flex-row gap-4' : 'flex-col gap-3')}>
          {node.children!.map((child, idx) => (
            <div key={child.id} className="relative">
              {/* Connection Line */}
              {!isRoot && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-8 h-0.5"
                  style={{ backgroundColor: node.color || '#6b7280' }}
                />
              )}
              {isRoot && (
                <div className="flex items-start gap-4">
                  {/* Vertical line from root */}
                  <div className="relative">
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0.5 h-6"
                      style={{ backgroundColor: child.color || '#6b7280' }}
                    />
                    <MindMapTree
                      node={child}
                      selectedNode={selectedNode}
                      onSelectNode={onSelectNode}
                      level={level + 1}
                    />
                  </div>
                </div>
              )}
              {!isRoot && (
                <div className="flex items-center gap-4">
                  <div
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-white cursor-pointer hover:scale-105 transition-all"
                    style={{ backgroundColor: node.color || '#6b7280' }}
                    onClick={() => onSelectNode(child.id)}
                  >
                    {child.label}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function findNodeLabel(node: MindMapNode, targetId: string): string {
  if (node.id === targetId) return node.label;

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeLabel(child, targetId);
      if (found) return found;
    }
  }

  return '';
}
