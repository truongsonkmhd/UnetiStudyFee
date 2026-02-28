export interface EnrollmentResponse {
    enrollmentId: string;
    courseId: string;
    courseName: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentCode: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    approvedAt?: string;
    requestMessage?: string;
    rejectionReason?: string;
    slug: string;
}
