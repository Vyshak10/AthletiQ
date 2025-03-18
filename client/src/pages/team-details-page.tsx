import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, CalendarDays, Trophy } from 'lucide-react';
import type { Team, Sport, Player, Tournament } from '@shared/schema';

export default function TeamDetailsPage() {
  const [, params] = useRoute('/teams/:id');
  const teamId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  
  // Queries
  const { data: team, isLoading: loadingTeam } = useQuery<Team>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!teamId,
  });
  
  const { data: sport, isLoading: loadingSport } = useQuery<Sport>({
    queryKey: [`/api/sports/${team?.sportId}`],
    enabled: !!team?.sportId,
  });
  
  const { data: players, isLoading: loadingPlayers } = useQuery<Player[]>({
    queryKey: [`/api/teams/${teamId}/players`],
    enabled: !!teamId,
  });
  
  const { data: tournaments, isLoading: loadingTournaments } = useQuery<Tournament[]>({
    queryKey: [`/api/tournaments/team/${teamId}`],
    enabled: !!teamId,
  });

  // Loading state
  if (loadingTeam || loadingSport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if team exists
  if (!team) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Team not found</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Check if user is team manager or tournament host
  const isManager = user?.id === team.managerId;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={tournaments && tournaments.length > 0 ? `/tournaments/${tournaments[0].id}` : '/dashboard'}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tournaments && tournaments.length > 0 ? 'Back to Tournament' : 'Back to Dashboard'}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="flex items-center gap-4">
          {team.logo ? (
            <Avatar className="h-20 w-20">
              <AvatarImage src={team.logo} alt={team.name} />
              <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {team.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            {sport && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>{sport.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Roster */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPlayers ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !players || players.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No players added to this team yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Date of Birth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map(player => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.jerseyNumber || '-'}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {player.profileImage ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={player.profileImage} alt={player.name} />
                              <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              {player.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          {player.name}
                        </TableCell>
                        <TableCell>{player.position}</TableCell>
                        <TableCell>{player.dateOfBirth || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Info */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sport && (
                <div>
                  <p className="text-sm text-muted-foreground">Sport</p>
                  <p className="font-medium">{sport.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">{new Date(team.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTournaments ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !tournaments || tournaments.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">This team is not participating in any tournaments.</p>
              ) : (
                <div className="space-y-4">
                  {tournaments.map(tournament => (
                    <div key={tournament.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <Link href={`/tournaments/${tournament.id}`}>
                        <div className="font-medium hover:text-primary">{tournament.name}</div>
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}