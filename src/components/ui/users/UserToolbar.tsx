import { Input, Tooltip } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import CreateButton from "@/components/common/CreateButton";

type Props = {
  onSearch: (value: string) => void;
  onReload: () => void;
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

const UserToolbar = ({ onSearch, onReload, loading }: Props) => {
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
      </div>
    </div>
  );
};

export default UserToolbar;