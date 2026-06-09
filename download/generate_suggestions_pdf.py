#!/usr/bin/env python3
"""
Generate Arabic PDF document with system improvement suggestions.
Uses ReportLab with arabic_reshaper and python-bidi for RTL support.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
import arabic_reshaper
from bidi.algorithm import get_display

# ── Font Registration ──────────────────────────────────────────────────────
FONT_DIR = '/usr/share/fonts/truetype/dejavu/'
FONT_BODY = FONT_DIR + 'DejaVuSans.ttf'
FONT_BOLD = FONT_DIR + 'DejaVuSans-Bold.ttf'

pdfmetrics.registerFont(TTFont('DejaVu', FONT_BODY))
pdfmetrics.registerFont(TTFont('DejaVuBold', FONT_BOLD))

# ── Color Palette ──────────────────────────────────────────────────────────
PRIMARY = HexColor('#1a237e')       # Deep indigo
SECONDARY = HexColor('#283593')     # Indigo
ACCENT = HexColor('#3f51b5')        # Lighter indigo
LIGHT_BG = HexColor('#e8eaf6')     # Very light indigo
RED_BADGE = HexColor('#c62828')    # Red for high priority
YELLOW_BADGE = HexColor('#f57f17') # Amber for medium priority
RED_BG = HexColor('#ffebee')       # Light red bg
YELLOW_BG = HexColor('#fff8e1')    # Light yellow bg
TEXT_DARK = HexColor('#212121')
TEXT_GRAY = HexColor('#616161')
BORDER_COLOR = HexColor('#c5cae9')
TABLE_HEADER_BG = HexColor('#1a237e')
TABLE_ALT_ROW = HexColor('#f5f5f5')
SECTION_LINE = HexColor('#7986cb')

# ── Arabic text helper ────────────────────────────────────────────────────
def ar(text):
    """Reshape and reorder Arabic text for PDF rendering."""
    if not text:
        return text
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

# ── Paragraph Styles ──────────────────────────────────────────────────────
def create_styles():
    styles = {}
    
    styles['cover_title'] = ParagraphStyle(
        'cover_title',
        fontName='DejaVuBold',
        fontSize=22,
        leading=32,
        alignment=TA_CENTER,
        textColor=PRIMARY,
        spaceAfter=12,
    )
    
    styles['cover_subtitle'] = ParagraphStyle(
        'cover_subtitle',
        fontName='DejaVu',
        fontSize=14,
        leading=22,
        alignment=TA_CENTER,
        textColor=TEXT_GRAY,
        spaceAfter=8,
    )
    
    styles['cover_date'] = ParagraphStyle(
        'cover_date',
        fontName='DejaVu',
        fontSize=12,
        leading=18,
        alignment=TA_CENTER,
        textColor=ACCENT,
    )
    
    styles['toc_title'] = ParagraphStyle(
        'toc_title',
        fontName='DejaVuBold',
        fontSize=18,
        leading=26,
        alignment=TA_RIGHT,
        textColor=PRIMARY,
        spaceAfter=16,
    )
    
    styles['toc_item'] = ParagraphStyle(
        'toc_item',
        fontName='DejaVu',
        fontSize=11,
        leading=20,
        alignment=TA_RIGHT,
        textColor=TEXT_DARK,
        rightIndent=10,
    )
    
    styles['section_number'] = ParagraphStyle(
        'section_number',
        fontName='DejaVuBold',
        fontSize=14,
        leading=20,
        alignment=TA_RIGHT,
        textColor=ACCENT,
        spaceAfter=4,
    )
    
    styles['section_title'] = ParagraphStyle(
        'section_title',
        fontName='DejaVuBold',
        fontSize=16,
        leading=24,
        alignment=TA_RIGHT,
        textColor=PRIMARY,
        spaceBefore=6,
        spaceAfter=8,
    )
    
    styles['subsection_title'] = ParagraphStyle(
        'subsection_title',
        fontName='DejaVuBold',
        fontSize=12,
        leading=18,
        alignment=TA_RIGHT,
        textColor=SECONDARY,
        spaceBefore=8,
        spaceAfter=4,
    )
    
    styles['body'] = ParagraphStyle(
        'body',
        fontName='DejaVu',
        fontSize=10,
        leading=16,
        alignment=TA_RIGHT,
        textColor=TEXT_DARK,
        rightIndent=4,
        spaceBefore=2,
        spaceAfter=2,
    )
    
    styles['body_indent'] = ParagraphStyle(
        'body_indent',
        fontName='DejaVu',
        fontSize=10,
        leading=16,
        alignment=TA_RIGHT,
        textColor=TEXT_DARK,
        rightIndent=16,
        spaceBefore=1,
        spaceAfter=1,
    )
    
    styles['bullet'] = ParagraphStyle(
        'bullet',
        fontName='DejaVu',
        fontSize=10,
        leading=16,
        alignment=TA_RIGHT,
        textColor=TEXT_DARK,
        rightIndent=20,
        spaceBefore=2,
        spaceAfter=2,
    )
    
    styles['priority_high'] = ParagraphStyle(
        'priority_high',
        fontName='DejaVuBold',
        fontSize=11,
        leading=16,
        alignment=TA_RIGHT,
        textColor=RED_BADGE,
        spaceBefore=6,
        spaceAfter=4,
    )
    
    styles['priority_medium'] = ParagraphStyle(
        'priority_medium',
        fontName='DejaVuBold',
        fontSize=11,
        leading=16,
        alignment=TA_RIGHT,
        textColor=YELLOW_BADGE,
        spaceBefore=6,
        spaceAfter=4,
    )
    
    styles['summary_title'] = ParagraphStyle(
        'summary_title',
        fontName='DejaVuBold',
        fontSize=18,
        leading=26,
        alignment=TA_RIGHT,
        textColor=PRIMARY,
        spaceAfter=12,
    )
    
    styles['footer_text'] = ParagraphStyle(
        'footer_text',
        fontName='DejaVu',
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=TEXT_GRAY,
    )

    styles['page_header'] = ParagraphStyle(
        'page_header',
        fontName='DejaVu',
        fontSize=8,
        leading=10,
        alignment=TA_RIGHT,
        textColor=TEXT_GRAY,
    )

    return styles

# ── Data for all 15 sections ──────────────────────────────────────────────
SECTIONS = [
    {
        'num': '1',
        'title': 'إدارة الطلبة',
        'en': 'Student Management',
        'priority': 'high',
        'exists': [
            'مكون إدارة بيانات الطلبة مع CRUD كامل عبر Supabase',
            'عرض السجل الأكاديمي مع حساب المعدل التراكمي',
            'تسجيل المقررات مع التحقق من الحد الأقصى (21 ساعة)',
            'نظام طلبات الطلاب مع حالات (معلّق، مقبول، مرفوض)',
            'أنواع شاملة: StudentProfile, EnrolledStudent, StudentStatus',
        ],
        'missing': [
            'لا يوجد بطاقة طالب شاملة تجمع كل البيانات في صفحة واحدة',
            'لا يوجد نظام GPA حسابي تلقائي من الدرجات التفصيلية',
            'لا يوجد نظام إنذار أكاديمي آلي يُفعَّل عند انخفاض المعدل',
            'لا يوجد نظام الإنسحاب الرسمي من المقررات (Withdrawal/Drop)',
            'لا يوجد تصدير كشف درجات (Transcript) بصيغة PDF',
            'لا يوجد لوحة إحصائيات أداء الطلبة (نسب النجاح، التسرب)',
            'لا يوجد ربط التسجيل بالمتطلبات السابقة والخطة الدراسية',
            'لا يوجد تأريخ لتغييرات الحالة الأكاديمية (Audit Trail)',
        ],
        'suggestions': [
            'إنشاء واجهة موحّدة لبطاقة الطالب (Student Profile Dashboard) تجمع البيانات الشخصية والأكاديمية والمالية',
            'نظام حساب GPA تلقائي من درجات المقررات المسجلة مع تحديث فوري',
            'نظام إنذار أكاديمي تلقائي يُفعَّل عند انخفاض المعدل عن 2.0 مع إشعار للمرشد',
            'نظام إنسحاب رسمي مع سياسات رسوم الإنسحاب وآثار الحذف على المعدل',
            'كشف درجات رسمي PDF مع شعار الجامعة وتوقيع رئيس القسم',
            'لوحة إحصائيات أداء الطلبة بأبواب نجاح وتسرب ومعدلات تخرج',
        ],
    },
    {
        'num': '2',
        'title': 'الهيئة التدريسية',
        'en': 'Faculty Management',
        'priority': 'medium',
        'exists': [
            'ملفات الهيئة التدريسية مع CRUD كامل (ملف أكاديمي، تقييم أداء، تطوير مهني)',
            'جدول التدريس الأسبوعي مع عرض الشُعب',
            'قائمة طلاب كل مقرر مع بيانات الدرجات والحضور',
            'لوحة طلبات الأساتذة (أكاديمي، إداري، تقني، مراجعة درجات)',
            'نظام درجات التقييم (5/5) مع متوسطات التدريس والبحث والخدمة',
        ],
        'missing': [
            'لا يوجد نظام توزيع الأعباء التدريسية (Teaching Load Balance)',
            'لا يوجد نظام إجازات دراسية (Sabbatical Leave)',
            'لا يوجد تتبع حضور الأساتذة',
            'لا يوجد ساعات مكتبية رسمية (Office Hours)',
            'لا يوجد تقييم 360 درجة (طالب + زميل + ذاتي + رئيس)',
            'لا يوجد نظام مكافآت وبدلات',
            'لا يوجد لوحة معلومات أداء مجمّعة لكل أستاذ',
        ],
        'suggestions': [
            'لوحة تحميل تدريسي مع أشرطة توزيع الأعباء وتنبيهات الحمل الزائد',
            'نظام تقييم 360 درجة يجمع تقييمات الطلاب والزملاء والرؤساء',
            'نظام إجازات دراسية مع جدولة تلقائية وتغطية التدريس',
            'نظام ساعات مكتبية مع حجز مواعيد إلكتروني للطلاب',
            'لوحة معلومات أداء مجمّعة لكل أستاذ (تدريس، بحث، خدمة مجتمعية)',
        ],
    },
    {
        'num': '3',
        'title': 'شؤون الموظفين',
        'en': 'Employee Affairs',
        'priority': 'medium',
        'exists': [
            'لوحة تحكم الموظف مع 10 تبويات رئيسية',
            'نظام طلبات التحويل مع CRUD كامل عبر Supabase',
            'تحويل الموظف الإداري إلى تدريسي مع أتمتة إنشاء ملف أكاديمي',
            'مكون المهام (لكن بيانات ثابتة - hardcoded)',
            'عرض الإعلانات المستهدفة للموظفين',
        ],
        'missing': [
            'المهام ثابتة وليست مرتبطة بقاعدة بيانات',
            'لا يوجد نظام إجازات سنوية للموظفين',
            'لا يوجد تتبع حضور وانصراف الموظفين',
            'لا يوجد ملف تعريف شامل للموظف',
            'لا يوجد تقييم أداء للموظفين',
            'لا يوجد مسار ترقية وظيفي',
        ],
        'suggestions': [
            'ربط المهام بقاعدة البيانات مع نظام إشعارات وإعادة تعيين',
            'نظام إجازات سنوية مع رصيد متبقٍ وطلب إجازة إلكتروني',
            'نظام حضور وانصراف إلكتروني',
            'ملف تعريف شامل للموظف مع سجل المهام والإجازات',
            'نظام مسار ترقية وظيفي مع متطلبات واضحة',
        ],
    },
    {
        'num': '4',
        'title': 'إدارة المقررات',
        'en': 'Course Management',
        'priority': 'medium',
        'exists': [
            'توصيفات المقررات مع CRUD (وصف، أهداف، موضوعات، مراجع، طريقة تقييم)',
            'الشعب الدراسية مع عرض المعلومات',
            'الخطط الدراسية مع CRUD عبر API',
            'نظام تصنيف (إجباري، اختياري، متطلب جامعة، متطلب كلية)',
        ],
        'missing': [
            'لا يوجد نظام اعتماد المقررات (Approval Workflow)',
            'لا يوجد التحقق من المتطلبات السابقة عند التسجيل',
            'لا يوجد مقارنة بين الخطط الدراسية',
            'لا يوجد كتالوج مقررات شامل مع بحث متقدم',
            'لا يوجد نظام إدارة إصدارات التوصيف',
            'لا يوجد رابط بين الشعب والتعيينات التدريسية',
        ],
        'suggestions': [
            'نظام اعتماد المقررات عبر سير عمل متعدد الخطوات',
            'التحقق الآلي من المتطلبات السابقة عند التسجيل',
            'أداة مقارنة الخطط الدراسية مع عرض بصري',
            'كتالوج مقررات شامل مع بحث وفلترة متقدمة',
            'نظام إدارة إصدارات التوصيف مع أرشيف',
        ],
    },
    {
        'num': '5',
        'title': 'إدارة الجداول والقاعات',
        'en': 'Schedule & Room Management',
        'priority': 'high',
        'exists': [
            'عرض الجدول الدراسي الأسبوعي',
            'إدارة القاعات مع CRUD (8 قاعات بأنواع مختلفة)',
            'حجز القاعات مع CRUD',
            'نظام أيام RTL مع تسميات عربية',
        ],
        'missing': [
            'لا يوجد كشف تعارضات الجدول (Conflict Detection)',
            'لا يوجد نظام جدول الامتحانات',
            'لا يوجد تصدير الجدول إلى PDF/Excel',
            'لا يوجد واجهة سحب وإفلات (Drag & Drop)',
            'لا يوجد اقتراح قاعات مناسبة بناءً على السعة',
            'لا يوجد نظام تقويم أكاديمي (Academic Calendar)',
            'لا يوجد تتبع صيانة القاعات',
        ],
        'suggestions': [
            'كشف تعارضات آلي عند إضافة محاضرات (أستاذ، قاعة، فترة)',
            'نظام جدول امتحانات شامل مع توزيع ذكي',
            'تصدير الجدول بصيغة PDF مع شعار الجامعة',
            'واجهة سحب وإفلات لإدارة الجدول بسهولة',
            'نظام اقتراح القاعات المناسبة تلقائياً بناءً على السعة والنوع',
            'تقويم أكاديمي مع أحداث مهمة (بداية تسجيل، امتحانات، عطل)',
        ],
    },
    {
        'num': '6',
        'title': 'رئيس القسم',
        'en': 'Head of Department (HOD)',
        'priority': 'high',
        'exists': [
            'لوحة تحكم شاملة مع 11 تبويات',
            'إحصائيات عامة (عدد الأساتذة، الموظفين، الطلاب، المعدل)',
            'إدارة كاملة للطلبات والتحويلات مع قبول/رفض',
            'إدارة الصلاحيات لكل عضو',
            'سجل العمليات مع تصفية',
        ],
        'missing': [
            'لا يوجد لوحة مؤشرات أداء (KPI Dashboard)',
            'لا يوجد نظام تقارير دورية قابلة للتصدير',
            'لا يوجد مقارنة بين الفصول الدراسية',
            'لا يوجد نظام تصويت إلكتروني لاجتماعات المجلس',
            'لا يوجد تنبيهات ذكية لرئيس القسم',
            'لا يوجد تقرير خطة تشغيل القسم السنوية',
        ],
        'suggestions': [
            'لوحة مؤشرات KPI مع مقاييس الأداء الرئيسية',
            'نظام تقارير دورية قابل للتصدير (PDF/Excel)',
            'مقارنة أداء الفصول الدراسية (تسجيل، نجاح، معدلات)',
            'نظام تصويت إلكتروني لاجتماعات مجلس القسم',
            'نظام تنبيهات ذكية (أزمات، إنذارات، مواعيد مهمة)',
        ],
    },
    {
        'num': '7',
        'title': 'التسجيل المركزي',
        'en': 'Central Registration',
        'priority': 'high',
        'exists': [
            'تسجيل المقررات مع تحقق من الحد الأقصى',
            'عرض الشعب المتاحة والخطط الدراسية',
            'السجل الأكاديمي مع حساب المعدل',
        ],
        'missing': [
            'لا يوجد نظام فترات تسجيل (Registration Periods)',
            'لا يوجد نظام أولوية تسجيل حسب الأقدمية أو GPA',
            'لا يوجد قائمة انتظار (Waitlist) للشعب المكتملة',
            'لا يوجد نظام إسقاط المقررات (Course Drop)',
            'لا يوجد تأكيد تسجيل ثنائي',
            'لا يوجد ربط بين التسجيل والخطة الدراسية',
        ],
        'suggestions': [
            'نظام فترات تسجيل مع تحديد مواعيد فتح/إغلاق',
            'نظام أولوية تسجيل حسب GPA والفصل الدراسي',
            'نظام Waitlist مع إشعارات تلقائية عند توفر مكان',
            'نظام إسقاط المقررات مع رسوم وسياسات',
            'تأكيد تسجيل ثنائي مع عرض الجدول المبدئي',
            'ربط التسجيل بالخطة الدراسية تلقائياً',
        ],
    },
    {
        'num': '8',
        'title': 'التوجيه والإرشاد الأكاديمي',
        'en': 'Academic Advising',
        'priority': 'medium',
        'exists': [
            'جلسات الإرشاد مع CRUD كامل (5 أنواع: خطة دراسية، إنذار، مقررات، مهني، عام)',
            'نظام تصفية متعدد (بالمرشد، بالطالب، بالنوع)',
            'سجل زمني لجلسات الإرشاد لكل طالب',
            'نظام متابعة مع تاريخ ومهمات',
        ],
        'missing': [
            'لا يوجد تعيين مرشد أكاديمي تلقائي',
            'لا يوجد تنبيهات متابعة تلقائية',
            'لا يوجد خطة تخرج شخصية لكل طالب',
            'لا يوجد إحصائيات الإرشاد',
            'لا يوجد ربط مع الإنذارات الأكاديمية',
            'لا يوجد ملف إرشاد أكاديمي رقمي',
        ],
        'suggestions': [
            'تعيين مرشد أكاديمي تلقائي بناءً على التخصص',
            'نظام تنبيهات متابعة تلقائية عند اقتراب موعد المراجعة',
            'خطة تخرج شخصية لكل طالب مع تتبع التقدم',
            'إحصائيات الإرشاد وتقارير معدل الإنجاز',
            'نظام تنبيهات مدمج مع الإنذارات الأكاديمية',
        ],
    },
    {
        'num': '9',
        'title': 'التقارير والإحصائيات',
        'en': 'Reports & Analytics',
        'priority': 'high',
        'exists': [
            'بطاقات إحصائيات بسيطة في لوحات التحكم',
            'عرض توزيع المستخدمين كشرائط',
            'إحصائيات في مكونات الإرشاد والتطوير المهني',
        ],
        'missing': [
            'لا يوجد لوحات بيانية تفاعلية',
            'لا يوجد نظام تصدير تقارير',
            'لا يوجد تقارير أداء الطلبة (تسرب، رسوب، إنذار)',
            'لا يوجد تقارير أداء الهيئة التدريسية',
            'لا يوجد تقارير مقررات (تسجيل، نجاح)',
            'لا يوجد مقارنة زمنية',
            'لا يوجد تقارير دورية سنوية',
        ],
        'suggestions': [
            'لوحة مؤشرات تفاعلية مع مكتبة رسوم بيانية',
            'نظام تصدير تقارير PDF مع قوالب جاهزة',
            'تقارير أداء الطلبة (نسب النجاح، التسرب، الإنذارات)',
            'تقارير أداء الهيئة التدريسية (تقييمات، إنتاجية بحثية)',
            'تقارير مقررات (معدلات التسجيل والنجاح)',
            'نظام مقارنة زمنية بين الفصول الدراسية',
            'تقرير سنوي شامل للقسم مع تصدير',
        ],
    },
    {
        'num': '10',
        'title': 'الإشعارات والتنبيهات',
        'en': 'Notifications',
        'priority': 'high',
        'exists': [
            'مكون NotificationListener لإشعارات Toast',
            'إعلانات بنظام أولوية ومستهدفة',
            'إشعارات عند نجاح/فشل العمليات',
        ],
        'missing': [
            'لا يوجد إشعارات فورية (Push/WebSocket)',
            'لا يوجد أيقونة إشعارات مع عداد',
            'لا يوجد بريد إلكتروني آلي',
            'لا يوجد تنبيهات ذكية بناءً على الدور',
            'لا يوجد مركز إشعارات موحّد',
            'لا يوجد تكامل SMS',
        ],
        'suggestions': [
            'نظام إشعارات فورية عبر WebSocket/SSE',
            'أيقونة إشعارات مع عداد في شريط التنقل',
            'بريد إلكتروني آلي للطلبات والمواعيد المهمة',
            'تنبيهات ذكية (تغيير حالة، اقتراب تسجيل، مواعيد)',
            'مركز إشعارات موحّد مع سجل تاريخي',
        ],
    },
    {
        'num': '11',
        'title': 'سجل النشاطات والتدقيق',
        'en': 'Activity Log & Audit',
        'priority': 'high',
        'exists': [
            'مكون عرض السجل مع بحث وتصفية',
            'قاعدة بيانات activity_log مع Realtime',
            'تسجيل تلقائي لبعض العمليات',
        ],
        'missing': [
            'لا يوجد تسجيل شامل لجميع العمليات',
            'لا يوجد تدقيق متقدم (قبل/بعد)',
            'لا يوجد تصدير السجل',
            'لا يوجد تتبع IP',
            'لا يوجد نظام مصادقة',
        ],
        'suggestions': [
            'تسجيل تلقائي شامل لجميع عمليات CRUD',
            'نظام تدقيق متقدم مع لقطات قبل/بعد',
            'تصدير السجل إلى Excel/CSV/PDF',
            'تتبع IP وعنوان المستخدم',
            'ربط مع نظام المصادقة عند تطبيقه',
        ],
    },
    {
        'num': '12',
        'title': 'الأمان والمصادقة والصلاحيات',
        'en': 'Security & Permissions',
        'priority': 'high',
        'exists': [
            'مكون إدارة الصلاحيات (8 أنواع)',
            'Row Level Security (RLS) على جميع الجداول',
            'سياسات قراءة عامة',
        ],
        'missing': [
            'لا يوجد نظام مصادقة (Authentication)',
            'لا يوجد Session Management',
            'لا يوجد OAuth/SSO',
            'لا يوجد صفحة تسجيل دخول',
            'لا يوجد JWT',
            'سياسات RLS عامة جدًا',
            'لا يوجد RBAC حقيقي',
            'لا يوجد سياسة كلمات مرور',
        ],
        'suggestions': [
            'نظام تسجيل دخول كامل (صفحة Login/Register)',
            'إدارة جلسات المستخدم مع انتهاء تلقائي',
            'تشفير RLS وربط الصلاحيات بالأدوار فعلياً',
            'تكامل OAuth/SSO مع منصة الهوية الرقمية',
            'نظام JWT مع تحديث تلقائي',
            'سياسات كلمات مرور قوية',
            'نظام قفل الحساب بعد محاولات فاشلة',
            'تشفير البيانات الحساسة',
        ],
    },
    {
        'num': '13',
        'title': 'واجهة المستخدم والتجربة',
        'en': 'UI/UX',
        'priority': 'medium',
        'exists': [
            'تصميم RTL كامل',
            'واجهة Shadcn UI متجاوبة',
            '4 لوحات تحكم رئيسية',
            'نظام Tabs و Dialog و Toast',
            'تصميم Gradient Headers',
        ],
        'missing': [
            'لا يوجد Dark Mode',
            'لا يوجد Breadcrumb',
            'لا يوجد بحث شامل',
            'لا يوجد إعدادات المستخدم',
            'لا يوجد Onboarding',
            'لا يوجد PWA/Offline',
        ],
        'suggestions': [
            'Dark Mode مع حفظ التفضيل',
            'Breadcrumb للتنقل',
            'بحث شامل في جميع الكيانات',
            'صفحة إعدادات المستخدم',
            'Onboarding/تعليم للمستخدمين الجدد',
            'تطبيق PWA مع دعم Offline',
        ],
    },
    {
        'num': '14',
        'title': 'الأتمتة وسير العمل',
        'en': 'Automation & Workflow',
        'priority': 'high',
        'exists': [
            'نظام Realtime من Supabase',
            'مكون NotificationListener',
            'CRUD عبر API routes',
        ],
        'missing': [
            'لا يوجد محرك قواعد (Rules Engine)',
            'لا يوجد Workflow Engine',
            'لا يوجد Cron Jobs',
            'لا يوجد إشعارات تلقائية عند تغيير البيانات',
            'لا يوجد تقارير دوري تلقائي',
            'لا يوجد نسخ احتياطي تلقائي',
        ],
        'suggestions': [
            'محرك قواعد لإشعارات تلقائية',
            'نظام سير عمل للطلبات متعدد الخطوات',
            'نظام مهام مجدولة (Cron Jobs)',
            'تقارير دوري تلقائي (أسبوعي/شهري)',
            'نظام نسخ احتياطي تلقائي',
        ],
    },
    {
        'num': '15',
        'title': 'التخرج',
        'en': 'Graduation',
        'priority': 'medium',
        'exists': [
            'إدارة مشاريع التخرج مع سير عمل كامل',
            'نظام حالات المشروع (مقترح ← معتمد ← قيد التنفيذ ← مقدم ← مدافع ← ناجح/راسب)',
            'إدارة التدريب الميداني مع تقييم نجوم',
            'حالة "متخرج" في StudentStatus',
        ],
        'missing': [
            'لا يوجد فحص readiness للتخرج',
            'لا يوجد خطة تخرج شخصية',
            'لا يوجد إنشاء شهادات تخرج PDF',
            'لا يوجد نظام تصريح (Clearance)',
            'لا يوجد إحصائيات خريجين',
            'لا يوجد شبكة خريجين (Alumni)',
            'لا يوجد خطابات توصية إلكترونية',
        ],
        'suggestions': [
            'فحص readiness تلقائي (متطلبات مكتملة؟ GPA كافٍ؟ مشروع منجز؟)',
            'خطة تخرج شخصية لكل طالب مع تتبع التقدم',
            'إنشاء وتصدير شهادات تخرج PDF',
            'نظام تصريح (Clearance) للخريجين',
            'لوحة إحصائيات خريجين (أعداد، نسب نجاح)',
            'شبكة خريجين (Alumni Network)',
            'خطابات توصية إلكترونية',
        ],
    },
]

# ── Page number callback ──────────────────────────────────────────────────
def add_page_number(canvas, doc):
    """Add page number and header line to each page."""
    canvas.saveState()
    page_num = canvas.getPageNumber()
    
    # Header line
    canvas.setStrokeColor(BORDER_COLOR)
    canvas.setLineWidth(0.5)
    canvas.line(1.5*cm, A4[1] - 1.2*cm, A4[0] - 1.5*cm, A4[1] - 1.2*cm)
    
    # Header text (right side for Arabic)
    if page_num > 1:
        canvas.setFont('DejaVu', 8)
        canvas.setFillColor(TEXT_GRAY)
        canvas.drawRightString(A4[0] - 1.5*cm, A4[1] - 1.1*cm, ar('اقتراحات تطوير نظام إدارة القسم الأكاديمي'))
    
    # Footer line
    canvas.setStrokeColor(BORDER_COLOR)
    canvas.line(1.5*cm, 1.2*cm, A4[0] - 1.5*cm, 1.2*cm)
    
    # Page number (centered)
    canvas.setFont('DejaVu', 8)
    canvas.setFillColor(TEXT_GRAY)
    canvas.drawCentredString(A4[0]/2, 0.8*cm, str(page_num))
    
    canvas.restoreState()

# ── Build document ─────────────────────────────────────────────────────────
def build_pdf(output_path):
    styles = create_styles()
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.8*cm,
        bottomMargin=1.8*cm,
    )
    
    story = []
    W = A4[0] - 3*cm  # usable width
    
    # ═══════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 4*cm))
    
    # Decorative line
    story.append(HRFlowable(width="80%", thickness=2, color=PRIMARY, spaceAfter=20, spaceBefore=0))
    
    story.append(Paragraph(ar('اقتراحات تطوير نظام إدارة القسم الأكاديمي'), styles['cover_title']))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(ar('تقرير تحليل الفجوات والتوصيات'), styles['cover_subtitle']))
    story.append(Spacer(1, 0.3*cm))
    story.append(HRFlowable(width="80%", thickness=2, color=PRIMARY, spaceAfter=20, spaceBefore=0))
    
    story.append(Spacer(1, 2*cm))
    
    # Info box
    info_data = [
        [Paragraph(ar('التاريخ: يونيو 2026'), styles['cover_date']),
         Paragraph(ar('النوع: تقرير تحليلي'), styles['cover_date'])],
        [Paragraph(ar('النطاق: 15 عنصراً في النظام'), styles['cover_date']),
         Paragraph(ar('الحالة: مسودة أولية'), styles['cover_date'])],
    ]
    info_table = Table(info_data, colWidths=[W/2, W/2])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
    ]))
    story.append(info_table)
    
    story.append(PageBreak())
    
    # ═══════════════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Paragraph(ar('فهرس المحتويات'), styles['toc_title']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=16, spaceBefore=4))
    
    for sec in SECTIONS:
        priority_text = ar('أولوية عالية') if sec['priority'] == 'high' else ar('أولوية متوسطة')
        priority_color = RED_BADGE if sec['priority'] == 'high' else YELLOW_BADGE
        dot_line = '.' * 60
        
        toc_line = f'{ar(sec["title"])} ({sec["en"]}) {dot_line} {priority_text}'
        p = Paragraph(toc_line, styles['toc_item'])
        story.append(p)
    
    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8, spaceBefore=4))
    story.append(Paragraph(ar('صفحة الملخص النهائي'), styles['toc_item']))
    
    story.append(PageBreak())
    
    # ═══════════════════════════════════════════════════════════════════════
    # CONTENT SECTIONS
    # ═══════════════════════════════════════════════════════════════════════
    
    for idx, sec in enumerate(SECTIONS):
        # Add page break before sections 1, 5, 9, 13 for better readability
        if idx in [0, 4, 8, 12]:
            story.append(PageBreak())
        
        elements = []
        
        # Section number + title in a colored banner
        banner_data = [[
            Paragraph(ar(f'القسم {sec["num"]}'), ParagraphStyle(
                'sn', fontName='DejaVuBold', fontSize=10, leading=14,
                alignment=TA_RIGHT, textColor=white)),
            Paragraph(f'{ar(sec["title"])} ({sec["en"]})', ParagraphStyle(
                'st', fontName='DejaVuBold', fontSize=14, leading=20,
                alignment=TA_RIGHT, textColor=white)),
        ]]
        banner = Table(banner_data, colWidths=[W*0.25, W*0.75])
        banner.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), PRIMARY),
            ('TEXTCOLOR', (0,0), (-1,-1), white),
            ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('ROUNDEDCORNERS', [4, 4, 0, 0]),
        ]))
        elements.append(banner)
        
        # ── ما هو موجود حالياً ──
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(ar('ما هو موجود حالياً:'), styles['subsection_title']))
        
        for item in sec['exists']:
            bullet_text = f'• {ar(item)}'
            elements.append(Paragraph(bullet_text, styles['bullet']))
        
        # ── ما هو ناقص ──
        elements.append(Spacer(1, 4))
        
        missing_bg = RED_BG if sec['priority'] == 'high' else YELLOW_BG
        missing_border = RED_BADGE if sec['priority'] == 'high' else YELLOW_BADGE
        
        missing_header_data = [[Paragraph(ar('ما هو ناقص:'), ParagraphStyle(
            'mh', fontName='DejaVuBold', fontSize=11, leading=16,
            alignment=TA_RIGHT, textColor=missing_border))]]
        missing_header = Table(missing_header_data, colWidths=[W])
        missing_header.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), missing_bg),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 1, missing_border),
        ]))
        elements.append(missing_header)
        
        for item in sec['missing']:
            bullet_text = f'✗ {ar(item)}'
            elements.append(Paragraph(bullet_text, styles['bullet']))
        
        # ── اقتراحات الإضافة ──
        elements.append(Spacer(1, 4))
        
        sug_header_data = [[Paragraph(ar('اقتراحات الإضافة:'), ParagraphStyle(
            'sh', fontName='DejaVuBold', fontSize=11, leading=16,
            alignment=TA_RIGHT, textColor=HexColor('#2e7d32')))]]
        sug_header = Table(sug_header_data, colWidths=[W])
        sug_header.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), HexColor('#e8f5e9')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 1, HexColor('#66bb6a')),
        ]))
        elements.append(sug_header)
        
        for i, item in enumerate(sec['suggestions'], 1):
            sug_text = f'{i}. {ar(item)}'
            elements.append(Paragraph(sug_text, styles['bullet']))
        
        # ── Priority Badge ──
        elements.append(Spacer(1, 8))
        if sec['priority'] == 'high':
            priority_label = ar('الأولوية: عالية')
            badge_bg = RED_BADGE
        else:
            priority_label = ar('الأولوية: متوسطة')
            badge_bg = YELLOW_BADGE
        
        badge_data = [[Paragraph(priority_label, ParagraphStyle(
            'badge', fontName='DejaVuBold', fontSize=11, leading=16,
            alignment=TA_CENTER, textColor=white))]]
        badge = Table(badge_data, colWidths=[4*cm])
        badge.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), badge_bg),
            ('TEXTCOLOR', (0,0), (-1,-1), white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ]))
        # Right-align the badge
        badge_wrapper = Table([[badge, '']], colWidths=[4*cm, W - 4*cm])
        badge_wrapper.setStyle(TableStyle([
            ('ALIGN', (0,0), (0,0), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(badge_wrapper)
        
        # ── Separator ──
        elements.append(Spacer(1, 12))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=8, spaceBefore=4))
        
        # Add all elements to story
        for el in elements:
            story.append(el)
    
    # ═══════════════════════════════════════════════════════════════════════
    # SUMMARY PAGE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    
    story.append(Paragraph(ar('الملخص النهائي'), styles['summary_title']))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=16, spaceBefore=4))
    
    story.append(Paragraph(
        ar('يوضح الجدول التالي ملخصاً شاملاً لعناصر النظام الـ 15 مع مستوى الأولوية وعدد الميزات الناقصة والمقترحات:'),
        styles['body']
    ))
    story.append(Spacer(1, 12))
    
    # Build summary table
    header = [
        Paragraph(ar('الاقتراحات'), ParagraphStyle('th', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=white)),
        Paragraph(ar('النواقص'), ParagraphStyle('th', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=white)),
        Paragraph(ar('الأولوية'), ParagraphStyle('th', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=white)),
        Paragraph(ar('العنصر'), ParagraphStyle('th', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=white)),
        Paragraph('#', ParagraphStyle('th', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=white)),
    ]
    
    table_data = [header]
    
    total_missing = 0
    total_suggestions = 0
    
    for sec in SECTIONS:
        n_missing = len(sec['missing'])
        n_sug = len(sec['suggestions'])
        total_missing += n_missing
        total_suggestions += n_sug
        
        if sec['priority'] == 'high':
            priority_text = ar('عالية')
            priority_bg = RED_BG
            priority_color = RED_BADGE
        else:
            priority_text = ar('متوسطة')
            priority_bg = YELLOW_BG
            priority_color = YELLOW_BADGE
        
        row = [
            Paragraph(str(n_sug), ParagraphStyle('td', fontName='DejaVu', fontSize=8, leading=11, alignment=TA_CENTER, textColor=TEXT_DARK)),
            Paragraph(str(n_missing), ParagraphStyle('td', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=RED_BADGE)),
            Paragraph(priority_text, ParagraphStyle('td', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=priority_color, backColor=priority_bg)),
            Paragraph(f'{ar(sec["title"])}', ParagraphStyle('td', fontName='DejaVu', fontSize=8, leading=11, alignment=TA_RIGHT, textColor=TEXT_DARK)),
            Paragraph(sec['num'], ParagraphStyle('td', fontName='DejaVuBold', fontSize=9, leading=11, alignment=TA_CENTER, textColor=PRIMARY)),
        ]
        table_data.append(row)
    
    # Totals row
    totals_row = [
        Paragraph(f'<b>{total_suggestions}</b>', ParagraphStyle('tt', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=PRIMARY)),
        Paragraph(f'<b>{total_missing}</b>', ParagraphStyle('tt', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=RED_BADGE)),
        Paragraph('', ParagraphStyle('tt', fontName='DejaVu', fontSize=8, leading=11, alignment=TA_CENTER)),
        Paragraph(ar('المجموع'), ParagraphStyle('tt', fontName='DejaVuBold', fontSize=8, leading=11, alignment=TA_RIGHT, textColor=PRIMARY)),
        Paragraph('', ParagraphStyle('tt', fontName='DejaVu', fontSize=8, leading=11, alignment=TA_CENTER)),
    ]
    table_data.append(totals_row)
    
    col_widths = [W*0.12, W*0.12, W*0.15, W*0.48, W*0.13]
    summary_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    table_style_cmds = [
        # Header
        ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_BG),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('LINEBELOW', (0,0), (-1,0), 1.5, PRIMARY),
        # Totals row
        ('BACKGROUND', (0,-1), (-1,-1), LIGHT_BG),
        ('LINEABOVE', (0,-1), (-1,-1), 1.5, PRIMARY),
    ]
    
    # Alternating row colors
    for i in range(1, len(table_data) - 1):
        if i % 2 == 0:
            table_style_cmds.append(('BACKGROUND', (0,i), (-1,i), TABLE_ALT_ROW))
    
    summary_table.setStyle(TableStyle(table_style_cmds))
    story.append(summary_table)
    
    # ── Final notes ──
    story.append(Spacer(1, 1*cm))
    
    story.append(Paragraph(ar('ملاحظات ختامية:'), styles['subsection_title']))
    
    notes = [
        'يحتاج النظام إلى إضافة أكثر من 100 ميزة جديدة لتغطية الفجوات المحددة.',
        'أعلى أولوية هي نظام الأمان والمصادقة (القسم 12) حيث يجب تطبيقه أولاً.',
        'سبعة عناصر من أصل 15 حصلت على أولوية عالية وتحتاج إلى اهتمام فوري.',
        'من الضروري البدء بالبنية التحتية (أمان، أتمتة، إشعارات) قبل الميزات الوظيفية.',
        'يُوصى بتقسيم العمل إلى 4 مراحل حسب الأولوية والتبعيات.',
    ]
    
    for note in notes:
        story.append(Paragraph(f'• {ar(note)}', styles['bullet']))
    
    # ── Build ──
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f'PDF generated successfully: {output_path}')

# ── Main ───────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    output = '/home/z/my-project/download/system_improvement_suggestions.pdf'
    build_pdf(output)