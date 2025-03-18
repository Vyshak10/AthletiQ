import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import type { Sport, InsertTournament, Tournament } from '@shared/schema';

export default function CreateTournamentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [tournamentData, setTournamentData] = useState<Partial<InsertTournament>>({
    name: '',
    sportId: 0,
    hostId: user?.id || 0,
    startDate: new Date(),
    location: '',
    status: 'upcoming',
    description: ''
  });

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: sports, isLoading: loadingSports } = useQuery<Sport[]>({
    queryKey: ['/api/sports'],
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: InsertTournament) => {
      const res = await apiRequest('POST', '/api/tournaments', data);
      return await res.json();
    },
    onSuccess: (tournament: Tournament) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: 'Tournament Created',
        description: 'Your tournament has been created successfully.',
      });
      setLocation(`/tournaments/${tournament.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Tournament',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTournamentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTournamentData((prev) => ({
      ...prev,
      [name]: name === 'sportId' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!tournamentData.name || !tournamentData.sportId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Convert dates to ISO strings for API
    const formattedData: InsertTournament = {
      ...tournamentData as InsertTournament,
      startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
      endDate: endDate ? endDate.toISOString() : undefined,
      hostId: user?.id as number
    };

    createTournamentMutation.mutate(formattedData);
  };

  if (loadingSports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Tournament</CardTitle>
          <CardDescription>
            Set up your tournament details and get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name">Tournament Name*</Label>
              <Input
                id="name"
                name="name"
                value={tournamentData.name}
                onChange={handleInputChange}
                placeholder="Enter tournament name"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="sportId">Sport*</Label>
              <Select 
                name="sportId" 
                onValueChange={(value) => handleSelectChange('sportId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports?.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id.toString()}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Start Date*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (endDate && date && date > endDate) {
                          setEndDate(undefined);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={tournamentData.location || ''}
                onChange={handleInputChange}
                placeholder="Enter tournament location"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={tournamentData.description || ''}
                onChange={handleInputChange}
                placeholder="Enter tournament description"
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createTournamentMutation.isPending}
            >
              {createTournamentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Tournament
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}