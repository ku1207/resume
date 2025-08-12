'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resumeStore'
import { Card, CardContent } from '@/components/ui/card'

// 기업 정보를 구조화하여 포맷팅하는 함수
const formatCompanyInfo = (formData: any, companyResearch: any) => {
  let companyInfo = `회사명: ${formData.resumeInfo.company}\n`
  
  if (companyResearch?.data) {
    try {
      // JSON 구조에서 회사 정보 추출
      const jsonMatch = companyResearch.data.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0])
        
        // 기업 기본 정보
        if (jsonData.companyName) companyInfo += `회사명: ${jsonData.companyName}\n`
        if (jsonData.companyIndustry) companyInfo += `업종: ${jsonData.companyIndustry}\n`
        if (jsonData.companySize) companyInfo += `기업 규모: ${jsonData.companySize}\n`
        if (jsonData.companyDescription) companyInfo += `회사 소개: ${jsonData.companyDescription}\n`
        if (jsonData.idealCandidateProfile) companyInfo += `이상적인 인재상: ${jsonData.idealCandidateProfile}\n`
        
        // 선택된 직무 정보 (store에서 selectedJob 가져오기)
        const { selectedJob } = useResumeStore.getState()
        if (selectedJob) {
          companyInfo += `\n[지원 직무 정보]\n`
          companyInfo += `직무명: ${selectedJob.jobTitle || '-'}\n`
          companyInfo += `직무 카테고리: ${selectedJob.jobCategory || '-'}\n`
          companyInfo += `고용형태: ${selectedJob.hiringType || '-'}\n`
          companyInfo += `근무지: ${selectedJob.workLocation || '-'}\n`
          companyInfo += `근무형태: ${selectedJob.workMode || '-'}\n`
          companyInfo += `급여: ${selectedJob.salaryRange || '-'}\n`
          
          if (selectedJob.responsibilities?.length > 0) {
            companyInfo += `주요 업무:\n${selectedJob.responsibilities.map((r: string) => `- ${r}`).join('\n')}\n`
          }
          
          if (selectedJob.qualifications?.length > 0) {
            companyInfo += `자격 요건:\n${selectedJob.qualifications.map((q: string) => `- ${q}`).join('\n')}\n`
          }
          
          if (selectedJob.preferredQualifications?.length > 0) {
            companyInfo += `우대 사항:\n${selectedJob.preferredQualifications.map((p: string) => `- ${p}`).join('\n')}\n`
          }
          
          if (selectedJob.requiredSkills?.length > 0) {
            companyInfo += `필요 기술: ${selectedJob.requiredSkills.join(', ')}\n`
          }
        }
      }
    } catch (error) {
      console.error('기업 정보 파싱 오류:', error)
      // 파싱 실패 시 원본 데이터 사용
      companyInfo += companyResearch.data
    }
  }
  
  return companyInfo
}

export default function ResumeLoadingPage() {
  const router = useRouter()
  const { formData, companyResearch, setGeneratedResume, setIsGenerating, isGenerating } = useResumeStore()
  const hasStartedGeneration = useRef(false)

  useEffect(() => {
    console.log('Resume Loading - formData:', formData)
    console.log('Resume Loading - companyResearch:', companyResearch)
    
    if (!formData) {
      console.log('No formData found, redirecting to personal-info')
      router.push('/personal-info')
      return
    }

    // 이미 생성이 시작되었거나 진행 중인 경우 중복 실행 방지
    if (hasStartedGeneration.current || isGenerating) {
      console.log('Generation already started or in progress')
      return
    }

    console.log('Starting generation process...')
    hasStartedGeneration.current = true
    setIsGenerating(true)

    // 실제 API 호출을 통한 이력서 생성
    const generateResume = async () => {
      console.log('Starting resume generation...')
      try {
        const response = await fetch('/api/generate-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInfo: {
              strengths: formData.personalInfo.strengths.join(', '),
              weaknesses: formData.personalInfo.weaknesses || '완벽주의 성향으로 때로는 시간이 오래 걸릴 수 있지만, 일정 관리를 통해 개선하고 있습니다.',
              experience: formData.personalInfo.experiences.join(', '),
              skills: formData.personalInfo.skills.join(', '),
              education: formData.personalInfo.educations.join(', '),
              awards: formData.personalInfo.awards.join(', ') || '-'
            },
            companyInfo: formatCompanyInfo(formData, companyResearch),
            resumeQuestions: formData.resumeInfo.questions
          })
        })

        if (!response.ok) {
          throw new Error('API 호출 실패')
        }

        const result = await response.json()
        console.log('API response:', result)
        let resumeData

        try {
          // API 응답이 JSON 문자열인 경우 파싱
          resumeData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data
          console.log('Parsed resume data:', resumeData)
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError)
          // 파싱 실패 시 더미 데이터 사용
          resumeData = {
            resumeQuestion: formData.resumeInfo.questions,
            resumeQuestionAnswer: formData.resumeInfo.questions.map(() => '답변을 생성하는 중 오류가 발생했습니다.')
          }
        }

        // resumeQuestion과 resumeQuestionAnswer만 사용하여 content 구성
        let content = ''
        console.log('resumeData.resumeQuestion:', resumeData.resumeQuestion)
        console.log('resumeData.resumeQuestionAnswer:', resumeData.resumeQuestionAnswer)
        
        if (resumeData.resumeQuestion && resumeData.resumeQuestionAnswer) {
          content = resumeData.resumeQuestion.map((question: string, index: number) => {
            const answer = resumeData.resumeQuestionAnswer[index] || '답변이 없습니다.'
            return `## ${question}\n\n${answer}`
          }).join('\n\n')
        }

        console.log('Generated content:', content)

        const generatedResume = {
          title: `${formData.resumeInfo.company} 지원 이력서`,
          content: content || '이력서 생성에 실패했습니다.',
          generatedAt: new Date()
        }

        console.log('Final generated resume:', generatedResume)
        console.log('Resume content before saving:', generatedResume.content)
        setGeneratedResume(generatedResume)
        setIsGenerating(false)
        router.push('/resume-result')
      } catch (error) {
        console.error('이력서 생성 오류:', error)
        
        // 오류 발생 시 더미 데이터 생성
        const content = formData.resumeInfo.questions.map((question: string) => {
          return `## ${question}\n\n이 질문에 대한 답변을 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요.`
        }).join('\n\n')

        setGeneratedResume({
          title: `${formData.resumeInfo.company} 지원 이력서`,
          content: content || '이력서 생성에 실패했습니다.',
          generatedAt: new Date()
        })
        setIsGenerating(false)
        router.push('/resume-result')
      }
    }

    generateResume()
  }, [])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">이력서 생성 중</h1>
          <p className="text-gray-600">AI가 맞춤형 이력서를 작성하고 있습니다...</p>
        </div>

        <Card className="p-8">
          <CardContent className="space-y-6">
            {/* 로딩 애니메이션 */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
            </div>

            {/* 로딩 단계 표시 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">개인정보 분석 중...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span className="text-sm text-gray-600">맞춤형 내용 생성 중...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-700"></div>
                <span className="text-sm text-gray-600">최종 검토 및 완성 중...</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">잠시만 기다려주세요. 곧 완성됩니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}