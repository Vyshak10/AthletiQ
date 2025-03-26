import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../lib/utils'

export function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              SportsMGMNT
            </Link>
            {user && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/tournaments"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/tournaments')
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  Browse Tournaments
                </Link>
                <Link
                  to="/tournaments/create"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/tournaments/create')
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  Create Tournament
                </Link>
                <Link
                  to="/tournaments/manage"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/tournaments/manage')
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  Manage Tournaments
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 