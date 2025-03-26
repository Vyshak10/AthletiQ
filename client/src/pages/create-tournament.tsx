import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function CreateTournament() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      maxTeams: parseInt(formData.get('maxTeams') as string),
      entryFee: parseFloat(formData.get('entryFee') as string),
    };

    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create tournament');
      }

      const tournament = await response.json();
      toast({
        title: 'Success',
        description: 'Tournament created successfully',
      });
      navigate(`/tournaments/${tournament.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create tournament',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Tournament</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Tournament Name
            </label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Enter tournament name"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              id="description"
              name="description"
              required
              placeholder="Enter tournament description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                End Date
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxTeams" className="block text-sm font-medium mb-1">
                Maximum Teams
              </label>
              <Input
                id="maxTeams"
                name="maxTeams"
                type="number"
                min="2"
                required
                placeholder="Enter max teams"
              />
            </div>
            <div>
              <label htmlFor="entryFee" className="block text-sm font-medium mb-1">
                Entry Fee
              </label>
              <Input
                id="entryFee"
                name="entryFee"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="Enter entry fee"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tournaments')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 