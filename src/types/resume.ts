export interface PersonalInfo {
  strengths: string[]
  weaknesses: string[]
  experiences: string[]
  skills: string[]
  educations: string[]
  awards: string[]
}

export interface ResumeInfo {
  company: string
  questions: string[]
}

export interface GeneratedResume {
  title: string
  content: string
  generatedAt: Date
}

export interface CompanyResearchResult {
  company: string
  data: string
  generatedAt: Date
}

export interface ResumeFormData {
  personalInfo: PersonalInfo
  resumeInfo: ResumeInfo
}