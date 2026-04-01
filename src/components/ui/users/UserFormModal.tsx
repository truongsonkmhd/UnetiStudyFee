import { Modal, Form, Input, Select, DatePicker, Row, Col, Card, Typography } from "antd";
import { useTheme } from "next-themes";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  PlusOutlined,
  KeyOutlined,
  SolutionOutlined,
  IdcardOutlined,
  BankOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { User } from "@/types/User";
import { Gender } from "@/components/enum/Gender";
import { UserStatus } from "@/components/enum/UserStatus";
import { UserType } from "@/components/enum/UserType";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Text } = Typography;

type Props = {
  open: boolean;
  form: any;
  editingUser: User | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function UserFormModal({
  open,
  form,
  editingUser,
  onSubmit,
  onCancel,
  loading,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const labelStyle: React.CSSProperties = {
    color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.85)",
    fontWeight: 600,
    fontSize: "14px",
  };
  const inputStyle: React.CSSProperties = {
    borderRadius: 10,
    background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
  };
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const isEdit = !!editingUser;

  useEffect(() => {
    if (open) {
      if (editingUser) {
        // Tự động nhận diện loại người dùng khi edit thông qua type hoặc check role
        const type = editingUser.type || (editingUser.roles?.some(r => r.code === "ROLE_TEACHER" || r.code === "TEACHER") ? UserType.TEACHER : UserType.STUDENT);
        setSelectedType(type as UserType);

        // Cập nhật lại fields cho form (đặc biệt là studentCode/classCode if applicable)
        form.setFieldsValue({
          ...editingUser,
          birthday: editingUser.birthday ? dayjs(editingUser.birthday) : null,
          // Mapping fields if backend returns different names
          studentCode: (editingUser as any).studentCode || (editingUser as any).studentID,
          classCode: (editingUser as any).classCode || (editingUser as any).classID,
        });
      } else {
        setSelectedType(null);
        form.setFieldsValue({
          status: UserStatus.ACTIVE // Mặc định là Hoạt động
        });
      }
    }
  }, [open, editingUser, form]);

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      // type: selectedType,
      birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
      roleCodes: [selectedType === UserType.TEACHER ? "ROLE_TEACHER" : "ROLE_STUDENT"]
    };

    // Ensure common fields are included if they are not in the form but in editingUser
    if (isEdit && editingUser) {
      payload.username = values.username || editingUser.username;
    }

    console.log("SUBMITTING PAYLOAD:", payload);
    onSubmit(payload);
  };

  const renderSelection = () => (
    <div style={{ padding: "10px 0 20px" }}>
      <p
        style={{
          color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
          textAlign: "center",
          marginBottom: 32,
          fontSize: 16,
        }}
      >
        Vui lòng chọn đối tượng tài khoản bạn muốn khởi tạo
      </p>
      <Row gutter={24} justify="center">
        <Col xs={24} sm={11}>
          <Card
            hoverable
            onClick={() => setSelectedType(UserType.STUDENT)}
            style={{
              background: isDark ? "rgba(79, 70, 229, 0.08)" : "#f5f3ff",
              borderColor: isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
              borderRadius: 20,
              textAlign: "center",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              borderWidth: "2px",
            }}
            className="type-selection-card student-card"
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(99, 102, 241, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#818cf8"
            }}>
              <TeamOutlined style={{ fontSize: 32 }} />
            </div>
            <h3
              style={{
                color: isDark ? "#fff" : "rgba(0,0,0,0.85)",
                fontSize: 20,
                fontWeight: 700,
                margin: "0 0 8px",
              }}
            >
              Học sinh
            </h3>
            <Text
              style={{
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                fontSize: 14,
              }}
            >
              Dành cho sinh viên đăng ký học và thi
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={11}>
          <Card
            hoverable
            onClick={() => setSelectedType(UserType.TEACHER)}
            style={{
              background: isDark ? "rgba(147, 51, 234, 0.08)" : "#faf5ff",
              borderColor: isDark ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.2)",
              borderRadius: 20,
              textAlign: "center",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              borderWidth: "2px",
            }}
            className="type-selection-card teacher-card"
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(168, 85, 247, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#c084fc"
            }}>
              <SolutionOutlined style={{ fontSize: 32 }} />
            </div>
            <h3
              style={{
                color: isDark ? "#fff" : "rgba(0,0,0,0.85)",
                fontSize: 20,
                fontWeight: 700,
                margin: "0 0 8px",
              }}
            >
              Giáo viên
            </h3>
            <Text
              style={{
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                fontSize: 14,
              }}
            >
              Dành cho giảng viên và cán bộ quản lý
            </Text>
          </Card>
        </Col>
      </Row>

      <style>{`
        .type-selection-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.3);
        }
        .student-card:hover {
          border-color: #6366f1 !important;
          background: rgba(79, 70, 229, 0.15) !important;
        }
        .teacher-card:hover {
          border-color: #a855f7 !important;
          background: rgba(147, 51, 234, 0.15) !important;
        }
      `}</style>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={selectedType ? 720 : 540}
      centered
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 10 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: selectedType === UserType.TEACHER
              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
              : selectedType === UserType.STUDENT
                ? "linear-gradient(135deg, #4f46e5, #6366f1)"
                : "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {isEdit ? <EditOutlined style={{ color: "#fff" }} /> : <PlusOutlined style={{ color: "#fff" }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: isDark ? "#fff" : "rgba(0,0,0,0.85)", fontSize: 20, fontWeight: 700 }}>
              {isEdit ? "Chỉnh sửa thông tin" : "Thêm mới người dùng"}
            </div>
            {selectedType && (
              <div style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: 13 }}>
                Đối tượng: {selectedType === UserType.TEACHER ? "Giáo viên" : "Học sinh"}
              </div>
            )}
          </div>
          {!isEdit && selectedType && (
            <a
              onClick={() => setSelectedType(null)}
              style={{ fontSize: 14, color: "#818cf8", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
            >
              <ArrowLeftOutlined /> Đổi loại
            </a>
          )}
        </div>
      }
      style={{ top: "5vh" }}
      styles={{
        mask: { backdropFilter: "blur(6px)" },
        body: {
          padding: "20px 24px",
          background: isDark ? "#1a1f36" : "#fff",
          borderRadius: 20,
        },
      }}
      modalRender={(modal) => (
        <div
          style={{
            background: isDark ? "#1a1f36" : "#fff",
            borderRadius: 20,
            border: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark
              ? "0 20px 50px rgba(0,0,0,0.4)"
              : "0 20px 50px rgba(0,0,0,0.1)",
          }}
        >
          {modal}
        </div>
      )}
    >
      {!selectedType && !isEdit ? renderSelection() : (
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="middle"
          initialValues={{
            gender: Gender.MALE,
            status: UserStatus.ACTIVE
          }}
        >
          {/* Section 1: Thông tin cơ bản */}
          <div style={{ marginBottom: 24 }}>
            <Text style={{ color: "#818cf8", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 16 }}>
              Thông tin định danh
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label={<span style={labelStyle}>Họ và tên</span>}
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />} placeholder="Vd: Nguyễn Văn A" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label={<span style={labelStyle}>Tên đăng nhập</span>}
                  rules={[{ required: !isEdit, message: "Vui lòng nhập username" }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
                    placeholder="nguyenvana"
                    style={inputStyle}
                    disabled={isEdit}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label={<span style={labelStyle}>Địa chỉ Email</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input prefix={<MailOutlined style={{ color: "rgba(255,255,255,0.3)" }} />} placeholder="example@email.com" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                {!isEdit ? (
                  <Form.Item
                    name="password"
                    label={<span style={labelStyle}>Mật khẩu khởi tạo</span>}
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                  >
                  <Input.Password
                    prefix={
                      <KeyOutlined
                        style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)" }}
                      />
                    }
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                  </Form.Item>
                ) : (
                  <Form.Item name="phone" label={<span style={labelStyle}>Số điện thoại</span>}>
                    <Input prefix={<PhoneOutlined style={{ color: "rgba(255,255,255,0.3)" }} />} placeholder="09xx xxx xxx" style={inputStyle} />
                  </Form.Item>
                )}
              </Col>
            </Row>

            {!isEdit && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" label={<span style={labelStyle}>Số điện thoại</span>}>
                    <Input prefix={<PhoneOutlined style={{ color: "rgba(255,255,255,0.3)" }} />} placeholder="09xx xxx xxx" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label={<span style={labelStyle}>Trạng thái tài khoản</span>}>
                    <Select style={inputStyle}>
                      <Select.Option value={UserStatus.ACTIVE}>Hoạt động</Select.Option>
                      <Select.Option value={UserStatus.INACTIVE}>Tạm khóa</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>

          {/* Section 2: Thông tin chi tiết */}
          <div style={{ marginBottom: 24 }}>
            <Text style={{ color: selectedType === UserType.TEACHER ? "#a855f7" : "#4f46e5", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 16 }}>
              {selectedType === UserType.TEACHER ? "Chi tiết giảng viên" : "Thông tin học tập"}
            </Text>

            {selectedType === UserType.STUDENT && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="studentCode"
                    label={<span style={labelStyle}>Mã sinh viên</span>}
                    rules={[{ required: true, message: "Vui lòng nhập mã sinh viên" }]}
                  >
                    <Input prefix={<IdcardOutlined style={{ color: "#6366f1" }} />} placeholder="201xxxxxxx" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="classCode"
                    label={<span style={labelStyle}>Mã lớp học</span>}
                    rules={[{ required: true, message: "Vui lòng nhập mã lớp" }]}
                  >
                    <Input prefix={<BankOutlined style={{ color: "#6366f1" }} />} placeholder="DHTI15Axx" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {selectedType === UserType.TEACHER && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="teacherID"
                      label={<span style={labelStyle}>Mã giáo viên</span>}
                      rules={[{ required: true, message: "Vui lòng nhập mã giáo viên" }]}
                    >
                      <Input prefix={<IdcardOutlined style={{ color: "#a855f7" }} />} placeholder="GVXXXX" style={inputStyle} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="department"
                      label={<span style={labelStyle}>Khoa / Phòng ban</span>}
                      rules={[{ required: true, message: "Vui lòng nhập khoa" }]}
                    >
                      <Input prefix={<BankOutlined style={{ color: "#a855f7" }} />} placeholder="Vd: CNTT" style={inputStyle} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="academicRank" label={<span style={labelStyle}>Học hàm / Học vị</span>}>
                      <Input prefix={<BookOutlined style={{ color: "#a855f7" }} />} placeholder="Thạc sĩ, Tiến sĩ..." style={inputStyle} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="specialization" label={<span style={labelStyle}>Lĩnh vực chuyên môn</span>}>
                      <Input prefix={<BookOutlined style={{ color: "#a855f7" }} />} placeholder="Phát triển phần mềm..." style={inputStyle} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="birthday" label={<span style={labelStyle}>Ngày sinh</span>}>
                  <DatePicker style={{ width: "100%", ...inputStyle }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label={<span style={labelStyle}>Giới tính</span>}>
                  <Select style={inputStyle}>
                    <Select.Option value={Gender.MALE}>Nam</Select.Option>
                    <Select.Option value={Gender.FEMALE}>Nữ</Select.Option>
                    <Select.Option value={Gender.OTHER}>Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="contactAddress" label={<span style={labelStyle}>Địa chỉ thường trú</span>}>
                  <Input.TextArea rows={2} placeholder="Số nhà, tên đường, phường/xã..." style={inputStyle} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
              <Form.Item
                name="currentResidence"
                label={<span style={labelStyle}>Địa chỉ hiện tại</span>}
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ hiện tại" }]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Số nhà, tên đường, phường/xã..."
                  style={inputStyle}
                />
              </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "8px 24px",
                borderRadius: 10,
                border: isDark
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(0,0,0,0.15)",
                background: "transparent",
                color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 32px",
                borderRadius: 10,
                border: "none",
                background: selectedType === UserType.TEACHER
                  ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                  : "linear-gradient(135deg, #4f46e5, #6366f1)",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 8px 16px rgba(0,0,0,0.25)"
              }}
            >
              {loading ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Tạo tài khoản"}
            </button>
          </div>
        </Form>
      )}
    </Modal>
  );
}