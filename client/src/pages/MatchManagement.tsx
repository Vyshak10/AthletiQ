import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'

interface Match {
  id: string
  tournament_id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  status: 'scheduled' | 'in_progress' | 'completed'
  start_time: string
}

export function MatchManagement() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [scores, setScores] = useState({ home: 0, away: 0 })

  useEffect(() => {
    fetchMatches()
  }, [id])

  const fetchMatches = async () => {
    try {
      // For testing, we'll create some dummy matches if none exist
      const { data: existingMatches, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', id)

      if (fetchError) throw fetchError

      if (!existingMatches || existingMatches.length === 0) {
        // Create dummy matches
        const dummyMatches = [
          {
            tournament_id: id,
            home_team: 'Team A',
            away_team: 'Team B',
            home_score: 0,
            away_score: 0,
            status: 'scheduled',
            start_time: new Date().toISOString()
          },
          {
            tournament_id: id,
            home_team: 'Team C',
            away_team: 'Team D',
            home_score: 0,
            away_score: 0,
            status: 'scheduled',
            start_time: new Date().toISOString()
          }
        ]

        const { data: newMatches, error: insertError } = await supabase
          .from('matches')
          .insert(dummyMatches)
          .select()

        if (insertError) throw insertError
        setMatches(newMatches || [])
      } else {
        setMatches(existingMatches)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch matches',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateScore = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          home_score: scores.home,
          away_score: scores.away,
          status: 'completed'
        })
        .eq('id', matchId)

      if (error) throw error

      // Update local state
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, home_score: scores.home, away_score: scores.away, status: 'completed' }
          : match
      ))

      toast({
        title: 'Success',
        description: 'Match scores updated successfully',
      })

      setSelectedMatch(null)
      setScores({ home: 0, away: 0 })
    } catch (error) {
      console.error('Error updating scores:', error)
      toast({
        title: 'Error',
        description: 'Failed to update match scores',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Match Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Home Team</TableHead>
                  <TableHead>Away Team</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.home_team}</TableCell>
                    <TableCell>{match.away_team}</TableCell>
                    <TableCell>
                      {match.status === 'completed' 
                        ? `${match.home_score} - ${match.away_score}`
                        : 'Not played'}
                    </TableCell>
                    <TableCell className="capitalize">{match.status}</TableCell>
                    <TableCell>
                      {match.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedMatch(match)
                            setScores({ home: 0, away: 0 })
                          }}
                        >
                          Update Score
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {selectedMatch && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium">Update Score</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeScore">{selectedMatch.home_team}</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    min="0"
                    value={scores.home}
                    onChange={(e) => setScores({ ...scores, home: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayScore">{selectedMatch.away_team}</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    min="0"
                    value={scores.away}
                    onChange={(e) => setScores({ ...scores, away: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleUpdateScore(selectedMatch.id)}>
                  Save Score
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMatch(null)
                    setScores({ home: 0, away: 0 })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 