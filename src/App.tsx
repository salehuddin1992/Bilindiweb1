import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavBar } from './components/layout/TopNavBar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { FeedView } from './components/feed/FeedView';
import { ReelsView } from './components/reels/ReelsView';
import { LearnDashboardView } from './components/learn/LearnDashboardView';
import { ClassesView } from './components/classes/ClassesView';
import { MessengerView } from './components/messenger/MessengerView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import {
  Home,
  PlaySquare,
  BookOpen,
  Users,
  User as UserIcon,
} from 'lucide-react';
import { NavTab } from './types';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab, setActiveTab } = useApp();

  if (!currentUser) {
    return <LoginView />;
  }

  const renderCenterView = () => {
    switch (activeTab) {
      case 'home':
        return <FeedView />;
      case 'reels':
        return <ReelsView />;
      case 'assignments':
        return <LearnDashboardView />;
      case 'classes':
        return <ClassesView />;
      case 'messenger':
        return <MessengerView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <FeedView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] text-[#050505] dark:text-[#E4E6EB] transition-colors pb-16 lg:pb-6">
      {/* 1. Top Navigation Bar (Header) */}
      <TopNavBar />

      {/* 2. Landscape 3-Column Grid Container */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Sidebar: User, Navigation & Shortcuts) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-18 h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
            <LeftSidebar />
          </div>

          {/* Center Column (Feed / Active View) */}
          <div className="col-span-12 lg:col-span-6 min-w-0">
            {renderCenterView()}
          </div>

          {/* Right Column (Sidebar: Moderation, Deadlines & Contacts) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-18 h-[calc(100vh-5.5rem)] overflow-y-auto pl-1">
            <RightSidebar />
          </div>
        </div>
      </main>

      {/* 3. Mobile / Small Screen Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#242526] border-t border-slate-200 dark:border-[#3e4042] flex items-center justify-around py-1.5 shadow-lg">
        {[
          { tab: 'home' as NavTab, label: 'Beranda', icon: <Home className="w-5 h-5" /> },
          { tab: 'reels' as NavTab, label: 'Reels', icon: <PlaySquare className="w-5 h-5" /> },
          { tab: 'assignments' as NavTab, label: 'Learn', icon: <BookOpen className="w-5 h-5" /> },
          { tab: 'classes' as NavTab, label: 'Kelas', icon: <Users className="w-5 h-5" /> },
          { tab: 'profile' as NavTab, label: 'Profil', icon: <UserIcon className="w-5 h-5" /> },
        ].map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#1877F2] font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
