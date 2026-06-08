'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  Edit,
  Search,
  Plus,
  Trash2,
  Eye,
  X,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  FacultyProfile,
  AcademicRank,
  DepartmentMember,
} from '@/lib/store';
import {
  ACADEMIC_RANK_LABELS,
  ACADEMIC_RANK_COLORS,
  SEMESTER_NAMES,
} from '@/lib/store';

// ============ Types ============

interface MemberWithProfile extends DepartmentMember {
  profile?: FacultyProfile;
}

// ============ Helper ============

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============ Component ============

export default function FacultyProfiles() {
  const [profiles, setProfiles] = useState<FacultyProfile[]>([]);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterSpec, setFilterSpec] = useState<string>('all');

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<FacultyProfile | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    specialization: '',
    rank: '' as AcademicRank,
    qualification: '',
    grantingUniversity: '',
    bio: '',
    researchInterests: '',
  });

  // Create form
  const [createForm, setCreateForm] = useState({
    memberId: '',
    specialization: '',
    rank: 'lecturer' as AcademicRank,
    qualification: '',
    grantingUniversity: '',
    bio: '',
    researchInterests: '',
    hireDate: '',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profilesRes, membersRes] = await Promise.all([
        fetch('/api/faculty-profiles'),
        fetch('/api/members'),
      ]);
      const profilesData = await profilesRes.json();
      const membersData = await membersRes.json();
      setProfiles(Array.isArray(profilesData) ? profilesData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Merged data: members with profiles
  const mergedData = useMemo(() => {
    return members
      .filter((m) => m.role === 'professor')
      .map((m) => ({
        ...m,
        profile: profiles.find((p) => p.memberId === m.id),
      }));
  }, [members, profiles]);

  // Unique specializations
  const specializations = useMemo(() => {
    const specs = new Set(profiles.map((p) => p.specialization).filter((s): s is string => !!s));
    return Array.from(specs);
  }, [profiles]);

  // Filter
  const filtered = useMemo(() => {
    return mergedData.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.name.includes(searchQuery) ||
        item.profile?.specialization?.includes(searchQuery) ||
        item.profile?.bio?.includes(searchQuery);
      const matchRank =
        filterRank === 'all' || item.profile?.rank === filterRank;
      const matchSpec =
        filterSpec === 'all' || item.profile?.specialization === filterSpec;
      return matchSearch && matchRank && matchSpec;
    });
  }, [mergedData, searchQuery, filterRank, filterSpec]);

  // Profiled vs unprofiled
  const profiledCount = filtered.filter((m) => m.profile).length;
  const unprofiledCount = filtered.filter((m) => !m.profile).length;

  // Handlers
  const handleDetail = (profile: FacultyProfile) => {
    setSelectedProfile(profile);
    setDetailOpen(true);
  };

  const handleEdit = (profile: FacultyProfile) => {
    setSelectedProfile(profile);
    setEditForm({
      specialization: profile.specialization || '',
      rank: profile.rank,
      qualification: profile.qualification || '',
      grantingUniversity: profile.grantingUniversity || '',
      bio: profile.bio || '',
      researchInterests: profile.researchInterests.join('، '),
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedProfile) return;
    try {
      const res = await fetch('/api/faculty-profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProfile.id,
          ...editForm,
          researchInterests: editForm.researchInterests
            .split(/[،,]/)
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        toast.success('تم تحديث الملف الأكاديمي بنجاح');
        setEditOpen(false);
        fetchData();
      } else {
        toast.error('فشل في تحديث الملف الأكاديمي');
      }
    } catch {
      toast.error('فشل في تحديث الملف الأكاديمي');
    }
  };

  const handleCreate = async () => {
    if (!createForm.memberId) {
      toast.error('يرجى اختيار عضو هيئة التدريس');
      return;
    }
    try {
      const res = await fetch('/api/faculty-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          researchInterests: createForm.researchInterests
            .split(/[،,]/)
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        toast.success('تم إنشاء الملف الأكاديمي بنجاح');
        setCreateOpen(false);
        setCreateForm({
          memberId: '',
          specialization: '',
          rank: 'lecturer',
          qualification: '',
          grantingUniversity: '',
          bio: '',
          researchInterests: '',
          hireDate: '',
        });
        fetchData();
      } else {
        toast.error('فشل في إنشاء الملف الأكاديمي');
      }
    } catch {
      toast.error('فشل في إنشاء الملف الأكاديمي');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/faculty-profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('تم حذف الملف الأكاديمي');
        fetchData();
      } else {
        toast.error('فشل في حذف الملف الأكاديمي');
      }
    } catch {
      toast.error('فشل في حذف الملف الأكاديمي');
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Members without profiles for creation
  const membersWithoutProfile = members
    .filter((m) => m.role === 'professor' && !profiles.find((p) => p.memberId === m.id));

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: 'إجمالي الأعضاء', value: mergedData.length, icon: User, color: 'bg-sky-50 text-sky-700' },
          { label: 'لديهم ملف أكاديمي', value: profiledCount, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'بدون ملف أكاديمي', value: unprofiledCount, icon: Briefcase, color: 'bg-amber-50 text-amber-700' },
          { label: 'التخصصات', value: specializations.length, icon: BookOpen, color: 'bg-purple-50 text-purple-700' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stat.value}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-2.5 sm:p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو التخصص..."
                className="ps-9"
              />
            </div>
            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="الرتبة الأكاديمية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الرتب</SelectItem>
                {Object.entries(ACADEMIC_RANK_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSpec} onValueChange={setFilterSpec}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {membersWithoutProfile.length > 0 && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse text-xs sm:text-sm">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">إنشاء ملف أكاديمي</span>
                    <span className="sm:hidden">إنشاء</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إنشاء ملف أكاديمي جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label>عضو هيئة التدريس</Label>
                      <Select
                        value={createForm.memberId}
                        onValueChange={(v) => setCreateForm({ ...createForm, memberId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر عضو هيئة التدريس" />
                        </SelectTrigger>
                        <SelectContent>
                          {membersWithoutProfile.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>التخصص</Label>
                        <Input
                          value={createForm.specialization}
                          onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
                          placeholder="مثال: ذكاء اصطناعي"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>الرتبة الأكاديمية</Label>
                        <Select
                          value={createForm.rank}
                          onValueChange={(v) => setCreateForm({ ...createForm, rank: v as AcademicRank })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ACADEMIC_RANK_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>المؤهل العلمي</Label>
                        <Input
                          value={createForm.qualification}
                          onChange={(e) => setCreateForm({ ...createForm, qualification: e.target.value })}
                          placeholder="مثال: دكتوراه علوم حاسب"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>الجامعة المانحة</Label>
                        <Input
                          value={createForm.grantingUniversity}
                          onChange={(e) => setCreateForm({ ...createForm, grantingUniversity: e.target.value })}
                          placeholder="اسم الجامعة"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>تاريخ التعيين</Label>
                      <Input
                        type="date"
                        value={createForm.hireDate}
                        onChange={(e) => setCreateForm({ ...createForm, hireDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>نبذة تعريفية</Label>
                      <Textarea
                        value={createForm.bio}
                        onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                        placeholder="نبذة مختصرة عن العضو..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>اهتمامات البحث (مفصولة بفواصل)</Label>
                      <Input
                        value={createForm.researchInterests}
                        onChange={(e) => setCreateForm({ ...createForm, researchInterests: e.target.value })}
                        placeholder="الذكاء الاصطناعي، تعلم الآلة..."
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                      إنشاء الملف
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">إلغاء</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Faculty Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm sm:text-base">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((member) => {
            const profile = member.profile;
            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  {/* Header */}
                  <div className="flex items-start gap-2.5 sm:gap-3 mb-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-sm sm:text-base font-bold ${
                      profile ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">{member.name}</h3>
                      {profile ? (
                        <Badge className={`text-[10px] sm:text-xs ${ACADEMIC_RANK_COLORS[profile.rank]}`}>
                          {ACADEMIC_RANK_LABELS[profile.rank]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] sm:text-xs text-amber-600 border-amber-200 bg-amber-50">
                          بدون ملف أكاديمي
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  {profile ? (
                    <div className="space-y-2 mb-3">
                      {profile.specialization && (
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground flex-row-reverse">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span className="truncate">{profile.specialization}</span>
                        </div>
                      )}
                      {profile.qualification && (
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground flex-row-reverse">
                          <Award className="w-3 h-3 shrink-0" />
                          <span className="truncate">{profile.qualification} - {profile.grantingUniversity}</span>
                        </div>
                      )}
                      {profile.researchInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.researchInterests.slice(0, 3).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                              {interest}
                            </Badge>
                          ))}
                          {profile.researchInterests.length > 3 && (
                            <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                              +{profile.researchInterests.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mb-3 py-2">
                      لم يتم إنشاء ملف أكاديمي بعد
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t">
                    {profile ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 flex-row-reverse text-[10px] sm:text-xs text-sky-600 hover:text-sky-700"
                          onClick={() => handleDetail(profile)}
                        >
                          <Eye className="w-3 h-3" />
                          <span>عرض</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 flex-row-reverse text-[10px] sm:text-xs text-amber-600 hover:text-amber-700"
                          onClick={() => handleEdit(profile)}
                        >
                          <Edit className="w-3 h-3" />
                          <span>تعديل</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 flex-row-reverse text-[10px] sm:text-xs text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(profile.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </Button>
                      </>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {member.email}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedProfile && (() => {
            const member = members.find((m) => m.id === selectedProfile.memberId);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 flex-row-reverse">
                    <GraduationCap className="w-5 h-5" />
                    الملف الأكاديمي
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  {/* Name & Rank */}
                  <div className="flex items-center gap-3 flex-row-reverse bg-slate-50 rounded-lg p-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      {member?.avatar || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{member?.name || '—'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={ACADEMIC_RANK_COLORS[selectedProfile.rank]}>
                          {ACADEMIC_RANK_LABELS[selectedProfile.rank]}
                        </Badge>
                        {member?.email && (
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="bg-sky-50 border-sky-100">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 flex-row-reverse text-sky-700 mb-1">
                          <BookOpen className="w-4 h-4" />
                          <span className="text-xs font-medium">التخصص</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{selectedProfile.specialization || '—'}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-violet-50 border-violet-100">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 flex-row-reverse text-violet-700 mb-1">
                          <Award className="w-4 h-4" />
                          <span className="text-xs font-medium">المؤهل العلمي</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{selectedProfile.qualification || '—'}</p>
                        {selectedProfile.grantingUniversity && (
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedProfile.grantingUniversity}</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 flex-row-reverse text-amber-700 mb-1">
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-xs font-medium">تاريخ التعيين</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{formatDate(selectedProfile.hireDate)}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bio */}
                  {selectedProfile.bio && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">نبذة تعريفية</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-slate-50 rounded-lg p-3">
                        {selectedProfile.bio}
                      </p>
                    </div>
                  )}

                  {/* Research Interests */}
                  {selectedProfile.researchInterests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">اهتمامات البحث</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProfile.researchInterests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs px-2.5 py-1">
                            <BookOpen className="w-3 h-3 ms-1" />
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الملف الأكاديمي</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>التخصص</Label>
                <Input
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>الرتبة الأكاديمية</Label>
                <Select
                  value={editForm.rank}
                  onValueChange={(v) => setEditForm({ ...editForm, rank: v as AcademicRank })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACADEMIC_RANK_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>المؤهل العلمي</Label>
                <Input
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>الجامعة المانحة</Label>
                <Input
                  value={editForm.grantingUniversity}
                  onChange={(e) => setEditForm({ ...editForm, grantingUniversity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>نبذة تعريفية</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>اهتمامات البحث (مفصولة بفواصل)</Label>
              <Input
                value={editForm.researchInterests}
                onChange={(e) => setEditForm({ ...editForm, researchInterests: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={handleEditSave} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
              حفظ التعديلات
            </Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm">إلغاء</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
