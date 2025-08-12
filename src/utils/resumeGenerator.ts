import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 3600 * 1000 
});

export interface ResumeGenerationParams {
  userInfo: {
    strengths: string;
    weaknesses: string;
    experience: string;
    skills: string;
    education: string;
    awards: string;
  };
  companyInfo: string;
  resumeQuestions: string[];
}

export async function generateResume(params: ResumeGenerationParams) {
  const { userInfo, companyInfo, resumeQuestions } = params;
  
  const prompt = `###지시사항
사용자가 입력한 정보, 기업 정보를 결합하여 완성된 이력서를 JSON 형식(camelCase key)으로 작성하십시오.
JSON을 출력할 때 '''JSON과 같이 JSON 영역을 출력하지 않고 구조만 출력하십시오.
JSON의 value는 모두 한국어로 작성하십시오.

###조건
- 기업이 요구하는 인재상·직무역량과 사용자의 경험·강점을 연결하여 작성
- 단순 나열이 아닌 **구체적 성과, 수치, 사례**를 포함해 설득력 있는 문장 구성
- 지원 직무와 무관한 불필요한 정보는 제외
- **긍정적인 어투**를 유지하고, 단점은 개선 노력이나 보완 계획과 함께 기술
- 동일한 표현 반복을 피하고, 전문적·간결한 문장 사용
- 각 답변은 5~7문장 이내로, 읽기 쉽게 작성
- 기업 가치관·비전과 연결된 키워드를 적절히 포함
- 맞춤법·띄어쓰기를 준수하고, 줄임말 대신 완전한 표현 사용
- 지원 직무와 관련된 **핵심 키워드**를 자연스럽게 반영해 ATS(지원자 추적 시스템) 검색 최적화
- 질문에 대한 답변이 없거나 사용자가 제공하지 않은 경우, 관련된 정보가 없음을 "-"(하이픈)으로 기재
- resumeQuestion의 값은 이력서질문과 동일하게 구성하십시오.

###사용자인적사항
1. 장점: ${userInfo.strengths}
2. 단점: ${userInfo.weaknesses}
3. 경력사항: ${userInfo.experience}
4. 보유 역량: ${userInfo.skills}
5. 교육/자격증: ${userInfo.education}
6. 수상내역: ${userInfo.awards}

###기업정보
${companyInfo}

###이력서질문
${resumeQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

###출력형식(JSON)
{
    "resumeQuestion": ["",...],
    "resumeQuestionAnswer": ["",...]
}`;

  try {
    const response = await openai.responses.create({
      model: 'gpt-5',
      input: prompt,
      reasoning: { effort: 'medium' },
      tools: [
        { type: 'web_search_preview' },
        { type: 'code_interpreter', container: { type: 'auto' } }
      ],
    });

    const result = response.output_text || '';
    return result;
  } catch (error) {
    console.error('이력서 생성 중 오류:', error);
    throw new Error(`이력서 생성 실패: ${(error as any)?.message ?? error}`);
  }
}