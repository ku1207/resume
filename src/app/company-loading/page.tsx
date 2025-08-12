'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resumeStore'
import { Card, CardContent } from '@/components/ui/card'

export default function CompanyLoadingPage() {
  const router = useRouter()
  const { formData, setCompanyResearch, setIsGenerating } = useResumeStore()
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!formData) {
      router.push('/resume-info')
      return
    }

    // 이미 실행 중이면 중복 실행 방지
    if (hasStartedRef.current) {
      return
    }

    hasStartedRef.current = true

    // 회사 정보 조사 실행
    const researchCompany = async () => {
      try {
        console.log('기업 정보 조사 시작:', formData.resumeInfo.company)
        
        const response = await fetch('/api/company-research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company: formData.resumeInfo.company }),
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const text = await response.text()
        if (!text) {
          throw new Error('Empty response from server')
        }
        
        let result
        try {
          result = JSON.parse(text)
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          console.error('Response text:', text)
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`)
        }
        console.log('기업 정보 조사 완료:', result.data)
        
        // 회사 조사 결과 저장
        setCompanyResearch({
          company: formData.resumeInfo.company,
          data: result.data,
          generatedAt: new Date()
        })
        
        setIsGenerating(false)
        router.push('/company-info')
      } catch (error) {
        console.error('기업 정보 조사 실패:', error)
        
        // 에러가 발생해도 더미 데이터로 진행
        setCompanyResearch({
          company: formData.resumeInfo.company,
          data: `${formData.resumeInfo.company} 기업 정보 조사 결과 (에러 발생):
          
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

*네트워크 오류로 인해 더미 데이터가 표시되었습니다.*`,
          generatedAt: new Date()
        })
        setIsGenerating(false)
        router.push('/company-info')
      }
    }

    researchCompany()
  }, [formData, router, setCompanyResearch, setIsGenerating])

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">회사 정보 조사 중</h1>
          <p className="text-gray-600">
            {formData?.resumeInfo.company ? `${formData.resumeInfo.company}` : '선택한 회사'}의 채용 정보를 분석하고 있습니다...
          </p>
        </div>

        <Card className="p-8">
          <CardContent className="space-y-6">
            {/* 로딩 애니메이션 */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
              </div>
            </div>

            {/* 로딩 단계 표시 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">회사 공식 채용 정보 수집 중...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                <span className="text-sm text-gray-600">채용 동향 및 근무 조건 분석 중...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-700"></div>
                <span className="text-sm text-gray-600">최신 채용 공고 및 요구사항 정리 중...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-1000"></div>
                <span className="text-sm text-gray-600">구직 전략 수립을 위한 데이터 분석 중...</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                정확한 정보 제공을 위해 신뢰할 수 있는 출처를 우선적으로 검색하고 있습니다.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                잠시만 기다려주세요. 곧 상세한 분석 결과를 제공합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}