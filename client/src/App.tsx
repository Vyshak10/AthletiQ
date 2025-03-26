import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'
import { Tournaments } from './pages/Tournaments'
import { CreateTournament } from './pages/CreateTournament'
import { ManageTournaments } from './pages/ManageTournaments'
import { TournamentDetails } from './pages/TournamentDetails'
import { TournamentStatistics } from './pages/TournamentStatistics'
import { Settings } from './pages/Settings'
import { MatchManagement } from './pages/MatchManagement'
import { TeamManagement } from './pages/TeamManagement'
import { MatchSchedule } from './pages/MatchSchedule'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tournaments" element={<Tournaments />} />
      <Route
        path="/tournaments/create"
        element={
          <ProtectedRoute>
            <CreateTournament />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tournaments/manage"
        element={
          <ProtectedRoute>
            <ManageTournaments />
          </ProtectedRoute>
        }
      />
      <Route path="/tournaments/:id" element={<TournamentDetails />} />
      <Route
        path="/tournaments/:id/statistics"
        element={
          <ProtectedRoute>
            <TournamentStatistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tournaments/:id/matches"
        element={
          <ProtectedRoute>
            <MatchManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tournaments/:id/teams"
        element={
          <ProtectedRoute>
            <TeamManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tournaments/:id/schedule"
        element={
          <ProtectedRoute>
            <MatchSchedule />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main>
              <AppRoutes />
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}