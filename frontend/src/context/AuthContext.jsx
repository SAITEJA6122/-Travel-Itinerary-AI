import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkUser()
    } else {
      setLoading(false)
    }
  }, [])

  const checkUser = async () => {
    try {
      const res = await axios.get('https://travel-itinerary-ai-1l2j.onrender.com/api/auth/me')
      setUser(res.data)
    } catch (err) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const res = await axios.post('https://travel-itinerary-ai-1l2j.onrender.com/api/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data)
  }

  const register = async (name, email, password) => {
    const res = await axios.post('https://travel-itinerary-ai-1l2j.onrender.com/api/auth/register', { name, email, password })
    localStorage.setItem('token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
