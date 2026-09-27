import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Cpu, 
  Sparkles, 
  Eye, 
  EyeOff, 
  RotateCw,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { 
  AVAILABLE_MODELS, 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  getSelectedModel, 
  saveSelectedModel, 
  testGeminiApiKey 
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRequired?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onClose, 
  isRequired = false 
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getGeminiApiKey());
      setSelectedModel(getSelectedModel());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      alert('Vui lòng nhập API Key từ Google AI Studio');
      return;
    }

    saveGeminiApiKey(apiKeyInput.trim());
    saveSelectedModel(selectedModel);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng dán API Key trước khi kiểm tra'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(apiKeyInput.trim(), selectedModel);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Lỗi kiểm tra kết nối'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveKey = () => {
    if (confirm('Bạn có chắc muốn xóa API Key khỏi trình duyệt này?')) {
      saveGeminiApiKey('');
      setApiKeyInput('');
      setTestResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                <span>Thiết Lập Model & API Key Gemini</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                  Bắt buộc
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Người dùng tự quản lý API Key an toàn trong trình duyệt (localStorage)
              </p>
            </div>
          </div>

          {!isRequired && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">

          {/* Guide link banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 text-xs">Chưa có API Key hoặc bị hết hạn ngạch (Quota)?</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Google cung cấp miễn phí API Key Gemini cho giáo dục và lập trình. Bạn chỉ mất 30 giây để tạo key:
                </p>
                <div className="mt-2">
                  <a
                    href="https://aistudio.google.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                  >
                    <span>Lấy API Key Miễn Phí tại Google AI Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Khóa Google Gemini API Key</span>
              {apiKeyInput && (
                <span className="text-[11px] font-normal text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Được lưu an toàn trong máy bạn
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="Dán mã API Key của bạn vào đây (AIzaSy...)"
                required
                className="w-full pl-3.5 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />

              <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                  title={showKey ? 'Ẩn key' : 'Hiện key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting || !apiKeyInput.trim()}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Gửi thử lệnh kiểm tra tới máy chủ Google"
                >
                  {isTesting ? <RotateCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-amber-600" />}
                  <span>{isTesting ? 'Đang test...' : 'Test'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Hệ thống không gửi API Key về bất kỳ máy chủ trung gian nào. Key chỉ được dùng trực tiếp từ trình duyệt của bạn tới Google API.
            </p>
          </div>

          {/* Test Result Toast */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <div className="flex-1 font-medium">{testResult.message}</div>
            </div>
          )}

          {/* Model Selection (Displayed as Cards - Yêu cầu mục 2 AI_INSTRUCTIONS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">
                Chọn Model AI Mặc Định (Thứ tự tự động Fallback):
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Tự động đổi model khi quá tải
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE_MODELS.map(model => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          model.isDefault 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {model.badge}
                        </span>
                        <input
                          type="radio"
                          name="modelOption"
                          value={model.id}
                          checked={isSelected}
                          onChange={() => setSelectedModel(model.id)}
                          className="text-indigo-600"
                        />
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-1">
                        {model.name}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {model.description}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-1.5">
                      {model.id}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
              <span className="font-bold text-indigo-700 shrink-0">Cơ chế Fallback:</span>
              <span>
                Nếu model đang chọn gặp lỗi hoặc hết hạn ngạch (429 RESOURCE_EXHAUSTED), hệ thống sẽ <strong>tự động chuyển ngay</strong> sang model tiếp theo trong chuỗi mà không làm mất kết quả bước trước đó.
              </span>
            </div>
          </div>

          {/* Success Save Notice */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu API Key và Cấu hình Model thành công!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            {apiKeyInput ? (
              <button
                type="button"
                onClick={handleRemoveKey}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
              >
                Xóa Key khỏi máy
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {!isRequired && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lưu & Sử Dụng Ngay</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
