import React, { useState, useEffect, useCallback } from 'react';
import { User, Course, AppView } from './types';
import * as authService from './services/authService';
import * as courseService from './services/courseService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TranscriptionEditor from './components/TranscriptionEditor';
import CourseReader from './components/CourseReader';
import Header from './components/common/Header';
import Welcome from './components/Welcome';
import Loader from './components/common/Loader';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const allCourses = courseService.getCourses();
      setCourses(allCourses);
      setView('dashboard');
    } else {
      setView('welcome');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const allCourses = courseService.getCourses();
    setCourses(allCourses);
    setView('dashboard');
  };
  
  const handleSignUp = (user: User) => {
    setCurrentUser(user);
    const allCourses = courseService.getCourses();
    setCourses(allCourses);
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveCourse(null);
    setCourses([]);
    setView('auth');
  };

  const handleStartNewLecture = () => {
    setActiveCourse(null);
    setView('editor');
  };

  const handleViewCourse = (course: Course) => {
    setActiveCourse(course);
    setView('reader');
  };

  const handleEditCourse = (course: Course) => {
    setActiveCourse(course);
    setView('editor');
  };

  const handleSaveCourse = (courseData: { id: string | null, title: string, content: string }) => {
    if (!currentUser) return;
    
    courseService.saveCourse(courseData, currentUser.id);
    const allCourses = courseService.getCourses();
    setCourses(allCourses);
    
    setActiveCourse(null);
    setView('dashboard');
  };
  
  const navigateToDashboard = useCallback(() => {
    setActiveCourse(null)
    setView('dashboard')
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
          <Loader text="Loading..." />
        </div>
      );
    }

    if (view === 'welcome') {
      return <Welcome onContinue={() => setView('auth')} />;
    }
    
    if (!currentUser) {
      return <Auth onLogin={handleLogin} onSignUp={handleSignUp} />;
    }
    
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            courses={courses}
            onStartNewLecture={handleStartNewLecture}
            onViewCourse={handleViewCourse}
            onEditCourse={handleEditCourse}
          />
        );
      case 'editor':
        return <TranscriptionEditor courseToEdit={activeCourse} onSave={handleSaveCourse} onCancel={navigateToDashboard} />;
      case 'reader':
        return activeCourse ? <CourseReader course={activeCourse} onBack={navigateToDashboard} /> : <div/>;
      default:
        return <Dashboard
            currentUser={currentUser}
            courses={courses}
            onStartNewLecture={handleStartNewLecture}
            onViewCourse={handleViewCourse}
            onEditCourse={handleEditCourse}
          />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-brand-dark dark:text-slate-200 font-sans transition-colors duration-300">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onLogoClick={currentUser ? navigateToDashboard : undefined}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
