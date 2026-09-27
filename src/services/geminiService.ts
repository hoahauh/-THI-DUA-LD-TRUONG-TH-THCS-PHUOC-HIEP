/**
 * Gemini AI Service with Multi-Model Fallback & API Key Management
 * Tuân thủ quy định tại AI_INSTRUCTIONS.md:
 * - Model mặc định: gemini-3-flash-preview (hoặc gemini-3-pro-preview)
 * - Thứ tự fallback tự động: gemini-3-flash-preview -> gemini-3-pro-preview -> gemini-2.5-flash
 * - Lưu trữ và ưu tiên API Key từ localStorage
 * - Tự động retry bước lỗi với model tiếp theo, giữ nguyên kết quả bước trước
 * - Hiển thị nguyên văn lỗi API (VD: 429 RESOURCE_EXHAUSTED) khi thất bại
 */

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Mặc định (Khuyên dùng)',
    description: 'Tốc độ phản hồi cực nhanh, tối ưu cho phân tích số liệu và soạn thảo văn bản nhanh.',
    isDefault: true
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Tư duy chuyên sâu',
    description: 'Khả năng suy luận cao cấp, thích hợp cho phân tích sư phạm phức tạp và hòa giải khiếu nại.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Dự phòng ổn định',
    description: 'Model dự phòng tin cậy cao, tiết kiệm hạn ngạch (quota) khi các model mới bị quá tải.'
  }
];

export const FALLBACK_CHAIN = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash'
];

const STORAGE_KEY_API_KEY = 'gemini_api_key';
const STORAGE_KEY_MODEL = 'gemini_selected_model';

/**
 * Lấy API Key với ưu tiên số 1 từ localStorage
 */
export const getGeminiApiKey = (): string => {
  const localKey = localStorage.getItem(STORAGE_KEY_API_KEY);
  if (localKey && localKey.trim().length > 0) {
    return localKey.trim();
  }
  // Fallback biến môi trường nếu có
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
};

/**
 * Lưu API Key vào localStorage
 */
export const saveGeminiApiKey = (key: string): void => {
  if (key && key.trim().length > 0) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
};

/**
 * Lấy Model được chọn từ localStorage
 */
export const getSelectedModel = (): string => {
  const localModel = localStorage.getItem(STORAGE_KEY_MODEL);
  if (localModel && AVAILABLE_MODELS.some(m => m.id === localModel)) {
    return localModel;
  }
  return 'gemini-3-flash-preview';
};

/**
 * Lưu Model được chọn
 */
export const saveSelectedModel = (modelId: string): void => {
  localStorage.setItem(STORAGE_KEY_MODEL, modelId);
};

export interface AttemptLog {
  model: string;
  success: boolean;
  error?: string;
  statusText?: string;
}

export interface GenerationResult {
  text: string;
  modelUsed: string;
  attempts: AttemptLog[];
}

/**
 * Gọi Google AI Studio REST API với một model cụ thể
 */
async function callGeminiApi(
  apiKey: string,
  model: string,
  prompt: string,
  systemInstruction?: string
): Promise<{ text: string }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const body: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2500
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    let errorDetail = `${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errorDetail = `${errJson.error.code || response.status} ${errJson.error.status || ''}: ${errJson.error.message || response.statusText}`;
      }
    } catch {
      // Bỏ qua nếu không parse được JSON lỗi
    }
    throw new Error(errorDetail);
  }

  const json = await response.json();
  const candidate = json.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('API trả về phản hồi rỗng (No text in candidate parts)');
  }

  return { text };
}

/**
 * Kiểm tra tính hợp lệ của API Key
 */
export async function testGeminiApiKey(apiKey: string, model: string = 'gemini-3-flash-preview'): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Vui lòng nhập API Key' };
  }

  const startTime = Date.now();
  try {
    const res = await callGeminiApi(
      apiKey.trim(),
      model,
      'Hãy trả lời duy nhất một từ "OK" để kiểm tra kết nối API'
    );
    const latency = Date.now() - startTime;
    return {
      success: true,
      message: `Kết nối thành công tới ${model}! Phản hồi trong ${latency}ms`,
      latencyMs: latency
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi kết nối: ${err.message || 'Không thể xác thực API Key'}`
    };
  }
}

/**
 * Tạo nội dung AI với cơ chế TỰ ĐỘNG FALLBACK qua chuỗi model
 * Nếu model hiện tại lỗi (429, quá tải, ...), tự động thử model tiếp theo ngay lập tức.
 */
export async function generateContentWithFallback(
  prompt: string,
  systemInstruction?: string,
  preferredModel?: string,
  onModelSwitched?: (fromModel: string, toModel: string, error: string) => void
): Promise<GenerationResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chưa thiết lập Gemini API Key. Vui lòng nhấn nút Settings trên thanh điều hướng để nhập key.');
  }

  const startModel = preferredModel || getSelectedModel();
  
  // Xây dựng danh sách model thử nghiệm không trùng lặp
  const modelsToTry: string[] = [startModel];
  for (const m of FALLBACK_CHAIN) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  const attempts: AttemptLog[] = [];
  let lastError = '';

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      const result = await callGeminiApi(apiKey, currentModel, prompt, systemInstruction);
      attempts.push({
        model: currentModel,
        success: true
      });
      return {
        text: result.text,
        modelUsed: currentModel,
        attempts
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi không xác định';
      lastError = errorMsg;
      attempts.push({
        model: currentModel,
        success: false,
        error: errorMsg
      });

      // Nếu còn model kế tiếp trong chuỗi fallback, báo hiệu chuyển đổi
      if (i < modelsToTry.length - 1) {
        const nextModel = modelsToTry[i + 1];
        if (onModelSwitched) {
          onModelSwitched(currentModel, nextModel, errorMsg);
        }
      }
    }
  }

  // Nếu tất cả các model đều thất bại, ném nguyên văn lỗi API
  throw new Error(`Tất cả các model AI đều thất bại. Lỗi cuối: ${lastError}`);
}

/**
 * Cấu trúc quy trình 3 bước xử lý (Step 1, Step 2, Step 3)
 * Theo đúng mục 1 & mục 3 trong AI_INSTRUCTIONS.md:
 * - Nếu Step 2 lỗi, chỉ retry Step 2 với model fallback, giữ nguyên Step 1
 * - Nếu thất bại hoàn toàn, chuyển trạng thái thành "Đã dừng do lỗi"
 */
export interface StepState {
  stepIndex: number;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'stopped';
  modelUsed?: string;
  result?: string;
  error?: string;
}
