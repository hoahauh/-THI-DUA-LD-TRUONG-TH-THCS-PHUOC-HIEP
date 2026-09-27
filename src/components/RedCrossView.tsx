import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle, 
  Camera, 
  Send, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  Award,
  History,
  Lock
} from 'lucide-react';
import { ShiftType, CriteriaCategory } from '../types';

export const RedCrossView: React.FC = () => {
  const {
    activeLevel,
    currentWeek,
    assignments,
    criteria,
    records,
    classes,
    addRecord,
    isWeekLocked,
    selectedCodoId,
    setSelectedCodoId,
    currentCodoAssignments
  } = useApp();

  // Find all Cờ đỏ for this level
  const levelAssignments = assignments.filter(a => a.level === activeLevel);
  const uniqueCodoList = Array.from(
    new Map(levelAssignments.map(a => [a.studentId, a])).values()
  );

  const currentCodo = uniqueCodoList.find(c => c.studentId === selectedCodoId) || uniqueCodoList[0];

  // Form State
  const [selectedShift, setSelectedShift] = useState<ShiftType>('daugio');
  const [targetClassId, setTargetClassId] = useState<string>(
    currentCodoAssignments[0]?.targetClass || (activeLevel === 'tieuhoc' ? '4A2' : '7A2')
  );
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>('CC-01');
  const [studentName, setStudentName] = useState<string>('');
  const [isClassWide, setIsClassWide] = useState<boolean>(false);
  const [incidentNote, setIncidentNote] = useState<string>('');
  const [evidenceNote, setEvidenceNote] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');

  // Criteria search / category filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Allowed classes for this Cờ đỏ
  const allowedClasses = currentCodoAssignments.map(a => a.targetClass);
  const isTargetClassAllowed = allowedClasses.includes(targetClassId);

  // Filter criteria
  const availableCriteria = criteria.filter(c => {
    const matchesLevel = c.applicableLevels.includes(activeLevel);
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesCat && matchesSearch;
  });

  const selectedCritObj = criteria.find(c => c.id === selectedCriteriaId);

  // My recent logs
  const myRecentRecords = records.filter(r => 
    r.reporterName.includes(currentCodo?.studentName || '') &&
    r.weekNumber === currentWeek
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCritObj || !currentCodo) return;

    if (isWeekLocked) {
      alert('Tuần này đã được Tổng phụ trách khóa sổ. Không thể nhập thêm dữ liệu.');
      return;
    }

    if (!isTargetClassAllowed) {
      const confirmCheat = window.confirm(
        `CẢNH BÁO BẢO MẬT & PHÂN QUYỀN:\nBạn đang chấm Lớp ${targetClassId} KHÔNG NẰM TRONG LỊCH PHÂN CÔNG của bạn.\nHành vi này sẽ bị ghi vết vi phạm quy chế Đội. Bạn có chắc chắn muốn gửi không?`
      );
      if (!confirmCheat) return;
    }

    const newRec = addRecord({
      date: new Date().toISOString().split('T')[0],
      weekNumber: currentWeek,
      level: activeLevel,
      classId: targetClassId,
      studentName: isClassWide ? 'Tập thể lớp' : (studentName.trim() || 'Học sinh chưa rõ tên'),
      criteriaId: selectedCritObj.id,
      criteriaName: selectedCritObj.name,
      criteriaCategory: selectedCritObj.category,
      points: selectedCritObj.points,
      type: selectedCritObj.type,
      shift: selectedShift,
      reporterName: `${currentCodo.studentName} (${currentCodo.fromClass})`,
      reporterRole: 'codo',
      note: incidentNote.trim(),
      evidenceUrl: evidenceNote.trim() ? `Minh chứng: ${evidenceNote}` : undefined
    });

    setLastSubmittedId(newRec.id);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);

    // Reset some inputs
    if (!isClassWide) setStudentName('');
    setIncidentNote('');
    setEvidenceNote('');
  };

  return (
    <div className="space-y-6">

      {/* Role Card & Identity Switcher */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl border border-white/30">
              🚩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-rose-200">
                  Cổng Nhập Liệu Chấm Điểm
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">
                  Đội Cờ Đỏ / Sao Đỏ
                </span>
              </div>
              <h2 className="text-xl font-bold mt-0.5">
                {currentCodo ? currentCodo.studentName : 'Học sinh Cờ đỏ'}
              </h2>
              <p className="text-xs text-rose-100">
                Lớp {currentCodo?.fromClass} · Ban Chỉ Huy Đội Thiếu Niên Tiền Phong
              </p>
            </div>
          </div>

          {/* Switch Cờ đỏ Identity for Demo */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs">
            <div className="text-rose-200 font-medium mb-1">Mô phỏng tài khoản Đội Cờ đỏ:</div>
            <select
              value={selectedCodoId}
              onChange={e => setSelectedCodoId(e.target.value)}
              className="bg-white text-slate-900 font-semibold px-3 py-1.5 rounded-lg focus:outline-hidden text-xs shadow-xs"
            >
              {uniqueCodoList.map(c => (
                <option key={c.studentId} value={c.studentId}>
                  {c.studentName} (Cờ đỏ lớp {c.fromClass} ➔ Chấm lớp {c.targetClass})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Badge */}
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-rose-100">
            <Clock className="w-4 h-4" />
            <span>Phân công chấm chéo: </span>
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
              Lớp {allowedClasses.join(', ') || 'Chưa phân công'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-100">
            <Calendar className="w-4 h-4" />
            <span>Thời gian trực: <strong className="text-white">Cả tuần (Tuần {currentWeek})</strong></span>
          </div>

          {isWeekLocked && (
            <div className="ml-auto bg-amber-400 text-amber-950 font-bold px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Tuần này đã khóa sổ - Chế độ chỉ xem</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form Entry + Assigned Class Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Quick Scoring Entry Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Phiếu Ghi Nhận Lỗi Vi Phạm & Khen Thưởng</h3>
              <p className="text-xs text-slate-500">Dữ liệu sau khi gửi sẽ cập nhật trực tiếp lên Bảng tổng hợp và Google Sheets.</p>
            </div>
            <div className="text-xs text-slate-400">
              Mã biểu mẫu: <span className="font-mono font-medium text-slate-700">TDPH-F01</span>
            </div>
          </div>

          {/* Success Toast */}
          {showSuccessToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>Ghi nhận thành công!</strong> Biên bản vi phạm mã <span className="font-mono">{lastSubmittedId}</span> đã được chuyển tới GVCN và Tổng phụ trách.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Row 1: Ca Trực & Lớp Mục Tiêu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Ca trực kiểm tra
                </label>
                <select
                  value={selectedShift}
                  onChange={e => setSelectedShift(e.target.value as ShiftType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                >
                  <option value="daugio">Đầu giờ (7h15 - 7h45 đón cổng & kiểm tra)</option>
                  <option value="rachoi">Ra chơi giữa giờ (Sân trường & Hành lang)</option>
                  <option value="xephang">Xếp hàng truy bài 15 phút đầu giờ</option>
                  <option value="cuoibuoi">Cuối buổi tan học (Vệ sinh lớp & Tắt điện)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>2. Lớp được chấm</span>
                  {isTargetClassAllowed ? (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Đúng phân công
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Ngoài phân công
                    </span>
                  )}
                </label>
                <select
                  value={targetClassId}
                  onChange={e => setTargetClassId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-bold ${
                    isTargetClassAllowed 
                      ? 'border-indigo-200 bg-indigo-50/40 text-indigo-900 focus:ring-2 focus:ring-indigo-500' 
                      : 'border-rose-300 bg-rose-50 text-rose-900'
                  }`}
                >
                  <optgroup label="Lớp được Tổng phụ trách phân công cho bạn">
                    {allowedClasses.map(clsId => (
                      <option key={clsId} value={clsId}>
                        Lớp {clsId} (Đúng quyền chấm)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Các lớp khác trong khối (Cảnh báo vượt quyền)">
                    {classes.filter(c => c.level === activeLevel && !allowedClasses.includes(c.id)).map(c => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} - {c.teacherName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Row 2: Tiêu Chí Vi Phạm / Khen Thưởng */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-semibold text-slate-700">
                  3. Chọn Tiêu chí nề nếp / Khen thưởng
                </label>

                {/* Category filters */}
                <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      categoryFilter === 'all' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('chuyencan')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      categoryFilter === 'chuyencan' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Chuyên cần
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('dongphuc')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      categoryFilter === 'dongphuc' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Đồng phục
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('nenep')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      categoryFilter === 'nenep' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Kỷ luật
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('vesinh')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      categoryFilter === 'vesinh' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Vệ sinh
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('phongtrao')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      categoryFilter === 'phongtrao' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Cộng điểm thưởng
                  </button>
                </div>
              </div>

              {/* Criteria Selector List */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 p-1">
                {availableCriteria.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedCriteriaId === item.id 
                        ? 'bg-rose-50/70 border border-rose-200' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="criteria"
                        value={item.id}
                        checked={selectedCriteriaId === item.id}
                        onChange={() => setSelectedCriteriaId(item.id)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Mã: <span className="font-mono">{item.id}</span> · {item.description}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-xs font-bold tabular-nums shrink-0 ${
                      item.type === 'minus' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.points > 0 ? `+${item.points}` : item.points}đ
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Row 3: Đối Tượng Vi Phạm */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  4. Đối tượng vi phạm / Khen thưởng
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={isClassWide}
                    onChange={e => setIsClassWide(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Áp dụng cho Toàn thể lớp</span>
                </label>
              </div>

              {!isClassWide ? (
                <input
                  type="text"
                  placeholder="Nhập họ và tên học sinh (Ví dụ: Nguyễn Văn An - Bàn 2 dãy giữa)"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                />
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium text-xs">
                  ★ Lỗi/Điểm thưởng sẽ tính trực tiếp vào điểm thi đua tập thể Lớp {targetClassId}
                </div>
              )}
            </div>

            {/* Row 4: Ghi Chú & Minh Chứng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  5. Ghi chú hiện trường cụ thể
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi rõ hành vi: Đi dép tổ ong, không khăn quàng, vứt rác hành lang..."
                  value={incidentNote}
                  onChange={e => setIncidentNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>6. Minh chứng xác thực (Ảnh/Sổ trực)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã chụp ảnh lưu máy / Có xác nhận của bác bảo vệ cổng..."
                  value={evidenceNote}
                  onChange={e => setEvidenceNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Đính kèm minh chứng giúp bảo vệ kết quả khi GVCN kiểm tra hoặc giải trình.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Mức điểm tác động:{' '}
                <span className={`font-bold text-sm tabular-nums ${
                  selectedCritObj?.type === 'minus' ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {selectedCritObj ? (selectedCritObj.points > 0 ? `+${selectedCritObj.points}` : selectedCritObj.points) : '0'} điểm
                </span>
              </div>

              <button
                type="submit"
                disabled={isWeekLocked}
                className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-sm flex items-center gap-2 transition-all ${
                  isWeekLocked
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 hover:shadow-md'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Xác Nhận Ghi Biên Bản</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Lịch Sử Chấm Của Cờ Đỏ & Thông Tin Lớp Phụ Trách */}
        <div className="space-y-6">
          
          {/* Assigned Classes Quick Glance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Lớp bạn đang phụ trách chấm</span>
            </h4>
            <div className="space-y-2">
              {currentCodoAssignments.map(asg => {
                const clsInfo = classes.find(c => c.id === asg.targetClass);
                return (
                  <div key={asg.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 text-sm">Lớp {asg.targetClass}</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                        {asg.shift}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      GVCN: <span className="font-medium">{clsInfo?.teacherName || 'Chưa rõ'}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Phòng: {clsInfo?.room} · Sĩ số: {clsInfo?.studentCount} HS
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My recent submitted logs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>Lượt bạn đã chấm gần đây</span>
              </h4>
              <span className="text-xs font-semibold text-slate-500">{myRecentRecords.length} lượt</span>
            </div>

            {myRecentRecords.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Chưa có lượt chấm nào trong tuần {currentWeek}.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {myRecentRecords.map(rec => (
                  <div key={rec.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Lớp {rec.classId}</span>
                      <span className={`font-bold tabular-nums ${rec.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {rec.points > 0 ? `+${rec.points}` : rec.points}đ
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium mt-0.5">{rec.criteriaName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>{rec.studentName}</span>
                      <span>{new Date(rec.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
