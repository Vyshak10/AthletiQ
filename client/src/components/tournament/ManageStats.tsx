import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs'

interface Team {
  id: string
  name: string
}

interface Player {
  id: string
  team_id: string
  name: string
  jersey_number: number
  position: string
}

interface Match {
  id: string
  tournament_id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  status: string
  score: {
    home: number
    away: number
  }
  events: MatchEvent[]
}

interface MatchEvent {
  id: string
  match_id: string
  event_type: string
  minute: number
  team_id: string
  player_id: string
  additional_info?: any
}

interface Props {
  tournament: {
    id: string
    sport: string
  }
  teams: Team[]
  players: Record<string, Player[]>
  matches: Match[]
}

interface TeamStats {
  id: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

interface PlayerStats {
  id: string
  name: string
  team: string
  position: string
  matches: number
  goals: number
  assists: number
  [key: string]: any // For sport-specific stats
}

export function ManageStats({ tournament, teams, players, matches }: Props) {
  // Calculate team standings
  const standings = useMemo(() => {
    const stats: Record<string, TeamStats> = {}

    // Initialize team stats
    teams.forEach(team => {
      stats[team.id] = {
        id: team.id,
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }
    })

    // Calculate stats from completed matches
    matches
      .filter(match => match.status === 'completed')
      .forEach(match => {
        const homeStats = stats[match.home_team_id]
        const awayStats = stats[match.away_team_id]

        homeStats.played++
        awayStats.played++

        homeStats.goalsFor += match.score.home
        homeStats.goalsAgainst += match.score.away
        awayStats.goalsFor += match.score.away
        awayStats.goalsAgainst += match.score.home

        if (match.score.home > match.score.away) {
          homeStats.won++
          homeStats.points += 3
          awayStats.lost++
        } else if (match.score.home < match.score.away) {
          awayStats.won++
          awayStats.points += 3
          homeStats.lost++
        } else {
          homeStats.drawn++
          awayStats.drawn++
          homeStats.points++
          awayStats.points++
        }
      })

    // Calculate goal differences
    Object.values(stats).forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst
    })

    return Object.values(stats).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
  }, [teams, matches])

  // Calculate player statistics
  const playerStats = useMemo(() => {
    const stats: Record<string, PlayerStats> = {}

    // Initialize player stats
    teams.forEach(team => {
      players[team.id]?.forEach(player => {
        stats[player.id] = {
          id: player.id,
          name: player.name,
          team: team.name,
          position: player.position,
          matches: 0,
          goals: 0,
          assists: 0
        }
      })
    })

    // Calculate stats from match events
    matches
      .filter(match => match.status === 'completed')
      .forEach(match => {
        // Count appearances from lineups
        const lineups = match.events.filter(e => e.event_type === 'lineup')
        lineups.forEach(lineup => {
          if (stats[lineup.player_id]) {
            stats[lineup.player_id].matches++
          }
        })

        // Count goals and other stats
        match.events.forEach(event => {
          const player = stats[event.player_id]
          if (!player) return

          switch (event.event_type) {
            case 'goal':
            case 'penalty_scored':
              player.goals++
              break
            case 'assist':
              player.assists++
              break
            // Add more sport-specific stats here
          }
        })
      })

    return Object.values(stats)
  }, [teams, players, matches])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="players">Player Stats</TabsTrigger>
          <TabsTrigger value="teams">Team Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle>League Table</CardTitle>
              <CardDescription>Current tournament standings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pos</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>W</TableHead>
                    <TableHead>D</TableHead>
                    <TableHead>L</TableHead>
                    <TableHead>GF</TableHead>
                    <TableHead>GA</TableHead>
                    <TableHead>GD</TableHead>
                    <TableHead>Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((team, index) => (
                    <TableRow key={team.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.played}</TableCell>
                      <TableCell>{team.won}</TableCell>
                      <TableCell>{team.drawn}</TableCell>
                      <TableCell>{team.lost}</TableCell>
                      <TableCell>{team.goalsFor}</TableCell>
                      <TableCell>{team.goalsAgainst}</TableCell>
                      <TableCell>{team.goalDifference}</TableCell>
                      <TableCell className="font-bold">{team.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
              <CardDescription>Individual player performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Goals</TableHead>
                    <TableHead>Assists</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats
                    .sort((a, b) => b.goals - a.goals)
                    .map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell>{player.matches}</TableCell>
                        <TableCell>{player.goals}</TableCell>
                        <TableCell>{player.assists}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
              <CardDescription>Detailed team performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => {
                  const teamMatches = matches.filter(
                    m => m.home_team_id === team.id || m.away_team_id === team.id
                  )
                  const completedMatches = teamMatches.filter(m => m.status === 'completed')
                  const totalGoals = completedMatches.reduce((sum, match) => {
                    if (match.home_team_id === team.id) return sum + match.score.home
                    return sum + match.score.away
                  }, 0)

                  return (
                    <Card key={team.id}>
                      <CardHeader>
                        <CardTitle>{team.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm text-gray-500">Matches Played</dt>
                            <dd className="text-2xl font-bold">{completedMatches.length}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Total Goals</dt>
                            <dd className="text-2xl font-bold">{totalGoals}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Goals per Match</dt>
                            <dd className="text-2xl font-bold">
                              {completedMatches.length
                                ? (totalGoals / completedMatches.length).toFixed(2)
                                : '0.00'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Clean Sheets</dt>
                            <dd className="text-2xl font-bold">
                              {completedMatches.filter(match => {
                                if (match.home_team_id === team.id) return match.score.away === 0
                                return match.score.home === 0
                              }).length}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 