import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'

interface Tournament {
  id: string
  name: string
  sport: string
  format: string
  start_date: string
  end_date: string
  status: string
  created_by: string
  teams: {
    id: string
    name: string
  }[]
  matches: {
    id: string
    status: string
    score: {
      home: number
      away: number
    }
  }[]
}

export default function BrowseTournaments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sportFilter, setSportFilter] = useState<string>('')

  useEffect(() => {
    // Fetch initial tournaments data
    fetchTournaments()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('tournaments_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        () => {
          fetchTournaments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchTournaments = async () => {
    try {
      const { data: tournamentsData, error } = await supabase
        .from('tournaments')
        .select(\`
          *,
          teams:tournament_teams(id, name),
          matches:tournament_matches(
            id,
            status,
            score,
            home_team_id,
            away_team_id,
            match_date
          )
        \`)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTournaments(tournamentsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      setLoading(false)
    }
  }

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSport = !sportFilter || tournament.sport === sportFilter
    return matchesSearch && matchesSport
  })

  const getTournamentProgress = (tournament: Tournament) => {
    const completedMatches = tournament.matches.filter(m => m.status === 'completed').length
    const totalMatches = tournament.matches.length
    return totalMatches ? Math.round((completedMatches / totalMatches) * 100) : 0
  }

  const getLatestScore = (tournament: Tournament) => {
    const completedMatches = tournament.matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => 
        new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
      )
    
    if (completedMatches.length === 0) return null

    const latestMatch = completedMatches[0]
    const homeTeam = tournament.teams.find(t => t.id === latestMatch.home_team_id)
    const awayTeam = tournament.teams.find(t => t.id === latestMatch.away_team_id)

    return {
      home: {
        name: homeTeam?.name || 'Unknown',
        score: latestMatch.score.home
      },
      away: {
        name: awayTeam?.name || 'Unknown',
        score: latestMatch.score.away
      }
    }
  }

  const getUpcomingMatch = (tournament: Tournament) => {
    const upcomingMatches = tournament.matches
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => 
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      )
    
    if (upcomingMatches.length === 0) return null

    const nextMatch = upcomingMatches[0]
    const homeTeam = tournament.teams.find(t => t.id === nextMatch.home_team_id)
    const awayTeam = tournament.teams.find(t => t.id === nextMatch.away_team_id)

    return {
      date: nextMatch.match_date,
      home: homeTeam?.name || 'Unknown',
      away: awayTeam?.name || 'Unknown'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Tournaments</h1>
          <p className="text-gray-500">
            View all ongoing and upcoming tournaments
          </p>
        </div>
        <div className="flex gap-4">
          <Input
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sports</SelectItem>
              <SelectItem value="football">Football</SelectItem>
              <SelectItem value="basketball">Basketball</SelectItem>
              <SelectItem value="cricket">Cricket</SelectItem>
              <SelectItem value="volleyball">Volleyball</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => {
            const progress = getTournamentProgress(tournament)
            const latestScore = getLatestScore(tournament)
            const upcomingMatch = getUpcomingMatch(tournament)

            return (
              <Card
                key={tournament.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{tournament.name}</CardTitle>
                      <CardDescription>
                        {format(new Date(tournament.start_date), 'PPP')} -{' '}
                        {format(new Date(tournament.end_date), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge>{tournament.sport}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Teams: {tournament.teams.length}</span>
                      <span>
                        Matches: {tournament.matches.filter(m => m.status === 'completed').length}/{tournament.matches.length}
                      </span>
                      <span>Progress: {progress}%</span>
                    </div>

                    {latestScore && (
                      <div className="border rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Latest Result</div>
                        <div className="flex justify-between items-center">
                          <span>{latestScore.home.name}</span>
                          <span className="text-xl font-bold">
                            {latestScore.home.score} - {latestScore.away.score}
                          </span>
                          <span>{latestScore.away.name}</span>
                        </div>
                      </div>
                    )}

                    {upcomingMatch && (
                      <div className="border rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Next Match</div>
                        <div className="text-sm">
                          {upcomingMatch.home} vs {upcomingMatch.away}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(upcomingMatch.date), 'PPp')}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{tournament.format}</Badge>
                      <Badge
                        variant="outline"
                        className={
                          tournament.status === 'completed'
                            ? 'bg-green-50'
                            : tournament.status === 'in_progress'
                            ? 'bg-blue-50'
                            : 'bg-yellow-50'
                        }
                      >
                        {tournament.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Link to={`/tournaments/${tournament.id}`}>
                        <Button variant="outline">View</Button>
                      </Link>
                      {tournament.created_by === user?.id && (
                        <Link to={`/tournaments/${tournament.id}/manage`}>
                          <Button>Manage</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No tournaments found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
} 