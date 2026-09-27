import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AdminView } from './components/AdminView';
import { RedCrossView } from './components/RedCrossView';
import { TeacherView } from './components/TeacherView';
import { GoogleSheetsConsole } from './components/GoogleSheetsConsole';
import { ArchitectureDocModal } from './components/ArchitectureDocModal';
import { PrintReportModal } from './components/PrintReportModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AiSpeechAssistantModal } from './components/AiSpeechAssistantModal';
import { getGeminiApiKey } from './services/geminiService';

function MainApp() {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState<'main' | 'sheets' | 'doc'>('main');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Khi chưa có API key trong localStorage, hiển thị modal bắt buộc nhập (theo mục 2 AI_INSTRUCTIONS.md)
  useEffect(() => {
    const key = getGeminiApiKey();
    if (!key) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const hasApiKey = Boolean(getGeminiApiKey());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Contract & Role Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDoc={() => setIsDocModalOpen(true)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenApiKeySettings={() => setIsApiKeyModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sheets' ? (
          <GoogleSheetsConsole />
        ) : (
          <>
            {currentRole === 'admin' && <AdminView />}
            {currentRole === 'codo' && <RedCrossView />}
            {currentRole === 'gvcn' && <TeacherView />}
          </>
        )}
      </main>

      {/* Clean Footing */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP</strong> · Hệ thống Quản lý Thi đua Nề nếp Liên cấp (Tiểu học 19 lớp · THCS 12 lớp)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Xem Kiến trúc & Database Schema
            </button>
            <span>·</span>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Cấu hình Gemini API Key
            </button>
            <span>·</span>
            <span>Google Sheets Real-time Backend Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ArchitectureDocModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Modal Quản lý API Key & Model Cards */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        isRequired={!hasApiKey}
      />

      {/* Modal Trợ lý AI Đội TNTP (Gemini 3-Step Fallback Pipeline) */}
      <AiSpeechAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onOpenApiKeySettings={() => setIsApiKeyModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
