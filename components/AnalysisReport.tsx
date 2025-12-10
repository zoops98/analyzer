import React, { useMemo } from 'react';
import { AnalysisResult } from '../types';
import { Header } from './Header';
import { SentenceParser } from './SentenceParser';
import { 
  ArrowRight, 
  BookOpen, 
  Share2, 
  FileText, 
  MessageCircle, 
  Shuffle, 
  PenTool, 
  Highlighter, 
  Edit,
  CheckSquare,
  Activity,
  ArrowDown
} from 'lucide-react';

interface Props {
  data: AnalysisResult;
}

// Helper to shuffle words for "Word Ordering"
const shuffleSentence = (sentence: string) => {
    const words = sentence.split(' ');
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    return words.join(' / ');
};

// Helper to create blanks
const createBlanks = (sentence: string) => {
    return sentence.split(' ').map(word => {
        const cleanWord = word.replace(/[.,!?"']/g, '');
        // Blank out words longer than 3 chars with 40% probability
        if (cleanWord.length > 3 && Math.random() > 0.4) {
            return '______'.padEnd(cleanWord.length, '_');
        }
        return word;
    }).join(' ');
};

interface WorksheetHeaderProps { 
    title: string; 
    engTitle: string; 
    borderColor: string; 
    textColor: string; 
    icon?: React.ReactNode; 
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ title, engTitle, borderColor, textColor, icon }) => (
    <div className={`flex items-center mb-4 border-b ${borderColor} pb-2 mt-6 print:mt-4 print:mb-3`}>
        <div className="flex items-center mr-4">
            {icon && <span className="mr-3">{icon}</span>}
            <h2 className={`text-2xl font-bold ${textColor}`}>{title}</h2>
        </div>
        <span className="text-[9pt] tracking-widest text-gray-400 uppercase">{engTitle}</span>
    </div>
);

// Lined paper style object - Compacted height (2.5rem ~ 10mm)
const linedPaperStyle = {
    backgroundImage: 'linear-gradient(transparent 2.4rem, #e5e7eb 2.5rem)',
    backgroundSize: '100% 2.5rem',
    lineHeight: '2.5rem',
    backgroundAttachment: 'local'
};

export const AnalysisReport: React.FC<Props> = ({ data }) => {

  // Memoize shuffled sentences and blanks
  const shuffledSentences = useMemo(() => {
      return data.sentences.map(s => ({
          id: s.id,
          shuffled: shuffleSentence(s.original)
      }));
  }, [data.sentences]);

  const blankSentences = useMemo(() => {
      return data.sentences.map(s => ({
          id: s.id,
          text: createBlanks(s.original)
      }));
  }, [data.sentences]);

  return (
    <div id="report-content" className="max-w-[210mm] mx-auto bg-white p-8 shadow-lg print:shadow-none print:p-0 print:max-w-none text-[9pt] leading-relaxed">
      
      {/* --- ORIGINAL ANALYSIS SECTION --- */}

      {/* --- PAGE 1: Overview & Guide --- */}
      <div className="page-break">
        <Header 
          titleEn={data.summary.titleEn || 'Analysis Report'}
          titleKr={data.summary.title || '본문분석'}
          info={`${data.metadata.year || '2025'} > ${data.metadata.source || 'General Text'} > ${data.summary.topicEn || 'Analysis'}`}
        />
        
        <div className="mb-6 border rounded-lg overflow-hidden text-[9pt]">
           <div className="bg-blue-50 p-2 font-bold text-blue-800 border-b">| 목차안내</div>
           <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-gray-700">
             <p>(1) 본문개요: 문단의 원문과 구성을 담고 있으며, 지문을 한 눈에 파악합니다.</p>
             <p>(2) 문장분석: 구조분석과 출제포인트 등을 분석하여 세부 내용을 확인합니다.</p>
             <p>(3) 시그널분석: 문장 간의 관계(G/S), 주제/대립, 흐름을 분석합니다.</p>
             <p>(4) 핵심어휘: 유의어/반의어 및 파생어를 학습합니다.</p>
             <p>(5) 문장비교: 원문과 패러프레이징 문장을 비교 학습합니다.</p>
             <p>(6) 본문노트: 문장별 영어 원문과 한글 해석을 정리합니다.</p>
             <p>(7) 한줄해석: 문장을 단위별로 끊어 읽으며 해석 연습을 합니다.</p>
             <p>(8) 어순배열: 섞인 단어를 올바르게 배열하여 구문을 익힙니다.</p>
             <p>(9) 빈칸쓰기: 주요 핵심 어휘와 문법 요소를 채워 넣습니다.</p>
             <p>(10) 필사연습: 문장을 따라 쓰며 구조와 어휘를 자연스럽게 체화합니다.</p>
             <p>(11) 영작연습: 주어진 해석을 보고 영어 문장을 직접 작성합니다.</p>
             <p>(12) 어법선택: 문맥에 맞는 적절한 문법 형태를 고르는 연습을 합니다.</p>
           </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-8 text-[9pt]">
             <div className="col-span-12 border rounded p-3">
                <h4 className="font-bold text-blue-800 mb-2 border-b pb-1">문장구조 표기방식</h4>
                <div className="flex flex-wrap gap-3 font-medium text-gray-700 justify-center">
                    <span className="flex items-center gap-1">
                        <span className="text-white bg-red-600 px-1.5 py-0.5 rounded text-[8pt] font-bold shadow-sm">주어</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-white bg-blue-600 px-1.5 py-0.5 rounded text-[8pt] font-bold shadow-sm">동사</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-white bg-green-600 px-1.5 py-0.5 rounded text-[8pt] font-bold shadow-sm">목적어</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-white bg-purple-600 px-1.5 py-0.5 rounded text-[8pt] font-bold shadow-sm">보어</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-white bg-orange-600 px-1.5 py-0.5 rounded text-[8pt] font-bold shadow-sm">전치사구</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-white bg-teal-600 px-1.5 py-0.5 rounded text-[8pt] font-bold shadow-sm">연결어</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-white bg-gray-500 px-1.5 py-0.5 rounded text-[8pt] font-bold shadow-sm">수식어</span>
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* --- PAGE 2: Overview Details --- */}
      <div className="page-break">
        <div className="flex items-center mb-4">
           <h2 className="text-2xl font-bold text-blue-700 mr-4">본문개요</h2>
           <span className="text-[9pt] tracking-widest text-gray-400 uppercase">Paragraph Summary</span>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6 print:mb-4 shadow-sm">
            <p className="font-english text-justify leading-7 text-gray-800 text-[9pt] mb-3">
                {data.sentences.map(s => s.original).join(' ')}
            </p>
            <div className="border-t pt-3 text-gray-600 leading-relaxed font-light text-[9pt] text-justify">
                {data.sentences.map(s => s.translation).join(' ')}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 print:gap-4 mb-6 print:mb-0">
            <div className="border rounded-lg p-3">
                <h3 className="text-blue-600 font-bold mb-2 flex items-center text-[9pt]">
                    <BookOpen className="w-3 h-3 mr-2" /> 배경지식
                </h3>
                <div className="text-[9pt] text-gray-700 leading-relaxed bg-blue-50/50 p-2 rounded">
                    {data.overview.backgroundKnowledge}
                </div>
            </div>
            
             {/* Structure Flow Chart */}
             {data.structure && (
                <div className="border rounded-lg p-3 avoid-break">
                    <h3 className="text-blue-600 font-bold mb-2 flex items-center text-[9pt]">
                        <Share2 className="w-3 h-3 mr-2" /> 글의 흐름 (Structure Flow)
                    </h3>
                    <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded print:space-y-1">
                        {/* Introduction */}
                         <div className="flex items-start bg-white border border-gray-200 p-2 rounded shadow-sm">
                            <span className="bg-indigo-100 text-indigo-800 text-[8pt] font-bold px-2 py-0.5 rounded mr-2 flex-shrink-0">서론</span>
                            <div className="text-[9pt] leading-tight">
                                <p className="font-bold text-gray-800">{data.structure.introduction.en}</p>
                                <p className="text-gray-600 text-[8pt]">{data.structure.introduction.kr}</p>
                            </div>
                         </div>
                         
                         {/* Arrow */}
                         <div className="flex justify-center text-gray-400 print:hidden">
                            <ArrowRight className="w-4 h-4 rotate-90" />
                         </div>

                         {/* Body */}
                         <div className="flex items-start bg-white border border-gray-200 p-2 rounded shadow-sm">
                            <span className="bg-violet-100 text-violet-800 text-[8pt] font-bold px-2 py-0.5 rounded mr-2 flex-shrink-0">본론</span>
                            <div className="text-[9pt] leading-tight">
                                <p className="font-bold text-gray-800">{data.structure.body.en}</p>
                                <p className="text-gray-600 text-[8pt]">{data.structure.body.kr}</p>
                            </div>
                         </div>

                         {/* Arrow */}
                         <div className="flex justify-center text-gray-400 print:hidden">
                             <ArrowRight className="w-4 h-4 rotate-90" />
                         </div>

                         {/* Conclusion */}
                         <div className="flex items-start bg-white border border-gray-200 p-2 rounded shadow-sm">
                            <span className="bg-pink-100 text-pink-800 text-[8pt] font-bold px-2 py-0.5 rounded mr-2 flex-shrink-0">결론</span>
                            <div className="text-[9pt] leading-tight">
                                <p className="font-bold text-gray-800">{data.structure.conclusion.en}</p>
                                <p className="text-gray-600 text-[8pt]">{data.structure.conclusion.kr}</p>
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- PAGE 3: Deep Analysis (Main Idea ONLY) --- */}
      <div className="page-break">
        <div className="flex items-center mb-6 border-b border-purple-500 pb-2">
           <h2 className="text-2xl font-bold text-purple-700 mr-4">대의파악</h2>
           <span className="text-[9pt] tracking-widest text-gray-400 uppercase">Main Idea</span>
        </div>

        <div className="grid grid-cols-1 gap-6 items-start">
            
            {/* Main Idea Analysis (Full Width) */}
            <div className="avoid-break h-full">
                <div className="space-y-3 bg-purple-50/30 p-4 rounded-lg border border-purple-100 h-full">
                    {[
                        { label: 'Theme', color: 'bg-purple-100 text-purple-800', contentKr: data.summary.topic, contentEn: data.summary.topicEn },
                        { label: 'Title', color: 'bg-blue-100 text-blue-800', contentKr: data.summary.title, contentEn: data.summary.titleEn },
                        { label: 'Main idea', color: 'bg-green-100 text-green-800', contentKr: data.summary.mainIdea, contentEn: data.summary.mainIdeaEn },
                        { label: 'Summary', color: 'bg-orange-100 text-orange-800', contentKr: data.summary.summary, contentEn: data.summary.summaryEn },
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col border-b border-purple-100/50 pb-3 last:border-0 last:pb-0">
                            <span className={`inline-block px-2 py-0.5 rounded text-[8pt] font-bold w-fit mb-1 shadow-sm ${item.color}`}>{item.label}</span>
                            <div className="space-y-1">
                                <p className="font-english font-bold text-slate-800 leading-snug text-[10pt]">{item.contentEn}</p>
                                <p className="text-gray-600 font-medium text-[9pt] leading-snug">{item.contentKr}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Structure column removed as requested */}
        </div>
      </div>

      {/* --- PAGE 4: Sentence Analysis --- */}
      <div className="page-break">
         <div className="flex items-center mb-4 border-b border-purple-500 pb-2">
           <h2 className="text-2xl font-bold text-purple-700 mr-4">문장분석</h2>
           <span className="text-[9pt] tracking-widest text-gray-400 uppercase">Sentence Structure</span>
        </div>

        <div className="space-y-8">
            {data.sentences.map((sent, idx) => (
                <div key={sent.id} className="avoid-break">
                    <div className="flex items-start mb-2">
                        <div className="flex flex-col items-center mr-3 pt-1">
                            <span className="text-xl font-black text-purple-600">{String(idx + 1).padStart(2, '0')}</span>
                            <span className="text-[8pt] font-bold text-gray-400 mt-0.5">SENTENCE</span>
                        </div>
                        <div className="flex-1">
                            <div className="mb-2">
                                <SentenceParser chunks={sent.chunks} />
                            </div>
                            
                            <div className="flex items-start text-gray-600 text-[9pt] mb-2 bg-gray-50 p-2 rounded border-l-4 border-gray-300">
                                <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                                {sent.translation}
                            </div>

                            {sent.grammarNotes.length > 0 && (
                                <div className="text-[9pt] space-y-1 text-gray-700 pl-2">
                                    {sent.grammarNotes.map((note, nIdx) => (
                                        <div key={nIdx} className="flex items-start">
                                            <div className="bg-black text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8pt] mr-2 mt-0.5 flex-shrink-0">
                                                {nIdx + 1}
                                            </div>
                                            <span dangerouslySetInnerHTML={{ __html: note }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {idx < data.sentences.length - 1 && <div className="border-b border-dashed border-gray-200 my-4"></div>}
                </div>
            ))}
        </div>
      </div>

      {/* --- PAGE 5: Signal Analysis (New Section) --- */}
      {data.signalAnalysis && (
        <div className="page-break">
            <div className="flex items-center mb-6 border-b border-teal-500 pb-2">
                <div className="flex items-center mr-4">
                     <Activity className="w-6 h-6 text-teal-600 mr-2" />
                     <h2 className="text-2xl font-bold text-teal-700">시그널분석</h2>
                </div>
                <span className="text-[9pt] tracking-widest text-gray-400 uppercase">Signal Analysis</span>
            </div>

            <div className="space-y-6">
                
                {/* 1. G/S Classification */}
                <div className="border rounded-lg p-4 bg-white shadow-sm avoid-break">
                    <h3 className="text-teal-700 font-bold mb-3 border-b border-teal-100 pb-1 text-[10pt] flex items-center">
                        <span className="bg-teal-100 text-teal-800 w-5 h-5 flex items-center justify-center rounded-full text-[8pt] mr-2">1</span>
                        진술 분류 (G/S Classification)
                    </h3>
                    <div className="space-y-3">
                        {data.signalAnalysis.classification.map((item, idx) => (
                            <div key={idx} className="flex items-start bg-gray-50 p-2 rounded border border-gray-100">
                                <div className="flex flex-col items-center mr-3 min-w-[3rem]">
                                    <span className="text-[8pt] font-bold text-gray-500 mb-1">문장 {item.sentenceId}</span>
                                    <span className={`text-[10pt] font-black px-2 py-0.5 rounded shadow-sm text-white ${
                                        item.type === 'G' ? 'bg-blue-600' : 'bg-gray-500'
                                    }`}>
                                        {item.type}
                                    </span>
                                </div>
                                <div className="text-[9pt] text-gray-700 leading-relaxed pt-1 border-l pl-3 border-gray-200">
                                    {item.explanation}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Topic vs Contrast */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 avoid-break">
                    <div className="border rounded-lg p-4 bg-blue-50/50 border-blue-100">
                        <h3 className="text-blue-700 font-bold mb-2 text-[10pt] border-b border-blue-200 pb-1">
                            주제 (Topic)
                        </h3>
                        <p className="text-[9pt] text-gray-800 leading-relaxed">
                            {data.signalAnalysis.topicVsContrast.topic}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4 bg-red-50/50 border-red-100">
                        <h3 className="text-red-700 font-bold mb-2 text-[10pt] border-b border-red-200 pb-1">
                            대립 정보 (Contrast)
                        </h3>
                        <p className="text-[9pt] text-gray-800 leading-relaxed">
                            {data.signalAnalysis.topicVsContrast.contrast}
                        </p>
                    </div>
                </div>

                {/* 3. Restatement & Summary */}
                <div className="grid grid-cols-1 gap-4 avoid-break">
                    {/* Restatement */}
                     <div className="border rounded-lg p-4 bg-white shadow-sm">
                        <h3 className="text-teal-700 font-bold mb-3 border-b border-teal-100 pb-1 text-[10pt] flex items-center">
                            <span className="bg-teal-100 text-teal-800 w-5 h-5 flex items-center justify-center rounded-full text-[8pt] mr-2">3</span>
                            재진술 관계 (Restatement)
                        </h3>
                         {data.signalAnalysis.restatement.length > 0 ? (
                            <div className="space-y-2">
                                {data.signalAnalysis.restatement.map((item, idx) => (
                                    <div key={idx} className="flex items-center text-[9pt] bg-teal-50 p-2 rounded">
                                        <span className="font-bold text-teal-800 mr-2 bg-white px-2 py-0.5 rounded border border-teal-100 shadow-sm">{item.relation}</span>
                                        <span className="font-medium text-gray-700 mr-2">[{item.sentenceIndices}]</span>
                                        <span className="text-gray-600 flex-1 border-l border-teal-200 pl-2">{item.description}</span>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <p className="text-[9pt] text-gray-500 italic">재진술 관계가 뚜렷하지 않은 지문입니다.</p>
                         )}
                     </div>

                    {/* Summary */}
                    <div className="border rounded-lg p-4 bg-gray-50 border-gray-200">
                        <h3 className="text-gray-700 font-bold mb-2 text-[10pt] flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            구조 해석 요약
                        </h3>
                        <p className="text-[9pt] text-gray-800 leading-relaxed">
                            {data.signalAnalysis.analysisSummary}
                        </p>
                    </div>
                </div>

                {/* 4. Flowchart */}
                 <div className="border rounded-lg p-4 bg-white shadow-sm avoid-break">
                    <h3 className="text-teal-700 font-bold mb-4 border-b border-teal-100 pb-1 text-[10pt] flex items-center">
                        <span className="bg-teal-100 text-teal-800 w-5 h-5 flex items-center justify-center rounded-full text-[8pt] mr-2">5</span>
                        논리 흐름도 (Logical Flowchart)
                    </h3>
                    <div className="flex flex-col items-center space-y-2">
                        {data.signalAnalysis.flowchart.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <div className="w-full max-w-lg bg-white border-2 border-teal-100 rounded-lg p-3 text-center shadow-sm relative group hover:border-teal-300 transition-colors">
                                     <span className="absolute top-2 left-2 text-[8pt] font-bold text-teal-200 group-hover:text-teal-400">0{idx+1}</span>
                                     <p className="text-[9pt] font-medium text-gray-800">{step}</p>
                                </div>
                                {idx < data.signalAnalysis.flowchart.length - 1 && (
                                    <ArrowDown className="w-5 h-5 text-teal-300" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      )}

      {/* --- PAGE 6: Vocabulary --- */}
      <div className="page-break">
        <div className="flex items-center mb-4 border-b border-green-500 pb-2">
           <h2 className="text-2xl font-bold text-green-700 mr-4">핵심어휘</h2>
           <span className="text-[9pt] tracking-widest text-gray-400 uppercase">Vocabulary</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 print:gap-x-4 print:gap-y-2">
            {data.vocabulary.map((vocab, idx) => (
                <div key={idx} className="border rounded-lg p-3 print:p-1.5 bg-white shadow-sm avoid-break">
                    <div className="flex justify-between items-baseline mb-1 border-b pb-1 border-gray-100">
                        <span className="text-[11pt] font-bold text-blue-700 font-english">{vocab.word}</span>
                        <span className="text-[9pt] font-medium text-gray-900">{vocab.meaning}</span>
                    </div>
                    <div className="text-[9pt] space-y-1 print:space-y-0.5 text-gray-600">
                        <div className="flex">
                            <span className="w-14 flex-shrink-0 font-bold text-gray-400 whitespace-nowrap">[정의]</span>
                            <span className="flex-1 text-gray-700">{vocab.definition}</span>
                        </div>
                         <div className="flex">
                            <span className="w-14 flex-shrink-0 font-bold text-blue-400 whitespace-nowrap">[유의어]</span>
                            <span className="flex-1 leading-tight">{vocab.synonyms.join(', ')}</span>
                        </div>
                         <div className="flex">
                            <span className="w-14 flex-shrink-0 font-bold text-red-400 whitespace-nowrap">[반의어]</span>
                            <span className="flex-1 leading-tight">{vocab.antonyms.join(', ')}</span>
                        </div>
                        {vocab.example && (
                            <div className="flex mt-1 pt-1 border-t border-dashed border-gray-100">
                                <span className="w-14 flex-shrink-0 font-bold text-purple-400 whitespace-nowrap">[예문]</span>
                                <span className="flex-1 italic text-gray-500 font-english leading-tight">"{vocab.example}"</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {/* --- PAGE 7: Comparison --- */}
      <div className="page-break">
        <div className="flex items-center mb-4 border-b border-orange-500 pb-2">
           <h2 className="text-2xl font-bold text-orange-700 mr-4">문장비교</h2>
           <span className="text-[9pt] tracking-widest text-gray-400 uppercase">Original vs Paraphrase</span>
        </div>

        <div className="space-y-4 print:space-y-2">
            {data.comparison.map((comp, idx) => (
                <div key={idx} className="grid grid-cols-1 print:grid-cols-2 md:grid-cols-2 gap-4 print:gap-2 avoid-break text-[9pt] border-b border-gray-100 pb-4 print:pb-2 last:border-0">
                    <div className="bg-gray-50 p-3 print:p-2 rounded border">
                        <div className="font-bold text-blue-800 mb-1 text-[8pt] uppercase">Original</div>
                        <p className="font-english leading-relaxed">{comp.original}</p>
                    </div>
                    <div className="bg-orange-50 p-3 print:p-2 rounded border border-orange-100">
                        <div className="font-bold text-orange-800 mb-1 text-[8pt] uppercase">Paraphrased</div>
                        <p className="font-english leading-relaxed">{comp.paraphrased}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- WORKSHEETS SECTION --- */}

      {/* --- PAGE 8: Body Note (Indigo Theme) --- */}
      <div className="page-break">
        <WorksheetHeader 
            title="본문노트" 
            engTitle="Text Note" 
            borderColor="border-indigo-500" 
            textColor="text-indigo-800"
            icon={<FileText className="w-6 h-6 text-indigo-600" />}
        />
        <div className="grid grid-cols-12 gap-4 font-english border-b-2 border-indigo-100 pb-2 mb-4 text-[9pt] font-bold text-indigo-400 uppercase">
            <div className="col-span-6">English</div>
            <div className="col-span-6">Korean</div>
        </div>
        <div className="space-y-4 print:space-y-2">
            {data.sentences.map((sent, idx) => (
                <div key={sent.id} className="grid grid-cols-12 gap-4 print:gap-2 items-start avoid-break border-b border-gray-100 pb-3 print:pb-2">
                    <div className="col-span-6 flex">
                        <span className="text-[8pt] font-bold text-indigo-600 mr-2 mt-1 bg-indigo-50 w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0 border border-indigo-100">{String(idx + 1).padStart(2, '0')}</span>
                        <p className="text-[9pt] text-gray-900 leading-relaxed font-english">{sent.original}</p>
                    </div>
                    <div className="col-span-6">
                        <p className="text-[9pt] text-gray-600 leading-relaxed font-medium font-sans pt-0.5">{sent.translation}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- PAGE 9: One-line Interpretation (Teal Theme) --- */}
      <div className="page-break">
        <WorksheetHeader 
            title="한줄해석" 
            engTitle="Interpretation Practice" 
            borderColor="border-teal-500" 
            textColor="text-teal-800"
            icon={<MessageCircle className="w-6 h-6 text-teal-600" />}
        />
        <div className="space-y-4 print:space-y-2">
             {data.sentences.map((sent, idx) => (
                <div key={sent.id} className="avoid-break">
                    <div className="flex items-start mb-2 print:mb-1">
                        <span className="text-[8pt] font-bold text-white bg-teal-600 px-1.5 py-0.5 rounded mr-2 mt-0.5 shadow-sm">{String(idx + 1).padStart(2, '0')}</span>
                        <p className="text-[9pt] text-gray-900 font-english leading-relaxed">{sent.original}</p>
                    </div>
                    {/* Writing lines */}
                    <div className="w-full" style={linedPaperStyle}>
                        <div className="h-[5rem]"></div> {/* 2 lines * 2.5rem */}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- PAGE 10: Word Ordering (Rose Theme) --- */}
      <div className="page-break">
        <WorksheetHeader 
            title="어순배열" 
            engTitle="Word Ordering" 
            borderColor="border-rose-500" 
            textColor="text-rose-800"
            icon={<Shuffle className="w-6 h-6 text-rose-600" />}
        />
        <div className="space-y-4 print:space-y-2">
             {data.sentences.map((sent, idx) => (
                <div key={sent.id} className="avoid-break">
                    <div className="flex items-start mb-2 print:mb-1">
                        <div className="bg-rose-600 text-white text-[8pt] font-bold px-1.5 py-0.5 rounded mr-2 mt-0.5 shadow-sm">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <p className="text-[9pt] text-gray-800 font-bold font-sans leading-relaxed">{sent.translation}</p>
                    </div>
                    
                    <div className="bg-rose-50 border border-rose-200 p-2 rounded mb-2 print:mb-1 text-[9pt] text-rose-900 font-english leading-relaxed tracking-wide shadow-sm">
                        {shuffledSentences[idx].shuffled}
                    </div>

                    <div className="w-full border-b border-gray-300" style={linedPaperStyle}>
                        <div className="h-[5rem]"></div> {/* 2 lines * 2.5rem */}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- PAGE 11: Fill in the Blanks (Cyan Theme) --- */}
      <div className="page-break">
        <WorksheetHeader 
            title="빈칸쓰기" 
            engTitle="Fill in the Blanks" 
            borderColor="border-cyan-500" 
            textColor="text-cyan-800"
            icon={<PenTool className="w-6 h-6 text-cyan-600" />}
        />
        <div className="space-y-4 print:space-y-2">
             {data.sentences.map((sent, idx) => (
                <div key={sent.id} className="avoid-break">
                    <div className="flex items-start mb-1">
                         <span className="text-[9pt] font-black text-cyan-600 mr-2 mt-1.5">{String(idx + 1).padStart(2, '0')}</span>
                         <p className="text-[9pt] text-gray-800 font-english leading-relaxed tracking-wide">
                            {blankSentences[idx].text}
                         </p>
                    </div>
                    <p className="pl-6 text-[9pt] text-gray-400 font-sans">{sent.translation}</p>
                </div>
            ))}
        </div>
      </div>

      {/* --- PAGE 12: Tracing Practice (Violet Theme) --- */}
      <div className="page-break">
        <WorksheetHeader 
            title="필사연습" 
            engTitle="Tracing Practice" 
            borderColor="border-violet-500" 
            textColor="text-violet-800"
            icon={<Highlighter className="w-6 h-6 text-violet-600" />}
        />
        <div className="space-y-4 print:space-y-3">
             {data.sentences.map((sent, idx) => (
                <div key={sent.id} className="avoid-break">
                    <div className="flex items-start mb-1">
                        <span className="text-[8pt] font-bold text-violet-500 mr-2 mt-0.5 border border-violet-200 bg-violet-50 rounded px-1.5 py-0.5">{String(idx + 1).padStart(2, '0')}</span>
                        <p className="text-[9pt] text-gray-600 font-medium font-sans leading-relaxed">{sent.translation}</p>
                    </div>
                    
                    {/* Tracing area with background lines */}
                    <div className="relative pl-8">
                        <p 
                            className="font-english text-lg text-gray-200 leading-[2.5rem]" 
                            style={linedPaperStyle}
                        >
                            {sent.original}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- PAGE 13: Writing Practice (Emerald Theme) --- */}
      <div className="page-break">
        <WorksheetHeader 
            title="영작연습" 
            engTitle="Writing Practice" 
            borderColor="border-emerald-500" 
            textColor="text-emerald-800" 
            icon={<Edit className="w-6 h-6 text-emerald-600" />}
        />
        <div className="space-y-4 print:space-y-3">
             {data.sentences.map((sent, idx) => (
                <div key={sent.id} className="avoid-break">
                    <div className="flex items-start mb-1">
                        <div className="bg-emerald-600 text-white text-[8pt] font-bold px-1.5 py-0.5 rounded mr-2 mt-0.5 shadow-sm">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <p className="text-[9pt] text-gray-800 font-bold font-sans leading-relaxed">{sent.translation}</p>
                    </div>
                    
                    {/* Empty lines for writing */}
                    <div className="pl-6">
                         <div style={linedPaperStyle}>
                            {/* 3 lines * 2.5rem = 7.5rem */}
                            <div className="h-[7.5rem]"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- PAGE 14: Grammar Selection Practice (Slate Theme) --- */}
       {data.grammarPractice && (
        <div className="page-break">
            {/* Consistent Worksheet Header - Slate Theme */}
            <WorksheetHeader 
                title="어법 선택형 연습" 
                engTitle="Grammar Practice" 
                borderColor="border-slate-500" 
                textColor="text-slate-800"
                icon={<CheckSquare className="w-6 h-6 text-slate-600" />}
            />
            
            <div className="mb-6 text-center">
                 <span className="font-bold text-slate-700 bg-slate-50 px-4 py-1 rounded-full border border-slate-200 text-[10pt] shadow-sm">
                    괄호 안에서 어법상 쓰임이 바른 것을 고르시오.
                </span>
            </div>

            <div className="space-y-8 mb-12 px-2">
                <div 
                    className="font-english text-[10pt] leading-loose grammar-quiz-content"
                    dangerouslySetInnerHTML={{ __html: data.grammarPractice.questions }}
                />
            </div>

            {/* Answer Key Section */}
            <div className="mt-12 pt-6 border-t-2 border-slate-400 avoid-break">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center bg-slate-100 p-2 rounded w-fit text-[9pt]">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    [정답 및 해설]
                </h4>
                <div 
                    className="text-[9pt] text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed shadow-sm"
                    dangerouslySetInnerHTML={{ __html: data.grammarPractice.answers }} 
                />
            </div>
        </div>
      )}

    </div>
  );
};