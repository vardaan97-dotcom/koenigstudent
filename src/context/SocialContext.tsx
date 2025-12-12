'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId: string;
  members: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
    joinedAt: Date;
  }[];
  maxMembers: number;
  isPrivate: boolean;
  createdAt: Date;
  nextSession?: Date;
  chatMessages: GroupMessage[];
}

export interface GroupMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  reactions: { emoji: string; userId: string }[];
}

export interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  answers: ForumAnswer[];
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
  isPinned: boolean;
}

export interface ForumAnswer {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  courseId: string;
  moduleId?: string;
  scheduledAt: Date;
  duration: number; // minutes
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'live' | 'ended';
  joinLink?: string;
  recordingUrl?: string;
}

interface SocialContextType {
  // Study Groups
  studyGroups: StudyGroup[];
  myGroups: StudyGroup[];
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  createGroup: (group: Omit<StudyGroup, 'id' | 'createdAt' | 'chatMessages' | 'members'>) => void;
  sendGroupMessage: (groupId: string, content: string) => void;

  // Forum
  forumQuestions: ForumQuestion[];
  askQuestion: (question: Omit<ForumQuestion, 'id' | 'createdAt' | 'updatedAt' | 'answers' | 'upvotes' | 'downvotes' | 'views' | 'isResolved' | 'isPinned'>) => void;
  answerQuestion: (questionId: string, answer: Omit<ForumAnswer, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'isAccepted'>) => void;
  upvoteQuestion: (questionId: string) => void;
  upvoteAnswer: (questionId: string, answerId: string) => void;
  acceptAnswer: (questionId: string, answerId: string) => void;

  // Live Sessions
  liveSessions: LiveSession[];
  upcomingSessions: LiveSession[];
  joinLiveSession: (sessionId: string) => void;
  scheduleLiveSession: (session: Omit<LiveSession, 'id' | 'status' | 'currentParticipants'>) => void;

  // Progress Sharing
  shareProgress: (platform: 'twitter' | 'linkedin' | 'copy') => string;
  generateCertificateBadge: () => string;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const currentUserId = 'user-1'; // In real app, get from auth
  const currentUserName = 'Demo User';

  // Study Groups
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: 'group-1',
      name: 'AZ-104 Study Squad',
      description: 'Group for AZ-104 exam preparation. We meet twice a week to discuss topics and solve practice questions.',
      courseId: 'az-104',
      members: [
        { id: 'user-2', name: 'Sarah Chen', role: 'admin', joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { id: 'user-3', name: 'Mike Johnson', role: 'member', joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: 'user-4', name: 'Emily Davis', role: 'member', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      ],
      maxMembers: 10,
      isPrivate: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      chatMessages: [
        {
          id: 'msg-1',
          userId: 'user-2',
          userName: 'Sarah Chen',
          content: 'Welcome everyone! Let\'s crush this exam together! 💪',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          reactions: [{ emoji: '🎉', userId: 'user-3' }],
        },
        {
          id: 'msg-2',
          userId: 'user-3',
          userName: 'Mike Johnson',
          content: 'Has anyone covered the networking module yet? I\'m finding VNet peering a bit confusing.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          reactions: [],
        },
      ],
    },
    {
      id: 'group-2',
      name: 'Azure Networking Experts',
      description: 'Deep dive into Azure networking concepts. Perfect for those focusing on the networking section.',
      courseId: 'az-104',
      members: [
        { id: 'user-5', name: 'Alex Thompson', role: 'admin', joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      ],
      maxMembers: 15,
      isPrivate: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      chatMessages: [],
    },
  ]);

  // Forum Questions
  const [forumQuestions, setForumQuestions] = useState<ForumQuestion[]>([
    {
      id: 'q-1',
      title: 'What\'s the difference between Azure VNet and Subnet?',
      content: 'I\'m confused about the relationship between Virtual Networks and Subnets in Azure. Can someone explain with a practical example?',
      authorId: 'user-3',
      authorName: 'Mike Johnson',
      courseId: 'az-104',
      moduleId: 'module-3',
      tags: ['networking', 'vnet', 'subnet'],
      upvotes: 15,
      downvotes: 0,
      views: 234,
      isResolved: true,
      isPinned: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      answers: [
        {
          id: 'a-1',
          content: 'Think of a VNet as a private network in Azure (like your office network), and subnets as segments within that network. VNet defines the overall IP address range, while subnets divide it into smaller, manageable sections. For example, you might have a VNet with range 10.0.0.0/16 and create subnets like 10.0.1.0/24 for web servers and 10.0.2.0/24 for databases.',
          authorId: 'user-2',
          authorName: 'Sarah Chen',
          upvotes: 12,
          downvotes: 0,
          isAccepted: true,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      id: 'q-2',
      title: 'How to prepare for AZ-104 in 2 weeks?',
      content: 'I have my exam scheduled in 2 weeks. What\'s the best strategy to prepare? I\'ve completed about 50% of the course.',
      authorId: 'user-4',
      authorName: 'Emily Davis',
      courseId: 'az-104',
      tags: ['exam-prep', 'study-tips'],
      upvotes: 8,
      downvotes: 1,
      views: 156,
      isResolved: false,
      isPinned: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      answers: [],
    },
  ]);

  // Live Sessions
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([
    {
      id: 'live-1',
      title: 'Azure Networking Deep Dive',
      description: 'Join us for a comprehensive review of Azure networking concepts including VNets, NSGs, and Load Balancers.',
      hostId: 'user-2',
      hostName: 'Sarah Chen',
      courseId: 'az-104',
      moduleId: 'module-3',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
      maxParticipants: 50,
      currentParticipants: 23,
      status: 'scheduled',
    },
    {
      id: 'live-2',
      title: 'Practice Quiz Walkthrough',
      description: 'We\'ll go through practice questions together and discuss the best approaches.',
      hostId: 'user-5',
      hostName: 'Alex Thompson',
      courseId: 'az-104',
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      duration: 90,
      maxParticipants: 30,
      currentParticipants: 12,
      status: 'scheduled',
    },
  ]);

  const myGroups = studyGroups.filter((g) =>
    g.members.some((m) => m.id === currentUserId)
  );

  const upcomingSessions = liveSessions.filter(
    (s) => s.status === 'scheduled' && s.scheduledAt > new Date()
  );

  // Study Group functions
  const joinGroup = useCallback((groupId: string) => {
    setStudyGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId && group.members.length < group.maxMembers) {
          return {
            ...group,
            members: [
              ...group.members,
              { id: currentUserId, name: currentUserName, role: 'member' as const, joinedAt: new Date() },
            ],
          };
        }
        return group;
      })
    );
  }, [currentUserId, currentUserName]);

  const leaveGroup = useCallback((groupId: string) => {
    setStudyGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter((m) => m.id !== currentUserId),
          };
        }
        return group;
      })
    );
  }, [currentUserId]);

  const createGroup = useCallback((group: Omit<StudyGroup, 'id' | 'createdAt' | 'chatMessages' | 'members'>) => {
    setStudyGroups((prev) => [
      ...prev,
      {
        ...group,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        chatMessages: [],
        members: [{ id: currentUserId, name: currentUserName, role: 'admin' as const, joinedAt: new Date() }],
      },
    ]);
  }, [currentUserId, currentUserName]);

  const sendGroupMessage = useCallback((groupId: string, content: string) => {
    setStudyGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            chatMessages: [
              ...group.chatMessages,
              {
                id: crypto.randomUUID(),
                userId: currentUserId,
                userName: currentUserName,
                content,
                timestamp: new Date(),
                reactions: [],
              },
            ],
          };
        }
        return group;
      })
    );
  }, [currentUserId, currentUserName]);

  // Forum functions
  const askQuestion = useCallback((question: Omit<ForumQuestion, 'id' | 'createdAt' | 'updatedAt' | 'answers' | 'upvotes' | 'downvotes' | 'views' | 'isResolved' | 'isPinned'>) => {
    const now = new Date();
    setForumQuestions((prev) => [
      {
        ...question,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        answers: [],
        upvotes: 0,
        downvotes: 0,
        views: 0,
        isResolved: false,
        isPinned: false,
      },
      ...prev,
    ]);
  }, []);

  const answerQuestion = useCallback((questionId: string, answer: Omit<ForumAnswer, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'isAccepted'>) => {
    const now = new Date();
    setForumQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: [
              ...q.answers,
              {
                ...answer,
                id: crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
                upvotes: 0,
                downvotes: 0,
                isAccepted: false,
              },
            ],
            updatedAt: now,
          };
        }
        return q;
      })
    );
  }, []);

  const upvoteQuestion = useCallback((questionId: string) => {
    setForumQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
  }, []);

  const upvoteAnswer = useCallback((questionId: string, answerId: string) => {
    setForumQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers.map((a) =>
              a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
            ),
          };
        }
        return q;
      })
    );
  }, []);

  const acceptAnswer = useCallback((questionId: string, answerId: string) => {
    setForumQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            isResolved: true,
            answers: q.answers.map((a) => ({
              ...a,
              isAccepted: a.id === answerId,
            })),
          };
        }
        return q;
      })
    );
  }, []);

  // Live Session functions
  const joinLiveSession = useCallback((sessionId: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId && s.currentParticipants < s.maxParticipants) {
          return { ...s, currentParticipants: s.currentParticipants + 1 };
        }
        return s;
      })
    );
  }, []);

  const scheduleLiveSession = useCallback((session: Omit<LiveSession, 'id' | 'status' | 'currentParticipants'>) => {
    setLiveSessions((prev) => [
      ...prev,
      {
        ...session,
        id: crypto.randomUUID(),
        status: 'scheduled' as const,
        currentParticipants: 0,
      },
    ]);
  }, []);

  // Progress Sharing
  const shareProgress = useCallback((platform: 'twitter' | 'linkedin' | 'copy'): string => {
    const progressText = `I'm making great progress on my AZ-104 Azure Administrator certification! 🎯 Currently at 42% completion with a 5-day learning streak! #Azure #CloudComputing #Learning`;

    if (platform === 'copy') {
      return progressText;
    } else if (platform === 'twitter') {
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(progressText)}`;
    } else {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://koenig.com')}&summary=${encodeURIComponent(progressText)}`;
    }
  }, []);

  const generateCertificateBadge = useCallback((): string => {
    // Return a badge image URL or data
    return 'data:image/svg+xml,...'; // Placeholder
  }, []);

  return (
    <SocialContext.Provider
      value={{
        studyGroups,
        myGroups,
        joinGroup,
        leaveGroup,
        createGroup,
        sendGroupMessage,
        forumQuestions,
        askQuestion,
        answerQuestion,
        upvoteQuestion,
        upvoteAnswer,
        acceptAnswer,
        liveSessions,
        upcomingSessions,
        joinLiveSession,
        scheduleLiveSession,
        shareProgress,
        generateCertificateBadge,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
