/**
 * Company Configuration Presets
 * =============================
 *
 * Pre-configured settings for different company types.
 * Sales team can use these as starting points when onboarding new clients.
 *
 * HANDOVER NOTES:
 * - Each preset includes branding, features, and industry-specific settings
 * - Presets can be selected in the admin portal during company setup
 * - Individual settings can be customized after selecting a preset
 */

import { CompanyBranding, CompanyFeatures, CompanyIndustry, CompanySize } from '@/lib/db/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanyPreset {
  id: string;
  name: string;
  description: string;
  industry: CompanyIndustry;
  recommendedFor: CompanySize[];
  branding: CompanyBranding;
  features: CompanyFeatures;
  customSettings?: Record<string, unknown>;
}

// ============================================================================
// DEFAULT BRANDING
// ============================================================================

const DEFAULT_BRANDING: CompanyBranding = {
  primaryColor: '#0891b2',      // Cyan-600
  secondaryColor: '#06b6d4',    // Cyan-500
  accentColor: '#f59e0b',       // Amber-500
  backgroundColor: '#f8fafc',   // Slate-50
  headerBackground: '#ffffff',
  textColor: '#1e293b',         // Slate-800
  fontFamily: 'Inter',
  headingFont: 'Inter',
  buttonStyle: 'rounded',
  cardStyle: 'elevated',
  welcomeTitle: 'Welcome to Your Learning Portal',
  welcomeSubtitle: 'Start your certification journey today',
  loginMessage: 'Sign in to continue learning',
  helpUrl: null,
  privacyUrl: null,
  termsUrl: null,
};

// ============================================================================
// DEFAULT FEATURES (All features)
// ============================================================================

const ALL_FEATURES: CompanyFeatures = {
  courseContent: true,
  quizzes: true,
  qubits: true,
  certificates: true,
  aiAssistant: true,
  studyGroups: true,
  forum: true,
  liveSessions: true,
  analytics: true,
  gamification: true,
  flashcards: true,
  mindMaps: true,
  focusMode: true,
  calendar: true,
  examSimulator: true,
  weakAreaDrills: true,
  progressSharing: true,
  leaderboards: true,
  customReporting: true,
  apiAccess: true,
};

const STARTER_FEATURES: CompanyFeatures = {
  courseContent: true,
  quizzes: true,
  qubits: true,
  certificates: true,
  aiAssistant: false,
  studyGroups: false,
  forum: false,
  liveSessions: false,
  analytics: false,
  gamification: true,
  flashcards: true,
  mindMaps: false,
  focusMode: true,
  calendar: false,
  examSimulator: false,
  weakAreaDrills: true,
  progressSharing: false,
  leaderboards: true,
  customReporting: false,
  apiAccess: false,
};

const PROFESSIONAL_FEATURES: CompanyFeatures = {
  courseContent: true,
  quizzes: true,
  qubits: true,
  certificates: true,
  aiAssistant: true,
  studyGroups: true,
  forum: true,
  liveSessions: false,
  analytics: true,
  gamification: true,
  flashcards: true,
  mindMaps: true,
  focusMode: true,
  calendar: true,
  examSimulator: true,
  weakAreaDrills: true,
  progressSharing: true,
  leaderboards: true,
  customReporting: false,
  apiAccess: false,
};

// ============================================================================
// INDUSTRY PRESETS
// ============================================================================

export const COMPANY_PRESETS: CompanyPreset[] = [
  // -------------------------------------------------------------------------
  // PWC / Big 4 Consulting
  // -------------------------------------------------------------------------
  {
    id: 'pwc',
    name: 'PwC',
    description: 'Configured for PricewaterhouseCoopers with brand colors and enterprise features',
    industry: 'consulting',
    recommendedFor: ['enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#e85d04',      // PWC Orange
      secondaryColor: '#d00000',    // PWC Red accent
      accentColor: '#ffba08',       // Gold accent
      backgroundColor: '#fffcf2',   // Warm white
      headerBackground: '#ffffff',
      textColor: '#2b2d42',
      fontFamily: 'Georgia',
      headingFont: 'Georgia',
      buttonStyle: 'square',
      cardStyle: 'bordered',
      welcomeTitle: 'PwC Learning Academy',
      welcomeSubtitle: 'Building tomorrow\'s leaders through continuous learning',
      loginMessage: 'Sign in with your PwC credentials',
      helpUrl: 'https://pwc.com/support',
      privacyUrl: 'https://pwc.com/privacy',
      termsUrl: 'https://pwc.com/terms',
    },
    features: ALL_FEATURES,
    customSettings: {
      ssoRequired: true,
      ssoProvider: 'workos',
      allowPersonalAccounts: false,
      enforcePasswordPolicy: true,
      sessionTimeoutMinutes: 480,
      enableAuditLogs: true,
      dataRetentionDays: 365,
      customDomain: 'learn.pwc.com',
    },
  },

  // -------------------------------------------------------------------------
  // Deloitte
  // -------------------------------------------------------------------------
  {
    id: 'deloitte',
    name: 'Deloitte',
    description: 'Configured for Deloitte with green brand colors',
    industry: 'consulting',
    recommendedFor: ['enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#86bc25',      // Deloitte Green
      secondaryColor: '#0076a8',    // Deloitte Blue
      accentColor: '#00a3e0',       // Light blue
      backgroundColor: '#ffffff',
      headerBackground: '#000000',  // Black header
      textColor: '#333333',
      fontFamily: 'Open Sans',
      headingFont: 'Open Sans',
      buttonStyle: 'rounded',
      cardStyle: 'flat',
      welcomeTitle: 'Deloitte University',
      welcomeSubtitle: 'Learn. Lead. Succeed.',
      loginMessage: 'Sign in with Deloitte SSO',
    },
    features: ALL_FEATURES,
  },

  // -------------------------------------------------------------------------
  // KPMG
  // -------------------------------------------------------------------------
  {
    id: 'kpmg',
    name: 'KPMG',
    description: 'Configured for KPMG with blue brand colors',
    industry: 'consulting',
    recommendedFor: ['enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#00338d',      // KPMG Blue
      secondaryColor: '#0091da',    // Light Blue
      accentColor: '#483698',       // Purple
      backgroundColor: '#f5f5f5',
      headerBackground: '#00338d',
      textColor: '#333333',
      fontFamily: 'Arial',
      headingFont: 'Arial',
      buttonStyle: 'square',
      cardStyle: 'bordered',
      welcomeTitle: 'KPMG Learning Center',
      welcomeSubtitle: 'Inspiring confidence. Empowering change.',
      loginMessage: 'Sign in with KPMG credentials',
    },
    features: ALL_FEATURES,
  },

  // -------------------------------------------------------------------------
  // EY
  // -------------------------------------------------------------------------
  {
    id: 'ey',
    name: 'Ernst & Young',
    description: 'Configured for EY with yellow brand colors',
    industry: 'consulting',
    recommendedFor: ['enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#ffe600',      // EY Yellow
      secondaryColor: '#2e2e38',    // EY Dark Gray
      accentColor: '#00a3ae',       // Teal
      backgroundColor: '#ffffff',
      headerBackground: '#2e2e38',
      textColor: '#2e2e38',
      fontFamily: 'EYInterstate',
      headingFont: 'EYInterstate',
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      welcomeTitle: 'EY Badges',
      welcomeSubtitle: 'Building a better working world',
      loginMessage: 'Sign in with EY credentials',
    },
    features: ALL_FEATURES,
  },

  // -------------------------------------------------------------------------
  // Finance / Banking
  // -------------------------------------------------------------------------
  {
    id: 'finance-enterprise',
    name: 'Finance Enterprise',
    description: 'For large banks and financial institutions',
    industry: 'finance',
    recommendedFor: ['large', 'enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#1e3a5f',      // Navy
      secondaryColor: '#2563eb',    // Blue
      accentColor: '#fbbf24',       // Gold
      backgroundColor: '#f8fafc',
      headerBackground: '#1e3a5f',
      textColor: '#1e293b',
      fontFamily: 'Roboto',
      headingFont: 'Roboto',
      buttonStyle: 'square',
      cardStyle: 'bordered',
      welcomeTitle: 'Professional Development Portal',
      welcomeSubtitle: 'Compliance & Certification Training',
      loginMessage: 'Sign in securely',
    },
    features: {
      ...ALL_FEATURES,
      gamification: false,         // More serious/professional
      progressSharing: false,      // Privacy concerns
      leaderboards: false,
    },
    customSettings: {
      requireMFA: true,
      auditLogging: true,
      complianceMode: true,
    },
  },

  // -------------------------------------------------------------------------
  // Technology Startup
  // -------------------------------------------------------------------------
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern, playful design for tech startups',
    industry: 'technology',
    recommendedFor: ['startup', 'small'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#8b5cf6',      // Violet
      secondaryColor: '#06b6d4',    // Cyan
      accentColor: '#f43f5e',       // Rose
      backgroundColor: '#fafaf9',
      headerBackground: '#18181b',
      textColor: '#18181b',
      fontFamily: 'Inter',
      headingFont: 'Inter',
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      welcomeTitle: 'Level Up Your Skills',
      welcomeSubtitle: 'Learn fast. Build faster.',
      loginMessage: 'Let\'s get learning!',
    },
    features: STARTER_FEATURES,
  },

  // -------------------------------------------------------------------------
  // Healthcare
  // -------------------------------------------------------------------------
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Clean, professional design for healthcare organizations',
    industry: 'healthcare',
    recommendedFor: ['medium', 'large', 'enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#059669',      // Emerald
      secondaryColor: '#0891b2',    // Cyan
      accentColor: '#6366f1',       // Indigo
      backgroundColor: '#f0fdf4',
      headerBackground: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Source Sans Pro',
      headingFont: 'Source Sans Pro',
      buttonStyle: 'rounded',
      cardStyle: 'flat',
      welcomeTitle: 'Healthcare Training Portal',
      welcomeSubtitle: 'Excellence in patient care through education',
      loginMessage: 'Secure sign in required',
    },
    features: {
      ...PROFESSIONAL_FEATURES,
      liveSessions: true,          // Important for medical training
      examSimulator: true,         // Certification prep
    },
    customSettings: {
      hipaaCompliant: true,
      auditLogging: true,
    },
  },

  // -------------------------------------------------------------------------
  // Education
  // -------------------------------------------------------------------------
  {
    id: 'education',
    name: 'Educational Institution',
    description: 'Designed for schools and universities',
    industry: 'education',
    recommendedFor: ['medium', 'large'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#2563eb',      // Blue
      secondaryColor: '#7c3aed',    // Violet
      accentColor: '#f59e0b',       // Amber
      backgroundColor: '#eff6ff',
      headerBackground: '#1e40af',
      textColor: '#1e293b',
      fontFamily: 'Nunito',
      headingFont: 'Nunito',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      welcomeTitle: 'Student Learning Portal',
      welcomeSubtitle: 'Your path to certification success',
      loginMessage: 'Sign in with your student account',
    },
    features: ALL_FEATURES,
  },

  // -------------------------------------------------------------------------
  // Government
  // -------------------------------------------------------------------------
  {
    id: 'government',
    name: 'Government Agency',
    description: 'Accessible, compliant design for government',
    industry: 'government',
    recommendedFor: ['large', 'enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#1e3a8a',      // Blue-900
      secondaryColor: '#3b82f6',    // Blue-500
      accentColor: '#dc2626',       // Red
      backgroundColor: '#ffffff',
      headerBackground: '#1e3a8a',
      textColor: '#111827',
      fontFamily: 'Source Sans Pro',
      headingFont: 'Merriweather',
      buttonStyle: 'square',
      cardStyle: 'bordered',
      welcomeTitle: 'Agency Training Portal',
      welcomeSubtitle: 'Professional development and certification',
      loginMessage: 'Sign in with your agency credentials',
    },
    features: {
      ...PROFESSIONAL_FEATURES,
      gamification: false,
      progressSharing: false,
      leaderboards: false,
    },
    customSettings: {
      wcagCompliant: true,
      section508: true,
      fedRAMP: true,
    },
  },

  // -------------------------------------------------------------------------
  // Manufacturing
  // -------------------------------------------------------------------------
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial design for manufacturing companies',
    industry: 'manufacturing',
    recommendedFor: ['medium', 'large', 'enterprise'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#ea580c',      // Orange-600
      secondaryColor: '#374151',    // Gray-700
      accentColor: '#16a34a',       // Green-600
      backgroundColor: '#f9fafb',
      headerBackground: '#1f2937',
      textColor: '#1f2937',
      fontFamily: 'Roboto',
      headingFont: 'Roboto Condensed',
      buttonStyle: 'square',
      cardStyle: 'bordered',
      welcomeTitle: 'Training & Certification Center',
      welcomeSubtitle: 'Building skills for operational excellence',
      loginMessage: 'Sign in to continue',
    },
    features: PROFESSIONAL_FEATURES,
  },

  // -------------------------------------------------------------------------
  // Retail
  // -------------------------------------------------------------------------
  {
    id: 'retail',
    name: 'Retail',
    description: 'Engaging design for retail organizations',
    industry: 'retail',
    recommendedFor: ['small', 'medium', 'large'],
    branding: {
      ...DEFAULT_BRANDING,
      primaryColor: '#db2777',      // Pink-600
      secondaryColor: '#8b5cf6',    // Violet-500
      accentColor: '#f59e0b',       // Amber-500
      backgroundColor: '#fdf2f8',
      headerBackground: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Poppins',
      headingFont: 'Poppins',
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      welcomeTitle: 'Team Training Hub',
      welcomeSubtitle: 'Learn, grow, succeed',
      loginMessage: 'Welcome back! Sign in to continue.',
    },
    features: {
      ...PROFESSIONAL_FEATURES,
      gamification: true,
      leaderboards: true,
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get preset by ID
 */
export function getPresetById(id: string): CompanyPreset | undefined {
  return COMPANY_PRESETS.find(preset => preset.id === id);
}

/**
 * Get presets by industry
 */
export function getPresetsByIndustry(industry: CompanyIndustry): CompanyPreset[] {
  return COMPANY_PRESETS.filter(preset => preset.industry === industry);
}

/**
 * Get presets recommended for company size
 */
export function getPresetsForSize(size: CompanySize): CompanyPreset[] {
  return COMPANY_PRESETS.filter(preset => preset.recommendedFor.includes(size));
}

/**
 * Get default branding
 */
export function getDefaultBranding(): CompanyBranding {
  return { ...DEFAULT_BRANDING };
}

/**
 * Get features for subscription tier
 */
export function getFeaturesForTier(tier: 'starter' | 'professional' | 'enterprise'): CompanyFeatures {
  switch (tier) {
    case 'starter':
      return { ...STARTER_FEATURES };
    case 'professional':
      return { ...PROFESSIONAL_FEATURES };
    case 'enterprise':
      return { ...ALL_FEATURES };
    default:
      return { ...STARTER_FEATURES };
  }
}

/**
 * Merge branding with overrides
 */
export function mergeBranding(
  base: Partial<CompanyBranding>,
  overrides: Partial<CompanyBranding>
): CompanyBranding {
  return {
    ...DEFAULT_BRANDING,
    ...base,
    ...overrides,
  };
}

/**
 * Validate color hex code
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Generate contrast color (black or white) for readability
 */
export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default COMPANY_PRESETS;
