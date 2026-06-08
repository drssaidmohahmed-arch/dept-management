-- =============================================================================
-- Migration 004: Activity Log & Department Workflow Enhancements
-- Adds activity tracking and improved department procedures
-- =============================================================================

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT DEFAULT '',
  performed_by UUID,
  performed_by_name TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_performed_by ON activity_log(performed_by);

-- RLS for activity log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity log is publicly readable" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Service role full access on activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);

-- Realtime for activity log
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Add advisor_id column to enrolled_students for linking students with faculty
ALTER TABLE enrolled_students ADD COLUMN IF NOT EXISTS advisor_id UUID REFERENCES members(id) ON DELETE SET NULL;

-- Add academic_year column to enrolled_students if not exists
ALTER TABLE enrolled_students ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2024-2025';

-- Add response column to student_requests for tracking approval/rejection responses
ALTER TABLE student_requests ADD COLUMN IF NOT EXISTS response TEXT DEFAULT '';
ALTER TABLE student_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE student_requests ADD COLUMN IF NOT EXISTS reviewed_by_name TEXT DEFAULT '';
ALTER TABLE student_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- =============================================================================
-- SEED DATA: Sample Activity Log Entries
-- =============================================================================

INSERT INTO activity_log (id, action, entity_type, entity_name, performed_by_name, details, created_at) VALUES
  ('88880001-0000-0000-0000-000000000001', 'transfer_request', 'employee_transfer', 'أ. سارة محمود زايد', 'أ. سارة محمود زايد', 'تقديم طلب تحويل إلى دور تدريسي - رتبة معيد', '2025-01-15T09:00:00.000Z'),
  ('88880002-0000-0000-0000-000000000002', 'transfer_review', 'employee_transfer', 'أ. عمر حسن الدوسري', 'رئيس القسم', 'تحويل طلب التحويل إلى قيد المراجعة', '2025-01-12T10:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000003', 'professor_request', 'professor_request', 'طلب تحديث المنهج الدراسي', 'د. أحمد محمد الشريف', 'طلب تحديث منهج مقرر هياكل البيانات', '2025-01-12T09:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000004', 'student_request', 'student_request', 'طلب تسجيل متأخر', 'ST-2024-001', 'طلب تسجيل متأخر لمقرر CS305', '2025-01-14T11:00:00.000Z'),
  ('88880005-0000-0000-0000-000000000005', 'announcement', 'announcement', 'اجتماع مجلس القسم', 'رئيس القسم', 'نشر إعلان عاجل عن اجتماع مجلس القسم', '2025-01-15T10:00:00.000Z');
