'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import CourseHeader from '@/components/CourseHeader';
import TabNavigation from '@/components/TabNavigation';
import ModuleList from '@/components/ModuleList';
import VideoPlayer from '@/components/VideoPlayer';
import QuizModal from '@/components/QuizModal';
import QubitsPracticeModal from '@/components/QubitsPracticeModal';
import ProgressSidebar from '@/components/ProgressSidebar';
import QubitsSection from '@/components/QubitsSection';
import ResourcesSection from '@/components/ResourcesSection';
import SupportSection from '@/components/SupportSection';
import CertificateSection from '@/components/CertificateSection';
import {
  learnerProfile,
  course,
  modules as initialModules,
  learnerProgress,
  qubitsModules as initialQubitsModules,
  qubitsDashboard as initialQubitsDashboard,
  trainer,
  resources,
  notifications,
} from '@/data/mockData';
import { getQuestionsFromModules } from '@/data/qubitsQuestions';
import type { TabId, Lesson, Module, Quiz, QuizQuestion, QubitsModule, QubitsDashboard } from '@/types';

export default function LearnerDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('course');
  const [modules, setModules] = useState(initialModules);
  const [progress, setProgress] = useState(learnerProgress);
  const [qubitsModules, setQubitsModules] = useState<QubitsModule[]>(initialQubitsModules);
  const [qubitsDashboard, setQubitsDashboard] = useState<QubitsDashboard>(initialQubitsDashboard);

  // Video player state
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizModuleTitle, setQuizModuleTitle] = useState('');
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Qubits Practice Test state
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<QuizQuestion[]>([]);
  const [practiceModuleTitle, setPracticeModuleTitle] = useState('');

  // Find lesson and module by ID
  const findLessonAndModule = useCallback(
    (lessonId: string, moduleId: string) => {
      const module = modules.find((m) => m.id === moduleId);
      const lesson = module?.lessons.find((l) => l.id === lessonId);
      return { module, lesson };
    },
    [modules]
  );

  // Handle play lesson
  const handlePlayLesson = useCallback(
    (lessonId: string, moduleId: string) => {
      const { module, lesson } = findLessonAndModule(lessonId, moduleId);
      if (lesson && module) {
        setCurrentLesson(lesson);
        setCurrentModule(module);
        setIsVideoOpen(true);
      }
    },
    [findLessonAndModule]
  );

  // Handle start quiz
  const handleStartQuiz = useCallback(
    (quizId: string, moduleId: string) => {
      const module = modules.find((m) => m.id === moduleId);
      if (module) {
        setCurrentQuiz(module.quiz);
        setQuizModuleTitle(`Module ${module.number}: ${module.title}`);
        setIsQuizOpen(true);
      }
    },
    [modules]
  );

  // Handle video close
  const handleCloseVideo = useCallback(() => {
    setIsVideoOpen(false);
    setCurrentLesson(null);
    setCurrentModule(null);
  }, []);

  // Handle lesson complete
  const handleLessonComplete = useCallback(
    (lessonId: string) => {
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, status: 'completed' as const, progress: 100 }
              : lesson
          ),
          progress: Math.round(
            (module.lessons.filter(
              (l) => l.id === lessonId || l.status === 'completed'
            ).length /
              module.lessons.length) *
              100
          ),
        }))
      );

      setProgress((prev) => ({
        ...prev,
        lessonsCompleted: prev.lessonsCompleted + 1,
        overallProgress: Math.round(
          ((prev.lessonsCompleted + 1) / prev.totalLessons) * 100
        ),
      }));
    },
    []
  );

  // Handle video progress update
  const handleProgressUpdate = useCallback(
    (lessonId: string, progressValue: number, position: number) => {
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  progress: progressValue,
                  lastPosition: position,
                  status: progressValue > 0 ? 'in_progress' : lesson.status,
                }
              : lesson
          ),
        }))
      );
    },
    []
  );

  // Handle next lesson
  const handleNextLesson = useCallback(() => {
    if (!currentModule || !currentLesson) return;

    const currentIndex = currentModule.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );
    const nextLesson = currentModule.lessons[currentIndex + 1];

    if (nextLesson) {
      setCurrentLesson(nextLesson);
    } else {
      // No more lessons in module, close video
      handleCloseVideo();
    }
  }, [currentModule, currentLesson, handleCloseVideo]);

  // Handle quiz close
  const handleCloseQuiz = useCallback(() => {
    setIsQuizOpen(false);
    setCurrentQuiz(null);
  }, []);

  // Handle quiz submit
  const handleQuizSubmit = useCallback(
    (score: number, answers: Record<string, string[]>) => {
      const passed = score >= (currentQuiz?.passingScore || 70);

      setModules((prev) =>
        prev.map((module) => {
          if (module.quiz.id === currentQuiz?.id) {
            return {
              ...module,
              quiz: {
                ...module.quiz,
                status: passed ? 'passed' : 'failed',
                bestScore: Math.max(module.quiz.bestScore || 0, score),
              },
              status: passed && module.progress === 100 ? 'completed' : module.status,
            };
          }
          return module;
        })
      );

      if (passed) {
        setProgress((prev) => ({
          ...prev,
          quizzesPassed: prev.quizzesPassed + 1,
          questionsAttempted:
            prev.questionsAttempted + (currentQuiz?.questions.length || 0),
          questionsCorrect:
            prev.questionsCorrect +
            Math.round(((currentQuiz?.questions.length || 0) * score) / 100),
          averageScore: Math.round(
            (prev.averageScore * prev.quizzesPassed + score) /
              (prev.quizzesPassed + 1)
          ),
        }));
      }
    },
    [currentQuiz]
  );

  // Handle review video from quiz
  const handleReviewVideo = useCallback(() => {
    handleCloseQuiz();
    // Find the module for the quiz and play the first lesson
    const module = modules.find((m) => m.quiz.id === currentQuiz?.id);
    if (module && module.lessons[0]) {
      handlePlayLesson(module.lessons[0].id, module.id);
    }
  }, [modules, currentQuiz, handleCloseQuiz, handlePlayLesson]);

  // Handle Qubits start test
  const handleQubitsStartTest = useCallback(
    (moduleIds: string[], questionCounts: Record<string, number>) => {
      // Get questions from selected modules
      const questions = getQuestionsFromModules(moduleIds, questionCounts);

      if (questions.length === 0) {
        console.warn('No questions found for selected modules');
        return;
      }

      // Create module title based on selection
      const selectedTitles = moduleIds
        .map((id) => {
          const mod = qubitsModules.find((m) => m.id === id);
          return mod?.title;
        })
        .filter(Boolean);

      const title = selectedTitles.length === 1
        ? selectedTitles[0]!
        : `${selectedTitles.length} Modules (${questions.length} Questions)`;

      setPracticeQuestions(questions);
      setPracticeModuleTitle(title);
      setIsPracticeOpen(true);
    },
    [qubitsModules]
  );

  // Handle Qubits practice complete
  const handlePracticeComplete = useCallback(
    (score: number, totalTime: number, results: { questionId: string; isCorrect: boolean }[]) => {
      const totalQuestions = results.length;

      // Update Qubits dashboard stats
      setQubitsDashboard((prev) => ({
        ...prev,
        totalQuizzes: prev.totalQuizzes + 1,
        totalQuestionsAttempted: prev.totalQuestionsAttempted + totalQuestions,
        overallAccuracy: Math.round(
          ((prev.overallAccuracy * prev.totalQuestionsAttempted + score * totalQuestions / 100) /
            (prev.totalQuestionsAttempted + totalQuestions)) * 100
        ) / 100 * 100,
        timeSpent: `${Math.round(parseInt(prev.timeSpent) + totalTime / 60)}h`,
        streak: prev.streak + (score >= 70 ? 1 : 0),
        lastPracticeDate: new Date().toISOString(),
      }));

      // Update individual module stats
      setQubitsModules((prev) =>
        prev.map((mod) => {
          const moduleQuestions = results.filter((r) =>
            practiceQuestions.find((q) => q.id === r.questionId)?.id.startsWith(mod.id.replace('qubits-', 'qb'))
          );

          if (moduleQuestions.length === 0) return mod;

          const moduleCorrect = moduleQuestions.filter((r) => r.isCorrect).length;

          return {
            ...mod,
            attemptedQuestions: mod.attemptedQuestions + moduleQuestions.length,
            correctAnswers: mod.correctAnswers + moduleCorrect,
            incorrectAnswers: mod.incorrectAnswers + (moduleQuestions.length - moduleCorrect),
            unattempted: Math.max(0, mod.unattempted - moduleQuestions.length),
            accuracy: Math.round(
              ((mod.correctAnswers + moduleCorrect) / (mod.attemptedQuestions + moduleQuestions.length)) * 100
            ),
          };
        })
      );
    },
    [practiceQuestions]
  );

  // Handle Qubits reset
  const handleQubitsReset = useCallback(() => {
    setQubitsModules(initialQubitsModules);
    setQubitsDashboard(initialQubitsDashboard);
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'course':
        return (
          <ModuleList
            modules={modules}
            onPlayLesson={handlePlayLesson}
            onStartQuiz={handleStartQuiz}
          />
        );
      case 'qubits':
        return (
          <QubitsSection
            modules={qubitsModules}
            dashboard={qubitsDashboard}
            onStartTest={handleQubitsStartTest}
            onReset={handleQubitsReset}
          />
        );
      case 'resources':
        return <ResourcesSection resources={resources} />;
      case 'support':
        return <SupportSection trainer={trainer} />;
      case 'certificate':
        return (
          <CertificateSection
            progress={progress}
            course={course}
            learner={learnerProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header learner={learnerProfile} notifications={notifications} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CourseHeader course={course} progress={progress} />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          certificateEarned={progress.certificateEarned}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">{renderTabContent()}</div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProgressSidebar progress={progress} qubitsDashboard={qubitsDashboard} />
          </div>
        </div>
      </main>

      {/* Video Player Modal */}
      {isVideoOpen && currentLesson && currentModule && (
        <VideoPlayer
          isOpen={isVideoOpen}
          onClose={handleCloseVideo}
          lesson={currentLesson}
          module={currentModule}
          courseName={course.name}
          onComplete={handleLessonComplete}
          onProgressUpdate={handleProgressUpdate}
          onNextLesson={
            currentModule.lessons.findIndex((l) => l.id === currentLesson.id) <
            currentModule.lessons.length - 1
              ? handleNextLesson
              : undefined
          }
        />
      )}

      {/* Quiz Modal */}
      {isQuizOpen && currentQuiz && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={handleCloseQuiz}
          quiz={currentQuiz}
          moduleTitle={quizModuleTitle}
          onSubmit={handleQuizSubmit}
          onReviewVideo={handleReviewVideo}
        />
      )}

      {/* Qubits Practice Test Modal */}
      {isPracticeOpen && practiceQuestions.length > 0 && (
        <QubitsPracticeModal
          isOpen={isPracticeOpen}
          onClose={() => setIsPracticeOpen(false)}
          questions={practiceQuestions}
          moduleTitle={practiceModuleTitle}
          onComplete={handlePracticeComplete}
        />
      )}
    </div>
  );
}
