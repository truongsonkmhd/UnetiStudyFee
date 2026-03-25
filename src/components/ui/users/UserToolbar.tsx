import { Input, Tooltip } from "antd";
import { SearchOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";

type Props = {
  onSearch: (value: string) => void;
  onReload: () => void;
  onAdd: () => void;
  loading: boolean;
};

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  height: 42,
  padding: "0 18px",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  transition: "all 0.2s",
};

const UserToolbar = ({ onSearch, onReload, onAdd, loading }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
      }}
    >
      <Input
        prefix={
          <SearchOutlined
            style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)" }}
          />
        }
        placeholder="Tìm kiếm người dùng..."
        allowClear
        onPressEnter={(e) => onSearch((e.target as HTMLInputElement).value)}
        onChange={(e) => {
          if (!e.target.value) onSearch("");
        }}
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

      <div style={{ display: "flex", gap: 10 }}>
        <Tooltip title="Tải lại">
          <button
            onClick={onReload}
            style={{
              ...btnBase,
              background: isDark ? "rgba(255,255,255,0.04)" : "#f5f5f5",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #d9d9d9",
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "#e8e8e8";
              e.currentTarget.style.color = isDark ? "#fff" : "rgba(0,0,0,0.85)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "#f5f5f5";
              e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)";
            }}
          >
            <ReloadOutlined spin={loading} style={{ fontSize: 14 }} />
            Làm mới
          </button>
        </Tooltip>

        <button
          onClick={onAdd}
          style={{
            ...btnBase,
            background: isDark
              ? "rgba(255,255,255,0.12)"
              : "linear-gradient(135deg, #4f46e5, #6366f1)",
            border: isDark ? "1px solid rgba(255,255,255,0.25)" : "none",
            color: "#fff",
            fontWeight: 600,
            backdropFilter: isDark ? "blur(8px)" : "none",
            boxShadow: isDark ? "none" : "0 4px 12px rgba(79,70,229,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark
              ? "rgba(255,255,255,0.2)"
              : "linear-gradient(135deg, #4338ca, #4f46e5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark
              ? "rgba(255,255,255,0.12)"
              : "linear-gradient(135deg, #4f46e5, #6366f1)";
          }}
        >
          <PlusOutlined />
          Thêm mới
        </button>
      </div>
    </div>
  );
};

export default UserToolbar;