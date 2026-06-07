export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          priority: 'urgent' | 'important' | 'normal'
          target_role: 'all' | 'professors' | 'employees' | 'students'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          priority?: 'urgent' | 'important' | 'normal'
          target_role?: 'all' | 'professors' | 'employees' | 'students'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          priority?: 'urgent' | 'important' | 'normal'
          target_role?: 'all' | 'professors' | 'employees' | 'students'
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          email: string
          role: 'professor' | 'employee'
          position: string
          avatar: string
          is_active: boolean
          permissions: string[]
          joined_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'professor' | 'employee'
          position: string
          avatar: string
          is_active?: boolean
          permissions?: string[]
          joined_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'professor' | 'employee'
          position?: string
          avatar?: string
          is_active?: boolean
          permissions?: string[]
          joined_at?: string
        }
      }
      professor_requests: {
        Row: {
          id: string
          category: 'academic' | 'administrative' | 'technical' | 'schedule_change' | 'grade_review' | 'other'
          target: 'department' | 'student'
          target_student_id: string | null
          target_student_name: string | null
          subject: string
          description: string
          priority: 'urgent' | 'important' | 'normal'
          status: 'pending' | 'approved' | 'rejected' | 'in_progress'
          response: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          category: 'academic' | 'administrative' | 'technical' | 'schedule_change' | 'grade_review' | 'other'
          target: 'department' | 'student'
          target_student_id?: string | null
          target_student_name?: string | null
          subject: string
          description: string
          priority?: 'urgent' | 'important' | 'normal'
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress'
          response?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          category?: 'academic' | 'administrative' | 'technical' | 'schedule_change' | 'grade_review' | 'other'
          target?: 'department' | 'student'
          target_student_id?: string | null
          target_student_name?: string | null
          subject?: string
          description?: string
          priority?: 'urgent' | 'important' | 'normal'
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress'
          response?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      student_requests: {
        Row: {
          id: string
          type: string
          description: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          description: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          description?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          name: string
          hours: number
          semester: number
        }
        Insert: {
          id?: string
          code: string
          name: string
          hours?: number
          semester?: number
        }
        Update: {
          id?: string
          code?: string
          name?: string
          hours?: number
          semester?: number
        }
      }
      professor_courses: {
        Row: {
          id: string
          course_code: string
          name: string
          hours: number
          professor_name: string
          semester: number
          enrolled_count: number
        }
        Insert: {
          id?: string
          course_code: string
          name?: string
          hours?: number
          professor_name: string
          semester: number
          enrolled_count?: number
        }
        Update: {
          id?: string
          course_code?: string
          name?: string
          hours?: number
          professor_name?: string
          semester?: number
          enrolled_count?: number
        }
      }
      enrolled_students: {
        Row: {
          id: string
          student_id: string
          student_name: string
          course_code: string
          semester: number
          grade: string | null
          mid_term_mark: number | null
          final_mark: number | null
          assignments_mark: number | null
          attendance: number
          status: 'active' | 'withdrawn' | 'incomplete'
        }
        Insert: {
          id?: string
          student_id: string
          student_name: string
          course_code: string
          semester: number
          grade?: string | null
          mid_term_mark?: number | null
          final_mark?: number | null
          assignments_mark?: number | null
          attendance?: number
          status?: 'active' | 'withdrawn' | 'incomplete'
        }
        Update: {
          id?: string
          student_id?: string
          student_name?: string
          course_code?: string
          semester?: number
          grade?: string | null
          mid_term_mark?: number | null
          final_mark?: number | null
          assignments_mark?: number | null
          attendance?: number
          status?: 'active' | 'withdrawn' | 'incomplete'
        }
      }
    }
    Enums: {
      announcement_priority: 'urgent' | 'important' | 'normal'
      target_role: 'all' | 'professors' | 'employees' | 'students'
      member_role: 'professor' | 'employee'
      request_status: 'pending' | 'approved' | 'rejected'
      professor_request_category: 'academic' | 'administrative' | 'technical' | 'schedule_change' | 'grade_review' | 'other'
      professor_request_target: 'department' | 'student'
      professor_request_status: 'pending' | 'approved' | 'rejected' | 'in_progress'
      student_enrollment_status: 'active' | 'withdrawn' | 'incomplete'
    }
  }
}
