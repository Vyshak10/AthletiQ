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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { format } from 'date-fns'

interface Team {
  id: string
  name: string
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
}

interface Props {
  tournament: {
    id: string
    sport: string
    created_by: string
  }
  teams: Team[]
  matches: Match[]
  onUpdate: () => void
}

export function ManageSchedule({ tournament, teams, matches, onUpdate }: Props) {
  const { toast } = useToast()
  const [isAddingMatch, setIsAddingMatch] = useState(false)
  const [isEditingMatch, setIsEditingMatch] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [newMatch, setNewMatch] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    venue: '',
    status: 'scheduled'
  })

  const handleAddMatch = async () => {
    try {
      const { error } = await supabase
        .from('tournament_matches')
        .insert([
          {
            tournament_id: tournament.id,
            home_team_id: newMatch.home_team_id,
            away_team_id: newMatch.away_team_id,
            match_date: newMatch.match_date,
            venue: newMatch.venue,
            status: newMatch.status,
            score: { home: 0, away: 0 }
          }
        ])

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Match scheduled successfully',
      })
      setIsAddingMatch(false)
      setNewMatch({
        home_team_id: '',
        away_team_id: '',
        match_date: '',
        venue: '',
        status: 'scheduled'
      })
      onUpdate()
    } catch (error) {
      console.error('Error scheduling match:', error)
      toast({
        title: 'Error',
        description: 'Failed to schedule match',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateMatch = async () => {
    if (!selectedMatch) return

    try {
      const { error } = await supabase
        .from('tournament_matches')
        .update({
          home_team_id: newMatch.home_team_id,
          away_team_id: newMatch.away_team_id,
          match_date: newMatch.match_date,
          venue: newMatch.venue,
          status: newMatch.status
        })
        .eq('id', selectedMatch.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Match updated successfully',
      })
      setIsEditingMatch(false)
      setSelectedMatch(null)
      onUpdate()
    } catch (error) {
      console.error('Error updating match:', error)
      toast({
        title: 'Error',
        description: 'Failed to update match',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('tournament_matches')
        .delete()
        .eq('id', matchId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Match deleted successfully',
      })
      onUpdate()
    } catch (error) {
      console.error('Error deleting match:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete match',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Match Schedule</CardTitle>
              <CardDescription>
                Schedule and manage tournament matches
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddingMatch(true)}>Schedule Match</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches
              .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
              .map((match) => (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>
                          {teams.find(t => t.id === match.home_team_id)?.name} vs{' '}
                          {teams.find(t => t.id === match.away_team_id)?.name}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(match.match_date), 'PPpp')}
                          {match.venue && ` • ${match.venue}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedMatch(match)
                            setNewMatch({
                              home_team_id: match.home_team_id,
                              away_team_id: match.away_team_id,
                              match_date: match.match_date,
                              venue: match.venue,
                              status: match.status
                            })
                            setIsEditingMatch(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteMatch(match.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Match Dialog */}
      <Dialog open={isAddingMatch} onOpenChange={setIsAddingMatch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Match</DialogTitle>
            <DialogDescription>
              Schedule a new match in the tournament
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Home Team</Label>
              <Select
                value={newMatch.home_team_id}
                onValueChange={(value) => setNewMatch(prev => ({
                  ...prev,
                  home_team_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      disabled={team.id === newMatch.away_team_id}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Away Team</Label>
              <Select
                value={newMatch.away_team_id}
                onValueChange={(value) => setNewMatch(prev => ({
                  ...prev,
                  away_team_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      disabled={team.id === newMatch.home_team_id}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Match Date & Time</Label>
              <Input
                type="datetime-local"
                value={newMatch.match_date}
                onChange={(e) => setNewMatch(prev => ({
                  ...prev,
                  match_date: e.target.value
                }))}
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={newMatch.venue}
                onChange={(e) => setNewMatch(prev => ({
                  ...prev,
                  venue: e.target.value
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingMatch(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMatch}>Schedule Match</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog open={isEditingMatch} onOpenChange={setIsEditingMatch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
            <DialogDescription>
              Update match details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Home Team</Label>
              <Select
                value={newMatch.home_team_id}
                onValueChange={(value) => setNewMatch(prev => ({
                  ...prev,
                  home_team_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      disabled={team.id === newMatch.away_team_id}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Away Team</Label>
              <Select
                value={newMatch.away_team_id}
                onValueChange={(value) => setNewMatch(prev => ({
                  ...prev,
                  away_team_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      disabled={team.id === newMatch.home_team_id}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Match Date & Time</Label>
              <Input
                type="datetime-local"
                value={newMatch.match_date}
                onChange={(e) => setNewMatch(prev => ({
                  ...prev,
                  match_date: e.target.value
                }))}
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={newMatch.venue}
                onChange={(e) => setNewMatch(prev => ({
                  ...prev,
                  venue: e.target.value
                }))}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newMatch.status}
                onValueChange={(value) => setNewMatch(prev => ({
                  ...prev,
                  status: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingMatch(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMatch}>Update Match</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 