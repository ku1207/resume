import { NextRequest, NextResponse } from 'next/server'
import { generateResume, ResumeGenerationParams } from '@/utils/resumeGenerator'

export async function POST(request: NextRequest) {
  try {
    console.log('이력서 생성 API 호출 시작')
    const body = await request.json()
    console.log('요청 데이터:', body)

    const { userInfo, companyInfo, resumeQuestions } = body

    // 필수 데이터 검증
    if (!userInfo || !companyInfo || !resumeQuestions) {
      console.log('필수 데이터 누락')
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // API 키가 유효한지 확인
    console.log('API 키 확인:', process.env.OPENAI_API_KEY ? '있음' : '없음')
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      console.log('더미 이력서 데이터 반환')
      // API 키가 없으면 더미 데이터 반환
      const dummyData = {
        resumeQuestion: resumeQuestions,
        resumeQuestionAnswer: resumeQuestions.map((question: string) => 
          `${question}에 대한 답변입니다. 실제 서비스 이용 시에는 OpenAI API 키가 필요합니다.`
        )
      }

      return NextResponse.json({ data: JSON.stringify(dummyData) })
    }

    const params: ResumeGenerationParams = {
      userInfo,
      companyInfo,
      resumeQuestions
    }

    console.log('이력서 생성 모듈 호출')
    const result = await generateResume(params)
    console.log('이력서 생성 완료, 결과 길이:', result.length)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('이력서 생성 중 오류 발생:', error)
    console.error('에러 타입:', typeof error)
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error))
    console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    // 에러 발생 시에도 더미 데이터 반환
    const { resumeQuestions = [] } = await request.json().catch(() => ({ resumeQuestions: [] }))
    const dummyData = {
      resumeQuestion: resumeQuestions,
      resumeQuestionAnswer: resumeQuestions.map((question: string) => 
        `${question}에 대한 답변입니다. API 오류로 인해 더미 데이터가 표시되었습니다.`
      )
    }

    return NextResponse.json({ data: JSON.stringify(dummyData) })
  }
}