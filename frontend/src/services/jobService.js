import api from './api'

export const jobService = {
  getAll: async () => {
    const res = await api.get('/jobs')
    return res.data
  },

  getById: async (id) => {
    const res = await api.get(`/jobs/${id}`)
    return res.data
  },

  create: async (data) => {
    const res = await api.post('/jobs', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await api.put(`/jobs/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    await api.delete(`/jobs/${id}`)
  },

  getMyJobs: async () => {
    const res = await api.get('/jobs/my')
    return res.data
  },

  getRecommended: async () => {
    const res = await api.get('/jobs/recommended')
    return res.data
  },
}
