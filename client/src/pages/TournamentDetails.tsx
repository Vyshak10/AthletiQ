import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { TournamentStats } from '../components/TournamentStats'
import { Tournament } from '../types/tournament'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { ScrollArea } from '../components/ui/scroll-area'

interface Match {
  id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  status: string
  start_time: string
}

interface Lineup {
  id: string
  team: string
  players: {
    id: string
    name: string
    position: string
    jersey_number: number
  }[]
}

interface Statistics {
  team: string
  wins: number
  losses: number
  draws: number
  goals_for: number
  goals_against: number
}

interface TournamentStats {
  id: string
  team_name: string
  score: number
}

interface Team {
  id: string
  name: string
  logo_url: string
}

interface Player {
  id: string
  name: string
  jersey_number: number
  position: string
  stats: any
}

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  venue: string
  status: string
  score: any
  match_stats: any
}

interface Lineup {
  team_id: string
  player_id: string
  is_starter: boolean
  position: string
}

export function TournamentDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Record<string, Player[]>>({})
  const [matches, setMatches] = useState<Match[]>([])
  const [lineups, setLineups] = useState<Record<string, Lineup[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!id) return
    fetchTournamentData()

    // Subscribe to real-time updates
    const channels = [
      supabase
        .channel(`tournament-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${id}` },
          (payload) => {
            setTournament(payload.new as Tournament)
          }
        )
        .subscribe(),

      supabase
        .channel(`tournament-teams-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournament_teams', filter: `tournament_id=eq.${id}` },
          () => {
            fetchTeams()
          }
        )
        .subscribe(),

      supabase
        .channel(`tournament-matches-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournament_matches', filter: `tournament_id=eq.${id}` },
          () => {
            fetchMatches()
          }
        )
        .subscribe()
    ]

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel))
    }
  }, [id])

  const fetchTournamentData = async () => {
    try {
      const [
        tournamentData,
        teamsData,
        matchesData
      ] = await Promise.all([
        supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('tournament_teams')
          .select('*')
          .eq('tournament_id', id),
        supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', id)
          .order('match_date', { ascending: true })
      ])

      if (tournamentData.error) throw tournamentData.error
      if (teamsData.error) throw teamsData.error
      if (matchesData.error) throw matchesData.error

      setTournament(tournamentData.data)
      setTeams(teamsData.data)
      setMatches(matchesData.data)

      // Fetch players for each team
      const playersPromises = teamsData.data.map(team =>
        supabase
          .from('team_players')
          .select('*')
          .eq('team_id', team.id)
      )

      const playersResults = await Promise.all(playersPromises)
      const playersMap = playersResults.reduce((acc, result, index) => {
        if (!result.error) {
          acc[teamsData.data[index].id] = result.data
        }
        return acc
      }, {} as Record<string, Player[]>)

      setPlayers(playersMap)

      // Fetch lineups for each match
      const lineupPromises = matchesData.data.map(match =>
        supabase
          .from('match_lineups')
          .select('*')
          .eq('match_id', match.id)
      )

      const lineupResults = await Promise.all(lineupPromises)
      const lineupMap = lineupResults.reduce((acc, result, index) => {
        if (!result.error) {
          acc[matchesData.data[index].id] = result.data
        }
        return acc
      }, {} as Record<string, Lineup[]>)

      setLineups(lineupMap)
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

  const getTeamName = (teamId: string) => {
    return teams.find(team => team.id === teamId)?.name || 'Unknown Team'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'published': return 'bg-blue-500'
      case 'in_progress': return 'bg-green-500'
      case 'completed': return 'bg-purple-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500'
      case 'lineup_submitted': return 'bg-yellow-500'
      case 'in_progress': return 'bg-green-500'
      case 'completed': return 'bg-purple-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Tournament not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{tournament.name}</CardTitle>
              <CardDescription className="text-lg capitalize">
                {tournament.sport} • {tournament.format}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(tournament.status)}>
              {tournament.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-500">Start Date</h3>
                <p>{new Date(tournament.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">End Date</h3>
                <p>{new Date(tournament.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Description</h3>
                <p className="text-gray-600">{tournament.description}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-500">Rules</h3>
                <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(tournament.rules, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Teams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{teams.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{matches.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {matches.length
                        ? Math.round((matches.filter(m => m.status === 'completed').length / matches.length) * 100)
                        : 0}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <CardDescription>
                        {players[team.id]?.length || 0} Players
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {players[team.id]?.map((player) => (
                            <div
                              key={player.id}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <p className="font-medium">{player.name}</p>
                                <p className="text-sm text-gray-500 capitalize">
                                  {player.position}
                                </p>
                              </div>
                              <Badge variant="outline">#{player.jersey_number}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1 text-center md:text-right">
                          <p className="text-xl font-bold">{getTeamName(match.home_team_id)}</p>
                          <p className="text-sm text-gray-500">Home Team</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold">
                            {match.score.home || 0}
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <Badge className={getMatchStatusColor(match.status)}>
                              {match.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-sm text-gray-500">
                              {new Date(match.match_date).toLocaleString()}
                            </p>
                            {match.venue && (
                              <p className="text-sm text-gray-500">{match.venue}</p>
                            )}
                          </div>
                          <div className="text-3xl font-bold">
                            {match.score.away || 0}
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                          <p className="text-xl font-bold">{getTeamName(match.away_team_id)}</p>
                          <p className="text-sm text-gray-500">Away Team</p>
                        </div>
                      </div>

                      {(match.status === 'lineup_submitted' || match.status === 'in_progress' || match.status === 'completed') && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <h4 className="font-medium mb-2">Home Team Lineup</h4>
                              <div className="space-y-1">
                                {lineups[match.id]
                                  ?.filter(l => l.team_id === match.home_team_id)
                                  .map(lineup => {
                                    const player = players[match.home_team_id]?.find(p => p.id === lineup.player_id)
                                    return player ? (
                                      <div key={lineup.player_id} className="flex justify-between items-center">
                                        <span>{player.name}</span>
                                        <Badge variant="outline">
                                          {lineup.is_starter ? 'Starter' : 'Sub'}
                                        </Badge>
                                      </div>
                                    ) : null
                                  })}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Away Team Lineup</h4>
                              <div className="space-y-1">
                                {lineups[match.id]
                                  ?.filter(l => l.team_id === match.away_team_id)
                                  .map(lineup => {
                                    const player = players[match.away_team_id]?.find(p => p.id === lineup.player_id)
                                    return player ? (
                                      <div key={lineup.player_id} className="flex justify-between items-center">
                                        <span>{player.name}</span>
                                        <Badge variant="outline">
                                          {lineup.is_starter ? 'Starter' : 'Sub'}
                                        </Badge>
                                      </div>
                                    ) : null
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Team</th>
                      <th className="text-center py-2">P</th>
                      <th className="text-center py-2">W</th>
                      <th className="text-center py-2">D</th>
                      <th className="text-center py-2">L</th>
                      <th className="text-center py-2">GF</th>
                      <th className="text-center py-2">GA</th>
                      <th className="text-center py-2">GD</th>
                      <th className="text-center py-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => {
                      const teamMatches = matches.filter(
                        m => m.home_team_id === team.id || m.away_team_id === team.id
                      )
                      const wins = teamMatches.filter(m => {
                        const isHome = m.home_team_id === team.id
                        const score = m.score || { home: 0, away: 0 }
                        return isHome ? score.home > score.away : score.away > score.home
                      }).length
                      const draws = teamMatches.filter(m => {
                        const score = m.score || { home: 0, away: 0 }
                        return score.home === score.away
                      }).length
                      const losses = teamMatches.filter(m => {
                        const isHome = m.home_team_id === team.id
                        const score = m.score || { home: 0, away: 0 }
                        return isHome ? score.home < score.away : score.away < score.home
                      }).length
                      const goalsFor = teamMatches.reduce((sum, m) => {
                        const isHome = m.home_team_id === team.id
                        const score = m.score || { home: 0, away: 0 }
                        return sum + (isHome ? score.home : score.away)
                      }, 0)
                      const goalsAgainst = teamMatches.reduce((sum, m) => {
                        const isHome = m.home_team_id === team.id
                        const score = m.score || { home: 0, away: 0 }
                        return sum + (isHome ? score.away : score.home)
                      }, 0)

                      return (
                        <tr key={team.id} className="border-b">
                          <td className="py-2">{team.name}</td>
                          <td className="text-center py-2">{teamMatches.length}</td>
                          <td className="text-center py-2">{wins}</td>
                          <td className="text-center py-2">{draws}</td>
                          <td className="text-center py-2">{losses}</td>
                          <td className="text-center py-2">{goalsFor}</td>
                          <td className="text-center py-2">{goalsAgainst}</td>
                          <td className="text-center py-2">{goalsFor - goalsAgainst}</td>
                          <td className="text-center py-2 font-bold">{wins * 3 + draws}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 