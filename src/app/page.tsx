import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">AI 이력서 생성 서비스</h1>
          <p className="text-xl text-gray-600">
            개인 정보를 입력하면 AI가 맞춤형 이력서를 자동으로 생성해드립니다
          </p>
        </div>

        <Card className="text-left">
          <CardHeader>
            <CardTitle>서비스 특징</CardTitle>
            <CardDescription>간단하고 빠른 이력서 작성</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>개인 정보 (장단점, 경력, 역량, 교육, 수상내역) 입력</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>지원 회사 및 맞춤 질문 설정</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>AI가 자동으로 맞춤형 이력서 생성</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>결과를 복사하거나 파일로 다운로드 가능</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <Link href="/personal-info">
            <Button size="lg" className="px-8 py-3 text-lg">
              이력서 생성 시작하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}