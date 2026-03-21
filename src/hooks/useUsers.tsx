import { useState, useEffect } from "react";
import { message } from "antd";
import userService from "@/services/userService";
import { User } from "@/types/User";

const PAGE_SIZE = 10;

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = keyword
        ? await userService.searchUsers(keyword, page, PAGE_SIZE)
        : await userService.getUsers(page, PAGE_SIZE);

      setUsers(res.users);
      setTotal(res.totalElements);
    } catch {
      message.error("Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, keyword]);

  return {
    users,
    total,
    page,
    loading,
    setPage,
    setKeyword,
    reload: loadUsers,
  };
};

export { useUsers };