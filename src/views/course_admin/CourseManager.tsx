import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import CourseService from '@/services/courseService';
import { CourseShowRequest } from '@/model/course-admin/CourseShowRequest';
import { CourseTreeResponse } from '@/model/course-admin/CourseTreeResponse';
import { PATHS } from '@/constants/paths';
import { ArrowLeft, BookOpen } from 'lucide-react';

import CourseList from './CourseList';
import CourseDetail from './CourseDetail';
import CourseForm from './CourseForm';

const CourseManager: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
    const [editingCourse, setEditingCourse] = useState<CourseTreeResponse | undefined>();

    const isCreate = location.pathname === PATHS.CREATE_COURSE;
    const isEdit = location.pathname.includes('/edit');
    const isView = location.pathname.includes('/view');

    useEffect(() => {
        if (isEdit && id) {
            handleEdit(id);
        } else if (isView && id) {
            setSelectedCourseId(id);
        } else if (isCreate) {
            setEditingCourse(undefined);
            setSelectedCourseId(undefined);
        } else {
            setEditingCourse(undefined);
            setSelectedCourseId(undefined);
        }
    }, [isEdit, isView, isCreate, id, location.pathname]);

    const handleCreate = () => {
        navigate(PATHS.CREATE_COURSE);
    };

    const handleEdit = async (courseId: string) => {
        try {
            const course = await CourseService.getCourseById(courseId);
            setEditingCourse(course);
            if (!location.pathname.includes('/edit')) {
                navigate(PATHS.EDIT_COURSE.replace(':id', courseId));
            }
        } catch (error) {
            toast.error('Không thể lấy thông tin khóa học để chỉnh sửa');
            navigate(PATHS.MANAGER_COURSES);
        }
    };

    const handleView = (courseId: string) => {
        navigate(PATHS.VIEW_COURSE.replace(':id', courseId));
    };

    const handleBack = () => {
        navigate(PATHS.MANAGER_COURSES);
        setSelectedCourseId(undefined);
        setEditingCourse(undefined);
    };

    const handleSubmit = async (data: CourseShowRequest) => {
        try {
            if (isCreate) {
                await CourseService.createCourse(data);
                toast.success('Tạo khóa học thành công');
            } else if (isEdit && id) {
                await CourseService.updateCourse(id, data);
                toast.success('Cập nhật khóa học thành công');
            }
            handleBack();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
            throw error;
        }
    };

    return (
        <div className={`min-height-screen w-full bg-slate-50 transition-colors duration-300 ${(isCreate || isEdit || isView) ? '' : 'p-6'}`}>
            {(isCreate || isEdit || isView) && (
                <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                    <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                Quay lại danh sách
                            </button>
                            <div className="h-6 w-px bg-slate-200" />
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">
                                {isCreate ? 'Tạo khóa học mới' : isEdit ? 'Thiết lập khóa học' : 'Chi tiết khóa học'}
                            </h1>
                        </div>


                    </div>
                </header>
            )}

            <main className={`w-full ${(isCreate || isEdit || isView) ? 'py-8 px-4 sm:px-10' : ''}`}>
                {!isCreate && !isEdit && !isView && !selectedCourseId && (
                    <CourseList
                        onView={handleView}
                        onEdit={handleEdit}
                        onCreate={handleCreate}
                    />
                )}

                {isView && selectedCourseId && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CourseDetail
                            courseId={selectedCourseId}
                            onBack={handleBack}
                            onEdit={handleEdit}
                        />
                    </div>
                )}

                {(isCreate || isEdit) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CourseForm
                            course={editingCourse}
                            onSubmit={handleSubmit}
                            onCancel={handleBack}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default CourseManager;
