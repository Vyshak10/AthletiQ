import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { SportType, TournamentStatus } from '../types/tournament'

interface Tournament {
  id: string
  name: string
  sport: SportType
  format: string
  start_date: string
  end_date: string
  status: TournamentStatus
  description: string
  created_by: string
}

export function TournamentList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('tournaments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTournaments(prev => [...prev, payload.new as Tournament])
          } else if (payload.eventType === 'UPDATE') {
            setTournaments(prev => prev.map(tournament => 
              tournament.id === payload.new.id ? payload.new as Tournament : tournament
            ))
          } else if (payload.eventType === 'DELETE') {
            setTournaments(prev => prev.filter(tournament => tournament.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTournaments(data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournaments',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'published':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <Link to="/tournaments/create">
          <Button>Create Tournament</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <Card key={tournament.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{tournament.name}</span>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(tournament.status)}`}>
                  {tournament.status.replace('_', ' ')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Sport:</span>
                  <span className="capitalize">{tournament.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Format:</span>
                  <span>{tournament.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Start Date:</span>
                  <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">End Date:</span>
                  <span>{new Date(tournament.end_date).toLocaleDateString()}</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{tournament.description}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Link to={`/tournaments/${tournament.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No tournaments found</p>
        </div>
      )}
    </div>
  )
} 