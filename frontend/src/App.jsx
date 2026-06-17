import { useContext, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
const Login = lazy(() => import('./components/Login'))
const Register = lazy(() => import('./components/Register'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const ItineraryView = lazy(() => import('./components/ItineraryView'))
const SharedItinerary = lazy(() => import('./components/SharedItinerary'))
import AuthContext from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div className="loading">Loading...</div>
  return user ? children : <Navigate to='/login' />
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <Navbar />
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path='/' element={<Navigate to='/dashboard' />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/dashboard' element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path='/itinerary/:id' element={
              <ProtectedRoute>
                <ItineraryView />
              </ProtectedRoute>
            } />
            <Route path='/shared/:shareId' element={<SharedItinerary />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  )
}

export default App
