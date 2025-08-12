import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  timeout: 3600 * 1000,
})

export async function POST(request: NextRequest) {
  try {
    console.log('API 호출 시작')
    const { company } = await request.json()
    console.log('회사명:', company)

    if (!company) {
      console.log('회사명이 없음')
      return NextResponse.json(
        { error: '회사명이 필요합니다.' },
        { status: 400 }
      )
    }

    const input = `###지시사항
${company} 기업의 채용 공고를 조사하여, 구직자가 이력서 작성에 꼭 필요한 정보를 JSON 형식(camelCase key)으로 정리하십시오.
JSON을 출력할 때 '''JSON과 같이 JSON 영역을 출력하지 않고 구조만 출력하십시오.
JSON의 value는 모두 한국어로 작성하십시오.

###조건
- 회사 정보는 상단에 한 번만 기재하고, 채용 직무별 정보는 jobs 배열에 각 직무를 개별 객체로 작성
- 없는 정보는 "-"(하이픈)으로 표기
- 모든 날짜는 YYYY-MM-DD 형식
- responsibilities, qualifications, preferredQualifications, requiredSkills, selectionProcess, interviewDates, benefits는 배열로 작성
- 급여, 모집 인원, 근무 시간 등 수치는 정확히 기재하되, 정보가 없으면 "-"
- 공식 채용 공고, 기업 채용 페이지, 신뢰 가능한 채용 포털 등 공식·신뢰도 높은 출처만 사용
- 불필요한 홍보 문구, 추상적 표현, 채용 동향·정책 해석은 제외
- 출처 URL은 source 배열에 모두 기재

###출력 구조(JSON)
{
  "companyName": "",
  "companyIndustry": "",
  "companySize": "",
  "companyWebsite": "",
  "companyDescription": "",
  "idealCandidateProfile": "",
  "jobs": [
    {
      "jobTitle": "",
      "jobCategory": "",
      "hiringType": "",
      "numberOfPositions": "",
      "recruitmentReason": "",
      "responsibilities": [],
      "qualifications": [],
      "preferredQualifications": [],
      "requiredSkills": [],
      "applicationStartDate": "",
      "applicationEndDate": "",
      "selectionProcess": [],
      "interviewDates": [],
      "resultAnnouncementDate": "",
      "workLocation": "",
      "workMode": "",
      "workingHours": "",
      "salaryRange": "",
      "benefits": []
    }, ...
  ],
  "source": []
}
 `

    // API 키가 유효한지 확인
    console.log('API 키 확인:', process.env.OPENAI_API_KEY ? '있음' : '없음')
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      console.log('더미 데이터 반환')
      // API 키가 없으면 더미 데이터 반환
      const dummyData = `${company} 기업 정보 조사 결과 (더미 데이터):
      
## 채용 정보 분석

### 주요 채용 직무
- 개발자, 기획자, 디자이너 등 IT 직군
- 마케팅, 영업, 운영 관리 직군

### 근무 조건
- 주 5일 근무제
- 유연 근무제 운영
- 다양한 복리후생 제공

### 채용 절차
- 서류전형 → 면접전형 → 최종 합격

*실제 서비스 이용 시에는 OpenAI API 키가 필요합니다.`

      return NextResponse.json({ data: dummyData })
    }

    console.log('OpenAI API 호출 시작')
    const response = await openai.responses.create({
      model: 'gpt-5',
      input,
      reasoning: { effort: 'medium' },
      tools: [
        { type: 'web_search_preview' },
        { type: 'code_interpreter', container: { type: 'auto' } }
      ],
    })
    console.log('OpenAI API 응답 받음')

    const result = response.output_text || ''
    console.log('결과 길이:', result.length)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('기업 정보 조사 중 오류 발생:', error)
    console.error('에러 타입:', typeof error)
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error))
    console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    // 에러 발생 시에도 더미 데이터 반환 (company는 이미 파싱됨)
    const dummyData = `기업 정보 조사 결과 (더미 데이터):
    
## 채용 정보 분석

### 주요 채용 직무
- 개발자, 기획자, 디자이너 등 IT 직군
- 마케팅, 영업, 운영 관리 직군

### 근무 조건
- 주 5일 근무제
- 유연 근무제 운영
- 다양한 복리후생 제공

### 채용 절차
- 서류전형 → 면접전형 → 최종 합격

*API 오류로 인해 더미 데이터가 표시되었습니다.`

    return NextResponse.json({ data: dummyData })
  }
}