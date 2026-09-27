import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Award, 
  Table, 
  FileCode2, 
  RotateCw, 
  Lock, 
  Unlock, 
  Printer, 
  School,
  ArrowDownToLine,
  Key,
  Sparkles
} from 'lucide-react';
import { UserRole, SchoolLevel } from '../types';

interface HeaderProps {
  onOpenDoc: () => void;
  onOpenPrint: () => void;
  onOpenApiKeySettings: () => void;
  onOpenAiAssistant: () => void;
  activeTab: 'main' | 'sheets' | 'doc';
  setActiveTab: (tab: 'main' | 'sheets' | 'doc') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenDoc, 
  onOpenPrint, 
  onOpenApiKeySettings,
  onOpenAiAssistant,
  activeTab, 
  setActiveTab 
}) => {
  const { 
    currentRole, 
    setCurrentRole, 
    activeLevel, 
    setActiveLevel, 
    currentWeek, 
    setCurrentWeek,
    isWeekLocked,
    toggleWeekLock,
    syncWithGoogleSheets,
    pullFromGoogleSheets,
    sheetsConfig,
    pendingDisputesCount
  } = useApp();

  const handleSync = async () => {
    await syncWithGoogleSheets();
  };

  const handlePull = async () => {
    setActiveTab('sheets');
    await pullFromGoogleSheets({ method: 'auto' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5 shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base lg:text-lg text-slate-900 tracking-tight">
                  THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 hidden xl:inline-block">
                  Liên cấp K-12
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">Hệ thống Quản lý Nề nếp & Cơ sở Dữ liệu Google Sheets</p>
            </div>
          </div>

          {/* Zone 2: Navigation & View Controls */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {/* Main Views */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('main')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'main'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảng điều khiển
              </button>
              <button
                onClick={() => setActiveTab('sheets')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'sheets'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheets DB</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('doc');
                  onOpenDoc();
                }}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'doc'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kiến trúc K-12</span>
              </button>
            </div>

            {/* School Level Switcher */}
            <div className="flex items-center p-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveLevel('tieuhoc')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeLevel === 'tieuhoc'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-indigo-800 hover:bg-indigo-100/70'
                }`}
              >
                <span>Khối Tiểu học</span>
                <span className="text-[10px] opacity-80">(19 lớp)</span>
              </button>
              <button
                onClick={() => setActiveLevel('thcs')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeLevel === 'thcs'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-indigo-800 hover:bg-indigo-100/70'
                }`}
              >
                <span>Khối THCS</span>
                <span className="text-[10px] opacity-80">(12 lớp)</span>
              </button>
            </div>
          </div>

          {/* Zone 3: Actions & Quick status */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Week selector */}
            <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-700">
              <span className="text-slate-400 mr-1.5">Tuần:</span>
              <select
                aria-label="Chọn tuần học"
                value={currentWeek}
                onChange={e => setCurrentWeek(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                {[22, 23, 24, 25, 26].map(w => (
                  <option key={w} value={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Print button */}
            <button
              onClick={onOpenPrint}
              title="In biên bản thi đua tuần"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Receive / Pull from Sheets button */}
            <button
              onClick={handlePull}
              disabled={sheetsConfig.status === 'pulling'}
              title="Nhận dữ liệu mới nhất từ Google Sheets"
              className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownToLine className={`w-3.5 h-3.5 ${sheetsConfig.status === 'pulling' ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{sheetsConfig.status === 'pulling' ? 'Đang nhận...' : 'Nhận từ Sheets'}</span>
            </button>

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={sheetsConfig.status === 'syncing'}
              className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${sheetsConfig.status === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Đồng bộ Sheets</span>
            </button>

            {/* Trợ lý AI Đội TNTP */}
            <button
              onClick={onOpenAiAssistant}
              className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Khởi động Trợ lý AI Đội TNTP (Gemini)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Trợ lý AI</span>
            </button>

            {/* Nút Settings (API Key) kèm dòng chữ màu đỏ bắt buộc hiển thị trên Header (AI_INSTRUCTIONS.md) */}
            <button
              onClick={onOpenApiKeySettings}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs group"
              title="Thiết lập Model & API Key Gemini"
            >
              <Key className="w-3.5 h-3.5 text-rose-600 group-hover:rotate-45 transition-transform" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-700 font-bold">Settings (API Key)</span>
                <span className="text-[9px] text-rose-600 font-extrabold tracking-tight">
                  Lấy API key để sử dụng app
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Secondary Bar: Role Switching & RBAC Status */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* RBAC Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Vai trò người dùng (RBAC):</span>
            <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 shadow-2xs">
              <button
                onClick={() => setCurrentRole('admin')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  currentRole === 'admin'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Tổng phụ trách (Admin)</span>
                {pendingDisputesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                    {pendingDisputesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentRole('codo')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  currentRole === 'codo'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-rose-400 font-bold">★</span>
                <span>Đội Cờ đỏ (Sao đỏ)</span>
              </button>

              <button
                onClick={() => setCurrentRole('gvcn')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  currentRole === 'gvcn'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👨‍🏫</span>
                <span>Giáo viên Chủ nhiệm (GVCN)</span>
              </button>
            </div>
          </div>

          {/* Status info: Week Lock & Level Badge */}
          <div className="flex items-center gap-3">
            {currentRole === 'admin' && (
              <button
                onClick={toggleWeekLock}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition-colors ${
                  isWeekLocked
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {isWeekLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tuần {currentWeek} đã KHÓA SỔ</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tuần {currentWeek} ĐANG MỞ CHẤM</span>
                  </>
                )}
              </button>
            )}

            {isWeekLocked && currentRole !== 'admin' && (
              <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Lock className="w-3 h-3" />
                <span>Dữ liệu Tuần {currentWeek} đã chốt sổ</span>
              </div>
            )}

            <div className="text-slate-500">
              Cơ sở: <span className="font-semibold text-slate-800">{activeLevel === 'tieuhoc' ? '19 lớp Tiểu học' : '12 lớp THCS'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
