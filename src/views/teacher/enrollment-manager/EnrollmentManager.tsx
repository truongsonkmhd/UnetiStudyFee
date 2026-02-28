import React, { useEffect, useState } from 'react';
import { EnrollmentResponse } from '@/model/enrollment/EnrollmentResponse';
import courseEnrollmentService from '@/services/courseEnrollmentService';
import './EnrollmentManager.css';

import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';

interface EnrollmentManagerProps {
    courseId?: string; // Optional now
}

const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({ courseId: propCourseId }) => {
    const { courseId: paramCourseId } = useParams<{ courseId: string }>();
    const courseId = propCourseId || paramCourseId || "";

    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING'); // Default to PENDING to show tasks

    // Modal state for rejection
    const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string>('');

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            // "ALL" is not a status, so we handle it by passing undefined if needed, 
            // but for now let's strict type filter or pass undefined for all
            const statusParam = statusFilter === 'ALL' ? undefined : statusFilter as any;
            const response = await courseEnrollmentService.getCourseEnrollments(courseId, {
                status: statusParam,
                page: 0,
                size: 100
            });
            if (response.items) {
                setEnrollments(response.items);
            }
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchEnrollments();
        }
    }, [courseId, statusFilter]);

    const handleApprove = async (enrollmentId: string) => {
        try {
            await courseEnrollmentService.approveEnrollment(enrollmentId);
            // Refresh list or update local state
            setEnrollments(prev => prev.map(e =>
                e.enrollmentId === enrollmentId ? { ...e, status: 'APPROVED' } : e
            ));
            // Or refetch: fetchEnrollments();
        } catch (error) {
            alert("Failed to approve enrollment");
        }
    };

    const openRejectModal = (enrollmentId: string) => {
        setSelectedEnrollmentId(enrollmentId);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedEnrollmentId) return;
        try {
            await courseEnrollmentService.rejectEnrollment(selectedEnrollmentId, rejectionReason);
            setEnrollments(prev => prev.map(e =>
                e.enrollmentId === selectedEnrollmentId ? { ...e, status: 'REJECTED' } : e
            ));
            setShowRejectModal(false);
        } catch (error) {
            alert("Failed to reject enrollment");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="enrollment-manager-container">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="manager-header"
            >
                <h1 className="manager-title">Enrollment Management</h1>
                <select
                    className="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="PENDING">Pending Requests</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ALL">All Enrollments</option>
                </select>
            </motion.div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="loading-spinner"
                    >
                        Loading enrollments...
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="enrollment-list"
                    >
                        {enrollments.length > 0 ? (
                            <table className="enrollment-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Date Requested</th>
                                        <th>Message</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.map((enrollment, index) => (
                                        <motion.tr
                                            key={enrollment.enrollmentId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(index * 0.05, 0.4) }}
                                        >
                                            <td>
                                                <div className="student-info">
                                                    <span className="student-name">{enrollment.studentName}</span>
                                                    <span className="student-email">{enrollment.studentEmail}</span>
                                                    <span className="student-email">ID: {enrollment.studentCode}</span>
                                                </div>
                                            </td>
                                            <td>{formatDate(enrollment.requestedAt)}</td>
                                            <td style={{ maxWidth: '200px' }}>
                                                {enrollment.requestMessage || <em style={{ color: '#ccc' }}>No message</em>}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${enrollment.status.toLowerCase()}`}>
                                                    {enrollment.status}
                                                </span>
                                            </td>
                                            <td>
                                                {enrollment.status === 'PENDING' && (
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-approve"
                                                            onClick={() => handleApprove(enrollment.enrollmentId)}
                                                            title="Approve"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => openRejectModal(enrollment.enrollmentId)}
                                                            title="Reject"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="empty-state"
                            >
                                <h3>No enrollments found</h3>
                                <p>Try changing the filter status.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {showRejectModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="modal-overlay"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                    >
                        <h3 className="modal-title">Reject Enrollment</h3>
                        <p>Please provide a reason for rejection:</p>
                        <textarea
                            className="modal-textarea"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                        />
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-confirm-reject"
                                onClick={handleRejectConfirm}
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default EnrollmentManager;
