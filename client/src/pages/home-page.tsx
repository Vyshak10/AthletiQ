import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Tournament, Sport } from '@shared/schema';

export default function HomePage() {
  const { user } = useAuth();

  const { data: sports, isLoading: loadingSports } = useQuery<Sport[]>({
    queryKey: ['/api/sports'],
  });

  const { data: tournaments, isLoading: loadingTournaments } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  if (loadingSports || loadingTournaments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.displayName}</h1>
        <p className="text-gray-600 mt-2">Stay updated with your favorite tournaments</p>
      </header>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sports</TabsTrigger>
          {sports?.map(sport => (
            <TabsTrigger key={sport.id} value={sport.name}>
              {sport.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments?.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </TabsContent>

        {sports?.map(sport => (
          <TabsContent key={sport.id} value={sport.name} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments
                ?.filter(t => t.sportId === sport.id)
                .map(tournament => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tournament.name}</CardTitle>
        <CardDescription>{tournament.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Status: {tournament.status}</p>
          <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
          {tournament.endDate && (
            <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>
          )}
          <Button className="w-full">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}