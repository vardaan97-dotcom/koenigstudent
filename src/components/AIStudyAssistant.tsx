'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickPrompts = [
  { icon: BookOpen, text: 'Explain this topic', prompt: 'Can you explain the current topic in simple terms?' },
  { icon: HelpCircle, text: 'Quiz me', prompt: 'Create a quick quiz question about what I\'m learning' },
  { icon: Lightbulb, text: 'Study tips', prompt: 'Give me study tips for this certification exam' },
];

const aiResponses: Record<string, string> = {
  default: "I'm your AI study assistant! I can help you understand concepts, create quizzes, explain topics, and provide study tips. What would you like to learn about today?",
  explain: "Great question! Let me break this down for you:\n\n**Azure Virtual Networks (VNet)** are the fundamental building block for private networks in Azure. Think of it like your own isolated network in the cloud.\n\nKey concepts:\n• **Address Space**: The IP range for your VNet (e.g., 10.0.0.0/16)\n• **Subnets**: Segments within your VNet for organizing resources\n• **NSGs**: Network Security Groups for traffic control\n\nWould you like me to create some practice questions on this topic?",
  quiz: "Here's a practice question for you:\n\n**Question:** Which Azure service would you use to connect two VNets in the same region?\n\nA) VPN Gateway\nB) VNet Peering\nC) ExpressRoute\nD) Application Gateway\n\nTake your time to think about it, then reply with your answer (A, B, C, or D)!",
  tips: "Here are my top study tips for the AZ-104 exam:\n\n1. **Hands-on Practice** - Use Azure free tier to practice. Theory alone won't cut it!\n\n2. **Focus on IAM & Networking** - These are heavily tested topics\n\n3. **Use Flashcards** - Great for memorizing CLI commands and PowerShell syntax\n\n4. **Practice Tests** - Take at least 3-4 full practice exams before the real one\n\n5. **Time Management** - 120 mins for 40-60 questions. Don't spend too long on any single question\n\nWould you like me to elaborate on any of these?",
  answer_b: "**Correct! 🎉** VNet Peering is the answer!\n\nVNet Peering allows you to connect two VNets seamlessly through the Azure backbone network. Traffic between peered VNets uses private IP addresses only - no public internet, gateways, or encryption needed.\n\nKey facts about VNet Peering:\n• Low latency, high bandwidth connection\n• Can peer VNets in same or different regions (Global VNet Peering)\n• Non-transitive by default\n\nReady for another question?",
};

interface AIStudyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic?: string;
}

export default function AIStudyAssistant({ isOpen, onClose, currentTopic }: AIStudyAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: aiResponses.default,
      timestamp: new Date(),
      suggestions: ['Explain Azure VNets', 'Quiz me on networking', 'Study tips for AZ-104'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('topic')) {
      return aiResponses.explain;
    }
    if (lowerMessage.includes('quiz') || lowerMessage.includes('question') || lowerMessage.includes('test')) {
      return aiResponses.quiz;
    }
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('study')) {
      return aiResponses.tips;
    }
    if (lowerMessage === 'b' || lowerMessage.includes('vnet peering')) {
      return aiResponses.answer_b;
    }

    return "That's a great question! Based on your current progress in the AZ-104 course, I'd recommend focusing on hands-on labs alongside the video content. The Azure networking concepts can be tricky, but practice makes perfect!\n\nIs there a specific topic you'd like me to explain in more detail?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300',
        isMinimized
          ? 'bottom-4 right-4 w-72 h-14'
          : 'bottom-4 right-4 w-96 h-[600px] max-h-[80vh]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Study Assistant</h3>
            {!isMinimized && (
              <p className="text-white/70 text-xs">Powered by AI</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-white/80 hover:bg-white text-violet-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 whitespace-nowrap transition-colors"
                >
                  <prompt.icon className="w-3 h-3" />
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
