import {
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Row,
  Col,
  Divider,
  Form,
  Input,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  IdcardOutlined,
  BankOutlined,
  BookOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useState } from "react";
import { User } from "@/types/User";
import { UserStatus } from "@/components/enum/UserStatus";
import { Gender } from "@/components/enum/Gender";
import userService from "@/services/userService";
import dayjs from "dayjs";

type Props = {
  open: boolean;
  user: User | null;
  onClose: () => void;
};

export default function UserDetailModal({ open, user, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [openPromote, setOpenPromote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  if (!user) return null;

  /* ---------- STATUS TAG ---------- */
  const statusTag = (status: UserStatus) =>
    status === UserStatus.ACTIVE ? (
      <Tag color="green">ACTIVE</Tag>
    ) : (
      <Tag color="red">{status}</Tag>
    );


  /* ---------- GENDER ---------- */
  const genderRender = (g: Gender | string) => {
    const value = g?.toUpperCase();
    if (value === Gender.MALE) return <><ManOutlined style={{ color: "#60a5fa" }} /> Nam</>;
    if (value === Gender.FEMALE) return <><WomanOutlined style={{ color: "#f472b6" }} /> Nữ</>;
    return "Khác";
  };

 /* ---------- ROLE MAP ---------- */
const roleMap: Record<string, { code: string; label: string; color: string }> = {
  "Quản trị viên": { code: "ADMIN", label: "Admin", color: "gold" },
  "SysAdmin": { code: "SYSADMIN", label: "SysAdmin", color: "red" },
  "Giảng viên": { code: "TEACHER", label: "Giáo viên", color: "purple" },
  "Sinh viên": { code: "STUDENT", label: "Sinh viên", color: "blue" },
};

/* ---------- LẤY ROLE CHUẨN ---------- */
const userRoles = user.roles?.map(r => roleMap[r.name]?.code ?? r.name.toUpperCase()) ?? [];

/* ---------- CHECK QUYỀN ---------- */
const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SYSADMIN");
const isTeacher = userRoles.includes("TEACHER");
const isStudent = userRoles.includes("STUDENT") && !isTeacher;

const canPromote = isStudent && !isTeacher && !isAdmin;

/* ---------- HIỂN THỊ TAG ROLE ---------- */
const roleTag = (roleName: string) => {
  const r = roleMap[roleName] || { code: roleName.toUpperCase(), label: roleName, color: "default" };
  return (
    <Tag key={roleName} style={{ borderRadius: 20, fontWeight: 600 }} color={r.color}>
      {r.label}
    </Tag>
  );
};

  /* ---------- HANDLE PROMOTE ---------- */
  const handlePromote = async (values: any) => {
    try {
      setLoading(true);
      await userService.promotetoTeacher(user.id, values);
      message.success("Nâng quyền thành công 🚀");
      setOpenPromote(false);
      form.resetFields();
      window.location.reload();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.message || "Nâng quyền thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={720}
        centered
        title={null}
        bodyStyle={{
          padding: 0,
          background: isDark ? "#0f172a" : "#fff",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "28px",
            background: "linear-gradient(135deg, #1e293b, #1e3a8a, #4f46e5)",
            color: "#fff",
          }}
        >
          <Row align="middle" gutter={20}>
            <Col>
              <Avatar
                size={90}
                src={user.avatar}
                icon={<UserOutlined />}
                style={{ border: "3px solid rgba(255,255,255,0.3)" }}
              />
            </Col>

            <Col flex={1}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{user.fullName}</div>
              <div style={{ opacity: 0.7, marginTop: 4 }}>@{user.username}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                {statusTag(user.status)}
                {user.roles?.map((r: any) => roleTag(r.code || r.name))}
              </div>
            </Col>

            {/* 🔥 NÚT NÂNG QUYỀN */}
            {canPromote && (
              <Col>
                <button
                  onClick={() => setOpenPromote(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 6px 16px rgba(245,158,11,0.35)",
                  }}
                >
                  <CrownOutlined /> Nâng quyền
                </button>
              </Col>
            )}
          </Row>
        </div>

        {/* BODY */}
        <div style={{ padding: 24 }}>
          <Divider>Thông tin cơ bản</Divider>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Email">
              <MailOutlined /> {user.email || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Điện thoại">
              <PhoneOutlined /> {user.phone || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              <CalendarOutlined /> {user.birthday ? dayjs(user.birthday).format("DD/MM/YYYY") : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">{genderRender(user.gender)}</Descriptions.Item>
          </Descriptions>

          {/* STUDENT */}
          {user.studentID && (
            <>
              <Divider>Thông tin sinh viên</Divider>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Mã SV">
                  <IdcardOutlined /> {user.studentID}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  <BankOutlined /> {user.classID}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* TEACHER */}
          {user.teacherID && (
            <>
              <Divider>Thông tin giảng viên</Divider>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Mã GV">
                  <IdcardOutlined /> {user.teacherID}
                </Descriptions.Item>
                <Descriptions.Item label="Khoa">
                  <BankOutlined /> {user.department}
                </Descriptions.Item>
                <Descriptions.Item label="Học vị">
                  <BookOutlined /> {user.academicRank}
                </Descriptions.Item>
                <Descriptions.Item label="Chuyên môn">
                  <BookOutlined /> {user.specialization}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          <Divider>Địa chỉ</Divider>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Thường trú">{user.contactAddress || "—"}</Descriptions.Item>
            <Descriptions.Item label="Hiện tại">{user.currentResidence || "—"}</Descriptions.Item>
          </Descriptions>
        </div>
      </Modal>

      {/* ================= MODAL PROMOTE ================= */}
      <Modal
  open={openPromote}
  onCancel={() => setOpenPromote(false)}
  onOk={() => form.submit()}
  confirmLoading={loading}
  title="Nâng quyền thành giảng viên"
>
  <Form form={form} onFinish={handlePromote} layout="vertical">
    {/* Mã giảng viên */}
    <Form.Item
      name="teacherId"
      label="Mã giảng viên"
      rules={[{ required: true, message: "Nhập mã GV" }]}
    >
      <Input placeholder="VD: GV001" />
    </Form.Item>

    {/* Khoa */}
    <Form.Item
      name="department"
      label="Khoa"
      rules={[{ required: true, message: "Nhập khoa" }]}
    >
      <Input placeholder="CNTT..." />
    </Form.Item>

    {/* Học vị */}
    <Form.Item
      name="academicRank"
      label="Học vị"
      rules={[{ required: true, message: "Nhập học vị" }]}
    >
      <Input placeholder="ThS / TS..." />
    </Form.Item>

    {/* Chuyên môn */}
    <Form.Item
      name="specialization"
      label="Chuyên môn"
      rules={[{ required: true, message: "Nhập chuyên môn" }]}
    >
      <Input placeholder="Mạng máy tính, Cơ sở dữ liệu..." />
    </Form.Item>
  </Form>
</Modal>
    </>
  );
}