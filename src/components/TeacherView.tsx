import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  FileText, 
  Send, 
  Camera, 
  ShieldCheck, 
  HelpCircle,
  Trophy
} from 'lucide-react';
import { SchoolClass } from '../types';

export const TeacherView: React.FC = () => {
  const {
    activeLevel,
    currentWeek,
    classes,
    summaries,
    records,
    disputes,
    addDispute,
    selectedGvcnClassId,
    setSelectedGvcnClassId,
    isWeekLocked
  } = useApp();

  const levelClasses = classes.filter(c => c.level === activeLevel);
  const currentClass = levelClasses.find(c => c.id === selectedGvcnClassId) || levelClasses[0];

  // Current class summary
  const classSummary = summaries.find(s => s.classId === currentClass?.id) || {
    classId: currentClass?.id || '',
    className: currentClass?.name || '',
    grade: currentClass?.grade || 1,
    level: activeLevel,
    teacherName: currentClass?.teacherName || '',
    basePoints: 100,
    totalDeductions: 0,
    totalMerits: 0,
    finalScore: 100,
    rank: 1,
    rankingClassification: 'Xuất sắc' as const,
    flagAward: null,
    infractionCount: 0,
    meritCount: 0,
    isLocked: false
  };

  // Class records for this week
  const classRecords = records.filter(r => 
    r.classId === currentClass?.id && 
    r.weekNumber === currentWeek
  );

  // Dispute form state
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [disputeProof, setDisputeProof] = useState<string>('');
  const [showAppealSuccess, setShowAppealSuccess] = useState<boolean>(false);

  // Disputes of this class
  const classDisputes = disputes.filter(d => d.classId === currentClass?.id);

  const handleSendAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId || !disputeReason.trim()) return;

    addDispute(selectedRecordId, disputeReason.trim(), disputeProof.trim());
    setSelectedRecordId('');
    setDisputeReason('');
    setDisputeProof('');
    setShowAppealSuccess(true);
    setTimeout(() => setShowAppealSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card for Teacher */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-slate-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl border border-white/20">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">
                  Cổng Thông Tin Giáo Viên Chủ Nhiệm
                </span>
                <span className="bg-indigo-500/40 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                  Tuần {currentWeek}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-0.5">
                {currentClass?.teacherName} · Phụ trách {currentClass?.name}
              </h2>
              <p className="text-xs text-indigo-100">
                Phòng học: {currentClass?.room} · Sĩ số: {currentClass?.studentCount} học sinh · Chi đội trưởng: {currentClass?.teamLeader}
              </p>
            </div>
          </div>

          {/* Switch Class Selector for Demo */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs">
            <div className="text-indigo-200 font-medium mb-1">Chọn lớp chủ nhiệm (Mô phỏng):</div>
            <select
              value={selectedGvcnClassId}
              onChange={e => setSelectedGvcnClassId(e.target.value)}
              className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg focus:outline-hidden text-xs shadow-xs"
            >
              {levelClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.teacherName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time score ticker */}
        <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-indigo-200">Điểm thi đua hiện tại</div>
            <div className="text-2xl font-bold text-white tabular-nums mt-0.5 flex items-baseline gap-1.5">
              <span>{classSummary.finalScore}</span>
              <span className="text-xs text-indigo-300 font-normal">/ 100đ</span>
            </div>
          </div>

          <div>
            <div className="text-indigo-200">Thứ hạng trong khối</div>
            <div className="text-2xl font-bold text-amber-300 tabular-nums mt-0.5">
              Hạng {classSummary.rank} <span className="text-xs text-indigo-300 font-normal">/ {levelClasses.length} lớp</span>
            </div>
          </div>

          <div>
            <div className="text-indigo-200">Xếp loại tuần</div>
            <div className="mt-1">
              <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded text-xs">
                {classSummary.rankingClassification}
              </span>
            </div>
          </div>

          <div>
            <div className="text-indigo-200">Dự kiến Cờ thi đua</div>
            <div className="mt-1 font-bold text-amber-300 text-sm">
              {classSummary.flagAward ? `🚩 ${classSummary.flagAward}` : 'Chưa đạt cờ'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Breakdown & Appeal Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Chi tiết vi phạm & Khen thưởng */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Chi Tiết Điểm Trừ & Điểm Thưởng Tuần {currentWeek}</h3>
                <p className="text-xs text-slate-500">Cập nhật theo thời gian thực từ các ca trực của Đội Cờ đỏ.</p>
              </div>
              <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                Tổng: <span className="text-rose-600">-{classSummary.totalDeductions}đ</span> · <span className="text-emerald-600">+{classSummary.totalMerits}đ</span>
              </div>
            </div>

            {classRecords.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">Lớp {currentClass?.name} duy trì nề nếp tuyệt vời!</p>
                <p className="text-xs text-slate-400 mt-1">Chưa có bất kỳ lỗi vi phạm nào bị ghi nhận trong tuần này.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classRecords.map(rec => {
                  const hasDispute = disputes.find(d => d.recordId === rec.id);

                  return (
                    <div 
                      key={rec.id}
                      className={`p-4 rounded-xl border transition-all ${
                        rec.type === 'minus' ? 'bg-slate-50/70 border-slate-200' : 'bg-emerald-50/30 border-emerald-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{rec.criteriaName}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold tabular-nums ${
                              rec.type === 'minus' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {rec.points > 0 ? `+${rec.points}` : rec.points}đ
                            </span>
                          </div>
                          
                          <div className="text-xs text-slate-600">
                            Đối tượng: <strong className="text-slate-800">{rec.studentName || 'Tập thể'}</strong> · Ca trực: <span className="capitalize">{rec.shift}</span>
                          </div>

                          {rec.note && (
                            <div className="text-xs text-slate-500 italic bg-white p-2 rounded border border-slate-200/60 mt-1">
                              "{rec.note}"
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 mt-1">
                            Người chấm: {rec.reporterName} · {new Date(rec.timestamp).toLocaleString('vi-VN')}
                          </div>
                        </div>

                        {/* Dispute status / Action */}
                        <div className="text-right shrink-0">
                          {hasDispute ? (
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                hasDispute.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                hasDispute.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {hasDispute.status === 'pending' ? 'Đang khiếu nại' :
                                 hasDispute.status === 'approved' ? 'Đã hoàn điểm' : 'Bị bác bỏ'}
                              </span>
                              <div className="text-[10px] text-slate-500 max-w-[140px] truncate">
                                {hasDispute.reason}
                              </div>
                            </div>
                          ) : rec.type === 'minus' ? (
                            <button
                              onClick={() => setSelectedRecordId(rec.id)}
                              className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Giải trình / Khiếu nại</span>
                            </button>
                          ) : null}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lịch sử giải trình của lớp */}
          {classDisputes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Theo Dõi Tiến Trình Giải Trình Của Lớp {currentClass?.name}</span>
              </h3>
              <div className="space-y-3">
                {classDisputes.map(disp => (
                  <div key={disp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-900">Mã khiếu nại: {disp.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        disp.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        disp.status === 'approved' ? 'bg-emerald-100 text-emerald-800 font-bold' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {disp.status === 'pending' ? 'Chờ Tổng phụ trách duyệt' :
                         disp.status === 'approved' ? 'Tổng phụ trách đã duyệt xóa lỗi (+Hoàn điểm)' :
                         'Tổng phụ trách không chấp thuận'}
                      </span>
                    </div>
                    <div className="text-slate-600">Lý do: {disp.reason}</div>
                    {disp.resolutionNote && (
                      <div className="text-indigo-900 bg-indigo-50/70 p-2 rounded font-medium">
                        Phản hồi từ TPT: "{disp.resolutionNote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dispute Submission Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Gửi Giải Trình Đến Tổng Phụ Trách</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Nếu phát hiện học sinh bị trừ oan, học sinh có giấy phép bổ sung hoặc có sự nhầm lẫn giữa các lớp.
              </p>
            </div>

            {showAppealSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>Giải trình đã được chuyển thành công tới phòng Đội Tổng phụ trách.</div>
              </div>
            )}

            <form onSubmit={handleSendAppeal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Chọn mục bị trừ điểm cần giải trình
                </label>
                <select
                  value={selectedRecordId}
                  onChange={e => setSelectedRecordId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Chọn lỗi trong danh sách --</option>
                  {classRecords.filter(r => r.type === 'minus').map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.points}đ] {r.criteriaName} - {r.studentName} ({r.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Lý do giải trình cụ thể
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nêu rõ hoàn cảnh: Học sinh bị ốm có giấy phép của y tế, khăn quàng bị đứt lúc đi xe đã mượn khăn dự phòng..."
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Minh chứng xác minh (nếu có)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giấy xin phép có chữ ký phụ huynh / Xác nhận của cô y tế..."
                  value={disputeProof}
                  onChange={e => setDisputeProof(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedRecordId || isWeekLocked}
                  className={`w-full py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                    !selectedRecordId || isWeekLocked
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Giải Trình Cho Tổng Phụ Trách</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick FAQ / Guide for Teachers */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Quy chế thi đua giáo viên cần lưu ý</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
              <li>Mỗi tuần mỗi lớp xuất phát điểm với <strong>100 điểm cơ sở</strong>.</li>
              <li>Thời gian chốt sổ thi đua tuần: <strong>16h30 Thứ Sáu</strong>.</li>
              <li>Mọi giải trình gửi sau thời điểm khóa sổ sẽ không được tính điểm cho tuần đó.</li>
              <li>Lớp đạt từ 95 điểm trở lên và xếp Top 3 sẽ được trao <strong>Cờ Thi Đua</strong> vào tiết Chào cờ Thứ Hai.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
