'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useResumeStore } from '@/store/resumeStore'

export default function PersonalInfoPage() {
  const router = useRouter()
  const { formData, setFormData } = useResumeStore()
  
  const [personalInfo, setPersonalInfo] = useState({
    strengths: formData?.personalInfo.strengths || [''],
    weaknesses: formData?.personalInfo.weaknesses || [''],
    experiences: formData?.personalInfo.experiences || [''],
    skills: formData?.personalInfo.skills || [''],
    educations: formData?.personalInfo.educations || [''],
    awards: formData?.personalInfo.awards || ['']
  })

  const addField = (section: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [section]: [...prev[section as keyof typeof prev], '']
    }))
  }

  const updateField = (section: string, index: number, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].map((item, i) => i === index ? value : item)
    }))
  }

  const removeField = (section: string, index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].filter((_, i) => i !== index)
    }))
  }

  const renderFieldSection = (title: string, section: string) => {
    const data = personalInfo[section as keyof typeof personalInfo]
    
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">{title}</Label>
        <Textarea
          value={data[0]}
          onChange={(e) => updateField(section, 0, e.target.value)}
          placeholder={`${title}을(를) 입력하세요`}
          className="min-h-[100px]"
        />
      </div>
    )
  }

  const handleNext = () => {
    const filteredPersonalInfo = {
      strengths: personalInfo.strengths.filter(item => item.trim()),
      weaknesses: personalInfo.weaknesses.filter(item => item.trim()),
      experiences: personalInfo.experiences.filter(item => item.trim()),
      skills: personalInfo.skills.filter(item => item.trim()),
      educations: personalInfo.educations.filter(item => item.trim()),
      awards: personalInfo.awards.filter(item => item.trim())
    }

    setFormData({
      personalInfo: filteredPersonalInfo,
      resumeInfo: formData?.resumeInfo || { company: '', questions: [] }
    })
    
    router.push('/resume-info')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 상단 버튼들 */}
      <div className="flex justify-between mb-6">
        <Button variant="outline" onClick={() => router.push('/')}>
          취소
        </Button>
        <Button onClick={handleNext} variant="outline" size="lg" className="px-8">
          다음 단계
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">개인 정보 입력</h1>
        <p className="text-gray-600">자신에 대한 정보를 상세히 입력해주세요</p>
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">1</div>
            <div className="w-16 h-1 bg-blue-500"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-semibold">2</div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>개인 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderFieldSection('장점', 'strengths')}
          {renderFieldSection('단점', 'weaknesses')}
          {renderFieldSection('경력사항', 'experiences')}
          {renderFieldSection('보유 역량', 'skills')}
          {renderFieldSection('교육/자격증', 'educations')}
          {renderFieldSection('수상내역', 'awards')}
        </CardContent>
      </Card>
    </div>
  )
}