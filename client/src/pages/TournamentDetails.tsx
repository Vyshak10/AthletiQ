import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

interface Tournament {
  id: number
  name: string
  sport: string
  startDate: string
  endDate: string
  status: string
  createdBy: number
  description: string
}

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  date: string
}

interface Lineup {
  id: number
  team: string
  players: {
    id: number
    name: string
    position: string
    jerseyNumber: number
  }[]
}

interface Statistics {
  team: string
  wins: number
  losses: number
  draws: number
  goalsFor: number
  goalsAgainst: number
}

export function TournamentDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [statistics, setStatistics] = useState<Statistics[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchTournamentDetails()
  }, [id])

  const fetchTournamentDetails = async () => {
    try {
      const [tournamentRes, matchesRes, lineupsRes, statsRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/matches`),
        fetch(`/api/tournaments/${id}/lineups`),
        fetch(`/api/tournaments/${id}/statistics`)
      ])

      if (!tournamentRes.ok || !matchesRes.ok || !lineupsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch tournament details')
      }

      const [tournamentData, matchesData, lineupsData, statsData] = await Promise.all([
        tournamentRes.json(),
        matchesRes.json(),
        lineupsRes.json(),
        statsRes.json()
      ])

      setTournament(tournamentData)
      setMatches(matchesData)
      setLineups(lineupsData)
      setStatistics(statsData)
    } catch (error) {
      console.error('Error fetching tournament details:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.id === tournament?.createdBy

  const handleUpdateScore = async (matchId: number, homeScore: number, awayScore: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeScore, awayScore }),
      })

      if (!response.ok) throw new Error('Failed to update score')
      
      // Refresh matches after update
      const matchesRes = await fetch(`/api/tournaments/${id}/matches`)
      if (!matchesRes.ok) throw new Error('Failed to fetch updated matches')
      const matchesData = await matchesRes.json()
      setMatches(matchesData)
    } catch (error) {
      console.error('Error updating score:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!tournament) return <div>Tournament not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{tournament.name}</h1>
        {isAdmin && (
          <Button onClick={() => {/* TODO: Implement edit tournament */}}>
            Edit Tournament
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lineup">Lineup</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p><strong>Sport:</strong> {tournament.sport}</p>
                <p><strong>Start Date:</strong> {new Date(tournament.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(tournament.endDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {tournament.status}</p>
                <p><strong>Description:</strong> {tournament.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="flex justify-between items-center p-4 border rounded">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span>{match.homeTeam}</span>
                        <span className="mx-4">
                          {match.homeScore} - {match.awayScore}
                        </span>
                        <span>{match.awayTeam}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {new Date(match.date).toLocaleString()}
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement score update modal
                        }}
                      >
                        Update Score
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineup">
          <Card>
            <CardHeader>
              <CardTitle>Team Lineups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {lineups.map((lineup) => (
                  <div key={lineup.id} className="border rounded p-4">
                    <h3 className="text-xl font-semibold mb-4">{lineup.team}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {lineup.players.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <span className="font-medium">{player.jerseyNumber}</span>
                          <span>{player.name}</span>
                          <span className="text-sm text-muted-foreground">({player.position})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {statistics.map((stat) => (
                  <div key={stat.team} className="border rounded p-4">
                    <h3 className="text-xl font-semibold mb-4">{stat.team}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Wins</p>
                        <p className="text-2xl font-bold">{stat.wins}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Losses</p>
                        <p className="text-2xl font-bold">{stat.losses}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Draws</p>
                        <p className="text-2xl font-bold">{stat.draws}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Goals For</p>
                        <p className="text-2xl font-bold">{stat.goalsFor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Goals Against</p>
                        <p className="text-2xl font-bold">{stat.goalsAgainst}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 