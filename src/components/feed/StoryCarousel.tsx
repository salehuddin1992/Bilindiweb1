import React, { useState } from 'react';
import { Plus, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Story } from '../../types';
import { StoryCreateModal } from '../modals/StoryCreateModal';
import { StoryViewerModal } from '../modals/StoryViewerModal';

export const StoryCarousel: React.FC = () => {
  const { currentUser, stories, users, selectedClassFilter } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  // Filter stories based on class relevance
  const filteredStories = stories.filter((story) => {
    const author = users[story.authorId];
    const storyClass = story.targetClass || author?.className || 'Semua Kelas';

    if (currentUser?.role === 'STUDENT') {
      const studentClass = currentUser.className || 'VII-A';
      return (
        storyClass.toLowerCase() === studentClass.toLowerCase() ||
        (author?.role === 'STUDENT' && author.className?.toLowerCase() === studentClass.toLowerCase()) ||
        author?.role === 'TEACHER' ||
        author?.role === 'PRINCIPAL' ||
        storyClass === 'Semua Kelas'
      );
    } else {
      if (selectedClassFilter === 'Semua Kelas' || !selectedClassFilter) {
        return true;
      }
      return (
        storyClass.toLowerCase() === selectedClassFilter.toLowerCase() ||
        (author?.role === 'STUDENT' && author.className?.toLowerCase() === selectedClassFilter.toLowerCase()) ||
        storyClass === 'Semua Kelas'
      );
    }
  });

  const handleStoryClick = (story: Story) => {
    setViewedIds((prev) => new Set([...prev, story.id]));
    setSelectedStory(story);
  };

  return (
    <>
      <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scrollbar-none">
        {/* Create Story Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="relative shrink-0 w-28 h-44 rounded-2xl overflow-hidden bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3e4042] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
        >
          <div className="relative h-28 w-full overflow-hidden bg-slate-200 dark:bg-[#3a3b3c]">
            <img
              src={currentUser?.avatarUrl}
              alt={currentUser?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-end pb-2.5 pt-1">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center border-4 border-white dark:border-[#242526] shadow-sm">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
              Buat Cerita
            </span>
          </div>
        </div>

        {/* Story Cards */}
        {filteredStories.map((story) => {
          const author = users[story.authorId];
          const isViewed = viewedIds.has(story.id);

          return (
            <div
              key={story.id}
              onClick={() => handleStoryClick(story)}
              className="relative shrink-0 w-28 h-44 rounded-2xl overflow-hidden bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Media Thumbnail */}
              <img
                src={story.imageUrl}
                alt={story.caption || 'Cerita'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Scrim Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Author Avatar with Ring */}
              <div
                className={`absolute top-2.5 left-2.5 w-9 h-9 rounded-full overflow-hidden border-2 ${
                  isViewed ? 'border-slate-400' : 'border-[#1877F2]'
                }`}
              >
                <img
                  src={author?.avatarUrl}
                  alt={author?.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Video indicator badge */}
              {story.isVideo && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              )}

              {/* Author Name */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                <span className="text-[11px] font-bold text-white leading-tight line-clamp-2 drop-shadow-sm">
                  {author?.name?.split(' ')[0] || 'Siswa'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Create Modal */}
      {showCreateModal && (
        <StoryCreateModal onDismiss={() => setShowCreateModal(false)} />
      )}

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewerModal
          story={selectedStory}
          author={users[selectedStory.authorId]}
          onDismiss={() => setSelectedStory(null)}
        />
      )}
    </>
  );
};
