import api from './api'

export const applicationService = {
  apply: async (jobId, resumeFile) => {
    const formData = new FormData()
    formData.append('resume', resumeFile)
    const res = await api.post(`/applications/apply/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  getMyApplications: async () => {
    const res = await api.get('/applications/my')
    return res.data
  },

  getJobApplications: async (jobId) => {
    const res = await api.get(`/applications/job/${jobId}`)
    return res.data
  },

  updateStatus: async (applicationId, status) => {
    const res = await api.patch(`/applications/${applicationId}/status`, { status })
    return res.data
  },

  uploadResume: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/users/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}
