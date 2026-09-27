import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  FileSpreadsheet, 
  Clock, 
  Search,
  Filter,
  Check,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  ArrowDownToLine
} from 'lucide-react';
import { CriteriaCategory, CriteriaItem, CrossCheckAssignment, ShiftType } from '../types';

export const AdminView: React.FC = () => {
  const {
    activeLevel,
    currentWeek,
    summaries,
    records,
    disputes,
    criteria,
    assignments,
    classes,
    resolveDispute,
    addCriteria,
    deleteCriteria,
    addAssignment,
    deleteAssignment,
    isWeekLocked,
    toggleWeekLock,
    exportToCsv,
    pullFromGoogleSheets,
    sheetsConfig
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'ranking' | 'disputes' | 'assignments' | 'criteria' | 'logs'>('ranking');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [pulling, setPulling] = useState(false);
  const [pullToast, setPullToast] = useState<{ message: string; success: boolean } | null>(null);

  const handleQuickPull = async () => {
    setPulling(true);
    try {
      const res = await pullFromGoogleSheets({ method: 'auto' });
      setPullToast({ message: res.message, success: res.success });
      setTimeout(() => setPullToast(null), 5000);
    } catch (err: any) {
      setPullToast({ message: 'Không thể nhận dữ liệu: ' + (err.message || 'Lỗi kết nối'), success: false });
      setTimeout(() => setPullToast(null), 5000);
    } finally {
      setPulling(false);
    }
  };

  // New criteria form state
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [newCritName, setNewCritName] = useState('');
  const [newCritCategory, setNewCritCategory] = useState<CriteriaCategory>('chuyencan');
  const [newCritPoints, setNewCritPoints] = useState(-2);
  const [newCritType, setNewCritType] = useState<'minus' | 'plus'>('minus');
  const [newCritDesc, setNewCritDesc] = useState('');

  // New assignment modal state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignStudentName, setAssignStudentName] = useState('');
  const [assignFromClass, setAssignFromClass] = useState(activeLevel === 'tieuhoc' ? '5A1' : '8A1');
  const [assignTargetClass, setAssignTargetClass] = useState(activeLevel === 'tieuhoc' ? '4A1' : '7A1');
  const [assignShift, setAssignShift] = useState<ShiftType>('daugio');

  // Filtered summaries
  const filteredSummaries = summaries.filter(s => 
    s.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalClasses = summaries.length;
  const avgScore = totalClasses > 0 
    ? (summaries.reduce((sum, s) => sum + s.finalScore, 0) / totalClasses).toFixed(1)
    : '0';
  const top1Class = summaries[0];
  const pendingDisputes = disputes.filter(d => d.status === 'pending');
  const weekRecords = records.filter(r => r.weekNumber === currentWeek && r.level === activeLevel);

  // Handle adding new criteria
  const handleCreateCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    addCriteria({
      name: newCritName,
      category: newCritCategory,
      type: newCritType,
      points: newCritType === 'minus' ? -Math.abs(newCritPoints) : Math.abs(newCritPoints),
      description: newCritDesc,
      applicableLevels: [activeLevel]
    });

    setNewCritName('');
    setNewCritDesc('');
    setShowCriteriaModal(false);
  };

  // Handle adding new assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStudentName.trim()) return;

    addAssignment({
      studentId: `CD-${assignFromClass}-${Math.floor(Math.random() * 90 + 10)}`,
      studentName: assignStudentName,
      fromClass: assignFromClass,
      targetClass: assignTargetClass,
      level: activeLevel,
      shift: assignShift,
      dayOfWeek: 'Cả tuần',
      isActive: true
    });

    setAssignStudentName('');
    setShowAssignmentModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>QUY MÔ QUẢN LÝ</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalClasses} Lớp</span>
            <span className="text-xs text-slate-500 font-medium">({activeLevel === 'tieuhoc' ? 'Khối 1-5' : 'Khối 6-9'})</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Điểm cơ sở: <span className="font-semibold text-slate-700">100 điểm/tuần</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ĐIỂM TRUNG BÌNH TUẦN</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{avgScore}</span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Điểm thi đua</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tổng lượt chấm tuần {currentWeek}: <span className="font-semibold text-slate-700">{weekRecords.length} lượt</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>DẪN ĐẦU THI ĐUA (CỜ NHẤT)</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{top1Class ? top1Class.className : '---'}</span>
            <span className="text-xs text-slate-600 font-medium">({top1Class ? top1Class.finalScore : 0}đ)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 truncate">
            GVCN: {top1Class ? top1Class.teacherName : 'Chưa có'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>KHIẾU NẠI TỪ GVCN</span>
            <AlertCircle className={`w-4 h-4 ${pendingDisputes.length > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{pendingDisputes.length}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              pendingDisputes.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {pendingDisputes.length > 0 ? 'Cần duyệt ngay' : 'Đã xử lý hết'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {pendingDisputes.length > 0 ? (
              <button 
                onClick={() => setActiveAdminTab('disputes')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Nhấp để xem và duyệt →
              </button>
            ) : (
              'Không có khiếu nại tồn đọng'
            )}
          </div>
        </div>
      </div>

      {/* Admin Secondary Tabs & Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 sm:flex sm:items-center sm:justify-between gap-4">
          
          {/* Sub tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveAdminTab('ranking')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeAdminTab === 'ranking'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Bảng Tổng Hợp & Trao Cờ</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('disputes')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeAdminTab === 'disputes'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Duyệt Khiếu Nại GVCN</span>
              {pendingDisputes.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                  {pendingDisputes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('assignments')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeAdminTab === 'assignments'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Phân Công Cờ Đỏ Chấm Chéo</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('criteria')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeAdminTab === 'criteria'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Danh Mục Quy Định & Điểm</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('logs')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeAdminTab === 'logs'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Nhật Ký Vi Phạm Toàn Trường</span>
            </button>
          </div>

          {/* Quick action buttons on right */}
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
            <button
              onClick={handleQuickPull}
              disabled={pulling || sheetsConfig.status === 'pulling'}
              title="Nhận dữ liệu mới nhất từ Google Sheets về máy"
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownToLine className={`w-3.5 h-3.5 ${pulling ? 'animate-bounce' : ''}`} />
              <span>{pulling ? 'Đang nhận...' : 'Nhận từ Sheets'}</span>
            </button>

            <button
              onClick={() => exportToCsv('summaries')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất CSV Bảng Điểm</span>
            </button>

            <button
              onClick={toggleWeekLock}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                isWeekLocked
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isWeekLocked ? 'Mở Khóa Tuần' : 'Chốt Sổ Khóa Tuần'}
            </button>
          </div>

        </div>

        {/* Pull Toast Feedback */}
        {pullToast && (
          <div className={`mx-4 my-2 p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            pullToast.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-bold">{pullToast.success ? '✓' : 'ℹ'}</span>
              <span>{pullToast.message}</span>
            </div>
            <button
              onClick={() => setPullToast(null)}
              className="font-bold text-xs opacity-60 hover:opacity-100 px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: BẢNG TỔNG HỢP & XẾP HẠNG THI ĐUA */}
        {activeAdminTab === 'ranking' && (
          <div>
            {/* Top 3 Honor Podiums */}
            <div className="p-6 bg-gradient-to-b from-indigo-50/50 to-white border-b border-slate-200">
              <div className="text-center mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded">
                  Bảng Vinh Danh Tuần {currentWeek} - {activeLevel === 'tieuhoc' ? 'Khối Tiểu học (19 Lớp)' : 'Khối THCS (12 Lớp)'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Dự Kiến Trao Cờ Thi Đua Đội TNTP Hồ Chí Minh</h3>
                <p className="text-xs text-slate-500">Căn cứ theo điểm nề nếp chuyên cần, vệ sinh và tác phong</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {/* Cờ Nhì (Rank 2) */}
                {summaries[1] && (
                  <div className="bg-white border-2 border-slate-200 rounded-xl p-4 text-center order-2 md:order-1 relative shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold mx-auto flex items-center justify-center mb-2">
                      🥈
                    </div>
                    <span className="text-xs font-semibold text-slate-600 uppercase">Hạng Nhì - Cờ Nhì</span>
                    <h4 className="text-xl font-bold text-slate-900 mt-1">{summaries[1].className}</h4>
                    <p className="text-xs text-slate-500">{summaries[1].teacherName}</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-slate-50 text-slate-800 font-bold text-sm rounded-lg tabular-nums">
                      {summaries[1].finalScore} Điểm
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Trừ {summaries[1].totalDeductions}đ · Thưởng +{summaries[1].totalMerits}đ</div>
                  </div>
                )}

                {/* Cờ Nhất (Rank 1) */}
                {summaries[0] && (
                  <div className="bg-gradient-to-b from-amber-50/80 to-white border-2 border-amber-300 rounded-xl p-5 text-center order-1 md:order-2 relative shadow-md -translate-y-2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                      Xuất Sắc Nhất
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold mx-auto flex items-center justify-center mb-2 text-xl">
                      🥇
                    </div>
                    <span className="text-xs font-bold text-amber-700 uppercase">Hạng Nhất - Cờ Nhất</span>
                    <h4 className="text-2xl font-bold text-slate-900 mt-1">{summaries[0].className}</h4>
                    <p className="text-xs text-slate-600 font-medium">{summaries[0].teacherName}</p>
                    <div className="mt-3 inline-block px-4 py-1.5 bg-amber-500 text-white font-bold text-base rounded-lg tabular-nums shadow-xs">
                      {summaries[0].finalScore} Điểm
                    </div>
                    <div className="text-[11px] text-amber-700 mt-1">Trừ {summaries[0].totalDeductions}đ · Thưởng +{summaries[0].totalMerits}đ</div>
                  </div>
                )}

                {/* Cờ Ba (Rank 3) */}
                {summaries[2] && (
                  <div className="bg-white border-2 border-amber-200/60 rounded-xl p-4 text-center order-3 relative shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 font-bold mx-auto flex items-center justify-center mb-2">
                      🥉
                    </div>
                    <span className="text-xs font-semibold text-amber-800 uppercase">Hạng Ba - Cờ Ba</span>
                    <h4 className="text-xl font-bold text-slate-900 mt-1">{summaries[2].className}</h4>
                    <p className="text-xs text-slate-500">{summaries[2].teacherName}</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-amber-50 text-amber-900 font-bold text-sm rounded-lg tabular-nums">
                      {summaries[2].finalScore} Điểm
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Trừ {summaries[2].totalDeductions}đ · Thưởng +{summaries[2].totalMerits}đ</div>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Table */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo lớp hoặc GVCN..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="text-xs text-slate-500">
                Hiển thị <span className="font-semibold text-slate-800">{filteredSummaries.length}</span> / {summaries.length} lớp
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4 w-14 text-center">Hạng</th>
                    <th className="py-3 px-4">Lớp</th>
                    <th className="py-3 px-4">Giáo viên chủ nhiệm</th>
                    <th className="py-3 px-4 text-center">Điểm gốc</th>
                    <th className="py-3 px-4 text-center">Tổng trừ</th>
                    <th className="py-3 px-4 text-center">Tổng cộng</th>
                    <th className="py-3 px-4 text-center font-bold">Điểm thi đua</th>
                    <th className="py-3 px-4 text-center">Xếp loại</th>
                    <th className="py-3 px-4 text-center">Cờ thi đua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSummaries.map((item) => (
                    <tr 
                      key={item.classId} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.rank <= 3 ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold tabular-nums ${
                          item.rank === 1 ? 'bg-amber-400 text-amber-950 shadow-2xs' :
                          item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                          item.rank === 3 ? 'bg-amber-200 text-amber-900' :
                          'text-slate-600'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.className}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.teacherName}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums text-slate-500">
                        100
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums text-rose-600 font-medium">
                        {item.totalDeductions > 0 ? `-${item.totalDeductions}` : '0'}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums text-emerald-600 font-medium">
                        {item.totalMerits > 0 ? `+${item.totalMerits}` : '0'}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums font-bold text-slate-900 text-sm">
                        {item.finalScore}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.rankingClassification === 'Xuất sắc' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          item.rankingClassification === 'Tốt' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          item.rankingClassification === 'Khá' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {item.rankingClassification}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.flagAward ? (
                          <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                            item.flagAward === 'Cờ Nhất' ? 'text-amber-600' :
                            item.flagAward === 'Cờ Nhì' ? 'text-slate-700' :
                            'text-amber-800'
                          }`}>
                            <span>🚩</span>
                            <span>{item.flagAward}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DUYỆT KHIẾU NẠI & GIẢI TRÌNH CỦA GVCN */}
        {activeAdminTab === 'disputes' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Danh Sách Khiếu Nại & Giải Trình Từ GVCN</h4>
                <p className="text-xs text-slate-500">Xem xét minh chứng của GVCN để hủy trừ điểm sai hoặc giải trình chính đáng trước khi khóa sổ.</p>
              </div>
            </div>

            {disputes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-slate-600">Hiện tại không có khiếu nại nào từ GVCN</p>
                <p className="text-xs text-slate-400 mt-1">Các ý kiến phản hồi về lỗi trừ điểm sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map(dispute => {
                  const targetRecord = records.find(r => r.id === dispute.recordId);

                  return (
                    <div 
                      key={dispute.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        dispute.status === 'pending'
                          ? 'bg-rose-50/30 border-rose-200 ring-1 ring-rose-200'
                          : dispute.status === 'approved'
                          ? 'bg-emerald-50/20 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">Lớp {dispute.classId}</span>
                          <span className="text-xs text-slate-500">· GVCN: {dispute.teacherName}</span>
                          <span className="text-xs text-slate-400">· {new Date(dispute.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            dispute.status === 'pending'
                              ? 'bg-rose-100 text-rose-800'
                              : dispute.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {dispute.status === 'pending' ? 'Chờ TPT phê duyệt' : dispute.status === 'approved' ? 'Đã chấp thuận hủy lỗi (+Hoàn điểm)' : 'Đã bác bỏ'}
                          </span>
                        </div>
                      </div>

                      {/* Thông tin lỗi bị trừ */}
                      {targetRecord && (
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs mb-3">
                          <div className="text-slate-500 font-medium mb-1">Mục bị trừ điểm cần giải trình:</div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{targetRecord.criteriaName}</span>
                            <span className="text-rose-600 font-bold tabular-nums">{targetRecord.points} Điểm</span>
                          </div>
                          <div className="text-slate-500 mt-1">
                            Học sinh: <span className="text-slate-700 font-medium">{targetRecord.studentName || 'Tập thể'}</span> · Ca chấm: {targetRecord.shift} · Người chấm: {targetRecord.reporterName}
                          </div>
                          {targetRecord.note && (
                            <div className="text-slate-500 italic mt-0.5">Ghi chú lúc chấm: "{targetRecord.note}"</div>
                          )}
                        </div>
                      )}

                      {/* Nội dung giải trình của GVCN */}
                      <div className="text-xs space-y-1 mb-3">
                        <div className="font-semibold text-slate-800">Nội dung giải trình của GVCN:</div>
                        <p className="text-slate-700 bg-white/70 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                          {dispute.reason}
                        </p>
                        {dispute.evidenceProof && (
                          <div className="text-[11px] text-slate-600 bg-indigo-50/60 p-2 rounded border border-indigo-100">
                            <span className="font-semibold text-indigo-900">Minh chứng đính kèm: </span>
                            {dispute.evidenceProof}
                          </div>
                        )}
                      </div>

                      {/* Phản hồi của TPT */}
                      {dispute.resolutionNote && (
                        <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded mb-3">
                          <span className="font-semibold text-slate-800">Quyết định của TPT: </span>
                          {dispute.resolutionNote}
                        </div>
                      )}

                      {/* Action buttons if pending */}
                      {dispute.status === 'pending' && (
                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Ghi chú phản hồi / Căn cứ quyết định..."
                            value={selectedDisputeId === dispute.id ? resolutionNote : ''}
                            onChange={e => {
                              setSelectedDisputeId(dispute.id);
                              setResolutionNote(e.target.value);
                            }}
                            className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 grow max-w-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                resolveDispute(
                                  dispute.id, 
                                  'approved', 
                                  selectedDisputeId === dispute.id && resolutionNote ? resolutionNote : 'Chấp thuận giải trình, hủy lỗi vi phạm'
                                );
                                setResolutionNote('');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Chấp Thuận (Hủy Trừ Điểm)</span>
                            </button>

                            <button
                              onClick={() => {
                                resolveDispute(
                                  dispute.id, 
                                  'rejected', 
                                  selectedDisputeId === dispute.id && resolutionNote ? resolutionNote : 'Minh chứng không đủ cơ sở hoặc vi phạm đã rõ'
                                );
                                setResolutionNote('');
                              }}
                              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Bác Bỏ Khiếu Nại</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUẢN LÝ PHÂN CÔNG CHẤM CHÉO CỜ ĐỎ */}
        {activeAdminTab === 'assignments' && (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Lịch Phân Công Đội Cờ Đỏ Chấm Chéo</h4>
                <p className="text-xs text-slate-500">
                  Đảm bảo tính khách quan: Học sinh cờ đỏ chỉ được chấm điểm lớp được phân công theo ca trực.
                </p>
              </div>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Phân Công Mới</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Mã Cờ đỏ</th>
                    <th className="py-3 px-4">Họ và tên Cờ đỏ</th>
                    <th className="py-3 px-4">Lớp của Cờ đỏ</th>
                    <th className="py-3 px-4 font-bold text-indigo-700">Lớp được chấm chéo</th>
                    <th className="py-3 px-4">Ca trực</th>
                    <th className="py-3 px-4">Lịch trực</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.filter(a => a.level === activeLevel).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{item.studentId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.studentName}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">Lớp {item.fromClass}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600 bg-indigo-50/30">
                        Lớp {item.targetClass}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {item.shift === 'daugio' ? 'Đầu giờ (7h15)' :
                         item.shift === 'rachoi' ? 'Ra chơi giữa giờ' :
                         item.shift === 'xephang' ? 'Xếp hàng truy bài' : 'Cuối buổi tan học'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{item.dayOfWeek}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-200">
                          Hoạt động
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteAssignment(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Xóa phân công"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DANH MỤC QUY ĐỊNH & TIÊU CHÍ */}
        {activeAdminTab === 'criteria' && (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Danh Mục Tiêu Chí Thi Đua & Biểu Điểm</h4>
                <p className="text-xs text-slate-500">Khung điểm chuẩn theo Điều lệ Đội Thiếu niên Tiền phong Hồ Chí Minh.</p>
              </div>
              <button
                onClick={() => setShowCriteriaModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Tiêu Chí / Lỗi Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criteria.map(crit => (
                <div 
                  key={crit.id} 
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    crit.type === 'minus' ? 'bg-white border-slate-200' : 'bg-emerald-50/20 border-emerald-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {crit.id}
                      </span>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                        {crit.category}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{crit.name}</div>
                    {crit.description && (
                      <p className="text-xs text-slate-500">{crit.description}</p>
                    )}
                    <div className="text-[11px] text-slate-400">
                      Áp dụng: {crit.applicableLevels.includes('tieuhoc') && 'Tiểu học '}
                      {crit.applicableLevels.includes('thcs') && 'THCS'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums ${
                      crit.type === 'minus' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {crit.points > 0 ? `+${crit.points}` : crit.points}đ
                    </span>
                    <div className="mt-2">
                      <button
                        onClick={() => deleteCriteria(crit.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Xóa tiêu chí"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NHẬT KÝ VI PHẠM TOÀN TRƯỜNG */}
        {activeAdminTab === 'logs' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Nhật Ký Vi Phạm & Khen Thưởng Toàn Trường</h4>
                <p className="text-xs text-slate-500">Mọi lượt nhập từ Đội Cờ đỏ đều được lưu vết thời gian và người chấm.</p>
              </div>
              <button
                onClick={() => exportToCsv('records')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất CSV Nhật Ký</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Lớp</th>
                    <th className="py-3 px-4">Học sinh / Tập thể</th>
                    <th className="py-3 px-4">Nội dung ghi nhận</th>
                    <th className="py-3 px-4 text-center">Điểm</th>
                    <th className="py-3 px-4">Ca trực</th>
                    <th className="py-3 px-4">Người ghi nhận</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {weekRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(rec.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {rec.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">Lớp {rec.classId}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{rec.studentName || 'Tập thể lớp'}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{rec.criteriaName}</div>
                        {rec.note && <div className="text-[11px] text-slate-500 italic">"{rec.note}"</div>}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums font-bold">
                        <span className={rec.type === 'minus' ? 'text-rose-600' : 'text-emerald-600'}>
                          {rec.points > 0 ? `+${rec.points}` : rec.points}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">{rec.shift}</td>
                      <td className="py-3 px-4 text-slate-600">{rec.reporterName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.status === 'verified' ? 'bg-slate-100 text-slate-700' :
                          rec.status === 'disputed' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {rec.status === 'disputed' ? 'Đang khiếu nại' : rec.status === 'resolved' ? 'Đã giải quyết' : 'Đã duyệt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Thêm Tiêu chí mới */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Thêm Quy Định / Tiêu Chí Chấm Điểm</h3>
            <form onSubmit={handleCreateCriteria} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên tiêu chí / Lỗi quy định</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đi học muộn sau 7h15"
                  value={newCritName}
                  onChange={e => setNewCritName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân nhóm</label>
                  <select
                    value={newCritCategory}
                    onChange={e => setNewCritCategory(e.target.value as CriteriaCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="chuyencan">Chuyên cần</option>
                    <option value="dongphuc">Đồng phục & Tác phong</option>
                    <option value="nenep">Nề nếp - Kỷ luật</option>
                    <option value="vesinh">Vệ sinh & Môi trường</option>
                    <option value="phongtrao">Phong trào & Khen thưởng</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại điểm</label>
                  <select
                    value={newCritType}
                    onChange={e => setNewCritType(e.target.value as 'minus' | 'plus')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="minus">Trừ điểm vi phạm</option>
                    <option value="plus">Cộng điểm thưởng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điểm ({newCritType === 'minus' ? 'Trừ' : 'Cộng'})</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={Math.abs(newCritPoints)}
                  onChange={e => setNewCritPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả / Hướng dẫn áp dụng</label>
                <textarea
                  rows={2}
                  placeholder="Ghi rõ trừ theo đầu học sinh hay trừ tập thể lớp..."
                  value={newCritDesc}
                  onChange={e => setNewCritDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCriteriaModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Lưu Tiêu Chí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm Phân công Cờ đỏ mới */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Phân Công Cờ Đỏ Chấm Chéo</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ tên học sinh Cờ đỏ</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={assignStudentName}
                  onChange={e => setAssignStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp của Cờ đỏ</label>
                  <select
                    value={assignFromClass}
                    onChange={e => setAssignFromClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {classes.filter(c => c.level === activeLevel).map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp được chấm chéo</label>
                  <select
                    value={assignTargetClass}
                    onChange={e => setAssignTargetClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-indigo-700"
                  >
                    {classes.filter(c => c.level === activeLevel && c.id !== assignFromClass).map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ca trực phụ trách</label>
                <select
                  value={assignShift}
                  onChange={e => setAssignShift(e.target.value as ShiftType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="daugio">Đầu giờ (7h15 - 7h45)</option>
                  <option value="rachoi">Ra chơi giữa giờ</option>
                  <option value="xephang">Xếp hàng truy bài 15 phút</option>
                  <option value="cuoibuoi">Cuối buổi tan trường</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Xác Nhận Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
