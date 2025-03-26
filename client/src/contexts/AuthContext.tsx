import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { useToast } from '../components/ui/use-toast'

interface UserProfile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin' | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: 'Email Not Verified',
            description: 'Please check your email for a verification link.',
            variant: 'destructive',
          })
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: (await supabase.auth.getUser()).data.user?.id,
            full_name: fullName,
            role: 'user',
          },
        ])

      if (profileError) throw profileError

      toast({
        title: 'Registration Successful',
        description: 'Please check your email for a verification link.',
      })
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          toast({
            title: 'Too Many Attempts',
            description: 'Please wait a moment before trying again.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Registration Failed',
            description: error.message,
            variant: 'destructive',
          })
        }
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id)

      if (error) throw error

      setProfile((prev) => prev ? { ...prev, ...data } : null)
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: profile?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 