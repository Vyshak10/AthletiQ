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

interface Team {
  id: number
  name: string
  players: Player[]
}

interface Player {
  id: number
  name: string
  position: string
  jerseyNumber: number
}

interface Tournament {
  id: number
  name: string
  createdBy: number
}

export function TeamManagement() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    jerseyNumber: ''
  })

  useEffect(() => {
    fetchTournamentAndTeams()
  }, [id])

  const fetchTournamentAndTeams = async () => {
    try {
      const [tournamentRes, teamsRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/teams`)
      ])

      if (!tournamentRes.ok || !teamsRes.ok) {
        throw new Error('Failed to fetch tournament or teams')
      }

      const [tournamentData, teamsData] = await Promise.all([
        tournamentRes.json(),
        teamsRes.json()
      ])

      setTournament(tournamentData)
      setTeams(teamsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament or team data.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeam = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlayer.name // Using the name field for team name
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add team')
      }

      toast({
        title: 'Success',
        description: 'Team added successfully!',
      })

      // Refresh teams after adding
      const teamsRes = await fetch(`/api/tournaments/${id}/teams`)
      if (!teamsRes.ok) throw new Error('Failed to fetch updated teams')
      const teamsData = await teamsRes.json()
      setTeams(teamsData)
      setNewPlayer({ name: '', position: '', jerseyNumber: '' })
    } catch (error) {
      console.error('Error adding team:', error)
      toast({
        title: 'Error',
        description: 'Failed to add team. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAddPlayer = async (teamId: number) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlayer.name,
          position: newPlayer.position,
          jerseyNumber: parseInt(newPlayer.jerseyNumber)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add player')
      }

      toast({
        title: 'Success',
        description: 'Player added successfully!',
      })

      // Refresh teams after adding player
      const teamsRes = await fetch(`/api/tournaments/${id}/teams`)
      if (!teamsRes.ok) throw new Error('Failed to fetch updated teams')
      const teamsData = await teamsRes.json()
      setTeams(teamsData)
      setNewPlayer({ name: '', position: '', jerseyNumber: '' })
    } catch (error) {
      console.error('Error adding player:', error)
      toast({
        title: 'Error',
        description: 'Failed to add player. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRemovePlayer = async (teamId: number, playerId: number) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove player')
      }

      toast({
        title: 'Success',
        description: 'Player removed successfully!',
      })

      // Refresh teams after removing player
      const teamsRes = await fetch(`/api/tournaments/${id}/teams`)
      if (!teamsRes.ok) throw new Error('Failed to fetch updated teams')
      const teamsData = await teamsRes.json()
      setTeams(teamsData)
    } catch (error) {
      console.error('Error removing player:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove player. Please try again.',
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
            <p className="text-center">You do not have permission to manage teams for this tournament.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Team Management - {tournament.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Add Team Form */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold mb-4">Add New Team</h3>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                  />
                </div>
                <Button onClick={handleAddTeam} className="mt-6">
                  Add Team
                </Button>
              </div>
            </div>

            {/* Teams List */}
            {teams.map((team) => (
              <div key={team.id} className="border rounded p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{team.name}</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTeam(team)}
                      >
                        Add Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Player to {team.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="playerName">Player Name</Label>
                          <Input
                            id="playerName"
                            value={newPlayer.name}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter player name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Select
                            value={newPlayer.position}
                            onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="forward">Forward</SelectItem>
                              <SelectItem value="midfielder">Midfielder</SelectItem>
                              <SelectItem value="defender">Defender</SelectItem>
                              <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jerseyNumber">Jersey Number</Label>
                          <Input
                            id="jerseyNumber"
                            type="number"
                            value={newPlayer.jerseyNumber}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                            placeholder="Enter jersey number"
                          />
                        </div>
                        <Button
                          onClick={() => handleAddPlayer(team.id)}
                          className="w-full"
                        >
                          Add Player
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Players List */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {team.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{player.jerseyNumber}</span>
                        <span>{player.name}</span>
                        <span className="text-sm text-muted-foreground">({player.position})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlayer(team.id, player.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 