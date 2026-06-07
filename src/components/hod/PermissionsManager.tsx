'use client';

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Plus,
  Trash2,
  UserPlus,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Users,
  UserCheck,
  UserX,
  Eye,
  Megaphone,
  BookOpen,
  ClipboardList,
  BarChart3,
  Calendar,
  FileCheck,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Mail,
  Clock,
} from "lucide-react";
import {
  useMembers,
  toggleMemberPermission,
  toggleMemberStatus,
  addMember,
  deleteMember,
  updateMemberPermissions,
  PERMISSION_LABELS,
  ALL_PERMISSIONS,
  MEMBER_ROLE_LABELS,
  MEMBER_ROLE_COLORS,
  type PermissionKey,
  type DepartmentMember,
} from "@/lib/store";

// Permission icon mapping
const permissionIcons: Record<string, React.ElementType> = {
  megaphone: Megaphone,
  book: BookOpen,
  clipboard: ClipboardList,
  chart: BarChart3,
  calendar: Calendar,
  exam: FileCheck,
  download: Download,
  users: Users,
};

// Permission color mapping
const permissionColors: Record<string, string> = {
  manage_announcements: "bg-emerald-50 text-emerald-700 border-emerald-200",
  manage_courses: "bg-sky-50 text-sky-700 border-sky-200",
  manage_requests: "bg-orange-50 text-orange-700 border-orange-200",
  view_reports: "bg-purple-50 text-purple-700 border-purple-200",
  manage_schedules: "bg-amber-50 text-amber-700 border-amber-200",
  manage_exams: "bg-rose-50 text-rose-700 border-rose-200",
  export_data: "bg-indigo-50 text-indigo-700 border-indigo-200",
  manage_users: "bg-teal-50 text-teal-700 border-teal-200",
};

// Predefined permission templates
const PERMISSION_TEMPLATES: Record<string, { label: string; permissions: PermissionKey[] }> = {
  full_access: {
    label: "صلاحيات كاملة",
    permissions: ALL_PERMISSIONS,
  },
  academic_staff: {
    label: "صلاحيات أكاديمية",
    permissions: ["manage_courses", "manage_schedules", "manage_exams", "view_reports"],
  },
  admin_staff: {
    label: "صلاحيات إدارية",
    permissions: ["manage_requests", "export_data", "manage_announcements", "view_reports"],
  },
  viewer: {
    label: "مشاهد فقط",
    permissions: ["view_reports"],
  },
};

export default function PermissionsManager() {
  const members = useMembers();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "professor" | "employee">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add member form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"professor" | "employee">("employee");
  const [newPosition, setNewPosition] = useState("");
  const [newPermissions, setNewPermissions] = useState<PermissionKey[]>([]);

  // Filter and search members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        searchQuery === "" ||
        m.name.includes(searchQuery) ||
        m.email.includes(searchQuery) ||
        m.position.includes(searchQuery);
      const matchesRole = filterRole === "all" || m.role === filterRole;
      const matchesStatus = filterStatus === "all" ||
        (filterStatus === "active" && m.isActive) ||
        (filterStatus === "inactive" && !m.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, filterRole, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const active = members.filter((m) => m.isActive).length;
    const professors = members.filter((m) => m.role === "professor").length;
    const employees = members.filter((m) => m.role === "employee").length;
    const withFullAccess = members.filter(
      (m) => m.permissions.length === ALL_PERMISSIONS.length
    ).length;
    return { active, professors, employees, withFullAccess, total: members.length };
  }, [members]);

  const handleAddMember = () => {
    if (!newName.trim() || !newEmail.trim() || !newPosition.trim()) return;
    const avatar = newName.trim().charAt(0);
    addMember({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      position: newPosition.trim(),
      avatar,
      isActive: true,
      permissions: newPermissions,
    });
    setNewName("");
    setNewEmail("");
    setNewRole("employee");
    setNewPosition("");
    setNewPermissions([]);
    setAddDialogOpen(false);
  };

  const handleApplyTemplate = (memberId: string, templateKey: string) => {
    const template = PERMISSION_TEMPLATES[templateKey];
    if (template) {
      updateMemberPermissions(memberId, template.permissions);
    }
  };

  const handleToggleAll = (memberId: string, enable: boolean) => {
    updateMemberPermissions(memberId, enable ? ALL_PERMISSIONS : []);
  };

  const getAvatarColor = (member: DepartmentMember) => {
    if (!member.isActive) return "bg-slate-200 text-slate-500";
    return member.role === "professor"
      ? "bg-sky-100 text-sky-700"
      : "bg-cyan-100 text-cyan-700";
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "إجمالي الأعضاء", value: stats.total, icon: Users, color: "bg-slate-50 text-slate-700" },
            { label: "نشط", value: stats.active, icon: UserCheck, color: "bg-emerald-50 text-emerald-700" },
            { label: "أعضاء هيئة التدريس", value: stats.professors, icon: ShieldCheck, color: "bg-sky-50 text-sky-700" },
            { label: "الموظفون", value: stats.employees, icon: UserX, color: "bg-cyan-50 text-cyan-700" },
            { label: "صلاحيات كاملة", value: stats.withFullAccess, icon: Shield, color: "bg-amber-50 text-amber-700" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters + Actions Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالاسم أو البريد أو المنصب..."
                  className="ps-9"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={filterRole} onValueChange={(v) => setFilterRole(v as typeof filterRole)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="professor">أعضاء التدريس</SelectItem>
                      <SelectItem value="employee">الموظفون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">معطل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Button */}
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus className="w-4 h-4" />
                    إضافة عضو
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة عضو جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-name">الاسم الكامل</Label>
                        <Input
                          id="member-name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="د. / أ. الاسم"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-email">البريد الإلكتروني</Label>
                        <Input
                          id="member-email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="name@univ.edu"
                          type="email"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>الدور</Label>
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professor">عضو هيئة تدريس</SelectItem>
                            <SelectItem value="employee">موظف إداري</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-position">المنصب</Label>
                        <Input
                          id="member-position"
                          value={newPosition}
                          onChange={(e) => setNewPosition(e.target.value)}
                          placeholder="مثال: أستاذ مشارك"
                        />
                      </div>
                    </div>

                    {/* Permission Templates */}
                    <div className="space-y-2">
                      <Label>تطبيق قالب صلاحيات</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PERMISSION_TEMPLATES).map(([key, tpl]) => (
                          <Button
                            key={key}
                            type="button"
                            variant={
                              newPermissions.length === tpl.permissions.length &&
                              tpl.permissions.every((p) => newPermissions.includes(p))
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="text-xs"
                            onClick={() => setNewPermissions([...tpl.permissions])}
                          >
                            {tpl.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="space-y-2">
                      <Label>الصلاحيات المحددة ({newPermissions.length}/{ALL_PERMISSIONS.length})</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {ALL_PERMISSIONS.map((perm) => {
                          const info = PERMISSION_LABELS[perm];
                          const PermIcon = permissionIcons[info.icon] || Shield;
                          const isSelected = newPermissions.includes(perm);
                          return (
                            <button
                              key={perm}
                              type="button"
                              onClick={() =>
                                setNewPermissions((prev) =>
                                  isSelected
                                    ? prev.filter((p) => p !== perm)
                                    : [...prev, perm]
                                )
                              }
                              className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm text-right transition-all ${
                                isSelected
                                  ? permissionColors[perm] + " border-current"
                                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                              }`}
                            >
                              <PermIcon className="w-4 h-4 shrink-0" />
                              <span className="flex-1 text-xs font-medium">{info.label}</span>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      onClick={handleAddMember}
                      disabled={!newName.trim() || !newEmail.trim() || !newPosition.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      إضافة العضو
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline">إلغاء</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا يوجد أعضاء مطابقون للبحث</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const isExpanded = expandedMember === member.id;
              const permCount = member.permissions.length;
              const allPerms = permCount === ALL_PERMISSIONS.length;

              return (
                <Card
                  key={member.id}
                  className={`overflow-hidden transition-shadow ${
                    !member.isActive ? "opacity-60" : "hover:shadow-md"
                  }`}
                >
                  {/* Member Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(member)}`}>
                        {member.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-slate-800">{member.name}</h3>
                          <Badge className={`text-xs ${MEMBER_ROLE_COLORS[member.role]}`}>
                            {MEMBER_ROLE_LABELS[member.role]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {member.position}
                          </Badge>
                          {!member.isActive && (
                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500">
                              معطل
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            عضو منذ {new Date(member.joinedAt).toLocaleDateString("ar-SA", { year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Permission Summary */}
                      <div className="hidden md:flex items-center gap-2">
                        <Badge variant={allPerms ? "default" : "secondary"} className="text-xs">
                          {permCount}/{ALL_PERMISSIONS.length} صلاحية
                        </Badge>
                        <div className="flex -space-x-1 space-x-reverse">
                          {member.permissions.slice(0, 4).map((perm) => {
                            const info = PERMISSION_LABELS[perm];
                            const PermIcon = permissionIcons[info.icon] || Shield;
                            return (
                              <Tooltip key={perm}>
                                <TooltipTrigger asChild>
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${permissionColors[perm]}`}>
                                    <PermIcon className="w-3 h-3" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{info.label}</TooltipContent>
                              </Tooltip>
                            );
                          })}
                          {permCount > 4 && (
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-medium">
                              +{permCount - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle Active */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMemberStatus(member.id)}
                              className={member.isActive ? "text-emerald-600" : "text-slate-400"}
                            >
                              {member.isActive ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                          </TooltipContent>
                        </Tooltip>

                        {/* Expand/Collapse */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Delete */}
                        <Dialog
                          open={deleteConfirmId === member.id}
                          onOpenChange={(open) => setDeleteConfirmId(open ? member.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-sm" dir="rtl">
                            <DialogHeader>
                              <DialogTitle>تأكيد الحذف</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground text-right">
                              هل أنت متأكد من حذف <strong>{member.name}</strong> من القسم؟ لا يمكن التراجع عن هذا الإجراء.
                            </p>
                            <DialogFooter className="gap-2 sm:gap-0">
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  deleteMember(member.id);
                                  setDeleteConfirmId(null);
                                }}
                              >
                                حذف
                              </Button>
                              <DialogClose asChild>
                                <Button variant="outline">إلغاء</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Permissions Panel */}
                  {isExpanded && (
                    <div className="border-t bg-slate-50/50 p-4">
                      <div className="space-y-4">
                        {/* Header + Quick Actions */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            إدارة الصلاحيات
                            <Badge variant="secondary" className="text-xs">
                              {permCount} صلاحية
                            </Badge>
                          </h4>
                          <div className="flex items-center gap-2">
                            {/* Templates */}
                            <div className="hidden sm:flex items-center gap-1">
                              <span className="text-xs text-muted-foreground ms-1">قوالب:</span>
                              {Object.entries(PERMISSION_TEMPLATES).map(([key, tpl]) => {
                                const isCurrentTemplate =
                                  member.permissions.length === tpl.permissions.length &&
                                  tpl.permissions.every((p) => member.permissions.includes(p));
                                return (
                                  <Button
                                    key={key}
                                    variant={isCurrentTemplate ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={() => handleApplyTemplate(member.id, key)}
                                  >
                                    {tpl.label}
                                  </Button>
                                );
                              })}
                            </div>
                            {/* Toggle All */}
                            <Button
                              variant={allPerms ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleToggleAll(member.id, !allPerms)}
                            >
                              {allPerms ? "إلغاء الكل" : "تفعيل الكل"}
                            </Button>
                          </div>
                        </div>

                        {/* Permissions Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {ALL_PERMISSIONS.map((perm) => {
                            const info = PERMISSION_LABELS[perm];
                            const PermIcon = permissionIcons[info.icon] || Shield;
                            const hasPermission = member.permissions.includes(perm);

                            return (
                              <button
                                key={perm}
                                onClick={() => toggleMemberPermission(member.id, perm)}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-right transition-all ${
                                  hasPermission
                                    ? permissionColors[perm] + " border-current shadow-sm"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                                  hasPermission ? "bg-white/60" : "bg-slate-100"
                                }`}>
                                  <PermIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`text-sm font-medium ${hasPermission ? "" : "text-slate-500"}`}>
                                      {info.label}
                                    </span>
                                    {hasPermission ? (
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                    ) : (
                                      <X className="w-3 h-3 text-slate-300 shrink-0" />
                                    )}
                                  </div>
                                  <p className={`text-xs leading-relaxed ${
                                    hasPermission ? "opacity-80" : "text-slate-400"
                                  }`}>
                                    {info.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-muted-foreground text-center">
          عرض {filteredMembers.length} من {members.length} عضو
        </p>
      </div>
    </TooltipProvider>
  );
}
