import { Input, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface Props {
  onSearch: (value: string) => void;
  onReload: () => void;
}

export default function UserHeader({ onSearch, onReload }: Props) {

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20
      }}
    >
      <Input.Search
        placeholder="Tìm kiếm user..."
        allowClear
        enterButton="Search"
        style={{ width: 400 }}
        onSearch={onSearch}
      />

      <Button
        icon={<ReloadOutlined />}
        onClick={onReload}
      >
        Reload
      </Button>
    </div>
  );
}