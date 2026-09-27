import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  X, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  Layers,
  ArrowRight,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { 
  getGeminiApiKey, 
  FALLBACK_CHAIN, 
  generateContentWithFallback, 
  StepState 
} from '../services/geminiService';

interface AiSpeechAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeySettings: () => void;
}

export const AiSpeechAssistantModal: React.FC<AiSpeechAssistantModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenApiKeySettings
}) => {
  const { 
    currentWeek, 
    activeLevel, 
    summaries, 
    records, 
    classes 
  } = useApp();

  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modelSwitchNotice, setModelSwitchNotice] = useState<string | null>(null);
  const [apiRawError, setApiRawError] = useState<string | null>(null);

  // Quy trình 3 bước xử lý theo đúng mục 1 & mục 3 trong AI_INSTRUCTIONS.md
  const [steps, setSteps] = useState<StepState[]>([
    {
      stepIndex: 1,
      name: 'Bước 1: Phân tích số liệu thi đua',
      description: 'Tổng hợp điểm số 19 lớp Tiểu học & 12 lớp THCS, xác định Top 3 Cờ và các nhóm vi phạm nhiều nhất.',
      status: 'idle'
    },
    {
      stepIndex: 2,
      name: 'Bước 2: Đánh giá ưu khuyết điểm sư phạm',
      description: 'Đánh giá chuyển biến nề nếp, phân tích nguyên nhân các lớp sa sút và biểu dương cá nhân xuất sắc.',
      status: 'idle'
    },
    {
      stepIndex: 3,
      name: 'Bước 3: Soạn bài phát biểu Chào cờ hoàn chỉnh',
      description: 'Tạo văn bản diễn văn 3-5 phút cho Tổng phụ trách Đội TNTP với đầy đủ mở đầu, nhận xét, phát động tuần tới.',
      status: 'idle'
    }
  ]);

  const [finalSpeech, setFinalSpeech] = useState<string>('');

  if (!isOpen) return null;

  const apiKey = getGeminiApiKey();

  // Khởi động quy trình AI 3 bước với Fallback và Quản lý lỗi nghiêm ngặt
  const handleStartGeneration = async () => {
    if (!apiKey) {
      onOpenApiKeySettings();
      return;
    }

    setIsRunning(true);
    setApiRawError(null);
    setModelSwitchNotice(null);
    setFinalSpeech('');

    // Dữ liệu bối cảnh tuần gửi cho AI
    const weekRecords = records.filter(r => r.weekNumber === currentWeek);
    const top3 = summaries.slice(0, 3).map(s => `${s.rank}. ${s.className} (${s.finalScore}đ - GVCN: ${s.teacherName})`).join(', ');
    const bottom3 = summaries.slice(-3).map(s => `${s.className} (${s.finalScore}đ, trừ ${s.totalDeductions}đ)`).join(', ');
    const commonInfractions = weekRecords.slice(0, 8).map(r => `[${r.classId}] ${r.criteriaName} (${r.points}đ) - ${r.studentName}`).join('; ');

    const systemPrompt = `Bạn là Trợ lý AI Đội Thiếu Niên Tiền Phong Hồ Chí Minh của TRƯỜNG TH&THCS PHƯỚC HIỆP.
Nhiệm vụ: Hỗ trợ Thầy Tổng phụ trách Đội phân tích thi đua nề nếp và soạn bài nhận xét sinh hoạt dưới cờ sáng Thứ Hai Tuần ${currentWeek}.
Quy mô trường: 31 lớp liên cấp (Khối Tiểu học 19 lớp, Khối THCS 12 lớp).
Văn phong: Chuẩn mực sư phạm, trang trọng, gần gũi với học sinh, khích lệ động viên nề nếp tích cực.`;

    let step1Result = '';
    let step2Result = '';

    // --- BƯỚC 1 ---
    try {
      setSteps(prev => [
        { ...prev[0], status: 'running' },
        { ...prev[1], status: 'idle' },
        { ...prev[2], status: 'idle' }
      ]);

      const prompt1 = `DỮ LIỆU TUẦN ${currentWeek} - TRƯỜNG TH&THCS PHƯỚC HIỆP:
- Top đầu: ${top3}
- Lớp cần cố gắng: ${bottom3}
- Một số vi phạm tiêu biểu trong tuần: ${commonInfractions}

Hãy thực hiện BƯỚC 1: Phân tích ngắn gọn (khoảng 150-200 từ) về các số liệu thi đua nổi bật của tuần: Tuyên dương các lớp dẫn đầu, chỉ ra các lỗi nề nếp thường gặp nhất (chuyên cần, đồng phục, vệ sinh).`;

      const res1 = await generateContentWithFallback(
        prompt1,
        systemPrompt,
        undefined,
        (fromM, toM, err) => {
          setModelSwitchNotice(`[Bước 1] Model ${fromM} lỗi (${err.slice(0, 40)}...). Tự động chuyển sang ${toM}`);
        }
      );

      step1Result = res1.text;
      setSteps(prev => [
        { ...prev[0], status: 'success', result: res1.text, modelUsed: res1.modelUsed },
        prev[1],
        prev[2]
      ]);
    } catch (err: any) {
      // BƯỚC 1 THẤT BẠI: Dừng ngay, đánh dấu "Đã dừng do lỗi", tuyệt đối không hiện checkmark xanh
      const errorMsg = err.message || 'Lỗi API không xác định';
      setApiRawError(errorMsg);
      setSteps(prev => [
        { ...prev[0], status: 'failed', error: errorMsg },
        { ...prev[1], status: 'stopped' },
        { ...prev[2], status: 'stopped' }
      ]);
      setIsRunning(false);
      return;
    }

    // --- BƯỚC 2 ---
    try {
      setSteps(prev => [
        prev[0],
        { ...prev[1], status: 'running' },
        { ...prev[2], status: 'idle' }
      ]);

      const prompt2 = `Dựa trên kết quả phân tích Bước 1:\n${step1Result}\n
Hãy thực hiện BƯỚC 2: Đánh giá ưu điểm và khuyết điểm sư phạm:
1. Những điểm sáng đáng khen ngợi (tinh thần tự giác, nhặt được của rơi, giữ gìn vệ sinh).
2. Những tồn tại cần khắc phục ở từng khối (Tiểu học và THCS).
3. Gợi ý ngắn cho Giáo viên chủ nhiệm để phối hợp chấn chỉnh.`;

      const res2 = await generateContentWithFallback(
        prompt2,
        systemPrompt,
        undefined,
        (fromM, toM, err) => {
          setModelSwitchNotice(`[Bước 2] Model ${fromM} lỗi (${err.slice(0, 40)}...). Tự động chuyển sang ${toM}`);
        }
      );

      step2Result = res2.text;
      setSteps(prev => [
        prev[0],
        { ...prev[1], status: 'success', result: res2.text, modelUsed: res2.modelUsed },
        prev[2]
      ]);
    } catch (err: any) {
      // BƯỚC 2 THẤT BẠI: Giữ nguyên Bước 1 thành công, Bước 2 failed, Bước 3 dừng
      const errorMsg = err.message || 'Lỗi API không xác định';
      setApiRawError(errorMsg);
      setSteps(prev => [
        prev[0],
        { ...prev[1], status: 'failed', error: errorMsg },
        { ...prev[2], status: 'stopped' }
      ]);
      setIsRunning(false);
      return;
    }

    // --- BƯỚC 3 ---
    try {
      setSteps(prev => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'running' }
      ]);

      const prompt3 = `Tổng hợp kết quả Bước 1 và Bước 2:\n${step1Result}\n\n${step2Result}\n
Hãy thực hiện BƯỚC 3: Soạn BÀI PHÁT BIỂU NHẬN XÉT THI ĐUA CHÀO CỜ TUẦN ${currentWeek} hoàn chỉnh cho Thầy Tổng phụ trách Đội Trường TH&THCS Phước Hiệp.
Yêu cầu bố cục:
1. Lời chào trang trọng gửi Ban Giám hiệu, quý thầy cô giáo và toàn thể các em đội viên, nhi đồng.
2. Công bố kết quả và tuyên dương các Chi đội đạt Cờ Nhất, Cờ Nhì, Cờ Ba tuần qua.
3. Nhận xét cụ thể ưu điểm và các điểm cần chấn chỉnh trong tuần.
4. Phát động phong trào và nhiệm vụ trọng tâm Tuần ${currentWeek + 1}.
5. Lời chúc tuần mới học tốt, rèn luyện chăm.`;

      const res3 = await generateContentWithFallback(
        prompt3,
        systemPrompt,
        undefined,
        (fromM, toM, err) => {
          setModelSwitchNotice(`[Bước 3] Model ${fromM} lỗi (${err.slice(0, 40)}...). Tự động chuyển sang ${toM}`);
        }
      );

      setFinalSpeech(res3.text);
      setSteps(prev => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'success', result: res3.text, modelUsed: res3.modelUsed }
      ]);
    } catch (err: any) {
      // BƯỚC 3 THẤT BẠI: Giữ nguyên Bước 1 và Bước 2, Bước 3 failed
      const errorMsg = err.message || 'Lỗi API không xác định';
      setApiRawError(errorMsg);
      setSteps(prev => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'failed', error: errorMsg }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopySpeech = () => {
    if (!finalSpeech) return;
    navigator.clipboard.writeText(finalSpeech);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    if (!finalSpeech) return;
    const blob = new Blob([finalSpeech], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bai_Phat_Bieu_Chao_Co_Tuan_${currentWeek}_TH_THCS_Phuoc_Hiep.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tính toán phần trăm tiến trình thật
  const successfulStepsCount = steps.filter(s => s.status === 'success').length;
  const progressPercent = Math.round((successfulStepsCount / 3) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-rose-500 flex items-center justify-center text-white shadow-md font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">
                  Trợ Lý AI Đội TNTP - Trường TH&THCS Phước Hiệp
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/40 text-indigo-100 border border-indigo-400/40">
                  Gemini Multi-Step Engine
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Tự động hóa 3 bước: Phân tích số liệu ➔ Đánh giá sư phạm ➔ Soạn bài nhận xét Chào cờ tuần {currentWeek}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiKeySettings}
              className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 cursor-pointer"
            >
              Cài đặt Key
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Missing API Key Warning */}
          {!apiKey && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-900">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong>Chưa có Google Gemini API Key!</strong>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Để sử dụng tính năng Trợ lý AI, bạn cần nhập API Key (miễn phí) từ Google AI Studio.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenApiKeySettings}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition-colors shadow-xs cursor-pointer"
              >
                Nhập API Key Ngay
              </button>
            </div>
          )}

          {/* Model Switch Alert (Cơ chế fallback tự động thông báo cho người dùng) */}
          {modelSwitchNotice && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{modelSwitchNotice}</span>
            </div>
          )}

          {/* Raw Error Banner (Yêu cầu mục 3: Hiển thị nguyên văn lỗi API màu đỏ) */}
          {apiRawError && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 space-y-1 animate-shake">
              <div className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>LỖI KẾT NỐI API GEMINI (TẤT CẢ MODEL ĐỀU THẤT BẠI)</span>
              </div>
              <p className="font-mono text-[11px] bg-white p-2.5 rounded border border-rose-200 text-rose-800 break-all">
                {apiRawError}
              </p>
              <p className="text-[11px] text-rose-600 pt-1">
                Gợi ý: Nếu gặp lỗi <code>429 RESOURCE_EXHAUSTED</code>, vui lòng bấm nút "Cài đặt Key" để thay đổi API Key khác hoặc đợi 1-2 phút rồi thử lại.
              </p>
            </div>
          )}

          {/* Multi-step Progress Bar (Yêu cầu mục 3: Chỉ xanh khi thành công thực sự) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Tiến trình xử lý 3 bước AI:</span>
              <span className={successfulStepsCount === 3 ? 'text-emerald-600 font-bold' : 'text-indigo-600'}>
                {successfulStepsCount}/3 bước hoàn tất ({progressPercent}%)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-500 ${
                  apiRawError 
                    ? 'bg-rose-500' 
                    : successfulStepsCount === 3 
                      ? 'bg-emerald-500' 
                      : 'bg-indigo-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {steps.map(step => {
              let borderClass = 'border-slate-200 bg-white';
              let badgeColor = 'bg-slate-100 text-slate-600';
              let badgeText = 'Chờ xử lý';

              if (step.status === 'running') {
                borderClass = 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20';
                badgeColor = 'bg-indigo-100 text-indigo-700 animate-pulse';
                badgeText = 'Đang xử lý...';
              } else if (step.status === 'success') {
                borderClass = 'border-emerald-300 bg-emerald-50/30';
                badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
                badgeText = '✓ Hoàn thành';
              } else if (step.status === 'failed') {
                borderClass = 'border-rose-300 bg-rose-50/50';
                badgeColor = 'bg-rose-100 text-rose-800 font-bold';
                badgeText = '✕ Lỗi';
              } else if (step.status === 'stopped') {
                borderClass = 'border-slate-200 bg-slate-50 opacity-60';
                badgeColor = 'bg-rose-100 text-rose-700 font-bold';
                badgeText = 'Đã dừng do lỗi'; // Yêu cầu tuyệt đối của mục 3 AI_INSTRUCTIONS
              }

              return (
                <div key={step.stepIndex} className={`p-3.5 rounded-xl border transition-all ${borderClass} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{step.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {step.description}
                  </p>
                  {step.modelUsed && (
                    <div className="text-[10px] text-indigo-600 font-mono">
                      Model: {step.modelUsed}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action trigger button */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="font-bold text-slate-800 text-xs">Sẵn sàng khởi động Trợ lý AI:</span>
              <p className="text-slate-500 text-[11px]">
                Dữ liệu Tuần {currentWeek} sẽ được gửi tới chuỗi Fallback Gemini để tự động tạo báo cáo.
              </p>
            </div>

            <button
              onClick={handleStartGeneration}
              disabled={isRunning}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý quy trình 3 bước...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt Đầu Tạo Bài Nhận Xét Chào Cờ</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Output */}
          {finalSpeech && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Bản Dự Thảo Bài Phát Biểu Nhận Xét Chào Cờ (Tuần {currentWeek})</span>
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySpeech}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải tệp .txt</span>
                  </button>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed whitespace-pre-wrap font-sans text-xs text-slate-800 max-h-96 overflow-y-auto shadow-2xs">
                {finalSpeech}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
