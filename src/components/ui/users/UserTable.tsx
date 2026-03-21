import { Table, Tag, Space, Tooltip, Popconfirm } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { User } from "@/types/User";
import { UserStatus } from "@/components/enum/UserStatus";
import { Gender } from "@/components/enum/Gender";

interface Props {
  users: User[];
  total: number;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onDetail: (user: User) => void;
}

const colLabel = (text: string) => (
  <span
    style={{
      color: "rgba(255,255,255,0.45)",
      fontWeight: 600,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
    }}
  >
    {text}
  </span>
);

const genderLabel = (g: Gender | string) => {
  const key = g?.toUpperCase();

  const map: Record<string, { label: string; color: string }> = {
    MALE: { label: "Nam", color: "#60a5fa" },
    FEMALE: { label: "Nữ", color: "#f472b6" },
    OTHER: { label: "Khác", color: "#a78bfa" },
  };

  const info = map[key] ?? { label: key, color: "#94a3b8" };

  return (
    <span style={{ color: info.color, fontWeight: 500, fontSize: 13 }}>
      {info.label}
    </span>
  );
};

export default function UserTable({
  users,
  total,
  page,
  loading,
  onPageChange,
  onEdit,
  onDelete,
  onDetail,
}: Props) {
  const columns = [
    {
      title: colLabel("ID"),
      width: 52,
      render: (_: any, __: User, index: number) => (
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
          {page * 10 + index + 1}
        </span>
      ),
    },
    {
      title: colLabel("Họ tên"),
      dataIndex: "fullName",
      render: (name: string, record: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {record.avatar ? (
              <img src={record.avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <UserOutlined style={{ color: "#fff", fontSize: 16 }} />
            )}
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 13 }}>{name}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: colLabel("Email"),
      dataIndex: "email",
      render: (email: string) => (
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{email}</span>
      ),
    },
    {
      title: colLabel("Điện thoại"),
      dataIndex: "phone",
      render: (phone: string) => (
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{phone ?? "—"}</span>
      ),
    },
    {
      title: colLabel("Giới tính"),
      dataIndex: "gender",
      render: (g: Gender) => genderLabel(g),
    },
    {
      title: colLabel("Trạng thái"),
      dataIndex: "status",
      render: (status: UserStatus | string) => {
        const key = status?.toUpperCase(); 

        return key === UserStatus.ACTIVE ? (
          <Tag
            style={{
            borderRadius: 20,
            fontWeight: 600,
            fontSize: 12,
            padding: "2px 12px",
            border: "1px solid rgba(34,197,94,0.35)",
            background: "rgba(34,197,94,0.1)",
            color: "#4ade80",
            }}
          >
            ACTIVE
          </Tag>
    ) : (
          <Tag
            style={{
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 12,
              padding: "2px 12px",
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.08)",
              color: "#f87171",
            }}
          >
            {key}
          </Tag>
        );
    }
    },
    {
      title: colLabel("Thao tác"),
      width: 140,
      render: (_: any, record: User) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <button
              onClick={() => onDetail(record)}
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
              <EyeOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <button
              onClick={() => onEdit(record)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(59,130,246,0.4)",
                background: "rgba(59,130,246,0.1)",
                color: "#60a5fa",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.25)";
                e.currentTarget.style.borderColor = "#60a5fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
              }}
            >
              <EditOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>

          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa người dùng này?"
              description="Hành động này không thể hoàn tác."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record)}
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

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={users}
      loading={loading}
      pagination={{
        current: page + 1,
        pageSize: 10,
        total,
        showSizeChanger: false,
        showTotal: (tot, range) => (
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {range[0]}-{range[1]} / {tot} người dùng
          </span>
        ),
        style: { marginBottom: 0, marginTop: 16 },
        itemRender: (p, type, original) => {
          const base: React.CSSProperties = {
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
          if (type === "prev")
            return (
              <button style={{ ...base, gap: 6, padding: "0 14px", background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", boxShadow: "0 2px 12px rgba(99,102,241,0.35)" }}>
                <LeftOutlined style={{ fontSize: 12 }} /> Trước
              </button>
            );
          if (type === "next")
            return (
              <button style={{ ...base, gap: 6, padding: "0 14px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", boxShadow: "0 2px 12px rgba(139,92,246,0.35)" }}>
                Sau <RightOutlined style={{ fontSize: 12 }} />
              </button>
            );
          return original;
        },
        onChange: (p) => onPageChange(p - 1),
      }}
      style={{ borderRadius: 12, overflow: "hidden" }}
    />
  );
}