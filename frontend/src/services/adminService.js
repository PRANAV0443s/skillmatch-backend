import api from './api'

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats')
    return res.data
  },

  getAllUsers: async () => {
    const res = await api.get('/admin/users')
    return res.data
  },

  getAllJobs: async () => {
    const res = await api.get('/admin/jobs')
    return res.data
  },

  getAllApplications: async () => {
    const res = await api.get('/admin/applications')
    return res.data
  },
}
