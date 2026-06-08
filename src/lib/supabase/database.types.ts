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
      students: {
        Row: {
          id: string
          student_id: string
          name: string
          email: string | null
          phone: string | null
          level: number
          major: string
          gpa: number | null
          cumulative_hours: number | null
          status: 'active' | 'probation' | 'withdrawn' | 'graduated' | 'suspended'
          advisor_name: string | null
          enrollment_year: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          email?: string | null
          phone?: string | null
          level?: number
          major?: string
          gpa?: number | null
          cumulative_hours?: number | null
          status?: 'active' | 'probation' | 'withdrawn' | 'graduated' | 'suspended'
          advisor_name?: string | null
          enrollment_year: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          level?: number
          major?: string
          gpa?: number | null
          cumulative_hours?: number | null
          status?: 'active' | 'probation' | 'withdrawn' | 'graduated' | 'suspended'
          advisor_name?: string | null
          enrollment_year?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      faculty_profiles: {
        Row: {
          id: string
          member_id: string
          specialization: string | null
          rank: 'professor' | 'associate_professor' | 'assistant_professor' | 'lecturer' | 'teaching_assistant'
          qualification: string | null
          granting_university: string | null
          bio: string
          research_interests: string[]
          hire_date: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          specialization?: string | null
          rank?: 'professor' | 'associate_professor' | 'assistant_professor' | 'lecturer' | 'teaching_assistant'
          qualification?: string | null
          granting_university?: string | null
          bio?: string
          research_interests?: string[]
          hire_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          specialization?: string | null
          rank?: 'professor' | 'associate_professor' | 'assistant_professor' | 'lecturer' | 'teaching_assistant'
          qualification?: string | null
          granting_university?: string | null
          bio?: string
          research_interests?: string[]
          hire_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          code: string
          building: string
          floor: number
          capacity: number
          type: 'lecture_hall' | 'lab' | 'meeting_room' | 'office' | 'tutorial'
          equipment: string[]
          is_available: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          building?: string
          floor?: number
          capacity?: number
          type?: 'lecture_hall' | 'lab' | 'meeting_room' | 'office' | 'tutorial'
          equipment?: string[]
          is_available?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          building?: string
          floor?: number
          capacity?: number
          type?: 'lecture_hall' | 'lab' | 'meeting_room' | 'office' | 'tutorial'
          equipment?: string[]
          is_available?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      teaching_assignments: {
        Row: {
          id: string
          professor_id: string | null
          professor_name: string
          course_code: string
          course_name: string
          section: number
          room_id: string | null
          room_name: string
          day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
          start_time: string
          end_time: string
          session_type: 'lecture' | 'lab' | 'tutorial'
          academic_year: string
          semester: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          professor_id?: string | null
          professor_name: string
          course_code: string
          course_name: string
          section?: number
          room_id?: string | null
          room_name?: string
          day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
          start_time: string
          end_time: string
          session_type?: 'lecture' | 'lab' | 'tutorial'
          academic_year?: string
          semester?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          professor_id?: string | null
          professor_name?: string
          course_code?: string
          course_name?: string
          section?: number
          room_id?: string | null
          room_name?: string
          day?: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
          start_time?: string
          end_time?: string
          session_type?: 'lecture' | 'lab' | 'tutorial'
          academic_year?: string
          semester?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      performance_evaluations: {
        Row: {
          id: string
          faculty_id: string | null
          faculty_name: string
          evaluation_type: 'student_feedback' | 'peer_review' | 'self_assessment' | 'chairman_review'
          academic_year: string
          semester: number
          teaching_score: number | null
          research_score: number | null
          service_score: number | null
          overall_score: number | null
          comments: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          faculty_id?: string | null
          faculty_name: string
          evaluation_type: 'student_feedback' | 'peer_review' | 'self_assessment' | 'chairman_review'
          academic_year?: string
          semester?: number
          teaching_score?: number | null
          research_score?: number | null
          service_score?: number | null
          overall_score?: number | null
          comments?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          faculty_id?: string | null
          faculty_name?: string
          evaluation_type?: 'student_feedback' | 'peer_review' | 'self_assessment' | 'chairman_review'
          academic_year?: string
          semester?: number
          teaching_score?: number | null
          research_score?: number | null
          service_score?: number | null
          overall_score?: number | null
          comments?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      professional_development: {
        Row: {
          id: string
          faculty_id: string | null
          faculty_name: string
          title: string
          activity_type: 'conference' | 'workshop' | 'training_course' | 'seminar' | 'certification'
          provider: string
          location: string
          start_date: string | null
          end_date: string | null
          hours: number
          status: 'planned' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          faculty_id?: string | null
          faculty_name: string
          title: string
          activity_type: 'conference' | 'workshop' | 'training_course' | 'seminar' | 'certification'
          provider?: string
          location?: string
          start_date?: string | null
          end_date?: string | null
          hours?: number
          status?: 'planned' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          faculty_id?: string | null
          faculty_name?: string
          title?: string
          activity_type?: 'conference' | 'workshop' | 'training_course' | 'seminar' | 'certification'
          provider?: string
          location?: string
          start_date?: string | null
          end_date?: string | null
          hours?: number
          status?: 'planned' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string | null
        }
      }
      advising_sessions: {
        Row: {
          id: string
          student_id: string
          student_name: string
          advisor_id: string | null
          advisor_name: string
          session_date: string
          session_type: 'academic_plan' | 'academic_warning' | 'course_guidance' | 'career_advice' | 'general'
          notes: string
          action_items: string[]
          follow_up_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          student_name: string
          advisor_id?: string | null
          advisor_name: string
          session_date?: string
          session_type?: 'academic_plan' | 'academic_warning' | 'course_guidance' | 'career_advice' | 'general'
          notes?: string
          action_items?: string[]
          follow_up_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          student_name?: string
          advisor_id?: string | null
          advisor_name?: string
          session_date?: string
          session_type?: 'academic_plan' | 'academic_warning' | 'course_guidance' | 'career_advice' | 'general'
          notes?: string
          action_items?: string[]
          follow_up_date?: string | null
          created_at?: string
        }
      }
      field_training: {
        Row: {
          id: string
          student_id: string
          student_name: string
          organization_name: string
          supervisor_name: string
          supervisor_contact: string
          start_date: string | null
          end_date: string | null
          training_field: string
          status: 'planned' | 'in_progress' | 'completed' | 'failed'
          supervisor_rating: number | null
          advisor_rating: number | null
          report_submitted: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          student_name: string
          organization_name: string
          supervisor_name?: string
          supervisor_contact?: string
          start_date?: string | null
          end_date?: string | null
          training_field?: string
          status?: 'planned' | 'in_progress' | 'completed' | 'failed'
          supervisor_rating?: number | null
          advisor_rating?: number | null
          report_submitted?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          student_name?: string
          organization_name?: string
          supervisor_name?: string
          supervisor_contact?: string
          start_date?: string | null
          end_date?: string | null
          training_field?: string
          status?: 'planned' | 'in_progress' | 'completed' | 'failed'
          supervisor_rating?: number | null
          advisor_rating?: number | null
          report_submitted?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      graduation_projects: {
        Row: {
          id: string
          student_id: string
          student_name: string
          title: string
          description: string
          supervisor_id: string | null
          supervisor_name: string
          project_type: 'research' | 'software' | 'system' | 'theoretical'
          status: 'proposed' | 'approved' | 'in_progress' | 'submitted' | 'defended' | 'passed' | 'failed'
          grade: string | null
          submission_date: string | null
          defense_date: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          student_name: string
          title: string
          description?: string
          supervisor_id?: string | null
          supervisor_name: string
          project_type?: 'research' | 'software' | 'system' | 'theoretical'
          status?: 'proposed' | 'approved' | 'in_progress' | 'submitted' | 'defended' | 'passed' | 'failed'
          grade?: string | null
          submission_date?: string | null
          defense_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          student_name?: string
          title?: string
          description?: string
          supervisor_id?: string | null
          supervisor_name?: string
          project_type?: 'research' | 'software' | 'system' | 'theoretical'
          status?: 'proposed' | 'approved' | 'in_progress' | 'submitted' | 'defended' | 'passed' | 'failed'
          grade?: string | null
          submission_date?: string | null
          defense_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      study_plans: {
        Row: {
          id: string
          program_name: string
          level: number
          total_hours: number
          description: string
          academic_year: string
          status: 'active' | 'draft' | 'archived'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          program_name: string
          level?: number
          total_hours?: number
          description?: string
          academic_year?: string
          status?: 'active' | 'draft' | 'archived'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          program_name?: string
          level?: number
          total_hours?: number
          description?: string
          academic_year?: string
          status?: 'active' | 'draft' | 'archived'
          created_at?: string
          updated_at?: string | null
        }
      }
      plan_courses: {
        Row: {
          id: string
          plan_id: string
          course_code: string
          semester_order: number
          course_type: 'required' | 'elective' | 'university_requirement' | 'college_requirement'
          prerequisite_codes: string[]
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          course_code: string
          semester_order?: number
          course_type?: 'required' | 'elective' | 'university_requirement' | 'college_requirement'
          prerequisite_codes?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          course_code?: string
          semester_order?: number
          course_type?: 'required' | 'elective' | 'university_requirement' | 'college_requirement'
          prerequisite_codes?: string[]
          created_at?: string
        }
      }
      course_descriptions: {
        Row: {
          id: string
          course_code: string
          description: string
          objectives: string[]
          topics: string[]
          textbooks: string[]
          references: string[]
          assessment_method: string
          updated_by: string
          version: number
          status: 'draft' | 'approved' | 'archived'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          course_code: string
          description?: string
          objectives?: string[]
          topics?: string[]
          textbooks?: string[]
          references?: string[]
          assessment_method?: string
          updated_by?: string
          version?: number
          status?: 'draft' | 'approved' | 'archived'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          course_code?: string
          description?: string
          objectives?: string[]
          topics?: string[]
          textbooks?: string[]
          references?: string[]
          assessment_method?: string
          updated_by?: string
          version?: number
          status?: 'draft' | 'approved' | 'archived'
          created_at?: string
          updated_at?: string | null
        }
      }
      course_sections: {
        Row: {
          id: string
          course_code: string
          section_number: number
          professor_name: string
          room_id: string | null
          room_name: string
          capacity: number
          enrolled: number
          schedule_days: string[]
          schedule_time: string
          semester: number
          academic_year: string
          status: 'open' | 'closed' | 'full'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          course_code: string
          section_number?: number
          professor_name: string
          room_id?: string | null
          room_name?: string
          capacity?: number
          enrolled?: number
          schedule_days?: string[]
          schedule_time?: string
          semester?: number
          academic_year?: string
          status?: 'open' | 'closed' | 'full'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          course_code?: string
          section_number?: number
          professor_name?: string
          room_id?: string | null
          room_name?: string
          capacity?: number
          enrolled?: number
          schedule_days?: string[]
          schedule_time?: string
          semester?: number
          academic_year?: string
          status?: 'open' | 'closed' | 'full'
          created_at?: string
          updated_at?: string | null
        }
      }
      room_bookings: {
        Row: {
          id: string
          room_id: string
          room_name: string
          booked_by: string
          booking_date: string
          start_time: string
          end_time: string
          purpose: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          room_name: string
          booked_by: string
          booking_date: string
          start_time: string
          end_time: string
          purpose?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          room_name?: string
          booked_by?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          purpose?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at?: string
          updated_at?: string | null
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
      student_status: 'active' | 'probation' | 'withdrawn' | 'graduated' | 'suspended'
      academic_rank: 'professor' | 'associate_professor' | 'assistant_professor' | 'lecturer' | 'teaching_assistant'
      room_type: 'lecture_hall' | 'lab' | 'meeting_room' | 'office' | 'tutorial'
      session_type: 'lecture' | 'lab' | 'tutorial'
      day_of_week: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
      evaluation_type: 'student_feedback' | 'peer_review' | 'self_assessment' | 'chairman_review'
      dev_activity_type: 'conference' | 'workshop' | 'training_course' | 'seminar' | 'certification'
      dev_status: 'planned' | 'completed' | 'cancelled'
      advising_type: 'academic_plan' | 'academic_warning' | 'course_guidance' | 'career_advice' | 'general'
      training_status: 'planned' | 'in_progress' | 'completed' | 'failed'
      project_type: 'research' | 'software' | 'system' | 'theoretical'
      project_status: 'proposed' | 'approved' | 'in_progress' | 'submitted' | 'defended' | 'passed' | 'failed'
      plan_status: 'active' | 'draft' | 'archived'
      course_type: 'required' | 'elective' | 'university_requirement' | 'college_requirement'
      description_status: 'draft' | 'approved' | 'archived'
      section_status: 'open' | 'closed' | 'full'
      booking_status: 'pending' | 'approved' | 'rejected' | 'cancelled'
    }
  }
}
