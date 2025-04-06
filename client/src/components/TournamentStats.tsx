import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from './ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface TournamentStat {
  id: string
  tournament_id: string
  team_name: string
  score: number
  updated_at: string
}

interface TournamentStatsProps {
  tournamentId: string
  isHost: boolean
}

export function TournamentStats({ tournamentId, isHost }: TournamentStatsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<TournamentStat[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch initial stats
    fetchStats()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('tournament_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_stats',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          console.log('Received real-time update:', payload)
          if (payload.eventType === 'INSERT') {
            setStats(prev => [...prev, payload.new as TournamentStat])
          } else if (payload.eventType === 'UPDATE') {
            setStats(prev => prev.map(stat => 
              stat.id === payload.new.id ? payload.new as TournamentStat : stat
            ))
          } else if (payload.eventType === 'DELETE') {
            setStats(prev => prev.filter(stat => stat.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_stats')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setStats(data || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament stats',
        variant: 'destructive',
      })
    }
  }

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('tournament_stats')
        .insert([
          {
            tournament_id: tournamentId,
            team_name: newTeamName.trim(),
            score: 0
          }
        ])

      if (error) throw error

      setNewTeamName('')
      toast({
        title: 'Success',
        description: 'Team added successfully',
      })
    } catch (error) {
      console.error('Error adding team:', error)
      toast({
        title: 'Error',
        description: 'Failed to add team',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateScore = async (statId: string, newScore: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('tournament_stats')
        .update({ score: newScore })
        .eq('id', statId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Score updated successfully',
      })
    } catch (error) {
      console.error('Error updating score:', error)
      toast({
        title: 'Error',
        description: 'Failed to update score',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {isHost && (
          <div className="mb-4 space-y-2">
            <Label htmlFor="teamName">Add New Team</Label>
            <div className="flex gap-2">
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
              <Button onClick={handleAddTeam} disabled={isLoading}>
                Add Team
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{stat.team_name}</h3>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(stat.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold">{stat.score}</span>
                {isHost && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateScore(stat.id, stat.score - 1)}
                      disabled={isLoading}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateScore(stat.id, stat.score + 1)}
                      disabled={isLoading}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 