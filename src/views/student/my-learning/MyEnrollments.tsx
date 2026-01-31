import React, { useEffect, useState } from 'react';
import { EnrollmentResponse } from '@/model/enrollment/EnrollmentResponse';
import courseEnrollmentService from '@/services/courseEnrollmentService';
import './MyEnrollments.css';

const MyEnrollments: React.FC = () => {
    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchMyEnrollments = async () => {
        setLoading(true);
        try {
            const response = await courseEnrollmentService.getMyEnrollments(undefined, 0, 100);
            if (response.items) {
                setEnrollments(response.items);
            }
        } catch (error) {
            console.error("Failed to fetch my enrollments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEnrollments();
    }, []);

    const goToCourse = (courseId: string) => {
        console.log("Go to course:", courseId);
        // navigate(`/course/${courseId}/learn`);
    };

    return (
        <div className="my-enrollments-container">
            <div className="enrollments-header">
                <h1 className="enrollments-title">My Learning Dashboard</h1>
                <p>Track your course enrollments and progress.</p>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading your enrollments...</div>
            ) : (
                <div className="enrollments-grid">
                    {enrollments.length > 0 ? (
                        enrollments.map(enrollment => (
                            <div key={enrollment.enrollmentId} className="enrollment-card">
                                <div className="enrollment-info">
                                    <h3>{enrollment.courseName}</h3>
                                    <div className="enrollment-meta">
                                        Requested on: {new Date(enrollment.requestedAt).toLocaleDateString()}
                                    </div>
                                    {enrollment.status === 'REJECTED' && enrollment.rejectionReason && (
                                        <div className="rejection-reason">
                                            <strong>Reason:</strong> {enrollment.rejectionReason}
                                        </div>
                                    )}
                                    {enrollment.status === 'APPROVED' && (
                                        <button
                                            className="btn-continue-learning"
                                            onClick={() => goToCourse(enrollment.courseId)}
                                        >
                                            Continue Learning
                                        </button>
                                    )}
                                </div>
                                <div className="enrollment-status">
                                    <span className={`my-status-badge my-status-${enrollment.status.toLowerCase()}`}>
                                        {enrollment.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <h3>You haven't enrolled in any courses yet.</h3>
                            <p>Browse the catalog to start learning!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyEnrollments;
