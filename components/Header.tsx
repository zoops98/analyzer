import React from 'react';

interface HeaderProps {
  titleEn: string;
  titleKr: string;
  info: string;
}

export const Header: React.FC<HeaderProps> = ({ titleEn, titleKr, info }) => {
  return (
    <div className="bg-slate-900 rounded-xl p-6 mb-8 shadow-lg print:bg-white print:text-black print:shadow-none print:border-b-2 print:border-black print:rounded-none print:p-0 print:pb-4">
      {/* Top Row: Badge Only */}
      <div className="flex items-center mb-3">
        <span className="bg-indigo-600 text-white text-[11pt] font-bold px-3 py-1 rounded tracking-wide print:bg-gray-200 print:text-gray-800">
          Zoops AI 학습자료 Pro
        </span>
      </div>

      {/* Main Title Area */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight leading-tight font-english print:text-black">
          {titleEn}
        </h1>
        <h2 className="text-lg text-slate-400 font-medium print:text-gray-600">
          {titleKr}
        </h2>
      </div>

      {/* Navigation Bar */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-[9pt] items-center pt-4 border-t border-slate-800 print:border-gray-200">
        
        {/* Standard Analysis Group */}
        <div className="flex items-center gap-x-2 text-slate-300 print:text-gray-600">
          <span className="hover:text-white cursor-default transition-colors print:text-black">본문개요</span><span className="text-slate-700 print:text-gray-300">|</span>
          <span className="hover:text-white cursor-default transition-colors print:text-black">문장분석</span><span className="text-slate-700 print:text-gray-300">|</span>
          <span className="hover:text-white cursor-default transition-colors print:text-black">시그널분석</span><span className="text-slate-700 print:text-gray-300">|</span>
          <span className="hover:text-white cursor-default transition-colors print:text-black">핵심어휘</span><span className="text-slate-700 print:text-gray-300">|</span>
          <span className="hover:text-white cursor-default transition-colors print:text-black">문장비교</span>
        </div>

        <span className="hidden md:inline text-slate-700 mx-2 print:text-gray-300">|</span>

        {/* Worksheet Group */}
        <div className="flex flex-wrap items-center gap-x-2 bg-slate-800/50 px-3 py-1 rounded border border-slate-700/50 print:bg-gray-50 print:border-gray-200">
          <span className="font-bold text-indigo-300 text-[8pt] tracking-wider mr-1.5 border border-indigo-900/50 bg-indigo-900/20 px-1.5 rounded print:bg-white print:text-blue-800 print:border-blue-200">WORKSHEET</span>
          <div className="flex items-center gap-x-2 text-slate-300 print:text-gray-600">
            <span className="hover:text-indigo-300 cursor-default transition-colors print:hover:text-blue-600">본문노트</span><span className="text-slate-700 print:text-gray-300">|</span>
            <span className="hover:text-indigo-300 cursor-default transition-colors print:hover:text-blue-600">한줄해석</span><span className="text-slate-700 print:text-gray-300">|</span>
            <span className="hover:text-indigo-300 cursor-default transition-colors print:hover:text-blue-600">어순배열</span><span className="text-slate-700 print:text-gray-300">|</span>
            <span className="hover:text-indigo-300 cursor-default transition-colors print:hover:text-blue-600">빈칸쓰기</span><span className="text-slate-700 print:text-gray-300">|</span>
            <span className="hover:text-indigo-300 cursor-default transition-colors print:hover:text-blue-600">필사연습</span><span className="text-slate-700 print:text-gray-300">|</span>
            <span className="hover:text-indigo-300 cursor-default transition-colors print:hover:text-blue-600">영작연습</span><span className="text-slate-700 print:text-gray-300">|</span>
            <span className="hover:text-indigo-300 cursor-default transition-colors print:hover:text-blue-600">어법선택</span>
          </div>
        </div>
      </div>
    </div>
  );
};