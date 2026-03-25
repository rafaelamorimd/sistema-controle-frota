import axios from 'axios'

// Em produção (Render), VITE_API_URL aponta para o backend.
// Em local (Docker com Nginx proxy), usa /api relativo.
const strBaseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: strBaseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function postFormData<T>(url: string, formData: FormData) {
  return api.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export default api
