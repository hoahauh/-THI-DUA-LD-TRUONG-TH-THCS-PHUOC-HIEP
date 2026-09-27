import React from 'react';
import { 
  FileCode2, 
  X, 
  Check, 
  Copy, 
  Printer, 
  Database, 
  ShieldCheck, 
  Workflow, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';

interface ArchitectureDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocModal: React.FC<ArchitectureDocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                Tài Liệu Thiết Kế & Kiến Trúc Hệ Thống (THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP)
              </h2>
              <p className="text-xs text-slate-500">
                Giải pháp quản lý thi đua học đường liên cấp Trường TH&THCS Phước Hiệp (Tiểu học 19 lớp · THCS 12 lớp)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title="In tài liệu"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - 5 Sections from the Prompt */}
        <div className="p-6 overflow-y-auto space-y-8 text-xs text-slate-700 leading-relaxed font-sans">
          
          {/* SECTION 1: PHÂN TÍCH YÊU CẦU */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Phân Tích Yêu Cầu Nghiệp Vụ (Business Logic & System Requirements)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span>🏢</span> Quy mô & Tính Biệt Lập (Level Isolation)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong>Khối Tiểu học (19 lớp):</strong> 1A1-1A4 (4 lớp), 2A1-2A4 (4 lớp), 3A1-3A4 (4 lớp), 4A1-4A4 (4 lớp), 5A1-5A3 (3 lớp).</li>
                  <li><strong>Khối THCS (12 lớp):</strong> 6A1-6A3 (3 lớp), 7A1-7A3 (3 lớp), 8A1-8A3 (3 lớp), 9A1-9A3 (3 lớp).</li>
                  <li><strong>Nguyên tắc:</strong> Xử lý dữ liệu và xếp hạng độc lập theo từng khối (không gộp chung thi đua tiểu học với cấp 2 do khác biệt về tâm sinh lý và điều lệ), nhưng cùng quản trị trên một giao diện thống nhất.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span>🛡️</span> Hệ thống Phân Quyền (RBAC Matrix)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong>Tổng phụ trách (Admin):</strong> Toàn quyền cấu hình tiêu chí, phân công chấm chéo, xét duyệt khiếu nại, khóa sổ tuần, cấp cờ thi đua.</li>
                  <li><strong>Đội Cờ đỏ (Sao đỏ):</strong> Chỉ được chấm điểm cho lớp được phân công theo ca trực (kiểm soát chống chấm bừa/chấm thiên vị).</li>
                  <li><strong>Giáo viên Chủ nhiệm (GVCN):</strong> Xem biến động điểm số lớp mình theo thời gian thực, gửi giải trình/khiếu nại có đính kèm minh chứng.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 2: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Thiết Kế Cơ Sở Dữ Liệu Google Sheets (Database Schema - 4 Tabs)
              </h3>
            </div>

            <p className="text-slate-600">
              Hệ thống sử dụng Google Sheets làm Backend Database được chuẩn hóa thành 4 bảng dữ liệu (Sheet Tabs):
            </p>

            <div className="space-y-4">
              
              {/* Tab 1 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-900 flex items-center justify-between">
                  <span>Tab 1: 01_DanhMuc_QuyDinh (Master Criteria Catalog)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Quản lý các tiêu chuẩn vi phạm & biểu điểm</span>
                </div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b">
                      <th className="p-2">Tên cột (Header)</th>
                      <th className="p-2">Kiểu dữ liệu</th>
                      <th className="p-2">Ràng buộc (Constraint)</th>
                      <th className="p-2">Mô tả chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="p-2 font-mono">Criteria_ID</td><td className="p-2">String</td><td className="p-2 text-rose-600 font-semibold">Primary Key</td><td>Mã tiêu chí duy nhất (VD: VP-01, KT-02)</td></tr>
                    <tr><td className="p-2 font-mono">Category</td><td className="p-2">Enum</td><td className="p-2">Not Null</td><td>Chuyên cần, Đồng phục, Kỷ luật, Vệ sinh, Phong trào</td></tr>
                    <tr><td className="p-2 font-mono">Criteria_Name</td><td className="p-2">String</td><td className="p-2">Not Null</td><td>Tên lỗi vi phạm hoặc thành tích khen thưởng</td></tr>
                    <tr><td className="p-2 font-mono">Point_Delta</td><td className="p-2">Integer</td><td className="p-2">Numeric</td><td>Mức điểm (-2, -5, +5, +10)</td></tr>
                    <tr><td className="p-2 font-mono">Applicable_Level</td><td className="p-2">String</td><td className="p-2">TieuHoc; THCS</td><td>Khối trường áp dụng tiêu chuẩn này</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Tab 2 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-900 flex items-center justify-between">
                  <span>Tab 2: 02_PhanCong_CoDo (Cross-Check RBAC Assignments)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Ràng buộc quyền chấm chéo của học sinh cờ đỏ</span>
                </div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b">
                      <th className="p-2">Tên cột (Header)</th>
                      <th className="p-2">Kiểu dữ liệu</th>
                      <th className="p-2">Ràng buộc (Constraint)</th>
                      <th className="p-2">Mô tả chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="p-2 font-mono">Assignment_ID</td><td className="p-2">String</td><td className="p-2 text-rose-600 font-semibold">Primary Key</td><td>Mã phân công duy nhất (VD: PC-TH-01)</td></tr>
                    <tr><td className="p-2 font-mono">Student_ID</td><td className="p-2">String</td><td className="p-2">Not Null</td><td>Mã định danh học sinh Cờ đỏ</td></tr>
                    <tr><td className="p-2 font-mono">From_Class</td><td className="p-2">String</td><td className="p-2">ForeignKey(Classes)</td><td>Lớp học của cờ đỏ (VD: 5A1)</td></tr>
                    <tr><td className="p-2 font-mono">Target_Class</td><td className="p-2">String</td><td className="p-2">ForeignKey(Classes)</td><td>Lớp được quyền chấm chéo (VD: 4A2)</td></tr>
                    <tr><td className="p-2 font-mono">Shift_Type</td><td className="p-2">Enum</td><td className="p-2">DauGio, RaChoi...</td><td>Ca trực phụ trách kiểm tra</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Tab 3 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-900 flex items-center justify-between">
                  <span>Tab 3: 03_NhatKy_ViPham (Infraction & Merit Logs)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Nhật ký sự vụ có tem thời gian và minh chứng</span>
                </div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b">
                      <th className="p-2">Tên cột (Header)</th>
                      <th className="p-2">Kiểu dữ liệu</th>
                      <th className="p-2">Ràng buộc (Constraint)</th>
                      <th className="p-2">Mô tả chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="p-2 font-mono">Log_ID</td><td className="p-2">String</td><td className="p-2 text-rose-600 font-semibold">Primary Key</td><td>Mã sự vụ ghi nhận (VD: LOG-20260925-001)</td></tr>
                    <tr><td className="p-2 font-mono">Timestamp</td><td className="p-2">DateTime</td><td className="p-2">Auto-generated</td><td>Thời gian chính xác khi lập biên bản</td></tr>
                    <tr><td className="p-2 font-mono">Class_ID</td><td className="p-2">String</td><td className="p-2">ForeignKey</td><td>Lớp bị trừ hoặc được thưởng điểm</td></tr>
                    <tr><td className="p-2 font-mono">Student_Name</td><td className="p-2">String</td><td className="p-2">Optional</td><td>Họ tên học sinh hoặc "Tập thể lớp"</td></tr>
                    <tr><td className="p-2 font-mono">Criteria_ID</td><td className="p-2">String</td><td className="p-2">ForeignKey</td><td>Mã lỗi/thưởng chiếu theo Tab 1</td></tr>
                    <tr><td className="p-2 font-mono">Evidence_URL</td><td className="p-2">String</td><td className="p-2">URL / Text</td><td>Đường link ảnh chụp hiện trường hoặc ghi chú</td></tr>
                    <tr><td className="p-2 font-mono">Status</td><td className="p-2">Enum</td><td className="p-2">Pending, Verified...</td><td>Trạng thái: Đã duyệt, Đang khiếu nại, Đã hủy</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Tab 4 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-900 flex items-center justify-between">
                  <span>Tab 4: 04_TongHop_XepHang (Weekly Aggregations & Awards)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Bảng điểm tổng hợp tuần và xếp hạng cờ thi đua</span>
                </div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b">
                      <th className="p-2">Tên cột (Header)</th>
                      <th className="p-2">Kiểu dữ liệu</th>
                      <th className="p-2">Công thức tính toán (Formula)</th>
                      <th className="p-2">Ý nghĩa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="p-2 font-mono">Final_Score</td><td className="p-2">Number</td><td className="p-2 font-mono text-indigo-700">=100 - SUMIFS(...) + SUMIFS(...)</td><td>Điểm thi đua chung cuộc của tuần</td></tr>
                    <tr><td className="p-2 font-mono">Rank</td><td className="p-2">Integer</td><td className="p-2 font-mono text-indigo-700">=RANK(Final_Score, $Final_Score$1:$Final_Score$19)</td><td>Thứ hạng trong khối</td></tr>
                    <tr><td className="p-2 font-mono">Flag_Award</td><td className="p-2">String</td><td className="p-2 font-mono text-indigo-700">=IFS(Rank=1, "Cờ Nhất", Rank=2, "Cờ Nhì", ...)</td><td>Danh hiệu cờ luân lưu trao chào cờ</td></tr>
                  </tbody>
                </table>
              </div>

            </div>
          </section>

          {/* SECTION 3: LUỒNG NGƯỜI DÙNG (USER FLOW) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Luồng Người Dùng Chuẩn Hóa (User Flow Diagrams)
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-900 text-xs">Luồng 1: Đội Cờ Đỏ Chấm Chéo</span>
                <p className="text-slate-600 mt-1">
                  Đăng nhập ➔ Hệ thống kiểm tra ca trực & lớp được phân công ➔ Chọn tiêu chí vi phạm ➔ Nhập tên học sinh/tập thể ➔ Ghi chú & chụp minh chứng ➔ Nhấn "Gửi" ➔ Dữ liệu tự động ghi vào Tab 3 trên Google Sheets trong thời gian thực.
                </p>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200">
                <span className="font-bold text-indigo-900 text-xs">Luồng 2: Giáo Viên Chủ Nhiệm (GVCN) Theo Dõi & Giải Trình</span>
                <p className="text-slate-600 mt-1">
                  Mở ứng dụng ➔ Xem biến động điểm và thứ hạng lớp mình ➔ Rà soát danh sách bị trừ điểm ➔ Nếu phát hiện sai sót, chọn sự vụ và gửi form "Giải trình / Khiếu nại" kèm minh chứng xác nhận trước 16h30 Thứ Sáu.
                </p>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 text-xs">Luồng 3: Tổng Phụ Trách Đội (Admin) Kiểm Soát & Khóa Sổ</span>
                <p className="text-slate-600 mt-1">
                  Kiểm tra toàn bộ vi phạm ➔ Xem xét hộp thư khiếu nại (Chấp thuận hoàn điểm hoặc bác bỏ) ➔ Nhấn "Khóa sổ Tuần" để đóng quyền nhập liệu của Cờ đỏ ➔ Hệ thống tính toán trao Cờ Nhất, Nhì, Ba ➔ Xuất file in biên bản trình Ban Giám Hiệu.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: GIẢI PHÁP KỸ THUẬT */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Giải Pháp Kỹ Thuật (Architecture & Implementation Stack)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Công thức Google Sheets cốt lõi</h4>
                <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] leading-relaxed">
                  =100 - SUMIFS('03_NhatKy'!F:F, '03_NhatKy'!C:C, B2, '03_NhatKy'!D:D, "minus", '03_NhatKy'!N:N, "&lt;&gt;resolved_approved") + SUMIFS('03_NhatKy'!F:F, '03_NhatKy'!C:C, B2, '03_NhatKy'!D:D, "plus")
                </div>
                <p className="text-[11px] text-slate-500">
                  Tự động loại trừ các lỗi đã được Tổng phụ trách phê duyệt xóa lỗi qua khiếu nại.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Giao thức Đồng bộ Real-Time Webhook</h4>
                <p className="text-slate-600">
                  Triển khai Google Apps Script dưới dạng Web App (URL Endpoint) nhận lệnh POST từ React Frontend hoặc AppSheet. Độ trễ trung bình &lt; 500ms, tự động ghi nối tiếp (appendRow) hạn chế nghẽn xung đột đồng thời.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5: LƯU Ý VẬN HÀNH & BẢO MẬT */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Lưu Ý Vận Hành, Chống Gian Lận & An Toàn Dữ Liệu
              </h3>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Kiểm soát gian lận cờ đỏ (Cross-check Anti-tamper):</strong> Cờ đỏ tuyệt đối không được chấm lớp của chính mình. Xoay vòng lịch phân công chấm chéo 2 tuần/lần để tránh hiện tượng móc ngoặc hoặc tư thù giữa các lớp.
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <strong>Quy tắc thời hạn khiếu nại (24h SLA):</strong> GVCN chỉ được gửi giải trình trong vòng 24 giờ kể từ khi sự vụ được ghi nhận, và hạn chót vào 16h30 Thứ Sáu hàng tuần.
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <Database className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <div>
                  <strong>Sao lưu & Khóa phiên bản (Data Versioning):</strong> Mỗi khi Tổng phụ trách bấm "Khóa sổ tuần", hệ thống tự động lưu bản snapshot của tuần đó để phục vụ lưu trữ học bạ và xét thi đua cuối học kỳ.
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Tài liệu thuộc chuẩn kiến trúc THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP · 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Đóng Tài Liệu
          </button>
        </div>

      </div>
    </div>
  );
};
