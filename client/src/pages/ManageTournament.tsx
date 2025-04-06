import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { ScrollArea } from '../components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'

interface Tournament {
  id: string
  name: string
  sport: string
  format: string
  start_date: string
  end_date: string
  status: string
  description: string
  created_by: string
  rules: any
  sport_settings: any
}

interface Team {
  id: string
  name: string
  logo_url?: string
  manager_id?: string
  manager_name?: string
  manager_email?: string
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

export function ManageTournament() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Record<string, Player[]>>({})
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false)
  const [updateData, setUpdateData] = useState<Partial<Tournament>>({})
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    managerName: '',
    managerEmail: ''
  })
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({})
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false)
  const [isUpdateScoreDialogOpen, setIsUpdateScoreDialogOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [newScoreData, setNewScoreData] = useState({
    home: 0,
    away: 0
  })
  const [newPlayerData, setNewPlayerData] = useState({
    name: '',
    jerseyNumber: '',
    position: ''
  })

  // Set initial tab based on URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash && ['teams', 'matches', 'schedule', 'stats'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [location])

  // Update URL hash when tab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      window.location.hash = activeTab
    } else {
      window.location.hash = ''
    }
  }, [activeTab])

  useEffect(() => {
    if (!id || !user) {
      navigate('/tournaments')
      return
    }

    const fetchTournamentData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch tournament data
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single()

        if (tournamentError) throw tournamentError
        if (!tournamentData) {
          setError('Tournament not found')
          return
        }

        setTournament(tournamentData)
        await Promise.all([fetchTeams(), fetchMatches()])
      } catch (error) {
        console.error('Error fetching tournament data:', error)
        setError('Failed to load tournament data')
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentData()

    // Subscribe to real-time updates
    const tournamentSubscription = supabase
      .channel(`tournament-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTournament(prev => ({ ...prev, ...payload.new } as Tournament))
          }
        }
      )
      .subscribe()

    const teamsSubscription = supabase
      .channel(`tournament-teams-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_teams',
          filter: `tournament_id=eq.${id}`,
        },
        () => {
          fetchTeams()
        }
      )
      .subscribe()

    const playersSubscription = supabase
      .channel(`tournament-players-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_players',
        },
        () => {
          fetchTeams() // This will also update players
        }
      )
      .subscribe()

    const matchesSubscription = supabase
      .channel(`tournament-matches-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches',
          filter: `tournament_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMatches(prev => prev.map(match => 
              match.id === payload.new.id ? { ...match, ...payload.new } as Match : match
            ))
          } else {
            fetchMatches()
          }
        }
      )
      .subscribe()

    return () => {
      tournamentSubscription.unsubscribe()
      teamsSubscription.unsubscribe()
      playersSubscription.unsubscribe()
      matchesSubscription.unsubscribe()
    }
  }, [id, user, navigate])

  const fetchTeams = async () => {
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('tournament_teams')
        .select('*')
        .eq('tournament_id', id)

      if (teamsError) throw teamsError
      setTeams(teamsData || [])

      // Fetch players for each team
      const playersPromises = teamsData?.map(team =>
        supabase
          .from('team_players')
          .select('*')
          .eq('team_id', team.id)
      ) || []

      const playersResults = await Promise.all(playersPromises)
      const playersMap = playersResults.reduce((acc, result, index) => {
        if (!result.error && teamsData) {
          acc[teamsData[index].id] = result.data
        }
        return acc
      }, {} as Record<string, Player[]>)

      setPlayers(playersMap)
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: 'Error',
        description: 'Failed to load teams',
        variant: 'destructive',
      })
    }
  }

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', id)
        .order('match_date', { ascending: true })

      if (matchesError) throw matchesError
      setMatches(matchesData || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast({
        title: 'Error',
        description: 'Failed to load matches',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateTournament = async () => {
    if (!tournament || !user) return

    try {
      const { error } = await supabase
        .from('tournaments')
        .update(updateData)
        .eq('id', tournament.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Tournament updated successfully',
      })
      setIsUpdateDialogOpen(false)
      setUpdateData({})
    } catch (error) {
      console.error('Error updating tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to update tournament',
        variant: 'destructive',
      })
    }
  }

  const handleAddTeam = async () => {
    if (!tournament || !newTeamData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('tournament_teams')
        .insert([
          {
            tournament_id: tournament.id,
            name: newTeamData.name.trim(),
            manager_name: newTeamData.managerName.trim() || null,
            manager_email: newTeamData.managerEmail.trim() || null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Team added successfully',
      })
      setIsAddTeamDialogOpen(false)
      setNewTeamData({ name: '', managerName: '', managerEmail: '' })
      fetchTeams()
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
    if (!selectedTeam || !newPlayerData.name.trim() || !newPlayerData.jerseyNumber || !newPlayerData.position.trim()) {
      toast({
        title: 'Error',
        description: 'All player fields are required',
        variant: 'destructive',
      })
      return
    }

    try {
      const { error } = await supabase
        .from('team_players')
        .insert([
          {
            team_id: selectedTeam.id,
            name: newPlayerData.name.trim(),
            jersey_number: parseInt(newPlayerData.jerseyNumber),
            position: newPlayerData.position.trim(),
          },
        ])

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Player added successfully',
      })
      setIsAddPlayerDialogOpen(false)
      setNewPlayerData({ name: '', jerseyNumber: '', position: '' })
      fetchTeams()
    } catch (error) {
      console.error('Error adding player:', error)
      toast({
        title: 'Error',
        description: 'Failed to add player',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateMatchScore = async () => {
    if (!selectedMatch) return

    try {
      const { error } = await supabase
        .from('tournament_matches')
        .update({ 
          score: newScoreData,
          status: 'completed'
        })
        .eq('id', selectedMatch.id)

      if (error) throw error

      setMatches(prev => prev.map(match => 
        match.id === selectedMatch.id 
          ? { ...match, score: newScoreData, status: 'completed' }
          : match
      ))

      toast({
        title: 'Success',
        description: 'Score updated successfully',
      })
      setIsUpdateScoreDialogOpen(false)
      setSelectedMatch(null)
      setNewScoreData({ home: 0, away: 0 })
    } catch (error) {
      console.error('Error updating score:', error)
      toast({
        title: 'Error',
        description: 'Failed to update score',
        variant: 'destructive',
      })
      fetchMatches()
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{error}</p>
          <Button onClick={() => navigate('/tournaments')}>
            Back to Tournaments
          </Button>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return null
  }

  // Check if the user is the tournament creator
  const isCreator = tournament.created_by === user?.id

  if (!isCreator) {
    navigate(`/tournaments/${id}`)
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/tournaments')}
        >
          ← Back to Tournaments
        </Button>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/tournaments/${id}`)}
          >
            View Tournament
          </Button>
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Update Tournament</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Tournament</DialogTitle>
                <DialogDescription>
                  Make changes to your tournament here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={updateData.name || tournament.name || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={updateData.description || tournament.description || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={updateData.status || tournament.status || 'draft'}
                    onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={updateData.start_date || tournament.start_date || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_date" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={updateData.end_date || tournament.end_date || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleUpdateTournament}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{tournament.name}</CardTitle>
              <CardDescription className="text-lg capitalize">
                {tournament.sport} • {tournament.format}
              </CardDescription>
              <p className="mt-2 text-muted-foreground">{tournament.description}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
              </div>
            </div>
            <Badge className={getStatusColor(tournament.status)}>
              {tournament.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Teams</CardTitle>
                  <CardDescription>Manage tournament teams and players</CardDescription>
                </div>
                <Button onClick={() => setIsAddTeamDialogOpen(true)}>
                  Add Team
                </Button>
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
                            setIsAddPlayerDialogOpen(true)
                          }}
                        >
                          Add Player
                        </Button>
                      </div>
                      {team.manager_name && (
                        <CardDescription>
                          Manager: {team.manager_name} ({team.manager_email})
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {players[team.id]?.map((player) => (
                          <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-muted-foreground">
                                #{player.jersey_number} • {player.position}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Team Dialog */}
          <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Team</DialogTitle>
                <DialogDescription>
                  Enter the team details below. Only team name is required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={newTeamData.name}
                    onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerName">Manager Name (Optional)</Label>
                  <Input
                    id="managerName"
                    value={newTeamData.managerName}
                    onChange={(e) => setNewTeamData(prev => ({ ...prev, managerName: e.target.value }))}
                    placeholder="Enter manager name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerEmail">Manager Email (Optional)</Label>
                  <Input
                    id="managerEmail"
                    type="email"
                    value={newTeamData.managerEmail}
                    onChange={(e) => setNewTeamData(prev => ({ ...prev, managerEmail: e.target.value }))}
                    placeholder="Enter manager email"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddTeamDialogOpen(false)
                  setNewTeamData({ name: '', managerName: '', managerEmail: '' })
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddTeam}>
                  Add Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Player Dialog */}
          <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
                <DialogDescription>
                  Enter the player details for {selectedTeam?.name}. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name *</Label>
                  <Input
                    id="playerName"
                    value={newPlayerData.name}
                    onChange={(e) => setNewPlayerData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter player name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jerseyNumber">Jersey Number *</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    value={newPlayerData.jerseyNumber}
                    onChange={(e) => setNewPlayerData(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                    placeholder="Enter jersey number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={newPlayerData.position}
                    onChange={(e) => setNewPlayerData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Enter player position"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddPlayerDialogOpen(false)
                  setNewPlayerData({ name: '', jerseyNumber: '', position: '' })
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddPlayer}>
                  Add Player
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Matches</CardTitle>
              <CardDescription>Manage tournament matches and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
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
                              {new Date(match.match_date).toLocaleString()} • {match.venue}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(match.status)}>
                            {match.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{match.score.home}</p>
                            <p className="text-sm text-muted-foreground">Home</p>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedMatch(match)
                              setNewScoreData(match.score)
                              setIsUpdateScoreDialogOpen(true)
                            }}
                          >
                            Update Score
                          </Button>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{match.score.away}</p>
                            <p className="text-sm text-muted-foreground">Away</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Update Score Dialog */}
          <Dialog open={isUpdateScoreDialogOpen} onOpenChange={setIsUpdateScoreDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Match Score</DialogTitle>
                <DialogDescription>
                  Enter the final score for {teams.find(t => t.id === selectedMatch?.home_team_id)?.name} vs {teams.find(t => t.id === selectedMatch?.away_team_id)?.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeScore">Home Score</Label>
                    <Input
                      id="homeScore"
                      type="number"
                      min="0"
                      value={newScoreData.home}
                      onChange={(e) => setNewScoreData(prev => ({ ...prev, home: parseInt(e.target.value) || 0 }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      {teams.find(t => t.id === selectedMatch?.home_team_id)?.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awayScore">Away Score</Label>
                    <Input
                      id="awayScore"
                      type="number"
                      min="0"
                      value={newScoreData.away}
                      onChange={(e) => setNewScoreData(prev => ({ ...prev, away: parseInt(e.target.value) || 0 }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      {teams.find(t => t.id === selectedMatch?.away_team_id)?.name}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsUpdateScoreDialogOpen(false)
                  setSelectedMatch(null)
                  setNewScoreData({ home: 0, away: 0 })
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMatchScore}>
                  Update Score
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Manage tournament schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                            {new Date(match.match_date).toLocaleString()} • {match.venue}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(match.status)}>
                          {match.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Tournament statistics and standings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Standings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teams.map((team) => {
                        const teamMatches = matches.filter(
                          m => m.home_team_id === team.id || m.away_team_id === team.id
                        )
                        const wins = teamMatches.filter(m => {
                          if (m.home_team_id === team.id) return m.score.home > m.score.away
                          return m.score.away > m.score.home
                        }).length
                        const losses = teamMatches.filter(m => {
                          if (m.home_team_id === team.id) return m.score.home < m.score.away
                          return m.score.away < m.score.home
                        }).length
                        const draws = teamMatches.filter(m => m.score.home === m.score.away).length
                        const points = wins * 3 + draws
                        const goalsFor = teamMatches.reduce((total, m) => 
                          m.home_team_id === team.id ? total + m.score.home : total + m.score.away, 0)
                        const goalsAgainst = teamMatches.reduce((total, m) => 
                          m.home_team_id === team.id ? total + m.score.away : total + m.score.home, 0)
                        const goalDifference = goalsFor - goalsAgainst

                        return (
                          <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {wins}W {losses}L {draws}D • {points} points • GD: {goalDifference}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-yellow-500'
    case 'active':
      return 'bg-green-500'
    case 'completed':
      return 'bg-blue-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
} 