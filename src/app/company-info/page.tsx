'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/store/resumeStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DEFAULT_RESUME_QUESTIONS } from '@/constants/resumeQuestions'
import { CompanyStructuredData, Job } from '@/types/resume'

export default function CompanyInfoPage() {
  const router = useRouter()
  const { companyResearch, formData, setGeneratedResume, setIsGenerating, setSelectedJob: setStoreSelectedJob } = useResumeStore()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobsList, setJobsList] = useState<Job[]>([])

  useEffect(() => {
    if (!companyResearch) {
      router.push('/resume-info')
      return
    }
    
    // JSON 데이터에서 jobs 추출
    try {
      const jsonMatch = companyResearch.data.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]) as CompanyStructuredData
        if (jsonData.jobs && Array.isArray(jsonData.jobs)) {
          setJobsList(jsonData.jobs)
        }
      }
    } catch {
      console.log('JSON 파싱 실패, jobs 목록을 찾을 수 없습니다')
    }
  }, [companyResearch, router])

  const handleCreateResume = async () => {
    if (!formData || !companyResearch || !selectedJob) {
      console.error('필수 데이터가 없습니다')
      return
    }

    // 선택된 직무를 store에 저장
    setStoreSelectedJob(selectedJob)
    setIsGenerating(true)
    router.push('/resume-loading')

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo: {
            strengths: formData.personalInfo.strengths,
            weaknesses: formData.personalInfo.weaknesses,
            experience: formData.personalInfo.experiences.join(', '),
            skills: formData.personalInfo.skills.join(', '),
            education: formData.personalInfo.educations.join(', '),
            awards: formData.personalInfo.awards.join(', '),
          },
          companyInfo: companyResearch.data,
          selectedJob: selectedJob,
          resumeQuestions: DEFAULT_RESUME_QUESTIONS
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // 생성된 이력서 저장
      setGeneratedResume({
        title: `${formData.resumeInfo.company} 지원 이력서`,
        content: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
        generatedAt: new Date()
      })

      setIsGenerating(false)
      router.push('/resume-result')
    } catch (error) {
      console.error('이력서 생성 실패:', error)
      setIsGenerating(false)
      // 에러 발생 시에도 결과 페이지로 이동 (더미 데이터 표시)
      router.push('/resume-result')
    }
  }

  const handleBack = () => {
    router.push('/resume-info')
  }

  if (!companyResearch) {
    return null
  }

  const convertLinksToHyperlinks = (text: string) => {
    // URL 패턴을 찾는 정규식
    const urlRegex = /(https?:\/\/[^\s)]+)/g
    
    return text.split(urlRegex).map((part, partIndex) => {
      if (urlRegex.test(part)) {
        return (
          <a 
            key={partIndex} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            (링크)
          </a>
        )
      }
      return part
    })
  }

  const parseStructuredContent = (content: string) => {
    try {
      // JSON 구조인지 확인
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]) as CompanyStructuredData;
        return renderStructuredData(jsonData);
      }
    } catch {
      console.log('JSON 파싱 실패, 일반 텍스트로 처리');
    }
    
    // JSON이 아닌 경우 기존 마크다운 스타일 처리
    return formatMarkdownContent(content);
  }

  const renderStructuredData = (data: CompanyStructuredData) => {
    // 색상 배열 정의 (각 직무별로 다른 색상 테마)
    const colorThemes = [
      {
        border: 'border-blue-200',
        background: 'bg-blue-50',
        headerText: 'text-blue-800',
        categoryBg: 'bg-blue-100',
        categoryText: 'text-blue-800',
        accent: 'bg-blue-500'
      },
      {
        border: 'border-green-200',
        background: 'bg-green-50',
        headerText: 'text-green-800',
        categoryBg: 'bg-green-100',
        categoryText: 'text-green-800',
        accent: 'bg-green-500'
      },
      {
        border: 'border-purple-200',
        background: 'bg-purple-50',
        headerText: 'text-purple-800',
        categoryBg: 'bg-purple-100',
        categoryText: 'text-purple-800',
        accent: 'bg-purple-500'
      },
      {
        border: 'border-orange-200',
        background: 'bg-orange-50',
        headerText: 'text-orange-800',
        categoryBg: 'bg-orange-100',
        categoryText: 'text-orange-800',
        accent: 'bg-orange-500'
      },
      {
        border: 'border-pink-200',
        background: 'bg-pink-50',
        headerText: 'text-pink-800',
        categoryBg: 'bg-pink-100',
        categoryText: 'text-pink-800',
        accent: 'bg-pink-500'
      },
      {
        border: 'border-indigo-200',
        background: 'bg-indigo-50',
        headerText: 'text-indigo-800',
        categoryBg: 'bg-indigo-100',
        categoryText: 'text-indigo-800',
        accent: 'bg-indigo-500'
      }
    ]

    return (
      <div className="space-y-8">
        {/* 회사 정보 섹션 */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">회사 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-gray-700">회사명:</span>
              <span className="ml-2">{data.companyName || '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">업종:</span>
              <span className="ml-2">{data.companyIndustry || '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">기업 규모:</span>
              <span className="ml-2">{data.companySize || '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">웹사이트:</span>
              <span className="ml-2">{data.companyWebsite ? convertLinksToHyperlinks(data.companyWebsite) : '-'}</span>
            </div>
            {data.companyDescription && data.companyDescription !== '-' && (
              <div className="md:col-span-2">
                <span className="font-semibold text-gray-700">회사 소개:</span>
                <p className="mt-1 text-gray-600">{data.companyDescription}</p>
              </div>
            )}
            {data.idealCandidateProfile && data.idealCandidateProfile !== '-' && (
              <div className="md:col-span-2 border-t pt-4 mt-4">
                <span className="font-semibold text-gray-700">이상적인 인재상:</span>
                <p className="mt-1 text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  {data.idealCandidateProfile}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 채용 정보 섹션 */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">채용 정보</h2>
          {data.jobs && data.jobs.length > 0 ? (
            <div className="space-y-6">
              {data.jobs.map((job: Job, index: number) => {
                const theme = colorThemes[index % colorThemes.length]
                return (
                  <div key={index} className={`border ${theme.border} ${theme.background} rounded-lg p-6 relative overflow-hidden`}>
                    {/* 색상 구분을 위한 좌측 액센트 바 */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`}></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-semibold ${theme.headerText}`}>{job.jobTitle || '채용 직무'}</h3>
                      <span className={`${theme.categoryBg} ${theme.categoryText} px-3 py-1 rounded-full text-sm font-medium`}>
                        {job.jobCategory || '일반'}
                      </span>
                    </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="font-semibold text-gray-700">고용형태:</span>
                      <span className="ml-2">{job.hiringType || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">모집인원:</span>
                      <span className="ml-2">{job.numberOfPositions || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">근무지:</span>
                      <span className="ml-2">{job.workLocation || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">근무형태:</span>
                      <span className="ml-2">{job.workMode || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">근무시간:</span>
                      <span className="ml-2">{job.workingHours || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">급여:</span>
                      <span className="ml-2">{job.salaryRange || '-'}</span>
                    </div>
                  </div>

                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">주요 업무</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {job.responsibilities.map((item: string, idx: number) => (
                          <li key={idx} className="text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.qualifications && job.qualifications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">자격 요건</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {job.qualifications.map((item: string, idx: number) => (
                          <li key={idx} className="text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.preferredQualifications && job.preferredQualifications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">우대 사항</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {job.preferredQualifications.map((item: string, idx: number) => (
                          <li key={idx} className="text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">필요 기술</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.benefits && job.benefits.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">복리후생</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {job.benefits.map((benefit: string, idx: number) => (
                          <li key={idx} className="text-gray-600">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">채용 일정</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {job.applicationStartDate && job.applicationStartDate !== '-' && (
                        <div>
                          <span className="font-medium">접수 시작:</span>
                          <span className="ml-2">{job.applicationStartDate}</span>
                        </div>
                      )}
                      {job.applicationEndDate && job.applicationEndDate !== '-' && (
                        <div>
                          <span className="font-medium">접수 마감:</span>
                          <span className="ml-2">{job.applicationEndDate}</span>
                        </div>
                      )}
                      {job.resultAnnouncementDate && job.resultAnnouncementDate !== '-' && (
                        <div>
                          <span className="font-medium">결과 발표:</span>
                          <span className="ml-2">{job.resultAnnouncementDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">채용 정보를 찾을 수 없습니다.</p>
          )}
        </div>

        {/* 출처 섹션 */}
        {data.source && data.source.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">정보 출처</h2>
            <ul className="space-y-2">
              {data.source.map((url: string, index: number) => (
                <li key={index}>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const formatMarkdownContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-800">{convertLinksToHyperlinks(line.substring(3))}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-700">{convertLinksToHyperlinks(line.substring(4))}</h3>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold mt-3 mb-1">{convertLinksToHyperlinks(line.substring(2, line.length - 2))}</p>
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{convertLinksToHyperlinks(line.substring(2))}</li>
      }
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return <p key={index} className="text-sm text-gray-500 italic mt-3 mb-1">{convertLinksToHyperlinks(line.substring(1, line.length - 1))}</p>
      }
      if (line.trim() === '') {
        return <div key={index} className="mb-2"></div>
      }
      return <p key={index} className="mb-2 leading-relaxed">{convertLinksToHyperlinks(line)}</p>
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">기업 정보</h1>
        <p className="text-gray-600">AI가 조사한 기업의 채용 정보입니다</p>
      </div>

      {/* 상단 액션 버튼들 */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <Button variant="outline" onClick={handleBack}>
          이전 단계
        </Button>
        
        <Button 
          onClick={handleCreateResume} 
          variant="outline"
          disabled={!selectedJob}
        >
          이력서 작성
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 좌측 직무 선택 목록 */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">지원 직무 선택</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsList.length > 0 ? (
                <div className="space-y-2">
                  {jobsList.map((job, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedJob === job
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {job.jobTitle || '직무명 없음'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {job.jobCategory || '카테고리 없음'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  직무 정보를 찾을 수 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
          
          {selectedJob && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                선택된 직무
              </div>
              <div className="text-sm text-blue-700">
                {selectedJob.jobTitle}
              </div>
            </div>
          )}
        </div>

        {/* 우측 기업 정보 내용 */}
        <div className="col-span-9 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-left">{companyResearch.company} 채용 정보 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                {parseStructuredContent(companyResearch.data)}
              </div>
            </CardContent>
          </Card>

          {/* 안내 메시지 */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>위 정보는 AI가 분석한 결과로 참고용으로만 사용하시기 바랍니다.</p>
            <p>실제 지원 시에는 공식 채용 공고를 확인하세요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}