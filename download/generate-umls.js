const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = '/home/z/my-project/download';

const C = {
  text: '#243447', bg: '#F8FAFC', fill: '#E9EEF3', accent: '#4C6EF5',
  purple: '#7C5CFC', blue: '#3B82F6', green: '#10B981', red: '#E74C3C',
  orange: '#F59E0B', border: '#C1CCD6', white: '#FFFFFF', dark: '#374151',
  light: '#6B7B8D', accentLight: 'rgba(76,110,245,0.08)',
};

const basePage = (innerSVG) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body { background:${C.bg}; font-family:'Noto Sans Arabic','Segoe UI',Tahoma,Arial,sans-serif; color:${C.text}; width:1400px; height:1050px; position:relative; overflow:hidden; }
svg text { font-family:'Noto Sans Arabic','Segoe UI',Tahoma,Arial,sans-serif; }
</style></head>
<body>
${innerSVG}
</body></html>`;

async function renderDiagram(html, filename, w=1400, h=1050) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  const fp = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: fp, fullPage: true });
  await context.close();
  await browser.close();
  console.log(`  ✓ ${filename}`);
  return fp;
}

// ═══════════════════════════════════════════════
// SVG HELPERS
// ═══════════════════════════════════════════════
const defs = `<defs>
  <marker id="ah" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${C.accent}"/></marker>
  <marker id="ahd" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${C.dark}"/></marker>
  <marker id="ahg" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${C.green}"/></marker>
  <marker id="ahr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${C.red}"/></marker>
  <marker id="aho" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${C.orange}"/></marker>
  <marker id="ahp" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${C.purple}"/></marker>
  <marker id="ahb" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${C.blue}"/></marker>
  <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.08"/>
  </filter>
</defs>`;

// ═══════════════════════════════════════════════
// 1. USE CASE DIAGRAM
// ═══════════════════════════════════════════════
function useCaseSVG() {
  // Canvas 1400x1050
  // System boundary: centered
  const bx = 320, by = 80, bw = 760, bh = 880;
  const bcx = bx + bw/2; // 700
  
  // Actors (outside boundary)
  // Right side actors
  const actors = [
    { label: 'رئيس القسم', x: 1160, y: 220, color: C.accent },
    { label: 'الأستاذ', x: 1160, y: 480, color: C.purple },
    { label: 'الموظف', x: 1160, y: 720, color: C.blue },
  ];
  // Left side actors
  const actorsL = [
    { label: 'الطالب', x: 170, y: 450, color: C.green },
  ];

  // Use cases inside boundary (center x, center y)
  const ucs = [
    // HOD
    { label: 'إنشاء إعلان', cx: 620, cy: 180, group: 'hod' },
    { label: 'حذف إعلان', cx: 820, cy: 180, group: 'hod' },
    { label: 'إدارة المقررات', cx: 620, cy: 270, group: 'hod' },
    { label: 'عرض الإحصائيات', cx: 820, cy: 270, group: 'hod' },
    // Professor
    { label: 'عرض الإعلانات', cx: 620, cy: 430, group: 'prof' },
    { label: 'عرض الجدول الأسبوعي', cx: 820, cy: 430, group: 'prof' },
    // Student
    { label: 'عرض الإعلانات', cx: 620, cy: 520, group: 'stu' },
    { label: 'تصفح المواد', cx: 820, cy: 520, group: 'stu' },
    { label: 'تقديم طلب', cx: 620, cy: 610, group: 'stu' },
    { label: 'تتبع الطلبات', cx: 820, cy: 610, group: 'stu' },
    // Employee
    { label: 'عرض الإعلانات', cx: 620, cy: 720, group: 'emp' },
    { label: 'إدارة المهام', cx: 820, cy: 720, group: 'emp' },
    // Shared
    { label: 'تسجيل الدخول', cx: 720, cy: 870, group: 'login' },
  ];

  // Draw stick figure for actor
  function stickFigure(x, y, color, label) {
    return `
      <circle cx="${x}" cy="${y-25}" r="14" fill="${color}" stroke="${color}" stroke-width="2"/>
      <line x1="${x}" y1="${y-11}" x2="${x}" y2="${y+12}" stroke="${color}" stroke-width="2.5"/>
      <line x1="${x-12}" y1="${y-2}" x2="${x+12}" y2="${y-2}" stroke="${color}" stroke-width="2.5"/>
      <line x1="${x}" y1="${y+12}" x2="${x-10}" y2="${y+30}" stroke="${color}" stroke-width="2.5"/>
      <line x1="${x}" y1="${y+12}" x2="${x+10}" y2="${y+30}" stroke="${color}" stroke-width="2.5"/>
      <text x="${x}" y="${y+50}" text-anchor="middle" font-size="14" font-weight="700" fill="${C.text}">${label}</text>`;
  }

  // Draw use case ellipse
  function ucEllipse(cx, cy, label, isLogin) {
    const fc = isLogin ? 'rgba(231,76,60,0.06)' : C.white;
    const sc = isLogin ? C.red : C.accent;
    const tc = isLogin ? C.red : C.text;
    return `
      <ellipse cx="${cx}" cy="${cy}" rx="95" ry="28" fill="${fc}" stroke="${sc}" stroke-width="2" filter="url(#shadow)"/>
      <text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="13" font-weight="600" fill="${tc}">${label}</text>`;
  }

  // Connection lines from actors to use cases
  let lines = '';
  
  // HOD connections (x=1160, y=220) to: uc at (620,180), (820,180), (620,270), (820,270)
  const hodUCs = ucs.filter(u => u.group === 'hod');
  hodUCs.forEach(uc => {
    lines += `<line x1="1120" y1="220" x2="${uc.cx+95}" y2="${uc.cy}" stroke="${C.accent}" stroke-width="1.5"/>`;
  });
  
  // Professor (1160, 480) to prof ucs
  const profUCs = ucs.filter(u => u.group === 'prof');
  profUCs.forEach(uc => {
    lines += `<line x1="1120" y1="480" x2="${uc.cx+95}" y2="${uc.cy}" stroke="${C.purple}" stroke-width="1.5"/>`;
  });

  // Employee (1160, 720) to emp ucs
  const empUCs = ucs.filter(u => u.group === 'emp');
  empUCs.forEach(uc => {
    lines += `<line x1="1120" y1="720" x2="${uc.cx+95}" y2="${uc.cy}" stroke="${C.blue}" stroke-width="1.5"/>`;
  });

  // Student (170, 450) to stu ucs (left side of ellipse)
  const stuUCs = ucs.filter(u => u.group === 'stu');
  stuUCs.forEach(uc => {
    lines += `<line x1="210" y1="450" x2="${uc.cx-95}" y2="${uc.cy}" stroke="${C.green}" stroke-width="1.5"/>`;
  });

  // Login connections (dashed)
  const loginUC = ucs.find(u => u.group === 'login');
  actors.forEach(a => {
    lines += `<line x1="${a.x}" y1="${a.y}" x2="${loginUC.cx}" y2="${loginUC.cy}" stroke="${C.red}" stroke-width="1.2" stroke-dasharray="6,4"/>`;
  });
  actorsL.forEach(a => {
    lines += `<line x1="${a.x}" y1="${a.y}" x2="${loginUC.cx}" y2="${loginUC.cy}" stroke="${C.red}" stroke-width="1.2" stroke-dasharray="6,4"/>`;
  });

  let svgContent = '';
  // System boundary
  svgContent += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="16" fill="${C.accentLight}" stroke="${C.accent}" stroke-width="2.5"/>`;
  svgContent += `<text x="${bx + bw - 20}" y="${by + 20}" text-anchor="end" font-size="16" font-weight="700" fill="${C.accent}">نظام إدارة القسم الأكاديمي</text>`;

  // Title
  svgContent += `<text x="700" y="40" text-anchor="middle" font-size="26" font-weight="700" fill="${C.text}">مخطط حالات الاستخدام <tspan fill="${C.accent}">(Use Case Diagram)</tspan></text>`;

  // Lines
  svgContent += lines;

  // Use cases
  ucs.forEach(uc => {
    svgContent += ucEllipse(uc.cx, uc.cy, uc.label, uc.group === 'login');
  });

  // Actors
  actors.forEach(a => { svgContent += stickFigure(a.x, a.y, a.color, a.label); });
  actorsL.forEach(a => { svgContent += stickFigure(a.x, a.y, a.color, a.label); });

  // Legend
  svgContent += `
    <line x1="1100" y1="920" x2="1140" y2="920" stroke="${C.accent}" stroke-width="2"/>
    <text x="1150" y="924" font-size="12" fill="${C.light}">اتصال مباشر</text>
    <line x1="1100" y1="945" x2="1140" y2="945" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="6,4"/>
    <text x="1150" y="949" font-size="12" fill="${C.light}">تسجيل الدخول (مشترك)</text>`;

  return basePage(`<svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">${defs}${svgContent}</svg>`);
}

// ═══════════════════════════════════════════════
// 2. CLASS DIAGRAM
// ═══════════════════════════════════════════════
function classSVG() {
  let s = '';
  
  // Title
  s += `<text x="700" y="38" text-anchor="middle" font-size="26" font-weight="700" fill="${C.text}">مخطط الفئات <tspan fill="${C.accent}">(Class Diagram)</tspan></text>`;

  function classBox(x, y, w, name, stereotype, attrs, methods, headerColor) {
    const lineH = 18;
    const headerH = 32;
    const attrH = attrs.length * lineH + 12;
    const methH = Math.max(methods.length * lineH + 12, 20);
    const totalH = headerH + attrH + methH;
    const hc = headerColor || C.accent;

    let box = '';
    box += `<rect x="${x}" y="${y}" width="${w}" height="${totalH}" rx="8" fill="${C.white}" stroke="${hc}" stroke-width="2" filter="url(#shadow)"/>`;
    // Header
    box += `<rect x="${x}" y="${y}" width="${w}" height="${headerH}" rx="8" fill="${hc}"/>`;
    box += `<rect x="${x}" y="${y+headerH-8}" width="${w}" height="8" fill="${hc}"/>`;
    
    if (stereotype) {
      box += `<text x="${x+w/2}" y="${y+14}" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.8)">«${stereotype}»</text>`;
      box += `<text x="${x+w/2}" y="${y+28}" text-anchor="middle" font-size="14" font-weight="700" fill="white">${name}</text>`;
    } else {
      box += `<text x="${x+w/2}" y="${y+22}" text-anchor="middle" font-size="14" font-weight="700" fill="white">${name}</text>`;
    }

    // Attributes
    box += `<line x1="${x}" y1="${y+headerH}" x2="${x+w}" y2="${y+headerH}" stroke="${C.border}" stroke-width="1"/>`;
    attrs.forEach((a, i) => {
      box += `<text x="${x+10}" y="${y+headerH+14+i*lineH}" font-size="11" fill="${C.text}">${a}</text>`;
    });

    // Methods
    const methY = y + headerH + attrH;
    box += `<line x1="${x}" y1="${methY}" x2="${x+w}" y2="${methY}" stroke="${C.border}" stroke-width="1"/>`;
    methods.forEach((m, i) => {
      box += `<text x="${x+10}" y="${methY+14+i*lineH}" font-size="11" fill="${C.dark}">${m}</text>`;
    });

    return { svg: box, x, y, w, h: totalH };
  }

  // Layout classes
  const classes = [];

  // Store (singleton) - right side
  classes.push(classBox(980, 70, 250, 'Store', 'singleton',
    ['- announcements: Announcement[]', '- requests: StudentRequest[]', '- courses: Course[]'],
    ['+ subscribe(listener)', '+ addAnnouncement(data)', '+ getAnnouncementsForRole(role)'], C.dark));

  // Announcement - center right
  classes.push(classBox(620, 70, 270, 'Announcement', null,
    ['- id: string', '- title: string', '- content: string', '- priority: عاجل|مهم|عادي', '- targetRole: Role', '- date: Date', '- authorName: string'],
    ['+ create()', '+ delete()', '+ getByRole()'], C.accent));

  // User (abstract) - left top
  classes.push(classBox(100, 70, 230, 'User', 'abstract',
    ['- id: string', '- name: string', '- email: string', '- role: Role'],
    ['+ getRole(): Role'], C.accent));

  // HOD
  classes.push(classBox(30, 340, 210, 'HOD', null, [],
    ['+ createAnnouncement()', '+ deleteAnnouncement()', '+ manageCourses()', '+ viewStatistics()'], C.accent));

  // Professor
  classes.push(classBox(260, 340, 210, 'Professor', null, [],
    ['+ viewAnnouncements()', '+ viewWeeklySchedule()'], C.purple));

  // Employee
  classes.push(classBox(30, 530, 210, 'Employee', null, [],
    ['+ viewAnnouncements()', '+ manageTasks()'], C.blue));

  // Student
  classes.push(classBox(260, 530, 210, 'Student', null, [],
    ['+ viewAnnouncements()', '+ browseCourses()', '+ submitRequest()', '+ trackRequests()'], C.green));

  // Course
  classes.push(classBox(620, 480, 240, 'Course', null,
    ['- code: string', '- name: string', '- hours: number', '- grade: number', '- semester: number'],
    [], C.accent));

  // StudentRequest
  classes.push(classBox(100, 730, 270, 'StudentRequest', null,
    ['- id: string', '- type: string', '- status: معلق|مقبول|مرفوض', '- date: Date', '- studentId: string', '- description: string'],
    ['+ submit()', '+ updateStatus()'], C.orange));

  // AcademicPlan
  classes.push(classBox(620, 680, 240, 'AcademicPlan', null,
    ['- courses: Course[]', '- semester: number'],
    ['+ getCourses(): Course[]'], C.accent));

  // Render class boxes
  classes.forEach(c => { s += c.svg; });

  // Relationships
  // User -> Announcement (1..*) association
  s += `<line x1="330" y1="130" x2="620" y2="130" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<text x="345" y="122" font-size="12" fill="${C.light}">1</text>`;
  s += `<text x="600" y="122" font-size="12" fill="${C.light}">*</text>`;
  s += `<text x="470" y="122" text-anchor="middle" font-size="11" fill="${C.light}" font-style="italic">يُنشئ</text>`;

  // Inheritance: HOD, Prof, Emp, Stu -> User
  // User center-x = 215, bottom = 70+32+4*18+12 = 70+116 = 186
  const userBottom = 186;
  const userCx = 215;
  
  // Vertical line from User bottom
  s += `<line x1="${userCx}" y1="${userBottom}" x2="${userCx}" y2="${userBottom + 30}" stroke="${C.border}" stroke-width="1.8"/>`;
  // Horizontal line
  s += `<line x1="135" y1="${userBottom+30}" x2="365" y2="${userBottom+30}" stroke="${C.border}" stroke-width="1.8"/>`;
  // Triangle arrow at User bottom
  s += `<polygon points="${userCx-8},${userBottom+30} ${userCx+8},${userBottom+30} ${userCx},${userBottom+5}" fill="${C.bg}" stroke="${C.border}" stroke-width="1.8"/>`;

  // Down to HOD (center 135)
  s += `<line x1="135" y1="${userBottom+30}" x2="135" y2="340" stroke="${C.border}" stroke-width="1.8"/>`;
  // Down to Prof (center 365)
  s += `<line x1="365" y1="${userBottom+30}" x2="365" y2="340" stroke="${C.border}" stroke-width="1.8"/>`;
  // Down to Emp (135) from junction
  s += `<line x1="135" y1="${userBottom+30}" x2="135" y2="340" stroke="${C.border}" stroke-width="1.8"/>`;
  // Down to Stu (365) 
  s += `<line x1="365" y1="${userBottom+30}" x2="365" y2="530" stroke="${C.border}" stroke-width="1.8"/>`;
  
  // We need a second junction for Employee and Student
  const junction2y = userBottom + 100;
  // Line from junction1 down to junction2
  s += `<line x1="${userCx}" y1="${userBottom+30}" x2="${userCx}" y2="${junction2y}" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<line x1="135" y1="${junction2y}" x2="365" y2="${junction2y}" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<polygon points="${userCx-8},${junction2y} ${userCx+8},${junction2y} ${userCx},${junction2y-25}" fill="${C.bg}" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<line x1="135" y1="${junction2y}" x2="135" y2="530" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<line x1="365" y1="${junction2y}" x2="365" y2="530" stroke="${C.border}" stroke-width="1.8"/>`;

  // Student -> StudentRequest (1..*)
  const stuBox = classes[6]; // Student
  s += `<line x1="365" y1="${530+stuBox.h}" x2="235" y2="730" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<text x="280" y="${530+stuBox.h+10}" font-size="12" fill="${C.light}">1</text>`;
  s += `<text x="250" y="722" font-size="12" fill="${C.light}">*</text>`;

  // AcademicPlan -> Course (composition)
  const planBox = classes[8];
  const courseBox = classes[7];
  s += `<line x1="740" y1="680" x2="740" y2="${480+courseBox.h}" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<polygon points="732,${480+courseBox.h} 748,${480+courseBox.h} 740,${480+courseBox.h+15}" fill="${C.bg}" stroke="${C.border}" stroke-width="1.8"/>`;
  s += `<text x="750" y="600" font-size="12" fill="${C.light}">1..*</text>`;

  // Store dashed to Announcement, Request, Course
  s += `<line x1="980" y1="140" x2="890" y2="140" stroke="${C.dark}" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#ahd)"/>`;
  s += `<line x1="980" y1="200" x2="890" y2="550" stroke="${C.dark}" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#ahd)"/>`;
  s += `<line x1="980" y1="250" x2="890" y2="800" stroke="${C.dark}" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#ahd)"/>`;

  // Relationship labels
  s += `<text x="930" y="130" text-anchor="middle" font-size="10" fill="${C.light}" font-style="italic">يدير</text>`;
  s += `<text x="870" y="540" font-size="10" fill="${C.light}" font-style="italic" transform="rotate(-65,870,540)">يدير</text>`;

  return basePage(`<svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">${defs}${s}</svg>`);
}

// ═══════════════════════════════════════════════
// 3. SEQUENCE DIAGRAM
// ═══════════════════════════════════════════════
function sequenceSVG() {
  let s = '';
  s += `<text x="700" y="38" text-anchor="middle" font-size="26" font-weight="700" fill="${C.text}">مخطط التسلسل - إنشاء إعلان <tspan fill="${C.accent}">(Sequence Diagram)</tspan></text>`;

  // Participants (x positions)
  const participants = [
    { label: 'رئيس القسم', x: 120, color: C.accent },
    { label: 'لوحة رئيس القسم', x: 340, color: C.accent },
    { label: 'Store', x: 560, color: C.dark },
    { label: 'لوحة الأستاذ', x: 780, color: C.purple },
    { label: 'لوحة الموظف', x: 990, color: C.blue },
    { label: 'لوحة الطالب', x: 1210, color: C.green },
  ];

  const topY = 70;
  const boxW = 130;
  const boxH = 42;

  // Top boxes
  participants.forEach(p => {
    s += `<rect x="${p.x - boxW/2}" y="${topY}" width="${boxW}" height="${boxH}" rx="8" fill="${p.color}" stroke="${p.color}" stroke-width="2" filter="url(#shadow)"/>`;
    s += `<text x="${p.x}" y="${topY+26}" text-anchor="middle" font-size="13" font-weight="700" fill="white">${p.label}</text>`;
  });

  // Bottom boxes (mirror)
  const botY = 900;
  participants.forEach(p => {
    s += `<rect x="${p.x - boxW/2}" y="${botY}" width="${boxW}" height="${boxH}" rx="8" fill="white" stroke="${p.color}" stroke-width="2" filter="url(#shadow)"/>`;
    s += `<text x="${p.x}" y="${botY+26}" text-anchor="middle" font-size="13" font-weight="700" fill="${p.color}">${p.label}</text>`;
  });

  // Lifelines (dashed)
  participants.forEach(p => {
    s += `<line x1="${p.x}" y1="${topY+boxH}" x2="${p.x}" y2="${botY}" stroke="${C.border}" stroke-width="1.2" stroke-dasharray="6,4"/>`;
  });

  // Activation bars
  const barW = 12;
  // HOD activation
  s += `<rect x="${120-barW/2}" y="150" width="${barW}" height="750" rx="3" fill="${C.accent}" opacity="0.15"/>`;
  // HODDashboard activation
  s += `<rect x="${340-barW/2}" y="200" width="${barW}" height="550" rx="3" fill="${C.accent}" opacity="0.15"/>`;
  // Store activation
  s += `<rect x="${560-barW/2}" y="280" width="${barW}" height="380" rx="3" fill="${C.dark}" opacity="0.15"/>`;
  // Prof activation
  s += `<rect x="${780-barW/2}" y="530" width="${barW}" height="40" rx="3" fill="${C.purple}" opacity="0.15"/>`;
  // Emp activation
  s += `<rect x="${990-barW/2}" y="600" width="${barW}" height="40" rx="3" fill="${C.blue}" opacity="0.15"/>`;
  // Stu activation
  s += `<rect x="${1210-barW/2}" y="670" width="${barW}" height="40" rx="3" fill="${C.green}" opacity="0.15"/>`;

  // Messages
  const msgs = [
    { from: 120, to: 340, y: 210, label: '١. يملأ نموذج الإعلان', color: C.accent },
    { from: 340, to: 560, y: 290, label: '٢. addAnnouncement(data)', color: C.accent, marker: 'ah' },
    // Self-messages for Store
    { from: 560, to: 560, y: 360, label: '٣. يضيف الإعلان إلى القائمة', color: C.dark, self: true },
    { from: 560, to: 560, y: 430, label: '٤. يُعلم المشتركين (notify)', color: C.dark, self: true },
    // Notifications
    { from: 560, to: 780, y: 530, label: '٥. تحديث الإعلانات', color: C.purple, marker: 'ahp' },
    { from: 560, to: 990, y: 600, label: '٦. تحديث الإعلانات', color: C.blue, marker: 'ahb' },
    { from: 560, to: 1210, y: 670, label: '٧. تحديث الإعلانات', color: C.green, marker: 'ahg' },
    // Return
    { from: 340, to: 120, y: 780, label: '٨. يعرض رسالة نجاح', color: C.accent, dashed: true },
  ];

  msgs.forEach(m => {
    if (m.self) {
      s += `<path d="M${m.from+barW/2},${m.y-10} L${m.from+40},${m.y-10} L${m.from+40},${m.y+10} L${m.from+barW/2},${m.y+10}" stroke="${m.color}" stroke-width="2" fill="none" marker-end="url(#ahd)"/>`;
    } else if (m.dashed) {
      s += `<line x1="${m.from}" y1="${m.y}" x2="${m.to}" y2="${m.y}" stroke="${m.color}" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#ah)"/>`;
    } else {
      s += `<line x1="${m.from+barW/2}" y1="${m.y}" x2="${m.to-barW/2}" y2="${m.y}" stroke="${m.color}" stroke-width="2" marker-end="url(#m.marker || 'ah'})"/>`;
    }
    // Label
    const lx = m.self ? m.from + 50 : (m.from + m.to) / 2;
    s += `<text x="${lx}" y="${m.y - 10}" text-anchor="middle" font-size="12" font-weight="600" fill="${C.text}">${m.label}</text>`;
  });

  // Step number badges
  msgs.forEach((m, i) => {
    const bx = m.from - 30;
    const by = m.y;
    s += `<circle cx="${m.self ? m.from - 30 : (m.dashed ? m.to + 25 : m.from - 25)}" cy="${m.y}" r="12" fill="${m.color || C.accent}"/>`;
    s += `<text x="${m.self ? m.from - 30 : (m.dashed ? m.to + 25 : m.from - 25)}" y="${m.y + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="white">${['١','٢','٣','٤','٥','٦','٧','٨'][i]}</text>`;
  });

  return basePage(`<svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">${defs}${s}</svg>`);
}

// ═══════════════════════════════════════════════
// 4. COMPONENT DIAGRAM
// ═══════════════════════════════════════════════
function componentSVG() {
  let s = '';
  s += `<text x="700" y="38" text-anchor="middle" font-size="26" font-weight="700" fill="${C.text}">مخطط المكونات <tspan fill="${C.accent}">(Component Diagram)</tspan></text>`;

  function compBox(x, y, w, h, label, sublabel, color) {
    const c = color || C.accent;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${C.white}" stroke="${c}" stroke-width="2" filter="url(#shadow)"/>`;
    // Tab
    s += `<rect x="${x}" y="${y}" width="60" height="20" rx="8" fill="${c}"/>`;
    s += `<text x="${x+30}" y="${y+14}" text-anchor="middle" font-size="9" font-weight="700" fill="white">«مكون»</text>`;
    // Label
    s += `<text x="${x+w/2}" y="${y+h/2-5}" text-anchor="middle" font-size="14" font-weight="700" fill="${c}">${label}</text>`;
    if (sublabel) {
      s += `<text x="${x+w/2}" y="${y+h/2+14}" text-anchor="middle" font-size="11" fill="${C.light}">${sublabel}</text>`;
    }
  }

  function groupBox(x, y, w, h, label, color) {
    const c = color || C.border;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="8,4"/>`;
    s += `<text x="${x+w-10}" y="${y-6}" text-anchor="end" font-size="13" font-weight="700" fill="${c}">${label}</text>`;
  }

  // Frontend group
  groupBox(220, 80, 640, 340, 'Frontend — Next.js App', C.accent);

  // Frontend components
  compBox(260, 120, 160, 60, 'صفحة الهبوط', 'Landing Page', C.accent);
  compBox(460, 220, 150, 55, 'لوحة رئيس القسم', 'HOD Dashboard', C.accent);
  compBox(640, 220, 130, 55, 'لوحة الأستاذ', 'Professor', C.purple);
  compBox(260, 320, 130, 55, 'لوحة الموظف', 'Employee', C.blue);
  compBox(440, 320, 130, 55, 'لوحة الطالب', 'Student', C.green);

  // State Management group
  groupBox(220, 470, 300, 120, 'State Management', C.dark);
  compBox(260, 510, 220, 55, 'Store', 'useSyncExternalStore', C.dark);

  // Data Layer group
  groupBox(220, 640, 300, 200, 'Data Layer', C.dark);
  compBox(260, 680, 220, 55, 'Prisma ORM', 'Database Client', C.dark);
  compBox(260, 770, 220, 55, 'SQLite', 'Database File', C.orange);

  // Deployment group
  groupBox(920, 80, 420, 500, 'Deployment — Docker', C.orange);

  compBox(960, 140, 160, 60, 'Nginx', 'Reverse Proxy :80', C.orange);
  compBox(960, 250, 160, 60, 'Next.js', 'App Server :3000', C.accent);
  compBox(960, 360, 160, 60, 'PM2', 'Process Manager', C.red);
  compBox(960, 460, 160, 60, 'Docker', 'Container Engine', C.orange);

  // Arrows: Landing -> Dashboards
  s += `<line x1="340" y1="180" x2="535" y2="220" stroke="${C.accent}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ah)"/>`;
  s += `<line x1="340" y1="180" x2="705" y2="220" stroke="${C.purple}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ahp)"/>`;
  s += `<line x1="340" y1="180" x2="325" y2="320" stroke="${C.blue}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ahb)"/>`;
  s += `<line x1="340" y1="180" x2="505" y2="320" stroke="${C.green}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#ahg)"/>`;

  // Dashboards -> Store
  s += `<line x1="535" y1="275" x2="370" y2="510" stroke="${C.accent}" stroke-width="1.5" marker-end="url(#ah)"/>`;
  s += `<line x1="705" y1="275" x2="430" y2="510" stroke="${C.purple}" stroke-width="1.5" marker-end="url(#ahp)"/>`;
  s += `<line x1="325" y1="375" x2="340" y2="510" stroke="${C.blue}" stroke-width="1.5" marker-end="url(#ahb)"/>`;
  s += `<line x1="505" y1="375" x2="400" y2="510" stroke="${C.green}" stroke-width="1.5" marker-end="url(#ahg)"/>`;

  // Store -> Prisma
  s += `<line x1="370" y1="565" x2="370" y2="680" stroke="${C.dark}" stroke-width="2" marker-end="url(#ahd)"/>`;
  s += `<text x="385" y="630" font-size="11" fill="${C.light}">API Calls</text>`;

  // Prisma -> SQLite
  s += `<line x1="370" y1="735" x2="370" y2="770" stroke="${C.dark}" stroke-width="2" marker-end="url(#ahd)"/>`;
  s += `<text x="385" y="760" font-size="11" fill="${C.light}">ORM Queries</text>`;

  // Deployment connections
  s += `<line x1="1040" y1="200" x2="1040" y2="250" stroke="${C.orange}" stroke-width="2" marker-end="url(#aho)"/>`;
  s += `<line x1="1040" y1="310" x2="1040" y2="360" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
  s += `<line x1="1040" y1="420" x2="1040" y2="460" stroke="${C.red}" stroke-width="2" marker-end="url(#ahr)"/>`;

  // Frontend to Deployment
  s += `<line x1="860" y1="170" x2="960" y2="170" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
  s += `<text x="910" y="162" text-anchor="middle" font-size="11" fill="${C.light}">Docker Build</text>`;

  return basePage(`<svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">${defs}${s}</svg>`);
}

// ═══════════════════════════════════════════════
// 5. ACTIVITY DIAGRAM
// ═══════════════════════════════════════════════
function activitySVG() {
  let s = '';
  s += `<text x="700" y="38" text-anchor="middle" font-size="26" font-weight="700" fill="${C.text}">مخطط النشاط - تقديم طلب الطالب <tspan fill="${C.accent}">(Activity Diagram)</tspan></text>`;

  const cx = 500; // Center x of flow

  function nodeBox(x, y, w, h, label, borderColor) {
    const bc = borderColor || C.accent;
    s += `<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="8" fill="${C.white}" stroke="${bc}" stroke-width="2" filter="url(#shadow)"/>`;
    s += `<text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" font-weight="600" fill="${C.text}">${label}</text>`;
  }

  function diamond(x, y, label) {
    s += `<polygon points="${x},${y-35} ${x+50},${y} ${x},${y+35} ${x-50},${y}" fill="${C.white}" stroke="${C.orange}" stroke-width="2" filter="url(#shadow)"/>`;
    s += `<text x="${x}" y="${y+5}" text-anchor="middle" font-size="12" font-weight="700" fill="${C.orange}">${label}</text>`;
  }

  // Start node
  s += `<circle cx="${cx}" cy="80" r="18" fill="${C.accent}"/>`;
  s += `<line x1="${cx}" y1="98" x2="${cx}" y2="130" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Activity 1: Open dashboard
  nodeBox(cx, 155, 200, 44, 'الطالب يفتح لوحته');
  s += `<line x1="${cx}" y1="177" x2="${cx}" y2="210" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Activity 2: Choose type
  nodeBox(cx, 235, 200, 44, 'يختار نوع الطلب');
  s += `<line x1="${cx}" y1="257" x2="${cx}" y2="290" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Activity 3: Fill data
  nodeBox(cx, 315, 200, 44, 'يملأ البيانات');
  s += `<line x1="${cx}" y1="337" x2="${cx}" y2="380" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Decision 1: Complete?
  diamond(cx, 415, 'مكتمل؟');

  // No branch (loop back right)
  s += `<line x1="${cx+50}" y1="415" x2="${cx+180}" y2="415" stroke="${C.red}" stroke-width="2"/>`;
  s += `<line x1="${cx+180}" y1="415" x2="${cx+180}" y2="315" stroke="${C.red}" stroke-width="2"/>`;
  s += `<line x1="${cx+180}" y1="315" x2="${cx+100}" y2="315" stroke="${C.red}" stroke-width="2" marker-end="url(#ahr)"/>`;
  s += `<text x="${cx+100}" y="408" font-size="13" font-weight="700" fill="${C.red}">لا</text>`;

  // Yes branch down
  s += `<line x1="${cx}" y1="450" x2="${cx}" y2="490" stroke="${C.green}" stroke-width="2" marker-end="url(#ahg)"/>`;
  s += `<text x="${cx+15}" y="475" font-size="13" font-weight="700" fill="${C.green}">نعم</text>`;

  // Activity 4: Submit
  nodeBox(cx, 515, 200, 44, 'يرسل الطلب');

  // Arrow down to Store
  s += `<line x1="${cx}" y1="537" x2="${cx}" y2="570" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Store adds
  nodeBox(cx, 595, 200, 44, 'Store — يضيف الطلب', C.dark);

  // Arrow down
  s += `<line x1="${cx}" y1="617" x2="${cx}" y2="650" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Pending status
  nodeBox(cx, 675, 200, 44, '⏳ معلق (Pending)', C.orange);

  // Arrow down
  s += `<line x1="${cx}" y1="697" x2="${cx}" y2="740" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Decision 2: HOD review
  diamond(cx, 775, 'مراجعة');

  // Approved branch (left)
  s += `<line x1="${cx-50}" y1="775" x2="${cx-200}" y2="775" stroke="${C.green}" stroke-width="2"/>`;
  s += `<line x1="${cx-200}" y1="775" x2="${cx-200}" y2="850" stroke="${C.green}" stroke-width="2" marker-end="url(#ahg)"/>`;
  s += `<text x="${cx-120}" y="768" font-size="13" font-weight="700" fill="${C.green}">يقبل</text>`;

  // Approved end node
  nodeBox(cx-200, 880, 180, 44, '✓ مقبول (Approved)', C.green);
  s += `<circle cx="${cx-200}" cy="920" r="15" fill="${C.accent}" stroke="${C.text}" stroke-width="4"/>`;
  s += `<line x1="${cx-200}" y1="902" x2="${cx-200}" y2="905" stroke="${C.accent}" stroke-width="2"/>`;

  // Rejected branch (right)
  s += `<line x1="${cx+50}" y1="775" x2="${cx+200}" y2="775" stroke="${C.red}" stroke-width="2"/>`;
  s += `<line x1="${cx+200}" y1="775" x2="${cx+200}" y2="850" stroke="${C.red}" stroke-width="2" marker-end="url(#ahr)"/>`;
  s += `<text x="${cx+110}" y="768" font-size="13" font-weight="700" fill="${C.red}">يرفض</text>`;

  // Rejected end node
  nodeBox(cx+200, 880, 180, 44, '✗ مرفوض (Rejected)', C.red);
  s += `<circle cx="${cx+200}" cy="920" r="15" fill="${C.accent}" stroke="${C.text}" stroke-width="4"/>`;
  s += `<line x1="${cx+200}" y1="902" x2="${cx+200}" y2="905" stroke="${C.accent}" stroke-width="2"/>`;

  // Swimlane divider
  s += `<rect x="50" y="560" width="900" height="70" rx="8" fill="rgba(55,65,81,0.04)" stroke="${C.dark}" stroke-width="1" stroke-dasharray="4,3"/>`;
  s += `<text x="70" y="600" font-size="12" font-weight="600" fill="${C.dark}">🛠 Store Layer</text>`;

  // Swimlane: HOD Review
  s += `<rect x="50" y="740" width="900" height="80" rx="8" fill="rgba(76,110,245,0.04)" stroke="${C.accent}" stroke-width="1" stroke-dasharray="4,3"/>`;
  s += `<text x="70" y="780" font-size="12" font-weight="600" fill="${C.accent}">👤 رئيس القسم — مراجعة</text>`;

  return basePage(`<svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">${defs}${s}</svg>`);
}

// ═══════════════════════════════════════════════
// 6. DEPLOYMENT DIAGRAM
// ═══════════════════════════════════════════════
function deploymentSVG() {
  let s = '';
  s += `<text x="700" y="38" text-anchor="middle" font-size="26" font-weight="700" fill="${C.text}">مخطط النشر <tspan fill="${C.accent}">(Deployment Diagram)</tspan></text>`;

  function serverNode(x, y, w, h, label, sublabel, color, icon) {
    const c = color || C.accent;
    // 3D-like node
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.white}" stroke="${c}" stroke-width="2" filter="url(#shadow)"/>`;
    // Top accent bar
    s += `<rect x="${x}" y="${y}" width="${w}" height="8" rx="4" fill="${c}"/>`;
    // Icon area
    s += `<text x="${x+w/2}" y="${y+45}" text-anchor="middle" font-size="28">${icon}</text>`;
    s += `<text x="${x+w/2}" y="${y+75}" text-anchor="middle" font-size="15" font-weight="700" fill="${c}">${label}</text>`;
    if (sublabel) {
      s += `<text x="${x+w/2}" y="${y+95}" text-anchor="middle" font-size="11" fill="${C.light}">${sublabel}</text>`;
    }
  }

  function serverGroup(x, y, w, h, label, color) {
    const c = color || C.border;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="rgba(233,238,243,0.3)" stroke="${c}" stroke-width="2"/>`;
    s += `<text x="${x+w-14}" y="${y-8}" text-anchor="end" font-size="14" font-weight="700" fill="${c}">${label}</text>`;
  }

  // ── CLIENT ZONE ──
  serverGroup(40, 80, 260, 240, 'العميل — Client', C.blue);
  serverNode(75, 120, 190, 110, 'متصفح العميل', 'Chrome / Firefox / Edge', C.blue, '🌐');

  // ── NETWORK ZONE ──
  serverGroup(380, 80, 200, 240, 'الشبكة', C.orange);
  serverNode(410, 120, 140, 110, 'Nginx', 'Reverse Proxy :443', C.orange, '🔀');

  // ── SERVER ZONE ──
  serverGroup(660, 80, 700, 680, 'الخادم — Server', C.accent);

  // Docker Container
  s += `<rect x="700" y="120" width="620" height="260" rx="14" fill="rgba(245,158,11,0.04)" stroke="${C.orange}" stroke-width="2.5" stroke-dasharray="10,5"/>`;
  s += `<text x="1010" y="150" text-anchor="middle" font-size="16" font-weight="700" fill="${C.orange}">🐳 Docker Container</text>`;

  serverNode(730, 170, 180, 110, 'Next.js App', 'Node.js 18 — Port :3000', C.accent, '⚡');
  serverNode(940, 170, 160, 110, 'PM2', 'Process Manager', C.red, '🔄');

  // Database
  serverNode(730, 420, 220, 110, 'SQLite Database', 'prisma/db.sqlite (Volume)', C.orange, '🗃️');

  // Prisma ORM
  serverNode(990, 420, 180, 110, 'Prisma ORM', 'Database Client', C.dark, '🔌');

  // GitHub / CI
  serverNode(730, 580, 180, 110, 'GitHub', 'Repository / CI-CD', '#6B7B8D', '📦');

  // VPS
  serverNode(960, 580, 200, 110, 'VPS Server', 'Linux • Docker Engine', C.dark, '🖥️');

  // Connection arrows
  // Client -> Nginx
  s += `<line x1="300" y1="190" x2="410" y2="190" stroke="${C.accent}" stroke-width="2.5" marker-end="url(#ah)"/>`;
  s += `<rect x="330" y="172" width="60" height="18" rx="4" fill="${C.bg}" stroke="${C.border}" stroke-width="1"/>`;
  s += `<text x="360" y="185" text-anchor="middle" font-size="10" font-weight="600" fill="${C.light}">HTTPS</text>`;

  // Nginx -> Next.js
  s += `<line x1="550" y1="190" x2="730" y2="240" stroke="${C.orange}" stroke-width="2.5" marker-end="url(#aho)"/>`;
  s += `<rect x="610" y="195" width="80" height="18" rx="4" fill="${C.bg}" stroke="${C.border}" stroke-width="1"/>`;
  s += `<text x="650" y="208" text-anchor="middle" font-size="10" font-weight="600" fill="${C.light}">:80→:3000</text>`;

  // Next.js -> PM2
  s += `<line x1="910" y1="225" x2="940" y2="225" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;

  // Next.js -> Prisma
  s += `<line x1="820" y1="280" x2="820" y2="420" stroke="${C.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
  s += `<text x="835" y="360" font-size="11" fill="${C.light}">API Calls</text>`;

  // Prisma -> SQLite
  s += `<line x1="990" y1="475" x2="950" y2="475" stroke="${C.dark}" stroke-width="2" marker-end="url(#ahd)"/>`;

  // GitHub -> VPS
  s += `<line x1="910" y1="635" x2="960" y2="635" stroke="#6B7B8D" stroke-width="2" marker-end="url(#ahd)"/>`;
  s += `<text x="935" y="625" font-size="10" fill="${C.light}">git pull</text>`;

  // Volume label
  s += `<rect x="750" y="500" width="180" height="24" rx="6" fill="rgba(245,158,11,0.1)" stroke="${C.orange}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  s += `<text x="840" y="516" text-anchor="middle" font-size="11" font-weight="700" fill="${C.orange}">📁 Docker Volume</text>`;

  return basePage(`<svg width="1400" height="1000" xmlns="http://www.w3.org/2000/svg">${defs}${s}</svg>`);
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
async function main() {
  console.log('🎨 Generating 6 Professional UML Diagrams...\n');

  const diagrams = [
    { name: 'uml-use-case.png', gen: useCaseSVG },
    { name: 'uml-class.png', gen: classSVG },
    { name: 'uml-sequence.png', gen: sequenceSVG },
    { name: 'uml-component.png', gen: componentSVG },
    { name: 'uml-activity.png', gen: activitySVG },
    { name: 'uml-deployment.png', gen: deploymentSVG },
  ];

  const paths = [];
  for (const d of diagrams) {
    try {
      const html = d.gen();
      const p = await renderDiagram(html, d.name);
      paths.push(p);
    } catch (err) {
      console.error(`  ✗ ${d.name}: ${err.message}`);
    }
  }

  console.log('\n📊 All diagrams generated successfully!');
  paths.forEach(p => console.log(`  📁 ${p}`));
}

main().catch(console.error);
