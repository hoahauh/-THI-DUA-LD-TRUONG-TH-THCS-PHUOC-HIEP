import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Table, 
  RotateCw, 
  ExternalLink, 
  Download, 
  Code, 
  Check, 
  Copy, 
  Server, 
  Layers, 
  Activity,
  FileSpreadsheet,
  ArrowDownToLine,
  ArrowUpFromLine,
  UploadCloud,
  FileText,
  ClipboardPaste,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Database
} from 'lucide-react';
import { MergeStrategy, SheetImportResult } from '../types';

export const GoogleSheetsConsole: React.FC = () => {
  const {
    activeLevel,
    currentWeek,
    criteria,
    assignments,
    records,
    summaries,
    sheetsConfig,
    updateSheetsConfig,
    syncWithGoogleSheets,
    pullFromGoogleSheets,
    importFromCsvText,
    importFromJson,
    syncLogs,
    exportToCsv
  } = useApp();

  const [activeSheetTab, setActiveSheetTab] = useState<'import' | '04_TongHop' | '03_NhatKy' | '02_PhanCong' | '01_DanhMuc' | 'script'>('import');
  const [copiedScript, setCopiedScript] = useState(false);
  const [webhookInput, setWebhookInput] = useState(sheetsConfig.webhookUrl);
  const [spreadsheetInput, setSpreadsheetInput] = useState(sheetsConfig.spreadsheetUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // States for Receiving Data (Import / Pull)
  const [isPullingData, setIsPullingData] = useState(false);
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('merge');
  const [importResult, setImportResult] = useState<SheetImportResult | null>(null);
  const [pastedContent, setPastedContent] = useState('');
  const [pastedType, setPastedType] = useState<'auto' | 'records' | 'criteria' | 'assignments'>('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSheetsConfig({
      webhookUrl: webhookInput,
      spreadsheetUrl: spreadsheetInput
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Kéo dữ liệu từ Google Sheets qua mạng
  const handlePullFromSheets = async (method: 'auto' | 'webhook' | 'public_gviz' | 'sample') => {
    setIsPullingData(true);
    setImportResult(null);
    try {
      const res = await pullFromGoogleSheets({ method, mergeStrategy });
      setImportResult(res);
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || 'Lỗi không xác định khi nhận dữ liệu từ Google Sheets',
        source: 'webhook',
        counts: { records: 0, criteria: 0, assignments: 0, classes: 0 }
      });
    } finally {
      setIsPullingData(false);
    }
  };

  // Xử lý nạp dữ liệu dán trực tiếp (Copy & Paste từ Google Sheets)
  const handleProcessPastedData = () => {
    if (!pastedContent.trim()) {
      alert('Vui lòng dán nội dung bảng tính từ Google Sheets vào ô bên dưới');
      return;
    }
    const res = importFromCsvText(pastedType, pastedContent, mergeStrategy);
    setImportResult(res);
    if (res.success) {
      setPastedContent('');
    }
  };

  // Xử lý nạp từ file CSV được tải từ Google Sheets
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const res = importFromCsvText('auto', content, mergeStrategy);
        setImportResult(res);
      }
    };
    reader.readAsText(file, 'UTF-8');
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mã nguồn Google Apps Script Backend mới nhất cho Trường TH&THCS Phước Hiệp
  const appsScriptCode = `/**
 * THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP - Google Apps Script Backend Engine
 * Tự động hóa đồng bộ 2 chiều (Gửi dữ liệu & Nhận dữ liệu) thời gian thực
 */

// 1. Xử lý nhận dữ liệu (GET) từ Web App
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'GET_ALL';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'GET_ALL' || action === 'GET_RECORDS') {
      var records = [];
      var sheetRecords = ss.getSheetByName('03_NhatKy_ViPham');
      if (sheetRecords) {
        var data = sheetRecords.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          if (!row[0] && !row[5]) continue;
          records.push({
            id: String(row[0] || ('PH-' + i)),
            timestamp: row[1] ? new Date(row[1]).toISOString() : new Date().toISOString(),
            date: String(row[2] || ''),
            weekNumber: Number(row[3]) || 24,
            level: String(row[4] || 'tieuhoc').toLowerCase(),
            classId: String(row[5] || ''),
            studentName: String(row[6] || 'Tập thể'),
            criteriaId: String(row[7] || ''),
            criteriaName: String(row[8] || ''),
            criteriaCategory: String(row[9] || 'nenep').toLowerCase(),
            points: Number(row[10]) || 0,
            type: Number(row[10]) >= 0 ? 'plus' : 'minus',
            shift: String(row[11] || 'daugio').toLowerCase(),
            reporterName: String(row[12] || 'Cờ đỏ'),
            reporterRole: 'codo',
            status: String(row[13] || 'verified'),
            note: String(row[14] || '')
          });
        }
      }

      var criteria = [];
      var sheetCriteria = ss.getSheetByName('01_DanhMuc_QuyDinh');
      if (sheetCriteria) {
        var cData = sheetCriteria.getDataRange().getValues();
        for (var j = 1; j < cData.length; j++) {
          var cRow = cData[j];
          if (!cRow[0]) continue;
          criteria.push({
            id: String(cRow[0]),
            category: String(cRow[1] || 'nenep').toLowerCase(),
            name: String(cRow[2] || ''),
            type: String(cRow[3] || '').indexOf('Cộng') !== -1 || Number(cRow[4]) > 0 ? 'plus' : 'minus',
            points: Number(cRow[4]) || 0,
            applicableLevels: String(cRow[5] || '').toLowerCase().indexOf('thcs') !== -1 
              ? (String(cRow[5]).toLowerCase().indexOf('tieu') !== -1 ? ['tieuhoc', 'thcs'] : ['thcs'])
              : ['tieuhoc'],
            description: String(cRow[6] || '')
          });
        }
      }

      var assignments = [];
      var sheetAssign = ss.getSheetByName('02_PhanCong_CoDo');
      if (sheetAssign) {
        var aData = sheetAssign.getDataRange().getValues();
        for (var k = 1; k < aData.length; k++) {
          var aRow = aData[k];
          if (!aRow[0]) continue;
          assignments.push({
            id: String(aRow[0]),
            studentId: String(aRow[1] || ''),
            studentName: String(aRow[2] || ''),
            fromClass: String(aRow[3] || ''),
            targetClass: String(aRow[4] || ''),
            level: String(aRow[5] || 'tieuhoc').toLowerCase(),
            shift: String(aRow[6] || 'daugio').toLowerCase(),
            dayOfWeek: String(aRow[7] || 'Cả tuần'),
            isActive: true
          });
        }
      }

      var responseData = {
        status: 'success',
        app: 'THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP',
        school: 'TRƯỜNG TH&THCS PHƯỚC HIỆP',
        timestamp: new Date().toISOString(),
        data: {
          records: records,
          criteria: criteria,
          assignments: assignments
        }
      };

      return ContentService.createTextOutput(JSON.stringify(responseData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      service: 'THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP - Google Sheets API',
      status: 'ACTIVE',
      version: '3.0.0'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Xử lý lưu dữ liệu (POST) gửi từ Web App lên Google Sheets
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Thêm bản ghi vi phạm mới
    if (action === 'ADD_RECORD') {
      var sheet = ss.getSheetByName('03_NhatKy_ViPham') || ss.insertSheet('03_NhatKy_ViPham');
      var r = data.payload;
      sheet.appendRow([
        r.id,
        r.timestamp,
        r.date,
        r.weekNumber,
        r.level,
        r.classId,
        r.studentName,
        r.criteriaId,
        r.criteriaName,
        r.criteriaCategory,
        r.points,
        r.shift,
        r.reporterName,
        r.status,
        r.note || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', id: r.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Cập nhật Bảng tổng hợp tuần
    if (action === 'SYNC_SUMMARIES') {
      var sheetSummary = ss.getSheetByName('04_TongHop_XepHang') || ss.insertSheet('04_TongHop_XepHang');
      sheetSummary.clearContents();
      sheetSummary.appendRow([
        'Hạng', 'Mã lớp', 'Tên lớp', 'Khối', 'GVCN',
        'Điểm gốc', 'Tổng điểm trừ', 'Tổng điểm thưởng',
        'Điểm chung cuộc', 'Xếp loại', 'Cờ thi đua', 'Số vi phạm', 'Số điểm thưởng', 'Trạng thái'
      ]);

      var list = data.payload;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        sheetSummary.appendRow([
          item.rank,
          item.classId,
          item.className,
          item.level,
          item.teacherName,
          item.basePoints,
          item.totalDeductions,
          item.totalMerits,
          item.finalScore,
          item.rankingClassification,
          item.flagAward || 'Không',
          item.infractionCount,
          item.meritCount,
          item.isLocked ? 'Đã khóa' : 'Mở'
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', syncedRows: list.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'unknown_action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="space-y-6">

      {/* Top Banner: Sheets Status & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm font-bold text-2xl">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg">Cơ Sở Dữ Liệu Google Sheets (Trường TH&THCS Phước Hiệp)</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  <span>Đồng bộ 2 chiều (Gửi & Nhận dữ liệu)</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kiến trúc 4 Sheet chuẩn hóa: Danh mục quy định, Phân công cờ đỏ, Nhật ký vi phạm và Bảng tổng hợp xếp hạng.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Pull Button */}
            <button
              onClick={() => {
                setActiveSheetTab('import');
                handlePullFromSheets('auto');
              }}
              disabled={isPullingData || sheetsConfig.status === 'pulling'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Nhận/kéo dữ liệu mới nhất từ Google Sheets về ứng dụng"
            >
              <ArrowDownToLine className={`w-3.5 h-3.5 ${isPullingData ? 'animate-bounce' : ''}`} />
              <span>{isPullingData ? 'Đang nhận dữ liệu...' : 'Nhận dữ liệu từ Sheets'}</span>
            </button>

            {/* Sync / Push Button */}
            <button
              onClick={() => syncWithGoogleSheets()}
              disabled={sheetsConfig.status === 'syncing'}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Đẩy bảng xếp hạng và nhật ký lên Google Sheets"
            >
              <RotateCw className={`w-3.5 h-3.5 ${sheetsConfig.status === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{sheetsConfig.status === 'syncing' ? 'Đang gửi...' : 'Đẩy lên Sheets'}</span>
            </button>

            <a
              href={sheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Google Sheets</span>
            </a>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Trạng thái: <span className="font-bold text-emerald-600">Sẵn sàng kết nối</span> 
            {sheetsConfig.lastPulledAt && (
              <span className="ml-3">· Nhận dữ liệu gần nhất: <strong className="text-slate-800">{sheetsConfig.lastPulledAt}</strong></span>
            )}
            {sheetsConfig.lastSyncedAt && (
              <span className="ml-3">· Đẩy lên gần nhất: <strong className="text-slate-800">{sheetsConfig.lastSyncedAt}</strong></span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>Dữ liệu hiện có: <strong>{summaries.length} Lớp</strong></span>
            <span>· <strong>{records.length} Bản ghi vi phạm</strong></span>
            <span>· <strong>{criteria.length} Tiêu chí</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Navigation tabs */}
        <div className="border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
            {/* TAB IMPORT: Nhận dữ liệu */}
            <button
              onClick={() => setActiveSheetTab('import')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSheetTab === 'import'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>⬇️ Nhận Dữ Liệu Từ Google Sheet</span>
            </button>

            <button
              onClick={() => setActiveSheetTab('04_TongHop')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSheetTab === '04_TongHop'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tab 4: 04_TongHop_XepHang</span>
            </button>

            <button
              onClick={() => setActiveSheetTab('03_NhatKy')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSheetTab === '03_NhatKy'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tab 3: 03_NhatKy_ViPham</span>
            </button>

            <button
              onClick={() => setActiveSheetTab('02_PhanCong')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSheetTab === '02_PhanCong'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tab 2: 02_PhanCong_CoDo</span>
            </button>

            <button
              onClick={() => setActiveSheetTab('01_DanhMuc')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSheetTab === '01_DanhMuc'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tab 1: 01_DanhMuc_QuyDinh</span>
            </button>

            <button
              onClick={() => setActiveSheetTab('script')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSheetTab === 'script'
                  ? 'bg-indigo-50 text-indigo-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mã Nguồn Apps Script (API)</span>
            </button>
          </div>

          {/* Export Action */}
          {activeSheetTab !== 'script' && activeSheetTab !== 'import' && (
            <button
              onClick={() => {
                if (activeSheetTab === '01_DanhMuc') exportToCsv('criteria');
                if (activeSheetTab === '02_PhanCong') exportToCsv('assignments');
                if (activeSheetTab === '03_NhatKy') exportToCsv('records');
                if (activeSheetTab === '04_TongHop') exportToCsv('summaries');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Sheet Này (.CSV)</span>
            </button>
          )}
        </div>

        {/* TAB IMPORT: TÍNH NĂNG NHẬN DỮ LIỆU TỪ GOOGLE SHEETS */}
        {activeSheetTab === 'import' && (
          <div className="p-6 space-y-6">
            
            {/* Header info */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Trung Tâm Nhận Dữ Liệu Từ Google Sheets Database (Trường TH&THCS Phước Hiệp)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hệ thống hỗ trợ 4 cách linh hoạt để nhận dữ liệu từ Google Sheets về ứng dụng web: Tự động kéo qua mạng, dán bảng trực tiếp, nạp tệp CSV hoặc dùng thử dữ liệu mẫu của trường.
                  </p>
                </div>
              </div>
            </div>

            {/* Result Toast Alert */}
            {importResult && (
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                importResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {importResult.success ? (
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {importResult.success ? 'Nhận dữ liệu thành công!' : 'Thông báo kết nối dữ liệu'}
                  </div>
                  <p>{importResult.message}</p>
                  {importResult.success && (
                    <div className="flex flex-wrap gap-3 pt-1 font-semibold text-emerald-700">
                      <span>• Bản ghi vi phạm nạp vào: {importResult.counts.records}</span>
                      {importResult.counts.criteria > 0 && <span>• Tiêu chí nạp vào: {importResult.counts.criteria}</span>}
                      {importResult.counts.assignments > 0 && <span>• Phân công nạp vào: {importResult.counts.assignments}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Merge Strategy Option */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-800">Quy tắc nạp dữ liệu (Merge Strategy):</span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Xác định cách ứng dụng xử lý khi nhận dữ liệu mới từ Google Sheets so với dữ liệu đang có trên máy.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="mergeStrategy"
                    value="merge"
                    checked={mergeStrategy === 'merge'}
                    onChange={() => setMergeStrategy('merge')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Hợp nhất thông minh (Khuyên dùng - Không trùng lặp)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="mergeStrategy"
                    value="replace"
                    checked={mergeStrategy === 'replace'}
                    onChange={() => setMergeStrategy('replace')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Ghi đè hoàn toàn (Thay thế toàn bộ)</span>
                </label>
              </div>
            </div>

            {/* 4 Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* PHƯƠNG THỨC 1: TỰ ĐỘNG KÉO QUA MẠNG */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
                    <span>Cách 1</span>
                    <span>•</span>
                    <span>Tự động qua mạng (Online Sync)</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kéo dữ liệu trực tiếp từ Google Sheets / Webhook API
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Ứng dụng sẽ tự động truy vấn Google Apps Script Webhook API hoặc liên kết Google Sheets công khai đã cấu hình bên dưới để tải bảng <code>03_NhatKy_ViPham</code> và <code>01_DanhMuc_QuyDinh</code>.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handlePullFromSheets('auto')}
                    disabled={isPullingData}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <ArrowDownToLine className={`w-4 h-4 ${isPullingData ? 'animate-bounce' : ''}`} />
                    <span>{isPullingData ? 'Đang truy vấn Google Sheets...' : 'Kéo dữ liệu từ Google Sheets ngay'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      onClick={() => handlePullFromSheets('webhook')}
                      disabled={isPullingData}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>🌐 Qua Webhook API</span>
                    </button>
                    <button
                      onClick={() => handlePullFromSheets('public_gviz')}
                      disabled={isPullingData}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>📄 Qua Link Google Sheet</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PHƯƠNG THỨC 2: THỬ NGHIỆM VỚI DỮ LIỆU MẪU CỦA TRƯỜNG PHƯỚC HIỆP */}
              <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/60 border border-amber-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                    <span>Cách 2</span>
                    <span>•</span>
                    <span>Dùng thử tức thì (Demo Database)</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Nạp dữ liệu mẫu từ Google Sheets Trường TH&THCS Phước Hiệp
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Trải nghiệm ngay tính năng nhận dữ liệu với các biên bản vi phạm và biểu dương người tốt việc tốt thực tế của các lớp 5A1, 3A2, 8A1, 7A2, 9A2 mà không cần cấu hình Google Cloud phức tạp.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handlePullFromSheets('sample')}
                    disabled={isPullingData}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>🧪 Nạp dữ liệu mẫu Google Sheets Phước Hiệp</span>
                  </button>
                </div>
              </div>

              {/* PHƯƠNG THỨC 3: DÁN TRỰC TIẾP TỪ BẢNG TÍNH GOOGLE SHEETS */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <span>Cách 3</span>
                  <span>•</span>
                  <span>Dán trực tiếp (Copy & Paste)</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Dán dữ liệu sao chép từ Google Sheets (Ctrl+C ➔ Ctrl+V)
                </h4>
                <p className="text-xs text-slate-500">
                  Mở Google Sheets, chọn các dòng cần nạp, nhấn <strong>Ctrl+C</strong> và dán vào ô bên dưới. Hệ thống tự động phân tách cột và nhận diện dữ liệu!
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-slate-700">Loại bảng dữ liệu dán:</label>
                    <select
                      value={pastedType}
                      onChange={e => setPastedType(e.target.value as any)}
                      className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="auto">Tự động nhận diện</option>
                      <option value="records">Nhật ký vi phạm (03_NhatKy)</option>
                      <option value="criteria">Tiêu chí quy định (01_DanhMuc)</option>
                      <option value="assignments">Phân công cờ đỏ (02_PhanCong)</option>
                    </select>
                  </div>

                  <textarea
                    rows={4}
                    value={pastedContent}
                    onChange={e => setPastedContent(e.target.value)}
                    placeholder="Dán các dòng copy từ Google Sheets vào đây... (Ví dụ: LOG-01, 2026-09-26, 24, tieuhoc, 5A1, ...)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <button
                    onClick={handleProcessPastedData}
                    disabled={!pastedContent.trim()}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    <span>Phân tích & Nạp dữ liệu vừa dán</span>
                  </button>
                </div>
              </div>

              {/* PHƯƠNG THỨC 4: NHẬP TỆP CSV TẢI TỪ GOOGLE SHEETS */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                  <span>Cách 4</span>
                  <span>•</span>
                  <span>Tải lên tệp CSV (File Import)</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Nhập tệp .CSV tải xuống từ Google Sheets
                </h4>
                <p className="text-xs text-slate-500">
                  Trên Google Sheets, vào <strong>Tệp ➔ Tải xuống ➔ Giá trị phân cách bằng dấu phẩy (.csv)</strong>, sau đó chọn tệp đó để nạp vào hệ thống.
                </p>

                <div className="pt-3 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .tsv, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label
                    htmlFor="csv-file-input"
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Chọn tệp .CSV từ máy tính</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ định dạng UTF-8 tiếng Việt</span>
                  </label>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: 04_TongHop_XepHang */}
        {activeSheetTab === '04_TongHop' && (
          <div className="p-4">
            <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
              <span>Cấu trúc Sheets: <code>Bảng Tổng Hợp Thi Đua Tuần {currentWeek}</code> (Tính toán tự động)</span>
              <span className="font-semibold text-slate-700">Tổng cộng {summaries.length} dòng</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">A (Hạng)</th>
                    <th className="py-2.5 px-3">B (Mã Lớp)</th>
                    <th className="py-2.5 px-3">C (Tên Lớp)</th>
                    <th className="py-2.5 px-3">D (GVCN)</th>
                    <th className="py-2.5 px-3 text-center">E (Điểm Gốc)</th>
                    <th className="py-2.5 px-3 text-center">F (Tổng Trừ)</th>
                    <th className="py-2.5 px-3 text-center">G (Tổng Cộng)</th>
                    <th className="py-2.5 px-3 text-center">H (Điểm Tổng)</th>
                    <th className="py-2.5 px-3 text-center">I (Xếp Loại)</th>
                    <th className="py-2.5 px-3 text-center">J (Cờ Thi Đua)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaries.map(s => (
                    <tr key={s.classId} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-600 font-bold">{s.rank}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{s.classId}</td>
                      <td className="py-2 px-3 text-slate-800">{s.className}</td>
                      <td className="py-2 px-3 text-slate-600">{s.teacherName}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{s.basePoints}</td>
                      <td className="py-2 px-3 text-center text-rose-600 font-medium">-{s.totalDeductions}</td>
                      <td className="py-2 px-3 text-center text-emerald-600 font-medium">+{s.totalMerits}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{s.finalScore}</td>
                      <td className="py-2 px-3 text-center">{s.rankingClassification}</td>
                      <td className="py-2 px-3 text-center font-bold text-amber-700">{s.flagAward || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: 03_NhatKy_ViPham */}
        {activeSheetTab === '03_NhatKy' && (
          <div className="p-4">
            <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
              <span>Cấu trúc Sheets: <code>03_NhatKy_ViPham</code> (Lưu trữ toàn bộ sự vụ với thời gian & người nhập)</span>
              <span className="font-semibold text-slate-700">{records.length} bản ghi</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Mã Bản Ghi</th>
                    <th className="py-2.5 px-3">Thời Gian</th>
                    <th className="py-2.5 px-3">Lớp</th>
                    <th className="py-2.5 px-3">Học Sinh Vi Phạm</th>
                    <th className="py-2.5 px-3">Tiêu Chí</th>
                    <th className="py-2.5 px-3 text-center">Điểm</th>
                    <th className="py-2.5 px-3">Ca Trực</th>
                    <th className="py-2.5 px-3">Cờ Đỏ Ghi Nhận</th>
                    <th className="py-2.5 px-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-indigo-700 font-bold">{r.id}</td>
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{r.timestamp.slice(0, 16).replace('T', ' ')}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{r.classId}</td>
                      <td className="py-2 px-3 text-slate-800">{r.studentName || 'Tập thể'}</td>
                      <td className="py-2 px-3 text-slate-700">{r.criteriaName}</td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span className={r.points > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {r.points > 0 ? `+${r.points}` : r.points}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{r.shift}</td>
                      <td className="py-2 px-3 text-slate-600">{r.reporterName}</td>
                      <td className="py-2 px-3">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: 02_PhanCong_CoDo */}
        {activeSheetTab === '02_PhanCong' && (
          <div className="p-4">
            <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
              <span>Cấu trúc Sheets: <code>02_PhanCong_CoDo</code> (Lịch phân công chấm chéo bảo đảm RBAC)</span>
              <span className="font-semibold text-slate-700">{assignments.length} nhiệm vụ</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Mã Phân Công</th>
                    <th className="py-2.5 px-3">Mã Cờ Đỏ</th>
                    <th className="py-2.5 px-3">Họ Tên</th>
                    <th className="py-2.5 px-3">Lớp Cờ Đỏ</th>
                    <th className="py-2.5 px-3 font-bold text-indigo-700">Lớp Chấm Chéo</th>
                    <th className="py-2.5 px-3">Khối</th>
                    <th className="py-2.5 px-3">Ca Trực</th>
                    <th className="py-2.5 px-3">Lịch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-indigo-700 font-bold">{a.id}</td>
                      <td className="py-2 px-3 text-slate-600">{a.studentId}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{a.studentName}</td>
                      <td className="py-2 px-3 text-slate-700">{a.fromClass}</td>
                      <td className="py-2 px-3 font-bold text-indigo-700 bg-indigo-50/50">{a.targetClass}</td>
                      <td className="py-2 px-3 uppercase text-slate-500">{a.level}</td>
                      <td className="py-2 px-3 text-slate-600">{a.shift}</td>
                      <td className="py-2 px-3 text-slate-500">{a.dayOfWeek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 1: 01_DanhMuc_QuyDinh */}
        {activeSheetTab === '01_DanhMuc' && (
          <div className="p-4">
            <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
              <span>Cấu trúc Sheets: <code>01_DanhMuc_QuyDinh</code> (Khung biểu điểm chuẩn Đội TNTP)</span>
              <span className="font-semibold text-slate-700">{criteria.length} tiêu chí</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Mã Tiêu Chí</th>
                    <th className="py-2.5 px-3">Nhóm Quy Định</th>
                    <th className="py-2.5 px-3">Tên Tiêu Chí</th>
                    <th className="py-2.5 px-3">Loại Điểm</th>
                    <th className="py-2.5 px-3 text-center">Mức Điểm</th>
                    <th className="py-2.5 px-3">Khối Áp Dụng</th>
                    <th className="py-2.5 px-3">Mô Tả Hướng Dẫn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criteria.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-indigo-700 font-bold">{c.id}</td>
                      <td className="py-2 px-3 uppercase text-slate-600">{c.category}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-2 px-3">{c.type === 'minus' ? 'Trừ điểm' : 'Cộng điểm'}</td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span className={c.points > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {c.points > 0 ? `+${c.points}` : c.points}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{c.applicableLevels.join(', ')}</td>
                      <td className="py-2 px-3 text-slate-500">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: APPS SCRIPT CODE */}
        {activeSheetTab === 'script' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Mã Nguồn Google Apps Script (Trường TH&THCS Phước Hiệp)</h4>
                <p className="text-xs text-slate-500">
                  Sao chép mã này vào <strong>Tiện ích mở rộng ➔ Apps Script</strong> trong Google Sheets của trường để kích hoạt Webhook API 2 chiều (GET/POST).
                </p>
              </div>

              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Đã sao chép vào bộ nhớ tạm' : 'Sao chép mã Apps Script'}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              <pre>{appsScriptCode}</pre>
            </div>
          </div>
        )}

      </div>

      {/* Real-time Sync Logs & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-time audit sync logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Nhật ký đồng bộ tự động (Audit Trail)</span>
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {syncLogs.map(log => (
              <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex items-start gap-2">
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap mt-0.5">{log.timestamp}</span>
                <span className="text-slate-700 font-medium">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-indigo-600" />
            <span>Cấu hình Kết nối Google Sheets của Nhà trường</span>
          </h4>

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs mb-3 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu cấu hình kết nối mới!</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Đường dẫn Google Spreadsheet URL
              </label>
              <input
                type="url"
                value={spreadsheetInput}
                onChange={e => setSpreadsheetInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Apps Script Webhook Exec URL
              </label>
              <input
                type="url"
                value={webhookInput}
                onChange={e => setWebhookInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                placeholder="https://script.google.com/macros/s/.../exec"
              />
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Cập nhật cấu hình
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
