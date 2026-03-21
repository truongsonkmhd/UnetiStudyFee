import { Input, Tooltip } from "antd";
import { SearchOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";

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
        prefix={<SearchOutlined style={{ color: "rgba(255,255,255,0.3)" }} />}
        placeholder="Tìm kiếm người dùng..."
        allowClear
        onPressEnter={(e) => onSearch((e.target as HTMLInputElement).value)}
        onChange={(e) => { if (!e.target.value) onSearch(""); }}
        style={{
          width: 320,
          borderRadius: 12,
          height: 42,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <Tooltip title="Tải lại">
          <button
            onClick={onReload}
            style={{
              ...btnBase,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
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

        <button
          onClick={onAdd}
          style={{
            ...btnBase,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            fontWeight: 600,
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
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