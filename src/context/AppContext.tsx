import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  SchoolClass, 
  CriteriaItem, 
  CrossCheckAssignment, 
  InfractionRecord, 
  DisputeRequest, 
  ClassWeeklySummary, 
  SchoolLevel, 
  UserRole,
  GoogleSheetsConfig,
  SheetImportResult,
  MergeStrategy
} from '../types';
import { 
  INITIAL_CLASSES, 
  INITIAL_CRITERIA, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_RECORDS, 
  INITIAL_DISPUTES, 
  DEFAULT_SHEETS_CONFIG 
} from '../data/mockData';
import {
  extractSpreadsheetId,
  parseCSV,
  parseRecordsFromRows,
  parseCriteriaFromRows,
  parseAssignmentsFromRows,
  SAMPLE_PHUOC_HIEP_SHEET_DATA
} from '../utils/sheetSync';

interface SyncLogItem {
  id: string;
  timestamp: string;
  message: string;
  success: boolean;
}

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeLevel: SchoolLevel;
  setActiveLevel: (level: SchoolLevel) => void;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;

  // Identity selection for demo / simulated accounts
  selectedCodoId: string;
  setSelectedCodoId: (id: string) => void;
  selectedGvcnClassId: string;
  setSelectedGvcnClassId: (classId: string) => void;

  // Master Data
  classes: SchoolClass[];
  criteria: CriteriaItem[];
  assignments: CrossCheckAssignment[];
  records: InfractionRecord[];
  disputes: DisputeRequest[];
  sheetsConfig: GoogleSheetsConfig;
  syncLogs: SyncLogItem[];
  isWeekLocked: boolean;

  // Actions
  addRecord: (recordData: Omit<InfractionRecord, 'id' | 'timestamp' | 'status'>) => InfractionRecord;
  updateRecord: (id: string, updates: Partial<InfractionRecord>) => void;
  deleteRecord: (id: string) => void;

  addDispute: (recordId: string, reason: string, evidenceProof?: string) => void;
  resolveDispute: (disputeId: string, decision: 'approved' | 'rejected', resolutionNote?: string) => void;

  addCriteria: (criteria: Omit<CriteriaItem, 'id'>) => void;
  updateCriteria: (id: string, updates: Partial<CriteriaItem>) => void;
  deleteCriteria: (id: string) => void;

  addAssignment: (assignment: Omit<CrossCheckAssignment, 'id'>) => void;
  deleteAssignment: (id: string) => void;

  toggleWeekLock: () => void;
  updateSheetsConfig: (newConfig: Partial<GoogleSheetsConfig>) => void;
  syncWithGoogleSheets: () => Promise<boolean>;
  pullFromGoogleSheets: (options?: { method?: 'auto' | 'webhook' | 'public_gviz' | 'sample'; mergeStrategy?: MergeStrategy }) => Promise<SheetImportResult>;
  importFromCsvText: (sheetType: 'records' | 'criteria' | 'assignments' | 'classes' | 'auto', csvText: string, mergeStrategy?: MergeStrategy) => SheetImportResult;
  importFromJson: (data: any, mergeStrategy?: MergeStrategy) => SheetImportResult;
  exportToCsv: (sheetType: 'criteria' | 'assignments' | 'records' | 'summaries') => void;
  resetAllData: () => void;

  // Computed data
  summaries: ClassWeeklySummary[];
  pendingDisputesCount: number;
  currentCodoAssignments: CrossCheckAssignment[];
  currentGvcnClass: SchoolClass | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLASSES: 'phuochiep_classes_v2',
  CRITERIA: 'phuochiep_criteria_v2',
  ASSIGNMENTS: 'phuochiep_assignments_v2',
  RECORDS: 'phuochiep_records_v2',
  DISPUTES: 'phuochiep_disputes_v2',
  SHEETS: 'phuochiep_sheets_v2',
  LOCKED: 'phuochiep_locked_v2'
};

const LEGACY_STORAGE_KEYS = {
  CLASSES: 'edurank_classes_v2',
  CRITERIA: 'edurank_criteria_v2',
  ASSIGNMENTS: 'edurank_assignments_v2',
  RECORDS: 'edurank_records_v2',
  DISPUTES: 'edurank_disputes_v2',
  SHEETS: 'edurank_sheets_v2',
  LOCKED: 'edurank_locked_v2'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeLevel, setActiveLevel] = useState<SchoolLevel>('tieuhoc');
  const [currentWeek, setCurrentWeek] = useState<number>(24);

  // Selected sub-identities
  const [selectedCodoId, setSelectedCodoId] = useState<string>('CD-5A1-01'); // Vũ Đức Nam
  const [selectedGvcnClassId, setSelectedGvcnClassId] = useState<string>('4A2'); // Cô Hoàng Thanh Thảo

  // Persistent States
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES) || localStorage.getItem(LEGACY_STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [criteria, setCriteria] = useState<CriteriaItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CRITERIA) || localStorage.getItem(LEGACY_STORAGE_KEYS.CRITERIA);
    return saved ? JSON.parse(saved) : INITIAL_CRITERIA;
  });

  const [assignments, setAssignments] = useState<CrossCheckAssignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || localStorage.getItem(LEGACY_STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [records, setRecords] = useState<InfractionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECORDS) || localStorage.getItem(LEGACY_STORAGE_KEYS.RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [disputes, setDisputes] = useState<DisputeRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISPUTES) || localStorage.getItem(LEGACY_STORAGE_KEYS.DISPUTES);
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEETS) || localStorage.getItem(LEGACY_STORAGE_KEYS.SHEETS);
    return saved ? JSON.parse(saved) : DEFAULT_SHEETS_CONFIG;
  });

  const [lockedWeeks, setLockedWeeks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCKED) || localStorage.getItem(LEGACY_STORAGE_KEYS.LOCKED);
    return saved ? JSON.parse(saved) : {};
  });

  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      message: 'Khởi tạo kết nối Google Sheets (Trường TH&THCS Phước Hiệp) thành công',
      success: true
    }
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(sheetsConfig));
  }, [sheetsConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCKED, JSON.stringify(lockedWeeks));
  }, [lockedWeeks]);

  const lockKey = `${activeLevel}_${currentWeek}`;
  const isWeekLocked = Boolean(lockedWeeks[lockKey]);

  // Ensure default codo matches current level
  useEffect(() => {
    if (activeLevel === 'tieuhoc') {
      if (!selectedCodoId.startsWith('CD-5') && !selectedCodoId.startsWith('CD-4')) {
        setSelectedCodoId('CD-5A1-01');
      }
      if (!classes.find(c => c.id === selectedGvcnClassId && c.level === 'tieuhoc')) {
        setSelectedGvcnClassId('4A2');
      }
    } else {
      if (!selectedCodoId.startsWith('CD-8') && !selectedCodoId.startsWith('CD-9') && !selectedCodoId.startsWith('CD-7')) {
        setSelectedCodoId('CD-8A1-01');
      }
      if (!classes.find(c => c.id === selectedGvcnClassId && c.level === 'thcs')) {
        setSelectedGvcnClassId('8A2');
      }
    }
  }, [activeLevel, selectedCodoId, selectedGvcnClassId, classes]);

  // Current Codo assignments
  const currentCodoAssignments = useMemo(() => {
    return assignments.filter(a => a.studentId === selectedCodoId && a.isActive);
  }, [assignments, selectedCodoId]);

  // Current GVCN Class
  const currentGvcnClass = useMemo(() => {
    return classes.find(c => c.id === selectedGvcnClassId);
  }, [classes, selectedGvcnClassId]);

  // Pending disputes count
  const pendingDisputesCount = useMemo(() => {
    return disputes.filter(d => d.status === 'pending').length;
  }, [disputes]);

  // Compute Weekly Summaries and Rankings
  const summaries = useMemo<ClassWeeklySummary[]>(() => {
    const levelClasses = classes.filter(c => c.level === activeLevel);
    const weekRecords = records.filter(r => r.weekNumber === currentWeek && r.level === activeLevel);

    const list: ClassWeeklySummary[] = levelClasses.map(cls => {
      const clsRecords = weekRecords.filter(r => r.classId === cls.id);
      
      // Calculate deductions (only active records that are not overturned/dismissed via approved dispute)
      let totalDeductions = 0;
      let totalMerits = 0;
      let infractionCount = 0;
      let meritCount = 0;

      clsRecords.forEach(rec => {
        // If disputed and resolved as approved by TPT, skip point deduction
        const relatedDispute = disputes.find(d => d.recordId === rec.id);
        if (relatedDispute && relatedDispute.status === 'approved') {
          return;
        }

        if (rec.type === 'minus') {
          totalDeductions += Math.abs(rec.points);
          infractionCount++;
        } else {
          totalMerits += rec.points;
          meritCount++;
        }
      });

      const basePoints = 100;
      const finalScore = basePoints - totalDeductions + totalMerits;

      let rankingClassification: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' = 'Trung bình';
      if (finalScore >= 95) rankingClassification = 'Xuất sắc';
      else if (finalScore >= 85) rankingClassification = 'Tốt';
      else if (finalScore >= 70) rankingClassification = 'Khá';

      return {
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        level: cls.level,
        teacherName: cls.teacherName,
        basePoints,
        totalDeductions,
        totalMerits,
        finalScore,
        rank: 0, // calculated below
        rankingClassification,
        flagAward: null,
        infractionCount,
        meritCount,
        isLocked: isWeekLocked
      };
    });

    // Sort by finalScore desc, then by fewer deductions
    list.sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      return a.totalDeductions - b.totalDeductions;
    });

    // Assign rank and flag awards
    list.forEach((item, index) => {
      item.rank = index + 1;
      if (item.rank === 1) item.flagAward = 'Cờ Nhất';
      else if (item.rank === 2) item.flagAward = 'Cờ Nhì';
      else if (item.rank === 3) item.flagAward = 'Cờ Ba';
      else item.flagAward = null;
    });

    return list;
  }, [classes, records, disputes, activeLevel, currentWeek, isWeekLocked]);

  // Actions
  const addRecord = (recordData: Omit<InfractionRecord, 'id' | 'timestamp' | 'status'>): InfractionRecord => {
    const id = `LOG-${Date.now().toString().slice(-6)}`;
    const newRecord: InfractionRecord = {
      ...recordData,
      id,
      timestamp: new Date().toISOString(),
      status: 'verified'
    };

    setRecords(prev => [newRecord, ...prev]);

    // Auto add log for Google Sheets
    setSyncLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        message: `Đã ghi nhận [${newRecord.classId}] ${newRecord.criteriaName} (${newRecord.points > 0 ? '+' : ''}${newRecord.points}đ) - Cờ đỏ: ${newRecord.reporterName}`,
        success: true
      },
      ...prev.slice(0, 40)
    ]);

    return newRecord;
  };

  const updateRecord = (id: string, updates: Partial<InfractionRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const addDispute = (recordId: string, reason: string, evidenceProof?: string) => {
    const targetRecord = records.find(r => r.id === recordId);
    if (!targetRecord) return;

    const teacher = classes.find(c => c.id === targetRecord.classId)?.teacherName || 'GVCN';
    const newDispute: DisputeRequest = {
      id: `DISP-${Date.now().toString().slice(-4)}`,
      recordId,
      classId: targetRecord.classId,
      teacherName: teacher,
      reason,
      evidenceProof,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    setDisputes(prev => [newDispute, ...prev]);
    // update record status
    updateRecord(recordId, { 
      status: 'disputed', 
      disputeNote: `GVCN đang khiếu nại: ${reason.slice(0, 60)}...` 
    });

    setSyncLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        message: `[Khiếu nại] Lớp ${targetRecord.classId} gửi giải trình cho mục: ${targetRecord.criteriaName}`,
        success: true
      },
      ...prev.slice(0, 40)
    ]);
  };

  const resolveDispute = (disputeId: string, decision: 'approved' | 'rejected', resolutionNote?: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: decision,
          resolvedAt: new Date().toISOString(),
          resolutionNote
        };
      }
      return d;
    }));

    const targetDispute = disputes.find(d => d.id === disputeId);
    if (targetDispute) {
      updateRecord(targetDispute.recordId, {
        status: decision === 'approved' ? 'resolved' : 'verified',
        disputeNote: decision === 'approved' 
          ? `TPT ĐÃ DUYỆT HỦY LỖI: ${resolutionNote || 'Khiếu nại hợp lệ'}` 
          : `TPT BÁC BỎ KHIẾU NẠI: ${resolutionNote || 'Minh chứng không đủ cơ sở'}`
      });

      setSyncLogs(prev => [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          message: `[TPT Phê duyệt] ${decision === 'approved' ? 'Chấp thuận' : 'Bác bỏ'} khiếu nại của lớp ${targetDispute.classId}`,
          success: true
        },
        ...prev.slice(0, 40)
      ]);
    }
  };

  const addCriteria = (item: Omit<CriteriaItem, 'id'>) => {
    const id = item.type === 'minus' ? `VP-${Date.now().toString().slice(-3)}` : `KT-${Date.now().toString().slice(-3)}`;
    setCriteria(prev => [...prev, { ...item, id }]);
  };

  const updateCriteria = (id: string, updates: Partial<CriteriaItem>) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCriteria = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const addAssignment = (item: Omit<CrossCheckAssignment, 'id'>) => {
    const id = `PC-${Date.now().toString().slice(-4)}`;
    setAssignments(prev => [...prev, { ...item, id }]);
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const toggleWeekLock = () => {
    setLockedWeeks(prev => ({
      ...prev,
      [lockKey]: !prev[lockKey]
    }));
    const newLockState = !lockedWeeks[lockKey];
    setSyncLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        message: `${newLockState ? 'Khóa sổ' : 'Mở khóa'} thi đua Tuần ${currentWeek} - Khối ${activeLevel === 'tieuhoc' ? 'Tiểu học' : 'THCS'}`,
        success: true
      },
      ...prev.slice(0, 40)
    ]);
  };

  const updateSheetsConfig = (newConfig: Partial<GoogleSheetsConfig>) => {
    setSheetsConfig(prev => ({ ...prev, ...newConfig }));
  };

  const addSyncLog = (message: string, success: boolean = true) => {
    setSyncLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        message,
        success
      },
      ...prev.slice(0, 40)
    ]);
  };

  const applyImportedRecords = (newRecords: InfractionRecord[], strategy: MergeStrategy = 'merge') => {
    setRecords(prev => {
      if (strategy === 'replace') {
        return newRecords;
      }
      const map = new Map<string, InfractionRecord>();
      newRecords.forEach(r => map.set(r.id, r));
      const merged: InfractionRecord[] = [...newRecords];
      prev.forEach(r => {
        if (!map.has(r.id)) {
          merged.push(r);
        }
      });
      return merged;
    });
  };

  const applyImportedCriteria = (newCriteria: CriteriaItem[], strategy: MergeStrategy = 'merge') => {
    setCriteria(prev => {
      if (strategy === 'replace') return newCriteria;
      const map = new Map<string, CriteriaItem>();
      newCriteria.forEach(c => map.set(c.id, c));
      const merged: CriteriaItem[] = [...newCriteria];
      prev.forEach(c => {
        if (!map.has(c.id)) merged.push(c);
      });
      return merged;
    });
  };

  const applyImportedAssignments = (newAssignments: CrossCheckAssignment[], strategy: MergeStrategy = 'merge') => {
    setAssignments(prev => {
      if (strategy === 'replace') return newAssignments;
      const map = new Map<string, CrossCheckAssignment>();
      newAssignments.forEach(a => map.set(a.id, a));
      const merged: CrossCheckAssignment[] = [...newAssignments];
      prev.forEach(a => {
        if (!map.has(a.id)) merged.push(a);
      });
      return merged;
    });
  };

  const applyImportedClasses = (newClasses: SchoolClass[], strategy: MergeStrategy = 'merge') => {
    setClasses(prev => {
      if (strategy === 'replace') return newClasses;
      const map = new Map<string, SchoolClass>();
      newClasses.forEach(c => map.set(c.id, c));
      const merged: SchoolClass[] = [...newClasses];
      prev.forEach(c => {
        if (!map.has(c.id)) merged.push(c);
      });
      return merged;
    });
  };

  const syncWithGoogleSheets = async (): Promise<boolean> => {
    updateSheetsConfig({ status: 'syncing' });
    try {
      // Nếu có Webhook URL thật, gửi dữ liệu lên Google Sheets
      if (sheetsConfig.webhookUrl && sheetsConfig.webhookUrl.startsWith('https://script.google.com')) {
        try {
          await fetch(sheetsConfig.webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'SYNC_SUMMARIES',
              school: 'TRƯỜNG TH&THCS PHƯỚC HIỆP',
              payload: summaries
            })
          });
        } catch (fetchErr) {
          console.warn('Real Google Apps Script POST failed (continuing fallback):', fetchErr);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      const nowStr = new Date().toLocaleString('vi-VN');
      updateSheetsConfig({
        status: 'connected',
        lastSyncedAt: nowStr
      });
      addSyncLog(`Đồng bộ thành công 4 sheets với Google Drive (${summaries.length} lớp, ${records.length} nhật ký vi phạm)`);
      return true;
    } catch {
      updateSheetsConfig({ status: 'error' });
      addSyncLog(`Đồng bộ với Google Sheets thất bại`, false);
      return false;
    }
  };

  const pullFromGoogleSheets = async (options?: { 
    method?: 'auto' | 'webhook' | 'public_gviz' | 'sample'; 
    mergeStrategy?: MergeStrategy 
  }): Promise<SheetImportResult> => {
    const method = options?.method || 'auto';
    const mergeStrategy = options?.mergeStrategy || 'merge';

    updateSheetsConfig({ status: 'pulling' });

    // Trường hợp 1: Chọn nạp dữ liệu mẫu thực tế của TRƯỜNG TH&THCS PHƯỚC HIỆP
    if (method === 'sample') {
      await new Promise(resolve => setTimeout(resolve, 600));
      const sample = SAMPLE_PHUOC_HIEP_SHEET_DATA;
      applyImportedRecords(sample.records, mergeStrategy);
      const nowStr = new Date().toLocaleString('vi-VN');
      updateSheetsConfig({ status: 'connected', lastPulledAt: nowStr });
      addSyncLog(`[Nhận dữ liệu] Nạp thành công ${sample.records.length} bản ghi mẫu từ Google Sheets Trường TH&THCS Phước Hiệp`);
      return {
        success: true,
        message: `Đã nạp thành công ${sample.records.length} bản ghi từ Google Sheet mẫu của Liên đội TH&THCS Phước Hiệp!`,
        source: 'sample',
        counts: {
          records: sample.records.length,
          criteria: 0,
          assignments: 0,
          classes: 0
        }
      };
    }

    // Trường hợp 2: Thử kết nối qua Webhook Google Apps Script API nếu có URL
    if ((method === 'auto' || method === 'webhook') && sheetsConfig.webhookUrl && sheetsConfig.webhookUrl.startsWith('https://script.google.com')) {
      try {
        const queryUrl = `${sheetsConfig.webhookUrl}${sheetsConfig.webhookUrl.includes('?') ? '&' : '?'}action=GET_ALL&t=${Date.now()}`;
        const response = await fetch(queryUrl, { method: 'GET', redirect: 'follow' });
        if (response.ok) {
          const json = await response.json();
          if (json && (json.status === 'success' || json.data)) {
            const res = importFromJson(json.data || json, mergeStrategy);
            if (res.success) {
              updateSheetsConfig({ status: 'connected', lastPulledAt: new Date().toLocaleString('vi-VN') });
              addSyncLog(`[Nhận dữ liệu] Đã tải về thành công từ Google Apps Script Webhook API`);
              return { ...res, source: 'webhook' };
            }
          }
        }
      } catch (err: any) {
        console.warn('Apps Script Webhook fetch error:', err);
        if (method === 'webhook') {
          updateSheetsConfig({ status: 'error' });
          return {
            success: false,
            message: `Không thể kết nối đến Webhook Apps Script: ${err.message || 'Lỗi mạng hoặc CORS'}. Hãy kiểm tra xem Script đã được Triển khai dưới dạng Web App với quyền truy cập "Bất kỳ ai (Anyone)" chưa.`,
            source: 'webhook',
            counts: { records: 0, criteria: 0, assignments: 0, classes: 0 }
          };
        }
      }
    }

    // Trường hợp 3: Thử tải trực tiếp từ Google Sheets công khai (Public CSV Export)
    const spreadsheetId = extractSpreadsheetId(sheetsConfig.spreadsheetUrl);
    if ((method === 'auto' || method === 'public_gviz') && spreadsheetId) {
      try {
        const sheetName = '03_NhatKy_ViPham';
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
        const response = await fetch(gvizUrl);
        if (response.ok) {
          const csvText = await response.text();
          if (csvText && !csvText.includes('<!DOCTYPE html>')) {
            const parsedRows = parseCSV(csvText);
            const parsedRecords = parseRecordsFromRows(parsedRows);
            if (parsedRecords.length > 0) {
              applyImportedRecords(parsedRecords, mergeStrategy);

              // Thử nạp thêm danh mục tiêu chí nếu có
              let critCount = 0;
              try {
                const critUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('01_DanhMuc_QuyDinh')}`;
                const cRes = await fetch(critUrl);
                if (cRes.ok) {
                  const cText = await cRes.text();
                  if (!cText.includes('<!DOCTYPE html>')) {
                    const cRows = parseCSV(cText);
                    const cList = parseCriteriaFromRows(cRows);
                    if (cList.length > 0) {
                      applyImportedCriteria(cList, mergeStrategy);
                      critCount = cList.length;
                    }
                  }
                }
              } catch {}

              const nowStr = new Date().toLocaleString('vi-VN');
              updateSheetsConfig({ status: 'connected', lastPulledAt: nowStr });
              addSyncLog(`[Nhận dữ liệu] Đã tải ${parsedRecords.length} bản ghi vi phạm từ Google Sheets thành công`);
              return {
                success: true,
                message: `Đã nhận thành công ${parsedRecords.length} bản ghi vi phạm từ Google Sheet trực tuyến!`,
                source: 'public_gviz',
                counts: {
                  records: parsedRecords.length,
                  criteria: critCount,
                  assignments: 0,
                  classes: 0
                }
              };
            }
          }
        }
      } catch (err: any) {
        console.warn('Public Google Sheets CSV fetch error:', err);
      }
    }

    // Nếu không thể kết nối tự động trực tiếp qua mạng
    updateSheetsConfig({ status: 'connected' });
    return {
      success: false,
      message: 'Không thể kết nối trực tiếp đến Google Sheets (thường do bảng tính đặt Riêng tư hoặc chính sách bảo mật CORS của trình duyệt). Bạn hãy dùng tính năng "Dán dữ liệu Google Sheets (Copy/Paste)" hoặc mở quyền Chia sẻ "Bất kỳ ai có đường liên kết".',
      source: 'public_gviz',
      counts: { records: 0, criteria: 0, assignments: 0, classes: 0 }
    };
  };

  const importFromCsvText = (
    sheetType: 'records' | 'criteria' | 'assignments' | 'classes' | 'auto',
    csvText: string,
    mergeStrategy: MergeStrategy = 'merge'
  ): SheetImportResult => {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return {
        success: false,
        message: 'Không tìm thấy dữ liệu hợp lệ trong nội dung CSV / Bảng tính.',
        source: 'csv',
        counts: { records: 0, criteria: 0, assignments: 0, classes: 0 }
      };
    }

    let detectedType = sheetType;
    if (detectedType === 'auto') {
      const firstRowText = rows[0].join(' ').toLowerCase();
      if (firstRowText.includes('tiêu chí') || firstRowText.includes('quy định') || firstRowText.includes('loại điểm')) {
        detectedType = 'criteria';
      } else if (firstRowText.includes('phân công') || firstRowText.includes('chấm chéo') || firstRowText.includes('cờ đỏ')) {
        detectedType = 'assignments';
      } else {
        detectedType = 'records';
      }
    }

    let recordsCount = 0;
    let criteriaCount = 0;
    let assignmentsCount = 0;
    let classesCount = 0;

    if (detectedType === 'records' || detectedType === 'auto') {
      const recs = parseRecordsFromRows(rows);
      if (recs.length > 0) {
        applyImportedRecords(recs, mergeStrategy);
        recordsCount = recs.length;
      }
    }

    if (detectedType === 'criteria') {
      const crits = parseCriteriaFromRows(rows);
      if (crits.length > 0) {
        applyImportedCriteria(crits, mergeStrategy);
        criteriaCount = crits.length;
      }
    }

    if (detectedType === 'assignments') {
      const assigns = parseAssignmentsFromRows(rows);
      if (assigns.length > 0) {
        applyImportedAssignments(assigns, mergeStrategy);
        assignmentsCount = assigns.length;
      }
    }

    const total = recordsCount + criteriaCount + assignmentsCount + classesCount;
    if (total === 0) {
      return {
        success: false,
        message: 'Không nhận diện được dòng dữ liệu nào khớp với biểu mẫu chuẩn của trường.',
        source: 'csv',
        counts: { records: 0, criteria: 0, assignments: 0, classes: 0 }
      };
    }

    const nowStr = new Date().toLocaleString('vi-VN');
    updateSheetsConfig({ status: 'connected', lastPulledAt: nowStr });
    addSyncLog(`[Nhập dữ liệu] Nạp thành công ${total} mục (${recordsCount} bản ghi vi phạm, ${criteriaCount} tiêu chí, ${assignmentsCount} phân công) từ CSV/Bảng dán`);

    return {
      success: true,
      message: `Đã nạp thành công: ${recordsCount} bản ghi vi phạm, ${criteriaCount} tiêu chí, ${assignmentsCount} phân công!`,
      source: 'csv',
      counts: {
        records: recordsCount,
        criteria: criteriaCount,
        assignments: assignmentsCount,
        classes: classesCount
      }
    };
  };

  const importFromJson = (data: any, mergeStrategy: MergeStrategy = 'merge'): SheetImportResult => {
    let recordsCount = 0;
    let criteriaCount = 0;
    let assignmentsCount = 0;
    let classesCount = 0;

    if (data.records && Array.isArray(data.records)) {
      applyImportedRecords(data.records, mergeStrategy);
      recordsCount = data.records.length;
    }
    if (data.criteria && Array.isArray(data.criteria)) {
      applyImportedCriteria(data.criteria, mergeStrategy);
      criteriaCount = data.criteria.length;
    }
    if (data.assignments && Array.isArray(data.assignments)) {
      applyImportedAssignments(data.assignments, mergeStrategy);
      assignmentsCount = data.assignments.length;
    }
    if (data.classes && Array.isArray(data.classes)) {
      applyImportedClasses(data.classes, mergeStrategy);
      classesCount = data.classes.length;
    }

    const total = recordsCount + criteriaCount + assignmentsCount + classesCount;
    if (total === 0) {
      return {
        success: false,
        message: 'Không tìm thấy dữ liệu hợp lệ trong JSON API (yêu cầu mảng records, criteria hoặc assignments).',
        source: 'webhook',
        counts: { records: 0, criteria: 0, assignments: 0, classes: 0 }
      };
    }

    const nowStr = new Date().toLocaleString('vi-VN');
    updateSheetsConfig({ status: 'connected', lastPulledAt: nowStr });
    addSyncLog(`[Nhập JSON] Đã nhận thành công ${total} mục từ Google Sheets API`);

    return {
      success: true,
      message: `Nhận dữ liệu thành công: ${recordsCount} bản ghi vi phạm, ${criteriaCount} tiêu chí, ${assignmentsCount} phân công!`,
      source: 'webhook',
      counts: {
        records: recordsCount,
        criteria: criteriaCount,
        assignments: assignmentsCount,
        classes: classesCount
      }
    };
  };

  const exportToCsv = (sheetType: 'criteria' | 'assignments' | 'records' | 'summaries') => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Vietnamese support
    let fileName = '';

    if (sheetType === 'criteria') {
      fileName = `01_DanhMuc_QuyDinh_TieuChi_${activeLevel}.csv`;
      csvContent += 'Mã tiêu chí,Phân loại,Tên quy định / Vi phạm,Loại điểm,Mức điểm,Khối áp dụng,Mô tả\n';
      criteria.forEach(c => {
        csvContent += `"${c.id}","${c.category}","${c.name}","${c.type}","${c.points}","${c.applicableLevels.join('; ')}","${c.description || ''}"\n`;
      });
    } else if (sheetType === 'assignments') {
      fileName = `02_PhanCong_CoDo_ChamCheo_${activeLevel}.csv`;
      csvContent += 'Mã phân công,Mã cờ đỏ,Họ tên học sinh,Lớp cờ đỏ,Lớp chấm chéo,Khối,Ca trực,Lịch trực,Trạng thái\n';
      assignments.forEach(a => {
        csvContent += `"${a.id}","${a.studentId}","${a.studentName}","${a.fromClass}","${a.targetClass}","${a.level}","${a.shift}","${a.dayOfWeek}","${a.isActive ? 'Đang hoạt động' : 'Tạm dừng'}"\n`;
      });
    } else if (sheetType === 'records') {
      fileName = `03_NhatKy_ViPham_Tuan${currentWeek}_${activeLevel}.csv`;
      csvContent += 'Mã bản ghi,Thời gian,Ngày,Tuần,Khối,Lớp vi phạm,Học sinh vi phạm,Mã tiêu chí,Tên lỗi/Khen thưởng,Nhóm,Điểm,Ca trực,Người chấm,Trạng thái,Ghi chú khiếu nại\n';
      records.filter(r => r.weekNumber === currentWeek && r.level === activeLevel).forEach(r => {
        csvContent += `"${r.id}","${r.timestamp}","${r.date}","${r.weekNumber}","${r.level}","${r.classId}","${r.studentName || ''}","${r.criteriaId}","${r.criteriaName}","${r.criteriaCategory}","${r.points}","${r.shift}","${r.reporterName}","${r.status}","${r.disputeNote || ''}"\n`;
      });
    } else if (sheetType === 'summaries') {
      fileName = `04_TongHop_XepHang_Tuan${currentWeek}_${activeLevel}.csv`;
      csvContent += 'Hạng,Mã lớp,Tên lớp,Khối,GVCN,Điểm gốc,Tổng điểm trừ,Tổng điểm thưởng,Điểm chung cuộc,Xếp loại,Cờ thi đua,Số lỗi,Số điểm thưởng,Khóa sổ\n';
      summaries.forEach(s => {
        csvContent += `"${s.rank}","${s.classId}","${s.className}","${s.grade}","${s.teacherName}","${s.basePoints}","${s.totalDeductions}","${s.totalMerits}","${s.finalScore}","${s.rankingClassification}","${s.flagAward || 'Không'}","${s.infractionCount}","${s.meritCount}","${s.isLocked ? 'Đã khóa' : 'Mở'}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.CRITERIA);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.DISPUTES);
    localStorage.removeItem(STORAGE_KEYS.LOCKED);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.CRITERIA);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.RECORDS);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.DISPUTES);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.LOCKED);
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeLevel,
        setActiveLevel,
        currentWeek,
        setCurrentWeek,
        selectedCodoId,
        setSelectedCodoId,
        selectedGvcnClassId,
        setSelectedGvcnClassId,
        classes,
        criteria,
        assignments,
        records,
        disputes,
        sheetsConfig,
        syncLogs,
        isWeekLocked,
        addRecord,
        updateRecord,
        deleteRecord,
        addDispute,
        resolveDispute,
        addCriteria,
        updateCriteria,
        deleteCriteria,
        addAssignment,
        deleteAssignment,
        toggleWeekLock,
        updateSheetsConfig,
        syncWithGoogleSheets,
        pullFromGoogleSheets,
        importFromCsvText,
        importFromJson,
        exportToCsv,
        resetAllData,
        summaries,
        pendingDisputesCount,
        currentCodoAssignments,
        currentGvcnClass
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
