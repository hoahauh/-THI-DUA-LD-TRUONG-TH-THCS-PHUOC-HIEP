import { 
  SchoolClass, 
  CriteriaItem, 
  CrossCheckAssignment, 
  InfractionRecord, 
  SchoolLevel, 
  ShiftType, 
  CriteriaCategory, 
  CriteriaType,
  SheetImportResult,
  MergeStrategy
} from '../types';

/**
 * Trích xuất Spreadsheet ID từ URL Google Sheets
 */
export const extractSpreadsheetId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  
  // Trường hợp người dùng nhập trực tiếp ID
  if (/^[a-zA-Z0-9-_]{25,60}$/.test(trimmed)) {
    return trimmed;
  }

  // Trường hợp đường dẫn URL chuẩn: https://docs.google.com/spreadsheets/d/{ID}/edit...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

/**
 * Phân tích cú pháp CSV / TSV chuẩn xác, hỗ trợ dấu ngoặc kép, dấu phẩy, tab, xuống dòng và UTF-8 BOM
 */
export const parseCSV = (csvText: string): string[][] => {
  if (!csvText) return [];
  
  // Loại bỏ BOM nếu có
  let text = csvText.replace(/^\uFEFF/, '').trim();
  if (!text) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  // Phát hiện dấu phân cách (dấu phẩy , hoặc tab \t hoặc chấm phẩy ;)
  const firstLine = text.split('\n')[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t') && (firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = '\t';
  } else if (!firstLine.includes(',') && firstLine.includes(';')) {
    delimiter = ';';
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentCell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // Bỏ qua carriage return
        continue;
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Xử lý ô cuối cùng nếu còn sót
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

/**
 * Phân tích dữ liệu Nhật ký vi phạm từ các hàng CSV hoặc Google Sheets
 */
export const parseRecordsFromRows = (rows: string[][]): InfractionRecord[] => {
  if (!rows || rows.length === 0) return [];

  // Xác định dòng tiêu đề nếu có
  let startIndex = 0;
  const firstRow = rows[0].map(c => c.toLowerCase());
  if (firstRow.some(c => c.includes('mã') || c.includes('lớp') || c.includes('học sinh') || c.includes('tiêu chí') || c.includes('điểm'))) {
    startIndex = 1;
  }

  const records: InfractionRecord[] = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3 || !row.some(c => c.trim().length > 0)) continue;

    // Cấu trúc cột chuẩn từ Sheets:
    // 0: id
    // 1: timestamp
    // 2: date
    // 3: weekNumber
    // 4: level
    // 5: classId
    // 6: studentName
    // 7: criteriaId
    // 8: criteriaName
    // 9: criteriaCategory
    // 10: points
    // 11: shift
    // 12: reporterName
    // 13: status
    // 14: note

    const id = row[0] && row[0].trim().length > 0 
      ? row[0].trim() 
      : `LOG-SHEET-${Date.now()}-${i}`;

    const timestamp = row[1] && row[1].trim().length > 0 ? row[1].trim() : new Date().toISOString();
    const date = row[2] && row[2].trim().length > 0 ? row[2].trim() : timestamp.slice(0, 10);
    const weekNumber = Number(row[3]) || 24;
    
    // Tự động suy ra cấp trường dựa trên lớp nếu không ghi rõ
    let classId = (row[5] || row[4] || '').trim().toUpperCase();
    if (!classId && row[2] && /^[0-9][A-Z][0-9]?$/i.test(row[2].trim())) {
      classId = row[2].trim().toUpperCase();
    }

    let level: SchoolLevel = 'tieuhoc';
    const firstDigit = classId.charAt(0);
    if (['6', '7', '8', '9'].includes(firstDigit) || (row[4] && row[4].toLowerCase().includes('thcs'))) {
      level = 'thcs';
    }

    const studentName = row[6] ? row[6].trim() : 'Tập thể';
    const criteriaId = row[7] ? row[7].trim() : 'VP-01';
    const criteriaName = row[8] ? row[8].trim() : (row[7] || 'Vi phạm nề nếp');
    
    let criteriaCategory: CriteriaCategory = 'nenep';
    const catRaw = (row[9] || '').toLowerCase();
    if (catRaw.includes('chuyen') || catRaw.includes('cần')) criteriaCategory = 'chuyencan';
    else if (catRaw.includes('phuc') || catRaw.includes('phục')) criteriaCategory = 'dongphuc';
    else if (catRaw.includes('ve') || catRaw.includes('sinh')) criteriaCategory = 'vesinh';
    else if (catRaw.includes('phong') || catRaw.includes('trao')) criteriaCategory = 'phongtrao';

    const pointsRaw = Number(row[10]);
    const points = isNaN(pointsRaw) ? -2 : pointsRaw;
    const type: CriteriaType = points >= 0 ? 'plus' : 'minus';

    let shift: ShiftType = 'daugio';
    const shiftRaw = (row[11] || '').toLowerCase();
    if (shiftRaw.includes('choi') || shiftRaw.includes('chơi')) shift = 'rachoi';
    else if (shiftRaw.includes('xep') || shiftRaw.includes('hàng')) shift = 'xephang';
    else if (shiftRaw.includes('cuoi') || shiftRaw.includes('cuối')) shift = 'cuoibuoi';

    const reporterName = row[12] ? row[12].trim() : 'Cờ đỏ trực ban';
    const statusRaw = (row[13] || '').toLowerCase();
    let status: InfractionRecord['status'] = 'verified';
    if (statusRaw.includes('khiếu') || statusRaw.includes('dispute')) status = 'disputed';
    else if (statusRaw.includes('chờ') || statusRaw.includes('pending')) status = 'pending';
    else if (statusRaw.includes('xong') || statusRaw.includes('resolve')) status = 'resolved';

    const note = row[14] ? row[14].trim() : '';

    if (classId) {
      records.push({
        id,
        timestamp,
        date,
        weekNumber,
        level,
        classId,
        studentName,
        criteriaId,
        criteriaName,
        criteriaCategory,
        points,
        type,
        shift,
        reporterName,
        reporterRole: 'codo',
        note,
        status
      });
    }
  }

  return records;
};

/**
 * Phân tích dữ liệu Tiêu chí quy định từ CSV
 */
export const parseCriteriaFromRows = (rows: string[][]): CriteriaItem[] => {
  if (!rows || rows.length === 0) return [];
  let startIndex = 0;
  if (rows[0].some(c => c.toLowerCase().includes('tiêu chí') || c.toLowerCase().includes('mã'))) {
    startIndex = 1;
  }

  const list: CriteriaItem[] = [];
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    const id = row[0] ? row[0].trim() : `TC-${i}`;
    let category: CriteriaCategory = 'nenep';
    const catStr = (row[1] || '').toLowerCase();
    if (catStr.includes('chuyen')) category = 'chuyencan';
    else if (catStr.includes('dong') || catStr.includes('phuc')) category = 'dongphuc';
    else if (catStr.includes('ve') || catStr.includes('sinh')) category = 'vesinh';
    else if (catStr.includes('phong') || catStr.includes('trao')) category = 'phongtrao';

    const name = row[2] ? row[2].trim() : 'Quy định nề nếp';
    const typeStr = (row[3] || '').toLowerCase();
    const ptsRaw = Number(row[4]);
    const points = isNaN(ptsRaw) ? (typeStr.includes('cộng') ? 3 : -2) : ptsRaw;
    const type: CriteriaType = points >= 0 ? 'plus' : 'minus';

    const levelStr = (row[5] || '').toLowerCase();
    let applicableLevels: SchoolLevel[] = ['tieuhoc', 'thcs'];
    if (levelStr.includes('tieu') && !levelStr.includes('thcs')) applicableLevels = ['tieuhoc'];
    else if (levelStr.includes('thcs') && !levelStr.includes('tieu')) applicableLevels = ['thcs'];

    const description = row[6] ? row[6].trim() : '';

    list.push({
      id,
      category,
      name,
      type,
      points,
      applicableLevels,
      description
    });
  }

  return list;
};

/**
 * Phân tích dữ liệu Phân công Cờ đỏ từ CSV
 */
export const parseAssignmentsFromRows = (rows: string[][]): CrossCheckAssignment[] => {
  if (!rows || rows.length === 0) return [];
  let startIndex = 0;
  if (rows[0].some(c => c.toLowerCase().includes('phân công') || c.toLowerCase().includes('cờ đỏ'))) {
    startIndex = 1;
  }

  const list: CrossCheckAssignment[] = [];
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;

    const id = row[0] ? row[0].trim() : `PC-${i}`;
    const studentId = row[1] ? row[1].trim() : `CD-${i}`;
    const studentName = row[2] ? row[2].trim() : 'Học sinh cờ đỏ';
    const fromClass = row[3] ? row[3].trim().toUpperCase() : '5A1';
    const targetClass = row[4] ? row[4].trim().toUpperCase() : '4A1';

    const levelStr = (row[5] || '').toLowerCase();
    const level: SchoolLevel = levelStr.includes('thcs') || ['6', '7', '8', '9'].includes(fromClass.charAt(0)) 
      ? 'thcs' 
      : 'tieuhoc';

    let shift: ShiftType = 'daugio';
    const shiftStr = (row[6] || '').toLowerCase();
    if (shiftStr.includes('choi')) shift = 'rachoi';
    else if (shiftStr.includes('xep')) shift = 'xephang';
    else if (shiftStr.includes('cuoi')) shift = 'cuoibuoi';

    const dayOfWeek = row[7] ? row[7].trim() : 'Cả tuần';
    const isActive = row[8] ? !row[8].toLowerCase().includes('dừng') : true;

    list.push({
      id,
      studentId,
      studentName,
      fromClass,
      targetClass,
      level,
      shift,
      dayOfWeek,
      isActive
    });
  }

  return list;
};

/**
 * Dữ liệu mẫu thực tế của TRƯỜNG TH&THCS PHƯỚC HIỆP
 * Giúp người dùng thử nghiệm nhận dữ liệu ngay lập tức nếu chưa có sẵn Google Sheets cá nhân
 */
export const SAMPLE_PHUOC_HIEP_SHEET_DATA = {
  records: [
    {
      id: 'PH-REC-2401',
      timestamp: '2026-09-26T07:15:00',
      date: '2026-09-26',
      weekNumber: 24,
      level: 'tieuhoc' as SchoolLevel,
      classId: '5A1',
      studentName: 'Tập thể 5A1',
      criteriaId: 'VS-06',
      criteriaName: 'Lớp học sạch đẹp, xếp bàn ghế ngăn nắp chuẩn mẫu',
      criteriaCategory: 'vesinh' as CriteriaCategory,
      points: 3,
      type: 'plus' as CriteriaType,
      shift: 'daugio' as ShiftType,
      reporterName: 'Đỗ Tuấn Minh (4A1)',
      reporterRole: 'codo' as const,
      note: 'Lớp 5A1 trực nhật rất sạch sẽ, hoa tươi trang trí đẹp mắt',
      status: 'verified' as const
    },
    {
      id: 'PH-REC-2402',
      timestamp: '2026-09-26T07:25:00',
      date: '2026-09-26',
      weekNumber: 24,
      level: 'tieuhoc' as SchoolLevel,
      classId: '3A2',
      studentName: 'Nguyễn Văn Hải',
      criteriaId: 'CC-01',
      criteriaName: 'Đi học muộn (sau 7h15)',
      criteriaCategory: 'chuyencan' as CriteriaCategory,
      points: -2,
      type: 'minus' as CriteriaType,
      shift: 'daugio' as ShiftType,
      reporterName: 'Đoàn Phương Linh (5A2)',
      reporterRole: 'codo' as const,
      note: 'Đến cổng trường 7h25 do xe hỏng',
      status: 'verified' as const
    },
    {
      id: 'PH-REC-2403',
      timestamp: '2026-09-26T08:35:00',
      date: '2026-09-26',
      weekNumber: 24,
      level: 'thcs' as SchoolLevel,
      classId: '8A1',
      studentName: 'Phan Văn Hậu',
      criteriaId: 'PT-01',
      criteriaName: 'Nhặt được của rơi, trả lại người mất',
      criteriaCategory: 'phongtrao' as CriteriaCategory,
      points: 5,
      type: 'plus' as CriteriaType,
      shift: 'rachoi' as ShiftType,
      reporterName: 'Đỗ Tuấn Khải (9A1)',
      reporterRole: 'codo' as const,
      note: 'Nhặt được ví tiền có 150.000đ rơi ở sân bóng và nộp lại phòng Đoàn Đội',
      status: 'verified' as const
    },
    {
      id: 'PH-REC-2404',
      timestamp: '2026-09-26T09:10:00',
      date: '2026-09-26',
      weekNumber: 24,
      level: 'thcs' as SchoolLevel,
      classId: '7A2',
      studentName: 'Lê Minh Quân',
      criteriaId: 'DP-01',
      criteriaName: 'Không đeo khăn quàng đỏ',
      criteriaCategory: 'dongphuc' as CriteriaCategory,
      points: -2,
      type: 'minus' as CriteriaType,
      shift: 'rachoi' as ShiftType,
      reporterName: 'Nguyễn Hoàng Long (8A1)',
      reporterRole: 'codo' as const,
      note: 'Giờ ra chơi không mang khăn quàng',
      status: 'verified' as const
    },
    {
      id: 'PH-REC-2405',
      timestamp: '2026-09-26T11:20:00',
      date: '2026-09-26',
      weekNumber: 24,
      level: 'thcs' as SchoolLevel,
      classId: '9A2',
      studentName: 'Trần Gia Bảo',
      criteriaId: 'NN-03',
      criteriaName: 'Sử dụng điện thoại trong giờ không có phép',
      criteriaCategory: 'nenep' as CriteriaCategory,
      points: -10,
      type: 'minus' as CriteriaType,
      shift: 'cuoibuoi' as ShiftType,
      reporterName: 'Bùi Thảo Vy (9A2)',
      reporterRole: 'codo' as const,
      note: 'Chơi game trong giờ sinh hoạt lớp',
      status: 'verified' as const
    }
  ]
};
