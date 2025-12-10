export enum ChunkType {
  Subject = 'S',
  Verb = 'V',
  Object = 'O',
  Complement = 'C',
  IndirectObject = 'I.O',
  DirectObject = 'D.O',
  Preposition = 'Prep', // 전치사구
  Modifier = 'Mod', // 수식어
  Connective = 'Conn', // 접속사/연결어
  None = ''
}

export interface SentenceChunk {
  text: string;
  type: ChunkType | string;
  label?: string; // Detailed label like "주어", "동사"
  translation?: string; // Optional sub-translation for the chunk
}

export interface SentenceAnalysis {
  id: number;
  original: string;
  translation: string;
  chunks: SentenceChunk[];
  grammarNotes: string[]; // Numbered points explaining grammar
  mainGrammar: string; // Short summary of main grammar point (e.g. "not only A but also B")
}

export interface VocabItem {
  word: string;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  definition: string; // Korean definition now
  example: string; // New example sentence
}

export interface SummarySection {
  title: string;
  titleEn: string; // New
  topic: string; // This will map to "Theme" from the prompt
  topicEn: string; // New
  mainIdea: string; // 요지
  mainIdeaEn: string; // New
  summary: string; // 요약
  summaryEn: string; // New
  keywords: string[];
}

export interface StructureItem {
  en: string;
  kr: string;
}

export interface StructureAnalysis {
  introduction: StructureItem;
  body: StructureItem;
  conclusion: StructureItem;
  overall: StructureItem;
}

export interface OverviewSection {
  paragraphSummary: string; // Basic summary text
  backgroundKnowledge: string;
  // structureFlow removed in favor of detailed StructureAnalysis
}

export interface GrammarPractice {
  questions: string; // HTML string for the questions
  answers: string;   // HTML string for the explanations/answers
}

export interface SignalAnalysisItem {
  sentenceId: number;
  type: 'G' | 'S';
  explanation: string;
}

export interface SignalAnalysis {
  classification: SignalAnalysisItem[];
  topicVsContrast: {
    topic: string;
    contrast: string;
  };
  restatement: {
    sentenceIndices: string; // e.g., "문장 1 & 문장 2"
    relation: string; // "재진술" or "재구성"
    description: string;
  }[];
  analysisSummary: string;
  flowchart: string[]; // List of steps
}

export interface AnalysisResult {
  metadata: {
    source: string;
    year: string;
  };
  overview: OverviewSection;
  summary: SummarySection;
  structure: StructureAnalysis; // New detailed structure section
  signalAnalysis: SignalAnalysis; // New Signal Analysis section
  sentences: SentenceAnalysis[];
  vocabulary: VocabItem[];
  grammarPractice: GrammarPractice; // New field for the worksheet
  paraphrasedText: string;
  comparison: {
    original: string;
    paraphrased: string;
  }[];
}