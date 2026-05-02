import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Nutrition from './pages/Nutrition'
import Workouts from './pages/Workouts'
import Progress from './pages/Progress'
import Health from './pages/Health'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import { api } from './lib/api'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return api.isLoggedIn() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/health" element={<Health />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  )
}
