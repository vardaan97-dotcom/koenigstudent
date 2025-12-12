/**
 * Database Schema Types
 * =====================
 *
 * This file defines the core database models for the Koenig Learning Portal.
 * These types serve as the contract between the frontend and backend.
 *
 * In production, these would map to your database tables (PostgreSQL, MongoDB, etc.)
 * Currently using in-memory/localStorage for demo purposes.
 *
 * HANDOVER NOTES FOR DEVELOPERS:
 * - Each model has a corresponding API endpoint in /src/app/api/
 * - All IDs are UUIDs generated with crypto.randomUUID()
 * - Timestamps are ISO 8601 strings
 * - Soft deletes use 'deletedAt' field where applicable
 */

// ============================================================================
// COMPANY & ORGANIZATION
// ============================================================================

/**
 * Company/Organization Model
 * Represents a client organization using the learning portal
 */
export interface Company {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier (e.g., 'pwc', 'deloitte')
  industry: CompanyIndustry;
  size: CompanySize;
  logo: string | null;
  favicon: string | null;

  // Branding
  branding: CompanyBranding;

  // Feature toggles - what sections are enabled for this company
  features: CompanyFeatures;

  // Contact info
  adminEmail: string;
  supportEmail: string;

  // Subscription
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  trialEndsAt: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Sales person who set this up
}

export type CompanyIndustry =
  | 'consulting'
  | 'finance'
  | 'technology'
  | 'healthcare'
  | 'manufacturing'
  | 'retail'
  | 'education'
  | 'government'
  | 'other';

export type CompanySize =
  | 'startup'      // 1-50 employees
  | 'small'        // 51-200 employees
  | 'medium'       // 201-1000 employees
  | 'large'        // 1001-5000 employees
  | 'enterprise';  // 5000+ employees

export interface CompanyBranding {
  primaryColor: string;      // Main brand color
  secondaryColor: string;    // Secondary accent
  accentColor: string;       // Highlights, CTAs
  backgroundColor: string;   // Page background
  headerBackground: string;  // Header bg color
  textColor: string;         // Primary text

  // Typography
  fontFamily: string;        // e.g., 'Inter', 'Roboto'
  headingFont: string;       // For headings

  // UI Style
  buttonStyle: 'rounded' | 'pill' | 'square';
  cardStyle: 'flat' | 'elevated' | 'bordered';

  // Custom messages
  welcomeTitle: string;
  welcomeSubtitle: string;
  loginMessage: string;

  // Custom links
  helpUrl: string | null;
  privacyUrl: string | null;
  termsUrl: string | null;
}

export interface CompanyFeatures {
  // Core features
  courseContent: boolean;
  quizzes: boolean;
  qubits: boolean;
  certificates: boolean;

  // Enhanced features
  aiAssistant: boolean;
  studyGroups: boolean;
  forum: boolean;
  liveSessions: boolean;
  analytics: boolean;
  gamification: boolean;
  flashcards: boolean;
  mindMaps: boolean;
  focusMode: boolean;
  calendar: boolean;

  // Exam prep
  examSimulator: boolean;
  weakAreaDrills: boolean;

  // Social
  progressSharing: boolean;
  leaderboards: boolean;

  // Admin
  customReporting: boolean;
  apiAccess: boolean;
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

/**
 * User Model
 * Represents a learner or admin user
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;

  // Organization
  companyId: string;
  role: UserRole;
  department: string | null;
  jobTitle: string | null;

  // Authentication
  authProvider: 'email' | 'workos' | 'google' | 'microsoft';
  authProviderId: string | null;
  emailVerified: boolean;

  // Preferences
  preferences: UserPreferences;

  // Status
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'learner'           // Regular student
  | 'team_lead'         // Can view team progress
  | 'manager'           // Can manage team enrollments
  | 'company_admin'     // Full company admin
  | 'koenig_sales'      // Koenig sales person
  | 'koenig_admin';     // Koenig super admin

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;

  // Learning preferences
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  dailyGoalMinutes: number;
  sessionLength: number;

  // UI preferences
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showGamification: boolean;

  // Onboarding
  hasCompletedOnboarding: boolean;
  onboardingStep: number;
}

// ============================================================================
// COURSES & CONTENT
// ============================================================================

/**
 * Course Model
 * Represents a certification course
 */
export interface Course {
  id: string;
  code: string;              // e.g., 'AZ-104'
  name: string;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string | null;
  category: string;
  vendor: string;            // e.g., 'Microsoft', 'AWS'

  // Duration
  estimatedHours: number;
  totalLessons: number;
  totalModules: number;

  // Difficulty
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prerequisites: string[];

  // Certification
  certificationName: string;
  certificationVendor: string;
  examCode: string | null;

  // Pricing (for future)
  price: number | null;
  currency: string;

  // Status
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Module Model
 * A section within a course
 */
export interface ModuleDB {
  id: string;
  courseId: string;
  number: number;
  title: string;
  description: string;
  estimatedMinutes: number;

  // Order
  sortOrder: number;

  // Status
  status: 'draft' | 'published';

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Lesson Model
 * Individual content piece within a module
 */
export interface LessonDB {
  id: string;
  moduleId: string;
  title: string;
  description: string;

  // Content
  contentType: 'video' | 'article' | 'interactive' | 'lab';
  videoUrl: string | null;
  videoProvider: 'youtube' | 'vimeo' | 'custom' | null;
  videoDuration: number | null; // in seconds
  articleContent: string | null;

  // Resources
  resources: LessonResource[];

  // Order
  sortOrder: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'link' | 'code';
  url: string;
  size: number | null;
}

// ============================================================================
// PROGRESS & ANALYTICS
// ============================================================================

/**
 * Enrollment Model
 * Tracks user enrollment in courses
 */
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  companyId: string;

  // Progress
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  progress: number; // 0-100

  // Dates
  enrolledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;

  // Certificate
  certificateId: string | null;
  certificateIssuedAt: string | null;
}

/**
 * Lesson Progress Model
 * Tracks individual lesson completion
 */
export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  enrollmentId: string;

  // Progress
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;

  // Video specific
  lastPosition: number; // seconds
  watchedDuration: number; // total seconds watched

  // Metadata
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string;
}

/**
 * Quiz Attempt Model
 * Records quiz submissions
 */
export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  enrollmentId: string;

  // Results
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;

  // Answers
  answers: QuizAnswer[];

  // Time
  startedAt: string;
  completedAt: string;
  durationSeconds: number;

  // Attempt number
  attemptNumber: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean;
  timeSpent: number; // seconds
}

// ============================================================================
// GAMIFICATION
// ============================================================================

/**
 * User Gamification Profile
 */
export interface GamificationProfile {
  id: string;
  userId: string;

  // XP & Level
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;

  // Stats
  totalStudyMinutes: number;
  totalLessonsCompleted: number;
  totalQuizzesPassed: number;
  totalAchievements: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * User Achievement
 */
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  xpAwarded: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

/**
 * Audit Log Entry
 * For tracking all important actions
 */
export interface AuditLog {
  id: string;
  userId: string | null;
  companyId: string | null;

  // Action
  action: AuditAction;
  resource: string;
  resourceId: string;

  // Details
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;

  // Metadata
  createdAt: string;
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'enroll'
  | 'complete'
  | 'certificate_issued'
  | 'settings_changed';
