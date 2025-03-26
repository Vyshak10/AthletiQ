import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  entryFee: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await fetch(`/api/tournaments/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tournament');
        }
        const data = await response.json();
        setTournament(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load tournament details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tournament) {
    return <div>Tournament not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <Button variant="outline">Register Team</Button>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{tournament.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Dates</h2>
              <p className="text-gray-600">
                {new Date(tournament.startDate).toLocaleDateString()} -{' '}
                {new Date(tournament.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Entry Fee</h2>
              <p className="text-gray-600">${tournament.entryFee.toFixed(2)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Maximum Teams</h2>
              <p className="text-gray-600">{tournament.maxTeams}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Status</h2>
              <p className="text-gray-600 capitalize">{tournament.status}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 