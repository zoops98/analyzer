import React, { useState, useEffect } from 'react';
import { analyzeText } from './services/geminiService';
import { AnalysisResult, ModuleId, ALL_MODULES } from './types';
import { AnalysisReport } from './components/AnalysisReport';
import { Sparkles, BookText, AlertCircle, FileDown, Settings, Key, X, GraduationCap, School, CheckCircle2, LayoutGrid } from 'lucide-react';

const SAMPLE_TEXT = `Hello, dear directors and teachers, I am Zoops, the creator of this application. I would like to express my deepest gratitude for your continued support and interest in our service. It is truly an honor to provide tools that help you and your students achieve academic excellence. We will continue to improve and evolve to better serve your educational needs in the future.`;

const MODULE_CONFIG: { id: ModuleId; name: string; desc: string; mandatory?: boolean }[] = [
  { id: 1, name: '(1) 본문개요', desc: '원문 구성 및 전체 요약', mandatory: true },
  { id: 2, name: '(2) 문장분석', desc: 'AI 구문분석 표준 상세 분석' },
  { id: 3, name: '(3) 시그널분석', desc: 'G/S 분류 및 논리 흐름도' },
  { id: 4, name: '(4) 핵심어휘', desc: '유의어/반의어 포함 단어장' },
  { id: 5, name: '(5) 문장비교', desc: '원문 vs 패러프레이징 비교' },
  { id: 6, name: '(6) 본문노트', desc: '영/한 대역 정리' },
  { id: 7, name: '(7) 한줄해석', desc: '단위별 끊어 읽기 연습' },
  { id: 8, name: '(8) 어순배열', desc: '단어 셔플 퀴즈' },
  { id: 9, name: '(9) 빈칸쓰기', desc: '주요 어휘/어법 빈칸' },
  { id: 10, name: '(10) 필사연습', desc: '구조 파악용 따라쓰기' },
  { id: 11, name: '(11) 영작연습', desc: '한글 보고 영작하기' },
  { id: 12, name: '(12) 어법선택', desc: '문맥상 올바른 형태 고르기' },
];

function App() {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'beginner' | 'expert' | 'minimal' | 'workbook'>('beginner');
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>([1, 2, 4, 6, 12]); // Default selection
  
  // Custom Header Info
  const [academyName, setAcademyName] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  
  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');

  // Check for stored API key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('zoops_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowSettings(true);
    }
  }, []);

  // Clear error when input changes
  useEffect(() => {
    if (error) setError(null);
  }, [input, error]);

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('zoops_api_key', tempKey.trim());
      setApiKey(tempKey.trim());
      setShowSettings(false);
      setTempKey('');
    }
  };

  const toggleModule = (id: ModuleId) => {
    if (id === 1) return; // Mandatory
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const selectAllModules = () => setSelectedModules([...ALL_MODULES]);
  const deselectAllModules = () => setSelectedModules([1]);

  const handleAnalyze = async (mode: 'beginner' | 'expert' | 'minimal' | 'workbook') => {
    if (!input.trim()) return;
    
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setAnalysisMode(mode);
    setError(null);
    try {
      const data = await analyzeText(input, apiKey, mode, selectedModules);
      setResult(data);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        // If auth error, reopen settings
        if (err instanceof Error && (err.message.includes('API Key') || err.message.includes('403') || err.message.includes('400'))) {
             setShowSettings(true);
        }
    } finally {
      setLoading(false);
    }
  };

  const handleExportHtml = () => {
    const content = document.getElementById('report-content');
    if (!content) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zoops AI Learning Material</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Roboto:wght@400;500;700&display=swap');
        body { font-family: 'Noto Sans KR', sans-serif; }
        .font-english { font-family: 'Roboto', sans-serif; }
        @media print {
            @page { size: A4; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; }
            .page-break { break-after: page; page-break-after: always; display: block; }
            .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
    </style>
</head>
<body class="bg-white p-0">
    <div class="max-w-[210mm] mx-auto">
        ${content.innerHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoops-worksheet-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-slate-900 print:bg-white print:h-auto print:overflow-visible relative">
      
      {/* API Key Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center text-white">
                    <Key className="w-5 h-5 mr-2" />
                    <h3 className="font-bold text-lg">API Key Setup</h3>
                </div>
                {apiKey && (
                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    This application requires a <strong>Google Gemini API Key</strong> to function. 
                    Your key is stored locally in your browser and is never sent to our servers.
                </p>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter your Gemini API Key</label>
                    <input 
                        type="password" 
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={handleSaveKey}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!tempKey.trim()}
                    >
                        Save API Key
                    </button>
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-center text-xs text-blue-600 hover:underline mt-2"
                    >
                        Get a free API Key from Google AI Studio
                    </a>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation / Toolbar - Hidden on print */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookText className="w-6 h-6 text-blue-600 mr-2" />
              <span className="font-bold text-xl tracking-tight text-gray-800">Zoops AI 학습자료 Pro</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                    setTempKey(apiKey);
                    setShowSettings(true);
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                title="API Key Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {result && (
                <button
                    onClick={handleExportHtml}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer shadow-sm transition-colors"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export HTML
                  </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:p-0 print:max-w-none">
        {/* Input Section - Hidden if result exists or printing */}
        <div className={`no-print ${result ? 'hidden' : 'block'} max-w-3xl mx-auto`}>
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Enter English Text
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">학원명 (Academy Name)</label>
                            <input 
                                type="text"
                                value={academyName}
                                onChange={(e) => setAcademyName(e.target.value)}
                                placeholder="예: ZoopsBooks"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">교재명/지문정보 (Material Title)</label>
                            <input 
                                type="text"
                                value={materialTitle}
                                onChange={(e) => setMaterialTitle(e.target.value)}
                                placeholder="예: ZoopsBooks고 5학년 외부지문"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-1">
                        <textarea
                            rows={8}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 font-english bg-white text-slate-900"
                            placeholder="Paste your English exam passage here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    {/* Module Selection Section */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-700">생성할 학습 모듈 선택</h4>
                            <div className="flex space-x-2">
                                <button onClick={selectAllModules} className="text-[10px] text-blue-600 hover:underline">전체 선택</button>
                                <button onClick={deselectAllModules} className="text-[10px] text-gray-500 hover:underline">전체 해제</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {MODULE_CONFIG.map((mod) => (
                                <button
                                    key={mod.id}
                                    onClick={() => toggleModule(mod.id)}
                                    className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                                        selectedModules.includes(mod.id)
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    } ${mod.mandatory ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                    <div className="flex justify-between items-start w-full mb-1">
                                        <span className={`text-[11px] font-bold ${selectedModules.includes(mod.id) ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {mod.name}
                                        </span>
                                        {selectedModules.includes(mod.id) && (
                                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                        )}
                                    </div>
                                    <span className="text-[9px] text-gray-500 leading-tight line-clamp-1">
                                        {mod.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Buttons Grid */}
                    <div className="mt-6">
                        <button
                            onClick={() => handleAnalyze('beginner')}
                            disabled={loading || !input.trim()}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <LayoutGrid className="w-6 h-6 mr-2" />
                            )}
                            대시보드형 학습 자료 생성하기
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Results View */}
        {result && (
            <div className="animate-fade-in">
                <div className="no-print mb-4 text-center">
                    <button onClick={() => setResult(null)} className="text-sm text-blue-600 hover:text-blue-800 underline">
                        ← Create New Analysis
                    </button>
                </div>
                <AnalysisReport 
                    data={result} 
                    mode={analysisMode} 
                    selectedModules={selectedModules} 
                    academyName={academyName}
                    materialTitle={materialTitle}
                />
            </div>
        )}
      </main>
    </div>
  );
}

export default App;