import React from 'react';
import CourseSettingsView from '@/views/course_admin/CourseSettingsView';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto p-6 lg:p-10">
      <CourseSettingsView />
    </div>
  );
};

export default SettingsPage;
