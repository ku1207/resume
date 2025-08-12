'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useResumeStore } from '@/store/resumeStore'

export default function ResumeInfoPage() {
  const router = useRouter()
  const { formData, setFormData, setIsGenerating } = useResumeStore()
  
  const [resumeInfo, setResumeInfo] = useState({
    company: formData?.resumeInfo.company || '',
    questions: (formData?.resumeInfo.questions && formData.resumeInfo.questions.length > 0) 
      ? formData.resumeInfo.questions 
      : ['', '', '']
  })

  useEffect(() => {
    if (!formData?.personalInfo) {
      router.push('/personal-info')
    }
  }, [formData, router])

  const addField = () => {
    setResumeInfo(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }))
  }

  const updateField = (index: number, value: string) => {
    setResumeInfo(prev => ({
      ...prev,
      questions: prev.questions.map((item, i) => i === index ? value : item)
    }))
  }

  const removeField = (index: number) => {
    setResumeInfo(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData?.personalInfo) {
      router.push('/personal-info')
      return
    }

    const filteredResumeInfo = {
      company: resumeInfo.company,
      questions: resumeInfo.questions.filter(item => item.trim())
    }

    setFormData({
      personalInfo: formData.personalInfo,
      resumeInfo: filteredResumeInfo
    })
    
    setIsGenerating(true)
    router.push('/company-loading')
  }

  const handleBack = () => {
    const filteredResumeInfo = {
      company: resumeInfo.company,
      questions: resumeInfo.questions.filter(item => item.trim())
    }

    setFormData({
      personalInfo: formData?.personalInfo || {
        strengths: [],
        weaknesses: [],
        experiences: [],
        skills: [],
        educations: [],
        awards: []
      },
      resumeInfo: filteredResumeInfo
    })
    
    router.push('/personal-info')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 상단 버튼들 */}
      <div className="flex justify-between mb-6">
        <Button type="button" variant="outline" onClick={handleBack}>
          이전 단계
        </Button>
        <Button type="submit" variant="outline" size="lg" className="px-8" onClick={handleSubmit}>
          회사 정보 확인
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">이력서 정보 입력</h1>
        <p className="text-gray-600">지원하고자 하는 회사와 관련 정보를 입력해주세요</p>
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">✓</div>
            <div className="w-16 h-1 bg-blue-500"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">2</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>이력서 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">지원 회사</Label>
              <Input
                value={resumeInfo.company}
                onChange={(e) => setResumeInfo(prev => ({ ...prev, company: e.target.value }))}
                placeholder="지원하고자 하는 회사명을 입력하세요"
                required
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">이력서 질문</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  추가
                </Button>
              </div>
              {resumeInfo.questions.map((question: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={question}
                    onChange={(e) => updateField(index, e.target.value)}
                    placeholder="이력서 질문을 입력하세요."
                    className="flex-1"
                  />
                  {resumeInfo.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      삭제
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}