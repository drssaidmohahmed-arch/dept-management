#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive Arabic PDF Generator for Academic System Requirements Document.
Uses ReportLab with arabic_reshaper and python-bidi for proper RTL Arabic text.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem,
    Flowable, Frame, PageTemplate, BaseDocTemplate
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
import arabic_reshaper
from bidi.algorithm import get_display

# ============================================================
# FONT REGISTRATION
# ============================================================
FONT_DIR = "/usr/share/fonts/truetype/freefont"
FONT_REGULAR = os.path.join(FONT_DIR, "FreeSans.ttf")
FONT_BOLD = os.path.join(FONT_DIR, "FreeSansBold.ttf")
FONT_ITALIC = os.path.join(FONT_DIR, "FreeSansOblique.ttf")
FONT_BOLD_ITALIC = os.path.join(FONT_DIR, "FreeSansBoldOblique.ttf")

pdfmetrics.registerFont(TTFont('ArabicReg', FONT_REGULAR))
pdfmetrics.registerFont(TTFont('ArabicBold', FONT_BOLD))
pdfmetrics.registerFont(TTFont('ArabicItalic', FONT_ITALIC))
pdfmetrics.registerFont(TTFont('ArabicBoldItalic', FONT_BOLD_ITALIC))

pdfmetrics.registerFontFamily(
    'Arabic',
    normal='ArabicReg',
    bold='ArabicBold',
    italic='ArabicItalic',
    boldItalic='ArabicBoldItalic'
)

# ============================================================
# COLOR SCHEME
# ============================================================
PRIMARY_DARK = HexColor('#1a237e')      # Dark blue
PRIMARY_MED = HexColor('#283593')        # Medium blue
PRIMARY_LIGHT = HexColor('#c5cae9')      # Light blue
ACCENT = HexColor('#1565c0')             # Accent blue
ACCENT_LIGHT = HexColor('#e3f2fd')       # Light accent
TEXT_DARK = HexColor('#212121')           # Dark text
TEXT_MED = HexColor('#424242')            # Medium text
TEXT_LIGHT = HexColor('#757575')          # Light text
BG_LIGHT = HexColor('#f5f5f5')           # Light background
BG_TABLE = HexColor('#fafafa')           # Table background
BORDER_COLOR = HexColor('#bdbdbd')       # Border
SUCCESS = HexColor('#2e7d32')             # Green
WARNING = HexColor('#f57f17')             # Orange/Warning
ERROR = HexColor('#c62828')               # Red

# ============================================================
# ARABIC TEXT HELPER
# ============================================================
def ar(text):
    """Reshape and reorder Arabic text for proper RTL display."""
    if not text or text.strip() == '':
        return text
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

def ar_para(text):
    """Process Arabic text for use in paragraphs - handles mixed content."""
    lines = text.split('\n')
    processed = []
    for line in lines:
        line = line.strip()
        if line:
            reshaped = arabic_reshaper.reshape(line)
            bidi_text = get_display(reshaped)
            processed.append(bidi_text)
    return '<br/>'.join(processed)

# ============================================================
# CUSTOM FLOWABLES
# ============================================================
class SectionHeader(Flowable):
    """Custom flowable for section headers with decorative line."""
    def __init__(self, text, number=None, width=None):
        Flowable.__init__(self)
        self.text = ar(text)
        self.number = number
        self._width = width or 17*cm
        self.height = 1.2*cm

    def wrap(self, availWidth, availHeight):
        self._width = availWidth
        return (self._width, self.height)

    def draw(self):
        canvas = self.canv
        # Background bar
        canvas.setFillColor(PRIMARY_DARK)
        canvas.roundRect(0, 0, self._width, self.height, 3, fill=1, stroke=0)
        # Section number badge if provided
        text_x = self._width - 0.5*cm
        canvas.setFillColor(white)
        canvas.setFont('ArabicBold', 14)
        canvas.drawRightString(text_x, self.height/2 - 5, self.text)


class SubSectionHeader(Flowable):
    """Custom flowable for subsection headers."""
    def __init__(self, text, width=None):
        Flowable.__init__(self)
        self.text = ar(text)
        self._width = width or 17*cm
        self.height = 0.9*cm

    def wrap(self, availWidth, availHeight):
        self._width = availWidth
        return (self._width, self.height)

    def draw(self):
        canvas = self.canv
        canvas.setFillColor(PRIMARY_LIGHT)
        canvas.roundRect(0, 0, self._width, self.height, 2, fill=1, stroke=0)
        canvas.setFillColor(PRIMARY_DARK)
        canvas.setFont('ArabicBold', 12)
        canvas.drawRightString(self._width - 0.5*cm, self.height/2 - 4, self.text)


class SubSubSectionHeader(Flowable):
    """Custom flowable for sub-subsection headers."""
    def __init__(self, text, width=None):
        Flowable.__init__(self)
        self.text = ar(text)
        self._width = width or 17*cm
        self.height = 0.7*cm

    def wrap(self, availWidth, availHeight):
        self._width = availWidth
        return (self._width, self.height)

    def draw(self):
        canvas = self.canv
        canvas.setFillColor(ACCENT_LIGHT)
        canvas.roundRect(0, 0, self._width, self.height, 2, fill=1, stroke=0)
        canvas.setFillColor(ACCENT)
        canvas.setFont('ArabicBold', 11)
        canvas.drawRightString(self._width - 0.5*cm, self.height/2 - 4, self.text)


class AlgorithmBox(Flowable):
    """Custom flowable for algorithm/code boxes."""
    def __init__(self, text_lines, width=None):
        Flowable.__init__(self)
        self.lines = text_lines
        self._width = width or 16*cm
        line_count = len(text_lines)
        self.height = max(1.0*cm, line_count * 0.55*cm + 1.0*cm)

    def wrap(self, availWidth, availHeight):
        self._width = min(self._width, availWidth)
        return (self._width, self.height)

    def draw(self):
        canvas = self.canv
        # Background
        canvas.setFillColor(HexColor('#1e1e2e'))
        canvas.roundRect(0, 0, self._width, self.height, 5, fill=1, stroke=0)
        # Border
        canvas.setStrokeColor(ACCENT)
        canvas.setLineWidth(1.5)
        canvas.roundRect(0, 0, self._width, self.height, 5, fill=0, stroke=1)
        # Title bar
        canvas.setFillColor(ACCENT)
        canvas.roundRect(0, self.height - 0.5*cm, self._width, 0.5*cm, 5, fill=1, stroke=0)
        canvas.setFillColor(white)
        canvas.setFont('ArabicBold', 9)
        canvas.drawCentredString(self._width/2, self.height - 0.38*cm, ar("خوارزمية"))

        # Code lines
        y = self.height - 1.0*cm
        canvas.setFont('ArabicReg', 8.5)
        canvas.setFillColor(HexColor('#cdd6f4'))
        for line in self.lines:
            if y < 0.1*cm:
                break
            bidi_line = ar(line.strip()) if line.strip() else ''
            canvas.drawRightString(self._width - 0.5*cm, y, bidi_line)
            y -= 0.5*cm


class InfoBox(Flowable):
    """Colored information box."""
    def __init__(self, text, color=ACCENT_LIGHT, text_color=TEXT_DARK, width=None):
        Flowable.__init__(self)
        self.text = ar(text)
        self.color = color
        self.text_color = text_color
        self._width = width or 17*cm
        # Estimate height based on text length
        self.height = max(1.5*cm, min(4*cm, len(text) / 50 * cm))

    def wrap(self, availWidth, availHeight):
        self._width = availWidth
        return (self._width, self.height)

    def draw(self):
        canvas = self.canv
        canvas.setFillColor(self.color)
        canvas.roundRect(0, 0, self._width, self.height, 5, fill=1, stroke=0)
        canvas.setStrokeColor(PRIMARY_MED)
        canvas.setLineWidth(0.5)
        canvas.roundRect(0, 0, self._width, self.height, 5, fill=0, stroke=1)
        canvas.setFillColor(self.text_color)
        canvas.setFont('ArabicReg', 9)


class FlowchartBox(Flowable):
    """Text-based flowchart visualization."""
    def __init__(self, steps, width=None):
        Flowable.__init__(self)
        self.steps = steps  # list of (text, type) where type is 'process', 'decision', 'startend', 'arrow'
        self._width = width or 16*cm
        self.height = len(steps) * 1.0*cm + 1.0*cm

    def wrap(self, availWidth, availHeight):
        self._width = min(self._width, availWidth)
        return (self._width, self.height)

    def draw(self):
        canvas = self.canv
        y = self.height - 0.8*cm
        box_w = self._width * 0.7
        x_start = (self._width - box_w) / 2

        for text, stype in self.steps:
            canvas.setFont('ArabicReg', 8)
            disp_text = ar(text)
            tw = canvas.stringWidth(disp_text, 'ArabicReg', 8)
            bw = max(tw + 1.5*cm, box_w)

            if stype == 'process':
                canvas.setFillColor(HexColor('#e8eaf6'))
                canvas.setStrokeColor(PRIMARY_MED)
                canvas.setLineWidth(0.8)
                cx = (self._width - bw) / 2
                canvas.rect(cx, y - 0.1*cm, bw, 0.6*cm, fill=1, stroke=1)
                canvas.setFillColor(TEXT_DARK)
                canvas.drawCentredString(self._width/2, y + 0.05*cm, disp_text)
            elif stype == 'decision':
                canvas.setFillColor(HexColor('#fff3e0'))
                canvas.setStrokeColor(WARNING)
                canvas.setLineWidth(0.8)
                cx = self._width / 2
                # Diamond shape approximation
                canvas.setFillColor(HexColor('#fff3e0'))
                canvas.roundRect(cx - bw/2, y - 0.1*cm, bw, 0.6*cm, 3, fill=1, stroke=1)
                canvas.setFillColor(TEXT_DARK)
                canvas.drawCentredString(cx, y + 0.05*cm, disp_text)
            elif stype == 'startend':
                canvas.setFillColor(PRIMARY_DARK)
                canvas.setStrokeColor(PRIMARY_DARK)
                cx = (self._width - bw) / 2
                canvas.roundRect(cx, y - 0.1*cm, bw, 0.6*cm, 10, fill=1, stroke=1)
                canvas.setFillColor(white)
                canvas.drawCentredString(self._width/2, y + 0.05*cm, disp_text)
            elif stype == 'success':
                canvas.setFillColor(HexColor('#e8f5e9'))
                canvas.setStrokeColor(SUCCESS)
                canvas.setLineWidth(0.8)
                cx = (self._width - bw) / 2
                canvas.rect(cx, y - 0.1*cm, bw, 0.6*cm, fill=1, stroke=1)
                canvas.setFillColor(SUCCESS)
                canvas.drawCentredString(self._width/2, y + 0.05*cm, disp_text)
            elif stype == 'error':
                canvas.setFillColor(HexColor('#ffebee'))
                canvas.setStrokeColor(ERROR)
                canvas.setLineWidth(0.8)
                cx = (self._width - bw) / 2
                canvas.rect(cx, y - 0.1*cm, bw, 0.6*cm, fill=1, stroke=1)
                canvas.setFillColor(ERROR)
                canvas.drawCentredString(self._width/2, y + 0.05*cm, disp_text)

            y -= 1.0*cm


# ============================================================
# STYLES
# ============================================================
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'ArabicTitle', parent=styles['Title'],
    fontName='ArabicBold', fontSize=22, leading=30,
    alignment=TA_RIGHT, textColor=white,
    spaceAfter=10
)

style_subtitle = ParagraphStyle(
    'ArabicSubtitle', parent=styles['Normal'],
    fontName='ArabicReg', fontSize=13, leading=18,
    alignment=TA_RIGHT, textColor=PRIMARY_LIGHT,
    spaceAfter=8
)

style_body = ParagraphStyle(
    'ArabicBody', parent=styles['Normal'],
    fontName='ArabicReg', fontSize=10, leading=16,
    alignment=TA_RIGHT, textColor=TEXT_DARK,
    spaceAfter=6, spaceBefore=2,
    rightIndent=0
)

style_body_justified = ParagraphStyle(
    'ArabicBodyJust', parent=style_body,
    alignment=TA_JUSTIFY,
)

style_bullet = ParagraphStyle(
    'ArabicBullet', parent=style_body,
    fontName='ArabicReg', fontSize=10, leading=15,
    alignment=TA_RIGHT, textColor=TEXT_MED,
    rightIndent=15, spaceAfter=4,
    bulletFontName='ArabicReg', bulletFontSize=10,
    bulletIndent=5
)

style_small = ParagraphStyle(
    'ArabicSmall', parent=style_body,
    fontSize=8.5, leading=13, textColor=TEXT_MED,
    spaceAfter=3
)

style_toc = ParagraphStyle(
    'ArabicTOC', parent=styles['Normal'],
    fontName='ArabicReg', fontSize=11, leading=20,
    alignment=TA_RIGHT, textColor=TEXT_DARK,
    spaceAfter=4, rightIndent=20
)

style_toc_section = ParagraphStyle(
    'ArabicTOCSection', parent=styles['Normal'],
    fontName='ArabicBold', fontSize=11, leading=22,
    alignment=TA_RIGHT, textColor=PRIMARY_DARK,
    spaceAfter=6, rightIndent=10
)

style_entity_name = ParagraphStyle(
    'EntityName', parent=styles['Normal'],
    fontName='ArabicBold', fontSize=11, leading=15,
    alignment=TA_RIGHT, textColor=ACCENT,
    spaceAfter=3, spaceBefore=6
)

style_table_header = ParagraphStyle(
    'TableHeader', parent=styles['Normal'],
    fontName='ArabicBold', fontSize=9, leading=12,
    alignment=TA_CENTER, textColor=white,
)

style_table_cell = ParagraphStyle(
    'TableCell', parent=styles['Normal'],
    fontName='ArabicReg', fontSize=8.5, leading=11,
    alignment=TA_CENTER, textColor=TEXT_DARK,
)

style_table_cell_right = ParagraphStyle(
    'TableCellR', parent=style_table_cell,
    alignment=TA_RIGHT,
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================
def make_body(text):
    """Create body paragraph from Arabic text."""
    return Paragraph(ar_para(text), style_body_justified)

def make_bullet(text):
    """Create bullet point from Arabic text."""
    return Paragraph(ar('● ' + text), style_bullet)

def make_numbered(num, text):
    """Create numbered item."""
    return Paragraph(ar(f'{num}. {text}'), style_bullet)

def spacer(h=0.3):
    return Spacer(1, h*cm)

def divider():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=8, spaceBefore=8)

def make_entity_table(columns_data):
    """Create a styled table for entity columns."""
    header = [
        Paragraph(ar('الوصف'), style_table_header),
        Paragraph(ar('النوع'), style_table_header),
        Paragraph(ar('اسم العمود'), style_table_header),
    ]
    rows = [header]
    for col_name, col_type, col_desc in columns_data:
        rows.append([
            Paragraph(ar(col_desc), style_table_cell_right),
            Paragraph(ar(col_type), style_table_cell),
            Paragraph(ar(col_name), style_table_cell),
        ])

    t = Table(rows, colWidths=[7*cm, 4*cm, 5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'ArabicBold'),
        ('FONTNAME', (0, 1), (-1, -1), 'ArabicReg'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BACKGROUND', (0, 1), (-1, -1), BG_TABLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_TABLE, white]),
        ('GRID', (0, 0), (-1, -1), 0.3, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t

def section_divider():
    """Major section divider."""
    return HRFlowable(width="100%", thickness=2, color=PRIMARY_DARK, spaceAfter=15, spaceBefore=15)


# ============================================================
# PAGE TEMPLATES
# ============================================================
class ArabicDocTemplate(BaseDocTemplate):
    """Custom document template with page numbers and headers."""

    def __init__(self, filename, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)
        page_w, page_h = A4
        frame = Frame(
            2*cm, 2*cm, page_w - 4*cm, page_h - 4.5*cm,
            id='main', topPadding=0.5*cm, bottomPadding=0.5*cm
        )
        # Cover page template (no header/footer)
        cover_frame = Frame(
            2*cm, 2*cm, page_w - 4*cm, page_h - 4*cm,
            id='cover', topPadding=0, bottomPadding=0
        )
        self.addPageTemplates([
            PageTemplate(id='cover', frames=[cover_frame], onPage=self._cover_page),
            PageTemplate(id='content', frames=[frame], onPage=self._content_page),
        ])
        self.page_count = 0

    def _cover_page(self, canvas, doc):
        pass  # No header/footer on cover

    def _content_page(self, canvas, doc):
        canvas.saveState()
        page_w, page_h = A4

        # Header line
        canvas.setStrokeColor(PRIMARY_DARK)
        canvas.setLineWidth(1)
        canvas.line(2*cm, page_h - 1.5*cm, page_w - 2*cm, page_h - 1.5*cm)

        # Header text
        canvas.setFont('ArabicBold', 8)
        canvas.setFillColor(PRIMARY_DARK)
        header_text = ar("وثيقة متطلبات نظام إدارة شؤون الطلبة")
        canvas.drawRightString(page_w - 2*cm, page_h - 1.35*cm, header_text)

        # Version
        canvas.setFont('ArabicReg', 7)
        canvas.setFillColor(TEXT_LIGHT)
        canvas.drawString(2*cm, page_h - 1.35*cm, "v1.0")

        # Footer line
        canvas.setStrokeColor(PRIMARY_DARK)
        canvas.line(2*cm, 1.5*cm, page_w - 2*cm, 1.5*cm)

        # Page number
        page_num = doc.page
        canvas.setFont('ArabicReg', 9)
        canvas.setFillColor(PRIMARY_MED)
        canvas.drawCentredString(page_w / 2, 1.0*cm, str(page_num))

        # Footer text
        canvas.setFont('ArabicReg', 7)
        canvas.setFillColor(TEXT_LIGHT)
        footer_text = ar("معهد أكاديمي - إدارة شؤون الطلبة")
        canvas.drawRightString(page_w - 2*cm, 1.0*cm, footer_text)

        canvas.restoreState()


# ============================================================
# DOCUMENT CONTENT GENERATION
# ============================================================
def build_document():
    output_path = "/home/z/my-project/download/academic_system_requirements.pdf"

    doc = ArabicDocTemplate(
        output_path,
        pagesize=A4,
        title=ar("وثيقة متطلبات نظام إدارة شؤون الطلبة"),
        author=ar("معهد أكاديمي"),
        subject=ar("متطلبات هندسة البرمجيات"),
    )

    story = []

    # ============================================================
    # COVER PAGE
    # ============================================================
    story.append(Spacer(1, 3*cm))

    # Cover decorative box
    cover_data = [
        [Spacer(1, 2*cm)],
        [Paragraph(ar("وثيقة متطلبات نظام إدارة شؤون الطلبة"), ParagraphStyle(
            'CoverTitle', fontName='ArabicBold', fontSize=20, leading=28,
            alignment=TA_CENTER, textColor=PRIMARY_DARK, spaceAfter=10
        ))],
        [Spacer(1, 0.3*cm)],
        [HRFlowable(width="80%", thickness=2, color=PRIMARY_DARK, spaceAfter=15, spaceBefore=5)],
        [Paragraph(ar("معهد أكاديمي"), ParagraphStyle(
            'CoverInst', fontName='ArabicBold', fontSize=14, leading=20,
            alignment=TA_CENTER, textColor=ACCENT, spaceAfter=8
        ))],
        [Paragraph(ar("نظام شامل من التسجيل الإلكتروني حتى التخرج"), ParagraphStyle(
            'CoverSub', fontName='ArabicReg', fontSize=12, leading=17,
            alignment=TA_CENTER, textColor=TEXT_MED, spaceAfter=20
        ))],
        [HRFlowable(width="60%", thickness=1, color=BORDER_COLOR, spaceAfter=20, spaceBefore=10)],
        [Spacer(1, 1.5*cm)],
        [Paragraph(ar("إصدار: 1.0"), ParagraphStyle(
            'CoverVer', fontName='ArabicReg', fontSize=10, leading=14,
            alignment=TA_CENTER, textColor=TEXT_MED, spaceAfter=5
        ))],
        [Paragraph(ar("التاريخ: يناير 2025"), ParagraphStyle(
            'CoverDate', fontName='ArabicReg', fontSize=10, leading=14,
            alignment=TA_CENTER, textColor=TEXT_MED, spaceAfter=5
        ))],
        [Paragraph(ar("الحالة: مسودة أولية"), ParagraphStyle(
            'CoverStatus', fontName='ArabicReg', fontSize=10, leading=14,
            alignment=TA_CENTER, textColor=TEXT_MED, spaceAfter=5
        ))],
        [Spacer(1, 2*cm)],
    ]

    cover_table = Table(cover_data, colWidths=[14*cm])
    cover_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 2, PRIMARY_DARK),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#f8f9ff')),
    ]))
    story.append(cover_table)

    story.append(PageBreak())

    # Switch to content template
    from reportlab.platypus import NextPageTemplate
    story.insert(-1, NextPageTemplate('content'))

    # ============================================================
    # TABLE OF CONTENTS
    # ============================================================
    story.append(SectionHeader("جدول المحتويات"))
    story.append(spacer(0.8))

    toc_items = [
        ("1", "مقدمة ونطاق النظام", True),
        ("2", "الكيانات الرئيسية والعلاقات", True),
        ("3", "خوارزميات منع التعارض", True),
        ("", "3.1 خوارزمية منع تعارض جدول الطالب", False),
        ("", "3.2 خوارزمية منع تعارض جدول الأستاذ", False),
        ("", "3.3 خوارزمية منع تعارض القاعات", False),
        ("", "3.4 خوارزمية منع تكرار التسجيل", False),
        ("", "3.5 خوارزمية التحقق من السعة", False),
        ("", "3.6 خوارزمية التحقق من المتطلب السابق", False),
        ("4", "مخطط سير عملية التسجيل الذاتي", True),
        ("5", "مخطط سير التخرج", True),
        ("6", "متطلبات واجهات المستخدم حسب الدور", True),
        ("", "6.1 واجهة الطالب", False),
        ("", "6.2 واجهة موظف التسجيل المركزي", False),
        ("", "6.3 واجهة رئيس القسم", False),
        ("", "6.4 واجهة الأستاذ", False),
        ("7", "قواعد العمل العامة", True),
    ]

    for num, title, is_section in toc_items:
        if is_section:
            text = f"{num}    {title}" if num else title
            story.append(Paragraph(ar(text), style_toc_section))
        else:
            story.append(Paragraph(ar(f"     {title}"), style_toc))

    story.append(PageBreak())

    # ============================================================
    # SECTION 1: INTRODUCTION AND SYSTEM SCOPE
    # ============================================================
    story.append(SectionHeader("القسم الأول: مقدمة ونطاق النظام"))
    story.append(spacer(0.5))

    story.append(SubSectionHeader("1.1 نظرة عامة على النظام"))
    story.append(spacer(0.3))

    story.append(make_body(
        "يهدف هذا النظام إلى تطوير وتنفيذ نظام إلكتروني شامل لإدارة شؤون الطلبة في المعهد الأكاديمي. "
        "يغطي النظام جميع المراحل الأكاديمية بدءا من التسجيل الإلكتروني للمقررات الدراسية وحتى إصدار وثائق التخرج "
        "بما في ذلك إدارة الخطط الدراسية والجداول الزمنية والمقررات والتقارير الأكاديمية. "
        "تم تصميم النظام وفق أفضل الممارسات في هندسة البرمجيات وأساليب تطوير الأنظمة المؤسسية، "
        "مع مراعاة متطلبات الأمان والأداء وسهولة الاستخدام وسعة التوسع."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "يعتمد النظام على بنية تحتية موحدة تربط بين الأطراف المختلفة في المعهد الأكاديمي، "
        "مما يسهل عملية تبادل المعلومات وتنسيق العمل بين الأقسام والإدارات المختلفة. "
        "كما يوفر النظام واجهات متعددة تناسب كل نوع من المستخدمين مع الحفاظ على تناسق البيانات "
        "ودقتها في جميع الأوقات. يتيح النظام أيضا توليد تقارير شاملة تساعد في اتخاذ القرارات الأكاديمية "
        "والإدارية بكفاءة عالية وشفافية تامة."
    ))
    story.append(spacer(0.3))

    story.append(SubSectionHeader("1.2 أهداف النظام"))
    story.append(spacer(0.3))

    objectives = [
        "توفير نظام إلكتروني متكامل لإدارة شؤون الطلبة يعمل على مدار الساعة",
        "أتمتة عملية التسجيل الإلكتروني للمقررات الدراسية مع التحقق الآلي من جميع الشروط والمتطلبات",
        "إدارة شاملة للخطط الدراسية والجداول الزمنية مع منع التعارضات آليا",
        "تسهيل عملية التخرج من خلال تدقيق آلي للشروط واعتماد إلكتروني متعدد المستويات",
        "توفير نظام إشعارات فوري يبقي جميع الأطراف على اطلاع دائم",
        "توليد تقارير إحصائية وأكاديمية شاملة ومحدثة",
        "ضمان أمان البيانات من خلال نظام صلاحيات متعدد المستويات وسجل مراجعة شامل",
        "تحسين تجربة المستخدم من خلال واجهات بسيطة وم intuituve لكل نوع من المستخدمين",
    ]
    for obj in objectives:
        story.append(make_bullet(obj))

    story.append(spacer(0.3))

    story.append(SubSectionHeader("1.3 نطاق النظام وحدوده"))
    story.append(spacer(0.3))

    story.append(make_body(
        "يشمل نطاق النظام الحالي جميع العمليات الأكاديمية المتعلقة بإدارة شؤون الطلبة في المعهد. "
        "يبدأ النطاق من مرحلة تسجيل الطالب في المعهد واستخراج رقمه الأكاديمي، "
        "مرورا بجميع الفصول الدراسية من حيث التسجيل في المقررات وتتبع الأداء الأكاديمي "
        "وحساب المعدلات التراكمية والفصلية، وانتهاء بعملية التخرج وإصدار الشهادات والكشوفات."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "لا يشمل النطاق الحالي إدارة الشؤون المالية كاملة مثل الرسوم الدراسية والمنح الدراسية، "
        "كما لا يغطي إدارة السكن الجامعي أو النقل أو الخدمات الطلابية الأخرى. "
        "ومع ذلك تم تصميم البنية التحتية للنظام بحيث تسمح بالتوسع المستقبلي لتشمل هذه الوظائف. "
        "كما يقتصر النظام على البيانات الأكاديمية ولا يتضمن إدارة المحتوى التعليمي أو منصات التعلم الإلكتروني."
    ))
    story.append(spacer(0.3))

    story.append(SubSectionHeader("1.4 الأدوار الرئيسية في النظام"))
    story.append(spacer(0.3))

    roles_data = [
        ("الطالب", "يمكنه تسجيل الدخول وعرض جداوله وتسجيل المقررات ومراجعة سجله الأكاديمي وتقديم طلب التخرج وإدارة إشعاراته"),
        ("موظف التسجيل المركزي", "يقوم بإدارة عمليات التسجيل على مستوى المعهد واعتماد التسجيلات ومراجعة طلبات التخرج النهائية وإدارة بيانات الطلاب"),
        ("رئيس القسم", "يشرف على الأقسام الأكاديمية ويعتمد الجداول والشعب ويراجع طلبات التخرج على مستوى القسم ويتابع أداء الأساتذة"),
        ("الأستاذ", "يدخل الدرجات ويدير المقررات المسندة إليه ويقدم طلبات متنوعة ويقوم بالإرشاد الأكاديمي للطلاب الموجهين له"),
    ]
    roles_table_data = [
        [Paragraph(ar('الصلاحيات والمهام'), style_table_header),
         Paragraph(ar('الدور'), style_table_header)]
    ]
    for role, desc in roles_data:
        roles_table_data.append([
            Paragraph(ar(desc), style_table_cell_right),
            Paragraph(ar(role), style_table_cell),
        ])

    roles_table = Table(roles_table_data, colWidths=[12*cm, 4*cm])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'ArabicBold'),
        ('FONTNAME', (0, 1), (-1, -1), 'ArabicReg'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_TABLE, white]),
        ('GRID', (0, 0), (-1, -1), 0.3, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(roles_table)
    story.append(spacer(0.3))

    story.append(SubSectionHeader("1.5 القدرات الرئيسية للنظام"))
    story.append(spacer(0.3))
    capabilities = [
        "تسجيل إلكتروني ذاتي مع تحقق آلي من التعارضات والمتطلبات السابقة والسعة",
        "إدارة شاملة للخطط الدراسية مع إمكانية تعديلها واعتمادها",
        "إنشاء الشعب الدراسية وجدولتها مع منع تعارضات المواعيد والقاعات والأساتذة",
        "حساب المعدلات الفصلية والتراكمية آليا مع إمكانية المراجعة",
        "تدقيق آلي لشروط التخرج مع تقرير تفصيلي بالنواقص",
        "نظام إشعارات فوري متعدد القنوات",
        "سجل مراجعة شامل يتتبع جميع العمليات والتعديلات",
        "لوحات تحكم إحصائية لكل دور من أدوار المستخدمين",
        "تقارير متنوعة وقابلة للتصدير بصيغ متعددة",
    ]
    for cap in capabilities:
        story.append(make_bullet(cap))

    story.append(PageBreak())

    # ============================================================
    # SECTION 2: MAIN ENTITIES AND RELATIONSHIPS
    # ============================================================
    story.append(SectionHeader("القسم الثاني: الكيانات الرئيسية والعلاقات"))
    story.append(spacer(0.5))

    story.append(make_body(
        "يصف هذا القسم جميع الكيانات الرئيسية في قاعدة بيانات النظام مع أعمدتها وعلاقاتها. "
        "تم تصميم مخطط قاعدة البيانات وفق نموذج علائقي متين يضمن سلامة البيانات وفعالية الاستعلامات. "
        "يتكون النظام من أكثر من عشرين كيانا رئيسيا مترابطا تغطي جميع جوانب العملية الأكاديمية. "
        "فيما يلي وصف تفصيلي لكل كيان مع أعمدته ونوع البيانات والعلاقات مع الكيانات الأخرى."
    ))
    story.append(spacer(0.5))

    # Entity 1: users
    story.append(SubSectionHeader("2.1 كيان المستخدمون (users)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يُعد هذا الكيان الجذر الرئيسي لجميع المستخدمين في النظام. يخزن بيانات المصادقة الأساسية "
        "مثل اسم المستخدم وكلمة المرور المشفرة، بالإضافة إلى تحديد دور المستخدم في النظام. "
        "كل مستخدم في النظام يجب أن يكون له سجل في هذا الكيان بغض النظر عن دوره الأكاديمي. "
        "يرتبط هذا الكيان بالعديد من الكيانات الأخرى مثل الطلاب والأساتذة والموظفين عبر علاقة واحد إلى واحد."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("اسم المستخدم", "VARCHAR(50) UNIQUE", "username"),
        ("كلمة المرور المشفرة", "VARCHAR(255)", "password_hash"),
        ("البريد الإلكتروني", "VARCHAR(100)", "email"),
        ("رقم الهاتف", "VARCHAR(20)", "phone"),
        ("الدور", "ENUM", "role"),
        ("حالة التفعيل", "BOOLEAN", "is_active"),
        ("تاريخ الإنشاء", "TIMESTAMP", "created_at"),
        ("آخر تسجيل دخول", "TIMESTAMP", "last_login"),
    ]))
    story.append(spacer(0.2))
    story.append(make_body("العلاقات: يرتبط بكيان الطلاب والأساتذة والموظفين عبر user_id كمفتاح أجنبي."))
    story.append(spacer(0.4))

    # Entity 2: students
    story.append(SubSectionHeader("2.2 كيان الطلاب (students)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن هذا الكيان جميع المعلومات الأكاديمية والشخصية للطلاب. يرتبط بكيان المستخدمين "
        "ويتضمن بيانات مثل الرقم الأكاديمي والاسم الكامل والرقم الوطني وتاريخ الميلاد والجنس "
        "والمرحلة الدراسية والتخصص والقسم والحالة الأكاديمية والمعدل التراكمي والساعات المنجزة. "
        "كما يتضمن معرف المرشد الأكاديمي وسنة التسجيل وتاريخ التخرج المتوقع أو الفعلي."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف المستخدم", "INTEGER FK→users", "user_id"),
        ("الرقم الأكاديمي", "VARCHAR(20) UNIQUE", "student_number"),
        ("الاسم الكامل", "VARCHAR(100)", "full_name"),
        ("الرقم الوطني", "VARCHAR(20) UNIQUE", "national_id"),
        ("تاريخ الميلاد", "DATE", "date_of_birth"),
        ("الجنس", "ENUM", "gender"),
        ("المرحلة الدراسية", "INTEGER", "level"),
        ("التخصص", "VARCHAR(50)", "major"),
        ("معرف القسم", "INTEGER FK→departments", "department_id"),
        ("حالة التسجيل", "ENUM", "enrollment_status"),
        ("المعدل التراكمي", "DECIMAL(3,2)", "gpa"),
        ("الساعات المنجزة", "INTEGER", "cumulative_hours"),
        ("معرف المرشد", "INTEGER FK→professors", "advisor_id"),
        ("سنة التسجيل", "INTEGER", "enrollment_year"),
        ("تاريخ التخرج", "DATE", "graduation_date"),
    ]))
    story.append(spacer(0.2))
    story.append(make_body("العلاقات: يرتبط بكيان المستخدمين والقسم والمرشد الأكاديمي. يرتبط أيضا بكيانات التسجيلات والسجلات الأكاديمية وطلبات التخرج والإشعارات."))
    story.append(spacer(0.4))

    # Entity 3: departments
    story.append(SubSectionHeader("2.3 كيان الأقسام (departments)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يمثل هذا الكيان الأقسام الأكاديمية في المعهد. يخزن اسم القسم ورمزه ومعرف رئيس القسم "
        "والبريد الإلكتروني للتواصل. يرتبط بالعديد من الكيانات كالطلاب والأساتذة والمقررات والخطط الدراسية. "
        "كل قسم يتبعه مجموعة من الأساتذة والطلاب والمقررات التي تقدم ضمن برنامج القسم."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("اسم القسم", "VARCHAR(100)", "name"),
        ("رمز القسم", "VARCHAR(10) UNIQUE", "code"),
        ("معرف رئيس القسم", "INTEGER FK→professors", "hod_id"),
        ("البريد الإلكتروني", "VARCHAR(100)", "contact_email"),
        ("تاريخ الإنشاء", "TIMESTAMP", "created_at"),
    ]))
    story.append(spacer(0.4))

    # Entity 4: professors
    story.append(SubSectionHeader("2.4 كيان الأساتذة (professors)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن بيانات الأساتذة الأكاديميين في المعهد. يتضمن معلومات الرتبة الأكاديمية والتخصص والمؤهل العلمي "
        "والحد الأقصى لساعات التدريس الأسبوعية وتاريخ التعيين وحالة النشاط. "
        "يرتبط بكيان المستخدمين للدخول إلى النظام وبكيان القسم الذي ينتمي إليه. "
        "كما يرتبط بالشعب الدراسية والجداول الزمنية والإرشاد الأكاديمي."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف المستخدم", "INTEGER FK→users", "user_id"),
        ("معرف العضو", "INTEGER FK→members", "member_id"),
        ("معرف القسم", "INTEGER FK→departments", "department_id"),
        ("الاسم الكامل", "VARCHAR(100)", "full_name"),
        ("الرتبة الأكاديمية", "ENUM", "rank"),
        ("التخصص", "VARCHAR(100)", "specialization"),
        ("المؤهل العلمي", "VARCHAR(100)", "qualification"),
        ("الحد الأقصى للساعات أسبوعيا", "INTEGER", "max_hours_per_week"),
        ("تاريخ التعيين", "DATE", "hire_date"),
        ("حالة النشاط", "BOOLEAN", "is_active"),
    ]))
    story.append(spacer(0.4))

    # Entity 5: employees
    story.append(SubSectionHeader("2.5 كيان الموظفون الإداريون (employees)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن بيانات الموظفين الإداريين العاملين في المعهد مثل موظفي التسجيل وشؤون الطلبة. "
        "يتضمن المنصب والصلاحيات الممنوحة والقسم الذي يعمل فيه الموظف. "
        "يرتبط بكيان المستخدمين للدخول إلى النظام وبكيان القسم التابع له."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف المستخدم", "INTEGER FK→users", "user_id"),
        ("معرف القسم", "INTEGER FK→departments", "department_id"),
        ("الاسم الكامل", "VARCHAR(100)", "full_name"),
        ("المنصب", "VARCHAR(50)", "position"),
        ("الصلاحيات", "JSON", "permissions"),
    ]))
    story.append(spacer(0.4))

    # Entity 6: courses
    story.append(SubSectionHeader("2.6 كيان المقررات الدراسية (courses)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن تفاصيل جميع المقررات الدراسية المعروضة في المعهد. يتضمن رمز المقرر واسمه "
        "وساعاته المعتمدة والمرحلة الدراسية ونوع المقرر ووصفه. يرتبط بالقسم الأكاديمي "
        "الذي يقدم المقرر وبجدول المتطلبات السابقة والخطط الدراسية."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("رمز المقرر", "VARCHAR(20) UNIQUE", "code"),
        ("اسم المقرر", "VARCHAR(100)", "name"),
        ("الساعات المعتمدة", "INTEGER", "credit_hours"),
        ("المرحلة الدراسية", "INTEGER", "semester_level"),
        ("نوع المقرر", "ENUM", "course_type"),
        ("معرف القسم", "INTEGER FK→departments", "department_id"),
        ("وصف المقرر", "TEXT", "description"),
    ]))
    story.append(spacer(0.4))

    # Entity 7: prerequisites
    story.append(SubSectionHeader("2.7 كيان المتطلبات السابقة (prerequisites)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يحدد المتطلبات السابقة لكل مقرر دراسي. يرتبط المقرر بالمتطلب السابق مع تحديد "
        "الحد الأدنى للدرجة المطلوبة في المتطلب. يُستخدم في عملية التحقق أثناء التسجيل "
        "لضمان أن الطالب قد اجتاز المتطلبات السابقة بنجاح قبل التسجيل في المقرر."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("رمز المقرر", "VARCHAR(20) FK→courses", "course_code"),
        ("رمز المتطلب السابق", "VARCHAR(20) FK→courses", "prerequisite_code"),
        ("الحد الأدنى للدرجة", "VARCHAR(5)", "min_grade"),
    ]))
    story.append(spacer(0.4))

    # Entity 8: study_plans
    story.append(SubSectionHeader("2.8 كيان الخطط الدراسية (study_plans)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن الخطط الدراسية المعتمدة لكل برنامج أكاديمي في المعهد. يتضمن اسم البرنامج "
        "وإجمالي الساعات المعتمدة والمرحلة والسنة الأكاديمية وحالة الخطة. "
        "ترتبط الخطة بالقسم وبمقررات الخطة التي تحدد المقررات المطلوبة في كل فصل."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("اسم البرنامج", "VARCHAR(100)", "program_name"),
        ("معرف القسم", "INTEGER FK→departments", "department_id"),
        ("إجمالي الساعات المعتمدة", "INTEGER", "total_credit_hours"),
        ("المرحلة", "INTEGER", "level"),
        ("السنة الأكاديمية", "INTEGER", "academic_year"),
        ("حالة الخطة", "ENUM", "status"),
    ]))
    story.append(spacer(0.4))

    # Entity 9: plan_courses
    story.append(SubSectionHeader("2.9 كيان مقررات الخطة (plan_courses)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يحدد المقررات الدراسية المضمنة في كل خطة دراسية مع ترتيبها الفصلي ونوعها. "
        "يرتبط بالخطة الدراسية والمقرر الدراسي. يُستخدم في التحقق من استيفاء شروط التخرج "
        "ومقارنة المقررات المنجزة بالخطة المعتمدة."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف الخطة", "INTEGER FK→study_plans", "plan_id"),
        ("رمز المقرر", "VARCHAR(20) FK→courses", "course_code"),
        ("ترتيب الفصل", "INTEGER", "semester_order"),
        ("نوع المقرر في الخطة", "ENUM", "course_type"),
    ]))
    story.append(spacer(0.4))

    # Entity 10: sections
    story.append(SubSectionHeader("2.10 كيان الشعب (sections)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يمثل الشعب الدراسية التي يُفتح فيها كل مقرر في فصل دراسي محدد. يتضمن رقم الشعب "
        "والأستاذ المسؤول والفصل والسنة الأكاديمية والسعة القصوى وعدد المسجلين والحالة. "
        "يرتبط بالمقرر الدراسي والأستاذ والجدول الزمني ويسجل فيه الطلاب."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("رمز المقرر", "VARCHAR(20) FK→courses", "course_code"),
        ("رقم الشعبة", "INTEGER", "section_number"),
        ("معرف الأستاذ", "INTEGER FK→professors", "professor_id"),
        ("الفصل الدراسي", "ENUM", "semester"),
        ("السنة الأكاديمية", "INTEGER", "academic_year"),
        ("السعة القصوى", "INTEGER", "capacity"),
        ("عدد المسجلين", "INTEGER", "enrolled_count"),
        ("حالة الشعبة", "ENUM", "status"),
    ]))
    story.append(spacer(0.4))

    # Entity 11: section_schedule
    story.append(SubSectionHeader("2.11 كيان جداول الشعب (section_schedule)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يحدد المواعيد الزمنية لكل شعبة دراسية. يتضمن يوم الأسبوع ووقت البداية والنهاية ومعرف القاعة. "
        "يُستخدم في خوارزميات منع التعارض لضمان عدم تداخل المواعيد. "
        "يرتبط بالشعبة الدراسية والقاعة."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف الشعبة", "INTEGER FK→sections", "section_id"),
        ("يوم الأسبوع", "ENUM", "day_of_week"),
        ("وقت البداية", "TIME", "start_time"),
        ("وقت النهاية", "TIME", "end_time"),
        ("معرف القاعة", "INTEGER FK→rooms", "room_id"),
    ]))
    story.append(spacer(0.4))

    # Entity 12: rooms
    story.append(SubSectionHeader("2.12 كيان القاعات (rooms)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن معلومات القاعات الدراسية المتاحة في المعهد. يتضمن اسم القاعة ورمزها والمبنى والطابق "
        "والسعة ونوع القاعة والمعدات المتاحة. يُستخدم في جدولة الشعب ومنع تعارض القاعات."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("اسم القاعة", "VARCHAR(50)", "name"),
        ("رمز القاعة", "VARCHAR(20) UNIQUE", "code"),
        ("المبنى", "VARCHAR(50)", "building"),
        ("الطابق", "INTEGER", "floor"),
        ("السعة", "INTEGER", "capacity"),
        ("نوع القاعة", "ENUM", "room_type"),
        ("المعدات", "JSON", "equipment"),
    ]))
    story.append(spacer(0.4))

    # Entity 13: registrations
    story.append(SubSectionHeader("2.13 كيان التسجيلات (registrations)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يسجل جميع عمليات تسجيل الطلاب في الشعب الدراسية. يتضمن معرف الطالب والشعبة والفصل "
        "والسنة الأكاديمية وتاريخ التسجيل والحالة ومعرف المُعتمد. يمر التسجيل بعدة حالات "
        "منها المعلق والمؤكد والملغي والمرفوض."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف الطالب", "INTEGER FK→students", "student_id"),
        ("معرف الشعبة", "INTEGER FK→sections", "section_id"),
        ("الفصل الدراسي", "ENUM", "semester"),
        ("السنة الأكاديمية", "INTEGER", "academic_year"),
        ("تاريخ التسجيل", "TIMESTAMP", "registration_date"),
        ("حالة التسجيل", "ENUM", "status"),
        ("المعتمد", "INTEGER FK→employees", "approved_by"),
    ]))
    story.append(spacer(0.4))

    # Entity 14: student_transcripts
    story.append(SubSectionHeader("2.14 كيان السجلات الأكاديمية (student_transcripts)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن السجلات الأكاديمية النهائية لكل طالب في كل مقرر. يتضمن الدرجة والنقاط المعادلة "
        "والساعات المعتمدة وحالة المقرر. يُستخدم لحساب المعدلات التراكمية والفصلية "
        "والتحقق من استيفاء المتطلبات السابقة وشروط التخرج."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف الطالب", "INTEGER FK→students", "student_id"),
        ("رمز المقرر", "VARCHAR(20) FK→courses", "course_code"),
        ("الفصل الدراسي", "ENUM", "semester"),
        ("الدرجة", "VARCHAR(5)", "grade"),
        ("النقاط", "DECIMAL(3,2)", "grade_points"),
        ("الساعات المعتمدة", "INTEGER", "credit_hours"),
        ("الحالة", "ENUM", "status"),
    ]))
    story.append(spacer(0.4))

    # Entity 15: academic_advisors
    story.append(SubSectionHeader("2.15 كيان المرشدون الأكاديميون (academic_advisors)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يربط الأساتذة بالطلاب كمُرشدين أكاديميين. يحدد الأستاذ المرشد لكل طالب "
        "وتاريخ تعيين الإرشاد. يساعد المرشد الأكاديمي الطالب في اختيار المقررات "
        "ومتابعة تقدمه الأكاديمي وتقديم التوجيه المناسب."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف الأستاذ", "INTEGER FK→professors", "professor_id"),
        ("معرف الطالب", "INTEGER FK→students", "student_id"),
        ("معرف القسم", "INTEGER FK→departments", "department_id"),
        ("تاريخ التعيين", "DATE", "assigned_date"),
    ]))
    story.append(spacer(0.4))

    # Entity 16: graduation_requests
    story.append(SubSectionHeader("2.16 كيان طلبات التخرج (graduation_requests)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن طلبات التخرج المقدمة من الطلاب مع جميع تفاصيل عملية الاعتماد متعددة المستويات. "
        "يتضمن المعدل والساعات المكتملة والمقررات الناقصة واعتماد القسم واعتماد التسجيل المركزي "
        "والحالة النهائية وتاريخ التخرج. يمر الطلب بعدة مراحل من التدقيق والاعتماد."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف الطالب", "INTEGER FK→students", "student_id"),
        ("معرف القسم", "INTEGER FK→departments", "department_id"),
        ("تاريخ الطلب", "DATE", "request_date"),
        ("المعدل عند التقديم", "DECIMAL(3,2)", "gpa_at_request"),
        ("الساعات المكتملة", "INTEGER", "completed_hours"),
        ("المقررات الناقصة", "JSON", "missing_courses"),
        ("موافقة القسم", "BOOLEAN", "department_approval"),
        ("معتمد من رئيس القسم", "INTEGER FK→professors", "hod_approved_by"),
        ("تاريخ اعتماد القسم", "TIMESTAMP", "hod_approved_at"),
        ("موافقة التسجيل", "BOOLEAN", "registration_approval"),
        ("معتمد من التسجيل", "INTEGER FK→employees", "registration_approved_by"),
        ("الحالة النهائية", "ENUM", "final_status"),
        ("تاريخ التخرج", "DATE", "graduation_date"),
    ]))
    story.append(spacer(0.4))

    # Entity 17: notifications
    story.append(SubSectionHeader("2.17 كيان الإشعارات (notifications)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يخزن جميع الإشعارات المرسلة للمستخدمين. يتضمن عنوان الإشعار والمحتوى والنوع "
        "وحالة القراءة وتاريخ الإنشاء. يُستخدم لإبقاء المستخدمين على اطلاع بجميع الأحداث "
        "المهمة مثل فتح التسجيل واعتماد الطلبات وتحديث الجداول."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف المستخدم", "INTEGER FK→users", "user_id"),
        ("العنوان", "VARCHAR(200)", "title"),
        ("المحتوى", "TEXT", "message"),
        ("النوع", "ENUM", "type"),
        ("تمت القراءة", "BOOLEAN", "is_read"),
        ("تاريخ الإنشاء", "TIMESTAMP", "created_at"),
    ]))
    story.append(spacer(0.4))

    # Entity 18: employee_transfers
    story.append(SubSectionHeader("2.18 كيان تحويلات الموظفين (employee_transfers)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يتابع طلبات تحويل الموظفين بين الأدوار والأقسام. يتضمن الدور الحالي والمطلوب "
        "والرتبة المطلوبة والتخصص والمقررات المطلوب تدريسها وسبب التحويل والحالة. "
        "يراجع رئيس القسم هذه الطلبات ويقرر قبولها أو رفضها."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("معرف الموظف", "INTEGER FK→employees", "employee_id"),
        ("الدور الحالي", "VARCHAR(50)", "current_role"),
        ("الدور المطلوب", "VARCHAR(50)", "requested_role"),
        ("الرتبة المطلوبة", "VARCHAR(50)", "requested_rank"),
        ("التخصص", "VARCHAR(100)", "specialization"),
        ("المقررات المراد تدريسها", "JSON", "courses_to_teach"),
        ("السبب", "TEXT", "reason"),
        ("الحالة", "ENUM", "status"),
        ("المراجع", "INTEGER FK→professors", "reviewed_by"),
        ("ملاحظات المراجعة", "TEXT", "review_notes"),
    ]))
    story.append(spacer(0.4))

    # Entity 19: audit_log
    story.append(SubSectionHeader("2.19 كيان سجل المراجعة (audit_log)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يسجل جميع العمليات المنفذة في النظام لأغراض المراجعة والمساءلة. يتضمن نوع العملية "
        "ونوع الكيان والمعرف والمنفذ والتفاصيل وتاريخ التنفيذ. يوفر شفافية كاملة "
        "يتيح تتبع أي تعديل أو عملية في النظام مع تحديد المسؤول عنها."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("نوع العملية", "VARCHAR(50)", "action"),
        ("نوع الكيان", "VARCHAR(50)", "entity_type"),
        ("معرف الكيان", "INTEGER", "entity_id"),
        ("المنفذ", "INTEGER FK→users", "performed_by"),
        ("التفاصيل", "JSON", "details"),
        ("تاريخ التنفيذ", "TIMESTAMP", "created_at"),
    ]))
    story.append(spacer(0.4))

    # Entity 20: semesters
    story.append(SubSectionHeader("2.20 كيان الفصول الدراسية (semesters)"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يحدد الفصول الدراسية المعتمدة في المعهد مع جميع التواريخ المهمة. يتضمن اسم الفصل "
        "والسنة الأكاديمية وتواريخ البداية والنهاية وفتح التسجيل وإغلاقه ونهاية فترة الإضافة والإسقاط. "
        "يُستخدم للتحكم في فترات التسجيل وتحديد الفصل الحالي."
    ))
    story.append(spacer(0.2))
    story.append(make_entity_table([
        ("المعرف الفريد", "INTEGER PK", "id"),
        ("اسم الفصل", "VARCHAR(50)", "name"),
        ("السنة الأكاديمية", "INTEGER", "academic_year"),
        ("تاريخ البداية", "DATE", "start_date"),
        ("تاريخ النهاية", "DATE", "end_date"),
        ("بداية التسجيل", "DATE", "registration_start"),
        ("نهاية التسجيل", "DATE", "registration_end"),
        ("نهاية الإضافة والإسقاط", "DATE", "add_drop_end"),
        ("الحالة", "ENUM", "status"),
    ]))
    story.append(spacer(0.4))

    # Relationship summary
    story.append(SubSectionHeader("ملخص العلاقات بين الكيانات"))
    story.append(spacer(0.3))
    story.append(make_body(
        "تعمل جميع الكيانات المذكورة أعلاه كنظام متكامل مترابط. تربط المفاتيح الأجنبية "
        "الكيانات ببعضها البعض لتشكيل مخطط علائقي متماسك. على سبيل المثال، يرتبط الطالب "
        "بالمستخدم للدخول وبالقسم للانتماء الأكاديمي وبالمرشد للتوجيه. كما يرتبط بالتسجيلات "
        "والسجلات الأكاديمية وطلبات التخرج والإشعارات. هذا التصميم يضمن سلامة البيانات "
        "ويسهل عملية الاستعلام والتقارير."
    ))

    story.append(PageBreak())

    # ============================================================
    # SECTION 3: CONFLICT PREVENTION ALGORITHMS
    # ============================================================
    story.append(SectionHeader("القسم الثالث: خوارزميات منع التعارض"))
    story.append(spacer(0.5))

    story.append(make_body(
        "يحتوي هذا القسم على وصف تفصيلي للخوارزميات المستخدمة في النظام لمنع التعارضات "
        "وضمان سلامة العمليات الأكاديمية. هذه الخوارزميات تعمل بشكل آلي في الخلفية "
        "أثناء عمليات التسجيل وفتح الشعب لضمان تجنب جميع أنواع التعارضات الممكنة."
    ))
    story.append(spacer(0.5))

    # Algorithm 3.1
    story.append(SubSectionHeader("3.1 خوارزمية منع تعارض جدول الطالب"))
    story.append(spacer(0.3))

    story.append(AlgorithmBox([
        "المدخلات: معرف الطالب (student_id)، معرف الشعبة الجديدة (section_id)",
        "الخطوة 1: استرجاع جميع تسجيلات الطالب في الفصل الحالي",
        "الخطوة 2: استرجاع جدول المواعيد للشعبة الجديدة (جميع الأيام والأوقات)",
        "الخطوة 3: لكل تسجيل موجود:",
        "  3.أ: استرجاع جدول المواعيد للشعبة المسجل فيها",
        "  3.ب: لكل يوم في جدول الشعبة الجديدة:",
        "    - إذا كان اليوم موجودا في جدول الشعبة الحالية:",
        "      - فحص التداخل الزمني: الأكبر(بداية1, بداية2) < الأصغر(نهاية1, نهاية2)",
        "      - إذا وجد تداخل ← إرجاع تعارض مع التفاصيل",
        "الخطوة 4: إرجاع لا يوجد تعارض",
    ]))
    story.append(spacer(0.3))

    story.append(make_body(
        "تعمل هذه الخوارزمية كخط دفاع أول لمنع تعارض جدول الطالب مع نفسه. عندما يحاول الطالب "
        "التسجيل في شعبة جديدة، يقوم النظام تلقائيا بفحص جميع الشعب المسجل فيها حاليا في نفس الفصل "
        "الدراسي ومقارنة جداولها الزمنية مع الجدول الزمني للشعبة المطلوبة. تتم المقارنة يوم بيوم "
        "وساعة بساعة باستخدام معادلة التداخل الزمني القياسية."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "تتضمن الخوارزمية عدة حالات حد يجب مراعاتها. أولا يجب التعامل مع المحاضرات التي تمتد "
        "على أكثر من فترة زمنية متتالية. ثانيا يجب مراعاة اختلاف أيام الأسبوع حيث قد تتقاطع "
        "محاضرة في يوم الأحد مع محاضرة أخرى في نفس اليوم. ثالثا يجب أن تتعامل الخوارزمية مع "
        "الحالات التي تكون فيها بداية أو نهاية المحاضرة متطابقة تماما حيث يُعتبر ذلك تعارضا. "
        "رابعا يجب أن تعمل الخوارزمية بكفاءة عالية حتى مع وجود مئات الطلاب والمقررات."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "من الناحية التقنية يُفضل تنفيذ هذه الخوارزمية على مستوى قاعدة البيانات باستخدام الاستعلامات "
        "المعقدة التي تفحص التداخل الزمني مباشرة لتقليل حجم البيانات المنقولة بين طبقة التطبيق "
        "وقاعدة البيانات. كما يُنصح بإضافة فهارس على أعمدة الأيام والأوقات في جدول section_schedule "
        "لتحسين أداء الاستعلامات. يتم تنفيذ هذا الفحص قبل أي فحص آخر في سلسلة التحقق من التسجيل."
    ))
    story.append(spacer(0.4))

    # Algorithm 3.2
    story.append(SubSectionHeader("3.2 خوارزمية منع تعارض جدول الأستاذ"))
    story.append(spacer(0.3))

    story.append(AlgorithmBox([
        "المدخلات: معرف الأستاذ (professor_id)، الجدول الجديد (يوم، بداية، نهاية)",
        "الخطوة 1: استرجاع جميع التكليفات التدريسية للأستاذ في نفس الفصل",
        "الخطوة 2: لكل تكليف موجود:",
        "  2.أ: استرجاع إدخالات الجدول الزمني",
        "  2.ب: مقارنة اليوم والتداخل الزمني",
        "  2.ج: إذا وجد تداخل ← إرجاع تعارض",
        "الخطوة 3: إرجاع لا يوجد تعارض",
    ]))
    story.append(spacer(0.3))

    story.append(make_body(
        "تضمن هذه الخوارزمية أن الأستاذ لا يُكلف بتدريس شعبين في نفس الوقت. تعمل الخوارزمية "
        "على مستويين: عند إنشاء شعبة جديدة وتعيين أستاذ لها يتأكد النظام من عدم وجود تعارض "
        "مع الجدول الحالي للأستاذ. كذلك عند نقل أستاذ من شعبة إلى أخرى يتم فحص التعارض في كلا الاتجاهين."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "تشمل الخوارزمية أيضا التحقق من الحد الأقصى لساعات التدريس الأسبوعية للأستاذ المحدد في ملفه. "
        "فإذا كان تعيين الشعبة الجديدة سيتجاوز الحد الأقصى يتم رفض العملية وإبلاغ رئيس القسم. "
        "كما تراعي الخوارزمية حالة الأستاذ النشط أو غير النشاط حيث لا يمكن تكليف أستاذ غير نشط "
        "بمقررات جديدة. يتم تسجيل جميع محاولات التكليف في سجل المراجعة للمتابعة."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "تُنفذ هذه الخوارزمية عادة عند فتح الشعب من قبل رئيس القسم أو موظف التسجيل. "
        "إذا حاول رئيس القسم تعيين أستاذ لشعبة يتعارض مع جدوله الحالي يعرض النظام رسالة واضحة "
        "تبين الشعب المتعارضة وأوقات التعارض بالتفصيل. يمكن للأستاذ أيضا الاطلاع على جدوله الكامل "
        "قبل قبول أي تكليف تدريسي جديد مما يضمن الشفافية في عملية التكليف."
    ))
    story.append(spacer(0.4))

    # Algorithm 3.3
    story.append(SubSectionHeader("3.3 خوارزمية منع تعارض القاعات"))
    story.append(spacer(0.3))

    story.append(AlgorithmBox([
        "المدخلات: معرف القاعة (room_id)، اليوم، بداية، نهاية، الفصل",
        "الخطوة 1: استرجاع جميع جداول الشعب في نفس القاعة واليوم والفصل",
        "الخطوة 2: لكل جدول موجود:",
        "  2.أ: فحص التداخل الزمني: الأكبر(بداية1, بداية2) < الأصغر(نهاية1, نهاية2)",
        "  2.ب: إذا وجد تداخل ← إرجاع تعارض",
        "الخطوة 3: إرجاع لا يوجد تعارض",
    ]))
    story.append(spacer(0.3))

    story.append(make_body(
        "تمنع هذه الخوارزمية تكرار حجز نفس القاعة في نفس الوقت لشعبين مختلفين. عند تعيين قاعة "
        "لشعبة دراسية يقوم النظام بالبحث عن جميع الشعب الأخرى المقررة في نفس القاعة في نفس الفصل "
        "الدراسي ثم يفحص التداخل الزمني في كل يوم على حدة. هذه الخوارزمية حاسمة لضمان عدم "
        "حدوث ازدحام أو تعارض في استخدام القاعات."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "تأخذ الخوارزمية في الاعتبار عدة عوامل إضافية. أولا تتحقق من أن سعة القاعة تكفي لعدد "
        "الطلاب المسجلين في الشعبة. ثانيا تتأكد من نوع القاعة حيث تتطلب بعض المقررات قاعات "
        "مجهزة بمعدات خاصة كالمختبرات أو قاعات الحاسب الآلي. ثالثا يتم مراعاة حالة القاعة "
        "من حيث الصلاحية والصيانة حيث لا يمكن حجز قاعة غير متاحة."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "لتعزيز الكفاءة يمكن تخزين جدول استخدام القاعات مؤقتا في الذاكرة المؤقتة وتحديثه "
        "عند كل عملية حجز أو إلغاء. هذا يقلل من العبء على قاعدة البيانات ويسرع عملية التحقق. "
        "كما يمكن تقديم واجهة رسومية تعرض خريطة القاعات واستخدامها الزمني مما يساعد المسؤولين "
        "في التخطيط الأمثل لتوزيع الشعب على القاعات المتاحة."
    ))
    story.append(spacer(0.4))

    # Algorithm 3.4
    story.append(SubSectionHeader("3.4 خوارزمية منع تكرار التسجيل"))
    story.append(spacer(0.3))

    story.append(AlgorithmBox([
        "المدخلات: معرف الطالب (student_id)، رمز المقرر (course_code)، الفصل",
        "الخطوة 1: البحث في جدول التسجيلات عن تسجيل نشط لنفس المقرر",
        "الخطوة 2: البحث في جدول السجلات الأكاديمية عن درجة نجاح سابقة",
        "الخطوة 3: إذا وجد تسجيل نشط ← إرجاع خطأ: مسجل مسبقا",
        "الخطوة 4: إذا وجدت درجة نجاح سابقة ← إرجاع خطأ: اجتاز المقرر سابقا",
        "الخطوة 5: إرجاع نجاح: يمكن التسجيل",
    ]))
    story.append(spacer(0.3))

    story.append(make_body(
        "تمنع هذه الخوارزمية تسجيل الطالب في نفس المقرر أكثر من مرة في نفس الفصل أو تسجيله "
        "في مقرر سبق له اجتيازه بنجاح. هذه الخوارزمية تحمي سلامة البيانات وتمنع الأخطاء البشرية "
        "الناتجة عن التسجيل المتكرر سواء كان عن قصد أو خطأ."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "هناك استثناء مهم وهو حالات تكرار المقرر حيث يسمح النظام للطالب بإعادة المقرر إذا كان "
        "قد رسب فيه أو حصل على درجة أقل من الحد المطلوب. في هذه الحالة يتم التحقق من أن الطالب "
        "ليس مسجلا في المقرر حاليا ويتم السماح بالتسجيل مع تحديث السجل الأكاديمي بالدرجة الأعلى. "
        "تتبع جميع محاولات التسجيل المتكرر في سجل المراجعة لتحليل الأنماط ومنع المحاولات المشبوهة."
    ))
    story.append(spacer(0.4))

    # Algorithm 3.5
    story.append(SubSectionHeader("3.5 خوارزمية التحقق من السعة"))
    story.append(spacer(0.3))

    story.append(AlgorithmBox([
        "المدخلات: معرف الشعبة (section_id)",
        "الخطوة 1: استرجاع السعة القصوى وعدد المسجلين الحاليين",
        "الخطوة 2: إذا كان عدد المسجلين أكبر من أو يساوي السعة ← إرجاع ممتلئ",
        "الخطوة 3: إرجاع متاح",
    ]))
    story.append(spacer(0.3))

    story.append(make_body(
        "تتحقق هذه الخوارزمية من وجود مقاعد شاغرة في الشعبة قبل السماح بالتسجيل. تعمل الخوارزمية "
        "بمقارنة عدد الطلاب المسجلين حاليا بالسعة القصوى للشعبة. إذا كانت الشعبة ممتلئة يتم رفض "
        "التسجيل وعرض رسالة واضحة للطالب. من المهم أن يتم هذا الفحص ضمن إطار المعاملات "
        "المحكمة لمنع حالة السباق حيث قد يحاول عدة طلاب التسجيل في نفس اللحظة."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "لضمان الدقة يُستخدم قفل على مستوى الصف في قاعدة البيانات عند تحديث عداد المسجلين. "
        "يتم أيضا عرض عدد المقاعد المتبقية في واجهة التسجيل لتمكين الطالب من اتخاذ قرار مبكر "
        "باختيار شعبة أخرى إذا كانت الشعبة المفضلة على وشك الامتلاء. يمكن أيضا تنفيذ نظام قوائم "
        "الانتظار حيث يمكن للطالب التسجيل في قائمة انتظار تتحول تلقائيا إلى تسجيل فعلي "
        "عند توفر مقعد شاغر نتيجة انسحاب طالب آخر."
    ))
    story.append(spacer(0.4))

    # Algorithm 3.6
    story.append(SubSectionHeader("3.6 خوارزمية التحقق من المتطلب السابق"))
    story.append(spacer(0.3))

    story.append(AlgorithmBox([
        "المدخلات: معرف الطالب (student_id)، رمز المقرر (course_code)",
        "الخطوة 1: استرجاع المتطلبات السابقة للمقرر من جدول المتطلبات",
        "الخطوة 2: لكل متطلب سابق:",
        "  2.أ: البحث في السجلات الأكاديمية عن درجة نجاح",
        "  2.ب: إذا لم توجد درجة نجاح ← إرجاع متطلب مفقود مع التفاصيل",
        "الخطوة 3: إرجاع جميع المتطلبات مستوفاة",
    ]))
    story.append(spacer(0.3))

    story.append(make_body(
        "تتحقق هذه الخوارزمية من أن الطالب قد اجتاز جميع المتطلبات السابقة للمقرر الذي يرغب "
        "في التسجيل فيه. يتم البحث في جدول المتطلبات السابقة لمعرفة المتطلبات المطلوبة ثم يتم "
        "فحص سجل الطالب الأكاديمي للتأكد من اجتياز كل متطلب بدرجة لا تقل عن الحد الأدنى المطلوب."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "تعالج الخوارزمية الحالات المتقدمة مثل المتطلبات المتسلسلة حيث قد يتطلب مقرر متطلبا "
        "سابقا الذي بدوره يتطلب متطلبا آخر. كما تتعامل مع المتطلبات الاختيارية حيث قد يكون "
        "أحد مقررين كافيا كمطلب سابق. في واجهة المستخدم تُظهر المقررات التي لا يستوفي الطالب "
        "متطلبها السابق بلون رمادي أو مع علامة تحذير مع شرح واضح للمتطلبات الناقصة. "
        "يمكن لرئيس القسم أيضا منح إعفاءات من المتطلبات السابقة في حالات استثنائية."
    ))
    story.append(spacer(0.4))

    # Summary of algorithm execution order
    story.append(SubSectionHeader("ترتيب تنفيذ خوارزميات التحقق أثناء التسجيل"))
    story.append(spacer(0.3))

    order_data = [
        ("1", "التحقق من فترة التسجيل المفتوحة", "التأكد من أن باب التسجيل مفتوح"),
        ("2", "منع تكرار التسجيل", "عدم تسجيل نفس المقرر مرتين"),
        ("3", "التحقق من المتطلب السابق", "اجتياز المتطلبات السابقة"),
        ("4", "منع تعارض جدول الطالب", "عدم تداخل المواعيد"),
        ("5", "التحقق من السعة", "وجود مقاعد شاغرة"),
        ("6", "تحديث العدادات", "زيادة عداد المسجلين"),
    ]

    order_table_data = [
        [Paragraph(ar('الوصف'), style_table_header),
         Paragraph(ar('الخطوة'), style_table_header),
         Paragraph(ar('الخوارزمية'), style_table_header)]
    ]
    for step, algo, desc in order_data:
        order_table_data.append([
            Paragraph(ar(desc), style_table_cell),
            Paragraph(ar(step), style_table_cell),
            Paragraph(ar(algo), style_table_cell),
        ])

    order_table = Table(order_table_data, colWidths=[7*cm, 2*cm, 7*cm])
    order_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'ArabicBold'),
        ('FONTNAME', (0, 1), (-1, -1), 'ArabicReg'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_TABLE, white]),
        ('GRID', (0, 0), (-1, -1), 0.3, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(order_table)

    story.append(PageBreak())

    # ============================================================
    # SECTION 4: SELF-REGISTRATION WORKFLOW
    # ============================================================
    story.append(SectionHeader("القسم الرابع: مخطط سير عملية التسجيل الذاتي"))
    story.append(spacer(0.5))

    story.append(make_body(
        "يصف هذا القسم المخطط التفصيلي الكامل لعملية التسجيل الذاتي في المقررات الدراسية. "
        "تبدأ العملية من لحظة فتح باب التسجيل من قبل الإدارة وتنتهي باعتماد التسجيل من قبل "
        "موظف التسجيل المركزي. تمر العملية بست مراحل رئيسية يتحقق في كل منها عدد من الشروط "
        "والخوارزميات الموضحة في القسم السابق."
    ))
    story.append(spacer(0.5))

    # Stage 1
    story.append(SubSubSectionHeader("المرحلة 1: فتح باب التسجيل"))
    story.append(spacer(0.2))
    story.append(make_body(
        "تبدأ العملية عندما يقوم المسؤول المختص بفتح باب التسجيل للفصل الدراسي القادم. "
        "يقوم النظام بتحديث حالة الفصل الدراسي إلى مفتوح وينشئ إشعارا آليا يُرسل إلى جميع "
        "الطلبة المسجلين في النظام لإبلاغهم بافتتاح فترة التسجيل. يتضمن الإشعار تواريخ البداية "
        "والنهاية وفترة الإضافة والإسقاط وأي تعليمات خاصة بالفصل القادم."
    ))
    story.append(spacer(0.3))

    # Stage 2
    story.append(SubSubSectionHeader("المرحلة 2: تسجيل دخول الطالب"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يقوم الطالب بتسجيل الدخول إلى النظام باستخدام اسم المستخدم وكلمة المرور. "
        "يتحقق النظام من هوية الطالب ومن دوره في النظام للتأكد من أنه طالب مسموح له بالتسجيل. "
        "إذا كانت بيانات الدخول صحيحة والدور صحيح يتم توجيهه إلى صفحة التسجيل الذاتي. "
        "يتم تسجيل عملية الدخول في سجل المراجعة مع تسجيل عنوان البروتوكول والوقت."
    ))
    story.append(spacer(0.3))

    # Stage 3
    story.append(SubSubSectionHeader("المرحلة 3: عرض المقررات المتاحة"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يعرض النظام قائمة بجميع المقررات الدراسية المتاحة في الفصل مع شعبها ومواعيدها "
        "وسعة كل شعبة وعدد المقاعد المتبقية. يتم تمييز المقررات التي لا يستوفي الطالب "
        "مطلبها السابق بلون رمادي مع عرض سبب عدم الأهلية. كما يُعرض الجدول الزمني الحالي "
        "للطالب بجانب قائمة المقررات لتسهيل عملية اختيار المقررات المتوافقة مع جدوله."
    ))
    story.append(spacer(0.2))
    story.append(make_body(
        "يمكن للطالب تصفية المقررات حسب القسم أو المرحلة الدراسية أو نوع المقرر. "
        "كما يمكنه البحث عن مقرر محدد باستخدام اسمه أو رمزه. كل شعبة تعرض معلومات تفصيلية "
        "تشمل اسم الأستاذ والمواعيد والقاعة وعدد المسجلين والمتبقي وحالة المتطلبات السابقة."
    ))
    story.append(spacer(0.3))

    # Stage 4
    story.append(SubSubSectionHeader("المرحلة 4: اختيار الطالب للمقررات والتحقق"))
    story.append(spacer(0.2))
    story.append(make_body(
        "عند اختيار الطالب لشعبة معينة ينفذ النظام سلسلة من الفحوصات الآلية بالترتيب التالي:"
    ))
    story.append(spacer(0.2))

    checks = [
        "خوارزمية منع تعارض جدول الطالب: التأكد من عدم تداخل المواعيد مع الشعب المسجل فيها حاليا",
        "خوارزمية منع تكرار التسجيل: التأكد من عدم تسجيل نفس المقرر مرة أخرى",
        "خوارزمية التحقق من السعة: التأكد من وجود مقاعد شاغرة في الشعبة",
        "خوارزمية التحقق من المتطلب السابق: التأكد من اجتياز جميع المتطلبات السابقة",
    ]
    for check in checks:
        story.append(make_bullet(check))

    story.append(spacer(0.2))
    story.append(make_body(
        "إذا نجحت جميع الفحوصات يتم إنشاء تسجيل مؤقت بحالة معلقة في قاعدة البيانات ويتم تحديث "
        "جدول الطالب المعروض على الشاشة. إذا فشل أي فحص يتم عرض رسالة خطأ واضحة ومفصلة "
        "تفسر سبب الرفض مع إرشادات حول الحلول الممكنة."
    ))
    story.append(spacer(0.3))

    # Stage 5
    story.append(SubSubSectionHeader("المرحلة 5: تأكيد التسجيل"))
    story.append(spacer(0.2))
    story.append(make_body(
        "بعد أن ينهي الطالب اختيار جميع المقررات المطلوبة يُعرض له الجدول النهائي الكامل "
        "للمراجعة. يمكنه تعديل الاختيارات قبل التأكيد النهائي. عند التأكيد يقوم النظام بتحويل "
        "جميع التسجيلات المعلقة إلى حالة مؤكدة وتحديث عداد المسجلين في كل شعبة. "
        "يتم إرسال إشعار تأكيد للطالب يتضمن ملخص التسجيل والجدول النهائي."
    ))
    story.append(spacer(0.3))

    # Stage 6
    story.append(SubSubSectionHeader("المرحلة 6: اعتماد التسجيل المركزي"))
    story.append(spacer(0.2))
    story.append(make_body(
        "في بعض الأنظمة الأكاديمية يتطلب التسجيل اعتمادا نهائيا من موظف التسجيل المركزي. "
        "يقوم الموظف بمراجعة التسجيلات وتأكيد صحتها أو رفضها مع إضافة ملاحظات في حالة الرفض. "
        "يتم إشعار الطالب بنتيجة الاعتماد سواء بالقبول أو الرفض مع الأسباب إن وجدت."
    ))
    story.append(spacer(0.5))

    # Flowchart
    story.append(SubSectionHeader("مخطط انسيابي لعملية التسجيل"))
    story.append(spacer(0.3))

    flow_steps = [
        ("فتح باب التسجيل وإشعار الطلاب", "startend"),
        ("تسجيل دخول الطالب والتحقق من الهوية", "process"),
        ("عرض المقررات المتاحة والشعب والمواعيد", "process"),
        ("هل اختار الطالب مقررات؟", "decision"),
        ("تنفيذ خوارزميات التحقق الأربعة", "process"),
        ("هل نجحت جميع الفحوصات؟", "decision"),
        ("إنشاء تسجيل مؤقت (حالة: معلق)", "success"),
        ("عرض رسالة خطأ مفصلة", "error"),
        ("مراجعة الطالب للجدول النهائي", "process"),
        ("تأكيد التسجيل وتحديث الحالة إلى مؤكد", "success"),
        ("اعتماد التسجيل المركزي", "process"),
        ("إرسال إشعار للطالب بالنتيجة", "process"),
    ]
    story.append(FlowchartBox(flow_steps))

    story.append(PageBreak())

    # ============================================================
    # SECTION 5: GRADUATION WORKFLOW
    # ============================================================
    story.append(SectionHeader("القسم الخامس: مخطط سير التخرج"))
    story.append(spacer(0.5))

    story.append(make_body(
        "يصف هذا القسم العملية الكاملة لتقديم طلبات التخرج وتدقيقها واعتمادها وإصدار وثائق التخرج. "
        "تعد عملية التخرج من أهم العمليات الأكاديمية في المعهد وتتطلب دقة متناهية وشفافية كاملة. "
        "تمر العملية بخمس مراحل رئيسية تبدأ بتقديم الطلب من الطالب وتنتهي بإصدار وثيقة التخرج."
    ))
    story.append(spacer(0.5))

    # Stage 1
    story.append(SubSubSectionHeader("المرحلة 1: تقديم طلب التخرج"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يقوم الطالب بتقديم طلب التخرج عبر النظام الإلكتروني. يتوفر خيار التقديم عندما يكون الطالب "
        "قريبا من استيفاء شروط التخرج بناء على الساعات المنجزة. عند التقديم ينشئ النظام سجلا "
        "جديدا في جدول طلبات التخرج ويقوم بحفظ المعدل التراكمي والساعات المكتملة في وقت التقديم. "
        "يتم إشعار القسم المختص بمقدم الطلب لبدء عملية التدقيق."
    ))
    story.append(spacer(0.3))

    # Stage 2
    story.append(SubSubSectionHeader("المرحلة 2: التدقيق الآلي لشروط القسم"))
    story.append(spacer(0.2))
    story.append(make_body(
        "ينفذ النظام تلقائيا عملية تدقيق شاملة لشروط التخرج تتضمن عدة خطوات مفصلة. "
        "أولا يسترجاع خطة القسم المعلنة التي تخص الطالب ويتحقق من جميع المقررات المطلوبة. "
        "ثانيا يقارن المقررات المنجزة المسجلة في السجل الأكاديمي مع مقررات الخطة ويحدد النواقص. "
        "ثالثا يحسب الساعات المعتمدة المكتملة ويقارنها بإجمالي الساعات المطلوبة في الخطة."
    ))
    story.append(spacer(0.2))

    graduation_checks = [
        "التحقق من إكمال جميع المقررات الإجبارية في الخطة الدراسية",
        "التحقق من إكمال الحد الأدنى من المقررات الاختيارية",
        "حساب الساعات المعتمدة المكتملة ومقارنتها بالحد الأدنى المطلوب",
        "التحقق من المعدل التراكمي الحد الأدنى للتخرج",
        "التحقق من إكمال مشروع التخرج إن كان مطلوبا",
        "التحقق من إكمال التدريب الميداني أو المشاريع العملية",
        "التحقق من عدم وجود ممنوعات (قروض مكتبة، رسوم مستحقة)",
    ]
    for check in graduation_checks:
        story.append(make_bullet(check))

    story.append(spacer(0.2))
    story.append(make_body(
        "في نهاية التدقيق الآلي ينشئ النظام تقريرا تفصيليا يوضح الشروط المحققة والشروط المفقودة. "
        "إذا كانت جميع الشروط مستوفاة تتحول حالة الطلب إلى جاهز لاعتماد رئيس القسم. "
        "أما إذا وجدت نواقص يتم تحديث حالة الطلب إلى شروط غير مستوفاة وإشعار الطالب "
        "بالنواقص المحددة مع اقتراح المقررات اللازم إنجازها."
    ))
    story.append(spacer(0.3))

    # Stage 3
    story.append(SubSubSectionHeader("المرحلة 3: اعتماد رئيس القسم"))
    story.append(spacer(0.2))
    story.append(make_body(
        "يقوم رئيس القسم باستعراض طلب التخرج مع تقرير التدقيق الآلي. يراجع السجل الأكاديمي "
        "الكامل للطالب ويتحقق من صحة البيانات. إذا وافق رئيس القسم على الطلب يقوم بالتوقيع "
        "الإلكتروني وتتغير حالة الطلب إلى معتمد من القسم. إذا رفض الرئيس الطلب يضيف ملاحظات "
        "توضح أسباب الرفض وتتغير حالة الطلب إلى مرفوض ويتم إشعار الطالب."
    ))
    story.append(spacer(0.3))

    # Stage 4
    story.append(SubSubSectionHeader("المرحلة 4: اعتماد التسجيل المركزي"))
    story.append(spacer(0.2))
    story.append(make_body(
        "بعد اعتماد رئيس القسم ينتقل الطلب إلى موظف التسجيل المركزي للمراجعة النهائية. "
        "يتحقق الموظف من عدم وجود ممنوعات إدارية مثل القروض غير المسددة للمكتبة أو الرسوم "
        "المستحقة أو العقوبات التأديبية. إذا وافق الموظف تتغير حالة الطلب إلى معتمد ويتم تحديث "
        "حالة الطالب إلى متخرج. إذا رفض الموظف يضاف ملاحظات وقد يُعاد الطلب للقسم لمراجعة "
        "إضافية."
    ))
    story.append(spacer(0.3))

    # Stage 5
    story.append(SubSubSectionHeader("المرحلة 5: إصدار وثيقة التخرج"))
    story.append(spacer(0.2))
    story.append(make_body(
        "بعد اعتماد الطلب من جميع الجهات يقوم النظام تلقائيا بتوليد كشف الدرجات النهائي "
        "المعتمد وتحديث جميع السجلات ذات الصلة. يتم إشعار جميع الأطراف المعنية بإتمام عملية التخرج "
        "بما في ذلك الطالب والقسم والتسجيل المركزي. يمكن للطالب بعد ذلك تحميل كشف الدرجات "
        "النهائي وطلب إصدار الشهادة الرسمية من الإدارة المختصة."
    ))
    story.append(spacer(0.5))

    # Graduation flowchart
    story.append(SubSectionHeader("مخطط انسيابي لعملية التخرج"))
    story.append(spacer(0.3))

    grad_flow = [
        ("تقديم طلب التخرج من الطالب", "startend"),
        ("تنفيذ التدقيق الآلي لشروط التخرج", "process"),
        ("هل جميع الشروط مستوفاة؟", "decision"),
        ("إشعار الطالب بالنواقص المحددة", "error"),
        ("اعتماد رئيس القسم ومراجعة السجل", "process"),
        ("هل وافق رئيس القسم؟", "decision"),
        ("إضافة ملاحظات الرفض وإشعار الطالب", "error"),
        ("اعتماد التسجيل المركزي وفحص الممنوعات", "process"),
        ("هل تم الاعتماد النهائي؟", "decision"),
        ("إعادة الطلب للقسم مع الملاحظات", "error"),
        ("تحديث حالة الطالب إلى متخرج", "success"),
        ("توليد كشف الدرجات وإشعار الأطراف", "success"),
    ]
    story.append(FlowchartBox(grad_flow))

    story.append(PageBreak())

    # ============================================================
    # SECTION 6: UI REQUIREMENTS BY ROLE
    # ============================================================
    story.append(SectionHeader("القسم السادس: متطلبات واجهات المستخدم حسب الدور"))
    story.append(spacer(0.5))

    story.append(make_body(
        "يصف هذا القسم متطلبات واجهات المستخدم لكل دور من أدوار المستخدمين في النظام. "
        "تم تصميم كل واجهة لتلبي احتياجات الدور المحدد مع توفير جميع الأدوات والمعلومات "
        "اللازمة لأداء المهام المطلوبة بكفاءة وسهولة. جميع الواجهات مصممة بنمط متسق "
        "مع التركيز على سهولة الاستخدام وإمكانية الوصول."
    ))
    story.append(spacer(0.5))

    # 6.1 Student Interface
    story.append(SubSectionHeader("6.1 واجهة الطالب (Student Interface)"))
    story.append(spacer(0.3))

    student_screens = [
        ("لوحة التحكم الرئيسية",
         "تعرض لوحة التحكم ملخصا شاملا لحالة الطالب الأكاديمية بما في ذلك المعدل التراكمي الحالي "
         "وإجمالي الساعات المنجزة والمرحلة الدراسية الحالية والجدول الأسبوعي للأسبوع القادم "
         "وآخر الإشعارات المستلمة. توفر اللوحة وصولا سريعا إلى أهم الوظائف مثل التسجيل وطلب التخرج. "
         "تتضمن أيضا مؤشرات مرئية للحالة الأكاديمية مثل الإنذار أو الأداء المتميز."),

        ("التسجيل الذاتي",
         "تتيح هذه الشاشة للطالب تسجيل المقررات الدراسية بنفسه. تعرض جميع المقررات المتاحة مع الشعب "
         "والمواعيد والسعات. يتم تطبيق خوارزميات التحقق فوريا عند اختيار كل مقرر مع عرض نتيجة الفحص. "
         "يظهر الجدول الزمني المحدث تلقائيا مع كل تسجيل جديد مما يتيح للطالب رؤية جدوله الكامل "
         "أثناء عملية التسجيل."),

        ("السجل الأكاديمي",
         "عرض كشف الدرجات الكامل مع المعدل الفصلي لكل فصل والمعدل التراكمي التراكمي. "
         "يمكن للطالب تصفية السجلات حسب الفصل الدراسي أو نوع المقرر. تعرض الشاشة أيضا إحصائيات "
         "مثل عدد المقررات المنجزة والمتكررة والمقررات ذات الدرجات العالية."),

        ("طلب التخرج",
         "تتيح للطالب تقديم طلب التخرج ومتابعة حالته. تعرض الشاشة تقريرا مسبقا بالشروط المحققة "
         "والمفقودة قبل التقديم. بعد التقديم يمكن للطالب متابعة تقدم الطلب عبر المراحل المختلفة "
         "مع عرض ملاحظات المراجعين في كل مرحلة."),

        ("الإرشاد الأكاديمي",
         "تعرض معلومات المرشد الأكاديمي المُعين وتتيح حجز مواعيد الاستشارة. تعرض سجل الجلسات "
         "السابقة مع المرشد والتوصيات المقدمة. يمكن للطالب أيضا التواصل مع المرشد عبر نظام الرسائل."),

        ("الطلبات",
         "تتيح للطالب تقديم طلبات متنوعة مثل طلبات السحب والإضافة وتأجيل الفصل والإحالة بين الأقسام. "
         "كل طلب يمر بسير عمل محدد ويظهر حالته وتاريخ كل مرحلة وملاحظات المراجعين."),

        ("الجدول الزمني",
         "عرض الجدول الأسبوعي الكامل بألوان مميزة لكل مقرر. يمكن تصدير الجدول بصيغة PDF أو إضافته "
         "إلى التقويم الشخصي. تعرض الشاشة أيضا أي تغييرات في الجدول مقارنة بالأسبوع السابق."),

        ("الإشعارات",
         "مركز الإشعارات يعرض جميع التنبيهات والرسائل المستلمة مرتبة زمنيا. يمكن تمييز الإشعارات "
         "كمقروءة أو غير مقروءة وتصفيتها حسب النوع. تشمل الإشعارات فتح التسجيل واعتماد الطلبات "
         "وتغيير الجداول والمواعيد المهمة."),
    ]

    for name, desc in student_screens:
        story.append(SubSubSectionHeader(f"لوحة التحكم: {name}"))
        story.append(spacer(0.15))
        story.append(make_body(desc))
        story.append(spacer(0.15))

    story.append(spacer(0.3))

    # 6.2 Registration Officer Interface
    story.append(SubSectionHeader("6.2 واجهة موظف التسجيل المركزي"))
    story.append(spacer(0.3))

    reg_screens = [
        ("لوحة التحكم", "إحصائيات عامة عن التسجيلات الحالية وعدد الطلاب المسجلين والشعب المفتوحة والنشاط الأخير"),
        ("إدارة التسجيلات", "مراجعة واعتماد أو رفض تسجيلات الطلاب مع إمكانية التعديل والإضافة اليدوية"),
        ("إدارة الطلاب", "عرض وتعديل بيانات الطلاب وتغيير الحالات الأكاديمية وإدارة التسجيلات السابقة"),
        ("اعتماد التخرج", "مراجعة طلبات التخرج المعتمدة من الأقسام وإصدار الاعتماد النهائي أو الإرجاع"),
        ("التقارير", "توليد تقارير إحصائية شاملة عن التسجيلات والأداء الأكاديمي والتخرجات"),
    ]
    for name, desc in reg_screens:
        story.append(make_bullet(f"{name}: {desc}"))
    story.append(spacer(0.4))

    # 6.3 HOD Interface
    story.append(SubSectionHeader("6.3 واجهة رئيس القسم"))
    story.append(spacer(0.3))

    hod_screens = [
        ("لوحة التحكم", "نظرة عامة شاملة على القسم تشمل عدد الأساتذة والطلاب والمقررات والشعب المفتوحة والأداء الأكاديمي"),
        ("إدارة الأعضاء", "إدارة بيانات الأساتذة والموظفين في القسم مع تعيين الرتب والمهام"),
        ("فتح الشعب", "إنشاء شعب دراسية جديدة مع التحقق الآلي من تعارضات القاعات والأساتذة"),
        ("جداول الأساتذة", "عرض واعتماد جداول التدريس لجميع الأساتذة في القسم"),
        ("التوجيه الأكاديمي", "تعيين المرشدين الأكاديميين للطلاب وإدارة علاقات الإرشاد"),
        ("طلبات التخرج", "مراجعة واعتماد طلبات التخرج على مستوى القسم مع عرض تقرير التدقيق الآلي"),
        ("تحويلات الموظفين", "مراجعة طلبات تحويل الموظفين للتدريس والبت فيها"),
        ("التقارير", "تقارير أداء القسم تشمل معدلات النجاح والرسوب وتوزيع الدرجات والإحصائيات التفصيلية"),
    ]
    for name, desc in hod_screens:
        story.append(make_bullet(f"{name}: {desc}"))
    story.append(spacer(0.4))

    # 6.4 Professor Interface
    story.append(SubSectionHeader("6.4 واجهة الأستاذ (Professor Interface)"))
    story.append(spacer(0.3))

    prof_screens = [
        ("لوحة التحكم", "عرض جدول التدريس الأسبوعي والإحصائيات المتعلقة بالشعب المسندة وعدد الطلاب"),
        ("إدارة المقررات", "عرض تفاصيل الشعب المسندة وقوائم الطلاب المسجلين في كل شعبة"),
        ("دخلات الدرجات", "تسجيل وتعديل درجات الطلاب مع إمكانية الاستيراد من ملفات خارجية"),
        ("الطلبات", "تقديم طلبات متنوعة مثل تعديل الجدول ومراجعة الدرجات وطلبات الدعم التقني"),
        ("الإرشاد الأكاديمي", "عرض قائمة الطلاب الموجهين لهم وتسجيل جلسات الإرشاد والتوصيات"),
        ("الجدول الزمني", "عرض جدول التدريس الكامل مع التواريخ والأوقات والقاعات"),
    ]
    for name, desc in prof_screens:
        story.append(make_bullet(f"{name}: {desc}"))

    story.append(PageBreak())

    # ============================================================
    # SECTION 7: GENERAL BUSINESS RULES
    # ============================================================
    story.append(SectionHeader("القسم السابع: قواعد العمل العامة"))
    story.append(spacer(0.5))

    story.append(make_body(
        "يحتوي هذا القسم على القواعد الأكاديمية والإدارية العامة التي تحكم عمل النظام. "
        "هذه القواعد مبرمجة في النظام ويتم تطبيقها آليا عند تنفيذ العمليات المختلفة. "
        "يمكن تعديل هذه القواعد من قبل المسؤول المختص حسب سياسات المعهد."
    ))
    story.append(spacer(0.5))

    # Rules table
    rules_data = [
        ("الحد الأدنى للمعدل التراكمي للتخرج", "2.00 من 4.00",
         "لا يمكن للطالب التخرج إذا كان معدله التراكمي أقل من 2.00. يتم التحقق من هذا الشرط آليا عند تقديم طلب التخرج."),
        ("الحد الأقصى للساعات المسجلة", "18 ساعة معتمدة (12 ساعة للإنذار الأكاديمي)",
         "لا يمكن للطالب المسجل في 18 ساعة أو أكثر تسجيل مقررات إضافية. الطالب تحت الإنذار الأكاديمي يقتصر على 12 ساعة كحد أقصى."),
        ("فترة الإضافة والإسقاط", "أسبوعان من بداية الفصل",
         "يمكن للطالب إضافة أو إسقاط مقررات خلال أول أسبوعين فقط من بداية الفصل. بعد هذه الفترة لا يسمح بالإسقاط إلا بحالات استثنائية معتمدة."),
        ("نسبة الحضور المطلوبة", "75% على الأقل",
         "يحرم الطالب من دخول الاختبار النهائي إذا كانت نسبة غيابه تتجاوز 25% بغض النظر عن السبب ما لم يكن بعذر طبي معتمد."),
        ("تكرار المقررات", "الحد الأقصى مرتين لكل مقرر",
         "يمكن للطالب إعادة المقرر الذي رسب فيه مرتين كحد أقصى. إذا رسب في المرة الثالثة يُحال للجنة أكاديمية لاتخاذ القرار."),
        ("الحد الأدنى لدرجة النجاح", "D (1.00 نقطة) للمقررات العامة",
         "تشترط بعض الكليات درجة أعلى للمقررات التخصصية مثل C (2.00 نقطة) أو C+ (2.33 نقطة)."),
        ("الحد الأقصى للفصل الصيفي", "6 ساعات معتمدة",
         "لا يمكن للطالب تسجيل أكثر من 6 ساعات في الفصل الصيفي."),
        ("الإنذار الأكاديمي", "معدل فصلي أقل من 1.00",
         "يُنذر الطالب أكاديميا إذا هبط معدله الفصلي عن 1.00 أو معدله التراكمي عن 1.75. الفصل من المعهد إذا استمر لفصلين متتاليين."),
        ("التسجيل المتأخر", "غرامة ورسوم إضافية",
         "التسجيل بعد فترة التسجيل المحددة يعرض الطالب لغرامة مالية ولا يضمن توفر المقاعد في الشعب المطلوبة."),
        ("مشروع التخرج", "إلزامي لجميع البرامج",
         "يجب على كل طالب إنجاز مشروع التخرج كمتطلب للتخرج. يتم تسجيل المقرر في المرحلة الأخيرة ويخضع لتقييم لجنة مختصة."),
    ]

    rules_table_data = [
        [Paragraph(ar('التفاصيل'), style_table_header),
         Paragraph(ar('القيمة'), style_table_header),
         Paragraph(ar('القاعدة'), style_table_header)]
    ]
    for rule, value, detail in rules_data:
        rules_table_data.append([
            Paragraph(ar(detail), style_table_cell_right),
            Paragraph(ar(value), style_table_cell),
            Paragraph(ar(rule), style_table_cell),
        ])

    rules_table = Table(rules_table_data, colWidths=[8*cm, 4*cm, 4*cm])
    rules_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'ArabicBold'),
        ('FONTNAME', (0, 1), (-1, -1), 'ArabicReg'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_TABLE, white]),
        ('GRID', (0, 0), (-1, -1), 0.3, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(rules_table)

    story.append(spacer(0.5))

    # Additional business rules
    story.append(SubSectionHeader("قواعد إضافية"))
    story.append(spacer(0.3))

    additional_rules = [
        "لا يمكن للطالب تسجيل مقرر من مرحلة أعلى إلا بعد إنجاز 75% على الأقل من ساعات المرحلة السابقة",
        "يُحسب المعدل التراكمي على أساس جميع المقررات المسجل فيها بما في ذلك المقررات الراسبة",
        "يحق للطالب الانسحاب من الفصل قبل نهاية الأسبوع الرابع بدون سجل أكاديمي (علامة W)",
        "الانسحاب بعد الأسبوع الرابع يسجل بعلامة WP أو WF حسب الموقف وقت الانسحاب",
        "يجب أن تكون جميع المقررات المسجلة من الخطة الدراسية المعتمدة لقسم الطالب",
        "يحتفظ النظام بنسخ احتياطية يومية من جميع البيانات مع إمكانية الاستعادة",
        "جميع العمليات في النظام تُسجل في سجل المراجعة ولا يمكن حذفها نهائيا",
        "يتم تجديد كلمة المرور كل 90 يوما مع فرض سياسة قوة كلمة المرور",
    ]
    for rule in additional_rules:
        story.append(make_bullet(rule))

    story.append(spacer(1))

    # Final note
    story.append(section_divider())
    story.append(spacer(0.5))
    story.append(Paragraph(
        ar("نهاية الوثيقة - جميع الحقوق محفوظة للمعهد الأكاديمي"),
        ParagraphStyle('FinalNote', fontName='ArabicBold', fontSize=11, leading=15,
                       alignment=TA_CENTER, textColor=PRIMARY_DARK)
    ))
    story.append(spacer(0.2))
    story.append(Paragraph(
        ar("وثيقة متطلبات نظام إدارة شؤون الطلبة - الإصدار 1.0 - يناير 2025"),
        ParagraphStyle('FinalNote2', fontName='ArabicReg', fontSize=9, leading=13,
                       alignment=TA_CENTER, textColor=TEXT_LIGHT)
    ))

    # Build PDF
    doc.build(story)
    print(f"PDF generated successfully at: {output_path}")
    return output_path


if __name__ == "__main__":
    path = build_document()
    # Verify file
    size = os.path.getsize(path)
    print(f"File size: {size / 1024:.1f} KB")
