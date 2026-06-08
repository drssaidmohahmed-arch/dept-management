-- =============================================================================
-- Migration 003: Employee Transfer System
-- Allows administrative employees to request transfer to department teaching roles
-- =============================================================================

CREATE TYPE transfer_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'cancelled');

CREATE TABLE employee_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  current_position TEXT NOT NULL,
  requested_rank TEXT NOT NULL DEFAULT 'lecturer',
  requested_specialization TEXT NOT NULL DEFAULT '',
  requested_qualification TEXT NOT NULL DEFAULT '',
  courses_to_teach TEXT[] DEFAULT '{}',
  reason TEXT NOT NULL DEFAULT '',
  supporting_docs TEXT[] DEFAULT '{}',
  status transfer_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  reviewed_by_name TEXT DEFAULT '',
  review_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_employee_transfers_employee_id ON employee_transfers(employee_id);
CREATE INDEX idx_employee_transfers_status ON employee_transfers(status);
CREATE INDEX idx_employee_transfers_created_at ON employee_transfers(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_employee_transfers_updated_at BEFORE UPDATE ON employee_transfers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE employee_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employee transfers are publicly readable" ON employee_transfers FOR SELECT USING (true);
CREATE POLICY "Service role full access on employee_transfers" ON employee_transfers FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE employee_transfers;

-- Add transfer history column to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS transfer_history TEXT[] DEFAULT '{}';

-- =============================================================================
-- SEED DATA: Sample Transfer Requests
-- =============================================================================

INSERT INTO employee_transfers (id, employee_id, employee_name, current_position, requested_rank, requested_specialization, requested_qualification, courses_to_teach, reason, status, created_at) VALUES
  ('99990001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000014', 'أ. سارة محمود زايد', 'مسؤول شؤون الطلاب', 'teaching_assistant', 'علوم الحاسب', 'ماجستير في تقنية المعلومات', ARRAY['CS101', 'IT101'], 'أمتلك خبرة عملية في تقنية المعلومات ورغبة في الانتقال للعمل الأكاديمي. حاصلة على درجة الماجستير وأعمل على أطروحة الدكتوراه حالياً.', 'pending', '2025-01-15T09:00:00.000Z'),
  ('99990001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000015', 'أ. عمر حسن الدوسري', 'مسؤول الشؤون الأكاديمية', 'lecturer', 'هندسة البرمجيات', 'ماجستير في هندسة البرمجيات', ARRAY['CS102', 'CS201'], 'لدي خبرة 5 سنوات في إدارة الشؤون الأكاديمية ودرجة الماجستير في هندسة البرمجيات. أرغب في المساهمة في التدريس وتطوير المناهج الدراسية.', 'under_review', '2025-01-10T14:00:00.000Z');
