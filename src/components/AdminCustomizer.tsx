'use client';

/**
 * Admin Customizer Component
 * ==========================
 *
 * Portal for Koenig sales team to customize the learning portal for clients.
 * Allows real-time preview of branding and feature configuration.
 *
 * HANDOVER NOTES:
 * - Sales team accesses this via /admin/customize route
 * - Changes can be previewed in real-time before saving
 * - Presets can be selected as starting points
 * - Export configuration as JSON for handover
 */

import React, { useState } from 'react';
import { CompanyBranding, CompanyFeatures, CompanyIndustry, CompanySize } from '@/lib/db/schema';
import { COMPANY_PRESETS, getDefaultBranding, getFeaturesForTier, isValidHexColor, getContrastColor } from '@/lib/config/company-presets';

// ============================================================================
// TYPES
// ============================================================================

interface CompanyConfig {
  name: string;
  slug: string;
  industry: CompanyIndustry;
  size: CompanySize;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  branding: CompanyBranding;
  features: CompanyFeatures;
  adminEmail: string;
  supportEmail: string;
  logo: File | null;
  favicon: File | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminCustomizer() {
  const [activeTab, setActiveTab] = useState<'info' | 'branding' | 'features' | 'preview' | 'export'>('info');
  const [config, setConfig] = useState<CompanyConfig>({
    name: '',
    slug: '',
    industry: 'technology',
    size: 'medium',
    subscriptionTier: 'professional',
    branding: getDefaultBranding(),
    features: getFeaturesForTier('professional'),
    adminEmail: '',
    supportEmail: '',
    logo: null,
    favicon: null,
  });
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  // Apply preset
  const handlePresetSelect = (presetId: string) => {
    const preset = COMPANY_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setConfig(prev => ({
        ...prev,
        industry: preset.industry,
        branding: preset.branding,
        features: preset.features,
      }));
      setSelectedPreset(presetId);
      setIsDirty(true);
    }
  };

  // Update branding
  const updateBranding = (key: keyof CompanyBranding, value: string) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, [key]: value },
    }));
    setIsDirty(true);
  };

  // Toggle feature
  const toggleFeature = (key: keyof CompanyFeatures) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }));
    setIsDirty(true);
  };

  // Export config
  const exportConfig = () => {
    const exportData = {
      name: config.name,
      slug: config.slug,
      industry: config.industry,
      size: config.size,
      subscriptionTier: config.subscriptionTier,
      branding: config.branding,
      features: config.features,
      adminEmail: config.adminEmail,
      supportEmail: config.supportEmail,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Koenig Admin Customizer',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.slug || 'company'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Customizer</h1>
            <p className="text-sm text-gray-500">Configure and brand the learning portal for clients</p>
          </div>
          <div className="flex items-center gap-4">
            {isDirty && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Unsaved changes
              </span>
            )}
            <button
              onClick={exportConfig}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Config
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {(['info', 'branding', 'features', 'preview', 'export'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6 max-w-4xl">
          {/* Company Info Tab */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>

              {/* Preset Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start from a Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="">Select a preset...</option>
                  {COMPANY_PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} - {preset.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    }));
                    setIsDirty(true);
                  }}
                  placeholder="e.g., PricewaterhouseCoopers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">learn.koenig.com/</span>
                  <input
                    type="text"
                    value={config.slug}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, slug: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="company-slug"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Industry & Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={config.industry}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, industry: e.target.value as CompanyIndustry }));
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="consulting">Consulting</option>
                    <option value="finance">Finance</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="education">Education</option>
                    <option value="government">Government</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={config.size}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, size: e.target.value as CompanySize }));
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="startup">Startup (1-50)</option>
                    <option value="small">Small (51-200)</option>
                    <option value="medium">Medium (201-1000)</option>
                    <option value="large">Large (1001-5000)</option>
                    <option value="enterprise">Enterprise (5000+)</option>
                  </select>
                </div>
              </div>

              {/* Subscription Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Tier
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['starter', 'professional', 'enterprise'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          subscriptionTier: tier,
                          features: getFeaturesForTier(tier),
                        }));
                        setIsDirty(true);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        config.subscriptionTier === tier
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold capitalize">{tier}</div>
                      <div className="text-xs text-gray-500">
                        {tier === 'starter' && 'Basic features'}
                        {tier === 'professional' && 'Most features'}
                        {tier === 'enterprise' && 'All features'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Emails */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={config.adminEmail}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, adminEmail: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="admin@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={config.supportEmail}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, supportEmail: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="support@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Branding & Colors</h2>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                {([
                  { key: 'primaryColor', label: 'Primary Color' },
                  { key: 'secondaryColor', label: 'Secondary Color' },
                  { key: 'accentColor', label: 'Accent Color' },
                  { key: 'backgroundColor', label: 'Background' },
                  { key: 'headerBackground', label: 'Header Background' },
                  { key: 'textColor', label: 'Text Color' },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.branding[key]}
                        onChange={(e) => updateBranding(key, e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.branding[key]}
                        onChange={(e) => {
                          if (isValidHexColor(e.target.value) || e.target.value.length < 7) {
                            updateBranding(key, e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Typography */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Font
                  </label>
                  <select
                    value={config.branding.fontFamily}
                    onChange={(e) => updateBranding('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Arial">Arial</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Font
                  </label>
                  <select
                    value={config.branding.headingFont}
                    onChange={(e) => updateBranding('headingFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Merriweather">Merriweather</option>
                  </select>
                </div>
              </div>

              {/* UI Style */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Style
                  </label>
                  <div className="flex gap-2">
                    {(['rounded', 'pill', 'square'] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => updateBranding('buttonStyle', style)}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
                          style === 'rounded' ? 'rounded-lg' : style === 'pill' ? 'rounded-full' : 'rounded'
                        } ${
                          config.branding.buttonStyle === style
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Style
                  </label>
                  <div className="flex gap-2">
                    {(['flat', 'elevated', 'bordered'] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => updateBranding('cardStyle', style)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          config.branding.cardStyle === style
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Messages */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Custom Messages</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Title
                  </label>
                  <input
                    type="text"
                    value={config.branding.welcomeTitle}
                    onChange={(e) => updateBranding('welcomeTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.branding.welcomeSubtitle}
                    onChange={(e) => updateBranding('welcomeSubtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login Message
                  </label>
                  <input
                    type="text"
                    value={config.branding.loginMessage}
                    onChange={(e) => updateBranding('loginMessage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Feature Configuration</h2>

              <div className="space-y-6">
                {/* Core Features */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Core Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'courseContent', label: 'Course Content', desc: 'Video lessons and articles' },
                      { key: 'quizzes', label: 'Quizzes', desc: 'End of lesson assessments' },
                      { key: 'qubits', label: 'Qubits', desc: 'Quick knowledge checks' },
                      { key: 'certificates', label: 'Certificates', desc: 'Completion certificates' },
                    ] as const).map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key]}
                        onChange={() => toggleFeature(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Learning Tools */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Learning Tools</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'flashcards', label: 'Flashcards', desc: 'Spaced repetition system' },
                      { key: 'mindMaps', label: 'Mind Maps', desc: 'Visual concept mapping' },
                      { key: 'focusMode', label: 'Focus Mode', desc: 'Pomodoro timer' },
                      { key: 'calendar', label: 'Study Calendar', desc: 'Schedule and planning' },
                    ] as const).map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key]}
                        onChange={() => toggleFeature(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Exam Prep */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Exam Preparation</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'examSimulator', label: 'Exam Simulator', desc: 'Practice tests' },
                      { key: 'weakAreaDrills', label: 'Weak Area Drills', desc: 'Targeted practice' },
                    ] as const).map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key]}
                        onChange={() => toggleFeature(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Social & Gamification */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Social & Gamification</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'gamification', label: 'Gamification', desc: 'XP and achievements' },
                      { key: 'leaderboards', label: 'Leaderboards', desc: 'Competitive rankings' },
                      { key: 'studyGroups', label: 'Study Groups', desc: 'Collaborative learning' },
                      { key: 'forum', label: 'Forum', desc: 'Discussion boards' },
                      { key: 'progressSharing', label: 'Progress Sharing', desc: 'Share achievements' },
                      { key: 'liveSessions', label: 'Live Sessions', desc: 'Real-time classes' },
                    ] as const).map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key]}
                        onChange={() => toggleFeature(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Advanced */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Advanced</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'aiAssistant', label: 'AI Assistant', desc: 'AI-powered help' },
                      { key: 'analytics', label: 'Analytics', desc: 'Learning insights' },
                      { key: 'customReporting', label: 'Custom Reports', desc: 'Admin dashboards' },
                      { key: 'apiAccess', label: 'API Access', desc: 'Integration options' },
                    ] as const).map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key]}
                        onChange={() => toggleFeature(key)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>

                {/* Mini Dashboard Preview */}
                <div
                  className="rounded-xl overflow-hidden border-2 border-gray-200"
                  style={{
                    backgroundColor: config.branding.backgroundColor,
                    fontFamily: config.branding.fontFamily,
                  }}
                >
                  {/* Header */}
                  <div
                    className="p-4 flex items-center justify-between"
                    style={{ backgroundColor: config.branding.headerBackground }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: config.branding.primaryColor }}
                      >
                        {config.name.charAt(0) || 'K'}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: config.branding.textColor }}>
                          {config.name || 'Company Name'}
                        </div>
                        <div className="text-xs text-gray-500">Learning Portal</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: config.branding.textColor,
                        fontFamily: config.branding.headingFont,
                      }}
                    >
                      {config.branding.welcomeTitle}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {config.branding.welcomeSubtitle}
                    </p>

                    {/* Sample Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 bg-white ${
                          config.branding.cardStyle === 'bordered'
                            ? 'border border-gray-200'
                            : config.branding.cardStyle === 'elevated'
                            ? 'shadow-md'
                            : ''
                        }`}
                        style={{ borderRadius: '12px' }}
                      >
                        <div className="text-sm font-medium" style={{ color: config.branding.textColor }}>
                          AZ-104 Progress
                        </div>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: '65%',
                              backgroundColor: config.branding.primaryColor,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">65% complete</div>
                      </div>

                      <div
                        className={`p-4 bg-white ${
                          config.branding.cardStyle === 'bordered'
                            ? 'border border-gray-200'
                            : config.branding.cardStyle === 'elevated'
                            ? 'shadow-md'
                            : ''
                        }`}
                        style={{ borderRadius: '12px' }}
                      >
                        <div className="text-sm font-medium" style={{ color: config.branding.textColor }}>
                          Weekly Streak
                        </div>
                        <div
                          className="mt-2 text-2xl font-bold"
                          style={{ color: config.branding.accentColor }}
                        >
                          5 Days
                        </div>
                      </div>
                    </div>

                    {/* Sample Buttons */}
                    <div className="mt-6 flex gap-3">
                      <button
                        className={`px-4 py-2 text-white font-medium ${
                          config.branding.buttonStyle === 'rounded'
                            ? 'rounded-lg'
                            : config.branding.buttonStyle === 'pill'
                            ? 'rounded-full'
                            : 'rounded'
                        }`}
                        style={{
                          backgroundColor: config.branding.primaryColor,
                          color: getContrastColor(config.branding.primaryColor),
                        }}
                      >
                        Continue Learning
                      </button>
                      <button
                        className={`px-4 py-2 font-medium border-2 ${
                          config.branding.buttonStyle === 'rounded'
                            ? 'rounded-lg'
                            : config.branding.buttonStyle === 'pill'
                            ? 'rounded-full'
                            : 'rounded'
                        }`}
                        style={{
                          borderColor: config.branding.secondaryColor,
                          color: config.branding.secondaryColor,
                        }}
                      >
                        View Courses
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Configuration</h2>

              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm font-mono">
                  {JSON.stringify(
                    {
                      name: config.name,
                      slug: config.slug,
                      industry: config.industry,
                      size: config.size,
                      subscriptionTier: config.subscriptionTier,
                      branding: config.branding,
                      features: config.features,
                      adminEmail: config.adminEmail,
                      supportEmail: config.supportEmail,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={exportConfig}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  Download JSON
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify({ name: config.name, slug: config.slug, branding: config.branding, features: config.features }, null, 2)
                    );
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Quick Preview */}
        <aside className="w-80 border-l border-gray-200 bg-white p-4 hidden lg:block">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Preview</h3>

          {/* Color Swatches */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg shadow-sm"
                style={{ backgroundColor: config.branding.primaryColor }}
              />
              <div>
                <div className="text-xs text-gray-500">Primary</div>
                <div className="text-sm font-mono">{config.branding.primaryColor}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg shadow-sm"
                style={{ backgroundColor: config.branding.secondaryColor }}
              />
              <div>
                <div className="text-xs text-gray-500">Secondary</div>
                <div className="text-sm font-mono">{config.branding.secondaryColor}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg shadow-sm"
                style={{ backgroundColor: config.branding.accentColor }}
              />
              <div>
                <div className="text-xs text-gray-500">Accent</div>
                <div className="text-sm font-mono">{config.branding.accentColor}</div>
              </div>
            </div>
          </div>

          {/* Feature Summary */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Enabled Features</h4>
            <div className="text-2xl font-bold text-cyan-600">
              {Object.values(config.features).filter(Boolean).length} / {Object.keys(config.features).length}
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{
                  width: `${(Object.values(config.features).filter(Boolean).length / Object.keys(config.features).length) * 100}%`,
                }}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// FEATURE TOGGLE COMPONENT
// ============================================================================

function FeatureToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`p-3 rounded-lg border-2 text-left transition-all ${
        enabled
          ? 'border-cyan-500 bg-cyan-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{label}</span>
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            enabled ? 'bg-cyan-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-1 ${
              enabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  );
}
