import React from 'react';
import { SentenceChunk, ChunkType } from '../types';

const getTypeColor = (type: string, label?: string) => {
  const result = {
    text: 'text-gray-700',
    border: 'border-gray-200',
    bg: ''
  };

  if (!type || type === '') {
    result.border = 'border-transparent';
    return result;
  }

  const hasPrime = type.includes("'");
  // Extract the base type (e.g., "S'" from "S'(명사절)")
  const cleanType = type.split('(')[0].trim();
  const cleanLabel = label || '';
  
  const typeLower = type.toLowerCase();
  const labelLower = cleanLabel.toLowerCase();

  // Highlighting for specific clause types/connectives
  // We check both type and label to catch "S'(명사절)" or "명사절접"
  if (labelLower.includes('등위접') || typeLower.includes('등위접')) result.bg = 'bg-teal-50';
  else if (labelLower.includes('명사절') || typeLower.includes('명사절')) result.bg = 'bg-blue-50';
  else if (labelLower.includes('부사절') || typeLower.includes('부사절')) result.bg = 'bg-orange-50';
  else if (labelLower.includes('관계') || typeLower.includes('관계')) result.bg = 'bg-red-50';
  else if (hasPrime) result.bg = 'bg-yellow-50'; // Fallback for other subordinate elements

  // Handle detailed modifier labels
  const isModifier = cleanType.startsWith('M(') || 
                     cleanType.startsWith("M'(") || 
                     cleanType === 'M' || 
                     cleanType === "M'" ||
                     labelLower.includes('수식') || 
                     labelLower.includes('전치사');

  if (isModifier) {
    if (labelLower.includes('전치사') || cleanType.includes('(전)')) {
        result.text = 'text-orange-600';
        result.border = 'border-orange-200';
    } else {
        result.text = 'text-gray-600';
        result.border = 'border-gray-200';
    }
  } else {
    // Use the cleaned type for component colors
    const baseType = cleanType.replace("'", "");
    switch (baseType) {
        case 'S':
        case '주어':
        case '가주어':
        case '진주어':
        case '가S':
        case '진S':
        case '의미상 주어':
        case '의미상주어':
        case '의.S':
        case ChunkType.Subject: 
            result.text = 'text-red-600';
            result.border = 'border-red-200';
            break;
        case 'V':
        case '동사':
        case ChunkType.Verb:
            result.text = 'text-blue-600';
            result.border = 'border-blue-200';
            break;
        case 'O':
        case 'O.C':
        case 'I.O':
        case 'D.O':
        case '목적어':
        case '간목':
        case '직목':
        case '간접목적어':
        case '직접목적어':
        case '가목적어':
        case '가O':
        case '진목적어':
        case '진O':
        case ChunkType.Object:
        case ChunkType.DirectObject:
        case ChunkType.IndirectObject:
            result.text = 'text-green-600';
            result.border = 'border-green-200';
            break;
        case 'C':
        case 'S.C':
        case '보어':
        case '주보':
        case '목보':
        case '주격보어':
        case '목적격보어':
        case '목적보어':
        case ChunkType.Complement:
            result.text = 'text-purple-600';
            result.border = 'border-purple-200';
            break;
        case 'Prep':
        case '전치사구':
        case ChunkType.Preposition:
            result.text = 'text-orange-600';
            result.border = 'border-orange-200';
            break;
        case 'Conn':
        case '관계사':
        case '접속사':
        case '관계대명사절':
        case '관계부사절':
        case ChunkType.Connective:
            result.text = 'text-teal-600';
            result.border = 'border-teal-200';
            break;
        case 'Mod':
        case '수식어':
        case '수식어구':
        case ChunkType.Modifier:
            result.text = 'text-gray-600';
            result.border = 'border-gray-200';
            break;
    }
  }

  return result;
};

const getTypeLabel = (type: string, customLabel?: string) => {
  const rawLabel = customLabel || type;
  
  // If it's a detailed modifier like M(전), M(부), M(분사구문), keep it as is.
  const modifierPatterns = ['(전)', '(부)', '(형)', '(분사구)', '(분사구문)'];
  if (modifierPatterns.some(p => rawLabel.includes(p))) {
    return rawLabel;
  }

  // Safety: Strip redundant clause names in parentheses (e.g., "V'(관계대명사절)" -> "V'")
  return rawLabel.split('(')[0].trim();
};

interface SentenceParserProps {
    chunks: SentenceChunk[];
    mode?: 'beginner' | 'expert' | 'minimal';
}

export const SentenceParser: React.FC<SentenceParserProps> = ({ chunks, mode = 'beginner' }) => {
  
  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-10 font-english text-[10pt] leading-relaxed pt-6 pb-6">
      {chunks.map((chunk, idx) => {
        const hasType = chunk.type && chunk.type !== '';
        const colors = getTypeColor(chunk.type || '', chunk.label);
        
        const label = getTypeLabel(chunk.type || '', chunk.label);

        return (
          <div key={idx} className="flex flex-col items-center relative group">
            
            {/* TOP: Chunk Translation (Direct Interpretation) - ALWAYS SHOW IF EXISTS */}
            {chunk.translation && (
                <div className="flex flex-col items-center mb-0.5 justify-end">
                    <span className="text-[8pt] text-gray-500 font-sans tracking-tight whitespace-nowrap text-center leading-none px-1">
                        {chunk.translation}
                    </span>
                </div>
            )}

            {/* MIDDLE: English Text with Underline and BG Highlight */}
            <span className={`text-[10pt] font-bold text-center px-1 whitespace-nowrap border-b-2 transition-all
              ${hasType ? colors.border : 'border-transparent'}
              ${colors.bg ? `${colors.bg} rounded-t` : ''}
            `}>
              {chunk.text}
            </span>
            
            {/* BOTTOM: Grammar Label - SHOW IF TYPE EXISTS */}
            {hasType && (
               <span className={`text-[8pt] font-black absolute -bottom-5 ${colors.text} whitespace-nowrap`}>
                   {label}
               </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
