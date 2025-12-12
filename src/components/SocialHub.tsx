'use client';

import React, { useState } from 'react';
import {
  Users,
  MessageCircle,
  Video,
  X,
  Plus,
  Search,
  ChevronRight,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Send,
  Calendar,
  UserPlus,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocial, type StudyGroup, type ForumQuestion, type LiveSession } from '@/context/SocialContext';

interface SocialHubProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'groups' | 'forum' | 'live';

export default function SocialHub({ isOpen, onClose }: SocialHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('groups');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-600" />
            Community Hub
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('groups')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'groups'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Users className="w-4 h-4" />
            Study Groups
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'forum'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Q&A Forum
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'live'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Video className="w-4 h-4" />
            Live Sessions
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'groups' && <StudyGroupsTab />}
          {activeTab === 'forum' && <ForumTab />}
          {activeTab === 'live' && <LiveSessionsTab />}
        </div>
      </div>
    </div>
  );
}

function StudyGroupsTab() {
  const { studyGroups, myGroups, joinGroup, leaveGroup } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);

  const filteredGroups = studyGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myGroupIds = myGroups.map((g) => g.id);

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        isMember={myGroupIds.includes(selectedGroup.id)}
        onJoin={() => joinGroup(selectedGroup.id)}
        onLeave={() => leaveGroup(selectedGroup.id)}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search study groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors">
          <Plus className="w-5 h-5" />
          Create Group
        </button>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            My Groups ({myGroups.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => setSelectedGroup(group)}
                isMember
              />
            ))}
          </div>
        </div>
      )}

      {/* Discover Groups */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Discover Groups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups
            .filter((g) => !myGroupIds.includes(g.id))
            .map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => setSelectedGroup(group)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function GroupCard({
  group,
  onClick,
  isMember = false,
}: {
  group: StudyGroup;
  onClick: () => void;
  isMember?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{group.name}</h4>
        {isMember && (
          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
            Joined
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{group.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Users className="w-4 h-4" />
          {group.members.length}/{group.maxMembers} members
        </div>
        {group.nextSession && (
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <Calendar className="w-3 h-3" />
            Next session: {new Date(group.nextSession).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupDetail({
  group,
  onBack,
  isMember,
  onJoin,
  onLeave,
}: {
  group: StudyGroup;
  onBack: () => void;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
}) {
  const { sendGroupMessage } = useSocial();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendGroupMessage(group.id, newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="text-sm text-cyan-600 hover:text-cyan-700 mb-2"
        >
          ← Back to groups
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
            <p className="text-sm text-gray-500">{group.description}</p>
          </div>
          {isMember ? (
            <button
              onClick={onLeave}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Leave Group
            </button>
          ) : (
            <button
              onClick={onJoin}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Join Group
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Members ({group.members.length})
        </h4>
        <div className="flex gap-2 flex-wrap">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                {member.name[0]}
              </div>
              <span className="text-sm text-gray-700">{member.name}</span>
              {member.role === 'admin' && (
                <Crown className="w-3 h-3 text-amber-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Group Chat</h4>
        <div className="space-y-3">
          {group.chatMessages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                {msg.userName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {msg.userName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      {isMember && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ForumTab() {
  const { forumQuestions, upvoteQuestion } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestion | null>(null);

  const filteredQuestions = forumQuestions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedQuestion) {
    return (
      <QuestionDetail
        question={selectedQuestion}
        onBack={() => setSelectedQuestion(null)}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors">
          <Plus className="w-5 h-5" />
          Ask Question
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            onClick={() => setSelectedQuestion(question)}
            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
          >
            <div className="flex items-start gap-4">
              {/* Votes */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    upvoteQuestion(question.id);
                  }}
                  className="p-1 hover:bg-green-100 rounded transition-colors"
                >
                  <ThumbsUp className="w-5 h-5 text-gray-400 hover:text-green-500" />
                </button>
                <span className="text-lg font-semibold text-gray-700">
                  {question.upvotes}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {question.isResolved && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {question.isPinned && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      Pinned
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 hover:text-cyan-600">
                  {question.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {question.content}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex gap-2">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{question.answers.length} answers</span>
                    <span>{question.views} views</span>
                    <span>by {question.authorName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionDetail({
  question,
  onBack,
}: {
  question: ForumQuestion;
  onBack: () => void;
}) {
  const { upvoteAnswer, acceptAnswer, answerQuestion } = useSocial();
  const [newAnswer, setNewAnswer] = useState('');

  const handleSubmitAnswer = () => {
    if (!newAnswer.trim()) return;
    answerQuestion(question.id, {
      content: newAnswer,
      authorId: 'user-1',
      authorName: 'Demo User',
    });
    setNewAnswer('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="text-sm text-cyan-600 hover:text-cyan-700 mb-2"
        >
          ← Back to questions
        </button>
        <div className="flex items-center gap-2">
          {question.isResolved && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>Asked by {question.authorName}</span>
          <span>{question.views} views</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-gray-700">{question.content}</p>
        <div className="flex gap-2 mt-3">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Answers */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="font-semibold text-gray-900 mb-4">
          {question.answers.length} Answers
        </h4>
        <div className="space-y-4">
          {question.answers.map((answer) => (
            <div
              key={answer.id}
              className={cn(
                'p-4 rounded-xl border',
                answer.isAccepted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              {answer.isAccepted && (
                <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Accepted Answer
                </div>
              )}
              <p className="text-gray-700">{answer.content}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>by {answer.authorName}</span>
                  <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => upvoteAnswer(question.id, answer.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {answer.upvotes}
                  </button>
                  {!answer.isAccepted && (
                    <button
                      onClick={() => acceptAnswer(question.id, answer.id)}
                      className="text-xs text-cyan-600 hover:text-cyan-700"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer Input */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Your Answer</h4>
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Write your answer..."
          className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmitAnswer}
            disabled={!newAnswer.trim()}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 transition-colors"
          >
            Post Answer
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveSessionsTab() {
  const { liveSessions, upcomingSessions, joinLiveSession } = useSocial();

  return (
    <div className="p-6">
      {/* Upcoming Sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Upcoming Sessions
          </h3>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-cyan-600 border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-colors">
            <Plus className="w-4 h-4" />
            Schedule Session
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingSessions.map((session) => (
            <LiveSessionCard
              key={session.id}
              session={session}
              onJoin={() => joinLiveSession(session.id)}
            />
          ))}
        </div>

        {upcomingSessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming sessions scheduled</p>
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Recorded Sessions
        </h3>
        <div className="space-y-3">
          {liveSessions
            .filter((s) => s.status === 'ended')
            .map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(session.scheduledAt).toLocaleDateString()} • {session.duration} min
                  </p>
                </div>
                <button className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700">
                  <Video className="w-4 h-4" />
                  Watch Recording
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function LiveSessionCard({
  session,
  onJoin,
}: {
  session: LiveSession;
  onJoin: () => void;
}) {
  const isLive = session.status === 'live';
  const spotsLeft = session.maxParticipants - session.currentParticipants;

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      {isLive && (
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <span className="text-xs font-medium text-red-600">LIVE NOW</span>
        </div>
      )}

      <h4 className="font-semibold text-gray-900">{session.title}</h4>
      <p className="text-sm text-gray-600 mt-1">{session.description}</p>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {session.currentParticipants}/{session.maxParticipants}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {session.duration} min
        </div>
        {!isLive && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(session.scheduledAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500">Hosted by {session.hostName}</span>
        <button
          onClick={onJoin}
          disabled={spotsLeft === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors',
            isLive
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-cyan-600 text-white hover:bg-cyan-700',
            spotsLeft === 0 && 'bg-gray-300 cursor-not-allowed'
          )}
        >
          {isLive ? (
            <>
              Join Now <ExternalLink className="w-4 h-4" />
            </>
          ) : (
            <>
              Register <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
