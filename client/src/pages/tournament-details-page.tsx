import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Users, Trophy, Clock, MapPin, UserPlus, CalendarPlus, MoreVertical, Shield, Edit, Loader2 } from 'lucide-react';
import type { Tournament, Sport, Team, Match, Player, InsertTeam, InsertPlayer, InsertMatch } from '@shared/schema';

export default function TournamentDetailsPage() {
  const [, params] = useRoute('/tournaments/:id');
  const tournamentId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Team & Player modals
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [addMatchOpen, setAddMatchOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Form states
  const [newTeam, setNewTeam] = useState<Partial<InsertTeam>>({
    name: '',
    sportId: 0
  });
  
  const [newPlayer, setNewPlayer] = useState<Partial<InsertPlayer>>({
    name: '',
    position: '',
    jerseyNumber: undefined,
    teamId: 0
  });
  
  const [newMatch, setNewMatch] = useState<Partial<InsertMatch>>({
    tournamentId: tournamentId,
    homeTeamId: 0,
    awayTeamId: 0,
    startTime: new Date(),
    location: '',
    status: 'scheduled'
  });

  // Queries
  const { data: tournament, isLoading: loadingTournament } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${tournamentId}`],
    enabled: !!tournamentId,
  });
  
  const { data: sport, isLoading: loadingSport } = useQuery<Sport>({
    queryKey: [`/api/sports/${tournament?.sportId}`],
    enabled: !!tournament?.sportId,
  });
  
  const { data: teams, isLoading: loadingTeams } = useQuery<Team[]>({
    queryKey: [`/api/tournaments/${tournamentId}/teams`],
    enabled: !!tournamentId,
  });
  
  const { data: matches, isLoading: loadingMatches } = useQuery<Match[]>({
    queryKey: [`/api/tournaments/${tournamentId}/matches`],
    enabled: !!tournamentId,
  });

  // Mutations
  const addTeamMutation = useMutation({
    mutationFn: async (data: InsertTeam) => {
      const teamRes = await apiRequest('POST', '/api/teams', data);
      const team = await teamRes.json();
      
      // Add the team to the tournament
      const tournamentTeamRes = await apiRequest('POST', '/api/tournaments/teams', {
        tournamentId,
        teamId: team.id
      });
      
      return await tournamentTeamRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/teams`] });
      setAddTeamOpen(false);
      setNewTeam({ name: '', sportId: tournament?.sportId || 0 });
      toast({
        title: 'Team Added',
        description: 'The team has been added to the tournament.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Team',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const addPlayerMutation = useMutation({
    mutationFn: async (data: InsertPlayer) => {
      const res = await apiRequest('POST', '/api/players', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${selectedTeamId}/players`] });
      setAddPlayerOpen(false);
      setNewPlayer({ name: '', position: '', jerseyNumber: undefined, teamId: 0 });
      toast({
        title: 'Player Added',
        description: 'The player has been added to the team.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Player',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const addMatchMutation = useMutation({
    mutationFn: async (data: InsertMatch) => {
      const res = await apiRequest('POST', '/api/matches', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/matches`] });
      setAddMatchOpen(false);
      setNewMatch({
        tournamentId: tournamentId,
        homeTeamId: 0,
        awayTeamId: 0,
        startTime: new Date(),
        location: tournament?.location || '',
        status: 'scheduled'
      });
      toast({
        title: 'Match Added',
        description: 'The match has been scheduled successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Match',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !tournament?.sportId) return;
    
    addTeamMutation.mutate({
      ...newTeam,
      sportId: tournament.sportId,
      managerId: user?.id,
    } as InsertTeam);
  };
  
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.position || !selectedTeamId) return;
    
    addPlayerMutation.mutate({
      ...newPlayer,
      teamId: selectedTeamId,
    } as InsertPlayer);
  };
  
  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.homeTeamId || !newMatch.awayTeamId || !newMatch.startTime) return;
    
    if (newMatch.homeTeamId === newMatch.awayTeamId) {
      toast({
        title: 'Invalid Teams',
        description: 'Home and away teams cannot be the same.',
        variant: 'destructive',
      });
      return;
    }
    
    addMatchMutation.mutate({
      ...newMatch,
      tournamentId: tournamentId,
    } as InsertMatch);
  };

  // Loading state
  if (loadingTournament || loadingSport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if tournament exists
  if (!tournament) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Tournament not found</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Check if user is the tournament host
  const isHost = user?.id === tournament.hostId;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <Badge variant={
              tournament.status === 'upcoming' ? 'outline' :
              tournament.status === 'active' ? 'default' : 'secondary'
            }>
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
            {sport && (
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{sport.name}</span>
              </div>
            )}
            {tournament.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{tournament.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
              {tournament.endDate && (
                <span> - {new Date(tournament.endDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        
        {isHost && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit Tournament
            </Button>
            <Button size="sm">
              <Shield className="h-4 w-4 mr-1" />
              Admin Panel
            </Button>
          </div>
        )}
      </div>

      {tournament.description && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p>{tournament.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Participating Teams</h2>
            {isHost && (
              <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team to Tournament</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTeam} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Enter team name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-logo">Logo URL (optional)</Label>
                      <Input
                        id="team-logo"
                        value={newTeam.logo || ''}
                        onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
                        placeholder="Enter logo URL"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit"
                        disabled={addTeamMutation.isPending}
                      >
                        {addTeamMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        Add Team
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {loadingTeams ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !teams?.length ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No teams have joined this tournament yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      {isHost && (
                        <Dialog open={addPlayerOpen && selectedTeamId === team.id} onOpenChange={(open) => {
                          setAddPlayerOpen(open);
                          if (open) setSelectedTeamId(team.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Player to {team.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddPlayer} className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="player-name">Player Name</Label>
                                <Input
                                  id="player-name"
                                  value={newPlayer.name}
                                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                  placeholder="Enter player name"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="player-position">Position</Label>
                                <Input
                                  id="player-position"
                                  value={newPlayer.position}
                                  onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                  placeholder="Enter player position"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="player-number">Jersey Number</Label>
                                <Input
                                  id="player-number"
                                  type="number"
                                  value={newPlayer.jerseyNumber || ''}
                                  onChange={(e) => setNewPlayer({ 
                                    ...newPlayer, 
                                    jerseyNumber: e.target.value ? parseInt(e.target.value) : undefined 
                                  })}
                                  placeholder="Enter jersey number"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <DialogClose asChild>
                                  <Button variant="outline" type="button">Cancel</Button>
                                </DialogClose>
                                <Button 
                                  type="submit"
                                  disabled={addPlayerMutation.isPending}
                                >
                                  {addPlayerMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : null}
                                  Add Player
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      asChild
                    >
                      <Link href={`/teams/${team.id}`}>View Roster</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Scheduled Matches</h2>
            {isHost && teams && teams.length >= 2 && (
              <Dialog open={addMatchOpen} onOpenChange={setAddMatchOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <CalendarPlus className="h-4 w-4 mr-1" />
                    Schedule Match
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule a Match</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddMatch} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="home-team">Home Team</Label>
                      <Select 
                        value={newMatch.homeTeamId?.toString() || ''} 
                        onValueChange={(value) => setNewMatch({ ...newMatch, homeTeamId: parseInt(value) })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select home team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map(team => (
                            <SelectItem key={`home-${team.id}`} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away-team">Away Team</Label>
                      <Select 
                        value={newMatch.awayTeamId?.toString() || ''} 
                        onValueChange={(value) => setNewMatch({ ...newMatch, awayTeamId: parseInt(value) })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select away team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map(team => (
                            <SelectItem key={`away-${team.id}`} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="match-date">Match Date & Time</Label>
                      <Input
                        id="match-date"
                        type="datetime-local"
                        onChange={(e) => setNewMatch({ ...newMatch, startTime: new Date(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="match-location">Location</Label>
                      <Input
                        id="match-location"
                        value={newMatch.location || ''}
                        onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                        placeholder="Enter match location"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit"
                        disabled={addMatchMutation.isPending}
                      >
                        {addMatchMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        Schedule Match
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {loadingMatches ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !matches?.length ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No matches have been scheduled yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => {
                    const homeTeam = teams?.find(team => team.id === match.homeTeamId);
                    const awayTeam = teams?.find(team => team.id === match.awayTeamId);
                    
                    return (
                      <TableRow key={match.id}>
                        <TableCell className="font-medium">
                          {new Date(match.startTime).toLocaleDateString()}<br/>
                          <span className="text-sm text-muted-foreground">
                            {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{homeTeam?.name}</div>
                          <div className="font-medium">vs</div>
                          <div className="font-medium">{awayTeam?.name}</div>
                        </TableCell>
                        <TableCell>{match.location}</TableCell>
                        <TableCell>
                          <Badge variant={
                            match.status === 'scheduled' ? 'outline' :
                            match.status === 'in_progress' ? 'default' : 
                            match.status === 'completed' ? 'secondary' : 'destructive'
                          }>
                            {match.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {match.status !== 'scheduled' ? (
                            <div className="text-center font-bold">
                              {match.homeScore} - {match.awayScore}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/matches/${match.id}`}>Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Standings Tab */}
        <TabsContent value="standings" className="space-y-4">
          <h2 className="text-xl font-semibold">Tournament Standings</h2>
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Standings will be available once matches have been played.
            </p>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <h2 className="text-xl font-semibold">Tournament Statistics</h2>
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Statistics will be available once matches have been played.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}