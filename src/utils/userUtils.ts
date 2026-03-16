import { User, ITeacherProfile } from "@/types/User";
import { UserType } from "@/components/enum/UserType";

/**
 * Logic chuyên nghiệp để nâng quyền từ Sinh viên lên Giáo viên
 * @param currentUser Đối tượng User hiện tại (đang là Sinh viên)
 * @param teacherData Thông tin định danh giáo viên mới
 * @returns Đối tượng User đã được nâng quyền
 */
export const promoteToTeacher = (
    currentUser: User,
    teacherData: ITeacherProfile
): User => {
    return {
        ...currentUser,
        // 1. Cập nhật định danh cốt lõi
        type: UserType.TEACHER,

        // 2. Thêm Profile giáo viên (vẫn giữ StudentProfile nếu có để tra cứu lịch sử)
        teacherProfile: {
            ...teacherData
        },

        // 3. Cập nhật danh sách Roles (Giả sử Role giáo viên là 'ROLE_TEACHER')
        roles: [
            ...currentUser.roles,
            // Logic thêm role mới ở đây (thường do Backend trả về, nhưng đây là frontend representation)
        ],

        // 4. Lưu ý: studentProfile vẫn tồn tại trong object user
    };
};

/**
 * Kiểm tra xem người dùng có từng là sinh viên không
 */
export const hasStudentHistory = (user: User): boolean => {
    return !!user.studentProfile || !!user.studentId;
};

/**
 * Lấy mã định danh hiển thị ưu tiên theo vai trò hiện tại
 */
export const getDisplayId = (user: User): string => {
    if (user.type === UserType.TEACHER && user.teacherProfile) {
        return user.teacherProfile.teacherId;
    }
    if (user.studentProfile) {
        return user.studentProfile.studentId;
    }
    return user.studentId || "N/A";
};
