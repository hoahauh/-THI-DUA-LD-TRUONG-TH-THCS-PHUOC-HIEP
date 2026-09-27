import { 
  SchoolClass, 
  CriteriaItem, 
  CrossCheckAssignment, 
  InfractionRecord, 
  DisputeRequest,
  GoogleSheetsConfig
} from '../types';

// Danh sách 19 Lớp Tiểu học và 12 Lớp THCS
export const INITIAL_CLASSES: SchoolClass[] = [
  // --- KHỐI TIỂU HỌC (19 LỚP) ---
  // Khối 1
  { id: '1A1', name: 'Lớp 1A1', grade: 1, level: 'tieuhoc', teacherName: 'Cô Nguyễn Thị Mai', studentCount: 34, room: 'Phòng 101', teamLeader: 'Trần Bảo An' },
  { id: '1A2', name: 'Lớp 1A2', grade: 1, level: 'tieuhoc', teacherName: 'Cô Lê Hoàng Yến', studentCount: 35, room: 'Phòng 102', teamLeader: 'Phạm Đức Duy' },
  { id: '1A3', name: 'Lớp 1A3', grade: 1, level: 'tieuhoc', teacherName: 'Cô Đỗ Quỳnh Nga', studentCount: 33, room: 'Phòng 103', teamLeader: 'Vũ Ngọc Hân' },
  { id: '1A4', name: 'Lớp 1A4', grade: 1, level: 'tieuhoc', teacherName: 'Cô Bùi Kim Ngân', studentCount: 34, room: 'Phòng 104', teamLeader: 'Hoàng Minh Khôi' },
  // Khối 2
  { id: '2A1', name: 'Lớp 2A1', grade: 2, level: 'tieuhoc', teacherName: 'Cô Trần Ánh Tuyết', studentCount: 36, room: 'Phòng 105', teamLeader: 'Đặng Tuấn Kiệt' },
  { id: '2A2', name: 'Lớp 2A2', grade: 2, level: 'tieuhoc', teacherName: 'Thầy Phạm Thanh Tùng', studentCount: 35, room: 'Phòng 106', teamLeader: 'Lê Thảo My' },
  { id: '2A3', name: 'Lớp 2A3', grade: 2, level: 'tieuhoc', teacherName: 'Cô Hoàng Thu Hà', studentCount: 35, room: 'Phòng 107', teamLeader: 'Nguyễn Gia Huy' },
  { id: '2A4', name: 'Lớp 2A4', grade: 2, level: 'tieuhoc', teacherName: 'Cô Phan Minh Trang', studentCount: 34, room: 'Phòng 108', teamLeader: 'Trịnh Linh Đan' },
  // Khối 3
  { id: '3A1', name: 'Lớp 3A1', grade: 3, level: 'tieuhoc', teacherName: 'Cô Đinh Thúy Hằng', studentCount: 36, room: 'Phòng 201', teamLeader: 'Phan Quốc Bảo' },
  { id: '3A2', name: 'Lớp 3A2', grade: 3, level: 'tieuhoc', teacherName: 'Thầy Vũ Đình Trọng', studentCount: 35, room: 'Phòng 202', teamLeader: 'Lý Mai Anh' },
  { id: '3A3', name: 'Lớp 3A3', grade: 3, level: 'tieuhoc', teacherName: 'Cô Ngô Phương Thảo', studentCount: 36, room: 'Phòng 203', teamLeader: 'Nguyễn Tiến Dũng' },
  { id: '3A4', name: 'Lớp 3A4', grade: 3, level: 'tieuhoc', teacherName: 'Cô Dương Thị Loan', studentCount: 35, room: 'Phòng 204', teamLeader: 'Bùi Hà Linh' },
  // Khối 4
  { id: '4A1', name: 'Lớp 4A1', grade: 4, level: 'tieuhoc', teacherName: 'Cô Trịnh Thanh Nga', studentCount: 36, room: 'Phòng 205', teamLeader: 'Đỗ Tuấn Minh' },
  { id: '4A2', name: 'Lớp 4A2', grade: 4, level: 'tieuhoc', teacherName: 'Cô Hoàng Thanh Thảo', studentCount: 35, room: 'Phòng 206', teamLeader: 'Nguyễn Châu Anh' },
  { id: '4A3', name: 'Lớp 4A3', grade: 4, level: 'tieuhoc', teacherName: 'Thầy Nguyễn Trọng Tín', studentCount: 37, room: 'Phòng 207', teamLeader: 'Lê Minh Triết' },
  { id: '4A4', name: 'Lớp 4A4', grade: 4, level: 'tieuhoc', teacherName: 'Cô Tạ Kim Oanh', studentCount: 36, room: 'Phòng 208', teamLeader: 'Phạm Yến Nhi' },
  // Khối 5
  { id: '5A1', name: 'Lớp 5A1', grade: 5, level: 'tieuhoc', teacherName: 'Thầy Lê Quốc Dũng', studentCount: 38, room: 'Phòng 301', teamLeader: 'Vũ Đức Nam' },
  { id: '5A2', name: 'Lớp 5A2', grade: 5, level: 'tieuhoc', teacherName: 'Cô Trần Hải Yến', studentCount: 37, room: 'Phòng 302', teamLeader: 'Đoàn Phương Linh' },
  { id: '5A3', name: 'Lớp 5A3', grade: 5, level: 'tieuhoc', teacherName: 'Cô Nguyễn Bích Diệp', studentCount: 38, room: 'Phòng 303', teamLeader: 'Trần Gia Bách' },

  // --- KHỐI THCS (12 LỚP) ---
  // Khối 6
  { id: '6A1', name: 'Lớp 6A1', grade: 6, level: 'thcs', teacherName: 'Cô Lưu Diệu Thúy', studentCount: 40, room: 'Phòng B101', teamLeader: 'Phan Minh Khang' },
  { id: '6A2', name: 'Lớp 6A2', grade: 6, level: 'thcs', teacherName: 'Thầy Nguyễn Cao Cường', studentCount: 41, room: 'Phòng B102', teamLeader: 'Đinh Hà My' },
  { id: '6A3', name: 'Lớp 6A3', grade: 6, level: 'thcs', teacherName: 'Cô Đào Phương Linh', studentCount: 39, room: 'Phòng B103', teamLeader: 'Hoàng Quốc Việt' },
  // Khối 7
  { id: '7A1', name: 'Lớp 7A1', grade: 7, level: 'thcs', teacherName: 'Thầy Trịnh Xuân Bắc', studentCount: 42, room: 'Phòng B201', teamLeader: 'Ngô Thùy Trang' },
  { id: '7A2', name: 'Lớp 7A2', grade: 7, level: 'thcs', teacherName: 'Cô Lê Thanh Tâm', studentCount: 40, room: 'Phòng B202', teamLeader: 'Vũ Hải Đăng' },
  { id: '7A3', name: 'Lớp 7A3', grade: 7, level: 'thcs', teacherName: 'Thầy Bùi Văn Nam', studentCount: 41, room: 'Phòng B203', teamLeader: 'Trần Mai Chi' },
  // Khối 8
  { id: '8A1', name: 'Lớp 8A1', grade: 8, level: 'thcs', teacherName: 'Thầy Vũ Đức Hùng', studentCount: 42, room: 'Phòng B301', teamLeader: 'Nguyễn Hoàng Long' },
  { id: '8A2', name: 'Lớp 8A2', grade: 8, level: 'thcs', teacherName: 'Cô Đoàn Thu Trang', studentCount: 43, room: 'Phòng B302', teamLeader: 'Lê Bảo Châu' },
  { id: '8A3', name: 'Lớp 8A3', grade: 8, level: 'thcs', teacherName: 'Thầy Trần Đình Toàn', studentCount: 40, room: 'Phòng B303', teamLeader: 'Phạm Thế Vinh' },
  // Khối 9
  { id: '9A1', name: 'Lớp 9A1', grade: 9, level: 'thcs', teacherName: 'Cô Mai Quỳnh Chi', studentCount: 42, room: 'Phòng B401', teamLeader: 'Đỗ Tuấn Khải' },
  { id: '9A2', name: 'Lớp 9A2', grade: 9, level: 'thcs', teacherName: 'Thầy Nguyễn Trọng Hải', studentCount: 41, room: 'Phòng B402', teamLeader: 'Bùi Thảo Vy' },
  { id: '9A3', name: 'Lớp 9A3', grade: 9, level: 'thcs', teacherName: 'Cô Trần Bích Hạnh', studentCount: 42, room: 'Phòng B403', teamLeader: 'Nguyễn Quang Huy' }
];

// Danh mục Tiêu chí Chấm điểm (Quy chuẩn Đội TNTP Hồ Chí Minh)
export const INITIAL_CRITERIA: CriteriaItem[] = [
  // Chuyên cần
  { id: 'CC-01', category: 'chuyencan', name: 'Đi học muộn (sau 7h15)', type: 'minus', points: -2, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 2đ/học sinh' },
  { id: 'CC-02', category: 'chuyencan', name: 'Nghỉ học không phép / Không giấy', type: 'minus', points: -5, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 5đ/học sinh' },
  { id: 'CC-03', category: 'chuyencan', name: 'Trốn tiết / Ra khỏi cổng trường không phép', type: 'minus', points: -10, applicableLevels: ['thcs'], description: 'Vi phạm kỷ luật nghiêm trọng' },
  { id: 'CC-04', category: 'chuyencan', name: 'Tập thể 100% chuyên cần đúng giờ', type: 'plus', points: 3, applicableLevels: ['tieuhoc', 'thcs'], description: 'Thưởng nề nếp toàn buổi' },

  // Đồng phục & Tác phong
  { id: 'DP-01', category: 'dongphuc', name: 'Không đeo khăn quàng đỏ', type: 'minus', points: -2, applicableLevels: ['tieuhoc', 'thcs'], description: 'Áp dụng cho Đội viên (Khối 3-9)' },
  { id: 'DP-02', category: 'dongphuc', name: 'Không mặc đúng đồng phục / Áo khoác sai quy định', type: 'minus', points: -3, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 3đ/học sinh' },
  { id: 'DP-03', category: 'dongphuc', name: 'Đi dép lê / Không quai hậu / Không sơ vin', type: 'minus', points: -2, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 2đ/học sinh' },
  { id: 'DP-04', category: 'dongphuc', name: 'Nhuộm tóc / Son phấn / Trang sức sai quy định', type: 'minus', points: -5, applicableLevels: ['thcs'], description: 'Áp dụng học sinh THCS' },
  { id: 'DP-05', category: 'dongphuc', name: 'Không mang phù hiệu / Thẻ học sinh', type: 'minus', points: -2, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 2đ/học sinh' },

  // Nề nếp - Kỷ luật
  { id: 'NN-01', category: 'nenep', name: 'Mất trật tự trong giờ học / Truy bài 15 phút', type: 'minus', points: -3, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 3đ/lần nhắc nhở' },
  { id: 'NN-02', category: 'nenep', name: 'Xếp hàng thể dục / Chào cờ lộn xộn', type: 'minus', points: -4, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ vào điểm nề nếp tập thể' },
  { id: 'NN-03', category: 'nenep', name: 'Sử dụng điện thoại trong giờ không có phép', type: 'minus', points: -10, applicableLevels: ['thcs'], description: 'Tịch thu máy nộp BGH' },
  { id: 'NN-04', category: 'nenep', name: 'Nói tục, chửi thề / Gây gổ, đánh nhau', type: 'minus', points: -15, applicableLevels: ['tieuhoc', 'thcs'], description: 'Kỷ luật mức cao' },
  { id: 'NN-05', category: 'nenep', name: 'Ăn quà vặt trong lớp / Bày bừa', type: 'minus', points: -3, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 3đ/học sinh' },
  { id: 'NN-06', category: 'nenep', name: 'Gian lận trong kiểm tra / Quay cóp', type: 'minus', points: -10, applicableLevels: ['thcs'], description: 'Hạ bậc hạnh kiểm' },

  // Vệ sinh & Môi trường
  { id: 'VS-01', category: 'vesinh', name: 'Trực nhật bẩn / Chưa quét lớp, lau bảng', type: 'minus', points: -5, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 5đ/buổi' },
  { id: 'VS-02', category: 'vesinh', name: 'Không đổ rác / Thùng rác tràn', type: 'minus', points: -3, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 3đ/buổi' },
  { id: 'VS-03', category: 'vesinh', name: 'Xả rác bừa bãi ra hành lang / Sân trường', type: 'minus', points: -4, applicableLevels: ['tieuhoc', 'thcs'], description: 'Trừ 4đ/học sinh' },
  { id: 'VS-04', category: 'vesinh', name: 'Không tắt quạt / Điện khi ra khỏi phòng', type: 'minus', points: -5, applicableLevels: ['tieuhoc', 'thcs'], description: 'Lãng phí năng lượng' },
  { id: 'VS-05', category: 'vesinh', name: 'Viết vẽ bậy lên bàn, tường lớp học', type: 'minus', points: -8, applicableLevels: ['tieuhoc', 'thcs'], description: 'Phá hoại của công' },
  { id: 'VS-06', category: 'vesinh', name: 'Lớp học sạch đẹp, xếp bàn ghế ngăn nắp chuẩn mẫu', type: 'plus', points: 3, applicableLevels: ['tieuhoc', 'thcs'], description: 'Thưởng điểm trực nhật tốt' },

  // Phong trào & Điểm cộng
  { id: 'PT-01', category: 'phongtrao', name: 'Nhặt được của rơi, trả lại người mất', type: 'plus', points: 5, applicableLevels: ['tieuhoc', 'thcs'], description: 'Tuyên dương gương người tốt việc tốt' },
  { id: 'PT-02', category: 'phongtrao', name: 'Đạt giải Nhất/Nhì phong trào Đội cấp trường', type: 'plus', points: 10, applicableLevels: ['tieuhoc', 'thcs'], description: 'Văn nghệ, thể thao, hội thi' },
  { id: 'PT-03', category: 'phongtrao', name: 'Đạt từ 5 điểm 10 trở lên trong tuần', type: 'plus', points: 5, applicableLevels: ['tieuhoc', 'thcs'], description: 'Khuyến khích học tốt' },
  { id: 'PT-04', category: 'phongtrao', name: 'Tập thể tham gia 100% phong trào Kế hoạch nhỏ', type: 'plus', points: 5, applicableLevels: ['tieuhoc', 'thcs'], description: 'Vượt chỉ tiêu thu gom giấy' }
];

// Danh sách Phân công Chấm chéo Đội Cờ đỏ
export const INITIAL_ASSIGNMENTS: CrossCheckAssignment[] = [
  // Tiểu học
  { id: 'PC-TH-01', studentId: 'CD-5A1-01', studentName: 'Vũ Đức Nam', fromClass: '5A1', targetClass: '4A2', level: 'tieuhoc', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-TH-02', studentId: 'CD-5A1-02', studentName: 'Nguyễn Mai Chi', fromClass: '5A1', targetClass: '4A1', level: 'tieuhoc', shift: 'rachoi', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-TH-03', studentId: 'CD-5A2-01', studentName: 'Đoàn Phương Linh', fromClass: '5A2', targetClass: '3A4', level: 'tieuhoc', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-TH-04', studentId: 'CD-5A2-02', studentName: 'Bùi Đức Anh', fromClass: '5A2', targetClass: '3A1', level: 'tieuhoc', shift: 'xephang', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-TH-05', studentId: 'CD-5A3-01', studentName: 'Trần Gia Bách', fromClass: '5A3', targetClass: '2A3', level: 'tieuhoc', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-TH-06', studentId: 'CD-5A3-02', studentName: 'Lê Thùy Dương', fromClass: '5A3', targetClass: '1A1', level: 'tieuhoc', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-TH-07', studentId: 'CD-4A1-01', studentName: 'Đỗ Tuấn Minh', fromClass: '4A1', targetClass: '5A2', level: 'tieuhoc', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-TH-08', studentId: 'CD-4A2-01', studentName: 'Nguyễn Châu Anh', fromClass: '4A2', targetClass: '5A1', level: 'tieuhoc', shift: 'cuoibuoi', dayOfWeek: 'Cả tuần', isActive: true },

  // THCS
  { id: 'PC-THCS-01', studentId: 'CD-8A1-01', studentName: 'Nguyễn Hoàng Long', fromClass: '8A1', targetClass: '7A2', level: 'thcs', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-THCS-02', studentId: 'CD-8A1-02', studentName: 'Lê Thu Hương', fromClass: '8A1', targetClass: '6A3', level: 'thcs', shift: 'rachoi', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-THCS-03', studentId: 'CD-8A2-01', studentName: 'Lê Bảo Châu', fromClass: '8A2', targetClass: '9A1', level: 'thcs', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-THCS-04', studentId: 'CD-8A3-01', studentName: 'Phạm Thế Vinh', fromClass: '8A3', targetClass: '6A1', level: 'thcs', shift: 'xephang', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-THCS-05', studentId: 'CD-9A1-01', studentName: 'Đỗ Tuấn Khải', fromClass: '9A1', targetClass: '8A2', level: 'thcs', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-THCS-06', studentId: 'CD-9A2-01', studentName: 'Bùi Thảo Vy', fromClass: '9A2', targetClass: '7A1', level: 'thcs', shift: 'cuoibuoi', dayOfWeek: 'Cả tuần', isActive: true },
  { id: 'PC-THCS-07', studentId: 'CD-7A1-01', studentName: 'Ngô Thùy Trang', fromClass: '7A1', targetClass: '8A3', level: 'thcs', shift: 'daugio', dayOfWeek: 'Cả tuần', isActive: true }
];

// Danh sách Nhật ký Vi phạm / Khen thưởng mẫu cho Tuần 24
export const INITIAL_RECORDS: InfractionRecord[] = [
  // Khối Tiểu học
  {
    id: 'LOG-20260925-001',
    timestamp: '2026-09-25T07:22:00',
    date: '2026-09-25',
    weekNumber: 24,
    level: 'tieuhoc',
    classId: '4A2',
    studentName: 'Trần Văn Mạnh',
    criteriaId: 'CC-01',
    criteriaName: 'Đi học muộn (sau 7h15)',
    criteriaCategory: 'chuyencan',
    points: -2,
    type: 'minus',
    shift: 'daugio',
    reporterName: 'Vũ Đức Nam (5A1)',
    reporterRole: 'codo',
    note: 'Đến cổng lúc 7h22, có ghi sổ bảo vệ',
    evidenceUrl: '',
    status: 'verified'
  },
  {
    id: 'LOG-20260925-002',
    timestamp: '2026-09-25T07:20:00',
    date: '2026-09-25',
    weekNumber: 24,
    level: 'tieuhoc',
    classId: '4A2',
    studentName: 'Lê Minh Tuấn',
    criteriaId: 'DP-01',
    criteriaName: 'Không đeo khăn quàng đỏ',
    criteriaCategory: 'dongphuc',
    points: -2,
    type: 'minus',
    shift: 'daugio',
    reporterName: 'Vũ Đức Nam (5A1)',
    reporterRole: 'codo',
    note: 'Học sinh quên khăn quàng ở nhà',
    evidenceUrl: '',
    status: 'disputed',
    disputeNote: 'GVCN giải trình: Học sinh bị đứt dây khăn lúc đi xe, đã mượn sơ cua tại phòng Đội.'
  },
  {
    id: 'LOG-20260925-003',
    timestamp: '2026-09-25T09:15:00',
    date: '2026-09-25',
    weekNumber: 24,
    level: 'tieuhoc',
    classId: '3A1',
    studentName: 'Tập thể lớp',
    criteriaId: 'NN-02',
    criteriaName: 'Xếp hàng thể dục / Chào cờ lộn xộn',
    criteriaCategory: 'nenep',
    points: -4,
    type: 'minus',
    shift: 'xephang',
    reporterName: 'Bùi Đức Anh (5A2)',
    reporterRole: 'codo',
    note: 'Hàng 3 nói chuyện đùa giỡn trong giờ tập thể dục giữa giờ',
    evidenceUrl: '',
    status: 'verified'
  },
  {
    id: 'LOG-20260924-004',
    timestamp: '2026-09-24T16:40:00',
    date: '2026-09-24',
    weekNumber: 24,
    level: 'tieuhoc',
    classId: '5A1',
    studentName: 'Tập thể lớp',
    criteriaId: 'VS-06',
    criteriaName: 'Lớp học sạch đẹp, xếp bàn ghế ngăn nắp chuẩn mẫu',
    criteriaCategory: 'vesinh',
    points: 3,
    type: 'plus',
    shift: 'cuoibuoi',
    reporterName: 'Nguyễn Châu Anh (4A2)',
    reporterRole: 'codo',
    note: 'Phòng học sạch sẽ, rác đổ đúng nơi, bàn ghế thẳng tắp',
    evidenceUrl: '',
    status: 'verified'
  },
  {
    id: 'LOG-20260923-005',
    timestamp: '2026-09-23T14:10:00',
    date: '2026-09-23',
    weekNumber: 24,
    level: 'tieuhoc',
    classId: '4A1',
    studentName: 'Hoàng Minh Quân',
    criteriaId: 'PT-01',
    criteriaName: 'Nhặt được của rơi, trả lại người mất',
    criteriaCategory: 'phongtrao',
    points: 5,
    type: 'plus',
    shift: 'rachoi',
    reporterName: 'Nguyễn Mai Chi (5A1)',
    reporterRole: 'codo',
    note: 'Nhặt được 1 đồng hồ định vị của học sinh lớp 1 giao nộp Tổng phụ trách',
    evidenceUrl: '',
    status: 'verified'
  },

  // Khối THCS
  {
    id: 'LOG-20260925-101',
    timestamp: '2026-09-25T07:18:00',
    date: '2026-09-25',
    weekNumber: 24,
    level: 'thcs',
    classId: '7A2',
    studentName: 'Vũ Đức Nam',
    criteriaId: 'CC-01',
    criteriaName: 'Đi học muộn (sau 7h15)',
    criteriaCategory: 'chuyencan',
    points: -2,
    type: 'minus',
    shift: 'daugio',
    reporterName: 'Nguyễn Hoàng Long (8A1)',
    reporterRole: 'codo',
    note: 'Đến cổng 7h18',
    evidenceUrl: '',
    status: 'verified'
  },
  {
    id: 'LOG-20260925-102',
    timestamp: '2026-09-25T09:30:00',
    date: '2026-09-25',
    weekNumber: 24,
    level: 'thcs',
    classId: '6A3',
    studentName: 'Nguyễn Gia Bảo',
    criteriaId: 'NN-05',
    criteriaName: 'Ăn quà vặt trong lớp / Bày bừa',
    criteriaCategory: 'nenep',
    points: -3,
    type: 'minus',
    shift: 'rachoi',
    reporterName: 'Lê Thu Hương (8A1)',
    reporterRole: 'codo',
    note: 'Mang bim bim và nước ngọt vào phòng học làm rớt vỏ rác dưới chân bàn',
    evidenceUrl: '',
    status: 'verified'
  },
  {
    id: 'LOG-20260924-103',
    timestamp: '2026-09-24T07:25:00',
    date: '2026-09-24',
    weekNumber: 24,
    level: 'thcs',
    classId: '8A2',
    studentName: 'Phan Quốc Việt',
    criteriaId: 'DP-03',
    criteriaName: 'Đi dép lê / Không quai hậu / Không sơ vin',
    criteriaCategory: 'dongphuc',
    points: -2,
    type: 'minus',
    shift: 'daugio',
    reporterName: 'Đỗ Tuấn Khải (9A1)',
    reporterRole: 'codo',
    note: 'Đi dép tổ ong không có quai hậu',
    evidenceUrl: '',
    status: 'verified'
  },
  {
    id: 'LOG-20260923-104',
    timestamp: '2026-09-23T11:35:00',
    date: '2026-09-23',
    weekNumber: 24,
    level: 'thcs',
    classId: '8A2',
    studentName: 'Tập thể lớp',
    criteriaId: 'VS-04',
    criteriaName: 'Không tắt quạt / Điện khi ra khỏi phòng',
    criteriaCategory: 'vesinh',
    points: -5,
    type: 'minus',
    shift: 'cuoibuoi',
    reporterName: 'Đỗ Tuấn Khải (9A1)',
    reporterRole: 'codo',
    note: 'Ra về còn bật 4 quạt trần và 2 đèn tuýp',
    evidenceUrl: '',
    status: 'disputed',
    disputeNote: 'GVCN giải trình: Đội cờ vua còn ở lại sinh hoạt thêm 15p đã báo thầy quản nhiệm.'
  },
  {
    id: 'LOG-20260924-105',
    timestamp: '2026-09-24T15:00:00',
    date: '2026-09-24',
    weekNumber: 24,
    level: 'thcs',
    classId: '9A1',
    studentName: 'Tập thể lớp',
    criteriaId: 'PT-03',
    criteriaName: 'Đạt từ 5 điểm 10 trở lên trong tuần',
    criteriaCategory: 'phongtrao',
    points: 5,
    type: 'plus',
    shift: 'cuoibuoi',
    reporterName: 'Lê Bảo Châu (8A2)',
    reporterRole: 'codo',
    note: 'Sổ đầu bài ghi nhận 8 điểm 10 môn Toán, Lý, Anh',
    evidenceUrl: '',
    status: 'verified'
  }
];

// Danh sách Khiếu nại từ GVCN
export const INITIAL_DISPUTES: DisputeRequest[] = [
  {
    id: 'DISP-001',
    recordId: 'LOG-20260925-002',
    classId: '4A2',
    teacherName: 'Cô Hoàng Thanh Thảo',
    reason: 'Học sinh Lê Minh Tuấn bị rách/đứt khăn quàng trên đường đi học bằng xe đạp lúc 6h50, đã chủ động lên gặp GVCN để mượn khăn dự phòng trước giờ truy bài 7h00. Cờ đỏ đi chấm lúc 7h20 đã ghi nhận khi em đang tháo ra cất để thay. Đề nghị TPT xem xét xóa lỗi.',
    evidenceProof: 'Có xác nhận của cô Nguyễn Mai trực cổng và sổ mượn đồ phòng Đội.',
    createdAt: '2026-09-25T08:30:00',
    status: 'pending'
  },
  {
    id: 'DISP-002',
    recordId: 'LOG-20260923-104',
    classId: '8A2',
    teacherName: 'Cô Đoàn Thu Trang',
    reason: 'Cuối buổi sáng thứ 4 (23/09), nhóm học sinh câu lạc bộ cờ vua của lớp ở lại luyện tập theo lịch phê duyệt của Nhà trường đến 12h00. Sau khi CLB ra về đã tắt hết điện. Cờ đỏ chấm lúc 11h35 khi các em vẫn đang sinh hoạt trong phòng.',
    evidenceProof: 'Biên bản sinh hoạt CLB Cờ vua có chữ ký Thầy Toàn phụ trách.',
    createdAt: '2026-09-24T08:00:00',
    status: 'pending'
  }
];

// Cấu hình Google Sheets mặc định cho TRƯỜNG TH&THCS PHƯỚC HIỆP
export const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1PhuocHiep_School_Emulation_Sync/edit',
  webhookUrl: 'https://script.google.com/macros/s/AKfycbz_PhuocHiep_School_Webhook/exec',
  isAutoSyncEnabled: true,
  lastSyncedAt: '2026-09-27 08:00:00',
  lastPulledAt: null,
  status: 'connected'
};
