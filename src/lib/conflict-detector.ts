// ============ Schedule Conflict Detection ============

export interface ScheduleConflict {
  type: 'room_overlap' | 'instructor_overlap' | 'time_overlap' | 'capacity_exceeded';
  message: string; // Arabic message
  conflictingItem1: unknown;
  conflictingItem2: unknown;
}

export interface ScheduleEntry {
  roomName?: string;
  roomId?: string;
  instructorName?: string;
  instructorId?: string;
  day?: string;
  startTime: string;
  endTime: string;
  enrolledCount?: number;
  capacity?: number;
  courseName?: string;
  courseCode?: string;
  section?: number;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

export function detectConflicts(
  newEntry: ScheduleEntry,
  existingEntries: ScheduleEntry[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (const existing of existingEntries) {
    // 1. Room Overlap: Same room at the same time on the same day
    if (
      newEntry.roomId &&
      existing.roomId &&
      newEntry.roomId === existing.roomId &&
      newEntry.day &&
      existing.day &&
      newEntry.day === existing.day &&
      isTimeOverlap(newEntry.startTime, newEntry.endTime, existing.startTime, existing.endTime)
    ) {
      conflicts.push({
        type: 'room_overlap',
        message: `تعارض في القاعة "${newEntry.roomName || newEntry.roomId}" يوم ${newEntry.day}: يوجد حجز آخر من ${existing.startTime} إلى ${existing.endTime} للمقرر ${existing.courseCode || existing.courseName || 'غير محدد'}`,
        conflictingItem1: newEntry,
        conflictingItem2: existing,
      });
    }

    // 2. Instructor Overlap: Same instructor teaching at the same time on the same day
    if (
      newEntry.instructorName &&
      existing.instructorName &&
      newEntry.instructorName === existing.instructorName &&
      newEntry.day &&
      existing.day &&
      newEntry.day === existing.day &&
      isTimeOverlap(newEntry.startTime, newEntry.endTime, existing.startTime, existing.endTime)
    ) {
      const alreadyHasRoomConflict = conflicts.some(
        (c) =>
          c.type === 'room_overlap' &&
          (c.conflictingItem1 as ScheduleEntry).roomId === existing.roomId
      );
      if (!alreadyHasRoomConflict) {
        conflicts.push({
          type: 'instructor_overlap',
          message: `تعارض في جدول "${newEntry.instructorName}" يوم ${newEntry.day}: يوجد محاضرة أخرى من ${existing.startTime} إلى ${existing.endTime} للمقرر ${existing.courseCode || existing.courseName || 'غير محدد'}`,
          conflictingItem1: newEntry,
          conflictingItem2: existing,
        });
      }
    }
  }

  // 3. Capacity Check
  if (newEntry.enrolledCount && newEntry.capacity && newEntry.enrolledCount > newEntry.capacity) {
    conflicts.push({
      type: 'capacity_exceeded',
      message: `تجاوز السعة في القاعة "${newEntry.roomName || ''}": عدد المسجلين (${newEntry.enrolledCount}) يتجاوز السعة (${newEntry.capacity})`,
      conflictingItem1: newEntry,
      conflictingItem2: { capacity: newEntry.capacity, enrolled: newEntry.enrolledCount },
    });
  }

  return conflicts;
}

export function detectAllConflicts(entries: ScheduleEntry[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      // Room overlap check
      if (
        a.roomId && b.roomId && a.roomId === b.roomId &&
        a.day && b.day && a.day === b.day &&
        isTimeOverlap(a.startTime, a.endTime, b.startTime, b.endTime)
      ) {
        conflicts.push({
          type: 'room_overlap',
          message: `تعارض في القاعة "${a.roomName || a.roomId}" يوم ${a.day}: المقرر ${a.courseCode || '—'} (${a.startTime}-${a.endTime}) يتعارض مع ${b.courseCode || '—'} (${b.startTime}-${b.endTime})`,
          conflictingItem1: a,
          conflictingItem2: b,
        });
      }

      // Instructor overlap check
      if (
        a.instructorName && b.instructorName && a.instructorName === b.instructorName &&
        a.day && b.day && a.day === b.day &&
        isTimeOverlap(a.startTime, a.endTime, b.startTime, b.endTime)
      ) {
        const alreadyHasRoomConflict = conflicts.some(
          (c) =>
            c.type === 'room_overlap' &&
            ((c.conflictingItem1 as ScheduleEntry).roomId === a.roomId &&
              (c.conflictingItem2 as ScheduleEntry).roomId === b.roomId)
        );
        if (!alreadyHasRoomConflict) {
          conflicts.push({
            type: 'instructor_overlap',
            message: `تعارض في جدول "${a.instructorName}" يوم ${a.day}: المقرر ${a.courseCode || '—'} (${a.startTime}-${a.endTime}) يتعارض مع ${b.courseCode || '—'} (${b.startTime}-${b.endTime})`,
            conflictingItem1: a,
            conflictingItem2: b,
          });
        }
      }

      // Capacity check
      if (a.enrolledCount && a.capacity && a.enrolledCount > a.capacity) {
        conflicts.push({
          type: 'capacity_exceeded',
          message: `تجاوز السعة في "${a.roomName || ''}": المسجلين (${a.enrolledCount}) يتجاوز السعة (${a.capacity})`,
          conflictingItem1: a,
          conflictingItem2: { capacity: a.capacity, enrolled: a.enrolledCount },
        });
      }
      if (b.enrolledCount && b.capacity && b.enrolledCount > b.capacity) {
        conflicts.push({
          type: 'capacity_exceeded',
          message: `تجاوز السعة في "${b.roomName || ''}": المسجلين (${b.enrolledCount}) يتجاوز السعة (${b.capacity})`,
          conflictingItem1: b,
          conflictingItem2: { capacity: b.capacity, enrolled: b.enrolledCount },
        });
      }
    }
  }

  return conflicts;
}
