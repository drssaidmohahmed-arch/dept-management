export type UserRole = 'hod' | 'professor' | 'employee' | 'student';

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  hod: 'رئيس القسم',
  professor: 'عضو هيئة التدريس',
  employee: 'الموظف الإداري',
  student: 'الطالب',
};

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user-1',
    email: 'hod@univ.edu',
    password: 'hod123',
    name: 'د. أحمد محمد الشريف',
    role: 'hod',
    avatar: 'أ',
  },
  {
    id: 'user-2',
    email: 'professor@univ.edu',
    password: 'prof123',
    name: 'د. فاطمة علي الحسن',
    role: 'professor',
    avatar: 'ف',
  },
  {
    id: 'user-3',
    email: 'employee@univ.edu',
    password: 'emp123',
    name: 'أ. سارة محمود زايد',
    role: 'employee',
    avatar: 'س',
  },
  {
    id: 'user-4',
    email: 'student@univ.edu',
    password: 'stu123',
    name: 'عبدالله محمد الشهري',
    role: 'student',
    avatar: 'ع',
  },
];

export function authenticateUser(email: string, password: string): AuthUser | null {
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return null;
  // Return user without password
  const { password: _pw, ...authUser } = user;
  return authUser;
}
