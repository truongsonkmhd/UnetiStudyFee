import { useEffect, useState } from "react";
import permissionService from "@/services/permissionService";
import CreateButton from "@/components/common/CreateButton";
import { Permission, PermissionRequest } from "@/types/Permission";
import {
  Table,
  Button,
  Input,
  Modal,
  Space,
  message,
  Tag,
  Tooltip,
  Form,
  Popconfirm,
  ConfigProvider,
  theme as antTheme,
} from "antd";
import { useTheme } from "next-themes";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  KeyOutlined,
  ReloadOutlined,
  LockOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
const PermissionManagement = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filtered, setFiltered] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm<PermissionRequest>();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionService.getAll();
      setPermissions(data);
      setFiltered(data);
    } catch {
      message.error("Tải danh sách quyền thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const resetAndClose = () => {
    form.resetFields();
    setEditingId(null);
    setModalOpen(false);
  };

  const openCreateModal = () => {
    form.resetFields();
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Permission) => {
    form.setFieldsValue({ name: p.name, description: p.description });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      if (editingId) {
        await permissionService.update(editingId, values);
        message.success("Cập nhật quyền thành công!");
      } else {
        await permissionService.create(values);
        message.success("Tạo quyền mới thành công!");
      }
      resetAndClose();
      loadPermissions();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err.message || "Thao tác thất bại, vui lòng thử lại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await permissionService.delete(id);
      message.success("Đã xóa quyền thành công");
      loadPermissions();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const result = permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.description?.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(result);
  };

  const columns = [
    {
      title: (
        <span
          style={{
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase" as const,
            letterSpacing: 1,
          }}
        >
          id
        </span>
      ),
      dataIndex: "id",
      width: 60,
      render: (id: number) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {id}
        </span>
      ),
    },
    {
      title: (
        <span
          style={{
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase" as const,
            letterSpacing: 1,
          }}
        >
          Tên quyền
        </span>
      ),
      dataIndex: "name",
      render: (name: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Tag
            style={{
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 14,
              padding: "3px 14px",
              border: isDark ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(79,70,229,0.2)",
              background: isDark ? "rgba(99,102,241,0.12)" : "rgba(79,70,229,0.06)",
              color: isDark ? "#a5b4fc" : "#4f46e5",
            }}
          >
            {name}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <span
          style={{
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase" as const,
            letterSpacing: 1,
          }}
        >
          Mô tả
        </span>
      ),
      dataIndex: "description",
      render: (desc: string) =>
        desc ? (
          <span style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)", fontSize: 14 }}>
            {desc}
          </span>
        ) : (
          <span
            style={{
              color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            Chưa có mô tả
          </span>
        ),
    },
    {
      title: (
        <span
          style={{
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase" as const,
            letterSpacing: 1,
          }}
        >
          Thao tác
        </span>
      ),
      width: 140,
      render: (_: any, record: Permission) => (
        <Space size={6}>
          <Tooltip title="Chỉnh sửa">
            <button
              onClick={() => openEditModal(record)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(99,102,241,0.4)",
                background: "rgba(99,102,241,0.1)",
                color: "#818cf8",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(99,102,241,0.25)";
                e.currentTarget.style.borderColor = "#818cf8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
              }}
            >
              <EditOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa quyền này?"
              description="Hành động này không thể hoàn tác."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.35)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                  e.currentTarget.style.borderColor = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
                }}
              >
                <DeleteOutlined style={{ fontSize: 14 }} />
              </button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  /* ---------- Ant Design theme tokens ---------- */
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
    },
  });

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
        {/* ── Header Section ── */}
        <div className="mb-8 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Quản lý phân quyền
              </h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <LockOutlined className="w-4 h-4" />
                Quản lý toàn bộ quyền truy cập hệ thống
              </p>
            </div>

            <CreateButton
              onClick={openCreateModal}
              label="Thêm quyền mới"
            />
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
          {/* Search + Reload */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Input
              prefix={
                <SearchOutlined
                  style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)" }}
                />
              }
              placeholder="Tìm kiếm quyền..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{
                width: 320,
                borderRadius: 12,
                height: 42,
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid #d9d9d9",
                color: isDark ? "#fff" : "rgba(0,0,0,0.85)",
              }}
            />
            <Tooltip title="Tải lại">
              <button
                onClick={loadPermissions}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 42,
                  padding: "0 18px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0";
                  e.currentTarget.style.color = isDark ? "#fff" : "rgba(0,0,0,0.85)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "transparent";
                  e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)";
                }}
              >
                <ReloadOutlined spin={loading} style={{ fontSize: 14 }} />
                Làm mới
              </button>
            </Tooltip>
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            loading={loading}
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
              showTotal: (total, range) => (
                <span
                  style={{
                    color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
                    fontSize: 13,
                  }}
                >
                  {range[0]}-{range[1]} / {total} quyền
                </span>
              ),
              style: { marginBottom: 0, marginTop: 16 },
              itemRender: (page, type, originalElement) => {
                const baseStyle: React.CSSProperties = {
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 36,
                  height: 36,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "none",
                };

                if (type === "prev") {
                  return (
                    <button
                      style={{
                        ...baseStyle,
                        gap: 6,
                        padding: "0 14px",
                        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                        color: "#fff",
                        boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
                      }}
                    >
                      <LeftOutlined style={{ fontSize: 12 }} />
                      Trước
                    </button>
                  );
                }
                if (type === "next") {
                  return (
                    <button
                      style={{
                        ...baseStyle,
                        gap: 6,
                        padding: "0 14px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff",
                        boxShadow: "0 2px 12px rgba(139,92,246,0.35)",
                      }}
                    >
                      Sau
                      <RightOutlined style={{ fontSize: 12 }} />
                    </button>
                  );
                }
                return originalElement;
              },
            }}
            style={{ borderRadius: 12, overflow: "hidden" }}
          />
        </div>

        {/* ── Create / Edit Modal ── */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 4 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {editingId ? (
                  <EditOutlined style={{ color: "#fff", fontSize: 16 }} />
                ) : (
                  <PlusOutlined style={{ color: "#fff", fontSize: 16 }} />
                )}
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: isDark ? "#fff" : "rgba(0,0,0,0.85)",
                }}
              >
                {editingId ? "Chỉnh sửa quyền" : "Thêm quyền mới"}
              </span>
            </div>
          }
          open={modalOpen}
          onCancel={resetAndClose}
          onOk={handleSubmit}
          okText={editingId ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          confirmLoading={submitLoading}
          okButtonProps={{
            style: {
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              height: 40,
              paddingInline: 22,
              boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
            },
          }}
          cancelButtonProps={{
            style: {
              borderRadius: 10,
              height: 40,
              background: isDark ? "rgba(255,255,255,0.06)" : "#f5f5f5",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #d9d9d9",
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)",
            },
          }}
          style={{ top: "15vh" }}
          styles={{
            body: { paddingTop: 12 },
            mask: { backdropFilter: "blur(8px)" },
          }}
        >
          <Form form={form} layout="vertical" size="large">
            <Form.Item
              label={
                <span
                  style={{
                    color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.85)",
                    fontWeight: 600,
                  }}
                >
                  Tên quyền
                </span>
              }
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên quyền!" }]}
            >
              <Input
                prefix={<KeyOutlined style={{ color: "#818cf8" }} />}
                placeholder="Ví dụ: READ_USER, MANAGE_COURSE..."
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
            <Form.Item
              label={
                <span
                  style={{
                    color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.85)",
                    fontWeight: 600,
                  }}
                >
                  Mô tả
                </span>
              }
              name="description"
            >
              <Input.TextArea
                placeholder="Mô tả ngắn gọn về quyền này..."
                rows={3}
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default PermissionManagement;