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

// 직무 및 기업 구조화 데이터 타입
export interface Job {
  jobTitle?: string
  jobCategory?: string
  hiringType?: string
  numberOfPositions?: string
  workLocation?: string
  workMode?: string
  workingHours?: string
  salaryRange?: string
  responsibilities?: string[]
  qualifications?: string[]
  preferredQualifications?: string[]
  requiredSkills?: string[]
  benefits?: string[]
  applicationStartDate?: string
  applicationEndDate?: string
  resultAnnouncementDate?: string
}

export interface CompanyStructuredData {
  companyName?: string
  companyIndustry?: string
  companySize?: string
  companyWebsite?: string
  companyDescription?: string
  idealCandidateProfile?: string
  jobs?: Job[]
  source?: string[]
}