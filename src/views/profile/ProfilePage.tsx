export interface ExerciseTestCase {
  testCaseId?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  explanation?: string;
  orderIndex?: number;
}import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  GraduationCap,
  Clock,
  LayoutList,
  Inbox,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { actionAuth } from "@/components/context/AuthContext";

type UserProfile = {
  fullName: string;
  username: string; // mã tài khoản
  className?: string;
  email?: string;
  dob?: string; // dd/mm/yyyy
  gender?: string;
  address?: string;
  bio?: string;
  avatarInitials: string; // "LQ"
};

type JoinedClass = {
  id: string;
  stt: number;
  subject: string;
  group: string;
  semester: string;
  status: string;
};

export default function ProfilePage() {
  const { jwtClaims } = actionAuth();
  const navigate = useNavigate();

  const joinedClasses: JoinedClass[] = [];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-lg font-semibold">Hồ sơ người dùng</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-3 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-44 w-44 rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center shadow-inner">
                <span className="text-6xl font-semibold text-muted-foreground/40">
                  {/* {jwtClaims.userInfor?.avatar} */}
                  <User size={80} />
                </span>
              </div>

              <div className="mt-4 text-red-700 font-semibold">
                {/* {jwtClaims.userInfor?.fullName} */}
              </div>

              <Button className="mt-6 w-full font-bold shadow-lg shadow-primary/20">
                Chỉnh sửa hồ sơ
              </Button>

              <div className="mt-5 w-full space-y-2 text-left text-sm">
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Tài khoản"
                  value={
                    jwtClaims.userName || ""
                  }
                />
                <InfoRow
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="Lớp"
                  value={jwtClaims.classId || ""}
                />
                {/* <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={
                    jwtClaims.userInfor?.email || ""
                  }
                /> */}
                {/* <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Ngày sinh"
                  value={jwtClaims.userInfor?.birthday || ""}
                />
                <InfoRow
                  icon={<Info className="h-4 w-4" />}
                  label="Giới tính"
                  value={jwtClaims.userInfor?.gender || ""}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Địa chỉ liên hệ"
                  value={jwtClaims.userInfor?.contactAddress || ""}
                />
                <InfoRow
                  icon={<Info className="h-4 w-4" />}
                  label="Địa chỉ nơi ở hiện tại"
                  value={jwtClaims.userInfor?.currentResidence || ""}
                /> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-9 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base"></CardTitle>
          </CardHeader>

          <CardContent className="pt-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-transparent p-0 gap-2">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold"
                >
                  <LayoutList className="h-4 w-4 mr-2" />
                  Tổng quan
                </TabsTrigger>

                <TabsTrigger
                  value="history"
                  className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Lịch sử
                </TabsTrigger>
              </TabsList>

              <Separator className="my-3" />

              <TabsContent value="overview" className="mt-0">
                <SectionTitle title="Danh sách lớp học đã tham gia:" />

                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 border-b border-border">
                    <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground">
                      <div className="col-span-1 text-center">STT</div>
                      <div className="col-span-4">Môn học</div>
                      <div className="col-span-2">Nhóm</div>
                      <div className="col-span-3">Học kỳ</div>
                      <div className="col-span-2">Trạng thái</div>
                    </div>
                  </div>

                  {joinedClasses.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px] text-center">
                            STT
                          </TableHead>
                          <TableHead>Môn học</TableHead>
                          <TableHead>Nhóm</TableHead>
                          <TableHead>Học kỳ</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {joinedClasses.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-center">
                              {c.stt}
                            </TableCell>
                            <TableCell>{c.subject}</TableCell>
                            <TableCell>{c.group}</TableCell>
                            <TableCell>{c.semester}</TableCell>
                            <TableCell>{c.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <SectionTitle title="Lịch sử hoạt động:" />
                <div className="rounded-md border p-6 text-sm text-muted-foreground">
                  Chưa có dữ liệu lịch sử.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-foreground/70">
      <div className="mt-0.5 text-primary/70">{icon}</div>
      <div className="flex-1">
        <span className="font-bold text-xs uppercase tracking-tight text-muted-foreground">{label}:</span>{" "}
        <div className="text-foreground font-semibold">{value || "N/A"}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <div className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
    <div className="w-1 h-4 bg-primary rounded-full" />
    {title}
  </div>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Inbox className="h-10 w-10 opacity-50" />
      <div className="mt-2 text-sm">No data</div>
    </div>
  );
}
