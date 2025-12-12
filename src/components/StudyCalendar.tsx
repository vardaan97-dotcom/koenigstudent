'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  BookOpen,
  FileQuestion,
  Video,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudy, type CalendarEvent } from '@/context/StudyContext';

interface StudyCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

const eventTypeConfig = {
  study: { icon: BookOpen, color: 'bg-blue-500', label: 'Study Session' },
  quiz: { icon: FileQuestion, color: 'bg-purple-500', label: 'Quiz' },
  exam: { icon: AlertCircle, color: 'bg-red-500', label: 'Exam' },
  live_session: { icon: Video, color: 'bg-green-500', label: 'Live Session' },
  deadline: { icon: Clock, color: 'bg-amber-500', label: 'Deadline' },
};

export default function StudyCalendar({ isOpen, onClose }: StudyCalendarProps) {
  const { calendarEvents, addCalendarEvent, removeCalendarEvent } = useStudy();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'study' as CalendarEvent['type'],
    time: '09:00',
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title) return;

    const [hours, minutes] = newEvent.time.split(':').map(Number);
    const eventDate = new Date(selectedDate);
    eventDate.setHours(hours, minutes);

    addCalendarEvent({
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
      startDate: eventDate,
      color: eventTypeConfig[newEvent.type].color.replace('bg-', '#').replace('-500', ''),
    });

    setNewEvent({ title: '', description: '', type: 'study', time: '09:00' });
    setShowAddEvent(false);
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-600" />
            Study Calendar
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 p-6 border-r border-gray-200">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-24" />;
                }

                const events = getEventsForDate(date);
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
                const isSelected =
                  selectedDate &&
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      'h-24 p-1 rounded-lg border transition-all text-left',
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-100 hover:border-gray-300',
                      isToday && 'ring-2 ring-cyan-500 ring-offset-1'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex w-6 h-6 items-center justify-center rounded-full text-sm',
                        isToday && 'bg-cyan-600 text-white',
                        !isToday && 'text-gray-700'
                      )}
                    >
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {events.slice(0, 2).map((event) => {
                        const config = eventTypeConfig[event.type];
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              'text-xs px-1 py-0.5 rounded truncate text-white',
                              config.color
                            )}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{events.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Details Sidebar */}
          <div className="w-80 p-6 overflow-y-auto">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h4>
                  <button
                    onClick={() => setShowAddEvent(true)}
                    className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add Event Form */}
                {showAddEvent && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">Add Event</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Event title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {Object.entries(eventTypeConfig).map(([type, config]) => (
                          <option key={type} value={type}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddEvent(false)}
                          className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddEvent}
                          disabled={!newEvent.title}
                          className="flex-1 px-3 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Events List */}
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;

                    return (
                      <div
                        key={event.id}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', config.color)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{event.title}</h5>
                            {event.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.startDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {event.reminder && (
                                <span className="flex items-center gap-1">
                                  <Bell className="w-3 h-3" />
                                  Reminder set
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeCalendarEvent(event.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {getEventsForDate(selectedDate).length === 0 && !showAddEvent && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No events scheduled</p>
                      <button
                        onClick={() => setShowAddEvent(true)}
                        className="mt-2 text-sm text-cyan-600 hover:text-cyan-700"
                      >
                        + Add an event
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a date to view or add events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
