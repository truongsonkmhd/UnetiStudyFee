import { useEffect, useState } from "react";
import permissionService from "@/services/permissionService";
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
        <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1 }}>
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
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {id}
        </span>
      ),
    },
    {
      title: (
        <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1 }}>
          Tên quyền
        </span>
      ),
      dataIndex: "name",
      render: (name: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              flexShrink: 0,
            }}
          >
            <KeyOutlined style={{ color: "#fff", fontSize: 13 }} />
          </span> */}
          <Tag
            style={{
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 13,
              padding: "3px 14px",
              border: "1px solid rgba(99,102,241,0.3)",
              background: "rgba(99,102,241,0.12)",
              color: "#a5b4fc",
            }}
          >
            {name}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1 }}>
          Mô tả
        </span>
      ),
      dataIndex: "description",
      render: (desc: string) =>
        desc ? (
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{desc}</span>
        ) : (
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontStyle: "italic" }}>
            Chưa có mô tả
          </span>
        ),
    },
    {
      title: (
        <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1 }}>
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

  /* ---------- Dark theme for Ant Design ---------- */
  const darkTokens = {
    algorithm: antTheme.darkAlgorithm,
    token: {
      colorBgContainer: "#141726",
      colorBgElevated: "#1a1f36",
      colorBorder: "rgba(255,255,255,0.08)",
      colorText: "rgba(255,255,255,0.85)",
      colorTextSecondary: "rgba(255,255,255,0.5)",
      colorPrimary: "#6366f1",
      borderRadius: 10,
    },
    components: {
      Table: {
        headerBg: "rgba(99,102,241,0.06)",
        headerColor: "rgba(255,255,255,0.5)",
        rowHoverBg: "rgba(99,102,241,0.08)",
        colorBgContainer: "transparent",
        borderColor: "rgba(255,255,255,0.06)",
      },
      Modal: {
        contentBg: "#1a1f36",
        headerBg: "#1a1f36",
        titleColor: "#fff",
      },
      Input: {
        colorBgContainer: "rgba(255,255,255,0.05)",
        colorBorder: "rgba(255,255,255,0.1)",
        colorText: "#fff",
        colorTextPlaceholder: "rgba(255,255,255,0.3)",
      },
    },
  };

  return (
    <ConfigProvider theme={darkTokens}>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0b0e1a 0%, #111427 40%, #0f1222 100%)",
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
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)",
            boxShadow: "0 8px 40px rgba(99,102,241,0.25)",
          }}
        >
          {/* decorative elements */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 100, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ position: "absolute", top: 20, left: "60%", width: 200, height: 200, borderRadius: "50%", background: "rgba(129,140,248,0.06)" }} />

          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div>
                <h2 style={{ color: "#fff", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em" }}>
                  Quản lý Quyền truy cập
                </h2>
                <p style={{ color: "rgba(199,210,254,0.7)", margin: "4px 0 0", fontSize: 14 }}>
                  Quản lý toàn bộ quyền truy cập hệ thống
                </p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 44,
                padding: "0 22px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
            >
              <PlusOutlined />
              Thêm quyền mới
            </button>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div
          style={{
            background: "rgba(20,23,38,0.8)",
            borderRadius: 20,
            padding: "24px 28px",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Search + Reload */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Input
              prefix={<SearchOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
              placeholder="Tìm kiếm quyền..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{
                width: 320,
                borderRadius: 12,
                height: 42,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
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
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
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
              showTotal: (total, range) =>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  {range[0]}-{range[1]} / {total} quyền
                </span>,
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
              <span style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>
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
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
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
              label={<span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Tên quyền</span>}
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
              label={<span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Mô tả</span>}
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