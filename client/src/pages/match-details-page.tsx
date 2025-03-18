import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Minus, PenSquare, FileText, Loader2, ShieldCheck, Clock, Calendar, MapPin } from 'lucide-react';
import type { Match, Team, Player, Tournament, Event, Lineup, LineupPlayer, InsertEvent, InsertLineup, InsertLineupPlayer } from '@shared/schema';

export default function MatchDetailsPage() {
  const [, params] = useRoute('/matches/:id');
  const matchId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for modals and forms
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [editScoreOpen, setEditScoreOpen] = useState(false);
  const [publishLineupOpen, setPublishLineupOpen] = useState(false);
  const [selectedTeamForLineup, setSelectedTeamForLineup] = useState<number | null>(null);
  const [selectedPlayersForLineup, setSelectedPlayersForLineup] = useState<number[]>([]);
  
  // State for match updates
  const [scoreUpdate, setScoreUpdate] = useState({ 
    homeScore: 0, 
    awayScore: 0 
  });
  
  const [newEvent, setNewEvent] = useState<Partial<InsertEvent>>({
    matchId: matchId,
    teamId: 0,
    playerId: 0,
    eventType: '',
    minute: 0,
    description: ''
  });

  // Queries
  const { data: match, isLoading: loadingMatch } = useQuery<Match>({
    queryKey: [`/api/matches/${matchId}`],
    enabled: !!matchId,
  });
  
  const { data: tournament, isLoading: loadingTournament } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${match?.tournamentId}`],
    enabled: !!match?.tournamentId,
  });
  
  const { data: homeTeam, isLoading: loadingHomeTeam } = useQuery<Team>({
    queryKey: [`/api/teams/${match?.homeTeamId}`],
    enabled: !!match?.homeTeamId,
  });
  
  const { data: awayTeam, isLoading: loadingAwayTeam } = useQuery<Team>({
    queryKey: [`/api/teams/${match?.awayTeamId}`],
    enabled: !!match?.awayTeamId,
  });
  
  const { data: homePlayers, isLoading: loadingHomePlayers } = useQuery<Player[]>({
    queryKey: [`/api/teams/${match?.homeTeamId}/players`],
    enabled: !!match?.homeTeamId,
  });
  
  const { data: awayPlayers, isLoading: loadingAwayPlayers } = useQuery<Player[]>({
    queryKey: [`/api/teams/${match?.awayTeamId}/players`],
    enabled: !!match?.awayTeamId,
  });
  
  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: [`/api/matches/${matchId}/events`],
    enabled: !!matchId,
  });
  
  const { data: homeLineup, isLoading: loadingHomeLineup } = useQuery<Lineup>({
    queryKey: [`/api/matches/${matchId}/lineups/${match?.homeTeamId}`],
    enabled: !!matchId && !!match?.homeTeamId,
  });
  
  const { data: awayLineup, isLoading: loadingAwayLineup } = useQuery<Lineup>({
    queryKey: [`/api/matches/${matchId}/lineups/${match?.awayTeamId}`],
    enabled: !!matchId && !!match?.awayTeamId,
  });
  
  const { data: homeLineupPlayers, isLoading: loadingHomeLineupPlayers } = useQuery<LineupPlayer[]>({
    queryKey: [`/api/lineups/${homeLineup?.id}/players`],
    enabled: !!homeLineup?.id,
  });
  
  const { data: awayLineupPlayers, isLoading: loadingAwayLineupPlayers } = useQuery<LineupPlayer[]>({
    queryKey: [`/api/lineups/${awayLineup?.id}/players`],
    enabled: !!awayLineup?.id,
  });

  // Mutations
  const updateScoreMutation = useMutation({
    mutationFn: async (data: { homeScore: number; awayScore: number }) => {
      const res = await apiRequest('PATCH', `/api/matches/${matchId}/score`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
      setEditScoreOpen(false);
      toast({
        title: 'Score Updated',
        description: 'The match score has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Score',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const addEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const res = await apiRequest('POST', '/api/events', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/events`] });
      setAddEventOpen(false);
      setNewEvent({
        matchId: matchId,
        teamId: 0,
        playerId: 0,
        eventType: '',
        minute: 0,
        description: ''
      });
      toast({
        title: 'Event Added',
        description: 'The match event has been recorded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const createLineupMutation = useMutation({
    mutationFn: async (data: InsertLineup) => {
      const res = await apiRequest('POST', '/api/lineups', data);
      return await res.json();
    },
    onSuccess: (lineup) => {
      // Add players to lineup
      selectedPlayersForLineup.forEach(async (playerId) => {
        try {
          const lineupPlayer: InsertLineupPlayer = {
            lineupId: lineup.id,
            playerId: playerId,
            isStarter: true, // All selected players are starters
            position: 'N/A', // We're not specifying positions in this basic implementation
          };
          
          await apiRequest('POST', '/api/lineups/players', lineupPlayer);
        } catch (error) {
          console.error('Error adding player to lineup:', error);
        }
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/lineups/${selectedTeamForLineup}`] });
      setPublishLineupOpen(false);
      setSelectedPlayersForLineup([]);
      
      toast({
        title: 'Lineup Published',
        description: 'The team lineup has been published successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Publish Lineup',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const updateMatchStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest('PATCH', `/api/matches/${matchId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
      toast({
        title: 'Match Status Updated',
        description: 'The match status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleUpdateScore = (e: React.FormEvent) => {
    e.preventDefault();
    updateScoreMutation.mutate(scoreUpdate);
  };
  
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.teamId || !newEvent.eventType) return;
    
    addEventMutation.mutate(newEvent as InsertEvent);
  };
  
  const handlePublishLineup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForLineup || selectedPlayersForLineup.length === 0) return;
    
    const lineup: InsertLineup = {
      matchId,
      teamId: selectedTeamForLineup,
      isPublished: true
    };
    
    createLineupMutation.mutate(lineup);
  };
  
  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayersForLineup(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  const handleStatusChange = (status: string) => {
    if (match?.status === status) return;
    
    updateMatchStatusMutation.mutate(status);
  };

  // Loading state
  if (loadingMatch || loadingTournament || loadingHomeTeam || loadingAwayTeam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if match exists
  if (!match || !tournament || !homeTeam || !awayTeam) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Match not found</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Check if user is tournament host
  const isHost = user?.id === tournament.hostId;

  // Initialize score update state from match data
  if (scoreUpdate.homeScore !== match.homeScore || scoreUpdate.awayScore !== match.awayScore) {
    setScoreUpdate({ 
      homeScore: match.homeScore || 0, 
      awayScore: match.awayScore || 0 
    });
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/tournaments/${tournament.id}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{homeTeam.name} vs {awayTeam.name}</h1>
              <Badge variant={
                match.status === 'scheduled' ? 'outline' :
                match.status === 'in_progress' ? 'default' : 
                match.status === 'completed' ? 'secondary' : 'destructive'
              }>
                {match.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{tournament.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(match.startTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {match.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{match.location}</span>
                </div>
              )}
            </div>
          </div>
          
          {isHost && match.status !== 'cancelled' && (
            <div className="flex items-center gap-2">
              <Select defaultValue={match.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Match status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">{homeTeam.name}</h2>
            <div className="text-5xl font-bold my-4">{match.homeScore || 0}</div>
            {homeLineup ? (
              <Badge variant={homeLineup.isPublished ? 'default' : 'outline'}>
                {homeLineup.isPublished ? 'Lineup Published' : 'Lineup Not Published'}
              </Badge>
            ) : (
              <Badge variant="outline">No Lineup</Badge>
            )}
          </div>
          
          <div className="text-2xl font-bold">vs</div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold">{awayTeam.name}</h2>
            <div className="text-5xl font-bold my-4">{match.awayScore || 0}</div>
            {awayLineup ? (
              <Badge variant={awayLineup.isPublished ? 'default' : 'outline'}>
                {awayLineup.isPublished ? 'Lineup Published' : 'Lineup Not Published'}
              </Badge>
            ) : (
              <Badge variant="outline">No Lineup</Badge>
            )}
          </div>
        </div>

        {isHost && match.status === 'in_progress' && (
          <div className="flex justify-center mt-6 gap-2">
            <Dialog open={editScoreOpen} onOpenChange={setEditScoreOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PenSquare className="h-4 w-4 mr-2" />
                  Update Score
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Match Score</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateScore} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home-score">{homeTeam.name}</Label>
                      <Input
                        id="home-score"
                        type="number"
                        min="0"
                        value={scoreUpdate.homeScore}
                        onChange={(e) => setScoreUpdate({ ...scoreUpdate, homeScore: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away-score">{awayTeam.name}</Label>
                      <Input
                        id="away-score"
                        type="number"
                        min="0"
                        value={scoreUpdate.awayScore}
                        onChange={(e) => setScoreUpdate({ ...scoreUpdate, awayScore: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="submit"
                      disabled={updateScoreMutation.isPending}
                    >
                      {updateScoreMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Update Score
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Match Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEvent} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-team">Team</Label>
                    <Select 
                      value={newEvent.teamId?.toString() || ''} 
                      onValueChange={(value) => setNewEvent({ ...newEvent, teamId: parseInt(value) })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={homeTeam.id.toString()}>{homeTeam.name}</SelectItem>
                        <SelectItem value={awayTeam.id.toString()}>{awayTeam.name}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-player">Player (Optional)</Label>
                    <Select 
                      value={newEvent.playerId?.toString() || ''} 
                      onValueChange={(value) => setNewEvent({ ...newEvent, playerId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {newEvent.teamId === homeTeam.id
                          ? homePlayers?.map(player => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} {player.jerseyNumber ? `(#${player.jerseyNumber})` : ''}
                              </SelectItem>
                            ))
                          : awayPlayers?.map(player => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} {player.jerseyNumber ? `(#${player.jerseyNumber})` : ''}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select 
                      value={newEvent.eventType || ''} 
                      onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goal">Goal</SelectItem>
                        <SelectItem value="yellow_card">Yellow Card</SelectItem>
                        <SelectItem value="red_card">Red Card</SelectItem>
                        <SelectItem value="substitution">Substitution</SelectItem>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="penalty">Penalty</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-minute">Minute</Label>
                    <Input
                      id="event-minute"
                      type="number"
                      min="0"
                      value={newEvent.minute || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, minute: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description (Optional)</Label>
                    <Input
                      id="event-description"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Enter event details"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="submit"
                      disabled={addEventMutation.isPending}
                    >
                      {addEventMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Record Event
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Match Events</TabsTrigger>
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Match Timeline</h2>
          </div>
          
          {loadingEvents ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !events?.length ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No events have been recorded for this match.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Minute</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(event => {
                    const eventTeam = event.teamId === homeTeam.id ? homeTeam : awayTeam;
                    const player = homePlayers?.find(p => p.id === event.playerId) || 
                                  awayPlayers?.find(p => p.id === event.playerId);
                    
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.minute}'</TableCell>
                        <TableCell>
                          <Badge variant={
                            event.eventType === 'goal' ? 'default' :
                            event.eventType === 'yellow_card' ? 'warning' :
                            event.eventType === 'red_card' ? 'destructive' : 'outline'
                          }>
                            {event.eventType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{eventTeam.name}</TableCell>
                        <TableCell>{player ? player.name : '-'}</TableCell>
                        <TableCell>{event.description || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        {/* Lineups Tab */}
        <TabsContent value="lineups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team Lineup */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>{homeTeam.name} Lineup</CardTitle>
                  <CardDescription>
                    {homeLineup?.isPublished 
                      ? 'Official lineup published' 
                      : 'Lineup not published yet'}
                  </CardDescription>
                </div>
                
                {isHost && !homeLineup && (
                  <Dialog open={publishLineupOpen && selectedTeamForLineup === homeTeam.id} 
                          onOpenChange={(open) => {
                            setPublishLineupOpen(open);
                            if (open) setSelectedTeamForLineup(homeTeam.id);
                          }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Publish Lineup
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Publish {homeTeam.name} Lineup</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handlePublishLineup} className="space-y-4 pt-4">
                        {!loadingHomePlayers && homePlayers && homePlayers.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {homePlayers.map(player => (
                              <div key={player.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`player-${player.id}`}
                                  checked={selectedPlayersForLineup.includes(player.id)}
                                  onChange={() => togglePlayerSelection(player.id)}
                                  className="rounded border-gray-300"
                                />
                                <label htmlFor={`player-${player.id}`} className="text-sm">
                                  {player.name} {player.jerseyNumber ? `(#${player.jerseyNumber})` : ''} - {player.position}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No players available for this team.</p>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                          </DialogClose>
                          <Button 
                            type="submit"
                            disabled={createLineupMutation.isPending || selectedPlayersForLineup.length === 0}
                          >
                            {createLineupMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : null}
                            Publish Lineup
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {loadingHomeLineupPlayers ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !homeLineup || !homeLineupPlayers?.length ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No lineup published for this team yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Starting XI</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {homeLineupPlayers.filter(lp => lp.isStarter).map(lineupPlayer => {
                        const player = homePlayers?.find(p => p.id === lineupPlayer.playerId);
                        return player ? (
                          <div key={lineupPlayer.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                            <div className="font-medium">
                              {player.jerseyNumber && <span className="text-primary mr-1">#{player.jerseyNumber}</span>}
                              {player.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{player.position}</div>
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    {homeLineupPlayers.some(lp => !lp.isStarter) && (
                      <>
                        <h3 className="font-semibold mt-4">Substitutes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {homeLineupPlayers.filter(lp => !lp.isStarter).map(lineupPlayer => {
                            const player = homePlayers?.find(p => p.id === lineupPlayer.playerId);
                            return player ? (
                              <div key={lineupPlayer.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                                <div className="font-medium">
                                  {player.jerseyNumber && <span className="text-primary mr-1">#{player.jerseyNumber}</span>}
                                  {player.name}
                                </div>
                                <div className="text-sm text-muted-foreground">{player.position}</div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Away Team Lineup */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>{awayTeam.name} Lineup</CardTitle>
                  <CardDescription>
                    {awayLineup?.isPublished 
                      ? 'Official lineup published' 
                      : 'Lineup not published yet'}
                  </CardDescription>
                </div>
                
                {isHost && !awayLineup && (
                  <Dialog open={publishLineupOpen && selectedTeamForLineup === awayTeam.id} 
                          onOpenChange={(open) => {
                            setPublishLineupOpen(open);
                            if (open) setSelectedTeamForLineup(awayTeam.id);
                          }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Publish Lineup
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Publish {awayTeam.name} Lineup</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handlePublishLineup} className="space-y-4 pt-4">
                        {!loadingAwayPlayers && awayPlayers && awayPlayers.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {awayPlayers.map(player => (
                              <div key={player.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`player-${player.id}`}
                                  checked={selectedPlayersForLineup.includes(player.id)}
                                  onChange={() => togglePlayerSelection(player.id)}
                                  className="rounded border-gray-300"
                                />
                                <label htmlFor={`player-${player.id}`} className="text-sm">
                                  {player.name} {player.jerseyNumber ? `(#${player.jerseyNumber})` : ''} - {player.position}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No players available for this team.</p>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                          </DialogClose>
                          <Button 
                            type="submit"
                            disabled={createLineupMutation.isPending || selectedPlayersForLineup.length === 0}
                          >
                            {createLineupMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : null}
                            Publish Lineup
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {loadingAwayLineupPlayers ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !awayLineup || !awayLineupPlayers?.length ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No lineup published for this team yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Starting XI</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {awayLineupPlayers.filter(lp => lp.isStarter).map(lineupPlayer => {
                        const player = awayPlayers?.find(p => p.id === lineupPlayer.playerId);
                        return player ? (
                          <div key={lineupPlayer.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                            <div className="font-medium">
                              {player.jerseyNumber && <span className="text-primary mr-1">#{player.jerseyNumber}</span>}
                              {player.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{player.position}</div>
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    {awayLineupPlayers.some(lp => !lp.isStarter) && (
                      <>
                        <h3 className="font-semibold mt-4">Substitutes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {awayLineupPlayers.filter(lp => !lp.isStarter).map(lineupPlayer => {
                            const player = awayPlayers?.find(p => p.id === lineupPlayer.playerId);
                            return player ? (
                              <div key={lineupPlayer.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                                <div className="font-medium">
                                  {player.jerseyNumber && <span className="text-primary mr-1">#{player.jerseyNumber}</span>}
                                  {player.name}
                                </div>
                                <div className="text-sm text-muted-foreground">{player.position}</div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Detailed match statistics will be available soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}