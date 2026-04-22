import api from './api'

export const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  login: async (data) => {
    const res = await api.post('/auth/login', data)
    return res.data
  },

  googleLogin: async (idToken, role) => {
    const res = await api.post('/auth/google', { idToken, role })
    return res.data
  },

  verifyEmail: async (email, otp) => {
    const res = await api.post('/auth/verify-email', { email, otp })
    return res.data
  },

  resendOtp: async (email) => {
    const res = await api.post('/auth/resend-otp', { email })
    return res.data
  },

  getProfile: async () => {
    const res = await api.get('/users/me')
    return res.data
  },
}
