import React from 'react';
import { SentenceChunk, ChunkType } from '../types';

const getTypeColor = (type: string) => {
  const cleanType = type.replace("'", "");
  
  // Handle detailed modifier labels like M(형), M(부), etc.
  if (cleanType.startsWith('M(') || cleanType === 'M') {
    return 'text-gray-600 border-gray-200 bg-gray-100';
  }

  switch (cleanType) {
    case 'S':
    case ChunkType.Subject: return 'text-red-600 border-red-200 bg-red-50';
    case 'V':
    case ChunkType.Verb: return 'text-blue-600 border-blue-200 bg-blue-50';
    case 'O':
    case 'O.C':
    case 'I.O':
    case 'D.O':
    case ChunkType.Object:
    case ChunkType.DirectObject:
    case ChunkType.IndirectObject: return 'text-green-600 border-green-200 bg-green-50';
    case 'C':
    case 'S.C':
    case ChunkType.Complement: return 'text-purple-600 border-purple-200 bg-purple-50';
    case 'Prep':
    case ChunkType.Preposition: return 'text-orange-600 border-orange-200 bg-orange-50';
    case 'Conn':
    case '관계사':
    case '접속사':
    case ChunkType.Connective: return 'text-teal-600 border-teal-200 bg-teal-50';
    case 'Mod':
    case ChunkType.Modifier: return 'text-gray-600 border-gray-200 bg-gray-100';
    default: return 'text-gray-700 border-transparent';
  }
};

const getTypeLabel = (type: string, customLabel?: string) => {
  if (customLabel) return customLabel;
  if (type === 'Prep') return '전치사구';
  if (type === 'Mod') return '수식';
  if (type === 'Conn') return '연결어';
  return type;
};

interface SentenceParserProps {
    chunks: SentenceChunk[];
    mode?: 'beginner' | 'expert' | 'minimal';
}

export const SentenceParser: React.FC<SentenceParserProps> = ({ chunks, mode = 'beginner' }) => {
  
  if (mode === 'expert' || mode === 'minimal') {
    return (
      <div className="flex flex-wrap items-end gap-x-3 gap-y-8 font-english text-[10pt] leading-relaxed pt-2 pb-4">
        {chunks.map((chunk, idx) => {
          const isGrammarItem = chunk.type !== '';
          const colorClass = getTypeColor(chunk.type);
          const borderColor = isGrammarItem ? colorClass.split(' ')[1] : 'border-transparent';
          const textColor = isGrammarItem ? colorClass.split(' ')[0] : 'text-gray-800';

          // For Expert mode, we use an underline layout with label below
          return (
            <div key={idx} className="flex flex-col items-center relative group">
              {/* Text with underline */}
              <span className={`text-[10pt] font-bold text-center px-0.5 whitespace-nowrap border-b-2 ${isGrammarItem ? borderColor.replace('border-', 'border-') : 'border-transparent'}`}>
                {chunk.text}
              </span>
              
              {/* Label below the underline */}
              {isGrammarItem && (
                 <span className={`text-[8pt] font-black absolute -bottom-5 ${textColor} whitespace-nowrap`}>
                     {getTypeLabel(chunk.type, chunk.label)}
                 </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Default / Beginner Mode
  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-4 font-english text-[9pt] leading-relaxed">
      {chunks.map((chunk, idx) => {
        const isGrammarItem = chunk.type !== '';
        const colorClass = getTypeColor(chunk.type);

        return (
          <div key={idx} className="flex flex-col items-center group relative">
            
            {/* TOP: Meaning (Interpretation) */}
            {isGrammarItem && chunk.translation && (
                <span className="text-[8pt] text-gray-500 mb-0.5 font-sans tracking-tight whitespace-pre text-center leading-tight px-1">
                    {chunk.translation}
                </span>
            )}

            {/* MIDDLE: English Text */}
            <span className={`px-0.5 rounded border-b ${isGrammarItem ? colorClass.split(' ')[1] : 'border-transparent'}`}>
              {chunk.text}
            </span>

             {/* BOTTOM: Grammar Label (Badge) */}
             {isGrammarItem && (
              <span className={`text-[7pt] font-bold mt-0.5 px-1 py-0 rounded shadow-sm text-white ${colorClass.replace('text-', 'bg-').replace('border-', '').split(' ')[0]} opacity-100`}>
                {getTypeLabel(chunk.type, chunk.label)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};