package com.truongsonkmhd.unetistudy.constant;

public interface AppConstant {

    public interface ResponseConstant{
        public static final boolean SUCCESS = true;
        public static final boolean FAILED = false;

        public interface StatusCode {
            public static final int SUCCESS = 200;
            public static final int SYSTEM_ERROR = 500;
            public static final int ERROR_DATA_IN_USE = 600;        // dữ liệu đang sử dụng
            public static final int NOTFOUND_ERROR = 404;
            public static final int BAD_REQUEST = 400;
        }

        public interface MessageConstant {

            public interface ErrorMessage {
                public static final String CREATE_FAIL = "Thêm mới thất bại";
                public static final String UPDATE_FAIL = "Cập nhật thất bại";
                public static final String DELETE_FAIL = "Thực hiện xóa thất bại";
                public static final String LOAD_FAIL = "Tải dữ liệu thất bại";
                public static final String EXIST_ID = "Đã tồn tại Id";
                public static final String MISSING_PARAMETER = "Thiếu tham số";
                public static final String DID_NOT_EXIST = "Không tồn tại dữ liệu";
                public static final String MISSING_INFORMATION = "Thiếu thông tin";
                public static final String MATCHING_FAIL = "Thông tin không trùng khớp";
                public static final String USERNAME_NOT_FOUND = "Tài khoản không tồn tại";
                public static final String DATA_IN_USE = "Dữ liệu đang được sử dụng";
            }

            public interface SuccessMessage {
                public static final String PROCESS = "Xử lý thành công";
                public static final String CREATED = "Thêm mới thành công";
                public static final String UPDATED = "Cập nhật thành công";
                public static final String DELETED = "Đã thực hiện xóa thành công";
                public static final String LOADED = "Tải dữ liệu thành công";
            }
        }
    }

    public interface ExceptionConstant {

        public interface ExceptionMessage{
            public static final String DATA_IS_NOT_DEFINE = "Data is not define!";                                  // Dữ liệu chưa được định nghĩa
            public static final String DATA_IN_OPTIONAL_NOT_FOUND = "Data not found!";                                // không có dữ liệu
            public static final String USER_NOT_PERMIT_IN_PROCESS_STEPDOC = "User not permit process StepDoc!";     // User ko có quyền thao tác trong bước hồ sơ
            public static final String USER_NOT_PERMIT_IN_PROCESSDOC = "User not permit ProcessDoc";                   // User ko có quyền trong quy trình
            public static final String USER_NOT_PERMIT_IN_USER_GROUP = "User is not in the user group!";            // User ko có quyền thao tác trong bước hồ sơ
            public static final String PROCESSING_STEPDOC_NOT_FOUND = "Processing StepDoc is not found!";           // Không tồn tại bước đang xử lý
            public static final String ASSIGN_STEPDOC_IS_NOT_CORRECT = "Assign StepDoc is not correct!";             // Bước muốn chuyển tiếp không đúng
            public static final String USER_IN_ASSIGN_STEPDOC_IS_NOT_CORRECT = "User in AssignStepDoc is not correct!"; // User ở bước chuyển tiếp không đúng
            public static final String SYNC_DATA_TO_NSW_FAIL = "Sync data to nsw fail!";                       // đồng bộ dữ liệu sang NSW faild
            public static final String DATA_ALREADY_EXISTS = "Data already exists!. Create fail!";              // dữu liệu đã tồn tại
            public static final String USER_NOT_PERMIT_ACCEPT_NSW_REQUEST_EDIT = "User not permit accept NSW request edit!";    // người dùng ko có quyền đồng ý yêu cẩu sửa đổi bổ sung của NSW
        }
    }
}
