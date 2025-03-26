import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  date: string
}

interface Tournament {
  id: number
  name: string
  createdBy: number
}

export function MatchManagement() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [scoreUpdate, setScoreUpdate] = useState({
    homeScore: 0,
    awayScore: 0
  })

  useEffect(() => {
    fetchTournamentAndMatches()
  }, [id])

  const fetchTournamentAndMatches = async () => {
    try {
      const [tournamentRes, matchesRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/matches`)
      ])

      if (!tournamentRes.ok || !matchesRes.ok) {
        throw new Error('Failed to fetch tournament or matches')
      }

      const [tournamentData, matchesData] = await Promise.all([
        tournamentRes.json(),
        matchesRes.json()
      ])

      setTournament(tournamentData)
      setMatches(matchesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament or match data.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateScore = async (matchId: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreUpdate),
      })

      if (!response.ok) {
        throw new Error('Failed to update score')
      }

      toast({
        title: 'Success',
        description: 'Score updated successfully!',
      })

      // Refresh matches after update
      const matchesRes = await fetch(`/api/tournaments/${id}/matches`)
      if (!matchesRes.ok) throw new Error('Failed to fetch updated matches')
      const matchesData = await matchesRes.json()
      setMatches(matchesData)
      setSelectedMatch(null)
    } catch (error) {
      console.error('Error updating score:', error)
      toast({
        title: 'Error',
        description: 'Failed to update score. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleStartMatch = async (matchId: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/start`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to start match')
      }

      toast({
        title: 'Success',
        description: 'Match started successfully!',
      })

      // Refresh matches after update
      const matchesRes = await fetch(`/api/tournaments/${id}/matches`)
      if (!matchesRes.ok) throw new Error('Failed to fetch updated matches')
      const matchesData = await matchesRes.json()
      setMatches(matchesData)
    } catch (error) {
      console.error('Error starting match:', error)
      toast({
        title: 'Error',
        description: 'Failed to start match. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleEndMatch = async (matchId: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/end`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to end match')
      }

      toast({
        title: 'Success',
        description: 'Match ended successfully!',
      })

      // Refresh matches after update
      const matchesRes = await fetch(`/api/tournaments/${id}/matches`)
      if (!matchesRes.ok) throw new Error('Failed to fetch updated matches')
      const matchesData = await matchesRes.json()
      setMatches(matchesData)
    } catch (error) {
      console.error('Error ending match:', error)
      toast({
        title: 'Error',
        description: 'Failed to end match. Please try again.',
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
            <p className="text-center">You do not have permission to manage matches for this tournament.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Match Management - {tournament.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {matches.map((match) => (
              <div key={match.id} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{match.homeTeam}</span>
                      <span className="mx-4">
                        {match.homeScore} - {match.awayScore}
                      </span>
                      <span className="font-medium">{match.awayTeam}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {new Date(match.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {match.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        onClick={() => handleStartMatch(match.id)}
                      >
                        Start Match
                      </Button>
                    )}
                    {match.status === 'in_progress' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedMatch(match)
                                setScoreUpdate({
                                  homeScore: match.homeScore,
                                  awayScore: match.awayScore
                                })
                              }}
                            >
                              Update Score
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Score</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="homeScore">{match.homeTeam} Score</Label>
                                <Input
                                  id="homeScore"
                                  type="number"
                                  value={scoreUpdate.homeScore}
                                  onChange={(e) => setScoreUpdate(prev => ({
                                    ...prev,
                                    homeScore: parseInt(e.target.value)
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="awayScore">{match.awayTeam} Score</Label>
                                <Input
                                  id="awayScore"
                                  type="number"
                                  value={scoreUpdate.awayScore}
                                  onChange={(e) => setScoreUpdate(prev => ({
                                    ...prev,
                                    awayScore: parseInt(e.target.value)
                                  }))}
                                />
                              </div>
                              <Button
                                onClick={() => handleUpdateScore(match.id)}
                                className="w-full"
                              >
                                Save Score
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          onClick={() => handleEndMatch(match.id)}
                        >
                          End Match
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 