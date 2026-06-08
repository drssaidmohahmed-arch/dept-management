# Worklog - Academic Department Management System

## Date: 2025-06-27

## Features Implemented

### 1. Student Data Management (إدارة بيانات الطلاب)
- **New Component**: `src/components/hod/StudentManagement.tsx`
  - Displays all unique students from `enrolled_students` data
  - Search/filter by student ID or name
  - Student cards showing: ID, name, enrolled courses count, GPA, latest semester
  - Click on student opens detailed academic record in a dialog
  - Dialog shows per-semester breakdown with courses, grades, hours, GPA

### 2. Course Registration with Drag-and-Drop (التسجيل في المقررات)
- **New Component**: `src/components/student/CourseRegistration.tsx`
  - Uses `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop
  - Two-column layout: Available courses (left) vs Registered courses (right)
  - Drag from available → registered to enroll; drag from registered → available to unregister
  - Credit hours tracker with progress bar (max 21 hours per semester)
  - Semester selector dropdown (semesters 1-6)
  - Validation: prevents exceeding max credit hours with toast notification
  - Hardcoded current student: `ST-2024-001` (عبدالرحمن محمد السالم)
  - Uses existing `addEnrollment()` and `deleteEnrollment()` store actions

### 3. Academic Records/Transcripts (السجلات الأكاديمية)
- **New Component**: `src/components/student/StudentRecords.tsx`
  - Connected to real Supabase data via `useEnrolledStudents()` and `useCourses()` hooks
  - Semester tabs derived dynamically from enrolled_students data
  - Per-semester table: course code, name, hours, grade, points, status
  - Summary cards: semester GPA, cumulative GPA, total hours earned
  - GPA calculation using existing `GRADE_TO_POINTS` mapping
  - Color-coded grades using `GRADE_COLORS` constant
  - Student profile card with name and ID

## Backend Changes

### API Routes
- **Updated**: `src/app/api/enrolled-students/route.ts`
  - Added `POST`: Create enrollment (student_id, student_name, course_code, semester, status)
  - Added `PUT`: Update enrollment (grades, attendance, status)
  - Added `DELETE`: Remove enrollment by ID
  - Preserved existing `GET` with search/filter/courseCode/semester support
  - Added unique constraint handling (409 conflict for duplicate enrollments)

### Store Functions
- **Updated**: `src/lib/supabase-store.ts`
  - Added `addEnrollment()` - enrolls a student via API
  - Added `updateEnrollmentGrade()` - updates grades/attendance/status via API
  - Added `deleteEnrollment()` - removes enrollment via API
  - Re-exported `MAX_CREDIT_HOURS_PER_SEMESTER` and `REGISTRATION_SEMESTER` from store.ts

### Constants
- **Updated**: `src/lib/store.ts`
  - Added `MAX_CREDIT_HOURS_PER_SEMESTER = 21`
  - Added `REGISTRATION_SEMESTER = 3`

## UI Updates

### Student Dashboard (`src/app/page.tsx`)
- Changed tabs from 3 to 4: الإعلانات, السجلات الأكاديمية, التسجيل, الطلبات
- Replaced hardcoded `AcademicCourses` with real data `StudentRecords`
- Added `CourseRegistration` component for the registration tab
- Added icons: `FileBarChart` for records, `PenLine` for registration

### HOD Dashboard (`src/components/hod/HODDashboard.tsx`)
- Added new "الطلبة" (Students) tab between courses and permissions tabs
- Imports and uses `StudentManagement` component

## Packages Installed
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list support
- `@dnd-kit/utilities` - CSS utilities for transforms

## Architecture Patterns Followed
- Data reads: Client-side Supabase with `useSyncExternalStore` + realtime subscriptions
- Data writes: API routes via `fetch('/api/...')` with `apiCall()` helper
- Toast notifications: `CustomEvent('app-notification', { detail: { message, isError } })`
- Store pattern: Module-level cache per table, table listeners, row mappers (DB snake_case → TS camelCase)
- All Arabic text, RTL layout
- Responsive: mobile-first with text-xs sm:text-sm md:text-base pattern
- shadcn/ui components throughout (Card, Badge, Tabs, Button, Dialog, Select, Input)
- Existing color patterns (emerald for good, amber for warning, red for bad, sky for info)
