import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// The strict grammar analysis rules provided by the user
const GRAMMAR_ANALYSIS_RULES = `
## Role
당신은 영어 문장 구조 분석에 뛰어난 전문가입니다. 

## task
주어진 글에서 '분석 대상 문법 항목' 중 하나 이상에 해당되는 부분을 찾아 자세히 설명해주세요.

## 분석 기준
1. 문장에서 **문법 구조 또는 관용 표현**은 반드시 <b><u>와 </u></b>로 감싸 강조합니다.
2. 강조한 부분에 대해 '분석 대상 문법 항목' 중 하나 이상의 문법 항목에 따라 분류하고 설명합니다.
3. 잘못된 분류(ex. ‘enough to V’를 수동태로 분류)는 허용되지 않으며, 정확한 구조 분석만 허용됩니다.
4. **중요**: 관계대명사나 관계부사절을 분석할 때는 chunk label에 반드시 '관계대명사절' 또는 '관계부사절'이라고 명시해야 합니다. (단순 '수식어'로 표기 금지)
5. **중요**: 동격절(appositive clause)을 분석할 때는 chunk label에 반드시 '동격 that절'이라고 명시해야 합니다.

## 분석 대상 문법 항목 (총 30개, 반드시 이 중에서 분류)

01. 관계대명사/관계부사  
- 유형 :  관계대명사 who, which, that : 선행사가 있고, 뒷문장이 불완전한 구조
- 유형: 관계부사 when, where, why : 뒷문장이 완전한구조

02. 가주어 - 진주어 구문  
- 유형 : It + be + 형/명 + to부정사 또는 that절  

03. 가목적어 - 진목적어 구문  
- 유형: 동사 + it + 형/명 + to부정사/that절 (make, believe, think, consider, find)

04. as ~ as 동등비교  
- 유형 : as + 형/부 + as  

05. it ~ that 강조구문  
- 유형 : It is/was + 강조어 + that + 나머지  

06. 완료형 및 조동사 완료형  
- 유형 : have/has/had/will have + p.p. / 조동사 + have + p.p.

07. 수동태  
- 유형 : be동사 + p.p.  

08. 도치  
- 유형 : 부정어/조건절/장소부사 등이 문두에 올 경우 동사와 주어 도치  

09. 분사구문  
- 유형 : 분사(-ing/-ed/having p.p.)를 통해 부사절을 줄인 형태  

10. 부대상황을 나타내는 분사구문
- 유형 : with + 명사 + 형용사/분사 구조

11. 관용표현  
- 유형 : be(v) used to ~ing, look forward to, blend A with B, enough to V 등  

12. 수량/의미 구별 (a few vs few, much vs many 등)  
- 유형 : a few (긍정), few (부정) / much (셀 수 없음), many (셀 수 있음)  

13. 명사절 접소가 that/if[whether] 구분  
- 유형 : 접속사 that / if[whether] 으로 시작하는 명사절  

14. 병렬 구조  
- 유형 : A 접속사(and, but, or) B의 구조  

15. 부정 표현과 이중 부정  
- not, never, hardly 등 + any/anything 등으로만 써야 함  

16. to동사원형을 목적격보어로 취하는 구조  
- 동사 + 목적어 + to동사원형 (allow, force, advise, expect, cause 등)

17. 전치사 + 관계대명사  
- 전치사 + whom/which  

18. 비교급 구문  
- 비교급 + than  

19. 강조 부사 + 도치  
- only after, rarely, hardly 등 + 도치  

20. 가정법 과거/과거완료/혼합  
- If + 과거/과거완료 → would/could/might  

21. 분사 수식 (명사 앞/뒤 수식)  
- 현재분사(-ing) 또는 과거분사(-ed)가 명사를 수식

22. 조건 도치 (if 생략 도치)  
- Should/Had/Were + 주어 + 동사  

23. 원급/최상급 구문  
- as ~ as, the most ~, one of the most ~  

24. 동명사 vs to부정사 구별  
- enjoy + Ving / want + to V  

25. 동격 that절  
- 명사 + that절 (사실 설명) -> chunk label에 '동격 that절' 사용 필수

26. 비교 대상 일치  
- 비교 구문에서 논리적 대상 일치  

27. 형용사/부사  
- be(v)+형용사, 2형식동사+형용사  

28. 대동사  
- be동사, 조동사 -> be동사, 조동사 / 일반동사 ->do, did, does  

29. 비교급 강조  
- much, far, even + 비교급  

30. 접속사 vs 전치사 구별  
- although vs despite, because vs because of  

31. 주장/요구/제안/명령의 동사
- advise, suggest, recommend, demand, insist, require, order, propose, ask, request 뒤 that절 (should) + 동사원형

## 주의사항
- 모든 문장에서 '분석 대상 문법 항목'에 해당되는 내용을 1개 이상 반드시 찾아서 설명하세요.
- 반드시 '분석 대상 문법 항목'만 설명합니다.
- 설명 텍스트 내에서 분석된 표현은 <b><u>...</u></b> 태그를 사용하여 강조하세요.
`;

const SUMMARY_PROMPT_RULES = `
##role
당신은 분석력과 어휘력이 뛰어난 영어전문가입니다.

##task
create 1.Theme, 2.Title, 3.Main idea, 4.Summary in order, both in English and Korean.

##instructions
다음 형식에 맞춰 내용을 생성하고, 생성된 내용을 JSON의 'summary' 객체 내의 해당 필드(title, titleEn, topic, topicEn, mainIdea, mainIdeaEn, summary, summaryEn)에 매핑하여 출력하세요.
각 항목은 영어와 한국어 버전을 별도로 생성해야 합니다.

[Logic for Generation]
1. Theme: Customer service strategies and limitations in maintaining good relationships. (고객 서비스 전략 및 관계 유지의 한계)
2. Title: Customer Service: The Balance Between Satisfaction and Setting Boundaries (고객 서비스: 만족과 경계 설정의 균형)
3. Main idea: Companies aim to keep customers happy but sometimes need to refuse unreasonable demands. (회사는 고객을 행복하게 유지하려 하지만 때때로 무리한 요구를 거절해야 한다.)
4. Summary: Companies often replace broken products to maintain good relations, but refuse unreasonable demands to protect their resources. (회사는 좋은 관계를 유지하기 위해 고장 난 제품을 자주 교체하지만, 자원을 보호하기 위해 무리한 요구를 거절한다.)

##caution
- The summary should be an expansion of main idea and should be one sentence that consists of two parts separated by conjunction.
`;

const STRUCTURE_PROMPT_RULES = `
##role
당신은 분석력과 어휘력이 풍부한 영어전문가입니다.

##task
주어진 글을 서론-본론-결론-전체내용 요약으로 설명해주세요.

##instructions
다음 과정을 빠짐없이 순서대로 실행하고, 결과물을 JSON 'structure' 객체(introduction, body, conclusion, overall)에 담으세요.

1. 주어진 글을 1)서론 2)본론 3)결론 4)전체내용 요약으로 구성할 것.
   - JSON field 'introduction' corresponds to "1)서론".
   - JSON field 'body' corresponds to "2)본론".
   - JSON field 'conclusion' corresponds to "3)결론".
   - JSON field 'overall' corresponds to "4)전체내용 요약".

2. 각 항목(서론, 본론, 결론, 전체요약)은 핵심어구를 먼저제시하고 각 항목의 상세내용을 간략히 서술합니다.
   - 핵심어구 앞뒤를 <b>,</b>로 둘러싸지 말고, 그냥 텍스트로 생성하세요.
   - 상세내용은 항상 "-" 표시와 함께 시작하세요.
   - 상세내용은 내용을 구분하지말고 1개의 단락형태로 제시하세요.
   - 각각의 항목 내용이 서로 연결되어 내용을 이해할 수 있어야 합니다

3. 각 항목을 영어로 쓰고(en 필드), 똑같이 한글해석(kr 필드)을 써주세요.
   - Format Example: "Key Phrase - Detailed explanation starting with a dash."
`;

const SIGNAL_ANALYSIS_RULES = `
## role
당신은 텍스트 분석 전문가이자 구조 독해 코치입니다.

## task
사용자가 제시한 진술간의 관계를 분석하여, 독자가 글을 더욱더 쉽게 이해 할 수 있도록 구조화 합니다. 아래 정의된 방식(G/S 구분, 주제-대립 구분, 재진술 관계 구분)을 기준으로 글의 핵심 구조와 정보 흐름을 파악하여 'signalAnalysis' JSON 객체에 담아주세요.

## definitions
1. 상위 정보(G진술) / 하위 정보(S진술)
   - G (General): 중심 주장, 일반화된 내용, 상위 개념
   - S (Specific): 예시, 근거, 세부사항 등 하위 개념

2. 주제 / 대립 정보
   - 중심 주제와 그것에 반대되거나 다른 관점을 보여주는 정보

3. 재진술 관계
   - 재진술: 거의 동일하거나 반복적으로 다시 말함
   - 재구성: 다른 표현으로 같은 의미를 전달

## instructions
1. **진술 분류 (classification)**: 
   - 텍스트의 각 문장(Sentence ID 기준)을 G 또는 S로 분류하고 그 이유를 설명하세요.
   
2. **주제 VS 대립 정보 (topicVsContrast)**:
   - 글 전체를 관통하는 '주제(Topic)'와 이에 대립되는 '대립 정보(Contrast)'를 요약하세요. 대립되는 정보가 없다면 주제를 강조하는 내용을 적으세요.

3. **재진술 관계 (restatement)**:
   - 문장 간의 재진술 또는 재구성 관계를 찾아내세요. (예: 문장 1과 문장 3은 재진술 관계).

4. **요약된 구조 해석 (analysisSummary)**:
   - "이 글은 G진술을 중심으로..." 와 같은 형태로 글의 구조를 종합적으로 해석하여 요약하세요.

5. **플로우 차트 (flowchart)**:
   - 글의 흐름 상태를 순서대로 파악할 수 있도록 주요 흐름을 3~5단계의 텍스트 리스트로 만드세요. (화살표 없이 텍스트 내용만)

## output format (JSON mapping)
- classification: Array of { sentenceId, type ("G" or "S"), explanation }
- topicVsContrast: { topic, contrast }
- restatement: Array of { sentenceIndices (string), relation (string), description (string) }
- analysisSummary: string
- flowchart: Array of strings
`;

const GRAMMAR_QUIZ_PROMPT = `
##role
당신은 문장구조 분석력과 어휘력이 풍부한 영어전문가입니다.

##task
주어진 텍스트의 "//"와 "//"로 감싸진 부분을 문법적으로 올바른 것을 선택하는 괄호선택문제를 만드세요. 하지만 입력 텍스트에 "//" 표시가 없다면, 당신이 스스로 문법적으로 중요한 부분을 찾아내어 그 부분을 문제 출제 대상으로 간주하고 문제를 만드세요.

##instructions
다음 과정을 빠짐없이 순서대로 실행해주세요.

1. 주어진 글을 개별 문장으로 각각 분리해서 문장을 하나씩 제시하세요.(중요함)
2. 각 문장의 위에 해당 문장의 [한국어 해석]을 먼저 제시하세요.
   **주의: 한국어 해석에는 괄호 []나 영어 선택지가 포함되어서는 안 됩니다. 순수한 한국어 문장만 출력하세요.**
3. 각각의 문장에서 문법적으로 중요한 포인트(동사 형태, 관계사, 태, 수일치 등)를 1개 이상 찾아내어, 문법적으로 올바른 단어와 틀린 단어를 함께 제시하는 선택형 문제를 만들고 모든 문장을 쓰세요.
- 문법적으로 올바른 단어는 원문에 있는 단어(original word)입니다.
- 앞뒤에 "["와 "]"를 사용하세요. 예: [expecting / expected].
- 문법적으로 올바른 단어가 항상 앞에 오지 않도록 원래 단어를 무작위로 섞어서 배치하세요.
4. "[" 앞과 "]" 뒤에 <b>와 </b>를 추가하세요. 예: <b>[expecting / expected]</b>.
5. 각각의 괄호 바로 앞에 (1),(2)...와 같이 번호를 각각 순서대로 붙이세요. 예: (1)<b>[expecting / expected]</b>
6. 'questions' 필드에는 문제들만 HTML 형태로 저장하고, 'answers' 필드에는 정답과 해설을 저장하세요.
7. 정답 설명시에는 단순히 문법 용어나 단어의 의미를 언급하기보다는 문장 구조상 왜 그렇게 되었는지 자세히 설명하세요.

##문법문제유형 (참고하여 출제)
1) subject-verb agreement (주어-동사 수일치)
2) 태구별(voice) (능동 vs 수동)
3) 분사구별 (현재분사 vs 과거분사)
4) 관계사구별 (관계대명사 vs 관계부사 vs 접속사)
5) 형용사/부사구별
6) 대명사 구별 (수일치, 재귀대명사)
7) 전치사/접속사
8) 사역동사/지각동사 구조
9) 주장/요구/제안/명령의 동사 (should 생략)

##문제에서 제외할 내용
- 단순 조동사, 철자오류, 전치사 단순 암기 문제 등은 지양하고 논리적인 문법 구조 문제를 출제하세요.

##출력 형식 (questions 필드 예시)
<div class="mb-6 avoid-break">
  <div class="flex items-start mb-2">
    <span class="bg-slate-600 text-white text-[8pt] font-bold px-2 py-0.5 rounded mr-2 mt-0.5 shadow-sm">01</span>
    <p class="text-[9pt] text-gray-800 font-bold font-sans leading-relaxed">개인적인 사각지대는 다른 사람에게는 보이지만 당신에게는 보이지 않는 부분이다.</p>
  </div>
  <p class="font-english text-[10pt] leading-loose text-slate-900 pl-1">
    Personal blind spots are areas <b>(1)[where / that]</b> are <b>(2)[visible / visibly]</b> to others but not to you.
  </p>
</div>
...

##출력 형식 (answers 필드 예시)
<div class="space-y-3">
  <p class="text-[9pt]"><b>(1) that</b> : 뒷문장에서 주어가 없는 불완전한 문장이므로 관계대명사 that이 와야합니다. where는 관계부사로 뒷문장이 완전할 때 쓰입니다.</p>
  <p class="text-[9pt]"><b>(2) visible</b> : be동사 are뒤에는 형용사 또는 명사가 올 수 있습니다. visibly는 부사로 적절하지 않습니다.</p>
</div>
`;

export const analyzeText = async (text: string, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid Google Gemini API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    You are an expert English exam analyzer for Korean students (CSAT/TOEIC style).
    Analyze the provided English text deeply.
    
    Output MUST be a valid JSON object adhering to the schema.
    
    Key Instructions:
    1. **Sentences**: Break down each sentence into grammatical chunks (Subject, Verb, Object, etc.).
       - Use specific labels for relative clauses: "관계대명사절" or "관계부사절".
       - **CRITICAL LAYOUT RULE**: Do NOT group long clauses (like relative clauses or prepositional phrases longer than 3-4 words) into a single chunk. 
       - **MUST BREAK DOWN**: You MUST break down long clauses into smaller constituents (e.g. [Relative Pronoun], [Subject], [Verb]) to ensure the visual layout is aligned and readable. 
         - Bad: ["where van Gogh spent his later years" (Relationship Clause)]
         - Good: ["where" (Relative Adv)], ["van Gogh" (Subject)], ["spent" (Verb)], ["his later years" (Object)]
       - **IMPORTANT**: For appositive clauses (동격절), you MUST identify them and label them specifically as "동격 that절".
         - Example: "an opinion that independence is a necessary factor..." -> Chunk 1: "an opinion" (Label: Purpose/Object), Chunk 2: "that independence is..." (Label: 동격 that절).
    
    2. **GRAMMAR NOTES (Critical)**:
       For the 'grammarNotes' field in the JSON output, you MUST strictly follow the analysis rules below.
       ${GRAMMAR_ANALYSIS_RULES}
       
       **Important Output Format for grammarNotes array**:
       - Do not output the full sentence again.
       - Return an array of strings where each string follows this format:
         "[Grammar Type]: <b><u>Target Expression</u></b> → Explanation in Korean"
       - Example: "[분사구문]: <b><u>Walking through the park</u></b> → 주어 I를 수식하는 분사구문..."

    3. **Summary & Main Idea (Detailed)**: 
       ${SUMMARY_PROMPT_RULES}

    4. **Structure Analysis (Intro/Body/Conclusion)**:
       ${STRUCTURE_PROMPT_RULES}

    5. **Signal Analysis (Structure & Flow)**:
       ${SIGNAL_ANALYSIS_RULES}

    6. **Vocabulary**: 
       - Extract exactly 12 key distinct difficult words.
       - **Definition**: Provide the definition in **Korean**.
       - **Synonyms/Antonyms**: Provide these in **ENGLISH** (not Korean).
       - **Example**: Provide one simple English example sentence using the word.

    7. **Translation**: Provide natural Korean translations.

    8. **Grammar Practice Quiz**:
       ${GRAMMAR_QUIZ_PROMPT}
       Generate the 'grammarPractice' object with 'questions' (HTML string of the quiz) and 'answers' (HTML string of the answer key).

    9. **Paraphrase & Comparison**:
       - 'paraphrasedText': Rewrite the full text in academic English.
       - 'comparison': You MUST generate a comparison item for EVERY sentence in the source text.
         - 'original': The exact sentence from the source text.
         - 'paraphrased': A direct academic paraphrase of that specific sentence.
         - The number of items in the comparison array MUST match the number of sentences in the source text. Do not skip any sentences.

    Text to analyze:
    "${text}"
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING, description: "Inferred source (e.g., 2025 CSAT)" },
              year: { type: Type.STRING, description: "Inferred year" },
            }
          },
          overview: {
            type: Type.OBJECT,
            properties: {
              paragraphSummary: { type: Type.STRING, description: "Brief English summary of the paragraph" },
              backgroundKnowledge: { type: Type.STRING, description: "Background info in Korean" },
            }
          },
          summary: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Korean Title" },
              titleEn: { type: Type.STRING, description: "English Title" },
              topic: { type: Type.STRING, description: "Korean Theme/Topic" },
              topicEn: { type: Type.STRING, description: "English Theme/Topic" },
              mainIdea: { type: Type.STRING, description: "The main argument (Yoji) in Korean" },
              mainIdeaEn: { type: Type.STRING, description: "The main argument (Yoji) in English" },
              summary: { type: Type.STRING, description: "Detailed summary in Korean (1 sentence, 2 parts)" },
              summaryEn: { type: Type.STRING, description: "Detailed summary in English (1 sentence, 2 parts)" },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          structure: {
            type: Type.OBJECT,
            description: "Detailed structure analysis: Intro, Body, Conclusion, Overall",
            properties: {
              introduction: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING, description: "Intro Key Phrase - Detail in English" },
                  kr: { type: Type.STRING, description: "Intro Key Phrase - Detail in Korean" }
                }
              },
              body: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING, description: "Body Key Phrase - Detail in English" },
                  kr: { type: Type.STRING, description: "Body Key Phrase - Detail in Korean" }
                }
              },
              conclusion: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING, description: "Conclusion Key Phrase - Detail in English" },
                  kr: { type: Type.STRING, description: "Conclusion Key Phrase - Detail in Korean" }
                }
              },
              overall: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING, description: "Overall Summary Key Phrase - Detail in English" },
                  kr: { type: Type.STRING, description: "Overall Summary Key Phrase - Detail in Korean" }
                }
              }
            }
          },
          signalAnalysis: {
            type: Type.OBJECT,
            description: "G/S Classification, Topic/Contrast, Restatement, and Flowchart",
            properties: {
              classification: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sentenceId: { type: Type.INTEGER, description: "Corresponding sentence index (1-based)" },
                    type: { type: Type.STRING, description: "'G' for General, 'S' for Specific" },
                    explanation: { type: Type.STRING, description: "Brief reason for classification in Korean" }
                  }
                }
              },
              topicVsContrast: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: "Main Topic/Thesis in Korean" },
                  contrast: { type: Type.STRING, description: "Contrasting view or Opposing information in Korean" }
                }
              },
              restatement: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sentenceIndices: { type: Type.STRING, description: "e.g. '문장 1 & 문장 2'" },
                    relation: { type: Type.STRING, description: "'재진술' or '재구성'" },
                    description: { type: Type.STRING, description: "Explanation of the relationship in Korean" }
                  }
                }
              },
              analysisSummary: { type: Type.STRING, description: "Comprehensive structural summary in Korean" },
              flowchart: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps describing the flow of logic" }
            }
          },
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                original: { type: Type.STRING },
                translation: { type: Type.STRING },
                mainGrammar: { type: Type.STRING },
                chunks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      type: { type: Type.STRING, description: "S, V, O, C, Prep, Mod, Conn, or empty" },
                      label: { type: Type.STRING, description: "Korean label like 주어, 동사, 관계대명사절 etc." },
                      translation: { type: Type.STRING, description: "Korean sub-translation for the chunk" }
                    }
                  }
                },
                grammarNotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Detailed explanations strictly following the 31 grammar rules provided in the prompt."
                }
              }
            }
          },
          grammarPractice: {
            type: Type.OBJECT,
            properties: {
              questions: { type: Type.STRING, description: "HTML string containing the numbered sentences with grammar choice brackets" },
              answers: { type: Type.STRING, description: "HTML string containing the explanation for each numbered grammar choice" }
            }
          },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING, description: "Korean meaning" },
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "English synonyms" },
                antonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "English antonyms" },
                definition: { type: Type.STRING, description: "Definition in KOREAN" },
                example: { type: Type.STRING, description: "Example sentence in English" }
              }
            }
          },
          paraphrasedText: { type: Type.STRING },
          comparison: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                paraphrased: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const jsonText = response.text || "{}";
  try {
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini", e);
    throw new Error("Analysis failed. Please try again.");
  }
};