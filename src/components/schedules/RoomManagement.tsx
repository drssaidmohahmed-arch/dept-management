'use client';

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  DoorOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Room, RoomType, RoomBooking, BookingStatus } from "@/lib/store";
import {
  ROOM_TYPE_LABELS,
  ROOM_TYPE_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from "@/lib/store";

const ROOM_TYPE_BADGE_COLORS: Record<RoomType, string> = {
  lecture_hall: "bg-blue-100 text-blue-800",
  lab: "bg-green-100 text-green-800",
  meeting_room: "bg-purple-100 text-purple-800",
  office: "bg-gray-100 text-gray-800",
  tutorial: "bg-amber-100 text-amber-800",
};

const BOOKING_STATUS_BADGE: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

// Mock data
const mockRooms: Room[] = [
  { id: "room-1", name: "قاعة A101", code: "A101", building: "مبنى A", floor: 1, capacity: 40, type: "lecture_hall", equipment: ["جهاز عرض", "سبورة ذكية", "صوت"], isAvailable: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "room-2", name: "قاعة A102", code: "A102", building: "مبنى A", floor: 1, capacity: 35, type: "lecture_hall", equipment: ["جهاز عرض", "سبورة"], isAvailable: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "room-3", name: "قاعة B201", code: "B201", building: "مبنى B", floor: 2, capacity: 45, type: "lecture_hall", equipment: ["جهاز عرض", "سبورة ذكية", "صوت", "تسجيل"], isAvailable: false, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "room-4", name: "معمل 1", code: "LAB1", building: "مبنى B", floor: 1, capacity: 30, type: "lab", equipment: ["حاسب محمول", "شاشة", "إنترنت", "طابعة"], isAvailable: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "room-5", name: "قاعة C301", code: "C301", building: "مبنى C", floor: 3, capacity: 35, type: "tutorial", equipment: ["جهاز عرض", "سبورة"], isAvailable: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "room-6", name: "قاعة اجتماعات", code: "MT1", building: "مبنى A", floor: 2, capacity: 15, type: "meeting_room", equipment: ["جهاز عرض", "سبورة ذكية", "فيديو"], isAvailable: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "room-7", name: "مكتب 101", code: "OF101", building: "مبنى A", floor: 1, capacity: 4, type: "office", equipment: ["حاسب", "طابعة"], isAvailable: false, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "room-8", name: "معمل 2", code: "LAB2", building: "مبنى B", floor: 1, capacity: 25, type: "lab", equipment: ["حاسب محمول", "شاشة", "إنترنت"], isAvailable: true, createdAt: "2024-01-01T00:00:00.000Z" },
];

const mockBookings: RoomBooking[] = [
  { id: "bk-1", roomId: "room-1", roomName: "قاعة A101", bookedBy: "د. أحمد الشريف", bookingDate: "2025-01-20", startTime: "10:00", endTime: "12:00", purpose: "محاضرة CS101", status: "approved", createdAt: "2025-01-15T00:00:00.000Z" },
  { id: "bk-2", roomId: "room-4", roomName: "معمل 1", bookedBy: "د. فاطمة الحسن", bookingDate: "2025-01-20", startTime: "08:00", endTime: "10:00", purpose: "عملي CS202", status: "approved", createdAt: "2025-01-15T00:00:00.000Z" },
  { id: "bk-3", roomId: "room-6", roomName: "قاعة اجتماعات", bookedBy: "أ. سارة زايد", bookingDate: "2025-01-21", startTime: "09:00", endTime: "11:00", purpose: "اجتماع قسم", status: "pending", createdAt: "2025-01-16T00:00:00.000Z" },
  { id: "bk-4", roomId: "room-3", roomName: "قاعة B201", bookedBy: "د. خالد العمري", bookingDate: "2025-01-21", startTime: "12:00", endTime: "14:00", purpose: "ندوة بحثية", status: "rejected", createdAt: "2025-01-16T00:00:00.000Z" },
  { id: "bk-5", roomId: "room-1", roomName: "قاعة A101", bookedBy: "أ. عمر الدوسري", bookingDate: "2025-01-22", startTime: "14:00", endTime: "16:00", purpose: "امتحان نهائي", status: "pending", createdAt: "2025-01-17T00:00:00.000Z" },
  { id: "bk-6", roomId: "room-5", roomName: "قاعة C301", bookedBy: "د. أحمد الشريف", bookingDate: "2025-01-22", startTime: "08:00", endTime: "10:00", purpose: "محاضرة CS301", status: "approved", createdAt: "2025-01-17T00:00:00.000Z" },
  { id: "bk-7", roomId: "room-2", roomName: "قاعة A102", bookedBy: "د. فاطمة الحسن", bookingDate: "2025-01-23", startTime: "10:00", endTime: "12:00", purpose: "مراجعة المقررات", status: "cancelled", createdAt: "2025-01-18T00:00:00.000Z" },
];

function getWeekDates(): { date: string; dayName: string; dayNum: number }[] {
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const result: { date: string; dayName: string; dayNum: number }[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    result.push({
      date: d.toISOString().split("T")[0],
      dayName: days[d.getDay()],
      dayNum: d.getDate(),
    });
  }
  return result;
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roomSearch, setRoomSearch] = useState("");
  const [filterRoomType, setFilterRoomType] = useState<string>("all");
  const [filterBuilding, setFilterBuilding] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");

  const [bookingSearch, setBookingSearch] = useState("");
  const [filterBookingRoom, setFilterBookingRoom] = useState<string>("all");
  const [filterBookingDate, setFilterBookingDate] = useState<string>("");
  const [filterBookingStatus, setFilterBookingStatus] = useState<string>("all");
  const [filterBookedBy, setFilterBookedBy] = useState<string>("all");

  // Dialogs
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<RoomBooking | null>(null);

  // Forms
  const [roomForm, setRoomForm] = useState({
    name: "",
    code: "",
    building: "",
    floor: 1,
    capacity: 40,
    type: "lecture_hall" as RoomType,
    equipment: [] as string[],
    equipmentInput: "",
    isAvailable: true,
  });
  const [bookingForm, setBookingForm] = useState({
    roomId: "",
    roomName: "",
    bookedBy: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    status: "pending" as BookingStatus,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/room-bookings"),
      ]);
      if (roomsRes.ok && bookingsRes.ok) {
        setRooms(await roomsRes.json());
        setBookings(await bookingsRes.json());
      } else {
        setRooms(mockRooms);
        setBookings(mockBookings);
      }
    } catch {
      setRooms(mockRooms);
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const weekDates = getWeekDates();
  const buildingOptions = [...new Set(rooms.map((r) => r.building))];
  const bookedByOptions = [...new Set(bookings.map((b) => b.bookedBy))];

  const filteredRooms = rooms.filter((r) => {
    if (filterRoomType !== "all" && r.type !== filterRoomType) return false;
    if (filterBuilding !== "all" && r.building !== filterBuilding) return false;
    if (filterAvailability === "available" && !r.isAvailable) return false;
    if (filterAvailability === "unavailable" && r.isAvailable) return false;
    if (roomSearch) {
      const q = roomSearch.toLowerCase();
      return r.name.includes(roomSearch) || r.code.toLowerCase().includes(q) || r.building.includes(roomSearch);
    }
    return true;
  });

  const filteredBookings = bookings.filter((b) => {
    if (filterBookingRoom !== "all" && b.roomId !== filterBookingRoom) return false;
    if (filterBookingDate && b.bookingDate !== filterBookingDate) return false;
    if (filterBookingStatus !== "all" && b.status !== filterBookingStatus) return false;
    if (filterBookedBy !== "all" && b.bookedBy !== filterBookedBy) return false;
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      return b.purpose.includes(bookingSearch) || b.roomName.includes(bookingSearch) || b.bookedBy.includes(bookingSearch);
    }
    return true;
  });

  // ========== Room CRUD ==========

  const handleSaveRoom = async () => {
    if (!roomForm.name.trim() || !roomForm.code.trim()) return;
    try {
      const method = editingRoom ? "PUT" : "POST";
      const body = editingRoom ? { ...roomForm, id: editingRoom.id } : roomForm;
      const res = await fetch("/api/rooms", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editingRoom ? "تم تحديث القاعة بنجاح" : "تم إنشاء القاعة بنجاح");
        setRoomDialogOpen(false);
        setEditingRoom(null);
        resetRoomForm();
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    try {
      const res = await fetch(`/api/rooms?id=${room.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("تم حذف القاعة"); fetchData(); }
      else { toast.error("حدث خطأ أثناء الحذف"); }
    } catch { toast.error("خطأ في الاتصال بالخادم"); }
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({ name: room.name, code: room.code, building: room.building, floor: room.floor, capacity: room.capacity, type: room.type, equipment: [...room.equipment], equipmentInput: "", isAvailable: room.isAvailable });
    setRoomDialogOpen(true);
  };

  const resetRoomForm = () => {
    setRoomForm({ name: "", code: "", building: "", floor: 1, capacity: 40, type: "lecture_hall", equipment: [], equipmentInput: "", isAvailable: true });
  };

  const addEquipment = () => {
    const val = roomForm.equipmentInput.trim();
    if (val && !roomForm.equipment.includes(val)) {
      setRoomForm({ ...roomForm, equipment: [...roomForm.equipment, val], equipmentInput: "" });
    }
  };
  const removeEquipment = (item: string) => {
    setRoomForm({ ...roomForm, equipment: roomForm.equipment.filter((e) => e !== item) });
  };

  // ========== Booking CRUD ==========

  const handleSaveBooking = async () => {
    if (!bookingForm.roomId || !bookingForm.bookingDate || !bookingForm.startTime) return;

    // Conflict detection
    const conflict = bookings.find((b) => {
      if (b.id === editingBooking?.id) return false;
      if (b.roomId !== bookingForm.roomId || b.bookingDate !== bookingForm.bookingDate) return false;
      if (b.status === "rejected" || b.status === "cancelled") return false;
      return b.startTime < bookingForm.endTime && b.endTime > bookingForm.startTime;
    });

    if (conflict) {
      toast.error(`تعارض في الحجز! يوجد حجز آخر في نفس الوقت: ${conflict.purpose}`);
      return;
    }

    try {
      const method = editingBooking ? "PUT" : "POST";
      const body = editingBooking ? { ...bookingForm, id: editingBooking.id } : bookingForm;
      const res = await fetch("/api/room-bookings", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editingBooking ? "تم تحديث الحجز بنجاح" : "تم إنشاء الحجز بنجاح");
        setBookingDialogOpen(false);
        setEditingBooking(null);
        resetBookingForm();
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleDeleteBooking = async (booking: RoomBooking) => {
    try {
      const res = await fetch(`/api/room-bookings?id=${booking.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("تم حذف الحجز"); fetchData(); }
      else { toast.error("حدث خطأ أثناء الحذف"); }
    } catch { toast.error("خطأ في الاتصال بالخادم"); }
  };

  const openEditBooking = (booking: RoomBooking) => {
    setEditingBooking(booking);
    setBookingForm({ roomId: booking.roomId, roomName: booking.roomName, bookedBy: booking.bookedBy, bookingDate: booking.bookingDate, startTime: booking.startTime, endTime: booking.endTime, purpose: booking.purpose, status: booking.status });
    setBookingDialogOpen(true);
  };

  const resetBookingForm = () => {
    setBookingForm({ roomId: "", roomName: "", bookedBy: "", bookingDate: "", startTime: "", endTime: "", purpose: "", status: "pending" });
  };

  // ========== Render ==========

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-4">
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-auto">
          <TabsTrigger value="rooms" className="flex items-center gap-1.5 flex-row-reverse text-xs sm:text-sm py-2">
            <Building className="w-4 h-4" />
            القاعات
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-1.5 flex-row-reverse text-xs sm:text-sm py-2">
            <Calendar className="w-4 h-4" />
            الحجوزات
          </TabsTrigger>
        </TabsList>

        {/* ===== Rooms Tab ===== */}
        <TabsContent value="rooms" className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 flex-row-reverse">
              <DoorOpen className="w-4 h-4 text-emerald-600" />
              القاعات والمعدات
              <Badge variant="secondary" className="text-[10px]">{rooms.length} قاعة</Badge>
            </h3>
            <Dialog open={roomDialogOpen} onOpenChange={(open) => { setRoomDialogOpen(open); if (!open) { setEditingRoom(null); resetRoomForm(); } }}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm">
                  <Plus className="w-4 h-4" />
                  إضافة قاعة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{editingRoom ? "تعديل القاعة" : "إضافة قاعة جديدة"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>اسم القاعة</Label>
                      <Input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} placeholder="قاعة A101" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>الرمز</Label>
                      <Input value={roomForm.code} onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })} placeholder="A101" className="font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>المبنى</Label>
                      <Input value={roomForm.building} onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })} placeholder="مبنى A" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>الطابق</Label>
                      <Input type="number" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })} min={0} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>السعة</Label>
                      <Input type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} min={1} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>النوع</Label>
                      <Select value={roomForm.type} onValueChange={(v) => setRoomForm({ ...roomForm, type: v as RoomType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lecture_hall">قاعة محاضرات</SelectItem>
                          <SelectItem value="lab">معمل</SelectItem>
                          <SelectItem value="meeting_room">قاعة اجتماعات</SelectItem>
                          <SelectItem value="office">مكتب</SelectItem>
                          <SelectItem value="tutorial">قاعة تعليم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>المعدات ({roomForm.equipment.length})</Label>
                    <div className="flex gap-2">
                      <Input value={roomForm.equipmentInput} onChange={(e) => setRoomForm({ ...roomForm, equipmentInput: e.target.value })} placeholder="جهاز عرض" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEquipment(); } }} />
                      <Button variant="outline" size="sm" onClick={addEquipment}>+</Button>
                    </div>
                    {roomForm.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roomForm.equipment.map((eq) => (
                          <Badge key={eq} variant="secondary" className="text-[10px] flex items-center gap-1">
                            {eq}
                            <button onClick={() => removeEquipment(eq)} className="hover:text-red-500">×</button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>متاحة</Label>
                    <button
                      onClick={() => setRoomForm({ ...roomForm, isAvailable: !roomForm.isAvailable })}
                      className={`w-10 h-6 rounded-full transition-colors relative ${roomForm.isAvailable ? "bg-emerald-500" : "bg-red-400"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${roomForm.isAvailable ? "right-0.5" : "right-[18px]"}`} />
                    </button>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button onClick={handleSaveRoom} disabled={!roomForm.name.trim() || !roomForm.code.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-sm">حفظ</Button>
                  <DialogClose asChild><Button variant="outline" size="sm">إلغاء</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Room Filters */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[180px]">
                  <Input placeholder="بحث بالاسم أو الرمز..." value={roomSearch} onChange={(e) => setRoomSearch(e.target.value)} className="text-xs" />
                </div>
                <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                  <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="النوع" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="lecture_hall">قاعة محاضرات</SelectItem>
                    <SelectItem value="lab">معمل</SelectItem>
                    <SelectItem value="meeting_room">قاعة اجتماعات</SelectItem>
                    <SelectItem value="office">مكتب</SelectItem>
                    <SelectItem value="tutorial">قاعة تعليم</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                  <SelectTrigger className="w-24 text-xs"><SelectValue placeholder="المبنى" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {buildingOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                  <SelectTrigger className="w-24 text-xs"><SelectValue placeholder="التوفر" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="available">متاحة</SelectItem>
                    <SelectItem value="unavailable">غير متاحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Room Cards */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد قاعات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4 className="font-bold text-sm text-slate-800 truncate">{room.name}</h4>
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${room.isAvailable ? "bg-green-500" : "bg-red-500"}`} title={room.isAvailable ? "متاحة" : "غير متاحة"} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] font-mono px-1.5">{room.code}</Badge>
                          <Badge className={`text-[9px] px-1.5 ${ROOM_TYPE_BADGE_COLORS[room.type]}`}>
                            {ROOM_TYPE_LABELS[room.type]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => openEditRoom(room)} className="p-1 hover:bg-slate-100 rounded"><Edit className="w-3.5 h-3.5 text-slate-400" /></button>
                        <button onClick={() => handleDeleteRoom(room)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>

                    {/* Building & Floor */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1 flex-row-reverse">
                        <Building className="w-3 h-3" />
                        {room.building}
                      </span>
                      <span className="flex items-center gap-1 flex-row-reverse">
                        <MapPin className="w-3 h-3" />
                        الطابق {room.floor}
                      </span>
                      <span className="flex items-center gap-1 flex-row-reverse">
                        <Users className="w-3 h-3" />
                        {room.capacity} مقعد
                      </span>
                    </div>

                    {/* Equipment tags */}
                    {room.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((eq) => (
                          <Badge key={eq} variant="outline" className="text-[9px]">{eq}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== Bookings Tab ===== */}
        <TabsContent value="bookings" className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 flex-row-reverse">
              <Calendar className="w-4 h-4 text-emerald-600" />
              الحجوزات
              <Badge variant="secondary" className="text-[10px]">{bookings.length} حجز</Badge>
            </h3>
            <Dialog open={bookingDialogOpen} onOpenChange={(open) => { setBookingDialogOpen(open); if (!open) { setEditingBooking(null); resetBookingForm(); } }}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm">
                  <Plus className="w-4 h-4" />
                  إضافة حجز
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{editingBooking ? "تعديل الحجز" : "حجز قاعة جديدة"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label>القاعة</Label>
                    <Select value={bookingForm.roomId} onValueChange={(v) => { const r = rooms.find((rm) => rm.id === v); setBookingForm({ ...bookingForm, roomId: v, roomName: r?.name || "" }); }}>
                      <SelectTrigger><SelectValue placeholder="اختر قاعة" /></SelectTrigger>
                      <SelectContent>
                        {rooms.filter((r) => r.isAvailable).map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name} ({r.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>حجز بواسطة</Label>
                    <Input value={bookingForm.bookedBy} onChange={(e) => setBookingForm({ ...bookingForm, bookedBy: e.target.value })} placeholder="الاسم" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>التاريخ</Label>
                    <Input type="date" value={bookingForm.bookingDate} onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>من الساعة</Label>
                      <Input type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>إلى الساعة</Label>
                      <Input type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>الغرض</Label>
                    <Textarea value={bookingForm.purpose} onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })} rows={2} placeholder="محاضرة، اجتماع، امتحان..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>الحالة</Label>
                    <Select value={bookingForm.status} onValueChange={(v) => setBookingForm({ ...bookingForm, status: v as BookingStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="approved">مقبول</SelectItem>
                        <SelectItem value="rejected">مرفوض</SelectItem>
                        <SelectItem value="cancelled">ملغى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button onClick={handleSaveBooking} disabled={!bookingForm.roomId || !bookingForm.bookingDate} className="bg-emerald-600 hover:bg-emerald-700 text-sm">حفظ</Button>
                  <DialogClose asChild><Button variant="outline" size="sm">إلغاء</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calendar Week View */}
          <Card className="mb-4">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 flex-row-reverse">
                <Calendar className="w-4 h-4" />
                عرض الأسبوع
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekDates.map(({ date, dayName, dayNum }) => {
                  const dayBookings = bookings.filter((b) => b.bookingDate === date && (b.status === "approved" || b.status === "pending"));
                  const isToday = date === new Date().toISOString().split("T")[0];
                  return (
                    <div key={date} className={`rounded-lg border p-1.5 sm:p-2 min-h-[80px] ${isToday ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200"}`}>
                      <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground">{dayName}</p>
                      <p className={`text-xs sm:text-sm font-bold ${isToday ? "text-emerald-700" : "text-slate-800"}`}>{dayNum}</p>
                      <div className="mt-1 space-y-0.5">
                        {dayBookings.slice(0, 2).map((b) => (
                          <div key={b.id} className={`text-[8px] sm:text-[9px] rounded px-1 py-0.5 truncate ${BOOKING_STATUS_BADGE[b.status]}`}>
                            {b.startTime}-{b.endTime}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <p className="text-[8px] text-muted-foreground">+{dayBookings.length - 2} آخر</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Booking Filters */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[160px]">
                  <Input placeholder="بحث..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} className="text-xs" />
                </div>
                <Select value={filterBookingRoom} onValueChange={setFilterBookingRoom}>
                  <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="القاعة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {rooms.map((r) => <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="date" value={filterBookingDate} onChange={(e) => setFilterBookingDate(e.target.value)} className="w-32 text-xs" />
                <Select value={filterBookingStatus} onValueChange={setFilterBookingStatus}>
                  <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="الحالة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="approved">مقبول</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBookedBy} onValueChange={setFilterBookedBy}>
                  <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="الحاجز" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {bookedByOptions.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Booking List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد حجوزات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <Badge className={`text-[10px] ${BOOKING_STATUS_BADGE[booking.status]}`}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </Badge>
                          <span className="text-sm font-semibold text-slate-800">{booking.roomName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{booking.purpose}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5 flex-row-reverse">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.bookingDate).toLocaleDateString("ar-SA")}
                          </span>
                          <span className="flex items-center gap-0.5 flex-row-reverse">
                            <Clock className="w-3 h-3" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                          <span className="flex items-center gap-0.5 flex-row-reverse">
                            <User className="w-3 h-3" />
                            {booking.bookedBy}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEditBooking(booking)} className="p-1 hover:bg-slate-100 rounded"><Edit className="w-3.5 h-3.5 text-slate-400" /></button>
                        <button onClick={() => handleDeleteBooking(booking)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


