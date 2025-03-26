import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useToast } from '../components/ui/use-toast'
import { supabase } from '../lib/supabase'
import { Tournament } from '../types/tournament'
import { PointsTable } from '../components/tournaments/PointsTable'

interface Match {
  id: string
  tournament_id: string
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  home_score: number
  away_score: number
  match_date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

interface TeamStats {
  team_id: string
  team_name: string
  played: number
  won: number
  lost: number
  drawn: number
  goals_for: number
  goals_against: number
  points: number
  position: number
}

export function TournamentStatistics() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchTournamentData()
    }
  }, [id])

  const fetchTournamentData = async () => {
    try {
      // Fetch tournament details
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (tournamentError) throw tournamentError

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', id)
        .order('match_date', { ascending: true })

      if (matchesError) throw matchesError

      // Fetch team statistics
      const { data: statsData, error: statsError } = await supabase
        .from('team_stats')
        .select('*')
        .eq('tournament_id', id)
        .order('position', { ascending: true })

      if (statsError) throw statsError

      setTournament(tournamentData)
      setMatches(matchesData || [])
      setTeamStats(statsData || [])
    } catch (error) {
      console.error('Error fetching tournament data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Tournament not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{tournament.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="standings">Standings</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-4">
              <PointsTable stats={teamStats} />
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              <div className="grid gap-4">
                {matches.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-right">
                          <p className="font-medium">{match.home_team_name}</p>
                        </div>
                        <div className="px-4">
                          <p className="font-bold">
                            {match.status === 'completed'
                              ? `${match.home_score} - ${match.away_score}`
                              : match.status === 'in_progress'
                              ? 'LIVE'
                              : new Date(match.match_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{match.away_team_name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 