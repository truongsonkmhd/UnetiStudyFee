import { useState } from "react";
import { ConfigProvider, Form, message, theme as antTheme } from "antd";
import { useTheme } from "next-themes";
import dayjs from "dayjs";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/User";
import userService from "@/services/userService";

import UserTable from "@/components/ui/users/UserTable";
import UserToolbar from "@/components/ui/users/UserToolbar";
import UserDetailModal from "@/components/ui/users/UserDetailModal";
import UserFormModal from "@/components/ui/users/UserFormModal";

import {
  TeamOutlined,
} from "@ant-design/icons";

/* ── Ant Design theme tokens ── */
const getThemeTokens = (isDark: boolean) => ({
  algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  token: {
    colorBgContainer: isDark ? "#141726" : "#fff",
    colorBgElevated: isDark ? "#1a1f36" : "#fff",
    colorBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    colorText: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
    colorTextSecondary: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
    colorPrimary: "#6366f1",
    borderRadius: 10,
  },
  components: {
    Table: {
      headerBg: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)",
      headerColor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
      rowHoverBg: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.03)",
      colorBgContainer: "transparent",
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    },
    Modal: {
      contentBg: isDark ? "#1a1f36" : "#fff",
      headerBg: isDark ? "#1a1f36" : "#fff",
      titleColor: isDark ? "#fff" : "#000",
    },
    Input: {
      colorBgContainer: isDark ? "rgba(255,255,255,0.05)" : "#fff",
      colorBorder: isDark ? "rgba(255,255,255,0.1)" : "#d9d9d9",
      colorText: isDark ? "#fff" : "rgba(0,0,0,0.85)",
      colorTextPlaceholder: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
    },
    Select: {
      colorBgContainer: isDark ? "rgba(255,255,255,0.05)" : "#fff",
      colorBorder: isDark ? "rgba(255,255,255,0.1)" : "#d9d9d9",
      colorText: isDark ? "#fff" : "rgba(0,0,0,0.85)",
      optionSelectedBg: "rgba(99,102,241,0.2)",
      colorBgElevated: isDark ? "#1a1f36" : "#fff",
    },
  },
});

export default function ManagerPerson() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { users, total, page, loading, setPage, setKeyword, reload } = useUsers();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form] = Form.useForm();

  /* ── Open create modal ── */
  const handleAdd = () => {
    form.resetFields();
    setEditingUser(null);
    setModalOpen(true);
  };

  /* ── Open edit modal ── */
  const handleEdit = (user: User) => {
    form.setFieldsValue({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday ? dayjs(user.birthday) : null, // ✅ FIX Ở ĐÂY
      gender: user.gender,
      type: user.type,
      status: user.status,
      currentResidence: user.currentResidence,
    });
    setEditingUser(user);
    setModalOpen(true);
  };

  /* ── Open detail modal ── */
  const handleDetail = (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  /* ── Delete ── */
  const handleDelete = async (user: User) => {
    try {
      await userService.delete(user.id);
      message.success(`Đã xóa người dùng "${user.fullName}"`);
      reload();
    } catch {
      message.error("Xóa thất bại, vui lòng thử lại.");
    }
  };

  /* ── Submit create/edit ── */
  const handleSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);
      if (editingUser) {
        await userService.update(editingUser.id, values);
        message.success("Cập nhật người dùng thành công!");
      } else {
        await userService.create(values);
        message.success("Tạo người dùng mới thành công!");
      }
      form.resetFields();
      setEditingUser(null);
      setModalOpen(false);
      reload();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.message || "Thao tác thất bại, vui lòng thử lại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <ConfigProvider theme={getThemeTokens(isDark)}>
      <div
        style={{
          minHeight: "100vh",
          background: isDark
            ? "linear-gradient(180deg, #0b0e1a 0%, #111427 40%, #0f1222 100%)"
            : "hsl(var(--background))",
          padding: "28px 32px",
        }}
      >
        {/* ── Header Banner ── */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 20,
            padding: "32px 36px",
            marginBottom: 28,
            background: isDark
              ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)"
              : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            boxShadow: isDark
              ? "0 8px 40px rgba(99,102,241,0.25)"
              : "0 8px 30px rgba(99,102,241,0.15)",
          }}
        >
          {/* decorative blobs */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 100, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ position: "absolute", top: 20, left: "60%", width: 200, height: 200, borderRadius: "50%", background: "rgba(129,140,248,0.06)" }} />

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.15)",
                flexShrink: 0,
              }}
            >
              <TeamOutlined style={{ fontSize: 26, color: "#c7d2fe" }} />
            </div>
            <div>
              <h2 style={{ color: "#fff", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em" }}>
                Quản lý Người dùng
              </h2>
              <p
                style={{
                  color: isDark ? "rgba(199,210,254,0.7)" : "rgba(255,255,255,0.85)",
                  margin: "4px 0 0",
                  fontSize: 14,
                }}
              >
                Quản lý toàn bộ tài khoản và quyền truy cập người dùng
              </p>
            </div>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div
          style={{
            background: isDark ? "rgba(20,23,38,0.8)" : "hsl(var(--card))",
            borderRadius: 20,
            padding: "24px 28px",
            border: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid hsl(var(--border))",
            boxShadow: isDark
              ? "0 4px 30px rgba(0,0,0,0.3)"
              : "0 4px 20px rgba(0,0,0,0.05)",
            backdropFilter: isDark ? "blur(12px)" : "none",
          }}
        >
          <UserToolbar
            onSearch={setKeyword}
            onReload={reload}
            onAdd={handleAdd}
            loading={loading}
          />

          <UserTable
            users={users}
            loading={loading}
            page={page}
            total={total}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDetail={handleDetail}
          />
        </div>

        {/* ── Modals ── */}
        <UserDetailModal
          open={detailOpen}
          user={selectedUser}
          onClose={() => setDetailOpen(false)}
        />

        <UserFormModal
          open={modalOpen}
          form={form}
          editingUser={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => {
            form.resetFields();
            setEditingUser(null);
            setModalOpen(false);
          }}
          loading={submitLoading}
        />
      </div>
    </ConfigProvider>
  );
}