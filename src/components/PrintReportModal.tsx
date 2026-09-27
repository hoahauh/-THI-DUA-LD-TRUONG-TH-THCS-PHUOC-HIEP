import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { activeLevel, currentWeek, summaries, exportToCsv } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl print:hidden">
          <div className="text-xs font-semibold text-slate-700">
            Xem trước bản in Báo Cáo Thi Đua Tuần {currentWeek}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCsv('summaries')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Biên Bản Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 font-serif leading-relaxed text-xs">
          
          {/* Header Quốc hiệu Tiêu ngữ */}
          <div className="grid grid-cols-2 text-center pb-4 border-b border-slate-800">
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px]">ĐỘI TNTP HỒ CHÍ MINH</div>
              <div className="font-bold uppercase text-[10px] mt-0.5">LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP</div>
              <div className="text-[10px] text-slate-600 italic">Số: ...... /BB-TĐ</div>
            </div>

            <div>
              <div className="font-bold uppercase tracking-wider text-[11px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-bold underline text-[10px] mt-0.5">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[10px] text-slate-600 italic mt-1">Hà Nội, ngày 27 tháng 09 năm 2026</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-base font-bold uppercase tracking-wide">
              BIÊN BẢN TỔNG HỢP KẾT QUẢ THI ĐUA NỀ NẾP TUẦN {currentWeek}
            </h2>
            <p className="text-xs italic text-slate-700 mt-1">
              Khối: <span className="font-bold uppercase">{activeLevel === 'tieuhoc' ? 'Tiểu Học (19 Lớp)' : 'THCS (12 Lớp)'}</span> · Năm học 2026 - 2027
            </p>
          </div>

          {/* Honors Section */}
          <div className="mb-6 p-4 border border-slate-300 rounded-lg bg-slate-50/50">
            <h4 className="font-bold uppercase text-[11px] mb-2 text-slate-800">
              I. CÁC TẬP THỂ XUẤT SẮC ĐẠT CỜ THI ĐUA TRONG TUẦN:
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 border border-slate-200 bg-white rounded">
                <div className="text-[10px] font-bold text-amber-700">🥇 CỜ NHẤT</div>
                <div className="font-bold text-sm mt-0.5">{summaries[0]?.className || '---'}</div>
                <div className="text-[10px] text-slate-600">{summaries[0]?.finalScore} Điểm · {summaries[0]?.teacherName}</div>
              </div>
              <div className="p-2 border border-slate-200 bg-white rounded">
                <div className="text-[10px] font-bold text-slate-700">🥈 CỜ NHÌ</div>
                <div className="font-bold text-sm mt-0.5">{summaries[1]?.className || '---'}</div>
                <div className="text-[10px] text-slate-600">{summaries[1]?.finalScore} Điểm · {summaries[1]?.teacherName}</div>
              </div>
              <div className="p-2 border border-slate-200 bg-white rounded">
                <div className="text-[10px] font-bold text-amber-900">🥉 CỜ BA</div>
                <div className="font-bold text-sm mt-0.5">{summaries[2]?.className || '---'}</div>
                <div className="text-[10px] text-slate-600">{summaries[2]?.finalScore} Điểm · {summaries[2]?.teacherName}</div>
              </div>
            </div>
          </div>

          {/* Full Table */}
          <div className="mb-6">
            <h4 className="font-bold uppercase text-[11px] mb-2 text-slate-800">
              II. BẢNG TỔNG HỢP CHI TIẾT CÁC LỚP:
            </h4>
            <table className="w-full text-left border-collapse border border-slate-400 text-[10px] font-sans">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 font-bold text-center">
                  <th className="p-1.5 border-r border-slate-400 w-10">Hạng</th>
                  <th className="p-1.5 border-r border-slate-400 text-left">Lớp</th>
                  <th className="p-1.5 border-r border-slate-400 text-left">Giáo viên chủ nhiệm</th>
                  <th className="p-1.5 border-r border-slate-400 w-14">Điểm gốc</th>
                  <th className="p-1.5 border-r border-slate-400 w-14">Tổng trừ</th>
                  <th className="p-1.5 border-r border-slate-400 w-14">Tổng cộng</th>
                  <th className="p-1.5 border-r border-slate-400 w-16 font-bold">Điểm cuối</th>
                  <th className="p-1.5 border-r border-slate-400 w-20">Xếp loại</th>
                  <th className="p-1.5 w-20">Cờ thi đua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {summaries.map(s => (
                  <tr key={s.classId} className="border-b border-slate-300">
                    <td className="p-1.5 text-center font-bold border-r border-slate-300">{s.rank}</td>
                    <td className="p-1.5 font-bold border-r border-slate-300">{s.className}</td>
                    <td className="p-1.5 border-r border-slate-300">{s.teacherName}</td>
                    <td className="p-1.5 text-center border-r border-slate-300">{s.basePoints}</td>
                    <td className="p-1.5 text-center text-rose-700 font-medium border-r border-slate-300">
                      {s.totalDeductions > 0 ? `-${s.totalDeductions}` : '0'}
                    </td>
                    <td className="p-1.5 text-center text-emerald-700 font-medium border-r border-slate-300">
                      {s.totalMerits > 0 ? `+${s.totalMerits}` : '0'}
                    </td>
                    <td className="p-1.5 text-center font-bold border-r border-slate-300">{s.finalScore}</td>
                    <td className="p-1.5 text-center border-r border-slate-300">{s.rankingClassification}</td>
                    <td className="p-1.5 text-center font-bold text-amber-700">{s.flagAward || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 text-center pt-8 border-t border-slate-300">
            <div>
              <div className="font-bold text-[11px] uppercase">BAN CHỈ HUY LIÊN ĐỘI</div>
              <div className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="font-bold text-xs">Trần Gia Huy</div>
            </div>

            <div>
              <div className="font-bold text-[11px] uppercase">TỔNG PHỤ TRÁCH ĐỘI</div>
              <div className="text-[10px] text-slate-500 italic">(Ký và phê duyệt)</div>
              <div className="h-16"></div>
              <div className="font-bold text-xs">Thầy Lê Hoàng Nam</div>
            </div>

            <div>
              <div className="font-bold text-[11px] uppercase">BAN GIÁM HIỆU NHÀ TRƯỜNG</div>
              <div className="text-[10px] text-slate-500 italic">(Ký tên và đóng dấu)</div>
              <div className="h-16"></div>
              <div className="font-bold text-xs">Hiệu Trưởng</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
