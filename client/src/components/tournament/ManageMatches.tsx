import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface Team {
  id: string
  name: string
}

interface Player {
  id: string
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
  venue: string
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
  onUpdate: () => void
}

export function ManageMatches({ tournament, teams, players, matches, onUpdate }: Props) {
  const { toast } = useToast()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isUpdatingScore, setIsUpdatingScore] = useState(false)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [isManagingLineup, setIsManagingLineup] = useState(false)
  const [newScore, setNewScore] = useState({ home: 0, away: 0 })
  const [newEvent, setNewEvent] = useState({
    event_type: '',
    minute: '',
    team_id: '',
    player_id: '',
    additional_info: {}
  })
  const [lineup, setLineup] = useState<{
    home: { player_id: string, is_starter: boolean }[]
    away: { player_id: string, is_starter: boolean }[]
  }>({
    home: [],
    away: []
  })

  const eventTypes = getEventTypesForSport(tournament.sport)

  const handleUpdateScore = async () => {
    if (!selectedMatch) return

    try {
      const { error } = await supabase
        .from('tournament_matches')
        .update({
          score: newScore,
          status: 'in_progress'
        })
        .eq('id', selectedMatch.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Score updated successfully',
      })
      setIsUpdatingScore(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating score:', error)
      toast({
        title: 'Error',
        description: 'Failed to update score',
        variant: 'destructive',
      })
    }
  }

  const handleAddEvent = async () => {
    if (!selectedMatch) return

    try {
      const { error } = await supabase
        .from('match_events')
        .insert([
          {
            match_id: selectedMatch.id,
            event_type: newEvent.event_type,
            minute: parseInt(newEvent.minute),
            team_id: newEvent.team_id,
            player_id: newEvent.player_id,
            additional_info: newEvent.additional_info
          }
        ])

      if (error) throw error

      // Update score based on event type if needed
      if (newEvent.event_type === 'goal' || newEvent.event_type === 'try') {
        const isHomeTeam = newEvent.team_id === selectedMatch.home_team_id
        const updatedScore = {
          home: selectedMatch.score.home + (isHomeTeam ? 1 : 0),
          away: selectedMatch.score.away + (isHomeTeam ? 0 : 1)
        }

        const { error: scoreError } = await supabase
          .from('tournament_matches')
          .update({ score: updatedScore })
          .eq('id', selectedMatch.id)

        if (scoreError) throw scoreError
      }

      toast({
        title: 'Success',
        description: 'Event added successfully',
      })
      setIsAddingEvent(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding event:', error)
      toast({
        title: 'Error',
        description: 'Failed to add event',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateLineup = async () => {
    if (!selectedMatch) return

    try {
      // Delete existing lineup
      await supabase
        .from('match_lineups')
        .delete()
        .eq('match_id', selectedMatch.id)

      // Insert new lineup
      const lineupEntries = [
        ...lineup.home.map(entry => ({
          match_id: selectedMatch.id,
          team_id: selectedMatch.home_team_id,
          player_id: entry.player_id,
          is_starter: entry.is_starter
        })),
        ...lineup.away.map(entry => ({
          match_id: selectedMatch.id,
          team_id: selectedMatch.away_team_id,
          player_id: entry.player_id,
          is_starter: entry.is_starter
        }))
      ]

      const { error } = await supabase
        .from('match_lineups')
        .insert(lineupEntries)

      if (error) throw error

      // Update match status
      const { error: statusError } = await supabase
        .from('tournament_matches')
        .update({ status: 'lineup_submitted' })
        .eq('id', selectedMatch.id)

      if (statusError) throw statusError

      toast({
        title: 'Success',
        description: 'Lineup updated successfully',
      })
      setIsManagingLineup(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating lineup:', error)
      toast({
        title: 'Error',
        description: 'Failed to update lineup',
        variant: 'destructive',
      })
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

  return (
    <div className="space-y-6">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {teams.find(t => t.id === match.home_team_id)?.name} vs{' '}
                  {teams.find(t => t.id === match.away_team_id)?.name}
                </CardTitle>
                <CardDescription>
                  {new Date(match.match_date).toLocaleString()}
                  {match.venue && ` • ${match.venue}`}
                </CardDescription>
              </div>
              <Badge className={getMatchStatusColor(match.status)}>
                {match.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-2xl font-bold">{match.score.home}</p>
                <p className="text-sm text-gray-500">Home</p>
              </div>
              <div className="flex gap-2">
                {match.status === 'scheduled' && (
                  <Button
                    onClick={() => {
                      setSelectedMatch(match)
                      setIsManagingLineup(true)
                      setLineup({
                        home: players[match.home_team_id]?.map(p => ({
                          player_id: p.id,
                          is_starter: false
                        })) || [],
                        away: players[match.away_team_id]?.map(p => ({
                          player_id: p.id,
                          is_starter: false
                        })) || []
                      })
                    }}
                  >
                    Set Lineup
                  </Button>
                )}
                {(match.status === 'lineup_submitted' || match.status === 'in_progress') && (
                  <>
                    <Button
                      onClick={() => {
                        setSelectedMatch(match)
                        setIsUpdatingScore(true)
                        setNewScore(match.score)
                      }}
                    >
                      Update Score
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedMatch(match)
                        setIsAddingEvent(true)
                        setNewEvent({
                          event_type: '',
                          minute: '',
                          team_id: '',
                          player_id: '',
                          additional_info: {}
                        })
                      }}
                    >
                      Add Event
                    </Button>
                  </>
                )}
              </div>
              <div className="text-center flex-1">
                <p className="text-2xl font-bold">{match.score.away}</p>
                <p className="text-sm text-gray-500">Away</p>
              </div>
            </div>

            {/* Match Events */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Match Events</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {match.events
                    ?.sort((a, b) => a.minute - b.minute)
                    .map((event) => {
                      const team = teams.find(t => t.id === event.team_id)
                      const player = players[event.team_id]?.find(p => p.id === event.player_id)
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium">{event.minute}'</span>
                          <Badge variant="outline">{event.event_type}</Badge>
                          <span>{player?.name}</span>
                          <span className="text-sm text-gray-500">({team?.name})</span>
                        </div>
                      )
                    })}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Update Score Dialog */}
      <Dialog open={isUpdatingScore} onOpenChange={setIsUpdatingScore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Score</DialogTitle>
            <DialogDescription>
              Update the match score
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Home Score</Label>
              <Input
                type="number"
                value={newScore.home}
                onChange={(e) => setNewScore(prev => ({
                  ...prev,
                  home: parseInt(e.target.value) || 0
                }))}
              />
            </div>
            <div>
              <Label>Away Score</Label>
              <Input
                type="number"
                value={newScore.away}
                onChange={(e) => setNewScore(prev => ({
                  ...prev,
                  away: parseInt(e.target.value) || 0
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdatingScore(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateScore}>Update Score</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Match Event</DialogTitle>
            <DialogDescription>
              Record a new event in the match
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Type</Label>
              <Select
                value={newEvent.event_type}
                onValueChange={(value) => setNewEvent(prev => ({
                  ...prev,
                  event_type: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minute</Label>
              <Input
                type="number"
                value={newEvent.minute}
                onChange={(e) => setNewEvent(prev => ({
                  ...prev,
                  minute: e.target.value
                }))}
              />
            </div>
            <div>
              <Label>Team</Label>
              <Select
                value={newEvent.team_id}
                onValueChange={(value) => setNewEvent(prev => ({
                  ...prev,
                  team_id: value,
                  player_id: '' // Reset player when team changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMatch && [
                    <SelectItem key="home" value={selectedMatch.home_team_id}>
                      {teams.find(t => t.id === selectedMatch.home_team_id)?.name}
                    </SelectItem>,
                    <SelectItem key="away" value={selectedMatch.away_team_id}>
                      {teams.find(t => t.id === selectedMatch.away_team_id)?.name}
                    </SelectItem>
                  ]}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Player</Label>
              <Select
                value={newEvent.player_id}
                onValueChange={(value) => setNewEvent(prev => ({
                  ...prev,
                  player_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {newEvent.team_id && players[newEvent.team_id]?.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} (#{player.jersey_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Lineup Dialog */}
      <Dialog open={isManagingLineup} onOpenChange={setIsManagingLineup}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Lineup</DialogTitle>
            <DialogDescription>
              Select the starting lineup and substitutes
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-8">
            {selectedMatch && (
              <>
                <div>
                  <h4 className="font-medium mb-2">
                    {teams.find(t => t.id === selectedMatch.home_team_id)?.name}
                  </h4>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {players[selectedMatch.home_team_id]?.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {player.name} (#{player.jersey_number})
                            </p>
                            <p className="text-sm text-gray-500">{player.position}</p>
                          </div>
                          <Select
                            value={
                              lineup.home.find(p => p.player_id === player.id)?.is_starter
                                ? 'starter'
                                : 'sub'
                            }
                            onValueChange={(value) => {
                              setLineup(prev => ({
                                ...prev,
                                home: prev.home.map(p =>
                                  p.player_id === player.id
                                    ? { ...p, is_starter: value === 'starter' }
                                    : p
                                )
                              }))
                            }}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="sub">Sub</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    {teams.find(t => t.id === selectedMatch.away_team_id)?.name}
                  </h4>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {players[selectedMatch.away_team_id]?.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {player.name} (#{player.jersey_number})
                            </p>
                            <p className="text-sm text-gray-500">{player.position}</p>
                          </div>
                          <Select
                            value={
                              lineup.away.find(p => p.player_id === player.id)?.is_starter
                                ? 'starter'
                                : 'sub'
                            }
                            onValueChange={(value) => {
                              setLineup(prev => ({
                                ...prev,
                                away: prev.away.map(p =>
                                  p.player_id === player.id
                                    ? { ...p, is_starter: value === 'starter' }
                                    : p
                                )
                              }))
                            }}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="sub">Sub</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagingLineup(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLineup}>Update Lineup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getEventTypesForSport(sport: string): string[] {
  switch (sport.toLowerCase()) {
    case 'football':
      return [
        'goal',
        'assist',
        'yellow_card',
        'red_card',
        'substitution',
        'penalty_scored',
        'penalty_missed',
        'own_goal'
      ]
    case 'cricket':
      return [
        'runs',
        'wicket',
        'wide',
        'no_ball',
        'boundary_four',
        'boundary_six',
        'catch',
        'run_out'
      ]
    case 'basketball':
      return [
        'two_points',
        'three_points',
        'free_throw',
        'rebound',
        'assist',
        'block',
        'steal',
        'foul'
      ]
    case 'volleyball':
      return [
        'point',
        'serve_ace',
        'block',
        'spike',
        'dig',
        'assist',
        'service_error'
      ]
    default:
      return ['score'] // Generic fallback
  }
} 