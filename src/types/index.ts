export type SchoolLevel = 'tieuhoc' | 'thcs';

export type UserRole = 'admin' | 'codo' | 'gvcn';

export interface SchoolClass {
  id: string; // e.g. '1A1', '6A2'
  name: string;
  grade: number; // 1 to 9
  level: SchoolLevel;
  teacherName: string;
  studentCount: number;
  room: string;
  teamLeader: string; // Chi đội trưởng / Lớp trưởng
}

export type CriteriaType = 'minus' | 'plus'; // Trừ điểm vi phạm hoặc Cộng điểm thưởng

export type CriteriaCategory = 
  | 'chuyencan'      // Chuyên cần (Đi muộn, vắng...)
  | 'dongphuc'       // Đồng phục & Tác phong (Khăn quàng, dép lê, phù hiệu...)
  | 'nenep'          // Nề nếp - Kỷ luật (Trật tự, điện thoại, ăn quà, gian lận...)
  | 'vesinh'         // Vệ sinh & Môi trường (Trực nhật, rác, bàn ghế...)
  | 'phongtrao';     // Phong trào & Điểm cộng (Điểm tốt, việc tốt, ủng hộ...)

export interface CriteriaItem {
  id: string; // e.g. 'VP-01', 'KT-02'
  category: CriteriaCategory;
  name: string;
  type: CriteriaType;
  points: number; // e.g. -2, -5, +5
  description?: string;
  applicableLevels: SchoolLevel[]; // ['tieuhoc'], ['thcs'], or both
}

export type ShiftType = 'daugio' | 'rachoi' | 'xephang' | 'cuoibuoi';

export interface CrossCheckAssignment {
  id: string;
  studentId: string;
  studentName: string;
  fromClass: string; // Lớp của Cờ đỏ
  targetClass: string; // Lớp được phân công chấm
  level: SchoolLevel;
  shift: ShiftType;
  dayOfWeek: string; // 'Thứ Hai'..'Thứ Sáu' or 'Cả tuần'
  isActive: boolean;
}

export type RecordStatus = 'pending' | 'verified' | 'disputed' | 'resolved';

export interface InfractionRecord {
  id: string; // e.g. 'LOG-20260927-01'
  timestamp: string; // ISO string or format
  date: string; // YYYY-MM-DD
  weekNumber: number; // Tuần học, e.g. 24
  level: SchoolLevel;
  classId: string;
  studentName?: string; // Tên học sinh hoặc "Tập thể lớp"
  criteriaId: string;
  criteriaName: string;
  criteriaCategory: CriteriaCategory;
  points: number; // -2, -5, +5
  type: CriteriaType;
  shift: ShiftType;
  reporterName: string; // Tên Cờ đỏ / GV
  reporterRole: 'codo' | 'admin' | 'gv';
  note?: string;
  evidenceUrl?: string; // Link ảnh minh chứng
  status: RecordStatus;
  disputeNote?: string;
}

export interface DisputeRequest {
  id: string;
  recordId: string;
  classId: string;
  teacherName: string;
  reason: string;
  evidenceProof?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface ClassWeeklySummary {
  classId: string;
  className: string;
  grade: number;
  level: SchoolLevel;
  teacherName: string;
  basePoints: number; // 100
  totalDeductions: number;
  totalMerits: number;
  finalScore: number;
  rank: number;
  rankingClassification: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình';
  flagAward?: 'Cờ Nhất' | 'Cờ Nhì' | 'Cờ Ba' | null;
  infractionCount: number;
  meritCount: number;
  isLocked: boolean;
}

export type MergeStrategy = 'replace' | 'merge';

export interface SheetImportResult {
  success: boolean;
  message: string;
  source: 'webhook' | 'public_gviz' | 'csv' | 'paste' | 'sample';
  counts: {
    records: number;
    criteria: number;
    assignments: number;
    classes: number;
  };
  errors?: string[];
}

export interface GoogleSheetsConfig {
  spreadsheetUrl: string;
  webhookUrl: string;
  isAutoSyncEnabled: boolean;
  lastSyncedAt: string | null;
  lastPulledAt: string | null;
  status: 'connected' | 'disconnected' | 'syncing' | 'pulling' | 'error';
}

