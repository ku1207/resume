import { create } from 'zustand'
import { ResumeFormData, GeneratedResume, CompanyResearchResult } from '@/types/resume'

interface ResumeState {
  formData: ResumeFormData | null
  generatedResume: GeneratedResume | null
  companyResearch: CompanyResearchResult | null
  selectedJob: any | null
  isGenerating: boolean
  setFormData: (data: ResumeFormData) => void
  setGeneratedResume: (resume: GeneratedResume) => void
  setCompanyResearch: (research: CompanyResearchResult) => void
  setSelectedJob: (job: any) => void
  setIsGenerating: (generating: boolean) => void
  reset: () => void
}

export const useResumeStore = create<ResumeState>((set) => ({
  formData: null,
  generatedResume: null,
  companyResearch: null,
  selectedJob: null,
  isGenerating: false,
  setFormData: (data) => set({ formData: data }),
  setGeneratedResume: (resume) => set({ generatedResume: resume }),
  setCompanyResearch: (research) => set({ companyResearch: research }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  reset: () => set({ formData: null, generatedResume: null, companyResearch: null, selectedJob: null, isGenerating: false })
}))