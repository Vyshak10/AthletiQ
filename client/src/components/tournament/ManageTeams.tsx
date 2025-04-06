import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
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
  DialogTrigger,
} from '../ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'

interface Team {
  id: string
  name: string
  logo_url?: string
  manager_id?: string
}

interface Player {
  id: string
  team_id: string
  name: string
  jersey_number: number
  position: string
}

interface Props {
  tournament: {
    id: string
    sport: string
  }
  teams: Team[]
  players: Record<string, Player[]>
  onUpdate: () => void
}

export function ManageTeams({ tournament, teams, players, onUpdate }: Props) {
  const { toast } = useToast()
  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [newTeam, setNewTeam] = useState({ name: '', manager_name: '', manager_email: '' })
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    jersey_number: '',
    position: '',
    team_id: ''
  })

  const positions = getPositionsForSport(tournament.sport)

  const handleAddTeam = async () => {
    try {
      // First create the team
      const { data: teamData, error: teamError } = await supabase
        .from('tournament_teams')
        .insert([
          {
            tournament_id: tournament.id,
            name: newTeam.name,
          }
        ])
        .select()
        .single()

      if (teamError) throw teamError

      // Then create the manager if provided
      if (newTeam.manager_name && newTeam.manager_email) {
        const { error: managerError } = await supabase
          .from('team_managers')
          .insert([
            {
              team_id: teamData.id,
              name: newTeam.manager_name,
              email: newTeam.manager_email,
            }
          ])

        if (managerError) throw managerError
      }

      toast({
        title: 'Success',
        description: 'Team added successfully',
      })
      setIsAddingTeam(false)
      setNewTeam({ name: '', manager_name: '', manager_email: '' })
      onUpdate()
    } catch (error) {
      console.error('Error adding team:', error)
      toast({
        title: 'Error',
        description: 'Failed to add team',
        variant: 'destructive',
      })
    }
  }

  const handleAddPlayer = async () => {
    try {
      const { error } = await supabase
        .from('team_players')
        .insert([
          {
            team_id: newPlayer.team_id,
            name: newPlayer.name,
            jersey_number: parseInt(newPlayer.jersey_number),
            position: newPlayer.position,
          }
        ])

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Player added successfully',
      })
      setIsAddingPlayer(false)
      setNewPlayer({ name: '', jersey_number: '', position: '', team_id: '' })
      onUpdate()
    } catch (error) {
      console.error('Error adding player:', error)
      toast({
        title: 'Error',
        description: 'Failed to add player',
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
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Manage teams and their players
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddingTeam(true)}>Add Team</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{team.name}</CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTeam(team)
                        setIsAddingPlayer(true)
                        setNewPlayer(prev => ({ ...prev, team_id: team.id }))
                      }}
                    >
                      Add Player
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Number</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {players[team.id]?.map((player) => (
                          <TableRow key={player.id}>
                            <TableCell>{player.jersey_number}</TableCell>
                            <TableCell>{player.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {player.position}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Team Dialog */}
      <Dialog open={isAddingTeam} onOpenChange={setIsAddingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team</DialogTitle>
            <DialogDescription>
              Add a new team to the tournament
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="manager-name">Manager Name (Optional)</Label>
              <Input
                id="manager-name"
                value={newTeam.manager_name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, manager_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="manager-email">Manager Email (Optional)</Label>
              <Input
                id="manager-email"
                type="email"
                value={newTeam.manager_email}
                onChange={(e) => setNewTeam(prev => ({ ...prev, manager_email: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTeam(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeam}>Add Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Player Dialog */}
      <Dialog open={isAddingPlayer} onOpenChange={setIsAddingPlayer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player</DialogTitle>
            <DialogDescription>
              Add a new player to {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="jersey-number">Jersey Number</Label>
              <Input
                id="jersey-number"
                type="number"
                value={newPlayer.jersey_number}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, jersey_number: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <select
                id="position"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={newPlayer.position}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
              >
                <option value="">Select position...</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPlayer(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getPositionsForSport(sport: string): string[] {
  switch (sport.toLowerCase()) {
    case 'football':
      return [
        'Goalkeeper',
        'Defender',
        'Midfielder',
        'Forward'
      ]
    case 'cricket':
      return [
        'Batsman',
        'Bowler',
        'All-rounder',
        'Wicket-keeper'
      ]
    case 'basketball':
      return [
        'Point Guard',
        'Shooting Guard',
        'Small Forward',
        'Power Forward',
        'Center'
      ]
    case 'volleyball':
      return [
        'Setter',
        'Outside Hitter',
        'Opposite',
        'Middle Blocker',
        'Libero'
      ]
    default:
      return ['Player'] // Generic fallback
  }
} 