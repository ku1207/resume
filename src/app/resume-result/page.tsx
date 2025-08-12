'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resumeStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ResumeResultPage() {
  const router = useRouter()
  const { generatedResume, reset } = useResumeStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.log('Resume Result - generatedResume:', generatedResume)
    console.log('Resume Result - generatedResume.content:', generatedResume?.content)
    if (!generatedResume) {
      console.log('No generatedResume found, redirecting to personal-info')
      router.push('/personal-info')
    }
  }, [generatedResume, router])

  const getContentText = () => {
    if (generatedResume?.data) {
      try {
        const resumeData = JSON.parse(generatedResume.data)
        return resumeData.resumeQuestion.map((question: string, index: number) => {
          const answer = resumeData.resumeQuestionAnswer[index] || '답변이 없습니다.'
          return `${question}\n\n${answer}`
        }).join('\n\n---\n\n')
      } catch (error) {
        return '데이터 파싱 오류'
      }
    } else if (generatedResume?.content) {
      return generatedResume.content
    }
    return '내용이 없습니다.'
  }

  const handleCopy = async () => {
    if (!generatedResume) return
    
    try {
      const contentText = getContentText()
      await navigator.clipboard.writeText(contentText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('복사에 실패했습니다:', err)
    }
  }

  const handleDownload = () => {
    if (!generatedResume) return

    const contentText = getContentText()
    const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedResume.title || '이력서'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleNewResume = () => {
    reset()
    router.push('/personal-info')
  }

  if (!generatedResume) {
    return null
  }

  const renderContent = () => {
    let resumeData
    
    // generatedResume.data 또는 generatedResume.content 처리
    if (generatedResume?.data) {
      try {
        resumeData = JSON.parse(generatedResume.data)
        console.log('Parsed resume data:', resumeData)
      } catch (error) {
        console.error('JSON parse error:', error)
        return <p className="text-gray-500 text-center py-8">데이터 파싱 오류가 발생했습니다.</p>
      }
    } else if (generatedResume?.content) {
      // 기존 content 형식 처리
      const content = generatedResume.content
      const sections = content.split('## ').filter(section => section.trim())
      
      resumeData = {
        resumeQuestion: sections.map(section => section.split('\n')[0]),
        resumeQuestionAnswer: sections.map(section => section.split('\n').slice(1).join('\n').trim())
      }
    } else {
      console.log('No data available')
      return <p className="text-gray-500 text-center py-8">내용이 없습니다.</p>
    }

    if (!resumeData?.resumeQuestion || !resumeData?.resumeQuestionAnswer) {
      console.log('Invalid resume data structure')
      return <p className="text-gray-500 text-center py-8">올바르지 않은 데이터 구조입니다.</p>
    }

    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200', 
      'bg-purple-50 border-purple-200',
      'bg-orange-50 border-orange-200',
      'bg-pink-50 border-pink-200',
      'bg-indigo-50 border-indigo-200'
    ]

    return resumeData.resumeQuestion.map((question: string, index: number) => {
      const answer = resumeData.resumeQuestionAnswer[index] || '답변이 없습니다.'
      const colorClass = colors[index % colors.length]

      return (
        <div key={index} className={`p-6 rounded-lg border-2 ${colorClass} mb-6`}>
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {question} <span className="text-sm font-normal text-gray-500">({answer.length}자)</span>
          </h2>
          <div className="prose prose-gray max-w-none">
            {answer.split('\n').map((line: string, lineIndex: number) => {
              if (line.trim() === '') {
                return <div key={lineIndex} className="mb-2"></div>
              }
              return <p key={lineIndex} className="mb-2 leading-relaxed text-gray-700">{line}</p>
            })}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">이력서 생성 완료</h1>
        <p className="text-gray-600">AI가 생성한 맞춤형 이력서입니다</p>
        <p className="text-sm text-gray-500 mt-2">
          생성일시: {generatedResume.generatedAt.toLocaleString('ko-KR')}
        </p>
      </div>

      <div className="space-y-6">
        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={handleCopy} variant="outline">
            {copied ? '복사됨!' : '내용 복사'}
          </Button>
          <Button onClick={handleDownload} variant="outline">
            텍스트 파일 다운로드
          </Button>
          <Button onClick={handleNewResume} variant="outline">
            새 이력서 작성
          </Button>
        </div>

        {/* 이력서 내용 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{generatedResume.title}</h2>
          {renderContent()}
        </div>

        {/* 하단 안내 */}
        <div className="text-center text-sm text-gray-500 space-y-2 mt-8">
          <p>생성된 이력서는 참고용으로만 사용하시기 바랍니다.</p>
          <p>실제 지원 시에는 내용을 검토하고 수정하여 사용하세요.</p>
        </div>
      </div>
    </div>
  )
}