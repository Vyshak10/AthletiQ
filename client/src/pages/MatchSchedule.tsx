import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  date: string
  status: string
}

interface Team {
  id: number
  name: string
}

interface Tournament {
  id: number
  name: string
  createdBy: number
}

export function MatchSchedule() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [newMatch, setNewMatch] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: ''
  })

  useEffect(() => {
    fetchTournamentData()
  }, [id])

  const fetchTournamentData = async () => {
    try {
      const [tournamentRes, teamsRes, matchesRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/teams`),
        fetch(`/api/tournaments/${id}/matches`)
      ])

      if (!tournamentRes.ok || !teamsRes.ok || !matchesRes.ok) {
        throw new Error('Failed to fetch tournament data')
      }

      const [tournamentData, teamsData, matchesData] = await Promise.all([
        tournamentRes.json(),
        teamsRes.json(),
        matchesRes.json()
      ])

      setTournament(tournamentData)
      setTeams(teamsData)
      setMatches(matchesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament data.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMatch = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeamId: parseInt(newMatch.homeTeamId),
          awayTeamId: parseInt(newMatch.awayTeamId),
          date: newMatch.date
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add match')
      }

      toast({
        title: 'Success',
        description: 'Match scheduled successfully!',
      })

      // Refresh matches after adding
      const matchesRes = await fetch(`/api/tournaments/${id}/matches`)
      if (!matchesRes.ok) throw new Error('Failed to fetch updated matches')
      const matchesData = await matchesRes.json()
      setMatches(matchesData)
      setNewMatch({ homeTeamId: '', awayTeamId: '', date: '' })
    } catch (error) {
      console.error('Error adding match:', error)
      toast({
        title: 'Error',
        description: 'Failed to schedule match. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteMatch = async (matchId: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete match')
      }

      toast({
        title: 'Success',
        description: 'Match deleted successfully!',
      })

      // Refresh matches after deleting
      const matchesRes = await fetch(`/api/tournaments/${id}/matches`)
      if (!matchesRes.ok) throw new Error('Failed to fetch updated matches')
      const matchesData = await matchesRes.json()
      setMatches(matchesData)
    } catch (error) {
      console.error('Error deleting match:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete match. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <div>Loading...</div>
  if (!tournament) return <div>Tournament not found</div>
  if (tournament.createdBy !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">You do not have permission to manage match schedules for this tournament.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Match Schedule - {tournament.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Add Match Form */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold mb-4">Schedule New Match</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeTeam">Home Team</Label>
                  <Select
                    value={newMatch.homeTeamId}
                    onValueChange={(value) => setNewMatch(prev => ({ ...prev, homeTeamId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayTeam">Away Team</Label>
                  <Select
                    value={newMatch.awayTeamId}
                    onValueChange={(value) => setNewMatch(prev => ({ ...prev, awayTeamId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Match Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleAddMatch} className="mt-4">
                Schedule Match
              </Button>
            </div>

            {/* Matches List */}
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="flex justify-between items-center p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{match.homeTeam}</span>
                      <span className="mx-4">vs</span>
                      <span className="font-medium">{match.awayTeam}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {new Date(match.date).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteMatch(match.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 