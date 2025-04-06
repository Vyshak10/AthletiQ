import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import { TournamentList } from './pages/TournamentList'
import { ManageTournament } from './pages/ManageTournament'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Public routes wrapper
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/tournaments" />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Protected routes */}
      <Route path="/tournaments" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
      <Route path="/tournaments/create" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
      <Route path="/tournaments/manage" element={<ProtectedRoute><ManageTournaments /></ProtectedRoute>} />
      <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetails /></ProtectedRoute>} />
      <Route path="/tournaments/:id/statistics" element={<ProtectedRoute><TournamentStatistics /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/tournaments/:id/matches" element={<ProtectedRoute><MatchManagement /></ProtectedRoute>} />
      <Route path="/tournaments/:id/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
      <Route path="/tournaments/:id/schedule" element={<ProtectedRoute><MatchSchedule /></ProtectedRoute>} />
      <Route path="/tournaments/:id/manage" element={<ProtectedRoute><ManageTournament /></ProtectedRoute>} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkResources = async () => {
      try {
        // Check Supabase connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        if (error) throw error

        // Add any other initialization checks here
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 500)) // Minimum delay for smooth transition
        ])
      } catch (error) {
        console.error('Error initializing app:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize application')
      } finally {
        setIsLoading(false)
      }
    }

    checkResources()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Initializing application...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Initialization Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Navbar />
            <main className="container mx-auto py-8">
              <AppRoutes />
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}