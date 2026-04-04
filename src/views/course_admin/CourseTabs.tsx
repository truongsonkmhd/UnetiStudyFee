import React, { useState } from 'react';
import { Lightbulb, Settings } from 'lucide-react';
import CourseGuideView from './CourseGuideView';
import CourseSettingsView from './CourseSettingsView';

interface CourseTabsProps {
  courseId?: string;
}

const TABS = [
  { id: 'settings', label: 'Cài đặt', icon: Settings },
] as const;

type TabId = (typeof TABS)[number]['id'];

const CourseTabs: React.FC<CourseTabsProps> = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('settings');

  return (
    <div className="space-y-6">
      {/* Tab Bar - Optional if only one tab exists now */}
      <div className="flex gap-1 rounded-2xl border border-border bg-muted/40 p-1.5 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest transition-all duration-200
                ${isActive
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }
              `}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'settings' && <CourseSettingsView 
            courseId={courseId}
            status={'DRAFT' as any}
            isPublished={false}
            showStudentCount={true}
            showProgress={true}
            onStatusChange={() => {}}
            onPublishedChange={() => {}}
            onShowStudentCountChange={() => {}}
            onShowProgressChange={() => {}}
        />}
      </div>
    </div>

  );
};

export default CourseTabs;
