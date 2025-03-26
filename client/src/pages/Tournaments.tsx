import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useToast } from '../components/ui/use-toast'
import { supabase } from '../lib/supabase'
import { SportType, Tournament, TournamentFilters } from '../types/tournament'
import { useAuth } from '../contexts/AuthContext'

export function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TournamentFilters>({})
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchTournaments()
  }, [filters])

  const fetchTournaments = async () => {
    try {
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.sport) {
        query = query.eq('sport', filters.sport)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.dateRange) {
        query = query
          .gte('start_date', filters.dateRange.start)
          .lte('end_date', filters.dateRange.end)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setTournaments(data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournaments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSportChange = (sport: SportType | 'all') => {
    setFilters((prev) => ({
      ...prev,
      sport: sport === 'all' ? undefined : sport,
    }))
  }

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : status as Tournament['status'],
    }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }))
  }

  const getSportIcon = (sport: SportType) => {
    switch (sport) {
      case 'football':
        return '⚽'
      case 'basketball':
        return '🏀'
      case 'volleyball':
        return '🏐'
      case 'cricket':
        return '🏏'
      case 'tennis':
        return '🎾'
      default:
        return '🏆'
    }
  }

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500'
      case 'completed':
        return 'text-blue-500'
      case 'cancelled':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Link to="/tournaments/create">
          <Button>Create Tournament</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Select
          value={filters.sport || 'all'}
          onValueChange={handleSportChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            <SelectItem value="football">Football</SelectItem>
            <SelectItem value="basketball">Basketball</SelectItem>
            <SelectItem value="volleyball">Volleyball</SelectItem>
            <SelectItem value="cricket">Cricket</SelectItem>
            <SelectItem value="tennis">Tennis</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search tournaments..."
          value={filters.search || ''}
          onChange={handleSearch}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tournaments</TabsTrigger>
          <TabsTrigger value="my">My Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/tournaments/${tournament.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span>{getSportIcon(tournament.sport)}</span>
                        {tournament.name}
                      </CardTitle>
                      <span className={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-2">
                      {tournament.description}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Format: {tournament.format}</span>
                      <span>
                        {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments
              .filter((t) => t.created_by === user?.id)
              .map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <span>{getSportIcon(tournament.sport)}</span>
                          {tournament.name}
                        </CardTitle>
                        <span className={getStatusColor(tournament.status)}>
                          {tournament.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-2">
                        {tournament.description}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span>Format: {tournament.format}</span>
                        <span>
                          {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                          {new Date(tournament.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 