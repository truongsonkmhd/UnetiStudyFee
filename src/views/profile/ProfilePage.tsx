import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import defaultAvatar from "@/assets/img/avatar-default.png";
import { Separator } from "@/components/ui/separator";
import {
  User,
  ArrowLeft,
  LayoutList,
  Clock,
  Inbox,
  GraduationCap,
  Hash,
  School,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { actionAuth } from "@/components/context/AuthContext";
import userService from "@/services/userService";
import { toast } from "sonner";

export default function ProfilePage() {
  const { jwtClaims, hasRole, updateAvatar } = actionAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const userId = jwtClaims?.userID;

  const isAdmin = hasRole(["ROLE_ADMIN", "Quản trị viên"]);
  const canShowClass = !isAdmin;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) return;

        const data = await userService.getUserById(userId);

        setUser(data);

        // 🔥 CHUẨN HOÁ: chỉ dùng avatar
        setForm({
          ...data,
          avatar: data.avatar,
        });
      } catch (err) {
        console.error("Lỗi load user:", err);
        toast.error("Không tải được thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // cleanup blob preview
  useEffect(() => {
    return () => {
      if (form.avatar?.startsWith("blob:")) {
        URL.revokeObjectURL(form.avatar);
      }
    };
  }, [form.avatar]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Tách avatar và các trường không liên quan ra khỏi payload cập nhật cơ bản
      // Quan trọng: Tách 'roles' ra để Backend không tự động gán lại Role sinh viên
      const { avatar, roles, ...rest } = form;

      const payload = {
        ...rest,
        studentCode: form.studentID,
        classCode: form.classID,
        roles: null, // Đảm bảo Backend không cập nhật Role khi đang chỉnh sửa Profile
      };

      const updated = await userService.update(user.id, payload);

      setUser(updated);
      setForm({
        ...updated,
        avatar: updated.avatar,
      });

      setEditing(false);
      toast.success("Cập nhật thông tin thành công 🎉");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Cập nhật thất bại ❌");
    }
  };

  const handleUploadAvatar = async (e: any) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // validate
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ được chọn file ảnh");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh tối đa 2MB");
        return;
      }

      setUploading(true);

      // preview trước
      const preview = URL.createObjectURL(file);
      setForm((prev: any) => ({
        ...prev,
        avatar: preview,
      }));

      const avatarUrl = await userService.uploadAvatar(user.id, file);

      // update UI
      setUser((prev: any) => ({
        ...prev,
        avatar: avatarUrl,
      }));

      setForm((prev: any) => ({
        ...prev,
        avatar: avatarUrl,
      }));

      // 🔥 Cập nhật Context toàn cục
      updateAvatar(avatarUrl);

      toast.success("Cập nhật avatar thành công 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Upload thất bại ❌");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Hồ sơ người dùng</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <Card className="col-span-12 lg:col-span-3">
          <CardContent className="p-6 flex flex-col items-center gap-4">

            {/* AVATAR */}
            <div className="h-24 w-24 rounded-full overflow-hidden bg-muted relative">
              <img
                src={
                  form.avatar ||
                  defaultAvatar
                }
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultAvatar;
                }}
              />

              {/* overlay upload */}
              <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 text-white text-xs">
                {uploading ? "Đang tải..." : "Đổi ảnh"}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUploadAvatar}
                />
              </label>
            </div>

            <div className="text-lg font-semibold">
              {user?.fullName || jwtClaims?.userName}
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setShowDetail(true);
                setEditing(false);
              }}
            >
              Xem / Chỉnh sửa
            </Button>


            <div className="w-full space-y-4 text-sm mt-4">
              {/* Nhóm tài khoản */}
              <div className="space-y-1.5">
                <InfoRow label="Tên tài khoản" value={user?.username} icon={<User className="h-3.5 w-3.5" />} />
                {user?.studentID && <InfoRow label="Mã sinh viên" value={user.studentID} icon={<Hash className="h-3.5 w-3.5" />} />}
                {user?.teacherID && <InfoRow label="Mã giảng viên" value={user.teacherID} icon={<Hash className="h-3.5 w-3.5" />} />}
                {user?.classID && <InfoRow label="Lớp" value={user.classID} icon={<School className="h-3.5 w-3.5" />} />}
                {user?.department && <InfoRow label="Khoa/Phòng" value={user.department} icon={<Building className="h-3.5 w-3.5" />} />}
              </div>

              <Separator className="opacity-50" />

              {/* Nhóm liên lạc */}
              <div className="space-y-1.5">
                {user?.phone && <InfoRow label="SĐT" value={user.phone} icon={<Phone className="h-3.5 w-3.5" />} />}
                {user?.email && <InfoRow label="Email" value={user.email} icon={<Mail className="h-3.5 w-3.5" />} />}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-9">
          <Tabs defaultValue="overview">
            <TabsList className="bg-transparent gap-6">
              <TabsTrigger value="overview">
                <LayoutList className="h-4 w-4 mr-1" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="h-4 w-4 mr-1" />
                Lịch sử
              </TabsTrigger>
            </TabsList>

            <Separator className="my-3" />

            <TabsContent value="overview">
              <div className="text-center py-10 text-muted-foreground">
                {isAdmin
                  ? "Admin không có lớp học"
                  : "Chưa có dữ liệu"}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="text-muted-foreground">
                Chưa có dữ liệu lịch sử
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* MODAL */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowDetail(false)}
          />

          <div className="relative z-10 w-full max-w-[650px] rounded-3xl bg-background border shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-slate-500 bg-clip-text text-transparent">
                {editing ? "Chỉnh sửa thông tin" : "Thông tin chi tiết"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Nhóm 1: Thông tin cơ bản */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <User className="h-4 w-4" /> Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Họ và tên</Label>
                    <Input
                      value={form.fullName || ""}
                      disabled={!editing}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ngày sinh</Label>
                    <Input
                      type="date"
                      value={form.birthday ? new Date(form.birthday).toISOString().split('T')[0] : ""}
                      disabled={!editing}
                      onChange={(e) => handleChange("birthday", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Giới tính</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.gender || ""}
                      disabled={!editing}
                      onChange={(e) => handleChange("gender", e.target.value)}
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nhóm 2: Liên lạc */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Liên lạc
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Email</Label>
                    <Input
                      value={form.email || ""}
                      disabled={!editing}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Số điện thoại</Label>
                    <Input
                      value={form.phone || ""}
                      disabled={!editing}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Hộ khẩu thường trú</Label>
                    <Input
                      value={form.currentResidence || ""}
                      disabled={!editing}
                      onChange={(e) => handleChange("currentResidence", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Địa chỉ liên hệ</Label>
                    <Textarea
                      value={form.contactAddress || ""}
                      disabled={!editing}
                      onChange={(e) => handleChange("contactAddress", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 3: Thông tin định danh (Chỉ hiện cho SV/GV) */}
              {!isAdmin && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                    <Building className="h-4 w-4" /> Danh tính & Đơn vị
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-muted/30 p-4 rounded-lg">
                    {user?.studentID && (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Mã sinh viên</span>
                        <span className="font-semibold">{user.studentID}</span>
                      </div>
                    )}
                    {user?.classID && (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Lớp</span>
                        <span className="font-semibold">{user.classID}</span>
                      </div>
                    )}
                    {user?.teacherID && (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Mã giảng viên</span>
                        <span className="font-semibold">{user.teacherID}</span>
                      </div>
                    )}
                    {user?.department && (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Khoa/Phòng</span>
                        <span className="font-semibold">{user.department}</span>
                      </div>
                    )}
                    {user?.academicRank && (
                      <div className="flex flex-col col-span-2 border-t pt-2 mt-1">
                        <span className="text-xs text-muted-foreground">Học hàm/Học vị</span>
                        <span className="font-semibold">{user.academicRank}</span>
                      </div>
                    )}
                    {user?.specialization && (
                      <div className="flex flex-col col-span-2">
                        <span className="text-xs text-muted-foreground">Chuyên môn</span>
                        <span className="font-semibold">{user.specialization}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t mt-2">
              {!editing ? (
                <Button className="w-full h-11 text-lg font-bold" onClick={() => setEditing(true)}>
                  Chỉnh sửa
                </Button>
              ) : (
                <>
                  <Button className="w-6/12 h-11 text-lg font-bold" onClick={handleSave}>Lưu thay đổi</Button>
                  <Button
                    variant="outline"
                    className="w-6/12 h-11 text-lg font-bold"
                    onClick={() => {
                      setEditing(false);
                      setForm(user);
                    }}
                  >
                    Hủy
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENT */
function InfoRow({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon && <span className="text-muted-foreground/70">{icon}</span>}
      <span className="text-muted-foreground shrink-0">{label}: </span>
      <span className="font-medium text-foreground truncate" title={value}>
        {value || "N/A"}
      </span>
    </div>
  );
}